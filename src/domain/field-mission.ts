// FieldMission / Observation — troisième capacité fondamentale de
// Mbàmbulaan (LOT 3, mandat "Terrain — observer, vérifier et fiabiliser la
// réalité") : BESOIN DE CONNAISSANCE/VÉRIFICATION → MISSION TERRAIN →
// OBSERVATION → PREUVE → SIGNAL/CONNAISSANCE → MISE À JOUR DU DOSSIER →
// CONSÉQUENCE VISIBLE. Fichier dédié, même discipline de séparation que
// knowledge-pipeline.ts (dont il réutilise les primitives via rules.ts) :
// ce pipeline terrain est un domaine fonctionnel distinct de la machine à
// états de Situation.
//
// Discipline commune rappelée une fois ici plutôt que répétée à chaque
// fonction :
// - create_field_mission ne crée JAMAIS de Commitment (mandat §8, "Mission
//   ≠ Commitment" — la Mission décrit le travail, pas l'engagement d'un
//   acteur à le faire). L'ancien plan_field_commitment (Ministry) reste
//   inchangé, chemin parallèle conservé pour compatibilité.
// - record_observation ne touche JAMAIS state.findings / state.situations
//   / state.collectiveNeeds (mandat §12, "Observation ≠ Situation" — une
//   Observation n'ouvre jamais automatiquement de Situation) et produit
//   TOUJOURS un Signal canonique (mandat §12, aucune perte de source).
// - Aucune promotion automatique : un Knowledge Gap (Finding) référencé par
//   une Mission ne change de statut que par une commande explicite
//   (update_finding_status, déjà existante) — jamais ici.
import type { Command, Evidence, FieldMission, FieldMissionStatus, Observation, ProductState, Signal } from "./types";
import { fieldMissionStatusLabels, observationNatureLabels } from "./types";
import { history, id, timestamp, withAudit } from "./rules";

function requireTerritories(state: ProductState, territoryIds: string[], label: string) {
  if (territoryIds.length === 0) throw new Error(`${label} doit couvrir au moins un territoire.`);
  for (const territoryId of territoryIds) {
    if (!state.territories.some((item) => item.id === territoryId)) throw new Error(`Territoire inconnu : ${territoryId}.`);
  }
}

// create_field_mission (mandat §4/§5/§7) — jamais automatique : toujours
// déclenchée par une action humaine explicite ("Organiser une vérification
// terrain"), y compris quand elle part d'un Knowledge Gap. Statut de
// départ toujours "planifiee" (mandat §7 : les champs minimum — titre,
// objectif, territoire, raison, consignes — sont déjà réunis dès la
// création explicite, pas de geste "juste à préparer" distinct dans ce
// lot).
function applyCreateFieldMission(state: ProductState, command: Extract<Command, { type: "create_field_mission" }>): ProductState {
  if (!command.title.trim()) throw new Error("Le titre de la mission est obligatoire.");
  if (!command.objective.trim()) throw new Error("L'objectif de la mission est obligatoire.");
  if (!command.reason.trim()) throw new Error("La raison de la mission est obligatoire.");
  requireTerritories(state, command.territoryIds, "Une mission terrain");
  if (command.observationPoints.length === 0 || command.observationPoints.every((point) => !point.trim())) {
    throw new Error("Une mission terrain doit préciser au moins un axe d'observation.");
  }
  if (command.responsibleActorId && !state.actors.some((item) => item.id === command.responsibleActorId)) {
    throw new Error("Responsable introuvable.");
  }
  if (command.knowledgeGapFindingId && !state.findings.some((item) => item.id === command.knowledgeGapFindingId)) {
    throw new Error("Le constat de connaissance manquante référencé est introuvable.");
  }
  if (command.findingId && !state.findings.some((item) => item.id === command.findingId)) {
    throw new Error("Le constat référencé est introuvable.");
  }
  if (command.collectiveNeedId && !state.collectiveNeeds.some((item) => item.id === command.collectiveNeedId)) {
    throw new Error("Le besoin collectif référencé est introuvable.");
  }
  if (command.situationId && !state.situations.some((item) => item.id === command.situationId)) {
    throw new Error("La situation référencée est introuvable.");
  }

  const mission: FieldMission = {
    id: id("mission"),
    title: command.title.trim(),
    objective: command.objective.trim(),
    territoryIds: command.territoryIds,
    reason: command.reason.trim(),
    responsibleActorId: command.responsibleActorId,
    dueAt: command.dueAt,
    status: "planifiee",
    observationPoints: command.observationPoints.map((point) => point.trim()).filter(Boolean),
    knowledgeGapFindingId: command.knowledgeGapFindingId,
    findingId: command.findingId,
    collectiveNeedId: command.collectiveNeedId,
    situationId: command.situationId,
    createdAt: timestamp(),
    createdByActorId: command.actorId,
    history: [history(command.actorId, "Mission terrain créée", command.title.trim())]
  };

  const next: ProductState = { ...state, fieldMissions: [mission, ...state.fieldMissions] };
  return withAudit(next, command.actorId, "field_mission", mission.id, command.type, mission.title);
}

const FIELD_MISSION_TERMINAL_STATUSES: ReadonlySet<FieldMissionStatus> = new Set(["realisee", "annulee"]);

