// Jetons visuels partagés — priorité, confiance, canal d'origine,
// couleurs de tension — réutilisés à travers Coordinateur (Lot 3) et
// Situation Room (Lot 4). Valeurs figées par le référentiel D9
// (docs/design-reference), pas une logique métier : centralisées ici
// pour éviter une nouvelle duplication silencieuse après la 3e
// occurrence (Institution, Coordinateur, Situation Room).
//
// src/app/app/etat/page.tsx (Lot 2, déjà livré et validé par le CEO)
// garde sa copie locale plutôt que d'être rouverte sans nécessité pour
// ce lot — le risque de dérive entre les deux est nul, les valeurs
// étant verrouillées par le référentiel.
import { Anchor, Footprints, MessageCircleMore, PhoneCall } from "lucide-react";
import type { Signal, Situation, TrustLevel } from "@/domain/types";

export type GlyphTag = "stable" | "vigilance" | "critique";

export const priorityLabels: Record<Situation["priority"], string> = {
  critique: "Critique",
  haute: "Élevé",
  moyenne: "Moyen",
  faible: "Faible"
};

export const priorityToTag: Record<Situation["priority"], GlyphTag> = {
  critique: "critique",
  haute: "vigilance",
  moyenne: "stable",
  faible: "stable"
};

export const glyphBorderColor: Record<GlyphTag, string> = { stable: "#1d4468", vigilance: "#c68a2c", critique: "#b6522f" };
export const glyphFillColor: Record<GlyphTag, string> = { stable: "rgba(29,68,104,.05)", vigilance: "rgba(198,138,44,.07)", critique: "rgba(182,82,47,.07)" };
// Remplissage renforcé — réservé aux blocs qui appellent une décision
// (file de situations à traiter), qui doivent se détacher des blocs de
// simple lecture (glyphFillColor, ~2x plus léger). Même principe que
// arbitrageFillColor dans src/app/app/etat/page.tsx (Lot 2, non
// dupliqué ici pour ne pas rouvrir ce fichier déjà validé).
export const glyphFillColorStrong: Record<GlyphTag, string> = { stable: "rgba(29,68,104,.08)", vigilance: "rgba(198,138,44,.14)", critique: "rgba(182,82,47,.15)" };

export const trustLabels: Record<TrustLevel, string> = {
  declaree: "Déclarée",
  observee: "Observée",
  verifiee: "Vérifiée",
  consolidee: "Consolidée",
  rapprochee: "Rapprochée",
  documentee: "Documentée",
  officielle: "Officielle",
  estimee: "Estimée",
  contestee: "Contestée",
  expiree: "Expirée"
};

// Origine du signal — condition Lot 3 (intake omnicanal), réutilisée
// telle quelle par la Situation Room (Lot 4) : le canal doit rester
// visible à chaque étape, pas seulement au niveau de la file.
export const channelMeta: Record<Signal["channel"], { label: string; icon: typeof PhoneCall }> = {
  terrain: { label: "Agent terrain", icon: Footprints },
  telephone: { label: "Téléphone", icon: PhoneCall },
  whatsapp_structure: { label: "WhatsApp", icon: MessageCircleMore },
  poste_quai: { label: "Poste de quai", icon: Anchor }
};
