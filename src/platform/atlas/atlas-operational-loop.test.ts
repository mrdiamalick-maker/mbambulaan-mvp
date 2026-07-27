import assert from "node:assert/strict";
import test from "node:test";
import { runColdChainCoordinationScenario } from "@/platform/product-suite/integrated-demo-scenario";
import { resetIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";
import { AtlasOperationalLoop } from "./atlas-operational-loop";

test("une décision Atlas crée des tâches, les exécute et réinjecte le résultat", async () => {
  resetIntegratedPlatformRuntime("2026-07-27T21:00:00.000Z");
  const demo = await runColdChainCoordinationScenario(new Date("2026-07-27T21:00:00.000Z"));
  const scenarioId = `atlas-scenario-${demo.scenarioId}`;
  const loop = new AtlasOperationalLoop();

  const decision = await loop.approveScenario({
    decisionId: "decision-cold-chain-1",
    scenarioId,
    approvedByActorId: "actor-government-demo",
    territoryId: "territory-dakar",
    at: "2026-07-27T21:10:00.000Z",
  });

  assert.equal(decision.status, "in_execution");
  assert.equal(decision.workItemIds.length, 2);
  assert.ok(loop.snapshot().notifications.length >= 2);

  const result = await loop.completeDecision({
    decisionId: decision.id,
    at: "2026-07-27T22:00:00.000Z",
  });

  assert.equal(result.completedWorkItems, 2);
  assert.equal(result.evidenceIds.length, 2);
  assert.ok(loop.snapshot().workItems.every((item) => item.status === "completed"));
  assert.ok(loop.snapshot().decisions.every((item) => item.status === "completed"));
});
