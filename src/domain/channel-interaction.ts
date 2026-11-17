// Channel Interaction — Sprint T01 ("WhatsApp Transport + Terrain Intake
// Foundation", docs/product/CURRENT_SPRINT.md).
//
// Cible conceptuelle du mandat (§3) : Channel Adapter → Conversation
// Intake → Domain Mapping → domaine Mbàmbulaan existant. Ce fichier EST
// la "Domain Mapping" : il ne connaît rien de WhatsApp (aucune dépendance
// vers Meta/Cloud API ici, voir src/channels/) — seulement "un message est
// arrivé sur tel canal, depuis telle adresse, de tel type".
//
// Gabarits de message (mandat §8, "garder les gabarits/la configuration
// hors de la logique métier centrale") : ce fichier décide QUEL type de
// réponse envoyer (ReplyIntent, un descripteur sémantique), jamais le
// TEXTE littéral envoyé — celui-ci vit dans src/channels/message-templates.ts,
// volontairement hors de src/domain.
import type {
  Command,
  Conversation,
  ConversationOnboardingStage,
  ProductState,
  Role,
  Territory,
  TerrainInteraction
} from "./types";
import {
  interpretationConfidenceLabels,
  terrainInteractionIntentLabels,
  terrainInteractionMessageTypeLabels,
  terrainInteractionProcessingStatusLabels,
  verificationStatusLabels
} from "./types";
import { id, timestamp, withAudit } from "./rules";

// --- Choix déterministes (mandat §5, "pas d'IA de classification") ------

// ROLE_CHOICES — seuls les rôles qu'un acteur terrain peut raisonnablement
// se déclarer lui-même depuis WhatsApp (mandat §5, "réutiliser le
// vocabulaire de rôle existant... ne pas inventer dix nouveaux personas").
// institution/coordinateur/gestionnaire_organisation/partenaire/
// administrateur restent hors périmètre de cet onboarding auto-déclaré.
export const ROLE_CHOICES: Array<{ index: number; role: Role; label: string }> = [
  { index: 1, role: "capitaine", label: "Capitaine (pirogue, pêche)" },
  { index: 2, role: "mareyeur", label: "Mareyeur (achat/vente du poisson)" },
  { index: 3, role: "transformateur", label: "Transformateur (fumage, séchage…)" },
  { index: 4, role: "prestataire", label: "Prestataire (service, réparation, logistique…)" },
  { index: 5, role: "operateur", label: "Autre acteur du quai" }
];

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

export function matchRoleChoice(rawContent: string): Role | undefined {
  const text = normalize(rawContent);
  const byIndex = ROLE_CHOICES.find((choice) => String(choice.index) === text);
  if (byIndex) return byIndex.role;
  const byLabel = ROLE_CHOICES.find((choice) => normalize(choice.label) === text || normalize(choice.role) === text);
  return byLabel?.role;
}

export function roleChoicesList(): Array<{ index: number; label: string }> {
  return ROLE_CHOICES.map(({ index, label }) => ({ index, label }));
}

// matchTerritoryChoice — numéro de position dans la liste des territoires
// réels (triée par nom, ordre stable) OU nom exact du site (normalisé
// espace/casse), jamais une correspondance approximative (mandat §5/§14).
export function matchTerritoryChoice(rawContent: string, territories: Territory[]): string | undefined {
  const sorted = [...territories].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const text = normalize(rawContent);
  const byIndex = Number.isInteger(Number(text)) ? sorted[Number(text) - 1] : undefined;
  if (byIndex) return byIndex.id;
  const byName = sorted.find((t) => normalize(t.name) === text);
  return byName?.id;
}

export function territoryChoicesList(territories: Territory[]): Array<{ index: number; name: string }> {
  return [...territories]
    .sort((a, b) => a.name.localeCompare(b.name, "fr"))
    .map((t, i) => ({ index: i + 1, name: t.name }));
}

