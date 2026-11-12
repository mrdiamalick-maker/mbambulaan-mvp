// Channel Interaction — Sprint Terrain T01 ("Mbàmbulaan WhatsApp-first").
//
// Un acteur terrain écrit depuis son téléphone, sur un canal (WhatsApp
// aujourd'hui, SMS/téléphone plus tard — InteractionChannel, types.ts).
// Ce fichier porte TOUTE la décision métier qui en découle : le domaine
// ne sait rien de WhatsApp (aucune dépendance vers Meta/Cloud API ici),
// il ne connaît que "un message est arrivé sur tel canal, depuis telle
// adresse". C'est le pont de canal (src/channels/) qui traduit le
// webhook WhatsApp vers la commande receive_channel_message, et qui lit
// l'état résultant pour savoir quoi répondre (getNextChannelPrompt) —
// jamais l'inverse.
//
// Machine à états de l'onboarding (mandat §4, "pas d'IA de
// classification") : chaque réponse est validée par correspondance
// déterministe (numéro de choix dans un menu, ou correspondance exacte
// normalisée) — jamais une interprétation de texte libre. Trois
// questions fixes (prénom, rôle, site), dans cet ordre, jamais revisitées
// une fois répondues.
import type {
  Command,
  Conversation,
  ConversationStatus,
  ProductState,
  Role,
  Territory,
  TerrainInteraction
} from "./types";
import { id, withAudit } from "./rules";

// --- Choix déterministes (mandat §4 : aucune IA de classification) ------

// ROLE_CHOICES — seuls les rôles qu'un acteur terrain peut raisonnablement
// se déclarer lui-même depuis WhatsApp (mandat : onboarding d'un acteur
// terrain, pas d'une institution). institution/coordinateur/
// gestionnaire_organisation/partenaire/administrateur restent hors
// périmètre de cet onboarding auto-déclaré — attribués autrement
// (aujourd'hui : données de démonstration/back-office), jamais par ce
// canal.
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

export function roleChoicesPrompt(): string {
  return ROLE_CHOICES.map((choice) => `${choice.index}. ${choice.label}`).join("\n");
}

// matchTerritoryChoice — numéro de position dans la liste des
// territoires réels (triée par nom, ordre stable) OU nom exact du site
// (normalisé espace/casse, jamais une correspondance approximative).
export function matchTerritoryChoice(rawContent: string, territories: Territory[]): string | undefined {
  const sorted = [...territories].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  const text = normalize(rawContent);
  const byIndex = Number.isInteger(Number(text)) ? sorted[Number(text) - 1] : undefined;
  if (byIndex) return byIndex.id;
  const byName = sorted.find((t) => normalize(t.name) === text);
  return byName?.id;
}

export function territoryChoicesPrompt(territories: Territory[]): string {
  const sorted = [...territories].sort((a, b) => a.name.localeCompare(b.name, "fr"));
  return sorted.map((t, i) => `${i + 1}. ${t.name}`).join("\n");
}

// --- Prompts (lecture seule, jamais de mutation ici) --------------------

// getNextChannelPrompt — ce qu'il faut envoyer à l'acteur APRÈS avoir
// dispatché receive_channel_message, en fonction du statut résultant.
// Le pont de canal (src/channels/*) l'appelle avec la Conversation
// relue dans l'état renvoyé par applyCommand ; "undefined" signifie
// "aucune question d'onboarding" (conversation déjà active).
export function getNextChannelPrompt(conversation: Conversation, territories: Territory[]): string | undefined {
  if (conversation.status === "onboarding_prenom") {
    return "Bienvenue sur Mbàmbulaan. Quel est votre prénom ?";
  }
  if (conversation.status === "onboarding_role") {
    return `Merci ${conversation.pendingPrenom ?? ""}. Quel est votre rôle ?\n${roleChoicesPrompt()}\nRépondez avec le numéro.`;
  }
  if (conversation.status === "onboarding_site") {
    return `Sur quel quai ou localité travaillez-vous principalement ?\n${territoryChoicesPrompt(territories)}\nRépondez avec le numéro ou le nom exact.`;
  }
  return undefined;
}

export const WELCOME_MESSAGE = "Merci, votre profil est enregistré. Vous pouvez maintenant échanger avec Mbàmbulaan ici.";
export const ACKNOWLEDGEMENT_MESSAGE = "Message bien reçu. Merci.";

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

