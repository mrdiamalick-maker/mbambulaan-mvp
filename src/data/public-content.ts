export type PublicNewsItem = {
  id: string;
  category: "Filière" | "Territoires" | "Innovation" | "Durabilité";
  title: string;
  excerpt: string;
  territory: string;
  publishedAt: string;
  readingTime: string;
};

export type PublicAnnouncement = {
  id: string;
  type: "Appel à participation" | "Besoin qualifié" | "Agenda" | "Capacité disponible";
  title: string;
  description: string;
  territory: string;
  deadline: string;
  audience: string;
};

export const publicNews: PublicNewsItem[] = [
  {
    id: "actu-froid-petite-cote",
    category: "Territoires",
    title: "Chaîne du froid : comment préparer un itinéraire de délestage entre quais",
    excerpt: "Un scénario de coordination relie disponibilité de glace, capacité de transport, lots attendus et responsables avant la saturation.",
    territory: "Petite-Côte",
    publishedAt: "8 août 2026",
    readingTime: "5 min"
  },
  {
    id: "actu-retour-pirogue",
    category: "Innovation",
    title: "Du message de retour au débarquement documenté",
    excerpt: "Téléphone, SMS ou WhatsApp Business peuvent alimenter le même objet métier sans imposer une application à chaque acteur.",
    territory: "Littoral sénégalais",
    publishedAt: "6 août 2026",
    readingTime: "4 min"
  },
  {
    id: "actu-sardinelle-mbour",
    category: "Filière",
    title: "Surabondance ponctuelle : préserver la valeur de la sardinelle à Mbour",
    excerpt: "Le rapprochement entre lots disponibles, besoins de transformation et capacités froides doit rester explicable et validé par les acteurs.",
    territory: "Mbour",
    publishedAt: "4 août 2026",
    readingTime: "6 min"
  },
  {
    id: "actu-confiance-donnees",
    category: "Innovation",
    title: "La confiance comme fonctionnalité : source, fraîcheur et niveau de vérification",
    excerpt: "Une donnée utile à la décision indique toujours d’où elle vient, quand elle a été mise à jour et ce qui reste à confirmer.",
    territory: "National",
    publishedAt: "1 août 2026",
    readingTime: "7 min"
  },
  {
    id: "actu-tracabilite-lots",
    category: "Durabilité",
    title: "Traçabilité progressive : rendre les lacunes visibles sans bloquer le terrain",
    excerpt: "La complétude devient un parcours d’amélioration reliant pirogue, zone, espèce, lot, conservation et destination.",
    territory: "Hann · Joal · Kafountine",
    publishedAt: "29 juillet 2026",
    readingTime: "5 min"
  },
  {
    id: "actu-financement-infrastructure",
    category: "Territoires",
    title: "Qualifier un besoin d’infrastructure avant de chercher un financement",
    excerpt: "Situation d’origine, bénéficiaires, coût, responsables, cofinancement et indicateurs sont réunis dans un dossier commun.",
    territory: "Joal-Fadiouth",
    publishedAt: "25 juillet 2026",
    readingTime: "6 min"
  },
  {
    id: "actu-securite-retours-saint-louis",
    category: "Territoires",
    title: "Retours retardés : organiser une chaîne d’alerte territoriale à Saint-Louis",
    excerpt: "Un contact unique, des rôles explicites et un historique commun réduisent les messages contradictoires sans automatiser la décision.",
    territory: "Saint-Louis",
    publishedAt: "22 juillet 2026",
    readingTime: "5 min"
  },
  {
    id: "actu-pesee-djiffer",
    category: "Innovation",
    title: "De la balance au rapport : pourquoi la qualité de la pesée change toute la chaîne",
    excerpt: "Une pesée contextualisée fiabilise les lots, les capacités sollicitées, les indicateurs et la valeur économique estimée.",
    territory: "Djiffer",
    publishedAt: "19 juillet 2026",
    readingTime: "6 min"
  },
  {
    id: "actu-transformation-casamance",
    category: "Filière",
    title: "Valorisation locale : relier les unités de transformation aux flux de Casamance",
    excerpt: "Les besoins de production deviennent utiles lorsqu’ils sont rapprochés des espèces, qualités, volumes et délais réellement observés.",
    territory: "Kafountine · Cap Skirring",
    publishedAt: "16 juillet 2026",
    readingTime: "7 min"
  },
  {
    id: "actu-registre-pirogues",
    category: "Innovation",
    title: "Construire un registre progressif des pirogues sans bloquer le terrain",
    excerpt: "Une immatriculation peut être déclarée, rapprochée d’une pièce puis vérifiée : chaque étape conserve sa source et son niveau de confiance.",
    territory: "Littoral sénégalais",
    publishedAt: "12 juillet 2026",
    readingTime: "8 min"
  },
  {
    id: "actu-programme-multi-territoires",
    category: "Territoires",
    title: "Du besoin récurrent au programme multi-territoires",
    excerpt: "Plusieurs situations comparables peuvent former un dossier commun avec porteur, budget, partenaires, conditions et résultats attendus.",
    territory: "Grande-Côte · Petite-Côte",
    publishedAt: "9 juillet 2026",
    readingTime: "6 min"
  },
  {
    id: "actu-donnees-minimales",
    category: "Durabilité",
    title: "Les données minimales qui rendent un débarquement réutilisable",
    excerpt: "Pirogue, quai, heure, espèces, poids, qualité et source constituent un socle simple pour coordonner sans surcharger l’acteur terrain.",
    territory: "National",
    publishedAt: "5 juillet 2026",
    readingTime: "5 min"
  }
];

