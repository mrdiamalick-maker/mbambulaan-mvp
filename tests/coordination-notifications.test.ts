import assert from "node:assert/strict";
import test from "node:test";
import { applyCommand } from "../src/domain/rules";
import { createDemoState } from "../src/data/demo-state";
import { attemptCoordinationNotifications } from "../src/server/coordination-notifications";
import type { ProductState, TerrainInterpretation } from "../src/domain/types";

const NOW = "2026-11-18T09:00:00.000Z";

function onboardAndInteract(state: ProductState, phone: string, name: string, roleChoice: string, territoryAnswer: string, message: string, wamid: string) {
  let next = applyCommand(state, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: "Bonjour", receivedAt: NOW, externalMessageId: `${wamid}-0` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: name, receivedAt: NOW, externalMessageId: `${wamid}-1` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: roleChoice, receivedAt: NOW, externalMessageId: `${wamid}-2` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: territoryAnswer, receivedAt: NOW, externalMessageId: `${wamid}-3` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: message, receivedAt: NOW, externalMessageId: wamid });
  return { state: next, interaction: next.terrainInteractions.at(-1)! };
}

function interpret(state: ProductState, interactionId: string, interpretation: Omit<TerrainInterpretation, "interpretedAt">) {
  return applyCommand(state, { type: "apply_terrain_interpretation", interactionId, outcome: "succes", interpretation });
}

function buildCoordination() {
  let state = createDemoState();
  const need = onboardAndInteract(state, "221771000010", "Awa", "2", "Mbour", "J'ai besoin de glace aujourd'hui à Mbour.", "wamid.need-notif");
  state = interpret(need.state, need.interaction.id, {
    intent: "besoin",
    summary: "Besoin de glace.",
    subject: "glace",
    territoryId: "mbour",
    confidence: "moyenne",
    needsHumanReview: false
  });
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: need.interaction.actorId!, interactionId: need.interaction.id });
  const needId = state.terrainNeeds.at(-1)!.id;

  const capacity = onboardAndInteract(state, "221772000011", "Froid Mbour", "4", "Mbour", "Glace disponible aujourd'hui à Mbour.", "wamid.cap-notif");
  state = interpret(capacity.state, capacity.interaction.id, {
    intent: "capacite",
    summary: "Capacité de glace.",
    subject: "glace",
    territoryId: "mbour",
    confidence: "moyenne",
    needsHumanReview: false
  });
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: capacity.interaction.actorId!, interactionId: capacity.interaction.id });

  state = applyCommand(state, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = applyCommand(state, {
    type: "initiate_terrain_coordination",
    actorId: "act-admin",
    matchId: state.terrainMatches[0].id,
    requesterMessage: "Message demandeur de test.",
    providerMessage: "Message fournisseur de test."
  });
  return { state, coordinationId: state.terrainCoordinations[0].id };
}

test("attemptCoordinationNotifications — envoi réussi : statut 'envoyee', historique de conversation mis à jour", async () => {
  const { state, coordinationId } = buildCoordination();
  const originalFetch = globalThis.fetch;
  process.env.WHATSAPP_ACCESS_TOKEN = "token-de-test";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456";
  globalThis.fetch = (async () => new Response(null, { status: 200 })) as typeof fetch;

  let persisted = state;
  const applyAndPersist = (current: ProductState, command: Parameters<typeof applyCommand>[1]) => {
    persisted = applyCommand(current, command);
    return persisted;
  };

  try {
    const next = await attemptCoordinationNotifications(state, coordinationId, applyAndPersist);
    const coordination = next.terrainCoordinations.find((item) => item.id === coordinationId)!;
    assert.ok(coordination.notifications.every((n) => n.status === "envoyee"));
    assert.ok(coordination.notifications.every((n) => n.sentAt));

    const requesterConversation = next.conversations.find((item) => item.actorId === coordination.requesterActorId)!;
    assert.ok(requesterConversation.messages.some((m) => m.body === "Message demandeur de test." && m.direction === "outbound"));
    const providerConversation = next.conversations.find((item) => item.actorId === coordination.providerActorId)!;
    assert.ok(providerConversation.messages.some((m) => m.body === "Message fournisseur de test." && m.direction === "outbound"));
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  }
});

test("attemptCoordinationNotifications — échec fournisseur (pas de credentials) : statut 'echec', coordination jamais perdue (mandat §9)", async () => {
  const { state, coordinationId } = buildCoordination();
  delete process.env.WHATSAPP_ACCESS_TOKEN;
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;

  const applyAndPersist = (current: ProductState, command: Parameters<typeof applyCommand>[1]) => applyCommand(current, command);
  const next = await attemptCoordinationNotifications(state, coordinationId, applyAndPersist);

  const coordination = next.terrainCoordinations.find((item) => item.id === coordinationId)!;
  assert.ok(coordination, "la coordination doit exister après l'échec d'envoi");
  assert.ok(coordination.notifications.every((n) => n.status === "echec"));
  assert.ok(coordination.notifications.every((n) => n.failureReason));
});

test("attemptCoordinationNotifications — aucune notification 'a_envoyer' ne refait un envoi (idempotent côté appel)", async () => {
  const { state, coordinationId } = buildCoordination();
  const calls: string[] = [];
  const originalFetch = globalThis.fetch;
  process.env.WHATSAPP_ACCESS_TOKEN = "token-de-test";
  process.env.WHATSAPP_PHONE_NUMBER_ID = "123456";
  globalThis.fetch = (async (url: string) => {
    calls.push(url);
    return new Response(null, { status: 200 });
  }) as typeof fetch;

  try {
    const applyAndPersist = (current: ProductState, command: Parameters<typeof applyCommand>[1]) => applyCommand(current, command);
    const once = await attemptCoordinationNotifications(state, coordinationId, applyAndPersist);
    assert.equal(calls.length, 2, "deux notifications (demandeur+fournisseur) envoyées la première fois");
    const twice = await attemptCoordinationNotifications(once, coordinationId, applyAndPersist);
    assert.equal(calls.length, 2, "aucun nouvel appel réseau si les notifications sont déjà 'envoyee'");
    assert.deepEqual(twice, once);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.WHATSAPP_ACCESS_TOKEN;
    delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  }
});

test("attemptCoordinationNotifications — coordination introuvable : no-op silencieux, jamais une erreur", async () => {
  const { state } = buildCoordination();
  const applyAndPersist = (current: ProductState, command: Parameters<typeof applyCommand>[1]) => applyCommand(current, command);
  const next = await attemptCoordinationNotifications(state, "coord-inexistante", applyAndPersist);
  assert.deepEqual(next, state);
});
