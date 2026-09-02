import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { buildTerritoryIntelligence, currentTerritoryView, hasSufficientKnowledge } from "../src/domain/territory-intelligence";

// LOT 5 (mandat "Atlas & Territoire — voir la réalité territoriale comme
// un système") — tests fonctionnels obligatoires A-N (§34 du mandat).
// Même discipline que field-mission.test.ts / impact.test.ts : state
// frais à chaque test, applyCommand direct.

const JOAL_SITUATION_ID = "sit-joal-glace-recurrence";
const KAYAR_NEED_ID = "cn-kayar-motorisation";
const KAYAR_GAP_ID = "fnd-kayar-motorisation-connaissance-manquante";

// TEST A — la projection Joal ne contient que des objets réellement
// reliés au territoire (aucune fuite d'un autre territoire).
test("TEST A — la projection Joal ne contient que des objets territorialement reliés", () => {
  const state = createDemoState();
  const joal = buildTerritoryIntelligence(state, "joal")!;
  assert.ok(joal);
  joal.situations.forEach((item) => assert.equal(item.territoryId, "joal"));
  joal.signals.forEach((item) => assert.equal(item.territoryId, "joal"));
  joal.findings.forEach((item) => assert.ok(item.territoryIds.includes("joal")));
  joal.collectiveNeeds.forEach((item) => assert.ok(item.territoryIds.includes("joal")));
  // La situation de Kayar ne doit jamais apparaître dans la projection Joal.
  assert.ok(!joal.situations.some((item) => item.territoryId === "kayar"));
});

// TEST B — un objet multi-territorial apparaît sur chacun de ses
// territoires (mandat §6, ne jamais perdre les objets multi-territoriaux).
test("TEST B — un objet multi-territorial (CollectiveNeed Kayar) apparaît sur ses 2 territoires", () => {
  const state = createDemoState();
  const kayar = buildTerritoryIntelligence(state, "kayar")!;
  const fassBoye = buildTerritoryIntelligence(state, "fass-boye")!;
  assert.ok(kayar.collectiveNeeds.some((item) => item.id === KAYAR_NEED_ID));
  assert.ok(fassBoye.collectiveNeeds.some((item) => item.id === KAYAR_NEED_ID));
});

function bringJoalToOutcome(state = createDemoState()) {
  const started = applyCommand(state, { type: "start_intervention", situationId: JOAL_SITUATION_ID, actorId: "act-coordinateur" });
  const withResult = applyCommand(started, {
    type: "record_result",
    situationId: JOAL_SITUATION_ID,
    actorId: "act-coordinateur",
    result: "La maintenance préventive a été réalisée sur le dispositif de production de glace.",
    confirmation: "Intervention technique consignée par le prestataire."
  });
  const result = withResult.results[0];
  const withOutcome = applyCommand(withResult, {
    type: "record_outcome",
    actorId: "act-coordinateur",
    title: "Reprise stable de la production de glace",
    statement: "La production de glace n'a plus connu d'interruption documentée depuis la maintenance préventive.",
    sourceResultIds: [result.id],
    trust: "observee",
    attribution: "contributive",
    limits: "D'autres facteurs saisonniers pourraient aussi expliquer la stabilité observée."
  });
  return { state: withOutcome, result, outcome: withOutcome.outcomes[0] };
}

// TEST C — un Result relié à la Situation Joal apparaît dans la
// projection Joal (LOT 4, sourceRef situation).
test("TEST C — un Result relié à la Situation Joal apparaît dans la projection Joal", () => {
  const { state, result } = bringJoalToOutcome();
  const joal = buildTerritoryIntelligence(state, "joal")!;
  assert.ok(joal.results.some((item) => item.id === result.id));
});

// TEST D — un Outcome relié au Result Joal apparaît dans la projection Joal.
test("TEST D — un Outcome relié au Result Joal apparaît dans la projection Joal", () => {
  const { state, outcome } = bringJoalToOutcome();
  const joal = buildTerritoryIntelligence(state, "joal")!;
  assert.ok(joal.outcomes.some((item) => item.id === outcome.id));
});

