export type ProductRoleSlug = "pecheur" | "mareyeur" | "transformateur" | "collectivite" | "administration";

export type ProductRoleJourney = {
  slug: ProductRoleSlug;
  label: string;
  objectifPrincipal: string;
  premiereAction: string;
  prochainesActions: string[];
  modulesUtiles: { label: string; href: string }[];
  donneesARegarder: string[];
  valeurAttendue: string;
  lienPrincipal: string;
};

export type ProductFlow = {
  id: string;
  titre: string;
  description: string;
  etapes: string[];
  moduleFinal: { label: string; href: string };
};

export type PriorityAction = {
  titre: string;
  description: string;
  roleConcerne: string;
  moduleCible: string;
  lien: string;
  resultatAttendu: string;
  statutRecommande: "Maintenant" | "Ensuite" | "Surveiller";
};

export const roleJourneys: ProductRoleJourney[] = [
  {
    slug: "pecheur",
    label: "Pêcheur",
    objectifPrincipal: "Rendre mon lot visible.",
    premiereAction: "Déclarer un arrivage.",
    prochainesActions: ["Suivre la qualité du lot", "Voir si une opportunité existe", "Suivre la réservation ou la transaction"],
    modulesUtiles: [
      { label: "Arrivages", href: "/arrivages" },
      { label: "Opportunités", href: "/opportunites" },
      { label: "Transactions", href: "/transactions" },
      { label: "Notifications", href: "/notifications" }
    ],
    donneesARegarder: ["statut du lot", "qualité", "opportunité liée", "transaction"],
    valeurAttendue: "Le lot ne reste pas invisible : il peut être détecté, réservé et suivi.",
    lienPrincipal: "/arrivages"
  },
  {
    slug: "mareyeur",
    label: "Mareyeur",
    objectifPrincipal: "Trouver un lot disponible ou publier un besoin.",
    premiereAction: "Publier un besoin ou réserver une opportunité.",
    prochainesActions: ["Comparer les lots compatibles", "Réserver le meilleur lot", "Suivre la transaction"],
    modulesUtiles: [
      { label: "Besoins", href: "/besoins" },
      { label: "Arrivages", href: "/arrivages" },
      { label: "Opportunités", href: "/opportunites" },
      { label: "Transactions", href: "/transactions" }
    ],
    donneesARegarder: ["espèce", "volume", "score de recommandation", "confiance acteur"],
    valeurAttendue: "Le besoin est relié aux arrivages compatibles et devient actionnable.",
    lienPrincipal: "/besoins"
  },
  {
    slug: "transformateur",
    label: "Transformateur",
    objectifPrincipal: "Capter un surplus et sécuriser un approvisionnement.",
    premiereAction: "Publier un besoin industriel ou réserver un lot sensible.",
    prochainesActions: ["Identifier les lots à risque", "Coordonner une opportunité prioritaire", "Suivre la livraison"],
    modulesUtiles: [
      { label: "Besoins", href: "/besoins" },
      { label: "Opportunités", href: "/opportunites" },
      { label: "Transactions", href: "/transactions" },
      { label: "Notifications", href: "/notifications" }
    ],
    donneesARegarder: ["qualité", "risque de perte", "volume disponible", "urgence"],
    valeurAttendue: "Les surplus ou lots sensibles peuvent être valorisés plus vite.",
    lienPrincipal: "/opportunites"
  },
  {
    slug: "collectivite",
    label: "Collectivité",
    objectifPrincipal: "Comprendre les tensions territoriales et prioriser l'action.",
    premiereAction: "Consulter les quais sous tension.",
    prochainesActions: ["Comparer les quais", "Identifier les besoins non couverts", "Suivre l'impact"],
    modulesUtiles: [
      { label: "Quais", href: "/quais" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Coordination", href: "/coordination" },
      { label: "Notifications", href: "/notifications" }
    ],
    donneesARegarder: ["tension", "volume débarqué", "besoins ouverts", "impact"],
    valeurAttendue: "La collectivité voit où agir et quels quais prioriser.",
    lienPrincipal: "/quais"
  },
  {
    slug: "administration",
    label: "Administration",
    objectifPrincipal: "Décider à partir des KPI, risques et priorités.",
    premiereAction: "Lire la vue exécutive.",
    prochainesActions: ["Comparer les risques", "Lire la carte", "Valider les décisions recommandées"],
    modulesUtiles: [
      { label: "Executive", href: "/executive" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Coordination", href: "/coordination" },
      { label: "Quais", href: "/quais" }
    ],
    donneesARegarder: ["KPI", "carte", "risques", "décisions"],
    valeurAttendue: "Les signaux métier deviennent une lecture institutionnelle exploitable.",
    lienPrincipal: "/executive"
  }
];

export const transversalFlows: ProductFlow[] = [
  {
    id: "lot",
    titre: "Parcours lot",
    description: "Un lot déclaré devient visible, qualifié, rapproché d'un besoin puis suivi jusqu'à la transaction.",
    etapes: ["Déclaration", "Qualité", "Opportunité", "Réservation", "Traçabilité"],
    moduleFinal: { label: "Arrivages", href: "/arrivages" }
  },
  {
    id: "besoin",
    titre: "Parcours besoin",
    description: "Un besoin publié déclenche la recherche de lots compatibles et la priorisation des opportunités.",
    etapes: ["Publication", "Matching", "Priorité", "Réservation"],
    moduleFinal: { label: "Besoins", href: "/besoins" }
  },
  {
    id: "opportunite",
    titre: "Parcours opportunité",
    description: "Une opportunité explique pourquoi deux acteurs doivent être mis en relation.",
    etapes: ["Score", "Confiance", "Qualité", "Coordination"],
    moduleFinal: { label: "Opportunités", href: "/opportunites" }
  },
  {
    id: "transaction",
    titre: "Parcours transaction",
    description: "Une réservation ouvre un suivi opérationnel jusqu'au retrait ou à la finalisation.",
    etapes: ["Réservée", "Préparation", "Retrait", "Terminée"],
    moduleFinal: { label: "Transactions", href: "/transactions" }
  },
  {
    id: "territoire",
    titre: "Décision territoriale",
    description: "Les tensions, alertes et impacts aident les collectivités et partenaires à décider où agir.",
    etapes: ["Carte", "Tension", "Priorité", "Décision"],
    moduleFinal: { label: "Executive", href: "/executive" }
  }
];

export const priorityActions: PriorityAction[] = [
  {
    titre: "Déclarer un arrivage",
    description: "Rendre un lot visible pour déclencher qualité, matching et traçabilité.",
    roleConcerne: "Pêcheur",
    moduleCible: "Arrivages",
    lien: "/arrivages",
    resultatAttendu: "Un lot peut être détecté par un besoin compatible.",
    statutRecommande: "Maintenant"
  },
  {
    titre: "Publier un besoin",
    description: "Exprimer une demande pour rechercher automatiquement des lots compatibles.",
    roleConcerne: "Mareyeur / Transformateur",
    moduleCible: "Besoins",
    lien: "/besoins",
    resultatAttendu: "Le matching cherche les arrivages correspondants.",
    statutRecommande: "Maintenant"
  },
  {
    titre: "Coordonner une opportunité",
    description: "Transformer une recommandation en mise en relation opérationnelle, suivie et traçable.",
    roleConcerne: "Mareyeur / Transformateur",
    moduleCible: "Opportunités",
    lien: "/opportunites",
    resultatAttendu: "Les acteurs compatibles sont mobilisés et la transaction locale peut être suivie.",
    statutRecommande: "Maintenant"
  },
  {
    titre: "Suivre une transaction",
    description: "Contrôler l'avancement après réservation et vérifier la traçabilité du lot.",
    roleConcerne: "Tous les acteurs opérationnels",
    moduleCible: "Transactions",
    lien: "/transactions",
    resultatAttendu: "Le retrait et la finalisation deviennent visibles.",
    statutRecommande: "Ensuite"
  },
  {
    titre: "Lire une notification critique",
    description: "Traiter les alertes métier qui demandent une action immédiate.",
    roleConcerne: "Tous les rôles",
    moduleCible: "Notifications",
    lien: "/notifications",
    resultatAttendu: "Les signaux critiques sont reliés à une page d'action.",
    statutRecommande: "Surveiller"
  },
  {
    titre: "Consulter un quai sous tension",
    description: "Identifier où la demande dépasse l'offre et quelle action territoriale prioriser.",
    roleConcerne: "Collectivité",
    moduleCible: "Quais",
    lien: "/quais",
    resultatAttendu: "La décision territoriale devient lisible.",
    statutRecommande: "Maintenant"
  },
  {
    titre: "Lire la vue exécutive",
    description: "Arbitrer à partir des KPI, risques, carte et décisions recommandées.",
    roleConcerne: "Administration / Partenaire",
    moduleCible: "Executive",
    lien: "/executive",
    resultatAttendu: "Les signaux du MVP deviennent une synthèse institutionnelle.",
    statutRecommande: "Ensuite"
  }
];

export const pageMissions: Record<string, string> = {
  arrivages: "Cette page sert à rendre les lots visibles. Après une déclaration, Mbàmbulaan peut détecter une opportunité compatible.",
  besoins: "Cette page sert à publier la demande. Ensuite, le matching cherche les lots compatibles.",
  opportunites: "Cette page sert à choisir quelle mise en relation traiter en premier, mobiliser les acteurs compatibles et consulter le détail.",
  transactions: "Cette page sert à suivre l'état d'un lot réservé et à accéder à sa traçabilité.",
  notifications: "Cette page sert à traiter les signaux métier et revenir vers le module concerné.",
  quais: "Cette page sert à choisir un quai sous tension et comprendre la décision territoriale possible.",
  dashboard: "Cette page sert à mesurer l'activité du jour.",
  coordination: "Cette page sert à piloter les actions opérationnelles.",
  executive: "Cette page sert à décider au niveau institutionnel à partir des KPI, de la carte et des risques."
};

export function getRoleJourneys() {
  return roleJourneys;
}

export function getRoleJourney(slug: ProductRoleSlug) {
  return roleJourneys.find((journey) => journey.slug === slug);
}

export function getPriorityActions() {
  return priorityActions;
}

export function getPriorityActionByModule(moduleCible: string) {
  return priorityActions.find((action) => action.moduleCible === moduleCible);
}

export function getPageMission(page: keyof typeof pageMissions) {
  return pageMissions[page];
}
