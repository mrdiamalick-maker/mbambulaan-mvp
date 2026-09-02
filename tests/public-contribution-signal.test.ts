import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import type { Command, ProductState } from "../src/domain/types";
import { attemptPublicContributionSignalSync } from "../src/domain/public-contribution-signal-bridge";

// LOT 6 (mandat "Public — Comprendre, trouver, contribuer", §13/§14 —
// "PublicContribution → Signal entrant, sans Situation automatique",
// TEST D/E). Même double fake Core que tests/public-request-signal.test.ts
// (idempotence + échec simulé), sans dépendre de "server-only".
function makeFakeCore(initial: ProductState) {
  let state = initial;
  const usedKeys = new Set<string>();
  let forceFailNextDispatch = false;
  return {
    dispatch: async (command: Command, idempotencyKey: string) => {
      if (forceFailNextDispatch) {
        forceFailNextDispatch = false;
        throw new Error("Core temporairement indisponible (simulation de test).");
      }
      if (!usedKeys.has(idempotencyKey)) {
        usedKeys.add(idempotencyKey);
        state = applyCommand(state, command);
      }
      return state;
    },
    failNextDispatch: () => {
      forceFailNextDispatch = true;
    },
    getCurrentState: () => state
  };
}

const baseContribution = {
  id: "ctb-test-1",
  actorType: "transporteur" as const,
  services: "Transport réfrigéré entre Joal et Dakar, 2 véhicules disponibles.",
  territories: "Petite-Côte, Dakar",
  createdAt: new Date().toISOString()
};

// TEST D — Contribution métier → entrée Core traçable.
test("TEST D — attemptPublicContributionSignalSync crée un Signal traçable, sans Situation", async () => {
  const core = makeFakeCore(createDemoState());
  const signalsBefore = core.getCurrentState().signals.length;

  const { signalId } = await attemptPublicContributionSignalSync(baseContribution, core);

  assert.ok(signalId);
  assert.equal(core.getCurrentState().signals.length, signalsBefore + 1);
  const signal = core.getCurrentState().signals.find((item) => item.id === signalId);
  assert.equal(signal?.channel, "espace_public");
  assert.equal(signal?.actorId, "act-espace-public");
  assert.ok(signal?.description.includes("Petite-Côte, Dakar"));
});

// TEST E — Contribution métier ≠ Situation.
test("TEST E — une PublicContribution ne crée jamais de Situation automatique", async () => {
  const core = makeFakeCore(createDemoState());
  const situationsBefore = core.getCurrentState().situations.length;

  await attemptPublicContributionSignalSync(baseContribution, core);

  assert.equal(core.getCurrentState().situations.length, situationsBefore);
});

test("idempotence : deux tentatives pour la même PublicContribution ne créent jamais un second Signal", async () => {
  const core = makeFakeCore(createDemoState());
  const signalsBefore = core.getCurrentState().signals.length;

  const first = await attemptPublicContributionSignalSync(baseContribution, core);
  const second = await attemptPublicContributionSignalSync(baseContribution, core);

  assert.ok(first.signalId);
  assert.equal(core.getCurrentState().signals.length, signalsBefore + 1);
  void second;
});

test("un échec temporaire Core ne lève jamais : attemptPublicContributionSignalSync renvoie signalId absent", async () => {
  const core = makeFakeCore(createDemoState());
  core.failNextDispatch();

  const result = await attemptPublicContributionSignalSync(baseContribution, core);

  assert.equal(result.signalId, undefined);
  assert.equal(core.getCurrentState().signals.length, createDemoState().signals.length);
});
