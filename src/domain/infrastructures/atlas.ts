import type { EntityId, ISODateTime } from "./types";
import type { EcosystemDigitalTwinData, TwinSignal, TwinSnapshot } from "./ecosystem-digital-twin";
import type {
  CoordinationIntelligenceData,
  CoordinationRecommendation,
  CoordinationObjective,
} from "./coordination-intelligence-engine";
import type { CapabilityMarketplaceData } from "./capability-marketplace";
import type { PlatformOperatingSystemData } from "./platform-operating-system";
import type { RevenueOperatingSystemData } from "./revenue-operating-system";

export type AtlasClientSegment =
  | "government"
  | "development_partner"
  | "business"
  | "finance"
  | "executive";

export type AtlasDecisionDomain =
  | "territorial_priority"
  | "infrastructure_investment"
  | "program_performance"
  | "supply_security"
  | "financial_risk"
  | "ecosystem_coordination"
  | "operational_resilience";

export interface AtlasWorkspace {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  clientSegment: AtlasClientSegment;
  territoryIds: EntityId[];
  decisionDomains: AtlasDecisionDomain[];
  capabilityCodes: string[];
  status: "draft" | "active" | "suspended" | "archived";
  createdAt: ISODateTime;
}

export interface AtlasQuestion {
  id: EntityId;
  workspaceId: EntityId;
  askedByActorId: EntityId;
  askedAt: ISODateTime;
  question: string;
  decisionDomain: AtlasDecisionDomain;
  territoryIds: EntityId[];
  horizon: "now" | "7_days" | "30_days" | "90_days" | "1_year";
  objective?: CoordinationObjective;
}

export interface AtlasEvidence {
  id: EntityId;
  sourceType:
    | "twin_node"
    | "twin_flow"
    | "twin_signal"
    | "coordination_recommendation"
    | "capability_activation"
    | "subscription"
    | "usage"
    | "revenue"
    | "external_data";
  sourceEntityId: EntityId;
  title: string;
  summary: string;
  observedAt?: ISODateTime;
  reliabilityScore: number;
  freshnessScore: number;
}

export interface AtlasInsight {
  id: EntityId;
  workspaceId: EntityId;
  questionId?: EntityId;
  decisionDomain: AtlasDecisionDomain;
  title: string;
  statement: string;
  implication: string;
  evidenceIds: EntityId[];
  confidenceScore: number;
  urgency: "low" | "medium" | "high" | "critical";
  generatedAt: ISODateTime;
}

export interface AtlasScenarioAction {
  id: EntityId;
  actionType:
    | "allocate_capacity"
    | "activate_capability"
    | "fund_program"
    | "upgrade_infrastructure"
    | "change_policy"
    | "engage_partner"
    | "suspend_flow"
    | "increase_monitoring";
  targetEntityIds: EntityId[];
  description: string;
  estimatedCostXof?: number;
  expectedDelayDays?: number;
}

export interface AtlasScenario {
  id: EntityId;
  workspaceId: EntityId;
  name: string;
  decisionDomain: AtlasDecisionDomain;
  baselineSnapshotId?: EntityId;
  actions: AtlasScenarioAction[];
  assumptions: string[];
  status: "draft" | "evaluated" | "selected" | "rejected";
  createdAt: ISODateTime;
}

export interface AtlasScenarioEvaluation {
  scenarioId: EntityId;
  valueCreationScore: number;
  resilienceScore: number;
  coordinationScore: number;
  financialSustainabilityScore: number;
  implementationRiskScore: number;
  estimatedCostXof: number;
  expectedBenefits: string[];
  risks: string[];
  recommendation: "execute" | "pilot" | "revise" | "reject";
  evaluatedAt: ISODateTime;
}

export interface AtlasBriefing {
  id: EntityId;
  workspaceId: EntityId;
  generatedAt: ISODateTime;
  title: string;
  executiveSummary: string;
  prioritySignalIds: EntityId[];
  priorityInsightIds: EntityId[];
  selectedScenarioIds: EntityId[];
  recommendedDecisions: string[];
  nextReviewAt?: ISODateTime;
}

export interface AtlasData {
  workspaces: AtlasWorkspace[];
  questions: AtlasQuestion[];
  evidence: AtlasEvidence[];
  insights: AtlasInsight[];
  scenarios: AtlasScenario[];
  scenarioEvaluations: AtlasScenarioEvaluation[];
  briefings: AtlasBriefing[];
}