// --- Réponse à envoyer (descripteur, jamais le texte littéral) ----------
//
// determineReplyIntent — appelée par le pont de canal APRÈS dispatch, sur
// la Conversation résultante : le stade d'onboarding résultant détermine
// sans ambiguïté la prochaine question (ou l'accusé de réception une fois
// l'onboarding complet). Le texte réel est assemblé par
// src/channels/message-templates.ts (mandat §8).
export type ReplyIntent =
  | { kind: "ask_prenom" }
  | { kind: "ask_role" }
  | { kind: "ask_site" }
  | { kind: "ack" }
  | { kind: "confirm_interpretation"; intentLabel: string; subject?: string; territoryLabel?: string };

// determineReplyIntent — mandat T02 §7, "human confirmation" : lecture
// conservative de "the system MAY generate/suggest a concise reply" —
// jamais un texte généré par IA ici (ça resterait "un agent autonome
// ouvert", explicitement exclu §7/§14), seulement un gabarit déterministe
// rempli par les champs structurés déjà validés. Appelée APRÈS
// apply_terrain_interpretation : `interaction` porte alors son
// interpretation si le traitement a réussi.
export function determineReplyIntent(conversation: Conversation, interaction?: TerrainInteraction, territories: Territory[] = []): ReplyIntent {
  if (conversation.onboardingStage === "prenom_demande") return { kind: "ask_prenom" };
  if (conversation.onboardingStage === "role_demande") return { kind: "ask_role" };
  if (conversation.onboardingStage === "site_demande") return { kind: "ask_site" };
  const interpretation = interaction?.interpretation;
  if (interpretation?.needsHumanReview) {
    const territory = interpretation.territoryId ? territories.find((t) => t.id === interpretation.territoryId) : undefined;
    return {
      kind: "confirm_interpretation",
      intentLabel: terrainInteractionIntentLabels[interpretation.intent],
      subject: interpretation.subject,
      territoryLabel: territory?.name
    };
  }
  return { kind: "ack" };
}

// --- Mutations (domaine canonique, via applyCommand) --------------------

function findConversation(state: ProductState, channel: Conversation["channel"], channelAddress: string): Conversation | undefined {
  return state.conversations.find((item) => item.channel === channel && item.channelAddress === channelAddress);
}

function appendMessage(conversation: Conversation, direction: "inbound" | "outbound", body: string, occurredAt: string): Conversation {
  return {
    ...conversation,
    lastMessageAt: occurredAt,
    messages: [...conversation.messages, { id: id("convmsg"), direction, body, occurredAt }]
  };
}

function upsertConversation(state: ProductState, conversation: Conversation): ProductState {
  const exists = state.conversations.some((item) => item.id === conversation.id);
  return {
    ...state,
    conversations: exists
      ? state.conversations.map((item) => (item.id === conversation.id ? conversation : item))
      : [...state.conversations, conversation]
  };
}

