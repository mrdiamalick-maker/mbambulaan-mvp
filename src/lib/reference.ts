export type QuaiReference = {
  id: string;
  nom: string;
  region: string;
  coordonnees: {
    latitude: number;
    longitude: number;
    svgX: number;
    svgY: number;
  };
  capaciteJournaliereTonnes: number;
};

export type EspeceReference = {
  nom: string;
  categorie: string;
  saisonnalite: string;
  prixIndicatifFcfaKg: number;
};

export type ActorProfileReference = {
  profil: string;
  description: string;
  responsabilites: string[];
  actionsAutorisees: string[];
};

export const quaisReference = [
  { id: "saint-louis", nom: "Saint-Louis", region: "Saint-Louis", coordonnees: { latitude: 16.0326, longitude: -16.4818, svgX: 176, svgY: 72 }, capaciteJournaliereTonnes: 42 },
  { id: "kayar", nom: "Kayar", region: "Thiès", coordonnees: { latitude: 14.9189, longitude: -17.1211, svgX: 188, svgY: 214 }, capaciteJournaliereTonnes: 58 },
  { id: "soumbedioune", nom: "Soumbédioune", region: "Dakar", coordonnees: { latitude: 14.6678, longitude: -17.4674, svgX: 165, svgY: 268 }, capaciteJournaliereTonnes: 36 },
  { id: "rufisque", nom: "Rufisque", region: "Dakar", coordonnees: { latitude: 14.7167, longitude: -17.2667, svgX: 195, svgY: 282 }, capaciteJournaliereTonnes: 31 },
  { id: "yoff", nom: "Yoff", region: "Dakar", coordonnees: { latitude: 14.7603, longitude: -17.475, svgX: 158, svgY: 250 }, capaciteJournaliereTonnes: 29 },
  { id: "hann", nom: "Hann", region: "Dakar", coordonnees: { latitude: 14.7225, longitude: -17.427, svgX: 179, svgY: 262 }, capaciteJournaliereTonnes: 24 },
  { id: "mbour", nom: "Mbour", region: "Thiès", coordonnees: { latitude: 14.4167, longitude: -16.9667, svgX: 190, svgY: 344 }, capaciteJournaliereTonnes: 64 },
  { id: "joal", nom: "Joal", region: "Thiès", coordonnees: { latitude: 14.1667, longitude: -16.8333, svgX: 178, svgY: 386 }, capaciteJournaliereTonnes: 46 },
  { id: "foundiougne", nom: "Foundiougne", region: "Fatick", coordonnees: { latitude: 14.1333, longitude: -16.4667, svgX: 214, svgY: 395 }, capaciteJournaliereTonnes: 18 },
  { id: "ziguinchor", nom: "Ziguinchor", region: "Ziguinchor", coordonnees: { latitude: 12.5681, longitude: -16.2731, svgX: 223, svgY: 462 }, capaciteJournaliereTonnes: 27 },
  { id: "kafountine", nom: "Kafountine", region: "Ziguinchor", coordonnees: { latitude: 12.9308, longitude: -16.7444, svgX: 165, svgY: 442 }, capaciteJournaliereTonnes: 33 }
] as const satisfies readonly QuaiReference[];

export const especesReference = [
  { nom: "Sardinelle ronde", categorie: "Pélagique", saisonnalite: "Forte disponibilité de novembre à mai", prixIndicatifFcfaKg: 550 },
  { nom: "Sardinelle plate", categorie: "Pélagique", saisonnalite: "Disponible toute l'année avec pics saisonniers", prixIndicatifFcfaKg: 520 },
  { nom: "Thiof", categorie: "Démersal noble", saisonnalite: "Disponibilité variable, forte valeur commerciale", prixIndicatifFcfaKg: 4200 },
  { nom: "Dorade", categorie: "Démersal", saisonnalite: "Présente surtout en saison fraîche", prixIndicatifFcfaKg: 2600 },
  { nom: "Capitaine", categorie: "Démersal", saisonnalite: "Disponible par campagnes côtières", prixIndicatifFcfaKg: 3100 },
  { nom: "Crevette", categorie: "Crustacé", saisonnalite: "Forte demande export selon périodes de pêche", prixIndicatifFcfaKg: 3800 },
  { nom: "Yaboy", categorie: "Pélagique populaire", saisonnalite: "Très fréquent dans les débarquements artisanaux", prixIndicatifFcfaKg: 450 },
  { nom: "Maquereau", categorie: "Pélagique", saisonnalite: "Disponibilité régulière sur les quais côtiers", prixIndicatifFcfaKg: 900 },
  { nom: "Mulet", categorie: "Côtier", saisonnalite: "Présent dans les zones estuariennes et côtières", prixIndicatifFcfaKg: 1600 },
  { nom: "Sole", categorie: "Démersal", saisonnalite: "Demande soutenue restauration et export", prixIndicatifFcfaKg: 3300 }
] as const satisfies readonly EspeceReference[];

