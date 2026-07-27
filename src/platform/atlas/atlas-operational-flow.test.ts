import assert from "node:assert/strict";
import test from "node:test";
import { IntegratedPlatformRuntime } from "@/platform/runtime/integrated-platform-runtime";

test("Atlas transforme un signal opérationnel en scénario évalué et briefing", async () => {
  const runtime = new IntegratedPlatformRuntime();
  runtime.start("2026-07-27T12:00:00.000Z");

  runtime.publish({
    id: "event-atlas-cold-chain-risk",
    type: "operational.flow.blocked",
    occurredAt: "2026-07-27T12:01:00.000Z",
    correlationId: "atlas-demo-1",
    tenantId: "tenant-national",
    territoryId: "territory-dakar",
    payload: {
      flowId: "flow-cold-chain-dakar",
      flowKind: "service",
      fromEntityId: "cooperative-dakar",
      fromLabel: "Coopérative Dakar",
      toEntityId: "cold-room-dakar",
      toLabel: "Chambre froide Dakar",
      quantity: 2_400,
      unit: "kg",
    },
  });
  await runtime.drain("2026-07-27T12:02:00.000Z");

  runtime.publish({
    id: "event-atlas-question-cold-chain",
    type: "atlas.question.requested",
    occurredAt: "2026-07-27T12:03:00.000Z",
    correlationId: "atlas-demo-1",
    causationId: "event-atlas-cold-chain-risk",
    tenantId: "tenant-national",
    territoryId: "territory-dakar",
    payload: {
      questionId: "question-cold-chain-dakar",
      workspaceId: "atlas-national-operations",
      askedByActorId: "actor-ministry",
      question: "Comment résorber le risque de chaîne du froid à Dakar ?",
      decisionDomain: "operational_resilience",
      horizon: "90_days",
    },
  });
  await runtime.drain("2026-07-27T12:04:00.000Z");

  const scenario = runtime.atlas.createScenario({
    id: "scenario-cold-chain-dakar",
    workspaceId: "atlas-national-operations",
    name: "Renforcement transitoire de la chaîne du froid",
    decisionDomain: "operational_resilience",
    baselineSnapshotId: "snapshot-event-atlas-cold-chain-risk",
    actions: [
      {
        id: "action-capacity-dakar",
        actionType: "allocate_capacity",
        targetEntityIds: ["cold-room-dakar"],
        description: "Réallouer une capacité froide temporaire de 2 400 kg.",
        estimatedCostXof: 1_500_000,
        expectedDelayDays: 7,
      },
      {
        id: "action-monitoring-dakar",
        actionType: "increase_monitoring",
        targetEntityIds: ["flow-cold-chain-dakar"],
        description: "Renforcer le suivi quotidien du flux frigorifique.",
        estimatedCostXof: 250_000,
        expectedDelayDays: 1,
      },
    ],
    assumptions: ["Une capacité alternative existe dans le territoire voisin."],
    status: "draft",
    createdAt: "2026-07-27T12:05:00.000Z",
  });

  const evaluation = runtime.atlas.evaluateScenario(scenario.id, {
    digitalTwin: runtime.digitalTwin.snapshot(),
    coordination: runtime.coordination.snapshot(),
    marketplace: runtime.marketplace.snapshot(),
    platform: runtime.platform.snapshot(),
    revenue: runtime.revenue.snapshot(),
  }, "2026-07-27T12:06:00.000Z");

  const briefing = runtime.atlas.generateBriefing({
    id: "briefing-cold-chain-dakar",
    workspaceId: "atlas-national-operations",
    generatedAt: "2026-07-27T12:07:00.000Z",
    title: "Briefing chaîne du froid — Dakar",
    sources: {
      digitalTwin: runtime.digitalTwin.snapshot(),
      coordination: runtime.coordination.snapshot(),
      marketplace: runtime.marketplace.snapshot(),
      platform: runtime.platform.snapshot(),
      revenue: runtime.revenue.snapshot(),
    },
    nextReviewAt: "2026-08-03T12:00:00.000Z",
  });

  const snapshot = runtime.snapshot();
  assert.equal(snapshot.atlas.questions.length, 1);
  assert.ok(snapshot.atlas.evidence.length > 0);
  assert.ok(snapshot.atlas.insights.length > 0);
  assert.equal(snapshot.atlas.scenarios.length, 1);
  assert.equal(snapshot.atlas.scenarioEvaluations.length, 1);
  assert.equal(evaluation.estimatedCostXof, 1_750_000);
  assert.equal(briefing.workspaceId, "atlas-national-operations");
  assert.ok(briefing.prioritySignalIds.length > 0);
  assert.ok(snapshot.knowledgeGraph.nodes.length > 0);
});
