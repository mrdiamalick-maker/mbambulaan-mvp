export const PUBLIC_CONTRIBUTIONS_STORAGE_KEY = "mbambulaan.public-contributions.v1";

export type PublicContributionKind =
  | "Signalement"
  | "Pollution"
  | "Sécurité"
  | "Initiative"
  | "Mobilisation"
  | "Partenariat"
  | "Information"
  | "Besoin";

export type PublicContributionRecord = {
  id: string;
  kind: PublicContributionKind;
  title: string;
  description: string;
  territory: string;
  sender: string;
  contact: string;
  urgency: "Normale" | "Vigilance" | "Critique";
  createdAt: string;
  attachmentHint: string;
  consentToRelay: boolean;
};

export const publicContributionDemoSeeds: PublicContributionRecord[] = [
  {
    id: "PUB-2026-0042",
    kind: "Pollution",
    title: "Rejets suspects observés près de la zone de débarquement",
    description: "Plusieurs acteurs demandent une vérification des rejets et une coordination avec les services compétents.",
    territory: "Mbour · Thiès",
    sender: "Collectif local du quai",
    contact: "Contact protégé dans la démonstration",
    urgency: "Critique",
    createdAt: "Aujourd’hui · 09:18",
    attachmentHint: "3 photos et une localisation annoncées",
    consentToRelay: true,
  },
  {
    id: "PUB-2026-0041",
    kind: "Mobilisation",
    title: "Journée communautaire de nettoyage à organiser",
    description: "Une association souhaite coordonner bénévoles, bacs et évacuation des déchets avec les acteurs locaux.",
    territory: "Joal-Fadiouth",
    sender: "Association communautaire",
    contact: "Contact protégé dans la démonstration",
    urgency: "Normale",
    createdAt: "Hier · 16:42",
    attachmentHint: "Note de mobilisation annoncée",
    consentToRelay: true,
  },
];

export function savePublicContribution(record: PublicContributionRecord) {
  if (typeof window === "undefined") return;
  const existing = loadPublicContributions();
  window.localStorage.setItem(PUBLIC_CONTRIBUTIONS_STORAGE_KEY, JSON.stringify([record, ...existing]));
}

export function loadPublicContributions(): PublicContributionRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(PUBLIC_CONTRIBUTIONS_STORAGE_KEY);
    return value ? JSON.parse(value) as PublicContributionRecord[] : [];
  } catch {
    return [];
  }
}
