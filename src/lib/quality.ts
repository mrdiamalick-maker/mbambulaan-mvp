import type { Arrivage } from "@/lib/arrivages";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { computeTensionMetrics, type TensionLevel } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";
import { getEspeceReference, getQuaiReference } from "@/lib/reference";
import type { Besoin } from "@/lib/besoins";

export type FreshnessLevel = "Très frais" | "Frais" | "À traiter rapidement" | "Risque de perte";
export type WasteRiskLevel = "Faible" | "Moyen" | "Élevé" | "Critique";

export type LotQuality = {
  arrivageId: string;
  lotId: string;
  espece: string;
  quai: string;
  score: number;
  fraicheur: FreshnessLevel;
  risqueGaspillage: WasteRiskLevel;
  actionRecommandee: string;
  tensionTerritoriale: TensionLevel;
  facteurs: string[];
};

type QualityContext = {
  besoins?: Besoin[];
  opportunites?: Opportunite[];
  transactions?: Transaction[];
};

const referenceDate = new Date(Date.UTC(2026, 5, 27, 14, 0));

export function computeLotsQuality(arrivages: Arrivage[], context: QualityContext = {}): LotQuality[] {
  const besoins = context.besoins ?? [];
  const opportunites = context.opportunites ?? [];
  const transactions = context.transactions ?? [];
  const tensions = computeTensionMetrics(arrivages, besoins, opportunites, transactions);
  const lots = computeTraceability(arrivages, opportunites, transactions);

  return arrivages
    .map((arrivage, index) => {
      const lot = lots.find((item) => item.arrivageId === arrivage.id);
      return computeLotQuality(arrivage, index, {
        lotId: lot?.lotId,
        opportunites,
        transactions,
        tension: tensions.tensionsParQuai.find((item) => sameValue(item.quai, arrivage.quai))?.niveau ?? "Faible"
      });
    })
    .sort((first, second) => second.score - first.score);
}

export function computeSensitiveLots(arrivages: Arrivage[], context: QualityContext = {}) {
  return computeLotsQuality(arrivages, context)
    .filter((quality) => quality.risqueGaspillage === "Critique" || quality.risqueGaspillage === "Élevé" || quality.fraicheur === "À traiter rapidement" || quality.fraicheur === "Risque de perte")
    .sort((first, second) => riskWeight(second.risqueGaspillage) - riskWeight(first.risqueGaspillage) || first.score - second.score);
}

export function findLotQualityByArrivageId(qualities: LotQuality[], arrivageId: string) {
  return qualities.find((quality) => quality.arrivageId === arrivageId);
}

export function getQualityTone(score: number) {
  if (score >= 82) return "green";
  if (score >= 65) return "orange";
  return "red";
}

export function getWasteRiskTone(risk: WasteRiskLevel) {
  if (risk === "Critique") return "critical";
  if (risk === "Élevé") return "high";
  if (risk === "Moyen") return "medium";
  return "low";
}

function computeLotQuality(
  arrivage: Arrivage,
  index: number,
  context: {
    lotId?: string;
    opportunites: Opportunite[];
    transactions: Transaction[];
    tension: TensionLevel;
  }
): LotQuality {
  const ageHours = computeAgeHours(arrivage.heureDebarquement);
  const quantityKg = parseQuantityInKg(arrivage.quantite);
  const species = getEspeceReference(arrivage.espece);
  const quai = getQuaiReference(arrivage.quai);
  const linkedOpportunities = context.opportunites.filter((opportunite) => opportunite.arrivageId === arrivage.id);
  const linkedTransaction = context.transactions.find((transaction) => linkedOpportunities.some((opportunite) => opportunite.id === transaction.opportuniteId));
  const isReserved = arrivage.statut === "Reserve" || linkedOpportunities.some((opportunite) => opportunite.statut === "Réservée") || Boolean(linkedTransaction);
  const isValorized = arrivage.statut === "Ecoule" || linkedTransaction?.statut === "Terminée";
  const riskScore = computeRiskScore({
    ageHours,
    category: species?.categorie,
    quantityKg,
    status: arrivage.statut,
    tension: context.tension,
    hasOpportunity: linkedOpportunities.length > 0,
    isReserved,
    isValorized,
    hasQuaiReference: Boolean(quai)
  });
  const qualityScore = Math.max(0, Math.min(100, 100 - riskScore));
  const risqueGaspillage = scoreToWasteRisk(riskScore);
  const fraicheur = ageToFreshness(ageHours);

  return {
    arrivageId: arrivage.id,
    lotId: context.lotId ?? createFallbackLotId(arrivage, index),
    espece: arrivage.espece,
    quai: arrivage.quai,
    score: qualityScore,
    fraicheur,
    risqueGaspillage,
    actionRecommandee: recommendAction(risqueGaspillage, fraicheur, context.tension, isReserved, isValorized, linkedTransaction),
    tensionTerritoriale: context.tension,
    facteurs: buildFactors(arrivage, ageHours, quantityKg, context.tension, linkedOpportunities.length, linkedTransaction)
  };
}

