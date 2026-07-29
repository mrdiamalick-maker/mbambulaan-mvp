import type { EntityId, ISODateTime } from "../infrastructures/types";

export type CapacityCategory =
  | "landing"
  | "cold_storage"
  | "ice"
  | "transport"
  | "processing"
  | "quality_control"
  | "energy"
  | "fuel"
  | "digital_connectivity"
  | "market_access"
  | "training"
  | "working_capital";

export type InvestmentStatus =
  | "identified"
  | "qualified"
  | "prioritized"
  | "funding"
  | "approved"
  | "implementing"
  | "operational"
  | "suspended"
  | "cancelled"
  | "closed";

export interface TerritorialCapacityBaseline {
  id: EntityId;
  territoryId: EntityId;
  category: CapacityCategory;
  installedCapacity: number;
  usableCapacity: number;
  requiredCapacity: number;
  unit: string;
  utilizationPercent: number;
  reliabilityPercent: number;
  averageServiceCostXof?: number;
  evidenceIds: EntityId[];
  measuredAt: ISODateTime;
}

export interface CapacityGap {
  id: EntityId;
  territoryId: EntityId;
  category: CapacityCategory;
  gapQuantity: number;
  unit: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedActorCount: number;
  affectedVolumeKg: number;
  valueAtRiskXof: number;
  jobsAtRisk: number;
  expectedDemandGrowthPercent: number;
  climateRiskScore: number;
  resourcePressureScore: number;
  evidenceIds: EntityId[];
  detectedAt: ISODateTime;
}

export interface InvestmentProject {
  id: EntityId;
  projectCode: string;
  title: string;
  territoryIds: EntityId[];
  categories: CapacityCategory[];
  gapIds: EntityId[];
  sponsorActorId: EntityId;
  implementingActorIds: EntityId[];
  beneficiaryActorIds: EntityId[];
  estimatedCapitalCostXof: number;
  estimatedAnnualOperatingCostXof: number;
  requestedPublicFundingXof: number;
  requestedPrivateFundingXof: number;
  requestedGrantFundingXof: number;
  committedFundingXof: number;
  expectedAdditionalCapacity: number;
  capacityUnit: string;
  expectedAnnualVolumeSupportedKg: number;
  expectedAnnualWasteAvoidedKg: number;
  expectedAnnualValueProtectedXof: number;
  expectedJobsCreated: number;
  expectedJobsProtected: number;
  expectedPlatformRevenueXof: number;
  expectedResourcePressureChangePercent: number;
  status: InvestmentStatus;
  priorityScore: number;
  strategicRationale: string[];
  blockers: string[];
  evidenceIds: EntityId[];
  plannedStartAt?: ISODateTime;
  plannedOperationalAt?: ISODateTime;
  actualOperationalAt?: ISODateTime;
}

export interface InvestmentFundingCommitment {
  id: EntityId;
  projectId: EntityId;
  funderActorId: EntityId;
  fundingType: "public_budget" | "private_equity" | "grant" | "concessional_finance" | "commercial_finance" | "in_kind";
  amountXof: number;
  disbursedAmountXof: number;
  conditions: string[];
  status: "proposed" | "committed" | "partially_disbursed" | "disbursed" | "cancelled";
  evidenceIds: EntityId[];
  committedAt: ISODateTime;
}

export interface InvestmentMilestone {
  id: EntityId;
  projectId: EntityId;
  milestoneType: "feasibility" | "design" | "procurement" | "construction" | "installation" | "commissioning" | "training" | "operational_handover";
  label: string;
  ownerActorId: EntityId;
  plannedAt: ISODateTime;
  completedAt?: ISODateTime;
  status: "planned" | "in_progress" | "blocked" | "completed" | "cancelled";
  budgetConsumedXof: number;
  evidenceIds: EntityId[];
}

export interface InvestmentOutcome {
  id: EntityId;
  projectId: EntityId;
  measuredAt: ISODateTime;
  operationalCapacityAdded: number;
  capacityUnit: string;
  annualizedVolumeSupportedKg: number;
  annualizedWasteAvoidedKg: number;
  annualizedValueProtectedXof: number;
  jobsCreated: number;
  jobsProtected: number;
  platformRevenueXof: number;
  beneficiaryActorCount: number;
  serviceCostChangePercent: number;
  reliabilityChangePercent: number;
  resourcePressureChangePercent: number;
  confidenceScore: number;
  evidenceIds: EntityId[];
}

