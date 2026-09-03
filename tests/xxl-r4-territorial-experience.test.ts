import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoState } from "../src/data/demo-state";
import { buildTerritoryIntelligence, currentTerritoryView } from "../src/domain/territory-intelligence";
import { territoryMapPositions } from "../src/domain/territory-map-positions";
import { publicTerritories } from "../src/data/public-atlas";
import { TerritoryDossierSections } from "../src/components/territories/TerritoryDossierSections";

// XXL-R4 — Atlas + Territoire (mandat CEO "Territorial Experience
// Premium"). §44 : tests A-H. Le moteur (buildTerritoryIntelligence/
// currentTerritoryView, domain/territory-intelligence.ts) reste gelé
// (§2) — non modifié cette session, déjà couvert par
// tests/territory-intelligence.test.ts ; les tests ci-dessous portent sur
// ce que R4 a réellement changé : la carte (CoastlineTerritoryMap), le
// dossier partagé restructuré (TerritoryDossierSections, section
// Écosystème), et la séparation Public/Pro. Même discipline que xxl-r3 :
// classic JSX runtime hors Next exige React en portée globale.
(globalThis as Record<string, unknown>).React = React;

// TEST A — projection territoriale inchangée : chaque territoire réel du
// Demo World a une position calibrée dans CoastlineTerritoryMap (aucun
// marqueur ne retombe silencieusement sur un repli [0,0]/absent).
test("TEST A — les 18 territoires réels ont tous une position calibrée sur la carte (CoastlineTerritoryMap)", () => {
  const state = createDemoState();
  assert.ok(state.territories.length >= 18, "le Demo World doit fournir au moins 18 territoires pour ce test");
  for (const territory of state.territories) {
    assert.ok(territoryMapPositions[territory.id], `${territory.id} (${territory.name}) n'a pas de position calibrée — le marqueur serait invisible sur la carte`);
  }
});

// TEST B — current-only inchangé : currentTerritoryView ne présente
// jamais comme actif un objet réglé/rejeté/remplacé, quel que soit le
// territoire — même garde-fou que le LOT 5 d'origine, revérifié après
// R4 puisque le résumé "Aujourd'hui" de l'aside Atlas et de
// TerritoryDossierSections en dépendent tous les deux directement.
test("TEST B — currentTerritoryView ne présente jamais un objet historique comme actif, pour aucun territoire", () => {
  const state = createDemoState();
  for (const territory of state.territories) {
    const intelligence = buildTerritoryIntelligence(state, territory.id);
    assert.ok(intelligence);
    const current = currentTerritoryView(intelligence!);
    assert.ok(current.situations.every((item) => item.status !== "reglee"), `${territory.id} : une situation réglée apparaît comme active`);
    assert.ok(current.findings.every((item) => item.status !== "rejected" && item.status !== "superseded"), `${territory.id} : un finding rejeté/remplacé apparaît comme actif`);
  }
});

function joalFixtureIntelligence() {
  const state = createDemoState();
  const intelligence = buildTerritoryIntelligence(state, "joal");
  assert.ok(intelligence, "le Demo World doit fournir le territoire joal (dossier riche) pour ces tests");
  return intelligence!;
}

// TEST C — historique conservé : le dossier affiche toujours la dernière
// évolution d'une situation (lastHistory), même après la réorganisation
// des sections R4.
test("TEST C — TerritoryDossierSections affiche la dernière évolution d'une situation (historique conservé)", () => {
  const intelligence = joalFixtureIntelligence();
  const situationWithHistory = intelligence.situations.find((item) => item.history.length > 0);
  assert.ok(situationWithHistory, "ce test suppose au moins une situation avec historique sur joal");
  const html = renderToStaticMarkup(React.createElement(TerritoryDossierSections, { intelligence, tone: "atlas" }));
  assert.ok(html.includes("Dernière évolution"), "la mention « Dernière évolution » doit rester visible");
  const lastEntry = situationWithHistory!.history[situationWithHistory!.history.length - 1];
  const labelFragment = lastEntry.label.split("'")[0].trim();
  assert.ok(html.includes(labelFragment), "le libellé réel de la dernière entrée d'historique doit apparaître");
});

// TEST D — Situation links corrects : chaque situation listée dans "Ce
// qui se passe" pointe vers son vrai dossier /app/situations/<id>,
// inchangé par la réorganisation des sections.
test("TEST D — les liens de situation du dossier territorial pointent vers le bon /app/situations/<id>", () => {
  const intelligence = joalFixtureIntelligence();
  const html = renderToStaticMarkup(React.createElement(TerritoryDossierSections, { intelligence, tone: "atlas" }));
  for (const situation of intelligence.situations.slice(0, 4)) {
    assert.ok(html.includes(`/app/situations/${situation.id}`), `lien manquant vers /app/situations/${situation.id}`);
  }
});