// applyReceiveChannelMessage — mandat T01 §5/§6, CORRIGÉ par T02 §2/D008.
//
// Règle (T02, remplace la lecture T01) : seuls (a) le tout premier message
// substantiel d'un contact inconnu, et (b) tout message reçu une fois
// l'onboarding déjà complet AVANT ce message, produisent une
// TerrainInteraction. Un message dont le seul rôle est de répondre à une
// question d'onboarding (prénom/rôle/site) — qu'il soit reconnu ou non —
// reste uniquement dans Conversation.messages, jamais promu en interaction
// opérationnelle (mandat §2, "the terrain inbox must represent field
// information, not profile-completion chatter"). Le message qui complète
// l'onboarding (ex. la réponse "site") n'en crée pas non plus : ce n'est
// qu'à PARTIR du message SUIVANT que "once onboarding is complete,
// subsequent substantive messages again create terrain interactions"
// s'applique. Aucun historique n'est supprimé — seule la projection vers
// TerrainInteraction change.
export function applyReceiveChannelMessage(state: ProductState, command: Extract<Command, { type: "receive_channel_message" }>): ProductState {
  const { channel, channelAddress, messageType, rawContent, receivedAt, externalMessageId, rawProviderEvent, mediaRef } = command;
  const existing = findConversation(state, channel, channelAddress);
  const isNewConversation = !existing;
  const wasOnboardingComplete = !!existing?.actorId;
  let conversation: Conversation =
    existing ??
    {
      id: id("conv"),
      channel,
      channelAddress,
      onboardingStage: "non_demarre" satisfies ConversationOnboardingStage,
      startedAt: receivedAt,
      lastMessageAt: receivedAt,
      messages: []
    };
  let next = state;

  if (!isNewConversation && !wasOnboardingComplete) {
    if (conversation.onboardingStage === "prenom_demande") {
      const prenom = rawContent.trim();
      if (prenom) conversation = { ...conversation, pendingName: prenom, onboardingStage: "role_demande" };
    } else if (conversation.onboardingStage === "role_demande") {
      const role = matchRoleChoice(rawContent);
      if (role) conversation = { ...conversation, pendingRole: role, onboardingStage: "site_demande" };
    } else if (conversation.onboardingStage === "site_demande") {
      const territoryId = matchTerritoryChoice(rawContent, state.territories);
      if (territoryId) {
        if (!conversation.pendingName || !conversation.pendingRole) {
          throw new Error("Onboarding incohérent : prénom ou rôle manquant avant la création de l'Actor.");
        }
        const actor = {
          id: id("actor"),
          name: conversation.pendingName,
          role: conversation.pendingRole,
          territoryIds: [territoryId],
          phone: channelAddress,
          verified: false
        };
        next = { ...next, actors: [...next.actors, actor] };
        conversation = {
          ...conversation,
          actorId: actor.id,
          onboardingStage: "complet",
          pendingName: undefined,
          pendingRole: undefined,
          pendingTerritoryId: undefined
        };
      }
    }
    // Réponse non reconnue (rôle/site) ou prénom vide : le stade reste
    // inchangé, la même question sera reposée par determineReplyIntent —
    // jamais une progression devinée (mandat §14, "pas de classification
    // LLM"). Dans tous les cas (reconnue ou non), ce message n'est pas une
    // TerrainInteraction — voir shouldCreateInteraction ci-dessous.
  }

  if (isNewConversation) {
    conversation = { ...conversation, onboardingStage: "prenom_demande" };
  }

  // shouldCreateInteraction — exactement les deux cas autorisés par D008 :
  // premier message (isNewConversation) OU onboarding déjà complet AVANT
  // ce message (wasOnboardingComplete, capturé avant toute mutation
  // ci-dessus). Un message qui vient tout juste de compléter l'onboarding
  // dans CE tour (wasOnboardingComplete === false) n'en crée pas.
  const shouldCreateInteraction = isNewConversation || wasOnboardingComplete;

  if (shouldCreateInteraction) {
    const actor = conversation.actorId ? next.actors.find((item) => item.id === conversation!.actorId) : undefined;
    const interaction: TerrainInteraction = {
      id: id("ti"),
      externalMessageId,
      conversationId: conversation.id,
      actorId: conversation.actorId,
      channel,
      messageType,
      rawContent,
      receivedAt,
      territoryId: actor?.territoryIds[0],
      evidenceStatus: "declaree",
      // en_attente_traitement pour TOUT type de message (T02) : même le
      // texte doit encore passer par interpretTerrainMessage — le pont de
      // canal dispatchera apply_terrain_interpretation juste après (jamais
      // dans applyCommand, qui reste pur/synchrone).
      processingStatus: "en_attente_traitement",
      intent: "non_classifie",
      rawProviderEvent,
      mediaRef
    };
    next = { ...next, terrainInteractions: [...next.terrainInteractions, interaction] };
  }

  conversation = appendMessage(conversation, "inbound", rawContent, receivedAt);
  next = upsertConversation(next, conversation);
  return withAudit(
    next,
    conversation.actorId ?? "contact-non-identifie",
    "conversation",
    conversation.id,
    "receive_channel_message",
    shouldCreateInteraction ? `Message ${messageType} reçu et préservé en interaction terrain.` : "Réponse d'onboarding reçue (conversation uniquement)."
  );
}

