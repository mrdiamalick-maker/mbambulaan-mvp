export type PublicStoryCategory = "Territoires" | "Communautés" | "Programmes" | "Ressources";

export type PublicStory = {
  slug: string;
  category: PublicStoryCategory;
  title: string;
  excerpt: string;
  location: string;
  publishedAt: string;
  readingTime: string;
  accent: "navy" | "ocean" | "sand" | "green" | "amber";
  kicker: string;
  lead: string;
  sections: Array<{ title: string; paragraphs: string[] }>;
  keyFacts: Array<{ label: string; value: string }>;
};

export const publicStories: PublicStory[] = [
  {
    slug: "kayar-sorties-retours-mer",
    category: "Territoires",
    title: "À Kayar, mieux relier les sorties, les retours et les informations du quai",
    excerpt: "Une lecture commune du cycle d’activité peut faciliter les vérifications et éviter que les informations restent dispersées entre appels, messages et registres.",
    location: "Kayar · Thiès",
    publishedAt: "18 juillet 2026",
    readingTime: "5 min",
    accent: "navy",
    kicker: "Coordination territoriale",
    lead: "Le quai concentre une grande partie de l’information utile : activité du jour, pirogues rattachées, débarquements, situations à vérifier et interlocuteurs locaux. L’enjeu n’est pas d’ajouter un canal, mais de relier ceux qui existent déjà.",
    sections: [
      {
        title: "Le quai comme point de repère",
        paragraphs: [
          "À Kayar, les informations opérationnelles circulent entre acteurs de la pêche, relais locaux et services techniques. Lorsqu’elles ne partagent pas le même contexte, une simple demande de vérification peut nécessiter plusieurs relances.",
          "Une fiche territoriale commune permet de repartir du quai, puis d’ouvrir les informations utiles : unité concernée, activité déclarée, pièce reçue et personne chargée de la prochaine étape.",
        ],
      },
      {
        title: "Conserver la trace sans alourdir le terrain",
        paragraphs: [
          "Le téléphone et WhatsApp restent des outils naturels. Mbàmbulaan ne cherche pas à les remplacer : la plateforme rattache leur contenu utile à un dossier, à une source et à un résultat attendu.",
          "Cette continuité permet de distinguer une information déclarée d’un constat vérifié, tout en laissant la validation finale à l’agent habilité.",
        ],
      },
    ],
    keyFacts: [
      { label: "Point de départ", value: "Le quai" },
      { label: "Canaux", value: "Téléphone · WhatsApp" },
      { label: "Sortie attendue", value: "Constat documenté" },
    ],
  },
  {
    slug: "joal-mbour-chaine-froid",
    category: "Programmes",
    title: "Joal–Mbour : structurer une réponse commune aux besoins de chaîne de froid",
    excerpt: "Du besoin remonté au programme finançable : bénéficiaires, impact, budget et partenaires sont réunis dans une même lecture.",
    location: "Joal–Mbour · Petite-Côte",
    publishedAt: "16 juillet 2026",
    readingTime: "6 min",
    accent: "ocean",
    kicker: "Programme à impact",
    lead: "La conservation ne concerne pas uniquement un équipement. Elle touche la qualité des produits, les pertes après débarquement, le revenu des acteurs et la capacité des territoires à valoriser la pêche locale.",
    sections: [
      {
        title: "Passer d’un besoin isolé à un programme",
        paragraphs: [
          "Plusieurs remontées proches peuvent révéler un enjeu commun. Leur regroupement permet de préciser les territoires concernés, les acteurs bénéficiaires et les résultats attendus avant de parler de financement.",
          "Le programme Joal–Mbour sert ici de scénario de référence : les besoins de conservation sont qualifiés, les pièces disponibles sont recensées et le reste à financer devient lisible.",
        ],
      },
      {
        title: "Donner au partenaire une lecture exploitable",
        paragraphs: [
          "Un partenaire a besoin de comprendre le problème, l’impact attendu et les conditions de mise en œuvre. Une fiche programme relie ces éléments aux preuves et aux responsables du suivi.",
          "La transmission reste une décision humaine. La plateforme prépare le dossier et conserve la trace des échanges sans prétendre envoyer ou engager automatiquement une institution.",
        ],
      },
    ],
    keyFacts: [
      { label: "Bénéficiaires estimés", value: "680" },
      { label: "Budget indicatif", value: "1,48 Md FCFA" },
      { label: "À mobiliser", value: "960 M FCFA" },
    ],
  },
  {
    slug: "femmes-transformatrices-valeur-locale",
    category: "Communautés",
    title: "Femmes transformatrices : rendre visible une valeur créée après le débarquement",
    excerpt: "Transformation, conservation, qualité et commercialisation locale prolongent la valeur du poisson et structurent des revenus essentiels.",
    location: "Joal-Fadiouth",
    publishedAt: "14 juillet 2026",
    readingTime: "4 min",
    accent: "sand",
    kicker: "Métiers et communautés",
    lead: "La filière ne s’arrête pas au retour des pirogues. Une grande partie de la valeur se construit ensuite, dans des activités de transformation, de conservation et de commercialisation portées notamment par les femmes.",
    sections: [
      {
        title: "Documenter les besoins réels",
        paragraphs: [
          "Équipements, hygiène, accès au froid, organisation collective et formation sont souvent liés. Les traiter séparément réduit la compréhension de leur impact économique et social.",
          "Une remontée structurée permet de relier chaque besoin à un groupement, à un territoire et à un résultat concret plutôt qu’à une simple liste de demandes.",
        ],
      },
      {
        title: "Valoriser les initiatives existantes",
        paragraphs: [
          "Les communautés portent déjà des solutions. Mbàmbulaan doit aussi rendre ces initiatives visibles afin que les services publics et les partenaires sachent où un accompagnement peut accélérer un effort en cours.",
        ],
      },
    ],
    keyFacts: [
      { label: "Enjeu", value: "Valeur locale" },
      { label: "Leviers", value: "Qualité · Froid · Formation" },
      { label: "Lecture", value: "Besoin → programme" },
    ],
  },
  {
    slug: "saint-louis-securite-mer",
    category: "Ressources",
    title: "Sécurité en mer : cinq informations à conserver lors d’une vérification",
    excerpt: "Un guide court pour documenter une situation sans confondre déclaration, vérification et décision institutionnelle.",
    location: "Saint-Louis",
    publishedAt: "11 juillet 2026",
    readingTime: "3 min",
    accent: "amber",
    kicker: "Fiche pratique",
    lead: "Une situation urgente exige de la rapidité, mais aussi un minimum de contexte partagé. Cinq informations simples facilitent la coordination tout en évitant une conclusion prématurée.",
    sections: [
      {
        title: "Les cinq repères",
        paragraphs: [
          "Identifier l’unité concernée, l’heure de la dernière information, le quai de rattachement, la personne à recontacter et la prochaine vérification attendue constitue une base commune.",
          "Le niveau de confiance doit rester visible : une information reçue n’est pas encore un fait confirmé. La validation humaine marque le passage vers une donnée vérifiée.",
        ],
      },
    ],
    keyFacts: [
      { label: "Format", value: "Fiche pratique" },
      { label: "Public", value: "Relais et agents" },
      { label: "Principe", value: "Validation humaine" },
    ],
  },
  {
    slug: "fass-boye-metiers-bleus",
    category: "Programmes",
    title: "Fass Boye : ouvrir des perspectives autour des métiers bleus",
    excerpt: "Sensibilisation, formation et alternatives économiques peuvent être suivies comme un programme territorial cohérent.",
    location: "Fass Boye · Thiès",
    publishedAt: "8 juillet 2026",
    readingTime: "5 min",
    accent: "green",
    kicker: "Jeunesse et formation",
    lead: "Prévenir les départs irréguliers suppose aussi de rendre visibles des trajectoires économiques crédibles. Les métiers de la mer offrent plusieurs points d’entrée au-delà de la seule activité de pêche.",
    sections: [
      {
        title: "Relier sensibilisation et opportunités",
        paragraphs: [
          "Une campagne isolée produit peu de visibilité sur la suite. Un programme territorial peut associer information, orientation, formation et accompagnement vers des activités locales.",
          "Le suivi porte alors sur les publics atteints, les sessions réalisées, les partenaires mobilisés et les premières suites concrètes.",
        ],
      },
    ],
    keyFacts: [
      { label: "Public", value: "Jeunes et familles" },
      { label: "Actions", value: "Sensibilisation · Formation" },
      { label: "Résultat", value: "Parcours orientés" },
    ],
  },
  {
    slug: "comprendre-sardinelle-filiere",
    category: "Ressources",
    title: "Comprendre la place de la sardinelle dans la filière artisanale",
    excerpt: "Une ressource introductive sur les débarquements, les usages locaux et les enjeux de disponibilité de l’information.",
    location: "Littoral sénégalais",
    publishedAt: "3 juillet 2026",
    readingTime: "4 min",
    accent: "ocean",
    kicker: "Comprendre une espèce",
    lead: "Suivre une espèce ne consiste pas seulement à additionner des volumes. Il faut relier les débarquements, les territoires, les usages et les acteurs de la chaîne de valeur.",
    sections: [
      {
        title: "Une lecture territoriale et économique",
        paragraphs: [
          "Les informations de débarquement apportent un premier repère. Elles prennent davantage de sens lorsqu’elles sont comparées aux besoins de conservation, de transformation et de commercialisation du territoire.",
          "Cette lecture aide à préparer les questions à approfondir avec les services techniques et les organisations professionnelles.",
        ],
      },
    ],
    keyFacts: [
      { label: "Type", value: "Ressource pédagogique" },
      { label: "Lecture", value: "Espèce · Territoire · Usage" },
      { label: "Niveau", value: "Introduction" },
    ],
  },
];

