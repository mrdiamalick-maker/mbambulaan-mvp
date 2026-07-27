import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";

export interface PlatformClock {
  now(): ISODateTime;
}

export interface PlatformIdGenerator {
  next(prefix: string): EntityId;
}

export interface CommandContext {
  commandId: EntityId;
  commandType: string;
  actorIdentityId: EntityId;
  organizationId?: EntityId;
  territoryIds: EntityId[];
  correlationId: EntityId;
  causationId?: EntityId;
  idempotencyKey: string;
  requestedAt: ISODateTime;
  metadata: Record<string, string>;
}

export interface CommandEnvelope<TPayload> {
  context: CommandContext;
  payload: TPayload;
}

export interface DomainEvent<TPayload = unknown> {
  id: EntityId;
  eventType: string;
  aggregateType: string;
  aggregateId: EntityId;
  occurredAt: ISODateTime;
  correlationId: EntityId;
  causationId: EntityId;
  actorIdentityId: EntityId;
  organizationId?: EntityId;
  territoryIds: EntityId[];
  schemaVersion: number;
  payload: TPayload;
}

export interface CommandExecutionResult<TValue> {
  value: TValue;
  events: DomainEvent[];
  auditSummary: string;
}

export interface StoredCommandResult<TValue = unknown> {
  commandId: EntityId;
  commandType: string;
  idempotencyKey: string;
  correlationId: EntityId;
  status: "completed" | "failed";
  value?: TValue;
  errorCode?: string;
  completedAt: ISODateTime;
}

export interface AuditRecord {
  id: EntityId;
  commandId: EntityId;
  commandType: string;
  actorIdentityId: EntityId;
  organizationId?: EntityId;
  territoryIds: EntityId[];
  correlationId: EntityId;
  decision: "accepted" | "rejected" | "failed";
  summary: string;
  occurredAt: ISODateTime;
  metadata: Record<string, string>;
}

export interface OutboxMessage {
  id: EntityId;
  event: DomainEvent;
  status: "pending" | "publishing" | "published" | "failed";
  attemptCount: number;
  nextAttemptAt: ISODateTime;
  publishedAt?: ISODateTime;
  lastError?: string;
}

export interface IdempotencyStore {
  get<TValue>(key: string): Promise<StoredCommandResult<TValue> | undefined>;
  save<TValue>(key: string, result: StoredCommandResult<TValue>): Promise<void>;
}

export interface AuditTrail {
  append(record: AuditRecord): Promise<void>;
}

export interface OutboxStore {
  append(messages: OutboxMessage[]): Promise<void>;
  listPending(limit: number, now: ISODateTime): Promise<OutboxMessage[]>;
  markPublished(messageId: EntityId, publishedAt: ISODateTime): Promise<void>;
  markFailed(messageId: EntityId, nextAttemptAt: ISODateTime, error: string): Promise<void>;
}

export interface UnitOfWork {
  execute<T>(work: () => Promise<T>): Promise<T>;
}

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}

export interface CommandHandler<TPayload, TValue> {
  execute(command: CommandEnvelope<TPayload>): Promise<CommandExecutionResult<TValue>>;
}

export class TransactionalCommandBus {
  constructor(
    private readonly clock: PlatformClock,
    private readonly ids: PlatformIdGenerator,
    private readonly unitOfWork: UnitOfWork,
    private readonly idempotency: IdempotencyStore,
    private readonly outbox: OutboxStore,
    private readonly auditTrail: AuditTrail,
  ) {}

  async execute<TPayload, TValue>(
    command: CommandEnvelope<TPayload>,
    handler: CommandHandler<TPayload, TValue>,
  ): Promise<TValue> {
    this.validateContext(command.context);
    const existing = await this.idempotency.get<TValue>(command.context.idempotencyKey);
    if (existing?.status === "completed" && existing.value !== undefined) return structuredClone(existing.value);
    if (existing?.status === "failed") throw new Error(`La commande ${command.context.idempotencyKey} a déjà échoué avec ${existing.errorCode ?? "une erreur inconnue"}.`);

    try {
      return await this.unitOfWork.execute(async () => {
        const result = await handler.execute(structuredClone(command));
        this.validateEvents(command.context, result.events);
        const now = this.clock.now();
        const stored: StoredCommandResult<TValue> = {
          commandId: command.context.commandId,
          commandType: command.context.commandType,
          idempotencyKey: command.context.idempotencyKey,
          correlationId: command.context.correlationId,
          status: "completed",
          value: structuredClone(result.value),
          completedAt: now,
        };
        const messages = result.events.map((event) => ({
          id: this.ids.next("outbox"),
          event: structuredClone(event),
          status: "pending" as const,
          attemptCount: 0,
          nextAttemptAt: now,
        }));
        await this.idempotency.save(command.context.idempotencyKey, stored);
        await this.outbox.append(messages);
        await this.auditTrail.append({
          id: this.ids.next("audit"),
          commandId: command.context.commandId,
          commandType: command.context.commandType,
          actorIdentityId: command.context.actorIdentityId,
          organizationId: command.context.organizationId,
          territoryIds: [...command.context.territoryIds],
          correlationId: command.context.correlationId,
          decision: "accepted",
          summary: result.auditSummary,
          occurredAt: now,
          metadata: { ...command.context.metadata },
        });
        return structuredClone(result.value);
      });
    } catch (error) {
      const now = this.clock.now();
      const errorCode = error instanceof Error ? error.name || "Error" : "UnknownError";
      await this.idempotency.save(command.context.idempotencyKey, {
        commandId: command.context.commandId,
        commandType: command.context.commandType,
        idempotencyKey: command.context.idempotencyKey,
        correlationId: command.context.correlationId,
        status: "failed",
        errorCode,
        completedAt: now,
      });
      await this.auditTrail.append({
        id: this.ids.next("audit"),
        commandId: command.context.commandId,
        commandType: command.context.commandType,
        actorIdentityId: command.context.actorIdentityId,
        organizationId: command.context.organizationId,
        territoryIds: [...command.context.territoryIds],
        correlationId: command.context.correlationId,
        decision: "failed",
        summary: error instanceof Error ? error.message : "Échec de commande non qualifié.",
        occurredAt: now,
        metadata: { ...command.context.metadata },
      });
      throw error;
    }
  }

