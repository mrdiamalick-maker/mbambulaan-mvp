import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export type IntelligenceScope = "actor" | "organization" | "landing_site" | "territory" | "ecosystem" | "portfolio";
export type MetricAggregation = "count" | "sum" | "average" | "minimum" | "maximum" | "ratio" | "latest" | "custom";
export type SignalSeverity = "info" | "warning" | "high" | "critical";
export type RecommendationPriority = "low" | "medium" | "high" | "urgent";
export type RecommendationStatus = "proposed" | "accepted" | "in_progress" | "completed" | "dismissed" | "expired";
export type ScenarioStatus = "draft" | "running" | "completed" | "failed" | "archived";
export type BriefingAudience =
  | "fisher"
  | "cooperative"
  | "landing_site"
  | "buyer"
  | "processor"
  | "logistics"
  | "ministry"
  | "public_agency"
  | "development_partner"
  | "financial_institution"
  | "insurer";

export interface IntelligenceEvent {
  id: EntityId;
  type: string;
  occurredAt: ISODateTime;
  actorId?: EntityId;
  actorKind?: MvpActorKind;
  organizationId?: EntityId;
  territoryId?: EntityId;
  landingSiteId?: EntityId;
  ecosystemConfigurationCode?: string;
  correlationId?: string;
  payload: Record<string, unknown>;
}

export interface MetricDefinition {
  code: string;
  name: string;
  description: string;
  scope: IntelligenceScope;
  unit: string;
  aggregation: MetricAggregation;
  sourceEventTypes: string[];
  numeratorEventTypes?: string[];
  denominatorEventTypes?: string[];
  valuePath?: string;
  filters?: Record<string, unknown>;
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  higherIsBetter: boolean;
  actorVisibility: MvpActorKind[];
  ministryVisible: boolean;
  atlasPremium: boolean;
}

export interface MetricObservation {
  id: EntityId;
  metricCode: string;
  scope: IntelligenceScope;
  scopeId: EntityId;
  value: number;
  unit: string;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  computedAt: ISODateTime;
  sourceEventIds: EntityId[];
  qualityScore: number;
  metadata: Record<string, unknown>;
}

export interface SignalRule {
  code: string;
  name: string;
  description: string;
  metricCode?: string;
  eventType?: string;
  condition: "above" | "below" | "equals" | "missing" | "stale" | "trend_down" | "trend_up" | "custom";
  threshold?: number;
  lookbackPeriods?: number;
  severity: SignalSeverity;
  deduplicationWindowHours: number;
  audience: MvpActorKind[];
  recommendedActionCodes: string[];
  active: boolean;
}

export interface IntelligenceSignal {
  id: EntityId;
  ruleCode: string;
  severity: SignalSeverity;
  title: string;
  description: string;
  scope: IntelligenceScope;
  scopeId: EntityId;
  metricCode?: string;
  metricObservationId?: EntityId;
  triggeringEventId?: EntityId;
  status: "open" | "acknowledged" | "resolved" | "dismissed";
  detectedAt: ISODateTime;
  acknowledgedAt?: ISODateTime;
  resolvedAt?: ISODateTime;
  assignedActorId?: EntityId;
  metadata: Record<string, unknown>;
}

export interface RecommendationTemplate {
  code: string;
  name: string;
  description: string;
  appliesToSignalRules: string[];
  targetActorKinds: MvpActorKind[];
  capabilityCode: string;
  expectedOutcomeCodes: string[];
  defaultPriority: RecommendationPriority;
  expiresAfterHours?: number;
  decisionRequired: boolean;
}

export interface DecisionRecommendation {
  id: EntityId;
  templateCode: string;
  signalId: EntityId;
  title: string;
  rationale: string;
  scope: IntelligenceScope;
  scopeId: EntityId;
  targetActorId?: EntityId;
  targetActorKind: MvpActorKind;
  priority: RecommendationPriority;
  status: RecommendationStatus;
  proposedAt: ISODateTime;
  acceptedAt?: ISODateTime;
  completedAt?: ISODateTime;
  dismissedAt?: ISODateTime;
  expiresAt?: ISODateTime;
  expectedOutcomeCodes: string[];
  executionReferenceId?: EntityId;
  metadata: Record<string, unknown>;
}

export interface ScenarioVariable {
  code: string;
  label: string;
  value: number;
  unit: string;
  minimum?: number;
  maximum?: number;
}

export interface ScenarioDefinition {
  code: string;
  name: string;
  description: string;
  supportedScopes: IntelligenceScope[];
  inputVariables: string[];
  outputMetricCodes: string[];
  atlasPremiumOnly: boolean;
}

export interface ScenarioRun {
  id: EntityId;
  scenarioCode: string;
  scope: IntelligenceScope;
  scopeId: EntityId;
  status: ScenarioStatus;
  variables: ScenarioVariable[];
  baselineMetricObservationIds: EntityId[];
  projectedMetrics: Array<{
    metricCode: string;
    baselineValue?: number;
    projectedValue: number;
    unit: string;
    delta: number;
    confidenceScore: number;
  }>;
  assumptions: string[];
  risks: string[];
  createdByActorId: EntityId;
  createdByActorKind: MvpActorKind;
  createdAt: ISODateTime;
  completedAt?: ISODateTime;
}

