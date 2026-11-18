// Pilot actor management + metrics + commercial validation + operational
// resilience — Sprint T04 ("Live Pilot Readiness + Commercial
// Validation", docs/product/CURRENT_SPRINT.md §8-§12).
//
// Ce fichier ne connaît rien de WhatsApp ni d'aucun fournisseur IA :
// seulement des projections pures sur l'état déjà produit par T01-T03, et
// trois commandes humaines/webhook supplémentaires (recherche
// commerciale, journal d'échec opérationnel, nouvel essai de
// notification).
import type {
  Command,
  CommercialResearchRecord,
  OperationalFailure,
  ProductState,
  Role,
  TerrainCoordinationNotificationTarget
} from "./types";
import { terrainCoordinationStatusLabels } from "./types";
import { id, timestamp, withAudit } from "./rules";
import { buildTerrainValueEvidence } from "./terrain-matching";

// --- Pilot actor management (mandat §8) -----------------------------------

// isPilotActor — mandat §9/§11, "distinguish demo/fixture data from real
// pilot data where possible". Analyse faite avant tout code : aucun
// indicateur demo/réel n'existe aujourd'hui sur Actor — en ajouter un
// fabriquerait une migration rétroactive des ~60 acteurs du Demo World
// (mandat "ne jamais fabriquer de donnée"). Règle dérivée, honnête et peu
// coûteuse : SEUL un acteur réellement passé par l'onboarding WhatsApp a
// une Conversation qui le référence (applyReceiveChannelMessage,
// channel-interaction.ts) — aucun acteur du Demo World n'apparaît jamais
// dans state.conversations (créé directement par createDemoState(), qui
// laisse ce tableau vide). Cette règle vaut pour les acteurs ; les
// tableaux terrainInteractions/terrainNeeds/terrainCapacities/
// terrainMatches/terrainCoordinations n'ont, eux, besoin d'AUCUN filtre
// supplémentaire : createDemoState() les laisse tous vides (T01/T03), ils
// ne contiennent donc déjà que de vraies données pilote par construction.
export function isPilotActor(state: ProductState, actorId: string): boolean {
  return state.conversations.some((conversation) => conversation.actorId === actorId);
}

export interface PilotActorRow {
  actorId: string;
  name: string;
  // phone — réservé aux vues admin déjà protégées par un contrôle de rôle
  // serveur (mandat §11, "do not expose actor phone numbers outside
  // authorised internal views") : cette projection elle-même n'ajoute
  // aucune protection, elle suppose un appelant déjà autorisé (même
  // discipline que buildTerrainInteractionRows, déjà utilisée uniquement
  // par TerrainSupervisorView derrière une session authentifiée).
  phone: string;
  role: Role;
  territoryLabel: string;
  onboardingComplete: boolean;
  lastInteractionAt?: string;
  substantiveInteractions: number;
  needsCreated: number;
  capacitiesCreated: number;
  coordinationsInitiated: number;
  coordinationsCompleted: number;
  // receivedProviderValue — mandat §8, "whether provider-side value has
  // been received". Dérivé de buildTerrainValueEvidence (T03), qui ne clé
  // qu'organizationId — aucun acteur produit par le pipeline WhatsApp n'a
  // encore d'organisation réelle (T01, "ne jamais fabriquer
  // d'organisation"), donc ce champ reste honnêtement faux pour tous les
  // acteurs pilotes tant qu'aucun n'est rattaché à une organisation —
  // limite connue, documentée dans IMPLEMENTATION_LOG, pas contournée ici
  // en inventant une clé de repli par acteur.
  receivedProviderValue: boolean;
}

