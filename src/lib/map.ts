import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { DashboardData, Opportunite } from "@/lib/coordination";

export type QuaiActivityLevel = "low" | "medium" | "high";

export type QuaiMapPoint = {
  id: string;
  nom: string;
  quai: string;
  x: number;
  y: number;
  color: string;
  activityLevel: QuaiActivityLevel;
  volumeDebarque: string;
  nombreArrivages: number;
  especesPrincipales: string[];
  besoinsOuverts: number;
  opportunitesDetectees: number;
  misesEnRelation: number;
  derniersDebarquements: {
    id: string;
    espece: string;
    quantite: string;
    heureDebarquement: string;
    statut: string;
  }[];
};

export const senegalSvgViewBox = "0 0 420 520";

export const quaiActivityColors: Record<QuaiActivityLevel, string> = {
  low: "#2f9e44",
  medium: "#f08c00",
  high: "#c92a2a"
};

const pilotQuais = [
  { id: "saint-louis", nom: "Saint-Louis", quai: "Quai de Saint-Louis", x: 176, y: 72 },
  { id: "kayar", nom: "Kayar", quai: "Quai de Kayar", x: 188, y: 214 },
  { id: "soumbedioune", nom: "Soumbédioune", quai: "Quai de Soumbedioune", x: 165, y: 268 },
  { id: "rufisque", nom: "Rufisque", quai: "Quai de Rufisque", x: 195, y: 282 },
  { id: "mbour", nom: "Mbour", quai: "Quai de Mbour", x: 190, y: 344 },
  { id: "joal", nom: "Joal", quai: "Quai de Joal", x: 178, y: 386 }
] as const;

export function createQuaiMapPoints(
  arrivages: Arrivage[],
  besoins: Besoin[],
  opportunites: Opportunite[],
  dashboardData: DashboardData
): QuaiMapPoint[] {
  return pilotQuais.map((pilot) => {
    const quaiArrivages = arrivages.filter((arrivage) => sameQuai(arrivage.quai, pilot.quai));
    const quaiBesoins = besoins.filter((besoin) => sameQuai(besoin.quai, pilot.quai));
    const quaiOpportunites = opportunites.filter((opportunite) => sameQuai(opportunite.lieu, pilot.quai));
    const dashboardQuai = dashboardData.quaisActifs.find((quai) => sameQuai(quai.quai, pilot.quai));
    const activityLevel = computeQuaiActivityLevel(quaiArrivages.length, quaiBesoins.length, quaiOpportunites.length);

    return {
      ...pilot,
      color: quaiActivityColors[activityLevel],
      activityLevel,
      volumeDebarque: dashboardQuai?.volumeTotal ?? "0 kg",
      nombreArrivages: quaiArrivages.length,
      especesPrincipales: computeMainSpecies(quaiArrivages),
      besoinsOuverts: quaiBesoins.length,
      opportunitesDetectees: quaiOpportunites.length,
      misesEnRelation: 0,
      derniersDebarquements: quaiArrivages.slice(0, 3).map((arrivage) => ({
        id: arrivage.id,
        espece: arrivage.espece,
        quantite: arrivage.quantite,
        heureDebarquement: arrivage.heureDebarquement,
        statut: arrivage.statut
      }))
    };
  });
}

export function getQuaiActivityLabel(level: QuaiActivityLevel) {
  if (level === "high") return "Activite forte";
  if (level === "medium") return "Activite suivie";
  return "Activite faible";
}

export function getQuaiFilterUrl(route: "/arrivages" | "/besoins" | "/opportunites", quai: string) {
  return `${route}?quai=${encodeURIComponent(quai)}`;
}

function computeQuaiActivityLevel(nombreArrivages: number, besoinsOuverts: number, opportunitesDetectees: number): QuaiActivityLevel {
  const score = nombreArrivages * 2 + besoinsOuverts + opportunitesDetectees * 2;

  if (score >= 8) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function computeMainSpecies(arrivages: Arrivage[]) {
  const species = new Map<string, number>();

  arrivages.forEach((arrivage) => {
    species.set(arrivage.espece, (species.get(arrivage.espece) ?? 0) + 1);
  });

  return Array.from(species.entries())
    .sort((first, second) => second[1] - first[1])
    .map(([name]) => name);
}

function sameQuai(first: string, second: string) {
  return normalizeQuai(first) === normalizeQuai(second);
}

function normalizeQuai(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^quai de /i, "")
    .trim()
    .toLowerCase();
}
