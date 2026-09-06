import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

test("une mission terrain planifiée devient un Commitment réel dans une coordination (D2)", () => {
  const state = createDemoState();
  const before = state.coordinationSpaces.length;

  const next = applyCommand(state, {
    type: "plan_field_commitment",
    actorId: "act-institution",
    territoryId: "joal",
    title: "Rencontre avec les capitaines de Joal",
    objective: "Rencontre avec des pêcheurs et capitaines",
    dueAt: "2026-08-15T09:00:00.000Z"
  });

  assert.equal(next.coordinationSpaces.length, before + 1);
  const coordination = next.coordinationSpaces[0];
  assert.equal(coordination.title, "Rencontre avec les capitaines de Joal");
  assert.equal(coordination.commitments.length, 1);
  assert.equal(coordination.commitments[0].actorId, "act-institution");
  assert.equal(coordination.commitments[0].status, "a_faire");
  assert.equal(next.audit[0].objectType, "commitment");
});

test("une mission terrain peut être rattachée à une situation existante", () => {
  const state = createDemoState();
  const next = applyCommand(state, {
    type: "plan_field_commitment",
    actorId: "act-institution",
    territoryId: "joal",
    title: "Vérification du signalement",
    objective: "Vérification d'un signalement de vigilance",
    dueAt: "2026-08-15T09:00:00.000Z",
    situationId: "sit-glace"
  });
  assert.equal(next.coordinationSpaces[0].situationId, "sit-glace");
});

test("une mission terrain exige un territoire réel, un titre et une situation réelle si référencée", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "plan_field_commitment",
        actorId: "act-institution",
        territoryId: "territoire-inconnu",
        title: "x",
        objective: "y",
        dueAt: "2026-08-15T09:00:00.000Z"
      }),
    /Territoire inconnu/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "plan_field_commitment",
        actorId: "act-institution",
        territoryId: "joal",
        title: "  ",
        objective: "y",
        dueAt: "2026-08-15T09:00:00.000Z"
      }),
    /titre de la mission/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "plan_field_commitment",
        actorId: "act-institution",
        territoryId: "joal",
        title: "x",
        objective: "y",
        dueAt: "2026-08-15T09:00:00.000Z",
        situationId: "sit-inconnue"
      }),
    /Situation introuvable/
  );
});