// TEST E — un Learning relié à l'Outcome Joal apparaît dans la
// projection Joal (hérite le territoire via outcomeId).
test("TEST E — un Learning relié à l'Outcome Joal apparaît dans la projection Joal", () => {
  const { state, outcome } = bringJoalToOutcome();
  const withLearning = applyCommand(state, {
    type: "record_learning",
    actorId: "act-coordinateur",
    title: "Documenter la maintenance préventive avant la panne complète",
    summary: "Programmer une maintenance dès la récurrence d'un même symptôme évite d'attendre l'arrêt complet du dispositif.",
    reusableIn: ["mbour", "kayar"],
    outcomeId: outcome.id
  });
  const joal = buildTerritoryIntelligence(withLearning, "joal")!;
  assert.ok(joal.learnings.some((item) => item.outcomeId === outcome.id));
});

// TEST F — le CollectiveNeed Kayar apparaît correctement.
test("TEST F — le CollectiveNeed Kayar apparaît correctement dans la projection Kayar", () => {
  const state = createDemoState();
  const kayar = buildTerritoryIntelligence(state, "kayar")!;
  const need = kayar.collectiveNeeds.find((item) => item.id === KAYAR_NEED_ID);
  assert.ok(need);
  assert.equal(need!.status, "qualified");
});

// TEST G — le Knowledge Gap Kayar apparaît correctement.
test("TEST G — le Knowledge Gap Kayar apparaît correctement dans la projection Kayar", () => {
  const state = createDemoState();
  const kayar = buildTerritoryIntelligence(state, "kayar")!;
  const gap = kayar.knowledgeGaps.find((item) => item.id === KAYAR_GAP_ID);
  assert.ok(gap);
  assert.equal(gap!.type, "knowledge_gap");
  // Les Findings "non-knowledge_gap" (ex. fnd-kayar-motorisation) ne
  // doivent pas se retrouver dans ce sous-ensemble.
  assert.ok(!kayar.knowledgeGaps.some((item) => item.id === "fnd-kayar-motorisation"));
});

function createKayarMission(state: ReturnType<typeof createDemoState>) {
  return applyCommand(state, {
    type: "create_field_mission",
    actorId: "act-coordinateur",
    title: "Qualifier les causes des difficultés récurrentes de motorisation — Kayar/Fass Boye",
    objective: "Comprendre la cause dominante des pannes moteur récurrentes avant de concevoir une intervention",
    territoryIds: ["kayar", "fass-boye"],
    reason: "Connaissance manquante identifiée",
    responsibleActorId: "act-operateur",
    signalCategory: "infrastructure",
    observationPoints: ["État des moteurs", "Fréquence et nature des pannes"],
    knowledgeGapFindingId: KAYAR_GAP_ID,
    collectiveNeedId: KAYAR_NEED_ID
  });
}

// TEST H — une FieldMission Kayar apparaît après sa création (jamais
// avant, mandat "pas de pré-remplissage de ce qui est démontré").
test("TEST H — la FieldMission Kayar apparaît dans la projection après création", () => {
  const state = createDemoState();
  const before = buildTerritoryIntelligence(state, "kayar")!;
  assert.equal(before.fieldMissions.length, 0);
  const withMission = createKayarMission(state);
  const after = buildTerritoryIntelligence(withMission, "kayar")!;
  assert.equal(after.fieldMissions.length, 1);
  // Objet multi-territorial : apparaît aussi à Fass Boye.
  const fassBoye = buildTerritoryIntelligence(withMission, "fass-boye")!;
  assert.equal(fassBoye.fieldMissions.length, 1);
});