export interface DecisionBriefing {
  id: EntityId;
  title: string;
  audience: BriefingAudience[];
  scope: IntelligenceScope;
  scopeId: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  generatedAt: ISODateTime;
  executiveSummary: string;
  keyMetricObservationIds: EntityId[];
  signalIds: EntityId[];
  recommendationIds: EntityId[];
  scenarioRunIds: EntityId[];
  decisionQuestions: string[];
  risks: string[];
  opportunities: string[];
  confidenceScore: number;
  atlasPremium: boolean;
}

const metricDefinitions: MetricDefinition[] = [
  {
    code: "expected_return_capture_rate",
    name: "Taux de capture des retours attendus",
    description: "Part des retours effectivement annoncés avant débarquement.",
    scope: "landing_site",
    unit: "%",
    aggregation: "ratio",
    sourceEventTypes: ["expected_return_announced", "landing_confirmed"],
    numeratorEventTypes: ["expected_return_announced"],
    denominatorEventTypes: ["landing_confirmed"],
    targetValue: 85,
    warningThreshold: 70,
    criticalThreshold: 50,
    higherIsBetter: true,
    actorVisibility: ["cooperative", "landing_site", "ministry", "public_agency"],
    ministryVisible: true,
    atlasPremium: false,
  },
  {
    code: "weighing_traceability_rate",
    name: "Taux de traçabilité des pesées",
    description: "Part des débarquements disposant d'une pesée vérifiée.",
    scope: "landing_site",
    unit: "%",
    aggregation: "ratio",
    sourceEventTypes: ["weighing_registered", "landing_confirmed"],
    numeratorEventTypes: ["weighing_registered"],
    denominatorEventTypes: ["landing_confirmed"],
    targetValue: 90,
    warningThreshold: 75,
    criticalThreshold: 60,
    higherIsBetter: true,
    actorVisibility: ["cooperative", "landing_site", "ministry", "public_agency", "financial_institution", "insurer"],
    ministryVisible: true,
    atlasPremium: false,
  },
  {
    code: "service_allocation_fill_rate",
    name: "Taux de couverture des besoins de service",
    description: "Part des besoins opérationnels disposant d'une allocation confirmée.",
    scope: "territory",
    unit: "%",
    aggregation: "ratio",
    sourceEventTypes: ["service_need_created", "service_allocation_reserved"],
    numeratorEventTypes: ["service_allocation_reserved"],
    denominatorEventTypes: ["service_need_created"],
    targetValue: 85,
    warningThreshold: 70,
    criticalThreshold: 50,
    higherIsBetter: true,
    actorVisibility: ["cooperative", "landing_site", "logistics", "ministry", "public_agency"],
    ministryVisible: true,
    atlasPremium: false,
  },
  {
    code: "service_execution_success_rate",
    name: "Taux de réussite des services",
    description: "Part des allocations ayant abouti à une exécution confirmée.",
    scope: "organization",
    unit: "%",
    aggregation: "ratio",
    sourceEventTypes: ["service_allocation_reserved", "service_execution_confirmed"],
    numeratorEventTypes: ["service_execution_confirmed"],
    denominatorEventTypes: ["service_allocation_reserved"],
    targetValue: 90,
    warningThreshold: 80,
    criticalThreshold: 65,
    higherIsBetter: true,
    actorVisibility: ["cooperative", "landing_site", "logistics", "buyer", "processor"],
    ministryVisible: false,
    atlasPremium: false,
  },
  {
    code: "lot_commitment_rate",
    name: "Taux d'engagement commercial des lots",
    description: "Part des lots publiés ayant reçu au moins un engagement commercial.",
    scope: "territory",
    unit: "%",
    aggregation: "ratio",
    sourceEventTypes: ["lot_created", "commitment_created"],
    numeratorEventTypes: ["commitment_created"],
    denominatorEventTypes: ["lot_created"],
    targetValue: 80,
    warningThreshold: 65,
    criticalThreshold: 45,
    higherIsBetter: true,
    actorVisibility: ["cooperative", "buyer", "processor", "ministry", "public_agency"],
    ministryVisible: true,
    atlasPremium: false,
  },
  {
    code: "coordination_incident_rate",
    name: "Taux d'incidents de coordination",
    description: "Nombre d'incidents rapporté au volume d'opérations coordonnées.",
    scope: "territory",
    unit: "%",
    aggregation: "ratio",
    sourceEventTypes: ["tension_reported", "landing_confirmed", "service_execution_confirmed", "commitment_created"],
    numeratorEventTypes: ["tension_reported"],
    denominatorEventTypes: ["landing_confirmed", "service_execution_confirmed", "commitment_created"],
    targetValue: 5,
    warningThreshold: 10,
    criticalThreshold: 20,
    higherIsBetter: false,
    actorVisibility: ["cooperative", "landing_site", "ministry", "public_agency"],
    ministryVisible: true,
    atlasPremium: true,
  },
  {
    code: "data_quality_score",
    name: "Score de qualité des données",
    description: "Score composite de complétude, fraîcheur, cohérence et vérification des données.",
    scope: "ecosystem",
    unit: "score",
    aggregation: "custom",
    sourceEventTypes: ["document_verified", "integration_message_processed", "metric_computed"],
    targetValue: 90,
    warningThreshold: 75,
    criticalThreshold: 60,
    higherIsBetter: true,
    actorVisibility: ["ministry", "public_agency", "development_partner"],
    ministryVisible: true,
    atlasPremium: true,
  },
  {
    code: "territorial_activation_readiness",
    name: "Préparation territoriale à l'activation",
    description: "Score de préparation du territoire à l'exploitation de Mbàmbulaan.",
    scope: "territory",
    unit: "score",
    aggregation: "latest",
    sourceEventTypes: ["territory_readiness_assessed"],
    valuePath: "score",
    targetValue: 80,
    warningThreshold: 70,
    criticalThreshold: 50,
    higherIsBetter: true,
    actorVisibility: ["ministry", "public_agency", "development_partner"],
    ministryVisible: true,
    atlasPremium: false,
  },
  {
    code: "revenue_collection_rate",
    name: "Taux d'encaissement",
    description: "Part du revenu facturé effectivement encaissé.",
    scope: "portfolio",
    unit: "%",
    aggregation: "ratio",
    sourceEventTypes: ["invoice_issued", "payment_confirmed"],
    numeratorEventTypes: ["payment_confirmed"],
    denominatorEventTypes: ["invoice_issued"],
    targetValue: 95,
    warningThreshold: 85,
    criticalThreshold: 70,
    higherIsBetter: true,
    actorVisibility: ["ministry", "development_partner"],
    ministryVisible: false,
    atlasPremium: true,
  },
];

