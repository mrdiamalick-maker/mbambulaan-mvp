import type {
  Capacity,
  EntityId,
  ServiceNeedPriority,
  TensionType,
} from "./types";
import type {
  CoordinationDecision,
  CoordinationDecisionStatus,
} from "./coordinationEngine";

export type CoordinationRecommendationType =
  | "reserve_capacity"
  | "monitor_execution"
  | "report_tension"
  | "no_action";

export interface CoordinationRecommendation {
  serviceNeedId: EntityId;
  type: CoordinationRecommendationType;
  priority: ServiceNeedPriority;
  status: CoordinationDecisionStatus;
  remainingQuantity: number;
  capacityId?: EntityId;
  recommendedTensionType?: TensionType;
  reason: string;
}

function sortCapacities(capacities: Capacity[]): Capacity[] {
  return [...capacities].sort((left, right) => {
    if (left.availableQuantity !== right.availableQuantity) {
      return right.availableQuantity - left.availableQuantity;
    }

    return Date.parse(left.availableFrom) - Date.parse(right.availableFrom);
  });
}

function getPriorityWeight(priority: ServiceNeedPriority): number {
  switch (priority) {
    case "critical":
      return 3;
    case "urgent":
      return 2;
    case "normal":
      return 1;
  }
}

function getRecommendationWeight(
  type: CoordinationRecommendationType,
): number {
  switch (type) {
    case "report_tension":
      return 4;
    case "reserve_capacity":
      return 3;
    case "monitor_execution":
      return 2;
    case "no_action":
      return 1;
  }
}

export function buildCoordinationRecommendation(
  decision: CoordinationDecision,
): CoordinationRecommendation {
  const base = {
    serviceNeedId: decision.serviceNeed.id,
    priority: decision.serviceNeed.priority,
    status: decision.status,
    remainingQuantity: decision.remainingQuantity,
  };

  switch (decision.status) {
    case "fulfilled":
      return {
        ...base,
        type: "no_action",
        reason: "Le besoin est entièrement couvert et exécuté.",
      };

    case "partially_covered":
      return {
        ...base,
        type: "monitor_execution",
        reason:
          "La capacité est déjà allouée ; l'exécution restante doit être suivie.",
      };

    case "capacity_available": {
      const [capacity] = sortCapacities(decision.compatibleCapacities);

      return {
        ...base,
        type: "reserve_capacity",
        capacityId: capacity?.id,
        reason:
          "Une capacité compatible est disponible pour couvrir tout ou partie du besoin.",
      };
    }

    case "tension_required":
      return {
        ...base,
        type: "report_tension",
        recommendedTensionType: decision.recommendedTensionType,
        reason:
          decision.existingTensions.length > 0
            ? "Aucune capacité compatible n'est disponible et une tension existe déjà."
            : "Aucune capacité compatible n'est disponible ; une tension doit être signalée.",
      };
  }
}

export function prioritizeCoordinationRecommendations(
  decisions: CoordinationDecision[],
): CoordinationRecommendation[] {
  return decisions
    .map(buildCoordinationRecommendation)
    .sort((left, right) => {
      const recommendationDifference =
        getRecommendationWeight(right.type) -
        getRecommendationWeight(left.type);

      if (recommendationDifference !== 0) {
        return recommendationDifference;
      }

      const priorityDifference =
        getPriorityWeight(right.priority) - getPriorityWeight(left.priority);

      if (priorityDifference !== 0) {
        return priorityDifference;
      }

      return right.remainingQuantity - left.remainingQuantity;
    });
}
