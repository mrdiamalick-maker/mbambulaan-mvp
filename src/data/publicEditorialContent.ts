export type PublicStoryCategory = "Comprendre" | "Métiers & communautés" | "Initiatives" | "Infos pratiques";

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

export type PublicProject = {
  id: string;
  title: string;
  territory: string;
  theme: string;
  summary: string;
  sought: string;
  contribution: string;
  benefit: string;
  status: string;
};

export const publicStories: PublicStory[] = [
  {
    slug: "journee-quai-kayar",
    category: "Comprendre",
    title: "Une journée sur un quai de pêche : qui fait quoi, du départ à la vente ?",
    excerpt: "Pêcheurs, manutentionnaires, mareyeurs, transformatrices et services locaux participent à une même chaîne. Voici comment leurs rôles se complètent.",
    location: "Kayar · Thiès",
    publishedAt: "18 juillet 2026",
    readingTime: "5 min",
    accent: "navy",
    kicker: "Découvrir la filière",
    lead: "Un quai de pêche est à la fois un lieu de travail, d’échange, de vente et de vie collective. Comprendre ce qui s’y passe aide à mieux reconnaître les métiers, les contraintes et la valeur créée par chaque acteur.",
    sections: [
      {
        title: "Avant et pendant la sortie en mer",
        paragraphs: [
          "La préparation commence bien avant le départ : équipage, carburant, glace, matériel, sécurité et météo. Chaque décision influence la sortie et les conditions du retour.",
          "À terre, d’autres acteurs se préparent déjà à recevoir, transporter, conserver ou transformer les produits débarqués.",
        ],
      },
      {
        title: "Au retour, une chaîne humaine se met en mouvement",
        paragraphs: [
          "Le débarquement mobilise plusieurs métiers. Les produits sont triés, pesés, vendus, transportés ou orientés vers la transformation. La rapidité compte, mais la qualité de l’information et de la coordination aussi.",
          "Mbàmbulaan veut rendre ces réalités plus visibles, sans remplacer les liens humains qui font vivre les quais.",
        ],
      },
    ],
    keyFacts: [
      { label: "Point de départ", value: "Le quai" },
      { label: "Acteurs", value: "Toute la chaîne locale" },
      { label: "Objectif", value: "Mieux comprendre" },
    ],
  },
  {
    slug: "poisson-frais-bien-conserver",
    category: "Infos pratiques",
    title: "Poisson frais : pourquoi le froid protège à la fois la qualité et les revenus",
    excerpt: "Quelques repères simples pour comprendre ce qui se joue entre le débarquement, la conservation, la transformation et la vente.",
    location: "Littoral sénégalais",
    publishedAt: "16 juillet 2026",
    readingTime: "4 min",
    accent: "ocean",
    kicker: "Qualité et conservation",
    lead: "Le froid ne concerne pas uniquement les équipements. Il aide à préserver la qualité, limiter les pertes et donner davantage de temps aux acteurs pour vendre ou transformer dans de bonnes conditions.",
    sections: [
      {
        title: "Une course contre le temps",
        paragraphs: [
          "Après le débarquement, la chaleur accélère la dégradation du poisson. La glace, des contenants propres et une manipulation adaptée contribuent à préserver sa fraîcheur.",
          "Une meilleure conservation peut réduire les pertes et protéger la valeur du travail réalisé en mer et à terre.",
        ],
      },
      {
        title: "Un enjeu collectif",
        paragraphs: [
          "Pêcheurs, mareyeurs, transporteurs, transformatrices, vendeurs et consommateurs ont tous intérêt à une chaîne de qualité mieux organisée.",
          "Les initiatives utiles peuvent porter sur l’équipement, la formation, l’entretien, l’énergie ou l’organisation entre acteurs.",
        ],
      },
    ],
    keyFacts: [
      { label: "Enjeu", value: "Qualité" },
      { label: "Effet", value: "Moins de pertes" },
      { label: "Bénéfice", value: "Valeur préservée" },
    ],
  },
  {
    slug: "femmes-transformatrices-savoir-faire",
    category: "Métiers & communautés",
    title: "Femmes transformatrices : des savoir-faire essentiels à mieux connaître et soutenir",
    excerpt: "Transformation, conservation, vente et organisation collective prolongent la valeur du poisson et font vivre de nombreuses familles.",
    location: "Joal-Fadiouth",
    publishedAt: "14 juillet 2026",
    readingTime: "4 min",
    accent: "sand",
    kicker: "Portrait collectif",
    lead: "La filière ne s’arrête pas au retour des pirogues. Une grande partie de la valeur est créée ensuite par des activités de transformation, de conservation et de commercialisation portées notamment par les femmes.",
    sections: [
      {
        title: "Un rôle économique et social majeur",
        paragraphs: [
          "Les femmes transformatrices maîtrisent des techniques, organisent des activités collectives et alimentent des circuits de vente locaux ou plus éloignés.",
          "Leur travail contribue aux revenus des ménages, à l’alimentation et à la valorisation de produits qui ne seraient pas toujours vendus frais.",
        ],
      },
      {
        title: "Écouter avant de proposer",
        paragraphs: [
          "Les besoins varient selon les territoires : accès à l’eau, hygiène, séchage, fumage, stockage, financement, formation ou débouchés.",
          "Mbàmbulaan doit permettre de faire connaître les initiatives existantes et d’ouvrir des collaborations utiles, construites avec les premières concernées.",
        ],
      },
    ],
    keyFacts: [
      { label: "Activités", value: "Transformer · Conserver · Vendre" },
      { label: "Force", value: "Savoir-faire collectif" },
      { label: "Priorité", value: "Écouter les besoins" },
    ],
  },
  {
    slug: "securite-mer-reflexes",
    category: "Infos pratiques",
    title: "Sécurité en mer : les réflexes essentiels à partager avant chaque départ",
    excerpt: "Préparation du matériel, information d’un proche, météo et moyens de communication : une fiche simple à relayer autour de soi.",
    location: "Saint-Louis",
    publishedAt: "11 juillet 2026",
    readingTime: "3 min",
    accent: "amber",
    kicker: "Prévention",
    lead: "La sécurité repose sur des équipements, mais aussi sur des habitudes simples et partagées. Préparer, vérifier et informer peut faciliter la prévention comme la réaction en cas de difficulté.",
    sections: [
      {
        title: "Avant de partir",
        paragraphs: [
          "Vérifier la météo, le carburant, les équipements de sécurité et les moyens de communication fait partie de la préparation de la sortie.",
          "Informer une personne à terre de l’équipage, de la zone prévue et de l’heure estimée du retour donne un repère utile.",
        ],
      },
      {
        title: "Une information à faire circuler",
        paragraphs: [
          "Les messages de prévention sont plus efficaces lorsqu’ils sont adaptés aux pratiques locales, répétés et portés par des personnes de confiance.",
        ],
      },
    ],
    keyFacts: [
      { label: "Format", value: "Fiche à partager" },
      { label: "Public", value: "Pêcheurs et proches" },
      { label: "Priorité", value: "Prévention" },
    ],
  },
  {
    slug: "jeunes-metiers-mer",
    category: "Initiatives",
    title: "Les métiers de la mer ne se limitent pas à la pêche : des pistes pour les jeunes",
    excerpt: "Maintenance, froid, transformation, transport, qualité, numérique : la filière peut ouvrir plusieurs chemins professionnels.",
    location: "Fass Boye · Thiès",
    publishedAt: "8 juillet 2026",
    readingTime: "5 min",
    accent: "green",
    kicker: "Jeunesse et orientation",
    lead: "La mer et ses activités créent des besoins bien au-delà de la capture. Mieux faire connaître ces métiers peut aider les jeunes à se projeter, se former et participer au développement de leur territoire.",
    sections: [
      {
        title: "Une diversité de compétences",
        paragraphs: [
          "Mécanique, réparation, fabrication, conservation, transformation, commerce, logistique, sécurité, environnement et outils numériques sont autant de domaines liés à la filière.",
          "Les parcours gagnent à combiner découverte des métiers, témoignages, formation pratique et accompagnement vers une première expérience.",
        ],
      },
    ],
    keyFacts: [
      { label: "Public", value: "Jeunes et familles" },
      { label: "Approche", value: "Découvrir · Se former" },
      { label: "Finalité", value: "Créer des perspectives" },
    ],
  },
  {
    slug: "comprendre-sardinelle",
    category: "Comprendre",
    title: "La sardinelle dans nos assiettes et nos économies locales",
    excerpt: "Une introduction accessible à une espèce importante pour l’alimentation, la transformation et de nombreuses activités du littoral.",
    location: "Littoral sénégalais",
    publishedAt: "3 juillet 2026",
    readingTime: "4 min",
    accent: "ocean",
    kicker: "Comprendre une espèce",
    lead: "La sardinelle occupe une place particulière dans l’alimentation et l’économie de nombreux territoires. Derrière ce poisson se trouvent des pêcheurs, des mareyeurs, des transformatrices, des vendeurs et des consommateurs.",
    sections: [
      {
        title: "Une espèce, plusieurs usages",
        paragraphs: [
          "Vendue fraîche, fumée, séchée ou transformée, la sardinelle circule dans de nombreux marchés et nourrit une diversité d’activités.",
          "Comprendre cette chaîne aide à mieux percevoir les effets d’une variation des captures, des prix, de la conservation ou du transport.",
        ],
      },
    ],
    keyFacts: [
      { label: "Type", value: "Ressource pédagogique" },
      { label: "Sujets", value: "Alimentation · Économie" },
      { label: "Niveau", value: "Tout public" },
    ],
  },
];

