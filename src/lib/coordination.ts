import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";

export const misesEnRelationStorageKey = "mbambulaan:mises-en-relation";
export const reservationsStorageKey = "mbambulaan:opportunites-reservees";
export const transactionsStorageKey = "mbambulaan:transactions";

export type OpportuniteStatus = "Correspondance trouvée" | "Contact initié" | "Réservée";
export type TransactionStatus = "Réservée" | "En préparation" | "En cours de retrait" | "Terminée" | "Annulée";

export type CoordinationPriority = "Haute" | "Moyenne" | "Faible";

export type Opportunite = {
  id: string;
  arrivageId: string;
  besoinId: string;
  espece: string;
  quantite: string;
  lieu: string;
  vendeur: string;
  acheteur: string;
  quantiteDisponible: string;
  quantiteDemandee: string;
  scoreCompatibilite: number;
  priorite: CoordinationPriority;
  statut: OpportuniteStatus;
  raisons: string[];
  offre: {
    id: string;
    quai: string;
    vendeur: string;
    quantite: string;
    heureDebarquement: string;
    statut: string;
  };
  besoin: {
    id: string;
    quai: string;
    acheteur: string;
    quantite: string;
    urgence: string;
    commentaire: string;
  };
};

export type MatchingSummary = {
  nombreOpportunites: number;
  tauxCouvertureBesoins: number;
  arrivagesDisponibles: number;
  misesEnRelationCreees: number;
};

export type DashboardData = {
  stats: {
    arrivagesPublies: number;
    volumeTotalDebarque: string;
    besoinsOuverts: number;
    opportunitesDetectees: number;
    misesEnRelationInitiees: number;
    tauxCouvertureBesoins: number;
  };
  quaisActifs: {
    quai: string;
    arrivages: number;
    volumeTotal: string;
    besoinsLies: number;
  }[];
  especesDemandees: {
    espece: string;
    volumeDisponible: string;
    volumeDemande: string;
    ecart: string;
    ecartKg: number;
  }[];
  opportunitesRecentes: {
    id: string;
    espece: string;
    quai: string;
    acteurDemandeur: string;
    statut: string;
  }[];
  insights: string[];
  alertes: string[];
};

export type ReservationMetrics = {
  opportunitesOuvertes: number;
  opportunitesReservees: number;
  tauxReservation: number;
};

export type Transaction = {
  id: string;
  opportuniteId: string;
  statut: TransactionStatus;
  espece: string;
  quai: string;
  quantite: string;
  date: string;
  acteurReserve: string;
};

export type TransactionMetrics = {
  transactionsActives: number;
  transactionsTerminees: number;
  tauxFinalisation: number;
};

export const transactionStatuses: TransactionStatus[] = ["Réservée", "En préparation", "En cours de retrait", "Terminée", "Annulée"];

export function computeMatching(arrivages: Arrivage[], besoins: Besoin[], reservedOpportunityIds: string[] = []): Opportunite[] {
  return besoins
    .flatMap((besoin) =>
      arrivages
        .flatMap((arrivage) => {
          const scoreCompatibilite = computeCompatibility(arrivage, besoin);

          const opportunityId = `${arrivage.id}-${besoin.id}`;

          if (scoreCompatibilite < 70 || reservedOpportunityIds.includes(opportunityId)) return [];

          const vendeur = arrivage.vendeur ?? `Vendeur ${arrivage.quai}`;
          const acheteur = besoin.acheteur ?? `Acheteur ${besoin.quai}`;

          return [
            {
              id: opportunityId,
              arrivageId: arrivage.id,
              besoinId: besoin.id,
              espece: besoin.espece,
              quantite: besoin.quantite,
              lieu: arrivage.quai,
              vendeur,
              acheteur,
              quantiteDisponible: arrivage.quantite,
              quantiteDemandee: besoin.quantite,
              scoreCompatibilite,
              priorite: computePriority(scoreCompatibilite),
              statut: "Correspondance trouvée" as const,
              raisons: buildMatchingReasons(arrivage, besoin),
              offre: {
                id: arrivage.id,
                quai: arrivage.quai,
                vendeur,
                quantite: arrivage.quantite,
                heureDebarquement: arrivage.heureDebarquement,
                statut: arrivage.statut
              },
              besoin: {
                id: besoin.id,
                quai: besoin.quai,
                acheteur,
                quantite: besoin.quantite,
                urgence: besoin.urgence,
                commentaire: besoin.commentaire
              }
            }
          ];
        })
    )
    .sort((first, second) => second.scoreCompatibilite - first.scoreCompatibilite);
}

