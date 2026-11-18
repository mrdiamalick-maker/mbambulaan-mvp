import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { applyCommand } from "../src/domain/rules";
import { computeMatchCandidates, deriveMatchCategory, evaluatePromotion, buildTerrainValueEvidence } from "../src/domain/terrain-matching";
import type { ProductState, TerrainInterpretation } from "../src/domain/types";

const NOW = "2026-11-18T09:00:00.000Z";

function onboardAndInteract(
  state: ProductState,
  phone: string,
  name: string,
  roleChoice: string,
  territoryAnswer: string,
  message: string,
  wamid: string
) {
  let next = applyCommand(state, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: "Bonjour", receivedAt: NOW, externalMessageId: `${wamid}-0` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: name, receivedAt: NOW, externalMessageId: `${wamid}-1` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: roleChoice, receivedAt: NOW, externalMessageId: `${wamid}-2` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: territoryAnswer, receivedAt: NOW, externalMessageId: `${wamid}-3` });
  next = applyCommand(next, { type: "receive_channel_message", channel: "whatsapp", channelAddress: phone, messageType: "texte", rawContent: message, receivedAt: NOW, externalMessageId: wamid });
  const interaction = next.terrainInteractions.at(-1)!;
  return { state: next, interaction };
}

function interpret(state: ProductState, interactionId: string, interpretation: Omit<TerrainInterpretation, "interpretedAt">) {
  return applyCommand(state, { type: "apply_terrain_interpretation", interactionId, outcome: "succes", interpretation });
}

const NEED_GLACE_MBOUR: Omit<TerrainInterpretation, "interpretedAt"> = {
  intent: "besoin",
  summary: "Besoin de glace à Mbour aujourd'hui.",
  subject: "glace",
  territoryId: "mbour",
  timeWindow: "aujourd'hui",
  confidence: "moyenne",
  needsHumanReview: false
};

const CAPACITY_GLACE_MBOUR: Omit<TerrainInterpretation, "interpretedAt"> = {
  intent: "capacite",
  summary: "Glace disponible à Mbour aujourd'hui.",
  subject: "glace",
  territoryId: "mbour",
  timeWindow: "aujourd'hui",
  confidence: "moyenne",
  needsHumanReview: false
};

function setupNeedAndCapacity(opts?: { capacityTimeWindow?: string; capacityQuantity?: number; capacityUnit?: string; needQuantity?: number; needUnit?: string; category?: "transport" }) {
  let state = createDemoState();
  const need = onboardAndInteract(state, "221771000001", "Awa", "2", "Mbour", "J'ai besoin de glace aujourd'hui à Mbour.", "wamid.need");
  state = interpret(need.state, need.interaction.id, {
    ...NEED_GLACE_MBOUR,
    quantity: opts?.needQuantity,
    unit: opts?.needUnit,
    ...(opts?.category ? { subject: "transport" } : {})
  });
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: need.interaction.actorId!, interactionId: need.interaction.id });
  const needId = state.terrainNeeds.at(-1)!.id;

  const capacity = onboardAndInteract(state, "221772000002", "Froid Mbour", "4", "Mbour", "Nous avons de la glace disponible aujourd'hui à Mbour.", "wamid.cap");
  state = interpret(capacity.state, capacity.interaction.id, {
    ...CAPACITY_GLACE_MBOUR,
    timeWindow: opts?.capacityTimeWindow ?? CAPACITY_GLACE_MBOUR.timeWindow,
    quantity: opts?.capacityQuantity,
    unit: opts?.capacityUnit
  });
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: capacity.interaction.actorId!, interactionId: capacity.interaction.id });
  const capacityId = state.terrainCapacities.at(-1)!.id;

  return { state, needId, capacityId, needInteractionId: need.interaction.id, capacityInteractionId: capacity.interaction.id };
}

// --- Promotion --------------------------------------------------------

