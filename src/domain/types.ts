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
  // organizationId rendu optionnel (Sprint T01, "WhatsApp Transport +
  // Terrain Intake Foundation") : un acteur créé par onboarding WhatsApp
  // n'a pas d'organisation réelle à rattacher — en inventer une pour
  // satisfaire ce champ aurait fabriqué une donnée. Tous les usages
  // existants (recherche via .find(), jamais un accès direct supposant
  // la présence) tolèrent déjà une organisation absente/non trouvée.
  organizationId?: string;
  territoryIds: string[];
  phone: string;
  verified: boolean;
}

// VerificationStatus (P2.2-A, mandat "Actor & Relationship Foundation",
// §5) — grammaire explicable partagée par Organization.verificationStatus
// (LOT 7) et ActorRelationship.verificationStatus (ci-dessous) : "declaree"
// (auto-déclaré), "documentee" (des éléments l'étayent), "verifiee"
// (confirmé par un geste humain de coordination). Volontairement PAS
// TrustLevel (10 paliers) : la confiance de connaissance d'un Signal/
// Finding répond à "cette affirmation est-elle fiable ?", jamais à
// "cette identité/relation est-elle la bonne personne/organisation ?" —
// deux questions différentes que ce lot refuse de mélanger (mandat §5).
export type VerificationStatus = "declaree" | "documentee" | "verifiee";

export const verificationStatusLabels: Record<VerificationStatus, string> = {
  declaree: "Déclarée",
  documentee: "Documentée",
  verifiee: "Vérifiée"
};

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
  // avant ce lot) — pas de migration rétroactive fabriquée. Absent est
  // traité comme "declaree" par update_organization_verification (P2.2-A,
  // §9) pour la seule question de légalité de transition — jamais réécrit
  // rétroactivement tant qu'aucune transition n'a été demandée.
  verificationStatus?: VerificationStatus;
}

// ActorRelationship (P2.2-A, mandat "Actor & Relationship Foundation") —
// un objet métier léger unique pour représenter une relation Actor →
// Organization (mandat §3, pas de relation Actor→Actor générique tant
// qu'aucun besoin réel ne l'exige). Trois natures seulement (mandat §4) :
// "membre" (appartenance), "representant" (habilité à parler au nom de
// l'organisation), "relais" (relais de remontée/collecte pour le compte de
// l'organisation). Jamais inférées l'une de l'autre — "representant"
// n'implique PAS "membre" sauf si les deux relations existent réellement
// (mandat §4, garde-fou explicite) : create_actor_relationship ne crée
// jamais qu'UNE seule relation à la fois.
export type ActorRelationshipKind = "membre" | "representant" | "relais";

export const actorRelationshipKindLabels: Record<ActorRelationshipKind, string> = {
  membre: "Membre",
  representant: "Représente",
  relais: "Relais"
};

