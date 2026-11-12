// WhatsApp Cloud API — Sprint Terrain T01.
//
// Seul fichier du dépôt qui connaît la forme réelle des payloads Meta.
// Tout ce qu'il expose vers le reste de l'application est déjà traduit
// en InboundChannelMessage (channels/types.ts) — jamais un objet Meta
// brut transmis plus loin. Conçu pour que sms.ts/telephone.ts (sprint
// suivant) suivent exactement le même contrat (parseInbound.. →
// InboundChannelMessage[], ChannelAdapter.sendText) sans toucher au
// domaine ni à la route webhook.
import { createHmac, timingSafeEqual } from "node:crypto";
import type { ChannelAdapter, InboundChannelMessage } from "./types";

const GRAPH_API_VERSION = "v21.0";

function env(name: string): string | undefined {
  return process.env[name];
}

// verifyWhatsappSignature — Meta signe chaque livraison de webhook avec
// HMAC-SHA256 du corps brut (App Secret), en-tête X-Hub-Signature-256
// ("sha256=<hex>"). Sans WHATSAPP_APP_SECRET configuré, refuse plutôt que
// d'accepter en silence (jamais de contournement de sécurité implicite).
export function verifyWhatsappSignature(rawBody: string, signatureHeader: string | null): boolean {
  const appSecret = env("WHATSAPP_APP_SECRET");
  if (!appSecret) return false;
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const provided = signatureHeader.slice("sha256=".length);
  const expectedBuffer = Buffer.from(expected, "hex");
  const providedBuffer = Buffer.from(provided, "hex");
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function verifyWhatsappWebhookChallenge(mode: string | null, token: string | null): boolean {
  return mode === "subscribe" && token === env("WHATSAPP_VERIFY_TOKEN");
}

// --- Forme (partielle, champs réellement lus) du payload Meta -----------
// https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples
interface WhatsappWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          id: string;
          from: string;
          timestamp: string;
          type: string;
          text?: { body: string };
        }>;
      };
    }>;
  }>;
}

// parseWhatsappInboundMessages — ne retient QUE les messages texte (mandat
// §2, "réception et envoi de messages texte" ; audio/image explicitement
// hors périmètre de ce sprint, cf. §"à ne pas développer"). Un message
// d'un autre type (image, audio, statut de livraison…) est ignoré ici,
// jamais fabriqué en texte vide.
export function parseWhatsappInboundMessages(payload: WhatsappWebhookPayload): InboundChannelMessage[] {
  const messages: InboundChannelMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      for (const message of change.value?.messages ?? []) {
        if (message.type !== "text" || !message.text?.body) continue;
        messages.push({
          channel: "whatsapp",
          channelAddress: message.from,
          rawContent: message.text.body,
          externalMessageId: message.id,
          occurredAt: new Date(Number(message.timestamp) * 1000).toISOString()
        });
      }
    }
  }
  return messages;
}

// whatsappAdapter — implémentation réelle de ChannelAdapter via WhatsApp
// Cloud API (Graph API). Nécessite WHATSAPP_ACCESS_TOKEN et
// WHATSAPP_PHONE_NUMBER_ID (environment.secrets) ; sans ces variables,
// lève une erreur explicite plutôt que d'échouer silencieusement — aucun
// message sortant n'est jamais simulé comme envoyé.
export const whatsappAdapter: ChannelAdapter = {
  channel: "whatsapp",
  async sendText(to: string, body: string): Promise<void> {
    const token = env("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = env("WHATSAPP_PHONE_NUMBER_ID");
    if (!token || !phoneNumberId) {
      throw new Error("WhatsApp Cloud API non configurée (WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID manquants).");
    }
    const response = await fetch(`https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body }
      })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`Envoi WhatsApp refusé (${response.status}) : ${detail}`);
    }
  }
};
