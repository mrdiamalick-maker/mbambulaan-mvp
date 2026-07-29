import type {
  Capacity,
  DomainData,
  EntityId,
  ExpectedReturn,
  Landing,
  Lot,
  MarketNeed,
  Outcome,
  ServiceAllocation,
  ServiceExecution,
  ServiceNeed,
  Tension,
} from "./types";

export function getExpectedReturnsByTerritory(
  data: DomainData,
  territoryId: EntityId,
): ExpectedReturn[] {
  const siteIds = new Set(
    data.landingSites
      .filter((site) => site.territoryId === territoryId)
      .map((site) => site.id),
  );

  return data.expectedReturns.filter((expectedReturn) =>
    siteIds.has(expectedReturn.expectedLandingSiteId),
  );
}

export function getExpectedReturnsByLandingSite(
  data: DomainData,
  landingSiteId: EntityId,
): ExpectedReturn[] {
  return data.expectedReturns.filter(
    (expectedReturn) => expectedReturn.expectedLandingSiteId === landingSiteId,
  );
}

export function getServiceNeedsByExpectedReturn(
  data: DomainData,
  expectedReturnId: EntityId,
): ServiceNeed[] {
  return data.serviceNeeds.filter(
    (need) => need.expectedReturnId === expectedReturnId,
  );
}

export function getOpenServiceNeedsByTerritory(
  data: DomainData,
  territoryId: EntityId,
): ServiceNeed[] {
  return data.serviceNeeds.filter(
    (need) =>
      need.territoryId === territoryId &&
      ["open", "partially_allocated", "allocated"].includes(need.status),
  );
}

export function getServiceAllocationsByNeed(
  data: DomainData,
  serviceNeedId: EntityId,
): ServiceAllocation[] {
  return data.serviceAllocations.filter(
    (allocation) => allocation.serviceNeedId === serviceNeedId,
  );
}

export function getServiceExecutionsByAllocation(
  data: DomainData,
  allocationId: EntityId,
): ServiceExecution[] {
  return data.serviceExecutions.filter(
    (execution) => execution.allocationId === allocationId,
  );
}

export function getAllocatedQuantityForNeed(
  data: DomainData,
  serviceNeedId: EntityId,
): number {
  return data.serviceAllocations
    .filter(
      (allocation) =>
        allocation.serviceNeedId === serviceNeedId &&
        ["proposed", "reserved", "in_progress", "fulfilled"].includes(
          allocation.status,
        ),
    )
    .reduce((total, allocation) => total + allocation.allocatedQuantity, 0);
}

export function getExecutedQuantityForNeed(
  data: DomainData,
  serviceNeedId: EntityId,
): number {
  const allocationIds = new Set(
    getServiceAllocationsByNeed(data, serviceNeedId).map(
      (allocation) => allocation.id,
    ),
  );

  return data.serviceExecutions
    .filter(
      (execution) =>
        allocationIds.has(execution.allocationId) &&
        execution.status === "confirmed",
    )
    .reduce((total, execution) => total + execution.executedQuantity, 0);
}

export function getServiceNeedCoverage(
  data: DomainData,
  serviceNeedId: EntityId,
) {
  const need = data.serviceNeeds.find((item) => item.id === serviceNeedId);
  if (!need) {
    return undefined;
  }

  const allocatedQuantity = getAllocatedQuantityForNeed(data, serviceNeedId);
  const executedQuantity = getExecutedQuantityForNeed(data, serviceNeedId);

  return {
    requestedQuantity: need.requestedQuantity,
    allocatedQuantity,
    executedQuantity,
    remainingToAllocate: Math.max(
      need.requestedQuantity - allocatedQuantity,
      0,
    ),
    remainingToExecute: Math.max(
      need.requestedQuantity - executedQuantity,
      0,
    ),
    allocationCoverageRate:
      need.requestedQuantity === 0
        ? 0
        : allocatedQuantity / need.requestedQuantity,
    executionCoverageRate:
      need.requestedQuantity === 0
        ? 0
        : executedQuantity / need.requestedQuantity,
  };
}

export function getCompatibleCapacitiesForNeed(
  data: DomainData,
  serviceNeedId: EntityId,
): Capacity[] {
  const need = data.serviceNeeds.find((item) => item.id === serviceNeedId);
  if (!need || ["fulfilled", "cancelled"].includes(need.status)) {
    return [];
  }

  const expectedCapacityType =
    need.needType === "handling" ? "processing" : need.needType;
  const neededAt = Date.parse(need.neededAt);

  return data.capacities.filter((capacity) => {
    const availableFrom = Date.parse(capacity.availableFrom);
    const availableUntil = capacity.availableUntil
      ? Date.parse(capacity.availableUntil)
      : undefined;
    const matchesSite =
      !need.landingSiteId ||
      !capacity.landingSiteId ||
      need.landingSiteId === capacity.landingSiteId;

    return (
      capacity.capacityType === expectedCapacityType &&
      capacity.unit === need.unit &&
      capacity.territoryId === need.territoryId &&
      matchesSite &&
      capacity.availableQuantity > 0 &&
      ["available", "partially_available"].includes(capacity.status) &&
      availableFrom <= neededAt &&
      (availableUntil === undefined || neededAt <= availableUntil)
    );
  });
}

