import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { EcosystemBusinessEvent, EcosystemBusinessEventDelivery } from "./ecosystem-business-event-bus";

export interface PersistedBusinessEventDelivery extends EcosystemBusinessEventDelivery {
  nextRetryAt?: string;
}

export class PostgresEcosystemBusinessEventRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async appendEvent(event: EcosystemBusinessEvent) {
    await this.executor().query(
      `INSERT INTO mbambulaan.ecosystem_business_event (
        event_id, event_type, occurred_at, correlation_id, causation_id,
        actor_identity_id, organization_id, territory_ids, entity_type, entity_id, payload
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10,$11::jsonb)
      ON CONFLICT (event_id) DO NOTHING`,
      [event.id, event.type, event.occurredAt, event.correlationId, event.causationId ?? null,
        event.actorId, event.organizationId, JSON.stringify(event.territoryIds), event.entityType, event.entityId, JSON.stringify(event.payload)],
    );
  }

  async saveDelivery(delivery: PersistedBusinessEventDelivery) {
    await this.executor().query(
      `INSERT INTO mbambulaan.ecosystem_business_event_delivery (
        event_id, handler_name, status, attempts, processed_at, next_retry_at, error, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())
      ON CONFLICT (event_id, handler_name) DO UPDATE SET
        status = EXCLUDED.status,
        attempts = EXCLUDED.attempts,
        processed_at = EXCLUDED.processed_at,
        next_retry_at = EXCLUDED.next_retry_at,
        error = EXCLUDED.error,
        updated_at = NOW()`,
      [delivery.eventId, delivery.handlerName, delivery.status, delivery.attempts, delivery.processedAt, delivery.nextRetryAt ?? null, delivery.error ?? null],
    );
  }

  async listEvents() {
    const result = await this.executor().query<{
      event_id: string; event_type: EcosystemBusinessEvent["type"]; occurred_at: Date | string; correlation_id: string;
      causation_id: string | null; actor_identity_id: string; organization_id: string; territory_ids: string[];
      entity_type: string; entity_id: string; payload: Record<string, unknown>;
    }>(`SELECT event_id, event_type, occurred_at, correlation_id, causation_id, actor_identity_id,
               organization_id, territory_ids, entity_type, entity_id, payload
        FROM mbambulaan.ecosystem_business_event ORDER BY occurred_at ASC, event_id ASC`);
    return result.rows.map((row) => ({
      id: row.event_id,
      type: row.event_type,
      occurredAt: new Date(row.occurred_at).toISOString(),
      correlationId: row.correlation_id,
      causationId: row.causation_id ?? undefined,
      actorId: row.actor_identity_id,
      organizationId: row.organization_id,
      territoryIds: row.territory_ids,
      entityType: row.entity_type,
      entityId: row.entity_id,
      payload: row.payload,
    } satisfies EcosystemBusinessEvent));
  }

  async listDeliveries() {
    const result = await this.executor().query<{
      event_id: string; handler_name: string; status: PersistedBusinessEventDelivery["status"];
      attempts: number; processed_at: Date | string; next_retry_at: Date | string | null; error: string | null;
    }>(`SELECT event_id, handler_name, status, attempts, processed_at, next_retry_at, error
        FROM mbambulaan.ecosystem_business_event_delivery ORDER BY processed_at ASC, event_id ASC, handler_name ASC`);
    return result.rows.map((row) => ({
      eventId: row.event_id,
      handlerName: row.handler_name,
      status: row.status,
      attempts: row.attempts,
      processedAt: new Date(row.processed_at).toISOString(),
      nextRetryAt: row.next_retry_at ? new Date(row.next_retry_at).toISOString() : undefined,
      error: row.error ?? undefined,
    } satisfies PersistedBusinessEventDelivery));
  }

  async listDueFailures(at: string) {
    const result = await this.executor().query<{ event_id: string; handler_name: string }>(
      `SELECT event_id, handler_name FROM mbambulaan.ecosystem_business_event_delivery
       WHERE status = 'failed' AND next_retry_at IS NOT NULL AND next_retry_at <= $1
       ORDER BY next_retry_at ASC`, [at],
    );
    return result.rows.map((row) => ({ eventId: row.event_id, handlerName: row.handler_name }));
  }
}
