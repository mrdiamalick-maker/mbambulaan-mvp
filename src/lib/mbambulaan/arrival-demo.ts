export type SharedArrivalStatus = "annoncée" | "préparation" | "arrivée" | "pesée" | "terminée";

export type SharedArrivalDemo = {
  arrivalId: string;
  captain: string;
  captainPhone: string;
  vessel: string;
  quay: string;
  eta: string;
  needs: string[];
  ready: Record<string, boolean | null>;
  arrived: boolean;
  weightKg?: number;
  captainDecision: "confirmé" | "contesté" | "en attente";
  status: SharedArrivalStatus;
};

export const sharedArrivalDemo: SharedArrivalDemo = {
  arrivalId: "RET-2026-0814",
  captain: "Mamadou Diop",
  captainPhone: "+221 77 000 00 00",
  vessel: "Ndeye Fatou",
  quay: "Hann",
  eta: "dans 1 à 2 heures",
  needs: ["Place au quai", "Manutention", "Glace"],
  ready: {
    "Place au quai": null,
    Manutention: null,
    Glace: null
  },
  arrived: false,
  captainDecision: "en attente",
  status: "annoncée"
};

export function getArrivalSummary(arrival: SharedArrivalDemo) {
  const readyItems = arrival.needs.filter((need) => arrival.ready[need] === true);
  const missingItems = arrival.needs.filter((need) => arrival.ready[need] === false);

  return {
    readyItems,
    missingItems,
    isPreparationComplete: arrival.needs.every((need) => arrival.ready[need] !== null),
    nextAction:
      arrival.captainDecision === "contesté"
        ? "Reprendre la pesée avec le capitaine"
        : !arrival.arrived
          ? "Confirmer l'arrivée réelle"
          : !arrival.weightKg
            ? "Enregistrer la pesée"
            : arrival.captainDecision === "en attente"
              ? "Attendre la réponse du capitaine"
              : "Clore l'arrivée"
  };
}
