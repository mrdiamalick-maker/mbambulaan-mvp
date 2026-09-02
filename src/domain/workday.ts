// Workday — LOT 9 (mandat "Operating Experience — faire disparaître les
// modules derrière le travail réel"). Une projection PURE, même discipline
// que territory-intelligence.ts (LOT 5) et actor-network.ts (LOT 7) :
// aucun stockage, recalculée à chaque appel à partir de ProductState —
// jamais un second modèle de "tâches" (mandat §36, "aucun Task Engine").
//
// buildWorkdayView répond à 3 questions, jamais plus :
// 1. Qu'est-ce qui demande MON attention aujourd'hui ? (myAttention)
// 2. Qu'est-ce que j'attends des autres ? (waitingOnOthers)
// 3. Qu'est-ce qui a changé récemment ? (whatChanged)
//
// Aucune responsabilité fabriquée (mandat §28) : chaque item s'appuie sur
// une relation réelle déjà modélisée — Situation.responsibleId,
// Commitment.actorId, FieldMission.responsibleActorId,
// Organization.verificationStatus — jamais "parce que le rôle est
// coordinateur". Aucune décision en attente fabriquée non plus (§29) :
// le prochain geste légitime d'une Situation est dérivé d'availableAction
// (rules.ts, déjà utilisé par le reste du produit), jamais un nouvel objet
// PendingDecision.
import type { FieldMission, Organization, ProductState, Role, Situation } from "./types";
import { availableAction, type WorkflowAction } from "./rules";
import { computeIntelligenceFeed } from "./intelligence-feed";

export type WorkdayCategory =
  | "decision"
  | "coordination"
  | "bloque"
  | "echeance"
  | "mission"
  | "qualification_finding"
  | "qualification_besoin"
  | "qualification_reseau"
  | "gouvernance";

export type WorkdayUrgency = "critique" | "vigilance" | "normale";

export interface WorkdayItem {
  id: string;
  category: WorkdayCategory;
  title: string;
  why: string;
  ctaLabel: string;
  href: string;
  urgency: WorkdayUrgency;
  dueAt?: string;
  territoryName?: string;
}

export interface WorkdayWaitingItem {
  id: string;
  title: string;
  detail: string;
  href: string;
}

export interface WorkdayChangeItem {
  id: string;
  title: string;
  detail: string;
  href: string;
  at: string;
}

export interface WorkdayView {
  myAttention: WorkdayItem[];
  top3: WorkdayItem[];
  waitingOnOthers: WorkdayWaitingItem[];
  whatChanged: WorkdayChangeItem[];
}

// --- Priorisation explicable (mandat §5) ------------------------------
//
// Pas de score global arbitraire : un ordre déterministe à deux clés,
// documenté ici plutôt qu'implicite dans le tri.
// 1. urgence/critique d'abord, quelle que soit la catégorie ;
// 2. à urgence égale, la catégorie ordonne : décision explicite attendue
//    de moi > échéance/blocage/mission > connaissance à qualifier ;
// 3. à catégorie égale, l'échéance la plus proche d'abord ;
// 4. à égalité complète, l'identifiant (stabilité du tri, jamais un ordre
//    d'insertion qui varierait d'un appel à l'autre).
const URGENCY_RANK: Record<WorkdayUrgency, number> = { critique: 0, vigilance: 1, normale: 2 };
const CATEGORY_RANK: Record<WorkdayCategory, number> = {
  decision: 0,
  bloque: 1,
  coordination: 2,
  echeance: 2,
  mission: 2,
  qualification_finding: 3,
  qualification_besoin: 3,
  qualification_reseau: 3,
  gouvernance: 3
};

export function sortWorkdayItems(items: WorkdayItem[]): WorkdayItem[] {
  return items.slice().sort((left, right) => {
    return (
      URGENCY_RANK[left.urgency] - URGENCY_RANK[right.urgency] ||
      CATEGORY_RANK[left.category] - CATEGORY_RANK[right.category] ||
      (left.dueAt ? new Date(left.dueAt).getTime() : Infinity) - (right.dueAt ? new Date(right.dueAt).getTime() : Infinity) ||
      left.id.localeCompare(right.id)
    );
  });
}

// --- Situations : prochain geste légitime, jamais fabriqué -------------

const SITUATION_ACTION_LABEL: Partial<Record<WorkflowAction, string>> = {
  qualify: "Qualifier la situation",
  prioritize: "Prioriser la situation",
  coordinate: "Prendre une décision",
  start_intervention: "Démarrer l’intervention",
  record_result: "Enregistrer le résultat",
  resume: "Reprendre la situation",
  close: "Prendre une décision"
};

function situationUrgency(situation: Situation): WorkdayUrgency {
  if (situation.priority === "critique") return "critique";
  if (situation.priority === "haute") return "vigilance";
  return "normale";
}

