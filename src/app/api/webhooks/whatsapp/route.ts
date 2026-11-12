import { NextRequest, NextResponse } from "next/server";
import { getNextChannelPrompt, WELCOME_MESSAGE, ACKNOWLEDGEMENT_MESSAGE } from "@/domain/channel-interaction";
import { dispatch, getState } from "@/server/repository";
import { getChannelAdapter } from "@/channels/registry";
import { parseWhatsappInboundMessages, verifyWhatsappSignature, verifyWhatsappWebhookChallenge } from "@/channels/whatsapp";

// Webhook WhatsApp Cloud API — Sprint Terrain T01.
//
// Seule route du dépôt qui connaît WhatsApp spécifiquement ; tout le
// reste (domaine, vue Terrain) ne voit qu'InteractionChannel et des
// commandes canoniques. Aucune session humaine ici (Meta appelle ce
// endpoint serveur à serveur) : l'autorisation vient de la vérification
// de signature (verifyWhatsappSignature), pas de requireSession/
// assertCan — receive_channel_message/send_channel_message sont
// délibérément absentes de server/permissions.ts::all pour qu'aucune
// session humaine ne puisse jamais les déclencher via /api/actions.

// GET — handshake de vérification Meta (hub.challenge).
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (verifyWhatsappWebhookChallenge(mode, token) && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Vérification du webhook refusée." }, { status: 403 });
}

// POST — livraison des messages entrants. Répond 200 rapidement et
// systématiquement (sauf signature invalide) : Meta réessaie sur tout
// autre code, une erreur de traitement sur UN message ne doit jamais
// faire échouer tout le lot ni provoquer une tempête de réessais.
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (!verifyWhatsappSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const inboundMessages = parseWhatsappInboundMessages(payload as Parameters<typeof parseWhatsappInboundMessages>[0]);
  const adapter = getChannelAdapter("whatsapp");

  for (const message of inboundMessages) {
    try {
      const before = await getState();
      const beforeConversation = before.conversations.find(
        (item) => item.channel === message.channel && item.channelAddress === message.channelAddress
      );

      const idempotencyKey = `whatsapp:${message.externalMessageId}`;
      const after = await dispatch(
        {
          type: "receive_channel_message",
          channel: message.channel,
          channelAddress: message.channelAddress,
          rawContent: message.rawContent,
          occurredAt: message.occurredAt,
          externalMessageId: message.externalMessageId
        },
        idempotencyKey
      );

      const afterConversation = after.conversations.find(
        (item) => item.channel === message.channel && item.channelAddress === message.channelAddress
      );
      if (!afterConversation) continue;

      const justOnboarded = beforeConversation?.status !== "actif" && afterConversation.status === "actif";
      const replyText = justOnboarded
        ? WELCOME_MESSAGE
        : getNextChannelPrompt(afterConversation, after.territories) ?? ACKNOWLEDGEMENT_MESSAGE;

      await adapter.sendText(message.channelAddress, replyText);
      await dispatch(
        {
          type: "send_channel_message",
          channel: message.channel,
          channelAddress: message.channelAddress,
          body: replyText,
          occurredAt: new Date().toISOString()
        },
        `${idempotencyKey}:reply`
      );
    } catch (error) {
      // Un message mal formé ou un envoi refusé ne doit jamais bloquer
      // les autres messages du même lot — consigné, jamais relancé en
      // boucle par Meta (la réponse 200 globale reste inchangée).
      console.error("[webhook whatsapp] message non traité:", error instanceof Error ? error.message : error);
    }
  }

  return NextResponse.json({ ok: true });
}