const signalRules: SignalRule[] = [
  {
    code: "low_expected_return_capture",
    name: "Faible anticipation des retours",
    description: "Le site ne dispose pas d'assez d'annonces en amont pour coordonner les services.",
    metricCode: "expected_return_capture_rate",
    condition: "below",
    threshold: 70,
    severity: "high",
    deduplicationWindowHours: 24,
    audience: ["cooperative", "landing_site"],
    recommendedActionCodes: ["strengthen_return_announcement"],
    active: true,
  },
  {
    code: "low_weighing_traceability",
    name: "Traçabilité des pesées insuffisante",
    description: "Une part importante des débarquements n'est pas associée à une pesée vérifiée.",
    metricCode: "weighing_traceability_rate",
    condition: "below",
    threshold: 75,
    severity: "critical",
    deduplicationWindowHours: 24,
    audience: ["cooperative", "landing_site", "ministry", "public_agency"],
    recommendedActionCodes: ["launch_weighing_recovery_plan"],
    active: true,
  },
  {
    code: "service_capacity_tension",
    name: "Tension de capacité de service",
    description: "La capacité disponible ne couvre pas les besoins opérationnels du territoire.",
    metricCode: "service_allocation_fill_rate",
    condition: "below",
    threshold: 70,
    severity: "high",
    deduplicationWindowHours: 12,
    audience: ["cooperative", "landing_site", "logistics", "ministry"],
    recommendedActionCodes: ["activate_additional_capacity"],
    active: true,
  },
  {
    code: "commercial_absorption_risk",
    name: "Risque d'absorption commerciale",
    description: "Les lots publiés ne reçoivent pas suffisamment d'engagements acheteurs.",
    metricCode: "lot_commitment_rate",
    condition: "below",
    threshold: 65,
    severity: "high",
    deduplicationWindowHours: 24,
    audience: ["cooperative", "buyer", "processor", "ministry"],
    recommendedActionCodes: ["activate_buyer_network"],
    active: true,
  },
  {
    code: "coordination_incident_spike",
    name: "Hausse des incidents de coordination",
    description: "Le taux d'incidents dépasse le niveau acceptable.",
    metricCode: "coordination_incident_rate",
    condition: "above",
    threshold: 10,
    severity: "critical",
    deduplicationWindowHours: 24,
    audience: ["cooperative", "landing_site", "ministry", "public_agency"],
    recommendedActionCodes: ["launch_coordination_review"],
    active: true,
  },
  {
    code: "territory_not_ready",
    name: "Territoire non prêt à l'activation",
    description: "Le niveau de préparation ne permet pas un lancement fiable.",
    metricCode: "territorial_activation_readiness",
    condition: "below",
    threshold: 70,
    severity: "high",
    deduplicationWindowHours: 72,
    audience: ["ministry", "public_agency", "development_partner"],
    recommendedActionCodes: ["launch_readiness_recovery_plan"],
    active: true,
  },
];

