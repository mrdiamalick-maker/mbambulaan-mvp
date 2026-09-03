import type {
  AuditEntry,
  Command,
  Commitment,
  Communication,
  CoordinationSpace,
  Decision,
  Evidence,
  HistoryEntry,
  Initiative,
  Lot,
  Opportunity,
  ProductState,
  ProgramOpportunity,
  Result,
  ServiceRequest,
  ServiceRequestIntent,
  Signal,
  Situation,
  SituationStatus
} from "./types";
import { communicationChannelLabels, decisionTypeLabels, evidenceTypeLabels } from "./types";
import { applyKnowledgePipelineCommand, promoteSignalToSituation } from "./knowledge-pipeline";
import { applyFieldMissionCommand } from "./field-mission";
import { applyImpactCommand } from "./impact";
import { applyActorNetworkCommand } from "./actor-network";

// Le moteur de rapprochement Lot ↔ ServiceRequest (§5.11) ne concerne que
// les intentions d'approvisionnement : une demande de formation ou de
// financement ne se "couvre" jamais par un lot débarqué, même si elle
// porte par contrainte de type un speciesId/quantityKg (cf. types.ts:169-180).
const SOURCING_INTENTS: ReadonlySet<ServiceRequestIntent> = new Set([
  "achat",
  "transformation",
  "conservation",
  "transport",
  "equipement",
  "maintenance",
  "sourcing"
]);

// Commandes du pipeline de connaissance (LOT 0 : Signal → Finding →
// CollectiveNeed → ProgramOpportunity, cf.
// src/domain/knowledge-pipeline.ts) — aucune ne transite un statut de
// Situation ni ne fait partie des actions de workflow exposées par
// availableAction. Facteur commun aux deux listes ci-dessous, qui
// divergent ensuite exactement comme avant ce lot (cf. leurs commentaires
// respectifs) : ne pas les fusionner en une seule, "resume" doit rester
// exclu de `transitions` (traité à part, hors du tableau générique) mais
// PAS de `WorkflowAction` (valeur de retour légitime d'availableAction).
const KNOWLEDGE_PIPELINE_COMMAND_TYPES = [
  "report_signal_and_open_situation",
  "convert_message_to_signal_and_situation",
  "update_signal_disposition",
  "promote_signal_to_situation",
  "record_finding",
  "update_finding_status",
  "promote_finding_to_situation",
  "create_collective_need",
  "update_collective_need_status",
  "create_program_opportunity",
  "update_program_opportunity_status",
  // LOT 8 (mandat "Maritime Intelligence Engine", §5/§31) — même famille
  // que record_finding/update_finding_status : matérialise un Finding,
  // jamais un statut de Situation.
  "dismiss_detection"
] as const;

const transitions: Record<
  Exclude<
    Command["type"],
    | (typeof KNOWLEDGE_PIPELINE_COMMAND_TYPES)[number]
    | "reset_demo"
    | "create_signal"
    | "convert_message_to_signal"
    | "wait"
    | "resume"
    | "announce_return"
    | "confirm_arrival"
    | "record_landing"
    | "confirm_weighing"
    | "create_lots"
    | "accept_opportunity"
    | "complete_logistics"
    | "create_community_post"
    | "convert_post"
    | "flag_price"
    | "create_decision"
    | "record_evidence"
    | "log_communication"
    | "create_service_request"
    | "plan_field_commitment"
    | "create_initiative"
    | "create_field_mission"
    | "update_field_mission_status"
    | "record_observation"
    | "create_result"
    | "record_outcome"
    | "record_impact"
    | "record_learning"
    | "qualify_signal_as_network_capacity"
  >,
  [SituationStatus, SituationStatus]
> = {
  qualify: ["recue", "qualification"],
  prioritize: ["qualification", "priorisee"],
  coordinate: ["priorisee", "coordination"],
  start_intervention: ["coordination", "intervention"],
  record_result: ["intervention", "resultat"],
  close: ["resultat", "reglee"]
};

