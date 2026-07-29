import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";

export type PartnerEnvironment = "sandbox" | "production";
export type PartnerStatus = "pending" | "active" | "suspended" | "revoked";
export type ExchangeStatus = "received" | "validated" | "processed" | "rejected" | "pending" | "delivered" | "failed" | "dead_lettered";

export interface IntegrationPartner {
  id: EntityId;
  code: string;
  name: string;
  partnerType: "public_authority" | "payment_provider" | "telecom" | "weather" | "registry" | "cooperative" | "erp" | "logistics" | "other";
  environment: PartnerEnvironment;
  status: PartnerStatus;
  allowedEventTypes: string[];
  allowedTerritoryIds: EntityId[];
  allowedIpHashes: string[];
  signingSecretVersion: number;
  requestsPerMinute: number;
  callbackUrl?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface IncomingExchange {
  id: EntityId;
  partnerId: EntityId;
  eventType: string;
  eventVersion: number;
  idempotencyKey: string;
  correlationId: EntityId;
  territoryIds: EntityId[];
  payload: Record<string, unknown>;
  payloadHash: string;
  signature: string;
  occurredAt: ISODateTime;
  receivedAt: ISODateTime;
  status: ExchangeStatus;
  rejectionReason?: string;
}

export interface OutgoingExchange {
  id: EntityId;
  partnerId: EntityId;
  eventType: string;
  eventVersion: number;
  aggregateType: string;
  aggregateId: EntityId;
  correlationId: EntityId;
  territoryIds: EntityId[];
  payload: Record<string, unknown>;
  payloadHash: string;
  signature: string;
  status: ExchangeStatus;
  attemptCount: number;
  nextAttemptAt: ISODateTime;
  deliveredAt?: ISODateTime;
  lastError?: string;
  createdAt: ISODateTime;
}

export interface IntegrationReceipt {
  id: EntityId;
  exchangeId: EntityId;
  direction: "incoming" | "outgoing";
  partnerId: EntityId;
  status: ExchangeStatus;
  providerReference?: string;
  detail?: string;
  occurredAt: ISODateTime;
}

export interface IntegrationRepository {
  getPartner(partnerId: EntityId): Promise<IntegrationPartner | undefined>;
  findIncomingByIdempotencyKey(partnerId: EntityId, key: string): Promise<IncomingExchange | undefined>;
  saveIncoming(exchange: IncomingExchange): Promise<void>;
  saveOutgoing(exchange: OutgoingExchange): Promise<void>;
  listPendingOutgoing(at: ISODateTime, limit: number): Promise<OutgoingExchange[]>;
  appendReceipt(receipt: IntegrationReceipt): Promise<void>;
  consumeQuota(input: { partnerId: EntityId; windowStart: ISODateTime; limit: number }): Promise<boolean>;
}

export interface SignatureService {
  hashPayload(payload: unknown): string;
  sign(input: { partnerId: EntityId; secretVersion: number; timestamp: ISODateTime; payloadHash: string }): string;
  verify(input: { partnerId: EntityId; secretVersion: number; timestamp: ISODateTime; payloadHash: string; signature: string }): boolean;
}

export interface PartnerTransport {
  send(input: { partner: IntegrationPartner; exchange: OutgoingExchange }): Promise<{ providerReference?: string }>;
}

export interface IntegrationClock { now(): ISODateTime; }
export interface IntegrationIds { next(prefix: string): EntityId; }

export class NationalIntegrationGateway {
  constructor(
    private readonly repository: IntegrationRepository,
    private readonly signatures: SignatureService,
    private readonly clock: IntegrationClock,
    private readonly ids: IntegrationIds,
  ) {}

  async receive(input: {
    partnerId: EntityId;
    eventType: string;
    eventVersion: number;
    idempotencyKey: string;
    correlationId?: EntityId;
    territoryIds: EntityId[];
    payload: Record<string, unknown>;
    signature: string;
    occurredAt: ISODateTime;
  }) {
    const partner = await this.requireActivePartner(input.partnerId);
    this.assertPartnerScope(partner, input.eventType, input.territoryIds);
    const windowStart = new Date(Math.floor(Date.parse(this.clock.now()) / 60_000) * 60_000).toISOString() as ISODateTime;
    if (!(await this.repository.consumeQuota({ partnerId: partner.id, windowStart, limit: partner.requestsPerMinute }))) {
      throw new Error("Le quota partenaire est dépassé.");
    }
    const existing = await this.repository.findIncomingByIdempotencyKey(partner.id, input.idempotencyKey);
    if (existing) return structuredClone(existing);
    const payloadHash = this.signatures.hashPayload(input.payload);
    if (!this.signatures.verify({ partnerId: partner.id, secretVersion: partner.signingSecretVersion, timestamp: input.occurredAt, payloadHash, signature: input.signature })) {
      throw new Error("La signature du message partenaire est invalide.");
    }
    const ageMs = Math.abs(Date.parse(this.clock.now()) - Date.parse(input.occurredAt));
    if (ageMs > 5 * 60_000) throw new Error("Le message partenaire est trop ancien ou horodaté dans le futur.");
    const exchange: IncomingExchange = {
      id: this.ids.next("incoming-exchange"),
      partnerId: partner.id,
      eventType: input.eventType,
      eventVersion: input.eventVersion,
      idempotencyKey: input.idempotencyKey,
      correlationId: input.correlationId ?? this.ids.next("correlation"),
      territoryIds: [...new Set(input.territoryIds)],
      payload: structuredClone(input.payload),
      payloadHash,
      signature: input.signature,
      occurredAt: input.occurredAt,
      receivedAt: this.clock.now(),
      status: "validated",
    };
    await this.repository.saveIncoming(exchange);
    await this.repository.appendReceipt({ id: this.ids.next("integration-receipt"), exchangeId: exchange.id, direction: "incoming", partnerId: partner.id, status: "validated", occurredAt: this.clock.now() });
    return structuredClone(exchange);
  }

