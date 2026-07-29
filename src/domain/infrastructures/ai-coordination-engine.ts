import type { EntityId, ISODateTime } from "./types";

export type CoordinationObjective =
  | "maximize_value"
  | "protect_resource"
  | "reduce_losses"
  | "stabilize_supply"
  | "improve_income"
  | "resolve_alert"
  | "restore_compliance"
  | "optimize_capacity";

export type RecommendationPriority = "low" | "medium" | "high" | "critical";
export type RecommendationStatus = "proposed" | "accepted" | "rejected" | "in_progress" | "completed" | "expired";
export type CoordinationScope = "actor" | "cooperative" | "territory" | "national" | "ecosystem";

export interface CoordinationSignal {
  id: EntityId;
  signalType:
    | "demand"
    | "price"
    | "resource_pressure"
    | "quality"
    | "logistics"
    | "finance"
    | "compliance"
    | "governance"
    | "operational"
    | "public_program";
  scope: CoordinationScope;
  scopeId: EntityId;
  sourceEngine: string;
  sourceReferenceId?: EntityId;
  value?: number;
  unit?: string;
  severity?: "info" | "warning" | "critical";
  confidenceScore: number;
  observedAt: ISODateTime;
  expiresAt?: ISODateTime;
  facts: string[];
  metadata: Record<string, unknown>;
}

export interface CoordinationContext {
  id: EntityId;
  scope: CoordinationScope;
  scopeId: EntityId;
  objectives: CoordinationObjective[];
  constraints: string[];
  policyRules: string[];
  stakeholderIds: EntityId[];
  createdAt: ISODateTime;
  validUntil?: ISODateTime;
}

export interface CoordinationRecommendation {
  id: EntityId;
  contextId: EntityId;
  scope: CoordinationScope;
  scopeId: EntityId;
  objective: CoordinationObjective;
  title: string;
  rationale: string[];
  proposedActions: CoordinationAction[];
  priority: RecommendationPriority;
  confidenceScore: number;
  expectedImpact: {
    revenueDeltaXof?: number;
    costDeltaXof?: number;
    wasteReductionKg?: number;
    resourcePressureDeltaPercent?: number;
    serviceLevelDeltaPercent?: number;
    complianceRiskDeltaPercent?: number;
  };
  tradeOffs: string[];
  evidenceSignalIds: EntityId[];
  status: RecommendationStatus;
  generatedAt: ISODateTime;
  validUntil?: ISODateTime;
  acceptedAt?: ISODateTime;
  rejectedAt?: ISODateTime;
  decisionReason?: string;
}

export interface CoordinationAction {
  id: EntityId;
  actionType:
    | "create_plan"
    | "reserve_capacity"
    | "redirect_supply"
    | "adjust_price"
    | "open_financing"
    | "trigger_inspection"
    | "notify_actor"
    | "open_alert"
    | "suspend_operation"
    | "launch_program"
    | "request_evidence"
    | "manual_review";
  targetEngine: string;
  targetReferenceId?: EntityId;
  assignedActorId?: EntityId;
  payload: Record<string, unknown>;
  requiresHumanApproval: boolean;
  status: "pending" | "approved" | "rejected" | "executed" | "failed" | "cancelled";
  approvedByActorId?: EntityId;
  approvedAt?: ISODateTime;
  executedAt?: ISODateTime;
  executionReferenceId?: EntityId;
  failureReason?: string;
}

export interface CoordinationPolicy {
  id: EntityId;
  code: string;
  name: string;
  objective: CoordinationObjective;
  signalTypes: CoordinationSignal["signalType"][];
  minimumConfidenceScore: number;
  conditions: Array<{
    field: "value" | "severity" | "confidenceScore";
    operator: "gt" | "gte" | "lt" | "lte" | "eq" | "in";
    expected: number | string | string[];
  }>;
  actionTemplates: Array<{
    actionType: CoordinationAction["actionType"];
    targetEngine: string;
    requiresHumanApproval: boolean;
    payloadTemplate: Record<string, unknown>;
  }>;
  priority: RecommendationPriority;
  status: "draft" | "active" | "inactive";
}