// Rôles qui coordonnent réellement des Situations (mandat §9/§12) — pas
// gestionnaire_organisation, dont le travail est le réseau/l'organisation
// (§11), pas le territoire.
const SITUATION_COORDINATION_ROLES: Role[] = ["administrateur", "coordinateur"];

function buildSituationItems(state: ProductState, actorId: string, role: Role, territoryIds: Set<string>): WorkdayItem[] {
  if (!SITUATION_COORDINATION_ROLES.includes(role)) return [];
  const items: WorkdayItem[] = [];

  for (const situation of state.situations) {
    if (situation.status === "reglee") continue;
    const isMine = situation.responsibleId === actorId;
    const inScope = territoryIds.size === 0 || territoryIds.has(situation.territoryId);
    const isUnassignedInScope = !situation.responsibleId && inScope;
    if (!isMine && !isUnassignedInScope) continue;

    const action = availableAction(situation.status);
    const ctaLabel = action ? SITUATION_ACTION_LABEL[action] : undefined;
    if (!ctaLabel) continue;

    const territory = state.territories.find((item) => item.id === situation.territoryId);
    const category: WorkdayCategory = situation.status === "attente" ? "bloque" : action === "coordinate" || action === "close" ? "decision" : "coordination";

    items.push({
      id: `situation:${situation.id}`,
      category,
      title: situation.title,
      why: isMine
        ? `Vous êtes responsable de cette situation. ${situation.nextStep}`
        : `Aucun responsable assigné sur ${territory?.name ?? "ce territoire"} — ${situation.nextStep}`,
      ctaLabel,
      href: `/app/situations/${situation.id}`,
      urgency: situationUrgency(situation),
      dueAt: situation.dueAt,
      territoryName: territory?.name
    });
  }

  return items;
}

// --- Commitments : échéances qui m'appartiennent réellement ------------

function dueUrgency(dueAt: string | undefined, now: number): WorkdayUrgency {
  if (!dueAt) return "normale";
  const due = new Date(dueAt).getTime();
  if (!Number.isFinite(due)) return "normale";
  const hoursLeft = (due - now) / (60 * 60 * 1000);
  if (hoursLeft <= 48) return "critique";
  if (hoursLeft <= 24 * 7) return "vigilance";
  return "normale";
}

function buildCommitmentItems(state: ProductState, actorId: string, nowMs: number): WorkdayItem[] {
  const items: WorkdayItem[] = [];
  for (const space of state.coordinationSpaces) {
    for (const commitment of space.commitments) {
      if (commitment.actorId !== actorId || commitment.status === "terminee") continue;
      const situation = space.situationId ? state.situations.find((item) => item.id === space.situationId) : undefined;
      const blocked = commitment.status === "bloquee";
      items.push({
        // Identifiant scopé par CoordinationSpace, pas seulement par
        // Commitment.id : rien dans le modèle ne garantit l'unicité de
        // Commitment.id à travers tout ProductState (deux espaces de
        // coordination distincts peuvent légitimement porter le même id
        // d'engagement, constaté sur le Demo World) — un identifiant
        // d'item non ambigu reste indispensable pour un tri/deep-link
        // fiables.
        id: `commitment:${space.id}:${commitment.id}`,
        category: blocked ? "bloque" : "echeance",
        title: commitment.label,
        why: blocked ? `Engagement bloqué${situation ? ` — ${situation.title}` : ""}.` : `Échéance du ${new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(commitment.dueAt))}${situation ? ` — ${situation.title}` : ""}.`,
        ctaLabel: blocked ? "Débloquer l’engagement" : "Suivre l’engagement",
        href: situation ? `/app/situations/${situation.id}` : "/app/coordination",
        urgency: blocked ? "critique" : dueUrgency(commitment.dueAt, nowMs),
        dueAt: commitment.dueAt
      });
    }
  }
  return items;
}

// --- Missions terrain : uniquement le responsable réel ------------------

function buildMissionItems(state: ProductState, actorId: string, nowMs: number): WorkdayItem[] {
  const active: FieldMission["status"][] = ["a_preparer", "planifiee", "en_cours"];
  return state.fieldMissions
    .filter((mission) => mission.responsibleActorId === actorId && active.includes(mission.status))
    .map((mission) => ({
      id: `mission:${mission.id}`,
      category: "mission" as const,
      title: mission.title,
      why: mission.reason,
      ctaLabel: mission.status === "en_cours" ? "Enregistrer une observation" : "Démarrer la mission",
      href: "/app/coordination?view=missions",
      urgency: dueUrgency(mission.dueAt, nowMs),
      dueAt: mission.dueAt
    }));
}