test("promotion : une interaction NEED interprétée crée exactement un Need canonique, avec provenance", () => {
  let state = createDemoState();
  const { state: onboarded, interaction } = onboardAndInteract(state, "221771000001", "Awa", "2", "Mbour", "J'ai besoin de glace aujourd'hui à Mbour.", "wamid.need");
  state = interpret(onboarded, interaction.id, NEED_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: interaction.actorId!, interactionId: interaction.id });

  assert.equal(state.terrainNeeds.length, 1);
  const need = state.terrainNeeds[0];
  assert.equal(need.sourceInteractionId, interaction.id);
  assert.equal(need.actorId, interaction.actorId);
  assert.equal(need.territoryId, "mbour");
  assert.equal(need.category, "glace_froid");
  assert.equal(need.subject, "glace");
  assert.equal(need.status, "active");
  assert.equal(state.terrainCapacities.length, 0, "une interaction besoin ne doit jamais créer de capacité");
});

test("promotion : duplicate promotion ne duplique jamais (idempotence, mandat §14)", () => {
  let state = createDemoState();
  const { state: onboarded, interaction } = onboardAndInteract(state, "221771000001", "Awa", "2", "Mbour", "J'ai besoin de glace aujourd'hui à Mbour.", "wamid.need");
  state = interpret(onboarded, interaction.id, NEED_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: interaction.actorId!, interactionId: interaction.id });
  assert.equal(state.terrainNeeds.length, 1);

  // Rappelée (retry webhook, double-clic opérateur) : aucune duplication.
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: interaction.actorId!, interactionId: interaction.id });
  assert.equal(state.terrainNeeds.length, 1, "une seconde promotion ne doit jamais créer un second Need");
});

test("promotion : une interaction CAPACITY interprétée crée exactement une représentation de capacité", () => {
  let state = createDemoState();
  const { state: onboarded, interaction } = onboardAndInteract(state, "221772000002", "Froid Mbour", "4", "Mbour", "Nous avons de la glace disponible aujourd'hui à Mbour.", "wamid.cap");
  state = interpret(onboarded, interaction.id, CAPACITY_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: interaction.actorId!, interactionId: interaction.id });

  assert.equal(state.terrainCapacities.length, 1);
  const capacity = state.terrainCapacities[0];
  assert.equal(capacity.sourceInteractionId, interaction.id);
  assert.equal(capacity.category, "glace_froid");
  assert.equal(capacity.status, "active");
  assert.equal(state.terrainNeeds.length, 0, "une interaction capacité ne doit jamais créer de besoin");
});

test("promotion : données manquantes/à revoir acheminent vers une revue humaine, jamais une donnée fabriquée", () => {
  let state = createDemoState();
  const { state: onboarded, interaction } = onboardAndInteract(state, "221771000001", "Awa", "2", "Mbour", "Bonjour tout le monde", "wamid.ambigu");
  // Ambigu : non_classifie, needsHumanReview=true.
  state = interpret(onboarded, interaction.id, { intent: "non_classifie", summary: "Ambigu.", confidence: "faible", needsHumanReview: true });

  const refreshed = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  const eligibility = evaluatePromotion(refreshed);
  assert.equal(eligibility.eligible, false);

  assert.throws(() => applyCommand(state, { type: "promote_terrain_interaction", actorId: interaction.actorId!, interactionId: interaction.id }));
  assert.equal(state.terrainNeeds.length, 0);
  assert.equal(state.terrainCapacities.length, 0);
});

test("promotion : un sujet hors des 3 catégories reconnues bloque la promotion (jamais une catégorie fabriquée)", () => {
  let state = createDemoState();
  const { state: onboarded, interaction } = onboardAndInteract(state, "221771000001", "Awa", "2", "Mbour", "J'ai besoin de carburant.", "wamid.horscategorie");
  state = interpret(onboarded, interaction.id, { intent: "besoin", summary: "Besoin de carburant.", subject: "carburant", confidence: "moyenne", needsHumanReview: false });
  const refreshed = state.terrainInteractions.find((item) => item.id === interaction.id)!;
  assert.equal(evaluatePromotion(refreshed).eligible, false);
  assert.throws(() => applyCommand(state, { type: "promote_terrain_interaction", actorId: interaction.actorId!, interactionId: interaction.id }));
});

