import demoData from "@/data/demo.json";
import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching, computeTransactionMetrics, computeTransactions } from "@/lib/coordination";
import type { TransactionStatus } from "@/lib/coordination";

export type DemoStep = {
  id: number;
  title: string;
  description: string;
  actor: string;
  data: string;
  module: string;
  businessValue: string;
  href: string;
  progressLabel: string;
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
  finalSummary: {
    arrivages: number;
    besoins: number;
    opportunites: number;
    transactions: number;
    couverture: number;
    notifications: number;
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
        title: "Le pêcheur débarque un lot",
        description: "Un lot frais est identifié au quai et devient le point de départ de la coordination.",
        actor: arrivage.vendeur ?? "Pecheur de Joal",
        data: `${arrivage.quantite} de ${arrivage.espece} a ${arrivage.heureDebarquement}`,
        module: "Quais",
        businessValue: "Le territoire voit immédiatement ou se concentre l'activite.",
        href: "/quais",
        progressLabel: "Arrivage"
      },
      {
        id: 2,
        title: "Le lot apparaît dans Arrivages",
        description: "Le débarquement est publié dans la liste opérationnelle des lots disponibles.",
        actor: "Pecheur",
        data: `${arrivage.espece} disponible sur ${arrivage.quai}`,
        module: "Arrivages",
        businessValue: "Le lot devient visible pour les acteurs qui peuvent l'absorber.",
        href: "/arrivages",
        progressLabel: "Arrivage"
      },
      {
        id: 3,
        title: "Le moteur détecte plusieurs besoins",
        description: "Les demandes publiées par les acheteurs sont comparées au lot disponible.",
        actor: besoin.acheteur ?? "Acheteur pilote",
        data: `${besoin.quantite} de ${besoin.espece} recherches`,
        module: "Besoins",
        businessValue: "La demande est formalisee avant que le lot ne se perde.",
        href: "/besoins",
        progressLabel: "Besoin"
      },
      {
        id: 4,
        title: "Une opportunité est créée",
        description: "Le moteur transforme la compatibilité en proposition concrète de mise en relation.",
        actor: "Moteur de coordination",
        data: opportunite ? `Compatibilite ${opportunite.scoreCompatibilite}%` : "Correspondance mockee",
        module: "Opportunites",
        businessValue: "La plateforme rapproche l'offre et la demande sans ajouter d'intermediaire inutile.",
        href: "/opportunites",
        progressLabel: "Opportunité"
      },
      {
        id: 5,
        title: "Le mareyeur réserve",
        description: "L'opportunité passe d'une proposition ouverte à une réservation suivie.",
        actor: demoData.reservedBy,
        data: opportunite ? `${opportunite.quantiteDemandee} reserves` : besoin.quantite,
        module: "Opportunites",
        businessValue: "La disponibilite devient lisible et le lot sort des opportunites ouvertes.",
        href: opportunite ? `/opportunites/${opportunite.id}` : "/opportunites",
        progressLabel: "Réservation"
      },
      {
        id: 6,
        title: "Une transaction est générée",
        description: "La réservation devient un suivi de transaction jusqu'à la finalisation du lot.",
        actor: demoData.reservedBy,
        data: `Statut : ${transactionStatus}`,
        module: "Transactions",
        businessValue: "Les partenaires suivent l'execution operationnelle du lot.",
        href: "/transactions",
        progressLabel: "Transaction"
      },
      {
        id: 7,
        title: "Les notifications sont envoyées",
        description: "Les acteurs concernés reçoivent les signaux métier produits par la journée.",
        actor: "Centre de notifications",
        data: "Notifications de réservation, transaction et couverture",
        module: "Notifications",
        businessValue: "Chaque acteur voit les événements importants sans attendre un appel ou un tableur.",
        href: "/notifications",
        progressLabel: "Notification"
      },
      {
        id: 8,
        title: "Le Dashboard se met à jour",
        description: "Les indicateurs consolidés racontent la valeur créée pour les partenaires.",
        actor: "Collectivite et partenaires",
        data: `${dashboard.stats.tauxCouvertureBesoins}% de couverture, ${topQuai} actif`,
        module: "Dashboard et Quais",
        businessValue: "La decision publique s'appuie sur des signaux consolides.",
        href: "/dashboard",
        progressLabel: "Tableau de bord"
      }
    ],
    impact: {
      opportunities: opportunites.length,
      coverageRate: dashboard.stats.tauxCouvertureBesoins,
      activeTransactions: transactionMetrics.transactionsActives,
      topQuai
    },
    finalSummary: {
      arrivages: 7,
      besoins: 5,
      opportunites: 4,
      transactions: 3,
      couverture: 95,
      notifications: 12
    }
  };
}
