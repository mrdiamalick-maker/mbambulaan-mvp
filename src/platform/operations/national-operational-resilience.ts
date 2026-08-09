import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";

export type HealthStatus = "healthy" | "degraded" | "unavailable";
export type IncidentSeverity = "sev1" | "sev2" | "sev3" | "sev4";
export type IncidentStatus = "open" | "acknowledged" | "mitigating" | "monitoring" | "resolved" | "closed";
export type BackupStatus = "scheduled" | "running" | "completed" | "failed" | "verified";
export type SyncStatus = "pending" | "syncing" | "applied" | "conflict" | "rejected" | "dead_lettered";

export interface HealthSignal {
  id: EntityId;
  component: string;
  territoryId?: EntityId;
  status: HealthStatus;
  latencyMs?: number;
  checkedAt: ISODateTime;
  detail?: string;
  dependencySignals: Array<{ component: string; status: HealthStatus }>;
}

export interface MetricPoint {
  id: EntityId;
  metricName: string;
  value: number;
  unit: "count" | "milliseconds" | "percent" | "bytes" | "seconds";
  territoryId?: EntityId;
  labels: Record<string, string>;
  occurredAt: ISODateTime;
}

export interface TraceSpan {
  id: EntityId;
  traceId: EntityId;
  parentSpanId?: EntityId;
  operation: string;
  component: string;
  territoryId?: EntityId;
  startedAt: ISODateTime;
  endedAt: ISODateTime;
  status: "ok" | "error";
  attributes: Record<string, string>;
}

export interface ServiceLevelObjective {
  code: string;
  serviceName: string;
  territoryId?: EntityId;
  objectiveType: "availability" | "latency" | "success_rate" | "freshness";
  target: number;
  measurementWindowMinutes: number;
  errorBudgetPercent: number;
  status: "active" | "paused" | "retired";
}

export interface SloEvaluation {
  id: EntityId;
  sloCode: string;
  territoryId?: EntityId;
  measuredValue: number;
  target: number;
  compliant: boolean;
  errorBudgetConsumedPercent: number;
  windowStartedAt: ISODateTime;
  windowEndedAt: ISODateTime;
  evaluatedAt: ISODateTime;
}

export interface OperationalIncident {
  id: EntityId;
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  serviceName: string;
  territoryIds: EntityId[];
  detectedAt: ISODateTime;
  acknowledgedAt?: ISODateTime;
  mitigatedAt?: ISODateTime;
  resolvedAt?: ISODateTime;
  commanderIdentityId?: EntityId;
  runbookCode: string;
  correlationIds: EntityId[];
  impact: string;
  rootCause?: string;
  correctiveActions: string[];
}

export interface BackupExecution {
  id: EntityId;
  backupType: "full" | "incremental" | "point_in_time";
  databaseName: string;
  regionCode: string;
  storageLocation: string;
  status: BackupStatus;
  startedAt: ISODateTime;
  completedAt?: ISODateTime;
  sizeBytes?: number;
  checksum?: string;
  restoreTestedAt?: ISODateTime;
  retentionUntil: ISODateTime;
  error?: string;
}

export interface DegradedModePolicy {
  code: string;
  serviceName: string;
  triggerComponents: string[];
  allowedCommands: string[];
  blockedCommands: string[];
  fallbackReadModel: string;
  maximumDurationMinutes: number;
}

export interface OfflineMutation {
  id: EntityId;
  deviceId: EntityId;
  identityId: EntityId;
  territoryId: EntityId;
  aggregateType: string;
  aggregateId: EntityId;
  commandType: string;
  clientSequence: number;
  baseVersion?: number;
  payload: Record<string, unknown>;
  payloadHash: string;
  capturedAt: ISODateTime;
  receivedAt?: ISODateTime;
  status: SyncStatus;
  conflictReason?: string;
  retryCount: number;
}

