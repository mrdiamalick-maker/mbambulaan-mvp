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
  // Gap analysis "adhérent / non-adhérent" (arbitrage CEO 2026-08-15) :
  // distinction posée dès maintenant dans le modèle pour un futur moteur de
  // rapprochement qui priorisera/filtrera selon ce statut — aucun moteur de
  // ce type n'existe aujourd'hui (Opportunity.score/reasons restent des
  // données de démonstration figées), donc ce champ n'a delibérément aucun
  // consommateur pour l'instant : pas de badge, pas de filtre, pas d'effet
  // sur les commandes existantes. Absent = "libre" (comportement actuel,
  // gratuit) partout où le champ n'est pas renseigné. Niveau Organisation
  // (réutilise l'ancrage déjà existant de Subscription/Plan) plutôt
  // qu'Acteur — un éventuel besoin d'exception individuelle (un acteur
  // isolé au sein d'une organisation par ailleurs libre/adhérente) resterait
  // à modéliser séparément si un vrai cas apparaît, volontairement pas
  // anticipé ici.
  networkStatus?: "libre" | "adherent";
  // verificationStatus (LOT 7, mandat "Actor & Trust Network") —
  // explicable, jamais un score : "declaree" est le statut d'une
  // organisation candidate créée via qualify_signal_as_network_capacity
  // (mandat §13, jamais "verifiee" à la création). Absent = les
  // organisations existantes du Demo World (déjà connues/documentées
  // avant ce lot) — pas de migration rétroactive fabriquée.
  verificationStatus?: "declaree" | "documentee" | "verifiee";
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
//
// disposition (LOT 0.1, mandat "aligner le Core métier avec le Blueprint
// V1") : un Signal n'implique plus automatiquement une Situation — cette
// disposition trace explicitement où en est sa qualification, sans
// obligation de passer par toutes les étapes ni dans un ordre fixe.
// "nouveau" par défaut à la création. Toujours présent (pas optionnel) :
// un signal sans disposition connue serait un état ambigu que le modèle
// ne doit jamais représenter.
export type SignalDisposition =
  | "nouveau"
  | "qualifie"
  | "rattache_finding"
  | "oriente_situation"
  | "en_observation"
  | "ecarte";

export const signalDispositionLabels: Record<SignalDisposition, string> = {
  nouveau: "Nouveau",
  qualifie: "Qualifié",
  rattache_finding: "Rattaché à un constat",
  oriente_situation: "Orienté vers une situation",
  en_observation: "Maintenu en observation",
  ecarte: "Écarté"
};

// SignalSourceRef — référence typée vers l'objet brut à l'origine d'un
// Signal (P2.1-A, mandat "Intake Traceability & Data Access Foundation").
// Même esprit que KnowledgeSourceRef ci-dessous — traçabilité structurée,
// jamais du texte libre — mais un type volontairement distinct :
// KnowledgeSourceRef se résout contre les tableaux de ProductState
// (resolveKnowledgeSourceRef, knowledge-pipeline.ts), alors que
// PublicRequest/PublicContribution vivent hors ProductState (persistance
// isolée, cf. server/public-repository.ts) — un objectType commun aurait
// laissé croire à une résolution possible qui n'existe pas ici. "direct"
// couvre un Signal saisi sans intake préalable (create_signal appelé
// directement par un rôle terrain/coordination, hors message/
// PublicRequest/PublicContribution) — pas d'objectId, il n'existe aucun
// objet source distinct du Signal lui-même. Optionnel sur Signal
// (ci-dessous) : additif, aucune migration des signaux déjà créés
// (Demo World compris) qui restent sans sourceRef plutôt que d'en
// fabriquer un rétroactivement.
export type SignalSourceRef =
  | { objectType: "incoming_message"; objectId: string }
  | { objectType: "public_request"; objectId: string }
  | { objectType: "public_contribution"; objectId: string }
  | { objectType: "direct" };

export interface Signal {
  id: string;
  // Optionnel (LOT 0.4, mandat "Public Request → Core Signal") : une
  // PublicRequest peut déclarer un territoire en texte libre qui ne
  // résout à aucun Territory réel (même principe qu'IncomingMessage.
  // territoryHint) — absent plutôt que fabriqué. Tous les signaux du
  // Produit (create_signal, convert_message_to_signal, événements,
  // jeu de démonstration) continuent de renseigner un territoire réel ;
  // seule la voie Public peut laisser ce champ vide.
  territoryId?: string;
  actorId: string;
  createdAt: string;
  // "espace_public" (LOT 0.4) : un signal issu d'une PublicRequest
  // (web/partenaire/événement) n'a pas d'équivalent honnête parmi les 4
  // canaux terrain existants — les y rattacher aurait fabriqué une
  // provenance de canal inexacte.
  channel: "terrain" | "telephone" | "whatsapp_structure" | "poste_quai" | "espace_public";
  // "autre" (LOT 6, micro-correctif final "ne plus fabriquer
  // infrastructure") : valeur neutre pour les signaux dont la catégorie
  // n'est pas réellement déterminable à la création (create_signal sans
  // catégorie explicite) — jamais déduite de mots-clés libres. Les
  // signaux déjà explicitement catégorisés (convert_message_to_signal,
  // Demo World, terrain qualifié) conservent leur catégorie réelle.
  category: "infrastructure" | "production" | "marche" | "qualite" | "securite" | "conformite" | "autre";
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
  disposition: SignalDisposition;
  // Note libre associée à la disposition courante (motif d'écartement,
  // référence du Finding de rattachement...) — optionnelle, jamais
  // fabriquée si l'acteur n'en a saisi aucune.
  dispositionNote?: string;
  // sourceRef (P2.1-A) — d'où vient réellement ce Signal (message entrant
  // converti, PublicRequest/PublicContribution, ou saisie directe).
  // Renseigné par applySignalOnlyCreation/applyMessageToSignalOnly
  // (rules.ts), jamais par l'appelant directement au-delà du sourceRef
  // qu'il transmet dans la commande create_signal. Optionnel : les
  // signaux créés avant ce lot (Demo World compris) n'en portent pas.
  sourceRef?: SignalSourceRef;
}

