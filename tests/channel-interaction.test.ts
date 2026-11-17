import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import {
  buildTerrainInteractionRows,
  determineReplyIntent,
  matchRoleChoice,
  matchTerritoryChoice
} from "../src/domain/channel-interaction";
import type { ProductState, TerrainInteractionMessageType } from "../src/domain/types";

const PHONE = "221771234567";
const NOW = "2026-11-17T09:00:00.000Z";

function receive(
  state: ProductState,
  rawContent: string,
  occurredAt = NOW,
  externalMessageId?: string,
  messageType: TerrainInteractionMessageType = "texte"
) {
  return applyCommand(state, {
    type: "receive_channel_message",
    channel: "whatsapp",
    channelAddress: PHONE,
    messageType,
    rawContent,
    receivedAt: occurredAt,
    externalMessageId
  });
}

test("matchRoleChoice/matchTerritoryChoice — correspondance déterministe (numéro ou nom exact), jamais une interprétation libre", () => {
  assert.equal(matchRoleChoice("1"), "capitaine");
  assert.equal(matchRoleChoice("2"), "mareyeur");
  assert.equal(matchRoleChoice("capitaine"), "capitaine");
  assert.equal(matchRoleChoice("Je suis capitaine depuis 10 ans"), undefined, "le texte libre ne doit jamais matcher partiellement");

  const territories = createDemoState().territories;
  const mbourIndex = [...territories].sort((a, b) => a.name.localeCompare(b.name, "fr")).findIndex((t) => t.id === "mbour") + 1;
  assert.equal(matchTerritoryChoice(String(mbourIndex), territories), "mbour");
  assert.equal(matchTerritoryChoice("Mbour", territories), "mbour");
  assert.equal(matchTerritoryChoice("mbour", territories), "mbour", "la correspondance par nom doit être insensible à la casse");
  assert.equal(matchTerritoryChoice("quelque part vers Mbour", territories), undefined, "aucune correspondance approximative");
});

test("scénario d'acceptation (mandat §13) : le tout premier message (contenu réel, pas une réponse) est préservé avec DECLARED, et déclenche l'onboarding", () => {
  let state = createDemoState();
  const actorsBefore = state.actors.length;

  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");

  // Une conversation minimale existe immédiatement (mandat §5, "minimal
  // pending actor/contact record") — sans qu'aucun Actor n'ait été fabriqué.
  const conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.ok(conversation, "un contact inconnu doit créer une conversation minimale dès le premier message");
  assert.equal(state.actors.length, actorsBefore, "aucun Actor ne doit être fabriqué avant d'avoir un prénom/rôle/site réels");

  // Le message original est préservé tel quel, en interaction DECLARED,
  // same tour — jamais consommé comme réponse à une question qui n'a pas
  // encore été posée.
  assert.equal(state.terrainInteractions.length, 1);
  const interaction = state.terrainInteractions[0];
  assert.equal(interaction.rawContent, "J'ai besoin de glace aujourd'hui à Mbour.");
  assert.equal(interaction.evidenceStatus, "declaree");
  assert.equal(interaction.intent, "non_classifie");
  assert.equal(interaction.processingStatus, "recue");
  assert.equal(interaction.channel, "whatsapp");
  assert.equal(interaction.externalMessageId, "wamid.1");
  assert.equal(interaction.actorId, undefined, "pas encore d'Actor réel à référencer");
  assert.equal(interaction.conversationId, conversation.id, "la conversation sert de référence de contact dès le premier message");

  // Le profil étant incomplet, Mbàmbulaan doit maintenant poser la première
  // question d'onboarding (mandat §13, étape 7).
  assert.equal(conversation.onboardingStage, "prenom_demande");
  assert.deepEqual(determineReplyIntent(conversation), { kind: "ask_prenom" });
});

test("onboarding progressif complet : chaque réponse fait aussi sa propre interaction, puis un Actor réel est créé", () => {
  let state = createDemoState();
  const actorsBefore = state.actors.length;

  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");
  state = receive(state, "Khady", NOW, "wamid.2");
  let conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "role_demande");
  assert.equal(conversation.pendingName, "Khady");
  assert.deepEqual(determineReplyIntent(conversation), { kind: "ask_role" });

  // Réponse non reconnue : le stade ne progresse pas, la même question sera
  // reposée — mais le message brut reste quand même préservé en interaction.
  state = receive(state, "je ne sais pas", NOW, "wamid.x");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "role_demande", "une réponse non reconnue ne doit jamais faire progresser l'onboarding");

  state = receive(state, "2", NOW, "wamid.3"); // mareyeur
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "site_demande");
  assert.equal(conversation.pendingRole, "mareyeur");

  state = receive(state, "Mbour", NOW, "wamid.4");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "complet");
  assert.equal(conversation.pendingName, undefined, "les champs transitoires doivent être purgés une fois l'Actor créé");
  assert.equal(conversation.pendingRole, undefined);
  assert.equal(state.actors.length, actorsBefore + 1);

  const actor = state.actors.find((item) => item.id === conversation.actorId)!;
  assert.ok(actor, "l'Actor référencé par la conversation doit exister réellement");
  assert.equal(actor.name, "Khady");
  assert.equal(actor.role, "mareyeur");
  assert.equal(actor.phone, PHONE);
  assert.deepEqual(actor.territoryIds, ["mbour"]);
  assert.equal(actor.verified, false, "un Actor auto-onboardé n'est jamais vérifié automatiquement");
  assert.equal(actor.organizationId, undefined, "aucune organisation fabriquée pour un Actor onboardé par canal");

  // Chaque message accepté (y compris les réponses d'onboarding et la
  // réponse non reconnue) a produit sa propre TerrainInteraction — mandat
  // §6, "every accepted inbound text must result in a traceable terrain
  // interaction", sans exception pour les tours d'onboarding.
  assert.equal(state.terrainInteractions.length, 5);
  const lastInteraction = state.terrainInteractions.at(-1)!;
  assert.equal(lastInteraction.rawContent, "Mbour");
  assert.equal(lastInteraction.actorId, actor.id, "le message qui complète l'onboarding référence déjà le nouvel Actor");
  assert.equal(lastInteraction.territoryId, "mbour");
  assert.deepEqual(determineReplyIntent(conversation), { kind: "ack" });
});

