// Tests PD.2 — "Product Dressing — Species Referential V1". Portent sur
// l'évolution additive de Species (src/domain/types.ts, src/data/demo-state.ts)
// et sur la couche de résolution pure src/domain/species-referential.ts
// (§14 du mandat : "every Species has stable id; every Species has
// stable code; code uniqueness; reference name; scientific name
// nullable behavior; alias/local-name lookup; ambiguous lookup
// behavior; Landing CatchLine resolution; Lot resolution; ServiceRequest
// resolution; PriceObservation resolution; ScarcityIndicator resolution;
// no broken existing ids; Landing Intelligence rendering remains
// correct").
import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { resolveSpeciesByAlias, resolveSpeciesByCode, resolveSpeciesById } from "../src/domain/species-referential";
import { buildLandingDetail, buildTerritoryLandingActivity } from "../src/domain/territory-intelligence";

const state = createDemoState();

// Les 10 identifiants Species déjà référencés par le jeu de démonstration
// avant PD.2 (Landing/CatchLine, Lot, ServiceRequest, PriceObservation,
// ScarcityIndicator) — CRITIQUE (mandat §7) : aucun ne doit disparaître ni
// changer de valeur.
const PRE_PD2_SPECIES_IDS = [
  "sp-sardinelle",
  "sp-thiof",
  "sp-maquereau",
  "sp-mulet",
  "sp-sole",
  "sp-ethmalose",
  "sp-carangue",
  "sp-ceinture",
  "sp-poulpe",
  "sp-crevette"
];

test("aucun id Species existant n'a été remplacé (migration additive)", () => {
  const currentIds = new Set(state.species.map((item) => item.id));
  for (const id of PRE_PD2_SPECIES_IDS) {
    assert.ok(currentIds.has(id), `id historique disparu : ${id}`);
  }
  assert.equal(state.species.length, PRE_PD2_SPECIES_IDS.length, "le référentiel ne doit ni perdre ni gagner d'espèce dans ce lot");
});

test("chaque espèce a un id et un code stables (non vides)", () => {
  for (const item of state.species) {
    assert.ok(item.id.length > 0);
    assert.ok(item.code.length > 0, `espèce ${item.id} sans code`);
  }
});

test("les codes sont uniques à travers tout le référentiel", () => {
  const codes = state.species.map((item) => item.code);
  assert.equal(new Set(codes).size, codes.length, "un code Species est dupliqué");
});

test("le code ne dépend pas du libellé affiché (convention documentée, valeurs figées)", () => {
  // Convention : MAJUSCULES_SNAKE_CASE, ASCII sans accent — vérifiée pour
  // les 10 espèces, et les 3 exemples donnés littéralement par le mandat
  // (§4) sont repris verbatim.
  for (const item of state.species) {
    assert.match(item.code, /^[A-Z0-9_]+$/, `code non conforme à la convention : ${item.code}`);
  }
  assert.equal(state.species.find((s) => s.id === "sp-sardinelle")?.code, "SAR_ROUND");
  assert.equal(state.species.find((s) => s.id === "sp-thiof")?.code, "THIOF");
  assert.equal(state.species.find((s) => s.id === "sp-ethmalose")?.code, "ETHMALOSE");
});

test("nameFr est renseigné pour chaque espèce (nom de référence)", () => {
  for (const item of state.species) {
    assert.ok(item.nameFr.length > 0, `espèce ${item.id} sans nameFr`);
    // Aucune divergence introduite par ce lot entre l'ancien champ `name`
    // (toujours lu par les écrans /app existants) et le nouveau `nameFr`.
    assert.equal(item.nameFr, item.name);
  }
});

test("scientificName reste absent quand aucune valeur défendable n'est connue — jamais une chaîne vide fabriquée", () => {
  const withScientificName = state.species.filter((item) => item.scientificName !== undefined);
  const withoutScientificName = state.species.filter((item) => item.scientificName === undefined);

  assert.ok(withScientificName.length > 0, "au moins une espèce doit porter un nom scientifique défendable");
  assert.ok(withoutScientificName.length > 0, "au moins une espèce doit rester sans nom scientifique (prudence attendue)");
  for (const item of withScientificName) {
    assert.ok(item.scientificName!.length > 0, `nom scientifique vide plutôt qu'absent pour ${item.id}`);
    // Un vrai binôme latin (Genre espèce), jamais une valeur placeholder.
    assert.match(item.scientificName!, /^[A-Z][a-z]+ [a-z]+$/, `nom scientifique mal formé pour ${item.id}`);
  }
  assert.equal(state.species.find((s) => s.id === "sp-thiof")?.scientificName, "Epinephelus aeneus");
});

test("localNames est toujours un tableau (jamais absent), vide quand aucun alias n'est confirmé", () => {
  for (const item of state.species) {
    assert.ok(Array.isArray(item.localNames), `localNames n'est pas un tableau pour ${item.id}`);
  }
  const sardinelle = state.species.find((s) => s.id === "sp-sardinelle");
  assert.deepEqual(sardinelle?.localNames, ["Yaboy"]);
  // La majorité des espèces de démonstration n'a pas d'alias local confirmé.
  assert.ok(state.species.filter((item) => item.localNames.length === 0).length >= 8);
});

test("toutes les espèces de démonstration sont actives", () => {
  for (const item of state.species) assert.equal(item.active, true);
});

test("résolution par id : resolveSpeciesById retrouve chaque espèce réelle et rien d'inconnu", () => {
  for (const item of state.species) {
    assert.deepEqual(resolveSpeciesById(state, item.id), item);
  }
  assert.equal(resolveSpeciesById(state, "sp-n-existe-pas"), undefined);
});

