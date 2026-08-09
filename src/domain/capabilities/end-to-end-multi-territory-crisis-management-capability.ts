import type { EntityId, ISODateTime } from "../infrastructures/types";

export type CrisisStatus =
  | "detected"
  | "qualified"
  | "mobilizing"
  | "responding"
  | "stabilizing"
  | "recovering"
  | "closed"
  | "cancelled";

export type CrisisSeverity = "low" | "moderate" | "high" | "critical" | "national_emergency";

export type CrisisType =
  | "resource_collapse"
  | "cold_chain_failure"
  | "sanitary_alert"
  | "logistics_disruption"
  | "market_disruption"
  | "fuel_shortage"
  | "weather_event"
  | "financing_disruption"
  | "social_tension"
  | "multi_factor";

export interface CrisisTerritoryImpact {
  territoryId: EntityId;
  territorialSupervisionCaseId: EntityId;
  severity: CrisisSeverity;
  affectedActorCount: number;
  affectedCampaignCount: number;
  exposedVolumeKg: number;
  exposedEconomicValueXof: number;
  estimatedJobsAtRisk: number;
  foodSecurityImpactScore: number;
  sustainabilityImpactScore: number;
  serviceContinuityScore: number;
  criticalAlertIds: EntityId[];
  blockers: string[];
  updatedAt: ISODateTime;
}

export interface CrisisCommandStructure {
  nationalLeadActorId: EntityId;
  territorialLeadActorIds: EntityId[];
  technicalLeadActorIds: EntityId[];
  logisticsLeadActorId?: EntityId;
  financeLeadActorId?: EntityId;
  communicationsLeadActorId?: EntityId;
  ministryDecisionMakerIds: EntityId[];
  partnerActorIds: EntityId[];
  activatedAt?: ISODateTime;
}

