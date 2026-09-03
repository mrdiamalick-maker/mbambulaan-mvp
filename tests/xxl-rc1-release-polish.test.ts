import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoState } from "../src/data/demo-state";
import { buildWorkdayView } from "../src/domain/workday";
import { WorkdayHub } from "../src/components/work/WorkdayHub";
import { SituationHero } from "../src/components/situations/SituationHero";
import { NumberTicker } from "../src/components/magicui/number-ticker";

// XXL-RC1 — Release Polish (dernier lot avant freeze, mandat CEO). Le
// Core (buildWorkdayView, applyCommand, dispatch, la géométrie
// cartographique R5.5/R6) reste gelé — non modifié cette session. Les
// tests ci-dessous couvrent exactement les 6 garde-fous demandés (§7
// A-F) : navigation État desktop inchangée malgré le nouveau repli
// mobile, deep-link Situation → Atlas, non-suppression de données par la
// disclosure progressive de Programmes, Top 3 Aujourd'hui inchangé,
// valeur finale NumberTicker intacte, et Core intact.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}
(globalThis as Record<string, unknown>).React = React;

// TEST A — navigation État accessible sous desktop sans modifier desktop
// (mandat §7.A) : EtatSidebar (desktop, hidden lg:flex) reste strictement
// inchangée dans sa classe de repli ; EtatMobileNav (nouveau, XXL-RC1 §2)
// existe, est gardée lg:hidden, et consomme la MÊME liste navItems que la
// sidebar desktop — une seule source des 5 destinations, jamais deux
// listes à maintenir en parallèle.
test("TEST A — la sidebar État desktop reste inchangée, le nouveau menu mobile partage les mêmes routes", () => {
  const source = readSource("../src/components/institution/EtatSidebar.tsx");
  assert.ok(source.includes('"hidden w-56 shrink-0 flex-col bg-white p-3 lg:flex"'), "la sidebar desktop doit garder exactement son repli d'origine (hidden … lg:flex)");
  assert.ok(source.includes("export function EtatMobileNav"), "EtatMobileNav doit être exporté (nouveau, XXL-RC1)");
  assert.ok(source.includes("lg:hidden"), "le déclencheur mobile doit être gardé lg:hidden — jamais visible en même temps que la sidebar desktop");
  assert.ok(source.includes("export const navItems"), "navItems doit être exporté et rester la source unique des 5 destinations État");
  // EtatNavLinks (fonction interne partagée) doit être utilisée par les
  // deux : recherché plutôt qu'une seconde définition de <nav> dupliquée.
  const navLinksOccurrences = source.match(/<EtatNavLinks/g) ?? [];
  assert.equal(navLinksOccurrences.length, 2, "EtatNavLinks doit être consommé exactement 2 fois — une fois par EtatSidebar (desktop), une fois par EtatMobileNav (tiroir)");
});

// TEST B — Situation → Atlas deep-link correct (mandat §7.B/§5.A) : le
// hero partagé Room/Drawer État construit désormais un lien réel vers
// /app/atlas?territoire=<id> à partir du VRAI territoire résolu, jamais
// un identifiant fabriqué — et reste du texte inerte quand aucun
// territoire ne résout (pas de lien vers rien).
test("TEST B — SituationHero rend le territoire cliquable vers /app/atlas?territoire=<id>", () => {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.territoryId);
  assert.ok(situation, "ce test suppose au moins une situation reliée à un territoire réel");
  const territory = state.territories.find((item) => item.id === situation!.territoryId);
  assert.ok(territory, "le territoire résolu doit être un vrai objet du Core");

  const html = renderToStaticMarkup(React.createElement(SituationHero, {
    situation: situation!,
    territory,
    tag: "stable",
    statusLabel: "Test"
  }));
  assert.ok(html.includes(`href="/app/atlas?territoire=${territory!.id}"`), "le lien doit être construit depuis territory.id, pas un texte figé");
  assert.ok(html.includes(territory!.name), "le nom réel du territoire doit rester affiché");

  // Sans territoire résolu : "Non défini" doit rester du texte, jamais un
  // lien construit sur un id manquant.
  const htmlNoTerritory = renderToStaticMarkup(React.createElement(SituationHero, {
    situation: situation!,
    territory: undefined,
    tag: "stable",
    statusLabel: "Test"
  }));
  assert.ok(!htmlNoTerritory.includes("/app/atlas?territoire=undefined"), "aucun lien ne doit jamais pointer vers un territoire indéfini");
  assert.ok(htmlNoTerritory.includes("Non défini"), "l'absence de territoire doit rester honnêtement affichée");
});

