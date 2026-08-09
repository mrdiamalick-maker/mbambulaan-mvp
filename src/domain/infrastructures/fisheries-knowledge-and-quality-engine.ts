import type { EntityId, ISODateTime } from "./types";

export type SpeciesStatus = "active" | "restricted" | "closed_season" | "protected" | "unknown";
export type QualityGrade = "premium" | "standard" | "processing" | "rejected" | "unknown";
export type TraceabilityEventType =
  | "catch_declared"
  | "landing_confirmed"
  | "weighing_verified"
  | "quality_inspected"
  | "lot_created"
  | "cold_chain_started"
  | "cold_chain_interrupted"
  | "ownership_transferred"
  | "received_by_buyer"
  | "transformed"
  | "closed";

export interface SpeciesDefinition {
  code: string;
  scientificName: string;
  commonNames: Record<string, string[]>;
  category: "pelagic" | "demersal" | "mollusc" | "crustacean" | "other";
  defaultStatus: SpeciesStatus;
  minimumSizeCm?: number;
  qualityShelfLifeHours?: number;
  coldChainRequired: boolean;
  permittedGearCodes: string[];
  forbiddenGearCodes: string[];
  highValue: boolean;
  regulated: boolean;
}

export interface FishingGearDefinition {
  code: string;
  name: string;
  description: string;
  selective: boolean;
  permittedSpeciesCodes: string[];
  prohibitedSpeciesCodes: string[];
  regulated: boolean;
}

export interface FishingZoneDefinition {
  id: EntityId;
  code: string;
  name: string;
  territoryId: EntityId;
  status: "open" | "restricted" | "closed";
  authorizedActorIds: EntityId[];
  authorizedGearCodes: string[];
  restrictedSpeciesCodes: string[];
  closureReason?: string;
  validFrom?: ISODateTime;
  validUntil?: ISODateTime;
}

export interface SeasonalRule {
  id: EntityId;
  speciesCode: string;
  territoryId?: EntityId;
  fishingZoneId?: EntityId;
  status: "open" | "restricted" | "closed";
  validFrom: ISODateTime;
  validUntil: ISODateTime;
  authorityActorId: EntityId;
  reason: string;
}

export interface QualityInspection {
  id: EntityId;
  lotId: EntityId;
  inspectorActorId: EntityId;
  inspectedAt: ISODateTime;
  appearanceScore: number;
  odorScore: number;
  textureScore: number;
  temperatureCelsius?: number;
  contaminationSuspected: boolean;
  packagingCompliant: boolean;
  grade: QualityGrade;
  remarks?: string;
  evidenceDocumentIds: EntityId[];
}

export interface TraceabilityEvent {
  id: EntityId;
  lotId: EntityId;
  type: TraceabilityEventType;
  actorId: EntityId;
  occurredAt: ISODateTime;
  territoryId?: EntityId;
  landingSiteId?: EntityId;
  vesselId?: EntityId;
  weighingId?: EntityId;
  serviceExecutionId?: EntityId;
  commitmentId?: EntityId;
  previousOwnerActorId?: EntityId;
  newOwnerActorId?: EntityId;
  payload: Record<string, unknown>;
}

export interface LotTraceabilityProfile {
  lotId: EntityId;
  speciesCode: string;
  vesselId?: EntityId;
  fisherActorId?: EntityId;
  landingSiteId?: EntityId;
  territoryId?: EntityId;
  catchDeclaredAt?: ISODateTime;
  landedAt?: ISODateTime;
  weighedAt?: ISODateTime;
  qualityInspectedAt?: ISODateTime;
  coldChainStartedAt?: ISODateTime;
  lastColdChainInterruptionAt?: ISODateTime;
  receivedByBuyerAt?: ISODateTime;
  currentOwnerActorId?: EntityId;
  currentQualityGrade: QualityGrade;
  netWeightKg?: number;
  traceabilityScore: number;
  qualityRiskScore: number;
  complianceStatus: "compliant" | "warning" | "blocked";
  blockingReasons: string[];
  warnings: string[];
  eventIds: EntityId[];
}

