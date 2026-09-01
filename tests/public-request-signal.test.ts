import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { publicRequestSourceToSignalChannel, resolvePublicRequestTerritoryId } from "../src/domain/public-request-signal-bridge";

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
