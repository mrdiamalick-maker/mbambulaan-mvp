import assert from "node:assert/strict";
import test from "node:test";
import { ARB } from "../src/v3-template/data/arbitrages";
import { getArbitragePrimaryAction } from "../src/v3-template/data/roles";
import { buildDocument } from "../src/v3-template/lib/document-bridge";
import { getProgrammeSynthesis } from "../src/v3-template/lib/programme-bridge";

test("les actions d'arbitrage respectent les responsabilités institutionnelles", () => {
  assert.deepEqual(getArbitragePrimaryAction("ministre"), { label: "Valider / Décider", mode: "decision" });
  assert.deepEqual(getArbitragePrimaryAction("programme"), { label: "Transmettre", mode: "transmit" });
  assert.deepEqual(getArbitragePrimaryAction("coordination"), { label: "Instruire", mode: "instruct" });
});

test("chaque option d'arbitrage porte un type de décision canonique", () => {
  for (const arbitrage of ARB) {
    for (const option of arbitrage.options) assert.ok(option.decisionType);
  }
  assert.equal(ARB[0].situationId, "sit-glace");
  assert.equal(ARB[1].situationId, "sit-mbour");
  assert.equal(ARB[2].situationId, undefined, "aucune fausse Situation ne doit être créée pour l'arbitrage Programme");
});

test("la décision attendue d'un programme vient d'un arbitrage préparé, jamais de sa seule priorité", () => {
  const cold = getProgrammeSynthesis("Résilience de la chaîne du froid · Petite-Côte");
  const registry = getProgrammeSynthesis("Référentiel progressif des pirogues et immatriculations");
  const capVert = getProgrammeSynthesis("Qualité, immatriculations et flux · Cap-Vert");

  // etat-v5 checkpoint F — ARB[0] (sit-glace) porte déjà une Decision
  // réelle dans DEMO_STATE (dec-glace-1/2) : getProgrammeSynthesis ne le
  // présente plus comme "attendu" (voir programme-bridge.ts) et retient
  // ARB[1], le second arbitrage préparé pour ce même programme, resté
  // réellement ouvert. Avant ce correctif, ce test pinçait l'ancien
  // comportement (ARB[0] toujours affiché), devenu incohérent avec la
  // doctrine déjà appliquée par la Présentation et la Note de décision
  // (checkpoint E).
  assert.equal(cold.decisionExpected, ARB[1].title);
  assert.equal(cold.decisionMaker, ARB[1].decider);
  assert.equal(cold.deadline, `${ARB[1].due} · ${ARB[1].urgency}`);
  assert.equal(registry.decisionExpected, ARB[2].title);
  assert.equal(capVert.decisionExpected, undefined);
});

test("une décision déjà enregistrée ne réapparaît plus comme décision attendue d'un programme (checkpoint F)", () => {
  // DEMO_STATE : ARB[0] (sit-glace) décidé, ARB[1] (sit-mbour) ouvert —
  // tous deux préparés pour "Résilience de la chaîne du froid".
  const cold = getProgrammeSynthesis("Résilience de la chaîne du froid · Petite-Côte");
  assert.notEqual(cold.decisionExpected, ARB[0].title, "un arbitrage déjà décidé ne doit plus être présenté comme une décision de programme attendue");
});

test("la note de décision reste liée à l'arbitrage actuellement ouvert", () => {
  const note = buildDocument({ type: "decision", arbitrageIndex: 1 }, "Option retenue après revue humaine.");

  assert.equal(note.title, ARB[1].title);
  assert.ok(note.sections.find((section) => section.heading === "Décision humaine")?.lines.includes("Option retenue après revue humaine."));
});
