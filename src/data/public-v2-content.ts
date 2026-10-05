// Contenu éditorial réel du Public V2 — mandat "Relais exceptionnel Codex
// — Public V2 ISO design", source unique : Mbambulaan_Public_V2.html
// (Claude Design). Porté verbatim depuis le bundle du prototype (textes,
// territoires, opportunités) : c'est le contenu éditorial réel de ce
// nouveau cut du site public, pas une fixture à remplacer — distinct des
// fichiers src/data/public-content.ts / public-atlas.ts / public-domains.ts
// (Public V1), volontairement non touchés pour ne rien casser chez leurs
// autres consommateurs (opportunités legacy, Atlas Pro, /etat).
//
// Les photos référencées ("quai","pirogues","marche","fumage","relais")
// sont les 5 photos réelles du bundle V2, copiées dans
// public/images/public-v2/.

export type ContentBlock =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "steps"; items: { n: string; d: string }[] }
  | { t: "figure"; img: PhotoKey; caption: string }
  | { t: "quote"; text: string; who: string }
  | { t: "place"; terr: string; text: string }
  | { t: "doc"; title: string; meta: string };

export type PhotoKey = "quai" | "pir" | "mar" | "fum" | "rel";

export const PHOTOS: Record<PhotoKey, string> = {
  quai: "/images/public-v2/quai.jpg",
  pir: "/images/public-v2/pirogues.jpg",
  mar: "/images/public-v2/marche.jpg",
  fum: "/images/public-v2/fumage.jpg",
  rel: "/images/public-v2/relais.jpg"
};

export type ContentType = "Article" | "Dossier" | "Vidéo" | "Actualité";
export type ContentTheme =
  | "peche" | "ressources" | "metiers" | "chaine" | "transformation"
  | "commerce" | "infrastructures" | "environnement" | "territoires";

export const THEMES: [ContentTheme, string][] = [
  ["peche", "Pêche artisanale"],
  ["ressources", "Espèces & ressources"],
  ["metiers", "Métiers"],
  ["chaine", "Chaîne de valeur"],
  ["transformation", "Conservation & transformation"],
  ["commerce", "Commercialisation"],
  ["infrastructures", "Infrastructures"],
  ["environnement", "Environnement"],
  ["territoires", "Territoires"]
];

export const TYPES: [ContentType | "all", string][] = [
  ["all", "Tous"],
  ["Article", "Articles"],
  ["Dossier", "Dossiers"],
  ["Vidéo", "Vidéos"],
  ["Actualité", "Actualités"]
];

export interface ContentCard {
  slug: string;
  type: ContentType;
  theme: ContentTheme;
  img: PhotoKey;
  date: string;
  read?: string;
  dur?: string;
  terr?: string;
  title: string;
  dek: string;
  caption?: string;
  blocks: ContentBlock[];
}