export function buildPilotActorRows(state: ProductState): PilotActorRow[] {
  const valueByOrganization = new Set(buildTerrainValueEvidence(state).map((entry) => entry.organizationId));
  return state.actors
    .filter((actor) => isPilotActor(state, actor.id))
    .map((actor) => {
      const conversation = state.conversations.find((item) => item.actorId === actor.id);
      const territory = state.territories.find((item) => item.id === actor.territoryIds[0]);
      const interactions = state.terrainInteractions.filter((item) => item.actorId === actor.id);
      const lastInteractionAt = interactions.length > 0 ? interactions.map((item) => item.receivedAt).sort().at(-1) : undefined;
      const needsCreated = state.terrainNeeds.filter((item) => item.actorId === actor.id).length;
      const capacitiesCreated = state.terrainCapacities.filter((item) => item.actorId === actor.id).length;
      const coordinationsAsEitherSide = state.terrainCoordinations.filter(
        (item) => item.requesterActorId === actor.id || item.providerActorId === actor.id
      );
      return {
        actorId: actor.id,
        name: actor.name,
        phone: actor.phone,
        role: actor.role,
        territoryLabel: territory?.name ?? "Non renseigné",
        onboardingComplete: conversation?.onboardingStage === "complet",
        lastInteractionAt,
        substantiveInteractions: interactions.length,
        needsCreated,
        capacitiesCreated,
        coordinationsInitiated: coordinationsAsEitherSide.length,
        coordinationsCompleted: coordinationsAsEitherSide.filter((item) => item.status === "terminee").length,
        receivedProviderValue: !!actor.organizationId && valueByOrganization.has(actor.organizationId)
      };
    })
    .sort((a, b) => (b.lastInteractionAt ?? "").localeCompare(a.lastInteractionAt ?? ""));
}

// --- Pilot metrics (mandat §9) ---------------------------------------------

export interface PilotScorecard {
  onboardedActors: number;
  activeUsers: number;
  substantiveInteractions: number;
  needCount: number;
  capacityCount: number;
  matchesProposed: number;
  coordinationsInitiated: number;
  successfulCoordinations: number;
  providerOrganizationsReceivingOpportunities: number;
}

// buildPilotScorecard — mandat §9. Chaque compteur dérive directement d'un
// tableau existant, jamais stocké séparément (une seconde vérité se
// désynchroniserait) ; jamais de précision fabriquée (mandat "do not
// fabricate analytics precision") — tous des entiers exacts, aucun
// pourcentage ni moyenne devinée.
export function buildPilotScorecard(state: ProductState): PilotScorecard {
  const onboardedActorIds = new Set(state.conversations.filter((item) => item.actorId).map((item) => item.actorId!));
  const activeActorIds = new Set(state.terrainInteractions.filter((item) => item.actorId).map((item) => item.actorId!));
  return {
    onboardedActors: onboardedActorIds.size,
    activeUsers: [...onboardedActorIds].filter((actorId) => activeActorIds.has(actorId)).length,
    substantiveInteractions: state.terrainInteractions.length,
    needCount: state.terrainNeeds.length,
    capacityCount: state.terrainCapacities.length,
    matchesProposed: state.terrainMatches.length,
    coordinationsInitiated: state.terrainCoordinations.length,
    successfulCoordinations: state.terrainCoordinations.filter((item) => item.status === "terminee" && item.outcome?.fulfilled).length,
    providerOrganizationsReceivingOpportunities: buildTerrainValueEvidence(state).length
  };
}

// --- Commercial validation fields (mandat §10) -----------------------------

