import demoData from "@/data/demo.json";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching, computeTransactionMetrics, computeTransactions } from "@/lib/coordination";
import type { TransactionStatus } from "@/lib/coordination";

export type DemoStep = {
  id: number;
  title: string;
  actor: string;
  data: string;
  module: string;
  businessValue: string;
};

export type DemoJourney = {
  title: string;
  summary: string;
  steps: DemoStep[];
  impact: {
    opportunities: number;
    coverageRate: number;
    activeTransactions: number;
    topQuai: string;
  };
};

export function getDemoJourney(): DemoJourney {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboard = computeDashboardMetrics(arrivages, besoins, opportunites);
  const arrivage = arrivages.find((item) => item.id === demoData.arrivageId) ?? arrivages[0];
  const besoin = besoins.find((item) => item.id === demoData.besoinId) ?? besoins[0];
  const opportunite = opportunites.find((item) => item.arrivageId === arrivage.id && item.besoinId === besoin.id) ?? opportunites[0];
  const transactionStatus = demoData.transactionStatus as TransactionStatus;
  const transactionStatusByOpportunityId: Record<string, TransactionStatus> = opportunite ? { [opportunite.id]: transactionStatus } : {};
  const transactions = computeTransactions(opportunites, transactionStatusByOpportunityId);
  const transactionMetrics = computeTransactionMetrics(transactions);
  const topQuai = dashboard.quaisActifs[0]?.quai ?? arrivage.quai;

  return {
    title: demoData.scenarioTitle,
    summary: demoData.scenarioSummary,
    steps: [
      {
        id: 1,
        title: "Une pirogue débarque à Joal",
        actor: arrivage.vendeur ?? "Pecheur de Joal",
        data: `${arrivage.quantite} de ${arrivage.espece} a ${arrivage.heureDebarquement}`,
        module: "Quais",
        businessValue: "Le territoire voit immédiatement ou se concentre l'activite."
      },
      {
        id: 2,
        title: "Un arrivage est publié",
        actor: "Pecheur",
        data: `${arrivage.espece} disponible sur ${arrivage.quai}`,
        module: "Arrivages",
        businessValue: "Le lot devient visible pour les acteurs qui peuvent l'absorber."
      },
      {
        id: 3,
        title: "Un besoin compatible existe",
        actor: besoin.acheteur ?? "Acheteur pilote",
        data: `${besoin.quantite} de ${besoin.espece} recherches`,
        module: "Besoins",
        businessValue: "La demande est formalisee avant que le lot ne se perde."
      },
      {
        id: 4,
        title: "Mbàmbulaan détecte une opportunité",
        actor: "Moteur de coordination",
        data: opportunite ? `Compatibilite ${opportunite.scoreCompatibilite}%` : "Correspondance mockee",
        module: "Opportunites",
        businessValue: "La plateforme rapproche l'offre et la demande sans ajouter d'intermediaire inutile."
      },
      {
        id: 5,
        title: "Un acteur réserve le lot",
        actor: demoData.reservedBy,
        data: opportunite ? `${opportunite.quantiteDemandee} reserves` : besoin.quantite,
        module: "Opportunites",
        businessValue: "La disponibilite devient lisible et le lot sort des opportunites ouvertes."
      },
      {
        id: 6,
        title: "La transaction avance",
        actor: demoData.reservedBy,
        data: `Statut : ${transactionStatus}`,
        module: "Transactions",
        businessValue: "Les partenaires suivent l'execution operationnelle du lot."
      },
      {
        id: 7,
        title: "Le dashboard et la carte reflètent l'impact",
        actor: "Collectivite et partenaires",
        data: `${dashboard.stats.tauxCouvertureBesoins}% de couverture, ${topQuai} actif`,
        module: "Dashboard et Quais",
        businessValue: "La decision publique s'appuie sur des signaux consolides."
      }
    ],
    impact: {
      opportunities: opportunites.length,
      coverageRate: dashboard.stats.tauxCouvertureBesoins,
      activeTransactions: transactionMetrics.transactionsActives,
      topQuai
    }
  };
}
