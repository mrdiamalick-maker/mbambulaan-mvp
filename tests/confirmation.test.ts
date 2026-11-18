import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { isStopKeyword, matchConfirmationAnswer } from "../src/domain/channel-interaction";
import type { ProductState, TerrainInteractionMessageType, TerrainInterpretation } from "../src/domain/types";

const PHONE = "221771234567";
const NOW = "2026-11-18T09:00:00.000Z";

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

function onboard(state: ProductState, name: string, roleChoice: string, territoryAnswer: string) {
  let next = receive(state, "Bonjour", NOW, "onb-1");
  next = receive(next, name, NOW, "onb-2");
  next = receive(next, roleChoice, NOW, "onb-3");
  next = receive(next, territoryAnswer, NOW, "onb-4");
  return next;
}

const UNCERTAIN_INTERPRETATION: Omit<TerrainInterpretation, "interpretedAt"> = {
  intent: "besoin",
  summary: "Besoin de glace à Mbour aujourd'hui.",
  subject: "glace",
  territoryId: "mbour",
  confidence: "moyenne",
  needsHumanReview: true
};

function conversationFor(state: ProductState) {
  return state.conversations.find((item) => item.channelAddress === PHONE)!;
}

test("matchConfirmationAnswer — variantes françaises simples uniquement, jamais une correspondance approximative", () => {
  assert.equal(matchConfirmationAnswer("Oui"), "oui");
  assert.equal(matchConfirmationAnswer("ok"), "oui");
  assert.equal(matchConfirmationAnswer("D'accord"), "oui");
  assert.equal(matchConfirmationAnswer("Non"), "non");
  assert.equal(matchConfirmationAnswer("pas exact"), "non");
  assert.equal(matchConfirmationAnswer("Je suis d'accord avec vous sur ce point"), undefined, "jamais une correspondance partielle");
  assert.equal(matchConfirmationAnswer("Bonjour"), undefined);
});

test("isStopKeyword — mot-clé exact uniquement", () => {
  assert.equal(isStopKeyword("STOP"), true);
  assert.equal(isStopKeyword("stop"), true);
  assert.equal(isStopKeyword("stop le vol de filets"), false, "un message substantiel contenant « stop » ne doit jamais désinscrire");
});

test("Confirmation en attente + « Oui » — confirme l'interprétation, efface le pendant, ne crée pas de nouvelle interaction", () => {
  let state = onboard(createDemoState(), "Awa", "2", "mbour");
  state = receive(state, "J'ai besoin de glace à Mbour aujourd'hui", NOW, "msg-1");
  const interaction = state.terrainInteractions.at(-1)!;
  state = applyCommand(state, { type: "apply_terrain_interpretation", interactionId: interaction.id, outcome: "succes", interpretation: UNCERTAIN_INTERPRETATION });

  assert.equal(conversationFor(state).pendingConfirmationInteractionId, interaction.id, "la confirmation doit être posée par applyTerrainInterpretation");

  const interactionCountBefore = state.terrainInteractions.length;
  state = receive(state, "Oui", NOW, "msg-2");

  assert.equal(state.terrainInteractions.length, interactionCountBefore, "« Oui » ne doit jamais créer de nouvelle TerrainInteraction");
  assert.equal(conversationFor(state).pendingConfirmationInteractionId, undefined, "le pendant doit être effacé");
  const updated = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(updated.interpretation?.needsHumanReview, false, "la confirmation doit lever needsHumanReview");
  assert.equal(updated.interpretation?.correctedByActorId, conversationFor(state).actorId, "l'auto-confirmation est attribuée au contact lui-même");
});

test("Confirmation en attente + « Non » — reste à revoir, efface le pendant, ne crée pas de nouvelle interaction", () => {
  let state = onboard(createDemoState(), "Awa", "2", "mbour");
  state = receive(state, "J'ai besoin de glace à Mbour aujourd'hui", NOW, "msg-1");
  const interaction = state.terrainInteractions.at(-1)!;
  state = applyCommand(state, { type: "apply_terrain_interpretation", interactionId: interaction.id, outcome: "succes", interpretation: UNCERTAIN_INTERPRETATION });

  const interactionCountBefore = state.terrainInteractions.length;
  state = receive(state, "Non", NOW, "msg-2");

  assert.equal(state.terrainInteractions.length, interactionCountBefore, "« Non » ne doit jamais créer de nouvelle TerrainInteraction");
  assert.equal(conversationFor(state).pendingConfirmationInteractionId, undefined, "le pendant doit être effacé même en cas de refus");
  const updated = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(updated.interpretation?.needsHumanReview, true, "un refus doit laisser l'interprétation à revoir");
});

test("« Oui » SANS confirmation en attente reste un message normal et ne mute jamais une interaction existante", () => {
  let state = onboard(createDemoState(), "Awa", "2", "mbour");
  state = receive(state, "J'ai besoin de glace à Mbour aujourd'hui", NOW, "msg-1");
  const interaction = state.terrainInteractions.at(-1)!;
  state = applyCommand(state, { type: "apply_terrain_interpretation", interactionId: interaction.id, outcome: "succes", interpretation: UNCERTAIN_INTERPRETATION });
  assert.equal(conversationFor(state).pendingConfirmationInteractionId, interaction.id);

  // Un message SANS rapport efface le pendant (mandat : une confirmation
  // en attente ne doit jamais survivre à un message non reconnu).
  state = receive(state, "Autre chose, j'ai aussi un souci de moteur", NOW, "msg-2");
  assert.equal(conversationFor(state).pendingConfirmationInteractionId, undefined);
  const untouchedAfterUnrelated = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(untouchedAfterUnrelated.interpretation?.needsHumanReview, true, "un message sans rapport ne doit jamais muter l'interprétation existante");

  const interactionCountBeforeOui = state.terrainInteractions.length;
  state = receive(state, "Oui", NOW, "msg-3");

  // Aucune confirmation en attente : "Oui" est un message normal (onboarding
  // déjà complet) — il crée sa PROPRE interaction, jamais ne mute l'ancienne.
  assert.equal(state.terrainInteractions.length, interactionCountBeforeOui + 1, "« Oui » sans confirmation en attente est un message normal");
  const stillUntouched = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(stillUntouched.interpretation?.needsHumanReview, true, "l'interaction d'origine ne doit jamais être mutée par un « Oui » hors contexte");
});

test("STOP — désinscrit le contact, les messages suivants ne créent plus d'interaction mais l'historique continue de grandir", () => {
  let state = onboard(createDemoState(), "Awa", "2", "mbour");
  const beforeStop = conversationFor(state).messages.length;
  state = receive(state, "STOP", NOW, "msg-stop");

  const afterStop = conversationFor(state);
  assert.equal(afterStop.optedOut, true);
  assert.ok(afterStop.optedOutAt);
  assert.equal(afterStop.messages.length, beforeStop + 1);

  const interactionCountBefore = state.terrainInteractions.length;
  state = receive(state, "J'ai un besoin urgent de glace", NOW, "msg-after-stop");
  assert.equal(state.terrainInteractions.length, interactionCountBefore, "aucun traitement après désinscription");
  assert.equal(conversationFor(state).messages.length, beforeStop + 2, "l'historique continue de grandir pour trace/audit");
});