const recommendationTemplates: RecommendationTemplate[] = [
  {
    code: "strengthen_return_announcement",
    name: "Renforcer les annonces de retour",
    description: "Mobiliser les relais de coopérative et simplifier la déclaration des retours attendus.",
    appliesToSignalRules: ["low_expected_return_capture"],
    targetActorKinds: ["cooperative", "landing_site"],
    capabilityCode: "expected_return",
    expectedOutcomeCodes: ["higher_return_visibility", "better_service_planning"],
    defaultPriority: "high",
    expiresAfterHours: 48,
    decisionRequired: false,
  },
  {
    code: "launch_weighing_recovery_plan",
    name: "Lancer un plan de rattrapage des pesées",
    description: "Identifier les débarquements non pesés, affecter les responsables et vérifier les preuves.",
    appliesToSignalRules: ["low_weighing_traceability"],
    targetActorKinds: ["landing_site", "cooperative", "public_agency"],
    capabilityCode: "weighing_operations",
    expectedOutcomeCodes: ["restored_traceability", "higher_data_trust"],
    defaultPriority: "urgent",
    expiresAfterHours: 24,
    decisionRequired: true,
  },
  {
    code: "activate_additional_capacity",
    name: "Activer une capacité complémentaire",
    description: "Rechercher, réserver et affecter une capacité de service supplémentaire.",
    appliesToSignalRules: ["service_capacity_tension"],
    targetActorKinds: ["cooperative", "landing_site", "logistics"],
    capabilityCode: "service_coordination",
    expectedOutcomeCodes: ["higher_fill_rate", "lower_operational_delay"],
    defaultPriority: "high",
    expiresAfterHours: 12,
    decisionRequired: false,
  },
  {
    code: "activate_buyer_network",
    name: "Activer le réseau d'acheteurs",
    description: "Cibler les acheteurs pertinents et publier une offre consolidée adaptée à la demande.",
    appliesToSignalRules: ["commercial_absorption_risk"],
    targetActorKinds: ["cooperative", "buyer", "processor"],
    capabilityCode: "commercial_commitments",
    expectedOutcomeCodes: ["higher_commitment_rate", "lower_unsold_volume"],
    defaultPriority: "high",
    expiresAfterHours: 24,
    decisionRequired: false,
  },
  {
    code: "launch_coordination_review",
    name: "Lancer une revue de coordination",
    description: "Analyser les causes, responsables, dépendances et actions correctives sur le territoire.",
    appliesToSignalRules: ["coordination_incident_spike"],
    targetActorKinds: ["cooperative", "landing_site", "ministry", "public_agency"],
    capabilityCode: "incident_management",
    expectedOutcomeCodes: ["lower_incident_rate", "faster_resolution"],
    defaultPriority: "urgent",
    expiresAfterHours: 24,
    decisionRequired: true,
  },
  {
    code: "launch_readiness_recovery_plan",
    name: "Lancer un plan de mise à niveau territoriale",
    description: "Traiter les dimensions de préparation et capacités manquantes avant activation.",
    appliesToSignalRules: ["territory_not_ready"],
    targetActorKinds: ["ministry", "public_agency", "development_partner"],
    capabilityCode: "territorial_supervision",
    expectedOutcomeCodes: ["higher_readiness", "safer_activation"],
    defaultPriority: "high",
    expiresAfterHours: 72,
    decisionRequired: true,
  },
];

const scenarioDefinitions: ScenarioDefinition[] = [
  {
    code: "increase_service_capacity",
    name: "Augmentation de capacité de service",
    description: "Simuler l'effet d'une augmentation de capacité sur les allocations, délais et incidents.",
    supportedScopes: ["landing_site", "territory"],
    inputVariables: ["capacity_increase_percent", "demand_growth_percent", "execution_success_rate"],
    outputMetricCodes: ["service_allocation_fill_rate", "service_execution_success_rate", "coordination_incident_rate"],
    atlasPremiumOnly: true,
  },
  {
    code: "improve_weighing_coverage",
    name: "Amélioration de la couverture des pesées",
    description: "Simuler l'effet d'un renforcement des équipements et équipes de pesée.",
    supportedScopes: ["landing_site", "territory"],
    inputVariables: ["additional_scale_count", "operator_availability_percent", "landing_growth_percent"],
    outputMetricCodes: ["weighing_traceability_rate", "data_quality_score"],
    atlasPremiumOnly: true,
  },
  {
    code: "buyer_network_expansion",
    name: "Extension du réseau d'acheteurs",
    description: "Simuler l'effet d'une augmentation de la demande qualifiée sur l'absorption des lots.",
    supportedScopes: ["territory", "ecosystem"],
    inputVariables: ["additional_active_buyers", "average_demand_increase_percent", "logistics_capacity_increase_percent"],
    outputMetricCodes: ["lot_commitment_rate", "coordination_incident_rate"],
    atlasPremiumOnly: true,
  },
  {
    code: "territorial_rollout",
    name: "Déploiement territorial",
    description: "Simuler l'effet d'une nouvelle vague de déploiement sur la préparation, la qualité et les opérations.",
    supportedScopes: ["territory", "ecosystem", "portfolio"],
    inputVariables: ["new_sites", "field_team_size", "training_coverage_percent", "integration_readiness_percent"],
    outputMetricCodes: ["territorial_activation_readiness", "data_quality_score", "coordination_incident_rate"],
    atlasPremiumOnly: true,
  },
];

export class DecisionIntelligenceEngine {
  private readonly events = new Map<EntityId, IntelligenceEvent>();
  private readonly observations = new Map<EntityId, MetricObservation>();
  private readonly signals = new Map<EntityId, IntelligenceSignal>();
  private readonly recommendations = new Map<EntityId, DecisionRecommendation>();
  private readonly scenarioRuns = new Map<EntityId, ScenarioRun>();
  private readonly briefings = new Map<EntityId, DecisionBriefing>();
  private readonly metrics = new Map<string, MetricDefinition>(metricDefinitions.map((item) => [item.code, item]));
  private readonly rules = new Map<string, SignalRule>(signalRules.map((item) => [item.code, item]));
  private readonly templates = new Map<string, RecommendationTemplate>(recommendationTemplates.map((item) => [item.code, item]));
  private readonly scenarios = new Map<string, ScenarioDefinition>(scenarioDefinitions.map((item) => [item.code, item]));

