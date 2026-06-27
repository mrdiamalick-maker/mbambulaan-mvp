import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { Opportunite } from "@/lib/coordination";

export type RecommendationTone = "green" | "orange" | "red";

export type RecommendationCriterion = {
  label: string;
  matched: boolean;
  points: number;
};

export type RecommendationResult = {
  score: number;
  criteria: RecommendationCriterion[];
  reasons: string[];
};

export function computeRecommendation(arrivage: Arrivage, besoin: Besoin): RecommendationResult {
  const sameSpecies = normalize(arrivage.espece) === normalize(besoin.espece);
  const availableKg = parseQuantityInKg(arrivage.quantite);
  const neededKg = parseQuantityInKg(besoin.quantite);
  const quantityCompatible = availableKg >= neededKg && neededKg > 0;
  const sameZone = normalize(arrivage.quai) === normalize(besoin.quai);
  const immediatelyAvailable = arrivage.statut === "Disponible";
  const urgentNeed = besoin.urgence === "Haute";
  const compatibleActors = Boolean(arrivage.vendeur || arrivage.quai) && Boolean(besoin.acheteur || besoin.quai);

  const criteria: RecommendationCriterion[] = [
    { label: "Espèce recherchée", matched: sameSpecies, points: sameSpecies ? 30 : 0 },
    { label: "Quantité suffisante", matched: quantityCompatible, points: quantityCompatible ? 25 : 0 },
    { label: "Quai proche", matched: sameZone, points: sameZone ? 15 : 0 },
    { label: "Disponibilité immédiate", matched: immediatelyAvailable, points: immediatelyAvailable ? 10 : 0 },
    { label: "Besoin urgent", matched: urgentNeed, points: urgentNeed ? 10 : besoin.urgence === "Moyenne" ? 6 : 3 },
    { label: "Acteur disponible", matched: compatibleActors, points: compatibleActors ? 10 : 0 }
  ];

  const score = Math.min(100, criteria.reduce((total, criterion) => total + criterion.points, 0));

  return {
    score,
    criteria,
    reasons: criteria.filter((criterion) => criterion.matched).map((criterion) => criterion.label)
  };
}

export function getRecommendationTone(score: number): RecommendationTone {
  if (score > 90) return "green";
  if (score >= 75) return "orange";
  return "red";
}

export function computeAverageRecommendationScore(opportunites: Opportunite[]) {
  if (opportunites.length === 0) return 0;

  const total = opportunites.reduce((sum, opportunite) => sum + opportunite.scoreCompatibilite, 0);
  return Math.round(total / opportunites.length);
}

export function getTopRecommendations(opportunites: Opportunite[], limit = 5) {
  return [...opportunites].sort((first, second) => second.scoreCompatibilite - first.scoreCompatibilite).slice(0, limit);
}

function parseQuantityInKg(value: string) {
  const normalized = value.trim().toLowerCase().replace(",", ".");
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) return 0;

  return normalized.includes("t") ? amount * 1000 : amount;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