// TEST I — une Observation Kayar/Fass Boye respecte son territoire réel
// (micro-correctif LOT 3) : elle n'apparaît QUE sous le territoire
// effectivement choisi, pas automatiquement sur les 2.
test("TEST I — l'Observation respecte son territoire réel, pas celui de la mission entière", () => {
  const state = createDemoState();
  const withMission = createKayarMission(state);
  const mission = withMission.fieldMissions[0];
  const started = applyCommand(withMission, { type: "update_field_mission_status", actorId: "act-operateur", missionId: mission.id, status: "en_cours" });
  const withObservation = applyCommand(started, {
    type: "record_observation",
    actorId: "act-operateur",
    missionId: mission.id,
    territoryId: "fass-boye",
    content: "À Fass Boye spécifiquement, l'accès aux pièces est plus limité qu'à Kayar.",
    nature: "nuance",
    trust: "observee"
  });
  const fassBoye = buildTerritoryIntelligence(withObservation, "fass-boye")!;
  const kayar = buildTerritoryIntelligence(withObservation, "kayar")!;
  assert.equal(fassBoye.observations.length, 1);
  assert.equal(kayar.observations.length, 0, "l'observation ne doit pas apparaître à Kayar alors qu'elle a été réalisée à Fass Boye");
});

// TEST J — une ProgramOpportunity n'apparaît que lorsqu'elle existe
// réellement (jamais pré-créée pour Kayar, mandat LOT 2).
test("TEST J — aucune ProgramOpportunity n'apparaît pour Kayar tant qu'elle n'a pas été créée explicitement", () => {
  const state = createDemoState();
  const kayarBefore = buildTerritoryIntelligence(state, "kayar")!;
  assert.equal(kayarBefore.programOpportunities.length, 0);
  const need = state.collectiveNeeds.find((item) => item.id === KAYAR_NEED_ID)!;
  const withOpportunity = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: "Difficultés récurrentes de motorisation",
    justification: "Signaux et demandes convergent",
    territoryIds: ["kayar", "fass-boye"],
    potentialBeneficiaries: "Capitaines et mareyeurs de Kayar et Fass Boye",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Maintenance préventive", "Formation à l'entretien"],
    desiredOutcomes: ["Réduire les immobilisations"],
    possibleIndicators: [],
    maturity: "faible"
  });
  const kayarAfter = buildTerritoryIntelligence(withOpportunity, "kayar")!;
  assert.equal(kayarAfter.programOpportunities.length, 1);
});

// TEST K — un territoire sans information suffisante n'est jamais
// déclaré stable (hasSufficientKnowledge doit rester honnête).
test("TEST K — un territoire sans donnée réelle n'est jamais présenté comme suffisamment connu", () => {
  const state = createDemoState();
  // Territoire réel mais volontairement sans aucune donnée relationnelle
  // ajoutée pour ce test : on vérifie le comportement du helper sur un
  // territoire dont on retire artificiellement toute trace, pour prouver
  // qu'il ne conclut jamais "stable" par défaut.
  const empty = buildTerritoryIntelligence({ ...state, situations: [], signals: [], findings: [], collectiveNeeds: [], fieldMissions: [], results: [] }, "joal")!;
  assert.equal(hasSufficientKnowledge(empty), false);
});

// TEST L — aucun score territorial global n'est exposé par la projection
// (lecture structurelle du fichier source, pas seulement un test de
// forme du type).
test("TEST L — aucun score territorial global dans territory-intelligence.ts", () => {
  const source = readFileSync(new URL("../src/domain/territory-intelligence.ts", import.meta.url), "utf8");
  // Les commentaires du fichier évoquent la doctrine "jamais de score" en
  // toutes lettres (documentation) : seul le CODE (hors commentaires) doit
  // être exempt du mot, sans quoi le test interdirait sa propre doctrine.
  const codeOnly = source
    .split("\n")
    .map((line) => line.replace(/\/\/.*$/, ""))
    .join("\n");
  assert.doesNotMatch(codeOnly, /\bscore\b/i, "aucun score territorial (opaque ou non) ne doit être calculé par la projection");
});

