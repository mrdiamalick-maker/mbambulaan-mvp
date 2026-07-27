import assert from "node:assert/strict";
import test from "node:test";
import { runColdChainCoordinationScenario } from "./integrated-demo-scenario";

test("le scénario chaîne du froid traverse plusieurs produits et produit un briefing Atlas", async () => {
  const result = await runColdChainCoordinationScenario(new Date("2026-07-27T20:00:00.000Z"));

  assert.equal(result.actors.length, 4);
  assert.deepEqual(
    result.steps.map((step) => step.productCode),
    ["cooperative", "government", "atlas", "government"],
  );
  assert.ok(result.steps.every((step) => step.status === "completed"));
  assert.ok(result.outcome.openSignals >= 1);
  assert.ok(result.outcome.atlasQuestions >= 1);
  assert.ok(result.outcome.atlasInsights >= 1);
  assert.ok(result.outcome.atlasScenarios >= 1);
  assert.ok(result.outcome.atlasBriefings >= 1);
  assert.ok(result.outcome.graphNodes >= 1);
  assert.ok(result.outcome.processedEvents >= 2);
});
