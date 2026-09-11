import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";

// LOT V3.19 ("Programmes — copie conforme du rendu maquette") —
// reconstruction complète sur le plan exact de l'écran `isPortfolio` :
// waterfall budgétaire, cartographie + jalons/couverture territoriale,
// tableau des programmes (6 colonnes) au lieu des cartes empilées de la
// version précédente. Mandat explicite "j'oublie tout l'existant [...]
// copie conforme", identique aux LOTs V3.16-V3.18. Page "use client" —
// vérifiée par lecture de source.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const source = readSource("../src/app/app/etat/programmes/page.tsx");
const state = createDemoState();

// TEST 1 — le hero photo + bandeau "5 étapes méthodologiques" (absents
// de la maquette) ont bien disparu, remplacés par le tableau à 6
// colonnes de la maquette.
test("TEST 1 — le hero photo et le bandeau méthodologique ont disparu, remplacés par le tableau maquette", () => {
  assert.ok(!source.includes("etat-programmes-hero.webp"));
  assert.ok(!source.includes("chainSteps"));
  for (const column of ["Programme", "Phase", "Avancement", "Budget confirmé", "Calendrier", "Signaux terrain"]) {
    assert.ok(source.includes(column), `colonne "${column}" absente du tableau`);
  }
});

// TEST 2 — "Jalons des 60 prochains jours" (mandat, non fabriqué) :
// dérivé des VRAIES échéances de situation (Situation.dueAt), jamais
// d'un champ Initiative.milestones qui n'existe pas dans le Core (LOT
// V3.5, "DO NOT add Initiative.milestones yet" — toujours vrai).
test("TEST 2 — les échéances affichées proviennent réellement de Situation.dueAt, jamais d'un champ programme fabriqué", () => {
  assert.ok(source.includes("situation.dueAt"));
  assert.ok(!source.includes("initiative.milestones"), "Initiative.milestones n'existe toujours pas dans le Core — ne doit jamais être référencé");
  for (const programme of state.initiatives) {
    assert.ok(!("milestones" in programme), "Initiative.milestones ne doit toujours pas exister sur le modèle réel");
  }
});

// TEST 3 — ProgrammePortfolioScatter et ProgrammeCockpit (LOT V3.5,
// réels et déjà testés) restent réellement réutilisés, jamais réécrits
// en double pour cet écran.
test("TEST 3 — le scatter et le cockpit restent les mêmes composants partagés qu'au LOT V3.5", () => {
  assert.ok(source.includes('from "@/components/programmes/ProgrammePortfolioScatter"'));
  assert.ok(source.includes('from "@/components/programmes/ProgrammeCockpit"'));
  assert.ok(source.includes("canAct={false}"), "l'Espace État reste en lecture seule sur le dossier programme (mandat §21)");
});

// TEST 4 — les 2 pièges CSS déjà rencontrés (min-width:auto sur un
// enfant flex/grid) restent corrigés.
test("TEST 4 — les correctifs contre le débordement horizontal (1024/768px) restent en place", () => {
  assert.ok(source.includes("lg:flex-row lg:items-end lg:justify-between"), "le bandeau titre/stats doit rester empilé jusqu'à 1024px (4 tuiles ne tiennent pas à côté du titre dès 640px)");
  assert.ok(source.includes('className="shadcn-scope min-w-0 border"'), "le panneau scatter doit rester min-w-0 (sinon le contenu du panneau de droite pousse toute la page en largeur)");
});
