import type { MbambulaanEvent, EventAssessment } from "@/domain/events";
import type { Observation, ProductState, Situation } from "@/domain/types";

function eventId(prefix: string, eventId: string) {
  return `${prefix}-${eventId}`;
}

export function assessEvent(event: MbambulaanEvent): EventAssessment {
  switch (event.type) {
    case "infrastructure_status_changed": {
      const unavailable = event.status === "indisponible" || event.availableCapacity <= 0;
      return {
        title: unavailable ? "Moyen indisponible sur le territoire" : "Moyen fragilisé sur le territoire",
        description: unavailable
          ? "Un moyen essentiel n'est plus disponible et peut bloquer une opération en cours."
          : "Un moyen essentiel fonctionne avec une capacité réduite et nécessite une vérification.",
        category: "infrastructure",
        priority: unavailable ? "critique" : "haute",
        trust: "observee",
        nextStep: unavailable
          ? "Confirmer la situation avec le poste de quai et organiser une solution de remplacement"
          : "Vérifier la capacité restante et informer les acteurs concernés"
      };
    }
    case "fishing_trip_return_announced":
      return {
        title: "Retour de pêche annoncé",
        description: "Une pirogue a annoncé son retour. Le quai doit préparer l'accueil, la pesée et les moyens nécessaires.",
        category: "production",
        priority: "haute",
        trust: "declaree",
        nextStep: "Confirmer l'heure d'arrivée et vérifier la disponibilité du quai, de la glace et de la pesée"
      };
    case "communication_requested":
      return {
        title: `Contact demandé par ${event.requestedChannel}`,
        description: event.subject,
        category: "securite",
        priority: event.requestedChannel === "appel" ? "haute" : "moyenne",
        trust: "declaree",
        nextStep: `Prendre contact par ${event.requestedChannel} et rattacher la réponse à la situation concernée`
      };
  }
}

export function applyEvent(state: ProductState, event: MbambulaanEvent): ProductState {
  const assessment = assessEvent(event);
  const observationId = eventId("obs", event.id);
  const situationId = eventId("sit", event.id);

  if (state.observations.some((item) => item.id === observationId)) return state;

  const observation: Observation = {
    id: observationId,
    territoryId: event.territoryId,
    actorId: event.actorId,
    createdAt: event.occurredAt,
    channel: event.channel,
    category: assessment.category,
    title: assessment.title,
    description: assessment.description,
    trust: assessment.trust,
    source: event.source
  };

  const situation: Situation = {
    id: situationId,
    reference: `MBA-EVT-${event.id.slice(-6).toUpperCase()}`,
    observationIds: [observationId],
    territoryId: event.territoryId,
    title: assessment.title,
    description: assessment.description,
    status: "recue",
    priority: assessment.priority,
    trust: assessment.trust,
    visibility: "organisation",
    nextStep: assessment.nextStep,
    history: [
      {
        id: eventId("hist", event.id),
        at: event.occurredAt,
        actor: event.actorId,
        label: "Événement reçu",
        detail: `${event.type} via ${event.channel}`
      }
    ]
  };

  return {
    ...state,
    revision: state.revision + 1,
    observations: [observation, ...state.observations],
    situations: [situation, ...state.situations],
    audit: [
      {
        id: eventId("audit", event.id),
        at: event.occurredAt,
        actorId: event.actorId,
        objectType: "evenement",
        objectId: event.id,
        action: "event_received",
        detail: `${event.type} transformé en observation et situation`
      },
      ...state.audit
    ]
  };
}
