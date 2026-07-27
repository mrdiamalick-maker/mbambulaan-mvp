import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";
import type {
  AuditRecord,
  AuditTrail,
  DomainEvent,
  IdempotencyStore,
  OutboxMessage,
  OutboxStore,
  StoredCommandResult,
  UnitOfWork,
} from "../industrialization/transactional-platform-foundation";

export interface SqlQueryResult<TRow = Record<string, unknown>> {
  rows: TRow[];
  rowCount: number;
}

export interface SqlExecutor {
  query<TRow = Record<string, unknown>>(sql: string, parameters?: unknown[]): Promise<SqlQueryResult<TRow>>;
}

export interface SqlTransaction extends SqlExecutor {
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

export interface SqlConnectionPool extends SqlExecutor {
  begin(): Promise<SqlTransaction>;
}

export interface PersistedAggregate<TPayload> {
  aggregateType: string;
  aggregateId: EntityId;
  territoryId?: EntityId;
  organizationId?: EntityId;
  version: number;
  status: string;
  payload: TPayload;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export class OptimisticConcurrencyError extends Error {
  constructor(aggregateType: string, aggregateId: EntityId, expectedVersion: number) {
    super(`Conflit de version sur ${aggregateType}/${aggregateId}, version attendue ${expectedVersion}.`);
    this.name = "OptimisticConcurrencyError";
  }
}

export class PostgresUnitOfWork implements UnitOfWork {
  private activeTransaction?: SqlTransaction;

  constructor(private readonly pool: SqlConnectionPool) {}

  get executor(): SqlExecutor {
    return this.activeTransaction ?? this.pool;
  }

  async execute<T>(work: () => Promise<T>): Promise<T> {
    if (this.activeTransaction) return work();
    const transaction = await this.pool.begin();
    this.activeTransaction = transaction;
    try {
      const result = await work();
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      this.activeTransaction = undefined;
      transaction.release();
    }
  }
}

export class PostgresAggregateRepository<TPayload> {
  constructor(private readonly executor: () => SqlExecutor, private readonly aggregateType: string) {}