// --- Findings / détections à qualifier ----------------------------------
//
// Mêmes rôles que record_finding/dismiss_detection (permissions.ts,
// mirroré ici plutôt qu'importé : le domaine ne dépend jamais du serveur).
const FINDING_REVIEW_ROLES: Role[] = ["administrateur", "coordinateur", "gestionnaire_organisation"];

function buildFindingItems(state: ProductState, role: Role, territoryIds: Set<string>): WorkdayItem[] {
  if (!FINDING_REVIEW_ROLES.includes(role)) return [];
  const items: WorkdayItem[] = [];
  const inScope = (ids: string[]) => territoryIds.size === 0 || ids.some((id) => territoryIds.has(id));

  for (const entry of computeIntelligenceFeed(state)) {
    if (entry.status !== "nouvelle") continue;
    if (!inScope([entry.alert.territoryId])) continue;
    items.push({
      id: `detection:${entry.alert.id}`,
      category: "qualification_finding",
      title: `Détection Mbàmbulaan — ${entry.alert.title}`,
      why: entry.alert.description,
      ctaLabel: "Examiner la détection",
      href: "/app/coordination?view=detections",
      urgency: entry.alert.attentionLevel,
      territoryName: state.territories.find((item) => item.id === entry.alert.territoryId)?.name
    });
  }

  for (const finding of state.findings) {
    if (finding.status !== "proposed" || !inScope(finding.territoryIds)) continue;
    items.push({
      id: `finding:${finding.id}`,
      category: "qualification_finding",
      title: finding.title,
      why: "Constat proposé — décision de confirmation, remplacement ou rejet attendue.",
      ctaLabel: "Confirmer le constat",
      href: "/app/coordination?view=detections",
      urgency: "normale"
    });
  }

  return items;
}

// --- CollectiveNeed / ProgramOpportunity nécessitant une étape humaine --

const DEVELOPMENT_ROLES: Role[] = ["administrateur", "coordinateur", "gestionnaire_organisation"];

function buildDevelopmentItems(state: ProductState, role: Role, territoryIds: Set<string>): WorkdayItem[] {
  if (!DEVELOPMENT_ROLES.includes(role)) return [];
  const inScope = (ids: string[]) => territoryIds.size === 0 || ids.some((id) => territoryIds.has(id));
  const items: WorkdayItem[] = [];

  for (const need of state.collectiveNeeds) {
    if (!["emerging", "qualifying"].includes(need.status) || !inScope(need.territoryIds)) continue;
    items.push({
      id: `need:${need.id}`,
      category: "qualification_besoin",
      title: need.title,
      why: "Besoin collectif à qualifier avant toute conversion en opportunité de programme.",
      ctaLabel: "Qualifier le besoin collectif",
      href: `/app/initiatives?need=${need.id}`,
      urgency: "normale"
    });
  }

  for (const opportunity of state.programOpportunities) {
    if (!["detected", "qualifying"].includes(opportunity.status) || !inScope(opportunity.territoryIds)) continue;
    items.push({
      id: `opportunity:${opportunity.id}`,
      category: "qualification_besoin",
      title: opportunity.problem,
      why: "Opportunité de programme détectée — qualification humaine requise avant conception.",
      ctaLabel: "Qualifier l’opportunité",
      href: `/app/initiatives?opportunity=${opportunity.id}`,
      urgency: "normale"
    });
  }

  return items;
}

// --- Réseau : capacités de mon organisation à revoir (gestionnaire) -----

function buildNetworkItems(state: ProductState, actorId: string, role: Role, nowMs: number): WorkdayItem[] {
  if (role !== "gestionnaire_organisation") return [];
  const actor = state.actors.find((item) => item.id === actorId);
  if (!actor?.organizationId) return [];
  const infrastructureIds = new Set(state.infrastructures.filter((item) => item.organizationId === actor.organizationId).map((item) => item.id));
  const nowIso = new Date(nowMs).toISOString();
  const staleCount = state.capacities.filter((capacity) => infrastructureIds.has(capacity.infrastructureId) && (capacity.status !== "disponible" || capacity.validUntil < nowIso)).length;
  if (staleCount === 0) return [];
  return [
    {
      id: "network:capacities-stale",
      category: "qualification_reseau",
      title: `${staleCount} capacité${staleCount > 1 ? "s" : ""} de votre organisation à revérifier`,
      why: "Une disponibilité déclarée n’est plus certaine à la date de référence — à revérifier avant toute mobilisation.",
      ctaLabel: "Revoir les capacités",
      href: "/app/organisation",
      urgency: "vigilance"
    }
  ];
}

// --- Gouvernance : organisations candidates (administrateur) -----------

