import type { EntityId, ISODateTime } from "./types";

export type LogisticsAssetType = "ice_plant" | "cold_room" | "refrigerated_truck" | "insulated_vehicle" | "ice_box" | "warehouse" | "landing_site_storage";
export type LogisticsAssetStatus = "available" | "reserved" | "in_use" | "maintenance" | "unavailable";
export type ColdChainStatus = "not_started" | "active" | "warning" | "breached" | "completed";
export type LogisticsMissionStatus = "draft" | "planned" | "reserved" | "in_progress" | "completed" | "cancelled" | "failed";
export type TemperatureCompliance = "compliant" | "warning" | "breach" | "unknown";

export interface LogisticsAsset {
  id: EntityId;
  ownerActorId: EntityId;
  ownerOrganizationId?: EntityId;
  type: LogisticsAssetType;
  name: string;
  territoryId: EntityId;
  landingSiteId?: EntityId;
  capacityKg?: number;
  iceCapacityKgPerDay?: number;
  refrigerated: boolean;
  minimumTemperatureCelsius?: number;
  maximumTemperatureCelsius?: number;
  status: LogisticsAssetStatus;
  availableFrom?: ISODateTime;
  availableUntil?: ISODateTime;
  latitude?: number;
  longitude?: number;
  attributes: Record<string, unknown>;
}

export interface ColdChainRequirement {
  speciesCode: string;
  minimumTemperatureCelsius: number;
  maximumTemperatureCelsius: number;
  maximumExposureMinutes: number;
  iceRatioKgPerKg?: number;
  maximumTransitHours?: number;
}

export interface LogisticsRequest {
  id: EntityId;
  lotId: EntityId;
  requesterActorId: EntityId;
  originTerritoryId: EntityId;
  originLandingSiteId?: EntityId;
  destinationTerritoryId: EntityId;
  destinationActorId?: EntityId;
  quantityKg: number;
  speciesCode: string;
  pickupFrom: ISODateTime;
  pickupUntil: ISODateTime;
  deliveryBefore: ISODateTime;
  coldChainRequired: boolean;
  requiredAssetTypes: LogisticsAssetType[];
  status: "open" | "matched" | "reserved" | "fulfilled" | "cancelled" | "expired";
  createdAt: ISODateTime;
}

export interface LogisticsMission {
  id: EntityId;
  requestId: EntityId;
  lotId: EntityId;
  providerActorId: EntityId;
  assetIds: EntityId[];
  quantityKg: number;
  plannedPickupAt: ISODateTime;
  plannedDeliveryAt: ISODateTime;
  actualPickupAt?: ISODateTime;
  actualDeliveryAt?: ISODateTime;
  status: LogisticsMissionStatus;
  estimatedDistanceKm?: number;
  estimatedDurationHours?: number;
  costXof?: number;
  currency: "XOF";
  coldChainStatus: ColdChainStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface TemperatureReading {
  id: EntityId;
  missionId: EntityId;
  lotId: EntityId;
  assetId?: EntityId;
  temperatureCelsius: number;
  recordedAt: ISODateTime;
  latitude?: number;
  longitude?: number;
  source: "manual" | "sensor" | "integration";
}

export interface IceAllocation {
  id: EntityId;
  requestId: EntityId;
  assetId: EntityId;
  quantityKg: number;
  reservedAt: ISODateTime;
  validUntil: ISODateTime;
  status: "reserved" | "collected" | "expired" | "cancelled";
}

export interface RoutePlan {
  id: EntityId;
  missionId: EntityId;
  originTerritoryId: EntityId;
  destinationTerritoryId: EntityId;
  stopActorIds: EntityId[];
  distanceKm: number;
  durationHours: number;
  riskLevel: "low" | "medium" | "high";
  risks: string[];
  plannedAt: ISODateTime;
}

export interface ColdChainAssessment {
  missionId: EntityId;
  lotId: EntityId;
  status: ColdChainStatus;
  compliance: TemperatureCompliance;
  minObservedTemperatureCelsius?: number;
  maxObservedTemperatureCelsius?: number;
  outOfRangeReadingCount: number;
  breachDurationMinutes: number;
  reasons: string[];
  warnings: string[];
  lastReadingAt?: ISODateTime;
}

const defaultRequirements: ColdChainRequirement[] = [
  {
    speciesCode: "sardinella_aurita",
    minimumTemperatureCelsius: 0,
    maximumTemperatureCelsius: 4,
    maximumExposureMinutes: 60,
    iceRatioKgPerKg: 1,
    maximumTransitHours: 12,
  },
  {
    speciesCode: "sardinella_maderensis",
    minimumTemperatureCelsius: 0,
    maximumTemperatureCelsius: 4,
    maximumExposureMinutes: 60,
    iceRatioKgPerKg: 1,
    maximumTransitHours: 12,
  },
  {
    speciesCode: "epinephelus_aeneus",
    minimumTemperatureCelsius: 0,
    maximumTemperatureCelsius: 4,
    maximumExposureMinutes: 45,
    iceRatioKgPerKg: 0.8,
    maximumTransitHours: 18,
  },
  {
    speciesCode: "octopus_vulgaris",
    minimumTemperatureCelsius: 0,
    maximumTemperatureCelsius: 4,
    maximumExposureMinutes: 45,
    iceRatioKgPerKg: 0.8,
    maximumTransitHours: 18,
  },
  {
    speciesCode: "penaeus_notialis",
    minimumTemperatureCelsius: 0,
    maximumTemperatureCelsius: 4,
    maximumExposureMinutes: 30,
    iceRatioKgPerKg: 1,
    maximumTransitHours: 10,
  },
];

export class ColdChainAndLogisticsEngine {
  private readonly assets = new Map<EntityId, LogisticsAsset>();
  private readonly requests = new Map<EntityId, LogisticsRequest>();
  private readonly missions = new Map<EntityId, LogisticsMission>();
  private readonly readings = new Map<EntityId, TemperatureReading>();
  private readonly iceAllocations = new Map<EntityId, IceAllocation>();
  private readonly routePlans = new Map<EntityId, RoutePlan>();
  private readonly requirements = new Map<string, ColdChainRequirement>(defaultRequirements.map((item) => [item.speciesCode, item]));

