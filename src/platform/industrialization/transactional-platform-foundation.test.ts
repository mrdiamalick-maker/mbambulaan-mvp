import assert from "node:assert/strict";
import test from "node:test";
import {
  FixedClock,
  InMemoryAuditTrail,
  InMemoryIdempotencyStore,
  InMemoryOutboxStore,
  InMemoryUnitOfWork,
  OutboxPublisher,
  SequentialIdGenerator,
  TransactionalCommandBus,
  type CommandEnvelope,
  type CommandHandler,
  type DomainEvent,
  type EventPublisher,
} from "./transactional-platform-foundation";

const command = (): CommandEnvelope<{ quantityKg: number }> => ({
  context: {
    commandId: "command:reserve:001",
    commandType: "ReserveLotCapacity",
    actorIdentityId: "identity:operator:001",
    organizationId: "organization:mbambulaan",
    territoryIds: ["territory:joal"],
    correlationId: "correlation:order:001",
    idempotencyKey: "reserve:order:001:lot:001",
    requestedAt: "2027-01-01T10:00:00Z",
    metadata: { channel: "operations-console" },
  },
  payload: { quantityKg: 250 },
});

const event = (): DomainEvent<{ quantityKg: number }> => ({
  id: "event:capacity-reserved:001",
  eventType: "LotCapacityReserved",
  aggregateType: "lot",
  aggregateId: "lot:001",
  occurredAt: "2027-01-01T10:00:01Z",
  correlationId: "correlation:order:001",
  causationId: "command:reserve:001",
  actorIdentityId: "identity:operator:001",
  organizationId: "organization:mbambulaan",
  territoryIds: ["territory:joal"],
  schemaVersion: 1,
  payload: { quantityKg: 250 },
});

test("exécute une commande une seule fois et prépare ses événements dans l'outbox", async () => {
  const clock = new FixedClock("2027-01-01T10:00:02Z");
  const ids = new SequentialIdGenerator();
  const idempotency = new InMemoryIdempotencyStore();
  const outbox = new InMemoryOutboxStore();
  const audit = new InMemoryAuditTrail();
  const bus = new TransactionalCommandBus(clock, ids, new InMemoryUnitOfWork(), idempotency, outbox, audit);
  let executionCount = 0;
  const handler: CommandHandler<{ quantityKg: number }, { reservationId: string }> = {
    async execute(input) {
      executionCount += 1;
      return {
        value: { reservationId: `reservation:${input.payload.quantityKg}` },
        events: [event()],
        auditSummary: "250 kg réservés pour la commande order:001.",
      };
    },
  };

  const first = await bus.execute(command(), handler);
  const second = await bus.execute(command(), handler);

  assert.deepEqual(first, { reservationId: "reservation:250" });
  assert.deepEqual(second, first);
  assert.equal(executionCount, 1);
  assert.equal(outbox.messages.length, 1);
  assert.equal(outbox.messages[0]?.status, "pending");
  assert.equal(audit.records.length, 1);
  assert.equal(audit.records[0]?.decision, "accepted");
});

test("refuse un événement qui ne respecte pas la corrélation de la commande", async () => {
  const clock = new FixedClock("2027-01-01T10:00:02Z");
  const idempotency = new InMemoryIdempotencyStore();
  const outbox = new InMemoryOutboxStore();
  const audit = new InMemoryAuditTrail();
  const bus = new TransactionalCommandBus(clock, new SequentialIdGenerator(), new InMemoryUnitOfWork(), idempotency, outbox, audit);
  const invalid = event();
  invalid.correlationId = "correlation:other";

  await assert.rejects(
    bus.execute(command(), {
      async execute() {
        return { value: { reservationId: "reservation:invalid" }, events: [invalid], auditSummary: "Réservation invalide." };
      },
    }),
    /ne partage pas la corrélation/,
  );

  assert.equal(outbox.messages.length, 0);
  assert.equal(audit.records.at(-1)?.decision, "failed");
  await assert.rejects(bus.execute(command(), {
    async execute() {
      return { value: { reservationId: "never" }, events: [], auditSummary: "Ne doit pas être exécuté." };
    },
  }), /a déjà échoué/);
});

test("publie l'outbox et programme une reprise exponentielle après échec", async () => {
  const clock = new FixedClock("2027-01-01T10:00:02Z");
  const outbox = new InMemoryOutboxStore();
  await outbox.append([
    { id: "outbox:success", event: event(), status: "pending", attemptCount: 0, nextAttemptAt: clock.now() },
    { id: "outbox:retry", event: { ...event(), id: "event:retry" }, status: "pending", attemptCount: 0, nextAttemptAt: clock.now() },
  ]);
  const published: string[] = [];
  const publisher: EventPublisher = {
    async publish(item) {
      if (item.id === "event:retry") throw new Error("Courtier indisponible.");
      published.push(item.id);
    },
  };

  const result = await new OutboxPublisher(clock, outbox, publisher).publishBatch();

  assert.deepEqual(result, { attempted: 2, published: 1, failed: 1 });
  assert.deepEqual(published, ["event:capacity-reserved:001"]);
  assert.equal(outbox.messages.find((item) => item.id === "outbox:success")?.status, "published");
  const retry = outbox.messages.find((item) => item.id === "outbox:retry");
  assert.equal(retry?.status, "failed");
  assert.equal(retry?.attemptCount, 1);
  assert.ok(retry?.nextAttemptAt > clock.now());
});
