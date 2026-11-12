import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import {
  buildTerrainInteractionRows,
  matchRoleChoice,
  matchTerritoryChoice,
  getNextChannelPrompt
} from "../src/domain/channel-interaction";
import type { ProductState } from "../src/domain/types";

const PHONE = "221771234567";
const NOW = "2026-11-12T09:00:00.000Z";

function receive(state: ProductState, rawContent: string, occurredAt = NOW, externalMessageId?: string) {
  return applyCommand(state, {
    type: "receive_channel_message",
    channel: "whatsapp",
    channelAddress: PHONE,
    rawContent,
    occurredAt,
    externalMessageId
  });
}

test("matchRoleChoice/matchTerritoryChoice — correspondance déterministe (numéro ou nom exact), jamais une interprétation libre", () => {
  assert.equal(matchRoleChoice("1"), "capitaine");
  assert.equal(matchRoleChoice("2"), "mareyeur");
  assert.equal(matchRoleChoice("capitaine"), "capitaine");
  assert.equal(matchRoleChoice("Je suis capitaine depuis 10 ans"), undefined, "le texte libre ne doit jamais matcher partiellement");

  const territories = createDemoState().territories;
  const joalIndex = [...territories].sort((a, b) => a.name.localeCompare(b.name, "fr")).findIndex((t) => t.id === "joal") + 1;
  assert.equal(matchTerritoryChoice(String(joalIndex), territories), "joal");
  assert.equal(matchTerritoryChoice("Joal-Fadiouth", territories), "joal");
  assert.equal(matchTerritoryChoice("joal-fadiouth", territories), "joal", "la correspondance par nom doit être insensible à la casse");
  assert.equal(matchTerritoryChoice("quelque part vers Joal", territories), undefined, "aucune correspondance approximative");
});

test("onboarding conversationnel complet : prénom → rôle → site → Actor réel créé", () => {
  let state = createDemoState();
  const actorsBefore = state.actors.length;
  const conversationsBefore = state.conversations.length;

  state = receive(state, "Bonjour");
  let conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(state.conversations.length, conversationsBefore + 1);
  assert.equal(conversation.status, "onboarding_prenom");
  assert.equal(getNextChannelPrompt(conversation, state.territories), "Bienvenue sur Mbàmbulaan. Quel est votre prénom ?");

  state = receive(state, "Moussa");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.status, "onboarding_role");
  assert.equal(conversation.pendingPrenom, "Moussa");
  assert.match(getNextChannelPrompt(conversation, state.territories)!, /rôle/);

  // Réponse non reconnue : la conversation ne progresse pas, le message
  // brut reste tout de même consigné dans l'historique (mandat §8).
  state = receive(state, "je ne sais pas");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.status, "onboarding_role", "une réponse non reconnue ne doit jamais faire progresser l'onboarding");

  state = receive(state, "1"); // capitaine
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.status, "onboarding_site");
  assert.equal(conversation.pendingRole, "capitaine");

  state = receive(state, "Joal-Fadiouth");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.status, "actif");
  assert.equal(conversation.pendingPrenom, undefined, "les réponses transitoires doivent être purgées une fois l'Actor créé");
  assert.equal(conversation.pendingRole, undefined);
  assert.equal(state.actors.length, actorsBefore + 1);

  const actor = state.actors.find((item) => item.id === conversation.actorId)!;
  assert.ok(actor, "l'Actor référencé par la conversation doit exister réellement");
  assert.equal(actor.name, "Moussa");
  assert.equal(actor.role, "capitaine");
  assert.equal(actor.phone, PHONE);
  assert.deepEqual(actor.territoryIds, ["joal"]);
  assert.equal(actor.verified, false, "un Actor auto-onboardé n'est jamais vérifié automatiquement");
  assert.equal(actor.organizationId, undefined, "aucune organisation fabriquée pour un Actor onboardé par canal");
});