export const publicAnnouncements: PublicAnnouncement[] = [
  {
    id: "annonce-relais-quai",
    type: "Appel à participation",
    title: "Constituer un réseau pilote de relais de quai",
    description: "Identifier les personnes capables de qualifier les retours, capacités et incidents avec une procédure commune.",
    territory: "Saint-Louis · Dakar · Petite-Côte · Casamance",
    deadline: "Cadrage pilote",
    audience: "Organisations professionnelles et gestionnaires de sites"
  },
  {
    id: "annonce-maintenance-froid",
    type: "Besoin qualifié",
    title: "Préparer un dispositif de maintenance préventive du froid",
    description: "Exemple de dossier : inventaire des équipements, niveaux de service, pièces critiques et délais d’intervention.",
    territory: "Joal · Mbour · Kayar",
    deadline: "En instruction",
    audience: "Prestataires techniques et programmes territoriaux"
  },
  {
    id: "annonce-atelier-donnees",
    type: "Agenda",
    title: "Atelier de définition des données minimales de débarquement",
    description: "Session de travail simulée sur les champs indispensables, les sources acceptées et les droits de visibilité.",
    territory: "Dakar",
    deadline: "Août 2026 · démonstration",
    audience: "Institutions, quais et organisations"
  },
  {
    id: "annonce-transport-groupe",
    type: "Capacité disponible",
    title: "Tester un circuit de transport froid groupé",
    description: "Capacité indicative mobilisable sous réserve d’un volume minimal, d’un horaire confirmé et d’une validation humaine.",
    territory: "Mbour → Dakar",
    deadline: "Fenêtre de 48 h",
    audience: "Mareyeurs et unités de transformation"
  },
  {
    id: "annonce-pilote-territorial",
    type: "Appel à participation",
    title: "Cadrer un territoire pilote Mbàmbulaan",
    description: "Définir un problème prioritaire, les acteurs mandatés, les sources, les indicateurs et le modèle économique du pilote.",
    territory: "Territoire à sélectionner",
    deadline: "Candidatures exploratoires",
    audience: "Collectivités, programmes et organisations faîtières"
  },
  {
    id: "annonce-financement-froid",
    type: "Besoin qualifié",
    title: "Documenter un programme de résilience de la chaîne du froid",
    description: "Exemple de dossier consolidant 185 M FCFA de besoins, 80 M FCFA en instruction et deux indicateurs de résultat.",
    territory: "Petite-Côte",
    deadline: "Dossier de démonstration",
    audience: "Bailleurs, institutions financières et partenaires techniques"
  },
  {
    id: "annonce-registre-actifs",
    type: "Appel à participation",
    title: "Tester un protocole progressif d’identification des pirogues",
    description: "Rapprocher déclaration, immatriculation, propriétaire, capitaine et quai d’attache sans présenter une donnée non vérifiée comme officielle.",
    territory: "Dakar · Petite-Côte",
    deadline: "Phase de préparation",
    audience: "Organisations, gestionnaires de quai et services compétents"
  },
  {
    id: "annonce-valorisation-casamance",
    type: "Besoin qualifié",
    title: "Relier des capacités de transformation à des lots documentés",
    description: "Scénario de valorisation locale fondé sur les espèces, volumes, délais, pratiques et capacités réellement disponibles.",
    territory: "Casamance",
    deadline: "Fenêtre pilote",
    audience: "Unités de transformation, organisations et partenaires techniques"
  },
  {
    id: "annonce-securite-sorties",
    type: "Agenda",
    title: "Atelier territorial sur le suivi des départs et retours",
    description: "Définir le signal minimum, la chaîne d’alerte, les rôles et les limites de responsabilité de la plateforme.",
    territory: "Grande-Côte",
    deadline: "Session de démonstration",
    audience: "Capitaines, quais, organisations et coordination territoriale"
  },
  {
    id: "annonce-maintenance-sud",
    type: "Capacité disponible",
    title: "Préparer une tournée de maintenance itinérante",
    description: "Mutualiser diagnostic, pièces critiques, priorités et preuves d’intervention sur plusieurs infrastructures du Sud.",
    territory: "Kafountine · Cap Skirring · Elinkine",
    deadline: "Programmation mensuelle",
    audience: "Gestionnaires d’infrastructures et prestataires qualifiés"
  }
];