export const CONTENT: ContentCard[] = [
  {
    slug: "chaine-de-valeur", type: "Dossier", theme: "chaine", img: "quai", date: "18 sept. 2026", read: "8 min", terr: "joal-fadiouth",
    title: "De la pirogue au marché : comprendre la chaîne de valeur",
    dek: "Six étapes relient la mer à l’assiette. À chacune, de la valeur peut se créer — ou se perdre.",
    caption: "Débarquement et tri sur un quai de la Petite-Côte.",
    blocks: [
      { t: "p", text: "Chaque matin, sur les plages du littoral, des pirogues reviennent chargées. Ce qui se passe ensuite, en quelques heures, détermine la valeur du poisson, le revenu des familles et la qualité de ce qui arrive dans l’assiette." },
      { t: "h", text: "Six étapes, une même chaîne" },
      { t: "steps", items: [
        { n: "Mer", d: "La capture, selon la saison et la ressource disponible." },
        { n: "Débarquement", d: "Pesée, tri et première vente sur la plage ou au quai." },
        { n: "Conservation", d: "Glace et froid : la durée de vie du produit se joue ici." },
        { n: "Transformation", d: "Fumage, séchage, salage : une valeur créée localement." },
        { n: "Transport", d: "Acheminement vers les villes, l’intérieur du pays et la sous-région." },
        { n: "Marchés", d: "Vente au détail, en gros ou à l’export." }
      ] },
      { t: "p", text: "Ces étapes dépendent les unes des autres. Un bon débarquement perd son sens si la glace manque ; un atelier de transformation bien équipé reste fragile sans débouché." },
      { t: "figure", img: "mar", caption: "Sur la plage, les premières transactions commencent dès l’arrivée des pirogues." },
      { t: "quote", text: "Quand la glace manque, ce n’est pas seulement le poisson qui perd sa valeur : c’est toute la journée de travail.", who: "Mareyeuse, Petite-Côte" },
      { t: "h", text: "Où la valeur se perd" },
      { t: "p", text: "Les pertes après capture sont souvent invisibles : un poisson vendu moins cher parce qu’il a attendu, un lot transformé faute d’acheteur frais, un trajet trop long sans froid. Les comprendre, territoire par territoire, est la première étape pour les réduire." },
      { t: "place", terr: "joal-fadiouth", text: "Débarquement, transformation et expédition se côtoient sur un même territoire." },
      { t: "doc", title: "Fiche de synthèse — La chaîne de valeur halieutique", meta: "PDF · 6 pages" }
    ]
  },
  {
    slug: "joal-transformation", type: "Vidéo", theme: "transformation", img: "fum", date: "9 sept. 2026", dur: "6 min", terr: "joal-fadiouth",
    title: "Joal : une journée sur le site de transformation",
    dek: "Fumage, séchage, salage : les transformatrices racontent leur métier.",
    blocks: [
      { t: "p", text: "À Joal-Fadiouth, une grande partie du poisson débarqué est transformée sur place. Ce film suit une journée de travail, de l’arrivée du poisson frais au conditionnement du produit fumé." },
      { t: "place", terr: "joal-fadiouth", text: "Haut lieu de la transformation artisanale sur la Petite-Côte." }
    ]
  },
  {
    slug: "atlas-public", type: "Actualité", theme: "territoires", img: "rel", date: "1 oct. 2026", read: "2 min",
    title: "Mbàmbulaan ouvre son Atlas public des territoires maritimes",
    dek: "Sept premiers territoires du littoral sont désormais accessibles à tous.",
    caption: "Échange sur une plage de débarquement.",
    blocks: [
      { t: "p", text: "L’Atlas présente, pour chaque territoire, ce qui le caractérise : activités, espèces, sites et contenus liés. Il sera enrichi progressivement, notamment grâce aux informations partagées par les visiteurs." },
      { t: "p", text: "Vous connaissez un territoire qui n’y figure pas encore, ou souhaitez corriger une information ? Utilisez le formulaire « Partager une information »." }
    ]
  },
  {
    slug: "la-glace", type: "Article", theme: "transformation", img: "mar", date: "28 août 2026", read: "5 min", terr: "mbour",
    title: "La glace, ressource invisible du débarquement",
    dek: "Sans froid, un poisson de qualité peut perdre sa valeur en quelques heures.",
    caption: "Caisses et glace au débarquement.",
    blocks: [
      { t: "p", text: "Sous le soleil, la qualité d’un poisson frais se dégrade vite. La glace, disponible ou non au bon moment et au bon prix, décide souvent de la suite : vente en frais, transformation, ou perte." },
      { t: "h", text: "Une question d’organisation" },
      { t: "p", text: "Au-delà de l’équipement, c’est l’organisation qui compte : qui produit la glace, où, à quel prix, et comment elle arrive jusqu’aux pirogues et aux mareyeurs." },
      { t: "place", terr: "mbour", text: "L’un des premiers centres de débarquement du pays." }
    ]
  },
  {
    slug: "kayar-fosse", type: "Article", theme: "territoires", img: "pir", date: "20 août 2026", read: "6 min", terr: "kayar",
    title: "Kayar, un village tourné vers la fosse",
    dek: "Un canyon sous-marin, des pêcheurs venus de tout le littoral, une saison qui rythme la vie.",
    caption: "Pirogues au retour de mer.",
    blocks: [
      { t: "p", text: "Au large de Kayar, une fosse sous-marine rapproche les eaux profondes de la côte. Cette géographie particulière fait du village un lieu de pêche réputé, qui accueille chaque saison des pêcheurs venus d’autres territoires." },
      { t: "place", terr: "kayar", text: "Grande Côte, région de Thiès." }
    ]
  },
  {
    slug: "metiers", type: "Dossier", theme: "metiers", img: "rel", date: "12 août 2026", read: "10 min",
    title: "Pêcheur, mareyeuse, transformatrice : les métiers de la filière",
    dek: "Derrière chaque poisson vendu, une chaîne de savoir-faire souvent méconnus.",
    caption: "Professionnels sur une plage de débarquement.",
    blocks: [
      { t: "p", text: "La pêche artisanale ne se résume pas à la pêche. Elle fait vivre des mareyeurs et mareyeuses, des transformatrices, des porteurs, des charpentiers de pirogue, des mécaniciens, des commerçants." },
      { t: "quote", text: "On apprend le métier sur la plage, en regardant les anciens.", who: "Pêcheur, Grande Côte" },
      { t: "p", text: "Ce dossier présente ces métiers un par un : ce qu’ils font, ce dont ils ont besoin, comment ils dépendent les uns des autres." }
    ]
  },
  {
    slug: "mangrove-saloum", type: "Vidéo", theme: "environnement", img: "pir", date: "2 août 2026", dur: "4 min", terr: "djiffer",
    title: "Saloum : la mangrove, nurserie du littoral",
    dek: "Pourquoi les bolongs du delta comptent pour la pêche de tout le pays.",
    blocks: [
      { t: "p", text: "Dans le delta du Saloum, la mangrove abrite de nombreux juvéniles de poissons et de crustacés. La préserver, c’est aussi préserver la pêche de demain." },
      { t: "place", terr: "djiffer", text: "À la pointe de la presqu’île de Sangomar." }
    ]
  },
  {
    slug: "quai-de-peche", type: "Article", theme: "infrastructures", img: "quai", date: "24 juil. 2026", read: "4 min", terr: "mbour",
    title: "À quoi sert un quai de pêche ?",
    dek: "Débarquer, peser, trier, vendre, conserver : un lieu au cœur de la filière.",
    caption: "Quai de débarquement.",
    blocks: [
      { t: "p", text: "Un quai de pêche n’est pas seulement un lieu où l’on décharge les pirogues. C’est là que le poisson est trié, pesé, vendu une première fois, glacé ou orienté vers la transformation." },
      { t: "place", terr: "mbour", text: "Un exemple de grand centre de débarquement." }
    ]
  },
  {
    slug: "apres-la-plage", type: "Article", theme: "commerce", img: "mar", date: "15 juil. 2026", read: "5 min", terr: "dakar",
    title: "Où va le poisson après la plage ?",
    dek: "Marchés urbains, intérieur du pays, sous-région, export : les chemins du produit.",
    caption: "Premières transactions sur la plage.",
    blocks: [
      { t: "p", text: "Une fois débarqué, le poisson emprunte des chemins très différents selon l’espèce, la saison et les acheteurs présents. Comprendre ces circuits aide à voir où se crée le revenu." },
      { t: "place", terr: "dakar", text: "Plages et marchés de la capitale." }
    ]
  },
  {
    slug: "sardinelles", type: "Article", theme: "ressources", img: "pir", date: "6 juil. 2026", read: "6 min",
    title: "Sardinelles : comprendre une ressource partagée",
    dek: "Le « yaboy », poisson du quotidien, au cœur de l’alimentation et de nombreux enjeux.",
    caption: "Retour de pêche.",
    blocks: [
      { t: "p", text: "Les sardinelles sont parmi les poissons les plus pêchés et consommés au Sénégal. Elles se déplacent le long des côtes ouest-africaines : leur gestion concerne plusieurs pays." }
    ]
  },
  {
    slug: "hivernage", type: "Actualité", theme: "peche", img: "mar", date: "30 juin 2026", read: "2 min",
    title: "Hivernage : ce qui change sur les plages de débarquement",
    dek: "Météo, sorties en mer, prix : les effets de la saison des pluies.",
    caption: "Plage de débarquement.",
    blocks: [
      { t: "p", text: "Avec l’hivernage, la mer est plus souvent agitée et les sorties moins régulières. Les volumes débarqués et les prix évoluent en conséquence." }
    ]
  }
];