// --- Matching -----------------------------------------------------------

test("matching : un besoin de glace à Mbour matche une capacité glace/froid active à Mbour", () => {
  const { state, needId } = setupNeedAndCapacity();
  const need = state.terrainNeeds.find((item) => item.id === needId)!;
  const candidates = computeMatchCandidates(state, need);
  assert.equal(candidates.length, 1);
  assert.ok(candidates[0].reasons.some((r) => r.includes("Même territoire")));
  assert.equal(candidates[0].warnings.length, 0);
  assert.equal(candidates[0].priority, "haute");
});

test("matching : une capacité expirée ne matche jamais", () => {
  const { state: baseState, needId, capacityId } = setupNeedAndCapacity();
  const state = {
    ...baseState,
    terrainCapacities: baseState.terrainCapacities.map((item) => (item.id === capacityId ? { ...item, status: "expiree" as const } : item))
  };
  const need = state.terrainNeeds.find((item) => item.id === needId)!;
  assert.equal(computeMatchCandidates(state, need).length, 0);
});

test("matching : un besoin de transport ne matche jamais une capacité de froid", () => {
  let state = createDemoState();
  const need = onboardAndInteract(state, "221771000003", "Moussa", "2", "Mbour", "Je cherche un camion pour Dakar.", "wamid.transport");
  state = interpret(need.state, need.interaction.id, { intent: "besoin", summary: "Besoin de transport.", subject: "transport", territoryId: "mbour", confidence: "moyenne", needsHumanReview: false });
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: need.interaction.actorId!, interactionId: need.interaction.id });
  const transportNeed = state.terrainNeeds.at(-1)!;

  const capacity = onboardAndInteract(state, "221772000004", "Froid Mbour", "4", "Mbour", "Glace disponible.", "wamid.froid");
  state = interpret(capacity.state, capacity.interaction.id, CAPACITY_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: capacity.interaction.actorId!, interactionId: capacity.interaction.id });

  assert.equal(computeMatchCandidates(state, transportNeed).length, 0, "catégories différentes : jamais de match");
});

test("matching : un acteur ne matche jamais sa propre capacité", () => {
  let state = createDemoState();
  const both = onboardAndInteract(state, "221771000005", "Khady", "4", "Mbour", "J'ai besoin de glace aujourd'hui à Mbour.", "wamid.self-need");
  state = interpret(both.state, both.interaction.id, NEED_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: both.interaction.actorId!, interactionId: both.interaction.id });
  const need = state.terrainNeeds.at(-1)!;

  // Même acteur, nouvelle interaction (déjà onboardé) déclarant une capacité.
  state = applyCommand(state, { type: "receive_channel_message", channel: "whatsapp", channelAddress: "221771000005", messageType: "texte", rawContent: "Nous avons de la glace disponible aujourd'hui à Mbour.", receivedAt: NOW, externalMessageId: "wamid.self-cap" });
  const capInteraction = state.terrainInteractions.at(-1)!;
  state = interpret(state, capInteraction.id, CAPACITY_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: capInteraction.actorId!, interactionId: capInteraction.id });

  assert.equal(computeMatchCandidates(state, need).length, 0, "le fournisseur et le demandeur ne doivent jamais être le même acteur");
});

test("matching : une fenêtre temporelle différente produit un avertissement explicite, jamais une exclusion silencieuse", () => {
  const { state, needId } = setupNeedAndCapacity({ capacityTimeWindow: "demain" });
  const need = state.terrainNeeds.find((item) => item.id === needId)!;
  const candidates = computeMatchCandidates(state, need);
  assert.equal(candidates.length, 1, "la règle explicite retenue est l'avertissement, pas l'exclusion");
  assert.ok(candidates[0].warnings.some((w) => w.includes("Fenêtre temporelle différente")));
  assert.equal(candidates[0].priority, "moyenne");
});

