import type { EntityId, ISODateTime } from "../infrastructures/types";

export type ClimateRiskType =
  | "rough_sea"
  | "storm"
  | "heatwave"
  | "coastal_flooding"
  | "salinity_change"
  | "oxygen_depletion"
  | "cold_chain_disruption"
  | "species_migration"
  | "stock_decline"
  | "pollution"
  | "harmful_algal_bloom";

export type ResourceMeasureType =
  | "seasonal_closure"
  | "area_closure"
  | "species_quota"
  | "gear_restriction"
  | "minimum_size"
  | "effort_reduction"
  | "protected_area"
  | "landing_limit"
  | "traceability_requirement";

export interface EnvironmentalSignal {
  id: EntityId;
  territoryId: EntityId;
  riskType: ClimateRiskType;
  severity: "low" | "medium" | "high" | "critical";
  probabilityPercent: number;
  confidencePercent: number;
  validFrom: ISODateTime;
  validUntil: ISODateTime;
  sourceActorId?: EntityId;
  sourceReferenceIds: EntityId[];
  evidenceIds: EntityId[];
  expectedEffects: string[];
}

export interface ResourcePressureAssessment {
  id: EntityId;
  territoryId: EntityId;
  speciesCode: string;
  stockStatus: "healthy" | "under_pressure" | "overfished" | "critical" | "unknown";
  fishingEffortIndex: number;
  catchPerUnitEffortChangePercent: number;
  juvenileCatchPercent: number;
  illegalFishingRiskScore: number;
  ecosystemImpactScore: number;
  assessedAt: ISODateTime;
  evidenceIds: EntityId[];
}

export interface ResourceManagementMeasure {
  id: EntityId;
  measureType: ResourceMeasureType;
  territoryIds: EntityId[];
  speciesCodes: string[];
  decidedByActorId: EntityId;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  quotaQuantityKg?: number;
  maximumTrips?: number;
  allowedGearCodes: string[];
  minimumSizeCm?: number;
  rationale: string[];
  status: "proposed" | "approved" | "active" | "suspended" | "expired" | "revoked";
  evidenceIds: EntityId[];
}

export interface ClimateAdaptationAction {
  id: EntityId;
  actionType:
    | "delay_campaign"
    | "reroute_vessels"
    | "activate_safe_harbor"
    | "preposition_ice"
    | "secure_cold_storage"
    | "mobilize_transport"
    | "protect_facility"
    | "income_support"
    | "insurance_activation"
    | "alternative_livelihood_support"
    | "ecosystem_restoration"
    | "communication";
  territoryIds: EntityId[];
  ownerActorId: EntityId;
  beneficiaryActorIds: EntityId[];
  relatedSignalIds: EntityId[];
  relatedMeasureIds: EntityId[];
  plannedStartAt: ISODateTime;
  plannedEndAt: ISODateTime;
  budgetXof: number;
  expectedProtectedValueXof: number;
  expectedProtectedJobs: number;
  expectedAvoidedLossKg: number;
  status: "planned" | "ready" | "active" | "blocked" | "completed" | "cancelled";
  evidenceIds: EntityId[];
  completedAt?: ISODateTime;
}

export interface FishingActivityDecision {
  id: EntityId;
  campaignId?: EntityId;
  vesselId?: EntityId;
  territoryId: EntityId;
  speciesCode?: string;
  decision: "authorized" | "authorized_with_conditions" | "delayed" | "restricted" | "prohibited";
  reasons: string[];
  conditions: string[];
  relatedSignalIds: EntityId[];
  relatedMeasureIds: EntityId[];
  decidedByActorId: EntityId;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  evidenceIds: EntityId[];
}

export interface ResilienceSupport {
  id: EntityId;
  supportType: "cash_transfer" | "equipment" | "insurance_payout" | "fuel_support" | "food_support" | "training" | "debt_restructuring";
  beneficiaryActorId: EntityId;
  territoryId: EntityId;
  amountXof: number;
  quantity?: number;
  unit?: string;
  relatedActionId?: EntityId;
  status: "planned" | "approved" | "delivered" | "rejected" | "reversed";
  evidenceIds: EntityId[];
  deliveredAt?: ISODateTime;
}

export interface ClimateResourceOutcome {
  id: EntityId;
  measuredAt: ISODateTime;
  avoidedLossKg: number;
  protectedValueXof: number;
  protectedJobs: number;
  supportedActorCount: number;
  fishingEffortChangePercent: number;
  juvenileCatchChangePercent: number;
  stockPressureChangePercent: number;
  ecosystemRestoredHectares: number;
  platformRevenueXof: number;
  confidencePercent: number;
  evidenceIds: EntityId[];
}