test("après onboarding, chaque message crée une TerrainInteraction réelle (actorId, channel, status déclarée, type non classifié)", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour");
  state = receive(state, "Awa");
  state = receive(state, "2"); // mareyeur
  state = receive(state, "Joal-Fadiouth");
  const conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.status, "actif");

  const interactionsBefore = state.terrainInteractions.length;
  state = receive(state, "Le prix du thiof a baissé ce matin au quai.", "2026-11-12T10:00:00.000Z", "wamid.123");
  assert.equal(state.terrainInteractions.length, interactionsBefore + 1);

  const interaction = state.terrainInteractions.at(-1)!;
  assert.equal(interaction.actorId, conversation.actorId);
  assert.equal(interaction.channel, "whatsapp");
  assert.equal(interaction.rawContent, "Le prix du thiof a baissé ce matin au quai.");
  assert.equal(interaction.territoryId, "joal");
  assert.equal(interaction.status, "declaree");
  assert.equal(interaction.type, "non_classifie");
  assert.equal(interaction.externalMessageId, "wamid.123");

  // Les échanges d'onboarding, eux, n'ont jamais créé d'interaction —
  // seul le message post-onboarding en a créé une (mandat §6).
  assert.equal(state.terrainInteractions.length, 1);
});

test("un numéro déjà onboardé n'est jamais ré-onboardé : les messages suivants vont directement en interaction", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour");
  state = receive(state, "Awa");
  state = receive(state, "2");
  state = receive(state, "Joal-Fadiouth");
  const actorId = state.conversations.find((c) => c.channelAddress === PHONE)!.actorId;

  state = receive(state, "Deuxième message, bien après l'onboarding.", "2026-11-13T08:00:00.000Z");
  assert.equal(state.terrainInteractions.length, 1);
  assert.equal(state.terrainInteractions[0].actorId, actorId);
  assert.equal(state.conversations.length, 1, "un même numéro ne doit jamais créer une seconde conversation");
});

test("l'historique de conversation conserve tous les messages, onboarding compris (mandat §8)", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour");
  state = receive(state, "Awa");
  state = receive(state, "2");
  state = receive(state, "Joal-Fadiouth");
  const conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.messages.length, 4);
  assert.deepEqual(conversation.messages.map((m) => m.body), ["Bonjour", "Awa", "2", "Joal-Fadiouth"]);
  assert.ok(conversation.messages.every((m) => m.direction === "inbound"));

  const next = applyCommand(state, {
    type: "send_channel_message",
    channel: "whatsapp",
    channelAddress: PHONE,
    body: "Merci, votre profil est enregistré.",
    occurredAt: "2026-11-12T09:05:00.000Z"
  });
  const updated = next.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(updated.messages.length, 5);
  assert.equal(updated.messages.at(-1)!.direction, "outbound");
});

test("send_channel_message refuse d'écrire dans une conversation qui n'existe pas (jamais une conversation fabriquée côté envoi)", () => {
  const state = createDemoState();
  assert.throws(() =>
    applyCommand(state, {
      type: "send_channel_message",
      channel: "whatsapp",
      channelAddress: "221700000000",
      body: "Bonjour",
      occurredAt: NOW
    })
  );
});

test("buildTerrainInteractionRows — projection triée, plus récent en premier, avec libellés réels d'acteur/rôle/territoire", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour");
  state = receive(state, "Awa");
  state = receive(state, "2");
  state = receive(state, "Joal-Fadiouth");
  state = receive(state, "Premier message réel.", "2026-11-12T10:00:00.000Z");
  state = receive(state, "Second message réel, plus tard.", "2026-11-12T11:00:00.000Z");

  const rows = buildTerrainInteractionRows(state);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].message, "Second message réel, plus tard.", "le plus récent doit apparaître en premier");
  assert.equal(rows[0].actorName, "Awa");
  assert.equal(rows[0].roleLabel, "Mareyeur");
  assert.equal(rows[0].territoryLabel, "Joal-Fadiouth");
  assert.equal(rows[0].statusLabel, "Déclarée");
});

test("deux numéros différents onboardent deux conversations et deux Acteurs indépendants", () => {
  let state = createDemoState();
  state = applyCommand(state, { type: "receive_channel_message", channel: "whatsapp", channelAddress: "221771111111", rawContent: "Bonjour", occurredAt: NOW });
  state = applyCommand(state, { type: "receive_channel_message", channel: "whatsapp", channelAddress: "221772222222", rawContent: "Bonjour", occurredAt: NOW });
  assert.equal(state.conversations.length, 2);
  assert.notEqual(state.conversations[0].id, state.conversations[1].id);
});
