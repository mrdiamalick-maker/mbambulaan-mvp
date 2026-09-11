import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.26 ("Programmes — copie conforme littérale, 2e passe") — même
// méthode que les LOTs V3.22-25 : rendu du bundle standalone.html en
// Chromium headless, clic réel sur "Programmes", sérialisation DOM→JSX
// du <main> comme référence de correction.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/app/app/etat/programmes/page.tsx");

// TEST 1 — le h1 reprend la formule littérale de la maquette ("{N}
// programmes, {montant} FCFA identifiés, {pct} % confirmés"), à partir
// des MÊMES 3 chiffres réels que les tuiles de stat et le waterfall
// budgétaire de la page (state.initiatives.length, stats.totalBudgetFcfa,
// le compartiment "confirme" du waterfall) — jamais un texte figé
// ("Du besoin territorial à l'action documentée.").
test("TEST 1 — le h1 de Programmes reprend la formule littérale avec les mêmes chiffres réels que le reste de la page", () => {
  assert.ok(source.includes("frenchProgrammeCount(state.initiatives.length)"));
  assert.ok(source.includes("compactFcfa(stats.totalBudgetFcfa)"));
  assert.ok(source.includes("confirmedBudgetPct"));
  assert.ok(source.includes("identifiés"));
  assert.ok(source.includes("confirmés"));
  assert.ok(!source.includes("Du besoin territorial à l’action documentée."), "l'ancien h1 reformulé ne doit plus être présent");
});

// TEST 2 — compactFcfa produit le format littéral "N FCFA" (sans
// l'espace parasite "F CFA" que produit Intl avec style: "currency"/
// XOF), identique au rendu de la maquette.
test("TEST 2 — compactFcfa évite l'artefact \"F CFA\" et reprend le format littéral \"FCFA\"", () => {
  assert.ok(source.includes('`${compactNumber.format(amountFcfa)} FCFA`'));
});

// TEST 3 — animation d'entrée littérale de la maquette appliquée.
test("TEST 3 — l'animation d'entrée mb-rise est appliquée au conteneur de la page", () => {
  assert.ok(source.includes("mb-rise"));
});