export interface CatchComplianceRequest {
  speciesCode: string;
  gearCode?: string;
  fishingZoneId?: EntityId;
  territoryId?: EntityId;
  catchDate: ISODateTime;
  specimenSizeCm?: number;
}

export interface CatchComplianceResult {
  compliant: boolean;
  blocked: boolean;
  reasons: string[];
  warnings: string[];
}

const speciesCatalog: SpeciesDefinition[] = [
  {
    code: "sardinella_aurita",
    scientificName: "Sardinella aurita",
    commonNames: { fr: ["Sardinelle ronde"], wo: ["Yaboy"], en: ["Round sardinella"] },
    category: "pelagic",
    defaultStatus: "active",
    qualityShelfLifeHours: 24,
    coldChainRequired: true,
    permittedGearCodes: ["purse_seine", "surrounding_net"],
    forbiddenGearCodes: [],
    highValue: false,
    regulated: true,
  },
  {
    code: "sardinella_maderensis",
    scientificName: "Sardinella maderensis",
    commonNames: { fr: ["Sardinelle plate"], wo: ["Yaboy tass"], en: ["Madeiran sardinella"] },
    category: "pelagic",
    defaultStatus: "active",
    qualityShelfLifeHours: 24,
    coldChainRequired: true,
    permittedGearCodes: ["purse_seine", "surrounding_net"],
    forbiddenGearCodes: [],
    highValue: false,
    regulated: true,
  },
  {
    code: "epinephelus_aeneus",
    scientificName: "Epinephelus aeneus",
    commonNames: { fr: ["Mérou blanc"], wo: ["Cof"], en: ["White grouper"] },
    category: "demersal",
    defaultStatus: "restricted",
    minimumSizeCm: 45,
    qualityShelfLifeHours: 48,
    coldChainRequired: true,
    permittedGearCodes: ["handline", "longline", "gillnet"],
    forbiddenGearCodes: ["beach_seine"],
    highValue: true,
    regulated: true,
  },
  {
    code: "octopus_vulgaris",
    scientificName: "Octopus vulgaris",
    commonNames: { fr: ["Poulpe commun"], wo: ["Yaar"], en: ["Common octopus"] },
    category: "mollusc",
    defaultStatus: "active",
    qualityShelfLifeHours: 48,
    coldChainRequired: true,
    permittedGearCodes: ["pot", "handline"],
    forbiddenGearCodes: [],
    highValue: true,
    regulated: true,
  },
  {
    code: "penaeus_notialis",
    scientificName: "Penaeus notialis",
    commonNames: { fr: ["Crevette rose du sud"], en: ["Southern pink shrimp"] },
    category: "crustacean",
    defaultStatus: "active",
    qualityShelfLifeHours: 24,
    coldChainRequired: true,
    permittedGearCodes: ["shrimp_net"],
    forbiddenGearCodes: [],
    highValue: true,
    regulated: true,
  },
];

const gearCatalog: FishingGearDefinition[] = [
  {
    code: "purse_seine",
    name: "Senne tournante",
    description: "Engin encerclant utilisé principalement pour les espèces pélagiques.",
    selective: false,
    permittedSpeciesCodes: ["sardinella_aurita", "sardinella_maderensis"],
    prohibitedSpeciesCodes: ["epinephelus_aeneus"],
    regulated: true,
  },
  {
    code: "handline",
    name: "Ligne à main",
    description: "Engin artisanal sélectif adapté aux espèces démersales.",
    selective: true,
    permittedSpeciesCodes: ["epinephelus_aeneus", "octopus_vulgaris"],
    prohibitedSpeciesCodes: [],
    regulated: false,
  },
  {
    code: "longline",
    name: "Palangre",
    description: "Ligne principale munie de plusieurs hameçons.",
    selective: true,
    permittedSpeciesCodes: ["epinephelus_aeneus"],
    prohibitedSpeciesCodes: [],
    regulated: true,
  },
  {
    code: "gillnet",
    name: "Filet maillant",
    description: "Filet vertical retenant les poissons selon la maille.",
    selective: false,
    permittedSpeciesCodes: ["epinephelus_aeneus"],
    prohibitedSpeciesCodes: [],
    regulated: true,
  },
  {
    code: "beach_seine",
    name: "Senne de plage",
    description: "Engin tiré depuis la plage, fortement encadré selon les zones.",
    selective: false,
    permittedSpeciesCodes: [],
    prohibitedSpeciesCodes: ["epinephelus_aeneus"],
    regulated: true,
  },
  {
    code: "pot",
    name: "Casier",
    description: "Engin passif notamment utilisé pour le poulpe.",
    selective: true,
    permittedSpeciesCodes: ["octopus_vulgaris"],
    prohibitedSpeciesCodes: [],
    regulated: true,
  },
  {
    code: "shrimp_net",
    name: "Filet à crevettes",
    description: "Engin ciblant les crevettes côtières.",
    selective: false,
    permittedSpeciesCodes: ["penaeus_notialis"],
    prohibitedSpeciesCodes: [],
    regulated: true,
  },
];