export interface NationalCapacityInvestmentPlan {
  id: EntityId;
  planCode: string;
  countryId: EntityId;
  territoryIds: EntityId[];
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  totalBudgetCeilingXof: number;
  status: "draft" | "diagnosing" | "prioritizing" | "funding" | "executing" | "reviewing" | "closed";
  baselines: TerritorialCapacityBaseline[];
  gaps: CapacityGap[];
  projects: InvestmentProject[];
  fundingCommitments: InvestmentFundingCommitment[];
  milestones: InvestmentMilestone[];
  outcomes: InvestmentOutcome[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export class EndToEndNationalCapacityInvestmentPlanningCapability {
  private readonly plans = new Map<EntityId, NationalCapacityInvestmentPlan>();

  openPlan(input: {
    id: EntityId;
    planCode: string;
    countryId: EntityId;
    territoryIds: EntityId[];
    periodStart: ISODateTime;
    periodEnd: ISODateTime;
    totalBudgetCeilingXof: number;
    createdAt: ISODateTime;
  }) {
    if (this.plans.has(input.id)) throw new Error(`Le plan ${input.id} existe déjà.`);
    if (input.periodEnd <= input.periodStart) throw new Error("La période du plan est invalide.");
    if (input.totalBudgetCeilingXof <= 0) throw new Error("Le plafond budgétaire doit être positif.");
    const plan: NationalCapacityInvestmentPlan = {
      ...structuredClone(input),
      territoryIds: [...new Set(input.territoryIds)],
      status: "draft",
      baselines: [],
      gaps: [],
      projects: [],
      fundingCommitments: [],
      milestones: [],
      outcomes: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      updatedAt: input.createdAt,
    };
    this.plans.set(plan.id, plan);
    return structuredClone(plan);
  }

  registerBaseline(input: { planId: EntityId; baseline: TerritorialCapacityBaseline }) {
    const plan = this.requirePlan(input.planId);
    this.requireTerritory(plan, input.baseline.territoryId);
    if (input.baseline.installedCapacity < 0 || input.baseline.usableCapacity < 0 || input.baseline.requiredCapacity < 0) throw new Error("Les capacités ne peuvent pas être négatives.");
    if (input.baseline.usableCapacity > input.baseline.installedCapacity) throw new Error("La capacité utilisable dépasse la capacité installée.");
    if (input.baseline.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour une baseline.");
    plan.baselines.push(structuredClone(input.baseline));
    plan.status = "diagnosing";
    this.touch(plan, input.baseline.measuredAt);
    return structuredClone(plan);
  }

  detectGap(input: { planId: EntityId; gap: CapacityGap }) {
    const plan = this.requirePlan(input.planId);
    this.requireTerritory(plan, input.gap.territoryId);
    const baseline = plan.baselines.find((entry) => entry.territoryId === input.gap.territoryId && entry.category === input.gap.category);
    if (!baseline) throw new Error("Une baseline est nécessaire avant de déclarer un déficit.");
    const expectedGap = Math.max(0, baseline.requiredCapacity - baseline.usableCapacity);
    if (input.gap.gapQuantity > expectedGap * 1.1) throw new Error("Le déficit déclaré n'est pas cohérent avec la baseline.");
    if (input.gap.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour un déficit.");
    plan.gaps.push(structuredClone(input.gap));
    this.touch(plan, input.gap.detectedAt);
    return structuredClone(plan);
  }

  proposeProject(input: { planId: EntityId; project: InvestmentProject; proposedAt: ISODateTime }) {
    const plan = this.requirePlan(input.planId);
    for (const territoryId of input.project.territoryIds) this.requireTerritory(plan, territoryId);
    for (const gapId of input.project.gapIds) this.requireGap(plan, gapId);
    if (input.project.estimatedCapitalCostXof <= 0) throw new Error("Le coût d'investissement doit être positif.");
    if (input.project.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour proposer un investissement.");
    const totalRequested = input.project.requestedPublicFundingXof + input.project.requestedPrivateFundingXof + input.project.requestedGrantFundingXof;
    if (totalRequested > input.project.estimatedCapitalCostXof) throw new Error("Le financement demandé dépasse le coût d'investissement.");
    input.project.priorityScore = this.computePriorityScore(plan, input.project);
    input.project.status = "qualified";
    plan.projects.push(structuredClone(input.project));
    plan.status = "prioritizing";
    this.touch(plan, input.proposedAt);
    return structuredClone(input.project);
  }

  prioritizePortfolio(input: { planId: EntityId; prioritizedAt: ISODateTime }) {
    const plan = this.requirePlan(input.planId);
    const ordered = [...plan.projects].sort((a, b) => b.priorityScore - a.priorityScore);
    let allocated = 0;
    for (const project of ordered) {
      if (allocated + project.estimatedCapitalCostXof <= plan.totalBudgetCeilingXof) {
        project.status = "prioritized";
        allocated += project.estimatedCapitalCostXof;
      } else {
        project.blockers = this.unique([...project.blockers, "Projet hors enveloppe budgétaire prioritaire."]);
      }
    }
    plan.status = "funding";
    this.touch(plan, input.prioritizedAt);
    return structuredClone(ordered);
  }

  registerFundingCommitment(input: { planId: EntityId; commitment: InvestmentFundingCommitment }) {
    const plan = this.requirePlan(input.planId);
    const project = this.requireProject(plan, input.commitment.projectId);
    if (input.commitment.amountXof <= 0 || input.commitment.disbursedAmountXof < 0) throw new Error("Les montants de financement sont invalides.");
    if (input.commitment.disbursedAmountXof > input.commitment.amountXof) throw new Error("Le décaissement dépasse l'engagement.");
    if (input.commitment.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour un engagement financier.");
    plan.fundingCommitments.push(structuredClone(input.commitment));
    project.committedFundingXof = plan.fundingCommitments.filter((entry) => entry.projectId === project.id && entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amountXof, 0);
    project.status = project.committedFundingXof >= project.estimatedCapitalCostXof ? "approved" : "funding";
    this.touch(plan, input.commitment.committedAt);
    return structuredClone(project);
  }

  registerMilestone(input: { planId: EntityId; milestone: InvestmentMilestone; registeredAt: ISODateTime }) {
    const plan = this.requirePlan(input.planId);
    const project = this.requireProject(plan, input.milestone.projectId);
    if (! ["approved", "implementing"].includes(project.status)) throw new Error("Le projet doit être financé avant d'ouvrir ses jalons.");
    plan.milestones.push(structuredClone(input.milestone));
    project.status = "implementing";
    plan.status = "executing";
    this.touch(plan, input.registeredAt);
    return structuredClone(plan);
  }

  completeMilestone(input: { planId: EntityId; milestoneId: EntityId; completedAt: ISODateTime; budgetConsumedXof: number; evidenceIds: EntityId[] }) {
    const plan = this.requirePlan(input.planId);
    const milestone = this.requireMilestone(plan, input.milestoneId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour clôturer un jalon.");
    milestone.status = "completed";
    milestone.completedAt = input.completedAt;
    milestone.budgetConsumedXof = input.budgetConsumedXof;
    milestone.evidenceIds = this.unique([...milestone.evidenceIds, ...input.evidenceIds]);
    const project = this.requireProject(plan, milestone.projectId);
    const projectMilestones = plan.milestones.filter((entry) => entry.projectId === project.id);
    if (projectMilestones.some((entry) => entry.milestoneType === "operational_handover" && entry.status === "completed")) {
      project.status = "operational";
      project.actualOperationalAt = input.completedAt;
    }
    this.touch(plan, input.completedAt);
    return structuredClone(milestone);
  }

  recordOutcome(input: { planId: EntityId; outcome: InvestmentOutcome }) {
    const plan = this.requirePlan(input.planId);
    const project = this.requireProject(plan, input.outcome.projectId);
    if (project.status !== "operational") throw new Error("Les résultats ne peuvent être mesurés qu'après mise en service.");
    if (input.outcome.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour mesurer un résultat.");
    plan.outcomes.push(structuredClone(input.outcome));
    plan.status = "reviewing";
    this.touch(plan, input.outcome.measuredAt);
    return structuredClone(input.outcome);
  }

  getNationalInvestmentCommandCenter(input: { planId: EntityId; generatedAt: ISODateTime }) {
    const plan = this.requirePlan(input.planId);
    const totalCapitalCostXof = plan.projects.reduce((sum, project) => sum + project.estimatedCapitalCostXof, 0);
    const prioritizedCapitalCostXof = plan.projects.filter((project) => ["prioritized", "funding", "approved", "implementing", "operational"].includes(project.status)).reduce((sum, project) => sum + project.estimatedCapitalCostXof, 0);
    const committedFundingXof = plan.fundingCommitments.filter((entry) => entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amountXof, 0);
    const disbursedFundingXof = plan.fundingCommitments.reduce((sum, entry) => sum + entry.disbursedAmountXof, 0);
    const consumedBudgetXof = plan.milestones.reduce((sum, entry) => sum + entry.budgetConsumedXof, 0);
    const outcomes = plan.outcomes;
    return {
      planId: plan.id,
      status: plan.status,
      gapCount: plan.gaps.length,
      criticalGapCount: plan.gaps.filter((gap) => gap.severity === "critical").length,
      projectCount: plan.projects.length,
      prioritizedProjectCount: plan.projects.filter((project) => ["prioritized", "funding", "approved", "implementing", "operational"].includes(project.status)).length,
      operationalProjectCount: plan.projects.filter((project) => project.status === "operational").length,
      totalCapitalCostXof,
      prioritizedCapitalCostXof,
      committedFundingXof,
      disbursedFundingXof,
      consumedBudgetXof,
      fundingCoveragePercent: prioritizedCapitalCostXof ? this.round(committedFundingXof / prioritizedCapitalCostXof * 100) : 100,
      disbursementRatePercent: committedFundingXof ? this.round(disbursedFundingXof / committedFundingXof * 100) : 0,
      budgetConsumptionPercent: disbursedFundingXof ? this.round(consumedBudgetXof / disbursedFundingXof * 100) : 0,
      annualizedVolumeSupportedKg: outcomes.reduce((sum, outcome) => sum + outcome.annualizedVolumeSupportedKg, 0),
      annualizedWasteAvoidedKg: outcomes.reduce((sum, outcome) => sum + outcome.annualizedWasteAvoidedKg, 0),
      annualizedValueProtectedXof: outcomes.reduce((sum, outcome) => sum + outcome.annualizedValueProtectedXof, 0),
      jobsCreated: outcomes.reduce((sum, outcome) => sum + outcome.jobsCreated, 0),
      jobsProtected: outcomes.reduce((sum, outcome) => sum + outcome.jobsProtected, 0),
      platformRevenueXof: outcomes.reduce((sum, outcome) => sum + outcome.platformRevenueXof, 0),
      projectsAtRisk: plan.projects.filter((project) => project.blockers.length > 0 || project.status === "suspended").map((project) => ({ projectId: project.id, blockers: [...project.blockers], status: project.status })),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.plans.values()].map((plan) => structuredClone(plan));
  }

  private computePriorityScore(plan: NationalCapacityInvestmentPlan, project: InvestmentProject) {
    const gaps = project.gapIds.map((gapId) => this.requireGap(plan, gapId));
    const severityScore = gaps.reduce((sum, gap) => sum + ({ low: 20, medium: 45, high: 70, critical: 100 }[gap.severity]), 0) / Math.max(1, gaps.length);
    const valueScore = Math.min(100, gaps.reduce((sum, gap) => sum + gap.valueAtRiskXof, 0) / 10_000_000);
    const jobsScore = Math.min(100, gaps.reduce((sum, gap) => sum + gap.jobsAtRisk, 0) / 5);
    const climateScore = gaps.reduce((sum, gap) => sum + gap.climateRiskScore, 0) / Math.max(1, gaps.length);
    const resourceScore = gaps.reduce((sum, gap) => sum + gap.resourcePressureScore, 0) / Math.max(1, gaps.length);
    const platformScore = Math.min(100, project.expectedPlatformRevenueXof / Math.max(1, project.estimatedCapitalCostXof) * 1000);
    return this.round(severityScore * 0.3 + valueScore * 0.2 + jobsScore * 0.15 + climateScore * 0.1 + resourceScore * 0.1 + platformScore * 0.15);
  }

  private requirePlan(id: EntityId) {
    const plan = this.plans.get(id);
    if (!plan) throw new Error(`Plan d'investissement introuvable : ${id}.`);
    return plan;
  }

  private requireTerritory(plan: NationalCapacityInvestmentPlan, territoryId: EntityId) {
    if (!plan.territoryIds.includes(territoryId)) throw new Error(`Territoire hors périmètre : ${territoryId}.`);
  }

  private requireGap(plan: NationalCapacityInvestmentPlan, id: EntityId) {
    const gap = plan.gaps.find((entry) => entry.id === id);
    if (!gap) throw new Error(`Déficit de capacité introuvable : ${id}.`);
    return gap;
  }

  private requireProject(plan: NationalCapacityInvestmentPlan, id: EntityId) {
    const project = plan.projects.find((entry) => entry.id === id);
    if (!project) throw new Error(`Projet d'investissement introuvable : ${id}.`);
    return project;
  }

  private requireMilestone(plan: NationalCapacityInvestmentPlan, id: EntityId) {
    const milestone = plan.milestones.find((entry) => entry.id === id);
    if (!milestone) throw new Error(`Jalon introuvable : ${id}.`);
    return milestone;
  }

  private touch(plan: NationalCapacityInvestmentPlan, updatedAt: ISODateTime) {
    plan.updatedAt = updatedAt;
    this.plans.set(plan.id, plan);
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