  ingestEvent(event: IntelligenceEvent) {
    if (this.events.has(event.id)) return structuredClone(this.events.get(event.id)!);
    this.events.set(event.id, structuredClone(event));
    return structuredClone(event);
  }

  computeMetric(input: {
    observationId: EntityId;
    metricCode: string;
    scopeId: EntityId;
    periodStart: ISODateTime;
    periodEnd: ISODateTime;
    computedAt: ISODateTime;
  }) {
    const definition = this.requireMetric(input.metricCode);
    const events = [...this.events.values()].filter((event) => {
      if (event.occurredAt < input.periodStart || event.occurredAt > input.periodEnd) return false;
      return this.matchesScope(event, definition.scope, input.scopeId) && definition.sourceEventTypes.includes(event.type);
    });

    const value = this.aggregate(definition, events);
    const qualityScore = this.computeQualityScore(definition, events, value);
    const observation: MetricObservation = {
      id: input.observationId,
      metricCode: definition.code,
      scope: definition.scope,
      scopeId: input.scopeId,
      value,
      unit: definition.unit,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      computedAt: input.computedAt,
      sourceEventIds: events.map((event) => event.id),
      qualityScore,
      metadata: {},
    };
    this.observations.set(observation.id, observation);
    return structuredClone(observation);
  }

  evaluateObservation(input: { observationId: EntityId; detectedAt: ISODateTime }) {
    const observation = this.requireObservation(input.observationId);
    const applicableRules = [...this.rules.values()].filter(
      (rule) => rule.active && rule.metricCode === observation.metricCode,
    );
    const generatedSignals: IntelligenceSignal[] = [];

    for (const rule of applicableRules) {
      if (!this.ruleMatches(rule, observation)) continue;
      const duplicate = [...this.signals.values()].find(
        (signal) =>
          signal.ruleCode === rule.code &&
          signal.scopeId === observation.scopeId &&
          signal.status === "open" &&
          this.hoursBetween(signal.detectedAt, input.detectedAt) <= rule.deduplicationWindowHours,
      );
      if (duplicate) continue;

      const signal: IntelligenceSignal = {
        id: `signal:${rule.code}:${observation.id}`,
        ruleCode: rule.code,
        severity: rule.severity,
        title: rule.name,
        description: `${rule.description} Valeur observée : ${observation.value} ${observation.unit}.`,
        scope: observation.scope,
        scopeId: observation.scopeId,
        metricCode: observation.metricCode,
        metricObservationId: observation.id,
        status: "open",
        detectedAt: input.detectedAt,
        metadata: { threshold: rule.threshold },
      };
      this.signals.set(signal.id, signal);
      generatedSignals.push(structuredClone(signal));
      this.generateRecommendations(signal, rule, input.detectedAt);
    }

    return generatedSignals;
  }

  acknowledgeSignal(input: { signalId: EntityId; actorId: EntityId; acknowledgedAt: ISODateTime }) {
    const signal = this.requireSignal(input.signalId);
    signal.status = "acknowledged";
    signal.assignedActorId = input.actorId;
    signal.acknowledgedAt = input.acknowledgedAt;
    this.signals.set(signal.id, signal);
    return structuredClone(signal);
  }

  resolveSignal(input: { signalId: EntityId; resolvedAt: ISODateTime }) {
    const signal = this.requireSignal(input.signalId);
    signal.status = "resolved";
    signal.resolvedAt = input.resolvedAt;
    this.signals.set(signal.id, signal);
    return structuredClone(signal);
  }

  updateRecommendationStatus(input: {
    recommendationId: EntityId;
    status: RecommendationStatus;
    at: ISODateTime;
    executionReferenceId?: EntityId;
  }) {
    const recommendation = this.requireRecommendation(input.recommendationId);
    recommendation.status = input.status;
    if (input.status === "accepted" || input.status === "in_progress") recommendation.acceptedAt = input.at;
    if (input.status === "completed") recommendation.completedAt = input.at;
    if (input.status === "dismissed") recommendation.dismissedAt = input.at;
    recommendation.executionReferenceId = input.executionReferenceId;
    this.recommendations.set(recommendation.id, recommendation);
    return structuredClone(recommendation);
  }

