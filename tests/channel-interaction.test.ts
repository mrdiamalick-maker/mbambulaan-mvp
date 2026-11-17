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
import type { ProductState, TerrainInteractionMessageType, TerrainInterpretation } from "../src/domain/types";

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

function onboard(state: ProductState, name: string, roleChoice: string, territoryAnswer: string) {
  let next = receive(state, "Bonjour", NOW, "onb-1");
  next = receive(next, name, NOW, "onb-2");
  next = receive(next, roleChoice, NOW, "onb-3");
  next = receive(next, territoryAnswer, NOW, "onb-4");
  return next;
}

const SUCCESSFUL_INTERPRETATION: Omit<TerrainInterpretation, "interpretedAt"> = {
  intent: "besoin",
  summary: "Besoin de glace à Mbour aujourd'hui.",
  subject: "glace",
  territoryId: "mbour",
  timeWindow: "aujourd'hui",
  confidence: "moyenne",
  needsHumanReview: false
};

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

// --- D008 / T02 §2 : correction du comportement T01 -----------------------

test("D008 : le tout premier message substantiel est préservé comme interaction, AVANT tout Actor, et déclenche l'onboarding", () => {
  let state = createDemoState();
  const actorsBefore = state.actors.length;

  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");

  const conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.ok(conversation, "un contact inconnu doit créer une conversation minimale dès le premier message");
  assert.equal(state.actors.length, actorsBefore, "aucun Actor ne doit être fabriqué avant d'avoir un prénom/rôle/site réels");

  assert.equal(state.terrainInteractions.length, 1, "le message initial substantiel doit créer exactement une interaction");
  const interaction = state.terrainInteractions[0];
  assert.equal(interaction.rawContent, "J'ai besoin de glace aujourd'hui à Mbour.");
  assert.equal(interaction.evidenceStatus, "declaree");
  assert.equal(interaction.intent, "non_classifie", "aucune interprétation n'existe encore à ce stade");
  assert.equal(interaction.processingStatus, "en_attente_traitement");
  assert.equal(interaction.actorId, undefined, "pas encore d'Actor réel à référencer");
  assert.equal(interaction.conversationId, conversation.id);

  assert.equal(conversation.onboardingStage, "prenom_demande");
  assert.deepEqual(determineReplyIntent(conversation), { kind: "ask_prenom" });
});

test("D008 : les réponses d'onboarding (prénom/rôle/site) — reconnues ou non — ne créent JAMAIS d'interaction terrain, seulement l'historique de conversation", () => {
  let state = createDemoState();
  const actorsBefore = state.actors.length;
  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");
  assert.equal(state.terrainInteractions.length, 1);

  state = receive(state, "Khady", NOW, "wamid.2");
  let conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "role_demande");
  assert.equal(conversation.pendingName, "Khady");
  assert.equal(state.terrainInteractions.length, 1, "la réponse 'prénom' ne doit pas créer d'interaction");

  // Réponse non reconnue : le stade ne progresse pas, et elle non plus ne
  // crée jamais d'interaction (mandat §2, "profile-completion chatter").
  state = receive(state, "je ne sais pas", NOW, "wamid.x");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "role_demande");
  assert.equal(state.terrainInteractions.length, 1);

  state = receive(state, "2", NOW, "wamid.3"); // mareyeur
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "site_demande");
  assert.equal(state.terrainInteractions.length, 1, "la réponse 'rôle' ne doit pas créer d'interaction");

  state = receive(state, "Mbour", NOW, "wamid.4");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.equal(conversation.onboardingStage, "complet");
  assert.equal(state.actors.length, actorsBefore + 1, "l'Actor réel doit maintenant exister");
  assert.equal(
    state.terrainInteractions.length,
    1,
    "le message qui COMPLÈTE l'onboarding (la réponse 'site') ne crée pas non plus d'interaction — seul le message SUIVANT recommencera à en créer"
  );

  // L'historique complet de conversation, lui, n'a rien perdu (mandat §2,
  // "do not delete conversation history").
  assert.deepEqual(conversation.messages.map((m) => m.body), [
    "J'ai besoin de glace aujourd'hui à Mbour.",
    "Khady",
    "je ne sais pas",
    "2",
    "Mbour"
  ]);
});

test("D008 : une fois l'onboarding complet, les messages substantiels suivants recréent normalement des interactions", () => {
  let state = onboard(createDemoState(), "Awa", "2", "Mbour");
  const conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  const actorId = conversation.actorId!;
  assert.equal(state.terrainInteractions.length, 1, "seul le message initial a créé une interaction jusqu'ici");

  state = receive(state, "Deuxième message réel, bien après l'onboarding.", "2026-11-18T08:00:00.000Z", "wamid.5");
  assert.equal(state.terrainInteractions.length, 2);
  const lastInteraction = state.terrainInteractions.at(-1)!;
  assert.equal(lastInteraction.actorId, actorId);
  assert.equal(lastInteraction.processingStatus, "en_attente_traitement");
  assert.equal(state.conversations.length, 1, "un même numéro ne doit jamais créer une seconde conversation");
});

