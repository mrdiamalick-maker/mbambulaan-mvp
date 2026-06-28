import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { getQuaiReference, quaisReference } from "@/lib/reference";

export type TensionLevel = "Faible" | "Moyenne" | "Forte" | "Critique";

export type QuaiTension = {
  quai: string;
  region: string;
  volumeDisponibleKg: number;
  volumeDisponible: string;
  volumeDemandeKg: number;
  volumeDemande: string;
  opportunitesDetectees: number;
  transactionsRealisees: number;
  deficitKg: number;
  deficit: string;
  score: number;
  niveau: TensionLevel;
};

export type EspeceTension = {
  espece: string;
  volumeDisponibleKg: number;
  volumeDisponible: string;
  volumeDemandeKg: number;
  volumeDemande: string;
  besoinsNonCouverts: number;
  deficitKg: number;
  deficit: string;
  score: number;
  niveau: TensionLevel;
};

export type ZonePrioritaire = {
  quai: string;
  region: string;
  niveau: TensionLevel;
  deficit: string;
  raison: string;
};

export type TensionMetrics = {
  tensionsParQuai: QuaiTension[];
  tensionsParEspece: EspeceTension[];
  zonesPrioritaires: ZonePrioritaire[];
  recommandations: string[];
};

export function computeTensionMetrics(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], transactions: Transaction[] = []): TensionMetrics {
  const tensionsParQuai = computeTensionsByQuai(arrivages, besoins, opportunites, transactions);
  const tensionsParEspece = computeTensionsByEspece(arrivages, besoins, opportunites);
  const zonesPrioritaires = tensionsParQuai.slice(0, 3).map((tension) => ({
    quai: tension.quai,
    region: tension.region,
    niveau: tension.niveau,
    deficit: tension.deficit,
    raison: buildZoneReason(tension)
  }));

  return {
    tensionsParQuai,
    tensionsParEspece,
    zonesPrioritaires,
    recommandations: buildRecommendations(tensionsParQuai, tensionsParEspece)
  };
}

export function getTensionTone(level: TensionLevel) {
  if (level === "Critique") return "critical";
  if (level === "Forte") return "high";
  if (level === "Moyenne") return "medium";
  return "low";
}

function computeTensionsByQuai(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], transactions: Transaction[]): QuaiTension[] {
  return quaisReference
    .map((reference) => {
      const quaiArrivages = arrivages.filter((arrivage) => sameValue(arrivage.quai, reference.nom));
      const quaiBesoins = besoins.filter((besoin) => sameValue(besoin.quai, reference.nom));
      const quaiOpportunites = opportunites.filter((opportunite) => sameValue(opportunite.lieu, reference.nom) || sameValue(opportunite.besoin.quai, reference.nom));
      const quaiTransactions = transactions.filter((transaction) => sameValue(transaction.quai, reference.nom));
      const volumeDisponibleKg = sumQuantities(quaiArrivages.map((arrivage) => arrivage.quantite));
      const volumeDemandeKg = sumQuantities(quaiBesoins.map((besoin) => besoin.quantite));
      const deficitKg = Math.max(0, volumeDemandeKg - volumeDisponibleKg);
      const score = computeTensionScore(volumeDisponibleKg, volumeDemandeKg, countUncoveredNeeds(quaiBesoins, opportunites), quaiOpportunites.length, quaiTransactions.length);

      return {
        quai: reference.nom,
        region: getQuaiReference(reference.nom)?.region ?? reference.region,
        volumeDisponibleKg,
        volumeDisponible: formatKg(volumeDisponibleKg),
        volumeDemandeKg,
        volumeDemande: formatKg(volumeDemandeKg),
        opportunitesDetectees: quaiOpportunites.length,
        transactionsRealisees: quaiTransactions.length,
        deficitKg,
        deficit: formatKg(deficitKg),
        score,
        niveau: scoreToLevel(score)
      };
    })
    .filter((tension) => tension.volumeDisponibleKg > 0 || tension.volumeDemandeKg > 0 || tension.opportunitesDetectees > 0)
    .sort((first, second) => second.score - first.score);
}

