import {
  getCompatibleCapacitiesForNeed,
  getOpenTensionsByTerritory,
  getServiceNeedCoverage,
} from "./selectors";
import type {
  Capacity,
  DomainData,
  EntityId,
  ServiceNeed,
  Tension,
  TensionType,
} from "./types";

export type CoordinationDecisionStatus =
  | "fulfilled"
  | "capacity_available"
  | "partially_covered"
  | "tension_required";

export interface CoordinationDecision {
  serviceNeed: ServiceNeed;
  status: CoordinationDecisionStatus;
  compatibleCapacities: Capacity[];
  existingTensions: Tension[];
  remainingQuantity: number;
  recommendedTensionType?: TensionType;
}

function getTensionTypeForNeed(need: ServiceNeed): TensionType {
  switch (need.needType) {
    case "ice":
      return "ice_shortage";
    case "cold_storage":
      return "cold_storage_shortage";
    case "transport":
      return "transport_shortage";
    case "handling":
      return "equipment_failure";
  }
}

export class CoordinationEngine {
  assessServiceNeed(
    data: DomainData,
    serviceNeedId: EntityId,
  ): CoordinationDecision {
    const serviceNeed = data.serviceNeeds.find(
      (need) => need.id === serviceNeedId,
    );

    if (!serviceNeed) {
      throw new Error(
        `Le besoin de service ${serviceNeedId} est introuvable.`,
      );
    }

    const coverage = getServiceNeedCoverage(data, serviceNeedId);
    if (!coverage) {
      throw new Error(
        `La couverture du besoin ${serviceNeedId} est introuvable.`,
      );
    }

    const compatibleCapacities = getCompatibleCapacitiesForNeed(
      data,
      serviceNeedId,
    );
    const existingTensions = getOpenTensionsByTerritory(
      data,
      serviceNeed.territoryId,
    ).filter(
      (tension) =>
        tension.relatedEntityType === "service_need" &&
        tension.relatedEntityId === serviceNeedId,
    );

    if (serviceNeed.status === "fulfilled") {
      return {
        serviceNeed,
        status: "fulfilled",
        compatibleCapacities,
        existingTensions,
        remainingQuantity: 0,
      };
    }

    if (coverage.remainingToAllocate === 0) {
      return {
        serviceNeed,
        status: "partially_covered",
        compatibleCapacities,
        existingTensions,
        remainingQuantity: coverage.remainingToExecute,
      };
    }

    if (compatibleCapacities.length > 0) {
      return {
        serviceNeed,
        status: "capacity_available",
        compatibleCapacities,
        existingTensions,
        remainingQuantity: coverage.remainingToAllocate,
      };
    }

    return {
      serviceNeed,
      status: "tension_required",
      compatibleCapacities,
      existingTensions,
      remainingQuantity: coverage.remainingToAllocate,
      recommendedTensionType: getTensionTypeForNeed(serviceNeed),
    };
  }

  assessTerritory(
    data: DomainData,
    territoryId: EntityId,
  ): CoordinationDecision[] {
    return data.serviceNeeds
      .filter(
        (need) =>
          need.territoryId === territoryId &&
          !["fulfilled", "cancelled"].includes(need.status),
      )
      .map((need) => this.assessServiceNeed(data, need.id));
  }
}
