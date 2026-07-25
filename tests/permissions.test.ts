import assert from "node:assert/strict";
import test from "node:test";
import { assertCan } from "../src/server/permissions";

test("les permissions suivent le mandat sans créer de produit séparé", () => {
  assert.doesNotThrow(() => assertCan("agent_terrain", {
    type: "create_signal",
    actorId: "act-terrain",
    territoryId: "joal",
    title: "Signal",
    description: "Description",
    channel: "terrain"
  }));
  assert.throws(
    () => assertCan("partenaire", { type: "close", situationId: "sit-glace", actorId: "act-partner" }),
    /mandat/
  );
  assert.doesNotThrow(
    () => assertCan("decideur", { type: "prioritize", situationId: "sit-glace", actorId: "act-decision" })
  );
});
