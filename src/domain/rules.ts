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
  ServiceRequest,
  ServiceRequestIntent,
  Signal,
  Situation,
  SituationStatus
} from "./types";
import { communicationChannelLabels, decisionTypeLabels, evidenceTypeLabels } from "./types";

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

const transitions: Record<
  Exclude<
    Command["type"],
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

function id(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 10)}`;
}

function timestamp() {
  return new Date().toISOString();
}

function history(actorId: string, label: string, detail: string): HistoryEntry {
  return { id: id("hist"), at: timestamp(), actor: actorId, label, detail };
}

function withAudit(
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
          participantIds: [serviceRequest.actorId, command.actorId, "act-coordinateur"],
          objective: `Orienter ${serviceRequest.quantityKg} kg vers ${serviceRequest.intent}`,
          decision: "Conditions acceptées sous réserve du contrôle final de qualité",
          commitments: [
            { id: id("eng"), actorId: command.actorId, label: "Organiser la collecte", dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), status: "a_faire" as const }
          ],
          risks: ["Retard logistique", "Évolution de la qualité"],
          nextReviewAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        },
        ...state.coordinationSpaces
      ]
    };
    return withAudit(next, command.actorId, "opportunite", opportunity.id, command.type, "Engagement accepté et coordination créée");
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
  return withAudit(next, command.actorId, "opportunite", opportunity.id, command.type, `${serviceRequest.quantityKg} kg orientés et résultat enregistré`);
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
        source: `Community · ${post.community}`
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

// Initiative — besoin collectif → programme (Lot 5). Jusqu'ici Initiative
// n'existait que côté données de démonstration : create_initiative promeut
// un regroupement de ServiceRequest ouvertes de même intention (seuil ≥ 2
// demandes distinctes approuvé) en programme réel, en cadrage, sans
// financement ni indicateur au départ — cela viendra des commandes déjà
// existantes de suivi de programme (hors périmètre de cette commande de
// création). Les demandes d'origine passent "couvert" pour ne pas rester
// doublement visibles comme besoin non traité une fois le programme ouvert.
function applyInitiativeCommand(state: ProductState, command: Extract<Command, { type: "create_initiative" }>) {
  if (!command.title.trim()) throw new Error("Le titre du programme est obligatoire.");
  if (!command.objective.trim()) throw new Error("L'objectif du programme est obligatoire.");
  if (!Number.isFinite(command.budgetFcfa) || command.budgetFcfa <= 0) throw new Error("Le budget doit être positif.");

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

  const territoryIds = Array.from(new Set(requests.map((request) => request.territoryId)));

  const initiative: Initiative = {
    id: id("init"),
    title: command.title.trim(),
    territoryIds,
    situationIds: [],
    objective: command.objective.trim(),
    status: "cadrage",
    ownerId: command.actorId,
    // Ce chemin de création (regroupement de demandes déjà ouvertes) exige
    // toujours un budget chiffré (cf. validation ci-dessus) — le statut
    // "a_estimer" ne concerne que les programmes en phase de cadrage pur,
    // représentés pour l'instant côté données de démonstration.
    budgetFcfa: command.budgetFcfa,
    budgetStatus: "valide",
    funding: [],
    indicators: []
  };

  const requestIdSet = new Set(uniqueIds);
  const next: ProductState = {
    ...state,
    initiatives: [initiative, ...state.initiatives],
    serviceRequests: state.serviceRequests.map((item) => (requestIdSet.has(item.id) ? { ...item, status: "couvert" as const } : item))
  };
  return withAudit(next, command.actorId, "initiative", initiative.id, command.type, `${initiative.title} — ${uniqueIds.length} demandes regroupées`);
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

  if (command.type === "create_signal") {
    if (!command.title.trim() || !command.description.trim()) throw new Error("Le titre et la description sont obligatoires.");
    if (!state.territories.some((item) => item.id === command.territoryId)) throw new Error("Territoire inconnu.");
    const suffix = crypto.randomUUID().slice(0, 8);
    const signalId = `obs-${suffix}`;
    const situationId = `sit-${suffix}`;
    const createdAt = timestamp();
    const newSituation: Situation = {
      id: situationId,
      reference: `MBA-SIT-${suffix.toUpperCase()}`,
      signalIds: [signalId],
      territoryId: command.territoryId,
      title: command.title.trim(),
      description: command.description.trim(),
      status: "recue",
      priority: "moyenne",
      trust: "declaree",
      visibility: "organisation",
      nextStep: "Qualifier le signal avec un relais territorial",
      history: [history(command.actorId, "Signal créé", command.description.trim())]
    };
    validateSituation(newSituation);
    const next: ProductState = {
      ...state,
      signals: [
        {
          id: signalId,
          territoryId: command.territoryId,
          actorId: command.actorId,
          createdAt,
          channel: command.channel,
          category: "infrastructure",
          title: command.title.trim(),
          description: command.description.trim(),
          trust: "declaree",
          source: command.channel === "poste_quai" ? "Poste de quai" : "Déclaration terrain"
        },
        ...state.signals
      ],
      situations: [newSituation, ...state.situations]
    };
    return withAudit(next, command.actorId, "situation", situationId, command.type, command.title.trim());
  }

  // convert_message_to_signal — même boucle que create_signal (Signal +
  // Situation créés d'un même geste), source différente : un message de
  // la file IncomingMessage plutôt qu'une saisie directe. reportedBy est
  // repris du message (l'auteur apparent), actorId reste le coordinateur
  // qui convertit — même distinction auteur/saisisseur qu'ailleurs
  // (Lot 1, arbitrage CEO 13/08/2026). Contrairement à create_signal, la
  // catégorie est un choix explicite du coordinateur : un message brut
  // n'est jamais pré-catégorisé.
  if (command.type === "convert_message_to_signal") {
    if (!command.title.trim() || !command.description.trim()) throw new Error("Le titre et la description sont obligatoires.");
    if (!state.territories.some((item) => item.id === command.territoryId)) throw new Error("Territoire inconnu.");
    const message = state.incomingMessages.find((item) => item.id === command.messageId);
    if (!message) throw new Error("Message introuvable.");
    if (message.status === "converti") throw new Error("Ce message a déjà été converti.");
    const suffix = crypto.randomUUID().slice(0, 8);
    const signalId = `obs-${suffix}`;
    const situationId = `sit-${suffix}`;
    const createdAt = timestamp();
    const channelLabels: Record<Signal["channel"], string> = {
      terrain: "Terrain",
      telephone: "Téléphone",
      whatsapp_structure: "WhatsApp",
      poste_quai: "Poste de quai"
    };
    const newSituation: Situation = {
      id: situationId,
      reference: `MBA-SIT-${suffix.toUpperCase()}`,
      signalIds: [signalId],
      territoryId: command.territoryId,
      title: command.title.trim(),
      description: command.description.trim(),
      status: "recue",
      priority: "moyenne",
      trust: "declaree",
      visibility: "organisation",
      nextStep: "Qualifier le signal avec un relais territorial",
      history: [history(command.actorId, "Message entrant converti en signal", command.description.trim())]
    };
    validateSituation(newSituation);
    const next: ProductState = {
      ...state,
      signals: [
        {
          id: signalId,
          territoryId: command.territoryId,
          actorId: command.actorId,
          createdAt,
          channel: message.channel,
          category: command.category,
          title: command.title.trim(),
          description: command.description.trim(),
          trust: "declaree",
          source: `Message entrant (${channelLabels[message.channel]}) converti par le coordinateur`,
          reportedBy: message.reportedBy
        },
        ...state.signals
      ],
      situations: [newSituation, ...state.situations],
      incomingMessages: state.incomingMessages.map((item) => (item.id === message.id ? { ...item, status: "converti" as const } : item))
    };
    return withAudit(next, command.actorId, "situation", situationId, command.type, command.title.trim());
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
    evidences: resultEvidence ? [resultEvidence, ...state.evidences] : state.evidences
  };
  return withAudit(next, command.actorId, "situation", updated.id, command.type, detail);
}

export type WorkflowAction = Exclude<
  Command["type"],
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