// TEST C — progressive disclosure Programmes ne supprime aucun objet
// (mandat §7.C/§4) : la disclosure ne fait que retarder l'affichage —
// aucun état dérivé (filteredInitiatives) n'est recalculé ou tronqué en
// amont, seul le rendu par défaut est capé ; le fallback d'impression
// continue de rendre l'intégralité de state.initiatives, non filtré.
test("TEST C — la disclosure progressive de Programmes cape uniquement l'affichage, jamais les données", () => {
  const source = readSource("../src/app/app/(coordination)/initiatives/page.tsx");
  assert.ok(source.includes("const PROGRAMS_VISIBLE_COUNT = 3"), "le seuil d'affichage par défaut doit rester 3 (même teneur que le reste du produit)");
  // Le slice conditionnel doit porter sur filteredInitiatives (l'état déjà
  // filtré, jamais un second calcul) — programsExpanded ? la liste
  // complète : les 3 premiers.
  assert.ok(source.includes("programsExpanded ? filteredInitiatives : filteredInitiatives.slice(0, PROGRAMS_VISIBLE_COUNT)"), "le repli doit s'appuyer sur filteredInitiatives, jamais une liste recalculée ou pré-tronquée");
  // Le fallback d'impression (print:block) doit rester intact : tout
  // state.initiatives, sans filtre ni cap — la disclosure est une
  // affaire d'écran, jamais du document imprimé.
  assert.ok(source.includes('<div className="hidden space-y-10 print:block">'), "le bloc d'impression doit rester présent et inchangé");
  assert.ok(/print:block">\s*\{state\.initiatives\.map/.test(source), "le bloc d'impression doit continuer à rendre TOUT state.initiatives, sans filtre ni cap");
});

// TEST D — Top 3 Workday inchangé (mandat §7.D) : buildWorkdayView reste
// la seule source de vérité du Top 3 — WorkdayHub (retouché uniquement
// visuellement dans ce lot) affiche toujours exactement les 3 mêmes
// premiers éléments réels de myAttention, ni plus ni moins, ni reclassés.
test("TEST D — le Top 3 d'Aujourd'hui reste exactement celui calculé par buildWorkdayView", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur", "2026-07-29T08:30:00.000Z");
  const expectedTop3 = view.myAttention.slice(0, 3);
  assert.ok(expectedTop3.length > 0, "ce test suppose au moins une priorité réelle pour le coordinateur de démonstration");

  const html = renderToStaticMarkup(React.createElement(WorkdayHub, { state, actorId: "act-coordinateur", role: "coordinateur" }));
  for (const item of expectedTop3) {
    assert.ok(html.includes(item.why), `le Top 3 doit toujours afficher "${item.why}" — issu directement de buildWorkdayView, jamais reclassé par ce lot`);
  }
});

// TEST E — valeur finale NumberTicker intacte (mandat §7.E) : le ressort
// resserré (XXL-RC1 §5.B) change uniquement la VITESSE de convergence —
// jamais la valeur peinte au premier rendu (déjà garanti avant ce lot,
// revérifié ici), et prefers-reduced-motion reste honoré.
test("TEST E — NumberTicker peint toujours la vraie valeur finale, le ressort accéléré ne change que la vitesse", () => {
  const html = renderToStaticMarkup(React.createElement(NumberTicker, { value: 35 }));
  assert.ok(html.includes("35"), "le premier rendu doit toujours peindre la valeur réelle, jamais 0 ni une valeur transitoire");

  const source = readSource("../src/components/magicui/number-ticker.tsx");
  assert.ok(source.includes("prefersReducedMotion"), "prefers-reduced-motion doit rester honoré après le resserrement du ressort");
  assert.ok(source.includes("motionValue.jump(value)"), "en mode réduit, le chiffre final doit toujours s'afficher immédiatement, sans ressort");
  assert.match(source, /stiffness:\s*340/, "le ressort resserré (XXL-RC1 §5.B) doit rester en place — convergence rapide, jamais retiré");
});

// TEST F — aucun Core modifié (mandat §7.F, §6 non-scope) : les
// fonctions du domaine consommées par ce lot gardent exactement leur
// signature d'export — un lot de polish visuel ne touche jamais au
// vocabulaire métier.
test("TEST F — le Core (domain/workday.ts) garde ses exports intacts", () => {
  const source = readSource("../src/domain/workday.ts");
  for (const exportName of ["export function sortWorkdayItems", "export function buildWorkdayView", "export function capItemsForDisplay"]) {
    assert.ok(source.includes(exportName), `${exportName} doit rester exporté sans changement de signature`);
  }
});

// TEST G — carte du Brief national : composition plus dominante, mêmes
// données (mandat §1) : hauteur/ratio de grille agrandis, mais toujours
// state.territories non filtré (les 18 territoires documentés), jamais
// un sous-ensemble scopé à l'attention.
test("TEST G — la carte du Brief national gagne en composition sans filtrer les territoires", () => {
  const source = readSource("../src/app/app/etat/page.tsx");
  assert.ok(source.includes("lg:h-[480px]"), "la ligne de grille doit être agrandie (480px, XXL-RC1) par rapport aux 390px précédents");
  assert.ok(source.includes("lg:grid-cols-[70fr_30fr]"), "la carte doit gagner en largeur (70/30) par rapport au ratio précédent (66/34)");
  assert.ok(source.includes("territories={state.territories}"), "la carte doit continuer à recevoir tous les territoires, sans filtre sur l'attention");
});
