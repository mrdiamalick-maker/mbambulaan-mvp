import type { EntityId, ISODateTime } from "./types";
import type { AtlasDecisionDomain, AtlasEvidence } from "./atlas";

export type KnowledgeNodeKind =
  | "actor"
  | "organization"
  | "territory"
  | "infrastructure"
  | "program"
  | "capability"
  | "flow"
  | "signal"
  | "decision"
  | "outcome"
  | "funding"
  | "policy";

export interface KnowledgeNode {
  id: EntityId;
  kind: KnowledgeNodeKind;
  sourceEntityId: EntityId;
  label: string;
  territoryIds: EntityId[];
  attributes: Record<string, string | number | boolean | null>;
  confidenceScore: number;
  observedAt?: ISODateTime;
}

export interface KnowledgeEdge {
  id: EntityId;
  fromNodeId: EntityId;
  toNodeId: EntityId;
  relation:
    | "belongs_to"
    | "operates_in"
    | "depends_on"
    | "funds"
    | "delivers"
    | "affects"
    | "causes"
    | "mitigates"
    | "governs"
    | "consumes"
    | "produces"
    | "supports"
    | "contradicts";
  weight: number;
  evidenceIds: EntityId[];
  validFrom?: ISODateTime;
  validUntil?: ISODateTime;
}

export interface CausalPath {
  id: EntityId;
  decisionDomain: AtlasDecisionDomain;
  nodeIds: EntityId[];
  edgeIds: EntityId[];
  explanation: string;
  confidenceScore: number;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  causalPaths: CausalPath[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class AtlasKnowledgeGraph {
  private state: KnowledgeGraphData = {
    nodes: [],
    edges: [],
    causalPaths: [],
  };

  upsertNode(node: KnowledgeNode) {
    const index = this.state.nodes.findIndex((item) => item.id === node.id);
    if (index >= 0) this.state.nodes[index] = clone(node);
    else this.state.nodes.push(clone(node));
    return clone(node);
  }

  connect(edge: KnowledgeEdge) {
    if (this.state.edges.some((item) => item.id === edge.id)) {
      throw new Error(`La relation ${edge.id} existe déjà.`);
    }
    if (!this.state.nodes.some((item) => item.id === edge.fromNodeId)) {
      throw new Error(`Le nœud source ${edge.fromNodeId} est introuvable.`);
    }
    if (!this.state.nodes.some((item) => item.id === edge.toNodeId)) {
      throw new Error(`Le nœud cible ${edge.toNodeId} est introuvable.`);
    }
    this.state.edges.push(clone(edge));
    return clone(edge);
  }

  ingestEvidence(evidence: AtlasEvidence[]) {
    for (const item of evidence) {
      const node: KnowledgeNode = {
        id: `knowledge-${item.id}`,
        kind: item.sourceType === "twin_signal" ? "signal" : "decision",
        sourceEntityId: item.sourceEntityId,
        label: item.title,
        territoryIds: [],
        attributes: {
          summary: item.summary,
          sourceType: item.sourceType,
          freshnessScore: item.freshnessScore,
        },
        confidenceScore: item.reliabilityScore,
        observedAt: item.observedAt,
      };
      this.upsertNode(node);
    }
    return this.snapshot();
  }

  findRelatedNodes(nodeId: EntityId, maxDepth = 2): KnowledgeNode[] {
    const visited = new Set<EntityId>([nodeId]);
    let frontier = [nodeId];

    for (let depth = 0; depth < maxDepth; depth += 1) {
      const next: EntityId[] = [];
      for (const current of frontier) {
        for (const edge of this.state.edges) {
          const related = edge.fromNodeId === current
            ? edge.toNodeId
            : edge.toNodeId === current
              ? edge.fromNodeId
              : undefined;
          if (related && !visited.has(related)) {
            visited.add(related);
            next.push(related);
          }
        }
      }
      frontier = next;
      if (frontier.length === 0) break;
    }

    return clone(this.state.nodes.filter((item) => visited.has(item.id) && item.id !== nodeId));
  }

  explainPath(input: {
    id: EntityId;
    fromNodeId: EntityId;
    toNodeId: EntityId;
    decisionDomain: AtlasDecisionDomain;
  }): CausalPath {
    const queue: Array<{ nodeId: EntityId; nodeIds: EntityId[]; edgeIds: EntityId[] }> = [
      { nodeId: input.fromNodeId, nodeIds: [input.fromNodeId], edgeIds: [] },
    ];
    const visited = new Set<EntityId>();

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) break;
      if (current.nodeId === input.toNodeId) {
        const edges = this.state.edges.filter((edge) => current.edgeIds.includes(edge.id));
        const confidenceScore = edges.length === 0
          ? 0
          : Math.round(edges.reduce((sum, edge) => sum + edge.weight, 0) / edges.length);
        const path: CausalPath = {
          id: input.id,
          decisionDomain: input.decisionDomain,
          nodeIds: current.nodeIds,
          edgeIds: current.edgeIds,
          explanation: this.buildExplanation(current.nodeIds, current.edgeIds),
          confidenceScore,
        };
        this.state.causalPaths.push(clone(path));
        return clone(path);
      }
      if (visited.has(current.nodeId)) continue;
      visited.add(current.nodeId);

      for (const edge of this.state.edges) {
        if (edge.fromNodeId !== current.nodeId) continue;
        queue.push({
          nodeId: edge.toNodeId,
          nodeIds: [...current.nodeIds, edge.toNodeId],
          edgeIds: [...current.edgeIds, edge.id],
        });
      }
    }

    throw new Error("Aucun chemin causal n'a été trouvé.");
  }

  snapshot(): KnowledgeGraphData {
    return clone(this.state);
  }

  private buildExplanation(nodeIds: EntityId[], edgeIds: EntityId[]): string {
    const labels = nodeIds.map(
      (id) => this.state.nodes.find((node) => node.id === id)?.label ?? id,
    );
    const relations = edgeIds.map(
      (id) => this.state.edges.find((edge) => edge.id === id)?.relation ?? "relates_to",
    );
    return labels.reduce((text, label, index) => {
      if (index === 0) return label;
      return `${text} --${relations[index - 1]}--> ${label}`;
    }, "");
  }
}
