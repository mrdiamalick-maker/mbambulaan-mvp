import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.18 ("Situations & signaux — copie conforme du rendu maquette") —
// reconstruction complète sur le plan exact de l'écran `isSit` : maître-
// détail 392px/1fr sur les SITUATIONS (jamais la liste de signaux pleine
// largeur de la version précédente), funnel + ancienneté, détail à 4
// onglets. Mandat explicite "j'oublie tout l'existant [...] copie
// conforme", identique aux LOTs V3.16/V3.17. Page "use client" —
// vérifiée par lecture de source.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/app/app/etat/situations/page.tsx");

// TEST 1 — les 2 panneaux (funnel + ancienneté) et le maître-détail
// 392px sur les situations remplacent bien la liste de signaux + panneau
// latéral "provenance" de la version précédente.
test("TEST 1 — la structure de la maquette (funnel/ancienneté + maître-détail sur les situations) est en place", () => {
  assert.ok(source.includes("De l’information reçue à la preuve"));
  assert.ok(source.includes("Ancienneté des situations ouvertes"));
  assert.ok(source.includes("lg:grid-cols-[392px_1fr]"));
  assert.ok(source.includes("filteredSituations.map((situation)"), "la liste maître doit itérer sur des situations, pas des signaux");
});

// TEST 2 — les 4 onglets du détail (structure maquette) sont présents.
test("TEST 2 — les 4 onglets du détail de situation sont présents", () => {
  for (const label of ["Ce que nous savons", "Chronologie", "Sources", "Ce que vous décidez"]) {
    assert.ok(source.includes(label), `onglet "${label}" absent`);
  }
});

// TEST 3 — l'onglet "Ce que vous décidez" n'expose toujours que des
// actions réelles, jamais les options pro/con en texte libre du
// prototype (même arbitrage qu'Arbitrages, LOT P2.DESIGN-1B §11).
test("TEST 3 — l'onglet décision n'expose que des actions réelles, jamais d'options fabriquées", () => {
  assert.ok(source.includes("Planifier une visite terrain"));
  assert.ok(source.includes("Arbitrer cette situation"));
  assert.ok(!source.includes("sitOptions"));
});

// TEST 4 — l'onglet Chronologie réutilise le VRAI historique
// (Situation.history), jamais une timeline fabriquée pour l'occasion.
test("TEST 4 — la chronologie provient réellement de Situation.history", () => {
  assert.ok(source.includes("selected.history.map((entry"));
});