  async enqueue(input: {
    partnerId: EntityId;
    eventType: string;
    eventVersion: number;
    aggregateType: string;
    aggregateId: EntityId;
    correlationId: EntityId;
    territoryIds: EntityId[];
    payload: Record<string, unknown>;
  }) {
    const partner = await this.requireActivePartner(input.partnerId);
    this.assertPartnerScope(partner, input.eventType, input.territoryIds);
    const payloadHash = this.signatures.hashPayload(input.payload);
    const now = this.clock.now();
    const exchange: OutgoingExchange = {
      id: this.ids.next("outgoing-exchange"),
      ...input,
      territoryIds: [...new Set(input.territoryIds)],
      payload: structuredClone(input.payload),
      payloadHash,
      signature: this.signatures.sign({ partnerId: partner.id, secretVersion: partner.signingSecretVersion, timestamp: now, payloadHash }),
      status: "pending",
      attemptCount: 0,
      nextAttemptAt: now,
      createdAt: now,
    };
    await this.repository.saveOutgoing(exchange);
    return structuredClone(exchange);
  }

  private async requireActivePartner(partnerId: EntityId) {
    const partner = await this.repository.getPartner(partnerId);
    if (!partner || partner.status !== "active") throw new Error("Le partenaire est absent ou inactif.");
    return partner;
  }

  private assertPartnerScope(partner: IntegrationPartner, eventType: string, territoryIds: EntityId[]) {
    if (!partner.allowedEventTypes.includes(eventType)) throw new Error("Le type d'événement n'est pas autorisé pour ce partenaire.");
    if (territoryIds.some((id) => !partner.allowedTerritoryIds.includes(id))) throw new Error("Le territoire est hors du périmètre partenaire.");
  }
}

export class OutgoingIntegrationDispatcher {
  constructor(
    private readonly repository: IntegrationRepository,
    private readonly transport: PartnerTransport,
    private readonly clock: IntegrationClock,
    private readonly ids: IntegrationIds,
    private readonly maxAttempts = 8,
  ) {}

  async dispatch(limit = 100) {
    const exchanges = await this.repository.listPendingOutgoing(this.clock.now(), limit);
    for (const exchange of exchanges) {
      const partner = await this.repository.getPartner(exchange.partnerId);
      if (!partner || partner.status !== "active") {
        await this.fail(exchange, "Partenaire inactif.");
        continue;
      }
      try {
        const result = await this.transport.send({ partner, exchange });
        exchange.status = "delivered";
        exchange.deliveredAt = this.clock.now();
        exchange.lastError = undefined;
        await this.repository.saveOutgoing(exchange);
        await this.repository.appendReceipt({ id: this.ids.next("integration-receipt"), exchangeId: exchange.id, direction: "outgoing", partnerId: partner.id, status: "delivered", providerReference: result.providerReference, occurredAt: this.clock.now() });
      } catch (error) {
        await this.fail(exchange, error instanceof Error ? error.message : "Erreur d'intégration inconnue.");
      }
    }
    return exchanges.map((item) => structuredClone(item));
  }

  private async fail(exchange: OutgoingExchange, reason: string) {
    exchange.attemptCount += 1;
    exchange.lastError = reason;
    if (exchange.attemptCount >= this.maxAttempts) {
      exchange.status = "dead_lettered";
    } else {
      exchange.status = "failed";
      const delayMinutes = Math.min(360, 2 ** exchange.attemptCount);
      exchange.nextAttemptAt = new Date(Date.parse(this.clock.now()) + delayMinutes * 60_000).toISOString() as ISODateTime;
    }
    await this.repository.saveOutgoing(exchange);
    await this.repository.appendReceipt({ id: this.ids.next("integration-receipt"), exchangeId: exchange.id, direction: "outgoing", partnerId: exchange.partnerId, status: exchange.status, detail: reason, occurredAt: this.clock.now() });
  }
}

export class InMemoryIntegrationRepository implements IntegrationRepository {
  readonly partners = new Map<EntityId, IntegrationPartner>();
  readonly incoming = new Map<EntityId, IncomingExchange>();
  readonly outgoing = new Map<EntityId, OutgoingExchange>();
  readonly receipts: IntegrationReceipt[] = [];
  readonly quotas = new Map<string, number>();

  async getPartner(partnerId: EntityId) { const item = this.partners.get(partnerId); return item ? structuredClone(item) : undefined; }
  async findIncomingByIdempotencyKey(partnerId: EntityId, key: string) { const item = [...this.incoming.values()].find((value) => value.partnerId === partnerId && value.idempotencyKey === key); return item ? structuredClone(item) : undefined; }
  async saveIncoming(exchange: IncomingExchange) { this.incoming.set(exchange.id, structuredClone(exchange)); }
  async saveOutgoing(exchange: OutgoingExchange) { this.outgoing.set(exchange.id, structuredClone(exchange)); }
  async listPendingOutgoing(at: ISODateTime, limit: number) { return structuredClone([...this.outgoing.values()].filter((item) => ["pending", "failed"].includes(item.status) && Date.parse(item.nextAttemptAt) <= Date.parse(at)).slice(0, limit)); }
  async appendReceipt(receipt: IntegrationReceipt) { this.receipts.push(structuredClone(receipt)); }
  async consumeQuota(input: { partnerId: EntityId; windowStart: ISODateTime; limit: number }) { const key = `${input.partnerId}:${input.windowStart}`; const current = this.quotas.get(key) ?? 0; if (current >= input.limit) return false; this.quotas.set(key, current + 1); return true; }
}
