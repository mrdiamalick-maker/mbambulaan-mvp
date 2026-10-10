import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyDemoProgramOpportunities } from "../src/data/demo-program-opportunities";
import { getArbitrageItems, getDecidedArbitrages } from "../src/v3-template/lib/arbitrages-bridge";
import { getFluxSourceSummary, getFluxTerritoryContext, buildFluxRows } from "../src/v3-template/lib/flux-bridge";
import { PROGS } from "../src/v3-template/data/programmes";

// feat/etat-ux-b3-integration — tests ciblés pour les ajouts B3
// (Arbitrages "Déjà rendus"/"Dossier · relations enregistrées", Flux
// "D'où vient l'information"/"Territoire et acteurs"), construits sur le
// Demo World réel exactement comme le fait l'application (createDemoState
// + applyDemoProgramOpportunities), jamais un état synthétique.

test("getDecidedArbitrages — le seul arbitrage réellement décidé apparaît, avec le vrai décideur (pas le champ ARB.decider pré-décision)", () => {
  const state = applyDemoProgramOpportunities(createDemoState(), "act-coordinateur");
  const decided = getDecidedArbitrages(state);
  assert.equal(decided.length, 1, "un seul ARB situation-anchoré a une Decision réelle enregistrée dans le fixture de base");
  assert.equal(decided[0].title, "Mobiliser une capacité froide de remplacement à Joal");
  assert.equal(decided[0].decider, "Mamadou Fall", "le décideur doit venir de Decision.decidedByActorId, jamais du champ ARB.decider (qui décrit qui DOIT décider avant la décision)");
  assert.ok(decided[0].situationRowId >= 0, "situationRowId doit être résolu via buildSituationRows pour que « Voir la situation » ouvre un vrai dossier");
});

test("getArbitrageItems — related.programmeFixtureId résout le vrai programme pour l'arbitrage Mbour→Popenguine", () => {
  const state = applyDemoProgramOpportunities(createDemoState(), "act-coordinateur");
  const items = getArbitrageItems(state);
  const mbour = items.find((item) => item.title.includes("Mbour"));
  assert.ok(mbour, "l'arbitrage Mbour→Popenguine doit rester en attente de décision");
  assert.equal(mbour!.related.programmeFixtureId, PROGS.find((p) => p.title === "Résilience de la chaîne du froid · Petite-Côte")!.id);
  assert.ok(mbour!.related.situationRowId != null, "la Situation réelle doit être résolue");
});

test("getArbitrageItems — l'arbitrage de portefeuille sans Situation réelle n'a aucune relation fabriquée", () => {
  const state = applyDemoProgramOpportunities(createDemoState(), "act-coordinateur");
  const items = getArbitrageItems(state);
  const portfolio = items.find((item) => item.title.includes("Référentiel pirogues"));
  assert.ok(portfolio, "l'arbitrage de portefeuille doit rester listé (sans objet de décision compatible)");
  assert.equal(portfolio!.situationId, undefined);
  assert.deepEqual(portfolio!.related, {}, "aucune relation ne doit être devinée pour un arbitrage sans Situation réelle");
});

test("getFluxSourceSummary — agrège uniquement les messages dont le territoire a été résolu, par territoire et canal réels", () => {
  const state = applyDemoProgramOpportunities(createDemoState(), "act-coordinateur");
  const summary = getFluxSourceSummary(state);
  const rows = buildFluxRows(state);
  const resolvedRowsCount = rows.filter((r) => r.territoryId).length;
  const summedCount = summary.reduce((sum, item) => sum + item.count, 0);
  assert.equal(summedCount, resolvedRowsCount, "la somme des comptes doit égaler exactement le nombre de messages à territoire résolu, aucun de plus");
  for (const item of summary) assert.ok(item.territoryLabel.length > 0 && item.channelLabel.length > 0);
});

test("getFluxTerritoryContext — acteurs et situations ouvertes réels, honnêtement distincts d'un lien métier confirmé", () => {
  const state = applyDemoProgramOpportunities(createDemoState(), "act-coordinateur");
  const context = getFluxTerritoryContext("kayar", state);
  assert.ok(context, "Kayar est un territoire réel du domaine");
  assert.ok(context!.actors.length > 0, "des acteurs réels doivent être résolus pour Kayar");
  for (const actor of context!.actors) assert.ok(actor.name.length > 0 && actor.roleLabel.length > 0);
  assert.equal(typeof context!.openSituationsCount, "number");
});

test("getFluxTerritoryContext — territoire inconnu retourne undefined, jamais un contexte fabriqué", () => {
  const state = applyDemoProgramOpportunities(createDemoState(), "act-coordinateur");
  assert.equal(getFluxTerritoryContext("territoire-inexistant", state), undefined);
});