export const actorProfilesReference = [
  {
    profil: "Pêcheur",
    description: "Acteur de débarquement qui publie les lots disponibles et suit leur valorisation.",
    responsabilites: ["Déclarer les arrivages", "Indiquer le quai et le volume", "Suivre les réservations"],
    actionsAutorisees: ["Déclarer un arrivage", "Consulter ses déclarations", "Voir ses transactions", "Lire ses notifications"]
  },
  {
    profil: "Mareyeur",
    description: "Acheteur terrain qui recherche les lots, publie des besoins et réserve les volumes compatibles.",
    responsabilites: ["Exprimer les besoins d'achat", "Réserver des lots", "Sécuriser les transactions"],
    actionsAutorisees: ["Rechercher des arrivages", "Publier un besoin", "Consulter les opportunités", "Réserver un lot"]
  },
  {
    profil: "Transformateur",
    description: "Acteur industriel ou semi-industriel qui planifie les approvisionnements et suit les retraits.",
    responsabilites: ["Publier des besoins industriels", "Réserver les lots compatibles", "Suivre les livraisons"],
    actionsAutorisees: ["Publier un besoin", "Réserver", "Suivre les transactions", "Lire les notifications"]
  },
  {
    profil: "Collectivité",
    description: "Acteur territorial qui observe les flux, les alertes et l'impact économique local.",
    responsabilites: ["Observer les quais", "Lire les indicateurs", "Identifier les signaux territoriaux"],
    actionsAutorisees: ["Consulter le dashboard", "Voir la carte des quais", "Lire les statistiques", "Suivre les notifications territoriales"]
  },
  {
    profil: "Coopérative",
    description: "Organisation collective qui consolide les volumes, les déclarations et la coordination locale.",
    responsabilites: ["Regrouper les offres", "Coordonner les membres", "Faciliter la mise en relation"],
    actionsAutorisees: ["Consulter les arrivages", "Suivre les opportunités", "Voir les transactions", "Lire les alertes"]
  },
  {
    profil: "Administration",
    description: "Institution qui suit la dynamique de la filière et les signaux utiles à la décision publique.",
    responsabilites: ["Surveiller les indicateurs", "Repérer les tensions", "Appuyer la coordination territoriale"],
    actionsAutorisees: ["Consulter le dashboard", "Voir la carte", "Lire les alertes", "Analyser les statistiques"]
  },
  {
    profil: "Exporter",
    description: "Acheteur spécialisé qui recherche des lots conformes aux besoins de consolidation export.",
    responsabilites: ["Exprimer la demande", "Réserver des lots compatibles", "Suivre la préparation"],
    actionsAutorisees: ["Publier un besoin", "Consulter les opportunités", "Réserver", "Suivre les transactions"]
  }
] as const satisfies readonly ActorProfileReference[];

export const metierStatuses = {
  arrivages: ["Disponible", "Réservé", "Contrôle qualité", "Expédié", "Livré"],
  besoins: ["Ouvert", "En cours", "Couvert", "Clos"],
  opportunites: ["Détectée", "Proposée", "Acceptée", "Terminée"],
  transactions: ["Préparation", "Chargement", "Transport", "Livraison", "Terminée"]
} as const;

export const arrivageStatusOptions = ["Tous", "Disponible", "Reserve", "En controle", "Ecoule"] as const;
export const besoinStatusOptions = metierStatuses.besoins;
export const opportuniteStatusOptions = metierStatuses.opportunites;
export const transactionMetierStatusOptions = metierStatuses.transactions;
export const transactionWorkflowStatuses = ["Réservée", "En préparation", "En cours de retrait", "Terminée", "Annulée"] as const;
export const urgenceLevelOptions = ["Toutes", "Haute", "Moyenne", "Basse"] as const;

export function getActorProfile(profil: string) {
  return actorProfilesReference.find((actorProfile) => actorProfile.profil === profil);
}

export function getQuaiReference(nom: string) {
  const normalized = normalizeReferenceValue(nom).replace(/^quai de /, "");
  return quaisReference.find((quai) => normalizeReferenceValue(quai.nom) === normalized);
}

export function getEspeceReference(nom: string) {
  return especesReference.find((espece) => normalizeReferenceValue(espece.nom) === normalizeReferenceValue(nom));
}

function normalizeReferenceValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