// Étiquettes lisibles pour Signal["category"] — réutilisées par
// FieldMissionForm (LOT 3, micro-correctif "catégorie du signal terrain")
// pour choisir explicitement le sujet métier d'une mission plutôt que de
// le déduire arbitrairement à l'enregistrement d'une observation. N'existait
// jusqu'ici qu'en local dans CoordinationWorkspace.tsx (non réutilisable) —
// export centralisé plutôt que dupliqué.
export const signalCategoryLabels: Record<Signal["category"], string> = {
  infrastructure: "Infrastructure",
  production: "Production",
  marche: "Marché",
  qualite: "Qualité",
  securite: "Sécurité",
  conformite: "Conformité",
  autre: "Autre"
};

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
  // Traçabilité inverse (P2.1-A, mandat "Intake Traceability & Data
  // Access Foundation") — renseignés uniquement par applyMessageToSignalOnly
  // (rules.ts) au moment de la conversion, jamais à la création du
  // message. Additifs : un message "converti" créé avant ce lot reste
  // sans ces trois champs plutôt que d'en fabriquer une valeur rétroactive
  // — status === "converti" seul reste la source de vérité historique.
  resultingSignalId?: string;
  convertedAt?: string;
  convertedByActorId?: string;
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
  // Optionnel (LOT 0.1/0.2, mandat "aligner le Core métier avec le
  // Blueprint V1") : quand une Situation naît d'une promotion explicite
  // de Finding (promote_finding_to_situation) plutôt que du wrapper
  // legacy Signal+Situation, ce champ trace la compréhension qui l'a
  // justifiée — répond à "pourquoi cette Situation existe-t-elle ?" au
  // même titre que signalIds. Absent pour les situations issues d'un
  // wrapper legacy (report_signal_and_open_situation,
  // convert_message_to_signal_and_situation, convert_post) : leur
  // origine reste tracée via signalIds seul, comme avant ce lot.
  findingId?: string;
  history: HistoryEntry[];
}

// Finding (LOT 0.2, mandat "aligner le Core métier avec le Blueprint V1") —
// ce que Mbàmbulaan pense avoir compris à partir d'un ou plusieurs éléments
// de connaissance (Signal, Situation, ServiceRequest, Evidence...). Ni un
// Signal brut, ni une décision, ni nécessairement une Situation : un palier
// intermédiaire de compréhension, explicable et traçable, avant toute
// promotion vers l'action.
export type FindingType =
  | "recurrence"
  | "contradiction"
  | "corroboration_gap"
  | "infrastructure_fragile_active_site"
  | "retour_attendu_depasse"
  | "knowledge_gap"
  | "autre";

export const findingTypeLabels: Record<FindingType, string> = {
  recurrence: "Récurrence",
  contradiction: "Contradiction entre sources",
  corroboration_gap: "Déficit de corroboration",
  infrastructure_fragile_active_site: "Infrastructure fragilisée sur site actif",
  retour_attendu_depasse: "Retour attendu dépassé",
  knowledge_gap: "Connaissance manquante",
  autre: "Autre"
};

// Provenance de l'interprétation — l'architecture reste extensible à un
// futur moteur statistique ou ML sans qu'aucun des deux n'existe dans ce
// lot (aucune IA introduite ici, cf. mandat §6).
export type FindingSourceKind = "rule" | "human" | "llm" | "statistical" | "ml";

export type FindingStatus = "proposed" | "under_review" | "confirmed" | "rejected" | "superseded";

// Raison humaine d'un rejet — LOT 8 (mandat "Maritime Intelligence
// Engine", §31) : quand un coordinateur rejette une détection ou un
// constat proposé, une raison courte est conservée comme trace pour une
// amélioration future — jamais pour entraîner automatiquement quoi que ce
// soit (aucun apprentissage automatique dans ce lot, cf. §26/§28-30).
export type FindingRejectionReason =
  | "faux_positif"
  | "information_deja_connue"
  | "donnee_trop_ancienne"
  | "contexte_non_pertinent"
  | "doublon";

export const findingRejectionReasonLabels: Record<FindingRejectionReason, string> = {
  faux_positif: "Faux positif",
  information_deja_connue: "Information déjà connue",
  donnee_trop_ancienne: "Donnée trop ancienne",
  contexte_non_pertinent: "Contexte non pertinent",
  doublon: "Doublon"
};

export const findingStatusLabels: Record<FindingStatus, string> = {
  proposed: "Proposé",
  under_review: "En cours de revue",
  confirmed: "Confirmé",
  rejected: "Rejeté",
  superseded: "Remplacé"
};

// Référence typée vers un objet source — même esprit que
// SignalCrossingSourceRef (src/domain/signal-crossing.ts), généralisée
// pour couvrir toutes les origines possibles d'un Finding, d'un
// CollectiveNeed ou d'une ProgramOpportunity plutôt que de dupliquer un
// type quasi identique pour chacun.
export type KnowledgeSourceRef =
  | { objectType: "signal"; objectId: string }
  | { objectType: "situation"; objectId: string }
  | { objectType: "finding"; objectId: string }
  | { objectType: "service_request"; objectId: string }
  | { objectType: "evidence"; objectId: string }
  | { objectType: "infrastructure"; objectId: string }
  | { objectType: "vessel"; objectId: string }
  | { objectType: "fishing_trip"; objectId: string }
  | { objectType: "landing"; objectId: string }
  | { objectType: "capacity"; objectId: string }
  | { objectType: "territory"; objectId: string }
  | { objectType: "site"; objectId: string };

