// Objet "demande" public, conforme à la section 12 du MASTER_SPEC : un même
// moteur alimente cet objet, quel que soit le canal (web, WhatsApp, téléphone,
// terrain, partenaire, événement). Distinct du state du Produit professionnel.

export type PublicRequestSource = "web" | "whatsapp" | "telephone" | "terrain" | "partenaire" | "evenement";

export type PublicRequestIntent =
  | "transport"
  | "conservation"
  | "transformation"
  | "equipement"
  | "maintenance"
  | "formation"
  | "debouches"
  | "programme"
  | "sourcing"
  | "comprendre-territoire"
  | "financement"
  | "organisation"
  | "partenariat"
  | "presse"
  | "callback"
  | "autre";

export type PublicRequestActorType =
  | "particulier"
  | "entreprise"
  | "transporteur"
  | "transformateur"
  | "organisation_professionnelle"
  | "ong_bailleur"
  | "institution"
  | "centre_formation"
  | "autre";

export type PublicRequestChannel = "whatsapp" | "telephone" | "email";

export type PublicRequestStatus =
  | "recue"
  | "en_etude"
  | "solution_recherchee"
  | "organisation_en_cours"
  | "action_engagee"
  | "terminee"
  | "non_aboutie";

export const requestStatusLabels: Record<PublicRequestStatus, string> = {
  recue: "Reçue",
  en_etude: "En cours d’étude",
  solution_recherchee: "Solution recherchée",
  organisation_en_cours: "Organisation en cours",
  action_engagee: "Action engagée",
  terminee: "Terminée",
  non_aboutie: "Non aboutie"
};

export interface PublicRequestInput {
  source: PublicRequestSource;
  context?: Record<string, string | undefined>;
  intent: PublicRequestIntent;
  category?: string;
  territory?: string;
  description: string;
  actorType: PublicRequestActorType;
  organization?: string;
  contactName: string;
  phone: string;
  email?: string;
  preferredChannel: PublicRequestChannel;
  consent: boolean;
  attachmentNote?: string;
}

export interface PublicRequest extends PublicRequestInput {
  id: string;
  reference: string;
  status: PublicRequestStatus;
  createdAt: string;
}