// TEST M — les liens dossier → source restent corrects : vérifié ici au
// niveau structurel (la résolution des sourceRef reste résoluble), la
// vérification UI (href) est couverte par la revue de composant / le
// navigateur.
test("TEST M — chaque objet projeté reste résolvable vers son enregistrement source réel", () => {
  const { state, result, outcome } = bringJoalToOutcome();
  const joal = buildTerritoryIntelligence(state, "joal")!;
  const projectedResult = joal.results.find((item) => item.id === result.id)!;
  assert.equal(projectedResult.sourceRef.objectType, "situation");
  assert.ok(state.situations.some((item) => item.id === projectedResult.sourceRef.objectId));
  const projectedOutcome = joal.outcomes.find((item) => item.id === outcome.id)!;
  assert.ok(projectedOutcome.sourceResultIds.every((id) => state.results.some((item) => item.id === id)));
});

// TEST N — non-régression LOTS 1-4 : vérifiée par ailleurs (suite
// complète, `npm test`).
test("TEST N — le Demo World reste cohérent après l'ajout de la projection territoriale", () => {
  const state = createDemoState();
  for (const territory of state.territories) {
    const intelligence = buildTerritoryIntelligence(state, territory.id);
    assert.ok(intelligence, `la projection doit exister pour chaque territoire réel (${territory.id})`);
  }
  assert.equal(buildTerritoryIntelligence(state, "territoire-inexistant"), undefined);
});

// ============================================================
// Micro-correctif final LOT 5 — lecture "current" (§1-§4 du mandat).
// currentTerritoryView() ne doit jamais présenter comme actif un objet
// terminé/rejeté/remplacé/converti, MAIS buildTerritoryIntelligence()
// (le dossier complet) doit continuer à l'exposer intégralement — c'est
// l'histoire territoriale, jamais amputée.
// ============================================================

test("MICRO-CORRECTIF — une Situation réglée reste dans l'historique mais disparaît de la lecture « Aujourd'hui »", () => {
  const state = createDemoState();
  const started = applyCommand(state, { type: "start_intervention", situationId: JOAL_SITUATION_ID, actorId: "act-coordinateur" });
  const withResult = applyCommand(started, {
    type: "record_result",
    situationId: JOAL_SITUATION_ID,
    actorId: "act-coordinateur",
    result: "Maintenance préventive réalisée sur le groupe froid.",
    confirmation: "Confirmé par le relais territorial."
  });
  const closed = applyCommand(withResult, { type: "close", situationId: JOAL_SITUATION_ID, actorId: "act-coordinateur" });

  const joal = buildTerritoryIntelligence(closed, "joal")!;
  assert.ok(joal.situations.some((item) => item.id === JOAL_SITUATION_ID), "le dossier historique complet doit continuer à exposer la situation réglée");

  const current = currentTerritoryView(joal);
  assert.ok(!current.situations.some((item) => item.id === JOAL_SITUATION_ID), "« Aujourd'hui » ne doit jamais présenter une situation réglée comme active");
});

test("MICRO-CORRECTIF — une Mission réalisée reste dans l'historique mais disparaît de la lecture « Aujourd'hui »", () => {
  const state = createDemoState();
  const withMission = createKayarMission(state);
  const mission = withMission.fieldMissions[0];
  const started = applyCommand(withMission, { type: "update_field_mission_status", actorId: "act-operateur", missionId: mission.id, status: "en_cours" });
  const realisee = applyCommand(started, { type: "update_field_mission_status", actorId: "act-operateur", missionId: mission.id, status: "realisee" });

  const kayar = buildTerritoryIntelligence(realisee, "kayar")!;
  assert.ok(kayar.fieldMissions.some((item) => item.id === mission.id), "le dossier historique complet doit continuer à exposer la mission réalisée");

  const current = currentTerritoryView(kayar);
  assert.ok(!current.fieldMissions.some((item) => item.id === mission.id), "« Aujourd'hui » ne doit jamais présenter une mission réalisée comme active");
});

