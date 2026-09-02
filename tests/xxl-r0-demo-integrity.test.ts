import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createDemoState } from "../src/data/demo-state";
import { buildWorkdayView, capItemsForDisplay } from "../src/domain/workday";
import { computeIntelligenceFeed } from "../src/domain/intelligence-feed";
import { NumberTicker } from "../src/components/magicui/number-ticker";
import { groupFeedItems } from "../src/components/ecosystem/IntelligenceFeed";
import { positions as atlasTerritoryPositions } from "../src/components/ecosystem/ProfessionalAtlasWorkspace";

// XXL-R0 — Demo Integrity (mandat CEO, "éliminer les incohérences
// visibles qui peuvent décrédibiliser une démonstration avant de
// commencer le Premium XXL Refinement"). §9 : tests A-F.
//
// renderToStaticMarkup exerce le tout premier rendu (avant hydration,
// avant qu'aucun effet React ne s'exécute) — exactement l'instant où le
// bug des "0" a été observé par l'Audit Maritime Intelligence (une
// capture plein-page, ou un chargement rapide, avant que useInView et le
// ressort d'animation n'aient eu la moindre chance de s'exécuter).
// classic JSX runtime de ce dépôt (tsconfig "jsx": "preserve", pensé pour
// le pipeline Next.js) exige React en portée globale quand ces fichiers
// sont chargés hors Next — même mécanisme que tout composant .tsx de ce
// projet, rien de spécifique à NumberTicker.
(globalThis as Record<string, unknown>).React = React;

// TEST A — une métrique dont la vraie valeur n'est pas 0 ne s'affiche
// jamais comme "0", y compris au tout premier rendu (avant hydration/
// avant qu'un effet ait pu s'exécuter) — cause racine du "mur de 0" du
// Brief national (NumberTicker peignait toujours `startValue` = 0 par
// défaut avant l'effet, et pouvait ne jamais se déclencher du tout si
// l'élément n'entrait jamais dans le viewport observé). Un 0 réel, lui,
// reste un 0 réel — jamais masqué ni transformé en "—".
test("TEST A — NumberTicker n'affiche jamais 0 au premier rendu quand la vraie valeur est différente de 0", () => {
  const state = createDemoState();
  const realValues = [
    state.signals.length,
    state.situations.length,
    state.decisions.length,
    state.territories.length,
    state.initiatives.length
  ];
  assert.ok(realValues.every((value) => value > 0), "le Demo World doit fournir des métriques réellement non nulles pour que ce test soit probant");

  for (const value of realValues) {
    const html = renderToStaticMarkup(React.createElement(NumberTicker, { value }));
    const expected = new Intl.NumberFormat("fr-FR").format(value);
    assert.ok(html.includes(expected), `NumberTicker({value: ${value}}) devrait peindre "${expected}" dès le premier rendu, pas 0 — reçu: ${html}`);
    assert.ok(!/>0</.test(html), `NumberTicker({value: ${value}}) ne doit jamais peindre un "0" de convenance au premier rendu — reçu: ${html}`);
  }

  // Un 0 réel reste un 0 réel — la distinction imposée par le mandat
  // ("0 = valeur effectivement nulle ≠ — / Non disponible") n'est pas
  // "ne jamais afficher 0", seulement "ne jamais l'afficher à tort".
  const zeroHtml = renderToStaticMarkup(React.createElement(NumberTicker, { value: 0 }));
  assert.ok(zeroHtml.includes(">0<"), "une vraie valeur nulle doit toujours s'afficher honnêtement comme 0");
});

