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
  TerrainInteraction,
  TerrainInteractionMessageType
} from "./types";
import { terrainInteractionMessageTypeLabels, terrainInteractionProcessingStatusLabels, verificationStatusLabels } from "./types";
import { id, withAudit } from "./rules";

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
export type ReplyIntent = { kind: "ask_prenom" } | { kind: "ask_role" } | { kind: "ask_site" } | { kind: "ack" };

export function determineReplyIntent(conversation: Conversation): ReplyIntent {
  if (conversation.onboardingStage === "prenom_demande") return { kind: "ask_prenom" };
  if (conversation.onboardingStage === "role_demande") return { kind: "ask_role" };
  if (conversation.onboardingStage === "site_demande") return { kind: "ask_site" };
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

function processingStatusFor(messageType: TerrainInteractionMessageType) {
  return messageType === "texte" ? ("recue" as const) : ("media_en_attente" as const);
}

// applyReceiveChannelMessage — mandat §5/§6.
//
// Règle unique, sans exception : "every accepted inbound text must result
// in a traceable terrain interaction" (mandat §6, phrase non conditionnée
// par l'état d'onboarding) — CHAQUE message accepté produit une
// TerrainInteraction, y compris les messages qui servent par ailleurs de
// réponse à une question d'onboarding. C'est volontairement différent
// d'un simple "gate" séquentiel : le tout premier message d'un contact
// inconnu (mandat, scénario d'acceptation §13 : "J'ai besoin de glace...")
// n'est PAS une réponse à une question — rien n'a encore été demandé — il
// est donc toujours préservé tel quel, jamais interprété comme un prénom.
// Ce n'est qu'APRÈS avoir posé la première question que le message
// SUIVANT est interprété comme sa réponse.
export function applyReceiveChannelMessage(state: ProductState, command: Extract<Command, { type: "receive_channel_message" }>): ProductState {
  const { channel, channelAddress, messageType, rawContent, receivedAt, externalMessageId, rawProviderEvent } = command;
  let conversation = findConversation(state, channel, channelAddress);
  let next = state;
  const isNewConversation = !conversation;

  if (!conversation) {
    conversation = {
      id: id("conv"),
      channel,
      channelAddress,
      onboardingStage: "non_demarre" satisfies ConversationOnboardingStage,
      startedAt: receivedAt,
      lastMessageAt: receivedAt,
      messages: []
    };
  }

  if (!isNewConversation && !conversation.actorId) {
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
    // LLM").
  }

  // Premier message d'un contact inconnu : on démarre l'onboarding
  // maintenant, APRÈS avoir préservé ce message comme interaction
  // (ci-dessous) — la question est posée en réponse à ce même message,
  // jamais avant (mandat §5 + scénario d'acceptation §13, étape 7).
  if (isNewConversation) {
    conversation = { ...conversation, onboardingStage: "prenom_demande" };
  }

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
    processingStatus: processingStatusFor(messageType),
    intent: "non_classifie",
    rawProviderEvent
  };
  next = { ...next, terrainInteractions: [...next.terrainInteractions, interaction] };

  conversation = appendMessage(conversation, "inbound", rawContent, receivedAt);
  next = upsertConversation(next, conversation);
  return withAudit(
    next,
    conversation.actorId ?? "contact-non-identifie",
    "conversation",
    conversation.id,
    "receive_channel_message",
    `Message ${messageType} reçu et préservé en interaction terrain.`
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
      return {
        id: interaction.id,
        actorName: actor?.name ?? "Contact en cours d’onboarding",
        roleLabel: actor ? ROLE_LABELS[actor.role] : "—",
        territoryLabel: territory?.name ?? "Non renseigné",
        message: interaction.rawContent,
        receivedAt: interaction.receivedAt,
        evidenceStatusLabel: verificationStatusLabels[interaction.evidenceStatus],
        processingStatusLabel: terrainInteractionProcessingStatusLabels[interaction.processingStatus],
        messageTypeLabel: terrainInteractionMessageTypeLabels[interaction.messageType]
      };
    });
}
