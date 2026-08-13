export type Role =
  | "administrateur"
  | "operateur"
  | "capitaine"
  | "mareyeur"
  | "transformateur"
  | "prestataire"
  | "gestionnaire_organisation"
  | "coordinateur"
  | "institution"
  | "partenaire";

// Étendu (Lot 0) pour couvrir les 8 niveaux du cahier des charges maître
// (§12.1 : déclaré, rapproché, documenté, vérifié, officiel, estimé,
// contesté, expiré), en conservant les 4 valeurs historiques utilisées
// par les données et tests existants — extension additive, pas de
// migration de données requise.
export type TrustLevel =
  | "declaree"
  | "observee"
  | "verifiee"
  | "consolidee"
  | "rapprochee"
  | "documentee"
  | "officielle"
  | "estimee"
  | "contestee"
  | "expiree";
export type Visibility = "organisation" | "partenaires" | "publique";
export type Priority = "faible" | "moyenne" | "haute" | "critique";
export type ActionStatus = "a_faire" | "en_cours" | "bloquee" | "terminee";
export type SituationStatus =
  | "recue"
  | "qualification"
  | "priorisee"
  | "coordination"
  | "intervention"
  | "attente"
  | "resultat"
  | "reglee";

export interface Actor {
  id: string;
  name: string;
  role: Role;
  organizationId: string;
  territoryIds: string[];
  phone: string;
  verified: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type:
    | "service_public"
    | "collectivite"
    | "organisation_professionnelle"
    | "entreprise"
    | "partenaire";
}

export interface Territory {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  activity: "stable" | "vigilance" | "critique";
  siteIds: string[];
  infrastructureIds: string[];
}

export interface Site {
  id: string;
  territoryId: string;
  name: string;
  type: "quai" | "marche" | "zone_peche";
  latitude: number;
  longitude: number;
  source: string;
}

export interface Infrastructure {
  id: string;
  territoryId: string;
  siteId: string;
  organizationId: string;
  name: string;
  type: "fabrique_glace" | "chambre_froide" | "quai" | "marche" | "balance" | "transport" | "transformation";
  status: "operationnelle" | "fragile" | "indisponible";
  theoreticalCapacity: number;
  availableCapacity: number;
  unit: string;
  trust: TrustLevel;
  updatedAt: string;
}

export interface Vessel {
  id: string;
  name: string;
  registration: string;
  ownerId: string;
  captainId: string;
  homeSiteId: string;
  type: "pirogue_artisanale";
  trust: TrustLevel;
}

export interface FishingTrip {
  id: string;
  vesselId: string;
  captainId: string;
  departureAt: string;
  expectedReturnAt: string;
  announcedReturnAt?: string;
  arrivedAt?: string;
  status: "en_mer" | "retour_annonce" | "arrivee_confirmee" | "debarquee";
  zone: string;
  crewCount: number;
  source: string;
}

export interface Species {
  id: string;
  name: string;
  family: string;
  seasonality: string;
  sensitivity: "stable" | "surveillance" | "sensible";
  indicativePriceFcfaKg: number;
}

export interface CatchLine {
  id: string;
  speciesId: string;
  quantityKg: number;
  quality: "A" | "B" | "C";
  productForm: "entier_frais" | "filet" | "transforme";
}

export interface Landing {
  id: string;
  tripId: string;
  siteId: string;
  arrivedAt?: string;
  weighedAt?: string;
  status: "attendu" | "arrive" | "pese" | "lots_crees";
  catches: CatchLine[];
  totalWeightKg: number;
  weighingSource: string;
  trust: TrustLevel;
}

export interface Lot {
  id: string;
  landingId: string;
  speciesId: string;
  siteId: string;
  quantityKg: number;
  availableKg: number;
  quality: CatchLine["quality"];
  productForm: CatchLine["productForm"];
  conservation: "glace" | "froid" | "ambiant";
  status: "attendu" | "disponible" | "engage" | "valorise";
  trust: TrustLevel;
  traceabilityCompleteness: number;
}

