import arrivagesData from "@/data/arrivages.json";
import { arrivageStatusOptions } from "@/lib/reference";

export const arrivageStatuses = arrivageStatusOptions;

export type ArrivageStatus = Exclude<(typeof arrivageStatuses)[number], "Tous">;

export type Arrivage = {
  id: string;
  espece: string;
  quai: string;
  quantite: string;
  heureDebarquement: string;
  vendeur?: string;
  statut: ArrivageStatus;
};

export function getArrivages(): Arrivage[] {
  return arrivagesData as Arrivage[];
}