export function applySendChannelMessage(state: ProductState, command: Extract<Command, { type: "send_channel_message" }>): ProductState {
  const { channel, channelAddress, body, sentAt } = command;
  const conversation = findConversation(state, channel, channelAddress);
  if (!conversation) {
    throw new Error("Aucune conversation existante pour ce canal/cette adresse — un message sortant suppose un échange déjà commencé.");
  }
  const updated = appendMessage(conversation, "outbound", body, sentAt);
  const next = upsertConversation(state, updated);
  return withAudit(next, conversation.actorId ?? "contact-non-identifie", "conversation", conversation.id, "send_channel_message", "Message envoyé sur le canal.");
}

function updateInteraction(state: ProductState, updated: TerrainInteraction): ProductState {
  return { ...state, terrainInteractions: state.terrainInteractions.map((item) => (item.id === updated.id ? updated : item)) };
}

// applyTerrainInterpretation — mandat T02 §3/§5/§11. Dispatchée par le
// pont de canal APRÈS le pipeline IA (jamais dans applyReceiveChannelMessage,
// qui doit rester pure/synchrone). outcome="echec" ne retire JAMAIS
// l'interaction d'origine (mandat §11) — seuls processingStatus et
// processingFailureReason changent ; outcome="succes" applique
// l'interprétation déjà validée par un schéma strict côté pont de canal
// (mandat §3, "validate AI output against strict runtime schemas before
// applying it" — cette commande suppose l'entrée déjà validée, elle ne
// revalide pas, même discipline que le reste du domaine qui fait confiance
// à son appelant serveur).
export function applyTerrainInterpretation(state: ProductState, command: Extract<Command, { type: "apply_terrain_interpretation" }>): ProductState {
  const interaction = state.terrainInteractions.find((item) => item.id === command.interactionId);
  if (!interaction) throw new Error("Interaction terrain introuvable pour appliquer une interprétation.");

  if (command.outcome === "echec") {
    const updated: TerrainInteraction = {
      ...interaction,
      processingStatus: "echec_traitement",
      processingFailureReason: command.failureReason
    };
    return withAudit(
      updateInteraction(state, updated),
      interaction.actorId ?? "contact-non-identifie",
      "terrain_interaction",
      interaction.id,
      "apply_terrain_interpretation",
      `Échec du traitement IA : ${command.failureReason ?? "raison inconnue"}.`
    );
  }

  if (!command.interpretation) throw new Error("Interprétation manquante pour un résultat de traitement en succès.");
  const interpretation = { ...command.interpretation, interpretedAt: timestamp() };
  const updated: TerrainInteraction = {
    ...interaction,
    processingStatus: "traitee",
    intent: interpretation.intent,
    // Un territoire résolu par l'interprétation (ex. "à Mbour" mentionné
    // dans le texte) est potentiellement plus précis que le territoire par
    // défaut de l'Actor posé à la création — jamais l'inverse : on ne
    // retire jamais un territoire déjà connu si l'IA n'en propose aucun
    // (mandat §5, "do not fabricate missing... location").
    territoryId: interpretation.territoryId ?? interaction.territoryId,
    transcription: command.transcription ?? interaction.transcription,
    imageAnalysis: command.imageAnalysis ?? interaction.imageAnalysis,
    interpretation
  };
  return withAudit(
    updateInteraction(state, updated),
    interaction.actorId ?? "contact-non-identifie",
    "terrain_interaction",
    interaction.id,
    "apply_terrain_interpretation",
    `Interprétation appliquée : ${interpretation.intent}.`
  );
}

