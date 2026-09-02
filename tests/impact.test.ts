import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { buildValueTrail, outcomesForResults, resultsForSituation } from "../src/domain/situation-narrative";

// LOT 4 (mandat "Impact & Learning — de l'action à la valeur démontrable")
// — tests fonctionnels obligatoires A-N (§28 du mandat). Même discipline
// que field-mission.test.ts (LOT 3) : state frais à chaque test,
// applyCommand direct (la couche de permission est testée ailleurs).

const JOAL_SITUATION_ID = "sit-joal-glace-recurrence";
const IMMATRICULATION_INITIATIVE_ID = "init-immatriculation";
const IMMATRICULATION_RESULT_ID = "result-immatriculation-t1";
const IMMATRICULATION_OUTCOME_ID = "outcome-immatriculation-t1";

function bringJoalToResult(state = createDemoState()) {
  const situation = state.situations.find((item) => item.id === JOAL_SITUATION_ID)!;
  assert.equal(situation.status, "coordination", "précondition du test : la situation Joal démarre en coordination, sans résultat");
  const started = applyCommand(state, { type: "start_intervention", situationId: situation.id, actorId: "act-coordinateur" });
  const withResult = applyCommand(started, {
    type: "record_result",
    situationId: situation.id,
    actorId: "act-coordinateur",
    result: "La maintenance préventive a été réalisée sur le dispositif de production de glace.",
    confirmation: "Intervention technique consignée par le prestataire ayant réalisé l'entretien."
  });
  return { state: withResult, situationId: situation.id };
}

// TEST A — record_result produit/relie un Result canonique sans casser
// Situation legacy (mandat §7).
test("TEST A — record_result produit un Result canonique et conserve les champs Situation legacy", () => {
  const { state, situationId } = bringJoalToResult();
  const situation = state.situations.find((item) => item.id === situationId)!;

  // Legacy inchangé.
  assert.equal(situation.result, "La maintenance préventive a été réalisée sur le dispositif de production de glace.");
  assert.ok(situation.confirmation);
  assert.equal(situation.trust, "consolidee");

  // Result canonique produit dans le même geste.
  const results = resultsForSituation(state, situation);
  assert.equal(results.length, 1);
  const result = results[0];
  assert.equal(result.sourceRef.objectType, "situation");
  assert.equal(result.sourceRef.objectId, situationId);
  assert.equal(result.description, situation.result);
  assert.ok(result.evidenceRefs.length > 0, "le Result doit être relié à l'Evidence produite par record_result");
  const evidence = state.evidences.find((item) => item.id === result.evidenceRefs[0]);
  assert.ok(evidence);
});

// TEST B — Result ≠ Outcome : record_result ne crée jamais d'Outcome.
test("TEST B — Result ≠ Outcome, aucun changement observé n'est créé automatiquement", () => {
  const { state, situationId } = bringJoalToResult();
  const situation = state.situations.find((item) => item.id === situationId)!;
  const results = resultsForSituation(state, situation);
  const relatedOutcomes = outcomesForResults(state, results.map((item) => item.id));
  assert.equal(relatedOutcomes.length, 0, "aucun Outcome ne doit exister avant une décision humaine explicite (record_outcome)");
});

// TEST C — Outcome exige un Result source réel.
test("TEST C — record_outcome exige au moins un Result source réel", () => {
  const { state } = bringJoalToResult();
  assert.throws(() =>
    applyCommand(state, {
      type: "record_outcome",
      actorId: "act-coordinateur",
      title: "Changement observé",
      statement: "Aucune source réelle.",
      sourceResultIds: [],
      trust: "declaree",
      attribution: "non_etablie"
    })
  );
  assert.throws(() =>
    applyCommand(state, {
      type: "record_outcome",
      actorId: "act-coordinateur",
      title: "Changement observé",
      statement: "Source inexistante.",
      sourceResultIds: ["result-inexistant"],
      trust: "declaree",
      attribution: "non_etablie"
    })
  );
});