export interface CrisisCapacityRequirement {
  id: EntityId;
  territoryId: EntityId;
  capacityType:
    | "ice"
    | "cold_storage"
    | "transport"
    | "landing"
    | "quality_control"
    | "processing"
    | "fuel"
    | "finance"
    | "insurance"
    | "human_support"
    | "communication";
  requiredQuantity: number;
  availableQuantity: number;
  mobilizedQuantity: number;
  unit: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedCostXof: number;
  status: "identified" | "validated" | "partially_covered" | "covered" | "unavailable" | "cancelled";
  sourceTerritoryIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface CrisisDecision {
  id: EntityId;
  decisionType:
    | "activate_cell"
    | "restrict_activity"
    | "reallocate_capacity"
    | "release_funding"
    | "activate_insurance"
    | "redirect_supply"
    | "support_actors"
    | "public_communication"
    | "close_crisis";
  territoryIds: EntityId[];
  decidedByActorId: EntityId;
  rationale: string;
  conditions: string[];
  budgetAuthorizedXof: number;
  recommendationIds: EntityId[];
  policyScenarioIds: EntityId[];
  evidenceIds: EntityId[];
  decidedAt: ISODateTime;
}

export interface CrisisAction {
  id: EntityId;
  decisionId: EntityId;
  territoryIds: EntityId[];
  actionType:
    | "capacity_transfer"
    | "emergency_procurement"
    | "temporary_storage"
    | "alternative_transport"
    | "quality_intervention"
    | "market_redirection"
    | "cash_support"
    | "insurance_claim"
    | "resource_protection"
    | "stakeholder_communication";
  ownerActorId: EntityId;
  partnerActorIds: EntityId[];
  capacityRequirementIds: EntityId[];
  budgetXof: number;
  disbursedXof: number;
  expectedStartAt: ISODateTime;
  expectedEndAt: ISODateTime;
  actualStartAt?: ISODateTime;
  actualEndAt?: ISODateTime;
  status: "planned" | "approved" | "funded" | "in_progress" | "blocked" | "completed" | "cancelled";
  blockers: string[];
  evidenceIds: EntityId[];
}

export interface CrisisOutcome {
  id: EntityId;
  territoryId: EntityId;
  actionId: EntityId;
  measuredAt: ISODateTime;
  actorsProtectedCount: number;
  campaignsStabilizedCount: number;
  volumeSavedKg: number;
  economicValueProtectedXof: number;
  jobsProtectedCount: number;
  serviceContinuityChangePercent: number;
  wasteReductionKg: number;
  fishingPressureChangePercent: number;
  responseTimeHours: number;
  confidenceScore: number;
  evidenceIds: EntityId[];
  lessonsLearned: string[];
}

export interface MultiTerritoryCrisisCase {
  id: EntityId;
  crisisCode: string;
  crisisType: CrisisType;
  severity: CrisisSeverity;
  status: CrisisStatus;
  countryId: EntityId;
  nationalGovernanceCaseId: EntityId;
  detectedAt: ISODateTime;
  qualifiedAt?: ISODateTime;
  stabilizedAt?: ISODateTime;
  closedAt?: ISODateTime;
  territoryImpacts: CrisisTerritoryImpact[];
  commandStructure: CrisisCommandStructure;
  capacityRequirements: CrisisCapacityRequirement[];
  recommendationIds: EntityId[];
  decisions: CrisisDecision[];
  actions: CrisisAction[];
  outcomes: CrisisOutcome[];
  publicProgramIds: EntityId[];
  financingReferenceIds: EntityId[];
  insuranceReferenceIds: EntityId[];
  communicationReferenceIds: EntityId[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  events: Array<{
    id: EntityId;
    type: string;
    occurredAt: ISODateTime;
    actorId?: EntityId;
    details: Record<string, unknown>;
  }>;
}

export interface CrisisReadinessAssessment {
  caseId: EntityId;
  score: number;
  readyForResponse: boolean;
  commandCoveragePercent: number;
  capacityCoveragePercent: number;
  decisionCoveragePercent: number;
  evidenceCoveragePercent: number;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export interface CrisisExecutiveBrief {
  crisisId: EntityId;
  crisisCode: string;
  severity: CrisisSeverity;
  status: CrisisStatus;
  headline: string;
  affectedTerritoryCount: number;
  affectedActorCount: number;
  exposedVolumeKg: number;
  exposedEconomicValueXof: number;
  jobsAtRisk: number;
  urgentDecisions: string[];
  capacityGaps: Array<{
    requirementId: EntityId;
    territoryId: EntityId;
    capacityType: CrisisCapacityRequirement["capacityType"];
    missingQuantity: number;
    unit: string;
    priority: CrisisCapacityRequirement["priority"];
  }>;
  activeActions: CrisisAction[];
  measuredOutcomes: CrisisOutcome[];
  generatedAt: ISODateTime;
}

export class EndToEndMultiTerritoryCrisisManagementCapability {
  private readonly cases = new Map<EntityId, MultiTerritoryCrisisCase>();

