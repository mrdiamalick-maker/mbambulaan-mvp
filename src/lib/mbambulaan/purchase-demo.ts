export type PurchaseNeedDemo = {
  needId: string;
  buyer: string;
  buyerPhone: string;
  species: string;
  quantityRange: string;
  pickupSite: string;
  deadline: string;
  status: "recherche" | "propositions" | "engagement" | "enlevement" | "termine";
  proposals: Array<{
    id: string;
    site: string;
    species: string;
    quantityKg: number;
    pricePerKg: number;
    availableAt: string;
    trust: "declare" | "verifie";
  }>;
  selectedProposalId?: string;
};

export const sharedPurchaseDemo: PurchaseNeedDemo = {
  needId: "ACH-2026-0042",
  buyer: "Awa Ndiaye",
  buyerPhone: "+221 77 111 22 33",
  species: "Sardinelle",
  quantityRange: "100 à 500 kg",
  pickupSite: "Hann",
  deadline: "Aujourd’hui avant 18h",
  status: "propositions",
  proposals: [
    {
      id: "LOT-HANN-118",
      site: "Hann",
      species: "Sardinelle",
      quantityKg: 240,
      pricePerKg: 850,
      availableAt: "16h30",
      trust: "verifie"
    },
    {
      id: "LOT-SOUM-074",
      site: "Soumbédioune",
      species: "Sardinelle",
      quantityKg: 180,
      pricePerKg: 800,
      availableAt: "17h15",
      trust: "declare"
    }
  ]
};

export function getPurchaseSummary(need: PurchaseNeedDemo) {
  const selected = need.proposals.find((item) => item.id === need.selectedProposalId);
  return {
    selected,
    proposalCount: need.proposals.length,
    nextAction: selected
      ? "Organiser l’enlèvement"
      : need.proposals.length > 1
        ? "Comparer les propositions"
        : need.proposals.length === 1
          ? "Répondre à la proposition"
          : "Attendre une proposition"
  };
}