// applyCorrectTerrainInterpretation — mandat §8. Geste humain auditable :
// l'intention/les champs corrigés remplacent ceux de l'IA mais
// correctedFromIntent/correctedByActorId/correctedAt/correctionNote
// conservent la trace de la correction (jamais une réécriture muette).
// "Confirmer" = appeler cette commande sans changer aucun champ structuré
// et markForReview=false ; "marquer à revoir" = markForReview=true seul.
export function applyCorrectTerrainInterpretation(
  state: ProductState,
  command: Extract<Command, { type: "correct_terrain_interpretation" }>
): ProductState {
  const interaction = state.terrainInteractions.find((item) => item.id === command.interactionId);
  if (!interaction) throw new Error("Interaction terrain introuvable pour corriger son interprétation.");
  if (!interaction.interpretation) throw new Error("Aucune interprétation existante à confirmer/corriger pour cette interaction.");

  const previous = interaction.interpretation;
  const correctedIntent = command.intent ?? previous.intent;
  const intentChanged = command.intent !== undefined && command.intent !== previous.intent;
  const updatedInterpretation = {
    ...previous,
    intent: correctedIntent,
    subject: command.subject ?? previous.subject,
    territoryId: command.territoryId ?? previous.territoryId,
    quantity: command.quantity ?? previous.quantity,
    unit: command.unit ?? previous.unit,
    timeWindow: command.timeWindow ?? previous.timeWindow,
    needsHumanReview: command.markForReview ?? false,
    correctedByActorId: command.actorId,
    correctedAt: timestamp(),
    correctedFromIntent: intentChanged ? previous.intent : previous.correctedFromIntent,
    correctionNote: command.note ?? previous.correctionNote
  };
  const updated: TerrainInteraction = {
    ...interaction,
    intent: correctedIntent,
    territoryId: updatedInterpretation.territoryId ?? interaction.territoryId,
    interpretation: updatedInterpretation
  };
  return withAudit(
    updateInteraction(state, updated),
    command.actorId,
    "terrain_interaction",
    interaction.id,
    "correct_terrain_interpretation",
    `Interprétation ${intentChanged ? "corrigée" : "confirmée"} par un opérateur (${correctedIntent}).`
  );
}

// --- Projections (lecture, pour la vue Terrain) --------------------------

export interface TerrainInteractionRow {
  id: string;
  actorName: string;
  roleLabel: string;
  territoryLabel: string;
  message: string;
  receivedAt: string;
  evidenceStatusLabel: string;
  processingStatusLabel: string;
  messageTypeLabel: string;
  // Champs d'interprétation (mandat T02 §8, "upgrade the existing Terrain
  // interaction view") — undefined tant qu'aucune interprétation valide
  // n'existe (echec_traitement ou en_attente_traitement).
  intentLabel: string;
  summary?: string;
  subject?: string;
  confidenceLabel?: string;
  needsHumanReview: boolean;
  hasInterpretation: boolean;
}

const ROLE_LABELS: Record<Role, string> = {
  administrateur: "Administration",
  operateur: "Opérateur",
  capitaine: "Capitaine",
  mareyeur: "Mareyeur",
  transformateur: "Transformateur",
  prestataire: "Prestataire",
  gestionnaire_organisation: "Gestionnaire d'organisation",
  coordinateur: "Coordination territoriale",
  institution: "Institution",
  partenaire: "Partenaire"
};

// buildTerrainInteractionRows — projection pure pour la vue Terrain
// (mandat §7) : acteur, rôle, territoire, message, date, canal, statut
// d'évidence, statut de traitement. Triée du plus récent au plus ancien.
export function buildTerrainInteractionRows(state: ProductState): TerrainInteractionRow[] {
  return [...state.terrainInteractions]
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt))
    .map((interaction) => {
      const actor = interaction.actorId ? state.actors.find((item) => item.id === interaction.actorId) : undefined;
      const territory = interaction.territoryId ? state.territories.find((item) => item.id === interaction.territoryId) : undefined;
      const interpretation = interaction.interpretation;
      return {
        id: interaction.id,
        actorName: actor?.name ?? "Contact en cours d’onboarding",
        roleLabel: actor ? ROLE_LABELS[actor.role] : "—",
        territoryLabel: territory?.name ?? "Non renseigné",
        message: interaction.rawContent,
        receivedAt: interaction.receivedAt,
        evidenceStatusLabel: verificationStatusLabels[interaction.evidenceStatus],
        processingStatusLabel: terrainInteractionProcessingStatusLabels[interaction.processingStatus],
        messageTypeLabel: terrainInteractionMessageTypeLabels[interaction.messageType],
        intentLabel: terrainInteractionIntentLabels[interaction.intent],
        summary: interpretation?.summary,
        subject: interpretation?.subject,
        confidenceLabel: interpretation ? interpretationConfidenceLabels[interpretation.confidence] : undefined,
        needsHumanReview: interpretation?.needsHumanReview ?? false,
        hasInterpretation: !!interpretation
      };
    });
}
