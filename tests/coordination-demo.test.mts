import assert from "node:assert/strict";
import test from "node:test";
import {
  cloneInitialSituations,
  computeDecisionMetrics,
  DEMO_SITUATION_ID,
  situationStatuses,
  validateSituation,
  type Situation
} from "../src/lib/coordination-demo.ts";

test("le jeu déterministe couvre les sept statuts utilisateurs", () => {
  const situations = cloneInitialSituations();
  const statuses = new Set(situations.map((item) => item.status));
  assert.deepEqual([...statuses].sort(), [...situationStatuses].sort());
});

test("la situation principale démarre au quai de Mbao avec une prochaine étape", () => {
  const situation = cloneInitialSituations().find((item) => item.id === DEMO_SITUATION_ID);
  assert.ok(situation);
  assert.equal(situation.site, "Quai de débarquement de Mbao");
  assert.equal(situation.title, "Machine à glace en panne");
  assert.equal(situation.status, "Reçu");
  assert.ok(situation.nextStep);
  assert.equal(validateSituation(situation).length, 0);
});

test("une prise en charge sans responsable est refusée", () => {
  const situation = {
    ...cloneInitialSituations()[0],
    status: "Pris en charge",
    responsible: undefined
  } satisfies Situation;
  assert.match(validateSituation(situation).join(" "), /responsable/);
});

test("une intervention prévue sans échéance est refusée", () => {
  const situation = {
    ...cloneInitialSituations()[0],
    status: "Intervention prévue",
    responsible: "Mamadou Ndiaye",
    dueAt: undefined
  } satisfies Situation;
  assert.match(validateSituation(situation).join(" "), /échéance/);
});

test("une attente sans motif est refusée", () => {
  const situation = {
    ...cloneInitialSituations()[0],
    status: "En attente",
    responsible: "Mamadou Ndiaye",
    dueAt: "2026-07-24T11:00:00+00:00",
    waitingReason: undefined
  } satisfies Situation;
  assert.match(validateSituation(situation).join(" "), /motif/);
});

test("une clôture exige résultat, date et élément de confirmation", () => {
  const situation = {
    ...cloneInitialSituations()[0],
    status: "Réglé",
    responsible: "Mamadou Ndiaye",
    dueAt: "2026-07-24T11:00:00+00:00",
    resultNote: undefined,
    completedAt: undefined,
    confirmation: undefined
  } satisfies Situation;
  assert.match(validateSituation(situation).join(" "), /résultat/);
});

test("les indicateurs décideur sont calculés à partir du même jeu de situations", () => {
  const metrics = computeDecisionMetrics(cloneInitialSituations());
  assert.equal(metrics.total, 7);
  assert.equal(metrics.solved, 1);
  assert.equal(metrics.waiting, 1);
  assert.ok(metrics.critical > 0);
});
