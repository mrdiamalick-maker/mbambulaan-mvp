import assert from "node:assert/strict";
import test from "node:test";
import { getTerritorySynthesis } from "../src/v3-template/lib/territory-synthesis";

test("la synthèse territoire sépare attention, action et décision humaine préparée", () => {
  const joal = getTerritorySynthesis("Joal-Fadiouth");

  assert.ok(joal?.subject);
  assert.ok(joal.action);
  assert.equal(joal.decisionExpected, "Mobiliser une capacité froide de remplacement à Joal");
  assert.notEqual(joal.action, joal.decisionExpected);
});

test("une priorité élevée sans arbitrage explicite ne devient pas une décision attendue", () => {
  const kayar = getTerritorySynthesis("Kayar");

  assert.equal(kayar?.priorityLabel, "Élevé");
  assert.ok(kayar.action);
  assert.equal(kayar.decisionExpected, undefined);
});