test("onboarding : Actor créé sans organisation fabriquée, jamais vérifié automatiquement", () => {
  const state = onboard(createDemoState(), "Khady", "2", "Mbour");
  const conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  const actor = state.actors.find((item) => item.id === conversation.actorId)!;
  assert.equal(actor.name, "Khady");
  assert.equal(actor.role, "mareyeur");
  assert.equal(actor.phone, PHONE);
  assert.deepEqual(actor.territoryIds, ["mbour"]);
  assert.equal(actor.verified, false);
  assert.equal(actor.organizationId, undefined);
});

// --- Pipeline d'interprétation (apply_terrain_interpretation) -------------

test("apply_terrain_interpretation (succès) : applique l'interprétation, synchronise intent, ne régresse jamais evidenceStatus", () => {
  let state = createDemoState();
  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");
  const interaction = state.terrainInteractions[0];

  state = applyCommand(state, {
    type: "apply_terrain_interpretation",
    interactionId: interaction.id,
    outcome: "succes",
    interpretation: SUCCESSFUL_INTERPRETATION
  });

  const updated = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(updated.processingStatus, "traitee");
  assert.equal(updated.intent, "besoin", "TerrainInteraction.intent doit rester synchronisé avec interpretation.intent");
  assert.equal(updated.territoryId, "mbour", "un territoire résolu par l'IA doit être appliqué si aucun n'était déjà connu");
  assert.equal(updated.evidenceStatus, "declaree", "le traitement IA ne doit jamais faire progresser evidenceStatus (mandat §9)");
  assert.ok(updated.interpretation);
  assert.equal(updated.interpretation!.summary, SUCCESSFUL_INTERPRETATION.summary);
  assert.ok(updated.interpretation!.interpretedAt);
});

test("apply_terrain_interpretation (échec) : préserve l'interaction d'origine, jamais perdue, état explicite + retraitable", () => {
  let state = createDemoState();
  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");
  const interaction = state.terrainInteractions[0];

  state = applyCommand(state, {
    type: "apply_terrain_interpretation",
    interactionId: interaction.id,
    outcome: "echec",
    failureReason: "Timeout du fournisseur IA."
  });

  const updated = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(updated.processingStatus, "echec_traitement");
  assert.equal(updated.processingFailureReason, "Timeout du fournisseur IA.");
  assert.equal(updated.rawContent, "J'ai besoin de glace aujourd'hui à Mbour.", "le contenu original ne doit jamais être perdu par un échec");
  assert.equal(updated.intent, "non_classifie");
});

test("apply_terrain_interpretation échoue explicitement pour une interaction introuvable", () => {
  const state = createDemoState();
  assert.throws(() =>
    applyCommand(state, { type: "apply_terrain_interpretation", interactionId: "ti-inexistante", outcome: "echec", failureReason: "x" })
  );
});

test("un message audio/image produit une interaction avec le bon messageType, en_attente_traitement, jamais de plantage", () => {
  let state = createDemoState();
  state = receive(state, "[Message WhatsApp de type « audio » reçu — en attente de traitement IA]", NOW, "wamid.audio", "audio");
  const interaction = state.terrainInteractions[0];
  assert.equal(interaction.messageType, "audio");
  assert.equal(interaction.processingStatus, "en_attente_traitement");
  assert.equal(interaction.evidenceStatus, "declaree");
});

// --- Correction humaine (correct_terrain_interpretation, mandat §8) -------

test("correct_terrain_interpretation : confirmer sans rien changer conserve l'intention, trace l'opérateur, lève needsHumanReview", () => {
  let state = createDemoState();
  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");
  const interaction = state.terrainInteractions[0];
  state = applyCommand(state, {
    type: "apply_terrain_interpretation",
    interactionId: interaction.id,
    outcome: "succes",
    interpretation: { ...SUCCESSFUL_INTERPRETATION, needsHumanReview: true }
  });

  state = applyCommand(state, {
    type: "correct_terrain_interpretation",
    actorId: "act-admin",
    interactionId: interaction.id,
    markForReview: false
  });

  const updated = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(updated.intent, "besoin", "confirmer ne doit pas changer l'intention");
  assert.equal(updated.interpretation!.needsHumanReview, false);
  assert.equal(updated.interpretation!.correctedByActorId, "act-admin");
  assert.ok(updated.interpretation!.correctedAt);
  assert.equal(updated.interpretation!.correctedFromIntent, undefined, "confirmer sans changer l'intention ne doit pas remplir correctedFromIntent");
});

