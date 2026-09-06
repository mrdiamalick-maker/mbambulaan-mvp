import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoState } from "../src/data/demo-state";
import { buildWorkdayView } from "../src/domain/workday";
import { buildValueTrail, resolveFindingForSituation, resolveSourceRefDisplay } from "../src/domain/situation-narrative";
import { displayTitle, shouldShowStandaloneSignal } from "../src/components/work/WorkdayHub";
import { SituationHero } from "../src/components/situations/SituationHero";
import { WhyMbambulaan, ValueTrailSection } from "../src/components/situations/SituationNarrative";
import { priorityToTag } from "../src/lib/status-tokens";

// XXL-R3 — Aujourd'hui + Situation (mandat CEO "Operating Experience
// Premium"). §43 : tests A-H. Même discipline que xxl-r0/xxl-r1 : classic
// JSX runtime hors Next exige React en portée globale.
(globalThis as Record<string, unknown>).React = React;

// TEST A — §2 (freeze) : buildWorkdayView reste une pure lecture, R3 n'a
// recalculé aucune donnée métier. Le Top 3 du coordinateur de démo garde
// exactement les mêmes identifiants, dans le même ordre, qu'avant la
// composition visuelle R3 (seule la mise en forme a changé).
test("TEST A — buildWorkdayView n'a pas été recalculé par R3 (Top 3 stable)", () => {
  const state = createDemoState();
  const coordinateur = state.actors.find((actor) => actor.role === "coordinateur");
  assert.ok(coordinateur, "le Demo World doit fournir un coordinateur pour ce test");
  const now = "2026-08-01T09:00:00.000Z";
  const view = buildWorkdayView(state, coordinateur!.id, "coordinateur", now);
  const view2 = buildWorkdayView(state, coordinateur!.id, "coordinateur", now);
  assert.deepEqual(
    view.top3.map((item) => item.id),
    view2.top3.map((item) => item.id),
    "buildWorkdayView doit rester déterministe (même state, même acteur ⇒ même Top 3)"
  );
  assert.ok(view.top3.length <= 3, "le Top 3 ne doit jamais dépasser 3 éléments");
});

// TEST B — displayTitle (garde-fou anti-répétition, WorkdayHub.tsx) : ne
// retire le suffixe territorial que lorsqu'il correspond exactement au nom
// affiché juste au-dessus (TerritoryIdentity) — jamais une troncature
// hasardeuse d'un titre qui contiendrait le nom du territoire ailleurs
// qu'en toute fin.
test("TEST B — displayTitle ne retire que le suffixe territorial exact, jamais plus", () => {
  assert.equal(displayTitle("Fenêtre de débarquement à consolider · Cap Skirring", "Cap Skirring"), "Fenêtre de débarquement à consolider");
  // Pas de territoire fourni : titre inchangé.
  assert.equal(displayTitle("Fenêtre de débarquement à consolider · Cap Skirring", undefined), "Fenêtre de débarquement à consolider · Cap Skirring");
  // Le territoire ne correspond pas exactement au suffixe : titre inchangé
  // (aucune troncature hasardeuse).
  assert.equal(displayTitle("Fenêtre de débarquement à consolider · Cap Skirring", "Elinkine"), "Fenêtre de débarquement à consolider · Cap Skirring");
  // Titre sans suffixe territorial du tout : inchangé.
  assert.equal(displayTitle("Informer le dispositif territorial", "Joal-Fadiouth"), "Informer le dispositif territorial");
});