  openCrisis(input: {
    id: EntityId;
    crisisCode: string;
    crisisType: CrisisType;
    severity: CrisisSeverity;
    countryId: EntityId;
    nationalGovernanceCaseId: EntityId;
    nationalLeadActorId: EntityId;
    detectedAt: ISODateTime;
    createdAt: ISODateTime;
  }) {
    if (this.cases.has(input.id)) throw new Error(`La crise ${input.id} existe déjà.`);
    const item: MultiTerritoryCrisisCase = {
      id: input.id,
      crisisCode: input.crisisCode,
      crisisType: input.crisisType,
      severity: input.severity,
      status: "detected",
      countryId: input.countryId,
      nationalGovernanceCaseId: input.nationalGovernanceCaseId,
      detectedAt: input.detectedAt,
      territoryImpacts: [],
      commandStructure: {
        nationalLeadActorId: input.nationalLeadActorId,
        territorialLeadActorIds: [],
        technicalLeadActorIds: [],
        ministryDecisionMakerIds: [],
        partnerActorIds: [],
      },
      capacityRequirements: [],
      recommendationIds: [],
      decisions: [],
      actions: [],
      outcomes: [],
      publicProgramIds: [],
      financingReferenceIds: [],
      insuranceReferenceIds: [],
      communicationReferenceIds: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      events: [this.event(`event:${input.id}:opened`, "multi_territory_crisis_opened", input.createdAt, input.nationalLeadActorId, { severity: input.severity, crisisType: input.crisisType })],
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  addTerritoryImpact(input: { caseId: EntityId; impact: CrisisTerritoryImpact; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const index = item.territoryImpacts.findIndex((entry) => entry.territoryId === input.impact.territoryId);
    if (index >= 0) item.territoryImpacts[index] = structuredClone(input.impact);
    else item.territoryImpacts.push(structuredClone(input.impact));
    item.severity = this.computeOverallSeverity(item);
    this.touch(item, input.impact.updatedAt, this.event(`event:${item.id}:territory:${input.impact.territoryId}`, "crisis_territory_impact_upserted", input.impact.updatedAt, input.actorId, { territoryId: input.impact.territoryId, severity: input.impact.severity }));
    return structuredClone(item);
  }

  configureCommandStructure(input: { caseId: EntityId; structure: Partial<CrisisCommandStructure>; configuredAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.commandStructure = {
      ...item.commandStructure,
      ...structuredClone(input.structure),
      territorialLeadActorIds: this.unique(input.structure.territorialLeadActorIds ?? item.commandStructure.territorialLeadActorIds),
      technicalLeadActorIds: this.unique(input.structure.technicalLeadActorIds ?? item.commandStructure.technicalLeadActorIds),
      ministryDecisionMakerIds: this.unique(input.structure.ministryDecisionMakerIds ?? item.commandStructure.ministryDecisionMakerIds),
      partnerActorIds: this.unique(input.structure.partnerActorIds ?? item.commandStructure.partnerActorIds),
    };
    this.touch(item, input.configuredAt, this.event(`event:${item.id}:command-structure`, "crisis_command_structure_configured", input.configuredAt, input.actorId, {}));
    return structuredClone(item);
  }

  qualifyCrisis(input: { caseId: EntityId; qualifiedAt: ISODateTime; actorId: EntityId; rationale: string; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    if (item.status !== "detected") throw new Error(`La crise ne peut pas être qualifiée depuis le statut ${item.status}.`);
    if (item.territoryImpacts.length < 2) throw new Error("Une crise multi-territoires doit affecter au moins deux territoires.");
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour qualifier la crise.");
    item.status = "qualified";
    item.qualifiedAt = input.qualifiedAt;
    item.documentIds = this.unique([...item.documentIds, ...input.evidenceIds]);
    this.touch(item, input.qualifiedAt, this.event(`event:${item.id}:qualified`, "crisis_qualified", input.qualifiedAt, input.actorId, { rationale: input.rationale, severity: item.severity }));
    return structuredClone(item);
  }

  registerCapacityRequirement(input: { caseId: EntityId; requirement: CrisisCapacityRequirement; registeredAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireAffectedTerritory(item, input.requirement.territoryId);
    const index = item.capacityRequirements.findIndex((entry) => entry.id === input.requirement.id);
    if (index >= 0) item.capacityRequirements[index] = structuredClone(input.requirement);
    else item.capacityRequirements.push(structuredClone(input.requirement));
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:requirement:${input.requirement.id}`, "crisis_capacity_requirement_registered", input.registeredAt, input.actorId, { requirementId: input.requirement.id, capacityType: input.requirement.capacityType, priority: input.requirement.priority }));
    return structuredClone(item);
  }

  mobilizeCapacity(input: { caseId: EntityId; requirementId: EntityId; quantity: number; sourceTerritoryId?: EntityId; evidenceIds: EntityId[]; mobilizedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const requirement = this.requireCapacityRequirement(item, input.requirementId);
    if (input.quantity <= 0) throw new Error("La quantité mobilisée doit être positive.");
    requirement.mobilizedQuantity += input.quantity;
    if (input.sourceTerritoryId) requirement.sourceTerritoryIds = this.unique([...requirement.sourceTerritoryIds, input.sourceTerritoryId]);
    requirement.evidenceIds = this.unique([...requirement.evidenceIds, ...input.evidenceIds]);
    requirement.status = requirement.mobilizedQuantity >= requirement.requiredQuantity ? "covered" : "partially_covered";
    this.touch(item, input.mobilizedAt, this.event(`event:${item.id}:capacity-mobilized:${requirement.id}`, "crisis_capacity_mobilized", input.mobilizedAt, input.actorId, { requirementId: requirement.id, quantity: input.quantity, sourceTerritoryId: input.sourceTerritoryId }));
    return structuredClone(item);
  }

  attachRecommendation(input: { caseId: EntityId; recommendationId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.recommendationIds = this.unique([...item.recommendationIds, input.recommendationId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:recommendation:${input.recommendationId}`, "crisis_recommendation_attached", input.attachedAt, input.actorId, { recommendationId: input.recommendationId }));
    return structuredClone(item);
  }

  recordDecision(input: { caseId: EntityId; decision: CrisisDecision }) {
    const item = this.requireCase(input.caseId);
    if (item.decisions.some((entry) => entry.id === input.decision.id)) throw new Error(`La décision ${input.decision.id} existe déjà.`);
    for (const territoryId of input.decision.territoryIds) this.requireAffectedTerritory(item, territoryId);
    if (input.decision.evidenceIds.length === 0) throw new Error("Une décision de crise doit être soutenue par une preuve.");
    item.decisions.push(structuredClone(input.decision));
    if (input.decision.decisionType === "activate_cell") {
      item.commandStructure.activatedAt = input.decision.decidedAt;
      item.status = "mobilizing";
    }
    this.touch(item, input.decision.decidedAt, this.event(`event:${item.id}:decision:${input.decision.id}`, "crisis_decision_recorded", input.decision.decidedAt, input.decision.decidedByActorId, { decisionId: input.decision.id, decisionType: input.decision.decisionType, budgetAuthorizedXof: input.decision.budgetAuthorizedXof }));
    return structuredClone(item);
  }

  launchAction(input: { caseId: EntityId; action: CrisisAction; launchedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.actions.some((entry) => entry.id === input.action.id)) throw new Error(`L'action ${input.action.id} existe déjà.`);
    this.requireDecision(item, input.action.decisionId);
    for (const territoryId of input.action.territoryIds) this.requireAffectedTerritory(item, territoryId);
    for (const requirementId of input.action.capacityRequirementIds) this.requireCapacityRequirement(item, requirementId);
    const action = structuredClone(input.action);
    if (action.status === "planned") action.status = "approved";
    item.actions.push(action);
    item.status = "responding";
    this.touch(item, input.launchedAt, this.event(`event:${item.id}:action:${action.id}`, "crisis_action_launched", input.launchedAt, input.actorId, { actionId: action.id, actionType: action.actionType, territoryIds: action.territoryIds }));
    return structuredClone(item);
  }

  updateAction(input: { caseId: EntityId; actionId: EntityId; status?: CrisisAction["status"]; disbursedXof?: number; blockers?: string[]; evidenceIds?: EntityId[]; actualStartAt?: ISODateTime; actualEndAt?: ISODateTime; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const action = this.requireAction(item, input.actionId);
    if (input.status) action.status = input.status;
    if (input.disbursedXof !== undefined) action.disbursedXof = input.disbursedXof;
    if (input.blockers) action.blockers = [...input.blockers];
    if (input.evidenceIds) action.evidenceIds = this.unique([...action.evidenceIds, ...input.evidenceIds]);
    if (input.actualStartAt) action.actualStartAt = input.actualStartAt;
    if (input.actualEndAt) action.actualEndAt = input.actualEndAt;
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:action-update:${action.id}`, "crisis_action_updated", input.updatedAt, input.actorId, { actionId: action.id, status: action.status, disbursedXof: action.disbursedXof }));
    return structuredClone(item);
  }

  attachPublicProgram(input: { caseId: EntityId; publicProgramId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.publicProgramIds = this.unique([...item.publicProgramIds, input.publicProgramId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:public-program:${input.publicProgramId}`, "crisis_public_program_attached", input.attachedAt, input.actorId, { publicProgramId: input.publicProgramId }));
    return structuredClone(item);
  }

  attachFinancing(input: { caseId: EntityId; financingReferenceId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.financingReferenceIds = this.unique([...item.financingReferenceIds, input.financingReferenceId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:financing:${input.financingReferenceId}`, "crisis_financing_attached", input.attachedAt, input.actorId, { financingReferenceId: input.financingReferenceId }));
    return structuredClone(item);
  }

  attachInsurance(input: { caseId: EntityId; insuranceReferenceId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.insuranceReferenceIds = this.unique([...item.insuranceReferenceIds, input.insuranceReferenceId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:insurance:${input.insuranceReferenceId}`, "crisis_insurance_attached", input.attachedAt, input.actorId, { insuranceReferenceId: input.insuranceReferenceId }));
    return structuredClone(item);
  }

  attachCommunication(input: { caseId: EntityId; communicationReferenceId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.communicationReferenceIds = this.unique([...item.communicationReferenceIds, input.communicationReferenceId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:communication:${input.communicationReferenceId}`, "crisis_communication_attached", input.attachedAt, input.actorId, { communicationReferenceId: input.communicationReferenceId }));
    return structuredClone(item);
  }

  recordOutcome(input: { caseId: EntityId; outcome: CrisisOutcome; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.outcomes.some((entry) => entry.id === input.outcome.id)) throw new Error(`Le résultat ${input.outcome.id} existe déjà.`);
    const action = this.requireAction(item, input.outcome.actionId);
    if (action.status !== "completed") throw new Error("Une action doit être terminée avant de mesurer son résultat.");
    if (input.outcome.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour mesurer un résultat de crise.");
    item.outcomes.push(structuredClone(input.outcome));
    action.evidenceIds = this.unique([...action.evidenceIds, ...input.outcome.evidenceIds]);
    this.touch(item, input.outcome.measuredAt, this.event(`event:${item.id}:outcome:${input.outcome.id}`, "crisis_outcome_recorded", input.outcome.measuredAt, input.actorId, { outcomeId: input.outcome.id, actionId: input.outcome.actionId, economicValueProtectedXof: input.outcome.economicValueProtectedXof }));
    return structuredClone(item);
  }

  assessReadiness(input: { caseId: EntityId; generatedAt: ISODateTime }): CrisisReadinessAssessment {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    const warnings: string[] = [];
    if (item.territoryImpacts.length < 2) blockers.push("Moins de deux territoires sont qualifiés.");
    if (!item.commandStructure.activatedAt) blockers.push("La cellule de crise nationale n'est pas activée.");
    if (!item.commandStructure.territorialLeadActorIds.length) blockers.push("Aucun responsable territorial n'est désigné.");
    if (!item.commandStructure.ministryDecisionMakerIds.length) blockers.push("Aucun décideur ministériel n'est désigné.");
    if (!item.decisions.length) blockers.push("Aucune décision de crise n'est enregistrée.");
    const criticalRequirements = item.capacityRequirements.filter((entry) => entry.priority === "critical" && entry.status !== "cancelled");
    const coveredCritical = criticalRequirements.filter((entry) => entry.status === "covered");
    const capacityCoveragePercent = criticalRequirements.length ? this.round(coveredCritical.length / criticalRequirements.length * 100) : 100;
    if (capacityCoveragePercent < 50) blockers.push("Moins de 50 % des capacités critiques sont couvertes.");
    if (capacityCoveragePercent < 100) warnings.push("Certaines capacités critiques restent partiellement couvertes.");
    if (!item.communicationReferenceIds.length) warnings.push("Aucune communication de crise n'est référencée.");
    if (!item.financingReferenceIds.length && item.decisions.some((entry) => entry.budgetAuthorizedXof > 0)) warnings.push("Des budgets sont autorisés sans financement référencé.");
    const commandRoles = [
      item.commandStructure.nationalLeadActorId,
      ...item.commandStructure.territorialLeadActorIds,
      ...item.commandStructure.ministryDecisionMakerIds,
      item.commandStructure.logisticsLeadActorId,
      item.commandStructure.financeLeadActorId,
      item.commandStructure.communicationsLeadActorId,
    ].filter(Boolean);
    const commandCoveragePercent = this.round(Math.min(100, commandRoles.length / 6 * 100));
    const decisionCoveragePercent = item.territoryImpacts.length
      ? this.round(item.territoryImpacts.filter((impact) => item.decisions.some((decision) => decision.territoryIds.includes(impact.territoryId))).length / item.territoryImpacts.length * 100)
      : 0;
    if (decisionCoveragePercent < 100) warnings.push("Tous les territoires affectés ne sont pas couverts par une décision.");
    const evidenceObjects = [
      ...item.decisions.map((entry) => entry.evidenceIds.length > 0),
      ...item.capacityRequirements.map((entry) => entry.evidenceIds.length > 0),
      ...item.actions.map((entry) => entry.evidenceIds.length > 0),
      ...item.outcomes.map((entry) => entry.evidenceIds.length > 0),
    ];
    const evidenceCoveragePercent = evidenceObjects.length ? this.round(evidenceObjects.filter(Boolean).length / evidenceObjects.length * 100) : 0;
    const score = Math.max(0, Math.min(100, 100 - blockers.length * 15 - warnings.length * 5 - (commandCoveragePercent < 80 ? 5 : 0) - (evidenceCoveragePercent < 60 ? 10 : 0)));
    item.blockers = blockers;
    item.warnings = warnings;
    this.cases.set(item.id, item);
    return { caseId: item.id, score, readyForResponse: blockers.length === 0, commandCoveragePercent, capacityCoveragePercent, decisionCoveragePercent, evidenceCoveragePercent, blockers, warnings, generatedAt: input.generatedAt };
  }

  markStabilizing(input: { caseId: EntityId; stabilizedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const activeActions = item.actions.filter((entry) => ["approved", "funded", "in_progress", "blocked"].includes(entry.status));
    if (activeActions.some((entry) => entry.status === "blocked")) throw new Error("La crise ne peut pas passer en stabilisation avec des actions bloquées.");
    if (!item.actions.some((entry) => entry.status === "completed")) throw new Error("Au moins une action doit être terminée avant stabilisation.");
    item.status = "stabilizing";
    item.stabilizedAt = input.stabilizedAt;
    this.touch(item, input.stabilizedAt, this.event(`event:${item.id}:stabilizing`, "crisis_stabilizing", input.stabilizedAt, input.actorId, {}));
    return structuredClone(item);
  }

  startRecovery(input: { caseId: EntityId; startedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.status !== "stabilizing") throw new Error("La reprise ne peut commencer qu'après stabilisation.");
    if (item.outcomes.length === 0) throw new Error("Au moins un résultat mesuré est requis avant la phase de reprise.");
    item.status = "recovering";
    this.touch(item, input.startedAt, this.event(`event:${item.id}:recovery`, "crisis_recovery_started", input.startedAt, input.actorId, {}));
    return structuredClone(item);
  }

  closeCrisis(input: { caseId: EntityId; decisionId: EntityId; closedAt: ISODateTime; actorId: EntityId; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    if (item.status !== "recovering") throw new Error("La crise ne peut être clôturée qu'après la phase de reprise.");
    const decision = this.requireDecision(item, input.decisionId);
    if (decision.decisionType !== "close_crisis") throw new Error("Une décision explicite de clôture est requise.");
    if (input.evidenceIds.length === 0) throw new Error("Une preuve de clôture est obligatoire.");
    const unresolvedActions = item.actions.filter((entry) => !["completed", "cancelled"].includes(entry.status));
    if (unresolvedActions.length > 0) throw new Error("Toutes les actions doivent être terminées ou annulées avant clôture.");
    item.status = "closed";
    item.closedAt = input.closedAt;
    item.documentIds = this.unique([...item.documentIds, ...input.evidenceIds]);
    this.touch(item, input.closedAt, this.event(`event:${item.id}:closed`, "crisis_closed", input.closedAt, input.actorId, { decisionId: input.decisionId }));
    return structuredClone(item);
  }

  buildExecutiveBrief(input: { caseId: EntityId; generatedAt: ISODateTime }): CrisisExecutiveBrief {
    const item = this.requireCase(input.caseId);
    const urgentDecisions: string[] = [];
    const uncoveredCritical = item.capacityRequirements.filter((entry) => entry.priority === "critical" && entry.status !== "covered" && entry.status !== "cancelled");
    if (!item.commandStructure.activatedAt) urgentDecisions.push("Activer immédiatement la cellule nationale de crise.");
    if (uncoveredCritical.length > 0) urgentDecisions.push("Arbitrer les capacités critiques encore non couvertes.");
    if (!item.financingReferenceIds.length && item.decisions.some((entry) => entry.budgetAuthorizedXof > 0)) urgentDecisions.push("Sécuriser les sources de financement des décisions prises.");
    if (!item.communicationReferenceIds.length) urgentDecisions.push("Déployer une communication coordonnée auprès des acteurs affectés.");
    if (item.actions.some((entry) => entry.status === "blocked")) urgentDecisions.push("Lever les blocages sur les actions de réponse en cours.");
    return {
      crisisId: item.id,
      crisisCode: item.crisisCode,
      severity: item.severity,
      status: item.status,
      headline: item.severity === "national_emergency"
        ? "Urgence nationale affectant plusieurs territoires"
        : item.severity === "critical"
          ? "Crise critique multi-territoires"
          : item.severity === "high"
            ? "Crise majeure nécessitant une réponse coordonnée"
            : "Crise multi-territoires sous coordination",
      affectedTerritoryCount: item.territoryImpacts.length,
      affectedActorCount: item.territoryImpacts.reduce((sum, impact) => sum + impact.affectedActorCount, 0),
      exposedVolumeKg: item.territoryImpacts.reduce((sum, impact) => sum + impact.exposedVolumeKg, 0),
      exposedEconomicValueXof: item.territoryImpacts.reduce((sum, impact) => sum + impact.exposedEconomicValueXof, 0),
      jobsAtRisk: item.territoryImpacts.reduce((sum, impact) => sum + impact.estimatedJobsAtRisk, 0),
      urgentDecisions,
      capacityGaps: item.capacityRequirements
        .filter((entry) => entry.status !== "covered" && entry.status !== "cancelled")
        .map((entry) => ({ requirementId: entry.id, territoryId: entry.territoryId, capacityType: entry.capacityType, missingQuantity: Math.max(0, entry.requiredQuantity - entry.mobilizedQuantity), unit: entry.unit, priority: entry.priority })),
      activeActions: item.actions.filter((entry) => ["approved", "funded", "in_progress", "blocked"].includes(entry.status)).map((entry) => structuredClone(entry)),
      measuredOutcomes: item.outcomes.map((entry) => structuredClone(entry)),
      generatedAt: input.generatedAt,
    };
  }

  getNationalCrisisCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const readiness = this.assessReadiness({ caseId: item.id, generatedAt: input.generatedAt });
    return {
      caseId: item.id,
      crisisCode: item.crisisCode,
      crisisType: item.crisisType,
      severity: item.severity,
      status: item.status,
      readiness,
      territoryImpacts: item.territoryImpacts.map((entry) => structuredClone(entry)),
      commandStructure: structuredClone(item.commandStructure),
      capacityRequirements: item.capacityRequirements.map((entry) => structuredClone(entry)),
      decisions: item.decisions.map((entry) => structuredClone(entry)),
      activeActions: item.actions.filter((entry) => !["completed", "cancelled"].includes(entry.status)).map((entry) => structuredClone(entry)),
      completedActions: item.actions.filter((entry) => entry.status === "completed").map((entry) => structuredClone(entry)),
      outcomes: item.outcomes.map((entry) => structuredClone(entry)),
      totalBudgetAuthorizedXof: item.decisions.reduce((sum, entry) => sum + entry.budgetAuthorizedXof, 0),
      totalBudgetDisbursedXof: item.actions.reduce((sum, entry) => sum + entry.disbursedXof, 0),
      totalEconomicValueProtectedXof: item.outcomes.reduce((sum, entry) => sum + entry.economicValueProtectedXof, 0),
      totalVolumeSavedKg: item.outcomes.reduce((sum, entry) => sum + entry.volumeSavedKg, 0),
      totalJobsProtectedCount: item.outcomes.reduce((sum, entry) => sum + entry.jobsProtectedCount, 0),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private computeOverallSeverity(item: MultiTerritoryCrisisCase): CrisisSeverity {
    if (item.territoryImpacts.length === 0) return item.severity;
    const weights: Record<CrisisSeverity, number> = { low: 1, moderate: 2, high: 3, critical: 4, national_emergency: 5 };
    const highest = Math.max(...item.territoryImpacts.map((entry) => weights[entry.severity]));
    const criticalCount = item.territoryImpacts.filter((entry) => weights[entry.severity] >= 4).length;
    if (criticalCount >= 3 || (criticalCount >= 2 && item.territoryImpacts.length >= 3)) return "national_emergency";
    return (Object.entries(weights).find(([, value]) => value === highest)?.[0] ?? "low") as CrisisSeverity;
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Crise introuvable : ${id}.`);
    return item;
  }

  private requireAffectedTerritory(item: MultiTerritoryCrisisCase, territoryId: EntityId) {
    const territory = item.territoryImpacts.find((entry) => entry.territoryId === territoryId);
    if (!territory) throw new Error(`Territoire non affecté par la crise : ${territoryId}.`);
    return territory;
  }

  private requireCapacityRequirement(item: MultiTerritoryCrisisCase, id: EntityId) {
    const requirement = item.capacityRequirements.find((entry) => entry.id === id);
    if (!requirement) throw new Error(`Besoin de capacité introuvable : ${id}.`);
    return requirement;
  }

  private requireDecision(item: MultiTerritoryCrisisCase, id: EntityId) {
    const decision = item.decisions.find((entry) => entry.id === id);
    if (!decision) throw new Error(`Décision de crise introuvable : ${id}.`);
    return decision;
  }

  private requireAction(item: MultiTerritoryCrisisCase, id: EntityId) {
    const action = item.actions.find((entry) => entry.id === id);
    if (!action) throw new Error(`Action de crise introuvable : ${id}.`);
    return action;
  }

  private touch(item: MultiTerritoryCrisisCase, updatedAt: ISODateTime, event: MultiTerritoryCrisisCase["events"][number]) {
    item.updatedAt = updatedAt;
    item.events.push(event);
    this.cases.set(item.id, item);
  }

  private event(id: EntityId, type: string, occurredAt: ISODateTime, actorId: EntityId | undefined, details: Record<string, unknown>) {
    return { id, type, occurredAt, actorId, details };
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