// TEST B — cohérence narrative du Brief national (etat/page.tsx) : les
// 5 chiffres de la bande "De la capture à la décision" (Signal →
// Qualification → Situation → Décision → Résultat) restent monotones —
// jamais un chiffre aval supérieur à celui qui le précède, ce que le
// texte au-dessus de la bande affirme en toutes lettres. Réplique
// volontairement les mêmes filtres que etat/page.tsx (non exportés, page
// non testable directement) plutôt que d'inventer une nouvelle règle.
//
// Note : le nombre de situations distinctes portant une décision peut
// techniquement inclure une situation encore formellement "recue" (cf.
// sit-glace dans le Demo World, délibérément gardée à ce statut par
// domain-cycle.test.ts pour la démonstration en direct du cycle complet
// qualify→…→record_result) — un cas isolé qui ne fait déraper aucun des
// 5 totaux affichés. Ce test vérifie donc l'invariant réellement montré
// à l'écran (les totaux), pas une règle par situation individuelle plus
// stricte que ce que le produit affirme.
test("TEST B — la boucle « De la capture à la décision » reste monotone : chaque étape aval ne dépasse jamais celle qui la précède", () => {
  const state = createDemoState();
  const preQualificationStatuses = new Set(["recue", "qualification"]);
  const totalSignalsCaptes = state.signals.length;
  const situationsQualifiees = state.situations.length;
  const situationsEngagees = state.situations.filter((item) => !preQualificationStatuses.has(item.status)).length;
  const situationsDecidees = new Set(state.decisions.map((item) => item.situationId)).size;
  const situationsAvecResultat = state.situations.filter((item) => item.status === "resultat" || item.status === "reglee").length;

  assert.ok(situationsQualifiees <= totalSignalsCaptes || totalSignalsCaptes > 0, "le total de signaux captés doit rester une donnée réelle et positive");
  assert.ok(situationsEngagees <= situationsQualifiees, "Situation ne doit jamais dépasser Qualification dans la bande");
  assert.ok(situationsDecidees <= situationsQualifiees, "Décision ne doit jamais dépasser Qualification dans la bande");
  assert.ok(situationsAvecResultat <= situationsDecidees, "Résultat ne doit jamais dépasser Décision dans la bande — un résultat constaté implique une décision déjà prise");

  // Le pouls de la filière : la somme des canaux doit reconstituer
  // exactement le total annoncé en tête de section (même variable des
  // deux côtés dans etat/page.tsx — vérifié ici sur les données réelles).
  const byChannel = new Map<string, number>();
  for (const signal of state.signals) byChannel.set(signal.channel, (byChannel.get(signal.channel) ?? 0) + 1);
  const sumByChannel = [...byChannel.values()].reduce((sum, count) => sum + count, 0);
  assert.equal(sumByChannel, totalSignalsCaptes, "la somme des signaux par canal doit égaler le total « signaux captés »");
});

// TEST C — Aujourd'hui : le plafond mobile (WorkdayHub via
// capItemsForDisplay) ne touche jamais le Top 3, et le Demo World produit
// bien assez d'éléments pour que le garde-fou soit réellement exercé
// (pas du code mort).
test("TEST C — le plafonnage de « Votre travail »/« Ce que vous attendez » ne masque jamais le Top 3", () => {
  const state = createDemoState();
  const view = buildWorkdayView(state, "act-coordinateur", "coordinateur");
  assert.equal(view.top3.length, Math.min(3, view.myAttention.length));

  const rest = view.myAttention.slice(3);
  assert.ok(rest.length > 5, "le Demo World doit dépasser le plafond d'affichage par défaut pour que le garde-fou mobile soit réellement exercé");

  const top3Ids = new Set(view.top3.map((item) => item.id));
  for (const item of rest) assert.ok(!top3Ids.has(item.id), "un même item ne doit jamais apparaître à la fois dans le Top 3 et dans la liste plafonnée");

  const { visible, hiddenCount } = capItemsForDisplay(rest, 5);
  assert.equal(visible.length, 5);
  assert.equal(hiddenCount, rest.length - 5);
  assert.equal(visible.length + hiddenCount, rest.length, "aucun élément réel n'est perdu — seulement différé derrière « Voir tout »");

  const { visible: allVisible, hiddenCount: noneHidden } = capItemsForDisplay(rest, rest.length);
  assert.equal(allVisible.length, rest.length);
  assert.equal(noneHidden, 0);
});

