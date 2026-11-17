import { createHmac, timingSafeEqual } from "node:crypto";
import type { TerrainInteractionMessageType } from "@/domain/types";
import type { ChannelAdapter, InboundChannelMessage } from "./types";

// Seul fichier du dépôt qui connaît la forme des payloads WhatsApp
// Business Platform / Cloud API (mandat §4, "do not let WhatsApp-specific
// payloads leak into core domain objects"). src/domain/channel-interaction.ts
// n'importe jamais rien d'ici.
export const GRAPH_API_VERSION = "v21.0";

// verifyWhatsappSignature — mandat §11, "validate webhook authenticity/
// signature according to provider requirements". Meta signe le corps brut
// (avant tout parsing JSON) avec HMAC-SHA256 et WHATSAPP_APP_SECRET,
// transmis dans l'en-tête X-Hub-Signature-256 ("sha256=<hex>").
// timingSafeEqual plutôt que ===, comparaison à longueur constante.
export function verifyWhatsappSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader) return false;
  const expected = "sha256=" + createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signatureHeader, "utf8");
  if (expectedBuffer.length !== actualBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

// verifyWhatsappWebhookChallenge — poignée de main GET imposée par Meta à
// la configuration du webhook (hub.mode/hub.verify_token/hub.challenge).
export function verifyWhatsappWebhookChallenge(mode: string | null, token: string | null): boolean {
  return mode === "subscribe" && !!token && token === process.env.WHATSAPP_VERIFY_TOKEN;
}

interface WhatsappMessage {
  id?: string;
  from?: string;
  timestamp?: string;
  type?: string;
  text?: { body?: string };
}

export interface WhatsappWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WhatsappMessage[];
      };
    }>;
  }>;
}

// Types de message WhatsApp n'ayant pas de contenu texte directement
// exploitable en T01 (mandat D003/§10, "do not implement transcription or
// vision yet") — jamais une transcription/description fabriquée, un
// repère factuel du type reçu seulement.
const MESSAGE_TYPE_MAP: Record<string, TerrainInteractionMessageType> = {
  text: "texte",
  audio: "audio",
  image: "image",
  document: "document"
};

function describeNonText(waType: string): string {
  return `[Message WhatsApp de type « ${waType} » reçu — contenu non traité en T01, voir T02]`;
}

// parseWhatsappInboundMessages — mandat §10 : ne doit jamais planter sur
// audio/image/média non supporté. Un message sans id/from/timestamp
// exploitable est ignoré (jamais fabriqué), le reste de la liste continue
// d'être traité (mandat, un message imparfait ne doit pas faire échouer
// tout le lot).
export function parseWhatsappInboundMessages(payload: WhatsappWebhookPayload): InboundChannelMessage[] {
  const messages: InboundChannelMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        if (!message.id || !message.from || !message.timestamp || !message.type) continue;
        const waType = message.type;
        const messageType = MESSAGE_TYPE_MAP[waType] ?? "autre";
        const rawContent = messageType === "texte" ? (message.text?.body ?? "") : describeNonText(waType);
        if (messageType === "texte" && !rawContent) continue;
        messages.push({
          channel: "whatsapp",
          channelAddress: message.from,
          messageType,
          rawContent,
          externalMessageId: message.id,
          occurredAt: new Date(Number(message.timestamp) * 1000).toISOString(),
          rawProviderEvent: message
        });
      }
    }
  }
  return messages;
}

// whatsappAdapter — mandat §4 : envoi sortant texte via Graph API. Échoue
// explicitement (jamais silencieusement) sans configuration — le pont
// webhook capture cette erreur et continue (mandat "ne jamais planter sur
// l'absence de crédentiels réels").
export const whatsappAdapter: ChannelAdapter = {
  channel: "whatsapp",
  async sendText(to: string, body: string): Promise<void> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    if (!token || !phoneNumberId) {
      throw new Error("WhatsApp Cloud API non configurée (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID manquants).");
    }
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body } })
    });
    if (!response.ok) {
      throw new Error(`Envoi WhatsApp refusé par Graph API (HTTP ${response.status}).`);
    }
  }
};
