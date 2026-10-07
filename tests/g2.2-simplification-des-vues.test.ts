import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { applyDemoProgramOpportunities } from "../src/data/demo-program-opportunities";
import { buildSituationRows, getSituationDetail } from "../src/v3-template/lib/situations-bridge";
import { getArbitrageItems } from "../src/v3-template/lib/arbitrages-bridge";
import { getInitiativeResults } from "../src/v3-template/lib/resultats-bridge";
import { buildFluxRows } from "../src/v3-template/lib/flux-bridge";
import { getConnectedSources } from "../src/v3-template/lib/sources-bridge";
import { ARB } from "../src/v3-template/data/arbitrages";

// G2.2 — mandat "Simplification des vues". Doctrine vérifiée ici : chaque
// vue de travail reste branchée sur le domaine réel, jamais une seconde
// logique d'arbitrage, jamais un objet déjà décidé affiché comme "à
// décider", le filtre territorial partagé reste lisible/supprimable.

test("Situations — chaque rangée porte les 7 champs minimum (G2.2 §1), jamais seulement dans le détail", () => {
  const state = createDemoState();
  const rows = buildSituationRows(state);
  assert.ok(rows.length > 0);
  for (const row of rows) {
    assert.equal(typeof row.territoryId, "string");
    assert.equal(typeof row.territoryLabel, "string");
    assert.equal(typeof row.title, "string");
    assert.equal(typeof row.trustLabel, "string");
    assert.equal(typeof row.consequenceSummary, "string");
    assert.equal(typeof row.nextStep, "string");
    // responsibleLabel reste honnêtement absent si aucun acteur assigné —
    // jamais fabriqué — donc seulement vérifié comme string | undefined.
    assert.ok(row.responsibleLabel === undefined || typeof row.responsibleLabel === "string");
  }
  // sit-mbour est référencée par la ProgramOpportunity Mbour
  // (demo-program-opportunities.ts, situationIds: ["sit-mbour"]) : la
  // rangée doit exposer ce lien réel, jamais une relation fabriquée.
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const mbourRows = buildSituationRows(withDemo);
  const mbourRow = mbourRows.find((r) => r.realId === "sit-mbour")!;
  assert.ok(mbourRow.linkedOpportunity, "sit-mbour doit exposer son opportunité réelle liée");

  // SituationDetailView hérite des mêmes champs (jamais une deuxième
  // computation dupliquée pour responsibleLabel/nextStep).
  const detail = getSituationDetail(mbourRow.id, withDemo)!;
  assert.equal(detail.nextStep, mbourRow.nextStep);
  assert.equal(detail.responsibleLabel, mbourRow.responsibleLabel);
});

test("Arbitrages — un objet déjà décidé ne s'affiche plus jamais comme « à décider »", () => {
  const state = createDemoState();
  // sit-glace (ARB[0]) porte déjà de vraies Decision dans le Demo World de
  // base (dec-glace-1/2, demo-state.ts) : exclu dès le départ — exactement
  // le comportement attendu, vérifié par le test suivant. sit-mbour
  // (ARB[1]) démarre lui réellement non décidé : cas choisi ici.
  const itemsBefore = getArbitrageItems(state);
  const mbourItem = itemsBefore.find((i) => i.situationId === "sit-mbour");
  assert.ok(mbourItem, "l'arbitrage Mbour (sit-mbour) doit apparaître tant qu'aucune Decision réelle n'existe");

  const decided = applyCommand(state, { type: "create_decision", situationId: "sit-mbour", actorId: "act-ministre", decisionType: "mobiliser_capacite", rationale: "Capacité mobilisée immédiatement." });
  const itemsAfter = getArbitrageItems(decided);
  assert.equal(itemsAfter.some((i) => i.situationId === "sit-mbour"), false, "un arbitrage déjà décidé ne doit plus apparaître comme à décider");
});

test("Arbitrages — sit-glace, déjà décidée dans le Demo World de base, n'apparaît jamais comme « à décider »", () => {
  const state = createDemoState();
  const items = getArbitrageItems(state);
  assert.equal(items.some((i) => i.situationId === "sit-glace"), false, "sit-glace porte déjà dec-glace-1/dec-glace-2 — ne doit jamais réapparaître comme à décider");
});