// id/timestamp/history/withAudit exportées (LOT 0) : réutilisées telles
// quelles par src/domain/knowledge-pipeline.ts, plutôt que dupliquées —
// même discipline de non-duplication que le reste de ce fichier.
export function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 10)}`;
}

export function timestamp() {
  return new Date().toISOString();
}

export function history(actorId: string, label: string, detail: string): HistoryEntry {
  return { id: id("hist"), at: timestamp(), actor: actorId, label, detail };
}

export function withAudit(
  state: ProductState,
  actorId: string,
  objectType: string,
  objectId: string,
  action: string,
  detail: string
): ProductState {
  const entry: AuditEntry = {
    id: id("audit"),
    at: timestamp(),
    actorId,
    objectType,
    objectId,
    action,
    detail
  };
  return { ...state, revision: state.revision + 1, audit: [entry, ...state.audit] };
}

export function validateSituation(situation: Situation) {
  if (!situation.nextStep.trim()) throw new Error("Une situation ouverte doit avoir une prochaine étape.");
  if (["coordination", "intervention", "attente"].includes(situation.status) && !situation.responsibleId) {
    throw new Error("Un responsable est obligatoire dès la prise en charge.");
  }
  if (["coordination", "intervention", "attente"].includes(situation.status) && !situation.dueAt) {
    throw new Error("Une échéance est obligatoire dès la prise en charge.");
  }
  if (situation.status === "attente" && !situation.waitingReason) {
    throw new Error("Le motif d’attente est obligatoire.");
  }
  if (["resultat", "reglee"].includes(situation.status) && (!situation.result || !situation.confirmation)) {
    throw new Error("Le résultat et l’élément de confirmation sont obligatoires.");
  }
}

function applyTripCommand(state: ProductState, command: Extract<Command, { type: "announce_return" | "confirm_arrival" | "record_landing" }>) {
  const trip = state.trips.find((item) => item.id === command.tripId);
  if (!trip) throw new Error("Sortie introuvable.");
  const landing = state.landings.find((item) => item.tripId === trip.id);
  if (!landing) throw new Error("Débarquement attendu introuvable.");

  if (command.type === "announce_return") {
    if (trip.status !== "en_mer") throw new Error("Le retour a déjà été annoncé.");
    const next = {
      ...state,
      trips: state.trips.map((item) =>
        item.id === trip.id ? { ...item, status: "retour_annonce" as const, announcedReturnAt: timestamp() } : item
      )
    };
    return withAudit(next, command.actorId, "sortie", trip.id, command.type, "Retour annoncé au poste de quai");
  }

  if (command.type === "confirm_arrival") {
    if (trip.status !== "retour_annonce") throw new Error("Le retour doit être annoncé avant l’arrivée.");
    const at = timestamp();
    const next = {
      ...state,
      trips: state.trips.map((item) =>
        item.id === trip.id ? { ...item, status: "arrivee_confirmee" as const, arrivedAt: at } : item
      ),
      landings: state.landings.map((item) =>
        item.id === landing.id ? { ...item, status: "arrive" as const, arrivedAt: at, trust: "observee" as const } : item
      )
    };
    return withAudit(next, command.actorId, "sortie", trip.id, command.type, "Arrivée confirmée au quai");
  }

  if (trip.status !== "arrivee_confirmee" || landing.status !== "arrive") {
    throw new Error("L’arrivée doit être confirmée avant le débarquement.");
  }
  const next = {
    ...state,
    trips: state.trips.map((item) =>
      item.id === trip.id ? { ...item, status: "debarquee" as const } : item
    )
  };
  return withAudit(next, command.actorId, "debarquement", landing.id, command.type, "Espèces et quantités déclarées");
}

function applyLandingCommand(state: ProductState, command: Extract<Command, { type: "confirm_weighing" | "create_lots" }>) {
  const landing = state.landings.find((item) => item.id === command.landingId);
  if (!landing) throw new Error("Débarquement introuvable.");

  if (command.type === "confirm_weighing") {
    const trip = state.trips.find((item) => item.id === landing.tripId);
    if (trip?.status !== "debarquee" || landing.status !== "arrive") {
      throw new Error("Le débarquement doit être enregistré avant la pesée.");
    }
    const next = {
      ...state,
      landings: state.landings.map((item) =>
        item.id === landing.id
          ? {
              ...item,
              status: "pese" as const,
              weighedAt: timestamp(),
              weighingSource: "Balance du quai, saisie de démonstration",
              trust: "verifiee" as const
            }
          : item
      )
    };
    return withAudit(next, command.actorId, "debarquement", landing.id, command.type, `${landing.totalWeightKg} kg confirmés`);
  }

  if (landing.status !== "pese") throw new Error("La pesée doit être confirmée avant de créer les lots.");
  if (state.lots.some((item) => item.landingId === landing.id)) throw new Error("Les lots ont déjà été créés.");

  const lots: Lot[] = landing.catches.map((catchLine, index) => ({
    id: `lot-${landing.id}-${index + 1}`,
    landingId: landing.id,
    speciesId: catchLine.speciesId,
    siteId: landing.siteId,
    quantityKg: catchLine.quantityKg,
    availableKg: catchLine.quantityKg,
    quality: catchLine.quality,
    productForm: catchLine.productForm,
    conservation: "glace",
    status: "disponible",
    trust: "verifiee",
    traceabilityCompleteness: 86
  }));

  const newOpportunities: Opportunity[] = lots.flatMap((lot) =>
    state.serviceRequests
      .filter((request) => request.status === "ouvert" && SOURCING_INTENTS.has(request.intent) && request.speciesId === lot.speciesId && lot.availableKg >= request.quantityKg)
      .map((request) => ({
        id: `opp-${lot.id}-${request.id}`,
        lotId: lot.id,
        serviceRequestId: request.id,
        territoryId: request.territoryId,
        score: lot.siteId.includes(request.territoryId) ? 94 : 86,
        reasons: [
          "Espèce identique",
          "Quantité suffisante",
          lot.siteId.includes(request.territoryId) ? "Même territoire" : "Territoire voisin",
          "Qualité compatible"
        ],
        status: "detectee" as const,
        humanValidationRequired: true
      }))
  );

  const next = {
    ...state,
    landings: state.landings.map((item) =>
      item.id === landing.id ? { ...item, status: "lots_crees" as const } : item
    ),
    lots: [...lots, ...state.lots],
    opportunities: [...newOpportunities, ...state.opportunities]
  };
  return withAudit(next, command.actorId, "debarquement", landing.id, command.type, `${lots.length} lots créés, ${newOpportunities.length} opportunité(s) détectée(s)`);
}

function applyOpportunityCommand(state: ProductState, command: Extract<Command, { type: "accept_opportunity" | "complete_logistics" }>) {
  const opportunity = state.opportunities.find((item) => item.id === command.opportunityId);
  if (!opportunity) throw new Error("Opportunité introuvable.");
  const lot = state.lots.find((item) => item.id === opportunity.lotId);
  const serviceRequest = state.serviceRequests.find((item) => item.id === opportunity.serviceRequestId);
  if (!lot || !serviceRequest) throw new Error("Les objets liés à l’opportunité sont incomplets.");

  // onBehalfOfActorId (relais, tranche 1/N — voir Command) : quand renseigné,
  // c'est le bénéficiaire réel (mareyeur/transformateur) qui doit apparaître
  // partout où l'ancien code supposait à tort que command.actorId EST le
  // bénéficiaire — participantIds et le commitment de collecte ci-dessous.
  // command.actorId (le relais) reste seul porté par withAudit : l'audit
  // trace qui a techniquement exécuté, jamais falsifié.
  const beneficiaryId = command.onBehalfOfActorId ?? command.actorId;
  const beneficiary = command.onBehalfOfActorId ? state.actors.find((item) => item.id === command.onBehalfOfActorId) : undefined;
  if (command.onBehalfOfActorId && !beneficiary) throw new Error("Acteur bénéficiaire introuvable.");
  const relayDetail = beneficiary ? ` pour le compte de ${beneficiary.name}` : "";

  if (command.type === "accept_opportunity") {
    if (!["detectee", "proposee"].includes(opportunity.status)) throw new Error("Cette opportunité est déjà engagée.");
    const coordinationId = `coord-${opportunity.id}`;
    const next = {
      ...state,
      opportunities: state.opportunities.map((item) =>
        item.id === opportunity.id ? { ...item, status: "engagee" as const } : item
      ),
      lots: state.lots.map((item) =>
        item.id === lot.id
          ? { ...item, status: "engage" as const, availableKg: Math.max(0, item.availableKg - serviceRequest.quantityKg) }
          : item
      ),
      serviceRequests: state.serviceRequests.map((item) =>
        item.id === serviceRequest.id ? { ...item, status: "couvert" as const } : item
      ),
      coordinationSpaces: [
        {
          id: coordinationId,
          opportunityId: opportunity.id,
          title: "Mise en relation qualifiée",
          participantIds: [...new Set([serviceRequest.actorId, beneficiaryId, "act-coordinateur"])],
          objective: `Orienter ${serviceRequest.quantityKg} kg vers ${serviceRequest.intent}`,
          decision: "Conditions acceptées sous réserve du contrôle final de qualité",
          commitments: [
            { id: id("eng"), actorId: beneficiaryId, label: "Organiser la collecte", dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), status: "a_faire" as const }
          ],
          risks: ["Retard logistique", "Évolution de la qualité"],
          nextReviewAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        ...state.coordinationSpaces
      ]
    };
    return withAudit(next, command.actorId, "opportunite", opportunity.id, command.type, `Engagement accepté${relayDetail} et coordination créée`);
  }

  if (opportunity.status !== "engagee") throw new Error("L’opportunité doit être engagée avant l’exécution.");
  const next = {
    ...state,
    opportunities: state.opportunities.map((item) =>
      item.id === opportunity.id ? { ...item, status: "executee" as const } : item
    ),
    lots: state.lots.map((item) =>
      item.id === lot.id ? { ...item, status: "valorise" as const } : item
    ),
    serviceRequests: state.serviceRequests.map((item) =>
      item.id === serviceRequest.id ? { ...item, status: "clos" as const } : item
    ),
    coordinationSpaces: state.coordinationSpaces.map((space) =>
      space.opportunityId === opportunity.id
        ? {
            ...space,
            decision: "Collecte confirmée et lot orienté",
            commitments: space.commitments.map((item) => ({ ...item, status: "terminee" as const, result: "Collecte confirmée" }))
          }
        : space
    )
  };
  return withAudit(next, command.actorId, "opportunite", opportunity.id, command.type, `${serviceRequest.quantityKg} kg orientés et résultat enregistré${relayDetail}`);
}

function applyCommunityCommand(state: ProductState, command: Extract<Command, { type: "create_community_post" | "convert_post" }>) {
  if (command.type === "create_community_post") {
    if (!command.title.trim() || !command.body.trim()) throw new Error("Le titre et le contenu sont obligatoires.");
    const postId = id("post");
    const next = {
      ...state,
      communityPosts: [
        {
          id: postId,
          authorId: command.actorId,
          territoryId: command.territoryId,
          community: "Communauté territoriale",
          category: command.category,
          title: command.title.trim(),
          body: command.body.trim(),
          createdAt: timestamp(),
          status: "publie" as const,
          comments: []
        },
        ...state.communityPosts
      ]
    };
    return withAudit(next, command.actorId, "publication", postId, command.type, command.title.trim());
  }

  const post = state.communityPosts.find((item) => item.id === command.postId);
  if (!post) throw new Error("Publication introuvable.");
  if (post.status === "transforme") throw new Error("Cette publication a déjà été transformée.");
  const situationId = id("sit-community");
  const signalId = id("obs-community");
  const next: ProductState = {
    ...state,
    signals: [
      {
        id: signalId,
        territoryId: post.territoryId,
        actorId: post.authorId,
        createdAt: timestamp(),
        channel: "terrain",
        category: "production",
        title: post.title,
        description: post.body,
        trust: "declaree",
        source: `Community · ${post.community}`,
        // convert_post reste couplé Signal+Situation (chemin legacy
        // documenté, LOT 0.1 — cf. commentaire sur la commande) : le
        // signal qu'il produit est immédiatement orienté vers une
        // situation dans le même geste, jamais "nouveau".
        disposition: "oriente_situation"
      },
      ...state.signals
    ],
    situations: [
      {
        id: situationId,
        reference: `MBA-COM-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
        signalIds: [signalId],
        territoryId: post.territoryId,
        title: post.title,
        description: post.body,
        status: "recue",
        priority: "moyenne",
        trust: "declaree",
        visibility: "organisation",
        nextStep: "Qualifier le contenu avec le relais territorial",
        history: [history(command.actorId, "Publication transformée", "Signal opérationnel créé depuis Community")]
      },
      ...state.situations
    ],
    communityPosts: state.communityPosts.map((item) =>
      item.id === post.id ? { ...item, status: "transforme" as const, convertedObjectId: situationId } : item
    )
  };
  return withAudit(next, command.actorId, "publication", post.id, command.type, `Situation ${situationId} créée`);
}

