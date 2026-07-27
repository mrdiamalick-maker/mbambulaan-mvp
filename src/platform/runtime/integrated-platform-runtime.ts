import { MbambulaanAtlas, type AtlasData, type AtlasQuestion } from "@/domain/infrastructures/atlas";
import { AtlasKnowledgeGraph, type KnowledgeGraphData } from "@/domain/infrastructures/atlas-knowledge-graph";
import { CapabilityMarketplace } from "@/domain/infrastructures/capability-marketplace";
import { CoordinationIntelligenceEngine } from "@/domain/infrastructures/coordination-intelligence-engine";
import { EcosystemDigitalTwin, type EcosystemDigitalTwinData } from "@/domain/infrastructures/ecosystem-digital-twin";
import { PlatformOperatingSystem, type PlatformOperatingSystemData } from "@/domain/infrastructures/platform-operating-system";
import { RevenueOperatingSystem } from "@/domain/infrastructures/revenue-operating-system";

export type RuntimeEventType =
  | "operational.flow.blocked"
  | "operational.flow.completed"
  | "atlas.question.requested";

export interface OperationalFlowPayload {
  flowId: string;
  flowKind: "physical" | "service" | "financial" | "information" | "authority" | "commitment";
  fromEntityId: string;
  fromLabel: string;
  toEntityId: string;
  toLabel: string;
  quantity?: number;
  unit?: "kg" | "xof" | "service_unit" | "document" | "event";
  valueXof?: number;
}

export interface AtlasQuestionPayload {
  questionId: string;
  workspaceId: string;
  askedByActorId: string;
  question: string;
  decisionDomain: AtlasQuestion["decisionDomain"];
  horizon: AtlasQuestion["horizon"];
}

interface RuntimeEventPayloadMap {
  "operational.flow.blocked": OperationalFlowPayload;
  "operational.flow.completed": OperationalFlowPayload;
  "atlas.question.requested": AtlasQuestionPayload;
}

interface RuntimeEventBase {
  id: string;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  tenantId: string;
  territoryId: string;
}

export type RuntimeEvent<TType extends RuntimeEventType = RuntimeEventType> = {
  [K in TType]: RuntimeEventBase & {
    type: K;
    payload: RuntimeEventPayloadMap[K];
  };
}[TType];

export interface RuntimeAuditRecord {
  id: string;
  eventId: string;
  eventType: RuntimeEventType;
  status: "accepted" | "processed" | "failed" | "ignored_duplicate";
  occurredAt: string;
  processedAt?: string;
  details?: string;
}

interface OutboxRecord {
  event: RuntimeEvent;
  status: "pending" | "processing" | "processed" | "failed";
  attempts: number;
  lastError?: string;
}

export interface IntegratedRuntimeSnapshot {
  running: boolean;
  pendingEvents: number;
  failedEvents: number;
  processedEventIds: string[];
  audit: RuntimeAuditRecord[];
  digitalTwin: EcosystemDigitalTwinData;
  atlas: AtlasData;
  knowledgeGraph: KnowledgeGraphData;
  platform: PlatformOperatingSystemData;
}

export class IntegratedPlatformRuntime {
  readonly digitalTwin = new EcosystemDigitalTwin();
  readonly coordination = new CoordinationIntelligenceEngine();
  readonly marketplace = new CapabilityMarketplace();
  readonly platform = new PlatformOperatingSystem();
  readonly revenue = new RevenueOperatingSystem();
  readonly atlas = new MbambulaanAtlas();
  readonly knowledgeGraph = new AtlasKnowledgeGraph();

  private running = false;
  private readonly outbox: OutboxRecord[] = [];
  private readonly processedEventIds = new Set<string>();
  private readonly audit: RuntimeAuditRecord[] = [];

  start(startedAt: string) {
    if (this.running) return this.snapshot();
    this.running = true;
    this.ensureAtlasWorkspace(startedAt);
    return this.snapshot();
  }

  stop() {
    this.running = false;
    return this.snapshot();
  }

  publish<TType extends RuntimeEventType>(event: RuntimeEvent<TType>) {
    if (!this.running) throw new Error("Le runtime Mbàmbulaan doit être démarré avant publication.");
    if (this.processedEventIds.has(event.id) || this.outbox.some((item) => item.event.id === event.id)) {
      this.audit.push({
        id: `audit-duplicate-${event.id}-${this.audit.length + 1}`,
        eventId: event.id,
        eventType: event.type,
        status: "ignored_duplicate",
        occurredAt: event.occurredAt,
      });
      return false;
    }
    this.outbox.push({ event: structuredClone(event) as RuntimeEvent, status: "pending", attempts: 0 });
    this.audit.push({
      id: `audit-accepted-${event.id}`,
      eventId: event.id,
      eventType: event.type,
      status: "accepted",
      occurredAt: event.occurredAt,
    });
    return true;
  }

