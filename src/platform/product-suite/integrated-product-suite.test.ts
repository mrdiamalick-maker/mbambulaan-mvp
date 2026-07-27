import assert from "node:assert/strict";
import test from "node:test";
import { getIntegratedProductSuite, getProductWorkspace } from "./integrated-product-suite";

test("la suite expose les sept produits autour d'un même runtime", () => {
  const suite = getIntegratedProductSuite({
    running: true,
    pendingEvents: 2,
    failedEvents: 0,
    openSignals: 3,
    atlasInsights: 4,
    atlasScenarios: 1,
    graphNodes: 12,
  }, "2026-07-27T19:30:00.000Z");

  assert.equal(suite.products.length, 7);
  assert.deepEqual(
    suite.products.map((product) => product.code),
    ["fisher", "cooperative", "business", "government", "finance", "knowledge", "atlas"],
  );
  assert.equal(suite.runtime.running, true);
  assert.equal(suite.completion.totalProducts, 7);
  assert.ok(suite.completion.availableCapabilities > suite.completion.plannedCapabilities);
});

test("chaque produit identifie acteur, valeur, payeur et parcours", () => {
  for (const code of ["fisher", "cooperative", "business", "government", "finance", "knowledge", "atlas"] as const) {
    const product = getProductWorkspace(code);
    assert.ok(product);
    assert.ok(product.actor.length > 0);
    assert.ok(product.value.length > 0);
    assert.ok(product.payer.length > 0);
    assert.ok(product.primaryJourney.length >= 5);
    assert.ok(product.capabilities.length >= 3);
  }
});

test("Atlas reste dépendant des couches de connaissance et de gouvernement", () => {
  const atlas = getProductWorkspace("atlas");
  assert.ok(atlas);
  assert.deepEqual(atlas.dependencies, ["government", "knowledge"]);
  assert.ok(atlas.capabilities.some((capability) => capability.code === "action-loop"));
});
