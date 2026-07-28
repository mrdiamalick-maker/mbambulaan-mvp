export type RecoveryRoute =
  | "fresh_market"
  | "cold_storage"
  | "processing"
  | "community_program"
  | "coproduct_recovery"
  | "controlled_rejection";

export type RecoveryPlanStatus =
  | "proposed"
  | "approved"
  | "capacity_reserved"
  | "in_progress"
  | "completed"
  | "failed"
  | "cancelled";

export interface RecoveryPlan {
  id: string;
  lotId: string;
  territoryId: string;
  route: RecoveryRoute;
  quantityKg: number;
  referenceValuePerKgXof: number;
  responsibleOrganizationId: string;
  serviceProviderOrganizationId?: string;
  communityInitiativeId?: string;
  beneficiaryOrganizationIds: string[];
  requiresColdChain: boolean;
  requiresHumanApproval: boolean;
  status: RecoveryPlanStatus;
  proposedAt: string;
  approvedAt?: string;
  startedAt?: string;
  completedAt?: string;
  failureReason?: string;
}

export interface CommunityInitiative {
  id: string;
  territoryId: string;
  title: string;
  objective:
    | "food_security"
    | "women_processing"
    | "youth_employment"
    | "shared_equipment"
    | "coproduct_recovery";
  governanceOrganizationId: string;
  beneficiaryOrganizationIds: string[];
  contributionRateBps: number;
  status: "draft" | "active" | "suspended" | "completed";
}

export interface RecoveryEvidence {
  id: string;
  planId: string;
  type: "delivery" | "storage" | "processing" | "beneficiary_register" | "quality_control" | "destruction";
  reference: string;
  recordedByActorId: string;
  recordedAt: string;
}

export interface RecoveryOutcome {
  id: string;
  planId: string;
  lotId: string;
  route: RecoveryRoute;
  quantitySavedKg: number;
  quantityLostKg: number;
  valuePreservedXof: number;
  communityContributionXof: number;
  beneficiaryCount: number;
  processingYieldKg?: number;
  avoidedLossRate: number;
  evidenceIds: string[];
  measuredAt: string;
}

export interface ValueRecoverySnapshot {
  initiatives: CommunityInitiative[];
  plans: RecoveryPlan[];
  evidence: RecoveryEvidence[];
  outcomes: RecoveryOutcome[];
}

export class PostCaptureValueRecovery {
  private state: ValueRecoverySnapshot = {
    initiatives: [],
    plans: [],
    evidence: [],
    outcomes: [],
  };

  registerCommunityInitiative(input: CommunityInitiative) {
    this.ensureUnique(input.id, this.state.initiatives, "initiative communautaire");
    if (input.contributionRateBps < 0 || input.contributionRateBps > 10_000) {
      throw new Error("Le taux de contribution communautaire doit être compris entre 0 et 10 000 points de base.");
    }
    if (input.beneficiaryOrganizationIds.length === 0) {
      throw new Error("Une initiative communautaire doit identifier au moins un bénéficiaire.");
    }
    this.state.initiatives.push(structuredClone(input));
    return structuredClone(input);
  }

  proposePlan(input: Omit<RecoveryPlan, "status">) {
    this.ensureUnique(input.id, this.state.plans, "plan de valorisation");
    if (input.quantityKg <= 0) throw new Error("La quantité à valoriser doit être strictement positive.");
    if (input.referenceValuePerKgXof < 0) throw new Error("La valeur de référence ne peut pas être négative.");
    if (input.route === "community_program") {
      if (!input.communityInitiativeId) throw new Error("Une initiative communautaire est obligatoire.");
      const initiative = this.requireInitiative(input.communityInitiativeId);
      if (initiative.status !== "active") throw new Error("L'initiative communautaire doit être active.");
      if (initiative.territoryId !== input.territoryId) throw new Error("L'initiative communautaire appartient à un autre territoire.");
    }
    if (["cold_storage", "processing"].includes(input.route) && !input.serviceProviderOrganizationId) {
      throw new Error("Un prestataire de capacité est obligatoire pour cette route.");
    }
    const plan: RecoveryPlan = { ...structuredClone(input), status: "proposed" };
    this.state.plans.push(plan);
    return structuredClone(plan);
  }

  approvePlan(planId: string, approvedAt: string) {
    const plan = this.requirePlan(planId);
    if (plan.status !== "proposed") throw new Error("Seul un plan proposé peut être approuvé.");
    plan.status = "approved";
    plan.approvedAt = approvedAt;
    return structuredClone(plan);
  }

  reserveCapacity(planId: string) {
    const plan = this.requirePlan(planId);
    if (plan.status !== "approved") throw new Error("Le plan doit être approuvé avant réservation de capacité.");
    if (["cold_storage", "processing"].includes(plan.route) && !plan.serviceProviderOrganizationId) {
      throw new Error("Aucun prestataire n'est affecté au plan.");
    }
    plan.status = "capacity_reserved";
    return structuredClone(plan);
  }

  startPlan(planId: string, startedAt: string) {
    const plan = this.requirePlan(planId);
    if (!["approved", "capacity_reserved"].includes(plan.status)) {
      throw new Error("Le plan ne peut pas être démarré dans son état actuel.");
    }
    plan.status = "in_progress";
    plan.startedAt = startedAt;
    return structuredClone(plan);
  }

