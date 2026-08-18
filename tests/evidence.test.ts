import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

test("une preuve est un objet de première classe rattaché à sa situation et, si fourni, à un engagement réel", () => {
  const state = createDemoState();
  const before = state.evidences.length;

  const next = applyCommand(state, {
    type: "record_evidence",
    situationId: "sit-glace",
    actorId: "act-prestataire",
    evidenceType: "bordereau",
    label: "Bordereau de réparation",
    detail: "Pièce remplacée et compresseur remis en service à 80 % de capacité.",
    commitmentId: "eng-1"
  });

  assert.equal(next.evidences.length, before + 1);
  const evidence = next.evidences[0];
  assert.equal(evidence.situationId, "sit-glace");
  assert.equal(evidence.commitmentId, "eng-1");
  assert.equal(evidence.type, "bordereau");
  assert.ok(evidence.recordedAt);

  const situation = next.situations.find((item) => item.id === "sit-glace");
  assert.match(situation!.history[0].label, /Preuve enregistrée/);
  assert.equal(next.audit[0].objectType, "preuve");
});

test("une preuve exige une situation existante, un contenu et un engagement réel s'il est référencé", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "record_evidence",
        situationId: "sit-inconnue",
        actorId: "act-prestataire",
        evidenceType: "photo",
        label: "x",
        detail: "y"
      }),
    /Situation introuvable/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "record_evidence",
        situationId: "sit-glace",
        actorId: "act-prestataire",
        evidenceType: "photo",
        label: "  ",
        detail: "y"
      }),
    /libellé et le détail/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "record_evidence",
        situationId: "sit-glace",
        actorId: "act-prestataire",
        evidenceType: "photo",
        label: "x",
        detail: "y",
        commitmentId: "eng-inconnu"
      }),
    /Engagement introuvable/
  );
});

test("le scénario canonique Joal porte déjà des preuves rattachées à ses engagements", () => {
  const state = createDemoState();
  const joalEvidences = state.evidences.filter((item) => item.situationId === "sit-glace");
  assert.ok(joalEvidences.length >= 2, "la situation Joal / chaîne du froid doit porter au moins deux preuves de démonstration");
  joalEvidences.forEach((item) => {
    if (item.commitmentId) {
      assert.ok(
        state.coordinationSpaces.some((space) => space.commitments.some((commitment) => commitment.id === item.commitmentId))
      );
    }
  });
});
