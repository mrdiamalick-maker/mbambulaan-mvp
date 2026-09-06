export type ServiceCapacityDemo = {
  capacityId: string;
  provider: string;
  service: string;
  site: string;
  availableQuantity: string;
  availableFrom: string;
  availableUntil: string;
  status: "disponible" | "reservee" | "en_cours" | "terminee";
  requests: Array<{
    id: string;
    requester: string;
    need: string;
    site: string;
    requestedFor: string;
    status: "nouvelle" | "a_confirmer" | "acceptee" | "refusee";
  }>;
};

export const sharedServiceCapacityDemo: ServiceCapacityDemo = {
  capacityId: "CAP-2026-0031",
  provider: "Ibrahima Fall",
  service: "Glace",
  site: "Hann",
  availableQuantity: "2 tonnes",
  availableFrom: "Aujourd’hui 14h",
  availableUntil: "Aujourd’hui 20h",
  status: "disponible",
  requests: [
    {
      id: "DEM-2026-0112",
      requester: "Quai de Hann",
      need: "600 kg de glace",
      site: "Hann",
      requestedFor: "Aujourd’hui 16h",
      status: "a_confirmer"
    },
    {
      id: "DEM-2026-0113",
      requester: "GIE Jappo Liggey",
      need: "400 kg de glace",
      site: "Hann",
      requestedFor: "Aujourd’hui 18h",
      status: "nouvelle"
    }
  ]
};

export function getServiceCapacitySummary(capacity: ServiceCapacityDemo) {
  const pendingRequests = capacity.requests.filter((request) => request.status === "nouvelle" || request.status === "a_confirmer");
  return {
    pendingRequests,
    nextAction: pendingRequests.length > 0 ? `Répondre à ${pendingRequests.length} demande${pendingRequests.length > 1 ? "s" : ""}` : "Mettre à jour la capacité disponible"
  };
}