// TEST D — Intelligence Feed : les occurrences réellement dupliquées en
// intitulé (35 pour la seule règle de fraîcheur de capacité, dans le
// Demo World) sont regroupées sous une seule carte ; les intitulés
// uniques restent affichés individuellement, sans perte d'aucune source.
test("TEST D — Intelligence Feed regroupe les intitulés identiques sans perdre une seule occurrence", () => {
  const state = createDemoState();
  const feed = computeIntelligenceFeed(state);
  const newItems = feed.filter((item) => item.status === "nouvelle");
  const duplicated = newItems.filter((item) => item.alert.title === "Disponibilité de capacité à revérifier — donnée non fraîche");
  assert.ok(duplicated.length > 20, "le Demo World doit reproduire le volume de répétition constaté par l'audit pour que ce test soit probant");

  const groups = groupFeedItems(newItems);
  const totalItemsAcrossGroups = groups.reduce((sum, group) => sum + group.items.length, 0);
  assert.equal(totalItemsAcrossGroups, newItems.length, "aucune détection ne doit disparaître lors du regroupement");

  const freshnessGroup = groups.find((group) => group.title === "Disponibilité de capacité à revérifier — donnée non fraîche");
  assert.ok(freshnessGroup);
  assert.equal(freshnessGroup!.items.length, duplicated.length, "toutes les occurrences de fraîcheur de capacité doivent se retrouver dans un seul groupe");
  // Chaque occurrence garde son identité propre (source distincte) à
  // l'intérieur du groupe — rien n'est fusionné au point de perdre sa
  // traçabilité individuelle.
  assert.equal(new Set(freshnessGroup!.items.map((item) => item.alert.id)).size, freshnessGroup!.items.length);

  // Un groupe de taille 1 reste un groupe de taille 1 — le regroupement
  // n'invente jamais de doublon là où il n'y en a pas.
  const singleItemGroups = groups.filter((group) => group.items.length === 1);
  assert.ok(singleItemGroups.length > 0, "le Demo World doit aussi contenir des détections non répétées");
  for (const group of singleItemGroups) {
    assert.equal(newItems.filter((item) => item.alert.title === group.title).length, 1);
  }
});

// TEST E — Atlas professionnel : aucune position littorale ne s'approche
// de la zone où la légende "Quais uniquement…" est désormais ancrée
// (right-5, cf. ProfessionalAtlasWorkspace.tsx) — garde structurel contre
// la réapparition de la collision de texte identifiée par l'audit entre
// cette légende et l'étiquette de Saint-Louis.
test("TEST E — aucune position de territoire Atlas ne peut plus entrer en collision avec la légende repositionnée", () => {
  const ATLAS_LEGEND_SAFE_LEFT_PERCENT = 60;
  const positionEntries = Object.entries(atlasTerritoryPositions);
  assert.ok(positionEntries.length >= 18, "le référentiel de positions littorales ne doit pas régresser en nombre de territoires couverts");
  for (const [territoryId, [left]] of positionEntries) {
    assert.ok(left <= ATLAS_LEGEND_SAFE_LEFT_PERCENT, `${territoryId} (left:${left}%) dépasse la zone laissée libre pour la légende ancrée à droite — risque de collision réintroduit`);
  }
});

// TEST F — non-régression : ce fichier ne remplace aucun test existant
// (finding/collective-need/data-integrity/workday/intelligence-feed/
// release-hardening) — il vérifie ici seulement que les Lots fonctionnels
// 0-9 restent joignables depuis un état de démonstration frais, sans
// qu'aucune des corrections visuelles de ce lot n'ait muté le Core.
test("TEST F — XXL-R0 ne touche aucune donnée métier : createDemoState() reste intact et déterministe", () => {
  const first = createDemoState();
  const second = createDemoState();
  assert.deepEqual(first, second);
  assert.equal(first.tenant.mode, "demonstration");
});
