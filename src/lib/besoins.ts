import besoinsData from "@/data/besoins.json";
import { urgenceLevelOptions } from "@/lib/reference";

export const urgenceLevels = urgenceLevelOptions;

export type UrgenceLevel = Exclude<(typeof urgenceLevels)[number], "Toutes">;

export type Besoin = {
  id: string;
  espece: string;
  quai: string;
  quantite: string;
  urgence: UrgenceLevel;
  acheteur?: string;
  commentaire: string;
};

export function getBesoins(): Besoin[] {
  return besoinsData as Besoin[];
}