export interface AtlasSources {
  digitalTwin: EcosystemDigitalTwinData;
  coordination: CoordinationIntelligenceData;
  marketplace: CapabilityMarketplaceData;
  platform: PlatformOperatingSystemData;
  revenue: RevenueOperatingSystemData;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertUniqueId<T extends { id: string }>(items: T[], id: string, label: string) {
  if (items.some((item) => item.id === id)) {
    throw new Error(`${label} ${id} existe déjà.`);
  }
}

export class MbambulaanAtlas {
  private state: AtlasData = {
    workspaces: [],
    questions: [],
    evidence: [],
    insights: [],
    scenarios: [],
    scenarioEvaluations: [],
    briefings: [],
  };

  createWorkspace(workspace: AtlasWorkspace) {
    assertUniqueId(this.state.workspaces, workspace.id, "L'espace Atlas");
    if (workspace.capabilityCodes.length === 0) {
      throw new Error("Un espace Atlas doit activer au moins une capability.");
    }
    this.state.workspaces.push(clone(workspace));
    return clone(workspace);
  }

  ask(question: AtlasQuestion, sources: AtlasSources, generatedAt: ISODateTime) {
    assertUniqueId(this.state.questions, question.id, "La question Atlas");
    const workspace = this.state.workspaces.find((item) => item.id === question.workspaceId);
    if (!workspace || workspace.status !== "active") {
      throw new Error("La question doit être rattachée à un espace Atlas actif.");
    }

    this.state.questions.push(clone(question));

    const scopedSignals = sources.digitalTwin.signals.filter((signal) =>
      this.isSignalInScope(signal, question.territoryIds, sources.digitalTwin),
    );
    const scopedRecommendations = sources.coordination.recommendations.filter((recommendation) =>
      this.isRecommendationInScope(recommendation, question.territoryIds, sources),
    );
    const evidence = this.buildEvidence(scopedSignals, scopedRecommendations, generatedAt);
    this.state.evidence.push(...evidence.filter(
      (item) => !this.state.evidence.some((existing) => existing.id === item.id),
    ));

    const insights = this.generateInsights(question, scopedSignals, scopedRecommendations, evidence, generatedAt);
    this.state.insights.push(...insights);

    return {
      question: clone(question),
      evidence: clone(evidence),
      insights: clone(insights),
    };
  }

  createScenario(scenario: AtlasScenario) {
    assertUniqueId(this.state.scenarios, scenario.id, "Le scénario Atlas");
    if (scenario.actions.length === 0) {
      throw new Error("Un scénario Atlas doit contenir au moins une action.");
    }
    this.state.scenarios.push(clone(scenario));
    return clone(scenario);
  }

