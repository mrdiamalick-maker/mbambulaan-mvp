// Jeu de données territorial 100% éditorial et public de l'Atlas Mbàmbulaan.
// Ce fichier ne dépend jamais du state du Produit professionnel (createDemoState) :
// aucune donnée opérationnelle privée, aucun volume individuel, aucune capacité
// temps réel n'y figure. Toute information doit rester au niveau "publique
// consolidée", "enrichie par Mbàmbulaan" ou "vérifiée avec un relais territorial",
// et le niveau de couverture réel doit toujours être visible.

export type AtlasVerification = "Référencé" | "Documenté" | "Enrichi avec réseau local";

export type AtlasTerritoryType = "Quai" | "Port" | "Territoire halieutique";

export interface PublicTerritory {
  id: string;
  slug: string;
  name: string;
  type: AtlasTerritoryType;
  region: string;
  department?: string;
  coordinates: { lat: number; lon: number };
  /**
   * Position sur le fond de carte calibré du littoral (Livrable 3, 2026-08-15).
   * Coordonnées dans le repère SVG de docs/design-reference/senegal-coast-atlas.svg
   * (viewBox 0 0 1000 1400) — PAS des pourcentages. 16 des 20 valeurs viennent
   * directement des 18 marqueurs DA d'origine (Lompoul et Ouakam exclus, absents
   * de cette liste publique) ; Bargny/Ngaparou/Toubacouta/Ziguinchor viennent
   * d'un second passage DA (coordonnées ChatGPT, vérifiées visuellement par
   * Claude Code avant intégration — tombent bien sur la silhouette).
   */
  mapPosition: [number, number];
  description: string;
  activities: string[];
  domains: string[];
  documentedServices: string[];
  species?: string[];
  verification: AtlasVerification;
  source: string;
  updatedAt: string;
  relatedContentIds?: string[];
  relatedOpportunityIds?: string[];
}

