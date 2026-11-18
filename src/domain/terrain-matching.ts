// Need/Capacity Matching + First Coordination Loop — Sprint T03
// (docs/product/CURRENT_SPRINT.md). Voir types.ts pour l'analyse complète
// de pourquoi ServiceRequest/Capacity/Opportunity/CoordinationSpace/
// ProgrammeOrganizationEngagement ne conviennent pas (mandat §3/§18).
//
// Ce fichier ne connaît rien de WhatsApp ni d'aucun fournisseur IA — il ne
// lit que des TerrainInteraction déjà interprétées (T02). Déterministe de
// bout en bout (mandat §6, "do not let an LLM directly decide that two
// actors should be connected") : aucun appel IA ici, uniquement des
// filtres et comparaisons explicables.
import type {
  Command,
  ProductState,
  Territory,
  TerrainCapacity,
  TerrainCoordination,
  TerrainInteraction,
  TerrainMatch,
  TerrainMatchCategory,
  TerrainMatchPriority,
  TerrainNeed
} from "./types";
import { id, timestamp, withAudit } from "./rules";

// --- Catégorisation déterministe (mandat §5) ------------------------------

const CATEGORY_MARKERS: Array<{ pattern: string; category: TerrainMatchCategory }> = [
  { pattern: "glace", category: "glace_froid" },
  { pattern: "froid", category: "glace_froid" },
  { pattern: "transport", category: "transport" },
  { pattern: "camion", category: "transport" },
  { pattern: "acheteur", category: "acheteur_debouche" },
  { pattern: "client", category: "acheteur_debouche" }
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// deriveMatchCategory — mandat §5 : seules ces 3 catégories, jamais une
// taxonomie générique déduite librement. "équipement (machine à glace)"
// (sujet typique d'un SIGNAL, pas d'un besoin/capacité) matche quand même
// "glace" ici par construction — sans conséquence : seuls les intents
// besoin/capacite peuvent atteindre ce chemin (evaluatePromotion), un
// signal n'est jamais promu.
export function deriveMatchCategory(subject: string | undefined): TerrainMatchCategory | undefined {
  if (!subject) return undefined;
  const normalized = normalize(subject);
  return CATEGORY_MARKERS.find((marker) => normalized.includes(marker.pattern))?.category;
}

// --- Promotion (TerrainInteraction → TerrainNeed/TerrainCapacity) --------

export type PromotionEligibility =
  | { eligible: true; category: TerrainMatchCategory; territoryId: string }
  | { eligible: false; reason: string };

// evaluatePromotion — mandat §4 : "do not fabricate missing values." Une
// interaction incomplète ou marquée à revoir ne peut jamais être promue —
// elle reste simplement une TerrainInteraction non promue, jamais un
// Need/Capacity à moitié rempli.
export function evaluatePromotion(interaction: TerrainInteraction): PromotionEligibility {
  if (interaction.intent !== "besoin" && interaction.intent !== "capacite") {
    return { eligible: false, reason: "L'intention doit être Besoin ou Capacité." };
  }
  if (!interaction.interpretation) {
    return { eligible: false, reason: "Aucune interprétation validée pour cette interaction." };
  }
  if (interaction.interpretation.needsHumanReview) {
    return { eligible: false, reason: "Interprétation marquée « à revoir » — confirmez-la avant de la promouvoir." };
  }
  if (!interaction.actorId) {
    return { eligible: false, reason: "Aucun acteur réel associé à ce message." };
  }
  const territoryId = interaction.territoryId ?? interaction.interpretation.territoryId;
  if (!territoryId) {
    return { eligible: false, reason: "Territoire non résolu." };
  }
  const category = deriveMatchCategory(interaction.interpretation.subject);
  if (!category) {
    return { eligible: false, reason: "Catégorie non reconnue (glace/froid, transport, ou acheteur/débouché uniquement)." };
  }
  return { eligible: true, category, territoryId };
}

export function applyPromoteTerrainInteraction(
  state: ProductState,
  command: Extract<Command, { type: "promote_terrain_interaction" }>
): ProductState {
  const interaction = state.terrainInteractions.find((item) => item.id === command.interactionId);
  if (!interaction) throw new Error("Interaction terrain introuvable.");

  // Idempotence (mandat §14) : une interaction déjà promue ne crée jamais
  // un second Need/Capacity, même rappelée (retry webhook ou double-clic
  // opérateur) — no-op silencieux, pas une erreur.
  const alreadyNeed = state.terrainNeeds.find((item) => item.sourceInteractionId === interaction.id);
  if (alreadyNeed) return state;
  const alreadyCapacity = state.terrainCapacities.find((item) => item.sourceInteractionId === interaction.id);
  if (alreadyCapacity) return state;

  const eligibility = evaluatePromotion(interaction);
  if (!eligibility.eligible) throw new Error(`Interaction non promouvable : ${eligibility.reason}`);

  const actor = state.actors.find((item) => item.id === interaction.actorId);
  const organizationId = actor?.organizationId;
  const interpretation = interaction.interpretation!;

  if (interaction.intent === "besoin") {
    const need: TerrainNeed = {
      id: id("need"),
      sourceInteractionId: interaction.id,
      actorId: interaction.actorId!,
      organizationId,
      territoryId: eligibility.territoryId,
      category: eligibility.category,
      subject: interpretation.subject,
      quantity: interpretation.quantity,
      unit: interpretation.unit,
      requiredTimeWindow: interpretation.timeWindow,
      createdAt: timestamp(),
      status: "active"
    };
    const next = { ...state, terrainNeeds: [...state.terrainNeeds, need] };
    return withAudit(next, command.actorId, "terrain_need", need.id, "promote_terrain_interaction", `Besoin créé depuis l'interaction ${interaction.id}.`);
  }

  const capacity: TerrainCapacity = {
    id: id("cap"),
    sourceInteractionId: interaction.id,
    actorId: interaction.actorId!,
    organizationId,
    territoryId: eligibility.territoryId,
    category: eligibility.category,
    subject: interpretation.subject,
    quantity: interpretation.quantity,
    unit: interpretation.unit,
    availabilityWindow: interpretation.timeWindow,
    createdAt: timestamp(),
    status: "active"
  };
  const next = { ...state, terrainCapacities: [...state.terrainCapacities, capacity] };
  return withAudit(next, command.actorId, "terrain_capacity", capacity.id, "promote_terrain_interaction", `Capacité créée depuis l'interaction ${interaction.id}.`);
}

// --- Moteur de rapprochement (mandat §6) ----------------------------------

export interface MatchCandidate {
  capacity: TerrainCapacity;
  reasons: string[];
  warnings: string[];
  priority: TerrainMatchPriority;
}

function territoryName(territories: Territory[], territoryId: string): string {
  return territories.find((item) => item.id === territoryId)?.name ?? territoryId;
}

// computeMatchCandidates — pure, déterministe (mandat §6). Filtres durs
// (jamais présentés, jamais contournables) : même catégorie, même
// territoire, capacité active, fournisseur ≠ demandeur. Le reste
// (quantité, fenêtre temporelle, confiance) devient des raisons ou des
// avertissements explicables, jamais un score opaque.
export function computeMatchCandidates(state: ProductState, need: TerrainNeed): MatchCandidate[] {
  return state.terrainCapacities
    .filter((capacity) => capacity.status === "active")
    .filter((capacity) => capacity.category === need.category)
    .filter((capacity) => capacity.territoryId === need.territoryId)
    .filter((capacity) => capacity.actorId !== need.actorId)
    .map((capacity) => {
      const reasons: string[] = [
        `Catégorie compatible (${need.category}).`,
        `Même territoire (${territoryName(state.territories, need.territoryId)}).`
      ];
      const warnings: string[] = [];

      if (need.requiredTimeWindow && capacity.availabilityWindow) {
        if (need.requiredTimeWindow === capacity.availabilityWindow) {
          reasons.push(`Fenêtre temporelle compatible (${capacity.availabilityWindow}).`);
        } else {
          warnings.push(`Fenêtre temporelle différente : besoin « ${need.requiredTimeWindow} », capacité « ${capacity.availabilityWindow} ».`);
        }
      }

      if (need.quantity !== undefined && capacity.quantity !== undefined) {
        if (need.unit && capacity.unit && need.unit !== capacity.unit) {
          warnings.push(`Unités différentes : besoin en ${need.unit}, capacité en ${capacity.unit} — à vérifier manuellement.`);
        } else if (capacity.quantity < need.quantity) {
          warnings.push(`Quantité disponible (${capacity.quantity}${capacity.unit ?? ""}) inférieure au besoin (${need.quantity}${need.unit ?? ""}).`);
        } else {
          reasons.push(`Quantité suffisante (${capacity.quantity}${capacity.unit ?? ""} disponible pour ${need.quantity}${need.unit ?? ""} demandé).`);
        }
      }

      const providerActor = state.actors.find((item) => item.id === capacity.actorId);
      reasons.push(`Fournisseur : ${providerActor?.name ?? "acteur inconnu"} (déclaré, non vérifié).`);

      return { capacity, reasons, warnings, priority: warnings.length === 0 ? ("haute" as const) : ("moyenne" as const) };
    });
}

// applyRefreshTerrainMatches — mandat §6/§14. Persiste chaque nouveau
// couple (need, capacity) jamais encore proposé (idempotent : rappeler
// cette commande ne duplique rien) ; fait aussi passer "perime" tout
// match "propose" existant dont la capacité n'est plus active (mandat
// "expired capacity does not match", y compris rétroactivement).
export function applyRefreshTerrainMatches(state: ProductState, command: Extract<Command, { type: "refresh_terrain_matches" }>): ProductState {
  const need = state.terrainNeeds.find((item) => item.id === command.needId);
  if (!need) throw new Error("Besoin introuvable.");

  const existingMatches = state.terrainMatches.filter((item) => item.needId === need.id);
  const staleToPerime = existingMatches
    .filter((match) => match.status === "propose")
    .filter((match) => {
      const capacity = state.terrainCapacities.find((item) => item.id === match.capacityId);
      return !capacity || capacity.status !== "active";
    })
    .map((match) => match.id);

  let matches = state.terrainMatches.map((match) =>
    staleToPerime.includes(match.id) ? { ...match, status: "perime" as const } : match
  );

  const candidates = computeMatchCandidates(state, need);
  const existingCapacityIds = new Set(existingMatches.map((item) => item.capacityId));
  const newMatches: TerrainMatch[] = candidates
    .filter((candidate) => !existingCapacityIds.has(candidate.capacity.id))
    .map((candidate) => ({
      id: id("match"),
      needId: need.id,
      capacityId: candidate.capacity.id,
      status: "propose" as const,
      reasons: candidate.reasons,
      warnings: candidate.warnings,
      priority: candidate.priority,
      createdAt: timestamp()
    }));

  matches = [...matches, ...newMatches];
  const next = { ...state, terrainMatches: matches };
  const detail =
    newMatches.length > 0
      ? `${newMatches.length} candidat(s) identifié(s) pour le besoin ${need.id}.`
      : `Aucun nouveau candidat pour le besoin ${need.id}.`;
  return withAudit(next, command.actorId, "terrain_need", need.id, "refresh_terrain_matches", detail);
}

export function applyRejectTerrainMatch(state: ProductState, command: Extract<Command, { type: "reject_terrain_match" }>): ProductState {
  const match = state.terrainMatches.find((item) => item.id === command.matchId);
  if (!match) throw new Error("Match introuvable.");
  if (match.status !== "propose") throw new Error("Seul un match proposé peut être rejeté.");
  const updated: TerrainMatch = { ...match, status: "rejete", rejectedByActorId: command.actorId, rejectedAt: timestamp(), rejectionNote: command.note };
  const next = { ...state, terrainMatches: state.terrainMatches.map((item) => (item.id === match.id ? updated : item)) };
  return withAudit(next, command.actorId, "terrain_match", match.id, "reject_terrain_match", command.note?.trim() ? `Match rejeté : ${command.note.trim()}` : "Match rejeté.");
}

// --- Coordination (mandat §7/§8/§9) ---------------------------------------

function findActorConversationChannel(state: ProductState, actorId: string) {
  return state.conversations.find((item) => item.actorId === actorId);
}

export function applyInitiateTerrainCoordination(
  state: ProductState,
  command: Extract<Command, { type: "initiate_terrain_coordination" }>
): ProductState {
  const match = state.terrainMatches.find((item) => item.id === command.matchId);
  if (!match) throw new Error("Match introuvable.");

  // Idempotence (mandat §15, "duplicate initiation is idempotent") : une
  // coordination déjà créée pour ce match n'en crée jamais une seconde.
  const existing = state.terrainCoordinations.find((item) => item.matchId === match.id);
  if (existing) return state;

  if (match.status !== "propose") throw new Error("Seul un match proposé peut être converti en coordination.");
  const need = state.terrainNeeds.find((item) => item.id === match.needId);
  const capacity = state.terrainCapacities.find((item) => item.id === match.capacityId);
  if (!need || !capacity) throw new Error("Besoin ou capacité introuvable pour ce match.");
  if (need.status !== "active") throw new Error("Ce besoin n'est plus actif.");
  if (capacity.status !== "active") throw new Error("Cette capacité n'est plus active.");

  const now = timestamp();

  function notificationFor(targetActorId: string, target: "demandeur" | "fournisseur", body: string) {
    const conversation = findActorConversationChannel(state, targetActorId);
    if (!conversation) {
      return { target, channel: "whatsapp" as const, status: "echec" as const, body, preparedAt: now, failureReason: "Aucun canal connu pour cet acteur." };
    }
    return { target, channel: conversation.channel, status: "a_envoyer" as const, body, preparedAt: now };
  }

  const coordination: TerrainCoordination = {
    id: id("coord"),
    matchId: match.id,
    needId: need.id,
    capacityId: capacity.id,
    requesterActorId: need.actorId,
    providerActorId: capacity.actorId,
    requesterOrganizationId: need.organizationId,
    providerOrganizationId: capacity.organizationId,
    territoryId: need.territoryId,
    sourceInteractionIds: [need.sourceInteractionId, capacity.sourceInteractionId],
    status: "proposee",
    notifications: [
      notificationFor(need.actorId, "demandeur", command.requesterMessage),
      notificationFor(capacity.actorId, "fournisseur", command.providerMessage)
    ],
    createdAt: now,
    createdByActorId: command.actorId
  };

  let next: ProductState = {
    ...state,
    terrainCoordinations: [...state.terrainCoordinations, coordination],
    terrainMatches: state.terrainMatches.map((item) => (item.id === match.id ? { ...item, status: "converti" as const } : item)),
    terrainNeeds: state.terrainNeeds.map((item) => (item.id === need.id ? { ...item, status: "en_coordination" as const } : item)),
    terrainCapacities: state.terrainCapacities.map((item) => (item.id === capacity.id ? { ...item, status: "engagee" as const } : item))
  };
  next = withAudit(next, command.actorId, "terrain_coordination", coordination.id, "initiate_terrain_coordination", `Coordination initiée depuis le match ${match.id}.`);
  return next;
}

// applyRecordTerrainCoordinationResponse — mandat §10. requesterResponse/
// providerResponse sont deux faits indépendants (voir doctrine dans
// types.ts) : un refus d'un côté clôt immédiatement la coordination
// (echouee, jamais une coordination à moitié vivante) ; une acceptation
// ne connecte QUE si l'autre côté a DÉJÀ accepté — jamais devinée.
export function applyRecordTerrainCoordinationResponse(
  state: ProductState,
  command: Extract<Command, { type: "record_terrain_coordination_response" }>
): ProductState {
  const coordination = state.terrainCoordinations.find((item) => item.id === command.coordinationId);
  if (!coordination) throw new Error("Coordination introuvable.");
  if (coordination.status !== "proposee") {
    throw new Error(`Une coordination « ${coordination.status} » n'accepte plus de nouvelle réponse.`);
  }

  const updated: TerrainCoordination =
    command.side === "demandeur" ? { ...coordination, requesterResponse: command.response } : { ...coordination, providerResponse: command.response };

  if (command.response === "refusee") {
    updated.status = "echouee";
  } else if (updated.requesterResponse === "acceptee" && updated.providerResponse === "acceptee") {
    updated.status = "connectee";
  }

  const next = { ...state, terrainCoordinations: state.terrainCoordinations.map((item) => (item.id === coordination.id ? updated : item)) };
  const sideLabel = command.side === "demandeur" ? "Demandeur" : "Fournisseur";
  return withAudit(
    next,
    command.actorId,
    "terrain_coordination",
    coordination.id,
    "record_terrain_coordination_response",
    `${sideLabel} : ${command.response}${updated.status === "connectee" ? " — les deux côtés ont accepté, coordination connectée." : ""}`
  );
}

export function applyUpdateTerrainCoordinationStatus(
  state: ProductState,
  command: Extract<Command, { type: "update_terrain_coordination_status" }>
): ProductState {
  const coordination = state.terrainCoordinations.find((item) => item.id === command.coordinationId);
  if (!coordination) throw new Error("Coordination introuvable.");

  if (command.status === "terminee" && coordination.status !== "connectee") {
    throw new Error("Une coordination ne peut être terminée qu'une fois connectée.");
  }
  if (coordination.status === "terminee" || coordination.status === "echouee") {
    throw new Error(`Une coordination déjà « ${coordination.status} » ne peut plus changer d'état.`);
  }
  if (command.outcome && typeof command.outcome.fulfilled !== "boolean") {
    throw new Error("L'issue doit préciser si le besoin a été satisfait.");
  }

  const previousStatus = coordination.status;
  const outcome = command.outcome
    ? {
        fulfilled: command.outcome.fulfilled,
        note: command.outcome.note,
        quantity: command.outcome.quantity,
        unit: command.outcome.unit,
        failureReason: command.outcome.failureReason,
        recordedByActorId: command.actorId,
        recordedAt: timestamp()
      }
    : coordination.outcome;

  const updated: TerrainCoordination = { ...coordination, status: command.status, outcome };
  let next: ProductState = { ...state, terrainCoordinations: state.terrainCoordinations.map((item) => (item.id === coordination.id ? updated : item)) };

  // Effet de bord explicite (mandat §11/§16) : une issue "satisfaite"
  // referme aussi le Need d'origine, pour que l'inbox de rapprochement ne
  // continue pas à le proposer — jamais l'inverse (un besoin non comblé
  // reste "en_coordination", pas remis "actif" automatiquement : un
  // opérateur déciderait explicitement de relancer, hors périmètre T03).
  if (command.status === "terminee" && outcome?.fulfilled) {
    next = { ...next, terrainNeeds: next.terrainNeeds.map((item) => (item.id === coordination.needId ? { ...item, status: "satisfaite" as const } : item)) };
  }

  const detail = `${previousStatus} → ${command.status}${command.outcome ? ` — ${command.outcome.fulfilled ? "besoin satisfait" : "besoin non satisfait"}` : ""}`;
  return withAudit(next, command.actorId, "terrain_coordination", coordination.id, "update_terrain_coordination_status", detail);
}

export function applyRecordCoordinationNotificationResult(
  state: ProductState,
  command: Extract<Command, { type: "record_coordination_notification_result" }>
): ProductState {
  const coordination = state.terrainCoordinations.find((item) => item.id === command.coordinationId);
  if (!coordination) throw new Error("Coordination introuvable pour enregistrer le résultat d'une notification.");
  const updated: TerrainCoordination = {
    ...coordination,
    notifications: coordination.notifications.map((notification) =>
      notification.target === command.target
        ? { ...notification, status: command.status, sentAt: command.status === "envoyee" ? timestamp() : notification.sentAt, failureReason: command.failureReason }
        : notification
    )
  };
  const next = { ...state, terrainCoordinations: state.terrainCoordinations.map((item) => (item.id === coordination.id ? updated : item)) };
  return withAudit(
    next,
    coordination.createdByActorId,
    "terrain_coordination",
    coordination.id,
    "record_coordination_notification_result",
    `Notification ${command.target} : ${command.status}${command.failureReason ? ` (${command.failureReason})` : ""}.`
  );
}

// --- Revenue evidence (mandat §12) ----------------------------------------

export interface TerrainValueEvidence {
  organizationId: string;
  opportunitiesReceived: number;
  opportunitiesAccepted: number;
  successfulCoordinations: number;
}

// buildTerrainValueEvidence — mandat §12 : preuve de valeur dérivée, jamais
// stockée séparément (une seconde vérité se désynchroniserait). "Reçue" =
// une coordination où cette organisation est fournisseur ; "acceptée" =
// providerResponse === "acceptee" (ou la coordination est déjà
// connectee/terminee, ce qui implique cette réponse) ; "réussie" =
// terminee avec outcome.fulfilled.
export function buildTerrainValueEvidence(state: ProductState): TerrainValueEvidence[] {
  const byOrganization = new Map<string, TerrainValueEvidence>();
  for (const coordination of state.terrainCoordinations) {
    if (!coordination.providerOrganizationId) continue;
    const entry = byOrganization.get(coordination.providerOrganizationId) ?? {
      organizationId: coordination.providerOrganizationId,
      opportunitiesReceived: 0,
      opportunitiesAccepted: 0,
      successfulCoordinations: 0
    };
    entry.opportunitiesReceived += 1;
    const providerAccepted = coordination.providerResponse === "acceptee" || coordination.status === "connectee" || coordination.status === "terminee";
    if (providerAccepted) entry.opportunitiesAccepted += 1;
    if (coordination.status === "terminee" && coordination.outcome?.fulfilled) entry.successfulCoordinations += 1;
    byOrganization.set(coordination.providerOrganizationId, entry);
  }
  return [...byOrganization.values()];
}