export function computeCompatibility(arrivage: Arrivage, besoin: Besoin) {
  const sameSpecies = normalize(arrivage.espece) === normalize(besoin.espece);
  const availableKg = parseQuantiteEnKg(arrivage.quantite);
  const neededKg = parseQuantiteEnKg(besoin.quantite);
  const quantityCompatible = availableKg >= neededKg && neededKg > 0;
  const sameZone = normalize(arrivage.quai) === normalize(besoin.quai);
  const availableStatus = arrivage.statut === "Disponible" || arrivage.statut === "Reserve" || arrivage.statut === "En controle";
  const timeReady = Boolean(arrivage.heureDebarquement);

  let score = 0;
  if (sameSpecies) score += 35;
  if (quantityCompatible) score += 25;
  if (sameZone) score += 15;
  if (availableStatus) score += 15;
  if (timeReady) score += 10;

  if (sameSpecies && quantityCompatible) {
    const surplusRatio = availableKg > 0 ? Math.max(0, (availableKg - neededKg) / availableKg) : 0;
    score += Math.max(0, Math.round(8 - surplusRatio * 8));
  }

  return Math.min(100, score);
}

export function computePriority(score: number): CoordinationPriority {
  if (score >= 90) return "Haute";
  if (score >= 75) return "Moyenne";
  return "Faible";
}

export function computeDashboardMetrics(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], misesEnRelationInitiees = 0): DashboardData {
  const besoinsCouverts = new Set(opportunites.map((opportunite) => opportunite.besoinId)).size;
  const quaisActifs = computeQuaisActifs(arrivages, besoins);
  const especesDemandees = computeEspecesDemandees(arrivages, besoins);
  const opportunitesRecentes = opportunites.slice(0, 5).map((opportunite) => ({
    id: opportunite.id,
    espece: opportunite.espece,
    quai: opportunite.lieu,
    acteurDemandeur: opportunite.acheteur,
    statut: opportunite.statut
  }));
  const alertes = computeAlerts(arrivages, besoins, opportunites);

  return {
    stats: {
      arrivagesPublies: arrivages.length,
      volumeTotalDebarque: formatKg(sumQuantites(arrivages.map((arrivage) => arrivage.quantite))),
      besoinsOuverts: besoins.length,
      opportunitesDetectees: opportunites.length,
      misesEnRelationInitiees,
      tauxCouvertureBesoins: besoins.length === 0 ? 0 : Math.round((besoinsCouverts / besoins.length) * 100)
    },
    quaisActifs,
    especesDemandees,
    opportunitesRecentes,
    insights: computeInstitutionalInsights(quaisActifs, especesDemandees, misesEnRelationInitiees),
    alertes
  };
}

export function computeAlerts(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[]) {
  const alertes: string[] = [];
  const especes = computeEspecesDemandees(arrivages, besoins);
  const quais = computeQuaisActifs(arrivages, besoins);
  const opportunitesPrioritaires = opportunites.filter((opportunite) => opportunite.priorite === "Haute" && opportunite.statut === "Correspondance trouvée");

  especes
    .filter((espece) => espece.ecartKg < 0)
    .forEach((espece) => alertes.push(`Forte demande de ${espece.espece} non couverte.`));

  quais
    .filter((quai) => quai.arrivages >= 2)
    .forEach((quai) => alertes.push(`Trop de debarquements concentres sur ${quai.quai}.`));

  besoins
    .filter((besoin) => !opportunites.some((opportunite) => opportunite.besoinId === besoin.id))
    .forEach((besoin) => alertes.push(`Aucun transformateur disponible pour ${besoin.espece}.`));

  if (opportunitesPrioritaires.length > 0) {
    alertes.push("Opportunité prioritaire en attente.");
  }

  return alertes;
}

