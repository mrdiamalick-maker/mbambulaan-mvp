import assert from "node:assert/strict";
import test from "node:test";
import { getSituationPrimaryAction } from "../src/v3-template/data/roles";
import { DEMO_STATE } from "../src/v3-template/lib/demo-state";
import { buildSituationRows, getSituationDetail } from "../src/v3-template/lib/situations-bridge";

test("les actions primaires respectent les responsabilités des trois perspectives", () => {
  assert.deepEqual(getSituationPrimaryAction("ministre"), { label: "Décider", mode: "decision" });
  assert.deepEqual(getSituationPrimaryAction("programme"), { label: "Transmettre", mode: "transmit" });
  assert.deepEqual(getSituationPrimaryAction("coordination"), { label: "Instruire / Qualifier", mode: "qualify" });
});

test("le résumé d'une situation expose les décisions réellement enregistrées", () => {
  const recorded = DEMO_STATE.decisions[0];
  assert.ok(recorded, "le Demo World doit contenir une décision traçable");

  const row = buildSituationRows(DEMO_STATE).find((item) => item.realId === recorded.situationId);
  assert.ok(row, "la situation décidée doit être projetée dans la liste V5");

  const detail = getSituationDetail(row.id, DEMO_STATE);
  const expectedCount = DEMO_STATE.decisions.filter((item) => item.situationId === recorded.situationId).length;
  assert.equal(detail?.decisionCount, expectedCount);
  assert.ok(detail?.latestDecisionLabel);
  assert.ok(detail?.latestDecisionRationale);
});
