import type { InterpretationConfidence, TerrainInteractionIntent } from "@/domain/types";
import type { TerrainInterpretationOutput } from "./types";

// Validation stricte (mandat §3, "validate AI output against strict
// runtime schemas before applying it" ; §12, "malformed intelligence
// output rejected by schema") — volontairement à la main plutôt
// qu'une librairie de schéma : aucune dépendance de ce type n'existe
// ailleurs dans le dépôt (même discipline que le reste du domaine, qui
// valide déjà ses commandes à la main dans rules.ts).
const VALID_INTENTS: readonly TerrainInteractionIntent[] = ["signal", "besoin", "observation", "capacite", "non_classifie"];
const VALID_CONFIDENCE: readonly InterpretationConfidence[] = ["haute", "moyenne", "faible"];

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

export function isValidInterpretation(value: unknown): value is TerrainInterpretationOutput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.intent !== "string" || !VALID_INTENTS.includes(v.intent as TerrainInteractionIntent)) return false;
  if (typeof v.summary !== "string" || !v.summary.trim()) return false;
  if (typeof v.confidence !== "string" || !VALID_CONFIDENCE.includes(v.confidence as InterpretationConfidence)) return false;
  if (typeof v.needsHumanReview !== "boolean") return false;
  if (!isOptionalString(v.language)) return false;
  if (!isOptionalString(v.subject)) return false;
  if (!isOptionalString(v.territoryId)) return false;
  if (!isOptionalString(v.siteId)) return false;
  if (v.quantity !== undefined && typeof v.quantity !== "number") return false;
  if (!isOptionalString(v.unit)) return false;
  if (!isOptionalString(v.timeWindow)) return false;
  return true;
}

export function isValidTranscription(value: unknown): value is { text: string; language?: string; confidence: InterpretationConfidence } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.text !== "string" || !v.text.trim()) return false;
  if (!isOptionalString(v.language)) return false;
  if (typeof v.confidence !== "string" || !VALID_CONFIDENCE.includes(v.confidence as InterpretationConfidence)) return false;
  return true;
}

export function isValidImageAnalysis(value: unknown): value is { description: string; confidence: InterpretationConfidence } {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.description !== "string" || !v.description.trim()) return false;
  if (typeof v.confidence !== "string" || !VALID_CONFIDENCE.includes(v.confidence as InterpretationConfidence)) return false;
  return true;
}
