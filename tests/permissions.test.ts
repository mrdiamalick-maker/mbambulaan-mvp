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