export interface CoordinationDecision {
  id: EntityId;
  recommendationId: EntityId;
  decidedByActorId: EntityId;
  decision: "accepted" | "rejected" | "partially_accepted";
  acceptedActionIds: EntityId[];
  rejectedActionIds: EntityId[];
  reason: string;
  decidedAt: ISODateTime;
}

export interface CoordinationOutcome {
  id: EntityId;
  recommendationId: EntityId;
  measuredAt: ISODateTime;
  realizedImpact: CoordinationRecommendation["expectedImpact"];
  successScore: number;
  lessons: string[];
  followUpActions: string[];
}

export interface ActorAssistantBrief {
  actorId: EntityId;
  scope: CoordinationScope;
  scopeId: EntityId;
  topPriorities: CoordinationRecommendation[];
  pendingApprovals: CoordinationAction[];
  criticalSignals: CoordinationSignal[];
  generatedAt: ISODateTime;
}

export class AICoordinationEngine {
  private readonly signals = new Map<EntityId, CoordinationSignal>();
  private readonly contexts = new Map<EntityId, CoordinationContext>();
  private readonly policies = new Map<EntityId, CoordinationPolicy>();
  private readonly recommendations = new Map<EntityId, CoordinationRecommendation>();
  private readonly decisions = new Map<EntityId, CoordinationDecision>();
  private readonly outcomes = new Map<EntityId, CoordinationOutcome>();