test("un numéro déjà onboardé n'est jamais ré-onboardé : les messages suivants restent attribués au même Actor", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour", NOW, "w1");
  state = receive(state, "Awa", NOW, "w2");
  state = receive(state, "3", NOW, "w3"); // transformateur
  state = receive(state, "Mbour", NOW, "w4");
  const conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  const actorId = conversation.actorId;

  state = receive(state, "Deuxième message réel, bien après l'onboarding.", "2026-11-18T08:00:00.000Z", "w5");
  assert.equal(state.conversations.length, 1, "un même numéro ne doit jamais créer une seconde conversation");
  const lastInteraction = state.terrainInteractions.at(-1)!;
  assert.equal(lastInteraction.actorId, actorId);
  assert.equal(lastInteraction.processingStatus, "recue");
});

test("média non textuel (audio/image) : ne plante jamais, produit une interaction media_en_attente sans contenu fabriqué", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour", NOW, "w1");
  state = receive(state, "Moussa", NOW, "w2");
  state = receive(state, "1", NOW, "w3"); // capitaine
  state = receive(state, "Mbour", NOW, "w4");

  state = receive(state, "[Message WhatsApp de type « audio » reçu — contenu non traité en T01, voir T02]", "2026-11-18T09:00:00.000Z", "w5", "audio");
  const audioInteraction = state.terrainInteractions.at(-1)!;
  assert.equal(audioInteraction.messageType, "audio");
  assert.equal(audioInteraction.processingStatus, "media_en_attente", "un contenu non textuel ne doit jamais être marqué 'recue'");
  assert.equal(audioInteraction.evidenceStatus, "declaree");
});

test("send_channel_message refuse d'écrire dans une conversation qui n'existe pas (jamais une conversation fabriquée côté envoi)", () => {
  const state = createDemoState();
  assert.throws(() =>
    applyCommand(state, {
      type: "send_channel_message",
      channel: "whatsapp",
      channelAddress: "221700000000",
      body: "Bonjour",
      sentAt: NOW
    })
  );
});

test("l'historique de conversation conserve tous les messages, entrants et sortants", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour", NOW, "w1");
  let conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.messages.length, 1);
  assert.equal(conversation.messages[0].direction, "inbound");

  const next = applyCommand(state, {
    type: "send_channel_message",
    channel: "whatsapp",
    channelAddress: PHONE,
    body: "Bienvenue sur Mbàmbulaan. Quel est votre prénom ?",
    sentAt: "2026-11-17T09:00:05.000Z"
  });
  conversation = next.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.messages.length, 2);
  assert.equal(conversation.messages.at(-1)!.direction, "outbound");
});

test("buildTerrainInteractionRows — projection triée, plus récent en premier, avec libellés réels", () => {
  let state = createDemoState();
  state = receive(state, "Bonjour", NOW, "w1");
  state = receive(state, "Awa", NOW, "w2");
  state = receive(state, "2", NOW, "w3");
  state = receive(state, "Mbour", NOW, "w4");
  state = receive(state, "Premier message réel.", "2026-11-17T10:00:00.000Z", "w5");
  state = receive(state, "Second message réel, plus tard.", "2026-11-17T11:00:00.000Z", "w6");

  const rows = buildTerrainInteractionRows(state);
  assert.equal(rows[0].message, "Second message réel, plus tard.", "le plus récent doit apparaître en premier");
  assert.equal(rows[0].actorName, "Awa");
  assert.equal(rows[0].roleLabel, "Mareyeur");
  assert.equal(rows[0].territoryLabel, "Mbour");
  assert.equal(rows[0].evidenceStatusLabel, "Déclarée");
  assert.equal(rows[0].processingStatusLabel, "Reçue");
  assert.equal(rows[0].messageTypeLabel, "Texte");

  // Les interactions antérieures à la fin de l'onboarding n'ont pas encore
  // d'acteur réel à afficher — repli honnête, jamais un nom fabriqué.
  const firstRow = rows.find((row) => row.message === "Bonjour")!;
  assert.equal(firstRow.actorName, "Contact en cours d’onboarding");
  assert.equal(firstRow.roleLabel, "—");
});

test("deux numéros différents onboardent deux conversations et deux Acteurs indépendants", () => {
  let state = createDemoState();
  state = applyCommand(state, {
    type: "receive_channel_message",
    channel: "whatsapp",
    channelAddress: "221771111111",
    messageType: "texte",
    rawContent: "Bonjour",
    receivedAt: NOW
  });
  state = applyCommand(state, {
    type: "receive_channel_message",
    channel: "whatsapp",
    channelAddress: "221772222222",
    messageType: "texte",
    rawContent: "Bonjour",
    receivedAt: NOW
  });
  assert.equal(state.conversations.length, 2);
  assert.notEqual(state.conversations[0].id, state.conversations[1].id);
});
