export type PublicContentType = "Comprendre" | "Terrain" | "Analyse" | "Portrait" | "Guide" | "Actualité";

export type PublicNewsItem = {
  id: string;
  category: PublicContentType;
  domain:
    | "Pêche & ressources"
    | "Débarquement"
    | "Conservation & froid"
    | "Transformation & valorisation"
    | "Transport & logistique"
    | "Commerce & débouchés"
    | "Équipements & maintenance"
    | "Compétences & formation"
    | "Financement & développement"
    | "Territoires & infrastructures"
    | "Durabilité & environnement";
  title: string;
  excerpt: string;
  territory?: string;
  publishedAt: string;
  readingTime: string;
  verification: "Démonstration éditoriale" | "Information publique consolidée" | "Enrichi par Mbàmbulaan";
};

export type PublicOpportunityType = "Formation" | "Programme" | "Financement" | "Rencontre" | "Appel";

export type PublicAnnouncement = {
  id: string;
  type: PublicOpportunityType;
  title: string;
  description: string;
  territory: string;
  deadline: string;
  audience: string;
  organizer: string;
  status: "À venir" | "Ouvert" | "En préparation" | "Clôture prochaine";
  involvement: "Information" | "Relais Mbàmbulaan" | "Coordination Mbàmbulaan";
  verification: "Démonstration";
};

export const publicNews: PublicNewsItem[] = [
  {
    id: "comprendre-chaine-valeur",
    category: "Comprendre",
    domain: "Pêche & ressources",
    title: "De la mer au marché : comprendre la chaîne de valeur halieutique",
    excerpt: "Pêche, débarquement, conservation, transformation, transport et débouchés sont interdépendants. Comprendre ces liens aide à mieux cibler les besoins et les interventions.",
    territory: "Sénégal",
    publishedAt: "10 août 2026",
    readingTime: "7 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "guide-besoin-froid",
    category: "Guide",
    domain: "Conservation & froid",
    title: "Comment qualifier un besoin de glace ou de conservation avant d’agir",
    excerpt: "Volume, durée, localisation, fréquence et contraintes logistiques sont les premières informations à réunir pour organiser une réponse de froid adaptée.",
    territory: "Littoral sénégalais",
    publishedAt: "9 août 2026",
    readingTime: "5 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "terrain-joal",
    category: "Terrain",
    domain: "Territoires & infrastructures",
    title: "Joal : lire un territoire par ses activités, ses infrastructures et ses besoins",
    excerpt: "Une fiche territoriale utile ne se limite pas à une carte : elle relie activités, services documentés, contraintes, contenus et opportunités d’action.",
    territory: "Joal-Fadiouth",
    publishedAt: "8 août 2026",
    readingTime: "6 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "analyse-pertes-post-capture",
    category: "Analyse",
    domain: "Durabilité & environnement",
    title: "Pertes post-capture : pourquoi la coordination compte autant que l’équipement",
    excerpt: "Une infrastructure seule ne suffit pas toujours. Disponibilité, maintenance, transport, organisation et débouchés doivent être pensés ensemble.",
    territory: "National",
    publishedAt: "7 août 2026",
    readingTime: "8 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "portrait-mareyage",
    category: "Portrait",
    domain: "Commerce & débouchés",
    title: "Comprendre le rôle du mareyage dans la circulation du poisson",
    excerpt: "Le mareyage relie débarquement, achat, organisation logistique et marchés. Le métier est un maillon central pour comprendre les flux de la filière.",
    territory: "Sénégal",
    publishedAt: "6 août 2026",
    readingTime: "6 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "guide-transport",
    category: "Guide",
    domain: "Transport & logistique",
    title: "Organiser un besoin de transport de produits halieutiques",
    excerpt: "Origine, destination, volume, date, niveau de froid et fréquence permettent de transformer une demande vague en besoin réellement mobilisable.",
    territory: "Sénégal",
    publishedAt: "5 août 2026",
    readingTime: "5 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "comprendre-transformation",
    category: "Comprendre",
    domain: "Transformation & valorisation",
    title: "Transformation artisanale : où se crée la valeur après le débarquement ?",
    excerpt: "Séchage, fumage, salage, conditionnement et conservation prolongent la durée de vie des produits et ouvrent d’autres débouchés économiques.",
    territory: "Sénégal",
    publishedAt: "4 août 2026",
    readingTime: "7 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "analyse-maintenance",
    category: "Analyse",
    domain: "Équipements & maintenance",
    title: "Pourquoi la maintenance doit être pensée comme une capacité territoriale",
    excerpt: "Identifier les équipements ne suffit pas : compétences disponibles, pièces, délais d’intervention et organisation du service déterminent la continuité réelle.",
    territory: "Littoral sénégalais",
    publishedAt: "3 août 2026",
    readingTime: "6 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "comprendre-financement",
    category: "Comprendre",
    domain: "Financement & développement",
    title: "Financer un besoin maritime : commencer par documenter le problème",
    excerpt: "Avant de chercher un financement, il faut clarifier le besoin, les bénéficiaires, le territoire, la capacité existante et le résultat attendu.",
    territory: "Sénégal",
    publishedAt: "2 août 2026",
    readingTime: "6 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "guide-formation",
    category: "Guide",
    domain: "Compétences & formation",
    title: "Préparer une action de formation utile au terrain",
    excerpt: "Sujet, participants, territoire, contraintes de disponibilité et résultat recherché sont les données minimales pour concevoir une action pertinente.",
    territory: "Sénégal",
    publishedAt: "1 août 2026",
    readingTime: "5 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "terrain-kayar",
    category: "Terrain",
    domain: "Débarquement",
    title: "Kayar : comprendre le rôle du quai dans l’organisation locale des flux",
    excerpt: "Le quai concentre activités, besoins, services et acteurs. Il constitue une porte d’entrée naturelle pour lire et documenter un territoire halieutique.",
    territory: "Kayar",
    publishedAt: "31 juillet 2026",
    readingTime: "6 min",
    verification: "Démonstration éditoriale"
  },
  {
    id: "actualite-donnees-territoriales",
    category: "Actualité",
    domain: "Territoires & infrastructures",
    title: "Mbàmbulaan prépare un cadre commun pour enrichir progressivement les fiches territoriales",
    excerpt: "Sources, dates de mise à jour et niveau de vérification doivent être visibles pour distinguer donnée publique, enrichissement terrain et information restant à confirmer.",
    territory: "Sénégal",
    publishedAt: "30 juillet 2026",
    readingTime: "4 min",
    verification: "Démonstration éditoriale"
  }
];

