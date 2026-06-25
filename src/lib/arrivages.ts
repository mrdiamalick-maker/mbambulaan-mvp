import arrivagesData from "@/data/arrivages.json";

export const arrivageStatuses = ["Tous", "Disponible", "Reserve", "En controle", "Ecoule"] as const;

export type ArrivageStatus = Exclude<(typeof arrivageStatuses)[number], "Tous">;

export type Arrivage = {
  id: string;
  espece: string;
  quai: string;
  quantite: string;
  heureDebarquement: string;
  statut: ArrivageStatus;
};

export function getArrivages(): Arrivage[] {
  return arrivagesData as Arrivage[];
}
