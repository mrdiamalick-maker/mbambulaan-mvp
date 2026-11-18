// Fournisseur réel de transcription audio — Sprint T04 ("Live Pilot
// Readiness + Commercial Validation", mandat §4/§6). T02/D011 avaient
// laissé un vrai manque : l'adaptateur Anthropic (anthropic-adapter.ts)
// ne transcrit pas l'audio (l'API Messages n'accepte pas l'audio en
// entrée) — transcribeAudio restait donc toujours sur la fixture
// déterministe.
//
// Choix du fournisseur (mandat §4, critères documentés) : OpenAI Whisper
// (modèle "whisper-1", endpoint /v1/audio/transcriptions). Retenu parce
// que (a) il accepte directement l'ogg/opus, format natif des messages
// vocaux WhatsApp, sans conversion ; (b) le contrat REST est simple et
// branchable avec `fetch` + `FormData`/`Blob` globaux (Node 20+), sans
// SDK — même discipline zéro-dépendance que anthropic-adapter.ts ; (c) le
// français est un cas d'usage bien établi du modèle ; (d) la tarification
// et le contrat d'erreur sont documentés publiquement. AUCUNE requête
// n'a pu être validée en conditions réelles dans cet environnement
// (aucun OPENAI_API_KEY disponible ici) — voir IMPLEMENTATION_LOG.md.
//
// Wolof : ni réclamé ni infirmé ici — aucun échantillon réel wolof n'a pu
// être transcrit dans cet environnement (mandat §4, "Wolof must be
// treated honestly: only claim support if demonstrated with real
// samples"). Ne JAMAIS présenter le wolof comme supporté avant une
// démonstration réelle.
import type { MediaRef, TranscriptionResult } from "./types";

export function whisperConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

// transcribeAudioWhisper — mandat §4 : échoue explicitement à chaque étape
// (octets absents, fournisseur non configuré, requête refusée, réponse
// sans texte exploitable) — jamais une transcription fabriquée.
export async function transcribeAudioWhisper(media: MediaRef): Promise<TranscriptionResult> {
  if (!media.data) {
    throw new Error("Audio non téléchargé — transcription impossible sans octets récupérés auprès du fournisseur de messagerie.");
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Fournisseur de transcription non configuré (OPENAI_API_KEY manquant).");
  }
  const model = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1";

  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(media.data)], { type: media.mimeType ?? "audio/ogg" }), "audio.ogg");
  form.append("model", model);
  // response_format "verbose_json" — le seul moyen d'obtenir la langue
  // détectée (mandat §4, "supported formats/languages claimed by
  // provider") ; la réponse par défaut ("json") ne porte que le texte.
  form.append("response_format", "verbose_json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form
  });
  if (!response.ok) {
    throw new Error(`Le fournisseur de transcription (OpenAI Whisper) a refusé la requête (HTTP ${response.status}).`);
  }
  const payload = (await response.json()) as { text?: string; language?: string };
  if (typeof payload.text !== "string" || !payload.text.trim()) {
    throw new Error("Réponse de transcription sans texte exploitable.");
  }
  return {
    text: payload.text.trim(),
    // language — transmis TEL QUEL (ex. "french"), jamais mappé vers un
    // code ISO : Whisper renvoie un nom de langue complet dans ce format
    // de réponse, toute tentative de correspondance serait une déduction,
    // pas une donnée fournie (mandat "do not fabricate").
    language: payload.language,
    // confidence — ce fournisseur n'expose aucun signal de confiance
    // exploitable dans ce format de réponse (verbose_json porte des
    // avg_logprob par segment, pas une confiance globale explicable) :
    // plutôt que fabriquer une fausse précision en interprétant ces
    // logprobs, cet adaptateur retient "moyenne" pour TOUTE transcription
    // réussie — même doctrine que le reste du domaine (catégorie bornée,
    // jamais un score inventé).
    confidence: "moyenne"
  };
}