export const publicTerritories: PublicTerritory[] = [
  {
    id: "saint-louis",
    slug: "saint-louis",
    name: "Saint-Louis",
    type: "Port",
    region: "Saint-Louis",
    department: "Saint-Louis",
    coordinates: { lat: 16.03, lon: -16.49 },
    mapPosition: [258, 205],
    description: "Port historique à l'embouchure du fleuve Sénégal, cœur de la pêche artisanale du nord du pays et pôle majeur de transformation et d'exportation vers la sous-région.",
    activities: ["Pêche artisanale océanique", "Débarquement et mareyage", "Transformation artisanale", "Réparation navale"],
    domains: ["Pêche & ressources", "Débarquement", "Transformation & valorisation", "Transport & logistique"],
    documentedServices: ["Quai de pêche aménagé", "Chambres froides", "Ateliers de réparation de pirogues"],
    species: ["Thiof", "Sardinelle", "Mulet"],
    verification: "Documenté",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-08-01",
    relatedContentIds: ["terrain-kayar"]
  },
  {
    id: "fass-boye",
    slug: "fass-boye",
    name: "Fass Boye",
    type: "Quai",
    region: "Thiès",
    department: "Tivaouane",
    coordinates: { lat: 15.19, lon: -16.82 },
    mapPosition: [252, 372],
    description: "Village de pêcheurs de la Grande-Côte, point de débarquement actif pour la pêche pélagique côtière et point de départ historique de nombreuses pirogues artisanales.",
    activities: ["Pêche artisanale côtière", "Débarquement", "Fumage et séchage artisanal"],
    domains: ["Pêche & ressources", "Débarquement", "Transformation & valorisation"],
    documentedServices: ["Site de débarquement", "Aire de séchage et fumage"],
    species: ["Sardinelle", "Ethmalose"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-07-20"
  },
  {
    id: "kayar",
    slug: "kayar",
    name: "Kayar",
    type: "Quai",
    region: "Thiès",
    department: "Tivaouane",
    coordinates: { lat: 14.92, lon: -17.12 },
    mapPosition: [265, 450],
    description: "Un des plus grands quais de pêche artisanale du Sénégal, reconnu pour ses fosses sous-marines poissonneuses et sa flotte importante de pirogues.",
    activities: ["Pêche artisanale hauturière", "Débarquement à grande échelle", "Mareyage", "Transformation"],
    domains: ["Pêche & ressources", "Débarquement", "Commerce & débouchés", "Transformation & valorisation"],
    documentedServices: ["Quai de pêche", "Marché aux poissons", "Fabrique de glace"],
    species: ["Thiof", "Sardinelle", "Yaboy", "Thon"],
    verification: "Documenté",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-08-05",
    relatedContentIds: ["terrain-kayar"]
  },
  {
    id: "yoff",
    slug: "yoff",
    name: "Yoff",
    type: "Quai",
    region: "Dakar",
    department: "Dakar",
    coordinates: { lat: 14.75, lon: -17.47 },
    mapPosition: [278, 528],
    description: "Village lébou historique de la presqu'île du Cap-Vert, plage de débarquement active à proximité immédiate de l'agglomération dakaroise.",
    activities: ["Pêche artisanale côtière", "Débarquement", "Vente directe"],
    domains: ["Pêche & ressources", "Débarquement", "Commerce & débouchés"],
    documentedServices: ["Plage de débarquement", "Marché de quartier"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-07-15"
  },
  {
    id: "soumbedioune",
    slug: "soumbedioune",
    name: "Soumbédioune",
    type: "Quai",
    region: "Dakar",
    department: "Dakar",
    coordinates: { lat: 14.68, lon: -17.46 },
    mapPosition: [295, 610],
    description: "Village de pêche emblématique du centre-ville de Dakar, marché artisanal et point de débarquement patrimonial.",
    activities: ["Pêche artisanale côtière", "Débarquement", "Artisanat et vente directe"],
    domains: ["Pêche & ressources", "Débarquement", "Commerce & débouchés"],
    documentedServices: ["Plage de débarquement", "Marché artisanal"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-07-15"
  },
  {
    id: "hann",
    slug: "hann",
    name: "Hann",
    type: "Quai",
    region: "Dakar",
    department: "Dakar",
    coordinates: { lat: 14.71, lon: -17.43 },
    mapPosition: [316, 642],
    description: "Baie industrielle et halieutique de Dakar, proche des zones de transformation et de conditionnement à destination de l'export.",
    activities: ["Débarquement", "Transformation industrielle et artisanale", "Conditionnement"],
    domains: ["Débarquement", "Transformation & valorisation", "Transport & logistique"],
    documentedServices: ["Quai de pêche", "Unités de transformation à proximité"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-07-10"
  },
  {
    id: "rufisque",
    slug: "rufisque",
    // LOT 6 (mandat "Public — Comprendre, trouver, contribuer", §19 :
    // "un même territoire doit avoir le même identifiant canonique...
    // éviter les copies qui divergent silencieusement sur le nom") —
    // aligné sur Territory.name côté Core ("Rufisque-Bargny",
    // demo-state.ts) pour le même id "rufisque". La fiche "Bargny"
    // distincte plus bas reste une page éditoriale à part (aucun
    // équivalent Core), non affectée par ce correctif.
    name: "Rufisque-Bargny",
    type: "Quai",
    region: "Dakar",
    department: "Rufisque",
    coordinates: { lat: 14.72, lon: -17.27 },
    mapPosition: [342, 684],
    description: "Ville historique et quai de pêche actif à l'est de Dakar, avec une communauté de pêcheurs et mareyeurs organisée.",
    activities: ["Pêche artisanale", "Débarquement", "Mareyage"],
    domains: ["Pêche & ressources", "Débarquement", "Commerce & débouchés"],
    documentedServices: ["Quai de pêche", "Aire de mareyage"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-07-10"
  },
  {
    id: "bargny",
    slug: "bargny",
    name: "Bargny",
    type: "Quai",
    region: "Dakar",
    department: "Rufisque",
    coordinates: { lat: 14.69, lon: -17.23 },
    mapPosition: [360, 696],
    description: "Localité côtière proche de Rufisque, activité de pêche artisanale et de transformation confrontée à la pression industrielle et urbaine croissante sur le littoral.",
    activities: ["Pêche artisanale", "Débarquement", "Transformation artisanale"],
    domains: ["Pêche & ressources", "Débarquement", "Transformation & valorisation", "Durabilité & environnement"],
    documentedServices: ["Plage de débarquement", "Aire de transformation"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-07-05"
  },
  {
    id: "popenguine",
    slug: "popenguine",
    name: "Popenguine",
    type: "Quai",
    region: "Thiès",
    department: "Mbour",
    coordinates: { lat: 14.53, lon: -17.12 },
    mapPosition: [350, 720],
    description: "Petite localité côtière de la Petite-Côte, activité de pêche artisanale et proximité touristique croissante.",
    activities: ["Pêche artisanale côtière", "Débarquement"],
    domains: ["Pêche & ressources", "Débarquement", "Territoires & infrastructures"],
    documentedServices: ["Plage de débarquement"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-28"
  },
  {
    id: "ngaparou",
    slug: "ngaparou",
    name: "Ngaparou",
    type: "Quai",
    region: "Thiès",
    department: "Mbour",
    coordinates: { lat: 14.47, lon: -17.05 },
    mapPosition: [356, 739],
    description: "Village de la Petite-Côte où pêche artisanale et tourisme balnéaire cohabitent, avec un site de débarquement actif en bord de plage.",
    activities: ["Pêche artisanale côtière", "Débarquement", "Vente directe"],
    domains: ["Pêche & ressources", "Débarquement", "Commerce & débouchés"],
    documentedServices: ["Plage de débarquement", "Vente directe aux visiteurs"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-25"
  },
  {
    id: "mbour",
    slug: "mbour",
    name: "Mbour",
    type: "Port",
    region: "Thiès",
    department: "Mbour",
    coordinates: { lat: 14.42, lon: -16.97 },
    mapPosition: [362, 758],
    description: "Un des principaux ports de pêche artisanale de la Petite-Côte, avec une flotte importante et une chaîne de conservation et de transport structurée.",
    activities: ["Pêche artisanale hauturière", "Débarquement", "Conservation", "Transport"],
    domains: ["Pêche & ressources", "Débarquement", "Conservation & froid", "Transport & logistique"],
    documentedServices: ["Quai aménagé", "Fabrique de glace", "Chambres froides"],
    species: ["Thiof", "Thon", "Sardinelle"],
    verification: "Documenté",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-08-03"
  },
  {
    id: "joal",
    slug: "joal-fadiouth",
    name: "Joal-Fadiouth",
    type: "Port",
    region: "Fatick",
    department: "Mbour",
    coordinates: { lat: 14.17, lon: -16.83 },
    mapPosition: [378, 792],
    description: "L'un des plus grands ports de pêche artisanale d'Afrique de l'Ouest, jumelé à l'île coquillière de Fadiouth, avec une activité de transformation et de commercialisation dense.",
    activities: ["Pêche artisanale hauturière", "Débarquement à grande échelle", "Transformation artisanale", "Mareyage", "Transport"],
    domains: ["Pêche & ressources", "Débarquement", "Transformation & valorisation", "Commerce & débouchés", "Transport & logistique"],
    documentedServices: ["Quai de pêche", "Aires de fumage et séchage", "Marché aux poissons", "Chambres froides"],
    species: ["Thiof", "Sardinelle", "Yaboy", "Thon", "Ethmalose"],
    verification: "Enrichi avec réseau local",
    source: "Sources publiques consolidées + relais territorial · démonstration éditoriale",
    updatedAt: "2026-08-08",
    relatedContentIds: ["terrain-joal", "guide-besoin-froid"]
  },
  {
    id: "djiffer",
    slug: "djiffer",
    name: "Djiffer",
    type: "Quai",
    region: "Fatick",
    department: "Foundiougne",
    coordinates: { lat: 13.93, lon: -16.75 },
    mapPosition: [340, 900],
    description: "Pointe de la Petite-Côte à l'entrée du delta du Saloum, quai actif de pêche artisanale et de traversée vers les îles du Saloum.",
    activities: ["Pêche artisanale", "Débarquement", "Transport fluvial"],
    domains: ["Pêche & ressources", "Débarquement", "Transport & logistique"],
    documentedServices: ["Quai de pêche", "Point de traversée"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-20"
  },
  {
    id: "foundiougne",
    slug: "foundiougne",
    name: "Foundiougne",
    type: "Quai",
    region: "Fatick",
    department: "Foundiougne",
    coordinates: { lat: 14.13, lon: -16.47 },
    mapPosition: [365, 855],
    description: "Chef-lieu du delta du Saloum, activité de pêche continentale et estuarienne importante pour les territoires environnants.",
    activities: ["Pêche estuarienne", "Débarquement", "Transformation artisanale"],
    domains: ["Pêche & ressources", "Débarquement", "Transformation & valorisation"],
    documentedServices: ["Quai de pêche", "Aire de transformation"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-20"
  },
  {
    id: "missirah",
    slug: "missirah",
    name: "Missirah",
    type: "Quai",
    region: "Fatick",
    department: "Foundiougne",
    coordinates: { lat: 13.85, lon: -16.55 },
    mapPosition: [330, 965],
    description: "Territoire du delta du Saloum, riche en mangroves, avec une activité de pêche et de cueillette de coquillages structurante pour les communautés locales.",
    activities: ["Pêche estuarienne", "Cueillette de coquillages", "Débarquement"],
    domains: ["Pêche & ressources", "Débarquement", "Durabilité & environnement"],
    documentedServices: ["Site de débarquement communautaire"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-15"
  },
  {
    id: "toubacouta",
    slug: "toubacouta",
    name: "Toubacouta",
    type: "Quai",
    region: "Fatick",
    department: "Foundiougne",
    coordinates: { lat: 13.78, lon: -16.45 },
    mapPosition: [410, 868],
    description: "Porte d'entrée du delta du Saloum côté mangroves, activité de pêche et de cueillette structurée autour d'un tourisme de nature en développement.",
    activities: ["Pêche estuarienne", "Cueillette de coquillages", "Débarquement"],
    domains: ["Pêche & ressources", "Débarquement", "Durabilité & environnement", "Territoires & infrastructures"],
    documentedServices: ["Site de débarquement communautaire"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-12"
  },
  {
    id: "kafountine",
    slug: "kafountine",
    name: "Kafountine",
    type: "Port",
    region: "Ziguinchor",
    department: "Bignona",
    coordinates: { lat: 12.93, lon: -16.75 },
    mapPosition: [335, 1040],
    description: "Principal port de pêche artisanale de Casamance, connu pour ses volumes de débarquement et son rôle dans l'approvisionnement régional en produits halieutiques.",
    activities: ["Pêche artisanale hauturière", "Débarquement à grande échelle", "Transformation", "Transport régional"],
    domains: ["Pêche & ressources", "Débarquement", "Transformation & valorisation", "Transport & logistique"],
    documentedServices: ["Quai de pêche", "Aires de transformation", "Chambres froides"],
    species: ["Sardinelle", "Thiof", "Capitaine"],
    verification: "Documenté",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-08-02"
  },
  {
    id: "ziguinchor",
    slug: "ziguinchor",
    name: "Ziguinchor",
    type: "Port",
    region: "Ziguinchor",
    department: "Ziguinchor",
    coordinates: { lat: 12.57, lon: -16.27 },
    mapPosition: [425, 1055],
    description: "Chef-lieu de la Casamance sur le fleuve du même nom, port fluvial et pôle commercial reliant la pêche estuarienne aux marchés régionaux.",
    activities: ["Pêche fluviale et estuarienne", "Débarquement", "Commerce régional", "Transport fluvial"],
    domains: ["Pêche & ressources", "Débarquement", "Commerce & débouchés", "Transport & logistique"],
    documentedServices: ["Port fluvial", "Marché régional"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-08"
  },
  {
    id: "elinkine",
    slug: "elinkine",
    name: "Élinkine",
    type: "Quai",
    region: "Ziguinchor",
    department: "Oussouye",
    coordinates: { lat: 12.58, lon: -16.62 },
    mapPosition: [365, 1090],
    description: "Village de pêcheurs de Basse-Casamance, porte d'entrée vers les îles Bijagos et zone de pêche traditionnelle en mangrove.",
    activities: ["Pêche artisanale", "Débarquement", "Transport vers les îles"],
    domains: ["Pêche & ressources", "Débarquement", "Territoires & infrastructures"],
    documentedServices: ["Quai communautaire", "Point d'embarquement"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-10"
  },
  {
    id: "cap-skirring",
    slug: "cap-skirring",
    name: "Cap Skirring",
    type: "Quai",
    region: "Ziguinchor",
    department: "Oussouye",
    coordinates: { lat: 12.4, lon: -16.75 },
    mapPosition: [400, 1135],
    description: "Extrémité sud du littoral sénégalais, activité de pêche artisanale couplée à une économie touristique développée.",
    activities: ["Pêche artisanale côtière", "Débarquement", "Vente directe"],
    domains: ["Pêche & ressources", "Débarquement", "Commerce & débouchés"],
    documentedServices: ["Plage de débarquement"],
    verification: "Référencé",
    source: "Sources publiques consolidées · démonstration éditoriale",
    updatedAt: "2026-06-10"
  }
];

export function findTerritoryBySlug(slug: string) {
  return publicTerritories.find((item) => item.slug === slug);
}