export interface Finding {
  id: string;
  type: FindingType;
  title: string;
  // "statement" du mandat (§6) : l'affirmation de compréhension elle-même,
  // distincte de l'explication qui la justifie.
  statement: string;
  territoryIds: string[];
  sourceRefs: KnowledgeSourceRef[];
  explanation: string;
  trust: TrustLevel;
  status: FindingStatus;
  provenance: FindingSourceKind;
  // Renseignés uniquement quand provenance === "rule" — trace la règle
  // déterministe de src/domain/signal-crossing.ts à l'origine du constat
  // (mandat §7 : faire converger Signal Crossing vers Finding sans perdre
  // ruleId/version).
  ruleId?: string;
  ruleVersion?: number;
  nextStep: string;
  createdAt: string;
  createdByActorId?: string;
  reviewedByActorId?: string;
  reviewedAt?: string;
  reviewNote?: string;
  // rejectionReason (LOT 8, mandat §31) : renseigné uniquement quand
  // status === "rejected" et que le rejet provient d'une décision humaine
  // sur une détection/constat proposé — jamais déduit, jamais obligatoire
  // pour les rejets antérieurs à ce lot.
  rejectionReason?: FindingRejectionReason;
  // detectionKey (LOT 8, mandat §6 "idempotence des détections") — clé
  // stable identifiant l'occurrence détectée par une règle (ruleId +
  // version + objets sources), renseignée uniquement quand ce Finding
  // provient d'une détection (cf. signal-crossing.ts,
  // signalCrossingAlertToFindingDraft). Un Finding né d'une observation
  // humaine directe (record_finding sans détection) n'en porte pas — ce
  // n'est pas un identifiant technique universel, seulement le garde-fou
  // qui empêche une même occurrence réelle de produire deux Finding.
  detectionKey?: string;
  // Correction Product Review (LOT 0, 2026-09-01) : une Situation est une
  // conséquence opérationnelle d'un Finding confirmé, elle ne le
  // remplace pas — "superseded" reste réservé au cas où un Finding est
  // effectivement remplacé/corrigé par un autre Finding (cf.
  // update_finding_status). Ce champ trace la promotion sans dupliquer
  // l'information déjà portée par Situation.findingId (relation
  // bidirectionnelle légère, pas un objet de liaison séparé) et sert de
  // garde-fou contre une double promotion du même Finding.
  promotedToSituationId?: string;
}

// CollectiveNeed (LOT 0.3) — un problème partagé ou récurrent qui dépasse
// un besoin individuel et mérite une qualification collective. N'a besoin
// ni de budget, ni de partenaire, ni de solution prédéfinie : ce n'est pas
// encore un Programme (mandat §9).
export type CollectiveNeedStatus = "emerging" | "qualifying" | "qualified" | "not_confirmed" | "converted" | "monitored";

export const collectiveNeedStatusLabels: Record<CollectiveNeedStatus, string> = {
  emerging: "Émergent",
  qualifying: "En cours de qualification",
  qualified: "Qualifié",
  not_confirmed: "Non confirmé",
  converted: "Converti en opportunité de programme",
  monitored: "Maintenu sous observation"
};

export interface CollectiveNeed {
  id: string;
  title: string;
  territoryIds: string[];
  // Population ou acteurs concernés — texte libre volontairement : un
  // décompte fabriqué (ex. "1 240 pêcheurs") serait une fausse précision
  // que rien dans le modèle ne permet de vérifier à ce stade.
  affectedPopulation: string;
  sourceRefs: KnowledgeSourceRef[];
  consequences: string[];
  hypotheses: string[];
  // Connaissances manquantes — texte libre (mandat §10 : "un Knowledge Gap
  // peut être une classification légère compatible avec le modèle").
  knowledgeGaps: string[];
  // Renseigné seulement quand une connaissance manquante a été formalisée
  // en Finding de type "knowledge_gap" — lien plus fort que le texte libre
  // ci-dessus, jamais obligatoire.
  knowledgeGapFindingIds?: string[];
  status: CollectiveNeedStatus;
  createdAt: string;
  history: HistoryEntry[];
}

// ProgramOpportunity (LOT 0.3) — un CollectiveNeed suffisamment qualifié
// pour envisager une intervention structurée de développement. Distinct de
// l'Opportunity existante (matching économique lot ↔ demande) : ne la
// remplace pas, ne la généralise pas (mandat §11, contrainte explicite).
export type ProgramOpportunityStatus =
  | "detected"
  | "qualifying"
  | "qualified"
  | "designing"
  | "converted_to_program"
  | "rejected"
  | "paused";

export const programOpportunityStatusLabels: Record<ProgramOpportunityStatus, string> = {
  detected: "Détectée",
  qualifying: "En cours de qualification",
  qualified: "Qualifiée",
  designing: "En conception",
  converted_to_program: "Convertie en programme",
  rejected: "Rejetée",
  paused: "En pause"
};

export type ProgramOpportunityMaturity = "faible" | "moyenne" | "elevee";

export const programOpportunityMaturityLabels: Record<ProgramOpportunityMaturity, string> = {
  faible: "Faible",
  moyenne: "Moyenne",
  elevee: "Élevée"
};

