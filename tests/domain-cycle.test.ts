import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand, availableAction, validateSituation } from "../src/domain/rules";

test("le cycle complet impose ses validations et conserve son historique", () => {
  let state = createDemoState();
  const id = "sit-glace";
  const actorId = "act-coordinateur";

  assert.equal(availableAction(state.situations[0].status), "qualify");
  state = applyCommand(state, { type: "qualify", situationId: id, actorId });
  assert.equal(state.situations[0].status, "qualification");
  assert.equal(state.situations[0].trust, "verifiee");

  state = applyCommand(state, { type: "prioritize", situationId: id, actorId });
  assert.equal(state.situations[0].status, "priorisee");
  assert.equal(state.situations[0].priority, "critique");

  state = applyCommand(state, { type: "coordinate", situationId: id, actorId });
  assert.equal(state.situations[0].status, "coordination");
  assert.equal(state.situations[0].responsibleId, actorId);
  assert.ok(state.situations[0].dueAt);

  state = applyCommand(state, { type: "start_intervention", situationId: id, actorId });
  assert.equal(state.situations[0].status, "intervention");

  assert.throws(
    () => applyCommand(state, { type: "wait", situationId: id, actorId, reason: "" }),
    /motif d’attente/
  );
  state = applyCommand(state, { type: "wait", situationId: id, actorId, reason: "Pièce en acheminement" });
  assert.equal(state.situations[0].status, "attente");
  assert.equal(state.situations[0].waitingReason, "Pièce en acheminement");

  state = applyCommand(state, { type: "resume", situationId: id, actorId });
  assert.equal(state.situations[0].status, "intervention");
  assert.equal(state.situations[0].waitingReason, undefined);

  assert.throws(
    () => applyCommand(state, { type: "record_result", situationId: id, actorId, result: "", confirmation: "" }),
    /résultat/
  );
  state = applyCommand(state, {
    type: "record_result",
    situationId: id,
    actorId,
    result: "Machine remise en service",
    confirmation: "Constat signé du poste de quai"
  });
  assert.equal(state.situations[0].status, "resultat");
  assert.equal(state.situations[0].result, "Machine remise en service");
  assert.equal(state.situations[0].confirmation, "Constat signé du poste de quai");

  // D10 (PRODUCT_DECISION_LOG.md) : record_result produit désormais
  // aussi une Evidence réelle de type "confirmation" — additif, ne
  // remplace pas record_evidence.
  const resultEvidence = state.evidences.find((item) => item.situationId === id && item.type === "confirmation");
  assert.ok(resultEvidence, "record_result doit produire une Evidence de type confirmation");
  assert.match(resultEvidence!.detail, /Machine remise en service/);
  assert.equal(resultEvidence!.recordedByActorId, actorId);

  state = applyCommand(state, { type: "close", situationId: id, actorId });
  assert.equal(state.situations[0].status, "reglee");
  assert.match(state.situations[0].nextStep, /apprentissage/);
  assert.equal(state.situations[0].history.length, 9);
  assert.equal(state.audit.length, 8);
  validateSituation(state.situations[0]);
});

test("un nouveau signal reçoit des identifiants uniques et reste déclaratif", () => {
  const state = createDemoState();
  const command = {
    type: "create_signal" as const,
    actorId: "act-operateur",
    territoryId: "joal",
    title: "Nouvelle difficulté terrain",
    description: "Information recueillie au poste de quai",
    channel: "poste_quai" as const
  };
  const first = applyCommand(state, command);
  const second = applyCommand(first, command);
  assert.notEqual(first.situations[0].id, second.situations[0].id);
  assert.notEqual(first.signals[0].id, second.signals[0].id);
  assert.equal(second.situations[0].trust, "declaree");
  assert.equal(second.situations[0].status, "recue");
});
