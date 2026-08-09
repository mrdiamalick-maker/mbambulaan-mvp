import type { EntityId, ISODateTime } from "../infrastructures/types";

export type NationalGovernanceStatus =
  | "initializing"
  | "active"
  | "under_pressure"
  | "national_alert"
  | "restricted"
  | "closed";

export type NationalObjectiveDimension =
  | "coordination"
  | "economic_value"
  | "resource_preservation"
  | "food_security"
  | "employment"
  | "formalization"
  | "quality"
  | "logistics"
  | "financial_inclusion";

export type InterventionStatus =
  | "proposed"
  | "approved"
  | "funded"
  | "mobilizing"
  | "in_progress"
  | "completed"
  | "suspended"
  | "cancelled";

export type PolicyScenarioStatus = "draft" | "simulated" | "recommended" | "approved" | "rejected" | "implemented";

export interface NationalObjective {
  id: EntityId;
  dimension: NationalObjectiveDimension;
  label: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: ISODateTime;
  ownerActorId: EntityId;
  territoryIds: EntityId[];
  weight: number;
  status: "on_track" | "at_risk" | "off_track" | "achieved";
  evidenceIds: EntityId[];
}

export interface NationalTerritorySnapshot {
  territoryId: EntityId;
  supervisionCaseId: EntityId;
  status: "initializing" | "operational" | "degraded" | "critical" | "restricted" | "suspended";
  populationServed?: number;
  registeredActorCount: number;
  activeFisherCount: number;
  activeCooperativeCount: number;
  activeBuyerCount: number;
  activeCampaignCount: number;
  grossCommercialValueXof: number;
  sellerNetValueXof: number;
  platformRevenueXof: number;
  financingExposureXof: number;
  logisticsCapacityScore: number;
  coldChainCapacityScore: number;
  qualityCompliancePercent: number;
  serviceLevelPercent: number;
  wasteRatePercent: number;
  fishingPressureIndex: number;
  emptyReturnRatePercent: number;
  catchPerTripKg: number;
  sustainabilityRiskLevel: "low" | "moderate" | "high" | "critical";
  openCriticalAlertCount: number;
  openComplianceIssueCount: number;
  readinessScore: number;
  capturedAt: ISODateTime;
}

export interface NationalOperationalSnapshot {
  territoryCount: number;
  operationalTerritoryCount: number;
  degradedTerritoryCount: number;
  criticalTerritoryCount: number;
  restrictedTerritoryCount: number;
  suspendedTerritoryCount: number;
  registeredActorCount: number;
  activeFisherCount: number;
  activeCooperativeCount: number;
  activeBuyerCount: number;
  activeCampaignCount: number;
  averageServiceLevelPercent: number;
  averageLogisticsCapacityScore: number;
  averageColdChainCapacityScore: number;
  nationalWasteRatePercent: number;
  openCriticalAlertCount: number;
  openComplianceIssueCount: number;
}

export interface NationalEconomicSnapshot {
  grossCommercialValueXof: number;
  sellerNetValueXof: number;
  platformRevenueXof: number;
  financingExposureXof: number;
  publicFundingCommittedXof: number;
  publicFundingDisbursedXof: number;
  interventionCostXof: number;
  estimatedValueProtectedXof: number;
  estimatedAdditionalValueCreatedXof: number;
  sellerValueRetentionPercent: number;
  publicFundingExecutionPercent: number;
}

export interface NationalSocialSnapshot {
  estimatedJobsSupported: number;
  womenBeneficiaryCount: number;
  youthBeneficiaryCount: number;
  formalizedActorCount: number;
  financiallyIncludedActorCount: number;
  cooperativeMemberCount: number;
  foodSecurityCoverageScore: number;
  territorialEquityScore: number;
}

export interface NationalSustainabilitySnapshot {
  averageFishingPressureIndex: number;
  nationalEmptyReturnRatePercent: number;
  averageCatchPerTripKg: number;
  protectedSpeciesAlertCount: number;
  highRiskTerritoryCount: number;
  criticalRiskTerritoryCount: number;
  estimatedWasteAvoidedKg: number;
  traceableVolumeKg: number;
  sustainabilityCompliancePercent: number;
  nationalRiskLevel: "low" | "moderate" | "high" | "critical";
}

export interface NationalCapacityNeed {
  id: EntityId;
  territoryId: EntityId;
  capacityType: "landing" | "quality" | "cold_chain" | "storage" | "transport" | "processing" | "finance" | "insurance" | "human_support" | "digital_access";
  requiredQuantity: number;
  availableQuantity: number;
  unit: string;
  priority: "low" | "medium" | "high" | "critical";
  estimatedFundingNeedXof: number;
  requiredBy: ISODateTime;
  status: "identified" | "validated" | "allocated" | "partially_covered" | "covered" | "deferred";
  evidenceIds: EntityId[];
}