  recordEvidence(input: RecoveryEvidence) {
    this.ensureUnique(input.id, this.state.evidence, "preuve de valorisation");
    const plan = this.requirePlan(input.planId);
    if (!["in_progress", "completed"].includes(plan.status)) {
      throw new Error("Une preuve ne peut être déposée que sur un plan en exécution ou terminé.");
    }
    this.state.evidence.push(structuredClone(input));
    return structuredClone(input);
  }

  completePlan(input: {
    outcomeId: string;
    planId: string;
    quantitySavedKg: number;
    quantityLostKg: number;
    beneficiaryCount: number;
    processingYieldKg?: number;
    completedAt: string;
  }) {
    const plan = this.requirePlan(input.planId);
    if (plan.status !== "in_progress") throw new Error("Le plan doit être en cours avant clôture.");
    if (this.state.outcomes.some((item) => item.planId === plan.id)) throw new Error("Ce plan possède déjà un résultat.");
    if (input.quantitySavedKg < 0 || input.quantityLostKg < 0) throw new Error("Les quantités mesurées ne peuvent pas être négatives.");
    const measuredQuantity = input.quantitySavedKg + input.quantityLostKg;
    if (Math.abs(measuredQuantity - plan.quantityKg) > 0.001) {
      throw new Error("Les quantités sauvées et perdues doivent correspondre à la quantité du plan.");
    }
    if (plan.route === "community_program" && input.beneficiaryCount <= 0) {
      throw new Error("Un programme communautaire doit produire des bénéficiaires mesurés.");
    }
    const evidenceIds = this.state.evidence.filter((item) => item.planId === plan.id).map((item) => item.id);
    if (evidenceIds.length === 0) throw new Error("Une preuve est obligatoire avant clôture.");

    const grossPreservedValue = Math.round(input.quantitySavedKg * plan.referenceValuePerKgXof);
    const communityContributionXof = this.communityContribution(plan, grossPreservedValue);
    const outcome: RecoveryOutcome = {
      id: input.outcomeId,
      planId: plan.id,
      lotId: plan.lotId,
      route: plan.route,
      quantitySavedKg: input.quantitySavedKg,
      quantityLostKg: input.quantityLostKg,
      valuePreservedXof: grossPreservedValue,
      communityContributionXof,
      beneficiaryCount: input.beneficiaryCount,
      processingYieldKg: input.processingYieldKg,
      avoidedLossRate: plan.quantityKg === 0 ? 0 : input.quantitySavedKg / plan.quantityKg,
      evidenceIds,
      measuredAt: input.completedAt,
    };
    plan.status = "completed";
    plan.completedAt = input.completedAt;
    this.state.outcomes.push(outcome);
    return structuredClone(outcome);
  }

  failPlan(planId: string, failureReason: string) {
    const plan = this.requirePlan(planId);
    if (["completed", "cancelled"].includes(plan.status)) throw new Error("Ce plan ne peut plus être déclaré en échec.");
    if (!failureReason.trim()) throw new Error("Le motif d'échec est obligatoire.");
    plan.status = "failed";
    plan.failureReason = failureReason.trim();
    return structuredClone(plan);
  }

  getImpactSummary(territoryId?: string) {
    const plans = territoryId ? this.state.plans.filter((item) => item.territoryId === territoryId) : this.state.plans;
    const planIds = new Set(plans.map((item) => item.id));
    const outcomes = this.state.outcomes.filter((item) => planIds.has(item.planId));
    return {
      completedPlans: outcomes.length,
      quantitySavedKg: outcomes.reduce((sum, item) => sum + item.quantitySavedKg, 0),
      quantityLostKg: outcomes.reduce((sum, item) => sum + item.quantityLostKg, 0),
      valuePreservedXof: outcomes.reduce((sum, item) => sum + item.valuePreservedXof, 0),
      communityContributionXof: outcomes.reduce((sum, item) => sum + item.communityContributionXof, 0),
      beneficiaryCount: outcomes.reduce((sum, item) => sum + item.beneficiaryCount, 0),
      averageAvoidedLossRate: outcomes.length === 0
        ? 0
        : outcomes.reduce((sum, item) => sum + item.avoidedLossRate, 0) / outcomes.length,
      routeBreakdown: outcomes.reduce<Record<string, number>>((acc, item) => {
        acc[item.route] = (acc[item.route] ?? 0) + item.quantitySavedKg;
        return acc;
      }, {}),
    };
  }

  snapshot() {
    return structuredClone(this.state);
  }

  private communityContribution(plan: RecoveryPlan, preservedValueXof: number) {
    if (!plan.communityInitiativeId) return 0;
    const initiative = this.requireInitiative(plan.communityInitiativeId);
    return Math.round((preservedValueXof * initiative.contributionRateBps) / 10_000);
  }

  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) {
    if (values.some((item) => item.id === id)) throw new Error(`Le ${label} ${id} existe déjà.`);
  }

  private requirePlan(planId: string) {
    const plan = this.state.plans.find((item) => item.id === planId);
    if (!plan) throw new Error("Le plan de valorisation est introuvable.");
    return plan;
  }

  private requireInitiative(initiativeId: string) {
    const initiative = this.state.initiatives.find((item) => item.id === initiativeId);
    if (!initiative) throw new Error("L'initiative communautaire est introuvable.");
    return initiative;
  }
}