// TEST D — Outcome exige une attribution explicite (garde-fou domaine,
// au-delà du typage).
test("TEST D — record_outcome exige un niveau d'attribution explicite", () => {
  const { state } = bringJoalToResult();
  const result = state.results[0];
  // "as any" volontaire (pas @ts-expect-error) : ce test vérifie
  // spécifiquement le garde-fou d'exécution d'applyRecordOutcome, pas le
  // typage — attribution est déjà obligatoire au niveau du type, mais un
  // appelant pourrait le contourner (ex. dispatch depuis une source
  // moins strictement typée), d'où la double protection.
  const commandWithoutAttribution = {
    type: "record_outcome",
    actorId: "act-coordinateur",
    title: "Changement observé",
    statement: "Sans attribution.",
    sourceResultIds: [result.id],
    trust: "observee"
  } as unknown as Parameters<typeof applyCommand>[1];
  assert.throws(() => applyCommand(state, commandWithoutAttribution));
});

// TEST E — attribution directe exige une justification.
test("TEST E — une attribution directe exige une justification", () => {
  const { state } = bringJoalToResult();
  const result = state.results[0];
  assert.throws(() =>
    applyCommand(state, {
      type: "record_outcome",
      actorId: "act-coordinateur",
      title: "Changement observé",
      statement: "Amélioration constatée après l'intervention.",
      sourceResultIds: [result.id],
      trust: "observee",
      attribution: "directe"
    })
  );
  const withDirect = applyCommand(state, {
    type: "record_outcome",
    actorId: "act-coordinateur",
    title: "Changement observé",
    statement: "Amélioration constatée après l'intervention.",
    sourceResultIds: [result.id],
    trust: "observee",
    attribution: "directe",
    attributionJustification: "Le dispositif a été observé en fonctionnement immédiatement après l'intervention, sans autre facteur identifié dans l'intervalle."
  });
  assert.equal(withDirect.outcomes[0].attributionJustification, "Le dispositif a été observé en fonctionnement immédiatement après l'intervention, sans autre facteur identifié dans l'intervalle.");
});

function recordJoalOutcome(state: ReturnType<typeof createDemoState>) {
  const result = state.results.find((item) => item.sourceRef.objectId === JOAL_SITUATION_ID)!;
  return applyCommand(state, {
    type: "record_outcome",
    actorId: "act-coordinateur",
    title: "Reprise stable de la production de glace",
    statement: "La production de glace n'a plus connu d'interruption documentée depuis la maintenance préventive.",
    sourceResultIds: [result.id],
    trust: "observee",
    attribution: "contributive",
    limits: "D'autres facteurs saisonniers pourraient aussi expliquer la stabilité observée."
  });
}

// TEST F — Outcome ne crée aucun Impact automatiquement.
test("TEST F — record_outcome ne crée jamais d'ImpactEvidence", () => {
  const { state } = bringJoalToResult();
  const before = state.impactEvidences.length;
  const withOutcome = recordJoalOutcome(state);
  assert.equal(withOutcome.impactEvidences.length, before, "record_outcome ne doit jamais toucher state.impactEvidences");
});

// TEST G — un Impact peut honnêtement rester "à mesurer".
test("TEST G — record_impact peut créer un Impact avec le statut « à mesurer »", () => {
  const { state } = bringJoalToResult();
  const withOutcome = recordJoalOutcome(state);
  const outcome = withOutcome.outcomes[0];
  assert.throws(() =>
    applyCommand(withOutcome, {
      type: "record_impact",
      actorId: "act-coordinateur",
      title: "Effet territorial",
      statement: "Effet non encore établi.",
      outcomeId: "outcome-inexistant",
      attribution: "non_etablie",
      status: "a_mesurer"
    })
  );
  const withImpact = applyCommand(withOutcome, {
    type: "record_impact",
    actorId: "act-coordinateur",
    title: "Réduction des pertes liées aux ruptures de froid",
    statement: "Les éléments disponibles ne permettent pas encore de conclure sur une réduction mesurable des pertes.",
    outcomeId: outcome.id,
    attribution: "contributive",
    status: "a_mesurer"
  });
  assert.equal(withImpact.impactEvidences[0].status, "a_mesurer");
  assert.equal(withImpact.impactEvidences[0].outcomeId, outcome.id);
});