export const publicAnnouncements: PublicAnnouncement[] = [
  {
    id: "formation-qualite-conservation",
    type: "Formation",
    title: "Bonnes pratiques de conservation et qualité après débarquement",
    description: "Exemple de formation destinée à renforcer les pratiques de manipulation, de froid et de préservation de la qualité.",
    territory: "Petite-Côte",
    deadline: "Période à confirmer",
    audience: "Acteurs de quai, mareyage et transformation",
    organizer: "Organisateur de démonstration",
    status: "En préparation",
    involvement: "Relais Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "programme-froid-territorial",
    type: "Programme",
    title: "Programme territorial autour de la chaîne du froid",
    description: "Exemple de programme combinant diagnostic, équipements, maintenance, organisation des usages et suivi des résultats.",
    territory: "Joal · Mbour",
    deadline: "Calendrier à définir",
    audience: "Collectivités, organisations, partenaires techniques et financiers",
    organizer: "Programme de démonstration",
    status: "En préparation",
    involvement: "Coordination Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "financement-equipements-collectifs",
    type: "Financement",
    title: "Appui potentiel à des équipements collectifs structurants",
    description: "Exemple d’opportunité à documenter avant toute candidature : bénéficiaires, usage, gestion, maintenance et impact attendu.",
    territory: "Sénégal",
    deadline: "Date à confirmer",
    audience: "Organisations professionnelles et structures locales",
    organizer: "Source de démonstration",
    status: "À venir",
    involvement: "Information",
    verification: "Démonstration"
  },
  {
    id: "rencontre-logistique",
    type: "Rencontre",
    title: "Rencontre sur les besoins de transport et de logistique halieutique",
    description: "Exemple de rencontre réunissant besoins territoriaux, transporteurs, acteurs du froid et organisations pour qualifier les conditions d’un service utile.",
    territory: "Dakar · Petite-Côte",
    deadline: "Date à confirmer",
    audience: "Transporteurs, mareyeurs, transformateurs et organisations",
    organizer: "Mbàmbulaan · démonstration",
    status: "En préparation",
    involvement: "Coordination Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "appel-relais-territoriaux",
    type: "Appel",
    title: "Identifier des relais capables d’enrichir la connaissance territoriale",
    description: "Exemple d’appel visant à documenter des informations locales, faire remonter des corrections et faciliter l’orientation des besoins.",
    territory: "Littoral sénégalais",
    deadline: "Ouvert en démonstration",
    audience: "Organisations, professionnels et acteurs territoriaux",
    organizer: "Mbàmbulaan · démonstration",
    status: "Ouvert",
    involvement: "Coordination Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "formation-maintenance",
    type: "Formation",
    title: "Maintenance de premier niveau des équipements de froid",
    description: "Exemple de module portant sur les contrôles de base, les signaux de panne et l’organisation d’une intervention qualifiée.",
    territory: "Mbour",
    deadline: "Période à confirmer",
    audience: "Gestionnaires d’équipements et techniciens",
    organizer: "Centre de formation de démonstration",
    status: "À venir",
    involvement: "Relais Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "programme-valorisation-locale",
    type: "Programme",
    title: "Valorisation locale des produits et amélioration des débouchés",
    description: "Exemple de programme reliant transformation, qualité, conditionnement, accès marché et accompagnement des acteurs.",
    territory: "Casamance",
    deadline: "Calendrier à définir",
    audience: "Unités de transformation, organisations et partenaires",
    organizer: "Programme de démonstration",
    status: "En préparation",
    involvement: "Relais Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "financement-formation-jeunes",
    type: "Financement",
    title: "Appui à des parcours de compétences dans les métiers maritimes",
    description: "Exemple d’opportunité pouvant concerner sécurité, maintenance, qualité, transformation, logistique ou entrepreneuriat maritime.",
    territory: "Sénégal",
    deadline: "Date à confirmer",
    audience: "Jeunes, structures de formation et organisations",
    organizer: "Source de démonstration",
    status: "À venir",
    involvement: "Information",
    verification: "Démonstration"
  },
  {
    id: "rencontre-territoires",
    type: "Rencontre",
    title: "Échange territorial sur les priorités de la filière",
    description: "Exemple de session permettant de comparer besoins, capacités, projets existants et sujets à approfondir sur un territoire donné.",
    territory: "Saint-Louis",
    deadline: "Date à confirmer",
    audience: "Organisations, collectivités, entreprises et programmes",
    organizer: "Mbàmbulaan · démonstration",
    status: "En préparation",
    involvement: "Coordination Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "appel-capacites-techniques",
    type: "Appel",
    title: "Recenser des capacités techniques mobilisables dans le froid et la maintenance",
    description: "Exemple d’appel à contribution permettant à Mbàmbulaan de qualifier des capacités sans créer d’annuaire public de prestataires.",
    territory: "Dakar · Thiès · Fatick",
    deadline: "Ouvert en démonstration",
    audience: "Entreprises et professionnels techniques",
    organizer: "Mbàmbulaan · démonstration",
    status: "Ouvert",
    involvement: "Coordination Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "programme-donnees-quais",
    type: "Programme",
    title: "Améliorer progressivement la qualité des informations sur les quais",
    description: "Exemple de programme combinant sources publiques, contributions locales, vérification et mise à jour des fiches territoriales.",
    territory: "Littoral sénégalais",
    deadline: "Calendrier à définir",
    audience: "Institutions, gestionnaires de sites et organisations",
    organizer: "Mbàmbulaan · démonstration",
    status: "En préparation",
    involvement: "Coordination Mbàmbulaan",
    verification: "Démonstration"
  },
  {
    id: "formation-securite",
    type: "Formation",
    title: "Sensibilisation aux pratiques de sécurité et de prévention en mer",
    description: "Exemple de formation à contextualiser avec les organisations compétentes et les réalités du territoire concerné.",
    territory: "Grande-Côte",
    deadline: "Période à confirmer",
    audience: "Professionnels de la pêche et organisations",
    organizer: "Organisateur de démonstration",
    status: "À venir",
    involvement: "Information",
    verification: "Démonstration"
  }
];
