import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

// LOT 0.3 (mandat "aligner le Core métier avec le Blueprint V1") —
// scénario Kayar (§20) : plusieurs Signals/ServiceRequests de
// motorisation → Finding de récurrence → CollectiveNeed déjà qualifié
// dans le jeu de démonstration, sans aucune ProgramOpportunity ni
// Initiative pré-créée (la conversion reste une décision explicite).
test("le jeu de démonstration représente la chaîne Kayar jusqu'à un CollectiveNeed qualifié, sans conversion automatique", () => {
  const state = createDemoState();
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation");
  assert.ok(need, "le jeu de démonstration doit contenir le besoin collectif de référence Kayar");
  assert.equal(need!.status, "qualified");
  assert.ok(need!.sourceRefs.length >= 3);
  assert.ok(need!.knowledgeGapFindingIds && need!.knowledgeGapFindingIds.length > 0);

  const knowledgeGapFinding = state.findings.find((item) => item.id === need!.knowledgeGapFindingIds![0]);
  assert.ok(knowledgeGapFinding);
  assert.equal(knowledgeGapFinding!.type, "knowledge_gap");

  assert.equal(state.programOpportunities.length, 0, "aucune ProgramOpportunity ne doit être pré-créée pour ce besoin");
  assert.equal(state.initiatives.some((item) => item.programOpportunityId), false, "aucune Initiative ne doit être pré-convertie depuis une opportunité");
});

// TEST E (mandat §21) : plusieurs éléments cohérents de motorisation
// permettent de constituer un CollectiveNeed, sans aucune Initiative
// automatique.
test("create_collective_need constitue un besoin collectif depuis des sources réelles, sans budget ni Initiative automatique (TEST E)", () => {
  const state = createDemoState();
  const initiativesBefore = state.initiatives.length;

  const next = applyCommand(state, {
    type: "create_collective_need",
    actorId: "act-coordinateur",
    title: "Besoin collectif de test",
    territoryIds: ["kayar", "fass-boye"],
    affectedPopulation: "Capitaines et mareyeurs de test",
    sourceRefs: [
      { objectType: "service_request", objectId: "need-motorisation-kayar-1" },
      { objectType: "service_request", objectId: "need-motorisation-kayar-2" }
    ],
    consequences: ["Conséquence de test"],
    hypotheses: ["Hypothèse de test"],
    knowledgeGaps: []
  });

  const need = next.collectiveNeeds[0];
  assert.equal(need.status, "emerging");
  assert.equal(next.initiatives.length, initiativesBefore, "create_collective_need ne doit créer aucune Initiative");
  assert.equal(next.audit[0].objectType, "collective_need");
});

test("create_collective_need exige un territoire réel et au moins une source réelle", () => {
  const state = createDemoState();
  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_collective_need",
        actorId: "act-coordinateur",
        title: "Titre",
        territoryIds: [],
        affectedPopulation: "Population",
        sourceRefs: [{ objectType: "service_request", objectId: "need-motorisation-kayar-1" }],
        consequences: [],
        hypotheses: [],
        knowledgeGaps: []
      }),
    /au moins un territoire/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_collective_need",
        actorId: "act-coordinateur",
        title: "Titre",
        territoryIds: ["kayar"],
        affectedPopulation: "Population",
        sourceRefs: [],
        consequences: [],
        hypotheses: [],
        knowledgeGaps: []
      }),
    /au moins une source réelle/
  );
});

// TEST F (mandat §21) : CollectiveNeed qualifié → ProgramOpportunity créée,
// aucun budget obligatoire — ProgramOpportunity n'a d'ailleurs aucun champ
// de budget dans le modèle (le budget n'entre en jeu qu'à la conversion
// en Initiative, cf. tests/initiative.test.ts, TEST G).
test("create_program_opportunity exige un besoin collectif qualifié et ne requiert aucun budget (TEST F)", () => {
  const state = createDemoState();
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;

  const next = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: "Pannes et difficultés d'entretien moteur récurrentes",
    justification: "Récurrence confirmée par le constat fnd-kayar-motorisation",
    territoryIds: need.territoryIds,
    potentialBeneficiaries: "Capitaines et mareyeurs de Kayar et Fass Boye",
    evidenceRefs: need.sourceRefs,
    hypotheses: need.hypotheses,
    knowledgeGaps: need.knowledgeGaps,
    possibleInterventions: ["Atelier d'entretien moteur mutualisé"],
    desiredOutcomes: ["Réduction du nombre de pannes déclarées"],
    possibleIndicators: [{ label: "Pannes déclarées par mois", unit: "pannes" }],
    maturity: "moyenne"
  });

  const opportunity = next.programOpportunities[0];
  assert.equal(opportunity.status, "detected");
  assert.equal(opportunity.collectiveNeedId, need.id);
  assert.equal("budgetFcfa" in opportunity, false, "ProgramOpportunity ne porte aucun champ de budget");
  assert.equal(next.collectiveNeeds.find((item) => item.id === need.id)?.status, "converted");
});

test("create_program_opportunity refuse un besoin collectif non qualifié", () => {
  let state = createDemoState();
  state = applyCommand(state, {
    type: "create_collective_need",
    actorId: "act-coordinateur",
    title: "Besoin émergent",
    territoryIds: ["kayar"],
    affectedPopulation: "Population",
    sourceRefs: [{ objectType: "service_request", objectId: "need-motorisation-kayar-1" }],
    consequences: [],
    hypotheses: [],
    knowledgeGaps: []
  });
  const need = state.collectiveNeeds[0];
  assert.equal(need.status, "emerging");

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_program_opportunity",
        actorId: "act-coordinateur",
        collectiveNeedId: need.id,
        problem: "Problème",
        justification: "Justification",
        territoryIds: ["kayar"],
        potentialBeneficiaries: "Population",
        evidenceRefs: [],
        hypotheses: [],
        knowledgeGaps: [],
        possibleInterventions: [],
        desiredOutcomes: [],
        possibleIndicators: [],
        maturity: "faible"
      }),
    /Seul un besoin collectif qualifié/
  );
});

test("update_collective_need_status refuse de modifier un besoin déjà converti", () => {
  let state = createDemoState();
  const need = state.collectiveNeeds.find((item) => item.id === "cn-kayar-motorisation")!;
  state = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: "Problème",
    justification: "Justification",
    territoryIds: need.territoryIds,
    potentialBeneficiaries: "Population",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: [],
    desiredOutcomes: [],
    possibleIndicators: [],
    maturity: "faible"
  });

  assert.throws(
    () => applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "monitored" }),
    /déjà converti/
  );
});
