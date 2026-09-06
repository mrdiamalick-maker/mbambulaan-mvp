import assert from "node:assert/strict";
import test from "node:test";
import { assertCan } from "../src/server/permissions";

test("les permissions suivent le mandat sans créer de produit séparé", () => {
  assert.doesNotThrow(() => assertCan("operateur", {
    type: "create_signal",
    actorId: "act-operateur",
    territoryId: "joal",
    title: "Signal",
    description: "Description",
    channel: "terrain"
  }));
  assert.throws(
    () => assertCan("partenaire", { type: "close", situationId: "sit-glace", actorId: "act-partenaire" }),
    /mandat/
  );
  assert.doesNotThrow(
    () => assertCan("institution", { type: "prioritize", situationId: "sit-glace", actorId: "act-institution" })
  );
});

test("la conversion d'un message entrant en signal suit le même mandat que create_signal", () => {
  const command = {
    type: "convert_message_to_signal" as const,
    actorId: "act-operateur",
    messageId: "msg-terrain-1",
    territoryId: "mbour",
    category: "production" as const,
    title: "Signal",
    description: "Description"
  };
  assert.doesNotThrow(() => assertCan("operateur", command));
  assert.doesNotThrow(() => assertCan("coordinateur", command));
  assert.throws(() => assertCan("partenaire", command), /mandat/);
});

test("relais généralisé (tranche 1/N) : opérateur/coordinateur/administrateur/gestionnaire_organisation peuvent agir pour le compte d'un autre acteur", () => {
  const relayed = { type: "accept_opportunity" as const, opportunityId: "opp-1", actorId: "act-operateur", onBehalfOfActorId: "act-mareyeur" };
  assert.doesNotThrow(() => assertCan("operateur", relayed));
  assert.doesNotThrow(() => assertCan("coordinateur", { ...relayed, actorId: "act-coordinateur" }));
  assert.doesNotThrow(() => assertCan("administrateur", { ...relayed, actorId: "act-admin" }));
  assert.throws(
    () => assertCan("mareyeur", { ...relayed, actorId: "act-mareyeur-nord" }),
    /mandat.*pour le compte/
  );
  // Sans onBehalfOfActorId, le mandat mareyeur normal (agir en son nom propre) reste inchangé.
  assert.doesNotThrow(() => assertCan("mareyeur", { type: "accept_opportunity", opportunityId: "opp-1", actorId: "act-mareyeur" }));
});

// Gap analysis Coordination, arbitrage CEO 2026-08-18, point 2 : avant ce
// correctif, gestionnaire_organisation avait accept_opportunity mais
// n'était pas dans RELAY_ROLES — CoordinationWorkspace.tsx ne lui
// calculait donc jamais onBehalfOfActorId, et une opportunité validée
// pour le compte d'un mareyeur/transformateur s'attribuait silencieusement
// à lui-même (beneficiaryId = command.onBehalfOfActorId ?? command.actorId,
// rules.ts). complete_logistics manquait aussi, bloquant le mandat à
// mi-chemin du cycle. partenaire, lui, n'a jamais eu ni l'une ni l'autre
// permission — CoordinationWorkspace.tsx ne doit donc plus lui afficher
// ces boutons (vérifié en direct, cf. rapport de lot).
test("gestionnaire_organisation peut désormais relayer un engagement et compléter la logistique ; partenaire n'a toujours ni l'un ni l'autre", () => {
  const relayed = { type: "accept_opportunity" as const, opportunityId: "opp-1", actorId: "act-gestionnaire", onBehalfOfActorId: "act-mareyeur" };
  assert.doesNotThrow(() => assertCan("gestionnaire_organisation", relayed));
  assert.doesNotThrow(() => assertCan("gestionnaire_organisation", { type: "complete_logistics", opportunityId: "opp-1", actorId: "act-gestionnaire", onBehalfOfActorId: "act-mareyeur" }));
  assert.throws(
    () => assertCan("partenaire", { type: "accept_opportunity", opportunityId: "opp-1", actorId: "act-partenaire" }),
    /mandat/
  );
  assert.throws(
    () => assertCan("partenaire", { type: "complete_logistics", opportunityId: "opp-1", actorId: "act-partenaire" }),
    /mandat/
  );
});

test("créer un programme (besoin collectif) reste réservé aux mandats de coordination (Lot 5)", () => {
  const command = {
    type: "create_initiative" as const,
    actorId: "act-coordinateur",
    title: "Programme",
    objective: "Objectif",
    budgetFcfa: 1000000,
    serviceRequestIds: ["need-formation-mbour", "need-formation-joal"]
  };
  assert.doesNotThrow(() => assertCan("coordinateur", command));
  assert.doesNotThrow(() => assertCan("administrateur", command));
  assert.doesNotThrow(() => assertCan("institution", command));
  assert.doesNotThrow(() => assertCan("gestionnaire_organisation", command));
  assert.throws(() => assertCan("partenaire", command), /mandat/);
  assert.throws(() => assertCan("mareyeur", command), /mandat/);
});

test("le capitaine peut simuler un appel/WhatsApp depuis le Terrain mobile (Lot 6)", () => {
  const command = {
    type: "log_communication" as const,
    actorId: "act-capitaine",
    channel: "telephone" as const,
    subject: "Retour de pêche",
    body: "Confirmation du retour à Joal."
  };
  assert.doesNotThrow(() => assertCan("capitaine", command));
});