export interface NationalPublicProgram {
  id: EntityId;
  name: string;
  objectiveIds: EntityId[];
  territoryIds: EntityId[];
  ownerActorId: EntityId;
  budgetXof: number;
  committedXof: number;
  disbursedXof: number;
  beneficiaryTarget: number;
  beneficiaryActual: number;
  startAt: ISODateTime;
  endAt: ISODateTime;
  status: "draft" | "approved" | "active" | "under_review" | "completed" | "suspended" | "cancelled";
  interventionIds: EntityId[];
  outcomeIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface NationalPolicyScenario {
  id: EntityId;
  title: string;
  description: string;
  status: PolicyScenarioStatus;
  territoryIds: EntityId[];
  assumptions: Record<string, number | string | boolean>;
  measures: Array<{
    type: "capacity_investment" | "fishing_effort_restriction" | "subsidy" | "credit_guarantee" | "insurance_support" | "price_support" | "cold_chain_support" | "training" | "formalization" | "market_access";
    value: number;
    unit: string;
    territoryIds: EntityId[];
  }>;
  projectedEconomicImpactXof: number;
  projectedPublicCostXof: number;
  projectedJobsImpact: number;
  projectedWasteReductionPercent: number;
  projectedFishingPressureChangePercent: number;
  projectedFoodSecurityChangePercent: number;
  confidenceScore: number;
  riskFactors: string[];
  recommendationId?: EntityId;
  decisionId?: EntityId;
  createdAt: ISODateTime;
  simulatedAt?: ISODateTime;
}

export interface NationalAIRecommendation {
  id: EntityId;
  title: string;
  rationale: string;
  territoryIds: EntityId[];
  objectiveIds: EntityId[];
  recommendedActions: string[];
  expectedEconomicImpactXof: number;
  expectedSocialImpactScore: number;
  expectedEnvironmentalImpactScore: number;
  confidenceScore: number;
  evidenceIds: EntityId[];
  status: "proposed" | "under_review" | "accepted" | "partially_accepted" | "rejected" | "implemented";
  humanDecisionId?: EntityId;
  generatedAt: ISODateTime;
}

export interface NationalDecision {
  id: EntityId;
  title: string;
  decisionType: "policy" | "funding" | "capacity_allocation" | "crisis_response" | "program" | "restriction" | "coordination";
  territoryIds: EntityId[];
  objectiveIds: EntityId[];
  recommendationIds: EntityId[];
  scenarioIds: EntityId[];
  decidedByActorId: EntityId;
  rationale: string;
  conditions: string[];
  expectedResults: string[];
  budgetAuthorizedXof: number;
  status: "decided" | "in_execution" | "completed" | "reversed" | "expired";
  interventionIds: EntityId[];
  evidenceIds: EntityId[];
  decidedAt: ISODateTime;
}

export interface NationalIntervention {
  id: EntityId;
  decisionId: EntityId;
  publicProgramId?: EntityId;
  territoryIds: EntityId[];
  interventionType: "capacity_transfer" | "emergency_support" | "funding" | "training" | "market_coordination" | "resource_protection" | "logistics_support" | "quality_support" | "formalization";
  ownerActorId: EntityId;
  partnerActorIds: EntityId[];
  status: InterventionStatus;
  budgetXof: number;
  disbursedXof: number;
  expectedStartAt: ISODateTime;
  expectedEndAt: ISODateTime;
  actualStartAt?: ISODateTime;
  actualEndAt?: ISODateTime;
  milestones: Array<{
    id: EntityId;
    label: string;
    dueAt: ISODateTime;
    status: "pending" | "in_progress" | "completed" | "late" | "cancelled";
    evidenceIds: EntityId[];
  }>;
  blockers: string[];
  evidenceIds: EntityId[];
}

export interface NationalInterventionOutcome {
  id: EntityId;
  interventionId: EntityId;
  measuredAt: ISODateTime;
  economicValueCreatedXof: number;
  economicValueProtectedXof: number;
  beneficiaryCount: number;
  jobsSupported: number;
  wasteAvoidedKg: number;
  serviceLevelChangePercent: number;
  fishingPressureChangePercent: number;
  emptyReturnRateChangePercent: number;
  foodSecurityChangePercent: number;
  confidenceScore: number;
  evidenceIds: EntityId[];
  lessonsLearned: string[];
}

export interface NationalFisheriesGovernanceCase {
  id: EntityId;
  countryId: EntityId;
  ministryActorId: EntityId;
  status: NationalGovernanceStatus;
  objectives: NationalObjective[];
  territories: NationalTerritorySnapshot[];
  operational: NationalOperationalSnapshot;
  economic: NationalEconomicSnapshot;
  social: NationalSocialSnapshot;
  sustainability: NationalSustainabilitySnapshot;
  capacityNeeds: NationalCapacityNeed[];
  publicPrograms: NationalPublicProgram[];
  policyScenarios: NationalPolicyScenario[];
  recommendations: NationalAIRecommendation[];
  decisions: NationalDecision[];
  interventions: NationalIntervention[];
  outcomes: NationalInterventionOutcome[];
  nationalAlertIds: EntityId[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  lastReviewAt?: ISODateTime;
  events: Array<{
    id: EntityId;
    type: string;
    occurredAt: ISODateTime;
    actorId?: EntityId;
    details: Record<string, unknown>;
  }>;
}

export interface NationalGovernanceReadinessAssessment {
  caseId: EntityId;
  score: number;
  readyForNationalSteering: boolean;
  objectiveCoveragePercent: number;
  territoryCoveragePercent: number;
  evidenceCoveragePercent: number;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export interface NationalExecutiveBrief {
  countryId: EntityId;
  status: NationalGovernanceStatus;
  headline: string;
  nationalPriorities: string[];
  territoriesRequiringDecision: Array<{
    territoryId: EntityId;
    status: NationalTerritorySnapshot["status"];
    readinessScore: number;
    reasons: string[];
  }>;
  decisionsRequired: string[];
  operational: NationalOperationalSnapshot;
  economic: NationalEconomicSnapshot;
  social: NationalSocialSnapshot;
  sustainability: NationalSustainabilitySnapshot;
  objectiveProgress: Array<{
    objectiveId: EntityId;
    label: string;
    progressPercent: number;
    status: NationalObjective["status"];
  }>;
  generatedAt: ISODateTime;
}

export class EndToEndNationalFisheriesGovernanceCapability {
  private readonly cases = new Map<EntityId, NationalFisheriesGovernanceCase>();

