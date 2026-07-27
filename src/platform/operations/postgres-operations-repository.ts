import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";
import type { SqlExecutor } from "../persistence/postgres-platform-adapters";
import type {
  BackupExecution,
  HealthSignal,
  MetricPoint,
  OfflineMutation,
  OperationalIncident,
  OperationsRepository,
  ServiceLevelObjective,
  SloEvaluation,
  TraceSpan,
} from "./national-operational-resilience";

export class PostgresOperationsRepository implements OperationsRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async saveHealth(signal: HealthSignal) {
    await this.executor().query(
      `INSERT INTO mbambulaan.health_signals
       (id, component, territory_id, status, latency_ms, detail, dependency_signals, checked_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8)`,
      [signal.id, signal.component, signal.territoryId ?? null, signal.status, signal.latencyMs ?? null, signal.detail ?? null, JSON.stringify(signal.dependencySignals), signal.checkedAt],
    );
  }

  async saveMetric(point: MetricPoint) {
    await this.executor().query(
      `INSERT INTO mbambulaan.metric_points
       (id, metric_name, value, unit, territory_id, labels, occurred_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7)`,
      [point.id, point.metricName, point.value, point.unit, point.territoryId ?? null, JSON.stringify(point.labels), point.occurredAt],
    );
  }

  async saveTrace(span: TraceSpan) {
    await this.executor().query(
      `INSERT INTO mbambulaan.trace_spans
       (id, trace_id, parent_span_id, operation, component, territory_id, started_at, ended_at, status, attributes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb)`,
      [span.id, span.traceId, span.parentSpanId ?? null, span.operation, span.component, span.territoryId ?? null, span.startedAt, span.endedAt, span.status, JSON.stringify(span.attributes)],
    );
  }

  async getSlo(code: string) {
    const result = await this.executor().query<{
      code: string; service_name: string; territory_id?: string; objective_type: ServiceLevelObjective["objectiveType"];
      target: number; measurement_window_minutes: number; error_budget_percent: number; status: ServiceLevelObjective["status"];
    }>(`SELECT * FROM mbambulaan.service_level_objectives WHERE code = $1`, [code]);
    const row = result.rows[0];
    return row ? {
      code: row.code,
      serviceName: row.service_name,
      territoryId: row.territory_id,
      objectiveType: row.objective_type,
      target: Number(row.target),
      measurementWindowMinutes: Number(row.measurement_window_minutes),
      errorBudgetPercent: Number(row.error_budget_percent),
      status: row.status,
    } : undefined;
  }

  async listMetricPoints(metricName: string, territoryId: EntityId | undefined, from: ISODateTime, to: ISODateTime) {
    const result = await this.executor().query<{
      id: string; metric_name: string; value: number; unit: MetricPoint["unit"]; territory_id?: string; labels: Record<string,string>; occurred_at: string;
    }>(
      `SELECT id, metric_name, value, unit, territory_id, labels, occurred_at
       FROM mbambulaan.metric_points
       WHERE metric_name = $1 AND territory_id IS NOT DISTINCT FROM $2
         AND occurred_at BETWEEN $3 AND $4 ORDER BY occurred_at`,
      [metricName, territoryId ?? null, from, to],
    );
    return result.rows.map((row) => ({ id: row.id, metricName: row.metric_name, value: Number(row.value), unit: row.unit, territoryId: row.territory_id, labels: row.labels, occurredAt: row.occurred_at as ISODateTime }));
  }

  async saveSloEvaluation(evaluation: SloEvaluation) {
    await this.executor().query(
      `INSERT INTO mbambulaan.slo_evaluations
       (id, slo_code, territory_id, measured_value, target, compliant, error_budget_consumed_percent, window_started_at, window_ended_at, evaluated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [evaluation.id, evaluation.sloCode, evaluation.territoryId ?? null, evaluation.measuredValue, evaluation.target, evaluation.compliant, evaluation.errorBudgetConsumedPercent, evaluation.windowStartedAt, evaluation.windowEndedAt, evaluation.evaluatedAt],
    );
  }

  async saveIncident(incident: OperationalIncident) {
    await this.executor().query(
      `INSERT INTO mbambulaan.operational_incidents
       (id,title,description,severity,status,service_name,territory_ids,detected_at,acknowledged_at,mitigated_at,resolved_at,commander_identity_id,runbook_code,correlation_ids,impact,root_cause,corrective_actions)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb)
       ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, acknowledged_at=EXCLUDED.acknowledged_at,
       mitigated_at=EXCLUDED.mitigated_at, resolved_at=EXCLUDED.resolved_at, commander_identity_id=EXCLUDED.commander_identity_id,
       root_cause=EXCLUDED.root_cause, corrective_actions=EXCLUDED.corrective_actions`,
      [incident.id, incident.title, incident.description, incident.severity, incident.status, incident.serviceName, incident.territoryIds, incident.detectedAt, incident.acknowledgedAt ?? null, incident.mitigatedAt ?? null, incident.resolvedAt ?? null, incident.commanderIdentityId ?? null, incident.runbookCode, incident.correlationIds, incident.impact, incident.rootCause ?? null, JSON.stringify(incident.correctiveActions)],
    );
  }

  async getIncident(id: EntityId) {
    const result = await this.executor().query<any>(`SELECT * FROM mbambulaan.operational_incidents WHERE id=$1`, [id]);
    const r = result.rows[0];
    return r ? {
      id: r.id, title: r.title, description: r.description, severity: r.severity, status: r.status, serviceName: r.service_name,
      territoryIds: r.territory_ids, detectedAt: r.detected_at, acknowledgedAt: r.acknowledged_at, mitigatedAt: r.mitigated_at,
      resolvedAt: r.resolved_at, commanderIdentityId: r.commander_identity_id, runbookCode: r.runbook_code,
      correlationIds: r.correlation_ids, impact: r.impact, rootCause: r.root_cause, correctiveActions: r.corrective_actions,
    } as OperationalIncident : undefined;
  }

  async saveBackup(execution: BackupExecution) {
    await this.executor().query(
      `INSERT INTO mbambulaan.backup_executions
       (id,backup_type,database_name,region_code,storage_location,status,started_at,completed_at,size_bytes,checksum,restore_tested_at,retention_until,error)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, completed_at=EXCLUDED.completed_at, size_bytes=EXCLUDED.size_bytes,
       checksum=EXCLUDED.checksum, restore_tested_at=EXCLUDED.restore_tested_at, error=EXCLUDED.error`,
      [execution.id, execution.backupType, execution.databaseName, execution.regionCode, execution.storageLocation, execution.status, execution.startedAt, execution.completedAt ?? null, execution.sizeBytes ?? null, execution.checksum ?? null, execution.restoreTestedAt ?? null, execution.retentionUntil, execution.error ?? null],
    );
  }

  async saveOfflineMutation(mutation: OfflineMutation) {
    await this.executor().query(
      `INSERT INTO mbambulaan.offline_mutations
       (id,device_id,identity_id,territory_id,aggregate_type,aggregate_id,command_type,client_sequence,base_version,payload,payload_hash,captured_at,received_at,status,conflict_reason,retry_count)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14,$15,$16)
       ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, conflict_reason=EXCLUDED.conflict_reason, retry_count=EXCLUDED.retry_count`,
      [mutation.id, mutation.deviceId, mutation.identityId, mutation.territoryId, mutation.aggregateType, mutation.aggregateId, mutation.commandType, mutation.clientSequence, mutation.baseVersion ?? null, JSON.stringify(mutation.payload), mutation.payloadHash, mutation.capturedAt, mutation.receivedAt ?? null, mutation.status, mutation.conflictReason ?? null, mutation.retryCount],
    );
  }

  async findOfflineMutation(deviceId: EntityId, clientSequence: number) {
    const result = await this.executor().query<any>(`SELECT * FROM mbambulaan.offline_mutations WHERE device_id=$1 AND client_sequence=$2`, [deviceId, clientSequence]);
    const r = result.rows[0];
    return r ? {
      id: r.id, deviceId: r.device_id, identityId: r.identity_id, territoryId: r.territory_id, aggregateType: r.aggregate_type,
      aggregateId: r.aggregate_id, commandType: r.command_type, clientSequence: Number(r.client_sequence), baseVersion: r.base_version === null ? undefined : Number(r.base_version),
      payload: r.payload, payloadHash: r.payload_hash, capturedAt: r.captured_at, receivedAt: r.received_at, status: r.status,
      conflictReason: r.conflict_reason, retryCount: Number(r.retry_count),
    } as OfflineMutation : undefined;
  }
}
