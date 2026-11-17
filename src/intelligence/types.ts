import type { InterpretationConfidence, TerrainInterpretation } from "@/domain/types";

// Frontière IA — mandat T02 §3 : "Channel Adapter → Media/Text
// Normalisation → Intelligence Adapter → Structured Interpretation →
// Domain Update". Le domaine (src/domain) n'importe jamais rien d'ici ;
// seul le pont de canal (src/app/api/webhooks/whatsapp/route.ts) appelle
// ces fonctions, valide leur sortie (schemas.ts), puis dispatche
// apply_terrain_interpretation avec un résultat déjà validé.

export interface MediaRef {
  mediaId: string;
  mimeType?: string;
  // data — octets réellement téléchargés par le canal (ex. WhatsApp Media
  // API), transitoires : jamais persistés dans ProductState (mandat §10,
  // "avoid persisting binary media in the tenant JSON payload"). Absent
  // pour la fixture déterministe, qui n'en a jamais besoin (clé = mediaId
  // uniquement).
  data?: Buffer;
}

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence: InterpretationConfidence;
}

export interface ImageAnalysisResult {
  description: string;
  confidence: InterpretationConfidence;
}

// knownTerritories — le seul contexte métier transmis à l'adaptateur, pour
// une résolution de territoire honnête (correspondance de nom dans le
// texte) plutôt qu'une invention. N'importe rien d'autre du domaine.
export interface TerrainInterpretationInput {
  text: string;
  knownTerritories: Array<{ id: string; name: string }>;
}

export type TerrainInterpretationOutput = Omit<TerrainInterpretation, "interpretedAt">;

export interface IntelligenceAdapter {
  transcribeAudio(media: MediaRef): Promise<TranscriptionResult>;
  analyseImage(media: MediaRef, caption?: string): Promise<ImageAnalysisResult>;
  interpretTerrainMessage(input: TerrainInterpretationInput): Promise<TerrainInterpretationOutput>;
}