export interface OperationsRepository {
  saveHealth(signal: HealthSignal): Promise<void>;
  saveMetric(point: MetricPoint): Promise<void>;
  saveTrace(span: TraceSpan): Promise<void>;
  getSlo(code: string): Promise<ServiceLevelObjective | undefined>;
  listMetricPoints(metricName: string, territoryId: EntityId | undefined, from: ISODateTime, to: ISODateTime): Promise<MetricPoint[]>;
  saveSloEvaluation(evaluation: SloEvaluation): Promise<void>;
  saveIncident(incident: OperationalIncident): Promise<void>;
  getIncident(id: EntityId): Promise<OperationalIncident | undefined>;
  saveBackup(execution: BackupExecution): Promise<void>;
  saveOfflineMutation(mutation: OfflineMutation): Promise<void>;
  findOfflineMutation(deviceId: EntityId, clientSequence: number): Promise<OfflineMutation | undefined>;
}

export interface ComponentProbe {
  check(): Promise<{ status: HealthStatus; latencyMs?: number; detail?: string; dependencies?: Array<{ component: string; status: HealthStatus }> }>;
}

export interface OfflineCommandExecutor {
  execute(mutation: OfflineMutation): Promise<{ aggregateVersion?: number }>;
}

export interface OperationsClock { now(): ISODateTime; }
export interface OperationsIds { next(prefix: string): EntityId; }

export class NationalObservabilityService {
  constructor(
    private readonly repository: OperationsRepository,
    private readonly probes: Record<string, ComponentProbe>,
    private readonly clock: OperationsClock,
    private readonly ids: OperationsIds,
  ) {}

  async checkComponent(component: string, territoryId?: EntityId) {
    const probe = this.probes[component];
    if (!probe) throw new Error(`Aucune sonde configurée pour ${component}.`);
    const result = await probe.check();
    const signal: HealthSignal = {
      id: this.ids.next("health"),
      component,
      territoryId,
      status: result.status,
      latencyMs: result.latencyMs,
      checkedAt: this.clock.now(),
      detail: result.detail,
      dependencySignals: result.dependencies ?? [],
    };
    await this.repository.saveHealth(signal);
    if (result.latencyMs !== undefined) {
      await this.recordMetric({ metricName: "component_latency_ms", value: result.latencyMs, unit: "milliseconds", territoryId, labels: { component } });
    }
    await this.recordMetric({ metricName: "component_availability", value: result.status === "healthy" ? 100 : result.status === "degraded" ? 50 : 0, unit: "percent", territoryId, labels: { component } });
    return structuredClone(signal);
  }

  async recordMetric(input: Omit<MetricPoint, "id" | "occurredAt">) {
    const point: MetricPoint = { id: this.ids.next("metric"), ...input, occurredAt: this.clock.now() };
    await this.repository.saveMetric(point);
    return structuredClone(point);
  }

  async recordTrace(input: Omit<TraceSpan, "id">) {
    if (Date.parse(input.endedAt) < Date.parse(input.startedAt)) throw new Error("La trace se termine avant son début.");
    const span: TraceSpan = { id: this.ids.next("span"), ...input };
    await this.repository.saveTrace(span);
    return structuredClone(span);
  }

  async evaluateSlo(code: string, windowEndedAt = this.clock.now()) {
    const slo = await this.repository.getSlo(code);
    if (!slo || slo.status !== "active") throw new Error("Le SLO est absent ou inactif.");
    const windowStartedAt = new Date(Date.parse(windowEndedAt) - slo.measurementWindowMinutes * 60_000).toISOString() as ISODateTime;
    const metricName = this.metricFor(slo.objectiveType);
    const points = await this.repository.listMetricPoints(metricName, slo.territoryId, windowStartedAt, windowEndedAt);
    if (!points.length) throw new Error("Aucune métrique disponible pour évaluer le SLO.");
    const measuredValue = points.reduce((sum, point) => sum + point.value, 0) / points.length;
    const compliant = slo.objectiveType === "latency" ? measuredValue <= slo.target : measuredValue >= slo.target;
    const deviation = slo.objectiveType === "latency" ? Math.max(0, measuredValue - slo.target) / Math.max(1, slo.target) : Math.max(0, slo.target - measuredValue) / Math.max(1, 100 - slo.target);
    const evaluation: SloEvaluation = {
      id: this.ids.next("slo-evaluation"),
      sloCode: slo.code,
      territoryId: slo.territoryId,
      measuredValue,
      target: slo.target,
      compliant,
      errorBudgetConsumedPercent: Math.min(100, deviation * 100 / Math.max(0.01, slo.errorBudgetPercent)),
      windowStartedAt,
      windowEndedAt,
      evaluatedAt: this.clock.now(),
    };
    await this.repository.saveSloEvaluation(evaluation);
    return structuredClone(evaluation);
  }

