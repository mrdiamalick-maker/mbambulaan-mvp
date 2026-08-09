import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  InMemoryIntegrationRepository,
  NationalIntegrationGateway,
  OutgoingIntegrationDispatcher,
  type IntegrationPartner,
  type SignatureService,
} from "./national-integration-gateway";

const now = "2026-07-27T12:00:00.000Z";
let sequence = 0;
const ids = { next: (prefix: string) => `${prefix}-${++sequence}` };
const clock = { now: () => now };
const signatures: SignatureService = {
  hashPayload: (payload) => JSON.stringify(payload),
  sign: ({ partnerId, secretVersion, timestamp, payloadHash }) => `${partnerId}:${secretVersion}:${timestamp}:${payloadHash}`,
  verify: ({ partnerId, secretVersion, timestamp, payloadHash, signature }) => signature === `${partnerId}:${secretVersion}:${timestamp}:${payloadHash}`,
};

function partner(): IntegrationPartner {
  return {
    id: "partner-1",
    code: "MOBILE-MONEY",
    name: "Partenaire Mobile Money",
    partnerType: "payment_provider",
    environment: "sandbox",
    status: "active",
    allowedEventTypes: ["payment.confirmed", "payment.requested"],
    allowedTerritoryIds: ["territory-joal"],
    allowedIpHashes: [],
    signingSecretVersion: 1,
    requestsPerMinute: 2,
    callbackUrl: "https://sandbox.example.test/webhook",
    createdAt: now,
    updatedAt: now,
  };
}

function setup() {
  sequence = 0;
  const repository = new InMemoryIntegrationRepository();
  repository.partners.set("partner-1", partner());
  return {
    repository,
    gateway: new NationalIntegrationGateway(repository, signatures, clock, ids),
  };
}

describe("NationalIntegrationGateway", () => {
  it("valide une requête entrante signée et idempotente", async () => {
    const { repository, gateway } = setup();
    const payload = { paymentId: "payment-1", amountXof: 150000 };
    const signature = signatures.sign({ partnerId: "partner-1", secretVersion: 1, timestamp: now, payloadHash: signatures.hashPayload(payload) });
    const first = await gateway.receive({ partnerId: "partner-1", eventType: "payment.confirmed", eventVersion: 1, idempotencyKey: "idem-1", territoryIds: ["territory-joal"], payload, signature, occurredAt: now });
    const replay = await gateway.receive({ partnerId: "partner-1", eventType: "payment.confirmed", eventVersion: 1, idempotencyKey: "idem-1", territoryIds: ["territory-joal"], payload, signature, occurredAt: now });
    assert.equal(first.id, replay.id);
    assert.equal(repository.incoming.size, 1);
  });

  it("refuse une signature invalide", async () => {
    const { gateway } = setup();
    await assert.rejects(() => gateway.receive({ partnerId: "partner-1", eventType: "payment.confirmed", eventVersion: 1, idempotencyKey: "idem-1", territoryIds: ["territory-joal"], payload: {}, signature: "invalid", occurredAt: now }), /signature/i);
  });

  it("refuse un événement hors périmètre territorial", async () => {
    const { gateway } = setup();
    const payload = {};
    const signature = signatures.sign({ partnerId: "partner-1", secretVersion: 1, timestamp: now, payloadHash: signatures.hashPayload(payload) });
    await assert.rejects(() => gateway.receive({ partnerId: "partner-1", eventType: "payment.confirmed", eventVersion: 1, idempotencyKey: "idem-2", territoryIds: ["territory-kayar"], payload, signature, occurredAt: now }), /territoire/i);
  });

  it("applique le quota par minute", async () => {
    const { gateway } = setup();
    const payload = {};
    const signature = signatures.sign({ partnerId: "partner-1", secretVersion: 1, timestamp: now, payloadHash: signatures.hashPayload(payload) });
    await gateway.receive({ partnerId: "partner-1", eventType: "payment.confirmed", eventVersion: 1, idempotencyKey: "idem-a", territoryIds: ["territory-joal"], payload, signature, occurredAt: now });
    await gateway.receive({ partnerId: "partner-1", eventType: "payment.confirmed", eventVersion: 1, idempotencyKey: "idem-b", territoryIds: ["territory-joal"], payload, signature, occurredAt: now });
    await assert.rejects(() => gateway.receive({ partnerId: "partner-1", eventType: "payment.confirmed", eventVersion: 1, idempotencyKey: "idem-c", territoryIds: ["territory-joal"], payload, signature, occurredAt: now }), /quota/i);
  });

  it("rejoue un échange sortant après échec puis le livre", async () => {
    const { repository, gateway } = setup();
    const exchange = await gateway.enqueue({ partnerId: "partner-1", eventType: "payment.requested", eventVersion: 1, aggregateType: "payment", aggregateId: "payment-1", correlationId: "corr-1", territoryIds: ["territory-joal"], payload: { amountXof: 150000 } });
    let attempts = 0;
    const dispatcher = new OutgoingIntegrationDispatcher(repository, {
      send: async () => {
        attempts += 1;
        if (attempts === 1) throw new Error("indisponible");
        return { providerReference: "provider-1" };
      },
    }, clock, ids, 3);
    await dispatcher.dispatch();
    const failed = repository.outgoing.get(exchange.id)!;
    assert.equal(failed.status, "failed");
    failed.nextAttemptAt = now;
    repository.outgoing.set(exchange.id, failed);
    await dispatcher.dispatch();
    assert.equal(repository.outgoing.get(exchange.id)?.status, "delivered");
  });

  it("isole en dead-letter après le nombre maximal d'échecs", async () => {
    const { repository, gateway } = setup();
    const exchange = await gateway.enqueue({ partnerId: "partner-1", eventType: "payment.requested", eventVersion: 1, aggregateType: "payment", aggregateId: "payment-1", correlationId: "corr-1", territoryIds: ["territory-joal"], payload: {} });
    const dispatcher = new OutgoingIntegrationDispatcher(repository, { send: async () => { throw new Error("panne"); } }, clock, ids, 2);
    await dispatcher.dispatch();
    const first = repository.outgoing.get(exchange.id)!;
    first.nextAttemptAt = now;
    repository.outgoing.set(exchange.id, first);
    await dispatcher.dispatch();
    assert.equal(repository.outgoing.get(exchange.id)?.status, "dead_lettered");
  });
});