  registerAsset(input: LogisticsAsset) {
    if (this.assets.has(input.id)) throw new Error(`L'actif logistique ${input.id} existe déjà.`);
    if (input.capacityKg !== undefined && input.capacityKg <= 0) throw new Error("La capacité doit être positive.");
    if (input.iceCapacityKgPerDay !== undefined && input.iceCapacityKgPerDay <= 0) throw new Error("La capacité de glace doit être positive.");
    this.assets.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  registerRequirement(input: ColdChainRequirement) {
    if (input.maximumTemperatureCelsius <= input.minimumTemperatureCelsius) {
      throw new Error("La température maximale doit être supérieure à la température minimale.");
    }
    this.requirements.set(input.speciesCode, structuredClone(input));
    return structuredClone(input);
  }

  createRequest(input: LogisticsRequest) {
    if (this.requests.has(input.id)) throw new Error(`La demande logistique ${input.id} existe déjà.`);
    if (input.quantityKg <= 0) throw new Error("La quantité doit être positive.");
    if (input.pickupUntil <= input.pickupFrom) throw new Error("La fenêtre de collecte est invalide.");
    if (input.deliveryBefore <= input.pickupFrom) throw new Error("La date de livraison doit être postérieure à la collecte.");
    if (input.coldChainRequired && !this.requirements.has(input.speciesCode)) {
      throw new Error(`Aucune exigence de chaîne du froid définie pour ${input.speciesCode}.`);
    }
    this.requests.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  findCompatibleAssets(requestId: EntityId, at: ISODateTime) {
    const request = this.requireRequest(requestId);
    return [...this.assets.values()]
      .filter((asset) => asset.status === "available")
      .filter((asset) => !asset.availableFrom || asset.availableFrom <= at)
      .filter((asset) => !asset.availableUntil || asset.availableUntil >= request.deliveryBefore)
      .filter((asset) => request.requiredAssetTypes.length === 0 || request.requiredAssetTypes.includes(asset.type))
      .filter((asset) => asset.capacityKg === undefined || asset.capacityKg >= request.quantityKg)
      .filter((asset) => !request.coldChainRequired || asset.refrigerated || asset.type === "ice_plant" || asset.type === "ice_box")
      .map((asset) => structuredClone(asset));
  }

  reserveIce(input: { allocationId: EntityId; requestId: EntityId; assetId: EntityId; reservedAt: ISODateTime; validUntil: ISODateTime }) {
    if (this.iceAllocations.has(input.allocationId)) throw new Error(`L'allocation de glace ${input.allocationId} existe déjà.`);
    const request = this.requireRequest(input.requestId);
    const asset = this.requireAsset(input.assetId);
    if (asset.type !== "ice_plant") throw new Error("L'actif sélectionné n'est pas une unité de production de glace.");
    if (asset.status !== "available") throw new Error("L'unité de glace n'est pas disponible.");
    const requirement = this.requireRequirement(request.speciesCode);
    const quantityKg = request.quantityKg * (requirement.iceRatioKgPerKg ?? 1);
    if ((asset.iceCapacityKgPerDay ?? 0) < quantityKg) throw new Error("La capacité de glace est insuffisante.");
    const allocation: IceAllocation = {
      id: input.allocationId,
      requestId: input.requestId,
      assetId: input.assetId,
      quantityKg,
      reservedAt: input.reservedAt,
      validUntil: input.validUntil,
      status: "reserved",
    };
    this.iceAllocations.set(allocation.id, allocation);
    return structuredClone(allocation);
  }

  planMission(input: LogisticsMission) {
    if (this.missions.has(input.id)) throw new Error(`La mission logistique ${input.id} existe déjà.`);
    const request = this.requireRequest(input.requestId);
    if (request.lotId !== input.lotId) throw new Error("Le lot de la mission ne correspond pas à la demande.");
    if (input.quantityKg <= 0 || input.quantityKg > request.quantityKg) throw new Error("La quantité de mission est invalide.");
    for (const assetId of input.assetIds) {
      const asset = this.requireAsset(assetId);
      if (asset.status !== "available") throw new Error(`L'actif ${assetId} n'est pas disponible.`);
      if (asset.capacityKg !== undefined && asset.capacityKg < input.quantityKg) throw new Error(`L'actif ${assetId} n'a pas assez de capacité.`);
    }
    if (input.plannedDeliveryAt <= input.plannedPickupAt) throw new Error("La livraison doit être postérieure à la collecte.");
    if (input.plannedDeliveryAt > request.deliveryBefore) throw new Error("La livraison planifiée dépasse l'échéance de la demande.");

    const mission: LogisticsMission = { ...structuredClone(input), status: "planned", coldChainStatus: request.coldChainRequired ? "not_started" : "completed" };
    this.missions.set(mission.id, mission);
    return structuredClone(mission);
  }

  reserveMission(input: { missionId: EntityId; reservedAt: ISODateTime }) {
    const mission = this.requireMission(input.missionId);
    if (mission.status !== "planned") throw new Error("La mission doit être planifiée avant réservation.");
    for (const assetId of mission.assetIds) {
      const asset = this.requireAsset(assetId);
      if (asset.status !== "available") throw new Error(`L'actif ${assetId} n'est plus disponible.`);
      asset.status = "reserved";
      this.assets.set(asset.id, asset);
    }
    mission.status = "reserved";
    mission.updatedAt = input.reservedAt;
    this.missions.set(mission.id, mission);
    const request = this.requireRequest(mission.requestId);
    request.status = "reserved";
    this.requests.set(request.id, request);
    return structuredClone(mission);
  }

  startMission(input: { missionId: EntityId; actualPickupAt: ISODateTime }) {
    const mission = this.requireMission(input.missionId);
    if (mission.status !== "reserved") throw new Error("La mission doit être réservée avant démarrage.");
    mission.status = "in_progress";
    mission.actualPickupAt = input.actualPickupAt;
    mission.coldChainStatus = this.requireRequest(mission.requestId).coldChainRequired ? "active" : "completed";
    mission.updatedAt = input.actualPickupAt;
    for (const assetId of mission.assetIds) {
      const asset = this.requireAsset(assetId);
      asset.status = "in_use";
      this.assets.set(asset.id, asset);
    }
    this.missions.set(mission.id, mission);
    return structuredClone(mission);
  }

  recordTemperature(input: TemperatureReading) {
    if (this.readings.has(input.id)) return structuredClone(this.readings.get(input.id)!);
    const mission = this.requireMission(input.missionId);
    if (mission.lotId !== input.lotId) throw new Error("Le lot ne correspond pas à la mission.");
    if (mission.status !== "in_progress") throw new Error("La mission doit être en cours pour enregistrer une température.");
    this.readings.set(input.id, structuredClone(input));
    const assessment = this.assessColdChain(input.missionId);
    mission.coldChainStatus = assessment.status;
    mission.updatedAt = input.recordedAt;
    this.missions.set(mission.id, mission);
    return { reading: structuredClone(input), assessment };
  }

  completeMission(input: { missionId: EntityId; actualDeliveryAt: ISODateTime }) {
    const mission = this.requireMission(input.missionId);
    if (mission.status !== "in_progress") throw new Error("La mission doit être en cours avant finalisation.");
    mission.status = "completed";
    mission.actualDeliveryAt = input.actualDeliveryAt;
    mission.updatedAt = input.actualDeliveryAt;
    const assessment = this.assessColdChain(mission.id);
    mission.coldChainStatus = assessment.status === "active" ? "completed" : assessment.status;
    for (const assetId of mission.assetIds) {
      const asset = this.requireAsset(assetId);
      asset.status = "available";
      this.assets.set(asset.id, asset);
    }
    this.missions.set(mission.id, mission);
    const request = this.requireRequest(mission.requestId);
    request.status = "fulfilled";
    this.requests.set(request.id, request);
    return { mission: structuredClone(mission), assessment: this.assessColdChain(mission.id) };
  }

  registerRoutePlan(input: RoutePlan) {
    if (this.routePlans.has(input.id)) throw new Error(`Le plan de route ${input.id} existe déjà.`);
    this.requireMission(input.missionId);
    if (input.distanceKm < 0 || input.durationHours < 0) throw new Error("La distance et la durée doivent être positives.");
    this.routePlans.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  assessColdChain(missionId: EntityId): ColdChainAssessment {
    const mission = this.requireMission(missionId);
    const request = this.requireRequest(mission.requestId);
    if (!request.coldChainRequired) {
      return {
        missionId,
        lotId: mission.lotId,
        status: "completed",
        compliance: "compliant",
        outOfRangeReadingCount: 0,
        breachDurationMinutes: 0,
        reasons: [],
        warnings: [],
      };
    }

    const requirement = this.requireRequirement(request.speciesCode);
    const readings = [...this.readings.values()]
      .filter((reading) => reading.missionId === missionId)
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    const warnings: string[] = [];
    const reasons: string[] = [];

    if (readings.length === 0) {
      warnings.push("Aucune température enregistrée.");
      return {
        missionId,
        lotId: mission.lotId,
        status: mission.status === "completed" ? "warning" : "active",
        compliance: "unknown",
        outOfRangeReadingCount: 0,
        breachDurationMinutes: 0,
        reasons,
        warnings,
      };
    }

    const outOfRange = readings.filter(
      (reading) => reading.temperatureCelsius < requirement.minimumTemperatureCelsius || reading.temperatureCelsius > requirement.maximumTemperatureCelsius,
    );
    let breachDurationMinutes = 0;
    for (let index = 1; index < readings.length; index += 1) {
      const previous = readings[index - 1];
      const current = readings[index];
      const previousOut = previous.temperatureCelsius < requirement.minimumTemperatureCelsius || previous.temperatureCelsius > requirement.maximumTemperatureCelsius;
      if (previousOut) breachDurationMinutes += Math.max(0, (new Date(current.recordedAt).getTime() - new Date(previous.recordedAt).getTime()) / 60000);
    }

    let status: ColdChainStatus = mission.status === "completed" ? "completed" : "active";
    let compliance: TemperatureCompliance = "compliant";
    if (outOfRange.length > 0) {
      status = "warning";
      compliance = "warning";
      warnings.push(`${outOfRange.length} relevé(s) hors plage autorisée.`);
    }
    if (breachDurationMinutes > requirement.maximumExposureMinutes) {
      status = "breached";
      compliance = "breach";
      reasons.push(`Dépassement de la durée maximale d'exposition de ${requirement.maximumExposureMinutes} minutes.`);
    }

    const actualDurationHours = mission.actualPickupAt && mission.actualDeliveryAt
      ? (new Date(mission.actualDeliveryAt).getTime() - new Date(mission.actualPickupAt).getTime()) / 3600000
      : undefined;
    if (actualDurationHours !== undefined && requirement.maximumTransitHours !== undefined && actualDurationHours > requirement.maximumTransitHours) {
      warnings.push(`Durée de transit supérieure à ${requirement.maximumTransitHours} heures.`);
      if (status === "completed") status = "warning";
      if (compliance === "compliant") compliance = "warning";
    }

    return {
      missionId,
      lotId: mission.lotId,
      status,
      compliance,
      minObservedTemperatureCelsius: Math.min(...readings.map((reading) => reading.temperatureCelsius)),
      maxObservedTemperatureCelsius: Math.max(...readings.map((reading) => reading.temperatureCelsius)),
      outOfRangeReadingCount: outOfRange.length,
      breachDurationMinutes: Math.round(breachDurationMinutes),
      reasons,
      warnings,
      lastReadingAt: readings.at(-1)?.recordedAt,
    };
  }

  getCapacitySnapshot(input: { territoryId?: EntityId; landingSiteId?: EntityId; at: ISODateTime }) {
    const assets = [...this.assets.values()].filter((asset) =>
      (!input.territoryId || asset.territoryId === input.territoryId) &&
      (!input.landingSiteId || asset.landingSiteId === input.landingSiteId) &&
      (!asset.availableFrom || asset.availableFrom <= input.at) &&
      (!asset.availableUntil || asset.availableUntil >= input.at),
    );
    return {
      territoryId: input.territoryId,
      landingSiteId: input.landingSiteId,
      generatedAt: input.at,
      totalAssetCount: assets.length,
      availableAssetCount: assets.filter((asset) => asset.status === "available").length,
      availableColdStorageKg: assets
        .filter((asset) => asset.status === "available" && ["cold_room", "landing_site_storage", "warehouse"].includes(asset.type))
        .reduce((sum, asset) => sum + (asset.capacityKg ?? 0), 0),
      availableTransportKg: assets
        .filter((asset) => asset.status === "available" && ["refrigerated_truck", "insulated_vehicle"].includes(asset.type))
        .reduce((sum, asset) => sum + (asset.capacityKg ?? 0), 0),
      availableIceKgPerDay: assets
        .filter((asset) => asset.status === "available" && asset.type === "ice_plant")
        .reduce((sum, asset) => sum + (asset.iceCapacityKgPerDay ?? 0), 0),
      unavailableAssets: assets.filter((asset) => ["maintenance", "unavailable"].includes(asset.status)).map((asset) => asset.id),
    };
  }

  snapshot() {
    return {
      requirements: [...this.requirements.values()].map((item) => structuredClone(item)),
      assets: [...this.assets.values()].map((item) => structuredClone(item)),
      requests: [...this.requests.values()].map((item) => structuredClone(item)),
      missions: [...this.missions.values()].map((item) => structuredClone(item)),
      readings: [...this.readings.values()].map((item) => structuredClone(item)),
      iceAllocations: [...this.iceAllocations.values()].map((item) => structuredClone(item)),
      routePlans: [...this.routePlans.values()].map((item) => structuredClone(item)),
    };
  }

  private requireAsset(id: EntityId) {
    const item = this.assets.get(id);
    if (!item) throw new Error(`Actif logistique introuvable : ${id}.`);
    return item;
  }

  private requireRequest(id: EntityId) {
    const item = this.requests.get(id);
    if (!item) throw new Error(`Demande logistique introuvable : ${id}.`);
    return item;
  }

  private requireMission(id: EntityId) {
    const item = this.missions.get(id);
    if (!item) throw new Error(`Mission logistique introuvable : ${id}.`);
    return item;
  }

  private requireRequirement(speciesCode: string) {
    const item = this.requirements.get(speciesCode);
    if (!item) throw new Error(`Exigence de chaîne du froid introuvable pour ${speciesCode}.`);
    return item;
  }
}

export function getDefaultColdChainRequirements() {
  return structuredClone(defaultRequirements);
}

export function validateColdChainCatalog() {
  const errors: string[] = [];
  const speciesCodes = new Set<string>();
  for (const item of defaultRequirements) {
    if (speciesCodes.has(item.speciesCode)) errors.push(`Exigence dupliquée pour ${item.speciesCode}.`);
    speciesCodes.add(item.speciesCode);
    if (item.maximumTemperatureCelsius <= item.minimumTemperatureCelsius) errors.push(`${item.speciesCode}: plage de température invalide.`);
    if (item.maximumExposureMinutes <= 0) errors.push(`${item.speciesCode}: durée d'exposition invalide.`);
    if ((item.iceRatioKgPerKg ?? 0) < 0) errors.push(`${item.speciesCode}: ratio de glace invalide.`);
  }
  return {
    valid: errors.length === 0,
    errors,
    summary: {
      requirementCount: defaultRequirements.length,
      supportedAssetTypes: ["ice_plant", "cold_room", "refrigerated_truck", "insulated_vehicle", "ice_box", "warehouse", "landing_site_storage"],
      currency: "XOF",
    },
  };
}
