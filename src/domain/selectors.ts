import type {
  Capacity,
  DomainData,
  EntityId,
  ExpectedReturn,
  Landing,
  Lot,
  MarketNeed,
  Outcome,
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
) {
  const expectedReturns = getExpectedReturnsByTerritory(data, territoryId);
  const landings = getLandingsByTerritory(data, territoryId);
  const availableLots = getAvailableLotsByTerritory(data, territoryId);
  const openNeeds = getOpenMarketNeedsByTerritory(data, territoryId);
  const availableCapacities = getAvailableCapacitiesByTerritory(
    data,
    territoryId,
  );
  const openTensions = getOpenTensionsByTerritory(data, territoryId);

  return {
    expectedReturnsCount: expectedReturns.length,
    confirmedLandingsCount: landings.filter(
      (landing) => landing.status === "confirmed",
    ).length,
    availableLotsCount: availableLots.length,
    availableLotWeightKg: getTotalAvailableLotWeightKg(availableLots),
    openMarketNeedsCount: openNeeds.length,
    openMarketNeedWeightKg: getTotalOpenNeedWeightKg(openNeeds),
    availableCapacitiesCount: availableCapacities.length,
    openTensionsCount: openTensions.length,
    criticalTensionsCount: openTensions.filter(
      (tension) => tension.severity === "critical" || tension.severity === "high",
    ).length,
  };
}