export interface ProgramOpportunity {
  id: string;
  collectiveNeedId: string;
  problem: string;
  justification: string;
  territoryIds: string[];
  potentialBeneficiaries: string;
  evidenceRefs: KnowledgeSourceRef[];
  hypotheses: string[];
  knowledgeGaps: string[];
  possibleInterventions: string[];
  desiredOutcomes: string[];
  possibleIndicators: Array<{ label: string; unit: string }>;
  maturity: ProgramOpportunityMaturity;
  status: ProgramOpportunityStatus;
  createdAt: string;
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

// situationId optionnel (LOT 3, mandat "Terrain — observer, vérifier et
// fiabiliser la réalité", §13 : "réutiliser l'objet Evidence, ne pas créer
// FieldEvidence") : une preuve peut désormais naître d'une Observation de
// mission terrain plutôt que d'une Situation — missionId/observationId
// portent cette origine, jamais les deux origines à la fois en pratique
// (une Evidence de mission n'a pas de Situation, et réciproquement),
// mais rien ne l'interdit structurellement pour ne pas fermer une
// convergence future légitime (une mission menée en réponse directe à une
// Situation, par ex.).
export interface Evidence {
  id: string;
  situationId?: string;
  commitmentId?: string;
  missionId?: string;
  observationId?: string;
  // LOT 4 (mandat "de l'action à la valeur démontrable", §19 : "Result,
  // Outcome et Impact doivent être traçables") — additifs, même
  // discipline que missionId/observationId : une Evidence créée en même
  // temps qu'un Result/Outcome/ImpactEvidence porte cette origine, jamais
  // plus d'une à la fois en pratique, mais rien ne l'interdit
  // structurellement.
  resultId?: string;
  outcomeId?: string;
  impactId?: string;
  type: EvidenceType;
  label: string;
  detail: string;
  recordedByActorId: string;
  recordedAt: string;
  trust: TrustLevel;
}

// FieldMission / Observation (LOT 3, mandat "Terrain — observer, vérifier
// et fiabiliser la réalité") — troisième capacité fondamentale : Mbàmbulaan
// peut aller vérifier la réalité, pas seulement attendre qu'elle lui soit
// signalée. Distinct de Commitment (mandat §8, "Mission ≠ Commitment") :
// la Mission décrit LE TRAVAIL terrain (quoi vérifier, pourquoi, où),
// jamais l'engagement d'un acteur à le faire — create_field_mission ne
// crée donc aucun Commitment automatiquement, contrairement à l'ancien
// plan_field_commitment (Ministry, conservé tel quel pour compatibilité,
// cf. commentaire sur bridgeFieldCommitment).
export type FieldMissionStatus = "a_preparer" | "planifiee" | "en_cours" | "realisee" | "annulee";

export const fieldMissionStatusLabels: Record<FieldMissionStatus, string> = {
  a_preparer: "À préparer",
  planifiee: "Planifiée",
  en_cours: "En cours",
  realisee: "Réalisée",
  annulee: "Annulée"
};

export interface FieldMission {
  id: string;
  title: string;
  objective: string;
  territoryIds: string[];
  // "raison / source" (mandat §7) — pourquoi cette mission existe. Texte
  // libre : la traçabilité structurée réelle vit dans les 4 champs de
  // référence ci-dessous, ce champ reste la phrase lisible par un humain.
  reason: string;
  responsibleActorId?: string;
  dueAt?: string;
  status: FieldMissionStatus;
  // Micro-correctif Product (post-LOT 3, "catégorie du Signal terrain") :
  // sujet métier de la mission, choisi explicitement à la création plutôt
  // que déduit arbitrairement lors de chaque observation — Terrain est
  // transversal, "infrastructure" ne peut pas rester la seule valeur
  // possible. Réutilise la taxonomie Signal["category"] existante (pas de
  // nouvelle taxonomie) ; toute Observation de cette mission produit un
  // Signal qui reprend telle quelle cette catégorie (record_observation
  // ne la déduit jamais).
  signalCategory: Signal["category"];
  // Consignes d'observation (mandat §4 : "axes d'observation, pas des
  // conclusions préétablies") — texte libre, un axe par entrée.
  observationPoints: string[];
  // Traçabilité vers ce qui a justifié la mission — tous optionnels,
  // aucun n'implique les autres (une mission peut naître d'un seul
  // Knowledge Gap, sans CollectiveNeed ni Situation, par ex.).
  knowledgeGapFindingId?: string;
  findingId?: string;
  collectiveNeedId?: string;
  situationId?: string;
  createdAt: string;
  createdByActorId: string;
  history: HistoryEntry[];
}

// Nature de l'appréciation d'une Observation vis-à-vis de ce qu'elle
// vérifie (mandat §10/§11) — jamais un score, une catégorisation qualitative
// assumée par l'auteur de l'observation lui-même.
export type ObservationNature = "confirme" | "nuance" | "contredit" | "insuffisant";

export const observationNatureLabels: Record<ObservationNature, string> = {
  confirme: "Confirme",
  nuance: "Nuance",
  contredit: "Contredit",
  insuffisant: "Insuffisant pour conclure"
};

// Observation — l'entrée la plus légère possible pour représenter "ce
// qu'un agent/relais autorisé a effectivement constaté dans le cadre
// d'une mission" (mandat §11). Jamais transformée automatiquement en
// Finding — record_observation (knowledge-pipeline.ts) ne touche jamais
// state.findings, cf. TEST K du mandat ("le Knowledge Gap reste ouvert
// après Observation sauf transition explicite").
export interface Observation {
  id: string;
  missionId: string;
  territoryId: string;
  authorActorId: string;
  createdAt: string;
  content: string;
  nature: ObservationNature;
  trust: TrustLevel;
  // Traçabilité systématique (mandat §12 : "Observation → Signal terrain
  // → qualification" — jamais de Signal orphelin d'Observation, ni
  // d'Observation qui ne produise pas de Signal canonique).
  signalId: string;
  evidenceId?: string;
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
  // sourceRef/updatedAt (LOT 7, mandat "Actor & Trust Network", §21/§22)
  // — additifs. sourceRef trace la provenance réelle d'une capacité issue
  // d'une qualification (qualify_signal_as_network_capacity) : jamais un
  // texte copié puis l'origine perdue. Absent pour les services déjà
  // référencés dans le Demo World avant ce lot (documentation éditoriale
  // directe, pas de Signal source). updatedAt (fraîcheur) reste optionnel
  // — pas de règle temporelle arbitraire globale si le métier ne la
  // justifie pas ; "expiree" (TrustLevel) reste le signal fort quand
  // pertinent plutôt qu'un calcul de péremption inventé ici.
  sourceRef?: { objectType: "signal"; objectId: string };
  updatedAt?: string;
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
  // Traçabilité de l'origine (LOT 0.3, mandat "aligner le Core métier avec
  // le Blueprint V1") : au plus une des deux, selon la voie de création
  // (cf. create_initiative, rules.ts). serviceRequestIds n'existait pas
  // avant ce lot — create_initiative marquait les demandes "couvert" sans
  // garder trace du regroupement lui-même une fois le Programme créé ;
  // additif, ne migre aucune donnée existante.
  programOpportunityId?: string;
  serviceRequestIds?: string[];
}

// Impact & Learning (LOT 4, mandat "de l'action à la valeur démontrable")
// — quatrième capacité fondamentale : Mbàmbulaan distingue explicitement
// ce qui a été FAIT (Result), ce qui a CHANGÉ (Outcome) et l'EFFET plus
// large ou durable (Impact), sans jamais transformer automatiquement
// l'un en l'autre (mandat §2 : "une activité réalisée n'est pas un
// Outcome. Un Outcome n'est pas automatiquement un Impact.").
//
// Result — objet factuel représentant ce qui a été réalisé/produit
// (mandat §6). sourceRef restreint à situation/initiative (les 2 sources
// couvertes par ce lot — Situation via record_result, Initiative via
// create_result) plutôt que le KnowledgeSourceRef générique : un Result
// répond à "quel objet a produit ce fait", pas "quelles sources
// documentent une affirmation" (KnowledgeSourceRef reste réservé à ce
// second usage, Finding/CollectiveNeed/ProgramOpportunity/Learning).
export interface Result {
  id: string;
  title: string;
  description: string;
  sourceRef: { objectType: "situation" | "initiative"; objectId: string };
  territoryIds: string[];
  recordedAt: string;
  recordedByActorId: string;
  // Références vers des Evidence réelles (Evidence.id) — un Result peut
  // exister sans preuve jointe (ex. Result canonique produit par
  // record_result lorsqu'aucune Evidence supplémentaire n'a été saisie),
  // mais jamais en dupliquant Evidence lui-même.
  evidenceRefs: string[];
  trust: TrustLevel;
}

// Attribution (mandat §3) — jamais transformer une corrélation en
// causalité : 3 niveaux explicites, aucun état par défaut implicite qui
// laisserait croire à un lien plus fort que ce qui est documenté.
export type AttributionLevel = "directe" | "contributive" | "non_etablie";

export const attributionLevelLabels: Record<AttributionLevel, string> = {
  directe: "Directe",
  contributive: "Partielle / contributive",
  non_etablie: "Corrélation / non établie"
};

// Outcome — le changement opérationnel observé après l'action (mandat
// §6). Exige toujours au moins un Result source (TEST C) et une
// attribution explicite (TEST D) — jamais déduits, toujours saisis par un
// humain (record_outcome). baseline reste un texte libre plutôt qu'une
// structure : "valeur d'indicateur existante, observation avant
// intervention, état initial documenté, ou absence explicite de
// baseline" (mandat §20) — 4 formes différentes qu'un champ texte simple
// couvre sans sur-modéliser, l'absence (undefined) restant honnêtement
// affichable ("Baseline insuffisante...").
export interface Outcome {
  id: string;
  title: string;
  statement: string;
  territoryIds: string[];
  sourceResultIds: string[];
  baseline?: string;
  observedAt: string;
  evidenceRefs: string[];
  trust: TrustLevel;
  attribution: AttributionLevel;
  // Obligatoire si attribution === "directe" (mandat §12, TEST E — validé
  // dans le domaine, pas au niveau du type : la contrainte dépend d'une
  // valeur, pas de la forme). Recommandé mais non forcé pour les 2 autres
  // niveaux — "limits" porte alors les facteurs externes/limites.
  attributionJustification?: string;
  limits?: string;
  createdByActorId: string;
  createdAt: string;
}

// Statut d'un Impact (mandat §6/§13) — "à mesurer" est un état honnête et
// attendu pour la plupart des scénarios V1, jamais un échec à masquer.
export type ImpactStatus = "a_mesurer" | "partiellement_documente" | "documente";

export const impactStatusLabels: Record<ImpactStatus, string> = {
  a_mesurer: "À mesurer",
  partiellement_documente: "Partiellement documenté",
  documente: "Documenté"
};

// ImpactEvidence (mandat §6, "structure légère" préférée à un Impact
// national complexe) — jamais créé automatiquement par record_outcome
// (mandat §2/§13, TEST F : "Outcome ne crée aucun Impact automatiquement").
// simulated (mandat §13) : si le Demo World devait un jour présenter une
// démonstration d'impact simulée, elle doit être explicitement taguée —
// absent/false pour toute donnée réelle du modèle.
export interface ImpactEvidence {
  id: string;
  title: string;
  statement: string;
  outcomeId: string;
  territoryIds: string[];
  attribution: AttributionLevel;
  // Micro-correctif Product (post-LOT 4, "attribution directe doit être
  // justifiée") : même discipline que Outcome.attributionJustification —
  // obligatoire si attribution === "directe" (validé dans le domaine),
  // facultatif sinon (limits reste le champ encouragé pour
  // contributive/non_etablie).
  attributionJustification?: string;
  status: ImpactStatus;
  evidenceRefs: string[];
  period?: string;
  limits?: string;
  simulated?: boolean;
  createdByActorId: string;
  createdAt: string;
}

// Statut d'un Learning (mandat §14 : "proposé" / "validé" — éventuel,
// jamais un moteur de validation automatique).
export type LearningStatus = "propose" | "valide";

export const learningStatusLabels: Record<LearningStatus, string> = {
  propose: "Proposé",
  valide: "Validé"
};

// Learning — étendu en place (LOT 4, mandat "faire évoluer l'objet
// existant au lieu de créer LearningV2") plutôt que remplacé : situationId
// reste la source historique (13 apprentissages du Demo World), désormais
// optionnel puisqu'un Learning peut aussi naître d'une Initiative, d'un
// Outcome ou d'une Mission/Observation terrain (mandat §14) — au moins
// une source réelle est exigée par record_learning (TEST I, "Learning
// conserve ses sources"), jamais un Learning orphelin. Jamais généré
// automatiquement par le système (mandat §14, TEST H) : record_learning
// est toujours un geste humain explicite.
export interface Learning {
  id: string;
  situationId?: string;
  initiativeId?: string;
  outcomeId?: string;
  fieldMissionId?: string;
  title: string;
  summary: string;
  // "contexte" (mandat §14) — le cadre dans lequel l'apprentissage a été
  // identifié, texte libre distinct du résumé lui-même.
  context?: string;
  reusableIn: string[];
  // "fondement/source" (mandat §14) — réutilise KnowledgeSourceRef plutôt
  // qu'un nouveau type : même besoin que Finding.sourceRefs ("sur quoi
  // repose cette affirmation"), pas "quel objet l'a produite" (porté par
  // les 4 champs de traçabilité ci-dessus).
  sourceRefs?: KnowledgeSourceRef[];
  createdByActorId?: string;
  createdAt?: string;
  status?: LearningStatus;
  // relatedRuleId (LOT 8, mandat §26 "Learning → Rules") : lien
  // documentaire optionnel vers une règle de src/domain/signal-crossing.ts
  // qu'un apprentissage suggère de revoir (ex. "cette détection produit
  // trop de faux positifs dans ce contexte") — jamais un mécanisme qui
  // modifie la règle automatiquement, seulement une trace exploitable par
  // un humain qui déciderait plus tard de l'ajuster.
  relatedRuleId?: string;
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
  // Finding/CollectiveNeed/ProgramOpportunity (LOT 0.2/0.3) — nouveaux
  // paliers du pipeline de connaissance, entre le Signal brut et la
  // Situation/le Programme. Additifs : aucune migration des tableaux
  // existants.
  findings: Finding[];
  collectiveNeeds: CollectiveNeed[];
  programOpportunities: ProgramOpportunity[];
  // FieldMission/Observation (LOT 3) — additifs, même discipline que
  // findings/collectiveNeeds/programOpportunities ci-dessus.
  fieldMissions: FieldMission[];
  observations: Observation[];
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
  // Result/Outcome/ImpactEvidence (LOT 4, mandat "de l'action à la valeur
  // démontrable") — additifs, même discipline que
  // fieldMissions/observations ci-dessus. Situation.result/confirmation
  // restent inchangés (mandat §7, "pas de migration destructive") ;
  // record_result produit désormais AUSSI un Result canonique ici.
  results: Result[];
  outcomes: Outcome[];
  impactEvidences: ImpactEvidence[];
  reports: Report[];
  plans: Plan[];
  subscriptions: Subscription[];
  notifications: Notification[];
  audit: AuditEntry[];
}

export type Command =
  // territoryId optionnel (LOT 0.4, mandat "Public Request → Core Signal") :
  // seul create_signal (Signal seul) peut laisser le territoire non
  // résolu — le wrapper report_signal_and_open_situation, qui construit
  // une Situation, continue d'en exiger un (Situation.territoryId reste
  // obligatoire, non modifié).
  // category optionnelle (LOT 6, micro-correctif "ne plus fabriquer
  // infrastructure") : renseignée seulement quand réellement déterminable
  // par l'appelant (jamais déduite de mots-clés libres côté rules.ts) —
  // repli sur "autre" si absente, cf. applySignalOnlyCreation.
  // sourceRef optionnel (P2.1-A, mandat "Intake Traceability & Data
  // Access Foundation") : absent pour une saisie directe (repli "direct"
  // dans applySignalOnlyCreation, rules.ts) — renseigné explicitement par
  // les ponts Public (public-request-signal-bridge.ts,
  // public-contribution-signal-bridge.ts) pour tracer la PublicRequest/
  // PublicContribution d'origine. convert_message_to_signal n'a pas
  // besoin de son propre sourceRef : il porte déjà messageId, dont
  // applyMessageToSignalOnly dérive directement { objectType:
  // "incoming_message", objectId: messageId }.
  | { type: "create_signal"; actorId: string; territoryId?: string; title: string; description: string; channel: Signal["channel"]; category?: Signal["category"]; sourceRef?: SignalSourceRef }
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
      // onBehalfOfActorId (gap analysis "relais généralisé", arbitrage CEO
      // 2026-08-15, tranche 1/N — accept_opportunity/complete_logistics
      // uniquement dans ce lot) : référence réelle vers un Actor déjà doté
      // d'un compte, mais qui n'utilise pas l'interface à ce moment précis
      // — distinct de Signal.reportedBy (texte libre, pour un déclarant qui
      // peut ne pas exister comme Actor). actorId reste épinglé côté
      // serveur à la session qui exécute (src/app/api/actions/route.ts) et
      // continue de désigner le relais, jamais le bénéficiaire.
  | { type: "accept_opportunity"; opportunityId: string; actorId: string; onBehalfOfActorId?: string }
  | { type: "complete_logistics"; opportunityId: string; actorId: string; onBehalfOfActorId?: string }
  | { type: "create_community_post"; actorId: string; territoryId: string; category: CommunityPost["category"]; title: string; body: string }
  // convert_post reste couplé Signal+Situation (chemin legacy préservé
  // tel quel, LOT 0.1) : CommunityPost.convertedObjectId pointe déjà vers
  // une Situation réelle et alimente le bloc "pont public ↔ privé" de
  // l'Espace État (déjà livré, déjà vérifié) — le découpler aurait cassé
  // cette traçabilité sans bénéfice pour ce lot. Documenté explicitement
  // ici plutôt que découplé silencieusement.
  | { type: "convert_post"; postId: string; actorId: string }
  | { type: "flag_price"; priceId: string; actorId: string }
  // create_initiative (LOT 0.3, mandat §12/§13) : XOR entre les deux voies
  // de création plutôt que 2 commandes séparées — un seul objet technique
  // (Initiative), une seule commande de création, cohérent avec "ne
  // multiplie pas les abstractions sans nécessité". serviceRequestIds =
  // voie legacy (regroupement direct, comportement corrigé : budget
  // optionnel, plus d'auto-couverture) ; programOpportunityId = voie
  // canonique (conversion explicite depuis une ProgramOpportunity
  // qualifiée). budgetFcfa désormais optionnel (§13 : le cadrage n'exige
  // pas un budget chiffré) ; budgetStatus explicite, "a_estimer" par
  // défaut si budgetFcfa est absent.
  | {
      type: "create_initiative";
      actorId: string;
      title: string;
      objective: string;
      budgetFcfa?: number;
      budgetStatus?: "a_estimer" | "estime" | "valide";
      serviceRequestIds?: string[];
      programOpportunityId?: string;
    }
  // --- LOT 0 — pipeline de connaissance (Signal → Finding → Situation /
  // CollectiveNeed → ProgramOpportunity → Initiative), mandat "aligner le
  // Core métier avec le Blueprint V1" ---
  //
  // report_signal_and_open_situation / convert_message_to_signal_and_situation
  // (wrappers legacy explicites, §5 du mandat : "les parcours qui
  // expriment réellement l'intention de créer directement une Situation
  // peuvent disposer d'un wrapper") — même effet net que l'ancien
  // create_signal / convert_message_to_signal couplés, utilisés par les
  // 3 parcours UI/bridge qui promettent déjà cette immédiateté à
  // l'utilisateur (TerrainCaptainView, CoordinatorSignalForm,
  // bridgeVigilanceSignal côté Ministère).
  | { type: "report_signal_and_open_situation"; actorId: string; territoryId: string; title: string; description: string; channel: Signal["channel"] }
  | { type: "convert_message_to_signal_and_situation"; actorId: string; messageId: string; territoryId: string; category: Signal["category"]; title: string; description: string }
  // update_signal_disposition consolide qualifier/écarter/maintenir en
  // observation en une seule commande à transitions validées (même
  // idiome que `transitions` pour Situation, rules.ts) plutôt que 3
  // commandes quasi identiques.
  | { type: "update_signal_disposition"; signalId: string; actorId: string; disposition: Exclude<SignalDisposition, "nouveau" | "rattache_finding" | "oriente_situation">; note?: string }
  // territoryId (optionnel) : résout explicitement le territoire quand le
  // Signal n'en porte pas (voie Public, Signal.territoryId optionnel,
  // LOT 0.4) — même principe que la conversion d'IncomingMessage, qui
  // exige déjà un choix explicite plutôt qu'un territoire fabriqué.
  | { type: "promote_signal_to_situation"; signalId: string; actorId: string; territoryId?: string; title?: string; description?: string; priority?: Priority; visibility?: Visibility }
  | {
      type: "record_finding";
      actorId: string;
      findingType: FindingType;
      title: string;
      statement: string;
      territoryIds: string[];
      sourceRefs: KnowledgeSourceRef[];
      explanation: string;
      trust: TrustLevel;
      provenance: FindingSourceKind;
      nextStep: string;
      ruleId?: string;
      ruleVersion?: number;
      // detectionKey (LOT 8, mandat §6) : optionnel — un Finding humain
      // n'en a pas besoin. Quand fourni (toujours le cas pour un
      // brouillon issu de signalCrossingAlertToFindingDraft), record_finding
      // refuse de créer un second Finding pour la même occurrence déjà
      // traitée (enregistrée ou écartée) — cf. knowledge-pipeline.ts.
      detectionKey?: string;
    }
  | {
      type: "update_finding_status";
      findingId: string;
      actorId: string;
      status: Exclude<FindingStatus, "proposed">;
      note?: string;
      // rejectionReason (LOT 8, mandat §31) : significatif seulement quand
      // status === "rejected" — jamais imposé aux rejets antérieurs à ce
      // lot, jamais déduit automatiquement.
      rejectionReason?: FindingRejectionReason;
    }
  // territoryId (optionnel) : résout explicitement le territoire principal
  // quand le Finding en couvre plusieurs (territoryIds.length > 1) —
  // sinon le premier territoire du Finding est retenu.
  | { type: "promote_finding_to_situation"; findingId: string; actorId: string; territoryId?: string; priority?: Priority; visibility?: Visibility }
  // dismiss_detection (LOT 8, mandat "Maritime Intelligence Engine", §5/
  // §31) — l'autre issue possible pour une détection encore non
  // matérialisée (l'autre étant record_finding) : un coordinateur l'a
  // examinée et a jugé qu'elle ne mérite pas de constat, avec une raison
  // courte. Crée quand même un Finding — canal unique de sortie de
  // l'intelligence (mandat §3) — mais directement au statut "rejected",
  // jamais "proposed" (aucune étape intermédiaire fictive). Même
  // garde-fou d'idempotence que record_finding via detectionKey
  // (obligatoire ici : une détection écartée sans clé ne protégerait rien).
  | {
      type: "dismiss_detection";
      actorId: string;
      findingType: FindingType;
      title: string;
      statement: string;
      territoryIds: string[];
      sourceRefs: KnowledgeSourceRef[];
      explanation: string;
      trust: TrustLevel;
      provenance: FindingSourceKind;
      nextStep: string;
      ruleId?: string;
      ruleVersion?: number;
      detectionKey: string;
      rejectionReason: FindingRejectionReason;
    }
  | {
      type: "create_collective_need";
      actorId: string;
      title: string;
      territoryIds: string[];
      affectedPopulation: string;
      sourceRefs: KnowledgeSourceRef[];
      consequences: string[];
      hypotheses: string[];
      knowledgeGaps: string[];
      knowledgeGapFindingIds?: string[];
    }
  | { type: "update_collective_need_status"; collectiveNeedId: string; actorId: string; status: Exclude<CollectiveNeedStatus, "emerging" | "converted">; note?: string }
  | {
      type: "create_program_opportunity";
      actorId: string;
      collectiveNeedId: string;
      problem: string;
      justification: string;
      territoryIds: string[];
      potentialBeneficiaries: string;
      evidenceRefs: KnowledgeSourceRef[];
      hypotheses: string[];
      knowledgeGaps: string[];
      possibleInterventions: string[];
      desiredOutcomes: string[];
      possibleIndicators: Array<{ label: string; unit: string }>;
      maturity: ProgramOpportunityMaturity;
    }
  | { type: "update_program_opportunity_status"; programOpportunityId: string; actorId: string; status: Exclude<ProgramOpportunityStatus, "detected" | "converted_to_program">; note?: string }
  // --- LOT 3 — Terrain (mandat "observer, vérifier et fiabiliser la
  // réalité") : create_field_mission ne crée jamais de Commitment (mandat
  // §8, "Mission ≠ Commitment" — contrairement à l'ancien
  // plan_field_commitment, Ministry, conservé tel quel). status omis à la
  // création : toujours "planifiee" (les champs obligatoires du mandat —
  // titre, objectif, territoire, raison, consignes — sont déjà réunis dès
  // la création explicite, il n'existe pas de geste "juste à préparer"
  // distinct dans ce lot).
  | {
      type: "create_field_mission";
      actorId: string;
      title: string;
      objective: string;
      territoryIds: string[];
      reason: string;
      responsibleActorId?: string;
      dueAt?: string;
      // Micro-correctif Product (post-LOT 3) : choisi explicitement à la
      // création, jamais déduit ensuite — cf. FieldMission.signalCategory.
      signalCategory: Signal["category"];
      observationPoints: string[];
      knowledgeGapFindingId?: string;
      findingId?: string;
      collectiveNeedId?: string;
      situationId?: string;
    }
  | { type: "update_field_mission_status"; missionId: string; actorId: string; status: Exclude<FieldMissionStatus, "a_preparer">; note?: string }
  // record_observation — mission.status doit être "en_cours" (l'agent a
  // explicitement démarré la mission avant d'observer, TEST D/E du
  // mandat). Produit toujours un Signal canonique (mandat §12) ; evidence
  // facultative (mandat §13, "une preuve textuelle/documentée peut
  // suffire").
  | {
      type: "record_observation";
      actorId: string;
      missionId: string;
      // Micro-correctif Product (post-LOT 3, "territoire réel de
      // l'observation") : le territoire sur lequel l'observation a
      // réellement été réalisée, obligatoirement l'un de
      // mission.territoryIds — plus de repli implicite sur
      // territoryIds[0], qui perdait l'information dès qu'une mission
      // couvre plusieurs territoires.
      territoryId: string;
      content: string;
      nature: ObservationNature;
      trust: TrustLevel;
      evidence?: { evidenceType: EvidenceType; label: string; detail: string };
    }
  // --- LOT 4 — Impact & Learning (mandat "de l'action à la valeur
  // démontrable"). Discipline commune rappelée une fois : aucune commande
  // ne promeut automatiquement vers l'étape suivante (record_outcome ne
  // crée jamais d'ImpactEvidence, record_result via la machine à états de
  // Situation continue de fonctionner à l'identique — cf. rules.ts).
  //
  // create_result — Result canonique manuel, pour les sources qui ne
  // passent pas par record_result (Initiative notamment, vertical slice
  // Programme). record_result (Situation) produit désormais AUSSI un
  // Result canonique directement dans son propre handler (rules.ts),
  // sans passer par cette commande — pas de double geste pour Joal.
  | {
      type: "create_result";
      actorId: string;
      title: string;
      description: string;
      sourceRef: { objectType: "situation" | "initiative"; objectId: string };
      trust: TrustLevel;
      evidence?: { evidenceType: EvidenceType; label: string; detail: string };
    }
  // record_outcome — exige au moins un Result source réel (TEST C) et une
  // attribution explicite (TEST D) ; territoryIds dérivé des Results
  // sources plutôt que ressaisi (mandat §11, "ne pas demander 30
  // champs"). attributionJustification obligatoire si attribution ===
  // "directe" (TEST E, validé dans le domaine).
  | {
      type: "record_outcome";
      actorId: string;
      title: string;
      statement: string;
      sourceResultIds: string[];
      baseline?: string;
      observedAt?: string;
      trust: TrustLevel;
      attribution: AttributionLevel;
      attributionJustification?: string;
      limits?: string;
      evidence?: { evidenceType: EvidenceType; label: string; detail: string };
    }
  // record_impact — toujours une commande séparée et explicite (jamais un
  // effet de bord de record_outcome, TEST F) ; status "a_mesurer" reste un
  // état honnête et attendu (mandat §13), pas un échec.
  // attributionJustification (micro-correctif Product, post-LOT 4) :
  // obligatoire si attribution === "directe" (validé dans le domaine, un
  // impact plus large exige un niveau de preuve élevé), facultatif sinon.
  | {
      type: "record_impact";
      actorId: string;
      title: string;
      statement: string;
      outcomeId: string;
      attribution: AttributionLevel;
      attributionJustification?: string;
      status: ImpactStatus;
      period?: string;
      limits?: string;
      simulated?: boolean;
      evidence?: { evidenceType: EvidenceType; label: string; detail: string };
    }
  // record_learning — toujours un geste humain explicite (mandat §14,
  // TEST H) : jamais généré automatiquement. Au moins une source réelle
  // exigée (situationId/initiativeId/outcomeId/fieldMissionId ou
  // sourceRefs non vide) — TEST I, "Learning conserve ses sources".
  | {
      type: "record_learning";
      actorId: string;
      title: string;
      summary: string;
      context?: string;
      reusableIn: string[];
      situationId?: string;
      initiativeId?: string;
      outcomeId?: string;
      fieldMissionId?: string;
      sourceRefs?: KnowledgeSourceRef[];
      status?: LearningStatus;
      // relatedRuleId (LOT 8, mandat §26) — cf. Learning.relatedRuleId.
      relatedRuleId?: string;
    }
  // --- LOT 7 — Actor & Trust Network (mandat "rendre l'écosystème
  // mobilisable"). qualify_signal_as_network_capacity est le seul chemin
  // par lequel un Signal (issu ou non d'une PublicContribution) devient
  // une capacité visible du Network — toujours une décision humaine
  // explicite (mandat §12, TEST C), jamais un effet de bord de la seule
  // existence du Signal. Exactement l'un des deux : organizationId
  // (rattacher à une organisation déjà connue) OU newOrganization (créer
  // une organisation candidate, mandat §13) — jamais les deux, jamais
  // aucune (validé dans le domaine, cf. actor-network.ts).
  | {
      type: "qualify_signal_as_network_capacity";
      actorId: string;
      signalId: string;
      organizationId?: string;
      newOrganization?: { name: string; type: Organization["type"] };
      service: {
        name: string;
        category: PartnerService["category"];
        territoryIds: string[];
        activationConditions: string;
      };
    }
  | { type: "reset_demo"; actorId: string };

export type CommandInput = Command extends infer Item
  ? Item extends { actorId: string }
    ? Omit<Item, "actorId">
    : never
  : never;
