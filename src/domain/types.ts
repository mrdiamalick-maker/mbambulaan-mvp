export type Role =
  | "agent_terrain"
  | "coordinateur"
  | "responsable_initiative"
  | "decideur"
  | "partenaire"
  | "expert"
  | "administrateur";

export type TrustLevel = "declaree" | "verifiee" | "consolidee";
export type Visibility = "organisation" | "partenaires" | "publique";
export type SituationStatus =
  | "recue"
  | "qualification"
  | "priorisee"
  | "coordination"
  | "intervention"
  | "attente"
  | "resultat"
  | "reglee";
export type ActionStatus = "a_faire" | "en_cours" | "bloquee" | "terminee";
export type InitiativeStatus = "cadrage" | "financee" | "execution" | "terminee";

export interface Actor {
  id: string;
  name: string;
  role: Role;
  organizationId: string;
  territoryIds: string[];
  phone: string;
}

export interface Organization {
  id: string;
  name: string;
  type: "service_public" | "collectivite" | "organisation_professionnelle" | "entreprise" | "partenaire";
}

export interface Territory {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  activity: "stable" | "vigilance" | "critique";
  infrastructureIds: string[];
}

export interface Infrastructure {
  id: string;
  territoryId: string;
  name: string;
  type: "fabrique_glace" | "chambre_froide" | "quai" | "marche";
  status: "operationnelle" | "fragile" | "indisponible";
}

export interface Observation {
  id: string;
  territoryId: string;
  actorId: string;
  createdAt: string;
  channel: "terrain" | "telephone" | "whatsapp_structure" | "poste_quai";
  category: "infrastructure" | "production" | "marche" | "qualite";
  title: string;
  description: string;
  trust: TrustLevel;
  source: string;
}

export interface HistoryEntry {
  id: string;
  at: string;
  actor: string;
  label: string;
  detail: string;
}

export interface Situation {
  id: string;
  reference: string;
  observationIds: string[];
  territoryId: string;
  title: string;
  description: string;
  status: SituationStatus;
  priority: "faible" | "moyenne" | "haute" | "critique";
  trust: TrustLevel;
  visibility: Visibility;
  responsibleId?: string;
  dueAt?: string;
  waitingReason?: string;
  nextStep: string;
  result?: string;
  confirmation?: string;
  coordinationId?: string;
  initiativeId?: string;
  history: HistoryEntry[];
}

export interface Commitment {
  id: string;
  actorId: string;
  label: string;
  dueAt: string;
  status: ActionStatus;
  result?: string;
}

export interface CoordinationSpace {
  id: string;
  situationId: string;
  title: string;
  participantIds: string[];
  objective: string;
  decision: string;
  commitments: Commitment[];
  risks: string[];
  nextReviewAt: string;
}

export interface Funding {
  id: string;
  partnerId: string;
  amountFcfa: number;
  status: "a_mobiliser" | "en_instruction" | "confirme";
  condition: string;
}

export interface Initiative {
  id: string;
  title: string;
  territoryIds: string[];
  situationIds: string[];
  objective: string;
  status: InitiativeStatus;
  ownerId: string;
  budgetFcfa: number;
  funding: Funding[];
  indicators: Array<{ label: string; baseline: number; target: number; current: number; unit: string }>;
}

export interface Learning {
  id: string;
  situationId: string;
  title: string;
  summary: string;
  reusableIn: string[];
}

export interface Notification {
  id: string;
  role: Role;
  title: string;
  href: string;
  read: boolean;
}

export interface AuditEntry {
  id: string;
  at: string;
  actorId: string;
  objectType: string;
  objectId: string;
  action: string;
  detail: string;
}

export interface Tenant {
  id: string;
  name: string;
  mode: "demonstration" | "production";
}

export interface ProductState {
  revision: number;
  tenant: Tenant;
  organizations: Organization[];
  actors: Actor[];
  territories: Territory[];
  infrastructures: Infrastructure[];
  observations: Observation[];
  situations: Situation[];
  coordinationSpaces: CoordinationSpace[];
  initiatives: Initiative[];
  learnings: Learning[];
  notifications: Notification[];
  audit: AuditEntry[];
}

export type Command =
  | {
      type: "create_signal";
      actorId: string;
      territoryId: string;
      title: string;
      description: string;
      channel: Observation["channel"];
    }
  | { type: "qualify"; situationId: string; actorId: string }
  | { type: "prioritize"; situationId: string; actorId: string }
  | { type: "coordinate"; situationId: string; actorId: string }
  | { type: "start_intervention"; situationId: string; actorId: string }
  | { type: "wait"; situationId: string; actorId: string; reason: string }
  | { type: "resume"; situationId: string; actorId: string }
  | { type: "record_result"; situationId: string; actorId: string; result: string; confirmation: string }
  | { type: "close"; situationId: string; actorId: string }
  | { type: "reset_demo"; actorId: string };

export type CommandInput = Command extends infer Item
  ? Item extends { actorId: string }
    ? Omit<Item, "actorId">
    : never
  : never;