export function getServiceNeedsAtRisk(
  data: DomainData,
  referenceDate: string,
): ServiceNeed[] {
  const referenceTime = Date.parse(referenceDate);

  return data.serviceNeeds.filter((need) => {
    if (["fulfilled", "cancelled"].includes(need.status)) {
      return false;
    }

    const coverage = getServiceNeedCoverage(data, need.id);
    if (!coverage) {
      return false;
    }

    const deadline = Date.parse(need.neededAt);
    const hasShortage = coverage.remainingToAllocate > 0;
    const isDue = deadline <= referenceTime;
    const isCriticalSoon =
      need.priority === "critical" && deadline - referenceTime <= 60 * 60 * 1000;

    return hasShortage && (isDue || isCriticalSoon);
  });
}

export function getLandingsByTerritory(
  data: DomainData,
  territoryId: EntityId,
): Landing[] {
  const siteIds = new Set(
    data.landingSites
      .filter((site) => site.territoryId === territoryId)
      .map((site) => site.id),
  );

  return data.landings.filter((landing) => siteIds.has(landing.landingSiteId));
}

export function getLotsByLanding(data: DomainData, landingId: EntityId): Lot[] {
  return data.lots.filter((lot) => lot.landingId === landingId);
}

export function getAvailableLotsByTerritory(
  data: DomainData,
  territoryId: EntityId,
): Lot[] {
  const landingIds = new Set(
    getLandingsByTerritory(data, territoryId).map((landing) => landing.id),
  );

  return data.lots.filter(
    (lot) =>
      landingIds.has(lot.landingId) &&
      ["available", "partially_reserved"].includes(lot.availabilityStatus),
  );
}

export function getOpenMarketNeedsByTerritory(
  data: DomainData,
  territoryId: EntityId,
): MarketNeed[] {
  return data.marketNeeds.filter(
    (need) =>
      need.territoryId === territoryId &&
      ["open", "partially_matched"].includes(need.status),
  );
}

export function getAvailableCapacitiesByTerritory(
  data: DomainData,
  territoryId: EntityId,
): Capacity[] {
  return data.capacities.filter(
    (capacity) =>
      capacity.territoryId === territoryId &&
      capacity.availableQuantity > 0 &&
      ["available", "partially_available"].includes(capacity.status),
  );
}

export function getOpenTensionsByTerritory(
  data: DomainData,
  territoryId: EntityId,
): Tension[] {
  return data.tensions.filter(
    (tension) =>
      tension.territoryId === territoryId &&
      ["open", "coordinating"].includes(tension.status),
  );
}

export function getCommitmentsByTension(
  data: DomainData,
  tensionId: EntityId,
) {
  return data.commitments.filter(
    (commitment) => commitment.tensionId === tensionId,
  );
}

export function getOutcomesByRelatedEntity(
  data: DomainData,
  entityType: Outcome["relatedEntityType"],
  entityId: EntityId,
): Outcome[] {
  return data.outcomes.filter(
    (outcome) =>
      outcome.relatedEntityType === entityType &&
      outcome.relatedEntityId === entityId,
  );
}

export function getTotalAvailableLotWeightKg(lots: Lot[]): number {
  return lots.reduce((total, lot) => total + lot.weightKg, 0);
}

export function getTotalOpenNeedWeightKg(needs: MarketNeed[]): number {
  return needs.reduce((total, need) => total + need.quantityKg, 0);
}

export function getTerritoryOperationalSummary(
  data: DomainData,
  territoryId: EntityId,
  referenceDate?: string,
) {
  const expectedReturns = getExpectedReturnsByTerritory(data, territoryId);
  const landings = getLandingsByTerritory(data, territoryId);
  const availableLots = getAvailableLotsByTerritory(data, territoryId);
  const openMarketNeeds = getOpenMarketNeedsByTerritory(data, territoryId);
  const openServiceNeeds = getOpenServiceNeedsByTerritory(data, territoryId);
  const availableCapacities = getAvailableCapacitiesByTerritory(
    data,
    territoryId,
  );
  const openTensions = getOpenTensionsByTerritory(data, territoryId);
  const serviceNeedsAtRisk = referenceDate
    ? getServiceNeedsAtRisk(data, referenceDate).filter(
        (need) => need.territoryId === territoryId,
      )
    : [];

  return {
    expectedReturnsCount: expectedReturns.length,
    confirmedLandingsCount: landings.filter(
      (landing) => landing.status === "confirmed",
    ).length,
    openServiceNeedsCount: openServiceNeeds.length,
    partiallyAllocatedServiceNeedsCount: openServiceNeeds.filter(
      (need) => need.status === "partially_allocated",
    ).length,
    serviceNeedsAtRiskCount: serviceNeedsAtRisk.length,
    availableLotsCount: availableLots.length,
    availableLotWeightKg: getTotalAvailableLotWeightKg(availableLots),
    openMarketNeedsCount: openMarketNeeds.length,
    openMarketNeedWeightKg: getTotalOpenNeedWeightKg(openMarketNeeds),
    availableCapacitiesCount: availableCapacities.length,
    openTensionsCount: openTensions.length,
    criticalTensionsCount: openTensions.filter(
      (tension) => tension.severity === "critical" || tension.severity === "high",
    ).length,
  };
}
