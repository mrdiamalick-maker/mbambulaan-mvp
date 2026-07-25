import type { DomainData, EntityId } from "./types";

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

export function validateDomainData(data: DomainData): DomainValidationIssue[] {
  const issues: DomainValidationIssue[] = [];

  const collections: Array<[keyof DomainData, Array<{ id: EntityId }>]> = [
    ["actors", data.actors],
    ["organizations", data.organizations],
    ["territories", data.territories],
    ["landingSites", data.landingSites],
    ["vessels", data.vessels],
    ["expectedReturns", data.expectedReturns],
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
  const landingIds = new Set(data.landings.map((item) => item.id));
  const lotIds = new Set(data.lots.map((item) => item.id));
  const marketNeedIds = new Set(data.marketNeeds.map((item) => item.id));
  const capacityIds = new Set(data.capacities.map((item) => item.id));
  const tensionIds = new Set(data.tensions.map((item) => item.id));

  for (const item of data.organizations) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({
        code: "missing_territory",
        message: `Organisation ${item.id} liée à un territoire inconnu`,
        entityType: "organizations",
        entityId: item.id,
      });
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

  for (const item of data.capacities) {
    if (!territoryIds.has(item.territoryId)) {
      issues.push({ code: "missing_territory", message: `Capacité ${item.id} liée à un territoire inconnu`, entityType: "capacities", entityId: item.id });
    }
    if (!organizationIds.has(item.providerOrganizationId)) {
      issues.push({ code: "missing_provider", message: `Capacité ${item.id} liée à un fournisseur inconnu`, entityType: "capacities", entityId: item.id });
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

  return issues;
}

export function assertValidDomainData(data: DomainData): void {
  const issues = validateDomainData(data);
  if (issues.length > 0) {
    throw new Error(`Données métier invalides: ${issues.map((issue) => issue.message).join(" | ")}`);
  }
}