  runScenario(input: {
    id: EntityId;
    scenarioCode: string;
    scope: IntelligenceScope;
    scopeId: EntityId;
    variables: ScenarioVariable[];
    baselineMetricObservationIds: EntityId[];
    assumptions: string[];
    risks: string[];
    createdByActorId: EntityId;
    createdByActorKind: MvpActorKind;
    createdAt: ISODateTime;
  }) {
    if (this.scenarioRuns.has(input.id)) throw new Error(`Le scénario ${input.id} existe déjà.`);
    const definition = this.requireScenario(input.scenarioCode);
    if (!definition.supportedScopes.includes(input.scope)) {
      throw new Error(`Le scénario ${definition.code} ne supporte pas le périmètre ${input.scope}.`);
    }
    const provided = new Set(input.variables.map((variable) => variable.code));
    const missing = definition.inputVariables.filter((code) => !provided.has(code));
    if (missing.length > 0) throw new Error(`Variables manquantes : ${missing.join(", ")}.`);

    const baselines = input.baselineMetricObservationIds.map((id) => this.requireObservation(id));
    const influence = input.variables.reduce((sum, variable) => sum + variable.value, 0) / Math.max(1, input.variables.length);
    const projectedMetrics = definition.outputMetricCodes.map((metricCode) => {
      const baseline = baselines.find((item) => item.metricCode === metricCode);
      const metric = this.requireMetric(metricCode);
      const baselineValue = baseline?.value ?? metric.targetValue ?? 0;
      const direction = metric.higherIsBetter ? 1 : -1;
      const projectedValue = Math.max(0, baselineValue + direction * influence * 0.1);
      return {
        metricCode,
        baselineValue,
        projectedValue: Math.round(projectedValue * 100) / 100,
        unit: metric.unit,
        delta: Math.round((projectedValue - baselineValue) * 100) / 100,
        confidenceScore: this.computeScenarioConfidence(baselines.length, input.assumptions.length, input.risks.length),
      };
    });

    const run: ScenarioRun = {
      ...structuredClone(input),
      status: "completed",
      projectedMetrics,
      completedAt: input.createdAt,
    };
    this.scenarioRuns.set(run.id, run);
    return structuredClone(run);
  }

  generateBriefing(input: {
    id: EntityId;
    title: string;
    audience: BriefingAudience[];
    scope: IntelligenceScope;
    scopeId: EntityId;
    periodStart: ISODateTime;
    periodEnd: ISODateTime;
    generatedAt: ISODateTime;
    atlasPremium: boolean;
  }) {
    const observations = [...this.observations.values()].filter(
      (item) => item.scope === input.scope && item.scopeId === input.scopeId && item.periodEnd >= input.periodStart && item.periodStart <= input.periodEnd,
    );
    const signals = [...this.signals.values()].filter(
      (item) => item.scope === input.scope && item.scopeId === input.scopeId && item.detectedAt >= input.periodStart && item.detectedAt <= input.periodEnd,
    );
    const recommendations = [...this.recommendations.values()].filter((item) =>
      signals.some((signal) => signal.id === item.signalId),
    );
    const scenarioRuns = [...this.scenarioRuns.values()].filter(
      (item) => item.scope === input.scope && item.scopeId === input.scopeId && item.createdAt >= input.periodStart && item.createdAt <= input.periodEnd,
    );

    const criticalSignals = signals.filter((item) => item.severity === "critical").length;
    const highSignals = signals.filter((item) => item.severity === "high").length;
    const weakMetrics = observations.filter((item) => {
      const definition = this.requireMetric(item.metricCode);
      if (definition.warningThreshold === undefined) return false;
      return definition.higherIsBetter ? item.value < definition.warningThreshold : item.value > definition.warningThreshold;
    });

    const briefing: DecisionBriefing = {
      id: input.id,
      title: input.title,
      audience: input.audience,
      scope: input.scope,
      scopeId: input.scopeId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      generatedAt: input.generatedAt,
      executiveSummary: this.buildExecutiveSummary(observations.length, weakMetrics.length, criticalSignals, highSignals),
      keyMetricObservationIds: observations
        .sort((a, b) => a.qualityScore - b.qualityScore)
        .slice(0, 10)
        .map((item) => item.id),
      signalIds: signals.map((item) => item.id),
      recommendationIds: recommendations.map((item) => item.id),
      scenarioRunIds: scenarioRuns.map((item) => item.id),
      decisionQuestions: this.buildDecisionQuestions(signals, recommendations),
      risks: signals.filter((item) => item.severity === "critical" || item.severity === "high").map((item) => item.title),
      opportunities: observations
        .filter((item) => {
          const definition = this.requireMetric(item.metricCode);
          return definition.targetValue !== undefined && (definition.higherIsBetter ? item.value >= definition.targetValue : item.value <= definition.targetValue);
        })
        .map((item) => this.requireMetric(item.metricCode).name),
      confidenceScore: observations.length
        ? Math.round(observations.reduce((sum, item) => sum + item.qualityScore, 0) / observations.length)
        : 0,
      atlasPremium: input.atlasPremium,
    };
    this.briefings.set(briefing.id, briefing);
    return structuredClone(briefing);
  }

  getDecisionWorkspace(input: { actorKind: MvpActorKind; scope: IntelligenceScope; scopeId: EntityId }) {
    const visibleMetrics = [...this.metrics.values()].filter((metric) => metric.actorVisibility.includes(input.actorKind));
    const observations = [...this.observations.values()].filter(
      (item) => item.scope === input.scope && item.scopeId === input.scopeId && visibleMetrics.some((metric) => metric.code === item.metricCode),
    );
    const signals = [...this.signals.values()].filter(
      (item) => item.scope === input.scope && item.scopeId === input.scopeId && item.status !== "resolved" && item.status !== "dismissed",
    );
    const recommendations = [...this.recommendations.values()].filter(
      (item) => item.scope === input.scope && item.scopeId === input.scopeId && item.targetActorKind === input.actorKind,
    );
    return {
      actorKind: input.actorKind,
      scope: input.scope,
      scopeId: input.scopeId,
      metrics: observations.map((item) => ({ observation: structuredClone(item), definition: structuredClone(this.requireMetric(item.metricCode)) })),
      signals: signals.map((item) => structuredClone(item)),
      recommendations: recommendations.map((item) => structuredClone(item)),
      urgentActionCount: recommendations.filter((item) => item.priority === "urgent" && ["proposed", "accepted", "in_progress"].includes(item.status)).length,
    };
  }

