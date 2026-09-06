// Signalements de vigilance suivis par le ministère — répond au besoin
// exprimé : "lutter contre les fléaux (immigration clandestine, etc.)".
// Un signalement n'est jamais une qualification judiciaire : c'est une
// entrée dans un dispositif de suivi et de transmission aux autorités
// compétentes, tracée et non anonyme côté ministère.

export type VigilanceCategory =
  | "immigration_clandestine"
  | "peche_illicite"
  | "securite_maritime"
  | "conflit_usage"
  | "autre";

export const vigilanceCategoryLabels: Record<VigilanceCategory, string> = {
  immigration_clandestine: "Immigration clandestine",
  peche_illicite: "Pêche illicite ou non déclarée",
  securite_maritime: "Sécurité maritime",
  conflit_usage: "Conflit d'usage territorial",
  autre: "Autre vigilance"
};

export type VigilanceSeverity = "faible" | "moyenne" | "haute" | "critique";
export const vigilanceSeverityLabels: Record<VigilanceSeverity, string> = {
  faible: "Faible",
  moyenne: "Moyenne",
  haute: "Haute",
  critique: "Critique"
};

export type VigilanceStatus = "signale" | "en_verification" | "transmis_autorites" | "clos";
export const vigilanceStatusLabels: Record<VigilanceStatus, string> = {
  signale: "Signalé",
  en_verification: "En vérification",
  transmis_autorites: "Transmis aux autorités",
  clos: "Clos"
};

export interface VigilanceCaseInput {
  category: VigilanceCategory;
  territoryId: string;
  territoryLabel: string;
  severity: VigilanceSeverity;
  description: string;
  reportedByActorId: string;
  reportedByName: string;
  // Porté dès maintenant (Lot 0) même à tenant unique : évite une
  // migration lourde le jour où l'isolation multi-tenant réelle arrive.
  tenantId?: string;
}

export interface VigilanceCase extends VigilanceCaseInput {
  id: string;
  status: VigilanceStatus;
  createdAt: string;
  updatedAt: string;
  // Refonte Lot 1 (D2) : un cas de vigilance devient un Signal/Situation
  // (catégorie sécurité) dans le modèle unifié dès sa création — il n'est
  // plus un enregistrement isolé, il apparaît dans la même Situation Room
  // que les autres signaux de la filière. Le cycle de vie ministère
  // (signalé/en vérification/transmis aux autorités/clos) reste propre à
  // ce domaine : il ne se force pas dans la machine à états de Situation,
  // qui suit son propre vocabulaire filière.
  signalId?: string;
  situationId?: string;
}
