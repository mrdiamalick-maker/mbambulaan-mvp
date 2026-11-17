import { NextRequest, NextResponse } from "next/server";
import { dispatch, getState } from "@/server/repository";
import { determineReplyIntent } from "@/domain/channel-interaction";
import { renderReplyText } from "@/channels/message-templates";
import { getChannelAdapter } from "@/channels/registry";
import { parseWhatsappInboundMessages, verifyWhatsappSignature, verifyWhatsappWebhookChallenge } from "@/channels/whatsapp";

// Webhook WhatsApp — Sprint T01 (mandat §4). Seul point d'entrée qui
// dispatche receive_channel_message/send_channel_message : ces deux
// commandes n'ont pas d'actorId (types.ts), donc /api/actions (session
// humaine) ne peut jamais les déclencher — uniquement ce pont serveur.

// GET — poignée de main imposée par Meta à la configuration du webhook.
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (verifyWhatsappWebhookChallenge(mode, token) && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Vérification du webhook refusée." }, { status: 403 });
}

// POST — événements entrants. Mandat §4 : traitement idempotent, pas de
// payload fournisseur loggé en clair (§11).
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
    return NextResponse.json({ error: "Payload JSON invalide." }, { status: 400 });
  }

  const messages = parseWhatsappInboundMessages(payload as Parameters<typeof parseWhatsappInboundMessages>[0]);

  for (const message of messages) {
    try {
      await dispatch(
        {
          type: "receive_channel_message",
          channel: message.channel,
          channelAddress: message.channelAddress,
          messageType: message.messageType,
          rawContent: message.rawContent,
          receivedAt: message.occurredAt,
          externalMessageId: message.externalMessageId,
          rawProviderEvent: message.rawProviderEvent
        },
        `whatsapp:${message.externalMessageId}`
      );

      const after = await getState();
      const conversation = after.conversations.find(
        (item) => item.channel === message.channel && item.channelAddress === message.channelAddress
      );
      if (!conversation) continue;

      const intent = determineReplyIntent(conversation);
      const replyText = renderReplyText(intent, after.territories);
      const adapter = getChannelAdapter(message.channel);

      await adapter.sendText(message.channelAddress, replyText);
      await dispatch(
        {
          type: "send_channel_message",
          channel: message.channel,
          channelAddress: message.channelAddress,
          body: replyText,
          sentAt: new Date().toISOString()
        },
        `whatsapp:${message.externalMessageId}:reply`
      );
    } catch (error) {
      // Jamais de payload personnel en clair dans les logs (mandat §11) —
      // seul le message d'erreur (configuration/réseau) est journalisé.
      // Un message qui échoue n'empêche jamais le traitement du reste du
      // lot (mandat, idempotence/robustesse du webhook).
      console.error(`[webhook whatsapp] message non traité : ${(error as Error).message}`);
    }
  }

  return NextResponse.json({ ok: true });
}
