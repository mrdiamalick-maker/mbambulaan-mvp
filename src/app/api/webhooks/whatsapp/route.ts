import { NextRequest, NextResponse } from "next/server";
import type { Command, ProductState, Territory } from "@/domain/types";
import { dispatch } from "@/server/repository";
import { determineReplyIntent } from "@/domain/channel-interaction";
import { renderReplyText } from "@/channels/message-templates";
import { getChannelAdapter } from "@/channels/registry";
import {
  downloadWhatsappMedia,
  parseWhatsappInboundMessages,
  verifyWhatsappSignature,
  verifyWhatsappWebhookChallenge
} from "@/channels/whatsapp";
import type { InboundChannelMessage } from "@/channels/types";
import { intelligenceAdapter } from "@/intelligence/adapter";
import { isValidInterpretation } from "@/intelligence/schemas";

// Webhook WhatsApp — Sprint T01 (transport) + T02 (intelligence). Seul
// point d'entrée qui dispatche receive_channel_message/send_channel_message/
// apply_terrain_interpretation : ces trois commandes n'ont pas d'actorId
// (types.ts), donc /api/actions (session humaine) ne peut jamais les
// déclencher — uniquement ce pont serveur.

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

type InterpretationOutcome = Omit<Extract<Command, { type: "apply_terrain_interpretation" }>, "type" | "interactionId">;

function territoryContext(territories: Territory[]) {
  return territories.map((t) => ({ id: t.id, name: t.name }));
}

// runIntelligencePipeline — "Media/Text Normalisation → Intelligence
// Adapter → Structured Interpretation" (mandat §3). Lance l'étape
// adaptée au type de message, valide la sortie contre un schéma strict
// (mandat §3/§12) avant de la considérer comme un succès. Ne dispatche
// rien elle-même — le careur (POST ci-dessous) dispatche une seule fois,
// succès ou échec, pour ne jamais dupliquer la logique d'idempotence.
async function runIntelligencePipeline(message: InboundChannelMessage, territories: Territory[]): Promise<InterpretationOutcome> {
  if (message.messageType === "texte") {
    const interpretation = await intelligenceAdapter.interpretTerrainMessage({ text: message.rawContent, knownTerritories: territoryContext(territories) });
    if (!isValidInterpretation(interpretation)) throw new Error("Sortie IA invalide (schéma d'interprétation non respecté).");
    return { outcome: "succes", interpretation };
  }

  if (message.messageType === "audio") {
    if (!message.mediaRef) throw new Error("Message audio sans référence média exploitable.");
    const transcription = await intelligenceAdapter.transcribeAudio({ mediaId: message.mediaRef.mediaId, mimeType: message.mediaRef.mimeType });
    const interpretation = await intelligenceAdapter.interpretTerrainMessage({ text: transcription.text, knownTerritories: territoryContext(territories) });
    if (!isValidInterpretation(interpretation)) throw new Error("Sortie IA invalide (schéma d'interprétation non respecté).");
    return { outcome: "succes", transcription, interpretation };
  }

  if (message.messageType === "image") {
    if (!message.mediaRef) throw new Error("Message image sans référence média exploitable.");
    const caption = message.hasCaption ? message.rawContent : undefined;
    let downloaded: { data: Buffer; mimeType: string } | undefined;
    try {
      downloaded = await downloadWhatsappMedia(message.mediaRef.mediaId);
    } catch {
      downloaded = undefined;
    }
    const analysis = await intelligenceAdapter.analyseImage(
      { mediaId: message.mediaRef.mediaId, mimeType: downloaded?.mimeType ?? message.mediaRef.mimeType, data: downloaded?.data },
      caption
    );
    const combinedText = [caption, analysis.description].filter(Boolean).join(" — ");
    const interpretation = await intelligenceAdapter.interpretTerrainMessage({ text: combinedText, knownTerritories: territoryContext(territories) });
    if (!isValidInterpretation(interpretation)) throw new Error("Sortie IA invalide (schéma d'interprétation non respecté).");
    // mandat §9 : une image ne fait jamais progresser evidenceStatus, et
    // needsHumanReview reste vrai dès que l'analyse d'image elle-même est
    // incertaine — même si l'interprétation textuelle combinée est confiante.
    return { outcome: "succes", imageAnalysis: analysis, interpretation: { ...interpretation, needsHumanReview: interpretation.needsHumanReview || analysis.confidence === "faible" } };
  }

  // "document"/"autre" (mandat §10) : pas de pipeline dédié en T02 (hors
  // périmètre explicite — seuls texte/audio/image sont couverts, §4) —
  // jamais un succès fabriqué pour un type non traité.
  throw new Error(`Type de message "${message.messageType}" non pris en charge par le pipeline d'interprétation T02.`);
}

async function findInteraction(state: ProductState, externalMessageId: string) {
  return state.terrainInteractions.find((item) => item.externalMessageId === externalMessageId);
}

// POST — événements entrants. Mandat §4 T01 : traitement idempotent, pas
// de payload fournisseur loggé en clair (§11 T01). Mandat T02 §11 : aucun
// échec de traitement IA ne doit perdre l'interaction d'origine.
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
      let state = await dispatch(
        {
          type: "receive_channel_message",
          channel: message.channel,
          channelAddress: message.channelAddress,
          messageType: message.messageType,
          rawContent: message.rawContent,
          receivedAt: message.occurredAt,
          externalMessageId: message.externalMessageId,
          rawProviderEvent: message.rawProviderEvent,
          mediaRef: message.mediaRef
        },
        `whatsapp:${message.externalMessageId}`
      );

      let interaction = await findInteraction(state, message.externalMessageId);

      // interaction absente = ce message a été consommé par l'onboarding
      // (D008/T02 §2) : rien à interpréter, seul le flux d'onboarding
      // existant décide de la réponse.
      if (interaction && interaction.processingStatus === "en_attente_traitement") {
        let outcome: InterpretationOutcome;
        try {
          outcome = await runIntelligencePipeline(message, state.territories);
        } catch (pipelineError) {
          outcome = { outcome: "echec", failureReason: (pipelineError as Error).message };
        }
        state = await dispatch(
          { type: "apply_terrain_interpretation", interactionId: interaction.id, ...outcome },
          `whatsapp:${message.externalMessageId}:interpretation`
        );
        interaction = await findInteraction(state, message.externalMessageId);
      }

      const conversation = state.conversations.find(
        (item) => item.channel === message.channel && item.channelAddress === message.channelAddress
      );
      if (!conversation) continue;

      const intent = determineReplyIntent(conversation, interaction, state.territories);
      const replyText = renderReplyText(intent, state.territories);
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
      // Jamais de payload personnel en clair dans les logs (mandat §11
      // T01) — seul le message d'erreur (configuration/réseau) est
      // journalisé. Un message qui échoue n'empêche jamais le traitement
      // du reste du lot.
      console.error(`[webhook whatsapp] message non traité : ${(error as Error).message}`);
    }
  }

  return NextResponse.json({ ok: true });
}