export type PublicArticleDetail = {
  author: string;
  lead: string;
  sections: Array<{ title: string; content: string }>;
  takeaways: string[];
};

export const publicArticleDetails: Record<string, PublicArticleDetail> = Object.fromEntries(
  publicNews.map((item) => [
    item.id,
    {
      author: item.category === "Territoires" ? "Observatoire des coordinations" : item.category === "Durabilité" ? "Cellule confiance & traçabilité" : "Équipe produit Mbàmbulaan",
      lead: `${item.excerpt} Ce décryptage illustre la manière dont Mbàmbulaan relie un fait, ses sources, les acteurs concernés et une prochaine décision vérifiable.`,
      sections: [
        {
          title: "Le problème de coordination",
          content: `Dans le scénario ${item.territory}, l’information existe mais circule entre plusieurs personnes, canaux et organisations. Sans objet commun, le délai augmente, les responsabilités deviennent floues et la donnée perd rapidement sa valeur.`
        },
        {
          title: "Ce que la plateforme relie",
          content: "Le territoire, le signal, les actifs concernés, les capacités disponibles, les échanges téléphoniques ou numériques, les engagements et le résultat utilisent la même chronologie. Toute synthèse conserve la source et le niveau de confiance."
        },
        {
          title: "La limite à ne pas franchir",
          content: "Mbàmbulaan ne transforme jamais une estimation en fait officiel et ne remplace ni l’autorité compétente ni la décision humaine. Le produit documente les conditions d’une action et rend son suivi plus simple."
        }
      ],
      takeaways: [
        "Une seule source de vérité quel que soit le canal",
        "Un responsable, une échéance et un résultat attendus",
        "Une donnée de démonstration clairement distinguée d’une donnée officielle"
      ]
    }
  ])
);

