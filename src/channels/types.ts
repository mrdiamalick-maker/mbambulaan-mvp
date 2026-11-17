import type { InteractionChannel, TerrainInteractionMessageType } from "@/domain/types";

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
}

export interface ChannelAdapter {
  channel: InteractionChannel;
  sendText(to: string, body: string): Promise<void>;
}
