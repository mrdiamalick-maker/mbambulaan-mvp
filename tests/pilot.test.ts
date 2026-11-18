import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { buildPilotActorRows, buildPilotScorecard, isPilotActor } from "../src/domain/pilot";
import type { ProductState, TerrainInteractionMessageType, TerrainInterpretation } from "../src/domain/types";

const NOW = "2026-11-18T09:00:00.000Z";

function receive(
  state: ProductState,
  phone: string,
  rawContent: string,
  externalMessageId: string,
  messageType: TerrainInteractionMessageType = "texte"
) {
  return applyCommand(state, {
    type: "receive_channel_message",
    channel: "whatsapp",
    channelAddress: phone,
    messageType,
    rawContent,
    receivedAt: NOW,
    externalMessageId
  });
}

function onboardAndInteract(state: ProductState, phone: string, name: string, roleChoice: string, territoryAnswer: string, message: string, wamid: string) {
  let next = receive(state, phone, "Bonjour", `${wamid}-0`);
  next = receive(next, phone, name, `${wamid}-1`);
  next = receive(next, phone, roleChoice, `${wamid}-2`);
  next = receive(next, phone, territoryAnswer, `${wamid}-3`);
  next = receive(next, phone, message, wamid);
  return { state: next, interaction: next.terrainInteractions.at(-1)! };
}

function interpret(state: ProductState, interactionId: string, interpretation: Omit<TerrainInterpretation, "interpretedAt">) {
  return applyCommand(state, { type: "apply_terrain_interpretation", interactionId, outcome: "succes", interpretation });
}

const NEED_GLACE_MBOUR: Omit<TerrainInterpretation, "interpretedAt"> = {
  intent: "besoin",
  summary: "Besoin de glace à Mbour aujourd'hui.",
  subject: "glace",
  territoryId: "mbour",
  confidence: "moyenne",
  needsHumanReview: false
};

const CAPACITY_GLACE_MBOUR: Omit<TerrainInterpretation, "interpretedAt"> = {
  intent: "capacite",
  summary: "Capacité de glace à Mbour.",
  subject: "glace",
  territoryId: "mbour",
  confidence: "moyenne",
  needsHumanReview: false
};

test("isPilotActor — distingue les acteurs de démonstration (sans Conversation) des acteurs pilotes réels", () => {
  const state = createDemoState();
  const demoActorId = state.actors[0].id;
  assert.equal(isPilotActor(state, demoActorId), false, "un acteur du Demo World n'apparaît jamais dans conversations");

  const { state: next, interaction } = onboardAndInteract(state, "221700000001", "Awa", "2", "mbour", "Besoin de glace", "wa-1");
  assert.equal(isPilotActor(next, interaction.actorId!), true, "un acteur onboardé par WhatsApp est un acteur pilote réel");
});

test("buildPilotScorecard — les compteurs dérivent correctement d'un state construit à la main", () => {
  let state = createDemoState();
  const neederResult = onboardAndInteract(state, "221700000011", "Awa", "2", "mbour", "Besoin de glace à Mbour", "wa-need");
  state = neederResult.state;
  state = interpret(state, neederResult.interaction.id, NEED_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: neederResult.interaction.actorId!, interactionId: neederResult.interaction.id });

  const providerResult = onboardAndInteract(state, "221700000012", "Moussa", "4", "mbour", "Capacité de glace à Mbour", "wa-cap");
  state = providerResult.state;
  state = interpret(state, providerResult.interaction.id, CAPACITY_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: providerResult.interaction.actorId!, interactionId: providerResult.interaction.id });

  const need = state.terrainNeeds[0];
  state = applyCommand(state, { type: "refresh_terrain_matches", actorId: neederResult.interaction.actorId!, needId: need.id });
  const match = state.terrainMatches.find((item) => item.needId === need.id)!;
  state = applyCommand(state, {
    type: "initiate_terrain_coordination",
    actorId: neederResult.interaction.actorId!,
    matchId: match.id,
    requesterMessage: "test",
    providerMessage: "test"
  });
  const coordination = state.terrainCoordinations[0];
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: neederResult.interaction.actorId!, coordinationId: coordination.id, side: "demandeur", response: "acceptee" });
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: providerResult.interaction.actorId!, coordinationId: coordination.id, side: "fournisseur", response: "acceptee" });

  let scorecard = buildPilotScorecard(state);
  assert.equal(scorecard.onboardedActors, 2);
  assert.equal(scorecard.activeUsers, 2);
  assert.equal(scorecard.needCount, 1);
  assert.equal(scorecard.capacityCount, 1);
  assert.equal(scorecard.matchesProposed, 1);
  assert.equal(scorecard.coordinationsInitiated, 1);
  assert.equal(scorecard.successfulCoordinations, 0, "pas encore terminée");

  state = applyCommand(state, {
    type: "update_terrain_coordination_status",
    actorId: neederResult.interaction.actorId!,
    coordinationId: coordination.id,
    status: "terminee",
    outcome: { fulfilled: true }
  });
  scorecard = buildPilotScorecard(state);
  assert.equal(scorecard.successfulCoordinations, 1, "une coordination terminée+satisfaite incrémente le compteur de succès");
});

