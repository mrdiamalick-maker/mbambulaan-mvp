// Fournisseur réel — mandat §3, "if a provider is configured, use it
// through environment variables". Anthropic a été choisi comme premier
// fournisseur réel branchable (D009 : "Claude is the coding agent, not
// necessarily the runtime model" — ça reste un choix autorisé, pas
// obligatoire) pour deux capacités réellement disponibles via l'API
// Messages : classification de texte structurée, et compréhension
// d'image (vision multimodale). AUCUNE requête n'a pu être validée en
// conditions réelles dans cet environnement (aucun ANTHROPIC_API_KEY
// disponible ici) — voir IMPLEMENTATION_LOG.md.
//
// La transcription audio N'EST PAS proposée par ce fournisseur :
// l'API Messages d'Anthropic ne prend pas l'audio en entrée. Un vrai
// chemin de transcription nécessiterait un fournisseur dédié (ex.
// Whisper) — non branché ici, jamais fabriqué.
import type { ImageAnalysisResult, MediaRef, TerrainInterpretationInput, TerrainInterpretationOutput } from "./types";
import { isValidImageAnalysis, isValidInterpretation } from "./schemas";

const ANTHROPIC_API_VERSION = "2023-06-01";

export function anthropicConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY && !!process.env.ANTHROPIC_MODEL;
}

interface AnthropicContentBlock {
  type: "text" | "image";
  text?: string;
  source?: { type: "base64"; media_type: string; data: string };
}

async function callAnthropic(system: string, content: string | AnthropicContentBlock[]): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL;
  if (!apiKey || !model) throw new Error("Fournisseur IA non configuré (ANTHROPIC_API_KEY / ANTHROPIC_MODEL manquants).");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": ANTHROPIC_API_VERSION, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      system,
      messages: [{ role: "user", content }]
    })
  });
  if (!response.ok) throw new Error(`Le fournisseur IA (Anthropic) a refusé la requête (HTTP ${response.status}).`);
  const payload = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = payload.content?.find((block) => block.type === "text")?.text;
  if (typeof text !== "string" || !text.trim()) throw new Error("Réponse du fournisseur IA sans contenu texte exploitable.");
  return text;
}

function parseJsonOrThrow(text: string, context: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Sortie du fournisseur IA non JSON (${context}).`);
  }
}

export async function interpretTerrainMessageAnthropic(input: TerrainInterpretationInput): Promise<TerrainInterpretationOutput> {
  const territoryList = input.knownTerritories.map((t) => `${t.id}=${t.name}`).join(", ") || "aucun";
  const system = [
    'Tu classes un message terrain de pêche artisanale sénégalaise. Réponds UNIQUEMENT avec un objet JSON strict, sans texte autour, au schéma :',
    '{"intent":"signal"|"besoin"|"observation"|"capacite"|"non_classifie","summary":string,"language"?:string,"subject"?:string,"territoryId"?:string,"siteId"?:string,"quantity"?:number,"unit"?:string,"timeWindow"?:string,"confidence":"haute"|"moyenne"|"faible","needsHumanReview":boolean}.',
    "N'invente JAMAIS une quantité, un lieu ou une date absents du message — omets le champ plutôt que de deviner.",
    'Utilise "non_classifie" si le message est ambigu, conversationnel, ou si tu ne peux pas décider sans deviner.',
    `territoryId doit être choisi UNIQUEMENT parmi ces identifiants réels s'il correspond vraiment au message, sinon omis : ${territoryList}.`
  ].join(" ");

  const text = await callAnthropic(system, input.text);
  const parsed = parseJsonOrThrow(text, "interprétation terrain");
  if (!isValidInterpretation(parsed)) throw new Error("Sortie du fournisseur IA invalide (schéma d'interprétation non respecté).");
  return parsed;
}

export async function analyseImageAnthropic(media: MediaRef, caption?: string): Promise<ImageAnalysisResult> {
  if (!media.data) throw new Error("Image non téléchargée — analyse impossible sans octets récupérés auprès du fournisseur de messagerie.");
  const system = [
    "Décris factuellement ce que montre cette photo, prise dans un contexte de pêche artisanale (équipement, débarquement, infrastructure, quai...).",
    'Réponds UNIQUEMENT avec un objet JSON strict : {"description":string,"confidence":"haute"|"moyenne"|"faible"}.',
    'Ne conclus JAMAIS à une certitude absolue ou à une vérification — reste descriptif, utilise "confidence" pour exprimer ton incertitude.',
    caption ? `Légende fournie par l'utilisateur : "${caption}".` : "Aucune légende fournie."
  ].join(" ");

  const text = await callAnthropic(system, [
    { type: "image", source: { type: "base64", media_type: media.mimeType ?? "image/jpeg", data: media.data.toString("base64") } },
    { type: "text", text: caption ?? "Décris cette photo." }
  ]);
  const parsed = parseJsonOrThrow(text, "analyse d'image");
  if (!isValidImageAnalysis(parsed)) throw new Error("Sortie du fournisseur de vision invalide (schéma d'analyse d'image non respecté).");
  return parsed;
}
