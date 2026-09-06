import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

test("une communication consignée est toujours étiquetée simulée (D5)", () => {
  const state = createDemoState();
  const before = state.communications.length;

  const next = applyCommand(state, {
    type: "log_communication",
    actorId: "act-coordinateur",
    channel: "whatsapp",
    subject: "Point d'étape chaîne du froid",
    body: "Message simulé de suivi envoyé au prestataire froid.",
    situationId: "sit-glace"
  });

  assert.equal(next.communications.length, before + 1);
  const communication = next.communications[0];
  assert.equal(communication.simulated, true);
  assert.equal(communication.status, "envoye");
  assert.equal(communication.situationId, "sit-glace");

  const situation = next.situations.find((item) => item.id === "sit-glace");
  assert.match(situation!.history[0].label, /Communication consignée \(simulée\)/);
  assert.equal(next.audit[0].objectType, "communication");
  assert.match(next.audit[0].detail, /simulée/);
});

test("une communication peut être consignée sans situation rattachée", () => {
  const state = createDemoState();
  const next = applyCommand(state, {
    type: "log_communication",
    actorId: "act-coordinateur",
    channel: "telephone",
    subject: "Prise de contact",
    body: "Appel simulé hors dossier ouvert."
  });
  assert.equal(next.communications[0].situationId, undefined);
});

test("une communication exige un contenu, une situation réelle et un engagement réel s'ils sont référencés", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "log_communication",
        actorId: "act-coordinateur",
        channel: "sms",
        subject: "  ",
        body: "x"
      }),
    /objet et le contenu/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "log_communication",
        actorId: "act-coordinateur",
        channel: "sms",
        subject: "x",
        body: "y",
        situationId: "sit-inconnue"
      }),
    /Situation introuvable/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "log_communication",
        actorId: "act-coordinateur",
        channel: "sms",
        subject: "x",
        body: "y",
        commitmentId: "eng-inconnu"
      }),
    /Engagement introuvable/
  );
});

test("le scénario canonique Joal illustre déjà l'origine omnicanale simulée", () => {
  const state = createDemoState();
  const joalCommunications = state.communications.filter((item) => item.situationId === "sit-glace");
  assert.ok(joalCommunications.length >= 2, "la situation Joal / chaîne du froid doit porter au moins deux communications de démonstration");
  joalCommunications.forEach((item) => assert.equal(item.simulated, true));
});
