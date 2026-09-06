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

// LOT 0.1 (mandat "aligner le Core métier avec le Blueprint V1", TEST A) :
// create_signal ne crée plus qu'un Signal — comportement canonique du
// Core devenu "Signal ≠ Situation".
test("un nouveau signal reçoit des identifiants uniques, reste déclaratif, et ne crée plus de situation (TEST A)", () => {
  const state = createDemoState();
  const situationsBefore = state.situations.length;
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
  assert.equal(second.situations.length, situationsBefore, "create_signal ne doit créer aucune situation");
  assert.notEqual(first.signals[0].id, second.signals[0].id);
  assert.equal(second.signals[0].trust, "declaree");
  assert.equal(second.signals[0].disposition, "nouveau");
});

// Wrapper legacy explicite (mandat §5) : reproduit l'ancien comportement
// couplé, à l'identique, pour les parcours qui expriment réellement
// l'intention d'ouvrir un dossier tout de suite.
test("report_signal_and_open_situation reproduit le comportement couplé legacy (Signal + Situation)", () => {
  const state = createDemoState();
  const command = {
    type: "report_signal_and_open_situation" as const,
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
  assert.equal(second.signals[0].disposition, "oriente_situation");
  assert.deepEqual(second.situations[0].signalIds, [second.signals[0].id]);
});

test("un message entrant simulé se convertit en signal en conservant l'auteur apparent (reportedBy)", () => {
  const state = createDemoState();
  const message = state.incomingMessages.find((item) => item.status === "nouveau");
  assert.ok(message, "le seed doit contenir au moins un message entrant non converti");

  const next = applyCommand(state, {
    type: "convert_message_to_signal",
    actorId: "act-coordinateur",
    messageId: message!.id,
    territoryId: "joal",
    category: "infrastructure",
    title: "Difficulté rapportée par message entrant",
    description: "Description qualifiée par le coordinateur à partir du message."
  });

  const convertedMessage = next.incomingMessages.find((item) => item.id === message!.id);
  assert.equal(convertedMessage?.status, "converti");

  const createdSignal = next.signals[0];
  assert.equal(createdSignal.reportedBy, message!.reportedBy);
  assert.equal(createdSignal.actorId, "act-coordinateur");
  assert.equal(createdSignal.channel, message!.channel);
  assert.equal(createdSignal.category, "infrastructure");
  assert.equal(next.situations[0].status, "recue");

  // Un message déjà converti ne peut pas l'être une seconde fois.
  assert.throws(
    () => applyCommand(next, {
      type: "convert_message_to_signal",
      actorId: "act-coordinateur",
      messageId: message!.id,
      territoryId: "joal",
      category: "infrastructure",
      title: "Nouvelle tentative",
      description: "Ne doit pas être acceptée."
    }),
    /déjà été converti/
  );
});
