import besoinsData from "@/data/besoins.json";

export const urgenceLevels = ["Toutes", "Haute", "Moyenne", "Basse"] as const;

export type UrgenceLevel = Exclude<(typeof urgenceLevels)[number], "Toutes">;

export type Besoin = {
  id: string;
  espece: string;
  quai: string;
  quantite: string;
  urgence: UrgenceLevel;
  commentaire: string;
};

export function getBesoins(): Besoin[] {
  return besoinsData as Besoin[];
}