  evaluateScenario(scenarioId: EntityId, sources: AtlasSources, evaluatedAt: ISODateTime) {
    const scenario = this.state.scenarios.find((item) => item.id === scenarioId);
    if (!scenario) throw new Error(`Le scénario ${scenarioId} est introuvable.`);

    const estimatedCostXof = scenario.actions.reduce(
      (sum, action) => sum + (action.estimatedCostXof ?? 0),
      0,
    );
    const activeCapabilities = new Set(
      sources.marketplace.capabilities
        .filter((item) => item.status === "active")
        .map((item) => item.code),
    );
    const capabilityCoverage = scenario.actions.filter((action) =>
      action.actionType !== "activate_capability" ||
      action.targetEntityIds.some((id) => activeCapabilities.has(id)),
    ).length / scenario.actions.length;

    const openCriticalSignals = sources.digitalTwin.signals.filter(
      (item) => item.status === "open" && item.severity === "critical",
    ).length;
    const activeSubscriptions = sources.platform.subscriptions.filter(
      (item) => item.status === "active",
    ).length;
    const viableOffers = sources.revenue.offers.filter((item) => item.status === "active").length;

    const coordinationScore = Math.min(100, 55 + scenario.actions.length * 8);
    const resilienceScore = Math.min(100, 70 - openCriticalSignals * 5 + scenario.actions.length * 5);
    const financialSustainabilityScore = Math.min(
      100,
      35 + activeSubscriptions * 5 + viableOffers * 3 - Math.min(40, estimatedCostXof / 10_000_000),
    );
    const valueCreationScore = Math.round(
      (coordinationScore + Math.max(0, resilienceScore) + Math.max(0, financialSustainabilityScore)) / 3,
    );
    const implementationRiskScore = Math.max(
      5,
      Math.round(65 - capabilityCoverage * 40 + scenario.assumptions.length * 3),
    );

    const risks: string[] = [];
    if (capabilityCoverage < 1) risks.push("Certaines actions reposent sur des capabilities non activées.");
    if (estimatedCostXof > 0 && activeSubscriptions === 0) {
      risks.push("Le scénario génère un coût sans abonnement actif identifiable.");
    }
    if (implementationRiskScore > 60) risks.push("Le risque de mise en œuvre est élevé.");

    const recommendation: AtlasScenarioEvaluation["recommendation"] =
      valueCreationScore >= 70 && implementationRiskScore <= 45
        ? "execute"
        : valueCreationScore >= 55 && implementationRiskScore <= 65
          ? "pilot"
          : valueCreationScore >= 40
            ? "revise"
            : "reject";

    const evaluation: AtlasScenarioEvaluation = {
      scenarioId,
      valueCreationScore,
      resilienceScore: Math.max(0, resilienceScore),
      coordinationScore,
      financialSustainabilityScore: Math.max(0, financialSustainabilityScore),
      implementationRiskScore,
      estimatedCostXof,
      expectedBenefits: [
        "meilleure coordination inter-acteurs",
        "réduction des flux bloqués",
        "amélioration de la visibilité décisionnelle",
      ],
      risks,
      recommendation,
      evaluatedAt,
    };

    scenario.status = "evaluated";
    this.state.scenarioEvaluations.push(clone(evaluation));
    return clone(evaluation);
  }

  generateBriefing(input: {
    id: EntityId;
    workspaceId: EntityId;
    generatedAt: ISODateTime;
    title: string;
    sources: AtlasSources;
    nextReviewAt?: ISODateTime;
  }): AtlasBriefing {
    const workspace = this.state.workspaces.find((item) => item.id === input.workspaceId);
    if (!workspace || workspace.status !== "active") {
      throw new Error("Le briefing doit être rattaché à un espace Atlas actif.");
    }

    const prioritySignals = input.sources.digitalTwin.signals
      .filter((item) => item.status === "open")
      .sort((a, b) => this.severityWeight(b.severity) - this.severityWeight(a.severity))
      .slice(0, 10);
    const priorityInsights = this.state.insights
      .filter((item) => item.workspaceId === input.workspaceId)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, 10);
    const selectedScenarios = this.state.scenarios.filter(
      (item) => item.workspaceId === input.workspaceId && item.status === "selected",
    );

    const briefing: AtlasBriefing = {
      id: input.id,
      workspaceId: input.workspaceId,
      generatedAt: input.generatedAt,
      title: input.title,
      executiveSummary: this.buildExecutiveSummary(
        input.sources.digitalTwin.snapshots.at(-1),
        prioritySignals,
        priorityInsights,
      ),
      prioritySignalIds: prioritySignals.map((item) => item.id),
      priorityInsightIds: priorityInsights.map((item) => item.id),
      selectedScenarioIds: selectedScenarios.map((item) => item.id),
      recommendedDecisions: priorityInsights.map((item) => item.implication).slice(0, 5),
      nextReviewAt: input.nextReviewAt,
    };

    this.state.briefings.push(clone(briefing));
    return clone(briefing);
  }

  snapshot(): AtlasData {
    return clone(this.state);
  }

  private buildEvidence(
    signals: TwinSignal[],
    recommendations: CoordinationRecommendation[],
    observedAt: ISODateTime,
  ): AtlasEvidence[] {
    return [
      ...signals.map((signal) => ({
        id: `evidence-signal-${signal.id}`,
        sourceType: "twin_signal" as const,
        sourceEntityId: signal.id,
        title: signal.signalType,
        summary: signal.description,
        observedAt: signal.detectedAt,
        reliabilityScore: 85,
        freshnessScore: 90,
      })),
      ...recommendations.map((recommendation) => ({
        id: `evidence-recommendation-${recommendation.id}`,
        sourceType: "coordination_recommendation" as const,
        sourceEntityId: recommendation.id,
        title: "Recommandation de coordination",
        summary: `Le fournisseur ${recommendation.providerOrganizationId} obtient un score de ${recommendation.score}.`,
        observedAt,
        reliabilityScore: 75,
        freshnessScore: 85,
      })),
    ];
  }