  async drain(processedAt: string) {
    if (!this.running) throw new Error("Le runtime Mbàmbulaan n'est pas démarré.");
    for (const record of this.outbox.filter((item) => item.status === "pending" || item.status === "failed")) {
      record.status = "processing";
      record.attempts += 1;
      try {
        this.handle(record.event, processedAt);
        record.status = "processed";
        this.processedEventIds.add(record.event.id);
        this.audit.push({
          id: `audit-processed-${record.event.id}`,
          eventId: record.event.id,
          eventType: record.event.type,
          status: "processed",
          occurredAt: record.event.occurredAt,
          processedAt,
        });
      } catch (error) {
        record.status = "failed";
        record.lastError = error instanceof Error ? error.message : String(error);
        this.audit.push({
          id: `audit-failed-${record.event.id}-${record.attempts}`,
          eventId: record.event.id,
          eventType: record.event.type,
          status: "failed",
          occurredAt: record.event.occurredAt,
          processedAt,
          details: record.lastError,
        });
      }
    }
    return this.snapshot();
  }

  snapshot(): IntegratedRuntimeSnapshot {
    return {
      running: this.running,
      pendingEvents: this.outbox.filter((item) => item.status === "pending" || item.status === "processing").length,
      failedEvents: this.outbox.filter((item) => item.status === "failed").length,
      processedEventIds: Array.from(this.processedEventIds),
      audit: structuredClone(this.audit),
      digitalTwin: this.digitalTwin.snapshot(),
      atlas: this.atlas.snapshot(),
      knowledgeGraph: this.knowledgeGraph.snapshot(),
      platform: this.platform.snapshot(),
    };
  }

  private handle(event: RuntimeEvent, processedAt: string) {
    if (event.type === "operational.flow.blocked" || event.type === "operational.flow.completed") {
      this.projectOperationalFlow(event, processedAt);
      return;
    }
    if (event.type === "atlas.question.requested") {
      this.answerAtlasQuestion(event, processedAt);
      return;
    }
    const exhaustive: never = event;
    throw new Error(`Type d'événement non pris en charge : ${JSON.stringify(exhaustive)}`);
  }

  private projectOperationalFlow(
    event: RuntimeEvent<"operational.flow.blocked" | "operational.flow.completed">,
    processedAt: string,
  ) {
    const payload = event.payload;
    const fromNodeId = `twin-${payload.fromEntityId}`;
    const toNodeId = `twin-${payload.toEntityId}`;
    this.digitalTwin.upsertNode({
      id: fromNodeId,
      kind: "organization",
      sourceEntityId: payload.fromEntityId,
      label: payload.fromLabel,
      territoryId: event.territoryId,
      status: "active",
      attributes: { tenantId: event.tenantId },
      observedAt: event.occurredAt,
    });
    this.digitalTwin.upsertNode({
      id: toNodeId,
      kind: "infrastructure",
      sourceEntityId: payload.toEntityId,
      label: payload.toLabel,
      territoryId: event.territoryId,
      status: event.type === "operational.flow.blocked" ? "at_risk" : "active",
      attributes: { tenantId: event.tenantId },
      observedAt: event.occurredAt,
    });
    this.digitalTwin.registerFlow({
      id: payload.flowId,
      kind: payload.flowKind,
      fromNodeId,
      toNodeId,
      quantity: payload.quantity,
      unit: payload.unit,
      valueXof: payload.valueXof,
      startedAt: event.occurredAt,
      completedAt: event.type === "operational.flow.completed" ? processedAt : undefined,
      status: event.type === "operational.flow.blocked" ? "blocked" : "completed",
      sourceEntityIds: [payload.fromEntityId, payload.toEntityId],
    });
    const signals = this.digitalTwin.detectSignals(processedAt);
    this.digitalTwin.createSnapshot(`snapshot-${event.id}`, processedAt, [event.territoryId]);
    if (signals.length > 0) {
      this.knowledgeGraph.ingestEvidence(signals.map((signal) => ({
        id: `runtime-${signal.id}`,
        sourceType: "twin_signal" as const,
        sourceEntityId: signal.id,
        title: signal.description,
        summary: signal.description,
        observedAt: signal.detectedAt,
        reliabilityScore: 90,
        freshnessScore: 100,
      })));
    }
  }

  private answerAtlasQuestion(event: RuntimeEvent<"atlas.question.requested">, processedAt: string) {
    const payload = event.payload;
    const result = this.atlas.ask({
      id: payload.questionId,
      workspaceId: payload.workspaceId,
      askedByActorId: payload.askedByActorId,
      askedAt: event.occurredAt,
      question: payload.question,
      decisionDomain: payload.decisionDomain,
      territoryIds: [event.territoryId],
      horizon: payload.horizon,
    }, this.atlasSources(), processedAt);
    this.knowledgeGraph.ingestEvidence(result.evidence);
  }

  private atlasSources() {
    return {
      digitalTwin: this.digitalTwin.snapshot(),
      coordination: this.coordination.snapshot(),
      marketplace: this.marketplace.snapshot(),
      platform: this.platform.snapshot(),
      revenue: this.revenue.snapshot(),
    };
  }

  private ensureAtlasWorkspace(createdAt: string) {
    if (this.atlas.snapshot().workspaces.some((item) => item.id === "atlas-national-operations")) return;
    this.atlas.createWorkspace({
      id: "atlas-national-operations",
      tenantId: "tenant-national",
      name: "Atlas — Opérations nationales",
      clientSegment: "government",
      territoryIds: [],
      decisionDomains: ["ecosystem_coordination", "operational_resilience", "supply_security"],
      capabilityCodes: ["digital_twin", "coordination_intelligence", "decision_support"],
      status: "active",
      createdAt,
    });
  }
}
