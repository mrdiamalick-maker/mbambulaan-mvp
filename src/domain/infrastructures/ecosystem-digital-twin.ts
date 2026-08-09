import type { EntityId, ISODateTime } from "./types";

export type TwinNodeKind =
  | "actor"
  | "organization"
  | "territory"
  | "landing_site"
  | "vessel"
  | "infrastructure"
  | "program"
  | "service"
  | "lot"
  | "financial_account"
  | "integration_endpoint";

export type TwinFlowKind =
  | "physical"
  | "service"
  | "financial"
  | "information"
  | "authority"
  | "commitment";

export interface TwinNode {
  id: EntityId;
  kind: TwinNodeKind;
  sourceEntityId: EntityId;
  label: string;
  territoryId?: EntityId;
  status: "active" | "inactive" | "at_risk" | "unknown";
  attributes: Record<string, string | number | boolean | null>;
  observedAt: ISODateTime;
}

export interface TwinRelationship {
  id: EntityId;
  fromNodeId: EntityId;
  toNodeId: EntityId;
  relationType:
    | "belongs_to"
    | "operates_in"
    | "owns"
    | "serves"
    | "depends_on"
    | "funds"
    | "supplies"
    | "buys_from"
    | "integrates_with"
    | "governs";
  strength?: number;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
}

export interface TwinFlow {
  id: EntityId;
  kind: TwinFlowKind;
  fromNodeId: EntityId;
  toNodeId: EntityId;
  quantity?: number;
  unit?: "kg" | "xof" | "service_unit" | "document" | "event";
  valueXof?: number;
  startedAt: ISODateTime;
  completedAt?: ISODateTime;
  status: "planned" | "in_progress" | "completed" | "blocked" | "cancelled";
  sourceEntityIds: EntityId[];
}

export interface TwinSignal {
  id: EntityId;
  nodeId?: EntityId;
  flowId?: EntityId;
  signalType:
    | "capacity_shortage"
    | "service_delay"
    | "payment_delay"
    | "cold_chain_risk"
    | "trust_degradation"
    | "territorial_tension"
    | "data_quality_issue"
    | "opportunity";
  severity: "info" | "warning" | "critical";
  detectedAt: ISODateTime;
  description: string;
  sourceEntityIds: EntityId[];
  status: "open" | "acknowledged" | "resolved" | "dismissed";
}

export interface TwinSnapshot {
  id: EntityId;
  generatedAt: ISODateTime;
  territoryIds: EntityId[];
  nodeCount: number;
  relationshipCount: number;
  flowCount: number;
  openSignals: number;
  blockedFlows: number;
  estimatedPhysicalVolumeKg: number;
  estimatedFinancialValueXof: number;
}