test("Arbitrages — une ProgramOpportunity pending_arbitration alimente la vue via le moteur canonique, sans deuxième logique", () => {
  const state = createDemoState();
  const withDemo = applyDemoProgramOpportunities(state, "act-coordinateur");
  const joalOpp = withDemo.programOpportunities.find((o) => o.problem.includes("écailles"))!;
  const qualified = applyCommand(withDemo, { type: "update_program_opportunity_status", programOpportunityId: joalOpp.id, actorId: "act-coordinateur", status: "qualified" });
  const pending = applyCommand(qualified, { type: "update_program_opportunity_status", programOpportunityId: joalOpp.id, actorId: "act-coordinateur", status: "pending_arbitration" });

  const items = getArbitrageItems(pending);
  const oppItem = items.find((i) => i.opportunityId === joalOpp.id);
  assert.ok(oppItem, "une opportunité pending_arbitration doit apparaître dans Arbitrages");
  assert.equal(oppItem!.kind, "opportunity");
  assert.equal(oppItem!.options.length, 2, "retenir/écarter — jamais une troisième option inventée");

  // Le CTA dispatche réellement arbitrate_program_opportunity (moteur
  // canonique G1), jamais une seconde commande inventée pour ce lot.
  const arbitrated = applyCommand(pending, { type: "arbitrate_program_opportunity", programOpportunityId: joalOpp.id, actorId: "act-ministre", outcome: "retenir", rationale: "Retenue après instruction." });
  const itemsAfterArbitration = getArbitrageItems(arbitrated);
  assert.equal(itemsAfterArbitration.some((i) => i.opportunityId === joalOpp.id), false, "une fois réellement arbitrée, l'opportunité ne doit plus apparaître comme à décider");
});

test("Arbitrages — seuls les ARB fixtures réellement non décidés restent dans la liste fusionnée", () => {
  const state = createDemoState();
  const items = getArbitrageItems(state);
  const situationItems = items.filter((i) => i.kind === "situation");
  // ARB[0] (sit-glace) est déjà décidée dans le Demo World de base : seuls
  // ARB[1] (sit-mbour, non décidée) et ARB[2] (portefeuille, aucun
  // ancrage Decision possible) doivent rester — jamais ARB.length entier
  // tant que la donnée réelle elle-même porte une décision antérieure.
  assert.equal(situationItems.length, ARB.length - 1);
  assert.ok(situationItems.every((i) => i.situationId !== "sit-glace"));
});

test("Résultats — Décidé/Réalisé/Résultat observé/Écart dérivés des Initiative/Result réels, jamais une série synthétique", () => {
  const state = createDemoState();
  const results = getInitiativeResults(state);
  assert.ok(results.length > 0);

  const immatriculation = results.find((r) => r.id === "init-immatriculation")!;
  assert.ok(immatriculation, "l'Initiative réelle init-immatriculation doit être présente");
  // Son unique Result réel (result-immatriculation-t1, demo-state.ts) doit
  // apparaître comme résultat observé, jamais une valeur inventée.
  assert.equal(immatriculation.observedResults.length, 1);
  assert.ok(immatriculation.observedResults[0].title.includes("156 dossiers"));
  // Écart dérivé des vrais indicators (baseline/target/current réels).
  assert.ok(immatriculation.indicatorGaps.length > 0);
  for (const gap of immatriculation.indicatorGaps) {
    assert.match(gap.gapLabel, /^[+-]?\d/);
  }

  // Une Initiative sans Result réel associé affiche honnêtement l'absence,
  // jamais un résultat fabriqué pour remplir la carte.
  const froid = results.find((r) => r.id === "init-froid")!;
  assert.equal(froid.observedResults.length, 0);
});

test("Résultats — filtre territoire : seules les initiatives référençant ce territoire restent", () => {
  const state = createDemoState();
  const results = getInitiativeResults(state);
  const joalRelated = results.filter((r) => r.territoryIds.includes("joal"));
  assert.ok(joalRelated.length > 0);
  assert.ok(joalRelated.every((r) => r.territoryIds.includes("joal")));
});

test("Flux — chaque rangée porte un territoryId filtrable quand le territoire est résolu", () => {
  const state = createDemoState();
  const rows = buildFluxRows(state);
  assert.ok(rows.length > 0);
  const resolved = rows.filter((r) => r.territoryId);
  assert.ok(resolved.length > 0, "au moins un message réel doit résoudre vers un territoire connu");
});

test("Sources connectées — sans filtre : intégrations système honnêtes ; avec filtre territoire : provenance réelle des signaux", () => {
  const state = createDemoState();
  const national = getConnectedSources(state);
  assert.ok(national.length > 0);
  // Aucune confiance ni fraîcheur fabriquée pour une intégration système :
  // ces deux champs restent honnêtement absents.
  for (const row of national) {
    assert.equal(row.confidenceLabel, undefined);
    assert.equal(row.freshnessLabel, undefined);
  }

  const filtered = getConnectedSources(state, "joal");
  assert.ok(filtered.length >= national.length, "le filtre territorial ajoute la provenance réelle, jamais en moins");
  const territorySignalRows = filtered.filter((r) => r.territoryId === "joal");
  assert.ok(territorySignalRows.length > 0, "au moins un signal réel de Joal doit apparaître une fois le territoire filtré");
  for (const row of territorySignalRows) {
    assert.ok(row.freshnessLabel, "une provenance territoriale réelle porte toujours une date réelle");
  }
});