// Decision — objet de première classe (D3) : une situation peut porter
// plusieurs décisions successives, chacune tracée indépendamment de la
// transition de statut de la situation (§4.1 étape 4 du cahier des
// charges maître). Ne remplace pas la machine à états de Situation —
// vient documenter le choix humain qui la motive.
function applyDecisionCommand(state: ProductState, command: Extract<Command, { type: "create_decision" }>) {
  const situation = state.situations.find((item) => item.id === command.situationId);
  if (!situation) throw new Error("Situation introuvable.");
  if (!command.rationale.trim()) throw new Error("La justification de la décision est obligatoire.");
  if (command.coordinationId && !state.coordinationSpaces.some((item) => item.id === command.coordinationId)) {
    throw new Error("Coordination introuvable.");
  }

  const decision: Decision = {
    id: id("dec"),
    situationId: command.situationId,
    type: command.decisionType,
    rationale: command.rationale.trim(),
    decidedByActorId: command.actorId,
    decidedAt: timestamp(),
    coordinationId: command.coordinationId
  };

  const updatedSituation: Situation = {
    ...situation,
    history: [
      history(command.actorId, "Décision enregistrée", `${decisionTypeLabels[command.decisionType]} — ${decision.rationale}`),
      ...situation.history
    ]
  };

  const next: ProductState = {
    ...state,
    decisions: [decision, ...state.decisions],
    situations: state.situations.map((item) => (item.id === situation.id ? updatedSituation : item))
  };
  return withAudit(next, command.actorId, "decision", decision.id, command.type, decisionTypeLabels[command.decisionType]);
}

