import { NextRequest, NextResponse } from "next/server";
import type { Command, ProductState, Territory } from "@/domain/types";
import { dispatch, getState } from "@/server/repository";
import { determineReplyIntent, matchConfirmationAnswer } from "@/domain/channel-interaction";
import type { ReplyIntent } from "@/domain/channel-interaction";
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
import { evaluatePromotion } from "@/domain/terrain-matching";

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
    // Téléchargement des octets AVANT transcription (Sprint T04, mandat
    // §4/§6) — corrige un manque de T02 : la branche audio appelait
    // transcribeAudio sans jamais récupérer le média lui-même (seule la
    // fixture déterministe n'en avait pas besoin). Même discipline que la
    // branche image ci-dessous : un échec de téléchargement ne fait PAS
    // échouer tout le pipeline ici — la fixture déterministe (aucun
    // fournisseur réel configuré) n'a jamais besoin des octets, elle reste
    // clé uniquement par mediaId. Un fournisseur réel configuré
    // (whisper-adapter.ts), lui, exige explicitement les octets et échoue
    // honnêtement si `data` est absent — jamais une transcription
    // fabriquée (mandat §11, "l'interaction d'origine ne doit jamais être
    // perdue" : l'échec devient alors echec_traitement, pas un succès
    // silencieux).
    let downloaded: { data: Buffer; mimeType: string } | undefined;
    try {
      downloaded = await downloadWhatsappMedia(message.mediaRef.mediaId);
    } catch {
      downloaded = undefined;
    }
    const transcription = await intelligenceAdapter.transcribeAudio({
      mediaId: message.mediaRef.mediaId,
      mimeType: downloaded?.mimeType ?? message.mediaRef.mimeType,
      data: downloaded?.data
    });
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
      // Lecture AVANT dispatch (Sprint T04, mandat §7) — nécessaire pour
      // décider quelle réponse envoyer : une fois receive_channel_message
      // dispatché, la confirmation en attente (si elle existait) a déjà
      // été effacée par le domaine (channel-interaction.ts) et aucune
      // nouvelle TerrainInteraction n'a été créée pour une réponse
      // oui/non — determineReplyIntent (appelé plus bas) ne peut alors
      // plus distinguer ces deux cas. matchConfirmationAnswer est pure et
      // déterministe : l'appeler deux fois (ici et dans le domaine) sur
      // les mêmes entrées donne toujours le même résultat.
      const stateBefore = await getState();
      const conversationBefore = stateBefore.conversations.find(
        (item) => item.channel === message.channel && item.channelAddress === message.channelAddress
      );
      const pendingConfirmationBefore = conversationBefore?.pendingConfirmationInteractionId;
      const confirmationAnswer = pendingConfirmationBefore ? matchConfirmationAnswer(message.rawContent) : undefined;

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

        // Promotion automatique (mandat T03 §4/§13, "if required" —
        // automatique quand c'est sûr, le bouton manuel de l'UI Terrain
        // reste le repli explicite sinon). actorId = l'acteur réel auteur
        // du message (jamais un acteur système fabriqué) — dispatch()
        // ignore les permissions (seul /api/actions les vérifie), donc
        // aucun conflit avec le fait que ce même type de commande reste
        // aussi déclenchable par un opérateur humain.
        if (interaction && interaction.actorId && evaluatePromotion(interaction).eligible) {
          state = await dispatch(
            { type: "promote_terrain_interaction", actorId: interaction.actorId, interactionId: interaction.id },
            `whatsapp:${message.externalMessageId}:promotion`
          );
        }
      }

      const conversation = state.conversations.find(
        (item) => item.channel === message.channel && item.channelAddress === message.channelAddress
      );
      if (!conversation) continue;

      // Opt-out (Sprint T04, mandat §11) — un contact qui a demandé l'arrêt
      // (STOP, ce message ou un précédent) ne reçoit plus AUCUNE réponse,
      // ni accusé de réception ni confirmation.
      if (conversation.optedOut) continue;

      const intent: ReplyIntent =
        confirmationAnswer === "oui"
          ? { kind: "confirmed" }
          : confirmationAnswer === "non"
            ? { kind: "ask_clarification" }
            : determineReplyIntent(conversation, interaction, state.territories);
      const replyText = renderReplyText(intent, state.territories);
      const adapter = getChannelAdapter(message.channel);

      try {
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
      } catch (sendError) {
        // Échec d'envoi d'une réponse conversationnelle ordinaire (Sprint
        // T04, mandat §12) — jamais perdu dans les seuls logs serveur :
        // consigné pour qu'un administrateur puisse le voir sans accès
        // shell (src/domain/pilot.ts, OperationalFailure). Pas de
        // relance vers le catch englobant ci-dessous : il consignerait la
        // même panne une seconde fois (mandat "jamais un angle mort
        // dupliqué").
        console.error(`[webhook whatsapp] envoi de réponse échoué : ${(sendError as Error).message}`);
        await dispatch(
          { type: "record_operational_failure", channel: message.channel, channelAddress: message.channelAddress, reason: (sendError as Error).message },
          `whatsapp:${message.externalMessageId}:reply-failure`
        );
      }
    } catch (error) {
      // Jamais de payload personnel en clair dans les logs (mandat §11
      // T01) — seul le message d'erreur (configuration/réseau) est
      // journalisé. Un message qui échoue n'empêche jamais le traitement
      // du reste du lot. Mandat T04 §12 : également consigné dans
      // OperationalFailure pour une visibilité admin sans accès shell.
      console.error(`[webhook whatsapp] message non traité : ${(error as Error).message}`);
      try {
        await dispatch(
          { type: "record_operational_failure", channel: message.channel, channelAddress: message.channelAddress, reason: (error as Error).message },
          `whatsapp:${message.externalMessageId}:failure`
        );
      } catch {
        // La consignation elle-même ne doit jamais faire échouer le lot.
      }
    }
  }

  return NextResponse.json({ ok: true });
}