test("MICRO-CORRECTIF — un Finding rejeté/remplacé reste dans l'historique mais disparaît de la lecture « Aujourd'hui »", () => {
  const state = createDemoState();
  const rejected = {
    ...state,
    findings: state.findings.map((item) => item.id === KAYAR_GAP_ID ? { ...item, status: "rejected" as const } : item)
  };

  const kayar = buildTerritoryIntelligence(rejected, "kayar")!;
  assert.ok(kayar.findings.some((item) => item.id === KAYAR_GAP_ID), "le dossier historique complet doit continuer à exposer le Finding rejeté");
  assert.ok(kayar.knowledgeGaps.some((item) => item.id === KAYAR_GAP_ID), "le dossier historique complet (knowledgeGaps) doit aussi continuer à l'exposer");

  const current = currentTerritoryView(kayar);
  assert.ok(!current.findings.some((item) => item.id === KAYAR_GAP_ID), "« Aujourd'hui » ne doit jamais présenter un Finding rejeté comme actif");
  assert.ok(!current.knowledgeGaps.some((item) => item.id === KAYAR_GAP_ID), "« Aujourd'hui » ne doit jamais présenter un Knowledge Gap rejeté comme actif");
});

test("MICRO-CORRECTIF — un CollectiveNeed converti reste dans l'historique mais disparaît de la lecture « Aujourd'hui »", () => {
  const state = createDemoState();
  // create_program_opportunity convertit automatiquement le besoin source
  // (knowledge-pipeline.ts) — pas de commande dédiée à simuler.
  const withOpportunity = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: KAYAR_NEED_ID,
    problem: "Difficultés récurrentes de motorisation",
    justification: "Signaux et demandes convergent",
    territoryIds: ["kayar", "fass-boye"],
    potentialBeneficiaries: "Capitaines et mareyeurs de Kayar et Fass Boye",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Maintenance préventive"],
    desiredOutcomes: ["Réduire les immobilisations"],
    possibleIndicators: [],
    maturity: "faible"
  });

  const kayar = buildTerritoryIntelligence(withOpportunity, "kayar")!;
  const need = kayar.collectiveNeeds.find((item) => item.id === KAYAR_NEED_ID);
  assert.ok(need, "le dossier historique complet doit continuer à exposer le besoin converti");
  assert.equal(need!.status, "converted");

  const current = currentTerritoryView(kayar);
  assert.ok(!current.collectiveNeeds.some((item) => item.id === KAYAR_NEED_ID), "« Aujourd'hui / ce qui émerge » ne doit jamais présenter un besoin converti comme émergent");
});

test("MICRO-CORRECTIF — non-régression Joal/Kayar/Hann : la lecture current reste cohérente sur le Demo World initial", () => {
  const state = createDemoState();
  for (const territoryId of ["joal", "kayar", "hann"]) {
    const intelligence = buildTerritoryIntelligence(state, territoryId)!;
    const current = currentTerritoryView(intelligence);
    // La lecture current est toujours un sous-ensemble de la projection complète.
    current.situations.forEach((item) => assert.ok(intelligence.situations.some((full) => full.id === item.id)));
    current.findings.forEach((item) => assert.ok(intelligence.findings.some((full) => full.id === item.id)));
    current.fieldMissions.forEach((item) => assert.ok(intelligence.fieldMissions.some((full) => full.id === item.id)));
    current.collectiveNeeds.forEach((item) => assert.ok(intelligence.collectiveNeeds.some((full) => full.id === item.id)));
  }
  // Kayar : le besoin de motorisation est encore "qualified" au chargement — doit apparaître en current.
  const kayarCurrent = currentTerritoryView(buildTerritoryIntelligence(state, "kayar")!);
  assert.ok(kayarCurrent.collectiveNeeds.some((item) => item.id === KAYAR_NEED_ID));
  assert.ok(kayarCurrent.knowledgeGaps.some((item) => item.id === KAYAR_GAP_ID));
});