test("buildPilotActorRows — ne retourne jamais un acteur du Demo World", () => {
  const state = createDemoState();
  const rows = buildPilotActorRows(state);
  assert.equal(rows.length, 0, "aucun acteur pilote réel n'existe encore dans l'état de démonstration seul");
});

test("record_commercial_research — upsert par organizationId/actorId, audité, aucun effet de facturation", () => {
  let state = createDemoState();
  const providerActorId = state.actors.find((item) => !item.organizationId)?.id ?? state.actors[0].id;
  const auditCountBefore = state.audit.length;
  const organizationsBefore = state.organizations.length;
  const subscriptionsBefore = state.subscriptions.length;

  state = applyCommand(state, {
    type: "record_commercial_research",
    actorId: "act-admin",
    providerActorId,
    contactedForPilot: true,
    willingnessToPayAsked: false
  });
  assert.equal(state.commercialResearchRecords.length, 1);
  assert.equal(state.audit.length, auditCountBefore + 1);
  assert.equal(state.organizations.length, organizationsBefore, "aucune organisation créée");
  assert.equal(state.subscriptions.length, subscriptionsBefore, "aucun abonnement créé — recherche uniquement");

  state = applyCommand(state, {
    type: "record_commercial_research",
    actorId: "act-admin",
    providerActorId,
    contactedForPilot: true,
    willingnessToPayAsked: true,
    willingnessToPayResponse: "oui",
    indicativeAmountFcfa: 5000
  });
  assert.equal(state.commercialResearchRecords.length, 1, "un second appel pour le même acteur met à jour, ne duplique pas");
  assert.equal(state.commercialResearchRecords[0].willingnessToPayResponse, "oui");
  assert.equal(state.commercialResearchRecords[0].indicativeAmountFcfa, 5000);
});

test("record_operational_failure / mark_operational_failure_resolved", () => {
  let state = createDemoState();
  state = applyCommand(state, { type: "record_operational_failure", channel: "whatsapp", channelAddress: "221700000099", reason: "Échec d'envoi." });
  assert.equal(state.operationalFailures.length, 1);
  assert.equal(state.operationalFailures[0].resolved, false);

  const failureId = state.operationalFailures[0].id;
  state = applyCommand(state, { type: "mark_operational_failure_resolved", actorId: "act-admin", failureId });
  assert.equal(state.operationalFailures[0].resolved, true);

  // Idempotent : le marquer une seconde fois ne plante pas et reste vrai.
  state = applyCommand(state, { type: "mark_operational_failure_resolved", actorId: "act-admin", failureId });
  assert.equal(state.operationalFailures[0].resolved, true);
});

test("retry_coordination_notification — ne remet en « a_envoyer » que la notification visée", () => {
  let state = createDemoState();
  const neederResult = onboardAndInteract(state, "221700000021", "Awa", "2", "mbour", "Besoin de glace à Mbour", "wa-need2");
  state = neederResult.state;
  state = interpret(state, neederResult.interaction.id, NEED_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: neederResult.interaction.actorId!, interactionId: neederResult.interaction.id });

  const providerResult = onboardAndInteract(state, "221700000022", "Moussa", "4", "mbour", "Capacité de glace à Mbour", "wa-cap2");
  state = providerResult.state;
  state = interpret(state, providerResult.interaction.id, CAPACITY_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: providerResult.interaction.actorId!, interactionId: providerResult.interaction.id });

  const need = state.terrainNeeds[0];
  state = applyCommand(state, { type: "refresh_terrain_matches", actorId: neederResult.interaction.actorId!, needId: need.id });
  const match = state.terrainMatches.find((item) => item.needId === need.id)!;
  state = applyCommand(state, {
    type: "initiate_terrain_coordination",
    actorId: neederResult.interaction.actorId!,
    matchId: match.id,
    requesterMessage: "test",
    providerMessage: "test"
  });
  const coordinationId = state.terrainCoordinations[0].id;

  // Simule un échec d'envoi pour les deux côtés.
  state = applyCommand(state, { type: "record_coordination_notification_result", coordinationId, target: "demandeur", status: "echec", failureReason: "panne réseau" });
  state = applyCommand(state, { type: "record_coordination_notification_result", coordinationId, target: "fournisseur", status: "echec", failureReason: "panne réseau" });

  state = applyCommand(state, { type: "retry_coordination_notification", actorId: "act-admin", coordinationId, target: "demandeur" });
  const coordination = state.terrainCoordinations.find((item) => item.id === coordinationId)!;
  const demandeur = coordination.notifications.find((item) => item.target === "demandeur")!;
  const fournisseur = coordination.notifications.find((item) => item.target === "fournisseur")!;
  assert.equal(demandeur.status, "a_envoyer", "seule la notification visée repasse en a_envoyer");
  assert.equal(demandeur.failureReason, undefined);
  assert.equal(fournisseur.status, "echec", "l'autre côté reste inchangé");

  // Retenter une notification déjà "a_envoyer" doit échouer explicitement.
  assert.throws(() => applyCommand(state, { type: "retry_coordination_notification", actorId: "act-admin", coordinationId, target: "demandeur" }));
});