export interface ClimateResourceResilienceCase {
  id: EntityId;
  caseCode: string;
  countryId: EntityId;
  territoryIds: EntityId[];
  status: "monitoring" | "alert" | "responding" | "recovering" | "stable" | "closed";
  signals: EnvironmentalSignal[];
  pressureAssessments: ResourcePressureAssessment[];
  measures: ResourceManagementMeasure[];
  actions: ClimateAdaptationAction[];
  activityDecisions: FishingActivityDecision[];
  supports: ResilienceSupport[];
  outcomes: ClimateResourceOutcome[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export class EndToEndClimateResourceResilienceCapability {
  private readonly cases = new Map<EntityId, ClimateResourceResilienceCase>();

  openCase(input: { id: EntityId; caseCode: string; countryId: EntityId; territoryIds: EntityId[]; createdAt: ISODateTime }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier ${input.id} existe déjà.`);
    const item: ClimateResourceResilienceCase = {
      id: input.id,
      caseCode: input.caseCode,
      countryId: input.countryId,
      territoryIds: [...new Set(input.territoryIds)],
      status: "monitoring",
      signals: [],
      pressureAssessments: [],
      measures: [],
      actions: [],
      activityDecisions: [],
      supports: [],
      outcomes: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  registerSignal(input: { caseId: EntityId; signal: EnvironmentalSignal }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.signal.territoryId);
    if (input.signal.validUntil <= input.signal.validFrom) throw new Error("La période du signal est invalide.");
    if (input.signal.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour un signal environnemental.");
    item.signals.push(structuredClone(input.signal));
    if (["high", "critical"].includes(input.signal.severity)) item.status = "alert";
    this.touch(item, input.signal.validFrom);
    return structuredClone(item);
  }

  assessResourcePressure(input: { caseId: EntityId; assessment: ResourcePressureAssessment }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.assessment.territoryId);
    if (input.assessment.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour évaluer la ressource.");
    item.pressureAssessments.push(structuredClone(input.assessment));
    if (["overfished", "critical"].includes(input.assessment.stockStatus)) item.status = "alert";
    this.touch(item, input.assessment.assessedAt);
    return structuredClone(item);
  }

  decideMeasure(input: { caseId: EntityId; measure: ResourceManagementMeasure; decidedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    for (const territoryId of input.measure.territoryIds) this.requireTerritory(item, territoryId);
    if (input.measure.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour une mesure de gestion.");
    if (input.measure.validUntil && input.measure.validUntil <= input.measure.validFrom) throw new Error("La période de la mesure est invalide.");
    item.measures.push(structuredClone(input.measure));
    this.touch(item, input.decidedAt);
    return structuredClone(item);
  }

  planAdaptationAction(input: { caseId: EntityId; action: ClimateAdaptationAction; plannedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    for (const territoryId of input.action.territoryIds) this.requireTerritory(item, territoryId);
    for (const signalId of input.action.relatedSignalIds) this.requireSignal(item, signalId);
    for (const measureId of input.action.relatedMeasureIds) this.requireMeasure(item, measureId);
    if (input.action.plannedEndAt <= input.action.plannedStartAt) throw new Error("La période d'action est invalide.");
    if (input.action.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour planifier une action.");
    item.actions.push(structuredClone(input.action));
    item.status = "responding";
    this.touch(item, input.plannedAt);
    return structuredClone(item);
  }

  decideFishingActivity(input: { caseId: EntityId; decision: FishingActivityDecision }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.decision.territoryId);
    for (const signalId of input.decision.relatedSignalIds) this.requireSignal(item, signalId);
    for (const measureId of input.decision.relatedMeasureIds) this.requireMeasure(item, measureId);
    if (input.decision.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour décider l'activité de pêche.");
    const criticalActiveSignal = item.signals.some((signal) => input.decision.relatedSignalIds.includes(signal.id) && signal.severity === "critical" && signal.validFrom <= input.decision.validFrom && signal.validUntil >= input.decision.validFrom);
    const activeClosure = item.measures.some((measure) => input.decision.relatedMeasureIds.includes(measure.id) && ["seasonal_closure", "area_closure"].includes(measure.measureType) && ["approved", "active"].includes(measure.status));
    if ((criticalActiveSignal || activeClosure) && ["authorized", "authorized_with_conditions"].includes(input.decision.decision)) throw new Error("L'activité ne peut pas être autorisée sous alerte critique ou fermeture active.");
    item.activityDecisions.push(structuredClone(input.decision));
    this.touch(item, input.decision.validFrom);
    return structuredClone(item);
  }

  deliverSupport(input: { caseId: EntityId; support: ResilienceSupport; deliveredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.support.territoryId);
    if (input.support.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour délivrer un soutien.");
    if (input.support.amountXof < 0) throw new Error("Le montant de soutien ne peut pas être négatif.");
    if (input.support.relatedActionId) this.requireAction(item, input.support.relatedActionId);
    const support = structuredClone(input.support);
    support.status = "delivered";
    support.deliveredAt = input.deliveredAt;
    item.supports.push(support);
    this.touch(item, input.deliveredAt);
    return structuredClone(support);
  }

  completeAction(input: { caseId: EntityId; actionId: EntityId; completedAt: ISODateTime; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    const action = this.requireAction(item, input.actionId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour terminer une action.");
    action.status = "completed";
    action.completedAt = input.completedAt;
    action.evidenceIds = this.unique([...action.evidenceIds, ...input.evidenceIds]);
    item.status = "recovering";
    this.touch(item, input.completedAt);
    return structuredClone(action);
  }

  recordOutcome(input: { caseId: EntityId; outcome: ClimateResourceOutcome }) {
    const item = this.requireCase(input.caseId);
    if (input.outcome.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour mesurer les résultats.");
    item.outcomes.push(structuredClone(input.outcome));
    item.status = "stable";
    this.touch(item, input.outcome.measuredAt);
    return structuredClone(input.outcome);
  }

  getResilienceCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const activeSignals = item.signals.filter((signal) => signal.validFrom <= input.generatedAt && signal.validUntil >= input.generatedAt);
    const activeMeasures = item.measures.filter((measure) => ["approved", "active"].includes(measure.status) && measure.validFrom <= input.generatedAt && (!measure.validUntil || measure.validUntil >= input.generatedAt));
    const outcomes = item.outcomes;
    return {
      caseId: item.id,
      status: item.status,
      activeSignalCount: activeSignals.length,
      criticalSignalCount: activeSignals.filter((signal) => signal.severity === "critical").length,
      pressuredSpeciesCount: new Set(item.pressureAssessments.filter((assessment) => ["overfished", "critical"].includes(assessment.stockStatus)).map((assessment) => assessment.speciesCode)).size,
      activeMeasureCount: activeMeasures.length,
      restrictedTerritoryCount: new Set(item.activityDecisions.filter((decision) => ["delayed", "restricted", "prohibited"].includes(decision.decision)).map((decision) => decision.territoryId)).size,
      activeActionCount: item.actions.filter((action) => action.status === "active" || action.status === "ready").length,
      completedActionCount: item.actions.filter((action) => action.status === "completed").length,
      deliveredSupportXof: item.supports.filter((support) => support.status === "delivered").reduce((sum, support) => sum + support.amountXof, 0),
      avoidedLossKg: outcomes.reduce((sum, outcome) => sum + outcome.avoidedLossKg, 0),
      protectedValueXof: outcomes.reduce((sum, outcome) => sum + outcome.protectedValueXof, 0),
      protectedJobs: outcomes.reduce((sum, outcome) => sum + outcome.protectedJobs, 0),
      supportedActorCount: outcomes.reduce((sum, outcome) => sum + outcome.supportedActorCount, 0),
      ecosystemRestoredHectares: outcomes.reduce((sum, outcome) => sum + outcome.ecosystemRestoredHectares, 0),
      platformRevenueXof: outcomes.reduce((sum, outcome) => sum + outcome.platformRevenueXof, 0),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier de résilience introuvable : ${id}.`);
    return item;
  }

  private requireTerritory(item: ClimateResourceResilienceCase, id: EntityId) {
    if (!item.territoryIds.includes(id)) throw new Error(`Territoire hors périmètre : ${id}.`);
  }

  private requireSignal(item: ClimateResourceResilienceCase, id: EntityId) {
    const value = item.signals.find((entry) => entry.id === id);
    if (!value) throw new Error(`Signal environnemental introuvable : ${id}.`);
    return value;
  }

  private requireMeasure(item: ClimateResourceResilienceCase, id: EntityId) {
    const value = item.measures.find((entry) => entry.id === id);
    if (!value) throw new Error(`Mesure de gestion introuvable : ${id}.`);
    return value;
  }

  private requireAction(item: ClimateResourceResilienceCase, id: EntityId) {
    const value = item.actions.find((entry) => entry.id === id);
    if (!value) throw new Error(`Action d'adaptation introuvable : ${id}.`);
    return value;
  }

  private touch(item: ClimateResourceResilienceCase, updatedAt: ISODateTime) {
    item.updatedAt = updatedAt;
    this.cases.set(item.id, item);
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }
}
