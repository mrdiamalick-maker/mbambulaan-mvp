import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { getEspeceReference, getQuaiReference } from "@/lib/reference";

export type ImpactQuai = {
  quai: string;
  region: string;
  volumeValorise: string;
  opportunites: number;
  transactions: number;
  scoreImpact: number;
};

export type ImpactMetrics = {
  volumeValoriseKg: number;
  volumeValorise: string;
  valeurEconomiqueFcfa: number;
  valeurEconomique: string;
  besoinsCouverts: number;
  besoinsTotal: number;
  tauxBesoinsCouverts: number;
  transactionsFinalisees: number;
  acteursImpactes: number;
  famillesImpactees: number;
  poissonSauveKg: number;
  poissonSauve: string;
  quaisImpactes: ImpactQuai[];
};

export function computeImpactMetrics(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], transactions: Transaction[] = []): ImpactMetrics {
  const opportunitesByArrivage = new Map(opportunites.map((opportunite) => [opportunite.arrivageId, opportunite]));
  const opportunitesById = new Map(opportunites.map((opportunite) => [opportunite.id, opportunite]));
  const transactionOpportunityIds = new Set(transactions.map((transaction) => transaction.opportuniteId));
  const valorisedArrivages = arrivages.filter((arrivage) => opportunitesByArrivage.has(arrivage.id) || hasTransactionForArrivage(arrivage.id, opportunites, transactionOpportunityIds));
  const coveredBesoinIds = new Set(opportunites.map((opportunite) => opportunite.besoinId));
  const actors = new Set<string>();

  opportunites.forEach((opportunite) => {
    actors.add(opportunite.vendeur);
    actors.add(opportunite.acheteur);
  });

  transactions.forEach((transaction) => {
    actors.add(transaction.acteurReserve);
  });

  const volumeValoriseKg = valorisedArrivages.reduce((total, arrivage) => total + parseQuantityInKg(arrivage.quantite), 0);
  const valeurEconomiqueFcfa = valorisedArrivages.reduce((total, arrivage) => total + parseQuantityInKg(arrivage.quantite) * getIndicativePrice(arrivage.espece), 0);
  const poissonSauveKg = computeSavedFishKg(opportunites, transactions, opportunitesById);
  const quaisImpactes = computeImpactedQuais(valorisedArrivages, opportunites, transactions);

  return {
    volumeValoriseKg,
    volumeValorise: formatKg(volumeValoriseKg),
    valeurEconomiqueFcfa,
    valeurEconomique: formatFcfa(valeurEconomiqueFcfa),
    besoinsCouverts: coveredBesoinIds.size,
    besoinsTotal: besoins.length,
    tauxBesoinsCouverts: besoins.length === 0 ? 0 : Math.round((coveredBesoinIds.size / besoins.length) * 100),
    transactionsFinalisees: transactions.filter((transaction) => transaction.statut === "Terminée").length,
    acteursImpactes: actors.size,
    famillesImpactees: Math.max(actors.size * 4, valorisedArrivages.length * 3),
    poissonSauveKg,
    poissonSauve: formatKg(poissonSauveKg),
    quaisImpactes
  };
}

function hasTransactionForArrivage(arrivageId: string, opportunites: Opportunite[], transactionOpportunityIds: Set<string>) {
  return opportunites.some((opportunite) => opportunite.arrivageId === arrivageId && transactionOpportunityIds.has(opportunite.id));
}

function computeSavedFishKg(opportunites: Opportunite[], transactions: Transaction[], opportunitesById: Map<string, Opportunite>) {
  const savedByOpportunity = new Map<string, number>();

  opportunites.forEach((opportunite) => {
    savedByOpportunity.set(opportunite.id, parseQuantityInKg(opportunite.quantiteDemandee));
  });

  transactions.forEach((transaction) => {
    const opportunite = opportunitesById.get(transaction.opportuniteId);
    savedByOpportunity.set(transaction.opportuniteId, parseQuantityInKg(transaction.quantite || opportunite?.quantiteDemandee || "0 kg"));
  });

  return Array.from(savedByOpportunity.values()).reduce((total, value) => total + value, 0);
}

function computeImpactedQuais(arrivages: Arrivage[], opportunites: Opportunite[], transactions: Transaction[]): ImpactQuai[] {
  const grouped = new Map<string, { quai: string; volumeKg: number; opportunites: number; transactions: number }>();

  arrivages.forEach((arrivage) => {
    const current = grouped.get(normalize(arrivage.quai)) ?? { quai: arrivage.quai, volumeKg: 0, opportunites: 0, transactions: 0 };
    current.volumeKg += parseQuantityInKg(arrivage.quantite);
    grouped.set(normalize(arrivage.quai), current);
  });

  opportunites.forEach((opportunite) => {
    const current = grouped.get(normalize(opportunite.lieu)) ?? { quai: opportunite.lieu, volumeKg: 0, opportunites: 0, transactions: 0 };
    current.opportunites += 1;
    grouped.set(normalize(opportunite.lieu), current);
  });

  transactions.forEach((transaction) => {
    const current = grouped.get(normalize(transaction.quai)) ?? { quai: transaction.quai, volumeKg: 0, opportunites: 0, transactions: 0 };
    current.transactions += 1;
    grouped.set(normalize(transaction.quai), current);
  });

  return Array.from(grouped.values())
    .map((item) => ({
      quai: item.quai,
      region: getQuaiReference(item.quai)?.region ?? "Zone pilote",
      volumeValorise: formatKg(item.volumeKg),
      opportunites: item.opportunites,
      transactions: item.transactions,
      scoreImpact: Math.round(item.volumeKg / 100) + item.opportunites * 8 + item.transactions * 12
    }))
    .sort((first, second) => second.scoreImpact - first.scoreImpact)
    .slice(0, 5);
}

function getIndicativePrice(espece: string) {
  return getEspeceReference(espece)?.prixIndicatifFcfaKg ?? 1000;
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

function formatFcfa(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
