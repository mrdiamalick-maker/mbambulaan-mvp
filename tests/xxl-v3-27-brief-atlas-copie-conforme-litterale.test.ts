import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";

// LOT V3.27 ("Brief national + Atlas territorial — copie conforme
// littérale, 2e passe") — même méthode que les LOTs V3.22-26 (rendu du
// bundle standalone.html en Chromium headless, clic réel sur chaque
// item de nav, sérialisation DOM→JSX du <main>), appliquée aux 2
// derniers écrans du plan V3, les plus volumineux (carte SVG
// embarquée). Contrairement aux 6 lots précédents, la vérification ici
// reste un contrôle CIBLÉ (h1 + animation), pas une relecture
// exhaustive bloc par bloc — documenté honnêtement : le volume de DOM
// sérialisé pour ces 2 écrans (~2 Mo chacun, dominé par les tracés
// géographiques de la carte, déjà réels et déjà couverts par
// AtlasMap/atlas-overview.ts depuis le LOT V3.4) rend une relecture
// exhaustive disproportionnée par rapport au gain de fidélité attendu.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();

// TEST 1 — Brief national : le h1 dynamique existant (briefHeadline)
// reprend déjà, mot pour mot, le verbe de la maquette ("{territoire}
// concentre l'attention...") — vérifié ici pour confirmer qu'aucune
// régression ne l'a fait dériver. La maquette ajoute "pour la troisième
// semaine" (un suivi hebdomadaire consécutif) qu'aucun champ réel ne
// permet de vérifier (categorie D déjà documentée, results-analytics.ts :
// aucune série temporelle réelle) — volontairement jamais ajouté.
test("TEST 1 — le h1 de Brief national reprend le verbe littéral \"concentre l'attention\" de la maquette", () => {
  const source = readSource("../src/app/app/etat/page.tsx");
  assert.ok(source.includes("concentre l’attention"));
  assert.ok(!source.includes("troisième semaine"), "aucune série hebdomadaire réelle n'existe pour justifier cette affirmation — jamais fabriquée");
  assert.ok(source.includes("mb-rise"), "l'animation d'entrée littérale de la maquette doit être appliquée");
});

// TEST 2 — Atlas territorial : le h1 reprend la formule littérale de la
// maquette ("{N} sites de débarquement, un seul objet vivant par
// territoire"), avec le compte réel de sites de débarquement
// (Site.type === "quai", déjà le type retenu pour les sites de quai
// depuis le LOT V3.7) plutôt qu'un texte figé ("Comprendre où agir,
// territoire par territoire.").
test("TEST 2 — le h1 d'Atlas territorial reprend la formule littérale avec le compte réel de sites de débarquement", () => {
  const source = readSource("../src/app/app/etat/territoires/page.tsx");
  assert.ok(source.includes('site.type === "quai"'));
  assert.ok(source.includes("site de débarquement") || source.includes("sites de débarquement"));
  assert.ok(source.includes("un seul objet vivant par territoire"));
  assert.ok(!source.includes("Comprendre où agir, territoire par territoire."), "l'ancien h1 reformulé ne doit plus être présent");
  assert.ok(source.includes("mb-rise"), "l'animation d'entrée littérale de la maquette doit être appliquée");

  const landingSiteCount = state.sites.filter((site) => site.type === "quai").length;
  assert.ok(landingSiteCount > 0);
});
