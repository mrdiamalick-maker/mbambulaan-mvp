import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { RuntimeAuditRecord, RuntimeEvent } from "./integrated-platform-runtime";

export interface RuntimeOutboxEnvelope {
  event: RuntimeEvent;
  status: "pending" | "processing" | "processed" | "failed";
  attemptCount: number;
  availableAt: string;
  lockedAt?: string;
  lockedBy?: string;
  processedAt?: string;
  lastError?: string;
}

export interface RuntimeRepository {
  appendAccepted(event: RuntimeEvent, acceptedAt: string, audit: RuntimeAuditRecord): Promise<boolean>;
  claimPending(workerId: string, at: string, limit: number): Promise<RuntimeOutboxEnvelope[]>;
  markProcessed(eventId: string, processedAt: string, audit: RuntimeAuditRecord): Promise<void>;
  markFailed(eventId: string, processedAt: string, error: string, audit: RuntimeAuditRecord): Promise<void>;
  saveCheckpoint(input: {
    projectionCode: string;
    tenantId: string;
    territoryId: string;
    lastEventId: string;
    lastOccurredAt: string;
  }): Promise<void>;
}

export class PostgresRuntimeRepository implements RuntimeRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async appendAccepted(event: RuntimeEvent, acceptedAt: string, audit: RuntimeAuditRecord) {
    const inserted = await this.executor().query(
      `INSERT INTO mbambulaan.runtime_events
       (id, event_type, tenant_id, territory_id, correlation_id, causation_id, payload, occurred_at, accepted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [event.id, event.type, event.tenantId, event.territoryId, event.correlationId,
       event.causationId ?? null, JSON.stringify(event.payload), event.occurredAt, acceptedAt],
    );
    if (inserted.rowCount !== 1) return false;

    await this.executor().query(
      `INSERT INTO mbambulaan.runtime_outbox(event_id, status, attempt_count, available_at, updated_at)
       VALUES ($1,'pending',0,$2,$2)`,
      [event.id, acceptedAt],
    );
    await this.saveAudit(audit);
    return true;
  }

  async claimPending(workerId: string, at: string, limit: number) {
    const result = await this.executor().query<any>(
      `WITH claimed AS (
         SELECT event_id
         FROM mbambulaan.runtime_outbox
         WHERE status IN ('pending','failed') AND available_at <= $1
         ORDER BY available_at, event_id
         LIMIT $2
         FOR UPDATE SKIP LOCKED
       )
       UPDATE mbambulaan.runtime_outbox o
       SET status = 'processing',
           attempt_count = o.attempt_count + 1,
           locked_at = $1,
           locked_by = $3,
           updated_at = $1
       FROM claimed
       WHERE o.event_id = claimed.event_id
       RETURNING o.*, (
         SELECT jsonb_build_object(
           'id', e.id,
           'type', e.event_type,
           'tenantId', e.tenant_id,
           'territoryId', e.territory_id,
           'correlationId', e.correlation_id,
           'causationId', e.causation_id,
           'payload', e.payload,
           'occurredAt', e.occurred_at
         )
         FROM mbambulaan.runtime_events e WHERE e.id = o.event_id
       ) AS event`,
      [at, limit, workerId],
    );
    return result.rows.map((row) => ({
      event: row.event as RuntimeEvent,
      status: row.status,
      attemptCount: Number(row.attempt_count),
      availableAt: row.available_at,
      lockedAt: row.locked_at ?? undefined,
      lockedBy: row.locked_by ?? undefined,
      processedAt: row.processed_at ?? undefined,
      lastError: row.last_error ?? undefined,
    } satisfies RuntimeOutboxEnvelope));
  }

  async markProcessed(eventId: string, processedAt: string, audit: RuntimeAuditRecord) {
    await this.executor().query(
      `UPDATE mbambulaan.runtime_outbox
       SET status='processed', processed_at=$2, locked_at=NULL, locked_by=NULL, last_error=NULL, updated_at=$2
       WHERE event_id=$1`,
      [eventId, processedAt],
    );
    await this.saveAudit(audit);
  }

  async markFailed(eventId: string, processedAt: string, error: string, audit: RuntimeAuditRecord) {
    await this.executor().query(
      `UPDATE mbambulaan.runtime_outbox
       SET status='failed', available_at=$2::timestamptz + interval '1 minute',
           locked_at=NULL, locked_by=NULL, last_error=$3, updated_at=$2
       WHERE event_id=$1`,
      [eventId, processedAt, error],
    );
    await this.saveAudit(audit);
  }

  async saveCheckpoint(input: {
    projectionCode: string;
    tenantId: string;
    territoryId: string;
    lastEventId: string;
    lastOccurredAt: string;
  }) {
    await this.executor().query(
      `INSERT INTO mbambulaan.runtime_projection_checkpoints
       (projection_code, tenant_id, territory_id, last_event_id, last_occurred_at, version, updated_at)
       VALUES ($1,$2,$3,$4,$5,1,now())
       ON CONFLICT (projection_code, tenant_id, territory_id) DO UPDATE
       SET last_event_id=EXCLUDED.last_event_id,
           last_occurred_at=EXCLUDED.last_occurred_at,
           version=mbambulaan.runtime_projection_checkpoints.version + 1,
           updated_at=now()`,
      [input.projectionCode, input.tenantId, input.territoryId, input.lastEventId, input.lastOccurredAt],
    );
  }

  private async saveAudit(audit: RuntimeAuditRecord) {
    await this.executor().query(
      `INSERT INTO mbambulaan.runtime_audit_records
       (id, event_id, event_type, status, occurred_at, processed_at, details)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO NOTHING`,
      [audit.id, audit.eventId, audit.eventType, audit.status, audit.occurredAt,
       audit.processedAt ?? null, audit.details ?? null],
    );
  }
}