export class FisheriesKnowledgeAndQualityEngine {
  private readonly species = new Map(speciesCatalog.map((item) => [item.code, item]));
  private readonly gears = new Map(gearCatalog.map((item) => [item.code, item]));
  private readonly zones = new Map<EntityId, FishingZoneDefinition>();
  private readonly seasonalRules = new Map<EntityId, SeasonalRule>();
  private readonly inspections = new Map<EntityId, QualityInspection>();
  private readonly traceabilityEvents = new Map<EntityId, TraceabilityEvent>();
  private readonly lotSpecies = new Map<EntityId, string>();

  registerSpecies(input: SpeciesDefinition) {
    if (this.species.has(input.code)) throw new Error(`L'espèce ${input.code} existe déjà.`);
    this.species.set(input.code, structuredClone(input));
    return structuredClone(input);
  }

  registerGear(input: FishingGearDefinition) {
    if (this.gears.has(input.code)) throw new Error(`L'engin ${input.code} existe déjà.`);
    this.gears.set(input.code, structuredClone(input));
    return structuredClone(input);
  }

  registerFishingZone(input: FishingZoneDefinition) {
    if (this.zones.has(input.id)) throw new Error(`La zone ${input.id} existe déjà.`);
    this.zones.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  registerSeasonalRule(input: SeasonalRule) {
    if (this.seasonalRules.has(input.id)) throw new Error(`La règle saisonnière ${input.id} existe déjà.`);
    if (!this.species.has(input.speciesCode)) throw new Error(`Espèce inconnue : ${input.speciesCode}.`);
    if (input.validUntil <= input.validFrom) throw new Error("La fin de validité doit être postérieure au début.");
    this.seasonalRules.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  evaluateCatchCompliance(request: CatchComplianceRequest): CatchComplianceResult {
    const species = this.requireSpecies(request.speciesCode);
    const reasons: string[] = [];
    const warnings: string[] = [];
    let blocked = false;

    if (species.defaultStatus === "protected") {
      reasons.push("Espèce protégée.");
      blocked = true;
    }
    if (species.defaultStatus === "closed_season") {
      reasons.push("Espèce en fermeture de pêche.");
      blocked = true;
    }
    if (species.defaultStatus === "restricted") {
      warnings.push("Espèce soumise à restrictions spécifiques.");
    }

    if (request.specimenSizeCm !== undefined && species.minimumSizeCm !== undefined) {
      if (request.specimenSizeCm < species.minimumSizeCm) {
        reasons.push(`Taille inférieure au minimum de ${species.minimumSizeCm} cm.`);
        blocked = true;
      }
    }

    if (request.gearCode) {
      const gear = this.requireGear(request.gearCode);
      if (species.forbiddenGearCodes.includes(gear.code) || gear.prohibitedSpeciesCodes.includes(species.code)) {
        reasons.push(`Engin ${gear.name} interdit pour cette espèce.`);
        blocked = true;
      }
      if (species.permittedGearCodes.length > 0 && !species.permittedGearCodes.includes(gear.code)) {
        warnings.push(`Engin non référencé comme engin recommandé pour ${species.scientificName}.`);
      }
    }

    if (request.fishingZoneId) {
      const zone = this.requireZone(request.fishingZoneId);
      if (zone.status === "closed") {
        reasons.push(`Zone fermée : ${zone.closureReason ?? "fermeture réglementaire"}.`);
        blocked = true;
      }
      if (zone.restrictedSpeciesCodes.includes(species.code)) {
        reasons.push("Espèce interdite ou restreinte dans cette zone.");
        blocked = true;
      }
      if (request.gearCode && zone.authorizedGearCodes.length > 0 && !zone.authorizedGearCodes.includes(request.gearCode)) {
        reasons.push("Engin non autorisé dans cette zone.");
        blocked = true;
      }
    }

    const seasonalRules = [...this.seasonalRules.values()].filter((rule) => {
      if (rule.speciesCode !== species.code) return false;
      if (rule.validFrom > request.catchDate || rule.validUntil < request.catchDate) return false;
      if (rule.territoryId && rule.territoryId !== request.territoryId) return false;
      if (rule.fishingZoneId && rule.fishingZoneId !== request.fishingZoneId) return false;
      return true;
    });

    for (const rule of seasonalRules) {
      if (rule.status === "closed") {
        reasons.push(`Fermeture saisonnière : ${rule.reason}.`);
        blocked = true;
      } else if (rule.status === "restricted") {
        warnings.push(`Restriction saisonnière : ${rule.reason}.`);
      }
    }

    return {
      compliant: !blocked,
      blocked,
      reasons,
      warnings,
    };
  }

  registerTraceabilityEvent(input: TraceabilityEvent) {
    if (this.traceabilityEvents.has(input.id)) {
      return structuredClone(this.traceabilityEvents.get(input.id)!);
    }
    if (input.type === "lot_created") {
      const speciesCode = String(input.payload.speciesCode ?? "");
      if (!speciesCode) throw new Error("Le code espèce est obligatoire à la création du lot.");
      this.requireSpecies(speciesCode);
      this.lotSpecies.set(input.lotId, speciesCode);
    }
    this.traceabilityEvents.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  registerQualityInspection(input: QualityInspection) {
    if (this.inspections.has(input.id)) throw new Error(`L'inspection ${input.id} existe déjà.`);
    this.validateInspection(input);
    this.inspections.set(input.id, structuredClone(input));
    this.registerTraceabilityEvent({
      id: `trace:quality:${input.id}`,
      lotId: input.lotId,
      type: "quality_inspected",
      actorId: input.inspectorActorId,
      occurredAt: input.inspectedAt,
      payload: {
        grade: input.grade,
        temperatureCelsius: input.temperatureCelsius,
        contaminationSuspected: input.contaminationSuspected,
        packagingCompliant: input.packagingCompliant,
      },
    });
    return structuredClone(input);
  }

  buildLotTraceabilityProfile(lotId: EntityId): LotTraceabilityProfile {
    const events = [...this.traceabilityEvents.values()]
      .filter((event) => event.lotId === lotId)
      .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
    if (events.length === 0) throw new Error(`Aucun événement de traçabilité pour le lot ${lotId}.`);

    const speciesCode = this.lotSpecies.get(lotId) ?? String(events.find((event) => event.payload.speciesCode)?.payload.speciesCode ?? "");
    const species = this.requireSpecies(speciesCode);
    const warnings: string[] = [];
    const blockingReasons: string[] = [];

    const catchEvent = events.find((event) => event.type === "catch_declared");
    const landingEvent = events.find((event) => event.type === "landing_confirmed");
    const weighingEvent = events.find((event) => event.type === "weighing_verified");
    const qualityEvent = [...events].reverse().find((event) => event.type === "quality_inspected");
    const coldStart = events.find((event) => event.type === "cold_chain_started");
    const coldInterruptions = events.filter((event) => event.type === "cold_chain_interrupted");
    const buyerReceipt = events.find((event) => event.type === "received_by_buyer");
    const lastTransfer = [...events].reverse().find((event) => event.type === "ownership_transferred");
    const inspection = [...this.inspections.values()]
      .filter((item) => item.lotId === lotId)
      .sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt))[0];

    if (!landingEvent) blockingReasons.push("Débarquement non confirmé.");
    if (!weighingEvent) blockingReasons.push("Pesée non vérifiée.");
    if (!qualityEvent) warnings.push("Contrôle qualité absent.");
    if (species.coldChainRequired && !coldStart) warnings.push("Démarrage de chaîne du froid non enregistré.");
    if (coldInterruptions.length > 0) blockingReasons.push("Rupture de chaîne du froid signalée.");
    if (inspection?.contaminationSuspected) blockingReasons.push("Suspicion de contamination.");
    if (inspection && !inspection.packagingCompliant) warnings.push("Conditionnement non conforme.");
    if (inspection?.grade === "rejected") blockingReasons.push("Lot rejeté lors du contrôle qualité.");

    const expectedSteps: TraceabilityEventType[] = [
      "catch_declared",
      "landing_confirmed",
      "weighing_verified",
      "lot_created",
      "quality_inspected",
    ];
    if (species.coldChainRequired) expectedSteps.push("cold_chain_started");
    const completedSteps = expectedSteps.filter((step) => events.some((event) => event.type === step)).length;
    const traceabilityScore = Math.round((completedSteps / expectedSteps.length) * 100);

    let qualityRiskScore = 0;
    if (!qualityEvent) qualityRiskScore += 20;
    if (species.coldChainRequired && !coldStart) qualityRiskScore += 20;
    if (coldInterruptions.length > 0) qualityRiskScore += 35;
    if (inspection?.contaminationSuspected) qualityRiskScore += 50;
    if (inspection && !inspection.packagingCompliant) qualityRiskScore += 10;
    if (inspection?.grade === "processing") qualityRiskScore += 20;
    if (inspection?.grade === "rejected") qualityRiskScore = 100;
    qualityRiskScore = Math.min(100, qualityRiskScore);

    return {
      lotId,
      speciesCode,
      vesselId: catchEvent?.vesselId ?? landingEvent?.vesselId,
      fisherActorId: catchEvent?.actorId,
      landingSiteId: landingEvent?.landingSiteId,
      territoryId: landingEvent?.territoryId,
      catchDeclaredAt: catchEvent?.occurredAt,
      landedAt: landingEvent?.occurredAt,
      weighedAt: weighingEvent?.occurredAt,
      qualityInspectedAt: qualityEvent?.occurredAt,
      coldChainStartedAt: coldStart?.occurredAt,
      lastColdChainInterruptionAt: coldInterruptions.at(-1)?.occurredAt,
      receivedByBuyerAt: buyerReceipt?.occurredAt,
      currentOwnerActorId: lastTransfer?.newOwnerActorId ?? buyerReceipt?.actorId,
      currentQualityGrade: inspection?.grade ?? "unknown",
      netWeightKg: Number(weighingEvent?.payload.netWeightKg ?? 0) || undefined,
      traceabilityScore,
      qualityRiskScore,
      complianceStatus: blockingReasons.length > 0 ? "blocked" : warnings.length > 0 ? "warning" : "compliant",
      blockingReasons,
      warnings,
      eventIds: events.map((event) => event.id),
    };
  }

  canPublishLot(lotId: EntityId) {
    const profile = this.buildLotTraceabilityProfile(lotId);
    return {
      allowed: profile.complianceStatus !== "blocked" && profile.traceabilityScore >= 60,
      reasons: profile.blockingReasons,
      warnings: profile.warnings,
      profile,
    };
  }

  canDeliverLot(lotId: EntityId) {
    const profile = this.buildLotTraceabilityProfile(lotId);
    const reasons = [...profile.blockingReasons];
    if (profile.traceabilityScore < 80) reasons.push("Traçabilité insuffisante pour la livraison.");
    if (profile.currentQualityGrade === "unknown") reasons.push("Qualité non évaluée.");
    return {
      allowed: reasons.length === 0,
      reasons,
      warnings: profile.warnings,
      profile,
    };
  }

  getLotCertificate(lotId: EntityId) {
    const profile = this.buildLotTraceabilityProfile(lotId);
    const species = this.requireSpecies(profile.speciesCode);
    return {
      certificateCode: `MBA-LOT-${lotId}`,
      lotId,
      species: {
        code: species.code,
        scientificName: species.scientificName,
        commonNames: structuredClone(species.commonNames),
      },
      origin: {
        vesselId: profile.vesselId,
        fisherActorId: profile.fisherActorId,
        landingSiteId: profile.landingSiteId,
        territoryId: profile.territoryId,
      },
      operations: {
        catchDeclaredAt: profile.catchDeclaredAt,
        landedAt: profile.landedAt,
        weighedAt: profile.weighedAt,
        qualityInspectedAt: profile.qualityInspectedAt,
        coldChainStartedAt: profile.coldChainStartedAt,
        receivedByBuyerAt: profile.receivedByBuyerAt,
      },
      quality: {
        grade: profile.currentQualityGrade,
        qualityRiskScore: profile.qualityRiskScore,
        complianceStatus: profile.complianceStatus,
      },
      traceabilityScore: profile.traceabilityScore,
      blockingReasons: profile.blockingReasons,
      warnings: profile.warnings,
      verifiable: profile.traceabilityScore >= 80 && profile.complianceStatus !== "blocked",
    };
  }

  snapshot() {
    return {
      species: [...this.species.values()].map((item) => structuredClone(item)),
      gears: [...this.gears.values()].map((item) => structuredClone(item)),
      zones: [...this.zones.values()].map((item) => structuredClone(item)),
      seasonalRules: [...this.seasonalRules.values()].map((item) => structuredClone(item)),
      inspections: [...this.inspections.values()].map((item) => structuredClone(item)),
      traceabilityEvents: [...this.traceabilityEvents.values()].map((item) => structuredClone(item)),
    };
  }

  private validateInspection(input: QualityInspection) {
    for (const [label, value] of [
      ["apparence", input.appearanceScore],
      ["odeur", input.odorScore],
      ["texture", input.textureScore],
    ] as const) {
      if (value < 0 || value > 100) throw new Error(`Le score ${label} doit être compris entre 0 et 100.`);
    }
    if (input.contaminationSuspected && input.grade !== "rejected") {
      throw new Error("Un lot avec suspicion de contamination doit être rejeté.");
    }
  }

  private requireSpecies(code: string) {
    const item = this.species.get(code);
    if (!item) throw new Error(`Espèce inconnue : ${code}.`);
    return item;
  }

  private requireGear(code: string) {
    const item = this.gears.get(code);
    if (!item) throw new Error(`Engin de pêche inconnu : ${code}.`);
    return item;
  }

  private requireZone(id: EntityId) {
    const item = this.zones.get(id);
    if (!item) throw new Error(`Zone de pêche inconnue : ${id}.`);
    return item;
  }
}

export function getFisheriesKnowledgeCatalog() {
  return {
    species: structuredClone(speciesCatalog),
    gears: structuredClone(gearCatalog),
  };
}

export function validateFisheriesKnowledgeCatalog() {
  const errors: string[] = [];
  const speciesCodes = new Set<string>();
  const gearCodes = new Set<string>();

  for (const species of speciesCatalog) {
    if (speciesCodes.has(species.code)) errors.push(`Code espèce dupliqué : ${species.code}.`);
    speciesCodes.add(species.code);
    if (!species.scientificName.trim()) errors.push(`${species.code}: nom scientifique manquant.`);
    if (species.coldChainRequired && !species.qualityShelfLifeHours) {
      errors.push(`${species.code}: durée de conservation manquante.`);
    }
  }

  for (const gear of gearCatalog) {
    if (gearCodes.has(gear.code)) errors.push(`Code engin dupliqué : ${gear.code}.`);
    gearCodes.add(gear.code);
    for (const speciesCode of [...gear.permittedSpeciesCodes, ...gear.prohibitedSpeciesCodes]) {
      if (!speciesCodes.has(speciesCode)) errors.push(`${gear.code}: espèce inconnue ${speciesCode}.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      speciesCount: speciesCatalog.length,
      gearCount: gearCatalog.length,
      regulatedSpeciesCount: speciesCatalog.filter((item) => item.regulated).length,
      highValueSpeciesCount: speciesCatalog.filter((item) => item.highValue).length,
      coldChainSpeciesCount: speciesCatalog.filter((item) => item.coldChainRequired).length,
    },
  };
}
