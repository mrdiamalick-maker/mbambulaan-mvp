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
import { Anchor, Footprints, Globe, MessageCircleMore, PhoneCall } from "lucide-react";
import type { ActionStatus, FishingTrip, Landing, Signal, Situation, TrustLevel } from "@/domain/types";

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
// espace_public (LOT 0.4, mandat "aligner le Core métier avec le
// Blueprint V1") : canal des signaux issus d'une PublicRequest — jamais
// injecté dans createDemoState() (les 30 signaux déjà vérifiés dans
// l'Espace État restent inchangés), n'apparaît que si une vraie
// PublicRequest est soumise pendant une session.
export const channelMeta: Record<Signal["channel"], { label: string; icon: typeof PhoneCall }> = {
  terrain: { label: "Agent terrain", icon: Footprints },
  telephone: { label: "Téléphone", icon: PhoneCall },
  whatsapp_structure: { label: "WhatsApp", icon: MessageCircleMore },
  poste_quai: { label: "Poste de quai", icon: Anchor },
  espace_public: { label: "Espace public", icon: Globe }
};

// Statut d'un engagement (Commitment.status) — introduit par
// CoordinationProposal.tsx (Lot 4), repris tel quel par la page de
// détail /app/coordination/[id] (passe de cohérence pré-Lot 6) : un
// seul jeu de libellés/couleurs pour ne pas en faire dériver deux.
export const commitmentStatusLabel: Record<ActionStatus, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  bloquee: "Bloquée",
  terminee: "Terminée"
};
export const commitmentStatusVariant: Record<ActionStatus, "marine" | "amber" | "terracotta" | "success"> = {
  a_faire: "marine",
  en_cours: "amber",
  bloquee: "terracotta",
  terminee: "success"
};

// Statut d'une sortie de pêche (FishingTrip.status) / d'un débarquement
// (Landing.status) — révue éditoriale Produit (2026-08-12, paquet CEO,
// section « Opérateur ») : remplace un affichage brut de l'enum
// (`trip.status.replaceAll("_", " ")`) par un libellé métier. Partagé
// entre OperatorTaskView.tsx (Lot 7) et TerrainCaptainView.tsx (Lot 6,
// tripStatusLabel y était déjà dupliqué à l'identique) pour éviter une
// 3e dérive silencieuse.
export const tripStatusLabel: Record<FishingTrip["status"], string> = {
  en_mer: "En mer",
  retour_annonce: "Retour annoncé",
  arrivee_confirmee: "Arrivée confirmée au quai",
  debarquee: "Débarquement enregistré"
};

export const landingStatusLabel: Record<Landing["status"], string> = {
  attendu: "Attendu",
  arrive: "Arrivé au quai",
  pese: "Pesé",
  lots_crees: "Lots constitués"
};
