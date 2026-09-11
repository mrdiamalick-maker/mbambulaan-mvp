import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// LOT V3.17 ("Atlas territorial — copie conforme du rendu maquette") —
// reconstruction complète sur le plan exact de l'écran `isAtlas` (2
// colonnes : carte plein cadre + dossier à onglets), mandat explicite
// "j'oublie tout l'existant [...] copie conforme". Page "use client" —
// vérifiée par lecture de source, même contrainte que le reste du
// chrome/pages privées depuis le LOT V3.1.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/app/app/etat/territoires/page.tsx");

// TEST 1 — la composition à 3 colonnes (registre/carte/dossier) de
// l'ancienne version a bien disparu au profit des 2 colonnes exactes de
// la maquette.
test("TEST 1 — la composition 3 colonnes précédente a été remplacée par les 2 colonnes de la maquette", () => {
  assert.ok(!source.includes("Filtrer les territoires…"), "le registre de recherche/liste à gauche (absent de la maquette) doit avoir disparu");
  assert.ok(source.includes("lg:grid-cols-[1fr_424px]"), "la grille 2 colonnes exacte de la maquette (1fr / 424px) doit être présente");
});

// TEST 2 — les 5 onglets du dossier territorial (structure maquette)
// sont bien présents.
test("TEST 2 — les 5 onglets du dossier territorial sont présents", () => {
  for (const label of ["Activité", "Capacités", "Acteurs", "Situations", "Programmes"]) {
    assert.ok(source.includes(`"${label}"`) || source.includes(`>${label}<`) || source.includes(label), `onglet "${label}" absent`);
  }
});

// TEST 3 — la bande littorale (national, tous les sites réels) reste
// distincte du dossier du territoire sélectionné, jamais scopée à lui.
test("TEST 3 — la bande littorale porte tous les sites réels, pas seulement ceux du territoire sélectionné", () => {
  assert.ok(source.includes("state.sites.map((site)"));
});

// TEST 4 — les deux pièges CSS Grid/Flex "min-width:auto" trouvés en QA
// réelle (bande littorale + rangée d'onglets, débordement horizontal
// massif puis résiduel) restent corrigés.
test("TEST 4 — les correctifs min-w-0/overflow-x-auto contre le débordement horizontal restent en place", () => {
  assert.ok(source.includes('className="relative min-w-0"'), "la colonne carte doit rester min-w-0 (sinon la bande littorale fait déborder toute la page)");
  assert.ok(source.includes("min-w-0 gap-0 overflow-x-auto border-b px-2"), "la rangée d'onglets doit rester scrollable plutôt que déborder");
});
