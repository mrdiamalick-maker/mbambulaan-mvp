import type { InterpretationConfidence, TerrainInteractionIntent } from "@/domain/types";
import type { ImageAnalysisResult, IntelligenceAdapter, MediaRef, TerrainInterpretationInput, TerrainInterpretationOutput, TranscriptionResult } from "./types";

// fixtureIntelligenceAdapter — mandat §3 : "If no provider credentials
// are available, deterministic fixtures/mocks must allow the complete
// flow to be tested without fabricating production success." Utilisé
// quand aucun fournisseur réel n'est configuré (voir adapter.ts).
//
// IMPORTANT, à ne jamais perdre de vue en relisant ce fichier : ceci
// N'EST PAS un système de compréhension du langage naturel. C'est un
// classement déterministe par mots-clés français explicites, conçu
// uniquement pour (a) prouver que tout le pipeline (réception → IA →
// interprétation → affichage) fonctionne de bout en bout sans IA réelle
// branchée, et (b) servir de repli honnête en production tant qu'aucun
// vrai fournisseur n'est configuré. Il ne doit jamais être présenté comme
// une validation de la qualité de classification réelle — voir
// IMPLEMENTATION_LOG.md, "Deterministic test coverage" vs "Real provider
// validation".
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

const SIGNAL_MARKERS = ["en panne", "ne fonctionne pas", "ne marche pas", "n'est pas venu", "n est pas venu", "casse", "endommage", "abime"];
const NEED_MARKERS = ["besoin de", "besoin d'", "j'ai besoin", "j ai besoin", "je cherche", "il me faut", "je recherche"];
const CAPACITY_MARKERS = ["disponible", "disponibles", "j'ai de la place", "libre", "je peux fournir", "j'offre"];
const OBSERVATION_MARKERS = ["sont rentrees", "a augmente", "a baisse", "a chute", "beaucoup de"];

const SUBJECT_MARKERS: Array<{ pattern: string; subject: string }> = [
  { pattern: "machine a glace", subject: "équipement (machine à glace)" },
  { pattern: "chambre froide", subject: "froid" },
  { pattern: "glace", subject: "glace" },
  { pattern: "froid", subject: "froid" },
  { pattern: "camion", subject: "transport" },
  { pattern: "transport", subject: "transport" },
  { pattern: "pirogue", subject: "activité de pêche" },
  { pattern: "thiof", subject: "prix" },
  { pattern: "poisson", subject: "prix" },
  { pattern: "prix", subject: "prix" },
  { pattern: "acheteur", subject: "acheteur" },
  { pattern: "client", subject: "acheteur" }
];

const TIME_WINDOW_MARKERS = ["aujourd'hui", "aujourd hui", "demain", "ce matin", "cet apres-midi", "ce soir"];

function detectIntent(normalized: string): TerrainInteractionIntent {
  if (SIGNAL_MARKERS.some((marker) => normalized.includes(marker))) return "signal";
  if (NEED_MARKERS.some((marker) => normalized.includes(marker))) return "besoin";
  if (CAPACITY_MARKERS.some((marker) => normalized.includes(marker))) return "capacite";
  if (OBSERVATION_MARKERS.some((marker) => normalized.includes(marker))) return "observation";
  return "non_classifie";
}

function detectSubject(normalized: string): string | undefined {
  return SUBJECT_MARKERS.find((entry) => normalized.includes(entry.pattern))?.subject;
}

function detectTimeWindow(normalized: string): string | undefined {
  const match = TIME_WINDOW_MARKERS.find((marker) => normalized.includes(marker));
  return match?.replace("apres-midi", "après-midi");
}

function detectTerritory(normalized: string, knownTerritories: Array<{ id: string; name: string }>): string | undefined {
  return knownTerritories.find((territory) => normalized.includes(normalize(territory.name)))?.id;
}

function detectQuantity(normalized: string): { quantity?: number; unit?: string } {
  const match = normalized.match(/(\d+(?:[.,]\d+)?)\s*(tonnes?|kg|kilos?|litres?|l\b)/);
  if (!match) return {};
  return { quantity: Number(match[1].replace(",", ".")), unit: match[2] };
}

export async function interpretTerrainMessageFixture(input: TerrainInterpretationInput): Promise<TerrainInterpretationOutput> {
  const normalized = normalize(input.text);
  const intent = detectIntent(normalized);
  const subject = detectSubject(normalized);
  const timeWindow = detectTimeWindow(normalized);
  const territoryId = detectTerritory(normalized, input.knownTerritories);
  const { quantity, unit } = detectQuantity(normalized);

  const confidence: InterpretationConfidence = intent === "non_classifie" ? "faible" : "moyenne";
  const needsHumanReview = confidence === "faible" || intent === "signal" || !subject;

  const summary =
    intent === "non_classifie"
      ? "Message conversationnel ou ambigu — aucune intention métier claire détectée."
      : `${subject ?? "Sujet non déterminé"}${territoryId ? ` à ${input.knownTerritories.find((t) => t.id === territoryId)?.name}` : ""}${timeWindow ? `, ${timeWindow}` : ""}.`;

  return { intent, summary, subject, territoryId, quantity, unit, timeWindow, confidence, needsHumanReview };
}

// Fixtures de transcription — aucune transcription réelle n'est fabriquée
// pour un média inconnu (mandat "jamais fabriquer un succès de
// production") : seules ces deux entrées connues, utilisées par les
// tests/E2E, renvoient un résultat ; tout autre mediaId échoue
// explicitement (voir adapter.ts → apply_terrain_interpretation outcome
// "echec").
const AUDIO_FIXTURES: Record<string, TranscriptionResult> = {
  "fixture-audio-besoin-glace": { text: "J'ai besoin de glace aujourd'hui à Mbour.", language: "fr", confidence: "moyenne" }
};

export async function transcribeAudioFixture(media: MediaRef): Promise<TranscriptionResult> {
  const fixture = AUDIO_FIXTURES[media.mediaId];
  if (!fixture) {
    throw new Error(`Transcription indisponible : aucun fournisseur réel configuré et media "${media.mediaId}" ne correspond à aucune fixture connue.`);
  }
  return fixture;
}

const IMAGE_FIXTURES: Record<string, ImageAnalysisResult> = {
  "fixture-image-machine-glace-endommagee": {
    description: "La photo montre une machine à glace apparemment endommagée : panneau ouvert, pièce visiblement déboîtée (analyse fixture déterministe, pas une vision réelle).",
    confidence: "faible"
  }
};

export async function analyseImageFixture(media: MediaRef): Promise<ImageAnalysisResult> {
  const fixture = IMAGE_FIXTURES[media.mediaId];
  if (!fixture) {
    throw new Error(`Analyse d'image indisponible : aucun fournisseur réel configuré et media "${media.mediaId}" ne correspond à aucune fixture connue.`);
  }
  return fixture;
}

export const fixtureIntelligenceAdapter: IntelligenceAdapter = {
  transcribeAudio: transcribeAudioFixture,
  analyseImage: analyseImageFixture,
  interpretTerrainMessage: interpretTerrainMessageFixture
};
