import { CoordinationEngine } from "./coordinationEngine";
import {
  prioritizeCoordinationRecommendations,
  type CoordinationRecommendation,
} from "./coordinationRecommendations";
import type {
  DomainData,
  EntityId,
  ServiceNeedPriority,
} from "./types";

export interface TerritoryCoordinationPlanSummary {
  totalNeeds: number;
  criticalNeeds: number;
  urgentNeeds: number;
  recommendationsToReserve: number;
  recommendationsToMonitor: number;
  recommendationsToReportTension: number;
}

export interface TerritoryCoordinationPlan {
  territoryId: EntityId;
  generatedAt: string;
  recommendations: CoordinationRecommendation[];
  summary: TerritoryCoordinationPlanSummary;
}

function countPriority(
  recommendations: CoordinationRecommendation[],
  priority: ServiceNeedPriority,
): number {
  return recommendations.filter(
    (recommendation) => recommendation.priority === priority,
  ).length;
}

export function buildTerritoryCoordinationPlan(
  data: DomainData,
  territoryId: EntityId,
  generatedAt: string,
  engine: CoordinationEngine = new CoordinationEngine(),
): TerritoryCoordinationPlan {
  const decisions = engine.assessTerritory(data, territoryId);
  const recommendations = prioritizeCoordinationRecommendations(decisions);

  return {
    territoryId,
    generatedAt,
    recommendations,
    summary: {
      totalNeeds: recommendations.length,
      criticalNeeds: countPriority(recommendations, "critical"),
      urgentNeeds: countPriority(recommendations, "urgent"),
      recommendationsToReserve: recommendations.filter(
        (recommendation) => recommendation.type === "reserve_capacity",
      ).length,
      recommendationsToMonitor: recommendations.filter(
        (recommendation) => recommendation.type === "monitor_execution",
      ).length,
      recommendationsToReportTension: recommendations.filter(
        (recommendation) => recommendation.type === "report_tension",
      ).length,
    },
  };
}
