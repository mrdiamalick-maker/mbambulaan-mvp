import assert from "node:assert/strict";
import test from "node:test";
import { assertCan } from "../src/server/permissions";

test("les permissions suivent le mandat sans créer de produit séparé", () => {
  assert.doesNotThrow(() => assertCan("operateur", {
    type: "create_signal",
    actorId: "act-operateur",
    territoryId: "joal",
    title: "Signal",
    description: "Description",
    channel: "terrain"
  }));
  assert.throws(
    () => assertCan("partenaire", { type: "close", situationId: "sit-glace", actorId: "act-partenaire" }),
    /mandat/
  );
  assert.doesNotThrow(
    () => assertCan("institution", { type: "prioritize", situationId: "sit-glace", actorId: "act-institution" })
  );
});

test("créer un programme (besoin collectif) reste réservé aux mandats de coordination (Lot 5)", () => {
  const command = {
    type: "create_initiative" as const,
    actorId: "act-coordinateur",
    title: "Programme",
    objective: "Objectif",
    budgetFcfa: 1000000,
    serviceRequestIds: ["need-formation-mbour", "need-formation-joal"]
  };
  assert.doesNotThrow(() => assertCan("coordinateur", command));
  assert.doesNotThrow(() => assertCan("administrateur", command));
  assert.doesNotThrow(() => assertCan("institution", command));
  assert.doesNotThrow(() => assertCan("gestionnaire_organisation", command));
  assert.throws(() => assertCan("partenaire", command), /mandat/);
  assert.throws(() => assertCan("mareyeur", command), /mandat/);
});

test("le capitaine peut simuler un appel/WhatsApp depuis le Terrain mobile (Lot 6)", () => {
  const command = {
    type: "log_communication" as const,
    actorId: "act-capitaine",
    channel: "telephone" as const,
    subject: "Retour de pêche",
    body: "Confirmation du retour à Joal."
  };
  assert.doesNotThrow(() => assertCan("capitaine", command));
});
