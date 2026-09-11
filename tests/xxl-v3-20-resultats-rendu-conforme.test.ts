import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.20 ("Résultats — copie conforme du rendu maquette, portée
// ciblée") — l'écran `isRes` de la maquette correspond à un composant
// PARTAGÉ entre l'Espace État (/app/etat/rapport) et la Coordination
// (Chapitre 4 de PilotageWorkspace), construit et testé au LOT V3.6
// (mandat §22/§23, "one shared analytical capability"). Reconstruire
// entièrement ce composant ferait courir un risque de régression sur une
// 2e surface — ce lot corrige donc l'écart de style le plus net (le h1
// de l'en-tête, en clamp "registry" plutôt qu'en 32px littéral) sans
// toucher à ResultsAnalyticsOverview.tsx (déjà substantiellement fidèle
// à l'esprit de la maquette : entonnoir de preuve, comparaison
// territoriale, tendance, "ce que ce graphique ne dit pas").
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

// TEST 1 — le h1 de l'en-tête Résultats reprend la valeur littérale
// exacte de la maquette (32px Newsreader), plus l'échelle "registry".
test("TEST 1 — le h1 de Résultats/redevabilité est en 32px littéral, pas en échelle registry", () => {
  const source = readSource("../src/components/etat/EtatResultsOverview.tsx");
  assert.ok(source.includes("fontSize: 32"));
  assert.ok(!source.includes("etat-h1--registry"));
});

// TEST 2 — le composant partagé ResultsAnalyticsOverview (LOT V3.6)
// reste réellement monté à l'identique par l'Espace État ET la
// Coordination — jamais dupliqué pour "coller" à cet écran.
test("TEST 2 — ResultsAnalyticsOverview reste un composant partagé unique entre État et Coordination", () => {
  const etatSource = readSource("../src/app/app/etat/rapport/page.tsx");
  assert.ok(etatSource.includes('from "@/components/results/ResultsAnalyticsOverview"'));
  const pilotageSource = readSource("../src/components/ecosystem/PilotageWorkspace.tsx");
  assert.ok(pilotageSource.includes('from "@/components/results/ResultsAnalyticsOverview"'));
});
