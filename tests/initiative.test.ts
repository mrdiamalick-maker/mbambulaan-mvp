import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

const formationRequestIds = ["need-formation-mbour", "need-formation-joal", "need-formation-saint-louis"];

// LOT 0.3 (mandat "aligner le Core métier avec le Blueprint V1", §12) :
// créer un programme ne marque plus automatiquement les demandes
// regroupées comme "couvert" — "Elles ne deviennent couvertes que
// lorsqu'une intervention/résolution répond effectivement au besoin."
test("un programme peut être créé en regroupant une grappe de demandes de même intention (Lot 5), sans les marquer couvertes (LOT 0.3)", () => {
  const state = createDemoState();
  const before = state.initiatives.length;

  const next = applyCommand(state, {
    type: "create_initiative",
    actorId: "act-coordinateur",
    title: "Programme de formation à la manipulation post-capture",
    objective: "Réduire les pertes qualité entre le débarquement et la mise en marché sur trois territoires",
    budgetFcfa: 12000000,
    serviceRequestIds: formationRequestIds
  });

  assert.equal(next.initiatives.length, before + 1);
  const initiative = next.initiatives[0];
  assert.equal(initiative.status, "cadrage");
  assert.equal(initiative.ownerId, "act-coordinateur");
  assert.equal(initiative.funding.length, 0);
  assert.equal(initiative.budgetStatus, "estime");
  assert.deepEqual(initiative.serviceRequestIds, formationRequestIds);
  assert.deepEqual(new Set(initiative.territoryIds), new Set(["mbour", "joal", "saint-louis"]));

  for (const requestId of formationRequestIds) {
    assert.equal(next.serviceRequests.find((item) => item.id === requestId)?.status, "ouvert", `${requestId} doit rester ouvert — créer un programme ne couvre pas les demandes sources`);
  }
  assert.equal(next.audit[0].objectType, "initiative");
});

// LOT 0.3 (mandat §13) : le budget n'est plus obligatoire en phase de
// cadrage — budgetStatus "a_estimer" par défaut si aucun montant n'est
// fourni.
test("un programme en cadrage peut être créé sans budget chiffré (budgetStatus a_estimer, LOT 0.3)", () => {
  const state = createDemoState();

  const next = applyCommand(state, {
    type: "create_initiative",
    actorId: "act-coordinateur",
    title: "Programme de formation à la manipulation post-capture",
    objective: "Réduire les pertes qualité entre le débarquement et la mise en marché sur trois territoires",
    serviceRequestIds: formationRequestIds
  });

  const initiative = next.initiatives[0];
  assert.equal(initiative.budgetFcfa, undefined);
  assert.equal(initiative.budgetStatus, "a_estimer");
  assert.equal(initiative.status, "cadrage");
});

test("un programme exige un titre, un objectif, et un budget positif quand il est renseigné", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "   ",
        objective: "Objectif",
        budgetFcfa: 1000,
        serviceRequestIds: formationRequestIds
      }),
    /titre du programme est obligatoire/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "   ",
        budgetFcfa: 1000,
        serviceRequestIds: formationRequestIds
      }),
    /objectif du programme est obligatoire/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif",
        budgetFcfa: 0,
        serviceRequestIds: formationRequestIds
      }),
    /budget, s'il est renseigné, doit être positif/
  );
});

test("un programme doit regrouper au moins deux demandes distinctes, réellement ouvertes et de même intention", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif",
        budgetFcfa: 1000000,
        serviceRequestIds: ["need-formation-mbour"]
      }),
    /au moins deux demandes distinctes/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif",
        budgetFcfa: 1000000,
        serviceRequestIds: ["need-formation-mbour", "demande-inconnue"]
      }),
    /Demande de service introuvable/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif",
        budgetFcfa: 1000000,
        // need-maquereau-hann est déjà "couvert" dans les données de démonstration
        serviceRequestIds: ["need-formation-mbour", "need-maquereau-hann"]
      }),
    /n'est plus ouverte/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif",
        budgetFcfa: 1000000,
        // need-thiof est "achat", need-formation-mbour est "formation"
        serviceRequestIds: ["need-formation-mbour", "need-thiof"]
      }),
    /même intention/
  );
});

// LOT 0.3 : les deux voies de création (serviceRequestIds / programOpportunityId)
// sont mutuellement exclusives — une seule commande, jamais les deux
// sources, jamais aucune.
test("un programme se crée depuis des demandes regroupées OU une opportunité de programme, jamais les deux ni aucune des deux", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif"
      }),
    /soit depuis des demandes regroupées, soit depuis une opportunité de programme/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif",
        serviceRequestIds: formationRequestIds,
        programOpportunityId: "popp-inexistante"
      }),
    /soit depuis des demandes regroupées, soit depuis une opportunité de programme/
  );
});

