import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

const formationRequestIds = ["need-formation-mbour", "need-formation-joal", "need-formation-saint-louis"];

test("un programme peut être créé en regroupant une grappe de demandes de même intention (Lot 5)", () => {
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
  assert.deepEqual(new Set(initiative.territoryIds), new Set(["mbour", "joal", "saint-louis"]));

  for (const requestId of formationRequestIds) {
    assert.equal(next.serviceRequests.find((item) => item.id === requestId)?.status, "couvert");
  }
  assert.equal(next.audit[0].objectType, "initiative");
});

test("un programme exige un titre, un objectif et un budget positif", () => {
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
    /budget doit être positif/
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
