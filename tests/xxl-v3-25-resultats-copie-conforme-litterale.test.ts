import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";

// LOT V3.25 ("Résultats — copie conforme littérale, 2e passe") — même
// méthode que les LOTs V3.22-24 (rendu du bundle standalone.html en
// Chromium headless, clic réel sur "Résultats", sérialisation DOM→JSX du
// <main>) appliquée à EtatResultsOverview.tsx.
//
// La maquette affirme "Six indicateurs suivis, deux d'entre eux n'ont
// pas assez de données pour conclure" — un chiffre de fixture ("six
// indicateurs nationaux") sans aucun équivalent dans ce Core :
// results-analytics.ts documente déjà, dans son en-tête, qu'aucun
// registre de ce type n'existe (1 Result, 1 Outcome, 0 ImpactEvidence
// dans ce Demo World). Le recopier tel quel aurait fabriqué un
// référentiel inexistant. Ce lot reprend la MÊME forme rhétorique
// ("N suivis, M sans preuve suffisante") appliquée aux 3 vrais registres
// déjà affichés plus bas sur cette page (Résultat/Changement/Impact).
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/components/etat/EtatResultsOverview.tsx");
const state = createDemoState();

test("TEST 1 — le h1 de Résultats reprend la forme rhétorique littérale (\"N suivis, M sans preuve suffisante\") avec des comptes réels", () => {
  assert.ok(source.includes("registres suivis"));
  assert.ok(source.includes("pas assez de données pour conclure"));
  assert.ok(source.includes("state.results.length, state.outcomes.length, state.impactEvidences.length"));
  assert.ok(!source.includes("Six indicateurs suivis"), "le chiffre fixe \"six indicateurs\" de la fixture ne doit jamais être codé en dur");

  // Vérifie que le calcul honnête produit bien le sens attendu sur le
  // Demo World actuel (1 Result, 1 Outcome, 0 ImpactEvidence → 1 registre
  // sur 3 sans donnée).
  const tracked = [state.results.length, state.outcomes.length, state.impactEvidences.length];
  const withoutData = tracked.filter((n) => n === 0).length;
  assert.equal(tracked.length, 3);
  assert.equal(withoutData, 1);
});

test("TEST 2 — l'animation d'entrée littérale de la maquette (mb-rise) est appliquée", () => {
  assert.ok(source.includes("mb-rise"));
});