// Evidence — objet de première classe (D3) : un engagement doit produire
// une preuve ou une justification (§6.1 règles de relation). Rattachée à
// une situation, optionnellement à un engagement précis d'une coordination.
function applyEvidenceCommand(state: ProductState, command: Extract<Command, { type: "record_evidence" }>) {
  const situation = state.situations.find((item) => item.id === command.situationId);
  if (!situation) throw new Error("Situation introuvable.");
  if (!command.label.trim() || !command.detail.trim()) throw new Error("Le libellé et le détail de la preuve sont obligatoires.");
  if (
    command.commitmentId &&
    !state.coordinationSpaces.some((space) => space.commitments.some((commitment) => commitment.id === command.commitmentId))
  ) {
    throw new Error("Engagement introuvable.");
  }

  const evidence: Evidence = {
    id: id("ev"),
    situationId: command.situationId,
    commitmentId: command.commitmentId,
    type: command.evidenceType,
    label: command.label.trim(),
    detail: command.detail.trim(),
    recordedByActorId: command.actorId,
    recordedAt: timestamp(),
    trust: "declaree"
  };

  const updatedSituation: Situation = {
    ...situation,
    history: [
      history(command.actorId, "Preuve enregistrée", `${evidenceTypeLabels[command.evidenceType]} — ${evidence.label}`),
      ...situation.history
    ]
  };

  const next: ProductState = {
    ...state,
    evidences: [evidence, ...state.evidences],
    situations: state.situations.map((item) => (item.id === situation.id ? updatedSituation : item))
  };
  return withAudit(next, command.actorId, "preuve", evidence.id, command.type, evidence.label);
}

// Communication — objet de première classe (§5.10). Arbitrage D5 : toujours
// simulée en V1 (`simulated: true`), jamais un envoi réel WhatsApp/SMS/appel.
// Reliée à une situation et/ou un engagement si fournis, sinon consignée
// seule (ex. contact d'un acteur hors dossier ouvert).
function applyCommunicationCommand(state: ProductState, command: Extract<Command, { type: "log_communication" }>) {
  if (!command.subject.trim() || !command.body.trim()) throw new Error("L'objet et le contenu de la communication sont obligatoires.");
  const situation = command.situationId ? state.situations.find((item) => item.id === command.situationId) : undefined;
  if (command.situationId && !situation) throw new Error("Situation introuvable.");
  if (
    command.commitmentId &&
    !state.coordinationSpaces.some((space) => space.commitments.some((commitment) => commitment.id === command.commitmentId))
  ) {
    throw new Error("Engagement introuvable.");
  }

  const createdAt = timestamp();
  const communication: Communication = {
    id: id("com"),
    channel: command.channel,
    status: "envoye",
    actorId: command.actorId,
    situationId: command.situationId,
    commitmentId: command.commitmentId,
    subject: command.subject.trim(),
    body: command.body.trim(),
    simulated: true,
    createdAt,
    updatedAt: createdAt
  };

  let next: ProductState = {
    ...state,
    communications: [communication, ...state.communications]
  };

  if (situation) {
    const updatedSituation: Situation = {
      ...situation,
      history: [
        history(command.actorId, "Communication consignée (simulée)", `${communicationChannelLabels[command.channel]} — ${communication.subject}`),
        ...situation.history
      ]
    };
    next = { ...next, situations: state.situations.map((item) => (item.id === situation.id ? updatedSituation : item)) };
  }

  return withAudit(next, command.actorId, "communication", communication.id, command.type, `${communicationChannelLabels[command.channel]} (simulée) — ${communication.subject}`);
}

// ServiceRequest — anciennement Need (D1). Aucune commande de création
// n'existait avant cette étape (Need n'était alimenté que par les données
// de démonstration) : create_service_request rend l'objet réellement
// actionnable, alimenté par un canal explicite comme l'exige §5.6 du
// cahier des charges maître.
function applyServiceRequestCommand(state: ProductState, command: Extract<Command, { type: "create_service_request" }>) {
  if (!state.territories.some((item) => item.id === command.territoryId)) throw new Error("Territoire inconnu.");
  if (!state.species.some((item) => item.id === command.speciesId)) throw new Error("Espèce inconnue.");
  if (command.quantityKg <= 0) throw new Error("La quantité doit être positive.");

  const suffix = crypto.randomUUID().slice(0, 8);
  const serviceRequest: ServiceRequest = {
    id: `sr-${suffix}`,
    reference: `MBA-SR-${suffix.toUpperCase()}`,
    channel: command.channel,
    actorId: command.actorId,
    territoryId: command.territoryId,
    speciesId: command.speciesId,
    quantityKg: command.quantityKg,
    quality: command.quality,
    intent: command.intent,
    status: "ouvert",
    priority: "moyenne",
    createdAt: timestamp(),
    source: command.channel === "terrain" ? "Déclaration terrain" : "Formulaire Produit",
    contactName: command.contactName,
    phone: command.phone,
    email: command.email,
    organization: command.organization
  };

  const next: ProductState = {
    ...state,
    serviceRequests: [serviceRequest, ...state.serviceRequests]
  };
  return withAudit(next, command.actorId, "demande", serviceRequest.id, command.type, `${serviceRequest.quantityKg} kg — ${serviceRequest.intent}`);
}

