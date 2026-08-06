import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import type { MbambulaanEvent } from "../src/domain/events";
import { applyEvent } from "../src/runtime/event-engine";

test("un événement de retour annoncé crée une observation et une situation opérationnelle", () => {
  const state = createDemoState();
  const event: MbambulaanEvent = {
    id: "evt-retour-jambar",
    type: "fishing_trip_return_announced",
    occurredAt: "2026-08-05T20:00:00.000Z",
    territoryId: "joal",
    actorId: "act-capitaine",
    tripId: "trip-joal",
    expectedReturnAt: "2026-08-05T21:30:00.000Z",
    source: "Appel du capitaine",
    channel: "telephone"
  };

  const next = applyEvent(state, event);

  assert.equal(next.revision, state.revision + 1);
  assert.equal(next.observations[0].id, "obs-evt-retour-jambar");
  assert.equal(next.observations[0].channel, "telephone");
  assert.equal(next.situations[0].id, "sit-evt-retour-jambar");
  assert.equal(next.situations[0].title, "Retour de pêche annoncé");
  assert.equal(next.situations[0].priority, "haute");
  assert.match(next.situations[0].nextStep, /glace/);
});
