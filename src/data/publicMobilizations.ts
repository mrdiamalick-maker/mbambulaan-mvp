export type PublicMobilization = {
  id: string;
  title: string;
  territory: string;
  cause: string;
  summary: string;
  need: string;
  status: string;
  contributions: number;
  authorityRelay: string;
  urgency: "Normale" | "Vigilance" | "Critique";
};

export type PublicContributionSeed = {
  id: string;
  title: string;
  territory: string;
  category: string;
  sender: string;
  status: string;
  urgency: "Normale" | "Vigilance" | "Critique";
  receivedAt: string;
};

export const publicMobilizations: PublicMobilization[] = [
  {
    id: "mob-pollution-mbour",
    title: "Documenter et traiter les rejets observés près du quai",
    territory: "Mbour · Thiès",
    cause: "Lutte anti-pollution",
    summary: "Des acteurs locaux souhaitent centraliser les constats, protéger les zones de travail et obtenir une réponse coordonnée des services compétents.",
    need: "Photos datées, localisation, témoignages et relais associatifs",
    status: "Signalements en qualification",
    contributions: 27,
    authorityRelay: "Cellule régionale environnement et services du quai",
    urgency: "Critique",
  },
  {
    id: "mob-mangrove-joal",
    title: "Protéger et restaurer les espaces de mangrove",
    territory: "Joal-Fadiouth",
    cause: "Engagement communautaire",
    summary: "Une mobilisation locale associe communautés, écoles, associations et partenaires pour préserver les zones sensibles et relayer les initiatives existantes.",
    need: "Relais locaux, expertise, plants, logistique et soutien aux journées terrain",
    status: "Partenaires recherchés",
    contributions: 18,
    authorityRelay: "Collectivité locale et services techniques",
    urgency: "Vigilance",
  },
  {
    id: "mob-securite-saint-louis",
    title: "Faire remonter les besoins de sécurité avant la saison difficile",
    territory: "Saint-Louis",
    cause: "Prévention et sécurité",
    summary: "Les communautés peuvent documenter les besoins d'équipement, relayer les messages de prévention et signaler les situations nécessitant une vérification rapide.",
    need: "Besoins documentés, témoignages, relais de confiance et partenaires équipementiers",
    status: "Contribution ouverte",
    contributions: 34,
    authorityRelay: "Cellule technique territoriale",
    urgency: "Vigilance",
  },
];

export const publicContributionSeeds: PublicContributionSeed[] = [
  { id: "PUB-2026-0042", title: "Rejets suspects observés à proximité de la zone de débarquement", territory: "Mbour · Thiès", category: "Pollution", sender: "Collectif local du quai", status: "À qualifier", urgency: "Critique", receivedAt: "Aujourd'hui · 09:18" },
  { id: "PUB-2026-0041", title: "Demande de bacs et d'organisation pour une journée de nettoyage", territory: "Joal-Fadiouth", category: "Mobilisation", sender: "Association communautaire", status: "À orienter", urgency: "Normale", receivedAt: "Hier · 16:42" },
  { id: "PUB-2026-0039", title: "Besoin de gilets et de supports de sensibilisation", territory: "Saint-Louis", category: "Sécurité", sender: "Relais de pêcheurs", status: "En vérification", urgency: "Vigilance", receivedAt: "18 juillet · 11:05" },
];