export interface EcosystemDigitalTwinData {
  nodes: TwinNode[];
  relationships: TwinRelationship[];
  flows: TwinFlow[];
  signals: TwinSignal[];
  snapshots: TwinSnapshot[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertUniqueId<T extends { id: string }>(items: T[], id: string, label: string) {
  if (items.some((item) => item.id === id)) {
    throw new Error(`${label} ${id} existe déjà.`);
  }
}

export class EcosystemDigitalTwin {
  private state: EcosystemDigitalTwinData = {
    nodes: [],
    relationships: [],
    flows: [],
    signals: [],
    snapshots: [],
  };

  upsertNode(node: TwinNode) {
    const index = this.state.nodes.findIndex((item) => item.id === node.id);
    if (index >= 0) this.state.nodes[index] = clone(node);
    else this.state.nodes.push(clone(node));
    return clone(node);
  }

  registerRelationship(relationship: TwinRelationship) {
    assertUniqueId(this.state.relationships, relationship.id, "La relation");
    if (!this.state.nodes.some((item) => item.id === relationship.fromNodeId)) {
      throw new Error(`Le nœud source ${relationship.fromNodeId} est introuvable.`);
    }
    if (!this.state.nodes.some((item) => item.id === relationship.toNodeId)) {
      throw new Error(`Le nœud cible ${relationship.toNodeId} est introuvable.`);
    }
    this.state.relationships.push(clone(relationship));
    return clone(relationship);
  }

  registerFlow(flow: TwinFlow) {
    assertUniqueId(this.state.flows, flow.id, "Le flux");
    if (!this.state.nodes.some((item) => item.id === flow.fromNodeId)) {
      throw new Error(`Le nœud source ${flow.fromNodeId} est introuvable.`);
    }
    if (!this.state.nodes.some((item) => item.id === flow.toNodeId)) {
      throw new Error(`Le nœud cible ${flow.toNodeId} est introuvable.`);
    }
    this.state.flows.push(clone(flow));
    return clone(flow);
  }

  updateFlowStatus(flowId: EntityId, status: TwinFlow["status"], completedAt?: ISODateTime) {
    const flow = this.state.flows.find((item) => item.id === flowId);
    if (!flow) throw new Error(`Le flux ${flowId} est introuvable.`);
    flow.status = status;
    if (completedAt) flow.completedAt = completedAt;
    return clone(flow);
  }

  detectSignals(detectedAt: ISODateTime): TwinSignal[] {
    const generated: TwinSignal[] = [];

    for (const flow of this.state.flows) {
      if (flow.status === "blocked") {
        generated.push({
          id: `signal-blocked-${flow.id}`,
          flowId: flow.id,
          signalType: flow.kind === "financial" ? "payment_delay" : "service_delay",
          severity: "critical",
          detectedAt,
          description: `Le flux ${flow.id} est bloqué.`,
          sourceEntityIds: flow.sourceEntityIds,
          status: "open",
        });
      }
    }

    for (const node of this.state.nodes) {
      if (node.status === "at_risk") {
        generated.push({
          id: `signal-risk-${node.id}`,
          nodeId: node.id,
          signalType: node.kind === "infrastructure" ? "capacity_shortage" : "trust_degradation",
          severity: "warning",
          detectedAt,
          description: `Le nœud ${node.label} présente un risque opérationnel.`,
          sourceEntityIds: [node.sourceEntityId],
          status: "open",
        });
      }
    }

    const existingIds = new Set(this.state.signals.map((item) => item.id));
    const uniqueSignals = generated.filter((item) => !existingIds.has(item.id));
    this.state.signals.push(...clone(uniqueSignals));
    return clone(uniqueSignals);
  }

  createSnapshot(id: EntityId, generatedAt: ISODateTime, territoryIds: EntityId[]) {
    const scopedNodes = territoryIds.length === 0
      ? this.state.nodes
      : this.state.nodes.filter((node) => node.territoryId && territoryIds.includes(node.territoryId));
    const scopedNodeIds = new Set(scopedNodes.map((node) => node.id));
    const scopedRelationships = this.state.relationships.filter(
      (item) => scopedNodeIds.has(item.fromNodeId) || scopedNodeIds.has(item.toNodeId),
    );
    const scopedFlows = this.state.flows.filter(
      (item) => scopedNodeIds.has(item.fromNodeId) || scopedNodeIds.has(item.toNodeId),
    );
    const scopedSignals = this.state.signals.filter(
      (item) => item.status === "open" &&
        ((!item.nodeId || scopedNodeIds.has(item.nodeId)) ||
          (!item.flowId || scopedFlows.some((flow) => flow.id === item.flowId))),
    );

    const snapshot: TwinSnapshot = {
      id,
      generatedAt,
      territoryIds,
      nodeCount: scopedNodes.length,
      relationshipCount: scopedRelationships.length,
      flowCount: scopedFlows.length,
      openSignals: scopedSignals.length,
      blockedFlows: scopedFlows.filter((item) => item.status === "blocked").length,
      estimatedPhysicalVolumeKg: scopedFlows
        .filter((item) => item.kind === "physical" && item.unit === "kg")
        .reduce((sum, item) => sum + (item.quantity ?? 0), 0),
      estimatedFinancialValueXof: scopedFlows
        .filter((item) => item.kind === "financial")
        .reduce((sum, item) => sum + (item.valueXof ?? 0), 0),
    };

    this.state.snapshots.push(snapshot);
    return clone(snapshot);
  }

  snapshot(): EcosystemDigitalTwinData {
    return clone(this.state);
  }
}