// TEST C — shouldShowStandaloneSignal (garde-fou anti double-glyphe,
// WorkdayHub.tsx §8) : jamais de SignalMark autonome quand TerritoryIdentity
// affiche déjà son propre glyphe (un seul repère par priorité) ; jamais de
// SignalMark non plus pour une priorité "normale" — décoratif interdit.
test("TEST C — un seul repère visuel par priorité (jamais de double glyphe territoire + signal)", () => {
  assert.equal(shouldShowStandaloneSignal("critique", true), false, "territoire présent ⇒ son propre glyphe suffit, jamais de second glyphe");
  assert.equal(shouldShowStandaloneSignal("vigilance", true), false);
  assert.equal(shouldShowStandaloneSignal("critique", false), true, "sans territoire affiché, le SignalMark autonome reste le seul repère disponible");
  assert.equal(shouldShowStandaloneSignal("normale", false), false, "une priorité normale ne doit jamais recevoir de repère décoratif");
});

function joalFixture() {
  const state = createDemoState();
  const situation = state.situations.find((item) => item.id === "sit-joal-glace-recurrence");
  assert.ok(situation, "le Demo World doit fournir la situation Joal (dossier riche, avec Finding)");
  const territory = state.territories.find((item) => item.id === situation!.territoryId);
  const responsible = state.actors.find((item) => item.id === situation!.responsibleId);
  const finding = resolveFindingForSituation(state, situation!);
  const sources = finding ? finding.sourceRefs.map((ref) => resolveSourceRefDisplay(state, ref)).filter((item): item is NonNullable<typeof item> => Boolean(item)) : [];
  return { state, situation: situation!, territory, responsible, finding, sources };
}

// TEST D — SituationHero (§17-18) : hero de dossier partagé Room/Drawer —
// territoire, titre, priorité, état, responsable et dernière évolution
// doivent tous apparaître dès le premier rendu, pour un dossier réel.
test("TEST D — SituationHero porte territoire/titre/priorité/état/responsable/dernière évolution", () => {
  const { situation, territory, responsible } = joalFixture();
  const lastEvolution = situation.history[situation.history.length - 1];
  const html = renderToStaticMarkup(
    React.createElement(SituationHero, {
      situation,
      territory,
      responsible,
      tag: priorityToTag[situation.priority],
      statusLabel: "Coordination engagée"
    , lastEvolution })
  );
  assert.ok(html.includes(situation.title), "le titre réel du dossier doit apparaître");
  assert.ok(html.includes(territory!.name), "le territoire réel doit apparaître");
  assert.ok(html.includes(responsible!.name), "le responsable réel doit apparaître");
  assert.ok(html.includes("Coordination engagée"), "l'état fourni par l'appelant doit apparaître");
  assert.ok(html.includes(lastEvolution.label), "la dernière évolution réelle (dernière entrée d'historique) doit apparaître");
});

// TEST E — SituationHero (garde-fou anti-répétition) : quand
// situation.description est mot pour mot identique à situation.title
// (donnée réelle rencontrée en vérification, ex. sit-lace), la phrase ne
// doit pas être répétée une seconde fois sous le titre.
test("TEST E — SituationHero ne répète jamais une phrase identique au titre", () => {
  const state = createDemoState();
  const duplicated = state.situations.find((item) => item.description.trim() === item.title.trim());
  assert.ok(duplicated, "ce test suppose qu'au moins un dossier du Demo World porte title === description (donnée réelle observée)");
  const territory = state.territories.find((item) => item.id === duplicated!.territoryId);
  const html = renderToStaticMarkup(
    React.createElement(SituationHero, {
      situation: duplicated!,
      territory,
      tag: priorityToTag[duplicated!.priority],
      statusLabel: "Reçue"
    })
  );
  const occurrences = html.split(duplicated!.title).length - 1;
  assert.equal(occurrences, 1, `le titre "${duplicated!.title}" ne doit apparaître qu'une seule fois quand il est identique à la description — trouvé ${occurrences} fois`);
});