  private validateContext(context: CommandContext) {
    if (!context.commandId || !context.commandType || !context.actorIdentityId || !context.correlationId || !context.idempotencyKey) {
      throw new Error("Le contexte de commande est incomplet.");
    }
    if (context.territoryIds.length === 0) throw new Error("Une commande doit être rattachée à au moins un territoire.");
  }

  private validateEvents(context: CommandContext, events: DomainEvent[]) {
    for (const event of events) {
      if (event.correlationId !== context.correlationId) throw new Error(`L'événement ${event.id} ne partage pas la corrélation de la commande.`);
      if (event.causationId !== context.commandId) throw new Error(`L'événement ${event.id} ne référence pas la commande comme cause.`);
      if (event.actorIdentityId !== context.actorIdentityId) throw new Error(`L'événement ${event.id} n'est pas attribué à l'acteur de la commande.`);
      if (event.schemaVersion < 1) throw new Error(`L'événement ${event.id} possède une version de schéma invalide.`);
    }
  }
}

export class OutboxPublisher {
  constructor(
    private readonly clock: PlatformClock,
    private readonly outbox: OutboxStore,
    private readonly publisher: EventPublisher,
  ) {}

  async publishBatch(limit = 100) {
    const now = this.clock.now();
    const messages = await this.outbox.listPending(limit, now);
    const result = { attempted: messages.length, published: 0, failed: 0 };
    for (const message of messages) {
      try {
        await this.publisher.publish(structuredClone(message.event));
        await this.outbox.markPublished(message.id, this.clock.now());
        result.published += 1;
      } catch (error) {
        const retryAt = new Date(Date.parse(this.clock.now()) + this.retryDelayMs(message.attemptCount + 1)).toISOString() as ISODateTime;
        await this.outbox.markFailed(message.id, retryAt, error instanceof Error ? error.message : "Erreur de publication inconnue.");
        result.failed += 1;
      }
    }
    return result;
  }

  private retryDelayMs(attempt: number) {
    return Math.min(3_600_000, 1_000 * 2 ** Math.min(attempt, 12));
  }
}

export class InMemoryIdempotencyStore implements IdempotencyStore {
  private readonly values = new Map<string, StoredCommandResult>();
  async get<TValue>(key: string) { return structuredClone(this.values.get(key)) as StoredCommandResult<TValue> | undefined; }
  async save<TValue>(key: string, result: StoredCommandResult<TValue>) { this.values.set(key, structuredClone(result) as StoredCommandResult); }
}

export class InMemoryAuditTrail implements AuditTrail {
  readonly records: AuditRecord[] = [];
  async append(record: AuditRecord) { this.records.push(structuredClone(record)); }
}

export class InMemoryOutboxStore implements OutboxStore {
  readonly messages: OutboxMessage[] = [];
  async append(messages: OutboxMessage[]) { this.messages.push(...structuredClone(messages)); }
  async listPending(limit: number, now: ISODateTime) {
    return structuredClone(this.messages.filter((message) => ["pending", "failed"].includes(message.status) && message.nextAttemptAt <= now).slice(0, limit));
  }
  async markPublished(messageId: EntityId, publishedAt: ISODateTime) {
    const message = this.requireMessage(messageId);
    message.status = "published";
    message.publishedAt = publishedAt;
    message.lastError = undefined;
  }
  async markFailed(messageId: EntityId, nextAttemptAt: ISODateTime, error: string) {
    const message = this.requireMessage(messageId);
    message.status = "failed";
    message.attemptCount += 1;
    message.nextAttemptAt = nextAttemptAt;
    message.lastError = error;
  }
  private requireMessage(id: EntityId) {
    const message = this.messages.find((entry) => entry.id === id);
    if (!message) throw new Error(`Message outbox introuvable : ${id}.`);
    return message;
  }
}

export class InMemoryUnitOfWork implements UnitOfWork {
  async execute<T>(work: () => Promise<T>) { return work(); }
}

export class FixedClock implements PlatformClock {
  constructor(private value: ISODateTime) {}
  now() { return this.value; }
  set(value: ISODateTime) { this.value = value; }
}

export class SequentialIdGenerator implements PlatformIdGenerator {
  private sequence = 0;
  next(prefix: string) { this.sequence += 1; return `${prefix}:${this.sequence}`; }
}
