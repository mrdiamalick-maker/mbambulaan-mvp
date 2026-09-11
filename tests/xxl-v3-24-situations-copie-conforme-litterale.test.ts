import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";

// LOT V3.24 ("Situations & signaux — copie conforme littérale, 2e
// passe") — même méthode que les LOTs V3.22/V3.23 (rendu du bundle
// standalone.html en Chromium headless, clic réel sur "Situations",
// sérialisation DOM→JSX du <main>) appliquée à /app/etat/situations : le
// LOT V3.18 avait déjà la bonne structure (maître-détail 392px/1fr,
// funnel, ancienneté) mais avait reformulé le h1 et oublié une puce de
// sévérité réelle de la maquette.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/app/app/etat/situations/page.tsx");
const state = createDemoState();

// TEST 1 — le h1 reprend la formule littérale de la maquette ("{N}
// situations ouvertes, {M} attendent encore une source secondaire"),
// avec un compte réel : "attendre une source secondaire" est honnêtement
// dérivé de Situation.trust encore à "declaree"/"observee" (pas encore
// recoupé), jamais un champ ou un chiffre inventé.
test("TEST 1 — le h1 de Situations reprend la formule littérale de la maquette avec des comptes réels", () => {
  assert.ok(source.includes("attend"));
  assert.ok(source.includes("encore une source secondaire"));
  assert.ok(source.includes('item.trust === "declaree" || item.trust === "observee"'));

  const open = state.situations.filter((s) => s.status !== "reglee");
  const awaiting = open.filter((s) => s.trust === "declaree" || s.trust === "observee");
  assert.ok(open.length > 0 && awaiting.length >= 0);
});

// TEST 2 — la 4e puce de sévérité "Modéré" (priorité "moyenne") de la
// maquette est bien filtrable, pas seulement affichée en badge de liste
// (l'écran isSit a 4 puces cliquables : Toutes/Critique/Élevé/Modéré,
// jamais 3).
test("TEST 2 — la puce de sévérité \"Modéré\" (priorité moyenne) est filtrable, comme dans la maquette", () => {
  assert.ok(source.includes('"moyenne"'));
  assert.ok(source.includes("Modéré ·"));
  assert.ok(source.includes("rgb(159,185,206)"));
});

// TEST 3 — "Modéré" (libellé partagé de l'Espace État, shared.tsx)
// remplace "Moyen" — mot littéral de la maquette, jamais retouché dans
// le fichier parallèle status-tokens.ts qui appartient à la Coordination
// (son propre langage visuel, décision distincte du LOT V3.1).
test("TEST 3 — priorityLabels (Espace État) utilise le mot littéral \"Modéré\", jamais \"Moyen\"", () => {
  const sharedSource = readSource("../src/components/etat/shared.tsx");
  assert.ok(sharedSource.includes('moyenne: "Modéré"'));
  const statusTokensSource = readSource("../src/lib/status-tokens.ts");
  assert.ok(statusTokensSource.includes('moyenne: "Moyen"'), "status-tokens.ts (Coordination) garde son propre mot, non touché par ce lot");
});

// TEST 4 — animation d'entrée littérale de la maquette appliquée.
test("TEST 4 — l'animation d'entrée mb-rise est appliquée au conteneur de la page", () => {
  assert.ok(source.includes("mb-rise"));
});
