import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import { deriveDatasetReferenceAt } from "../src/domain/signal-crossing";
import {
  fluxChannelDistribution,
  fluxStats,
  messageAgeLabel,
  projectFluxContext,
  resolveReportedByActor,
  resolveTerritoryFromHint
} from "../src/domain/incoming-message";
import { canRole } from "../src/server/permissions";
import { computeFindingConvergences } from "../src/domain/finding-convergence";

// LOT V3.3 — "Flux / Dossiers & Convergence". Composants "use client"
// (FluxExplorer/FluxDetailPanel) non montables via renderToStaticMarkup
// dans ce jeu de tests Node pur (même contrainte déjà documentée pour
// SituationsExplorer, LOT V3.2) — vérifiés par lecture de source. Le Core
// (domain/incoming-message.ts, pur) est testé en direct.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();
const referenceAtMs = (() => {
  const at = deriveDatasetReferenceAt(state);
  return at ? new Date(at).getTime() : Date.now();
})();

// TEST 1 — fluxStats/fluxChannelDistribution restent des décomptes réels
// sur IncomingMessage.status/channel, jamais un chiffre fabriqué (la
// maquette V3 propose 4 paliers fictifs — "Reçu"/"À qualifier" distincts
// — que le modèle réel ne porte pas : ici, exactement 3, une somme = le
// total).
test("TEST 1 — fluxStats/fluxChannelDistribution sont des décomptes réels vérifiables", () => {
  const stats = fluxStats(state);
  assert.equal(stats.nouveau, state.incomingMessages.filter((m) => m.status === "nouveau").length);
  assert.equal(stats.converti, state.incomingMessages.filter((m) => m.status === "converti").length);
  assert.equal(stats.ecarte, state.incomingMessages.filter((m) => m.status === "ecarte").length);
  assert.equal(stats.nouveau + stats.converti + stats.ecarte, stats.total);
  assert.equal(stats.total, state.incomingMessages.length);

  const distribution = fluxChannelDistribution(state);
  const sum = distribution.reduce((total, item) => total + item.count, 0);
  assert.equal(sum, state.incomingMessages.length);
  assert.equal(distribution.length, 5, "les 5 canaux réels (Signal[\"channel\"]) doivent tous être représentés, même à 0");
});

// TEST 2 — resolveTerritoryFromHint : même heuristique que
// CoordinationWorkspace.tsx (extraite, pas dupliquée) — une correspondance
// ambiguë (plusieurs territoires possibles) n'est jamais résolue comme
// certaine.
test("TEST 2 — resolveTerritoryFromHint reprend l'heuristique déjà réelle du formulaire de qualification", () => {
  const message = state.incomingMessages.find((m) => m.territoryHint === "Kayar");
  assert.ok(message);
  const resolved = resolveTerritoryFromHint(state, message!.territoryHint);
  assert.equal(resolved?.name, "Kayar");
  assert.equal(resolveTerritoryFromHint(state, undefined), undefined);
  assert.equal(resolveTerritoryFromHint(state, "Un lieu qui n'existe nulle part"), undefined);
});

// TEST 3 — projectFluxContext ("Ce que le système a pu rattacher" / "Ce
// qui manque pour qualifier", mandat §6) : seulement 2 dimensions
// défendables (territoire, émetteur), jamais un rapprochement de
// doublon/situation liée déduit à l'avance.
test("TEST 3 — projectFluxContext reste à 2 dimensions déterministes défendables", () => {
  for (const message of state.incomingMessages) {
    const { matched, missing } = projectFluxContext(state, message);
    const keys = [...matched.map((m) => m.key), ...missing.map((m) => m.key)];
    assert.ok(keys.every((key) => key === "territoire" || key === "emetteur"));
    // Chaque dimension apparaît exactement une fois, soit matched soit missing — jamais les deux à la fois pour une même dimension.
    assert.equal(keys.filter((key) => key === "territoire").length, 1);
    assert.equal(keys.filter((key) => key === "emetteur").length, 1);
  }
  // Le message avec reportedByActorId réel doit résoudre un émetteur connu.
  const withActor = state.incomingMessages.find((m) => m.reportedByActorId);
  assert.ok(withActor);
  const actor = resolveReportedByActor(state, withActor!);
  assert.ok(actor);
  const { matched } = projectFluxContext(state, withActor!);
  assert.ok(matched.some((m) => m.key === "emetteur" && m.value.includes(actor!.name)));
});

