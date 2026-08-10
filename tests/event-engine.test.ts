import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyEvent } from "../src/runtime/event-engine";

test("un événement terrain devient un signal et une situation", () => {
  const state = createDemoState();

  const next = applyEvent(state, {
    id: "evt-glace-joal-001",
    type: "infrastructure_status_changed",
    occurredAt: "2026-08-06T08:00:00.000Z",
    territoryId: "joal",
    actorId: "act-operateur",
    infrastructureId: "froid-joal",
    status: "indisponible",
    availableCapacity: 0,
    source: "Poste de quai de Joal",
    channel: "poste_quai"
  });

  const situation = next.situations.find(
    (item) => item.id === "sit-evt-glace-joal-001"
  );

  assert.ok(situation);
  assert.equal(
    situation?.title,
    "Moyen indisponible sur le territoire"
  );
  assert.equal(situation?.priority, "critique");

  const signal = next.signals.find(
    (item) => item.id === "obs-evt-glace-joal-001"
  );

  assert.ok(signal);
  assert.equal(signal?.channel, "poste_quai");
  assert.equal(signal?.source, "Poste de quai de Joal");
});