export interface ActorRelationship {
  id: string;
  actorId: string;
  organizationId: string;
  kind: ActorRelationshipKind;
  // verificationStatus démarre toujours à "declaree" à la création
  // (jamais choisi par le créateur, même discipline que PartnerService.
  // trust dans qualify_signal_as_network_capacity, actor-network.ts) —
  // seule update_actor_relationship_verification peut la faire progresser.
  verificationStatus: VerificationStatus;
  createdAt: string;
  createdByActorId: string;
  // Renseignés uniquement par update_actor_relationship_verification
  // (mandat §6) — absents tant qu'aucune revue humaine n'a eu lieu au-delà
  // de la déclaration initiale.
  reviewedAt?: string;
  reviewedByActorId?: string;
  // Base courte et optionnelle de la relation ou de sa vérification (ex.
  // "Présidente du GIE", "Confirmé lors de la mission terrain du...") —
  // jamais un système de gestion de preuves (mandat §6, "ne pas créer un
  // Evidence Management System") : un seul champ texte libre, réutilisé à
  // la création comme à chaque revue.
  note?: string;
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

// Species — évolution additive (PD.2, mandat "Product Dressing — Species
// Referential V1"). But du lot : donner une identité stable au même
// poisson à travers Landing/CatchLine, ServiceRequest, PriceObservation,
// ScarcityIndicator, sans jamais toucher aux `id` déjà référencés par ces
// objets (mandat §7, "CRITICAL: Do not replace existing Species ids").
export interface Species {
  id: string;
  // code (§4) — identifiant technique STABLE et indépendant du libellé
  // affiché : jamais recalculé depuis name/nameFr au runtime, choisi une
  // fois pour toutes à l'écriture du référentiel. Convention retenue et
  // documentée ici (mandat : "choose and document one") :
  // MAJUSCULES_SNAKE_CASE, ASCII sans accent, un ou plusieurs mots
  // distinctifs du nom usuel séparés par "_" — reprend verbatim les
  // exemples donnés par le mandat (SAR_ROUND, THIOF, ETHMALOSE) pour les
  // espèces concernées. Voir demo-state.ts pour les 10 valeurs figées et
  // leur justification.
  code: string;
  // name — CONSERVÉ tel quel (mandat §3/§7, "preserve existing fields
  // when removal would create unnecessary migration risk") : encore lu
  // aujourd'hui par ServiceRequestForm, BuyerTaskView,
  // CoordinationWorkspace, MarketWorkspace, ProfessionalAtlasWorkspace,
  // SustainabilityWorkspace, OperationsWorkspace, PilotageWorkspace (tous
  // /app, hors périmètre de ce lot). Nouveau code : lire `nameFr`
  // ci-dessous plutôt que ce champ (même valeur pour les 10 espèces
  // existantes, aucune divergence introduite par ce lot).
  name: string;
  // nameFr (§3/§5) — nom de référence français/affiché, vocabulaire du
  // référentiel cible. Champ à privilégier pour tout affichage nouveau.
  nameFr: string;
  // scientificName (§6) — renseigné UNIQUEMENT quand une valeur
  // défendable est connue pour l'espèce de démonstration concernée ;
  // absent sinon plutôt qu'une identité scientifique inventée (mandat :
  // "Product correctness is more important than fixture completeness").
  // Voir demo-state.ts pour la justification espèce par espèce.
  scientificName?: string;
  // localNames (§5) — noms locaux/alias (dont wolof) : une LISTE, jamais
  // un seul nom supposé unique ("do not assume one fish has exactly one
  // Wolof/common name"). Toujours un tableau (vide plutôt qu'absent) —
  // vide tant qu'aucun alias n'est connu avec une confiance suffisante,
  // même discipline de prudence que scientificName : une erreur de nom
  // local n'est pas moins dommageable qu'un nom scientifique inventé.
  localNames: string[];
  family: string;
  seasonality: string;
  sensitivity: "stable" | "surveillance" | "sensible";
  indicativePriceFcfaKg: number;
  // active (§3) — permet une future désactivation douce du référentiel
  // (espèce retirée de l'usage courant) sans jamais supprimer un
  // enregistrement encore référencé par l'historique (Landing/Lot/...).
  // Toutes les espèces de démonstration sont actives à ce jour.
  active: boolean;
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
  // reportedByActorId (P2.2-A, mandat "Actor & Relationship Foundation",
  // §10/§11) — additif, structurel : quand le déclarant réel correspond à
  // un Actor déjà connu du Core, cette référence le distingue de
  // actorId (l'acteur qui SAISIT/qualifie, ex. un relais) — "Moussa,
  // relais Mbàmbulaan" (actorId) ≠ "Ibrahima, pêcheur ayant réellement
  // donné l'information" (reportedByActorId). Ne remplace jamais
  // `reportedBy` (texte libre, conservé tel quel comme repli historique) :
  // les deux peuvent coexister, aucune migration rétroactive.
  reportedByActorId?: string;
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
// IncomingMessageDismissReason (P2.1-B, mandat "Qualification Workspace",
// §13) — cycle minimal nouveau/converti/écarté plutôt qu'un statut
// "rejected" complexe : une remontée qui ne peut/doit pas devenir un
// Signal (doublon, information insuffisante, hors périmètre) ne doit pas
// rester éternellement "nouveau" dans une vraie file opérationnelle.
// Raison structurée légère (4 valeurs), jamais un moteur de classification
// — le coordinateur choisit, rien n'est déduit.
export type IncomingMessageDismissReason = "doublon" | "information_insuffisante" | "hors_perimetre" | "autre";

export const incomingMessageDismissReasonLabels: Record<IncomingMessageDismissReason, string> = {
  doublon: "Doublon",
  information_insuffisante: "Information insuffisante",
  hors_perimetre: "Hors périmètre",
  autre: "Autre"
};

export interface IncomingMessage {
  id: string;
  channel: Signal["channel"];
  // Texte libre tel que mentionné dans le message, jamais garanti
  // correspondre à un territoire réel (même principe que
  // PublicRequest.territory) — la conversion exige un choix explicite.
  territoryHint?: string;
  reportedBy: string;
  // reportedByActorId (P2.2-A, §10) — même distinction que sur Signal :
  // renseigné uniquement quand le déclarant réel de ce message correspond
  // à un Actor déjà connu (ex. Demo World, ou choisi par le coordinateur à
  // la qualification via convert_message_to_signal.reportedByActorId).
  // `reportedBy` (texte libre) reste le repli historique, jamais retiré.
  reportedByActorId?: string;
  body: string;
  receivedAt: string;
  // "ecarte" (P2.1-B, §13) — additif : un message "converti" ou "nouveau"
  // créé avant ce lot reste valide tel quel, aucune migration requise.
  status: "nouveau" | "converti" | "ecarte";
  // Traçabilité inverse (P2.1-A, mandat "Intake Traceability & Data
  // Access Foundation") — renseignés uniquement par applyMessageToSignalOnly
  // (rules.ts) au moment de la conversion, jamais à la création du
  // message. Additifs : un message "converti" créé avant ce lot reste
  // sans ces trois champs plutôt que d'en fabriquer une valeur rétroactive
  // — status === "converti" seul reste la source de vérité historique.
  resultingSignalId?: string;
  convertedAt?: string;
  convertedByActorId?: string;
  // Écartement (P2.1-B, §13/§14) — renseignés uniquement par
  // applyDismissIncomingMessage (rules.ts) au moment de l'écartement.
  // "Doublon" reste un geste humain (mandat §14, "aucun matching
  // automatique") : duplicateOfSignalId n'est renseigné que si le
  // coordinateur identifie lui-même le Signal existant — jamais déduit,
  // jamais obligatoire même quand reason === "doublon" (une note libre
  // suffit si aucun Signal précis n'est identifié).
  dismissedReason?: IncomingMessageDismissReason;
  dismissedNote?: string;
  dismissedAt?: string;
  dismissedByActorId?: string;
  duplicateOfSignalId?: string;
}

// --- Channel Interaction — Sprint T01 ("WhatsApp Transport + Terrain -----
// Intake Foundation", docs/product/CURRENT_SPRINT.md) -------------------
//
// Trois concepts distincts demandés par le mandat (§3) : canal, fil de
// conversation/identité externe, message terrain. Après analyse du
// domaine existant (mandat §2) :
//   - CommunicationChannel/Communication (plus haut) modélisent des
//     communications SIMULÉES liées à une Situation (Communication.
//     simulated: true) — pas une conversation réelle bidirectionnelle.
//   - Signal["channel"] modélise la provenance d'un Signal déjà qualifié,
//     pas un canal d'échange vivant.
//   - IncomingMessage modélise une file de messages SIMULÉE (commentaire
//     ci-dessus, "pas une intégration WhatsApp/SMS/téléphonie réelle").
// Aucun des trois ne convient : InteractionChannel est donc un nouveau
// type, volontairement distinct de CommunicationChannel (documenté ici
// plutôt que silencieusement superposé — mandat "documenter tout conflit
// de domaine avant d'introduire un nouveau concept").
export type InteractionChannel = "whatsapp" | "sms" | "telephone";

// ConversationOnboardingStage — mandat §5 : "collecter progressivement"
// prénom → rôle → site. "non_demarre" couvre le tout premier message d'un
// contact inconnu : ce message est TOUJOURS préservé tel quel (mandat §5,
// "l'acteur peut soumettre le message original avant la fin de
// l'onboarding"), jamais interprété comme une réponse — il n'y a encore
// rien à quoi répondre. La question d'onboarding n'est posée qu'APRÈS ce
// premier message ; c'est seulement le message SUIVANT qui est interprété
// comme réponse à la question qui vient d'être posée.
export type ConversationOnboardingStage =
  | "non_demarre"
  | "prenom_demande"
  | "role_demande"
  | "site_demande"
  | "complet";

export interface ConversationMessage {
  id: string;
  direction: "inbound" | "outbound";
  body: string;
  occurredAt: string;
}

// Conversation — réalise le "minimal pending actor/contact record" du
// mandat §5 : un contact existe dès le premier message (channel +
// channelAddress + stade d'onboarding), AVANT qu'un Actor réel ne soit
// créé. Délibérément pas d'entité ExternalContact séparée (nom suggéré par
// le mandat §3) : pour une paire (channel, channelAddress), l'identité du
// contact et le fil de conversation ont exactement le même cycle de vie et
// la même clé — les séparer aurait dupliqué cette paire sans qu'aucun
// besoin réel ne justifie deux cycles de vie distincts (mandat "ne pas
// créer de doublon seulement pour satisfaire ce sprint").
export interface Conversation {
  id: string;
  channel: InteractionChannel;
  channelAddress: string;
  // actorId reste absent tant que l'onboarding n'a pas produit un Actor
  // réel (nom + rôle + territoire) — jamais un Actor à moitié rempli avec
  // des champs requis fabriqués (mandat "ne pas fabriquer de donnée").
  actorId?: string;
  onboardingStage: ConversationOnboardingStage;
  pendingName?: string;
  pendingRole?: Role;
  pendingTerritoryId?: string;
  // pendingConfirmationInteractionId (Sprint T04, mandat §7) — état
  // transitoire de coordination par conversation, pas une nouvelle entité
  // ni un nouveau cycle de vie : juste "la prochaine réponse oui/non de ce
  // contact concerne cette interaction précise". Posé uniquement par
  // applyTerrainInterpretation quand needsHumanReview devient vrai ;
  // effacé par le message SUIVANT quel qu'il soit (reconnu comme oui/non
  // ou non) — jamais laissé traîner pour ne pas détourner l'interprétation
  // d'un message sans rapport (mandat §7, "only treat yes/no as
  // confirmation when a conversation has an explicit pending
  // confirmation").
  pendingConfirmationInteractionId?: string;
  // optedOut / optedOutAt (Sprint T04, mandat §11) — un contact qui répond
  // "STOP" cesse de recevoir toute communication ET tout traitement
  // ultérieur (mandat "provide a simple mechanism/flag to stop pilot
  // communications"). Absent = comportement normal (aucune migration des
  // conversations déjà existantes, qui restent actives).
  optedOut?: boolean;
  optedOutAt?: string;
  startedAt: string;
  lastMessageAt: string;
  messages: ConversationMessage[];
}

// TerrainInteractionMessageType — mandat §10 : le parsing ne doit jamais
// planter sur audio/image/média non supporté. "texte" est le seul type
// réellement traité en T01 (rawContent = contenu réel) ; les autres
// préservent un repère factuel (jamais un contenu inventé/transcrit) pour
// préparer T02 (mandat D003/§10).
export type TerrainInteractionMessageType = "texte" | "audio" | "image" | "document" | "autre";

export const terrainInteractionMessageTypeLabels: Record<TerrainInteractionMessageType, string> = {
  texte: "Texte",
  audio: "Message vocal",
  image: "Image",
  document: "Document",
  autre: "Autre"
};

// TerrainInteractionProcessingStatus — mandat T02 §5/§11 : distincte de
// evidenceStatus (fiabilité de l'affirmation) et de intent (classification
// métier). T01 avait "recue"/"media_en_attente" (le pipeline IA
// n'existait pas encore) ; T02 construit réellement ce pipeline, donc ces
// deux statuts n'avaient plus de sens (un contenu reçu n'est jamais "fini"
// tant qu'aucune interprétation n'a été tentée, texte compris). Remplacés
// par le cycle réel : en_attente_traitement (créée, IA pas encore passée)
// → traitee (une interprétation structurée valide existe) OU
// echec_traitement (le pipeline a échoué à une étape — transcription,
// vision, JSON invalide, timeout — mandat §11, "jamais perdre
// l'interaction d'origine, toujours un état explicite + retry possible").
export type TerrainInteractionProcessingStatus = "en_attente_traitement" | "traitee" | "echec_traitement";

export const terrainInteractionProcessingStatusLabels: Record<TerrainInteractionProcessingStatus, string> = {
  en_attente_traitement: "En attente de traitement IA",
  traitee: "Traitée",
  echec_traitement: "Échec de traitement (à revoir)"
};

// TerrainInteractionIntent — mandat PRODUCT_BASELINE §5 / CURRENT_SPRINT
// T02 §5-§6. Cinq valeurs, jamais plus : les 4 intentions métier déclarées
// par le mandat (SIGNAL/NEED/OBSERVATION/CAPACITY → signal/besoin/
// observation/capacite, vocabulaire français pour rester cohérent avec le
// reste du domaine) + non_classifie (UNCLASSIFIED), utilisé tant qu'aucune
// interprétation n'existe encore ET quand l'IA elle-même ne peut pas
// décider sans deviner (mandat §6, "never force one of the four business
// intents").
export type TerrainInteractionIntent = "signal" | "besoin" | "observation" | "capacite" | "non_classifie";

export const terrainInteractionIntentLabels: Record<TerrainInteractionIntent, string> = {
  signal: "Signal",
  besoin: "Besoin",
  observation: "Observation",
  capacite: "Capacité",
  non_classifie: "Non classé"
};

// InterpretationConfidence — mandat §5, "confidence or equivalent bounded
// score/category". Catégorie bornée plutôt qu'un score numérique continu :
// ni la fixture déterministe (T02, aucun fournisseur réel disponible dans
// cet environnement) ni un futur vrai modèle ne peuvent honnêtement
// prétendre à une précision numérique fine — une catégorie explicable
// (mandat §7, doctrine de confiance) évite de fabriquer une fausse
// précision.
export type InterpretationConfidence = "haute" | "moyenne" | "faible";

export const interpretationConfidenceLabels: Record<InterpretationConfidence, string> = {
  haute: "Haute",
  moyenne: "Moyenne",
  faible: "Faible"
};

// TerrainInterpretation — mandat §5 : "extend TerrainInteraction or
// introduce one tightly-linked interpretation object. Avoid duplicate
// source-of-truth objects." Choix retenu : un objet imbriqué (jamais un
// tableau ProductState séparé) — il n'existe que lié 1:1 à l'interaction
// qui l'a produit, aucun cycle de vie propre. TerrainInteraction.intent
// reste une projection TOUJOURS synchronisée par les mêmes commandes qui
// touchent `interpretation.intent` (apply_terrain_interpretation,
// correct_terrain_interpretation) — practique pour filtrer/afficher sans
// descendre dans l'objet imbriqué, jamais une second vérité indépendante.
export interface TerrainInterpretation {
  intent: TerrainInteractionIntent;
  summary: string;
  language?: string;
  subject?: string;
  territoryId?: string;
  siteId?: string;
  quantity?: number;
  unit?: string;
  timeWindow?: string;
  confidence: InterpretationConfidence;
  needsHumanReview: boolean;
  interpretedAt: string;
  // Correction humaine (mandat §8, "human correction must remain
  // auditable") — jamais une réécriture silencieuse : l'intention/les
  // champs corrigés remplacent ceux de l'IA, mais la trace de la
  // correction (qui, quand, depuis quelle intention) reste visible.
  correctedByActorId?: string;
  correctedAt?: string;
  correctedFromIntent?: TerrainInteractionIntent;
  correctionNote?: string;
}

// MediaReference — mandat §10 : référence durable au média fournisseur,
// jamais le binaire lui-même dans le payload JSONB du tenant ("avoid
// persisting binary media in the tenant JSON payload if architecture
// makes that unsafe/heavy" — un blob JSONB partagé par tout le state
// produit est exactement ce cas). Seule la métadonnée nécessaire pour re-
// télécharger le média via l'API fournisseur au moment du traitement est
// conservée.
export interface MediaReference {
  provider: "whatsapp";
  mediaId: string;
  mimeType?: string;
  sha256?: string;
}

// TerrainInteraction — mandat T01 §6 + T02 §5. "actor/contact reference"
// est réalisé par conversationId (toujours présent, dès le premier
// message, même avant la création d'un Actor réel) + actorId optionnel
// (renseigné une fois l'onboarding complet) — jamais un Actor fabriqué à
// moitié rempli pour satisfaire ce champ plus tôt. evidenceStatus
// réutilise VerificationStatus (déjà la grammaire "declaree/documentee/
// verifiee" partagée par Organization/ActorRelationship, voir commentaire
// plus haut) plutôt qu'un nouvel enum DECLARED/OBSERVED/VERIFIED ;
// documenté ici comme mapping délibéré. Mandat §9 (T02) : le traitement
// IA ne fait jamais progresser evidenceStatus — seul un geste humain
// explicite le pourrait, et aucun n'existe encore pour ce chemin.
export interface TerrainInteraction {
  id: string;
  // Identifiant du message côté fournisseur (ex. wamid WhatsApp) —
  // optionnel : un futur canal sans identifiant fournisseur stable reste
  // possible (mandat "canal-agnostique").
  externalMessageId?: string;
  conversationId: string;
  actorId?: string;
  channel: InteractionChannel;
  messageType: TerrainInteractionMessageType;
  // Contenu brut tel que reçu pour "texte" ; légende de caption réelle
  // (mandat §4.3) pour image/document quand fournie, sinon un repère
  // factuel non fabriqué (mandat §10) — jamais une transcription inventée.
  rawContent: string;
  receivedAt: string;
  territoryId?: string;
  evidenceStatus: VerificationStatus;
  processingStatus: TerrainInteractionProcessingStatus;
  intent: TerrainInteractionIntent;
  // rawProviderEvent (mandat §4 T01, "raw provider event retained for
  // debugging/audit") — le message fournisseur isolé (jamais l'enveloppe
  // webhook entière avec d'autres contacts/messages), jamais journalisé en
  // clair côté serveur (mandat §11 T01) : conservé uniquement dans l'état
  // produit, visible seulement par un opérateur authentifié qui ouvre ce
  // dossier précis. Optionnel : un canal de test/fixture peut ne pas en
  // fournir.
  rawProviderEvent?: unknown;
  // mediaRef (mandat T02 §10) — référence durable, jamais le binaire.
  mediaRef?: MediaReference;
  // transcription (mandat §4.2) — préservée séparément de interpretation :
  // c'est un ARTEFACT du traitement (ce que l'audio dit réellement),
  // distinct de l'INTERPRÉTATION qui en est dérivée.
  transcription?: { text: string; language?: string };
  // imageAnalysis (mandat §4.3) — même distinction : la description brute
  // produite par la vision, séparée de l'interprétation terrain qui la
  // combine avec une éventuelle légende.
  imageAnalysis?: { description: string; confidence: InterpretationConfidence };
  interpretation?: TerrainInterpretation;
  // processingFailureReason (mandat §11) — raison explicite d'un
  // echec_traitement, jamais un message générique qui masquerait la cause
  // réelle (transcription/vision/JSON invalide/timeout).
  processingFailureReason?: string;
}

// --- Need/Capacity Matching + First Coordination Loop — Sprint T03 ------
// (docs/product/CURRENT_SPRINT.md) ----------------------------------------
//
// Mandat §3 : "inspect the current domain... before creating new objects."
// Analyse faite avant tout code :
//   - ServiceRequest (plus haut) porte déjà "Need", mais structurellement
//     pour le sourcing de LOTS DE POISSON (speciesId, quantityKg, quality
//     obligatoires, ServiceRequestIntent fixe sans "glace"/"transport"
//     générique) — un besoin de glace/froid/transport/acheteur déclaré par
//     un contact WhatsApp n'a ni espèce, ni qualité, ni quantité en kg de
//     poisson. Le réutiliser aurait fabriqué ces champs.
//   - Capacity (plus haut) exige un infrastructureId réel — une capacité
//     terrain ad hoc ("j'ai 2 tonnes de froid dispo aujourd'hui") n'est pas
//     rattachée à une Infrastructure déjà enregistrée, et le mandat §4
//     interdit explicitement de la traiter comme une entrée de catalogue
//     permanente. Infrastructure elle-même est un actif PERMANENT du
//     territoire (theoreticalCapacity, organizationId, status) — l'inverse
//     exact de "mon camion est libre aujourd'hui".
//   - Opportunity est structurellement lotId+serviceRequestId — le
//     rapprochement lot de poisson ↔ acheteur, pas besoin ↔ capacité
//     générique.
//   - CoordinationSpace n'a AUCUN champ de statut (juste objectif/décision
//     texte libre + commitments), et exige un situationId OU un
//     opportunityId — aucun des deux n'existe pour un besoin/capacité
//     terrain. Le cycle proposé/accepté-demandeur/accepté-fournisseur/
//     connecté/terminé/échoué du mandat §10 n'a nulle part où vivre dedans
//     sans la dénaturer pour tous ses autres usages (Situations).
//   - ProgrammeOrganizationEngagement a un statut (considered/contacted/
//     engaged/declined) mais à SENS UNIQUE (mobiliser une organisation
//     pour un programme) — pas de double acceptation demandeur+fournisseur.
// Conclusion documentée ici (mandat §3/§18, "document why existing domain
// objects are insufficient") : quatre objets nouveaux, délibérément
// étroits (mandat §5, "matching quality matters more than breadth — do
// not implement a generic ontology engine").

// TerrainMatchCategory — mandat §5, exactement les 3 catégories
// commerciales initiales, jamais une taxonomie générique.
export type TerrainMatchCategory = "glace_froid" | "transport" | "acheteur_debouche";

export const terrainMatchCategoryLabels: Record<TerrainMatchCategory, string> = {
  glace_froid: "Glace / froid",
  transport: "Transport",
  acheteur_debouche: "Acheteur / débouché"
};

export type TerrainNeedStatus = "active" | "en_coordination" | "satisfaite" | "annulee";

export const terrainNeedStatusLabels: Record<TerrainNeedStatus, string> = {
  active: "Actif",
  en_coordination: "En coordination",
  satisfaite: "Satisfait",
  annulee: "Annulé"
};

// TerrainNeed — mandat §4 "NEED". sourceInteractionId est la seule preuve
// de provenance conservée (jamais un evidenceStatus dupliqué ici : la
// TerrainInteraction d'origine porte déjà la sienne — mandat §5
// "provenance/evidence link", lu comme un LIEN, pas une seconde vérité).
export interface TerrainNeed {
  id: string;
  sourceInteractionId: string;
  actorId: string;
  organizationId?: string;
  territoryId: string;
  category: TerrainMatchCategory;
  subject?: string;
  quantity?: number;
  unit?: string;
  requiredTimeWindow?: string;
  createdAt: string;
  status: TerrainNeedStatus;
}

// TerrainCapacityStatus — "expiree" existe précisément parce que le
// mandat §4 interdit de traiter une capacité comme un catalogue permanent
// ("mon camion est libre aujourd'hui" est borné dans le temps) ;
// "engagee" est posé dès qu'une coordination est initiée sur elle (jamais
// proposée deux fois en parallèle).
export type TerrainCapacityStatus = "active" | "engagee" | "expiree" | "annulee";

export const terrainCapacityStatusLabels: Record<TerrainCapacityStatus, string> = {
  active: "Active",
  engagee: "Engagée",
  expiree: "Expirée",
  annulee: "Annulée"
};

export interface TerrainCapacity {
  id: string;
  sourceInteractionId: string;
  actorId: string;
  organizationId?: string;
  territoryId: string;
  category: TerrainMatchCategory;
  subject?: string;
  quantity?: number;
  unit?: string;
  availabilityWindow?: string;
  createdAt: string;
  status: TerrainCapacityStatus;
}

// TerrainMatchStatus — mandat §6. "propose" = candidat affiché à un
// opérateur (pas seulement calculé en mémoire — mandat §12, "matches
// proposed" doit rester une preuve dénombrable) ; "rejete" = écarté
// explicitement par un humain (jamais ré-affiché) ; "converti" = devenu
// une TerrainCoordination ; "perime" = la capacité visée n'est plus
// active au moment d'un rafraîchissement (mandat "expired capacity does
// not match", y compris pour un match déjà proposé).
export type TerrainMatchStatus = "propose" | "rejete" | "converti" | "perime";

export const terrainMatchStatusLabels: Record<TerrainMatchStatus, string> = {
  propose: "Proposé",
  rejete: "Rejeté",
  converti: "Converti en coordination",
  perime: "Périmé"
};

// TerrainMatchPriority — mandat §6 : "optional simple priority level...
// do not invent a pseudo-scientific 0-100 score." Dérivée uniquement de
// la présence d'avertissements (aucun warning = haute, au moins un =
// moyenne) — jamais un calcul pondéré opaque.
export type TerrainMatchPriority = "haute" | "moyenne";

export interface TerrainMatch {
  id: string;
  needId: string;
  capacityId: string;
  status: TerrainMatchStatus;
  reasons: string[];
  warnings: string[];
  priority: TerrainMatchPriority;
  createdAt: string;
  rejectedByActorId?: string;
  rejectedAt?: string;
  rejectionNote?: string;
}

// TerrainCoordinationStatus — mandat §10 : "reuse existing statuses if
// available" (vérifié : aucun objet existant ne couvre ce cycle à double
// acceptation, voir le commentaire de doctrine plus haut). Un champ de
// statut UNIQUE ne peut pas représenter fidèlement "demandeur accepté" ET
// "fournisseur accepté" comme deux faits INDÉPENDANTS (ils arrivent en
// réalité dans un ordre quelconque, parfois aucun des deux) — voir
// requesterResponse/providerResponse ci-dessous, qui portent ces deux
// faits séparément. status ne retient donc que les 4 phases majeures ;
// "requester/provider accepted/declined" (mandat §10) sont les
// équivalents sémantiques de requesterResponse/providerResponse, pas une
// cinquième et sixième valeur de status.
export type TerrainCoordinationStatus = "proposee" | "connectee" | "terminee" | "echouee";

export const terrainCoordinationStatusLabels: Record<TerrainCoordinationStatus, string> = {
  proposee: "Proposée",
  connectee: "Connectée",
  terminee: "Terminée",
  echouee: "Échouée"
};

export type TerrainCoordinationResponse = "acceptee" | "refusee";

export const terrainCoordinationResponseLabels: Record<TerrainCoordinationResponse, string> = {
  acceptee: "Acceptée",
  refusee: "Refusée"
};

export type TerrainCoordinationNotificationTarget = "demandeur" | "fournisseur";
export type TerrainCoordinationNotificationStatus = "a_envoyer" | "envoyee" | "echec";

// TerrainCoordinationNotification — mandat §9 : "provider failure must
// not lose the coordination object." L'intention de notification est
// toujours créée de façon synchrone (applyInitiateTerrainCoordination,
// pur) ; l'envoi réel (E/S) est une étape séparée (src/server/
// coordination-notifications.ts) qui ne fait jamais disparaître la
// Coordination si elle échoue — seul ce statut change.
export interface TerrainCoordinationNotification {
  target: TerrainCoordinationNotificationTarget;
  channel: InteractionChannel;
  status: TerrainCoordinationNotificationStatus;
  body: string;
  preparedAt: string;
  sentAt?: string;
  failureReason?: string;
}

// TerrainCoordinationOutcome — mandat §11. "fulfilled" reste le seul fait
// obligatoire ; tout le reste n'est renseigné que si réellement connu
// (mandat "do not force transaction value when unknown").
export interface TerrainCoordinationOutcome {
  fulfilled: boolean;
  note?: string;
  quantity?: number;
  unit?: string;
  failureReason?: string;
  recordedByActorId: string;
  recordedAt: string;
}

export interface TerrainCoordination {
  id: string;
  matchId: string;
  needId: string;
  capacityId: string;
  requesterActorId: string;
  providerActorId: string;
  requesterOrganizationId?: string;
  providerOrganizationId?: string;
  territoryId: string;
  // sourceInteractionIds (mandat §14, "every coordination must be
  // traceable back to... original interactions") — les deux interactions
  // d'origine (besoin + capacité), jamais recalculées depuis need/capacity
  // (qui peuvent en théorie être corrigés plus tard).
  sourceInteractionIds: string[];
  status: TerrainCoordinationStatus;
  // requesterResponse / providerResponse — mandat §10, deux faits
  // indépendants (voir commentaire de doctrine sur TerrainCoordinationStatus) :
  // absents tant que ce côté n'a pas répondu, jamais déduits l'un de
  // l'autre.
  requesterResponse?: TerrainCoordinationResponse;
  providerResponse?: TerrainCoordinationResponse;
  notifications: TerrainCoordinationNotification[];
  outcome?: TerrainCoordinationOutcome;
  createdAt: string;
  createdByActorId: string;
}

// --- Live Pilot Readiness + Commercial Validation — Sprint T04 ----------
// (docs/product/CURRENT_SPRINT.md) --------------------------------------
//
// CommercialResearchRecord — mandat §10. Analyse faite avant tout code :
// Organization (plus haut) et Actor ne portent aujourd'hui aucune notion
// de "sollicitation pilote" ni de "disposition à payer" — les y ajouter
// aurait mélangé un état opérationnel (qui est cet acteur/cette
// organisation) avec une preuve de recherche commerciale temporaire,
// jamais nettoyée ni auditée de la même façon (mandat "research evidence,
// not a subscription system"). Objet adjacent et volontairement isolé :
// aucune facture, aucun abonnement, aucun effet sur
// Organization/Actor/Capacity — seulement une fiche de recherche
// rattachée par référence (organizationId quand connu, sinon actorId pour
// un fournisseur-acteur sans organisation réelle, cf. T01 "ne pas
// fabriquer d'organisation"). Mandat D013 : "willingness-to-pay must be
// validated with real actors before automating billing" — ce record EST
// cette validation, rien de plus.
export type WillingnessToPayResponse = "oui" | "non" | "peut_etre";

export const willingnessToPayResponseLabels: Record<WillingnessToPayResponse, string> = {
  oui: "Oui",
  non: "Non",
  peut_etre: "Peut-être"
};

export interface CommercialResearchRecord {
  id: string;
  organizationId?: string;
  // actorId — utilisé uniquement quand ce fournisseur n'a pas
  // d'organisation réelle connue (cf. Actor.organizationId ci-dessus,
  // optionnel pour la même raison depuis T01).
  actorId?: string;
  contactedForPilot: boolean;
  pilotParticipationAccepted?: boolean;
  willingnessToPayAsked: boolean;
  willingnessToPayResponse?: WillingnessToPayResponse;
  indicativeAmountFcfa?: number;
  note?: string;
  updatedAt: string;
  updatedByActorId: string;
}

// OperationalFailure — mandat §12. Analyse faite avant tout code : un
// échec de traitement IA (TerrainInteraction.processingStatus ===
// "echec_traitement") et un échec d'envoi de notification de coordination
// (TerrainCoordinationNotification.status === "echec") sont déjà
// entièrement visibles dans l'état existant — les dupliquer ici créerait
// une seconde vérité désynchronisable. Le seul angle mort réel (mandat
// §2, "operational error visibility for pilot support") : un échec
// INATTENDU dans le traitement d'un message entrant côté pont webhook
// (erreur de parsing, exception du pipeline IA qui échappe à son propre
// try/catch, échec d'envoi d'une réponse conversationnelle ordinaire —
// PAS une notification de coordination, déjà tracée) n'était auparavant
// visible que dans les logs serveur (console.error), inaccessibles à un
// administrateur sans accès shell. Ce tableau comble UNIQUEMENT cet
// angle mort — jamais un système d'observabilité générique (mandat "do
// not build a full observability platform").
export interface OperationalFailure {
  id: string;
  occurredAt: string;
  channel: InteractionChannel;
  channelAddress: string;
  reason: string;
  resolved: boolean;
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

// ProgramOpportunity (LOT 0.3, étendu G1 "Territorial Opportunity") — un
// CollectiveNeed suffisamment qualifié, OU directement un Territory/une
// Situation, pour envisager une intervention structurée (programme,
// projet, partenariat, investissement, action publique, expérimentation
// — jamais nécessairement un futur Programme). Distinct de l'Opportunity
// existante (matching économique lot ↔ demande) : ne la remplace pas, ne
// la généralise pas (mandat §11, contrainte explicite).
//
// G1 (mandat "Territory → Situation → Opportunity → Arbitration →
// Initiative/Result") — cycle cible demandé : identifiée → à qualifier →
// qualifiée → à arbitrer → retenue → convertie → écartée. Mappage retenu,
// challengé puis conservé (le besoin est déjà couvert, pas de nouvelle
// nomenclature) :
//   identifiée        = detected
//   à qualifier       = qualifying
//   qualifiée         = qualified
//   à arbitrer        = pending_arbitration (NOUVEAU — le seul palier
//                        réellement manquant : aucun statut existant ne
//                        représentait "prêt pour une Decision humaine")
//   retenue           = designing (déjà "retenue puis mise en conception"
//                        dans son usage réel, cf. create_initiative —
//                        pas un second statut pour la même réalité)
//   convertie         = converted_to_program
//   écartée           = rejected
// "paused" n'a pas d'équivalent dans le cycle demandé mais reste un état
// pragmatique légitime (mise en veille) — conservé, pas supprimé.
export type ProgramOpportunityStatus =
  | "detected"
  | "qualifying"
  | "qualified"
  | "pending_arbitration"
  | "designing"
  | "converted_to_program"
  | "rejected"
  | "paused";

// Libellés existants volontairement inchangés (mandat G1 : ne pas
// toucher les écrans déjà câblés dessus) — seul "pending_arbitration" est
// un libellé réellement nouveau.
export const programOpportunityStatusLabels: Record<ProgramOpportunityStatus, string> = {
  detected: "Détectée",
  qualifying: "En cours de qualification",
  qualified: "Qualifiée",
  pending_arbitration: "À arbitrer",
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
  // collectiveNeedId (G1 : désormais optionnel) — une ProgramOpportunity
  // naissait jusqu'ici exclusivement d'un CollectiveNeed qualifié. La
  // chaîne cible du mandat G1 (Territory → Situation → Opportunity → ...)
  // autorise désormais une origine directe Territory/Site/Situation, sans
  // CollectiveNeed intermédiaire fabriqué uniquement pour satisfaire une
  // relation. territoryIds (ci-dessous) reste systématiquement obligatoire
  // dans les deux cas — le socle territorial ne devient jamais optionnel.
  collectiveNeedId?: string;
  problem: string;
  justification: string;
  territoryIds: string[];
  // siteIds/situationIds (G1) — relation explicite avec Site/Situation
  // "lorsque pertinente" (mandat G1) : jamais fabriquée pour satisfaire
  // une relation absente, donc optionnelle et vide par défaut plutôt
  // qu'un tableau toujours rempli.
  siteIds?: string[];
  situationIds?: string[];
  // involvedActorIds (G1) — acteurs réellement concernés par
  // l'instruction (référencent Actor.id réels, jamais un nom inventé).
  involvedActorIds?: string[];
  // establishedFacts (G1) — ce qui est un FAIT ÉTABLI (vérifiable dans le
  // domaine, ex. activité de débarquement réelle), distinct des
  // hypothèses et inconnues ci-dessous. Texte libre comme
  // consequences/hypotheses de CollectiveNeed : jamais un chiffre
  // fabriqué pour paraître précis.
  establishedFacts: string[];
  potentialBeneficiaries: string;
  // potentialValueHypothesis (G1) — valeur potentielle attendue. Nommé
  // explicitement "Hypothesis" pour qu'aucun appelant ne puisse la
  // confondre avec un Result/Outcome réel (doctrine FAIT ÉTABLI ≠ ... ≠
  // RÉSULTAT OBSERVÉ) : une estimation chiffrée non sourcée reste une
  // fabrication interdite, donc ce champ reste un texte qualitatif
  // explicitement hypothétique, jamais un montant inventé.
  potentialValueHypothesis?: string;
  evidenceRefs: KnowledgeSourceRef[];
  hypotheses: string[];
  knowledgeGaps: string[];
  possibleInterventions: string[];
  desiredOutcomes: string[];
  possibleIndicators: Array<{ label: string; unit: string }>;
  maturity: ProgramOpportunityMaturity;
  status: ProgramOpportunityStatus;
  // decisionId (G1) — Decision canonique réelle qui a tranché
  // l'arbitrage ("retenir" → designing, "ecarter" → rejected). Absent
  // tant qu'aucune arbitrate_program_opportunity n'a été appliquée :
  // jamais déduit du seul statut.
  decisionId?: string;
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
  // situationId (G1 : désormais optionnel) — une Decision était jusqu'ici
  // toujours rattachée à une Situation. G1 ("Territory → Situation →
  // Opportunity → Arbitration → ...") introduit un second ancrage
  // possible, programOpportunityId ci-dessous, mutuellement exclusif
  // (XOR vérifié par applyArbitrateProgramOpportunity, pas par ce type —
  // même discipline que create_initiative serviceRequestIds/
  // programOpportunityId). Toute Decision existante/future rattachée à
  // une Situation continue de fournir situationId exactement comme avant
  // — aucun appelant Situation n'est affecté par cet élargissement.
  situationId?: string;
  // programOpportunityId (G1) — ancrage alternatif pour l'arbitrage d'une
  // ProgramOpportunity. type reste un DecisionType existant dans ce cas
  // (constituer_programme = retenir, cloturer_sans_action = écarter) :
  // même vocabulaire de décision réutilisé, pas une seconde nomenclature
  // de type parallèle à DecisionType.
  programOpportunityId?: string;
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

// ProgrammeOrganizationEngagement (P2.5-B, mandat "Ecosystem Mobilization
// Foundation") — le premier objet du moteur CONNECTER. Principe fondateur
// du mandat (§1) : CAPABLE ≠ CONSIDÉRÉ ≠ CONTACTÉ ≠ ENGAGÉ. Un
// rapprochement PartnerService (capacité déclarée par une organisation)
// ne crée jamais cet objet automatiquement — il n'existe qu'après un
// geste humain explicite (create_programme_organization_engagement,
// programme-mobilization.ts). "capabilityCategory" ici ne réécrit PAS
// ProgramOpportunity/Initiative avec un besoin structuré générique
// (explicitement hors périmètre, mandat §3/§28) : c'est la capacité
// choisie par l'humain POUR CE GESTE DE MOBILISATION précis, jamais une
// prétention à représenter l'intégralité des besoins du programme.
export type ProgrammeOrganizationEngagementRole = "implementer" | "funder";

// Lifecycle strictement séquentiel (mandat §6) — considered → contacted →
// engaged/declined, aucun saut, aucun retour arrière — même discipline
// que INITIATIVE_LEGAL_TRANSITIONS (P2.5-A) et VERIFICATION_LEGAL_TRANSITIONS
// (P2.2-A). "declined" n'est atteignable que depuis "contacted" (on ne
// peut pas décliner une sollicitation jamais envoyée) ; "engaged" et
// "declined" sont tous deux terminaux dans ce lot.
export type ProgrammeOrganizationEngagementStatus = "considered" | "contacted" | "engaged" | "declined";

export const programmeOrganizationEngagementRoleLabels: Record<ProgrammeOrganizationEngagementRole, string> = {
  implementer: "Partenaire de mise en œuvre",
  funder: "Partenaire financier potentiel"
};

export const programmeOrganizationEngagementStatusLabels: Record<ProgrammeOrganizationEngagementStatus, string> = {
  considered: "Considérée",
  contacted: "Contactée",
  engaged: "Engagée",
  declined: "Déclinée"
};

export interface ProgrammeOrganizationEngagement {
  id: string;
  initiativeId: string;
  organizationId: string;
  role: ProgrammeOrganizationEngagementRole;
  // capabilityCategory reprend le vocabulaire déjà existant de
  // PartnerService.category (mandat §3) — jamais un nouveau champ sur
  // ProgramOpportunity/Initiative. Optionnel : un engagement peut aussi
  // naître sans capacité précise associée (rare, mais le modèle ne force
  // pas une catégorie fictive si le geste humain n'en fournit pas).
  capabilityCategory?: PartnerService["category"];
  status: ProgrammeOrganizationEngagementStatus;
  createdAt: string;
  createdByActorId: string;
  updatedAt?: string;
  updatedByActorId?: string;
  // representativeActorId (mandat §8) — jamais obligatoire : une
  // organisation reste considérable/contactable même si aucun
  // représentant n'est encore documenté. Quand renseigné, doit résoudre
  // vers un Actor réel portant une ActorRelationship "representant" pour
  // cette Organization (validé par applyCreateProgrammeOrganizationEngagement,
  // jamais déduit).
  representativeActorId?: string;
  // note — un seul champ texte libre court, réutilisé à la création comme
  // à chaque transition (même discipline que ActorRelationship.note,
  // P2.2-A) : jamais de deuxième système d'historique, jamais de detail
  // de valeur de contrat/probabilité/ranking (mandat §2, explicitement
  // exclus).
  note?: string;
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
  // actorRelationships (P2.2-A) — additif, même discipline que
  // fieldMissions/observations (LOT 3) : un tableau ProductState dédié,
  // jamais embarqué dans Actor/Organization (une relation a sa propre
  // provenance/vérification, distincte des deux objets qu'elle relie).
  actorRelationships: ActorRelationship[];
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
  // programmeOrganizationEngagements (P2.5-B) — additif, même discipline
  // que actorRelationships ci-dessus : jamais embarqué dans Initiative ni
  // dans Organization, une provenance et un cycle de vie propres.
  programmeOrganizationEngagements: ProgrammeOrganizationEngagement[];
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
  // conversations / terrainInteractions (Sprint T01) — additifs, même
  // discipline que findings/collectiveNeeds/programOpportunities plus
  // haut : aucune migration des tableaux existants, aucune donnée de
  // démonstration fabriquée pour ce sprint (createDemoState() les laisse
  // vides, seules de vraies commandes receive_channel_message/
  // send_channel_message les peuplent).
  conversations: Conversation[];
  terrainInteractions: TerrainInteraction[];
  // terrainNeeds / terrainCapacities / terrainMatches / terrainCoordinations
  // (Sprint T03) — mêmes discipline : additifs, vides à la création
  // (createDemoState()), peuplés uniquement par de vraies commandes.
  terrainNeeds: TerrainNeed[];
  terrainCapacities: TerrainCapacity[];
  terrainMatches: TerrainMatch[];
  terrainCoordinations: TerrainCoordination[];
  // commercialResearchRecords / operationalFailures (Sprint T04) — mêmes
  // discipline : additifs, vides à la création (createDemoState()),
  // peuplés uniquement par de vraies commandes.
  commercialResearchRecords: CommercialResearchRecord[];
  operationalFailures: OperationalFailure[];
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
  // reportedByActorId (P2.2-A, §12) — optionnel, permet au coordinateur de
  // désigner explicitement le déclarant réel s'il le connaît et qu'il
  // diffère de l'acteur qui qualifie (mandat "Relay vs Declarant") ; si
  // absent, applyMessageToSignalOnly reprend celui déjà porté par le
  // message le cas échéant (rules.ts) — jamais déduit, jamais un Actor créé
  // à la volée depuis cette commande.
  | { type: "convert_message_to_signal"; actorId: string; messageId: string; territoryId: string; category: Signal["category"]; title: string; description: string; reportedByActorId?: string }
  // dismiss_incoming_message (P2.1-B, mandat "Qualification Workspace",
  // §13/§14/§15) — l'autre issue possible pour une remontée brute encore
  // "nouveau" (l'autre étant convert_message_to_signal) : un geste humain
  // audité, jamais un rejet automatique. note optionnelle (§15, jamais de
  // texte administratif obligatoire) ; duplicateOfSignalId optionnel,
  // renseigné seulement si le coordinateur identifie lui-même le Signal
  // existant (§14, aucun matching automatique).
  | { type: "dismiss_incoming_message"; actorId: string; messageId: string; reason: IncomingMessageDismissReason; note?: string; duplicateOfSignalId?: string }
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
      // collectiveNeedId (G1 : désormais optionnel) — cf. ProgramOpportunity.collectiveNeedId.
      collectiveNeedId?: string;
      problem: string;
      justification: string;
      territoryIds: string[];
      // siteIds/situationIds/involvedActorIds/establishedFacts/
      // potentialValueHypothesis (G1) — cf. les champs homonymes sur
      // ProgramOpportunity ci-dessus (types.ts).
      siteIds?: string[];
      situationIds?: string[];
      involvedActorIds?: string[];
      // establishedFacts (G1) — optionnel sur la commande (défaut []
      // appliqué par applyCreateProgramOpportunity) pour qu'aucun
      // appelant existant (ProgramOpportunityForm.tsx, tests déjà en
      // place) n'ait à changer pour continuer à compiler — additif, pas
      // de migration imposée aux appelants non concernés par G1.
      establishedFacts?: string[];
      potentialValueHypothesis?: string;
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
  // arbitrate_program_opportunity (G1) — le palier "Arbitration" du
  // mandat : seule commande qui fait réellement progresser une
  // ProgramOpportunity hors de "pending_arbitration", en créant une
  // Decision canonique réelle (jamais une simple bascule de statut sans
  // trace de décision humaine). outcome "retenir" → designing + Decision
  // type "constituer_programme" ; "ecarter" → rejected + Decision type
  // "cloturer_sans_action" — réutilise le vocabulaire DecisionType
  // existant, n'en crée pas un second.
  | { type: "arbitrate_program_opportunity"; programOpportunityId: string; actorId: string; outcome: "retenir" | "ecarter"; rationale: string; coordinationId?: string }
  // update_initiative_status (P2.5-A, mandat "Programme Lifecycle
  // Foundation") — transition explicite du cycle de vie d'un Programme,
  // toujours un geste humain (jamais de progression automatique, cf.
  // applyUpdateInitiativeStatus, src/domain/initiative-lifecycle.ts).
  // status exclut "cadrage" : ce n'est jamais une destination de
  // transition, uniquement l'état de création (create_initiative). La
  // légalité stricte (cadrage → financee → execution → terminee, aucun
  // saut, aucun retour arrière) est vérifiée par le domaine, pas par ce
  // type — le type autorise large, initiative-lifecycle.ts restreint.
  | { type: "update_initiative_status"; initiativeId: string; actorId: string; status: Exclude<Initiative["status"], "cadrage">; note?: string }
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
  // --- P2.2-A — Actor & Relationship Foundation. create_actor_relationship
  // est le seul chemin de création d'une ActorRelationship (mandat §7 :
  // "aucune suppression physique silencieuse" — donc aucune commande de
  // suppression non plus, une relation créée reste, seule sa vérification
  // progresse). `actorId` reste l'émetteur du geste (qui l'enregistre,
  // pour l'audit) — `subjectActorId` est l'Actor réellement concerné par
  // la relation, distinct pour ne jamais confondre "qui déclare" et "qui
  // est déclaré" (même discipline que reportedByActorId ci-dessus).
  | { type: "create_actor_relationship"; actorId: string; subjectActorId: string; organizationId: string; kind: ActorRelationshipKind; note?: string }
  // verificationStatus exclut "declaree" : jamais une destination de
  // transition, uniquement l'état de création (même discipline que
  // update_initiative_status, P2.5-A) — légalité stricte
  // (declaree → documentee → verifiee, aucun saut, aucun retour arrière)
  // vérifiée par le domaine (actor-relationship.ts), pas par ce type.
  | { type: "update_actor_relationship_verification"; actorId: string; actorRelationshipId: string; verificationStatus: Exclude<VerificationStatus, "declaree">; note?: string }
  // update_organization_verification (mandat §9) — même grammaire/légalité
  // que ci-dessus, appliquée à Organization.verificationStatus (LOT 7,
  // jusqu'ici jamais mutée par aucune commande — audit P2.2 confirmé).
  | { type: "update_organization_verification"; actorId: string; organizationId: string; verificationStatus: Exclude<VerificationStatus, "declaree">; note?: string }
  // --- P2.5-B — Ecosystem Mobilization Foundation. `actorId` reste
  // l'émetteur du geste (qui enregistre la considération, pour l'audit) —
  // aucun champ "subject" séparé n'est nécessaire ici (contrairement à
  // create_actor_relationship) : l'objet concerné est déjà entièrement
  // désigné par initiativeId + organizationId, aucune ambiguïté possible.
  | {
      type: "create_programme_organization_engagement";
      actorId: string;
      initiativeId: string;
      organizationId: string;
      role: ProgrammeOrganizationEngagementRole;
      capabilityCategory?: PartnerService["category"];
      representativeActorId?: string;
      note?: string;
    }
  // status exclut "considered" : jamais une destination de transition,
  // uniquement l'état de création — légalité stricte (considered →
  // contacted → engaged/declined) vérifiée par le domaine
  // (programme-mobilization.ts), pas par ce type.
  | { type: "update_programme_organization_engagement_status"; actorId: string; engagementId: string; status: Exclude<ProgrammeOrganizationEngagementStatus, "considered">; note?: string }
  | { type: "reset_demo"; actorId: string }
  // receive_channel_message / send_channel_message (Sprint T01) —
  // délibérément SANS actorId : un numéro inconnu n'a pas encore d'Actor
  // (CommandInput, plus bas, exclut automatiquement de /api/actions toute
  // commande sans actorId — ces deux commandes ne peuvent transiter que
  // par le pont webhook dédié, jamais par une session humaine). Elles ne
  // sont volontairement ajoutées à aucune liste de permissions.ts : aucun
  // rôle humain ne peut les déclencher, même via /api/actions.
  | {
      type: "receive_channel_message";
      channel: InteractionChannel;
      channelAddress: string;
      messageType: TerrainInteractionMessageType;
      rawContent: string;
      receivedAt: string;
      externalMessageId?: string;
      rawProviderEvent?: unknown;
      mediaRef?: MediaReference;
    }
  | { type: "send_channel_message"; channel: InteractionChannel; channelAddress: string; body: string; sentAt: string }
  // apply_terrain_interpretation (Sprint T02) — même discipline que
  // receive_channel_message : SANS actorId, webhook uniquement (le
  // pipeline IA tourne côté pont de canal, pas dans une session humaine).
  // "echec" ne retire jamais l'interaction d'origine (mandat §11) : seul
  // processingStatus/processingFailureReason change.
  | {
      type: "apply_terrain_interpretation";
      interactionId: string;
      outcome: "succes" | "echec";
      transcription?: { text: string; language?: string };
      imageAnalysis?: { description: string; confidence: InterpretationConfidence };
      interpretation?: Omit<TerrainInterpretation, "interpretedAt">;
      failureReason?: string;
    }
  // correct_terrain_interpretation (Sprint T02, mandat §8) — AVEC
  // actorId : geste humain d'un opérateur autorisé (jamais le pont
  // webhook), donc soumis au même contrôle de permissions que toute autre
  // commande (permissions.ts). "Confirmer" = appeler cette commande sans
  // changer aucun champ et markForReview=false ; "marquer à revoir" =
  // markForReview=true sans autre changement.
  | {
      type: "correct_terrain_interpretation";
      actorId: string;
      interactionId: string;
      intent?: TerrainInteractionIntent;
      subject?: string;
      territoryId?: string;
      quantity?: number;
      unit?: string;
      timeWindow?: string;
      note?: string;
      markForReview?: boolean;
    }
  // --- Sprint T03 — Need/Capacity Matching + First Coordination Loop ----
  //
  // promote_terrain_interaction / refresh_terrain_matches /
  // reject_terrain_match / initiate_terrain_coordination /
  // update_terrain_coordination_status — toutes AVEC actorId (geste
  // humain d'un opérateur autorisé, permissions.ts) OU, pour
  // promote_terrain_interaction uniquement, déclenchées directement par
  // le pont webhook via dispatch() avec actorId = l'acteur réel auteur du
  // message (jamais un "acteur système" fabriqué — promouvoir son propre
  // besoin/capacité déclaré est honnêtement attribuable à cet acteur).
  // dispatch() ne vérifie jamais les permissions (seul /api/actions le
  // fait) : les deux chemins coexistent sans conflit, aucune astuce
  // actorId-optionnel nécessaire ici (mandat T01, pattern différent de
  // receive_channel_message/apply_terrain_interpretation).
  | { type: "promote_terrain_interaction"; actorId: string; interactionId: string }
  | { type: "refresh_terrain_matches"; actorId: string; needId: string }
  | { type: "reject_terrain_match"; actorId: string; matchId: string; note?: string }
  // requesterMessage/providerMessage : texte déjà rendu par l'appelant
  // (src/channels/message-templates.ts), jamais construit ici — même
  // discipline que send_channel_message.body (mandat T01 §8, "keep
  // message templates/configuration outside core domain logic").
  | { type: "initiate_terrain_coordination"; actorId: string; matchId: string; requesterMessage: string; providerMessage: string }
  // record_terrain_coordination_response — un seul côté à la fois (mandat
  // §10, "requester accepted/declined" et "provider accepted/declined"
  // sont deux faits indépendants, cf. types ci-dessus). Un refus clôt la
  // coordination (echouee) ; une acceptation ne connecte QUE si l'autre
  // côté a déjà accepté — jamais devinée, toujours vérifiée par le
  // domaine (terrain-matching.ts).
  | { type: "record_terrain_coordination_response"; actorId: string; coordinationId: string; side: "demandeur" | "fournisseur"; response: TerrainCoordinationResponse }
  | {
      type: "update_terrain_coordination_status";
      actorId: string;
      coordinationId: string;
      status: Extract<TerrainCoordinationStatus, "terminee" | "echouee">;
      outcome?: { fulfilled: boolean; note?: string; quantity?: number; unit?: string; failureReason?: string };
    }
  // record_coordination_notification_result — SANS actorId, même
  // discipline que apply_terrain_interpretation : seule l'orchestration
  // serveur (src/server/coordination-notifications.ts, jamais une session
  // humaine) constate le résultat réel d'un envoi (E/S), jamais un fait
  // attribuable à un acteur.
  | {
      type: "record_coordination_notification_result";
      coordinationId: string;
      target: TerrainCoordinationNotificationTarget;
      status: Extract<TerrainCoordinationNotificationStatus, "envoyee" | "echec">;
      failureReason?: string;
    }
  // --- Sprint T04 — Live Pilot Readiness + Commercial Validation --------
  //
  // record_commercial_research — AVEC actorId (geste humain d'un
  // administrateur qui mène la recherche commerciale, jamais le pont
  // webhook). Upsert : identifié par organizationId OU actorId (jamais
  // les deux — un seul référent par fiche), implémenté dans
  // src/domain/pilot.ts.
  | {
      type: "record_commercial_research";
      actorId: string;
      organizationId?: string;
      providerActorId?: string;
      contactedForPilot: boolean;
      pilotParticipationAccepted?: boolean;
      willingnessToPayAsked: boolean;
      willingnessToPayResponse?: WillingnessToPayResponse;
      indicativeAmountFcfa?: number;
      note?: string;
    }
  // record_operational_failure — SANS actorId, même discipline que
  // apply_terrain_interpretation : seul le pont webhook constate un échec
  // inattendu de traitement, jamais attribuable à un acteur.
  | { type: "record_operational_failure"; channel: InteractionChannel; channelAddress: string; reason: string }
  // mark_operational_failure_resolved — AVEC actorId (geste humain d'un
  // administrateur qui a traité/vérifié l'échec).
  | { type: "mark_operational_failure_resolved"; actorId: string; failureId: string }
  // retry_coordination_notification — AVEC actorId. Remet UNIQUEMENT la
  // notification visée (coordinationId + target) en "a_envoyer" ; ne
  // retente jamais l'envoi elle-même (mandat "allow retry where
  // technically safe" — le domaine reste pur/synchrone, l'envoi réel est
  // retenté par l'appelant serveur via attemptCoordinationNotifications,
  // même discipline qu'initiate_terrain_coordination).
  | { type: "retry_coordination_notification"; actorId: string; coordinationId: string; target: TerrainCoordinationNotificationTarget };

export type CommandInput = Command extends infer Item
  ? Item extends { actorId: string }
    ? Omit<Item, "actorId">
    : never
  : never;