// TEST 4 — messageAgeLabel référencé contre l'horloge du jeu de données
// (deriveDatasetReferenceAt), jamais Date.now() — même discipline que
// situationAgeLabel (LOT V3.2).
test("TEST 4 — messageAgeLabel utilise l'horloge métier du jeu de données", () => {
  const message = state.incomingMessages[0];
  const label = messageAgeLabel(message, referenceAtMs);
  assert.ok(label.length > 0);
  const expectedHours = Math.floor((referenceAtMs - new Date(message.receivedAt).getTime()) / 3_600_000);
  if (expectedHours <= 0) assert.equal(label, "à l’instant");
  else if (expectedHours < 24) assert.equal(label, `il y a ${expectedHours} h`);
});

// TEST 5 — permissions réelles : seuls administrateur/coordinateur/
// operateur portent convert_message_to_signal ET dismiss_incoming_message
// (server/permissions.ts) — les mêmes 3 rôles que l'ancien onglet
// "Messages entrants" (canQualifyIntake, CoordinationWorkspace.tsx).
test("TEST 5 — seuls administrateur/coordinateur/operateur peuvent qualifier le flux entrant", () => {
  const roles = ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "institution", "partenaire"] as const;
  const canConvert = roles.filter((role) => canRole(role, "convert_message_to_signal"));
  const canDismiss = roles.filter((role) => canRole(role, "dismiss_incoming_message"));
  assert.deepEqual([...canConvert].sort(), ["administrateur", "coordinateur", "operateur"]);
  assert.deepEqual([...canDismiss].sort(), ["administrateur", "coordinateur", "operateur"]);

  const navSource = readSource("../src/domain/platform/private-nav.ts");
  assert.ok(navSource.includes('{ href: "/app/flux", label: "Flux entrant"'));
  assert.ok(navSource.includes('roles: ["administrateur", "operateur", "coordinateur"]'));

  const explorerSource = readSource("../src/components/flux/FluxExplorer.tsx");
  assert.ok(explorerSource.includes('CAN_QUALIFY_ROLES: Role[] = ["administrateur", "coordinateur", "operateur"]'));
  assert.ok(explorerSource.includes('router.replace("/app/travail")'), "un rôle non autorisé doit être redirigé, jamais laissé sur une page vide");
});

// TEST 6 — aucune commande inventée : FluxDetailPanel n'appelle que les 2
// commandes réelles (mandat §7 — "prefer omission" pour tout geste sans
// commande correspondante, comme les options fictives de la maquette V3).
test("TEST 6 — FluxDetailPanel n'expose que les 2 commandes réelles existantes", () => {
  const source = readSource("../src/components/flux/FluxDetailPanel.tsx");
  assert.ok(source.includes('type: "convert_message_to_signal"'));
  assert.ok(source.includes('type: "dismiss_incoming_message"'));
  for (const forbidden of ["create_situation", "create_initiative", "alert", "assign_partner"]) {
    assert.ok(!source.includes(`type: "${forbidden}"`), `commande inventée détectée : ${forbidden}`);
  }
});

// TEST 7 — Convergence (P2.3-A) : le module Flux réutilise
// FindingConvergenceView/computeFindingConvergences SANS AUCUNE
// modification — jamais réécrit, jamais un raccourci message brut →
// convergence (IncomingMessage n'apparaît dans aucun sourceRef de
// Finding).
test("TEST 7 — la Convergence documentée reste intouchée et IncomingMessage n'y entre jamais directement", () => {
  const explorerSource = readSource("../src/components/flux/FluxExplorer.tsx");
  assert.ok(explorerSource.includes("<FindingConvergenceView state={state} />"));
  const convergenceSource = readSource("../src/domain/finding-convergence.ts");
  assert.ok(!convergenceSource.includes("IncomingMessage"), "finding-convergence.ts ne doit connaître aucun IncomingMessage — la convergence reste en aval des Findings qualifiés");
  // Non-régression fonctionnelle : la fonction réelle tourne toujours sur le jeu de démonstration sans erreur.
  const groups = computeFindingConvergences(state);
  assert.ok(Array.isArray(groups));
});

// TEST 8 — aucune entité "Dossier" persistée créée (mandat §8, explicite).
test("TEST 8 — aucune entité Dossier persistée n'a été introduite dans le domaine", () => {
  const typesSource = readSource("../src/domain/types.ts");
  assert.ok(!/interface\s+Dossier\b/.test(typesSource), "aucune interface Dossier ne doit exister dans domain/types.ts");
  const explorerSource = readSource("../src/components/flux/FluxExplorer.tsx");
  assert.ok(explorerSource.includes("aucune entité"), "le fichier doit documenter explicitement l'absence d'entité Dossier persistée");
});