export function computeMatchingSummary(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], misesEnRelationCreees = 0): MatchingSummary {
  const besoinsCouverts = new Set(opportunites.map((opportunite) => opportunite.besoinId)).size;

  return {
    nombreOpportunites: opportunites.length,
    tauxCouvertureBesoins: besoins.length === 0 ? 0 : Math.round((besoinsCouverts / besoins.length) * 100),
    arrivagesDisponibles: arrivages.length,
    misesEnRelationCreees
  };
}

export function computeReservationMetrics(opportunites: Opportunite[], reservedOpportunityIds: string[] = []): ReservationMetrics {
  const opportunitesReservees = opportunites.filter((opportunite) => reservedOpportunityIds.includes(opportunite.id)).length;
  const total = opportunites.length;

  return {
    opportunitesOuvertes: Math.max(0, total - opportunitesReservees),
    opportunitesReservees,
    tauxReservation: total === 0 ? 0 : Math.round((opportunitesReservees / total) * 100)
  };
}

export function computeTransactions(opportunites: Opportunite[], transactionStatusByOpportunityId: Record<string, TransactionStatus> = {}): Transaction[] {
  return opportunites
    .filter((opportunite) => transactionStatusByOpportunityId[opportunite.id])
    .map((opportunite) => ({
      id: `trx-${opportunite.id}`,
      opportuniteId: opportunite.id,
      statut: transactionStatusByOpportunityId[opportunite.id],
      espece: opportunite.espece,
      quai: opportunite.lieu,
      quantite: opportunite.quantiteDemandee,
      date: createTransactionDate(opportunite.id),
      acteurReserve: "Transformateur pilote"
    }))
    .sort((first, second) => second.date.localeCompare(first.date));
}

export function computeTransactionMetrics(transactions: Transaction[]): TransactionMetrics {
  const transactionsTerminees = transactions.filter((transaction) => transaction.statut === "Terminée").length;
  const transactionsActives = transactions.filter((transaction) => transaction.statut !== "Terminée" && transaction.statut !== "Annulée").length;

  return {
    transactionsActives,
    transactionsTerminees,
    tauxFinalisation: transactions.length === 0 ? 0 : Math.round((transactionsTerminees / transactions.length) * 100)
  };
}

export function getNextTransactionStatus(status: TransactionStatus): TransactionStatus {
  if (status === "Réservée") return "En préparation";
  if (status === "En préparation") return "En cours de retrait";
  if (status === "En cours de retrait") return "Terminée";
  return status;
}

export function findOpportuniteById(opportunites: Opportunite[], id: string) {
  return opportunites.find((opportunite) => opportunite.id === id);
}

function createTransactionDate(seed: string) {
  const minutes = seed.split("").reduce((total, character) => total + character.charCodeAt(0), 0) % 360;
  const date = new Date(Date.UTC(2026, 5, 27, 8, 0));
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString();
}

function buildMatchingReasons(arrivage: Arrivage, besoin: Besoin) {
  const reasons = [
    `Meme espece detectee : ${besoin.espece}.`,
    `Quantite disponible suffisante : ${arrivage.quantite} pour ${besoin.quantite} demandes.`
  ];

  if (normalize(arrivage.quai) === normalize(besoin.quai)) {
    reasons.push(`Meme zone geographique : ${arrivage.quai}.`);
  } else {
    reasons.push(`Point de coordination propose : ${arrivage.quai}.`);
  }

  reasons.push(`Disponibilite suivie avec le statut ${arrivage.statut}.`);
  reasons.push(`Delai lisible depuis le debarquement de ${arrivage.heureDebarquement}.`);

  return reasons;
}