  private metricFor(type: ServiceLevelObjective["objectiveType"]) {
    if (type === "availability") return "component_availability";
    if (type === "latency") return "component_latency_ms";
    if (type === "success_rate") return "request_success_rate";
    return "data_freshness_seconds";
  }
}

export class IncidentManager {
  constructor(private readonly repository: OperationsRepository, private readonly clock: OperationsClock, private readonly ids: OperationsIds) {}

  async open(input: Omit<OperationalIncident, "id" | "status" | "detectedAt" | "correctiveActions">) {
    if (!input.territoryIds.length && input.severity !== "sev1") throw new Error("Un incident non national doit être territorialisé.");
    const incident: OperationalIncident = {
      id: this.ids.next("incident"),
      ...input,
      territoryIds: [...new Set(input.territoryIds)],
      status: "open",
      detectedAt: this.clock.now(),
      correctiveActions: [],
    };
    await this.repository.saveIncident(incident);
    return structuredClone(incident);
  }

  async acknowledge(id: EntityId, commanderIdentityId: EntityId) {
    const incident = await this.requireIncident(id);
    incident.status = "acknowledged";
    incident.commanderIdentityId = commanderIdentityId;
    incident.acknowledgedAt = this.clock.now();
    await this.repository.saveIncident(incident);
    return structuredClone(incident);
  }

  async resolve(id: EntityId, rootCause: string, correctiveActions: string[]) {
    const incident = await this.requireIncident(id);
    if (!rootCause.trim()) throw new Error("La cause racine est obligatoire.");
    incident.status = "resolved";
    incident.resolvedAt = this.clock.now();
    incident.rootCause = rootCause;
    incident.correctiveActions = [...correctiveActions];
    await this.repository.saveIncident(incident);
    return structuredClone(incident);
  }

  private async requireIncident(id: EntityId) {
    const incident = await this.repository.getIncident(id);
    if (!incident) throw new Error("Incident introuvable.");
    return incident;
  }
}

export class BackupContinuityService {
  constructor(private readonly repository: OperationsRepository, private readonly clock: OperationsClock, private readonly ids: OperationsIds) {}

  async schedule(input: { backupType: BackupExecution["backupType"]; databaseName: string; regionCode: string; storageLocation: string; retentionDays: number }) {
    if (input.retentionDays < 1) throw new Error("La rétention de sauvegarde doit être positive.");
    const backup: BackupExecution = {
      id: this.ids.next("backup"),
      backupType: input.backupType,
      databaseName: input.databaseName,
      regionCode: input.regionCode,
      storageLocation: input.storageLocation,
      status: "scheduled",
      startedAt: this.clock.now(),
      retentionUntil: new Date(Date.parse(this.clock.now()) + input.retentionDays * 86_400_000).toISOString() as ISODateTime,
    };
    await this.repository.saveBackup(backup);
    return structuredClone(backup);
  }

  async markCompleted(backup: BackupExecution, input: { sizeBytes: number; checksum: string }) {
    if (!/^[a-f0-9]{64}$/i.test(input.checksum)) throw new Error("Le checksum de sauvegarde est invalide.");
    backup.status = "completed";
    backup.completedAt = this.clock.now();
    backup.sizeBytes = input.sizeBytes;
    backup.checksum = input.checksum.toLowerCase();
    await this.repository.saveBackup(backup);
    return structuredClone(backup);
  }