// Initiative — besoin collectif → programme (Lot 5, comportement corrigé
// LOT 0.3, mandat "aligner le Core métier avec le Blueprint V1", §12/§13).
//
// Deux voies de création, mutuellement exclusives (XOR sur
// serviceRequestIds / programOpportunityId — une seule commande, cf.
// commentaire sur le type Command) :
// - serviceRequestIds : voie legacy, regroupement direct de ServiceRequest
//   ouvertes de même intention (seuil ≥ 2 demandes distinctes, inchangé).
// - programOpportunityId : voie canonique, conversion explicite d'une
//   ProgramOpportunity qualifiée ou en conception — la chaîne cible du
//   mandat (ServiceRequests/Signals/Findings → CollectiveNeed →
//   ProgramOpportunity → décision humaine → Initiative).
//
// Deux corrections de comportement, valables pour LES DEUX voies (§12/§13,
// règles générales, pas seulement pour la nouvelle voie) :
// 1. Budget optionnel — "La création d'un Programme en phase de cadrage ne
//    doit pas nécessiter un budget strictement positif." budgetStatus
//    explicite ("a_estimer" par défaut si budgetFcfa absent) plutôt que
//    "valide" imposé.
// 2. Plus d'auto-couverture — "Créer un Programme ne signifie PAS que les
//    demandes d'origine sont couvertes. Elles ne deviennent couvertes que
//    lorsqu'une intervention/résolution répond effectivement au besoin."
//    Critère obligatoire du mandat : les ServiceRequests regroupées (voie
//    legacy) restent "ouvert", plus jamais marquées "couvert" ici.
function applyInitiativeCommand(state: ProductState, command: Extract<Command, { type: "create_initiative" }>) {
  if (!command.title.trim()) throw new Error("Le titre du programme est obligatoire.");
  if (!command.objective.trim()) throw new Error("L'objectif du programme est obligatoire.");
  if (command.budgetFcfa !== undefined && (!Number.isFinite(command.budgetFcfa) || command.budgetFcfa <= 0)) {
    throw new Error("Le budget, s'il est renseigné, doit être positif.");
  }
  if (Boolean(command.serviceRequestIds) === Boolean(command.programOpportunityId)) {
    throw new Error("Un programme se crée soit depuis des demandes regroupées, soit depuis une opportunité de programme — jamais les deux ni aucune des deux.");
  }

  const budgetStatus = command.budgetStatus ?? (command.budgetFcfa !== undefined ? "estime" : "a_estimer");
  if (budgetStatus !== "a_estimer" && command.budgetFcfa === undefined) {
    throw new Error("Un budget « estimé » ou « validé » exige un montant chiffré.");
  }

  let territoryIds: string[];
  let serviceRequestIds: string[] | undefined;
  let programOpportunity: ProgramOpportunity | undefined;
  let detail: string;

  if (command.serviceRequestIds) {
    const uniqueIds = Array.from(new Set(command.serviceRequestIds));
    if (uniqueIds.length < 2) throw new Error("Un programme doit regrouper au moins deux demandes distinctes.");

    const requests = uniqueIds.map((requestId) => {
      const request = state.serviceRequests.find((item) => item.id === requestId);
      if (!request) throw new Error("Demande de service introuvable.");
      if (request.status !== "ouvert") throw new Error(`La demande ${request.reference} n'est plus ouverte.`);
      return request;
    });

    const [firstRequest, ...otherRequests] = requests;
    if (otherRequests.some((request) => request.intent !== firstRequest.intent)) {
      throw new Error("Un programme ne peut regrouper que des demandes de même intention.");
    }

    territoryIds = Array.from(new Set(requests.map((request) => request.territoryId)));
    serviceRequestIds = uniqueIds;
    detail = `${command.title.trim()} — ${uniqueIds.length} demandes regroupées`;
  } else {
    programOpportunity = state.programOpportunities.find((item) => item.id === command.programOpportunityId);
    if (!programOpportunity) throw new Error("Opportunité de programme introuvable.");
    if (!["qualified", "designing"].includes(programOpportunity.status)) {
      throw new Error("Cette opportunité de programme n'est pas encore prête à devenir un programme (qualifiée ou en conception requis).");
    }
    territoryIds = programOpportunity.territoryIds;
    detail = `${command.title.trim()} — depuis l'opportunité de programme ${programOpportunity.id}`;
  }

  const initiative: Initiative = {
    id: id("init"),
    title: command.title.trim(),
    territoryIds,
    situationIds: [],
    objective: command.objective.trim(),
    status: "cadrage",
    ownerId: command.actorId,
    budgetFcfa: command.budgetFcfa,
    budgetStatus,
    funding: [],
    indicators: [],
    serviceRequestIds,
    programOpportunityId: programOpportunity?.id
  };

  // Plus d'auto-couverture (§12) : state.serviceRequests n'est
  // volontairement pas réécrit ici — les demandes regroupées restent
  // "ouvert", seule une intervention/résolution réelle les couvre.
  const next: ProductState = {
    ...state,
    initiatives: [initiative, ...state.initiatives],
    programOpportunities: programOpportunity
      ? state.programOpportunities.map((item) =>
          item.id === programOpportunity!.id
            ? { ...item, status: "converted_to_program" as const, history: [history(command.actorId, "Convertie en programme", initiative.title), ...item.history] }
            : item
        )
      : state.programOpportunities
  };
  return withAudit(next, command.actorId, "initiative", initiative.id, command.type, detail);
}

