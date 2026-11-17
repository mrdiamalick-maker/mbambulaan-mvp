import type { InteractionChannel, MediaReference, TerrainInteractionMessageType } from "@/domain/types";

// InboundChannelMessage — ce que tout ChannelAdapter doit produire à
// partir d'un événement fournisseur, avant toute traduction en commande
// (mandat §3, "Channel Adapter → Conversation Intake → Domain Mapping").
// Aucun champ ici n'est spécifique à un fournisseur (pas de "wamid", pas
// de forme de payload Meta) — seul src/channels/whatsapp.ts connaît ça.
export interface InboundChannelMessage {
  channel: InteractionChannel;
  channelAddress: string;
  messageType: TerrainInteractionMessageType;
  rawContent: string;
  externalMessageId: string;
  occurredAt: string;
  // Événement fournisseur isolé (mandat §4, "raw provider event retained
  // for debugging/audit") — jamais l'enveloppe entière avec d'autres
  // contacts/messages, jamais interprété par le domaine.
  rawProviderEvent?: unknown;
  // mediaRef (mandat T02 §10) — référence durable, jamais le binaire à ce
  // stade (le pont de canal télécharge les octets séparément, au moment du
  // traitement IA, jamais conservés dans l'état produit).
  mediaRef?: MediaReference;
  // hasCaption — distingue "rawContent est une vraie légende fournie par
  // l'utilisateur" (mandat §4.3, à combiner avec l'analyse d'image) de
  // "rawContent est le repère factuel fabriqué en l'absence de légende" —
  // jamais ce second cas transmis à l'IA comme s'il s'agissait d'un
  // contenu réel.
  hasCaption?: boolean;
}

export interface ChannelAdapter {
  channel: InteractionChannel;
  sendText(to: string, body: string): Promise<void>;
}
