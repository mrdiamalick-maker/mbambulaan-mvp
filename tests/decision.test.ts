import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";

test("une décision est un objet de première classe rattaché à sa situation", () => {
  const state = createDemoState();
  const before = state.decisions.length;

  const next = applyCommand(state, {
    type: "create_decision",
    situationId: "sit-glace",
    actorId: "act-coordinateur",
    decisionType: "lancer_intervention",
    rationale: "Panne confirmée par le poste de quai, intervention technique à engager sans délai."
  });

  assert.equal(next.decisions.length, before + 1);
  const decision = next.decisions[0];
  assert.equal(decision.situationId, "sit-glace");
  assert.equal(decision.type, "lancer_intervention");
  assert.equal(decision.decidedByActorId, "act-coordinateur");
  assert.ok(decision.decidedAt);

  const situation = next.situations.find((item) => item.id === "sit-glace");
  assert.ok(situation);
  assert.match(situation!.history[0].label, /Décision enregistrée/);

  assert.equal(next.audit[0].objectType, "decision");
  assert.equal(next.audit[0].objectId, decision.id);
});

test("une décision exige une situation existante et une justification", () => {
  const state = createDemoState();

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_decision",
        situationId: "sit-inconnue",
        actorId: "act-coordinateur",
        decisionType: "informer",
        rationale: "Peu importe"
      }),
    /Situation introuvable/
  );

  assert.throws(
    () =>
      applyCommand(state, {
        type: "create_decision",
        situationId: "sit-glace",
        actorId: "act-coordinateur",
        decisionType: "informer",
        rationale: "   "
      }),
    /justification/
  );
});

test("le tenant de démonstration porte déjà des décisions rattachées au scénario Joal", () => {
  const state = createDemoState();
  const joalDecisions = state.decisions.filter((item) => item.situationId === "sit-glace");
  assert.ok(joalDecisions.length >= 2, "la situation Joal / chaîne du froid doit porter au moins deux décisions de démonstration");
});
