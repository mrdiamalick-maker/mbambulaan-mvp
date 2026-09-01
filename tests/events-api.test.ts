import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import type { MbambulaanEvent } from "../src/domain/events";
import { applyEvent } from "../src/runtime/event-engine";

// LOT 0.1 (mandat "aligner le Core métier avec le Blueprint V1") :
// applyEvent ne crée plus qu'un Signal — plus de situation automatique.
test("un événement de retour annoncé crée un signal opérationnel, sans situation automatique", () => {
  const state = createDemoState();
  const situationsBefore = state.situations.length;
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
  assert.equal(next.signals[0].id, "obs-evt-retour-jambar");
  assert.equal(next.signals[0].channel, "telephone");
  assert.equal(next.signals[0].title, "Retour de pêche annoncé");
  assert.equal(next.signals[0].disposition, "nouveau");
  assert.equal(next.situations.length, situationsBefore, "applyEvent ne doit créer aucune situation");
});