  openNationalGovernance(input: {
    id: EntityId;
    countryId: EntityId;
    ministryActorId: EntityId;
    createdAt: ISODateTime;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier national ${input.id} existe déjà.`);
    const item: NationalFisheriesGovernanceCase = {
      id: input.id,
      countryId: input.countryId,
      ministryActorId: input.ministryActorId,
      status: "initializing",
      objectives: [],
      territories: [],
      operational: this.emptyOperationalSnapshot(),
      economic: this.emptyEconomicSnapshot(),
      social: this.emptySocialSnapshot(),
      sustainability: this.emptySustainabilitySnapshot(),
      capacityNeeds: [],
      publicPrograms: [],
      policyScenarios: [],
      recommendations: [],
      decisions: [],
      interventions: [],
      outcomes: [],
      nationalAlertIds: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      events: [this.event(`event:${input.id}:opened`, "national_governance_opened", input.createdAt, input.ministryActorId, {})],
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  defineObjective(input: { caseId: EntityId; objective: NationalObjective; actorId?: EntityId; definedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.objectives.some((objective) => objective.id === input.objective.id)) throw new Error(`L'objectif ${input.objective.id} existe déjà.`);
    item.objectives.push(structuredClone(input.objective));
    this.touch(item, input.definedAt, this.event(`event:${item.id}:objective:${input.objective.id}`, "national_objective_defined", input.definedAt, input.actorId, { objectiveId: input.objective.id, dimension: input.objective.dimension }));
    return structuredClone(item);
  }

  updateObjectiveProgress(input: { caseId: EntityId; objectiveId: EntityId; currentValue: number; evidenceIds?: EntityId[]; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const objective = this.requireObjective(item, input.objectiveId);
    objective.currentValue = input.currentValue;
    if (input.evidenceIds) objective.evidenceIds = this.unique([...objective.evidenceIds, ...input.evidenceIds]);
    objective.status = this.computeObjectiveStatus(objective);
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:objective-progress:${objective.id}`, "national_objective_progress_updated", input.updatedAt, input.actorId, { objectiveId: objective.id, currentValue: objective.currentValue, status: objective.status }));
    return structuredClone(item);
  }

  upsertTerritorySnapshot(input: { caseId: EntityId; snapshot: NationalTerritorySnapshot; actorId?: EntityId; updatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const index = item.territories.findIndex((territory) => territory.territoryId === input.snapshot.territoryId);
    if (index >= 0) item.territories[index] = structuredClone(input.snapshot);
    else item.territories.push(structuredClone(input.snapshot));
    this.recalculateNationalSnapshots(item);
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:territory:${input.snapshot.territoryId}`, "national_territory_snapshot_upserted", input.updatedAt, input.actorId, { territoryId: input.snapshot.territoryId, status: input.snapshot.status }));
    return structuredClone(item);
  }

  registerCapacityNeed(input: { caseId: EntityId; need: NationalCapacityNeed; actorId?: EntityId; registeredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (!item.territories.some((territory) => territory.territoryId === input.need.territoryId)) throw new Error(`Le territoire ${input.need.territoryId} n'est pas rattaché au pilotage national.`);
    const index = item.capacityNeeds.findIndex((need) => need.id === input.need.id);
    if (index >= 0) item.capacityNeeds[index] = structuredClone(input.need);
    else item.capacityNeeds.push(structuredClone(input.need));
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:capacity-need:${input.need.id}`, "national_capacity_need_registered", input.registeredAt, input.actorId, { needId: input.need.id, territoryId: input.need.territoryId, priority: input.need.priority }));
    return structuredClone(item);
  }

  allocateCapacity(input: { caseId: EntityId; needId: EntityId; allocatedQuantity: number; fundingAllocatedXof: number; decisionId?: EntityId; allocatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const need = this.requireCapacityNeed(item, input.needId);
    need.availableQuantity += input.allocatedQuantity;
    need.estimatedFundingNeedXof = Math.max(0, need.estimatedFundingNeedXof - input.fundingAllocatedXof);
    need.status = need.availableQuantity >= need.requiredQuantity ? "covered" : need.availableQuantity > 0 ? "partially_covered" : "allocated";
    this.touch(item, input.allocatedAt, this.event(`event:${item.id}:capacity-allocation:${need.id}`, "national_capacity_allocated", input.allocatedAt, input.actorId, { needId: need.id, allocatedQuantity: input.allocatedQuantity, fundingAllocatedXof: input.fundingAllocatedXof, decisionId: input.decisionId }));
    return structuredClone(item);
  }

  createPublicProgram(input: { caseId: EntityId; program: NationalPublicProgram; actorId?: EntityId; createdAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.publicPrograms.some((program) => program.id === input.program.id)) throw new Error(`Le programme public ${input.program.id} existe déjà.`);
    this.assertKnownTerritories(item, input.program.territoryIds);
    this.assertKnownObjectives(item, input.program.objectiveIds);
    item.publicPrograms.push(structuredClone(input.program));
    this.recalculateNationalSnapshots(item);
    this.touch(item, input.createdAt, this.event(`event:${item.id}:program:${input.program.id}`, "national_public_program_created", input.createdAt, input.actorId, { programId: input.program.id, budgetXof: input.program.budgetXof }));
    return structuredClone(item);
  }

  updatePublicProgramExecution(input: { caseId: EntityId; programId: EntityId; committedXof?: number; disbursedXof?: number; beneficiaryActual?: number; status?: NationalPublicProgram["status"]; evidenceIds?: EntityId[]; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const program = this.requireProgram(item, input.programId);
    if (input.committedXof !== undefined) program.committedXof = input.committedXof;
    if (input.disbursedXof !== undefined) program.disbursedXof = input.disbursedXof;
    if (input.beneficiaryActual !== undefined) program.beneficiaryActual = input.beneficiaryActual;
    if (input.status) program.status = input.status;
    if (input.evidenceIds) program.evidenceIds = this.unique([...program.evidenceIds, ...input.evidenceIds]);
    this.recalculateNationalSnapshots(item);
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:program-execution:${program.id}`, "national_public_program_execution_updated", input.updatedAt, input.actorId, { programId: program.id, status: program.status, disbursedXof: program.disbursedXof }));
    return structuredClone(item);
  }

  createPolicyScenario(input: { caseId: EntityId; scenario: NationalPolicyScenario; actorId?: EntityId; createdAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.policyScenarios.some((scenario) => scenario.id === input.scenario.id)) throw new Error(`Le scénario ${input.scenario.id} existe déjà.`);
    this.assertKnownTerritories(item, input.scenario.territoryIds);
    item.policyScenarios.push(structuredClone(input.scenario));
    this.touch(item, input.createdAt, this.event(`event:${item.id}:scenario:${input.scenario.id}`, "national_policy_scenario_created", input.createdAt, input.actorId, { scenarioId: input.scenario.id }));
    return structuredClone(item);
  }