test("matching : un écart de quantité est expliqué, jamais silencieux", () => {
  const { state, needId } = setupNeedAndCapacity({ needQuantity: 5, needUnit: "tonnes", capacityQuantity: 2, capacityUnit: "tonnes" });
  const need = state.terrainNeeds.find((item) => item.id === needId)!;
  const candidates = computeMatchCandidates(state, need);
  assert.equal(candidates.length, 1);
  assert.ok(candidates[0].warnings.some((w) => w.includes("inférieure au besoin")));
});

test("refresh_terrain_matches : persiste les candidats, idempotent, et périme un match dont la capacité a expiré", () => {
  const { state: base, needId, capacityId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  assert.equal(state.terrainMatches.length, 1);
  assert.equal(state.terrainMatches[0].status, "propose");
  assert.equal(state.terrainMatches[0].priority, "haute");

  // Rappelée : pas de doublon.
  state = applyCommand(state, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  assert.equal(state.terrainMatches.length, 1);

  state = { ...state, terrainCapacities: state.terrainCapacities.map((item) => (item.id === capacityId ? { ...item, status: "expiree" as const } : item)) };
  state = applyCommand(state, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  assert.equal(state.terrainMatches[0].status, "perime", "une capacité qui expire périme son match déjà proposé");
});

test("reject_terrain_match : rejette explicitement, trace l'opérateur, jamais ré-affiché", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  const matchId = state.terrainMatches[0].id;
  state = applyCommand(state, { type: "reject_terrain_match", actorId: "act-admin", matchId, note: "Pas pertinent." });
  const match = state.terrainMatches.find((item) => item.id === matchId)!;
  assert.equal(match.status, "rejete");
  assert.equal(match.rejectedByActorId, "act-admin");
  assert.equal(match.rejectionNote, "Pas pertinent.");
  assert.throws(() => applyCommand(state, { type: "reject_terrain_match", actorId: "act-admin", matchId }));
});

// --- Coordination ---------------------------------------------------------

function initiate(state: ProductState, matchId: string, actorId = "act-admin") {
  return applyCommand(state, {
    type: "initiate_terrain_coordination",
    actorId,
    matchId,
    requesterMessage: "Mbàmbulaan a identifié une possibilité pour votre besoin (glace) à Mbour. Souhaitez-vous être mis en relation ?",
    providerMessage: "Un acteur à Mbour recherche : glace. Souhaitez-vous recevoir la demande ?"
  });
}

test("coordination : un opérateur sélectionne un match valide et initie une coordination, liée au besoin/capacité/interactions", () => {
  const { state: base, needId, capacityId, needInteractionId, capacityInteractionId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  const matchId = state.terrainMatches[0].id;
  state = initiate(state, matchId);

  assert.equal(state.terrainCoordinations.length, 1);
  const coordination = state.terrainCoordinations[0];
  assert.equal(coordination.needId, needId);
  assert.equal(coordination.capacityId, capacityId);
  assert.deepEqual([...coordination.sourceInteractionIds].sort(), [needInteractionId, capacityInteractionId].sort());
  assert.equal(coordination.status, "proposee");
  assert.equal(state.terrainMatches.find((item) => item.id === matchId)!.status, "converti");
  assert.equal(state.terrainNeeds.find((item) => item.id === needId)!.status, "en_coordination");
  assert.equal(state.terrainCapacities.find((item) => item.id === capacityId)!.status, "engagee");
});

test("coordination : les deux notifications (demandeur/fournisseur) sont générées, intention seulement (a_envoyer)", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const notifications = state.terrainCoordinations[0].notifications;
  assert.equal(notifications.length, 2);
  assert.deepEqual(notifications.map((n) => n.target).sort(), ["demandeur", "fournisseur"]);
  assert.ok(notifications.every((n) => n.status === "a_envoyer"));
  assert.ok(notifications.every((n) => n.channel === "whatsapp"));
});

test("coordination : une double initiation sur le même match est idempotente (jamais une seconde coordination)", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  const matchId = state.terrainMatches[0].id;
  state = initiate(state, matchId);
  assert.equal(state.terrainCoordinations.length, 1);
  state = initiate(state, matchId);
  assert.equal(state.terrainCoordinations.length, 1, "une seconde initiation sur le même match ne doit jamais créer une seconde coordination");
});

test("coordination : acceptation demandeur + fournisseur connecte ; un refus échoue immédiatement", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const coordinationId = state.terrainCoordinations[0].id;

  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "demandeur", response: "acceptee" });
  assert.equal(state.terrainCoordinations[0].status, "proposee", "une seule acceptation ne connecte pas encore");
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "fournisseur", response: "acceptee" });
  assert.equal(state.terrainCoordinations[0].status, "connectee", "les deux acceptations connectent");
});