  snapshot() {
    return {
      metricDefinitions: [...this.metrics.values()].map((item) => structuredClone(item)),
      signalRules: [...this.rules.values()].map((item) => structuredClone(item)),
      recommendationTemplates: [...this.templates.values()].map((item) => structuredClone(item)),
      scenarioDefinitions: [...this.scenarios.values()].map((item) => structuredClone(item)),
      events: [...this.events.values()].map((item) => structuredClone(item)),
      observations: [...this.observations.values()].map((item) => structuredClone(item)),
      signals: [...this.signals.values()].map((item) => structuredClone(item)),
      recommendations: [...this.recommendations.values()].map((item) => structuredClone(item)),
      scenarioRuns: [...this.scenarioRuns.values()].map((item) => structuredClone(item)),
      briefings: [...this.briefings.values()].map((item) => structuredClone(item)),
    };
  }

  private generateRecommendations(signal: IntelligenceSignal, rule: SignalRule, proposedAt: ISODateTime) {
    for (const templateCode of rule.recommendedActionCodes) {
      const template = this.requireTemplate(templateCode);
      for (const targetActorKind of template.targetActorKinds) {
        const recommendation: DecisionRecommendation = {
          id: `recommendation:${template.code}:${signal.id}:${targetActorKind}`,
          templateCode: template.code,
          signalId: signal.id,
          title: template.name,
          rationale: `${template.description} Signal déclencheur : ${signal.title}.`,
          scope: signal.scope,
          scopeId: signal.scopeId,
          targetActorKind,
          priority: template.defaultPriority,
          status: "proposed",
          proposedAt,
          expiresAt: template.expiresAfterHours ? this.addHours(proposedAt, template.expiresAfterHours) : undefined,
          expectedOutcomeCodes: [...template.expectedOutcomeCodes],
          metadata: { capabilityCode: template.capabilityCode, decisionRequired: template.decisionRequired },
        };
        this.recommendations.set(recommendation.id, recommendation);
      }
    }
  }

  private aggregate(definition: MetricDefinition, events: IntelligenceEvent[]) {
    if (definition.aggregation === "count") return events.length;
    if (definition.aggregation === "sum" || definition.aggregation === "average" || definition.aggregation === "minimum" || definition.aggregation === "maximum") {
      const values = events
        .map((event) => this.readPath(event.payload, definition.valuePath ?? "value"))
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));
      if (values.length === 0) return 0;
      if (definition.aggregation === "sum") return values.reduce((sum, value) => sum + value, 0);
      if (definition.aggregation === "average") return values.reduce((sum, value) => sum + value, 0) / values.length;
      if (definition.aggregation === "minimum") return Math.min(...values);
      return Math.max(...values);
    }
    if (definition.aggregation === "ratio") {
      const numerator = events.filter((event) => definition.numeratorEventTypes?.includes(event.type)).length;
      const denominator = events.filter((event) => definition.denominatorEventTypes?.includes(event.type)).length;
      return denominator === 0 ? 0 : Math.round((numerator / denominator) * 10000) / 100;
    }
    if (definition.aggregation === "latest") {
      const latest = [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
      return latest ? Number(this.readPath(latest.payload, definition.valuePath ?? "value") ?? 0) : 0;
    }
    return 0;
  }

  private computeQualityScore(definition: MetricDefinition, events: IntelligenceEvent[], value: number) {
    if (events.length === 0) return 0;
    const eventCoverage = Math.min(100, events.length * 10);
    const numericValidity = Number.isFinite(value) ? 100 : 0;
    const sourceDiversity = Math.min(100, new Set(events.map((event) => event.type)).size * 25);
    const expectedSourceDiversity = Math.max(1, definition.sourceEventTypes.length);
    return Math.round((eventCoverage * 0.4 + numericValidity * 0.4 + Math.min(100, (sourceDiversity / expectedSourceDiversity) * 100) * 0.2));
  }

  private ruleMatches(rule: SignalRule, observation: MetricObservation) {
    if (rule.threshold === undefined) return false;
    if (rule.condition === "below") return observation.value < rule.threshold;
    if (rule.condition === "above") return observation.value > rule.threshold;
    if (rule.condition === "equals") return observation.value === rule.threshold;
    return false;
  }

  private matchesScope(event: IntelligenceEvent, scope: IntelligenceScope, scopeId: EntityId) {
    if (scope === "actor") return event.actorId === scopeId;
    if (scope === "organization") return event.organizationId === scopeId;
    if (scope === "landing_site") return event.landingSiteId === scopeId;
    if (scope === "territory") return event.territoryId === scopeId;
    if (scope === "ecosystem") return event.ecosystemConfigurationCode === scopeId;
    return true;
  }

  private computeScenarioConfidence(baselineCount: number, assumptionCount: number, riskCount: number) {
    const dataScore = Math.min(100, baselineCount * 20);
    const assumptionPenalty = Math.min(30, assumptionCount * 5);
    const riskPenalty = Math.min(30, riskCount * 5);
    return Math.max(10, Math.round(dataScore - assumptionPenalty - riskPenalty + 30));
  }

  private buildExecutiveSummary(metricCount: number, weakMetricCount: number, criticalSignalCount: number, highSignalCount: number) {
    if (criticalSignalCount > 0) {
      return `${criticalSignalCount} signal(s) critique(s) nécessitent une décision rapide. ${weakMetricCount} indicateur(s) sont sous tension sur ${metricCount} observés.`;
    }
    if (highSignalCount > 0) {
      return `${highSignalCount} signal(s) important(s) sont ouverts. ${weakMetricCount} indicateur(s) nécessitent une action corrective.`;
    }
    return `La situation est globalement maîtrisée. ${metricCount} indicateur(s) ont été analysés et ${weakMetricCount} restent à surveiller.`;
  }

  private buildDecisionQuestions(signals: IntelligenceSignal[], recommendations: DecisionRecommendation[]) {
    const questions: string[] = [];
    if (signals.some((item) => item.severity === "critical")) questions.push("Quelles actions doivent être déclenchées immédiatement ?");
    if (recommendations.some((item) => item.metadata.decisionRequired === true)) questions.push("Quelles recommandations nécessitent une validation formelle ?");
    if (recommendations.some((item) => item.priority === "urgent")) questions.push("Qui porte l'exécution des actions urgentes et dans quel délai ?");
    if (questions.length === 0) questions.push("Quelles améliorations peuvent être engagées pour consolider les résultats ?");
    return questions;
  }

  private hoursBetween(start: ISODateTime, end: ISODateTime) {
    return Math.abs(new Date(end).getTime() - new Date(start).getTime()) / 3600000;
  }

  private addHours(date: ISODateTime, hours: number) {
    return new Date(new Date(date).getTime() + hours * 3600000).toISOString();
  }

  private readPath(source: Record<string, unknown>, path: string) {
    return path.split(".").reduce<unknown>((current, key) => {
      if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, source);
  }

  private requireMetric(code: string) {
    const metric = this.metrics.get(code);
    if (!metric) throw new Error(`Indicateur introuvable : ${code}.`);
    return metric;
  }

  private requireObservation(id: EntityId) {
    const observation = this.observations.get(id);
    if (!observation) throw new Error(`Observation introuvable : ${id}.`);
    return observation;
  }

  private requireSignal(id: EntityId) {
    const signal = this.signals.get(id);
    if (!signal) throw new Error(`Signal introuvable : ${id}.`);
    return signal;
  }

  private requireRecommendation(id: EntityId) {
    const recommendation = this.recommendations.get(id);
    if (!recommendation) throw new Error(`Recommandation introuvable : ${id}.`);
    return recommendation;
  }

  private requireTemplate(code: string) {
    const template = this.templates.get(code);
    if (!template) throw new Error(`Modèle de recommandation introuvable : ${code}.`);
    return template;
  }

  private requireScenario(code: string) {
    const scenario = this.scenarios.get(code);
    if (!scenario) throw new Error(`Scénario introuvable : ${code}.`);
    return scenario;
  }
}