  async get(id: EntityId): Promise<PersistedAggregate<TPayload> | undefined> {
    const result = await this.executor().query<{
      aggregate_id: string;
      territory_id?: string;
      organization_id?: string;
      version: string | number;
      status: string;
      payload: TPayload;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT aggregate_id, territory_id, organization_id, version, status, payload, created_at, updated_at
       FROM mbambulaan.aggregate_records
       WHERE aggregate_type = $1 AND aggregate_id = $2 AND deleted_at IS NULL`,
      [this.aggregateType, id],
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      aggregateType: this.aggregateType,
      aggregateId: row.aggregate_id,
      territoryId: row.territory_id,
      organizationId: row.organization_id,
      version: Number(row.version),
      status: row.status,
      payload: structuredClone(row.payload),
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    };
  }

  async insert(record: PersistedAggregate<TPayload>): Promise<void> {
    await this.executor().query(
      `INSERT INTO mbambulaan.aggregate_records
       (aggregate_type, aggregate_id, territory_id, organization_id, version, status, payload, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)`,
      [
        this.aggregateType,
        record.aggregateId,
        record.territoryId ?? null,
        record.organizationId ?? null,
        record.version,
        record.status,
        JSON.stringify(record.payload),
        record.createdAt,
        record.updatedAt,
      ],
    );
  }

  async update(record: PersistedAggregate<TPayload>, expectedVersion: number): Promise<void> {
    const nextVersion = expectedVersion + 1;
    const result = await this.executor().query(
      `UPDATE mbambulaan.aggregate_records
       SET territory_id = $3,
           organization_id = $4,
           version = $5,
           status = $6,
           payload = $7::jsonb,
           updated_at = $8
       WHERE aggregate_type = $1
         AND aggregate_id = $2
         AND version = $9
         AND deleted_at IS NULL`,
      [
        this.aggregateType,
        record.aggregateId,
        record.territoryId ?? null,
        record.organizationId ?? null,
        nextVersion,
        record.status,
        JSON.stringify(record.payload),
        record.updatedAt,
        expectedVersion,
      ],
    );
    if (result.rowCount !== 1) throw new OptimisticConcurrencyError(this.aggregateType, record.aggregateId, expectedVersion);
  }
}

export class PostgresIdempotencyStore implements IdempotencyStore {
  constructor(private readonly executor: () => SqlExecutor) {}

  async get<TValue>(key: string): Promise<StoredCommandResult<TValue> | undefined> {
    const result = await this.executor().query<{
      command_id: string;
      command_type: string;
      idempotency_key: string;
      correlation_id: string;
      status: "completed" | "failed";
      response_payload?: TValue;
      error_code?: string;
      completed_at: string;
    }>(
      `SELECT command_id, command_type, idempotency_key, correlation_id, status,
              response_payload, error_code, completed_at
       FROM mbambulaan.command_executions
       WHERE idempotency_key = $1`,
      [key],
    );
    const row = result.rows[0];
    if (!row) return undefined;
    return {
      commandId: row.command_id,
      commandType: row.command_type,
      idempotencyKey: row.idempotency_key,
      correlationId: row.correlation_id,
      status: row.status,
      value: row.response_payload,
      errorCode: row.error_code,
      completedAt: row.completed_at as ISODateTime,
    };
  }

  async save<TValue>(key: string, result: StoredCommandResult<TValue>): Promise<void> {
    await this.executor().query(
      `INSERT INTO mbambulaan.command_executions
       (idempotency_key, command_id, command_type, actor_id, territory_ids, correlation_id,
        request_hash, status, response_payload, error_code, started_at, completed_at)
       VALUES ($1, $2, $3, 'system:transactional-command-bus', '{}', $4, $5, $6, $7::jsonb, $8, $9, $9)
       ON CONFLICT (idempotency_key) DO UPDATE SET
         status = EXCLUDED.status,
         response_payload = EXCLUDED.response_payload,
         error_code = EXCLUDED.error_code,
         completed_at = EXCLUDED.completed_at`,
      [
        key,
        result.commandId,
        result.commandType,
        result.correlationId,
        this.hashRequest(result.commandId, result.commandType, key),
        result.status,
        result.value === undefined ? null : JSON.stringify(result.value),
        result.errorCode ?? null,
        result.completedAt,
      ],
    );
  }

  private hashRequest(commandId: EntityId, commandType: string, key: string) {
    return `${commandType}:${commandId}:${key}`;
  }
}

export class PostgresAuditTrail implements AuditTrail {
  constructor(private readonly executor: () => SqlExecutor) {}

  async append(record: AuditRecord): Promise<void> {
    await this.executor().query(
      `INSERT INTO mbambulaan.audit_entries
       (id, actor_id, organization_id, territory_ids, command_id, command_type,
        decision, summary, correlation_id, metadata, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11)`,
      [
        record.id,
        record.actorIdentityId,
        record.organizationId ?? null,
        record.territoryIds,
        record.commandId,
        record.commandType,
        record.decision,
        record.summary,
        record.correlationId,
        JSON.stringify(record.metadata),
        record.occurredAt,
      ],
    );
  }
}

export class PostgresOutboxStore implements OutboxStore {
  constructor(private readonly executor: () => SqlExecutor) {}

  async append(messages: OutboxMessage[]): Promise<void> {
    for (const message of messages) {
      const event = message.event;
      await this.executor().query(
        `INSERT INTO mbambulaan.domain_events
         (id, event_type, aggregate_type, aggregate_id, aggregate_version, actor_id,
          organization_id, territory_ids, correlation_id, causation_id, schema_version,
          payload, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13)
         ON CONFLICT (id) DO NOTHING`,
        [
          event.id,
          event.eventType,
          event.aggregateType,
          event.aggregateId,
          this.aggregateVersion(event),
          event.actorIdentityId,
          event.organizationId ?? null,
          event.territoryIds,
          event.correlationId,
          event.causationId,
          event.schemaVersion,
          JSON.stringify(event.payload),
          event.occurredAt,
        ],
      );
      await this.executor().query(
        `INSERT INTO mbambulaan.outbox_messages
         (id, event_id, topic, partition_key, payload, headers, status,
          attempt_count, next_attempt_at, published_at, last_error)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO NOTHING`,
        [
          message.id,
          event.id,
          event.eventType,
          event.aggregateId,
          JSON.stringify(event),
          JSON.stringify({ correlationId: event.correlationId, causationId: event.causationId, schemaVersion: String(event.schemaVersion) }),
          message.status,
          message.attemptCount,
          message.nextAttemptAt,
          message.publishedAt ?? null,
          message.lastError ?? null,
        ],
      );
    }
  }

  async listPending(limit: number, now: ISODateTime): Promise<OutboxMessage[]> {
    const result = await this.executor().query<{
      id: string;
      payload: DomainEvent;
      status: OutboxMessage["status"];
      attempt_count: number;
      next_attempt_at: string;
      published_at?: string;
      last_error?: string;
    }>(
      `SELECT id, payload, status, attempt_count, next_attempt_at, published_at, last_error
       FROM mbambulaan.outbox_messages
       WHERE status IN ('pending', 'failed')
         AND next_attempt_at <= $1
       ORDER BY created_at
       LIMIT $2
       FOR UPDATE SKIP LOCKED`,
      [now, limit],
    );
    return result.rows.map((row) => ({
      id: row.id,
      event: structuredClone(row.payload),
      status: row.status,
      attemptCount: row.attempt_count,
      nextAttemptAt: row.next_attempt_at as ISODateTime,
      publishedAt: row.published_at as ISODateTime | undefined,
      lastError: row.last_error,
    }));
  }

  async markPublished(messageId: EntityId, publishedAt: ISODateTime): Promise<void> {
    await this.executor().query(
      `UPDATE mbambulaan.outbox_messages
       SET status = 'published', published_at = $2, last_error = NULL
       WHERE id = $1`,
      [messageId, publishedAt],
    );
  }

  async markFailed(messageId: EntityId, nextAttemptAt: ISODateTime, error: string): Promise<void> {
    await this.executor().query(
      `UPDATE mbambulaan.outbox_messages
       SET status = 'failed', attempt_count = attempt_count + 1,
           next_attempt_at = $2, last_error = $3
       WHERE id = $1`,
      [messageId, nextAttemptAt, error],
    );
  }

  private aggregateVersion(event: DomainEvent) {
    const payload = event.payload as { aggregateVersion?: unknown } | undefined;
    const value = Number(payload?.aggregateVersion ?? 1);
    return Number.isFinite(value) && value > 0 ? value : 1;
  }
}
