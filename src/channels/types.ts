// Abstraction de canal — Sprint Terrain T01.
//
// Tout ce qui est spécifique à un canal (WhatsApp Cloud API aujourd'hui,
// SMS/téléphone plus tard) vit derrière cette interface. Le domaine
// (src/domain/channel-interaction.ts) et la route webhook ne connaissent
// que ces types — jamais une forme de payload Meta/Twilio directement.
import type { InteractionChannel } from "@/domain/types";

export interface InboundChannelMessage {
  channel: InteractionChannel;
  // channelAddress — numéro normalisé E.164 sans "+" (convention Meta),
  // identique à Conversation.channelAddress/Actor.phone une fois
  // l'onboarding terminé.
  channelAddress: string;
  rawContent: string;
  externalMessageId: string;
  occurredAt: string;
}

export interface ChannelAdapter {
  channel: InteractionChannel;
  sendText(to: string, body: string): Promise<void>;
}