  async markRestoreVerified(backup: BackupExecution) {
    if (backup.status !== "completed" && backup.status !== "verified") throw new Error("La sauvegarde doit être terminée avant le test de restauration.");
    backup.status = "verified";
    backup.restoreTestedAt = this.clock.now();
    await this.repository.saveBackup(backup);
    return structuredClone(backup);
  }
}

export class OfflineSyncService {
  constructor(
    private readonly repository: OperationsRepository,
    private readonly executor: OfflineCommandExecutor,
    private readonly clock: OperationsClock,
    private readonly ids: OperationsIds,
  ) {}

  async receive(input: Omit<OfflineMutation, "id" | "receivedAt" | "status" | "retryCount">) {
    const existing = await this.repository.findOfflineMutation(input.deviceId, input.clientSequence);
    if (existing) return structuredClone(existing);
    const mutation: OfflineMutation = {
      id: this.ids.next("offline-mutation"),
      ...input,
      receivedAt: this.clock.now(),
      status: "pending",
      retryCount: 0,
    };
    await this.repository.saveOfflineMutation(mutation);
    return structuredClone(mutation);
  }

  async synchronize(mutation: OfflineMutation) {
    if (["applied", "rejected", "dead_lettered"].includes(mutation.status)) return structuredClone(mutation);
    mutation.status = "syncing";
    await this.repository.saveOfflineMutation(mutation);
    try {
      await this.executor.execute(mutation);
      mutation.status = "applied";
      mutation.conflictReason = undefined;
    } catch (error) {
      mutation.retryCount += 1;
      const message = error instanceof Error ? error.message : "Erreur de synchronisation inconnue.";
      if (/version|conflit/i.test(message)) {
        mutation.status = "conflict";
        mutation.conflictReason = message;
      } else if (mutation.retryCount >= 5) {
        mutation.status = "dead_lettered";
        mutation.conflictReason = message;
      } else {
        mutation.status = "pending";
        mutation.conflictReason = message;
      }
    }
    await this.repository.saveOfflineMutation(mutation);
    return structuredClone(mutation);
  }
}

export class InMemoryOperationsRepository implements OperationsRepository {
  readonly health: HealthSignal[] = [];
  readonly metrics: MetricPoint[] = [];
  readonly traces: TraceSpan[] = [];
  readonly slos = new Map<string, ServiceLevelObjective>();
  readonly evaluations: SloEvaluation[] = [];
  readonly incidents = new Map<EntityId, OperationalIncident>();
  readonly backups = new Map<EntityId, BackupExecution>();
  readonly offlineMutations = new Map<EntityId, OfflineMutation>();

  async saveHealth(signal: HealthSignal) { this.health.push(structuredClone(signal)); }
  async saveMetric(point: MetricPoint) { this.metrics.push(structuredClone(point)); }
  async saveTrace(span: TraceSpan) { this.traces.push(structuredClone(span)); }
  async getSlo(code: string) { const item = this.slos.get(code); return item ? structuredClone(item) : undefined; }
  async listMetricPoints(metricName: string, territoryId: EntityId | undefined, from: ISODateTime, to: ISODateTime) { return structuredClone(this.metrics.filter((item) => item.metricName === metricName && item.territoryId === territoryId && Date.parse(item.occurredAt) >= Date.parse(from) && Date.parse(item.occurredAt) <= Date.parse(to))); }
  async saveSloEvaluation(evaluation: SloEvaluation) { this.evaluations.push(structuredClone(evaluation)); }
  async saveIncident(incident: OperationalIncident) { this.incidents.set(incident.id, structuredClone(incident)); }
  async getIncident(id: EntityId) { const item = this.incidents.get(id); return item ? structuredClone(item) : undefined; }
  async saveBackup(execution: BackupExecution) { this.backups.set(execution.id, structuredClone(execution)); }
  async saveOfflineMutation(mutation: OfflineMutation) { this.offlineMutations.set(mutation.id, structuredClone(mutation)); }
  async findOfflineMutation(deviceId: EntityId, clientSequence: number) { const item = [...this.offlineMutations.values()].find((mutation) => mutation.deviceId === deviceId && mutation.clientSequence === clientSequence); return item ? structuredClone(item) : undefined; }
}
