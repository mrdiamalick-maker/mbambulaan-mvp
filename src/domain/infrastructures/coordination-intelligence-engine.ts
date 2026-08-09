import type { EntityId, ISODateTime } from "./types";

export type CoordinationObjective =
  | "minimize_delay"
  | "maximize_service_coverage"
  | "maximize_value_captured"
  | "reduce_loss"
  | "balance_territories"
  | "prioritize_vulnerable_actors"
  | "respect_sla";

export interface CoordinationDemand {
  id: EntityId;
  actorId?: EntityId;
  organizationId?: EntityId;
  territoryId: EntityId;
  capabilityCode: string;
  requestedAt: ISODateTime;
  dueAt?: ISODateTime;
  quantity?: number;
  priority: "low" | "normal" | "high" | "critical";
  constraints: string[];
}

export interface CoordinationSupply {
  id: EntityId;
  providerOrganizationId: EntityId;
  territoryIds: EntityId[];
  capabilityCodes: string[];
  availableFrom: ISODateTime;
  availableUntil?: ISODateTime;
  capacity: number;
  unitCostXof?: number;
  trustScore?: number;
  slaHours?: number;
}

export interface CoordinationRecommendation {
  id: EntityId;
  demandId: EntityId;
  supplyId: EntityId;
  providerOrganizationId: EntityId;
  score: number;
  expectedDelayHours?: number;
  expectedCostXof?: number;
  reasons: string[];
  generatedAt: ISODateTime;
}

export interface CoordinationDecision {
  id: EntityId;
  demandId: EntityId;
  recommendationId: EntityId;
  decidedByActorId: EntityId;
  decidedAt: ISODateTime;
  status: "accepted" | "rejected" | "overridden";
  overrideReason?: string;
}

export interface CoordinationIntelligenceData {
  demands: CoordinationDemand[];
  supplies: CoordinationSupply[];
  recommendations: CoordinationRecommendation[];
  decisions: CoordinationDecision[];
}

export class CoordinationIntelligenceEngine {
  private state: CoordinationIntelligenceData = {
    demands: [],
    supplies: [],
    recommendations: [],
    decisions: [],
  };

  registerDemand(demand: CoordinationDemand) {
    if (this.state.demands.some((item) => item.id === demand.id)) {
      throw new Error(`La demande ${demand.id} existe déjà.`);
    }
    this.state.demands.push(structuredClone(demand));
    return structuredClone(demand);
  }

  registerSupply(supply: CoordinationSupply) {
    if (this.state.supplies.some((item) => item.id === supply.id)) {
      throw new Error(`L'offre de capacité ${supply.id} existe déjà.`);
    }
    this.state.supplies.push(structuredClone(supply));
    return structuredClone(supply);
  }

  recommend(
    demandId: EntityId,
    objective: CoordinationObjective,
    generatedAt: ISODateTime,
  ): CoordinationRecommendation[] {
    const demand = this.state.demands.find((item) => item.id === demandId);
    if (!demand) throw new Error(`La demande ${demandId} est introuvable.`);

    const candidates = this.state.supplies.filter((supply) =>
      supply.capabilityCodes.includes(demand.capabilityCode) &&
      supply.territoryIds.includes(demand.territoryId) &&
      supply.capacity >= (demand.quantity ?? 1),
    );

    const recommendations = candidates
      .map((supply) => {
        const trust = supply.trustScore ?? 50;
        const slaBonus = supply.slaHours ? Math.max(0, 100 - supply.slaHours) : 20;
        const costPenalty = supply.unitCostXof ? Math.min(40, supply.unitCostXof / 10_000) : 0;
        const priorityBoost = demand.priority === "critical" ? 20 : demand.priority === "high" ? 10 : 0;

        let score = trust + slaBonus + priorityBoost - costPenalty;
        const reasons = [
          "capability compatible",
          "territoire couvert",
          "capacité disponible",
        ];

        if (objective === "maximize_value_captured" && supply.unitCostXof) {
          score -= costPenalty;
          reasons.push("coût pris en compte");
        }
        if (objective === "respect_sla" && supply.slaHours) {
          score += slaBonus;
          reasons.push("SLA priorisé");
        }
        if (objective === "prioritize_vulnerable_actors") {
          score += priorityBoost;
          reasons.push("priorité sociale appliquée");
        }

        return {
          id: `recommendation-${demand.id}-${supply.id}`,
          demandId: demand.id,
          supplyId: supply.id,
          providerOrganizationId: supply.providerOrganizationId,
          score,
          expectedDelayHours: supply.slaHours,
          expectedCostXof: supply.unitCostXof
            ? supply.unitCostXof * (demand.quantity ?? 1)
            : undefined,
          reasons,
          generatedAt,
        } satisfies CoordinationRecommendation;
      })
      .sort((a, b) => b.score - a.score);

    this.state.recommendations.push(...structuredClone(recommendations));
    return structuredClone(recommendations);
  }

  recordDecision(decision: CoordinationDecision) {
    const recommendation = this.state.recommendations.find(
      (item) => item.id === decision.recommendationId,
    );
    if (!recommendation) {
      throw new Error(`La recommandation ${decision.recommendationId} est introuvable.`);
    }
    if (recommendation.demandId !== decision.demandId) {
      throw new Error("La décision ne correspond pas à la demande recommandée.");
    }
    this.state.decisions.push(structuredClone(decision));
    return structuredClone(decision);
  }

  snapshot(): CoordinationIntelligenceData {
    return structuredClone(this.state);
  }
}