test("correct_terrain_interpretation : corriger l'intention trace l'intention IA d'origine (auditable), jamais une réécriture muette", () => {
  let state = createDemoState();
  state = receive(state, "La machine à glace du quai est en panne.", NOW, "wamid.1");
  const interaction = state.terrainInteractions[0];
  state = applyCommand(state, {
    type: "apply_terrain_interpretation",
    interactionId: interaction.id,
    outcome: "succes",
    interpretation: { intent: "non_classifie", summary: "Ambigu.", confidence: "faible", needsHumanReview: true }
  });

  state = applyCommand(state, {
    type: "correct_terrain_interpretation",
    actorId: "act-admin",
    interactionId: interaction.id,
    intent: "signal",
    note: "Corrigé : c'est bien une panne.",
    markForReview: false
  });

  const updated = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(updated.intent, "signal");
  assert.equal(updated.interpretation!.correctedFromIntent, "non_classifie");
  assert.equal(updated.interpretation!.correctionNote, "Corrigé : c'est bien une panne.");
});

test("correct_terrain_interpretation échoue si aucune interprétation n'existe encore à corriger", () => {
  let state = createDemoState();
  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");
  const interaction = state.terrainInteractions[0];
  assert.throws(() =>
    applyCommand(state, { type: "correct_terrain_interpretation", actorId: "act-admin", interactionId: interaction.id, markForReview: true })
  );
});

// --- determineReplyIntent / confirmation (mandat §7) ----------------------

test("determineReplyIntent : propose une confirmation uniquement quand needsHumanReview est vrai, jamais pendant l'onboarding", () => {
  let state = createDemoState();
  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", NOW, "wamid.1");
  let interaction = state.terrainInteractions[0];
  let conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;

  // Pendant l'onboarding, la priorité reste déterministe (mandat §7,
  // "onboarding still has deterministic priority") — jamais une
  // confirmation d'interprétation avant que l'onboarding ne soit fini.
  state = applyCommand(state, {
    type: "apply_terrain_interpretation",
    interactionId: interaction.id,
    outcome: "succes",
    interpretation: { ...SUCCESSFUL_INTERPRETATION, needsHumanReview: true }
  });
  interaction = state.terrainInteractions[0];
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  assert.deepEqual(determineReplyIntent(conversation, interaction, state.territories), { kind: "ask_prenom" });

  state = onboard(createDemoState(), "Khady", "2", "Mbour");
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  state = receive(state, "J'ai besoin de glace aujourd'hui à Mbour.", "2026-11-18T08:00:00.000Z", "wamid.need");
  interaction = state.terrainInteractions.at(-1)!;
  state = applyCommand(state, {
    type: "apply_terrain_interpretation",
    interactionId: interaction.id,
    outcome: "succes",
    interpretation: { ...SUCCESSFUL_INTERPRETATION, needsHumanReview: true }
  });
  interaction = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  conversation = state.conversations.find((c) => c.channelAddress === PHONE)!;
  const reply = determineReplyIntent(conversation, interaction, state.territories);
  assert.equal(reply.kind, "confirm_interpretation");

  // Faible confiance → pas de confirmation demandée, ack générique.
  const confidentInteraction = { ...interaction, interpretation: { ...interaction.interpretation!, needsHumanReview: false } };
  assert.deepEqual(determineReplyIntent(conversation, confidentInteraction, state.territories), { kind: "ack" });
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

test("buildTerrainInteractionRows — projection triée, plus récent en premier, avec libellés réels et champs d'interprétation", () => {
  let state = onboard(createDemoState(), "Awa", "2", "Mbour");
  state = receive(state, "Premier message réel.", "2026-11-17T10:00:00.000Z", "wamid.a");
  const first = state.terrainInteractions.at(-1)!;
  state = applyCommand(state, {
    type: "apply_terrain_interpretation",
    interactionId: first.id,
    outcome: "succes",
    interpretation: SUCCESSFUL_INTERPRETATION
  });
  state = receive(state, "Second message réel, plus tard.", "2026-11-17T11:00:00.000Z", "wamid.b");

  const rows = buildTerrainInteractionRows(state);
  assert.equal(rows[0].message, "Second message réel, plus tard.", "le plus récent doit apparaître en premier");
  assert.equal(rows[0].actorName, "Awa");
  assert.equal(rows[0].roleLabel, "Mareyeur");
  assert.equal(rows[0].territoryLabel, "Mbour");
  assert.equal(rows[0].evidenceStatusLabel, "Déclarée");
  assert.equal(rows[0].processingStatusLabel, "En attente de traitement IA");
  assert.equal(rows[0].hasInterpretation, false);

  const interpretedRow = rows.find((row) => row.message === "Premier message réel.")!;
  assert.equal(interpretedRow.hasInterpretation, true);
  assert.equal(interpretedRow.intentLabel, "Besoin");
  assert.equal(interpretedRow.subject, "glace");
  assert.equal(interpretedRow.confidenceLabel, "Moyenne");
  assert.equal(interpretedRow.needsHumanReview, false);
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