// Mission terrain → Commitment (D2, refonte de l'Espace État dans le modèle
// unifié). Une mission planifiée par le ministère n'est plus un enregistrement
// isolé : elle devient un engagement réel dans une coordination, visible dans
// la même salle de coordination que les engagements de la filière. Le
// workspace ministère (src/server/ministry-repository.ts) continue de tenir
// son propre FieldVisit (vocabulaire et cycle de vie propres au ministère,
// non forcés dans la machine à états de Situation) mais le rattache
// désormais à ce Commitment via commitmentId/coordinationId.
function applyFieldCommitmentCommand(state: ProductState, command: Extract<Command, { type: "plan_field_commitment" }>) {
  if (!state.territories.some((item) => item.id === command.territoryId)) throw new Error("Territoire inconnu.");
  if (!command.title.trim()) throw new Error("Le titre de la mission est obligatoire.");
  if (command.situationId && !state.situations.some((item) => item.id === command.situationId)) {
    throw new Error("Situation introuvable.");
  }

  const commitment: Commitment = {
    id: id("eng-ministere"),
    actorId: command.actorId,
    label: command.title.trim(),
    dueAt: command.dueAt,
    status: "a_faire"
  };

  const coordination: CoordinationSpace = {
    id: id("coord-ministere"),
    situationId: command.situationId,
    title: command.title.trim(),
    participantIds: [command.actorId],
    objective: command.objective,
    decision: "Mission planifiée par le ministère",
    commitments: [commitment],
    risks: [],
    nextReviewAt: command.dueAt
  };

  const next: ProductState = {
    ...state,
    coordinationSpaces: [coordination, ...state.coordinationSpaces]
  };
  return withAudit(next, command.actorId, "commitment", commitment.id, command.type, `${command.title.trim()} — ${command.territoryId}`);
}

// applySignalOnlyCreation / applyMessageToSignalOnly (LOT 0.1) : le coeur
// décapé de l'ancien create_signal / convert_message_to_signal, sans la
// création de Situation qu'ils imposaient — cf. commentaires sur les
// commandes correspondantes dans applyCommand.
function applySignalOnlyCreation(state: ProductState, command: Extract<Command, { type: "create_signal" }>): ProductState {
  if (!command.title.trim() || !command.description.trim()) throw new Error("Le titre et la description sont obligatoires.");
  // territoryId optionnel (LOT 0.4) : n'est validé que s'il est fourni —
  // absent (voie Public, territoire non résolu), rien à valider.
  if (command.territoryId && !state.territories.some((item) => item.id === command.territoryId)) throw new Error("Territoire inconnu.");
  const suffix = crypto.randomUUID().slice(0, 8);
  const signalId = `obs-${suffix}`;
  const signal: Signal = {
    id: signalId,
    territoryId: command.territoryId,
    actorId: command.actorId,
    createdAt: timestamp(),
    channel: command.channel,
    // Micro-correctif final LOT 6 — "infrastructure" n'était pas une
    // vraie catégorie déterminée, seulement l'ancien repli par défaut :
    // faux pour une contribution de formation, financement, organisation,
    // etc. La catégorie neutre "autre" est le repli honnête tant que
    // l'appelant n'en fournit pas une réellement déterminable — jamais
    // déduite ici de mots-clés libres (title/description).
    category: command.category ?? "autre",
    title: command.title.trim(),
    description: command.description.trim(),
    trust: "declaree",
    source: command.channel === "poste_quai" ? "Poste de quai" : "Déclaration terrain",
    disposition: "nouveau",
    // sourceRef (P2.1-A) — "direct" en repli : create_signal est aussi
    // appelé sans sourceRef par les rôles terrain/coordination qui
    // saisissent un signal sans intake préalable (aucun message ni
    // PublicRequest/PublicContribution à l'origine). Les ponts Public
    // (public-request-signal-bridge.ts, public-contribution-signal-bridge.ts)
    // renseignent explicitement le leur.
    sourceRef: command.sourceRef ?? { objectType: "direct" }
  };
  const next: ProductState = { ...state, signals: [signal, ...state.signals] };
  return withAudit(next, command.actorId, "signal", signalId, command.type, command.title.trim());
}

function applyMessageToSignalOnly(state: ProductState, command: Extract<Command, { type: "convert_message_to_signal" }>): ProductState {
  if (!command.title.trim() || !command.description.trim()) throw new Error("Le titre et la description sont obligatoires.");
  if (!state.territories.some((item) => item.id === command.territoryId)) throw new Error("Territoire inconnu.");
  const message = state.incomingMessages.find((item) => item.id === command.messageId);
  if (!message) throw new Error("Message introuvable.");
  if (message.status === "converti") throw new Error("Ce message a déjà été converti.");
  const channelLabels: Record<Signal["channel"], string> = {
    terrain: "Terrain",
    telephone: "Téléphone",
    whatsapp_structure: "WhatsApp",
    poste_quai: "Poste de quai",
    espace_public: "Espace public"
  };
  const suffix = crypto.randomUUID().slice(0, 8);
  const signalId = `obs-${suffix}`;
  const signal: Signal = {
    id: signalId,
    territoryId: command.territoryId,
    actorId: command.actorId,
    createdAt: timestamp(),
    channel: message.channel,
    category: command.category,
    title: command.title.trim(),
    description: command.description.trim(),
    trust: "declaree",
    source: `Message entrant (${channelLabels[message.channel]}) converti par le coordinateur`,
    reportedBy: message.reportedBy,
    disposition: "nouveau",
    // sourceRef (P2.1-A) — dérivé directement de messageId, déjà porté
    // par la commande : pas de champ sourceRef séparé sur
    // convert_message_to_signal (cf. commentaire sur le variant Command
    // dans types.ts).
    sourceRef: { objectType: "incoming_message", objectId: message.id }
  };
  const convertedAt = timestamp();
  const next: ProductState = {
    ...state,
    signals: [signal, ...state.signals],
    // Traçabilité inverse (P2.1-A) — le message converti pointe désormais
    // vers le Signal qu'il a produit, symétrique à Signal.sourceRef
    // ci-dessus. status === "converti" reste la garde d'idempotence
    // existante (ligne plus haut : un message déjà converti ne peut pas
    // l'être une seconde fois) — ces trois champs ne font qu'exposer,
    // structurellement, ce que cette garde protégeait déjà implicitement.
    incomingMessages: state.incomingMessages.map((item) =>
      item.id === message.id
        ? { ...item, status: "converti" as const, resultingSignalId: signalId, convertedAt, convertedByActorId: command.actorId }
        : item
    )
  };
  return withAudit(next, command.actorId, "signal", signalId, command.type, command.title.trim());
}