// ServiceRequest — anciennement Need (Lot 1, D1 : « Need converge vers la
// forme de PublicRequest »). Reste strictement côté Produit — ne partage
// aucun code avec src/domain/public/request.ts, qui persiste dans son
// propre contexte (A17, Public non touché) ; seule la *forme* converge :
// vocabulaire canal (`channel`), intention (`intent`), référence et
// coordonnées de contact optionnelles, comme PublicRequest les porte déjà.
// speciesId/quantityKg/quality restent propres au Produit : ils alimentent
// le moteur de rapprochement Lot ↔ ServiceRequest (§5.11), qui n'existe pas
// côté Public. Portée volontairement limitée à l'intention « sourcing »
// pour cette étape — les intentions plus larges (formation, financement…)
// suivront quand un parcours de création dédié existera (cf. Lot 5,
// besoin collectif → programme).
export type ServiceRequestChannel = "web" | "whatsapp" | "telephone" | "terrain" | "partenaire" | "evenement";

export type ServiceRequestIntent =
  | "achat"
  | "transformation"
  | "conservation"
  | "transport"
  | "equipement"
  | "maintenance"
  | "formation"
  | "financement"
  | "sourcing"
  | "autre";

export const serviceRequestIntentLabels: Record<ServiceRequestIntent, string> = {
  achat: "Achat",
  transformation: "Transformation",
  conservation: "Conservation",
  transport: "Transport",
  equipement: "Équipement",
  maintenance: "Maintenance",
  formation: "Formation",
  financement: "Financement",
  sourcing: "Sourcing",
  autre: "Autre"
};

export interface ServiceRequest {
  id: string;
  reference: string;
  channel: ServiceRequestChannel;
  actorId: string;
  territoryId: string;
  speciesId: string;
  quantityKg: number;
  quality: CatchLine["quality"];
  intent: ServiceRequestIntent;
  status: "ouvert" | "couvert" | "clos";
  priority: Priority;
  createdAt: string;
  source: string;
  contactName?: string;
  phone?: string;
  email?: string;
  organization?: string;
}

export interface Capacity {
  id: string;
  infrastructureId: string;
  type: "glace" | "stockage" | "transport" | "transformation";
  availableQuantity: number;
  unit: string;
  validUntil: string;
  status: "disponible" | "engagee" | "indisponible";
}

export interface Opportunity {
  id: string;
  lotId: string;
  serviceRequestId: string;
  territoryId: string;
  score: number;
  reasons: string[];
  status: "detectee" | "proposee" | "engagee" | "executee";
  humanValidationRequired: boolean;
}

export interface Commitment {
  id: string;
  actorId: string;
  label: string;
  dueAt: string;
  status: ActionStatus;
  result?: string;
}

export interface HistoryEntry {
  id: string;
  at: string;
  actor: string;
  label: string;
  detail: string;
}

// Renommé Observation → Signal (Lot 1) pour aligner le vocabulaire du code
// sur celui du cahier des charges maître (§4.1 étape 1, §6) : un signal est
// le fait brut qui déclenche la boucle de coordination, avant qualification.
// Même forme qu'avant le renommage — pas de migration de données requise
// (le tenant de démonstration est régénéré, jamais persisté durablement).
export interface Signal {
  id: string;
  territoryId: string;
  actorId: string;
  createdAt: string;
  channel: "terrain" | "telephone" | "whatsapp_structure" | "poste_quai";
  category: "infrastructure" | "production" | "marche" | "qualite" | "securite" | "conformite";
  title: string;
  description: string;
  trust: TrustLevel;
  source: string;
  // Optionnel (R&D relais terrain, arbitrage CEO 13/08/2026) : nom de la
  // personne à l'origine du besoin quand elle diffère de l'acteur qui
  // saisit (`actorId`) — ex. un capitaine dont la note vocale est saisie
  // par un agent de quai. `actorId` reste l'acteur qui agit dans le
  // système (celui qui a un compte) ; `source` continue de décrire le
  // canal brut. Absent : le déclarant et le saisisseur sont la même
  // personne (cas majoritaire, aucune migration requise).
  reportedBy?: string;
}

