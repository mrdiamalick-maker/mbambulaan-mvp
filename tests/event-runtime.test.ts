import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import type { MbambulaanEvent } from "../src/domain/events";
import { applyEvent } from "../src/runtime/event-engine";

const event: MbambulaanEvent = {
  id: "evt-glace-joal-001",
  type: "infrastructure_status_changed",
  occurredAt: "2026-08-05T20:00:00.000Z",
  territoryId: "joal",
  actorId: "act-operateur",
  infrastructureId: "froid-joal",
  status: "indisponible",
  availableCapacity: 0,
  source: "Poste de quai de Joal",
  channel: "poste_quai"
};

test("un événement terrain crée un signal et une situation actionnable", () => {
  const state = createDemoState();
  const next = applyEvent(state, event);

  assert.equal(next.revision, state.revision + 1);
  assert.equal(next.signals[0].id, `obs-${event.id}`);
  assert.equal(next.signals[0].territoryId, "joal");
  assert.equal(next.signals[0].channel, "poste_quai");
  assert.equal(next.signals[0].category, "infrastructure");

  assert.equal(next.situations[0].id, `sit-${event.id}`);
  assert.equal(next.situations[0].status, "recue");
  assert.equal(next.situations[0].priority, "critique");
  assert.match(next.situations[0].nextStep, /solution de remplacement/);
  assert.deepEqual(next.situations[0].signalIds, [`obs-${event.id}`]);

  assert.equal(next.audit[0].objectId, event.id);
  assert.equal(next.audit[0].action, "event_received");
});

test("le même événement ne crée pas de doublon", () => {
  const first = applyEvent(createDemoState(), event);
  const second = applyEvent(first, event);

  assert.equal(second.revision, first.revision);
  assert.equal(second.signals.filter((item) => item.id === `obs-${event.id}`).length, 1);
  assert.equal(second.situations.filter((item) => item.id === `sit-${event.id}`).length, 1);
});
