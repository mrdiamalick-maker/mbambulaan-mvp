// Rencontres et missions terrain planifiées par le ministère — répond au
// besoin exprimé : "rencontrer des pêcheurs" et "aller sur le terrain,
// avoir du travail". Volontairement isolé du moteur de commandes/événements
// opérationnel (situations, pirogues, lots) : il ne s'agit pas d'un
// processus métier de la filière mais d'une activité propre au ministère.

export type FieldVisitStatus = "planifiee" | "realisee" | "annulee";
export const fieldVisitStatusLabels: Record<FieldVisitStatus, string> = {
  planifiee: "Planifiée",
  realisee: "Réalisée",
  annulee: "Annulée"
};

export type FieldVisitObjective =
  | "rencontre_pecheurs"
  | "point_infrastructure"
  | "sensibilisation_securite"
  | "reconversion_revenus"
  | "verification_vigilance"
  | "autre";

export const fieldVisitObjectiveLabels: Record<FieldVisitObjective, string> = {
  rencontre_pecheurs: "Rencontre avec des pêcheurs et capitaines",
  point_infrastructure: "Point sur une infrastructure ou un quai",
  sensibilisation_securite: "Sensibilisation sécurité en mer",
  reconversion_revenus: "Présentation d'un levier de revenu alternatif",
  verification_vigilance: "Vérification d'un signalement de vigilance",
  autre: "Autre objectif"
};

export interface FieldVisitInput {
  title: string;
  territoryId: string;
  territoryLabel: string;
  objective: FieldVisitObjective;
  plannedAt: string;
  notes?: string;
  createdByActorId: string;
  createdByName: string;
}

export interface FieldVisit extends FieldVisitInput {
  id: string;
  status: FieldVisitStatus;
  createdAt: string;
}
