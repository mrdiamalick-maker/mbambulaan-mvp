import type { Command, HistoryEntry, ProductState, Situation, SituationStatus } from "./types";

const transitions: Record<Exclude<Command["type"], "reset_demo" | "create_signal" | "wait" | "resume">, [SituationStatus, SituationStatus]> = {
  qualify: ["recue", "qualification"],
  prioritize: ["qualification", "priorisee"],
  coordinate: ["priorisee", "coordination"],
  start_intervention: ["coordination", "intervention"],
  record_result: ["intervention", "resultat"],
  close: ["resultat", "reglee"]
};

function event(actorId: string, action: string, detail: string): HistoryEntry {
  return {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actor: actorId,
    label: action,
    detail
  };
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
    throw new Error("Le motif d'attente est obligatoire.");
  }
  if (["resultat", "reglee"].includes(situation.status) && (!situation.result || !situation.confirmation)) {
    throw new Error("Le résultat et l'élément de confirmation sont obligatoires.");
  }
}

export function applyCommand(state: ProductState, command: Command): ProductState {
  if (command.type === "reset_demo") return state;
  if (command.type === "create_signal") {
    if (!command.title.trim() || !command.description.trim()) {
      throw new Error("Le titre et la description sont obligatoires.");
    }
    if (!state.territories.some((item) => item.id === command.territoryId)) {
      throw new Error("Territoire inconnu.");
    }
    const suffix = crypto.randomUUID().slice(0, 8);
    const observationId = `obs-${suffix}`;
    const situationId = `sit-${suffix}`;
    const createdAt = new Date().toISOString();
    const observation = {
      id: observationId,
      territoryId: command.territoryId,
      actorId: command.actorId,
      createdAt,
      channel: command.channel,
      category: "infrastructure" as const,
      title: command.title.trim(),
      description: command.description.trim(),
      trust: "declaree" as const,
      source: command.channel === "poste_quai" ? "Poste de quai" : "Déclaration terrain"
    };
    const newSituation: Situation = {
      id: situationId,
      reference: `MBA-SIT-${suffix.toUpperCase()}`,
      observationIds: [observationId],
      territoryId: command.territoryId,
      title: command.title.trim(),
      description: command.description.trim(),
      status: "recue",
      priority: "moyenne",
      trust: "declaree",
      visibility: "organisation",
      nextStep: "Qualifier le signal avec un relais territorial",
      history: [event(command.actorId, "Signal créé", command.description.trim())]
    };
    validateSituation(newSituation);
    return {
      ...state,
      revision: state.revision + 1,
      observations: [observation, ...state.observations],
      situations: [newSituation, ...state.situations],
      audit: [
        {
          id: crypto.randomUUID(),
          at: createdAt,
          actorId: command.actorId,
          objectType: "situation",
          objectId: situationId,
          action: "create_signal",
          detail: command.title.trim()
        },
        ...state.audit
      ]
    };
  }
  const situation = state.situations.find((item) => item.id === command.situationId);
  if (!situation) throw new Error("Situation introuvable.");

  const updated: Situation = structuredClone(situation);
  let detail = "";

  if (command.type === "wait") {
    if (situation.status !== "intervention") throw new Error("Seule une intervention en cours peut être mise en attente.");
    if (!command.reason.trim()) throw new Error("Le motif d'attente est obligatoire.");
    updated.status = "attente";
    updated.waitingReason = command.reason;
    updated.nextStep = "Lever le blocage et reprendre l'intervention";
    detail = command.reason;
  } else if (command.type === "resume") {
    if (situation.status !== "attente") throw new Error("Cette situation n'est pas en attente.");
    updated.status = "intervention";
    updated.waitingReason = undefined;
    updated.nextStep = "Achever l'intervention et enregistrer le résultat";
    detail = "Intervention reprise après levée du blocage";
  } else {
    const [from, to] = transitions[command.type];
    if (situation.status !== from) throw new Error(`Transition impossible depuis « ${situation.status} ».`);
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
      updated.nextStep = "Démarrer l'intervention planifiée";
      detail = "Responsable et échéance confirmés";
    }
    if (command.type === "start_intervention") {
      updated.nextStep = "Achever l'intervention ou documenter un blocage";
      detail = "Intervention technique engagée";
    }
    if (command.type === "record_result") {
      if (!command.result.trim() || !command.confirmation.trim()) {
        throw new Error("Le résultat et l'élément de confirmation sont obligatoires.");
      }
      updated.result = command.result;
      updated.confirmation = command.confirmation;
      updated.trust = "consolidee";
      updated.nextStep = "Valider la clôture et capitaliser l'apprentissage";
      detail = command.result;
    }
    if (command.type === "close") {
      updated.nextStep = "Partager l'apprentissage avec les autres quais";
      detail = "Situation clôturée après validation du résultat";
    }
  }

  updated.history.unshift(event(command.actorId, command.type, detail));
  validateSituation(updated);

  const auditEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    actorId: command.actorId,
    objectType: "situation",
    objectId: updated.id,
    action: command.type,
    detail
  };

  return {
    ...state,
    revision: state.revision + 1,
    situations: state.situations.map((item) => (item.id === updated.id ? updated : item)),
    audit: [auditEntry, ...state.audit]
  };
}

export type WorkflowAction = Exclude<Command["type"], "create_signal" | "reset_demo" | "wait">;

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
