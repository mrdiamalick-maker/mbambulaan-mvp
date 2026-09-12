import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";

// LOT V3.28 ("Atlas territorial — bloc par bloc, pièce par pièce") —
// retour explicite de l'utilisateur : le dossier territorial rapide (les
// 5 onglets à droite de la carte) manquait les blocs/graphiques réels
// signalés (activité, débarquements, espèces). Reconstruction bloc par
// bloc du panneau, avec un principe explicite de l'utilisateur : "une
// fois le design figé on gérera les données réelles" — mais Species/
// CatchLine (domain/types.ts) sont déjà des entités RÉELLES du Core,
// jamais exploitées jusqu'ici dans l'Atlas : aucune donnée fabriquée
// n'a donc été nécessaire pour combler le manque signalé.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/app/app/etat/territoires/page.tsx");
const state = createDemoState();

// TEST 1 — la maquette porte 4 couches réelles (Situations/Chaîne du
// froid/Débarquements/Programmes), jamais 2 ("Situations ouvertes"/
// "Capacités fragiles") qui remplaçaient à tort les 4 lectures.
test("TEST 1 — les 4 couches littérales de la maquette recolorent réellement la carte", () => {
  for (const label of ["Situations", "Chaîne du froid", "Débarquements", "Programmes"]) {
    assert.ok(source.includes(`label: "${label}"`), `couche manquante : "${label}"`);
  }
  assert.ok(source.includes("territoryActivityForLayer"));
  // Chaque couche doit dériver son verdict d'une lecture réelle et
  // distincte, jamais retomber toutes sur territory.activity.
  assert.ok(source.includes("COLD_CHAIN_INFRA_TYPES"));
  assert.ok(source.includes("territoryLandingCounts"));
  assert.ok(source.includes("programmeHealth(state, programme)"));
});

// TEST 2 — l'onglet "Activité" reprend un histogramme RÉEL de
// débarquements par jour (territoryLandingTrend, domain/atlas-
// overview.ts, déjà disclosé) plutôt que l'agrégation "par site" qui ne
// montrait aucune tendance temporelle.
test("TEST 2 — l'onglet Activité affiche un histogramme réel de débarquements avec disclosure", () => {
  assert.ok(source.includes("territoryLandingTrend(state, selectedTerritory.id"));
  assert.ok(source.includes("LANDING_TREND_SIMULATED_NOTICE"));
  assert.ok(source.includes("hasSimulatedLandingPoint"));
});

// TEST 3 — "Répartition par espèce" : réponse directe au manque signalé
// ("espèces"), à partir des entités réelles Species/CatchLine, jamais un
// tonnage fabriqué.
test("TEST 3 — la répartition par espèce est réelle, dérivée de CatchLine.quantityKg", () => {
  assert.ok(source.includes("Répartition par espèce"));
  assert.ok(source.includes("catchLine.speciesId"));
  assert.ok(source.includes("catchLine.quantityKg"));
  assert.ok(state.species.length > 0, "le Core doit porter au moins une espèce réelle");
  const someLanding = state.landings.find((landing) => landing.catches.length > 0);
  assert.ok(someLanding, "au moins un débarquement du Demo World doit porter des prises réelles");
});

// TEST 4 — le bandeau de stats du haut reprend les 4 lectures littérales
// de la maquette ("Débarquements {période}"/"Acteurs actifs"/"Capacités
// froides OK"/"Situations ouvertes"), jamais le bandeau reformulé
// ("Capacités fragiles"/"Programmes"). "Débarquements" suit désormais la
// période réelle de l'en-tête (LOT V3.29, EtatPreviewProvider) plutôt
// qu'un "30 j" figé.
test("TEST 4 — le bandeau de stats reprend les 4 lectures littérales de la maquette", () => {
  assert.ok(source.includes("`Débarquements ${periodLabel}`"));
  for (const label of ["Acteurs actifs", "Capacités froides OK", "Situations ouvertes"]) {
    assert.ok(source.includes(label), `tuile manquante : "${label}"`);
  }
});

// TEST 5 — la bande littorale (sparkline par site) porte une série
// RÉELLE par jour (siteDailyLandingCounts), jamais la même courbe
// illustrative recolorée pour les 54 sites — un site sans débarquement
// documenté affiche honnêtement une ligne plate à zéro.
test("TEST 5 — la bande littorale utilise une série réelle par site, jamais la courbe illustrative partagée", () => {
  assert.ok(source.includes("siteDailyLandingCounts"));
  assert.ok(source.includes("data={trend}"));
  const sparklineSource = readSource("../src/components/etat/EtatDataVisualizations.tsx");
  assert.ok(sparklineSource.includes("data?: number[]"));
  assert.ok(sparklineSource.includes("data === undefined"), "data vide (site réel sans débarquement) ne doit jamais retomber sur la série illustrative");
});

// TEST 6 — les onglets Capacités/Acteurs/Programmes portent les
// compléments littéraux de la maquette (provenance, sous-titre de rôle,
// phase · responsable), jamais un texte narratif inventé.
test("TEST 6 — Capacités/Acteurs/Programmes portent des compléments réels, jamais fabriqués", () => {
  assert.ok(source.includes("trustLabels[infra.trust]"));
  assert.ok(source.includes("Une capacité déclarée fragile n’est pas une capacité hors service."));
  assert.ok(source.includes("ROLE_DESCRIPTION[role]"));
  assert.ok(source.includes("initiativeStatusLabel[programme.status]"));
  assert.ok(source.includes("state.actors.find((item) => item.id === programme.ownerId)"));
});