// TEST G (mandat §21) : conversion explicite ProgramOpportunity →
// Initiative. Construit son propre CollectiveNeed/ProgramOpportunity
// qualifiés via le pipeline de connaissance plutôt que de dépendre d'une
// fixture pré-créée dans le jeu de démonstration — cn-kayar-motorisation
// (demo-state.ts) existe déjà à l'état "qualified" et sert le même
// scénario dans tests/collective-need.test.ts.
test("une ProgramOpportunity qualifiée peut être convertie explicitement en Initiative en cadrage, sans couvrir les demandes sources (TEST G)", () => {
  let state = createDemoState();

  state = applyCommand(state, {
    type: "create_collective_need",
    actorId: "act-coordinateur",
    title: "Besoin collectif de test",
    territoryIds: ["joal"],
    affectedPopulation: "Quelques capitaines de Joal",
    sourceRefs: [{ objectType: "service_request", objectId: "need-formation-joal" }],
    consequences: ["Sorties réduites"],
    hypotheses: ["Hypothèse de test"],
    knowledgeGaps: []
  });
  const need = state.collectiveNeeds[0];

  state = applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "qualifying" });
  state = applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "qualified" });

  state = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: "Problème de test",
    justification: "Justification de test",
    territoryIds: ["joal"],
    potentialBeneficiaries: "Capitaines de Joal",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: ["Intervention de test"],
    desiredOutcomes: ["Résultat de test"],
    possibleIndicators: [],
    maturity: "moyenne"
  });
  const opportunity = state.programOpportunities[0];
  assert.equal(opportunity.status, "detected");
  assert.equal(state.collectiveNeeds.find((item) => item.id === need.id)?.status, "converted");

  state = applyCommand(state, { type: "update_program_opportunity_status", programOpportunityId: opportunity.id, actorId: "act-coordinateur", status: "qualifying" });
  state = applyCommand(state, { type: "update_program_opportunity_status", programOpportunityId: opportunity.id, actorId: "act-coordinateur", status: "qualified" });

  const requestStatusBefore = state.serviceRequests.find((item) => item.id === "need-formation-joal")?.status;
  assert.equal(requestStatusBefore, "ouvert");

  const next = applyCommand(state, {
    type: "create_initiative",
    actorId: "act-coordinateur",
    title: "Programme converti depuis une opportunité",
    objective: "Objectif du programme converti",
    programOpportunityId: opportunity.id
  });

  const initiative = next.initiatives[0];
  assert.equal(initiative.status, "cadrage");
  assert.equal(initiative.budgetStatus, "a_estimer");
  assert.equal(initiative.budgetFcfa, undefined);
  assert.equal(initiative.programOpportunityId, opportunity.id);
  assert.equal(next.programOpportunities.find((item) => item.id === opportunity.id)?.status, "converted_to_program");

  // Critère obligatoire (mandat §12) : la demande source du CollectiveNeed
  // (need-formation-joal) reste ouverte — la conversion en Initiative ne
  // la couvre pas.
  assert.equal(next.serviceRequests.find((item) => item.id === "need-formation-joal")?.status, "ouvert");
});

test("une ProgramOpportunity encore détectée (non qualifiée) ne peut pas devenir un programme", () => {
  let state = createDemoState();
  state = applyCommand(state, {
    type: "create_collective_need",
    actorId: "act-coordinateur",
    title: "Besoin collectif de test",
    territoryIds: ["joal"],
    affectedPopulation: "Quelques capitaines de Joal",
    sourceRefs: [{ objectType: "service_request", objectId: "need-formation-joal" }],
    consequences: [],
    hypotheses: [],
    knowledgeGaps: []
  });
  const need = state.collectiveNeeds[0];
  state = applyCommand(state, { type: "update_collective_need_status", collectiveNeedId: need.id, actorId: "act-coordinateur", status: "qualified" });
  state = applyCommand(state, {
    type: "create_program_opportunity",
    actorId: "act-coordinateur",
    collectiveNeedId: need.id,
    problem: "Problème",
    justification: "Justification",
    territoryIds: ["joal"],
    potentialBeneficiaries: "Capitaines",
    evidenceRefs: [],
    hypotheses: [],
    knowledgeGaps: [],
    possibleInterventions: [],
    desiredOutcomes: ["Résultat recherché"],
    possibleIndicators: [],
    maturity: "faible"
  });
  const opportunity = state.programOpportunities[0];

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_initiative",
        actorId: "act-coordinateur",
        title: "Titre",
        objective: "Objectif",
        programOpportunityId: opportunity.id
      }),
    /n'est pas encore prête à devenir un programme/
  );
});
