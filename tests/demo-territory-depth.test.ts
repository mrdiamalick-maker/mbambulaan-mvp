import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { publicTerritories } from "../src/data/public-atlas";

const approvedScenarios = [
  ["kayar", "sit-kayar"],
  ["soumbedioune", "sit-soumbedioune"],
  ["rufisque", "sit-rufisque"],
  ["djiffer", "sit-djiffer"],
  ["popenguine", "sit-popenguine-vente-locale"],
  ["missirah", "sit-missirah-traceabilite"],
  ["ouakam", "sit-ouakam-creneau-quai"]
] as const;

test("les sept territoires validés portent une boucle démontrable complète sans veille générique concurrente", () => {
  const state = createDemoState();

  for (const [territoryId, situationId] of approvedScenarios) {
    const situation = state.situations.find((item) => item.id === situationId);
    assert.ok(situation, `situation approfondie absente pour ${territoryId}`);
    assert.equal(situation.territoryId, territoryId);
    assert.ok(["resultat", "reglee"].includes(situation.status));
    assert.ok(situation.result?.trim(), `résultat absent pour ${territoryId}`);
    assert.ok(situation.confirmation?.trim(), `confirmation absente pour ${territoryId}`);
    assert.ok(!state.situations.some((item) => item.id === `sit-${territoryId}-veille`), `veille générique concurrente pour ${territoryId}`);

    assert.ok(state.signals.some((item) => item.id === `obs-${situationId}`), `signal absent pour ${territoryId}`);
    assert.ok(state.decisions.some((item) => item.situationId === situationId), `décision absente pour ${territoryId}`);
    assert.ok(state.evidences.some((item) => item.situationId === situationId), `preuve absente pour ${territoryId}`);
    assert.ok(state.learnings.some((item) => item.situationId === situationId), `apprentissage absent pour ${territoryId}`);

    const coordination = state.coordinationSpaces.find((item) => item.situationId === situationId);
    assert.ok(coordination, `coordination absente pour ${territoryId}`);
    assert.ok(coordination!.commitments.length >= 2, `engagements insuffisants pour ${territoryId}`);
    assert.ok(coordination!.commitments.every((item) => item.status === "terminee" && item.result?.trim()), `engagement sans résultat pour ${territoryId}`);
  }
});

test("les niveaux de confiance conservent les limites métier des scénarios validés", () => {
  const state = createDemoState();

  const kayarSignal = state.signals.find((item) => item.id === "obs-sit-kayar");
  const kayarSituation = state.situations.find((item) => item.id === "sit-kayar");
  const kayarScarcity = state.scarcity.find((item) => item.id === "scar-thiof-kayar");
  assert.equal(kayarSignal?.trust, "declaree");
  assert.equal(kayarSituation?.trust, "documentee");
  assert.equal(kayarScarcity?.status, "sous_tension");
  assert.match(kayarScarcity?.reasons.join(" ") ?? "", /Aucune conclusion sur le stock biologique ni sur l’inflation/);
  assert.equal(state.priceObservations.find((item) => item.id === "price-thiof-kayar")?.flagged, true);

  const soumbSignal = state.signals.find((item) => item.id === "obs-sit-soumbedioune");
  const soumbSituation = state.situations.find((item) => item.id === "sit-soumbedioune");
  assert.equal(soumbSignal?.trust, "declaree");
  assert.equal(soumbSituation?.trust, "officielle");
  assert.ok(soumbSignal?.reportedBy);

  const missirahSignal = state.signals.find((item) => item.id === "obs-sit-missirah-traceabilite");
  assert.equal(missirahSignal?.actorId, "act-relais-missirah");
  assert.ok(missirahSignal?.reportedBy);

  const popenguine = state.territories.find((item) => item.id === "popenguine");
  assert.equal(popenguine?.activity, "stable");
  assert.equal(state.situations.find((item) => item.id === "sit-popenguine-vente-locale")?.priority, "faible");
});

test("les référentiels Public et Produit restent explicitement distincts et leurs relations ne sont pas orphelines", () => {
  const state = createDemoState();
  const productIds = new Set(state.territories.map((item) => item.id));
  const publicIds = new Set(publicTerritories.map((item) => item.id));
  const situationIds = new Set(state.situations.map((item) => item.id));

  assert.equal(publicIds.size, 20);
  assert.equal(productIds.size, 18);
  assert.deepEqual([...publicIds].filter((id) => !productIds.has(id)).sort(), ["bargny", "ngaparou", "toubacouta", "ziguinchor"]);
  assert.deepEqual([...productIds].filter((id) => !publicIds.has(id)).sort(), ["lompoul", "ouakam"]);
  assert.equal(state.territories.find((item) => item.id === "rufisque")?.name, "Rufisque-Bargny");

  const identifiedCollections = [
    state.actors,
    state.situations,
    state.signals,
    state.coordinationSpaces,
    state.decisions,
    state.evidences,
    state.communications,
    state.lots,
    state.opportunities,
    state.communityPosts,
    state.learnings
  ];
  for (const collection of identifiedCollections) {
    assert.equal(new Set(collection.map((item) => item.id)).size, collection.length, "identifiant dupliqué dans le jeu de démonstration");
  }

  for (const initiative of state.initiatives) {
    initiative.situationIds.forEach((id) => assert.ok(situationIds.has(id), `situation d’initiative orpheline : ${id}`));
  }
  for (const post of state.communityPosts) {
    if (post.convertedObjectId) assert.ok(situationIds.has(post.convertedObjectId), `publication convertie orpheline : ${post.convertedObjectId}`);
  }
});