function computeRiskScore(input: {
  ageHours: number;
  category?: string;
  quantityKg: number;
  status: Arrivage["statut"];
  tension: TensionLevel;
  hasOpportunity: boolean;
  isReserved: boolean;
  isValorized: boolean;
  hasQuaiReference: boolean;
}) {
  let risk = 0;

  risk += Math.min(30, Math.max(0, input.ageHours - 1) * 5);
  if (input.category?.includes("Crustacé")) risk += 16;
  if (input.category?.includes("Pélagique")) risk += 10;
  if (input.quantityKg >= 1000) risk += 12;
  else if (input.quantityKg >= 500) risk += 8;
  if (input.status === "En controle") risk += 8;
  if (input.status === "Disponible") risk += 6;
  if (input.tension === "Critique") risk += 14;
  if (input.tension === "Forte") risk += 10;
  if (input.tension === "Moyenne") risk += 5;
  if (!input.hasOpportunity) risk += 12;
  if (!input.hasQuaiReference) risk += 4;
  if (input.isReserved) risk -= 15;
  if (input.isValorized) risk -= 28;

  return Math.max(0, Math.min(100, Math.round(risk)));
}

function ageToFreshness(ageHours: number): FreshnessLevel {
  if (ageHours <= 2) return "Très frais";
  if (ageHours <= 4) return "Frais";
  if (ageHours <= 6) return "À traiter rapidement";
  return "Risque de perte";
}

function scoreToWasteRisk(riskScore: number): WasteRiskLevel {
  if (riskScore >= 70) return "Critique";
  if (riskScore >= 48) return "Élevé";
  if (riskScore >= 28) return "Moyen";
  return "Faible";
}

function recommendAction(risk: WasteRiskLevel, freshness: FreshnessLevel, tension: TensionLevel, isReserved: boolean, isValorized: boolean, transaction?: Transaction) {
  if (isValorized) return "Suivre sans action immédiate";
  if (transaction && transaction.statut !== "Terminée") return "Accélérer la transaction";
  if (isReserved) return "Accélérer la transaction";
  if (risk === "Critique" || freshness === "Risque de perte") return "Renforcer la conservation";
  if (risk === "Élevé") return "Prioriser la réservation";
  if (tension === "Forte" || tension === "Critique") return "Orienter vers transformateur";
  return "Suivre sans action immédiate";
}

function buildFactors(arrivage: Arrivage, ageHours: number, quantityKg: number, tension: TensionLevel, opportunityCount: number, transaction?: Transaction) {
  return [
    `Arrivé depuis ${formatAge(ageHours)}`,
    `${formatKg(quantityKg)} déclarés`,
    `Statut ${arrivage.statut}`,
    `Tension ${tension} à ${arrivage.quai}`,
    opportunityCount > 0 ? `${opportunityCount} opportunité(s) détectée(s)` : "Aucune opportunité détectée",
    transaction ? `Transaction ${transaction.statut}` : "Aucune transaction liée"
  ];
}

function computeAgeHours(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2026, 5, 27, hours || 12, minutes || 0));
  return Math.max(0, (referenceDate.getTime() - date.getTime()) / 36e5);
}

function parseQuantityInKg(value: string) {
  const normalized = value.trim().toLowerCase().replace(",", ".");
  const amount = Number.parseFloat(normalized);
  if (Number.isNaN(amount)) return 0;
  return normalized.includes("t") ? amount * 1000 : amount;
}

function formatKg(value: number) {
  if (value >= 1000) {
    const tonnes = value / 1000;
    return `${Number.isInteger(tonnes) ? tonnes : tonnes.toFixed(1).replace(".", ",")} t`;
  }

  return `${Math.round(value)} kg`;
}

function formatAge(hours: number) {
  if (hours < 1) return "moins d'une heure";
  const rounded = Math.round(hours * 10) / 10;
  return `${String(rounded).replace(".", ",")} h`;
}

function createFallbackLotId(arrivage: Arrivage, index: number) {
  const quaiCode = arrivage.quai
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")[0]
    ?.toUpperCase();

  return `MBA-${quaiCode || "LOT"}-2026-${String(index + 1).padStart(4, "0")}`;
}

function riskWeight(risk: WasteRiskLevel) {
  if (risk === "Critique") return 4;
  if (risk === "Élevé") return 3;
  if (risk === "Moyen") return 2;
  return 1;
}

function sameValue(first: string, second: string) {
  return first
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase() === second
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