// TEST H — Learning : création humaine uniquement, jamais générée par le
// système (aucune autre commande ne touche state.learnings).
test("TEST H — aucun Learning n'est créé automatiquement par record_result/record_outcome/record_impact", () => {
  const { state } = bringJoalToResult();
  const learningsBefore = state.learnings.length;
  const withOutcome = recordJoalOutcome(state);
  const withImpact = applyCommand(withOutcome, {
    type: "record_impact",
    actorId: "act-coordinateur",
    title: "Effet territorial",
    statement: "À mesurer.",
    outcomeId: withOutcome.outcomes[0].id,
    attribution: "non_etablie",
    status: "a_mesurer"
  });
  assert.equal(withImpact.learnings.length, learningsBefore);
});

// TEST I — Learning conserve ses sources (au moins une exigée, résolue).
test("TEST I — record_learning exige et conserve une source réelle", () => {
  const { state, situationId } = bringJoalToResult();
  assert.throws(() =>
    applyCommand(state, {
      type: "record_learning",
      actorId: "act-coordinateur",
      title: "Apprentissage sans source",
      summary: "Ne doit jamais être accepté.",
      reusableIn: []
    })
  );
  assert.throws(() =>
    applyCommand(state, {
      type: "record_learning",
      actorId: "act-coordinateur",
      title: "Apprentissage",
      summary: "Situation inexistante.",
      reusableIn: [],
      situationId: "sit-inexistante"
    })
  );
  const withLearning = applyCommand(state, {
    type: "record_learning",
    actorId: "act-coordinateur",
    title: "Documenter la maintenance préventive avant la panne complète",
    summary: "Programmer une maintenance dès la récurrence d'un même symptôme évite d'attendre l'arrêt complet du dispositif.",
    context: "Suite à l'intervention sur le dispositif de production de glace de Joal.",
    reusableIn: ["mbour", "kayar"],
    situationId
  });
  const learning = withLearning.learnings[0];
  assert.equal(learning.situationId, situationId);
  assert.equal(learning.status, "propose", "statut par défaut, jamais fabriqué comme déjà validé");
});

// TEST J — les indicateurs d'un Programme ne créent jamais un Outcome
// automatiquement (mandat §8 : "current ≠ Outcome automatiquement").
test("TEST J — les indicators d'Initiative ne créent aucun Outcome, seul record_outcome le fait", () => {
  const state = createDemoState();
  const initiative = state.initiatives.find((item) => item.id === IMMATRICULATION_INITIATIVE_ID)!;
  assert.ok(initiative.indicators.length > 0, "précondition : le programme choisi a bien des indicateurs réels");
  // Un seul Outcome existe dans le Demo World pour ce programme — le
  // même nombre d'indicateurs (2) ne s'est jamais traduit en 2 Outcomes.
  const outcomesForInitiative = state.outcomes.filter((item) =>
    item.sourceResultIds.some((resultId) => state.results.find((result) => result.id === resultId)?.sourceRef.objectId === IMMATRICULATION_INITIATIVE_ID)
  );
  assert.equal(outcomesForInitiative.length, 1);
  assert.notEqual(outcomesForInitiative.length, initiative.indicators.length);
});