// TEST E — programmes corrects : le bloc "Développement" de "Ce qui est
// en cours" reste distinct de "Coordination"/"Terrain" (jamais fondus en
// un seul "Projets", mandat §12 LOT 5, revérifié après réordonnancement
// R4) et pointe vers /app/initiatives.
test("TEST E — Développement (programmes) reste une catégorie distincte avec son propre lien /app/initiatives", () => {
  const intelligence = joalFixtureIntelligence();
  const hasDevelopment = intelligence.programOpportunities.length > 0 || intelligence.initiatives.some((item) => item.status !== "terminee");
  assert.ok(hasDevelopment, "ce test suppose au moins un programme/opportunité en cours sur joal");
  const html = renderToStaticMarkup(React.createElement(TerritoryDossierSections, { intelligence, tone: "atlas" }));
  assert.ok(html.includes("Développement"), "la catégorie « Développement » doit rester visible et distincte");
  assert.ok(html.includes("/app/initiatives"), "le lien vers les programmes (/app/initiatives) doit être présent");
});

// TEST F — capacités sans fausse disponibilité : la section Écosystème
// (nouvelle, R4) n'affiche jamais un texte de disponibilité "temps réel"
// ou "maintenant" — seulement le statut déclaré (operationnelle/fragile/
// indisponible) tel qu'enregistré, jamais une garantie instantanée
// (mandat §23/§36, LOT 7 déjà appliqué à ce champ ailleurs).
test("TEST F — Écosystème n'affiche jamais une fausse disponibilité temps réel pour les infrastructures", () => {
  const intelligence = joalFixtureIntelligence();
  assert.ok(intelligence.identity.infrastructures.length > 0, "ce test suppose au moins une infrastructure sur joal");
  const html = renderToStaticMarkup(React.createElement(TerritoryDossierSections, { intelligence, tone: "atlas" }));
  assert.ok(html.includes("Écosystème"), "la section Écosystème doit être présente");
  for (const infra of intelligence.identity.infrastructures) {
    assert.ok(html.includes(infra.name), `${infra.name} doit apparaître dans Écosystème`);
  }
  assert.ok(!/temps réel|en direct|disponible maintenant/i.test(html), "aucune mention de disponibilité temps réel ne doit apparaître — seul le statut déclaré est affiché");
});

// TEST G — Knowledge Gaps corrects : une connaissance manquante réelle
// (Finding type knowledge_gap) reste visible avec son explication,
// après le déplacement de la section "Écosystème" au-dessus d'elle.
test("TEST G — Ce que nous ne savons pas affiche les connaissances manquantes réelles", () => {
  const state = createDemoState();
  const territoryWithGap = state.territories.find((territory) => {
    const intelligence = buildTerritoryIntelligence(state, territory.id);
    return intelligence && intelligence.knowledgeGaps.length > 0;
  });
  assert.ok(territoryWithGap, "ce test suppose au moins un territoire avec une connaissance manquante formalisée");
  const intelligence = buildTerritoryIntelligence(state, territoryWithGap!.id)!;
  const html = renderToStaticMarkup(React.createElement(TerritoryDossierSections, { intelligence, tone: "atlas" }));
  assert.ok(html.includes("Ce que nous ne savons pas"), "le titre de section doit rester présent");
  for (const gap of intelligence.knowledgeGaps) {
    assert.ok(html.includes(gap.title), `le titre du knowledge gap "${gap.title}" doit apparaître`);
  }
});

// TEST H — séparation public/pro intacte : l'Atlas public
// (data/public-atlas.ts) n'expose aucun champ opérationnel réservé au
// Pro (trust, situations, infrastructures, acteurs…) — Public comprend,
// Pro comprend + agit (§29), jamais la même profondeur d'information.
test("TEST H — les territoires publics n'exposent aucun champ opérationnel réservé au Pro", () => {
  const forbiddenKeys = ["trust", "situations", "signalIds", "infrastructures", "actors", "territoryId", "coordinations", "networkCapacities"];
  assert.ok(publicTerritories.length > 0, "publicTerritories ne doit pas être vide pour ce test");
  for (const territory of publicTerritories) {
    const keys = Object.keys(territory);
    for (const forbidden of forbiddenKeys) {
      assert.ok(!keys.includes(forbidden), `data/public-atlas.ts expose un champ opérationnel "${forbidden}" — fuite Pro → Public`);
    }
  }
});
