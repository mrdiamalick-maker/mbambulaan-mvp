import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeDashboardMetrics, computeMatching, computeTransactions } from "@/lib/coordination";
import type { TransactionStatus } from "@/lib/coordination";
import { countUnreadNotifications, createNotifications } from "@/lib/notifications";

export type EspaceSlug = "pecheur" | "mareyeur" | "transformateur" | "collectivite" | "admin";

export type EspaceProfile = {
  slug: EspaceSlug;
  role: string;
  mission: string;
  needs: string[];
  features: {
    label: string;
    href: string;
  }[];
};

export type ProfileMetrics = {
  notifications: number;
  transactions: number;
  opportunites: number;
};

export const espaces: EspaceProfile[] = [
  {
    slug: "pecheur",
    role: "Pêcheur",
    mission: "Déclarer ses arrivages, suivre leur statut et voir les réservations issues de son activité.",
    needs: ["Publier rapidement un lot", "Consulter ses declarations", "Voir les reservations", "Suivre les transactions"],
    features: [
      { label: "Déclarer un arrivage", href: "/arrivages" },
      { label: "Voir les réservations", href: "/opportunites" },
      { label: "Suivre les transactions", href: "/transactions" },
      { label: "Notifications", href: "/notifications" }
    ]
  },
  {
    slug: "mareyeur",
    role: "Mareyeur",
    mission: "Rechercher des arrivages, publier des besoins et réserver les lots compatibles.",
    needs: ["Trouver du volume disponible", "Publier une demande", "Comparer les opportunites", "Sécuriser une transaction"],
    features: [
      { label: "Rechercher des arrivages", href: "/arrivages" },
      { label: "Publier un besoin", href: "/besoins" },
      { label: "Consulter les opportunités", href: "/opportunites" },
      { label: "Suivre ses transactions", href: "/transactions" }
    ]
  },
  {
    slug: "transformateur",
    role: "Transformateur",
    mission: "Planifier les besoins industriels, réserver des lots et suivre les livraisons.",
    needs: ["Exprimer un besoin industriel", "Réserver un lot compatible", "Suivre les livraisons", "Recevoir les alertes utiles"],
    features: [
      { label: "Publier un besoin", href: "/besoins" },
      { label: "Réserver", href: "/opportunites" },
      { label: "Livraisons", href: "/transactions" },
      { label: "Notifications", href: "/notifications" }
    ]
  },
  {
    slug: "collectivite",
    role: "Collectivité",
    mission: "Observer la filière, comprendre l'activité des quais et suivre les signaux territoriaux.",
    needs: ["Voir les indicateurs", "Comparer les quais", "Identifier les alertes", "Lire l'impact territorial"],
    features: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Carte des quais", href: "/quais" },
      { label: "Statistiques", href: "/dashboard" },
      { label: "Notifications territoriales", href: "/notifications" }
    ]
  },
  {
    slug: "admin",
    role: "Administrateur",
    mission: "Accéder à la vue globale de coordination et piloter tous les modules du MVP.",
    needs: ["Superviser les données mockées", "Contrôler les flux", "Voir les opportunités", "Suivre l'activité complète"],
    features: [
      { label: "Arrivages", href: "/arrivages" },
      { label: "Besoins", href: "/besoins" },
      { label: "Opportunités", href: "/opportunites" },
      { label: "Transactions", href: "/transactions" },
      { label: "Notifications", href: "/notifications" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Carte", href: "/quais" }
    ]
  }
];

export function getEspaces() {
  return espaces;
}

export function getEspaceBySlug(slug: EspaceSlug) {
  return espaces.find((espace) => espace.slug === slug);
}

export function getProfileMetrics(): ProfileMetrics {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatching(arrivages, besoins);
  const dashboardData = computeDashboardMetrics(arrivages, besoins, opportunites);
  const notifications = createNotifications(arrivages, besoins, opportunites, dashboardData);
  const firstOpportunity = opportunites[0];
  const transactionStatusByOpportunityId: Record<string, TransactionStatus> = firstOpportunity ? { [firstOpportunity.id]: "En préparation" } : {};
  const transactions = computeTransactions(opportunites, transactionStatusByOpportunityId);

  return {
    notifications: countUnreadNotifications(notifications),
    transactions: transactions.length,
    opportunites: opportunites.length
  };
}