export const publicPrograms: PublicProject[] = [
  {
    id: "project-cold",
    title: "Améliorer la conservation du poisson après le débarquement",
    territory: "Joal–Mbour",
    theme: "Qualité et réduction des pertes",
    summary: "Une initiative collective pour mieux conserver les produits, renforcer les bonnes pratiques et réduire les pertes après débarquement.",
    sought: "Équipements adaptés, expertise technique, formation ou appui financier",
    contribution: "Apporter une solution, une compétence, un partenariat ou signaler une initiative existante",
    benefit: "Mieux valoriser les produits, protéger les revenus et améliorer la qualité proposée aux consommateurs",
    status: "Contributions et initiatives recherchées",
  },
  {
    id: "project-safety",
    title: "Faire circuler les bons réflexes de sécurité en mer",
    territory: "Saint-Louis et autres territoires volontaires",
    theme: "Prévention et sensibilisation",
    summary: "Créer et relayer des formats simples, compréhensibles et adaptés aux pratiques locales pour renforcer la prévention.",
    sought: "Relais locaux, contenus pédagogiques, témoignages, équipements ou soutien à des actions terrain",
    contribution: "Partager un besoin, proposer un atelier, relayer un message ou soutenir une action locale",
    benefit: "Accéder à des ressources utiles et contribuer à une culture commune de prévention",
    status: "Ouvert aux partenaires et relais",
  },
  {
    id: "project-women",
    title: "Soutenir les initiatives des femmes transformatrices",
    territory: "Joal-Fadiouth et territoires partenaires",
    theme: "Transformation et valeur locale",
    summary: "Mettre en lumière les solutions déjà portées par les groupements et faciliter des collaborations alignées sur leurs priorités.",
    sought: "Témoignages, solutions d’hygiène et de conservation, formation, débouchés ou financement",
    contribution: "Faire connaître une initiative, proposer un accompagnement ou rejoindre un partenariat",
    benefit: "Gagner en visibilité, accéder à des ressources et renforcer une activité économique locale",
    status: "Initiatives locales à recenser",
  },
];

export const publicAgenda = [
  { date: "24 JUIL.", title: "Échange ouvert sur la sécurité en mer", location: "Saint-Louis", format: "Rencontre terrain" },
  { date: "30 JUIL.", title: "Comment mieux conserver le poisson ?", location: "Mbour", format: "Discussion filière" },
  { date: "06 AOÛT", title: "Découvrir les métiers liés à la mer", location: "Fass Boye", format: "Session d’information" },
];

export function getPublicStory(slug: string) {
  return publicStories.find((story) => story.slug === slug);
}