export function getDecisionIntelligenceCatalog() {
  return {
    metricDefinitions: structuredClone(metricDefinitions),
    signalRules: structuredClone(signalRules),
    recommendationTemplates: structuredClone(recommendationTemplates),
    scenarioDefinitions: structuredClone(scenarioDefinitions),
  };
}

export function validateDecisionIntelligenceCatalog() {
  const errors: string[] = [];
  const metricCodes = new Set(metricDefinitions.map((item) => item.code));
  const signalCodes = new Set(signalRules.map((item) => item.code));
  const recommendationCodes = new Set(recommendationTemplates.map((item) => item.code));

  if (metricCodes.size !== metricDefinitions.length) errors.push("Des codes d'indicateurs sont dupliqués.");
  if (signalCodes.size !== signalRules.length) errors.push("Des codes de signaux sont dupliqués.");
  if (recommendationCodes.size !== recommendationTemplates.length) errors.push("Des codes de recommandations sont dupliqués.");

  for (const rule of signalRules) {
    if (rule.metricCode && !metricCodes.has(rule.metricCode)) errors.push(`${rule.code}: indicateur inconnu ${rule.metricCode}.`);
    for (const code of rule.recommendedActionCodes) {
      if (!recommendationCodes.has(code)) errors.push(`${rule.code}: recommandation inconnue ${code}.`);
    }
  }

  for (const template of recommendationTemplates) {
    for (const ruleCode of template.appliesToSignalRules) {
      if (!signalCodes.has(ruleCode)) errors.push(`${template.code}: règle de signal inconnue ${ruleCode}.`);
    }
  }

  for (const scenario of scenarioDefinitions) {
    for (const metricCode of scenario.outputMetricCodes) {
      if (!metricCodes.has(metricCode)) errors.push(`${scenario.code}: indicateur de sortie inconnu ${metricCode}.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      metricCount: metricDefinitions.length,
      signalRuleCount: signalRules.length,
      recommendationTemplateCount: recommendationTemplates.length,
      scenarioDefinitionCount: scenarioDefinitions.length,
      ministryVisibleMetricCount: metricDefinitions.filter((item) => item.ministryVisible).length,
      atlasPremiumMetricCount: metricDefinitions.filter((item) => item.atlasPremium).length,
    },
  };
}
