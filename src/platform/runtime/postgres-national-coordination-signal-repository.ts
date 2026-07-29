import type { SqlExecutor } from "@/platform/persistence/postgres-platform-adapters";
import type { NationalCoordinationSignal } from "./national-coordination-signal-projection";

export class PostgresNationalCoordinationSignalRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async upsert(signal: NationalCoordinationSignal) {
    await this.executor().query(
      `INSERT INTO mbambulaan.national_coordination_signal (
        signal_id, correlation_id, event_type, territory_ids, organization_id,
        entity_type, entity_id, severity, title, summary, value_xof, quantity_kg,
        occurred_at, status, updated_at
      ) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW())
      ON CONFLICT (signal_id) DO UPDATE SET
        correlation_id = EXCLUDED.correlation_id,
        event_type = EXCLUDED.event_type,
        territory_ids = EXCLUDED.territory_ids,
        organization_id = EXCLUDED.organization_id,
        entity_type = EXCLUDED.entity_type,
        entity_id = EXCLUDED.entity_id,
        severity = EXCLUDED.severity,
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        value_xof = EXCLUDED.value_xof,
        quantity_kg = EXCLUDED.quantity_kg,
        occurred_at = EXCLUDED.occurred_at,
        status = EXCLUDED.status,
        resolved_at = CASE WHEN EXCLUDED.status = 'resolved' THEN COALESCE(mbambulaan.national_coordination_signal.resolved_at, NOW()) ELSE NULL END,
        updated_at = NOW()`,
      [
        signal.id,
        signal.correlationId,
        signal.eventType,
        JSON.stringify(signal.territoryIds),
        signal.organizationId,
        signal.entityType,
        signal.entityId,
        signal.severity,
        signal.title,
        signal.summary,
        signal.valueXof ?? null,
        signal.quantityKg ?? null,
        signal.occurredAt,
        signal.status,
      ],
    );
    return structuredClone(signal);
  }

  async resolveCorrelation(correlationId: string, resolvedAt: string) {
    await this.executor().query(
      `UPDATE mbambulaan.national_coordination_signal
       SET status = 'resolved', resolved_at = COALESCE(resolved_at, $2), updated_at = NOW()
       WHERE correlation_id = $1`,
      [correlationId, resolvedAt],
    );
  }

  async list(input?: { territoryId?: string; correlationId?: string }) {
    const clauses: string[] = [];
    const values: unknown[] = [];
    if (input?.territoryId) {
      values.push(JSON.stringify([input.territoryId]));
      clauses.push(`territory_ids @> $${values.length}::jsonb`);
    }
    if (input?.correlationId) {
      values.push(input.correlationId);
      clauses.push(`correlation_id = $${values.length}`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const result = await this.executor().query<{
      signal_id: string;
      correlation_id: string;
      event_type: NationalCoordinationSignal["eventType"];
      territory_ids: string[];
      organization_id: string;
      entity_type: string;
      entity_id: string;
      severity: NationalCoordinationSignal["severity"];
      title: string;
      summary: string;
      value_xof: number | string | null;
      quantity_kg: number | string | null;
      occurred_at: Date | string;
      status: NationalCoordinationSignal["status"];
    }>(
      `SELECT signal_id, correlation_id, event_type, territory_ids, organization_id,
              entity_type, entity_id, severity, title, summary, value_xof, quantity_kg,
              occurred_at, status
       FROM mbambulaan.national_coordination_signal
       ${where}
       ORDER BY occurred_at ASC, signal_id ASC`,
      values,
    );
    return result.rows.map((row) => ({
      id: row.signal_id,
      correlationId: row.correlation_id,
      eventType: row.event_type,
      territoryIds: row.territory_ids,
      organizationId: row.organization_id,
      entityType: row.entity_type,
      entityId: row.entity_id,
      severity: row.severity,
      title: row.title,
      summary: row.summary,
      valueXof: row.value_xof === null ? undefined : Number(row.value_xof),
      quantityKg: row.quantity_kg === null ? undefined : Number(row.quantity_kg),
      occurredAt: new Date(row.occurred_at).toISOString(),
      status: row.status,
    } satisfies NationalCoordinationSignal));
  }
}
