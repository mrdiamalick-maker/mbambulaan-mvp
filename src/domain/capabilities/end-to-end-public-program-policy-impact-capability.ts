import type { EntityId, ISODateTime } from "../infrastructures/types";

export type PublicProgramStatus =
  | "draft"
  | "designed"
  | "approved"
  | "funded"
  | "launching"
  | "active"
  | "under_review"
  | "suspended"
  | "completed"
  | "closed";

export type PublicPolicyObjectiveType =
  | "food_security"
  | "income_improvement"
  | "waste_reduction"
  | "resource_sustainability"
  | "formalization"
  | "women_empowerment"
  | "youth_employment"
  | "territorial_equity"
  | "quality_and_safety"
  | "digital_inclusion"
  | "market_access"
  | "climate_resilience";

export interface PublicPolicyObjective {
  id: EntityId;
  objectiveType: PublicPolicyObjectiveType;
  label: string;
  baselineValue: number;
  targetValue: number;
  unit: string;
  targetAt: ISODateTime;
  weightPercent: number;
  evidenceIds: EntityId[];
}

export interface PublicProgramIntervention {
  id: EntityId;
  interventionType:
    | "subsidy"
    | "equipment_distribution"
    | "training"
    | "capacity_building"
    | "market_support"
    | "digital_service"
    | "insurance_support"
    | "working_capital_support"
    | "infrastructure_support"
    | "regulatory_support"
    | "data_and_monitoring";
  title: string;
  territoryIds: EntityId[];
  capabilityIds: EntityId[];
  deliveryActorIds: EntityId[];
  beneficiarySegmentCodes: string[];
  plannedBeneficiaryCount: number;
  plannedBudgetXof: number;
  startAt: ISODateTime;
  endAt: ISODateTime;
  status: "planned" | "ready" | "active" | "blocked" | "completed" | "cancelled";
  dependencyIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface PublicProgramBeneficiary {
  id: EntityId;
  actorId: EntityId;
  segmentCode: string;
  territoryId: EntityId;
  organizationId?: EntityId;
  eligibilityStatus: "pending" | "eligible" | "ineligible" | "suspended" | "exited";
  eligibilityReasons: string[];
  vulnerabilityScore: number;
  womenLed: boolean;
  youthLed: boolean;
  registeredAt: ISODateTime;
  evidenceIds: EntityId[];
}

export interface PublicProgramBudgetLine {
  id: EntityId;
  interventionId?: EntityId;
  category:
    | "program_delivery"
    | "equipment"
    | "training"
    | "subsidy"
    | "infrastructure"
    | "monitoring_and_evaluation"
    | "digital_platform"
    | "communication"
    | "administration"
    | "contingency";
  allocatedAmountXof: number;
  committedAmountXof: number;
  disbursedAmountXof: number;
  spentAmountXof: number;
  fundingSourceActorId: EntityId;
  status: "planned" | "allocated" | "committed" | "partially_disbursed" | "disbursed" | "closed";
  evidenceIds: EntityId[];
}

export interface PublicProgramDelivery {
  id: EntityId;
  interventionId: EntityId;
  beneficiaryId: EntityId;
  deliveredByActorId: EntityId;
  deliveryType: string;
  quantity: number;
  unit: string;
  monetaryValueXof: number;
  deliveredAt: ISODateTime;
  acceptedAt?: ISODateTime;
  status: "planned" | "delivered" | "accepted" | "rejected" | "reversed";
  sourceReferenceIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface PublicProgramIndicatorMeasurement {
  id: EntityId;
  objectiveId: EntityId;
  territoryId?: EntityId;
  beneficiarySegmentCode?: string;
  measuredValue: number;
  unit: string;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  measuredAt: ISODateTime;
  confidenceScore: number;
  methodology: string;
  evidenceIds: EntityId[];
}

export interface PublicProgramImpactEvaluation {
  id: EntityId;
  evaluatedAt: ISODateTime;
  evaluatorActorId: EntityId;
  objectiveAchievementPercent: number;
  budgetExecutionPercent: number;
  beneficiaryCoveragePercent: number;
  costPerBeneficiaryXof: number;
  valueCreatedAndProtectedXof: number;
  platformRevenueXof: number;
  attributionConfidencePercent: number;
  unintendedEffects: string[];
  recommendations: string[];
  status: "draft" | "validated" | "rejected";
  evidenceIds: EntityId[];
}

export interface PublicProgramGovernanceDecision {
  id: EntityId;
  decisionType:
    | "approve_program"
    | "release_budget"
    | "adjust_target"
    | "reallocate_budget"
    | "expand_territory"
    | "restrict_eligibility"
    | "suspend_intervention"
    | "terminate_program"
    | "scale_program";
  rationale: string;
  decidedByActorId: EntityId;
  affectedInterventionIds: EntityId[];
  affectedTerritoryIds: EntityId[];
  amountXof?: number;
  expectedImpact: string[];
  evidenceIds: EntityId[];
  decidedAt: ISODateTime;
}

export interface PublicProgramCase {
  id: EntityId;
  programCode: string;
  title: string;
  ministryActorId: EntityId;
  countryId: EntityId;
  territoryIds: EntityId[];
  status: PublicProgramStatus;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  totalBudgetCeilingXof: number;
  platformContractId?: EntityId;
  objectives: PublicPolicyObjective[];
  interventions: PublicProgramIntervention[];
  beneficiaries: PublicProgramBeneficiary[];
  budgetLines: PublicProgramBudgetLine[];
  deliveries: PublicProgramDelivery[];
  measurements: PublicProgramIndicatorMeasurement[];
  evaluations: PublicProgramImpactEvaluation[];
  decisions: PublicProgramGovernanceDecision[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export class EndToEndPublicProgramPolicyImpactCapability {
  private readonly cases = new Map<EntityId, PublicProgramCase>();

  openProgram(input: {
    id: EntityId;
    programCode: string;
    title: string;
    ministryActorId: EntityId;
    countryId: EntityId;
    territoryIds: EntityId[];
    periodStart: ISODateTime;
    periodEnd: ISODateTime;
    totalBudgetCeilingXof: number;
    createdAt: ISODateTime;
    platformContractId?: EntityId;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le programme ${input.id} existe déjà.`);
    if (input.periodEnd <= input.periodStart) throw new Error("La période du programme est invalide.");
    if (input.totalBudgetCeilingXof <= 0) throw new Error("Le plafond budgétaire doit être positif.");
    const item: PublicProgramCase = {
      ...structuredClone(input),
      territoryIds: [...new Set(input.territoryIds)],
      status: "draft",
      objectives: [],
      interventions: [],
      beneficiaries: [],
      budgetLines: [],
      deliveries: [],
      measurements: [],
      evaluations: [],
      decisions: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  defineObjective(input: { caseId: EntityId; objective: PublicPolicyObjective; definedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (input.objective.weightPercent <= 0 || input.objective.weightPercent > 100) throw new Error("Le poids de l'objectif est invalide.");
    if (input.objective.evidenceIds.length === 0) throw new Error("Une preuve de baseline est obligatoire.");
    item.objectives.push(structuredClone(input.objective));
    item.status = "designed";
    this.touch(item, input.definedAt);
    return structuredClone(item);
  }

  addIntervention(input: { caseId: EntityId; intervention: PublicProgramIntervention; addedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    for (const territoryId of input.intervention.territoryIds) this.requireTerritory(item, territoryId);
    if (input.intervention.endAt <= input.intervention.startAt) throw new Error("La période d'intervention est invalide.");
    if (input.intervention.plannedBudgetXof < 0 || input.intervention.plannedBeneficiaryCount < 0) throw new Error("Les objectifs d'intervention sont invalides.");
    item.interventions.push(structuredClone(input.intervention));
    this.touch(item, input.addedAt);
    return structuredClone(item);
  }

  registerBeneficiary(input: { caseId: EntityId; beneficiary: PublicProgramBeneficiary }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.beneficiary.territoryId);
    if (input.beneficiary.vulnerabilityScore < 0 || input.beneficiary.vulnerabilityScore > 100) throw new Error("Le score de vulnérabilité est invalide.");
    if (input.beneficiary.evidenceIds.length === 0) throw new Error("Une preuve d'éligibilité est obligatoire.");
    item.beneficiaries.push(structuredClone(input.beneficiary));
    this.touch(item, input.beneficiary.registeredAt);
    return structuredClone(item);
  }

  addBudgetLine(input: { caseId: EntityId; budgetLine: PublicProgramBudgetLine; addedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (input.budgetLine.interventionId) this.requireIntervention(item, input.budgetLine.interventionId);
    if ([input.budgetLine.allocatedAmountXof, input.budgetLine.committedAmountXof, input.budgetLine.disbursedAmountXof, input.budgetLine.spentAmountXof].some((value) => value < 0)) throw new Error("Les montants budgétaires ne peuvent pas être négatifs.");
    if (input.budgetLine.committedAmountXof > input.budgetLine.allocatedAmountXof || input.budgetLine.disbursedAmountXof > input.budgetLine.committedAmountXof || input.budgetLine.spentAmountXof > input.budgetLine.disbursedAmountXof) throw new Error("La chaîne budgétaire est incohérente.");
    const totalAllocated = item.budgetLines.reduce((sum, line) => sum + line.allocatedAmountXof, 0) + input.budgetLine.allocatedAmountXof;
    if (totalAllocated > item.totalBudgetCeilingXof) throw new Error("Les allocations dépassent le plafond du programme.");
    if (input.budgetLine.evidenceIds.length === 0) throw new Error("Une preuve budgétaire est obligatoire.");
    item.budgetLines.push(structuredClone(input.budgetLine));
    this.touch(item, input.addedAt);
    return structuredClone(item);
  }

  approveProgram(input: { caseId: EntityId; decision: PublicProgramGovernanceDecision }) {
    const item = this.requireCase(input.caseId);
    if (!item.objectives.length) throw new Error("Le programme ne dispose d'aucun objectif public.");
    if (!item.interventions.length) throw new Error("Le programme ne dispose d'aucune intervention.");
    if (!item.budgetLines.length) throw new Error("Le programme ne dispose d'aucun budget.");
    const totalWeight = item.objectives.reduce((sum, objective) => sum + objective.weightPercent, 0);
    if (Math.abs(totalWeight - 100) > 0.01) throw new Error("La pondération des objectifs doit totaliser 100 %.");
    if (input.decision.decisionType !== "approve_program") throw new Error("La décision fournie n'approuve pas le programme.");
    if (input.decision.evidenceIds.length === 0) throw new Error("Une preuve de décision est obligatoire.");
    item.decisions.push(structuredClone(input.decision));
    item.status = "approved";
    this.touch(item, input.decision.decidedAt);
    return structuredClone(item);
  }

  launchProgram(input: { caseId: EntityId; launchedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.status !== "approved") throw new Error("Le programme doit être approuvé avant lancement.");
    const committed = item.budgetLines.reduce((sum, line) => sum + line.committedAmountXof, 0);
    if (committed <= 0) throw new Error("Aucun budget n'est engagé.");
    item.status = "active";
    for (const intervention of item.interventions.filter((entry) => entry.status === "ready" || entry.status === "planned")) intervention.status = "active";
    this.touch(item, launchedAt);
    return structuredClone(item);
  }

  recordDelivery(input: { caseId: EntityId; delivery: PublicProgramDelivery }) {
    const item = this.requireCase(input.caseId);
    const intervention = this.requireIntervention(item, input.delivery.interventionId);
    const beneficiary = this.requireBeneficiary(item, input.delivery.beneficiaryId);
    if (item.status !== "active" || intervention.status !== "active") throw new Error("Le programme et l'intervention doivent être actifs.");
    if (beneficiary.eligibilityStatus !== "eligible") throw new Error("Le bénéficiaire n'est pas éligible.");
    if (input.delivery.quantity <= 0 || input.delivery.monetaryValueXof < 0) throw new Error("La livraison est invalide.");
    if (input.delivery.evidenceIds.length === 0) throw new Error("Une preuve de livraison est obligatoire.");
    item.deliveries.push(structuredClone(input.delivery));
    this.touch(item, input.delivery.deliveredAt);
    return structuredClone(item);
  }

  recordMeasurement(input: { caseId: EntityId; measurement: PublicProgramIndicatorMeasurement }) {
    const item = this.requireCase(input.caseId);
    const objective = this.requireObjective(item, input.measurement.objectiveId);
    if (input.measurement.unit !== objective.unit) throw new Error("L'unité de mesure ne correspond pas à l'objectif.");
    if (input.measurement.confidenceScore < 0 || input.measurement.confidenceScore > 100) throw new Error("Le score de confiance est invalide.");
    if (input.measurement.evidenceIds.length === 0) throw new Error("Une preuve de mesure est obligatoire.");
    item.measurements.push(structuredClone(input.measurement));
    item.status = "under_review";
    this.touch(item, input.measurement.measuredAt);
    return structuredClone(item);
  }

  evaluateImpact(input: { caseId: EntityId; evaluation: Omit<PublicProgramImpactEvaluation, "objectiveAchievementPercent" | "budgetExecutionPercent" | "beneficiaryCoveragePercent" | "costPerBeneficiaryXof"> }) {
    const item = this.requireCase(input.caseId);
    if (input.evaluation.evidenceIds.length === 0) throw new Error("Une preuve d'évaluation est obligatoire.");
    const weightedAchievement = item.objectives.reduce((sum, objective) => {
      const latest = item.measurements.filter((measurement) => measurement.objectiveId === objective.id).sort((a, b) => b.measuredAt.localeCompare(a.measuredAt))[0];
      if (!latest) return sum;
      const denominator = objective.targetValue - objective.baselineValue;
      const progress = denominator === 0 ? 100 : Math.max(0, Math.min(100, (latest.measuredValue - objective.baselineValue) / denominator * 100));
      return sum + progress * objective.weightPercent / 100;
    }, 0);
    const allocated = item.budgetLines.reduce((sum, line) => sum + line.allocatedAmountXof, 0);
    const spent = item.budgetLines.reduce((sum, line) => sum + line.spentAmountXof, 0);
    const eligible = item.beneficiaries.filter((beneficiary) => beneficiary.eligibilityStatus === "eligible").length;
    const served = new Set(item.deliveries.filter((delivery) => delivery.status === "accepted").map((delivery) => delivery.beneficiaryId)).size;
    const evaluation: PublicProgramImpactEvaluation = {
      ...structuredClone(input.evaluation),
      objectiveAchievementPercent: this.round(weightedAchievement),
      budgetExecutionPercent: allocated ? this.round(spent / allocated * 100) : 0,
      beneficiaryCoveragePercent: eligible ? this.round(served / eligible * 100) : 0,
      costPerBeneficiaryXof: served ? Math.round(spent / served) : 0,
    };
    item.evaluations.push(evaluation);
    item.status = "under_review";
    this.touch(item, evaluation.evaluatedAt);
    return structuredClone(evaluation);
  }

  recordDecision(input: { caseId: EntityId; decision: PublicProgramGovernanceDecision }) {
    const item = this.requireCase(input.caseId);
    if (input.decision.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour une décision publique.");
    for (const interventionId of input.decision.affectedInterventionIds) this.requireIntervention(item, interventionId);
    for (const territoryId of input.decision.affectedTerritoryIds) this.requireTerritory(item, territoryId);
    item.decisions.push(structuredClone(input.decision));
    if (input.decision.decisionType === "suspend_intervention") {
      for (const interventionId of input.decision.affectedInterventionIds) this.requireIntervention(item, interventionId).status = "blocked";
    }
    if (input.decision.decisionType === "terminate_program") item.status = "suspended";
    this.touch(item, input.decision.decidedAt);
    return structuredClone(item);
  }

  getPublicProgramCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const allocated = item.budgetLines.reduce((sum, line) => sum + line.allocatedAmountXof, 0);
    const committed = item.budgetLines.reduce((sum, line) => sum + line.committedAmountXof, 0);
    const disbursed = item.budgetLines.reduce((sum, line) => sum + line.disbursedAmountXof, 0);
    const spent = item.budgetLines.reduce((sum, line) => sum + line.spentAmountXof, 0);
    const acceptedDeliveries = item.deliveries.filter((delivery) => delivery.status === "accepted");
    const servedBeneficiaries = new Set(acceptedDeliveries.map((delivery) => delivery.beneficiaryId));
    const latestEvaluation = item.evaluations.at(-1);
    return {
      caseId: item.id,
      programCode: item.programCode,
      status: item.status,
      territoryCount: item.territoryIds.length,
      objectiveCount: item.objectives.length,
      interventionCount: item.interventions.length,
      activeInterventionCount: item.interventions.filter((intervention) => intervention.status === "active").length,
      registeredBeneficiaryCount: item.beneficiaries.length,
      eligibleBeneficiaryCount: item.beneficiaries.filter((beneficiary) => beneficiary.eligibilityStatus === "eligible").length,
      servedBeneficiaryCount: servedBeneficiaries.size,
      womenLedServedCount: item.beneficiaries.filter((beneficiary) => beneficiary.womenLed && servedBeneficiaries.has(beneficiary.id)).length,
      youthLedServedCount: item.beneficiaries.filter((beneficiary) => beneficiary.youthLed && servedBeneficiaries.has(beneficiary.id)).length,
      allocatedBudgetXof: allocated,
      committedBudgetXof: committed,
      disbursedBudgetXof: disbursed,
      spentBudgetXof: spent,
      budgetExecutionPercent: allocated ? this.round(spent / allocated * 100) : 0,
      deliveryValueXof: acceptedDeliveries.reduce((sum, delivery) => sum + delivery.monetaryValueXof, 0),
      latestObjectiveAchievementPercent: latestEvaluation?.objectiveAchievementPercent,
      latestValueCreatedAndProtectedXof: latestEvaluation?.valueCreatedAndProtectedXof,
      latestPlatformRevenueXof: latestEvaluation?.platformRevenueXof,
      blockers: [...item.blockers],
      warnings: [...item.warnings],
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Programme public introuvable : ${id}.`);
    return item;
  }

  private requireTerritory(item: PublicProgramCase, id: EntityId) {
    if (!item.territoryIds.includes(id)) throw new Error(`Territoire hors périmètre : ${id}.`);
  }

  private requireObjective(item: PublicProgramCase, id: EntityId) {
    const value = item.objectives.find((entry) => entry.id === id);
    if (!value) throw new Error(`Objectif public introuvable : ${id}.`);
    return value;
  }

  private requireIntervention(item: PublicProgramCase, id: EntityId) {
    const value = item.interventions.find((entry) => entry.id === id);
    if (!value) throw new Error(`Intervention introuvable : ${id}.`);
    return value;
  }

  private requireBeneficiary(item: PublicProgramCase, id: EntityId) {
    const value = item.beneficiaries.find((entry) => entry.id === id);
    if (!value) throw new Error(`Bénéficiaire introuvable : ${id}.`);
    return value;
  }

  private touch(item: PublicProgramCase, updatedAt: ISODateTime) {
    item.updatedAt = updatedAt;
    this.cases.set(item.id, item);
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
