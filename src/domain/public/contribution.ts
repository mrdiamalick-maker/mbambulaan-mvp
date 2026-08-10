// Objet "contribution réseau" public, conforme à la section 13 du MASTER_SPEC.
// Une soumission n'entraîne jamais un référencement ou un statut "partenaire"
// automatique : elle entre dans un workflow interne distinct de celui des demandes.

export type PublicContributionActorType =
  | "entreprise"
  | "transporteur"
  | "transformateur"
  | "fournisseur"
  | "acheteur"
  | "centre_formation"
  | "ong_bailleur"
  | "organisation_professionnelle"
  | "expert"
  | "institution"
  | "autre";

export type PublicContributionStatus =
  | "identifie"
  | "en_relation"
  | "documente"
  | "verifie"
  | "mobilisable"
  | "experimente";

export const contributionStatusLabels: Record<PublicContributionStatus, string> = {
  identifie: "Identifié",
  en_relation: "En relation",
  documente: "Documenté",
  verifie: "Vérifié",
  mobilisable: "Mobilisable",
  experimente: "Expérimenté avec Mbàmbulaan"
};

export interface PublicContributionInput {
  actorType: PublicContributionActorType;
  services: string;
  territories: string;
  capacity?: string;
  organization?: string;
  contactName: string;
  phone: string;
  email?: string;
  website?: string;
  notes?: string;
}

export interface PublicContribution extends PublicContributionInput {
  id: string;
  reference: string;
  status: PublicContributionStatus;
  createdAt: string;
}