export function applyCommand(state: ProductState, command: Command): ProductState {
  if (command.type === "reset_demo") return state;

  if (command.type === "create_decision") {
    return applyDecisionCommand(state, command);
  }
  if (command.type === "record_evidence") {
    return applyEvidenceCommand(state, command);
  }
  if (command.type === "log_communication") {
    return applyCommunicationCommand(state, command);
  }
  if (command.type === "create_service_request") {
    return applyServiceRequestCommand(state, command);
  }
  if (command.type === "create_initiative") {
    return applyInitiativeCommand(state, command);
  }
  if (command.type === "plan_field_commitment") {
    return applyFieldCommitmentCommand(state, command);
  }
  if (
    command.type === "create_field_mission" ||
    command.type === "update_field_mission_status" ||
    command.type === "record_observation"
  ) {
    return applyFieldMissionCommand(state, command);
  }
  if (
    command.type === "create_result" ||
    command.type === "record_outcome" ||
    command.type === "record_impact" ||
    command.type === "record_learning"
  ) {
    return applyImpactCommand(state, command);
  }
  if (command.type === "qualify_signal_as_network_capacity") {
    return applyActorNetworkCommand(state, command);
  }
  if (command.type === "announce_return" || command.type === "confirm_arrival" || command.type === "record_landing") {
    return applyTripCommand(state, command);
  }
  if (command.type === "confirm_weighing" || command.type === "create_lots") {
    return applyLandingCommand(state, command);
  }
  if (command.type === "accept_opportunity" || command.type === "complete_logistics") {
    return applyOpportunityCommand(state, command);
  }
  if (command.type === "create_community_post" || command.type === "convert_post") {
    return applyCommunityCommand(state, command);
  }
  if (command.type === "flag_price") {
    const price = state.priceObservations.find((item) => item.id === command.priceId);
    if (!price) throw new Error("Observation de prix introuvable.");
    const next = {
      ...state,
      priceObservations: state.priceObservations.map((item) =>
        item.id === price.id ? { ...item, flagged: true } : item
      )
    };
    return withAudit(next, command.actorId, "prix", price.id, command.type, "Observation signalée pour vérification");
  }

  // create_signal (LOT 0.1, comportement corrigé, mandat "aligner le Core
  // métier avec le Blueprint V1") : crée désormais UNIQUEMENT un Signal —
  // "Signal ≠ Situation" devient le comportement canonique du Core. Le
  // signal reste déclaratif (disposition "nouveau") jusqu'à une
  // qualification explicite (update_signal_disposition,
  // promote_signal_to_situation, ou rattachement à un Finding via
  // record_finding — cf. knowledge-pipeline.ts). Les parcours qui
  // expriment réellement l'intention "ouvrir un dossier tout de suite"
  // utilisent le wrapper legacy report_signal_and_open_situation
  // ci-dessous, pas ce chemin.
  if (command.type === "create_signal") {
    return applySignalOnlyCreation(state, command);
  }

  // convert_message_to_signal (LOT 0.1, comportement corrigé) : même
  // correction que create_signal — crée uniquement un Signal à partir du
  // message entrant (marqué "converti"), plus de Situation automatique.
  if (command.type === "convert_message_to_signal") {
    return applyMessageToSignalOnly(state, command);
  }

  // report_signal_and_open_situation / convert_message_to_signal_and_situation
  // (LOT 0.1, wrappers legacy explicites, mandat §5) : reproduisent le
  // comportement couplé d'avant ce lot, à l'identique — utilisés par les 3
  // parcours qui promettent déjà cette immédiateté à l'utilisateur
  // (TerrainCaptainView.tsx, CoordinatorSignalForm.tsx, bridgeVigilanceSignal
  // côté Ministère). Documentés ici comme compatibilité temporaire plutôt
  // que dupliqués silencieusement : à terme, ces 3 parcours devraient migrer
  // vers qualify → promote explicite (hors périmètre de ce lot).
  if (command.type === "report_signal_and_open_situation") {
    const created = applySignalOnlyCreation(state, { type: "create_signal", actorId: command.actorId, territoryId: command.territoryId, title: command.title, description: command.description, channel: command.channel });
    return promoteSignalToSituation(created, created.signals[0].id, command.actorId, { auditAction: command.type });
  }
  if (command.type === "convert_message_to_signal_and_situation") {
    const created = applyMessageToSignalOnly(state, { type: "convert_message_to_signal", actorId: command.actorId, messageId: command.messageId, territoryId: command.territoryId, category: command.category, title: command.title, description: command.description });
    return promoteSignalToSituation(created, created.signals[0].id, command.actorId, { auditAction: command.type });
  }

  // LOT 0.1/0.2/0.3 — pipeline de connaissance (Signal → Finding →
  // CollectiveNeed → ProgramOpportunity), délégué à un fichier dédié
  // plutôt qu'ajouté ici : rules.ts porte déjà la machine à états de
  // Situation et les objets de première classe existants, ce pipeline est
  // un domaine fonctionnel distinct avec sa propre cohérence interne.
  // Chaîne explicite plutôt que KNOWLEDGE_PIPELINE_COMMAND_TYPES.includes(...)
  // (essayé, retiré) : un .includes() sur un tableau ne permet pas à
  // TypeScript de rétrécir l'union Command pour le reste de la fonction
  // (situationItem/command.situationId juste après) — la répétition est le
  // prix du rétrécissement de type réel, pas une négligence.
  if (
    command.type === "update_signal_disposition" ||
    command.type === "promote_signal_to_situation" ||
    command.type === "record_finding" ||
    command.type === "update_finding_status" ||
    command.type === "promote_finding_to_situation" ||
    command.type === "create_collective_need" ||
    command.type === "update_collective_need_status" ||
    command.type === "create_program_opportunity" ||
    command.type === "update_program_opportunity_status" ||
    command.type === "dismiss_detection"
  ) {
    return applyKnowledgePipelineCommand(state, command);
  }

  const situationItem = state.situations.find((item) => item.id === command.situationId);
  if (!situationItem) throw new Error("Situation introuvable.");
  const updated: Situation = structuredClone(situationItem);
  let detail = "";
  // D10 (PRODUCT_DECISION_LOG.md, arbitrage CEO) : record_result (texte
  // libre, porte de la machine à états depuis avant le Lot 1) et
  // record_evidence (objet Evidence réel, Lot 1/D3) coexistaient sans
  // être reliés — une situation pouvait se clore sans jamais produire
  // une seule Evidence. Option retenue (B, additive) : record_result
  // continue de fonctionner à l'identique, mais produit désormais aussi
  // une Evidence de type "confirmation" — sans exiger de saisie
  // supplémentaire, sans toucher au comportement de record_evidence.
  let resultEvidence: Evidence | undefined;
  // LOT 4 (mandat "de l'action à la valeur démontrable", §7) : "lors de
  // record_result, produire ou relier un Result canonique" — sans rien
  // changer au comportement legacy ci-dessus (situation.result/
  // confirmation, resultEvidence). Le Result vit dans state.results,
  // jamais dans une chaîne de texte supplémentaire (TEST A).
  let canonicalResult: Result | undefined;

  if (command.type === "wait") {
    if (situationItem.status !== "intervention") throw new Error("Seule une intervention en cours peut être mise en attente.");
    if (!command.reason.trim()) throw new Error("Le motif d’attente est obligatoire.");
    updated.status = "attente";
    updated.waitingReason = command.reason;
    updated.nextStep = "Lever le blocage et reprendre l’intervention";
    detail = command.reason;
  } else if (command.type === "resume") {
    if (situationItem.status !== "attente") throw new Error("Cette situation n’est pas en attente.");
    updated.status = "intervention";
    updated.waitingReason = undefined;
    updated.nextStep = "Achever l’intervention et enregistrer le résultat";
    detail = "Intervention reprise après levée du blocage";
  } else {
    const [from, to] = transitions[command.type];
    if (situationItem.status !== from) throw new Error(`Transition impossible depuis « ${situationItem.status} ».`);
    updated.status = to;

    if (command.type === "qualify") {
      updated.trust = "verifiee";
      updated.nextStep = "Confirmer la priorité territoriale";
      detail = "Signal recoupé avec le poste de quai";
    }
    if (command.type === "prioritize") {
      updated.priority = "critique";
      updated.nextStep = "Mobiliser les acteurs responsables";
      detail = "Priorité confirmée au regard des pertes possibles";
    }
    if (command.type === "coordinate") {
      updated.responsibleId = command.actorId;
      updated.dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      updated.nextStep = "Démarrer l’intervention planifiée";
      detail = "Responsable et échéance confirmés";
    }
    if (command.type === "start_intervention") {
      updated.nextStep = "Achever l’intervention ou documenter un blocage";
      detail = "Intervention technique engagée";
    }
    if (command.type === "record_result") {
      if (!command.result.trim() || !command.confirmation.trim()) throw new Error("Le résultat et l’élément de confirmation sont obligatoires.");
      updated.result = command.result;
      updated.confirmation = command.confirmation;
      updated.trust = "consolidee";
      updated.nextStep = "Valider la clôture et capitaliser l’apprentissage";
      detail = command.result;
      resultEvidence = {
        id: id("ev"),
        situationId: updated.id,
        type: "confirmation",
        label: "Résultat de l’intervention",
        detail: `${command.result} — ${command.confirmation}`,
        recordedByActorId: command.actorId,
        recordedAt: timestamp(),
        trust: "consolidee"
      };
      canonicalResult = {
        id: id("result"),
        title: `Résultat — ${situationItem.title}`,
        description: command.result,
        sourceRef: { objectType: "situation", objectId: situationItem.id },
        territoryIds: [situationItem.territoryId],
        recordedAt: timestamp(),
        recordedByActorId: command.actorId,
        evidenceRefs: [resultEvidence.id],
        trust: "consolidee"
      };
    }
    if (command.type === "close") {
      updated.nextStep = "Partager l’apprentissage avec les autres quais";
      detail = "Situation clôturée après validation du résultat";
    }
  }

  updated.history.unshift(history(command.actorId, command.type, detail));
  validateSituation(updated);
  const next = {
    ...state,
    situations: state.situations.map((item) => (item.id === updated.id ? updated : item)),
    evidences: resultEvidence ? [resultEvidence, ...state.evidences] : state.evidences,
    results: canonicalResult ? [canonicalResult, ...state.results] : state.results
  };
  return withAudit(next, command.actorId, "situation", updated.id, command.type, detail);
}

export type WorkflowAction = Exclude<
  Command["type"],
  | (typeof KNOWLEDGE_PIPELINE_COMMAND_TYPES)[number]
  | "create_signal"
  | "convert_message_to_signal"
  | "reset_demo"
  | "wait"
  | "announce_return"
  | "confirm_arrival"
  | "record_landing"
  | "confirm_weighing"
  | "create_lots"
  | "accept_opportunity"
  | "complete_logistics"
  | "create_community_post"
  | "convert_post"
  | "flag_price"
  | "create_decision"
  | "record_evidence"
  | "log_communication"
  | "create_service_request"
  | "plan_field_commitment"
  | "create_initiative"
  | "create_field_mission"
  | "update_field_mission_status"
  | "record_observation"
  | "create_result"
  | "record_outcome"
  | "record_impact"
  | "record_learning"
  | "qualify_signal_as_network_capacity"
>;

export function availableAction(status: SituationStatus): WorkflowAction | undefined {
  const actions: Partial<Record<SituationStatus, WorkflowAction>> = {
    recue: "qualify",
    qualification: "prioritize",
    priorisee: "coordinate",
    coordination: "start_intervention",
    intervention: "record_result",
    attente: "resume",
    resultat: "close"
  };
  return actions[status];
}
