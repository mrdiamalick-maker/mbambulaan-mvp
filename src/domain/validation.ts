import type { DomainData, EntityId, ServiceNeedType, ServiceNeedUnit } from "./types";

export interface DomainValidationIssue {
  code: string;
  message: string;
  entityType: keyof DomainData;
  entityId: EntityId;
}

function duplicateIds<T extends { id: EntityId }>(items: T[]): EntityId[] {
  const seen = new Set<EntityId>();
  const duplicates = new Set<EntityId>();

  for (const item of items) {
    if (seen.has(item.id)) {
      duplicates.add(item.id);
    }
    seen.add(item.id);
  }

  return [...duplicates];
}

function isValidDate(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function isCompatibleUnit(type: ServiceNeedType, unit: ServiceNeedUnit): boolean {
  if (type === "ice" || type === "cold_storage") {
    return unit === "kg";
  }

  if (type === "transport") {
    return unit === "vehicle";
  }

  return unit === "team" || unit === "slot";
}

export function validateDomainData(data: DomainData): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  const collections: Array<[keyof DomainData, Array<{ id: EntityId }>]> = [
    ["actors", data.actors],
    ["organizations", data.organizations],
    ["territories", data.territories],
    ["landingSites", data.landingSites],
    ["vessels", data.vessels],
    ["expectedReturns", data.expectedReturns],
    ["serviceNeeds", data.serviceNeeds],
    ["serviceAllocations", data.serviceAllocations],
    ["serviceExecutions", data.serviceExecutions],
    ["landings", data.landings],
    ["weighings", data.weighings],
    ["lots", data.lots],
    ["marketNeeds", data.marketNeeds],
    ["capacities", data.capacities],
    ["tensions", data.tensions],
    ["commitments", data.commitments],
    ["outcomes", data.outcomes],
  ];

  for (const [entityType, items] of collections) {
    for (const id of duplicateIds(items)) {
      issues.push({
        code: "duplicate_id",
        message: `Identifiant dupliqué dans ${entityType}: ${id}`,
        entityType,
        entityId: id,
      });
    }
  }

  const territoryIds = new Set(data.territories.map((item) => item.id));
  const organizationIds = new Set(data.organizations.map((item) => item.id));
  const actorIds = new Set(data.actors.map((item) => item.id));
  const landingSiteIds = new Set(data.landingSites.map((item) => item.id));
  const vesselIds = new Set(data.vessels.map((item) => item.id));
  const expectedReturnIds = new Set(data.expectedReturns.map((item) => item.id));
  const serviceNeedIds = new Set(data.serviceNeeds.map((item) => item.id));
  const serviceAllocationIds = new Set(data.serviceAllocations.map((item) => item.id));
  const serviceExecutionIds = new Set(data.serviceExecutions.map((item) => item.id));
  const landingIds = new Set(data.landings.map((item) => item.id));
  const lotIds = new Set(data.lots.map((item) => item.id));
  const marketNeedIds = new Set(data.marketNeeds.map((item) => item.id));
  const capacityIds = new Set(data.capacities.map((item) => item.id));
  const tensionIds = new Set(data.tensions.map((item) => item.id));

  for (const item of data.organizations) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Organisation ${item.id} liée à un territoire inconnu`, entityType: "organizations", entityId: item.id });
    }
  }

  for (const item of data.actors) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Acteur ${item.id} lié à un territoire inconnu`, entityType: "actors", entityId: item.id });
    }
    if (item.organizationId && !organizationIds.has(item.organizationId)) {
      issues.push({ code: "missing_organization", message: `Acteur ${item.id} lié à une organisation inconnue`, entityType: "actors", entityId: item.id });
    }
  }

  for (const item of data.landingSites) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Quai ${item.id} lié à un territoire inconnu`, entityType: "landingSites", entityId: item.id });
    }
    if (!organizationIds.has(item.managerOrganizationId)) {
      issues.push({ code: "missing_manager", message: `Quai ${item.id} lié à un gestionnaire inconnu`, entityType: "landingSites", entityId: item.id });
    }
  }

  for (const item of data.vessels) {
    if (!organizationIds.has(item.ownerOrganizationId)) {
      issues.push({ code: "missing_owner", message: `Pirogue ${item.id} liée à un propriétaire inconnu`, entityType: "vessels", entityId: item.id });
    }
    if (!landingSiteIds.has(item.homeLandingSiteId)) {
      issues.push({ code: "missing_home_site", message: `Pirogue ${item.id} liée à un quai d'attache inconnu`, entityType: "vessels", entityId: item.id });
    }
  }

  for (const item of data.expectedReturns) {
    if (!vesselIds.has(item.vesselId)) {
      issues.push({ code: "missing_vessel", message: `Retour ${item.id} lié à une pirogue inconnue`, entityType: "expectedReturns", entityId: item.id });
    }
    if (!landingSiteIds.has(item.expectedLandingSiteId)) {
      issues.push({ code: "missing_landing_site", message: `Retour ${item.id} lié à un quai inconnu`, entityType: "expectedReturns", entityId: item.id });
    }
    if (!actorIds.has(item.createdByActorId)) {
      issues.push({ code: "missing_actor", message: `Retour ${item.id} créé par un acteur inconnu`, entityType: "expectedReturns", entityId: item.id });
    }
    if (!isValidDate(item.expectedAt) || !isValidDate(item.createdAt)) {
      issues.push({ code: "invalid_date", message: `Retour ${item.id} contient une date invalide`, entityType: "expectedReturns", entityId: item.id });
    }
  }

  for (const item of data.serviceNeeds) {
    if (!expectedReturnIds.has(item.expectedReturnId)) {
      issues.push({ code: "missing_expected_return", message: `Besoin de service ${item.id} lié à un retour inconnu`, entityType: "serviceNeeds", entityId: item.id });
    }
    if (!actorIds.has(item.requestedByActorId)) {
      issues.push({ code: "missing_actor", message: `Besoin de service ${item.id} déclaré par un acteur inconnu`, entityType: "serviceNeeds", entityId: item.id });
    }
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Besoin de service ${item.id} lié à un territoire inconnu`, entityType: "serviceNeeds", entityId: item.id });
    }
    if (item.landingSiteId && !landingSiteIds.has(item.landingSiteId)) {
      issues.push({ code: "missing_landing_site", message: `Besoin de service ${item.id} lié à un quai inconnu`, entityType: "serviceNeeds", entityId: item.id });
    }
    if (item.requestedQuantity <= 0) {
      issues.push({ code: "invalid_quantity", message: `Besoin de service ${item.id} avec quantité non positive`, entityType: "serviceNeeds", entityId: item.id });
    }
    if (!isCompatibleUnit(item.needType, item.unit)) {
      issues.push({ code: "incompatible_unit", message: `Besoin de service ${item.id} avec unité incompatible`, entityType: "serviceNeeds", entityId: item.id });
    }
    if (!isValidDate(item.neededAt) || !isValidDate(item.createdAt)) {
      issues.push({ code: "invalid_date", message: `Besoin de service ${item.id} contient une date invalide`, entityType: "serviceNeeds", entityId: item.id });
    }
  }

  for (const item of data.capacities) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Capacité ${item.id} liée à un territoire inconnu`, entityType: "capacities", entityId: item.id });
    }
    if (!organizationIds.has(item.providerOrganizationId)) {
      issues.push({ code: "missing_provider", message: `Capacité ${item.id} liée à un fournisseur inconnu`, entityType: "capacities", entityId: item.id });
    }
    if (item.landingSiteId && !landingSiteIds.has(item.landingSiteId)) {
      issues.push({ code: "missing_landing_site", message: `Capacité ${item.id} liée à un quai inconnu`, entityType: "capacities", entityId: item.id });
    }
    if (!actorIds.has(item.declaredByActorId)) {
      issues.push({ code: "missing_actor", message: `Capacité ${item.id} déclarée par un acteur inconnu`, entityType: "capacities", entityId: item.id });
    }
    if (item.initialQuantity <= 0 || item.availableQuantity < 0 || item.availableQuantity > item.initialQuantity) {
      issues.push({ code: "invalid_capacity_quantity", message: `Capacité ${item.id} avec quantités incohérentes`, entityType: "capacities", entityId: item.id });
    }
    if (!isCompatibleUnit(item.capacityType === "processing" ? "handling" : item.capacityType, item.unit)) {
      issues.push({ code: "incompatible_unit", message: `Capacité ${item.id} avec unité incompatible`, entityType: "capacities", entityId: item.id });
    }
    if (!isValidDate(item.availableFrom) || !isValidDate(item.createdAt) || (item.availableUntil && !isValidDate(item.availableUntil))) {
      issues.push({ code: "invalid_date", message: `Capacité ${item.id} contient une date invalide`, entityType: "capacities", entityId: item.id });
    }
    if (item.availableUntil && Date.parse(item.availableUntil) <= Date.parse(item.availableFrom)) {
      issues.push({ code: "invalid_availability_window", message: `Capacité ${item.id} avec fenêtre de disponibilité invalide`, entityType: "capacities", entityId: item.id });
    }
  }

  const activeAllocationStatuses = new Set(["proposed", "reserved", "in_progress", "fulfilled"]);

  for (const item of data.serviceAllocations) {
    const need = data.serviceNeeds.find((candidate) => candidate.id === item.serviceNeedId);
    const capacity = data.capacities.find((candidate) => candidate.id === item.capacityId);

    if (!serviceNeedIds.has(item.serviceNeedId)) {
      issues.push({ code: "missing_service_need", message: `Allocation ${item.id} liée à un besoin de service inconnu`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (!capacityIds.has(item.capacityId)) {
      issues.push({ code: "missing_capacity", message: `Allocation ${item.id} liée à une capacité inconnue`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (!organizationIds.has(item.providerOrganizationId)) {
      issues.push({ code: "missing_provider", message: `Allocation ${item.id} liée à un fournisseur inconnu`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (item.beneficiaryOrganizationId && !organizationIds.has(item.beneficiaryOrganizationId)) {
      issues.push({ code: "missing_organization", message: `Allocation ${item.id} liée à une organisation bénéficiaire inconnue`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (item.beneficiaryActorId && !actorIds.has(item.beneficiaryActorId)) {
      issues.push({ code: "missing_actor", message: `Allocation ${item.id} liée à un bénéficiaire inconnu`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (!actorIds.has(item.allocatedByActorId)) {
      issues.push({ code: "missing_actor", message: `Allocation ${item.id} créée par un acteur inconnu`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (item.allocatedQuantity <= 0) {
      issues.push({ code: "invalid_quantity", message: `Allocation ${item.id} avec quantité non positive`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (!isValidDate(item.allocatedAt) || (item.expiresAt && !isValidDate(item.expiresAt))) {
      issues.push({ code: "invalid_date", message: `Allocation ${item.id} contient une date invalide`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (need && item.unit !== need.unit) {
      issues.push({ code: "unit_mismatch", message: `Allocation ${item.id} avec unité différente du besoin`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (capacity && item.unit !== capacity.unit) {
      issues.push({ code: "unit_mismatch", message: `Allocation ${item.id} avec unité différente de la capacité`, entityType: "serviceAllocations", entityId: item.id });
    }
    if (need && capacity) {
      const expectedCapacityType = need.needType === "handling" ? "processing" : need.needType;
      if (capacity.capacityType !== expectedCapacityType) {
        issues.push({ code: "capacity_type_mismatch", message: `Allocation ${item.id} entre besoin et capacité incompatibles`, entityType: "serviceAllocations", entityId: item.id });
      }
      if (need.territoryId !== capacity.territoryId) {
        issues.push({ code: "territory_mismatch", message: `Allocation ${item.id} entre territoires incompatibles`, entityType: "serviceAllocations", entityId: item.id });
      }
      if (item.providerOrganizationId !== capacity.providerOrganizationId) {
        issues.push({ code: "provider_mismatch", message: `Allocation ${item.id} avec fournisseur différent de la capacité`, entityType: "serviceAllocations", entityId: item.id });
      }
    }
  }

  for (const capacity of data.capacities) {
    const allocatedQuantity = data.serviceAllocations
      .filter((allocation) => allocation.capacityId === capacity.id && activeAllocationStatuses.has(allocation.status))
      .reduce((total, allocation) => total + allocation.allocatedQuantity, 0);

    const expectedAvailableQuantity = capacity.initialQuantity - allocatedQuantity;
    if (expectedAvailableQuantity !== capacity.availableQuantity) {
      issues.push({ code: "capacity_balance_mismatch", message: `Capacité ${capacity.id} avec disponibilité incohérente par rapport aux allocations`, entityType: "capacities", entityId: capacity.id });
    }
  }

  for (const item of data.serviceExecutions) {
    const allocation = data.serviceAllocations.find((candidate) => candidate.id === item.allocationId);

    if (!serviceAllocationIds.has(item.allocationId)) {
      issues.push({ code: "missing_allocation", message: `Exécution ${item.id} liée à une allocation inconnue`, entityType: "serviceExecutions", entityId: item.id });
    }
    if (!actorIds.has(item.confirmedByActorId)) {
      issues.push({ code: "missing_actor", message: `Exécution ${item.id} confirmée par un acteur inconnu`, entityType: "serviceExecutions", entityId: item.id });
    }
    if (item.executedQuantity <= 0) {
      issues.push({ code: "invalid_quantity", message: `Exécution ${item.id} avec quantité non positive`, entityType: "serviceExecutions", entityId: item.id });
    }
    if (!isValidDate(item.executedAt)) {
      issues.push({ code: "invalid_date", message: `Exécution ${item.id} contient une date invalide`, entityType: "serviceExecutions", entityId: item.id });
    }
    if (allocation && item.executedQuantity > allocation.allocatedQuantity) {
      issues.push({ code: "execution_exceeds_allocation", message: `Exécution ${item.id} supérieure à la quantité allouée`, entityType: "serviceExecutions", entityId: item.id });
    }
  }

  for (const allocation of data.serviceAllocations) {
    const executedQuantity = data.serviceExecutions
      .filter((execution) => execution.allocationId === allocation.id && execution.status === "confirmed")
      .reduce((total, execution) => total + execution.executedQuantity, 0);

    if (executedQuantity > allocation.allocatedQuantity) {
      issues.push({ code: "execution_exceeds_allocation", message: `Allocation ${allocation.id} avec exécution totale supérieure à la quantité réservée`, entityType: "serviceAllocations", entityId: allocation.id });
    }
  }

  for (const need of data.serviceNeeds) {
    const activeAllocations = data.serviceAllocations.filter(
      (allocation) => allocation.serviceNeedId === need.id && activeAllocationStatuses.has(allocation.status),
    );
    const allocatedQuantity = activeAllocations.reduce((total, allocation) => total + allocation.allocatedQuantity, 0);
    const allocationIds = new Set(activeAllocations.map((allocation) => allocation.id));
    const executedQuantity = data.serviceExecutions
      .filter((execution) => allocationIds.has(execution.allocationId) && execution.status === "confirmed")
      .reduce((total, execution) => total + execution.executedQuantity, 0);

    if (allocatedQuantity > need.requestedQuantity) {
      issues.push({ code: "need_overallocated", message: `Besoin de service ${need.id} sur-alloué`, entityType: "serviceNeeds", entityId: need.id });
    }

    const expectedStatus =
      need.status === "cancelled"
        ? "cancelled"
        : executedQuantity >= need.requestedQuantity
          ? "fulfilled"
          : allocatedQuantity === 0
            ? "open"
            : allocatedQuantity < need.requestedQuantity
              ? "partially_allocated"
              : "allocated";

    if (need.status !== expectedStatus) {
      issues.push({ code: "service_need_status_mismatch", message: `Besoin de service ${need.id} avec statut incohérent`, entityType: "serviceNeeds", entityId: need.id });
    }
  }

  for (const item of data.landings) {
    if (!vesselIds.has(item.vesselId)) {
      issues.push({ code: "missing_vessel", message: `Débarquement ${item.id} lié à une pirogue inconnue`, entityType: "landings", entityId: item.id });
    }
    if (!landingSiteIds.has(item.landingSiteId)) {
      issues.push({ code: "missing_landing_site", message: `Débarquement ${item.id} lié à un quai inconnu`, entityType: "landings", entityId: item.id });
    }
    if (item.expectedReturnId && !expectedReturnIds.has(item.expectedReturnId)) {
      issues.push({ code: "missing_expected_return", message: `Débarquement ${item.id} lié à un retour inconnu`, entityType: "landings", entityId: item.id });
    }
    if (!actorIds.has(item.confirmedByActorId)) {
      issues.push({ code: "missing_actor", message: `Débarquement ${item.id} confirmé par un acteur inconnu`, entityType: "landings", entityId: item.id });
    }
  }

  for (const item of data.weighings) {
    if (!landingIds.has(item.landingId)) {
      issues.push({ code: "missing_landing", message: `Pesée ${item.id} liée à un débarquement inconnu`, entityType: "weighings", entityId: item.id });
    }
    if (item.verifiedByActorId && !actorIds.has(item.verifiedByActorId)) {
      issues.push({ code: "missing_actor", message: `Pesée ${item.id} vérifiée par un acteur inconnu`, entityType: "weighings", entityId: item.id });
    }
  }

  for (const item of data.lots) {
    if (!landingIds.has(item.landingId)) {
      issues.push({ code: "missing_landing", message: `Lot ${item.id} lié à un débarquement inconnu`, entityType: "lots", entityId: item.id });
    }
  }

  for (const item of data.marketNeeds) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Besoin ${item.id} lié à un territoire inconnu`, entityType: "marketNeeds", entityId: item.id });
    }
    if (item.actorId && !actorIds.has(item.actorId)) {
      issues.push({ code: "missing_actor", message: `Besoin ${item.id} lié à un acteur inconnu`, entityType: "marketNeeds", entityId: item.id });
    }
    if (item.organizationId && !organizationIds.has(item.organizationId)) {
      issues.push({ code: "missing_organization", message: `Besoin ${item.id} lié à une organisation inconnue`, entityType: "marketNeeds", entityId: item.id });
    }
    for (const lotId of item.relatedLotIds) {
      if (!lotIds.has(lotId)) {
        issues.push({ code: "missing_lot", message: `Besoin ${item.id} lié à un lot inconnu`, entityType: "marketNeeds", entityId: item.id });
      }
    }
  }

  for (const item of data.tensions) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Tension ${item.id} liée à un territoire inconnu`, entityType: "tensions", entityId: item.id });
    }
    if (!actorIds.has(item.reportedByActorId)) {
      issues.push({ code: "missing_actor", message: `Tension ${item.id} déclarée par un acteur inconnu`, entityType: "tensions", entityId: item.id });
    }

    const targetExists =
      (item.relatedEntityType === "expected_return" && expectedReturnIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "service_need" && serviceNeedIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "landing" && landingIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "lot" && lotIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "capacity" && capacityIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "market_need" && marketNeedIds.has(item.relatedEntityId));

    if (!targetExists) {
      issues.push({ code: "missing_related_entity", message: `Tension ${item.id} liée à une entité inconnue`, entityType: "tensions", entityId: item.id });
    }
  }

  for (const item of data.commitments) {
    if (!tensionIds.has(item.tensionId)) {
      issues.push({ code: "missing_tension", message: `Engagement ${item.id} lié à une tension inconnue`, entityType: "commitments", entityId: item.id });
    }
    if (item.actorId && !actorIds.has(item.actorId)) {
      issues.push({ code: "missing_actor", message: `Engagement ${item.id} lié à un acteur inconnu`, entityType: "commitments", entityId: item.id });
    }
    if (item.organizationId && !organizationIds.has(item.organizationId)) {
      issues.push({ code: "missing_organization", message: `Engagement ${item.id} lié à une organisation inconnue`, entityType: "commitments", entityId: item.id });
    }
  }

  for (const item of data.outcomes) {
    const targetExists =
      (item.relatedEntityType === "tension" && tensionIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "service_need" && serviceNeedIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "service_allocation" && serviceAllocationIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "service_execution" && serviceExecutionIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "landing" && landingIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "lot" && lotIds.has(item.relatedEntityId)) ||
      (item.relatedEntityType === "market_need" && marketNeedIds.has(item.relatedEntityId));

    if (!targetExists) {
      issues.push({ code: "missing_related_entity", message: `Résultat ${item.id} lié à une entité inconnue`, entityType: "outcomes", entityId: item.id });
    }
    if (item.valueSavedKg !== undefined && item.valueSavedKg < 0) {
      issues.push({ code: "invalid_quantity", message: `Résultat ${item.id} avec quantité sauvée négative`, entityType: "outcomes", entityId: item.id });
    }
    if (item.valueCreated !== undefined && item.valueCreated < 0) {
      issues.push({ code: "invalid_value", message: `Résultat ${item.id} avec valeur créée négative`, entityType: "outcomes", entityId: item.id });
    }
  }

  return issues;
}

export function assertValidDomainData(data: DomainData): void {
  const issues = validateDomainData(data);
  if (issues.length > 0) {
    throw new Error(`Données métier invalides: ${issues.map((issue) => issue.message).join(" | ")}`);
  }
}