test("coordination : un refus (demandeur ou fournisseur) échoue immédiatement la coordination", () => {
  let state = createDemoState();
  const need = onboardAndInteract(state, "221771000006", "Awa", "2", "Mbour", "J'ai besoin de glace aujourd'hui à Mbour.", "wamid.need2");
  state = interpret(need.state, need.interaction.id, NEED_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: need.interaction.actorId!, interactionId: need.interaction.id });
  const needId = state.terrainNeeds.at(-1)!.id;
  const capacity = onboardAndInteract(state, "221772000007", "Froid Mbour 2", "4", "Mbour", "Glace disponible aujourd'hui à Mbour.", "wamid.cap2");
  state = interpret(capacity.state, capacity.interaction.id, CAPACITY_GLACE_MBOUR);
  state = applyCommand(state, { type: "promote_terrain_interaction", actorId: capacity.interaction.actorId!, interactionId: capacity.interaction.id });

  state = applyCommand(state, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const coordinationId = state.terrainCoordinations[0].id;
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "fournisseur", response: "refusee" });
  assert.equal(state.terrainCoordinations[0].status, "echouee");
  assert.throws(() => applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "demandeur", response: "acceptee" }));
});

test("coordination : l'issue peut être enregistrée une fois connectée, ferme le besoin si satisfait", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const coordinationId = state.terrainCoordinations[0].id;
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "demandeur", response: "acceptee" });
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "fournisseur", response: "acceptee" });

  state = applyCommand(state, {
    type: "update_terrain_coordination_status",
    actorId: "act-admin",
    coordinationId,
    status: "terminee",
    outcome: { fulfilled: true, note: "Besoin satisfait." }
  });

  const coordination = state.terrainCoordinations.find((item) => item.id === coordinationId)!;
  assert.equal(coordination.status, "terminee");
  assert.equal(coordination.outcome?.fulfilled, true);
  assert.equal(coordination.outcome?.recordedByActorId, "act-admin");
  assert.equal(state.terrainNeeds.find((item) => item.id === needId)!.status, "satisfaite");
});

test("update_terrain_coordination_status : ne peut terminer qu'une coordination déjà connectée", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const coordinationId = state.terrainCoordinations[0].id;
  assert.throws(() =>
    applyCommand(state, { type: "update_terrain_coordination_status", actorId: "act-admin", coordinationId, status: "terminee", outcome: { fulfilled: true } })
  );
});

