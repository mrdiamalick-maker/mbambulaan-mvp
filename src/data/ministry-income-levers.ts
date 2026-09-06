// Catalogue de leviers de diversification de revenus pour les ménages de
// pêcheurs — répond au besoin exprimé : "aider les pêcheurs à avoir
// d'autres revenus". Contenu de travail à qualifier et prioriser avec le
// ministère et ses partenaires : ce n'est pas une statistique officielle,
// c'est un point de départ pour cadrer des programmes concrets.

export type IncomeLeverMaturity = "piste" | "en_cadrage" | "actif";
export const incomeLeverMaturityLabels: Record<IncomeLeverMaturity, string> = {
  piste: "Piste à qualifier",
  en_cadrage: "En cadrage",
  actif: "Programme actif"
};

export interface IncomeLever {
  id: string;
  title: string;
  pitch: string;
  targetProfile: string;
  requiredSupport: string[];
  maturity: IncomeLeverMaturity;
  territoryIds: string[];
}

export const incomeLevers: IncomeLever[] = [
  {
    id: "aquaculture-cage",
    title: "Aquaculture en cage et en bassin",
    pitch: "Diversifier la production au-delà de la capture directe, sur des sites déjà fréquentés par les communautés de pêcheurs.",
    targetProfile: "Capitaines et membres d'équipage en période de repos biologique ou de ressource sous tension.",
    requiredSupport: ["Formation technique", "Financement d'installation", "Encadrement sanitaire"],
    maturity: "en_cadrage",
    territoryIds: ["joal", "djiffer", "foundiougne"]
  },
  {
    id: "transformation-valeur-ajoutee",
    title: "Transformation à valeur ajoutée",
    pitch: "Renforcer les unités de transformation existantes (fumage, séchage, conditionnement) pour capter plus de valeur avant l'export ou le marché local.",
    targetProfile: "Transformatrices et groupements déjà actifs sur les sites de débarquement.",
    requiredSupport: ["Équipement de conservation", "Normes qualité/export", "Accès aux marchés"],
    maturity: "actif",
    territoryIds: ["mbour", "kafountine", "cap-skirring"]
  },
  {
    id: "ecotourisme-cotier",
    title: "Écotourisme côtier et pêche-visite",
    pitch: "Valoriser le patrimoine maritime et les savoir-faire auprès de visiteurs, en complément saisonnier de l'activité de pêche.",
    targetProfile: "Communautés de pirogues sur les sites à fort potentiel paysager ou patrimonial.",
    requiredSupport: ["Structuration de l'offre", "Partenariats tourisme", "Formation à l'accueil"],
    maturity: "piste",
    territoryIds: ["cap-skirring", "elinkine", "fass-boye"]
  },
  {
    id: "maintenance-navale",
    title: "Mécanique et maintenance navale de proximité",
    pitch: "Créer des compétences et des ateliers locaux de maintenance (moteurs, coques, froid embarqué) plutôt que de dépendre de déplacements longs.",
    targetProfile: "Jeunes actifs des communautés de pêcheurs en recherche de qualification technique.",
    requiredSupport: ["Formation certifiante", "Outillage", "Local d'atelier"],
    maturity: "en_cadrage",
    territoryIds: ["hann", "soumbedioune", "rufisque"]
  },
  {
    id: "mareyage-organise",
    title: "Mareyage organisé et groupement de vente",
    pitch: "Structurer la commercialisation en groupement pour réduire la dépendance aux intermédiaires et stabiliser les revenus de vente.",
    targetProfile: "Mareyeuses et groupements de vente déjà présents sur les marchés de débarquement.",
    requiredSupport: ["Structuration juridique du groupement", "Accès au crédit de campagne", "Transport partagé"],
    maturity: "actif",
    territoryIds: ["saint-louis", "kayar", "yoff"]
  },
  {
    id: "reconversion-formation",
    title: "Formation et reconversion qualifiante",
    pitch: "Ouvrir des parcours de formation vers des métiers connexes (logistique, froid, agroalimentaire) pour les ménages les plus exposés aux fléaux économiques.",
    targetProfile: "Ménages de pêcheurs en situation de vulnérabilité économique identifiée sur le terrain.",
    requiredSupport: ["Cartographie des besoins", "Partenariats centres de formation", "Bourses ou appuis transitoires"],
    maturity: "piste",
    territoryIds: ["popenguine", "missirah", "lompoul"]
  }
];
