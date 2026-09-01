import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import type { Command, ProductState } from "../src/domain/types";
import { attemptPublicRequestSignalSync, publicRequestSourceToSignalChannel, resolvePublicRequestTerritoryId } from "../src/domain/public-request-signal-bridge";

// Fake Core (getState/dispatch) reproduisant le vrai mécanisme
// d'idempotence de src/server/repository.ts (Set de clés déjà rejouées +
// applyCommand) sans dépendre de "server-only" — permet de tester
// attemptPublicRequestSignalSync (src/domain/public-request-signal-bridge.ts)
// dans les mêmes conditions réelles que le serveur, y compris
// l'idempotence et un échec Core simulé.
function makeFakeCore(initial: ProductState) {
  let state = initial;
  const usedKeys = new Set<string>();
  let forceFailNextDispatch = false;
  return {
    getState: async () => state,
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

// TEST D (mandat "aligner le Core métier avec le Blueprint V1", LOT 0.4) —
// partie domaine (résolution canal/territoire), testée ici directement :
// la partie persistance (src/server/public-repository.ts, dispatch réel)
// porte `import "server-only"` et n'est donc exécutable qu'en contexte
// Next.js réel — vérifiée en conditions réelles via le serveur de
// développement (curl /api/public/requests puis /api/state), pas ici.
// Voir le rapport de lot pour cette vérification live.

test("publicRequestSourceToSignalChannel ne fabrique jamais un canal terrain pour une origine numérique (TEST D)", () => {
  assert.equal(publicRequestSourceToSignalChannel("terrain"), "terrain");
  assert.equal(publicRequestSourceToSignalChannel("telephone"), "telephone");
  assert.equal(publicRequestSourceToSignalChannel("whatsapp"), "whatsapp_structure");
  assert.equal(publicRequestSourceToSignalChannel("web"), "espace_public");
  assert.equal(publicRequestSourceToSignalChannel("partenaire"), "espace_public");
  assert.equal(publicRequestSourceToSignalChannel("evenement"), "espace_public");
});

test("resolvePublicRequestTerritoryId résout un territoire réel déclaré, insensible à la casse, sans jamais en fabriquer un", () => {
  const state = createDemoState();
  assert.equal(resolvePublicRequestTerritoryId(state.territories, "Joal-Fadiouth"), "joal");
  assert.equal(resolvePublicRequestTerritoryId(state.territories, "joal-fadiouth"), "joal");
  assert.equal(resolvePublicRequestTerritoryId(state.territories, "Un lieu qui n'existe pas"), undefined);
  assert.equal(resolvePublicRequestTerritoryId(state.territories, undefined), undefined);
});

// Le comportement du Core lui-même (create_signal Signal-seul, territoire
// optionnel, disposition "nouveau") est déjà couvert par
// tests/domain-cycle.test.ts (TEST A) — reproduit ici avec les valeurs
// exactes que produirait le pont, pour vérifier la composition complète
// sans dépendre de "server-only".
test("le Signal produit par la composition canal/territoire du pont Public entre bien dans le Core sans situation", () => {
  const state = createDemoState();
  const situationsBefore = state.situations.length;
  const territoryId = resolvePublicRequestTerritoryId(state.territories, "Joal-Fadiouth");
  const channel = publicRequestSourceToSignalChannel("web");

  const next = applyCommand(state, {
    type: "create_signal",
    actorId: "act-espace-public",
    territoryId,
    title: "sourcing — demande de l'espace public",
    description: "Recherche de volumes de sardinelle pour une nouvelle unité de transformation.",
    channel
  });

  assert.equal(next.situations.length, situationsBefore, "une PublicRequest ne doit créer aucune situation");
  assert.equal(next.signals[0].disposition, "nouveau");
  assert.equal(next.signals[0].territoryId, "joal");
  assert.equal(next.signals[0].channel, "espace_public");
  assert.equal(next.signals[0].reportedBy, undefined);
});

// Correction Product Review (LOT 0, 2026-09-01, "PublicRequest → Core
// Signal doit être garanti") : attemptPublicRequestSignalSync
// (src/domain/public-request-signal-bridge.ts) est le coeur testable de
// la garantie de convergence — injecté avec un faux Core reproduisant le
// vrai mécanisme d'idempotence (cf. makeFakeCore ci-dessus). La partie
// persistance réelle (src/server/public-repository.ts, "server-only")
// est vérifiée en conditions réelles via le serveur de développement,
// cf. rapport de lot.
const baseRequest = {
  id: "pr-test-1",
  territory: "Joal-Fadiouth",
  source: "web" as const,
  intent: "sourcing",
  description: "Recherche de volumes de sardinelle pour une nouvelle unité de transformation.",
  createdAt: new Date().toISOString()
};

test("attemptPublicRequestSignalSync crée un Signal et renvoie son id de façon fiable (via l'audit)", async () => {
  const core = makeFakeCore(createDemoState());
  const signalsBefore = core.getCurrentState().signals.length;

  const { signalId } = await attemptPublicRequestSignalSync(baseRequest, core);

  assert.ok(signalId);
  assert.equal(core.getCurrentState().signals.length, signalsBefore + 1);
  assert.equal(core.getCurrentState().signals.find((item) => item.id === signalId)?.channel, "espace_public");
  assert.equal(core.getCurrentState().signals.find((item) => item.id === signalId)?.territoryId, "joal");
  assert.equal(core.getCurrentState().situations.length, createDemoState().situations.length, "aucune situation automatique");
});

test("idempotence obligatoire : deux tentatives pour la même PublicRequest ne créent jamais un second Signal", async () => {
  const core = makeFakeCore(createDemoState());
  const signalsBefore = core.getCurrentState().signals.length;

  const first = await attemptPublicRequestSignalSync(baseRequest, core);
  const second = await attemptPublicRequestSignalSync(baseRequest, core);

  assert.ok(first.signalId);
  assert.equal(core.getCurrentState().signals.length, signalsBefore + 1, "un seul Signal, quel que soit le nombre de tentatives");
  // second.signalId peut différer (dispatch court-circuite, l'audit ne
  // pointe plus vers ce signal précis — cf. commentaire dans
  // public-request-signal-bridge.ts) mais aucun second Signal n'existe.
  void second;
});

test("un échec temporaire Core ne fait jamais perdre la demande : attemptPublicRequestSignalSync ne lève jamais, renvoie signalId absent", async () => {
  const core = makeFakeCore(createDemoState());
  core.failNextDispatch();

  const result = await attemptPublicRequestSignalSync(baseRequest, core);

  assert.equal(result.signalId, undefined);
  assert.equal(core.getCurrentState().signals.length, createDemoState().signals.length, "aucun Signal partiel n'a été créé");
});

test("l'état non synchronisé est rejouable : un échec temporaire suivi d'un retry converge sans duplication", async () => {
  const core = makeFakeCore(createDemoState());
  core.failNextDispatch();

  const failed = await attemptPublicRequestSignalSync(baseRequest, core);
  assert.equal(failed.signalId, undefined); // reste "pending", détectable.

  const retried = await attemptPublicRequestSignalSync(baseRequest, core); // rejeu (même id de PublicRequest, même clé d'idempotence).
  assert.ok(retried.signalId); // converge.

  assert.equal(core.getCurrentState().signals.length, createDemoState().signals.length + 1, "un seul Signal au total, malgré l'échec puis le retry");
});
