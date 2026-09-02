import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import type { Command, ProductState } from "../src/domain/types";
import { attemptPublicContributionSignalSync, resolveContributionSignalCategory } from "../src/domain/public-contribution-signal-bridge";

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

// Micro-correctif final LOT 6 (A1) — "une contribution métier acceptée ne
// doit jamais pouvoir être définitivement perdue par le Core à cause
// d'un échec temporaire" : échec initial (reste "pending" côté appelant),
// puis un rejeu (même id de contribution, même clé d'idempotence) doit
// converger sans jamais dupliquer le Signal — exactement le mécanisme que
// syncPendingPublicContributionSignals (public-repository.ts, "server-only")
// orchestre en rejouant cette même fonction pour les contributions encore
// "pending".
test("A1 — échec initial puis retry : converge vers un Signal unique, sans doublon", async () => {
  const core = makeFakeCore(createDemoState());
  core.failNextDispatch();

  const failed = await attemptPublicContributionSignalSync(baseContribution, core);
  assert.equal(failed.signalId, undefined, "reste « pending » après l'échec initial");
  assert.equal(core.getCurrentState().signals.length, createDemoState().signals.length, "aucun Signal partiel créé lors de l'échec");

  const retried = await attemptPublicContributionSignalSync(baseContribution, core);
  assert.ok(retried.signalId, "le rejeu converge (« synced »)");
  assert.equal(core.getCurrentState().signals.length, createDemoState().signals.length + 1, "un seul Signal au total, malgré l'échec puis le retry");

  const secondRetry = await attemptPublicContributionSignalSync(baseContribution, core);
  void secondRetry;
  assert.equal(core.getCurrentState().signals.length, createDemoState().signals.length + 1, "un rejeu supplémentaire ne crée jamais de second Signal (idempotence)");
});

// ============================================================
// Micro-correctif final LOT 6 (A2) — "ne plus fabriquer infrastructure" :
// une catégorie n'est renseignée que lorsqu'elle est réellement
// déterminable (actorType structuré), sinon repli neutre "autre".
// ============================================================

test("A2 — une contribution non classifiable (transporteur) reçoit la catégorie neutre « autre »", async () => {
  const core = makeFakeCore(createDemoState());
  assert.equal(resolveContributionSignalCategory("transporteur"), undefined, "aucune catégorie déterminable pour ce type d'acteur");

  const { signalId } = await attemptPublicContributionSignalSync(baseContribution, core);
  const signal = core.getCurrentState().signals.find((item) => item.id === signalId);
  assert.equal(signal?.category, "autre", "create_signal doit appliquer son repli neutre, jamais « infrastructure » par défaut");
});

test("A2 — une contribution réellement déterminable (transformateur) conserve sa catégorie explicite", async () => {
  const core = makeFakeCore(createDemoState());
  assert.equal(resolveContributionSignalCategory("transformateur"), "production");

  const { signalId } = await attemptPublicContributionSignalSync({ ...baseContribution, id: "ctb-test-2", actorType: "transformateur" }, core);
  const signal = core.getCurrentState().signals.find((item) => item.id === signalId);
  assert.equal(signal?.category, "production");
});

test("A2 — aucun Signal existant (legacy) ne change de catégorie", () => {
  const state = createDemoState();
  const legacyCategories = state.signals.map((item) => item.category);
  // Le Demo World n'a jamais dispatché create_signal sans catégorie
  // explicite à sa construction — aucun signal existant ne doit se
  // retrouver reclassé "autre" par ce correctif.
  assert.ok(legacyCategories.every((category) => category !== undefined));
  assert.ok(!legacyCategories.includes("autre"), "aucun signal du Demo World initial n'utilise le repli neutre introduit par ce correctif");
});