test("record_coordination_notification_result : un échec de notification ne supprime jamais la coordination", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const coordinationId = state.terrainCoordinations[0].id;

  state = applyCommand(state, { type: "record_coordination_notification_result", coordinationId, target: "demandeur", status: "echec", failureReason: "Fournisseur WhatsApp non configuré." });
  const coordination = state.terrainCoordinations.find((item) => item.id === coordinationId)!;
  assert.ok(coordination, "la coordination doit continuer d'exister après un échec de notification");
  assert.equal(coordination.notifications.find((n) => n.target === "demandeur")!.status, "echec");
  assert.equal(coordination.notifications.find((n) => n.target === "demandeur")!.failureReason, "Fournisseur WhatsApp non configuré.");
});

// --- Regression : evidenceStatus jamais promu silencieusement -----------

test("evidenceStatus de la TerrainInteraction d'origine reste 'declaree' du début à la fin de la boucle", () => {
  const { state: base, needId } = setupNeedAndCapacity();
  let state = applyCommand(base, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const coordinationId = state.terrainCoordinations[0].id;
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "demandeur", response: "acceptee" });
  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "fournisseur", response: "acceptee" });
  state = applyCommand(state, { type: "update_terrain_coordination_status", actorId: "act-admin", coordinationId, status: "terminee", outcome: { fulfilled: true } });

  for (const interaction of state.terrainInteractions) {
    assert.equal(interaction.evidenceStatus, "declaree", "aucune étape du moteur de rapprochement ne doit jamais faire progresser evidenceStatus");
  }
});

// --- Revenue evidence (mandat §12) ---------------------------------------

test("buildTerrainValueEvidence : opportunités reçues/acceptées/réussies dérivées, jamais stockées séparément", () => {
  const { state: base, needId, capacityId } = setupNeedAndCapacity();
  // Un acteur onboardé par WhatsApp n'a jamais d'organizationId fabriqué
  // (mandat T01) : ce test vérifie la projection pure buildTerrainValueEvidence
  // elle-même, donc une organisation réelle est posée ici explicitement
  // (hors pipeline), comme le serait une future liaison acteur↔organisation
  // hors périmètre T03.
  const withOrganization: ProductState = { ...base, terrainCapacities: base.terrainCapacities.map((item) => (item.id === capacityId ? { ...item, organizationId: "org-froid" } : item)) };

  let state = applyCommand(withOrganization, { type: "refresh_terrain_matches", actorId: "act-admin", needId });
  state = initiate(state, state.terrainMatches[0].id);
  const coordinationId = state.terrainCoordinations[0].id;
  assert.equal(state.terrainCoordinations[0].providerOrganizationId, "org-froid");

  let evidence = buildTerrainValueEvidence(state);
  assert.equal(evidence.length, 1);
  assert.equal(evidence[0].organizationId, "org-froid");
  assert.equal(evidence[0].opportunitiesReceived, 1);
  assert.equal(evidence[0].opportunitiesAccepted, 0);
  assert.equal(evidence[0].successfulCoordinations, 0);

  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "fournisseur", response: "acceptee" });
  evidence = buildTerrainValueEvidence(state);
  assert.equal(evidence[0].opportunitiesAccepted, 1);

  state = applyCommand(state, { type: "record_terrain_coordination_response", actorId: "act-admin", coordinationId, side: "demandeur", response: "acceptee" });
  state = applyCommand(state, { type: "update_terrain_coordination_status", actorId: "act-admin", coordinationId, status: "terminee", outcome: { fulfilled: true } });
  evidence = buildTerrainValueEvidence(state);
  assert.equal(evidence[0].successfulCoordinations, 1);
});

test("deriveMatchCategory : déterministe, jamais une taxonomie inventée hors des 3 catégories", () => {
  assert.equal(deriveMatchCategory("glace"), "glace_froid");
  assert.equal(deriveMatchCategory("chambre froide"), "glace_froid");
  assert.equal(deriveMatchCategory("transport"), "transport");
  assert.equal(deriveMatchCategory("acheteur"), "acheteur_debouche");
  assert.equal(deriveMatchCategory("prix du poisson"), undefined);
  assert.equal(deriveMatchCategory(undefined), undefined);
});