  simulatePolicyScenario(input: { caseId: EntityId; scenarioId: EntityId; results: Pick<NationalPolicyScenario, "projectedEconomicImpactXof" | "projectedPublicCostXof" | "projectedJobsImpact" | "projectedWasteReductionPercent" | "projectedFishingPressureChangePercent" | "projectedFoodSecurityChangePercent" | "confidenceScore" | "riskFactors">; simulatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const scenario = this.requireScenario(item, input.scenarioId);
    Object.assign(scenario, structuredClone(input.results));
    scenario.status = "simulated";
    scenario.simulatedAt = input.simulatedAt;
    this.touch(item, input.simulatedAt, this.event(`event:${item.id}:scenario-simulated:${scenario.id}`, "national_policy_scenario_simulated", input.simulatedAt, input.actorId, { scenarioId: scenario.id, confidenceScore: scenario.confidenceScore }));
    return structuredClone(item);
  }

  recordAIRecommendation(input: { caseId: EntityId; recommendation: NationalAIRecommendation; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.recommendations.some((recommendation) => recommendation.id === input.recommendation.id)) throw new Error(`La recommandation ${input.recommendation.id} existe déjà.`);
    this.assertKnownTerritories(item, input.recommendation.territoryIds);
    this.assertKnownObjectives(item, input.recommendation.objectiveIds);
    item.recommendations.push(structuredClone(input.recommendation));
    this.touch(item, input.recommendation.generatedAt, this.event(`event:${item.id}:recommendation:${input.recommendation.id}`, "national_ai_recommendation_recorded", input.recommendation.generatedAt, input.actorId, { recommendationId: input.recommendation.id, confidenceScore: input.recommendation.confidenceScore }));
    return structuredClone(item);
  }

  reviewAIRecommendation(input: { caseId: EntityId; recommendationId: EntityId; status: NationalAIRecommendation["status"]; humanDecisionId?: EntityId; rationale: string; reviewedAt: ISODateTime; actorId: EntityId }) {
    const item = this.requireCase(input.caseId);
    const recommendation = this.requireRecommendation(item, input.recommendationId);
    recommendation.status = input.status;
    recommendation.humanDecisionId = input.humanDecisionId;
    this.touch(item, input.reviewedAt, this.event(`event:${item.id}:recommendation-review:${recommendation.id}`, "national_ai_recommendation_reviewed", input.reviewedAt, input.actorId, { recommendationId: recommendation.id, status: recommendation.status, humanDecisionId: input.humanDecisionId, rationale: input.rationale }));
    return structuredClone(item);
  }

  recordDecision(input: { caseId: EntityId; decision: NationalDecision }) {
    const item = this.requireCase(input.caseId);
    if (item.decisions.some((decision) => decision.id === input.decision.id)) throw new Error(`La décision ${input.decision.id} existe déjà.`);
    this.assertKnownTerritories(item, input.decision.territoryIds);
    this.assertKnownObjectives(item, input.decision.objectiveIds);
    for (const recommendationId of input.decision.recommendationIds) this.requireRecommendation(item, recommendationId);
    for (const scenarioId of input.decision.scenarioIds) this.requireScenario(item, scenarioId);
    item.decisions.push(structuredClone(input.decision));
    for (const recommendationId of input.decision.recommendationIds) {
      const recommendation = this.requireRecommendation(item, recommendationId);
      recommendation.humanDecisionId = input.decision.id;
      if (recommendation.status === "proposed" || recommendation.status === "under_review") recommendation.status = "accepted";
    }
    for (const scenarioId of input.decision.scenarioIds) {
      const scenario = this.requireScenario(item, scenarioId);
      scenario.decisionId = input.decision.id;
      scenario.status = "approved";
    }
    this.touch(item, input.decision.decidedAt, this.event(`event:${item.id}:decision:${input.decision.id}`, "national_decision_recorded", input.decision.decidedAt, input.decision.decidedByActorId, { decisionId: input.decision.id, type: input.decision.decisionType, budgetAuthorizedXof: input.decision.budgetAuthorizedXof }));
    return structuredClone(item);
  }

  launchIntervention(input: { caseId: EntityId; intervention: NationalIntervention; launchedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.interventions.some((intervention) => intervention.id === input.intervention.id)) throw new Error(`L'intervention ${input.intervention.id} existe déjà.`);
    const decision = this.requireDecision(item, input.intervention.decisionId);
    this.assertKnownTerritories(item, input.intervention.territoryIds);
    if (input.intervention.publicProgramId) {
      const program = this.requireProgram(item, input.intervention.publicProgramId);
      program.interventionIds = this.unique([...program.interventionIds, input.intervention.id]);
    }
    decision.interventionIds = this.unique([...decision.interventionIds, input.intervention.id]);
    decision.status = "in_execution";
    const intervention = structuredClone(input.intervention);
    if (intervention.status === "proposed") intervention.status = "approved";
    item.interventions.push(intervention);
    this.recalculateNationalSnapshots(item);
    this.touch(item, input.launchedAt, this.event(`event:${item.id}:intervention:${intervention.id}`, "national_intervention_launched", input.launchedAt, input.actorId, { interventionId: intervention.id, decisionId: intervention.decisionId, territoryIds: intervention.territoryIds }));
    return structuredClone(item);
  }

  updateIntervention(input: { caseId: EntityId; interventionId: EntityId; status?: InterventionStatus; disbursedXof?: number; blockers?: string[]; evidenceIds?: EntityId[]; actualStartAt?: ISODateTime; actualEndAt?: ISODateTime; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const intervention = this.requireIntervention(item, input.interventionId);
    if (input.status) intervention.status = input.status;
    if (input.disbursedXof !== undefined) intervention.disbursedXof = input.disbursedXof;
    if (input.blockers) intervention.blockers = [...input.blockers];
    if (input.evidenceIds) intervention.evidenceIds = this.unique([...intervention.evidenceIds, ...input.evidenceIds]);
    if (input.actualStartAt) intervention.actualStartAt = input.actualStartAt;
    if (input.actualEndAt) intervention.actualEndAt = input.actualEndAt;
    this.recalculateNationalSnapshots(item);
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:intervention-update:${intervention.id}`, "national_intervention_updated", input.updatedAt, input.actorId, { interventionId: intervention.id, status: intervention.status, disbursedXof: intervention.disbursedXof }));
    return structuredClone(item);
  }

  completeMilestone(input: { caseId: EntityId; interventionId: EntityId; milestoneId: EntityId; evidenceIds: EntityId[]; completedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const intervention = this.requireIntervention(item, input.interventionId);
    const milestone = intervention.milestones.find((entry) => entry.id === input.milestoneId);
    if (!milestone) throw new Error(`Jalon introuvable : ${input.milestoneId}.`);
    milestone.status = "completed";
    milestone.evidenceIds = this.unique([...milestone.evidenceIds, ...input.evidenceIds]);
    intervention.evidenceIds = this.unique([...intervention.evidenceIds, ...input.evidenceIds]);
    this.touch(item, input.completedAt, this.event(`event:${item.id}:milestone:${milestone.id}`, "national_intervention_milestone_completed", input.completedAt, input.actorId, { interventionId: intervention.id, milestoneId: milestone.id }));
    return structuredClone(item);
  }

  recordInterventionOutcome(input: { caseId: EntityId; outcome: NationalInterventionOutcome; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.outcomes.some((outcome) => outcome.id === input.outcome.id)) throw new Error(`Le résultat ${input.outcome.id} existe déjà.`);
    const intervention = this.requireIntervention(item, input.outcome.interventionId);
    item.outcomes.push(structuredClone(input.outcome));
    intervention.evidenceIds = this.unique([...intervention.evidenceIds, ...input.outcome.evidenceIds]);
    if (intervention.status === "completed") {
      const decision = this.requireDecision(item, intervention.decisionId);
      const related = item.interventions.filter((entry) => entry.decisionId === decision.id);
      if (related.every((entry) => entry.status === "completed")) decision.status = "completed";
    }
    if (intervention.publicProgramId) {
      const program = this.requireProgram(item, intervention.publicProgramId);
      program.outcomeIds = this.unique([...program.outcomeIds, input.outcome.id]);
    }
    this.recalculateNationalSnapshots(item);
    this.touch(item, input.outcome.measuredAt, this.event(`event:${item.id}:outcome:${input.outcome.id}`, "national_intervention_outcome_recorded", input.outcome.measuredAt, input.actorId, { outcomeId: input.outcome.id, interventionId: input.outcome.interventionId, economicValueCreatedXof: input.outcome.economicValueCreatedXof }));
    return structuredClone(item);
  }

  attachNationalAlert(input: { caseId: EntityId; alertId: EntityId; severity: "info" | "warning" | "critical" | "emergency"; territoryIds: EntityId[]; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.assertKnownTerritories(item, input.territoryIds);
    item.nationalAlertIds = this.unique([...item.nationalAlertIds, input.alertId]);
    if (["critical", "emergency"].includes(input.severity)) item.status = "national_alert";
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:alert:${input.alertId}`, "national_alert_attached", input.attachedAt, input.actorId, { alertId: input.alertId, severity: input.severity, territoryIds: input.territoryIds }));
    return structuredClone(item);
  }