function computeTensionsByEspece(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[]): EspeceTension[] {
  const species = new Set([...arrivages.map((arrivage) => arrivage.espece), ...besoins.map((besoin) => besoin.espece)]);

  return Array.from(species)
    .map((espece) => {
      const speciesArrivages = arrivages.filter((arrivage) => sameValue(arrivage.espece, espece));
      const speciesBesoins = besoins.filter((besoin) => sameValue(besoin.espece, espece));
      const volumeDisponibleKg = sumQuantities(speciesArrivages.map((arrivage) => arrivage.quantite));
      const volumeDemandeKg = sumQuantities(speciesBesoins.map((besoin) => besoin.quantite));
      const besoinsNonCouverts = countUncoveredNeeds(speciesBesoins, opportunites);
      const deficitKg = Math.max(0, volumeDemandeKg - volumeDisponibleKg);
      const score = computeTensionScore(volumeDisponibleKg, volumeDemandeKg, besoinsNonCouverts, 0, 0);

      return {
        espece,
        volumeDisponibleKg,
        volumeDisponible: formatKg(volumeDisponibleKg),
        volumeDemandeKg,
        volumeDemande: formatKg(volumeDemandeKg),
        besoinsNonCouverts,
        deficitKg,
        deficit: formatKg(deficitKg),
        score,
        niveau: scoreToLevel(score)
      };
    })
    .sort((first, second) => second.score - first.score);
}

function computeTensionScore(volumeDisponibleKg: number, volumeDemandeKg: number, besoinsNonCouverts: number, opportunitesDetectees: number, transactionsRealisees: number) {
  const deficitKg = Math.max(0, volumeDemandeKg - volumeDisponibleKg);
  const demandPressure = volumeDemandeKg === 0 ? 0 : Math.round((deficitKg / volumeDemandeKg) * 55);
  const uncoveredPressure = Math.min(30, besoinsNonCouverts * 10);
  const opportunityRelief = Math.min(15, opportunitesDetectees * 3);
  const transactionRelief = Math.min(20, transactionsRealisees * 5);

  return Math.max(0, Math.min(100, demandPressure + uncoveredPressure + 20 - opportunityRelief - transactionRelief));
}

function scoreToLevel(score: number): TensionLevel {
  if (score >= 75) return "Critique";
  if (score >= 55) return "Forte";
  if (score >= 30) return "Moyenne";
  return "Faible";
}

function countUncoveredNeeds(besoins: Besoin[], opportunites: Opportunite[]) {
  const coveredNeedIds = new Set(opportunites.map((opportunite) => opportunite.besoinId));
  return besoins.filter((besoin) => !coveredNeedIds.has(besoin.id)).length;
}

function buildZoneReason(tension: QuaiTension) {
  if (tension.deficitKg > 0) return `${tension.volumeDemande} demandés pour ${tension.volumeDisponible} disponibles.`;
  if (tension.opportunitesDetectees > tension.transactionsRealisees) return `${tension.opportunitesDetectees} opportunité(s) à convertir en transaction.`;
  return "Zone à suivre pour maintenir l'équilibre offre-demande.";
}

function buildRecommendations(tensionsParQuai: QuaiTension[], tensionsParEspece: EspeceTension[]) {
  const recommendations: string[] = [];
  const topQuai = tensionsParQuai[0];
  const topSpecies = tensionsParEspece[0];
  const highOpportunityQuai = tensionsParQuai.find((tension) => tension.opportunitesDetectees > tension.transactionsRealisees);

  if (topQuai) {
    recommendations.push(`Orienter les mareyeurs vers ${topQuai.quai}.`);
  }

  if (topSpecies) {
    recommendations.push(`Prioriser ${topSpecies.espece} sur les quais en tension.`);
  }

  if (topQuai?.niveau === "Forte" || topQuai?.niveau === "Critique") {
    recommendations.push(`Renforcer la capacité de conservation à ${topQuai.quai}.`);
  }

  if (highOpportunityQuai) {
    recommendations.push(`Mobiliser les transformateurs à ${highOpportunityQuai.quai}.`);
  }

  return Array.from(new Set(recommendations)).slice(0, 4);
}

function sumQuantities(values: string[]) {
  return values.reduce((total, value) => total + parseQuantityInKg(value), 0);
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

function sameValue(first: string, second: string) {
  return normalize(first) === normalize(second);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^quai de /i, "")
    .trim()
    .toLowerCase();
}