  private generateInsights(
    question: AtlasQuestion,
    signals: TwinSignal[],
    recommendations: CoordinationRecommendation[],
    evidence: AtlasEvidence[],
    generatedAt: ISODateTime,
  ): AtlasInsight[] {
    const insights: AtlasInsight[] = [];
    const criticalSignals = signals.filter((item) => item.severity === "critical" && item.status === "open");

    if (criticalSignals.length > 0) {
      insights.push({
        id: `insight-critical-${question.id}`,
        workspaceId: question.workspaceId,
        questionId: question.id,
        decisionDomain: question.decisionDomain,
        title: "Intervention prioritaire requise",
        statement: `${criticalSignals.length} signalaux critiques sont ouverts dans le périmètre analysé.`,
        implication: "Déclencher une revue opérationnelle et affecter une capacité de résolution.",
        evidenceIds: criticalSignals.map((item) => `evidence-signal-${item.id}`),
        confidenceScore: 90,
        urgency: "critical",
        generatedAt,
      });
    }

    if (recommendations.length > 0) {
      const best = [...recommendations].sort((a, b) => b.score - a.score)[0];
      insights.push({
        id: `insight-coordination-${question.id}`,
        workspaceId: question.workspaceId,
        questionId: question.id,
        decisionDomain: "ecosystem_coordination",
        title: "Option de coordination disponible",
        statement: `La meilleure option identifiée est ${best.providerOrganizationId} avec un score de ${best.score}.`,
        implication: "Valider l'allocation ou documenter un éventuel override.",
        evidenceIds: [`evidence-recommendation-${best.id}`],
        confidenceScore: Math.min(95, Math.max(50, Math.round(best.score))),
        urgency: "high",
        generatedAt,
      });
    }

    if (evidence.length === 0) {
      insights.push({
        id: `insight-data-gap-${question.id}`,
        workspaceId: question.workspaceId,
        questionId: question.id,
        decisionDomain: question.decisionDomain,
        title: "Données insuffisantes",
        statement: "Le périmètre ne fournit pas encore assez de preuves opérationnelles pour conclure.",
        implication: "Renforcer les intégrations et la collecte avant toute décision structurante.",
        evidenceIds: [],
        confidenceScore: 95,
        urgency: "medium",
        generatedAt,
      });
    }

    return insights;
  }

  private isSignalInScope(
    signal: TwinSignal,
    territoryIds: EntityId[],
    twin: EcosystemDigitalTwinData,
  ): boolean {
    if (territoryIds.length === 0) return true;
    if (signal.nodeId) {
      return twin.nodes.some(
        (node) => node.id === signal.nodeId && node.territoryId && territoryIds.includes(node.territoryId),
      );
    }
    if (signal.flowId) {
      const flow = twin.flows.find((item) => item.id === signal.flowId);
      if (!flow) return false;
      return twin.nodes.some(
        (node) =>
          (node.id === flow.fromNodeId || node.id === flow.toNodeId) &&
          node.territoryId &&
          territoryIds.includes(node.territoryId),
      );
    }
    return true;
  }

  private isRecommendationInScope(
    recommendation: CoordinationRecommendation,
    territoryIds: EntityId[],
    sources: AtlasSources,
  ): boolean {
    if (territoryIds.length === 0) return true;
    const demand = sources.coordination.demands.find((item) => item.id === recommendation.demandId);
    return Boolean(demand && territoryIds.includes(demand.territoryId));
  }

  private severityWeight(severity: TwinSignal["severity"]): number {
    if (severity === "critical") return 3;
    if (severity === "warning") return 2;
    return 1;
  }

  private buildExecutiveSummary(
    latestSnapshot: TwinSnapshot | undefined,
    signals: TwinSignal[],
    insights: AtlasInsight[],
  ): string {
    const snapshotPart = latestSnapshot
      ? `${latestSnapshot.nodeCount} nœuds, ${latestSnapshot.flowCount} flux et ${latestSnapshot.blockedFlows} flux bloqués sont observés.`
      : "Aucun snapshot du jumeau numérique n'est encore disponible.";
    const signalPart = `${signals.length} signalaux ouverts nécessitent une attention.`;
    const insightPart = `${insights.length} enseignements décisionnels ont été générés.`;
    return `${snapshotPart} ${signalPart} ${insightPart}`;
  }
}