export interface Territory {
  slug: string;
  name: string;
  place: string;
  zone: string;
  lat: number;
  lon: number;
  img: PhotoKey;
  dominant: string;
  intro: string;
  where: string;
  charac: string;
  activities: string[];
  species: { n: string; w?: string }[];
  sites: { n: string; t: string }[];
}

export const TERRITORIES: Territory[] = [
  {
    slug: "saint-louis", name: "Saint-Louis", place: "Guet Ndar · Langue de Barbarie", zone: "Grande Côte", lat: 16.025, lon: -16.505, img: "pir",
    dominant: "Pêche en mer et mareyage",
    intro: "Sur la Langue de Barbarie, le quartier de Guet Ndar abrite l’une des plus importantes communautés de pêcheurs du pays.",
    where: "À l’embouchure du fleuve Sénégal, près de la frontière mauritanienne, à environ 260 km au nord de Dakar.",
    charac: "Entre le fleuve et l’océan, Saint-Louis vit au rythme des pirogues qui franchissent la barre. La pêche y est une affaire de familles et de savoir-faire transmis depuis des générations.",
    activities: ["Pêche artisanale en mer", "Débarquement et mareyage", "Transformation artisanale", "Charpenterie de pirogues"],
    species: [{ n: "Sardinelles", w: "yaboy" }, { n: "Mérou", w: "thiof" }, { n: "Mulets" }, { n: "Courbines" }],
    sites: [{ n: "Plage de débarquement de Guet Ndar", t: "Débarquement" }, { n: "Marché au poisson", t: "Commerce" }, { n: "Aires de transformation", t: "Transformation" }]
  },
  {
    slug: "kayar", name: "Kayar", place: "Grande Côte · région de Thiès", zone: "Grande Côte", lat: 14.918, lon: -17.12, img: "mar",
    dominant: "Pêche à la ligne et filets",
    intro: "Village de pêcheurs adossé à une fosse sous-marine, Kayar accueille chaque saison des pêcheurs venus de tout le littoral.",
    where: "Sur la Grande Côte, à une soixantaine de kilomètres au nord-est de Dakar, dans la région de Thiès.",
    charac: "La fosse de Kayar rapproche les eaux profondes de la côte. Cette géographie fait du village un lieu de pêche réputé, où se croisent pêcheurs résidents et saisonniers.",
    activities: ["Pêche à la ligne", "Pêche aux filets dormants", "Mareyage", "Transformation par les femmes"],
    species: [{ n: "Sardinelles", w: "yaboy" }, { n: "Dorades" }, { n: "Mérou", w: "thiof" }, { n: "Poulpe" }],
    sites: [{ n: "Plage de débarquement", t: "Débarquement" }, { n: "Marché au poisson", t: "Commerce" }, { n: "Aire de transformation", t: "Transformation" }]
  },
  {
    slug: "dakar", name: "Dakar", place: "Soumbédioune · Hann · Yoff", zone: "Cap-Vert", lat: 14.683, lon: -17.462, img: "quai",
    dominant: "Débarquement et commerce urbain",
    intro: "Au cœur de la capitale, plages de débarquement et marchés relient directement la pêche artisanale aux consommateurs urbains.",
    where: "Sur la presqu’île du Cap-Vert, à l’extrémité ouest du pays.",
    charac: "À Dakar, la pêche artisanale côtoie la ville : les pirogues débarquent à quelques pas des quartiers, et le poisson rejoint rapidement marchés, restaurants et circuits d’expédition.",
    activities: ["Débarquement", "Commerce de détail et de gros", "Mareyage vers l’intérieur"],
    species: [{ n: "Mérou", w: "thiof" }, { n: "Dorades" }, { n: "Sardinelles", w: "yaboy" }, { n: "Seiches" }],
    sites: [{ n: "Plage et marché de Soumbédioune", t: "Débarquement · commerce" }, { n: "Baie de Hann", t: "Débarquement" }, { n: "Plage de Yoff", t: "Débarquement" }]
  },
  {
    slug: "mbour", name: "Mbour", place: "Petite-Côte · région de Thiès", zone: "Petite-Côte", lat: 14.415, lon: -16.965, img: "quai",
    dominant: "Grand centre de débarquement",
    intro: "L’un des premiers centres de débarquement du pays, d’où le poisson part chaque jour vers les marchés de l’intérieur et l’export.",
    where: "Sur la Petite-Côte, à environ 80 km au sud de Dakar.",
    charac: "Le quai de Mbour concentre une activité intense : arrivée des pirogues, tri, vente, chargement des camions. C’est un lieu clé pour comprendre la circulation du poisson.",
    activities: ["Débarquement", "Mareyage et expédition", "Transformation", "Fabrique de glace"],
    species: [{ n: "Sardinelles", w: "yaboy" }, { n: "Ethmalose", w: "cobo" }, { n: "Pageots" }, { n: "Seiches" }],
    sites: [{ n: "Quai de pêche", t: "Débarquement" }, { n: "Marché central au poisson", t: "Commerce" }, { n: "Sites de transformation", t: "Transformation" }]
  },
  {
    slug: "joal-fadiouth", name: "Joal-Fadiouth", place: "Petite-Côte · région de Thiès", zone: "Petite-Côte", lat: 14.165, lon: -16.83, img: "fum",
    dominant: "Débarquement et transformation",
    intro: "Port de pêche majeur et haut lieu de la transformation artisanale, où les femmes fument, sèchent et salent le poisson.",
    where: "Au sud de la Petite-Côte, à environ 110 km de Dakar, à l’entrée du Sine-Saloum.",
    charac: "Joal-Fadiouth réunit sur un même territoire une grande partie de la chaîne : débarquement, mareyage, transformation et expédition. Les sites de transformation y sont parmi les plus importants du pays.",
    activities: ["Débarquement", "Transformation artisanale (fumage, séchage, salage)", "Mareyage", "Commerce vers la sous-région"],
    species: [{ n: "Sardinelles", w: "yaboy" }, { n: "Ethmalose", w: "cobo" }, { n: "Mérou", w: "thiof" }, { n: "Poulpe" }],
    sites: [{ n: "Quai de pêche", t: "Débarquement" }, { n: "Site de transformation de Khelcom", t: "Transformation" }, { n: "Marché au poisson", t: "Commerce" }]
  },
  {
    slug: "djiffer", name: "Djiffer", place: "Delta du Saloum · région de Fatick", zone: "Sine-Saloum", lat: 13.97, lon: -16.755, img: "pir",
    dominant: "Pêche et transformation en milieu de delta",
    intro: "À la pointe de Sangomar, entre océan et bolongs, une pêche liée à la mangrove et aux îles du Saloum.",
    where: "À l’extrémité de la presqu’île de Sangomar, au débouché du delta du Saloum.",
    charac: "Djiffer est un point de passage entre la mer et le delta. La mangrove, nurserie de nombreuses espèces, y fait le lien entre pêche, environnement et vie des îles.",
    activities: ["Pêche en mer et en estuaire", "Transformation", "Cueillette de coquillages"],
    species: [{ n: "Ethmalose", w: "cobo" }, { n: "Crevettes" }, { n: "Arches", w: "pagne" }, { n: "Huîtres de mangrove" }],
    sites: [{ n: "Plage de débarquement", t: "Débarquement" }, { n: "Aires de transformation", t: "Transformation" }]
  },
  {
    slug: "ziguinchor", name: "Ziguinchor", place: "Basse-Casamance", zone: "Casamance", lat: 12.565, lon: -16.272, img: "mar",
    dominant: "Pêche fluviale et estuarienne",
    intro: "Le fleuve Casamance et ses bolongs nourrissent une pêche estuarienne : crevettes, huîtres et poissons de mangrove.",
    where: "Au sud du pays, sur la rive gauche du fleuve Casamance.",
    charac: "En Casamance, la pêche s’organise autour du fleuve et de la mangrove. Les femmes y jouent un rôle central dans la récolte et la transformation des huîtres et coquillages.",
    activities: ["Pêche estuarienne", "Récolte d’huîtres", "Transformation", "Commerce local"],
    species: [{ n: "Crevettes" }, { n: "Huîtres de mangrove" }, { n: "Mulets" }, { n: "Tilapias" }],
    sites: [{ n: "Quai de pêche de Ziguinchor", t: "Débarquement" }, { n: "Marché au poisson", t: "Commerce" }]
  }
];