function buildGovernanceItems(state: ProductState, role: Role): WorkdayItem[] {
  if (role !== "administrateur") return [];
  const candidates = state.organizations.filter((item: Organization) => item.verificationStatus === "declaree");
  if (candidates.length === 0) return [];
  return [
    {
      id: "governance:candidate-organizations",
      category: "gouvernance",
      title: `${candidates.length} organisation${candidates.length > 1 ? "s" : ""} candidate${candidates.length > 1 ? "s" : ""} à vérifier`,
      why: "Déclarée via une qualification de contribution réseau — jamais vérifiée automatiquement.",
      ctaLabel: "Vérifier l’organisation",
      href: "/app/organisation",
      urgency: "normale"
    }
  ];
}

// --- Ce que j'attends des autres (mandat §4/§27) ------------------------

function buildWaitingOnOthers(state: ProductState, actorId: string, role: Role, territoryIds: Set<string>): WorkdayWaitingItem[] {
  if (!SITUATION_COORDINATION_ROLES.includes(role)) return [];
  const waiting: WorkdayWaitingItem[] = [];
  const mySituationIds = new Set(
    state.situations.filter((situation) => situation.responsibleId === actorId || (!situation.responsibleId && (territoryIds.size === 0 || territoryIds.has(situation.territoryId)))).map((item) => item.id)
  );

  for (const space of state.coordinationSpaces) {
    if (!space.situationId || !mySituationIds.has(space.situationId)) continue;
    const situation = state.situations.find((item) => item.id === space.situationId);
    for (const commitment of space.commitments) {
      if (commitment.actorId === actorId || commitment.status === "terminee") continue;
      const actor = state.actors.find((item) => item.id === commitment.actorId);
      waiting.push({
        id: `waiting-commitment:${space.id}:${commitment.id}`,
        title: commitment.label,
        detail: `${actor?.name ?? "Acteur à confirmer"} — ${situation?.title ?? ""}`,
        href: situation ? `/app/situations/${situation.id}` : "/app/coordination"
      });
    }
  }

  for (const opportunity of state.programOpportunities) {
    if (opportunity.status !== "paused") continue;
    if (!(territoryIds.size === 0 || opportunity.territoryIds.some((id) => territoryIds.has(id)))) continue;
    waiting.push({
      id: `waiting-opportunity:${opportunity.id}`,
      title: opportunity.problem,
      detail: "Opportunité de programme en pause.",
      href: `/app/initiatives?opportunity=${opportunity.id}`
    });
  }

  return waiting;
}

// --- Ce qui a changé (mandat §25/§26) -----------------------------------

function buildWhatChanged(state: ProductState, role: Role, territoryIds: Set<string>): WorkdayChangeItem[] {
  if (!SITUATION_COORDINATION_ROLES.includes(role)) return [];
  const inScope = (ids: string[]) => territoryIds.size === 0 || ids.some((id) => territoryIds.has(id));
  const changes: WorkdayChangeItem[] = [];

  for (const result of state.results) {
    if (!inScope(result.territoryIds)) continue;
    changes.push({ id: `change-result:${result.id}`, title: result.title, detail: "Résultat enregistré.", href: "/app/pilotage", at: result.recordedAt });
  }
  for (const finding of state.findings) {
    if (finding.status !== "confirmed" || !finding.reviewedAt || !inScope(finding.territoryIds)) continue;
    changes.push({ id: `change-finding:${finding.id}`, title: finding.title, detail: "Constat confirmé.", href: "/app/coordination?view=detections", at: finding.reviewedAt });
  }
  for (const mission of state.fieldMissions) {
    if (mission.status !== "realisee" || !inScope(mission.territoryIds)) continue;
    const lastEntry = mission.history[mission.history.length - 1];
    if (!lastEntry) continue;
    changes.push({ id: `change-mission:${mission.id}`, title: mission.title, detail: "Mission réalisée.", href: "/app/coordination?view=missions", at: lastEntry.at });
  }

  return changes.sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime()).slice(0, 5);
}

export function buildWorkdayView(state: ProductState, actorId: string, role: Role, now: string = new Date().toISOString()): WorkdayView {
  const actor = state.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);
  const nowMs = new Date(now).getTime();

  const myAttention = sortWorkdayItems([
    ...buildSituationItems(state, actorId, role, territoryIds),
    ...buildCommitmentItems(state, actorId, nowMs),
    ...buildMissionItems(state, actorId, nowMs),
    ...buildFindingItems(state, role, territoryIds),
    ...buildDevelopmentItems(state, role, territoryIds),
    ...buildNetworkItems(state, actorId, role, nowMs),
    ...buildGovernanceItems(state, role)
  ]);

  return {
    myAttention,
    top3: myAttention.slice(0, 3),
    waitingOnOthers: buildWaitingOnOthers(state, actorId, role, territoryIds),
    whatChanged: buildWhatChanged(state, role, territoryIds)
  };
}

