export type TransformationPlanDemo = {
  planId: string;
  processor: string;
  unit: string;
  product: string;
  targetKg: number;
  securedKg: number;
  requiredBy: string;
  status: "a_securiser" | "partiel" | "pret" | "production" | "termine";
  constraints: string[];
  supplyOptions: Array<{
    id: string;
    source: string;
    species: string;
    quantityKg: number;
    availableAt: string;
    condition: "frais" | "refrigere";
    trust: "declare" | "verifie";
  }>;
};

export const sharedTransformationDemo: TransformationPlanDemo = {
  planId: "TRF-2026-0018",
  processor: "Fatou Sarr",
  unit: "GIE Jappo Liggey",
  product: "Sardinelle fumée",
  targetKg: 600,
  securedKg: 360,
  requiredBy: "Demain avant 08h",
  status: "partiel",
  constraints: ["240 kg restent à sécuriser", "Froid disponible jusqu’à 10h", "Équipe prête à 08h"],
  supplyOptions: [
    {
      id: "LOT-HANN-121",
      source: "Hann",
      species: "Sardinelle",
      quantityKg: 240,
      availableAt: "Demain 06h30",
      condition: "frais",
      trust: "verifie"
    },
    {
      id: "LOT-MBOUR-052",
      source: "Mbour",
      species: "Sardinelle",
      quantityKg: 300,
      availableAt: "Demain 08h30",
      condition: "refrigere",
      trust: "declare"
    }
  ]
};

export function getTransformationSummary(plan: TransformationPlanDemo) {
  const remainingKg = Math.max(plan.targetKg - plan.securedKg, 0);
  return {
    remainingKg,
    completionRate: Math.round((plan.securedKg / plan.targetKg) * 100),
    nextAction: remainingKg > 0 ? `Sécuriser encore ${remainingKg} kg` : "Confirmer le démarrage de la production"
  };
}
