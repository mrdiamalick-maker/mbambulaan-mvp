import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyEvent } from "../src/runtime/event-engine";

// LOT 0.1 (mandat "aligner le Core métier avec le Blueprint V1") :
// applyEvent ne crée plus qu'un Signal — 4e chemin corrigé, même travers
// que create_signal/convert_message_to_signal (cf. rules.ts).
test("un événement terrain devient un signal, sans situation automatique", () => {
  const state = createDemoState();
  const situationsBefore = state.situations.length;

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

  assert.equal(next.situations.length, situationsBefore, "applyEvent ne doit créer aucune situation");

  const signal = next.signals.find((item) => item.id === "obs-evt-glace-joal-001");
  assert.ok(signal);
  assert.equal(signal?.channel, "poste_quai");
  assert.equal(signal?.source, "Poste de quai de Joal");
  assert.equal(signal?.title, "Moyen indisponible sur le territoire");
  assert.equal(signal?.disposition, "nouveau");
});