// update_field_mission_status — cycle de vie simple (mandat §7) : à
// préparer → planifiée → en cours → réalisée (+ annulée à tout moment tant
// que la mission n'est pas déjà terminale). "a_preparer" n'est jamais une
// valeur cible ici (Exclude<FieldMissionStatus, "a_preparer"> au niveau du
// type de la commande) — cohérent avec create_field_mission qui démarre
// toujours à "planifiee".
function applyUpdateFieldMissionStatus(state: ProductState, command: Extract<Command, { type: "update_field_mission_status" }>): ProductState {
  const mission = state.fieldMissions.find((item) => item.id === command.missionId);
  if (!mission) throw new Error("Mission terrain introuvable.");
  if (FIELD_MISSION_TERMINAL_STATUSES.has(mission.status)) {
    throw new Error(`Une mission ${fieldMissionStatusLabels[mission.status].toLowerCase()} ne change plus de statut.`);
  }

  const updated: FieldMission = {
    ...mission,
    status: command.status,
    history: [history(command.actorId, "Statut de la mission mis à jour", command.note?.trim() || fieldMissionStatusLabels[command.status]), ...mission.history]
  };
  const next: ProductState = { ...state, fieldMissions: state.fieldMissions.map((item) => (item.id === mission.id ? updated : item)) };
  return withAudit(next, command.actorId, "field_mission", mission.id, command.type, fieldMissionStatusLabels[command.status]);
}

// record_observation (mandat §10/§11/§12/§13) — l'entrée la plus légère
// possible : OBSERVER (content) + QUALIFIER (nature) + preuve optionnelle
// (evidence, réutilise Evidence, pas de FieldEvidence). Exige mission "en
// cours" (l'agent a explicitement démarré la mission avant d'observer,
// TEST D/E du mandat) — une Observation hors mission démarrée serait une
// Situation générique "signaler autre chose" (create_signal), pas ceci.
//
// Produit systématiquement un Signal canonique (jamais optionnel) : c'est
// ce qui fait passer l'Observation de "ce qu'un agent a constaté" à
// "quelque chose que Mbàmbulaan peut qualifier" — sans jamais toucher
// findings/situations/collectiveNeeds (mandat §12, TEST G du mandat :
// aucune Situation automatique).
function applyRecordObservation(state: ProductState, command: Extract<Command, { type: "record_observation" }>): ProductState {
  const mission = state.fieldMissions.find((item) => item.id === command.missionId);
  if (!mission) throw new Error("Mission terrain introuvable.");
  if (mission.status !== "en_cours") throw new Error("Une observation ne peut être enregistrée que sur une mission en cours.");
  if (!command.content.trim()) throw new Error("Le contenu de l'observation est obligatoire.");

  const territoryId = mission.territoryIds[0];
  const observationId = id("obsv");
  const suffix = crypto.randomUUID().slice(0, 8);
  const signalId = `obs-${suffix}`;

  // Signal terrain canonique — provenance préservée explicitement dans le
  // libellé "source" (mandat §12, "aucune perte de source") plutôt que
  // seulement portée par un lien implicite.
  const signal: Signal = {
    id: signalId,
    territoryId,
    actorId: command.actorId,
    createdAt: timestamp(),
    channel: "terrain",
    category: "infrastructure",
    title: `Observation terrain — ${mission.title}`,
    description: command.content.trim(),
    trust: command.trust,
    source: `Mission terrain ${mission.id} / Observation ${observationId}`,
    disposition: "nouveau"
  };

  let evidence: Evidence | undefined;
  if (command.evidence) {
    if (!command.evidence.label.trim() || !command.evidence.detail.trim()) {
      throw new Error("Une preuve jointe doit avoir un libellé et un détail.");
    }
    evidence = {
      id: id("ev"),
      missionId: mission.id,
      observationId,
      type: command.evidence.evidenceType,
      label: command.evidence.label.trim(),
      detail: command.evidence.detail.trim(),
      recordedByActorId: command.actorId,
      recordedAt: timestamp(),
      trust: command.trust
    };
  }

  const observation: Observation = {
    id: observationId,
    missionId: mission.id,
    territoryId,
    authorActorId: command.actorId,
    createdAt: timestamp(),
    content: command.content.trim(),
    nature: command.nature,
    trust: command.trust,
    signalId,
    evidenceId: evidence?.id
  };

  const updatedMission: FieldMission = {
    ...mission,
    history: [history(command.actorId, "Observation enregistrée", `${observationNatureLabels[command.nature]} — ${command.content.trim()}`), ...mission.history]
  };

  const next: ProductState = {
    ...state,
    fieldMissions: state.fieldMissions.map((item) => (item.id === mission.id ? updatedMission : item)),
    observations: [observation, ...state.observations],
    signals: [signal, ...state.signals],
    evidences: evidence ? [evidence, ...state.evidences] : state.evidences
  };
  return withAudit(next, command.actorId, "observation", observation.id, command.type, observation.content);
}

export function applyFieldMissionCommand(
  state: ProductState,
  command: Extract<Command, { type: "create_field_mission" | "update_field_mission_status" | "record_observation" }>
): ProductState {
  switch (command.type) {
    case "create_field_mission":
      return applyCreateFieldMission(state, command);
    case "update_field_mission_status":
      return applyUpdateFieldMissionStatus(state, command);
    case "record_observation":
      return applyRecordObservation(state, command);
  }
}
