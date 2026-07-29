import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

export interface DemoActorProfile {
  id: string;
  name: string;
  productCode: "fisher" | "cooperative" | "business" | "government" | "finance" | "knowledge" | "atlas";
  role: string;
  territoryId: string;
  organizationId: string;
}

export interface DemoScenarioResult {
  scenarioId: string;
  name: string;
  startedAt: string;
  completedAt: string;
  actors: DemoActorProfile[];
  steps: Array<{
    code: string;
    productCode: DemoActorProfile["productCode"];
    label: string;
    status: "completed" | "failed";
    evidence: string;
  }>;
  outcome: {
    openSignals: number;
    atlasQuestions: number;
    atlasInsights: number;
    atlasScenarios: number;
    atlasBriefings: number;
    graphNodes: number;
    processedEvents: number;
  };
}

export const demoActors: DemoActorProfile[] = [
  {
    id: "actor-cooperative-demo",
    name: "Responsable Coopérative Dakar",
    productCode: "cooperative",
    role: "cooperative_manager",
    territoryId: "territory-dakar",
    organizationId: "cooperative-dakar-demo",
  },
  {
    id: "actor-cold-chain-demo",
    name: "Opérateur Chambre Froide",
    productCode: "business",
    role: "cold_chain_operator",
    territoryId: "territory-dakar",
    organizationId: "cold-chain-provider-demo",
  },
  {
    id: "actor-government-demo",
    name: "Coordinateur Territorial",
    productCode: "government",
    role: "territorial_coordinator",
    territoryId: "territory-dakar",
    organizationId: "ministry-demo",
  },
  {
    id: "actor-atlas-demo",
    name: "Décideur Atlas",
    productCode: "atlas",
    role: "decision_maker",
    territoryId: "territory-dakar",
    organizationId: "ministry-demo",
  },
];

export async function runColdChainCoordinationScenario(now = new Date()): Promise<DemoScenarioResult> {
  const runtime = getIntegratedPlatformRuntime();
  const suffix = now.getTime().toString();
  const scenarioId = `demo-cold-chain-${suffix}`;
  const startedAt = now.toISOString();
  const steps: DemoScenarioResult["steps"] = [];

  runtime.publish({
    id: `event-${scenarioId}-blocked-flow`,
    type: "operational.flow.blocked",
    occurredAt: startedAt,
    correlationId: scenarioId,
    tenantId: "tenant-national",
    territoryId: "territory-dakar",
    payload: {
      flowId: `flow-${scenarioId}`,
      flowKind: "service",
      fromEntityId: "cooperative-dakar-demo",
      fromLabel: "Coopérative Dakar",
      toEntityId: "cold-room-dakar-demo",
      toLabel: "Chambre froide Dakar",
      quantity: 2_400,
      unit: "kg",
    },
  });
  await runtime.drain(new Date(now.getTime() + 1_000).toISOString());
  steps.push({
    code: "cooperative-need",
    productCode: "cooperative",
    label: "La coopérative signale un flux froid bloqué de 2 400 kg.",
    status: "completed",
    evidence: `flow-${scenarioId}`,
  });

  runtime.publish({
    id: `event-${scenarioId}-atlas-question`,
    type: "atlas.question.requested",
    occurredAt: new Date(now.getTime() + 2_000).toISOString(),
    correlationId: scenarioId,
    causationId: `event-${scenarioId}-blocked-flow`,
    tenantId: "tenant-national",
    territoryId: "territory-dakar",
    payload: {
      questionId: `question-${scenarioId}`,
      workspaceId: "atlas-national-operations",
      askedByActorId: "actor-atlas-demo",
      question: "Comment résorber le risque de chaîne du froid à Dakar dans les 90 prochains jours ?",
      decisionDomain: "operational_resilience",
      horizon: "90_days",
    },
  });
  await runtime.drain(new Date(now.getTime() + 3_000).toISOString());
  steps.push({
    code: "government-analysis",
    productCode: "government",
    label: "Le coordinateur territorial demande une analyse décisionnelle.",
    status: "completed",
    evidence: `question-${scenarioId}`,
  });

  const atlasScenarioId = `atlas-scenario-${scenarioId}`;
  runtime.atlas.createScenario({
    id: atlasScenarioId,
    workspaceId: "atlas-national-operations",
    name: "Réallocation temporaire de capacité froide",
    decisionDomain: "operational_resilience",
    actions: [
      {
        id: `action-${scenarioId}-capacity`,
        actionType: "allocate_capacity",
        targetEntityIds: ["cold-room-dakar-demo", "cooperative-dakar-demo"],
        description: "Réserver une capacité froide temporaire pour les volumes bloqués.",
        estimatedCostXof: 1_500_000,
        expectedDelayDays: 2,
      },
      {
        id: `action-${scenarioId}-monitoring`,
        actionType: "increase_monitoring",
        targetEntityIds: ["territory-dakar"],
        description: "Renforcer le suivi quotidien des flux froids.",
        estimatedCostXof: 250_000,
        expectedDelayDays: 1,
      },
    ],
    assumptions: ["Une capacité partenaire est mobilisable sous 48 heures."],
    status: "draft",
    createdAt: new Date(now.getTime() + 4_000).toISOString(),
  });
  const evaluation = runtime.atlas.evaluateScenario(
    atlasScenarioId,
    {
      digitalTwin: runtime.digitalTwin.snapshot(),
      coordination: runtime.coordination.snapshot(),
      marketplace: runtime.marketplace.snapshot(),
      platform: runtime.platform.snapshot(),
      revenue: runtime.revenue.snapshot(),
    },
    new Date(now.getTime() + 5_000).toISOString(),
  );
  steps.push({
    code: "atlas-scenario",
    productCode: "atlas",
    label: `Atlas évalue un scénario à ${evaluation.estimatedCostXof.toLocaleString("fr-FR")} FCFA.`,
    status: "completed",
    evidence: atlasScenarioId,
  });

  runtime.atlas.generateBriefing({
    id: `briefing-${scenarioId}`,
    workspaceId: "atlas-national-operations",
    generatedAt: new Date(now.getTime() + 6_000).toISOString(),
    title: "Briefing chaîne du froid — Dakar",
    sources: {
      digitalTwin: runtime.digitalTwin.snapshot(),
      coordination: runtime.coordination.snapshot(),
      marketplace: runtime.marketplace.snapshot(),
      platform: runtime.platform.snapshot(),
      revenue: runtime.revenue.snapshot(),
    },
    nextReviewAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1_000).toISOString(),
  });
  steps.push({
    code: "government-briefing",
    productCode: "government",
    label: "Un briefing exécutif est généré avec les signaux, preuves et décisions recommandées.",
    status: "completed",
    evidence: `briefing-${scenarioId}`,
  });

  const snapshot = runtime.snapshot();
  return {
    scenarioId,
    name: "Coordination inter-produits de la chaîne du froid",
    startedAt,
    completedAt: new Date(now.getTime() + 6_000).toISOString(),
    actors: structuredClone(demoActors),
    steps,
    outcome: {
      openSignals: snapshot.digitalTwin.signals.filter((signal) => signal.status === "open").length,
      atlasQuestions: snapshot.atlas.questions.length,
      atlasInsights: snapshot.atlas.insights.length,
      atlasScenarios: snapshot.atlas.scenarios.length,
      atlasBriefings: snapshot.atlas.briefings.length,
      graphNodes: snapshot.knowledgeGraph.nodes.length,
      processedEvents: snapshot.processedEventIds.length,
    },
  };
}