export function applyReceiveChannelMessage(state: ProductState, command: Extract<Command, { type: "receive_channel_message" }>): ProductState {
  const { channel, channelAddress, rawContent, occurredAt, externalMessageId } = command;
  let conversation = findConversation(state, channel, channelAddress);
  let next = state;
  let detail: string;

  if (!conversation) {
    conversation = {
      id: id("conv"),
      channel,
      channelAddress,
      status: "onboarding_prenom" satisfies ConversationStatus,
      startedAt: occurredAt,
      lastMessageAt: occurredAt,
      messages: []
    };
    detail = "Nouvelle conversation — demande du prénom.";
  } else if (conversation.status === "onboarding_prenom") {
    const prenom = rawContent.trim();
    if (!prenom) throw new Error("Le prénom ne peut pas être vide.");
    conversation = { ...conversation, pendingPrenom: prenom, status: "onboarding_role" };
    detail = `Prénom reçu (${prenom}) — demande du rôle.`;
  } else if (conversation.status === "onboarding_role") {
    const role = matchRoleChoice(rawContent);
    if (!role) {
      // Réponse non reconnue : la conversation reste à la même étape, le
      // pont de canal renverra la même question (jamais une progression
      // devinée). On consigne tout de même le message brut.
      conversation = appendMessage(conversation, "inbound", rawContent, occurredAt);
      return upsertConversation(state, conversation);
    }
    conversation = { ...conversation, pendingRole: role, status: "onboarding_site" };
    detail = `Rôle reçu (${role}) — demande du site.`;
  } else if (conversation.status === "onboarding_site") {
    const territoryId = matchTerritoryChoice(rawContent, state.territories);
    if (!territoryId) {
      conversation = appendMessage(conversation, "inbound", rawContent, occurredAt);
      return upsertConversation(state, conversation);
    }
    if (!conversation.pendingPrenom || !conversation.pendingRole) {
      throw new Error("Onboarding incohérent : prénom ou rôle manquant avant la création de l'Actor.");
    }
    const actor = {
      id: id("actor"),
      name: conversation.pendingPrenom,
      role: conversation.pendingRole,
      territoryIds: [territoryId],
      phone: channelAddress,
      verified: false
    };
    next = { ...state, actors: [...state.actors, actor] };
    conversation = {
      ...conversation,
      actorId: actor.id,
      status: "actif",
      pendingPrenom: undefined,
      pendingRole: undefined
    };
    detail = `Onboarding terminé — Actor ${actor.id} créé (${actor.name}, ${actor.role}).`;
  } else {
    // status === "actif" — interaction terrain réelle (mandat §6).
    if (!conversation.actorId) throw new Error("Conversation active sans Actor réel — état incohérent.");
    const actor = state.actors.find((item) => item.id === conversation!.actorId);
    const interaction: TerrainInteraction = {
      id: id("ti"),
      conversationId: conversation.id,
      actorId: conversation.actorId,
      channel,
      rawContent,
      occurredAt,
      territoryId: actor?.territoryIds[0],
      status: "declaree",
      type: "non_classifie",
      externalMessageId
    };
    next = { ...state, terrainInteractions: [...state.terrainInteractions, interaction] };
    detail = `Interaction terrain enregistrée pour ${actor?.name ?? conversation.actorId}.`;
  }

  conversation = appendMessage(conversation, "inbound", rawContent, occurredAt);
  next = upsertConversation(next, conversation);
  return withAudit(next, conversation.actorId ?? "acteur-non-identifie", "conversation", conversation.id, "receive_channel_message", detail);
}

export function applySendChannelMessage(state: ProductState, command: Extract<Command, { type: "send_channel_message" }>): ProductState {
  const { channel, channelAddress, body, occurredAt } = command;
  const conversation = findConversation(state, channel, channelAddress);
  if (!conversation) throw new Error("Aucune conversation existante pour ce canal/cette adresse — un message sortant suppose un échange déjà commencé.");
  const updated = appendMessage(conversation, "outbound", body, occurredAt);
  const next = upsertConversation(state, updated);
  return withAudit(next, conversation.actorId ?? "acteur-non-identifie", "conversation", conversation.id, "send_channel_message", "Message envoyé sur le canal.");
}

// --- Projections (lecture, pour la vue Terrain) --------------------------

export interface TerrainInteractionRow {
  id: string;
  actorName: string;
  roleLabel: string;
  territoryLabel: string;
  message: string;
  occurredAt: string;
  statusLabel: string;
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

const STATUS_LABELS = { declaree: "Déclarée", documentee: "Documentée", verifiee: "Vérifiée" } as const;

// buildTerrainInteractionRows — projection pure pour la vue Terrain
// (mandat §7) : acteur, rôle, territoire, message, date, statut. Triée du
// plus récent au plus ancien (ce qui vient d'arriver en premier).
export function buildTerrainInteractionRows(state: ProductState): TerrainInteractionRow[] {
  return [...state.terrainInteractions]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .map((interaction) => {
      const actor = state.actors.find((item) => item.id === interaction.actorId);
      const territory = interaction.territoryId ? state.territories.find((item) => item.id === interaction.territoryId) : undefined;
      return {
        id: interaction.id,
        actorName: actor?.name ?? "Acteur inconnu",
        roleLabel: actor ? ROLE_LABELS[actor.role] : "—",
        territoryLabel: territory?.name ?? "Non renseigné",
        message: interaction.rawContent,
        occurredAt: interaction.occurredAt,
        statusLabel: STATUS_LABELS[interaction.status]
      };
    });
}