export function applyRecordCommercialResearch(
  state: ProductState,
  command: Extract<Command, { type: "record_commercial_research" }>
): ProductState {
  if (!command.organizationId && !command.providerActorId) {
    throw new Error("Une fiche de recherche commerciale doit référencer une organisation ou un acteur fournisseur.");
  }
  const existing = state.commercialResearchRecords.find((item) =>
    command.organizationId ? item.organizationId === command.organizationId : item.actorId === command.providerActorId
  );
  const record: CommercialResearchRecord = {
    id: existing?.id ?? id("comres"),
    organizationId: command.organizationId,
    actorId: command.organizationId ? undefined : command.providerActorId,
    contactedForPilot: command.contactedForPilot,
    pilotParticipationAccepted: command.pilotParticipationAccepted,
    willingnessToPayAsked: command.willingnessToPayAsked,
    willingnessToPayResponse: command.willingnessToPayResponse,
    indicativeAmountFcfa: command.indicativeAmountFcfa,
    note: command.note,
    updatedAt: timestamp(),
    updatedByActorId: command.actorId
  };
  const records = existing
    ? state.commercialResearchRecords.map((item) => (item.id === existing.id ? record : item))
    : [...state.commercialResearchRecords, record];
  const next = { ...state, commercialResearchRecords: records };
  return withAudit(
    next,
    command.actorId,
    "commercial_research_record",
    record.id,
    "record_commercial_research",
    `Recherche commerciale enregistrée (contacté : ${command.contactedForPilot ? "oui" : "non"}).`
  );
}

// --- Operational resilience (mandat §12) -----------------------------------

export function applyRecordOperationalFailure(
  state: ProductState,
  command: Extract<Command, { type: "record_operational_failure" }>
): ProductState {
  const failure: OperationalFailure = {
    id: id("opfail"),
    occurredAt: timestamp(),
    channel: command.channel,
    channelAddress: command.channelAddress,
    reason: command.reason,
    resolved: false
  };
  const next = { ...state, operationalFailures: [failure, ...state.operationalFailures] };
  return withAudit(next, "contact-non-identifie", "operational_failure", failure.id, "record_operational_failure", command.reason);
}

export function applyMarkOperationalFailureResolved(
  state: ProductState,
  command: Extract<Command, { type: "mark_operational_failure_resolved" }>
): ProductState {
  const failure = state.operationalFailures.find((item) => item.id === command.failureId);
  if (!failure) throw new Error("Échec opérationnel introuvable.");
  const next = {
    ...state,
    operationalFailures: state.operationalFailures.map((item) => (item.id === failure.id ? { ...item, resolved: true } : item))
  };
  return withAudit(next, command.actorId, "operational_failure", failure.id, "mark_operational_failure_resolved", "Échec marqué comme résolu.");
}

// applyRetryCoordinationNotification — mandat §12, "allow retry where
// technically safe". Remet UNIQUEMENT la notification visée en
// "a_envoyer" — ne retente jamais l'envoi elle-même (E/S), toujours
// retenté par l'appelant serveur via attemptCoordinationNotifications
// (qui ne traite déjà que les notifications "a_envoyer" — aucun
// changement nécessaire là-bas), même discipline qu'
// initiate_terrain_coordination.
function targetLabel(target: TerrainCoordinationNotificationTarget): string {
  return target === "demandeur" ? "demandeur" : "fournisseur";
}

export function applyRetryCoordinationNotification(
  state: ProductState,
  command: Extract<Command, { type: "retry_coordination_notification" }>
): ProductState {
  const coordination = state.terrainCoordinations.find((item) => item.id === command.coordinationId);
  if (!coordination) throw new Error("Coordination introuvable.");
  const notification = coordination.notifications.find((item) => item.target === command.target);
  if (!notification) throw new Error("Notification introuvable pour ce côté de la coordination.");
  if (notification.status !== "echec") throw new Error("Seule une notification en échec peut être retentée.");

  const updated = {
    ...coordination,
    notifications: coordination.notifications.map((item) =>
      item.target === command.target ? { ...item, status: "a_envoyer" as const, failureReason: undefined } : item
    )
  };
  const next = { ...state, terrainCoordinations: state.terrainCoordinations.map((item) => (item.id === coordination.id ? updated : item)) };
  return withAudit(
    next,
    command.actorId,
    "terrain_coordination",
    coordination.id,
    "retry_coordination_notification",
    `Nouvel essai demandé pour la notification ${targetLabel(command.target)} (statut coordination : ${terrainCoordinationStatusLabels[coordination.status]}).`
  );
}