function computeQuaisActifs(arrivages: Arrivage[], besoins: Besoin[]) {
  const grouped = new Map<string, { quai: string; arrivages: number; volumeKg: number; besoinsLies: number }>();

  arrivages.forEach((arrivage) => {
    const current = grouped.get(arrivage.quai) ?? { quai: arrivage.quai, arrivages: 0, volumeKg: 0, besoinsLies: 0 };
    current.arrivages += 1;
    current.volumeKg += parseQuantiteEnKg(arrivage.quantite);
    grouped.set(arrivage.quai, current);
  });

  besoins.forEach((besoin) => {
    const current = grouped.get(besoin.quai) ?? { quai: besoin.quai, arrivages: 0, volumeKg: 0, besoinsLies: 0 };
    current.besoinsLies += 1;
    grouped.set(besoin.quai, current);
  });

  return Array.from(grouped.values())
    .sort((first, second) => second.arrivages - first.arrivages || second.volumeKg - first.volumeKg)
    .map((item) => ({
      quai: item.quai,
      arrivages: item.arrivages,
      volumeTotal: formatKg(item.volumeKg),
      besoinsLies: item.besoinsLies
    }));
}

function computeEspecesDemandees(arrivages: Arrivage[], besoins: Besoin[]) {
  const grouped = new Map<string, { espece: string; disponibleKg: number; demandeKg: number }>();

  arrivages.forEach((arrivage) => {
    const key = normalize(arrivage.espece);
    const current = grouped.get(key) ?? { espece: arrivage.espece, disponibleKg: 0, demandeKg: 0 };
    current.disponibleKg += parseQuantiteEnKg(arrivage.quantite);
    grouped.set(key, current);
  });

  besoins.forEach((besoin) => {
    const key = normalize(besoin.espece);
    const current = grouped.get(key) ?? { espece: besoin.espece, disponibleKg: 0, demandeKg: 0 };
    current.demandeKg += parseQuantiteEnKg(besoin.quantite);
    grouped.set(key, current);
  });

  return Array.from(grouped.values())
    .sort((first, second) => second.demandeKg - first.demandeKg)
    .map((item) => {
      const ecartKg = item.disponibleKg - item.demandeKg;

      return {
        espece: item.espece,
        volumeDisponible: formatKg(item.disponibleKg),
        volumeDemande: formatKg(item.demandeKg),
        ecart: `${ecartKg >= 0 ? "+" : "-"}${formatKg(Math.abs(ecartKg))}`,
        ecartKg
      };
    });
}

function computeInstitutionalInsights(
  quaisActifs: DashboardData["quaisActifs"],
  especesDemandees: DashboardData["especesDemandees"],
  misesEnRelationInitiees: number
) {
  const deficits = especesDemandees.filter((item) => item.ecartKg < 0).map((item) => item.espece);
  const topQuais = quaisActifs.slice(0, 2).map((item) => item.quai).join(" et ");
  const demandePhrase = deficits.length > 0 ? `La demande depasse l'offre sur ${deficits.join(", ")}.` : "Les volumes disponibles couvrent les besoins mockes detectes.";
  const quaisPhrase = topQuais ? `${topQuais} concentrent l'activite la plus visible.` : "Aucun quai actif n'est encore detecte.";
  const relationPhrase =
    misesEnRelationInitiees > 0
      ? `${misesEnRelationInitiees} mise(s) en relation sont deja activees.`
      : "Aucune mise en relation n'est encore activee dans cette session.";

  return [demandePhrase, quaisPhrase, relationPhrase];
}

function sumQuantites(values: string[]) {
  return values.reduce((total, value) => total + parseQuantiteEnKg(value), 0);
}

function parseQuantiteEnKg(value: string) {
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

function normalize(value: string) {
  return value.trim().toLowerCase();
}
