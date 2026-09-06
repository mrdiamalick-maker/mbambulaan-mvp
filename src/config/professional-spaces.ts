import type { Role } from "@/domain/types";

export type ProfessionalSpace = {
  eyebrow: string;
  title: string;
  valuePromise: string;
  primaryAction: { label: string; href: string };
  priorities: string[];
  outcomes: string[];
};

export const professionalSpaces: Record<Role, ProfessionalSpace> = {
  administrateur: {
    eyebrow: "Supervision Mbàmbulaan",
    title: "Garantir la qualité, les droits et la continuité du service",
    valuePromise: "Exploiter la plateforme, fiabiliser les référentiels et traiter les exceptions.",
    primaryAction: { label: "Ouvrir l’administration", href: "/app/administration" },
    priorities: ["Données à corriger", "Accès à valider", "Incidents à traiter"],
    outcomes: ["Référentiels fiables", "Droits maîtrisés", "Service exploitable"]
  },
  operateur: {
    eyebrow: "Opérations terrain",
    title: "Confirmer les arrivées et sécuriser chaque débarquement",
    valuePromise: "Réduire les erreurs terrain et produire une donnée exploitable immédiatement.",
    primaryAction: { label: "Ouvrir les opérations", href: "/app/operations" },
    priorities: ["Arrivées imminentes", "Pesées à valider", "Anomalies à corriger"],
    outcomes: ["Débarquements fiables", "Lots correctement constitués", "Traçabilité terrain"]
  },
  capitaine: {
    eyebrow: "Activité du jour",
    title: "Suivre votre sortie, du retour au débarquement",
    valuePromise: "Mieux préparer le retour, réduire les attentes et sécuriser les informations de capture.",
    primaryAction: { label: "Suivre ma sortie", href: "/app/operations" },
    priorities: ["Retour à confirmer", "Besoin à signaler", "Lots à vérifier"],
    outcomes: ["Retour mieux préparé", "Temps d’attente réduit", "Historique d’activité"]
  },
  mareyeur: {
    eyebrow: "Approvisionnement",
    title: "Trouver des lots fiables et sécuriser vos engagements",
    valuePromise: "Identifier rapidement les disponibilités pertinentes et organiser l’enlèvement.",
    primaryAction: { label: "Voir les opportunités", href: "/app/marches" },
    priorities: ["Besoins actifs", "Lots pertinents", "Enlèvements à organiser"],
    outcomes: ["Approvisionnement plus rapide", "Moins d’incertitude", "Engagements suivis"]
  },
  transformateur: {
    eyebrow: "Planification de production",
    title: "Sécuriser les volumes et activer vos capacités",
    valuePromise: "Anticiper les approvisionnements et limiter les ruptures de production.",
    primaryAction: { label: "Planifier l’approvisionnement", href: "/app/marches" },
    priorities: ["Volumes à sécuriser", "Capacité disponible", "Écarts de qualité"],
    outcomes: ["Production mieux planifiée", "Capacités mieux utilisées", "Ruptures réduites"]
  },
  prestataire: {
    eyebrow: "Capacités territoriales",
    title: "Recevoir des demandes qualifiées et mieux utiliser vos moyens",
    valuePromise: "Rendre vos capacités visibles, planifier les interventions et clôturer les prestations.",
    primaryAction: { label: "Voir les demandes", href: "/app/coordination" },
    priorities: ["Demandes reçues", "Capacités à confirmer", "Prestations à clôturer"],
    outcomes: ["Taux d’utilisation amélioré", "Planning plus fiable", "Interventions tracées"]
  },
  gestionnaire_organisation: {
    eyebrow: "Organisation professionnelle",
    title: "Piloter les membres, actifs et engagements collectifs",
    valuePromise: "Coordonner l’activité de l’organisation et démontrer les résultats obtenus.",
    primaryAction: { label: "Ouvrir l’organisation", href: "/app/organisation" },
    priorities: ["Besoins collectifs", "Engagements en retard", "Initiatives à suivre"],
    outcomes: ["Membres mieux organisés", "Capacités partagées", "Résultats consolidés"]
  },
  coordinateur: {
    eyebrow: "Coordination territoriale",
    title: "Prioriser les tensions et organiser les réponses",
    valuePromise: "Mettre les bons acteurs autour de la bonne situation avec des responsabilités claires.",
    primaryAction: { label: "Traiter la priorité", href: "/app/situations" },
    priorities: ["Situations critiques", "Responsables à mobiliser", "Actions bloquées"],
    outcomes: ["Réponses plus rapides", "Responsabilités explicites", "Résultats documentés"]
  },
  institution: {
    eyebrow: "Pilotage public",
    title: "Arbitrer sur une situation consolidée et vérifiable",
    valuePromise: "Comprendre les territoires, cibler les décisions et suivre les résultats des actions publiques.",
    primaryAction: { label: "Ouvrir le pilotage", href: "/app/pilotage" },
    priorities: ["Territoires sous tension", "Infrastructures critiques", "Décisions attendues"],
    outcomes: ["Décisions mieux ciblées", "Programmes suivis", "Redevabilité renforcée"]
  },
  partenaire: {
    eyebrow: "Partenariat et impact",
    title: "Suivre les besoins qualifiés et les résultats financés",
    valuePromise: "Relier chaque appui à un besoin réel, une action suivie et un résultat observable.",
    primaryAction: { label: "Voir les initiatives", href: "/app/initiatives" },
    priorities: ["Besoins qualifiés", "Appuis à instruire", "Résultats à vérifier"],
    outcomes: ["Portefeuille plus lisible", "Impact démontré", "Risque d’exécution réduit"]
  }
};