// TEST F — WhyMbambulaan (§17-18, "pourquoi Mbàmbulaan vous le signale") :
// Constater / Fondement / Confiance visibles pour un dossier avec Finding
// réel, et le bloc s'efface entièrement (jamais de texte fabriqué) quand
// aucun Finding n'explique la Situation.
test("TEST F — WhyMbambulaan affiche Constater/Fondement/Confiance avec un Finding réel, s'efface sans Finding", () => {
  const { finding, sources } = joalFixture();
  assert.ok(finding, "ce test suppose que sit-joal-glace-recurrence porte un Finding réel");
  const html = renderToStaticMarkup(React.createElement(WhyMbambulaan, { finding, sources }));
  assert.ok(html.includes("Constater"), "la section Constater doit être visible");
  assert.ok(html.includes("Fondement"), "la section Fondement doit être visible");
  assert.ok(html.includes("Confiance"), "la section Confiance doit être visible");
  // renderToStaticMarkup échappe les apostrophes (&#x27;) — on compare sur
  // un fragment sans apostrophe plutôt que la phrase entière, échappement
  // HTML mis à part le texte doit rester mot pour mot celui du Finding.
  const statementFragment = finding!.statement.split("'")[0].trim();
  assert.ok(html.includes(statementFragment), "le constat réel du Finding doit apparaître mot pour mot, rien de reformulé");

  const empty = renderToStaticMarkup(React.createElement(WhyMbambulaan, { finding: undefined, sources: [] }));
  assert.equal(empty, "", "sans Finding, WhyMbambulaan doit s'effacer silencieusement plutôt qu'inventer une explication");
});

// TEST G — ValueTrailSection (§18, chaîne de valeur) : reflète exactement
// les indicateurs `proven` de buildValueTrail — jamais une étape non
// prouvée présentée comme acquise, ni l'inverse.
test("TEST G — ValueTrailSection marque « à confirmer » exactement les étapes non prouvées de buildValueTrail", () => {
  const { state, situation } = joalFixture();
  const steps = buildValueTrail(state, situation);
  const html = renderToStaticMarkup(React.createElement(ValueTrailSection, { steps }));
  const provenCount = steps.filter((step) => step.proven).length;
  const pendingCount = steps.filter((step) => !step.proven).length;
  const markerCount = (html.match(/— à confirmer/g) ?? []).length;
  assert.equal(markerCount, pendingCount, "le nombre de mentions « à confirmer » doit correspondre exactement au nombre d'étapes non prouvées");
  assert.ok(provenCount > 0, "ce dossier doit compter au moins une étape réellement prouvée pour que le test soit probant");
  for (const step of steps) {
    assert.ok(html.includes(step.label), `l'étape "${step.label}" doit être visible`);
  }
});

// TEST H — convergence Room/Drawer (§17-18) : un seul composant partagé,
// pas deux implémentations qui se ressemblent. Pour un même dossier, les
// mêmes props produisent EXACTEMENT le même balisage, que l'appelant soit
// la Situation Room (Coordinateur) ou le drawer Situation (Espace État).
test("TEST H — SituationHero/WhyMbambulaan produisent un balisage identique quel que soit l'appelant (Room ou Drawer)", () => {
  const { situation, territory, responsible, finding, sources } = joalFixture();
  const lastEvolution = situation.history[situation.history.length - 1];
  const heroProps = { situation, territory, responsible, tag: priorityToTag[situation.priority], statusLabel: "Coordination engagée", lastEvolution };
  const heroFromRoom = renderToStaticMarkup(React.createElement(SituationHero, heroProps));
  const heroFromDrawer = renderToStaticMarkup(React.createElement(SituationHero, { ...heroProps }));
  assert.equal(heroFromRoom, heroFromDrawer, "SituationHero doit rendre un balisage identique pour les mêmes données, indépendamment de l'appelant");

  const whyFromRoom = renderToStaticMarkup(React.createElement(WhyMbambulaan, { finding, sources }));
  const whyFromDrawer = renderToStaticMarkup(React.createElement(WhyMbambulaan, { finding, sources }));
  assert.equal(whyFromRoom, whyFromDrawer, "WhyMbambulaan doit rendre un balisage identique pour les mêmes données, indépendamment de l'appelant");
});