export interface Opportunity { type: string; title: string; where: string; when: string; profile: ContactProfileKey }
export const OPPORTUNITIES: Opportunity[] = [
  { type: "Formation", title: "Bonnes pratiques d’hygiène au débarquement", where: "Mbour", when: "Inscriptions jusqu’au 30 oct.", profile: "pro" },
  { type: "Appel à collaboration", title: "Recenser les sites de transformation de la Petite-Côte", where: "Petite-Côte", when: "En cours", profile: "collaboration" }
];

export type SituationKind = "quai" | "conservation" | "besoin" | "infra" | "environnement" | "opportunite" | "autre";
export const SITUATION_KINDS: [SituationKind, string, string][] = [
  ["quai", "Problème sur un quai ou une plage", "Accès, organisation, sécurité…"],
  ["conservation", "Difficulté de conservation", "Glace, froid, pertes…"],
  ["besoin", "Besoin professionnel", "Équipement, formation, financement…"],
  ["infra", "Infrastructure indisponible", "En panne, fermée, inadaptée…"],
  ["environnement", "Problème environnemental", "Pollution, érosion, mangrove…"],
  ["opportunite", "Opportunité", "Débouché, initiative, projet…"],
  ["autre", "Autre information utile", "Tout ce qui mérite d’être connu"]
];
export const SINCE_OPTIONS = ["Aujourd’hui", "Cette semaine", "Ce mois-ci", "Plus longtemps", "Je ne sais pas"];
export const WHO_OPTIONS = ["Pêcheurs", "Mareyeurs", "Transformatrices", "Commerçants", "Habitants", "Autre"];