  attachDocument(input: { caseId: EntityId; documentId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.documentIds = this.unique([...item.documentIds, input.documentId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:document:${input.documentId}`, "national_governance_document_attached", input.attachedAt, input.actorId, { documentId: input.documentId }));
    return structuredClone(item);
  }

  assessReadiness(input: { caseId: EntityId; generatedAt: ISODateTime }): NationalGovernanceReadinessAssessment {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    const warnings: string[] = [];
    if (item.territories.length === 0) blockers.push("Aucun territoire n'est rattaché au pilotage national.");
    if (item.objectives.length === 0) blockers.push("Aucun objectif national n'est défini.");
    if (!item.objectives.some((objective) => objective.dimension === "resource_preservation")) blockers.push("Aucun objectif national de préservation de la ressource n'est défini.");
    if (!item.objectives.some((objective) => objective.dimension === "economic_value")) blockers.push("Aucun objectif national de création de valeur n'est défini.");
    if (!item.objectives.some((objective) => objective.dimension === "coordination")) blockers.push("Aucun objectif national de coordination n'est défini.");
    if (item.operational.criticalTerritoryCount > 0) blockers.push(`${item.operational.criticalTerritoryCount} territoire(s) critique(s) nécessitent un arbitrage.`);
    if (item.sustainability.nationalRiskLevel === "critical") blockers.push("Le risque national sur la ressource est critique.");
    if (item.operational.openCriticalAlertCount > 0) warnings.push("Des alertes critiques territoriales restent ouvertes.");
    if (item.operational.openComplianceIssueCount > 0) warnings.push("Des non-conformités territoriales restent ouvertes.");
    if (item.publicPrograms.some((program) => program.status === "active" && program.disbursedXof === 0)) warnings.push("Un ou plusieurs programmes actifs ne présentent aucun décaissement.");
    if (item.interventions.some((intervention) => intervention.status === "in_progress" && intervention.blockers.length > 0)) warnings.push("Des interventions nationales en cours sont bloquées.");
    const objectiveCoveragePercent = item.objectives.length ? this.round(item.objectives.filter((objective) => objective.currentValue !== objective.baselineValue || objective.evidenceIds.length > 0).length / item.objectives.length * 100) : 0;
    const territoryCoveragePercent = item.territories.length ? this.round(item.territories.filter((territory) => territory.capturedAt).length / item.territories.length * 100) : 0;
    const evidenceBearingObjects = [
      ...item.objectives.map((entry) => entry.evidenceIds.length > 0),
      ...item.capacityNeeds.map((entry) => entry.evidenceIds.length > 0),
      ...item.publicPrograms.map((entry) => entry.evidenceIds.length > 0),
      ...item.decisions.map((entry) => entry.evidenceIds.length > 0),
      ...item.interventions.map((entry) => entry.evidenceIds.length > 0),
      ...item.outcomes.map((entry) => entry.evidenceIds.length > 0),
    ];
    const evidenceCoveragePercent = evidenceBearingObjects.length ? this.round(evidenceBearingObjects.filter(Boolean).length / evidenceBearingObjects.length * 100) : 0;
    const score = Math.max(0, Math.min(100, 100 - blockers.length * 15 - warnings.length * 5 - (objectiveCoveragePercent < 50 ? 10 : 0) - (evidenceCoveragePercent < 50 ? 10 : 0)));
    item.blockers = blockers;
    item.warnings = warnings;
    this.cases.set(item.id, item);
    return { caseId: item.id, score, readyForNationalSteering: blockers.length === 0, objectiveCoveragePercent, territoryCoveragePercent, evidenceCoveragePercent, blockers, warnings, generatedAt: input.generatedAt };
  }

  reviewNationalGovernance(input: { caseId: EntityId; reviewedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const readiness = this.assessReadiness({ caseId: item.id, generatedAt: input.reviewedAt });
    if (item.status === "closed") return structuredClone(item);
    if (item.nationalAlertIds.length > 0 && (item.operational.criticalTerritoryCount > 0 || item.sustainability.nationalRiskLevel === "critical")) item.status = "national_alert";
    else if (item.sustainability.nationalRiskLevel === "high" || item.operational.degradedTerritoryCount > item.operational.operationalTerritoryCount) item.status = "under_pressure";
    else if (item.operational.restrictedTerritoryCount > 0 || item.operational.suspendedTerritoryCount > 0) item.status = "restricted";
    else item.status = readiness.readyForNationalSteering ? "active" : "initializing";
    item.lastReviewAt = input.reviewedAt;
    this.touch(item, input.reviewedAt, this.event(`event:${item.id}:review`, "national_governance_review_completed", input.reviewedAt, input.actorId, { readinessScore: readiness.score, status: item.status }));
    return structuredClone(item);
  }

  compareTerritories(input: { caseId: EntityId; metric: keyof Pick<NationalTerritorySnapshot, "serviceLevelPercent" | "wasteRatePercent" | "fishingPressureIndex" | "emptyReturnRatePercent" | "catchPerTripKg" | "readinessScore" | "grossCommercialValueXof" | "sellerNetValueXof">; direction?: "ascending" | "descending" }) {
    const item = this.requireCase(input.caseId);
    const direction = input.direction ?? "descending";
    return [...item.territories]
      .sort((a, b) => direction === "descending" ? Number(b[input.metric]) - Number(a[input.metric]) : Number(a[input.metric]) - Number(b[input.metric]))
      .map((territory, index) => ({ rank: index + 1, territoryId: territory.territoryId, value: territory[input.metric], status: territory.status, readinessScore: territory.readinessScore }));
  }

  buildExecutiveBrief(input: { caseId: EntityId; generatedAt: ISODateTime }): NationalExecutiveBrief {
    const item = this.requireCase(input.caseId);
    const nationalPriorities: string[] = [];
    const decisionsRequired: string[] = [];
    if (item.sustainability.nationalRiskLevel === "high" || item.sustainability.nationalRiskLevel === "critical") {
      nationalPriorities.push("Réduire la pression sur les ressources halieutiques dans les territoires à risque.");
      decisionsRequired.push("Arbitrer les restrictions, alternatives économiques et mécanismes de compensation associés.");
    }
    if (item.operational.criticalTerritoryCount > 0) {
      nationalPriorities.push("Stabiliser les territoires en situation critique.");
      decisionsRequired.push("Déclencher une réponse multi-territoires et assigner les moyens nationaux.");
    }
    if (item.operational.averageServiceLevelPercent < 70) {
      nationalPriorities.push("Renforcer les capacités opérationnelles limitant la création de valeur.");
      decisionsRequired.push("Prioriser les investissements logistiques, qualité, froid et transformation.");
    }
    if (item.economic.sellerValueRetentionPercent < 70 && item.economic.grossCommercialValueXof > 0) {
      nationalPriorities.push("Améliorer la part de valeur conservée par les acteurs de la filière.");
      decisionsRequired.push("Revoir les coûts, marges, mécanismes de financement et allocations de valeur.");
    }
    if (item.economic.publicFundingExecutionPercent < 60 && item.economic.publicFundingCommittedXof > 0) {
      nationalPriorities.push("Accélérer l'exécution des financements publics engagés.");
      decisionsRequired.push("Lever les blocages de décaissement et réallouer les enveloppes non exécutées.");
    }
    const territoriesRequiringDecision = item.territories
      .filter((territory) => ["critical", "degraded", "restricted", "suspended"].includes(territory.status) || territory.readinessScore < 60)
      .map((territory) => ({
        territoryId: territory.territoryId,
        status: territory.status,
        readinessScore: territory.readinessScore,
        reasons: this.territoryDecisionReasons(territory),
      }));
    return {
      countryId: item.countryId,
      status: item.status,
      headline: item.status === "national_alert"
        ? "Alerte nationale sur la filière"
        : item.status === "under_pressure"
          ? "Filière nationale sous pression"
          : item.status === "restricted"
            ? "Pilotage national sous restrictions"
            : item.status === "active"
              ? "Pilotage national actif"
              : "Pilotage national en cours d'initialisation",
      nationalPriorities,
      territoriesRequiringDecision,
      decisionsRequired,
      operational: structuredClone(item.operational),
      economic: structuredClone(item.economic),
      social: structuredClone(item.social),
      sustainability: structuredClone(item.sustainability),
      objectiveProgress: item.objectives.map((objective) => ({ objectiveId: objective.id, label: objective.label, progressPercent: this.objectiveProgressPercent(objective), status: objective.status })),
      generatedAt: input.generatedAt,
    };
  }

  getNationalCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const readiness = this.assessReadiness({ caseId: item.id, generatedAt: input.generatedAt });
    return {
      caseId: item.id,
      countryId: item.countryId,
      status: item.status,
      readiness,
      operational: structuredClone(item.operational),
      economic: structuredClone(item.economic),
      social: structuredClone(item.social),
      sustainability: structuredClone(item.sustainability),
      objectives: item.objectives.map((objective) => ({ ...structuredClone(objective), progressPercent: this.objectiveProgressPercent(objective) })),
      territories: item.territories.map((territory) => ({ ...structuredClone(territory), decisionReasons: this.territoryDecisionReasons(territory) })),
      criticalCapacityNeeds: item.capacityNeeds.filter((need) => need.priority === "critical" && need.status !== "covered").map((need) => structuredClone(need)),
      activePrograms: item.publicPrograms.filter((program) => ["approved", "active", "under_review"].includes(program.status)).map((program) => structuredClone(program)),
      pendingRecommendations: item.recommendations.filter((recommendation) => ["proposed", "under_review"].includes(recommendation.status)).map((recommendation) => structuredClone(recommendation)),
      activeInterventions: item.interventions.filter((intervention) => ["approved", "funded", "mobilizing", "in_progress", "suspended"].includes(intervention.status)).map((intervention) => structuredClone(intervention)),
      recentOutcomes: [...item.outcomes].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt)).slice(0, 20).map((outcome) => structuredClone(outcome)),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private recalculateNationalSnapshots(item: NationalFisheriesGovernanceCase) {
    const territories = item.territories;
    const sum = (selector: (territory: NationalTerritorySnapshot) => number) => territories.reduce((total, territory) => total + selector(territory), 0);
    const average = (selector: (territory: NationalTerritorySnapshot) => number) => territories.length ? this.round(sum(selector) / territories.length) : 0;
    item.operational = {
      territoryCount: territories.length,
      operationalTerritoryCount: territories.filter((territory) => territory.status === "operational").length,
      degradedTerritoryCount: territories.filter((territory) => territory.status === "degraded").length,
      criticalTerritoryCount: territories.filter((territory) => territory.status === "critical").length,
      restrictedTerritoryCount: territories.filter((territory) => territory.status === "restricted").length,
      suspendedTerritoryCount: territories.filter((territory) => territory.status === "suspended").length,
      registeredActorCount: sum((territory) => territory.registeredActorCount),
      activeFisherCount: sum((territory) => territory.activeFisherCount),
      activeCooperativeCount: sum((territory) => territory.activeCooperativeCount),
      activeBuyerCount: sum((territory) => territory.activeBuyerCount),
      activeCampaignCount: sum((territory) => territory.activeCampaignCount),
      averageServiceLevelPercent: average((territory) => territory.serviceLevelPercent),
      averageLogisticsCapacityScore: average((territory) => territory.logisticsCapacityScore),
      averageColdChainCapacityScore: average((territory) => territory.coldChainCapacityScore),
      nationalWasteRatePercent: average((territory) => territory.wasteRatePercent),
      openCriticalAlertCount: sum((territory) => territory.openCriticalAlertCount),
      openComplianceIssueCount: sum((territory) => territory.openComplianceIssueCount),
    };
    const grossCommercialValueXof = sum((territory) => territory.grossCommercialValueXof);
    const sellerNetValueXof = sum((territory) => territory.sellerNetValueXof);
    const publicFundingCommittedXof = item.publicPrograms.reduce((total, program) => total + program.committedXof, 0);
    const publicFundingDisbursedXof = item.publicPrograms.reduce((total, program) => total + program.disbursedXof, 0);
    item.economic = {
      grossCommercialValueXof,
      sellerNetValueXof,
      platformRevenueXof: sum((territory) => territory.platformRevenueXof),
      financingExposureXof: sum((territory) => territory.financingExposureXof),
      publicFundingCommittedXof,
      publicFundingDisbursedXof,
      interventionCostXof: item.interventions.reduce((total, intervention) => total + intervention.disbursedXof, 0),
      estimatedValueProtectedXof: item.outcomes.reduce((total, outcome) => total + outcome.economicValueProtectedXof, 0),
      estimatedAdditionalValueCreatedXof: item.outcomes.reduce((total, outcome) => total + outcome.economicValueCreatedXof, 0),
      sellerValueRetentionPercent: grossCommercialValueXof > 0 ? this.round(sellerNetValueXof / grossCommercialValueXof * 100) : 0,
      publicFundingExecutionPercent: publicFundingCommittedXof > 0 ? this.round(publicFundingDisbursedXof / publicFundingCommittedXof * 100) : 0,
    };
    item.social = {
      estimatedJobsSupported: item.outcomes.reduce((total, outcome) => total + outcome.jobsSupported, 0),
      womenBeneficiaryCount: item.social.womenBeneficiaryCount,
      youthBeneficiaryCount: item.social.youthBeneficiaryCount,
      formalizedActorCount: item.social.formalizedActorCount,
      financiallyIncludedActorCount: item.social.financiallyIncludedActorCount,
      cooperativeMemberCount: item.social.cooperativeMemberCount,
      foodSecurityCoverageScore: item.social.foodSecurityCoverageScore,
      territorialEquityScore: this.computeTerritorialEquityScore(territories),
    };
    const averageFishingPressureIndex = average((territory) => territory.fishingPressureIndex);
    const nationalEmptyReturnRatePercent = average((territory) => territory.emptyReturnRatePercent);
    const highRiskTerritoryCount = territories.filter((territory) => territory.sustainabilityRiskLevel === "high").length;
    const criticalRiskTerritoryCount = territories.filter((territory) => territory.sustainabilityRiskLevel === "critical").length;
    item.sustainability = {
      averageFishingPressureIndex,
      nationalEmptyReturnRatePercent,
      averageCatchPerTripKg: average((territory) => territory.catchPerTripKg),
      protectedSpeciesAlertCount: item.sustainability.protectedSpeciesAlertCount,
      highRiskTerritoryCount,
      criticalRiskTerritoryCount,
      estimatedWasteAvoidedKg: item.outcomes.reduce((total, outcome) => total + outcome.wasteAvoidedKg, 0),
      traceableVolumeKg: item.sustainability.traceableVolumeKg,
      sustainabilityCompliancePercent: territories.length ? this.round(territories.filter((territory) => ["low", "moderate"].includes(territory.sustainabilityRiskLevel)).length / territories.length * 100) : 0,
      nationalRiskLevel: this.computeNationalRiskLevel({ averageFishingPressureIndex, nationalEmptyReturnRatePercent, highRiskTerritoryCount, criticalRiskTerritoryCount, territoryCount: territories.length }),
    };
  }

  private emptyOperationalSnapshot(): NationalOperationalSnapshot {
    return { territoryCount: 0, operationalTerritoryCount: 0, degradedTerritoryCount: 0, criticalTerritoryCount: 0, restrictedTerritoryCount: 0, suspendedTerritoryCount: 0, registeredActorCount: 0, activeFisherCount: 0, activeCooperativeCount: 0, activeBuyerCount: 0, activeCampaignCount: 0, averageServiceLevelPercent: 0, averageLogisticsCapacityScore: 0, averageColdChainCapacityScore: 0, nationalWasteRatePercent: 0, openCriticalAlertCount: 0, openComplianceIssueCount: 0 };
  }

  private emptyEconomicSnapshot(): NationalEconomicSnapshot {
    return { grossCommercialValueXof: 0, sellerNetValueXof: 0, platformRevenueXof: 0, financingExposureXof: 0, publicFundingCommittedXof: 0, publicFundingDisbursedXof: 0, interventionCostXof: 0, estimatedValueProtectedXof: 0, estimatedAdditionalValueCreatedXof: 0, sellerValueRetentionPercent: 0, publicFundingExecutionPercent: 0 };
  }

  private emptySocialSnapshot(): NationalSocialSnapshot {
    return { estimatedJobsSupported: 0, womenBeneficiaryCount: 0, youthBeneficiaryCount: 0, formalizedActorCount: 0, financiallyIncludedActorCount: 0, cooperativeMemberCount: 0, foodSecurityCoverageScore: 0, territorialEquityScore: 0 };
  }

  private emptySustainabilitySnapshot(): NationalSustainabilitySnapshot {
    return { averageFishingPressureIndex: 0, nationalEmptyReturnRatePercent: 0, averageCatchPerTripKg: 0, protectedSpeciesAlertCount: 0, highRiskTerritoryCount: 0, criticalRiskTerritoryCount: 0, estimatedWasteAvoidedKg: 0, traceableVolumeKg: 0, sustainabilityCompliancePercent: 0, nationalRiskLevel: "low" };
  }

  private computeObjectiveStatus(objective: NationalObjective): NationalObjective["status"] {
    const progress = this.objectiveProgressPercent(objective);
    if (progress >= 100) return "achieved";
    if (progress >= 75) return "on_track";
    if (progress >= 40) return "at_risk";
    return "off_track";
  }

  private objectiveProgressPercent(objective: NationalObjective) {
    const distance = objective.targetValue - objective.baselineValue;
    if (distance === 0) return objective.currentValue === objective.targetValue ? 100 : 0;
    return Math.max(0, Math.min(100, this.round((objective.currentValue - objective.baselineValue) / distance * 100)));
  }

  private computeNationalRiskLevel(input: { averageFishingPressureIndex: number; nationalEmptyReturnRatePercent: number; highRiskTerritoryCount: number; criticalRiskTerritoryCount: number; territoryCount: number }): NationalSustainabilitySnapshot["nationalRiskLevel"] {
    if (input.territoryCount === 0) return "low";
    const criticalShare = input.criticalRiskTerritoryCount / input.territoryCount * 100;
    const highShare = input.highRiskTerritoryCount / input.territoryCount * 100;
    const score = Math.min(100, input.averageFishingPressureIndex) * 0.45 + Math.min(100, input.nationalEmptyReturnRatePercent) * 0.25 + Math.min(100, criticalShare * 2) * 0.2 + Math.min(100, highShare) * 0.1;
    if (score >= 75 || criticalShare >= 35) return "critical";
    if (score >= 55 || criticalShare >= 15) return "high";
    if (score >= 30 || highShare >= 25) return "moderate";
    return "low";
  }

  private computeTerritorialEquityScore(territories: NationalTerritorySnapshot[]) {
    if (territories.length <= 1) return territories.length ? 100 : 0;
    const values = territories.map((territory) => territory.serviceLevelPercent);
    const average = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / values.length;
    return Math.max(0, this.round(100 - Math.sqrt(variance)));
  }

  private territoryDecisionReasons(territory: NationalTerritorySnapshot) {
    const reasons: string[] = [];
    if (territory.status === "critical") reasons.push("Situation territoriale critique.");
    if (territory.status === "degraded") reasons.push("Performance territoriale dégradée.");
    if (territory.status === "restricted") reasons.push("Restrictions opérationnelles ou réglementaires actives.");
    if (territory.status === "suspended") reasons.push("Supervision territoriale suspendue.");
    if (territory.readinessScore < 60) reasons.push("Readiness territoriale inférieure à 60.");
    if (territory.sustainabilityRiskLevel === "high" || territory.sustainabilityRiskLevel === "critical") reasons.push(`Risque de durabilité ${territory.sustainabilityRiskLevel}.`);
    if (territory.openCriticalAlertCount > 0) reasons.push(`${territory.openCriticalAlertCount} alerte(s) critique(s) ouverte(s).`);
    if (territory.serviceLevelPercent < 60) reasons.push("Niveau de service inférieur à 60 %.");
    return reasons;
  }

  private assertKnownTerritories(item: NationalFisheriesGovernanceCase, territoryIds: EntityId[]) {
    for (const territoryId of territoryIds) {
      if (!item.territories.some((territory) => territory.territoryId === territoryId)) throw new Error(`Territoire national inconnu : ${territoryId}.`);
    }
  }

  private assertKnownObjectives(item: NationalFisheriesGovernanceCase, objectiveIds: EntityId[]) {
    for (const objectiveId of objectiveIds) this.requireObjective(item, objectiveId);
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier national introuvable : ${id}.`);
    return item;
  }

  private requireObjective(item: NationalFisheriesGovernanceCase, id: EntityId) {
    const objective = item.objectives.find((entry) => entry.id === id);
    if (!objective) throw new Error(`Objectif national introuvable : ${id}.`);
    return objective;
  }

  private requireCapacityNeed(item: NationalFisheriesGovernanceCase, id: EntityId) {
    const need = item.capacityNeeds.find((entry) => entry.id === id);
    if (!need) throw new Error(`Besoin de capacité introuvable : ${id}.`);
    return need;
  }

  private requireProgram(item: NationalFisheriesGovernanceCase, id: EntityId) {
    const program = item.publicPrograms.find((entry) => entry.id === id);
    if (!program) throw new Error(`Programme public introuvable : ${id}.`);
    return program;
  }

  private requireScenario(item: NationalFisheriesGovernanceCase, id: EntityId) {
    const scenario = item.policyScenarios.find((entry) => entry.id === id);
    if (!scenario) throw new Error(`Scénario de politique publique introuvable : ${id}.`);
    return scenario;
  }

  private requireRecommendation(item: NationalFisheriesGovernanceCase, id: EntityId) {
    const recommendation = item.recommendations.find((entry) => entry.id === id);
    if (!recommendation) throw new Error(`Recommandation IA introuvable : ${id}.`);
    return recommendation;
  }

  private requireDecision(item: NationalFisheriesGovernanceCase, id: EntityId) {
    const decision = item.decisions.find((entry) => entry.id === id);
    if (!decision) throw new Error(`Décision nationale introuvable : ${id}.`);
    return decision;
  }

  private requireIntervention(item: NationalFisheriesGovernanceCase, id: EntityId) {
    const intervention = item.interventions.find((entry) => entry.id === id);
    if (!intervention) throw new Error(`Intervention nationale introuvable : ${id}.`);
    return intervention;
  }

  private touch(item: NationalFisheriesGovernanceCase, updatedAt: ISODateTime, event: NationalFisheriesGovernanceCase["events"][number]) {
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