test("résolution par code : resolveSpeciesByCode est insensible à la casse", () => {
  const bySpecies = resolveSpeciesByCode(state, "THIOF");
  assert.equal(bySpecies?.id, "sp-thiof");
  assert.equal(resolveSpeciesByCode(state, "thiof")?.id, "sp-thiof");
  assert.equal(resolveSpeciesByCode(state, "code-inconnu"), undefined);
});

test("résolution par alias : le nom de référence, le code et un nom local résolvent tous vers la même espèce", () => {
  assert.equal(resolveSpeciesByAlias(state, "Sardinelle ronde").status, "found");
  assert.equal((resolveSpeciesByAlias(state, "Sardinelle ronde") as { species: { id: string } }).species.id, "sp-sardinelle");
  assert.equal((resolveSpeciesByAlias(state, "SAR_ROUND") as { species: { id: string } }).species.id, "sp-sardinelle");
  assert.equal((resolveSpeciesByAlias(state, "yaboy") as { species: { id: string } }).species.id, "sp-sardinelle");
  // Insensible aux accents/casse (Côtière → cotiere).
  assert.equal((resolveSpeciesByAlias(state, "crevette côtière") as { species: { id: string } }).species.id, "sp-crevette");
});

test("résolution ambiguë ou introuvable : jamais un choix devinée à la place de l'appelant", () => {
  assert.equal(resolveSpeciesByAlias(state, "poisson-lune-imaginaire").status, "not_found");
  assert.equal(resolveSpeciesByAlias(state, "").status, "not_found");
  // Ambiguïté simulée : deux espèces partageant le même alias local ne
  // doivent jamais se résoudre en silence vers l'une des deux.
  const ambiguousState = {
    ...state,
    species: [
      ...state.species,
      { ...state.species[0], id: "sp-test-ambigu", code: "TEST_AMBIGU", localNames: ["Yaboy"] }
    ]
  };
  const result = resolveSpeciesByAlias(ambiguousState, "Yaboy");
  assert.equal(result.status, "ambiguous");
  if (result.status === "ambiguous") {
    assert.equal(result.candidates.length, 2);
    assert.deepEqual(new Set(result.candidates.map((c) => c.id)), new Set(["sp-sardinelle", "sp-test-ambigu"]));
  }
});

test("intégrité de référence : Landing.catches ne cite aucun speciesId orphelin", () => {
  const speciesIds = new Set(state.species.map((item) => item.id));
  for (const landing of state.landings) {
    for (const catchLine of landing.catches) {
      assert.ok(speciesIds.has(catchLine.speciesId), `Landing ${landing.id} référence une espèce inconnue (${catchLine.speciesId})`);
    }
  }
});

test("intégrité de référence : Lot ne cite aucun speciesId orphelin", () => {
  const speciesIds = new Set(state.species.map((item) => item.id));
  assert.ok(state.lots.length > 0);
  for (const lot of state.lots) {
    assert.ok(speciesIds.has(lot.speciesId), `Lot ${lot.id} référence une espèce inconnue (${lot.speciesId})`);
  }
});

test("intégrité de référence : ServiceRequest ne cite aucun speciesId orphelin", () => {
  const speciesIds = new Set(state.species.map((item) => item.id));
  assert.ok(state.serviceRequests.length > 0);
  for (const request of state.serviceRequests) {
    assert.ok(speciesIds.has(request.speciesId), `ServiceRequest ${request.id} référence une espèce inconnue (${request.speciesId})`);
  }
});

test("intégrité de référence : PriceObservation ne cite aucun speciesId orphelin", () => {
  const speciesIds = new Set(state.species.map((item) => item.id));
  assert.ok(state.priceObservations.length > 0);
  for (const observation of state.priceObservations) {
    assert.ok(speciesIds.has(observation.speciesId), `PriceObservation ${observation.id} référence une espèce inconnue (${observation.speciesId})`);
  }
});

test("intégrité de référence : ScarcityIndicator ne cite aucun speciesId orphelin", () => {
  const speciesIds = new Set(state.species.map((item) => item.id));
  assert.ok(state.scarcity.length > 0);
  for (const indicator of state.scarcity) {
    assert.ok(speciesIds.has(indicator.speciesId), `ScarcityIndicator ${indicator.id} référence une espèce inconnue (${indicator.speciesId})`);
  }
});

test("Landing Intelligence (PD.1) : le rendu par espèce reste correct et expose l'identité scientifique/locale quand connue", () => {
  const detail = buildLandingDetail(state, "landing-joal");
  assert.ok(detail);
  assert.ok(detail!.catches.length > 0);
  for (const line of detail!.catches) {
    const species = state.species.find((s) => s.id === line.speciesId)!;
    assert.equal(line.speciesName, species.nameFr);
    assert.equal(line.speciesScientificName, species.scientificName);
    assert.equal(line.speciesLocalName, species.localNames[0]);
  }

  const thiofDetail = buildLandingDetail(state, "landing-kayar");
  const thiofCatch = thiofDetail?.catches.find((c) => c.speciesId === "sp-thiof");
  if (thiofCatch) {
    assert.equal(thiofCatch.speciesScientificName, "Epinephelus aeneus");
    assert.equal(thiofCatch.speciesLocalName, undefined);
  }

  const activity = buildTerritoryLandingActivity(state, "joal");
  for (const sp of activity.volumeBySpecies) {
    const species = state.species.find((s) => s.id === sp.speciesId)!;
    assert.equal(sp.speciesName, species.nameFr);
  }
});
