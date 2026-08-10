export type PublicContentType = "Comprendre" | "Terrain" | "Analyse" | "Portrait" | "Guide" | "Actualité";

export type PublicContentDomain =
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

export type PublicNewsItem = {
  id: string;
  category: PublicContentType;
  domain: PublicContentDomain;
  title: string;
  excerpt: string;
  /** Corps de l'article : paragraphes successifs. */
  body: string[];
  /** CTA contextuel affiché en fin d'article (section 9 du MASTER_SPEC). */
  cta?: { label: string; href: string };
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
  /** Précisions complémentaires affichées sur la page détail. */
  details?: string[];
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
    body: [
      "La filière halieutique sénégalaise ne se résume pas à la capture du poisson : elle relie une succession d'étapes qui déterminent, chacune, la qualité, le prix et le devenir du produit. Comprendre cette chaîne permet d'identifier précisément où agir plutôt que de traiter des symptômes isolés.",
      "En mer, la ressource est prélevée selon des pratiques, des zones et une saisonnalité propres à chaque espèce. Au débarquement, le quai organise la première mise en marché : pesée, tri, premières transactions. Vient ensuite la conservation — glace, froid, séchage — qui conditionne la durée de vie du produit avant qu'il ne soit transformé, transporté puis vendu sur les marchés locaux, régionaux ou à l'export.",
      "Chaque maillon dépend des autres : un excellent débarquement sans chaîne du froid perd sa valeur ; un bon transport sans débouché organisé ne sert à rien. C'est cette interdépendance que Mbàmbulaan cherche à rendre lisible, territoire par territoire, pour que les besoins réels — équipement, organisation, compétence, financement — soient identifiés au bon endroit de la chaîne."
    ],
    cta: { label: "Trouver une solution sur ma chaîne de valeur", href: "/solutions" },
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
    body: [
      "Un besoin de froid mal qualifié conduit presque toujours à une solution inadaptée : trop de capacité, pas assez, mal située, ou incompatible avec l'organisation du site. Avant de chercher un équipement ou un prestataire, il vaut mieux réunir quelques informations simples.",
      "Le volume à conserver et sa variation dans le temps (pic de saison, moyenne, minimum) permettent de dimensionner correctement une solution. La durée de conservation nécessaire — quelques heures avant transport, ou plusieurs jours de stockage — oriente vers de la glace, une chambre froide ou un procédé de transformation.",
      "La localisation et l'accès à l'électricité ou à un carburant fiable conditionnent fortement les options techniques disponibles. Enfin, la fréquence d'usage (quotidienne, saisonnière, ponctuelle) et le nombre d'acteurs qui partageraient l'équipement changent complètement le modèle économique d'une solution de froid.",
      "Une fois ces éléments réunis, Mbàmbulaan peut qualifier la demande et l'orienter vers la bonne réponse — location, mutualisation, investissement ou intervention d'un acteur du réseau."
    ],
    cta: { label: "Trouver une solution de froid", href: "/solutions?intent=conservation" },
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
    body: [
      "Joal-Fadiouth est l'un des plus grands ports de pêche artisanale d'Afrique de l'Ouest. Lire ce territoire correctement suppose de dépasser la simple localisation géographique pour comprendre ce qui s'y joue réellement : débarquement massif, transformation artisanale dense, mareyage organisé et flux logistiques vers Dakar et les marchés régionaux.",
      "Cette densité d'activité crée des besoins spécifiques : chaîne du froid suffisante pour absorber les pics de débarquement, organisation du transport vers les marchés, formation continue des transformatrices, et infrastructures d'assainissement autour des sites de fumage et de séchage.",
      "C'est cette lecture croisée — activités, infrastructures documentées, contraintes et besoins exprimés — que l'Atlas Mbàmbulaan cherche à rendre disponible pour chaque territoire prioritaire, en s'appuyant sur des sources publiques puis en s'enrichissant progressivement avec un réseau local."
    ],
    cta: { label: "Voir la fiche territoire de Joal-Fadiouth", href: "/atlas/joal-fadiouth" },
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
    body: [
      "Les pertes post-capture — poisson perdu ou dévalorisé entre le débarquement et le marché — sont souvent attribuées au seul manque d'équipement. La réalité est plus large : une chambre froide sans maintenance fiable, un camion sans organisation de tournée ou un débouché mal anticipé produisent les mêmes pertes qu'une absence totale d'infrastructure.",
      "La coordination entre les acteurs de la chaîne — quai, transformateur, transporteur, acheteur — est souvent le facteur limitant réel. Un équipement isolé, sans les compétences, les pièces de rechange et l'organisation nécessaires à son usage continu, finit par sous-performer ou tomber en panne sans être réparé.",
      "C'est pourquoi une réponse utile combine presque toujours plusieurs dimensions : équipement adapté, compétence disponible, organisation claire du service, et accès à un débouché. Documenter cette combinaison, territoire par territoire, est un préalable à toute intervention efficace."
    ],
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
    body: [
      "Le mareyage est souvent le métier le moins visible de la filière halieutique et pourtant l'un des plus déterminants. Le mareyeur ou la mareyeuse achète le poisson au débarquement, organise son transport et le fait circuler vers les marchés locaux, régionaux ou vers les unités de transformation.",
      "Ce rôle suppose une connaissance fine des prix, des acheteurs, des capacités de transport disponibles et de l'état de conservation du produit à chaque étape. C'est aussi un métier d'intermédiation économique : le mareyage absorbe une grande partie du risque de fluctuation entre l'offre débarquée et la demande des marchés.",
      "Comprendre ce métier aide à mieux qualifier les besoins qui lui sont liés : accès au financement de trésorerie, fiabilité du transport, information sur les débouchés, et parfois accès à des capacités de conservation partagées."
    ],
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
    body: [
      "« J'ai besoin d'un transport » est rarement suffisant pour organiser une réponse utile. Le transport de produits halieutiques a des contraintes spécifiques qui doivent être précisées avant de chercher une solution.",
      "L'origine et la destination déterminent la distance et le type de véhicule pertinent. Le volume et sa régularité (livraison ponctuelle ou tournée récurrente) changent complètement le modèle économique. Le niveau de froid requis — ambiant, réfrigéré, congelé — conditionne le type de véhicule et son coût.",
      "Enfin, la date ou la fréquence souhaitée permet d'anticiper la disponibilité. Une fois ces éléments réunis, la demande devient mobilisable : Mbàmbulaan peut la qualifier et l'orienter vers un transporteur du réseau adapté à ce contexte précis."
    ],
    cta: { label: "Organiser un transport", href: "/solutions?intent=transport" },
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
    body: [
      "La transformation artisanale occupe une place centrale dans l'économie halieutique sénégalaise, en particulier pour les espèces pélagiques comme la sardinelle. Séchage, fumage, salage et conditionnement transforment un produit périssable en un produit stable, transportable sur de plus longues distances et accessible à de nouveaux marchés.",
      "Ce travail, largement porté par des femmes organisées en groupements, crée une valeur économique significative mais reste souvent limité par l'accès aux infrastructures (aires de séchage, fumoirs améliorés), à l'eau, à l'énergie et aux débouchés au-delà du marché local.",
      "Renforcer cette étape de la chaîne — sans se substituer aux pratiques existantes — passe d'abord par la documentation précise des besoins : quel volume, quel procédé, quelles contraintes d'infrastructure et quels débouchés visés."
    ],
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
    body: [
      "Un équipement de froid, un moteur de pirogue ou une fabrique de glace ne valent que par leur disponibilité réelle dans la durée. Or la maintenance est souvent le point faible des investissements dans la filière : une panne sans réparation rapide interrompt toute une chaîne d'activité en aval.",
      "Penser la maintenance comme une capacité territoriale signifie identifier, en amont d'un investissement, qui peut intervenir, avec quel délai, avec quelles pièces disponibles localement, et selon quel modèle de financement du service après-vente.",
      "C'est une dimension souvent négligée dans les projets d'équipement, alors qu'elle conditionne directement leur durée de vie utile et leur retour sur investissement réel pour les acteurs du territoire."
    ],
    cta: { label: "Trouver une solution de maintenance", href: "/solutions?intent=maintenance" },
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
    body: [
      "Un financement mal préparé échoue souvent avant même l'instruction du dossier : besoin insuffisamment documenté, bénéficiaires imprécis, absence de plan de gestion ou de maintenance après l'investissement. Documenter le problème est la première étape, avant de chercher une source de financement.",
      "Il s'agit de clarifier qui bénéficie réellement de l'investissement, sur quel territoire, avec quelle capacité existante à faire fonctionner et entretenir la solution, et quel résultat concret est attendu — réduction des pertes, augmentation de revenus, amélioration de la qualité.",
      "Cette qualification préalable augmente fortement les chances qu'un financement, quelle que soit sa source (institution, bailleur, programme, financement propre), soit correctement dimensionné et effectivement utile sur la durée."
    ],
    cta: { label: "Être accompagné sur un besoin de financement", href: "/solutions?intent=financement" },
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
    body: [
      "Une formation utile part rarement d'un contenu générique : elle répond à un besoin de compétence précis, identifié sur un territoire donné, pour des participants dont les contraintes de disponibilité (saison de pêche, horaires de quai) doivent être respectées.",
      "Définir le sujet exact (sécurité en mer, qualité et manipulation, gestion, maintenance de premier niveau...), le profil et le nombre de participants, le territoire concerné et le résultat concrètement recherché permet de concevoir une action réellement adaptée plutôt qu'un module standard peu suivi.",
      "C'est cette qualification qui permet ensuite à Mbàmbulaan de relier un besoin de formation à un centre ou un organisme du réseau capable d'y répondre dans de bonnes conditions."
    ],
    cta: { label: "Manifester un besoin de formation", href: "/solutions?intent=formation" },
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
    body: [
      "Kayar est l'un des plus grands sites de pêche artisanale du Sénégal, connu pour ses fosses sous-marines poissonneuses et l'importance de sa flotte de pirogues. Le quai y organise chaque jour le débarquement, la pesée, la première vente et le tri des captures avant leur orientation vers la transformation, le marché local ou le transport régional.",
      "Cette concentration d'activité en fait un point d'observation privilégié pour comprendre les besoins réels d'un territoire : capacité de conservation disponible au regard des volumes débarqués, fiabilité du transport vers Dakar et les marchés régionaux, et organisation des services autour du quai (glace, carburant, réparation).",
      "Documenter un quai comme Kayar, avec ses activités et ses infrastructures visibles, est une première étape avant tout enrichissement par un réseau local ou une vérification terrain plus poussée."
    ],
    cta: { label: "Voir la fiche territoire de Kayar", href: "/atlas/kayar" },
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
    body: [
      "L'Atlas Mbàmbulaan s'appuie aujourd'hui sur des sources publiques consolidées, clairement identifiées comme telles. L'objectif est d'enrichir progressivement chaque fiche territoriale avec des informations documentées puis vérifiées, sans jamais présenter une donnée non confirmée comme certaine.",
      "Ce cadre commun distingue trois niveaux : « Référencé » pour une information publique de base, « Documenté » lorsque plusieurs sources ou observations la confirment, et « Enrichi avec réseau local » lorsqu'un relais territorial a contribué à la préciser.",
      "Cette transparence sur le niveau de fiabilité est une condition de confiance : elle permet à chacun de savoir exactement ce que Mbàmbulaan sait, ne sait pas encore, ou cherche à vérifier sur un territoire donné."
    ],
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
    details: [
      "Cette formation de démonstration illustre le type d'action que Mbàmbulaan peut relayer ou aider à organiser : un module court, centré sur des gestes concrets (manipulation, hygiène, usage du froid) plutôt que sur une théorie générale.",
      "Le format cible les acteurs de quai, de mareyage et de transformation directement concernés par la qualité du produit entre le débarquement et la première vente."
    ],
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
    details: [
      "Ce programme de démonstration illustre une approche combinée : diagnostic préalable des besoins, choix d'équipements adaptés, organisation du service de maintenance, puis suivi des résultats dans la durée plutôt qu'une simple livraison d'équipement.",
      "Mbàmbulaan coordonnerait, dans ce scénario, la qualification des besoins territoriaux et la mise en relation avec les partenaires techniques et financiers concernés."
    ],
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

export function findContentById(id: string) {
  return publicNews.find((item) => item.id === id);
}

export function findAnnouncementById(id: string) {
  return publicAnnouncements.find((item) => item.id === id);
}