export const publicStories = [
  {
    id: "story-joal",
    territory: "Joal-Fadiouth",
    title: "Préserver les lots pendant une panne de glace",
    challenge: "Une machine à glace indisponible menace plusieurs débarquements attendus.",
    coordination: "Quai, prestataire, transport, Mbour et coordination territoriale partagent un plan de délestage et deux engagements.",
    result: "Capacité alternative réservée, intervention suivie et rapport de continuité préparé.",
    proof: "Cas démonstrateur · scénario rejouable"
  },
  {
    id: "story-kafountine",
    territory: "Kafountine",
    title: "Regrouper un transport sans perdre la traçabilité",
    challenge: "Plusieurs lots doivent rejoindre un débouché régional dans une fenêtre courte.",
    coordination: "Volumes, qualité, température, véhicule, participants et confirmations sont réunis dans un même espace.",
    result: "1,2 tonne orientée dans le scénario, avec bordereau et confirmations reliés au résultat.",
    proof: "Cas démonstrateur · résultat documenté"
  },
  {
    id: "story-saint-louis",
    territory: "Saint-Louis",
    title: "Qualifier un retour retardé sans multiplier les alertes",
    challenge: "Un retard de retour déclenche des messages parallèles et une responsabilité incertaine.",
    coordination: "Le poste de quai, le relais sécurité et la coordination utilisent un point de situation commun.",
    result: "Chaîne d’alerte lisible, prochaine vérification datée et historique conservé.",
    proof: "Cas démonstrateur · protocole à cadrer"
  }
] as const;

export const publicTestimonials = [
  {
    quote: "Je ne cherche pas un tableau de plus : je veux savoir ce qui est confirmé, qui agit et ce qui reste bloqué.",
    attribution: "Verbatim d’atelier simulé",
    role: "Coordination territoriale"
  },
  {
    quote: "Le rapport devient crédible quand je peux revenir du chiffre jusqu’au quai, à la pesée et à la source.",
    attribution: "Verbatim de recette simulé",
    role: "Lecture institutionnelle"
  },
  {
    quote: "Un besoin est utile au partenaire lorsqu’il arrive avec un porteur, un budget, des conditions et un résultat attendu.",
    attribution: "Verbatim de cadrage simulé",
    role: "Programme & financement"
  }
] as const;

export const partnerFamilies = [
  { title: "Institutions & territoires", text: "Mandats, référentiels, pilotage, politiques publiques et redevabilité." },
  { title: "Organisations professionnelles", text: "Membres, actifs, opérations, services collectifs et représentation." },
  { title: "Opérateurs techniques", text: "Froid, maintenance, transport, transformation et qualité de service." },
  { title: "Programmes & financeurs", text: "Besoins qualifiés, instruction, engagements, indicateurs et preuves d’impact." }
] as const;

export const publicFaq = [
  { question: "Mbàmbulaan est-il une marketplace ?", answer: "Non. La plateforme peut rapprocher un lot, un besoin et une capacité, mais elle organise d’abord la coordination, la confiance et le suivi. Toute transaction éventuelle reste opérée par des acteurs habilités." },
  { question: "Les données présentées sont-elles officielles ?", answer: "Non. La version publique actuelle utilise un jeu de démonstration déterministe. Chaque écran indique ses sources, son niveau de confiance et ses limites avant toute utilisation réelle." },
  { question: "Faut-il installer une application ?", answer: "Pas nécessairement. Les parcours peuvent être alimentés depuis le web, un poste de quai, le téléphone, le SMS ou WhatsApp Business, selon les droits et les partenaires activés." },
  { question: "Qui paie pour la plateforme ?", answer: "Les organisations, territoires, institutions et programmes paient pour des capacités concrètes : coordination, pilotage, rapports, gestion des membres, accès qualifié ou modules Premium." },
  { question: "L’intelligence artificielle prend-elle des décisions ?", answer: "Non. Elle peut résumer, rapprocher ou signaler une incohérence. Les raisons restent visibles et la décision appartient toujours à une personne mandatée." },
  { question: "Comment démarrer un pilote ?", answer: "Le cadrage commence par un problème prioritaire, les acteurs mandatés, les sources disponibles, la valeur attendue, le payeur et trois à cinq indicateurs vérifiables." }
] as const;