// TEST K — la Value Trail n'affiche que des objets réels : sans
// Result/Outcome/Impact/Learning, les 3 nouvelles étapes restent
// honnêtement non prouvées ; avec, elles pointent vers le contenu réel.
test("TEST K — la Value Trail étendue ne pointe que vers des objets réels", () => {
  const { state, situationId } = bringJoalToResult();
  const situation = state.situations.find((item) => item.id === situationId)!;
  const trailBefore = buildValueTrail(state, situation);
  const changementBefore = trailBefore.find((step) => step.key === "changement")!;
  assert.equal(changementBefore.proven, false);

  const withOutcome = recordJoalOutcome(state);
  const trailAfter = buildValueTrail(withOutcome, withOutcome.situations.find((item) => item.id === situationId)!);
  const changementAfter = trailAfter.find((step) => step.key === "changement")!;
  assert.equal(changementAfter.proven, true);
  assert.match(changementAfter.detail, /interruption/i);
  assert.match(changementAfter.detail, /contributive/i);

  const impactStep = trailAfter.find((step) => step.key === "impact")!;
  assert.equal(impactStep.proven, false, "un Outcome sans ImpactEvidence documentée reste « non encore mesuré »");
  assert.match(impactStep.detail, /non encore mesuré/i);
});

// TEST L — Joal reverse traceability : depuis l'Outcome, on retrouve le
// Result, puis la Situation source.
test("TEST L — reverse traceability Joal : Outcome → Result → Situation", () => {
  const { state, situationId } = bringJoalToResult();
  const withOutcome = recordJoalOutcome(state);
  const outcome = withOutcome.outcomes[0];
  const result = withOutcome.results.find((item) => item.id === outcome.sourceResultIds[0])!;
  assert.ok(result);
  assert.equal(result.sourceRef.objectType, "situation");
  const situation = withOutcome.situations.find((item) => item.id === result.sourceRef.objectId)!;
  assert.equal(situation.id, situationId);
});

// TEST M — Programme reverse traceability : depuis le Learning du
// Demo World, on retrouve l'Outcome, le Result et l'Initiative.
test("TEST M — reverse traceability Programme : Learning → Outcome → Result → Initiative", () => {
  const state = createDemoState();
  const learning = state.learnings.find((item) => item.initiativeId === IMMATRICULATION_INITIATIVE_ID)!;
  assert.ok(learning);
  assert.equal(learning.outcomeId, IMMATRICULATION_OUTCOME_ID);
  const outcome = state.outcomes.find((item) => item.id === learning.outcomeId)!;
  assert.ok(outcome);
  assert.deepEqual(outcome.sourceResultIds, [IMMATRICULATION_RESULT_ID]);
  const result = state.results.find((item) => item.id === outcome.sourceResultIds[0])!;
  assert.ok(result);
  assert.equal(result.sourceRef.objectType, "initiative");
  assert.equal(result.sourceRef.objectId, IMMATRICULATION_INITIATIVE_ID);
  const initiative = state.initiatives.find((item) => item.id === result.sourceRef.objectId)!;
  assert.equal(initiative.status, "execution");
});

// TEST N — non-régression LOTS 1-3 : vérifiée par ailleurs (suite
// complète, `npm test`) ; ce test ajoute une garantie ciblée que le
// Demo World reste cohérent après l'ajout du modèle LOT 4.
test("TEST N — le Demo World reste cohérent (aucune référence orpheline Result/Outcome/Learning)", () => {
  const state = createDemoState();
  const resultIds = new Set(state.results.map((item) => item.id));
  const situationIds = new Set(state.situations.map((item) => item.id));
  const initiativeIds = new Set(state.initiatives.map((item) => item.id));

  for (const result of state.results) {
    const exists = result.sourceRef.objectType === "situation" ? situationIds.has(result.sourceRef.objectId) : initiativeIds.has(result.sourceRef.objectId);
    assert.ok(exists, `Result ${result.id} référence ${result.sourceRef.objectType}:${result.sourceRef.objectId}, introuvable`);
  }
  for (const outcome of state.outcomes) {
    assert.ok(outcome.sourceResultIds.length > 0);
    outcome.sourceResultIds.forEach((id) => assert.ok(resultIds.has(id), `Outcome ${outcome.id} référence un Result introuvable`));
  }
  for (const learning of state.learnings) {
    const hasSource = Boolean(learning.situationId || learning.initiativeId || learning.outcomeId || learning.fieldMissionId || (learning.sourceRefs && learning.sourceRefs.length > 0));
    assert.ok(hasSource, `Learning ${learning.id} n'a aucune source`);
  }
});