// IncomingMessage — file de messages entrants simulés (arbitrage CEO
// 13/08/2026, gap analysis "Messages entrants"), pas une intégration
// WhatsApp/SMS/téléphonie réelle : rend visible dans le vrai Produit la
// provenance des signaux avant qu'un coordinateur les convertisse. Vit
// dans ProductState (contenu 100% simulé) plutôt que dans un repository
// séparé façon PublicRequest — cette isolation-là répond à un besoin
// précis (source externe réelle sur /solutions, /contact) qui ne
// s'applique pas ici. `reportedBy` reprend le champ déjà utilisé par
// Signal pour distinguer l'auteur apparent du message du coordinateur
// qui le convertit.
export interface IncomingMessage {
  id: string;
  channel: Signal["channel"];
  // Texte libre tel que mentionné dans le message, jamais garanti
  // correspondre à un territoire réel (même principe que
  // PublicRequest.territory) — la conversion exige un choix explicite.
  territoryHint?: string;
  reportedBy: string;
  body: string;
  receivedAt: string;
  status: "nouveau" | "converti";
}

export interface Situation {
  id: string;
  reference: string;
  signalIds: string[];
  territoryId: string;
  title: string;
  description: string;
  status: SituationStatus;
  priority: Priority;
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

export interface CoordinationSpace {
  id: string;
  situationId?: string;
  opportunityId?: string;
  title: string;
  participantIds: string[];
  objective: string;
  decision: string;
  commitments: Commitment[];
  risks: string[];
  nextReviewAt: string;
}

// Decision — objet de première classe (Lot 1, D3), pas un champ enrichi sur
// Situation : le cahier des charges maître (§4.1 étape 4) exige de tracer
// explicitement le choix humain qui suit une situation qualifiée, avant
// que des engagements ne soient créés. Un même dossier peut porter
// plusieurs décisions successives (ex. « demander une vérification » puis
// « ouvrir une coordination »).
export type DecisionType =
  | "mobiliser_capacite"
  | "ouvrir_coordination"
  | "demander_verification"
  | "informer"
  | "escalader"
  | "lancer_intervention"
  | "constituer_programme"
  | "cloturer_sans_action";

export const decisionTypeLabels: Record<DecisionType, string> = {
  mobiliser_capacite: "Mobiliser une capacité",
  ouvrir_coordination: "Ouvrir une coordination",
  demander_verification: "Demander une vérification",
  informer: "Informer",
  escalader: "Escalader",
  lancer_intervention: "Lancer une intervention",
  constituer_programme: "Constituer un programme",
  cloturer_sans_action: "Clôturer sans action"
};

export interface Decision {
  id: string;
  situationId: string;
  type: DecisionType;
  rationale: string;
  decidedByActorId: string;
  decidedAt: string;
  coordinationId?: string;
}

// Evidence — objet de première classe (Lot 1, D3), pas un champ texte sur
// Situation : le cahier des charges maître (§4.1 étape 7) exige qu'un
// engagement produise une preuve typée et réutilisable (photo, document,
// mesure, appel consigné…), pas une simple mention dans l'historique.
export type EvidenceType =
  | "confirmation"
  | "photo"
  | "document"
  | "mesure"
  | "appel_consigne"
  | "validation"
  | "bordereau";

export const evidenceTypeLabels: Record<EvidenceType, string> = {
  confirmation: "Confirmation",
  photo: "Photo",
  document: "Document",
  mesure: "Mesure",
  appel_consigne: "Appel consigné",
  validation: "Validation",
  bordereau: "Bordereau"
};

export interface Evidence {
  id: string;
  situationId: string;
  commitmentId?: string;
  type: EvidenceType;
  label: string;
  detail: string;
  recordedByActorId: string;
  recordedAt: string;
  trust: TrustLevel;
}

// Communication — objet de première classe (§5.10) reliant une situation,
// un engagement ou un acteur à un canal omnicanal. Arbitrage D5 : toute
// communication est simulée pour la V1 (`simulated: true`, littéral —
// impossible de créer une Communication non étiquetée comme telle tant que
// D5 n'est pas révisé). Aucune intégration WhatsApp/SMS/téléphonie réelle.
export type CommunicationChannel =
  | "whatsapp"
  | "telephone"
  | "sms"
  | "email"
  | "notification_produit"
  | "saisie_terrain";

export const communicationChannelLabels: Record<CommunicationChannel, string> = {
  whatsapp: "WhatsApp",
  telephone: "Téléphone",
  sms: "SMS",
  email: "E-mail",
  notification_produit: "Notification Produit",
  saisie_terrain: "Saisie terrain"
};

export type CommunicationStatus = "prepare" | "envoye" | "remis" | "lu" | "repondu" | "echec" | "relance_requise";

export const communicationStatusLabels: Record<CommunicationStatus, string> = {
  prepare: "Préparé",
  envoye: "Envoyé",
  remis: "Remis",
  lu: "Lu",
  repondu: "Répondu",
  echec: "Échec",
  relance_requise: "Relance requise"
};

export interface Communication {
  id: string;
  channel: CommunicationChannel;
  status: CommunicationStatus;
  actorId: string;
  situationId?: string;
  commitmentId?: string;
  subject: string;
  body: string;
  simulated: true;
  createdAt: string;
  updatedAt: string;
}

export interface PriceObservation {
  id: string;
  speciesId: string;
  territoryId: string;
  marketName: string;
  priceFcfaKg: number;
  observedAt: string;
  source: string;
  trust: TrustLevel;
  trend: "baisse" | "stable" | "hausse";
  flagged: boolean;
}

export interface ScarcityIndicator {
  id: string;
  speciesId: string;
  territoryId: string;
  status: "abondant" | "disponible" | "sous_tension" | "rare" | "critique" | "donnee_insuffisante";
  availableKg: number;
  requestedKg: number;
  reasons: string[];
  trust: TrustLevel;
}

export interface SustainabilityAssessment {
  id: string;
  lotId: string;
  provenanceComplete: boolean;
  practice: string;
  zone: string;
  status: "favorable" | "vigilance" | "incomplet";
  reasons: string[];
  recommendation: string;
  trust: TrustLevel;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  territoryId: string;
  community: string;
  category: "information" | "alerte" | "opportunite" | "besoin" | "capacite" | "question" | "apprentissage";
  title: string;
  body: string;
  createdAt: string;
  status: "publie" | "signale" | "transforme";
  convertedObjectId?: string;
  comments: Array<{ id: string; authorId: string; body: string }>;
}

export interface PartnerService {
  id: string;
  organizationId: string;
  name: string;
  category: "logistique" | "froid" | "maintenance" | "financement" | "assurance";
  territoryIds: string[];
  status: "reference" | "qualifie" | "a_activer";
  trust: TrustLevel;
  activationConditions: string;
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
  status: "cadrage" | "financee" | "execution" | "terminee";
  ownerId: string;
  // budgetFcfa optionnel + budgetStatus explicite (arbitrage CEO 13/08/2026) :
  // un montant "0" ne peut jamais représenter honnêtement un budget non
  // encore chiffré (scénario Lompoul), donc le montant est absent tant
  // qu'aucune estimation n'existe plutôt que stocké comme un faux zéro.
  // "a_estimer" implique budgetFcfa absent ; "estime"/"valide" impliquent
  // budgetFcfa présent. Les 6 initiatives existantes migrent en "valide".
  budgetFcfa?: number;
  budgetStatus: "a_estimer" | "estime" | "valide";
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

export interface Report {
  id: string;
  title: string;
  territoryIds: string[];
  generatedAt: string;
  period: string;
  status: "pret" | "a_actualiser";
  metrics: Array<{ label: string; value: string; source: string; trust: TrustLevel; limit: string }>;
}

export interface Plan {
  id: string;
  name: "Public" | "Professionnel" | "Organisation" | "Territoire" | "Institution" | "Partenaire" | "Atlas Premium";
  target: string;
  capabilities: string[];
  limits: string[];
  value: string;
  onQuote: boolean;
}

export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: "demonstration" | "active" | "suspendue";
  entitlements: string[];
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
  sites: Site[];
  infrastructures: Infrastructure[];
  vessels: Vessel[];
  trips: FishingTrip[];
  species: Species[];
  landings: Landing[];
  lots: Lot[];
  serviceRequests: ServiceRequest[];
  capacities: Capacity[];
  opportunities: Opportunity[];
  signals: Signal[];
  incomingMessages: IncomingMessage[];
  situations: Situation[];
  coordinationSpaces: CoordinationSpace[];
  decisions: Decision[];
  evidences: Evidence[];
  communications: Communication[];
  priceObservations: PriceObservation[];
  scarcity: ScarcityIndicator[];
  sustainability: SustainabilityAssessment[];
  communityPosts: CommunityPost[];
  partnerServices: PartnerService[];
  initiatives: Initiative[];
  learnings: Learning[];
  reports: Report[];
  plans: Plan[];
  subscriptions: Subscription[];
  notifications: Notification[];
  audit: AuditEntry[];
}

export type Command =
  | { type: "create_signal"; actorId: string; territoryId: string; title: string; description: string; channel: Signal["channel"] }
  | { type: "convert_message_to_signal"; actorId: string; messageId: string; territoryId: string; category: Signal["category"]; title: string; description: string }
  | { type: "qualify"; situationId: string; actorId: string }
  | { type: "prioritize"; situationId: string; actorId: string }
  | { type: "coordinate"; situationId: string; actorId: string }
  | { type: "start_intervention"; situationId: string; actorId: string }
  | { type: "wait"; situationId: string; actorId: string; reason: string }
  | { type: "resume"; situationId: string; actorId: string }
  | { type: "record_result"; situationId: string; actorId: string; result: string; confirmation: string }
  | { type: "close"; situationId: string; actorId: string }
  | { type: "create_decision"; situationId: string; actorId: string; decisionType: DecisionType; rationale: string; coordinationId?: string }
  | { type: "record_evidence"; situationId: string; actorId: string; evidenceType: EvidenceType; label: string; detail: string; commitmentId?: string }
  | { type: "log_communication"; actorId: string; channel: CommunicationChannel; subject: string; body: string; situationId?: string; commitmentId?: string }
  | {
      type: "create_service_request";
      actorId: string;
      territoryId: string;
      speciesId: string;
      quantityKg: number;
      quality: CatchLine["quality"];
      intent: ServiceRequestIntent;
      channel: ServiceRequestChannel;
      contactName?: string;
      phone?: string;
      email?: string;
      organization?: string;
    }
  | {
      type: "plan_field_commitment";
      actorId: string;
      territoryId: string;
      title: string;
      objective: string;
      dueAt: string;
      notes?: string;
      situationId?: string;
    }
  | { type: "announce_return"; tripId: string; actorId: string }
  | { type: "confirm_arrival"; tripId: string; actorId: string }
  | { type: "record_landing"; tripId: string; actorId: string }
  | { type: "confirm_weighing"; landingId: string; actorId: string }
  | { type: "create_lots"; landingId: string; actorId: string }
  | { type: "accept_opportunity"; opportunityId: string; actorId: string }
  | { type: "complete_logistics"; opportunityId: string; actorId: string }
  | { type: "create_community_post"; actorId: string; territoryId: string; category: CommunityPost["category"]; title: string; body: string }
  | { type: "convert_post"; postId: string; actorId: string }
  | { type: "flag_price"; priceId: string; actorId: string }
  | {
      type: "create_initiative";
      actorId: string;
      title: string;
      objective: string;
      budgetFcfa: number;
      serviceRequestIds: string[];
    }
  | { type: "reset_demo"; actorId: string };

export type CommandInput = Command extends infer Item
  ? Item extends { actorId: string }
    ? Omit<Item, "actorId">
    : never
  : never;