export const publicPrograms = [
  {
    id: "program-cold",
    title: "Chaîne de froid communautaire",
    territory: "Joal–Mbour",
    theme: "Conservation et qualité",
    beneficiaries: "680 bénéficiaires estimés",
    progress: 68,
    status: "Dossier en structuration",
    nextMilestone: "Consolider les pièces techniques",
  },
  {
    id: "program-safety",
    title: "Sécurité en mer et réflexes de déclaration",
    territory: "Saint-Louis",
    theme: "Prévention",
    beneficiaries: "180 capitaines et jeunes pêcheurs",
    progress: 44,
    status: "Partenaires à mobiliser",
    nextMilestone: "Valider le calendrier terrain",
  },
  {
    id: "program-women",
    title: "Qualité et transformation locale",
    territory: "Joal-Fadiouth",
    theme: "Femmes transformatrices",
    beneficiaries: "12 groupements concernés",
    progress: 57,
    status: "Programme proposé",
    nextMilestone: "Qualifier les équipements prioritaires",
  },
];

export const publicAgenda = [
  { date: "24 JUIL.", title: "Atelier sécurité en mer", location: "Saint-Louis", format: "Atelier terrain" },
  { date: "30 JUIL.", title: "Échange sur la chaîne de froid", location: "Mbour", format: "Rencontre filière" },
  { date: "06 AOÛT", title: "Métiers bleus et jeunesse", location: "Fass Boye", format: "Session d’information" },
];

export function getPublicStory(slug: string) {
  return publicStories.find((story) => story.slug === slug);
}
