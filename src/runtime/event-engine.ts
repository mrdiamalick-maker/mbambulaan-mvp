import type { MbambulaanEvent, EventAssessment } from "@/domain/events";
import type { ProductState, Signal } from "@/domain/types";

function eventId(prefix: string, eventId: string) {
  return `${prefix}-${eventId}`;
}

export function assessEvent(event: MbambulaanEvent): EventAssessment {
  switch (event.type) {
    case "infrastructure_status_changed": {
      const unavailable =
        event.status === "indisponible" || event.availableCapacity <= 0;

      return {
        title: unavailable
          ? "Moyen indisponible sur le territoire"
          : "Moyen fragilisé sur le territoire",
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
        description:
          "Une pirogue a annoncé son retour. Le quai doit préparer l'accueil, la pesée et les moyens nécessaires.",
        category: "production",
        priority: "haute",
        trust: "declaree",
        nextStep:
          "Confirmer l'heure d'arrivée et vérifier la disponibilité du quai, de la glace et de la pesée"
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

// applyEvent (LOT 0.1, comportement corrigé, mandat "aligner le Core
// métier avec le Blueprint V1") : ne crée plus qu'un Signal — c'était le
// 4e chemin (non nommé explicitement par le mandat mais souffrant du même
// travers que create_signal/convert_message_to_signal) qui promouvait
// automatiquement tout événement reçu en Situation. Aucun consommateur UI
// n'appelle ce moteur (vérifié : seuls src/server/repository.ts et
// src/app/api/events/route.ts le font, tous deux hors parcours produit
// réel) — pas de wrapper legacy nécessaire ici, contrairement à
// create_signal/convert_message_to_signal.
export function applyEvent(
  state: ProductState,
  event: MbambulaanEvent
): ProductState {
  const assessment = assessEvent(event);
  const signalId = eventId("obs", event.id);

  if (state.signals.some((item) => item.id === signalId)) {
    return state;
  }

  const signal: Signal = {
    id: signalId,
    territoryId: event.territoryId,
    actorId: event.actorId,
    createdAt: event.occurredAt,
    channel: event.channel,
    category: assessment.category,
    title: assessment.title,
    description: assessment.description,
    trust: assessment.trust,
    source: event.source,
    disposition: "nouveau"
  };

  return {
    ...state,
    revision: state.revision + 1,
    signals: [signal, ...state.signals],
    audit: [
      {
        id: eventId("audit", event.id),
        at: event.occurredAt,
        actorId: event.actorId,
        objectType: "signal",
        objectId: signalId,
        action: "event_received",
        detail: `${event.type} transformé en signal`
      },
      ...state.audit
    ]
  };
}