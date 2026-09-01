// Rencontres et missions terrain planifiées par le ministère — répond au
// besoin exprimé : "rencontrer des pêcheurs" et "aller sur le terrain,
// avoir du travail". Le vocabulaire et le statut (planifiée/réalisée/
// annulée) restent propres au ministère — ce n'est pas un processus
// métier de la filière au même titre qu'un débarquement ou un lot.
// Depuis le Lot 1 (D2), une mission planifiée devient aussi un Commitment
// réel dans une coordination du modèle unifié (voir commitmentId /
// coordinationId ci-dessous) : elle n'est plus un enregistrement isolé.

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
  // Porté dès maintenant (Lot 0) même à tenant unique : évite une
  // migration lourde le jour où l'isolation multi-tenant réelle arrive.
  tenantId?: string;
}

export interface FieldVisit extends FieldVisitInput {
  id: string;
  status: FieldVisitStatus;
  createdAt: string;
  commitmentId?: string;
  coordinationId?: string;
  // LOT 3 (mandat "Terrain — observer, vérifier et fiabiliser la
  // réalité", §6/§27) : champ additif, jamais destructif — FieldVisit
  // n'est pas remplacé par le Core FieldMission, il devient
  // progressivement une projection/un canal de la capacité Terrain
  // (bridgeFieldCommitment, ministry-repository.ts) qui dispatche
  // désormais aussi create_field_mission en parallèle de
  // plan_field_commitment, sans rien changer au chemin existant.
  missionId?: string;
}