export type ContactProfileKey = "pro" | "organisation" | "signaler" | "collaboration" | "info" | "autre";
export const CONTACT_PROFILES: [ContactProfileKey, string, string][] = [
  ["pro", "Professionnel de la filière", "Pêcheur, mareyeur, transformatrice, commerçant…"],
  ["organisation", "Une organisation ou une institution", "Collectivité, organisation professionnelle, ONG, partenaire…"],
  ["signaler", "Je souhaite signaler une situation", "Un problème, un besoin, une opportunité"],
  ["collaboration", "Je veux proposer une collaboration", "Projet, formation, recherche, contenus…"],
  ["info", "Je souhaite en savoir plus", "Sur le programme, l’Atlas, les contenus"],
  ["autre", "Autre", ""]
];
export const CONTACT_FIELDS: Record<ContactProfileKey, string[]> = {
  pro: ["metier", "terr"], organisation: ["org", "orgType", "fonction"], collaboration: ["org", "collab"],
  signaler: [], info: ["sujet"], autre: []
};
export const CONTACT_MSG_LABEL: Record<ContactProfileKey, string> = {
  pro: "Votre message", organisation: "Objet de votre prise de contact", collaboration: "Décrivez votre proposition",
  signaler: "Votre message", info: "Votre question", autre: "Votre message"
};

export const LOOP3 = [
  { n: "Connaître", d: "Rassembler ce que l’on sait des territoires, des métiers et des ressources.", long: "Rassembler et organiser ce que l’on sait des territoires, des métiers, des ressources, des équipements et des besoins — à partir du terrain et des sources existantes." },
  { n: "Relier", d: "Mettre en relation les acteurs, les données et les besoins.", long: "Mettre en relation les professionnels, les organisations et les institutions autour d’une information partagée, vérifiée et utile." },
  { n: "Agir", d: "Aider à mieux investir, former et coordonner.", long: "Aider chacun à mieux décider : où investir, quoi former, comment coordonner les actions sur un territoire." }
];

export function territoryBySlug(slug: string): Territory | undefined {
  return TERRITORIES.find((t) => t.slug === slug);
}
export function contentBySlug(slug: string): ContentCard | undefined {
  return CONTENT.find((c) => c.slug === slug);
}
export function contentForTerritory(slug: string): ContentCard[] {
  return CONTENT.filter((c) => c.terr === slug);
}