  registerSignal(input: CoordinationSignal) {
    if (input.confidenceScore < 0 || input.confidenceScore > 100) {
      throw new Error("Le score de confiance doit être compris entre 0 et 100.");
    }
    this.signals.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  createContext(input: CoordinationContext) {
    if (this.contexts.has(input.id)) throw new Error(`Le contexte ${input.id} existe déjà.`);
    if (!input.objectives.length) throw new Error("Un contexte doit contenir au moins un objectif.");
    this.contexts.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  registerPolicy(input: CoordinationPolicy) {
    if (this.policies.has(input.id)) throw new Error(`La politique ${input.id} existe déjà.`);
    if (input.minimumConfidenceScore < 0 || input.minimumConfidenceScore > 100) {
      throw new Error("Le seuil de confiance doit être compris entre 0 et 100.");
    }
    if (!input.signalTypes.length || !input.actionTemplates.length) {
      throw new Error("Une politique doit définir des signaux et des actions.");
    }
    this.policies.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  activatePolicy(policyId: EntityId) {
    const policy = this.requirePolicy(policyId);
    policy.status = "active";
    this.policies.set(policy.id, policy);
    return structuredClone(policy);
  }

  generateRecommendations(input: { contextId: EntityId; generatedAt: ISODateTime }): CoordinationRecommendation[] {
    const context = this.requireContext(input.contextId);
    const activeSignals = [...this.signals.values()].filter((signal) =>
      signal.scope === context.scope &&
      signal.scopeId === context.scopeId &&
      (!signal.expiresAt || signal.expiresAt >= input.generatedAt),
    );
    const activePolicies = [...this.policies.values()].filter((policy) => policy.status === "active");
    const generated: CoordinationRecommendation[] = [];

    for (const objective of context.objectives) {
      const matchingPolicies = activePolicies.filter((policy) => policy.objective === objective);
      for (const policy of matchingPolicies) {
        const evidence = activeSignals.filter((signal) =>
          policy.signalTypes.includes(signal.signalType) &&
          signal.confidenceScore >= policy.minimumConfidenceScore &&
          policy.conditions.every((condition) => this.matchesCondition(signal, condition)),
        );
        if (!evidence.length) continue;

        const recommendationId = `recommendation:${context.id}:${policy.id}:${input.generatedAt}`;
        if (this.recommendations.has(recommendationId)) {
          generated.push(structuredClone(this.recommendations.get(recommendationId)!));
          continue;
        }

        const actions = policy.actionTemplates.map((template, index): CoordinationAction => ({
          id: `${recommendationId}:action:${index + 1}`,
          actionType: template.actionType,
          targetEngine: template.targetEngine,
          payload: {
            ...structuredClone(template.payloadTemplate),
            contextId: context.id,
            scope: context.scope,
            scopeId: context.scopeId,
            evidenceSignalIds: evidence.map((signal) => signal.id),
          },
          requiresHumanApproval: template.requiresHumanApproval,
          status: "pending",
        }));

        const confidenceScore = Math.round(evidence.reduce((sum, signal) => sum + signal.confidenceScore, 0) / evidence.length);
        const recommendation: CoordinationRecommendation = {
          id: recommendationId,
          contextId: context.id,
          scope: context.scope,
          scopeId: context.scopeId,
          objective,
          title: policy.name,
          rationale: [...new Set(evidence.flatMap((signal) => signal.facts))],
          proposedActions: actions,
          priority: policy.priority,
          confidenceScore,
          expectedImpact: this.estimateImpact(objective, evidence),
          tradeOffs: this.identifyTradeOffs(objective, evidence),
          evidenceSignalIds: evidence.map((signal) => signal.id),
          status: "proposed",
          generatedAt: input.generatedAt,
          validUntil: context.validUntil,
        };
        this.recommendations.set(recommendation.id, recommendation);
        generated.push(structuredClone(recommendation));
      }
    }

    return generated.sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority) || b.confidenceScore - a.confidenceScore);
  }

  decideRecommendation(input: CoordinationDecision) {
    const recommendation = this.requireRecommendation(input.recommendationId);
    if (recommendation.status !== "proposed") throw new Error("La recommandation n'est plus en attente de décision.");
    const accepted = new Set(input.acceptedActionIds);
    const rejected = new Set(input.rejectedActionIds);
    recommendation.proposedActions = recommendation.proposedActions.map((action) => {
      if (accepted.has(action.id)) {
        return {
          ...action,
          status: action.requiresHumanApproval ? "approved" : "pending",
          approvedByActorId: action.requiresHumanApproval ? input.decidedByActorId : undefined,
          approvedAt: action.requiresHumanApproval ? input.decidedAt : undefined,
        };
      }
      if (rejected.has(action.id)) return { ...action, status: "rejected" };
      return action;
    });
    recommendation.status = input.decision === "rejected" ? "rejected" : "accepted";
    recommendation.decisionReason = input.reason;
    recommendation.acceptedAt = input.decision !== "rejected" ? input.decidedAt : undefined;
    recommendation.rejectedAt = input.decision === "rejected" ? input.decidedAt : undefined;
    this.recommendations.set(recommendation.id, recommendation);
    this.decisions.set(input.id, structuredClone(input));
    return structuredClone(recommendation);
  }

  approveAction(input: { recommendationId: EntityId; actionId: EntityId; approvedByActorId: EntityId; approvedAt: ISODateTime }) {
    const recommendation = this.requireRecommendation(input.recommendationId);
    const action = recommendation.proposedActions.find((item) => item.id === input.actionId);
    if (!action) throw new Error(`Action introuvable : ${input.actionId}.`);
    if (!action.requiresHumanApproval) return structuredClone(action);
    if (action.status !== "pending") throw new Error("Cette action ne peut plus être approuvée.");
    action.status = "approved";
    action.approvedByActorId = input.approvedByActorId;
    action.approvedAt = input.approvedAt;
    this.recommendations.set(recommendation.id, recommendation);
    return structuredClone(action);
  }

  markActionExecuted(input: { recommendationId: EntityId; actionId: EntityId; executedAt: ISODateTime; executionReferenceId?: EntityId }) {
    const recommendation = this.requireRecommendation(input.recommendationId);
    const action = recommendation.proposedActions.find((item) => item.id === input.actionId);
    if (!action) throw new Error(`Action introuvable : ${input.actionId}.`);
    if (action.requiresHumanApproval && action.status !== "approved") {
      throw new Error("L'action doit être approuvée avant exécution.");
    }
    if (!action.requiresHumanApproval && !["pending", "approved"].includes(action.status)) {
      throw new Error("L'action ne peut plus être exécutée.");
    }
    action.status = "executed";
    action.executedAt = input.executedAt;
    action.executionReferenceId = input.executionReferenceId;
    if (recommendation.proposedActions.every((item) => ["executed", "rejected", "cancelled"].includes(item.status))) {
      recommendation.status = "completed";
    } else if (recommendation.status === "accepted") {
      recommendation.status = "in_progress";
    }
    this.recommendations.set(recommendation.id, recommendation);
    return structuredClone(action);
  }

  recordActionFailure(input: { recommendationId: EntityId; actionId: EntityId; failureReason: string }) {
    const recommendation = this.requireRecommendation(input.recommendationId);
    const action = recommendation.proposedActions.find((item) => item.id === input.actionId);
    if (!action) throw new Error(`Action introuvable : ${input.actionId}.`);
    action.status = "failed";
    action.failureReason = input.failureReason;
    this.recommendations.set(recommendation.id, recommendation);
    return structuredClone(action);
  }

  recordOutcome(input: CoordinationOutcome) {
    const recommendation = this.requireRecommendation(input.recommendationId);
    if (input.successScore < 0 || input.successScore > 100) {
      throw new Error("Le score de succès doit être compris entre 0 et 100.");
    }
    this.outcomes.set(input.id, structuredClone(input));
    if (recommendation.status !== "rejected") recommendation.status = "completed";
    this.recommendations.set(recommendation.id, recommendation);
    return structuredClone(input);
  }

  getActorAssistantBrief(input: { actorId: EntityId; scope: CoordinationScope; scopeId: EntityId; generatedAt: ISODateTime }): ActorAssistantBrief {
    const recommendations = [...this.recommendations.values()].filter((item) =>
      item.scope === input.scope &&
      item.scopeId === input.scopeId &&
      ["proposed", "accepted", "in_progress"].includes(item.status) &&
      (!item.validUntil || item.validUntil >= input.generatedAt),
    );
    const pendingApprovals = recommendations.flatMap((item) => item.proposedActions).filter((action) =>
      action.requiresHumanApproval && action.status === "pending" && (!action.assignedActorId || action.assignedActorId === input.actorId),
    );
    const criticalSignals = [...this.signals.values()].filter((signal) =>
      signal.scope === input.scope &&
      signal.scopeId === input.scopeId &&
      signal.severity === "critical" &&
      (!signal.expiresAt || signal.expiresAt >= input.generatedAt),
    );
    return {
      actorId: input.actorId,
      scope: input.scope,
      scopeId: input.scopeId,
      topPriorities: recommendations
        .sort((a, b) => this.priorityWeight(b.priority) - this.priorityWeight(a.priority) || b.confidenceScore - a.confidenceScore)
        .slice(0, 5)
        .map((item) => structuredClone(item)),
      pendingApprovals: pendingApprovals.map((item) => structuredClone(item)),
      criticalSignals: criticalSignals.map((item) => structuredClone(item)),
      generatedAt: input.generatedAt,
    };
  }

  buildCoordinationCommandCenter(input: { generatedAt: ISODateTime }) {
    const activeRecommendations = [...this.recommendations.values()].filter((item) =>
      ["proposed", "accepted", "in_progress"].includes(item.status) &&
      (!item.validUntil || item.validUntil >= input.generatedAt),
    );
    const actions = activeRecommendations.flatMap((item) => item.proposedActions);
    const activeSignals = [...this.signals.values()].filter((signal) => !signal.expiresAt || signal.expiresAt >= input.generatedAt);
    return {
      activeRecommendationCount: activeRecommendations.length,
      criticalRecommendationCount: activeRecommendations.filter((item) => item.priority === "critical").length,
      pendingApprovalCount: actions.filter((item) => item.requiresHumanApproval && item.status === "pending").length,
      failedActionCount: actions.filter((item) => item.status === "failed").length,
      criticalSignalCount: activeSignals.filter((item) => item.severity === "critical").length,
      recommendationsByObjective: Object.fromEntries(
        [...new Set(activeRecommendations.map((item) => item.objective))].map((objective) => [
          objective,
          activeRecommendations.filter((item) => item.objective === objective).length,
        ]),
      ),
      recommendationsByScope: Object.fromEntries(
        [...new Set(activeRecommendations.map((item) => item.scope))].map((scope) => [
          scope,
          activeRecommendations.filter((item) => item.scope === scope).length,
        ]),
      ),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return {
      signals: [...this.signals.values()].map((item) => structuredClone(item)),
      contexts: [...this.contexts.values()].map((item) => structuredClone(item)),
      policies: [...this.policies.values()].map((item) => structuredClone(item)),
      recommendations: [...this.recommendations.values()].map((item) => structuredClone(item)),
      decisions: [...this.decisions.values()].map((item) => structuredClone(item)),
      outcomes: [...this.outcomes.values()].map((item) => structuredClone(item)),
    };
  }

  private matchesCondition(signal: CoordinationSignal, condition: CoordinationPolicy["conditions"][number]) {
    const actual = signal[condition.field];
    switch (condition.operator) {
      case "gt": return typeof actual === "number" && actual > Number(condition.expected);
      case "gte": return typeof actual === "number" && actual >= Number(condition.expected);
      case "lt": return typeof actual === "number" && actual < Number(condition.expected);
      case "lte": return typeof actual === "number" && actual <= Number(condition.expected);
      case "eq": return actual === condition.expected;
      case "in": return Array.isArray(condition.expected) && condition.expected.includes(String(actual));
      default: return false;
    }
  }

  private estimateImpact(objective: CoordinationObjective, signals: CoordinationSignal[]): CoordinationRecommendation["expectedImpact"] {
    const numericValues = signals.map((signal) => signal.value).filter((value): value is number => value !== undefined);
    const average = numericValues.length ? numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length : 0;
    switch (objective) {
      case "maximize_value":
        return { revenueDeltaXof: Math.round(Math.max(0, average) * 0.05), serviceLevelDeltaPercent: 5 };
      case "reduce_losses":
        return { wasteReductionKg: Math.round(Math.max(0, average) * 0.1), costDeltaXof: -Math.round(Math.max(0, average) * 0.03) };
      case "protect_resource":
        return { resourcePressureDeltaPercent: -10 };
      case "stabilize_supply":
        return { serviceLevelDeltaPercent: 8, wasteReductionKg: Math.round(Math.max(0, average) * 0.04) };
      case "improve_income":
        return { revenueDeltaXof: Math.round(Math.max(0, average) * 0.04) };
      case "restore_compliance":
        return { complianceRiskDeltaPercent: -25 };
      case "resolve_alert":
        return { complianceRiskDeltaPercent: -15, serviceLevelDeltaPercent: 3 };
      case "optimize_capacity":
        return { serviceLevelDeltaPercent: 10, costDeltaXof: -Math.round(Math.max(0, average) * 0.02) };
    }
  }

  private identifyTradeOffs(objective: CoordinationObjective, signals: CoordinationSignal[]) {
    const tradeOffs: string[] = [];
    if (objective === "maximize_value") tradeOffs.push("Une hausse de valeur à court terme peut accroître la pression sur la ressource.");
    if (objective === "protect_resource") tradeOffs.push("Les restrictions peuvent réduire les revenus à court terme.");
    if (objective === "stabilize_supply") tradeOffs.push("La sécurisation de capacité peut générer des coûts de réservation.");
    if (objective === "restore_compliance") tradeOffs.push("Les mesures correctives peuvent ralentir temporairement les opérations.");
    if (signals.some((signal) => signal.confidenceScore < 70)) tradeOffs.push("Certaines données ont une confiance limitée et nécessitent une validation humaine.");
    return tradeOffs;
  }

  private priorityWeight(priority: RecommendationPriority) {
    return priority === "critical" ? 4 : priority === "high" ? 3 : priority === "medium" ? 2 : 1;
  }

  private requirePolicy(id: EntityId) {
    const item = this.policies.get(id);
    if (!item) throw new Error(`Politique introuvable : ${id}.`);
    return item;
  }

  private requireContext(id: EntityId) {
    const item = this.contexts.get(id);
    if (!item) throw new Error(`Contexte introuvable : ${id}.`);
    return item;
  }

  private requireRecommendation(id: EntityId) {
    const item = this.recommendations.get(id);
    if (!item) throw new Error(`Recommandation introuvable : ${id}.`);
    return item;
  }
}
