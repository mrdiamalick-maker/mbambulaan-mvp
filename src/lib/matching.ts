import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";

export type Opportunite = {
  id: string;
  besoinId: string;
  espece: string;
  quai: string;
  vendeur: string;
  acheteur: string;
  quantiteDisponible: string;
  quantiteDemandee: string;
  statut: "Correspondance trouvée";
};

export type MatchingSummary = {
  nombreOpportunites: number;
  tauxCouvertureBesoins: number;
  arrivagesDisponibles: number;
};

export function createOpportunites(arrivages: Arrivage[], besoins: Besoin[]): Opportunite[] {
  return besoins.flatMap((besoin) =>
    arrivages
      .filter((arrivage) => isCompatible(arrivage, besoin))
      .map((arrivage) => ({
        id: `${arrivage.id}-${besoin.id}`,
        besoinId: besoin.id,
        espece: besoin.espece,
        quai: arrivage.quai,
        vendeur: arrivage.vendeur ?? `Vendeur ${arrivage.quai}`,
        acheteur: besoin.acheteur ?? `Acheteur ${besoin.quai}`,
        quantiteDisponible: arrivage.quantite,
        quantiteDemandee: besoin.quantite,
        statut: "Correspondance trouvée" as const
      }))
  );
}

export function createMatchingSummary(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[]): MatchingSummary {
  const besoinsCouverts = new Set(opportunites.map((opportunite) => opportunite.besoinId)).size;

  return {
    nombreOpportunites: opportunites.length,
    tauxCouvertureBesoins: besoins.length === 0 ? 0 : Math.round((besoinsCouverts / besoins.length) * 100),
    arrivagesDisponibles: arrivages.length
  };
}

function isCompatible(arrivage: Arrivage, besoin: Besoin) {
  return normalizeEspece(arrivage.espece) === normalizeEspece(besoin.espece) && parseQuantiteEnKg(arrivage.quantite) >= parseQuantiteEnKg(besoin.quantite);
}

function normalizeEspece(value: string) {
  return value.trim().toLowerCase();
}

function parseQuantiteEnKg(value: string) {
  const normalized = value.trim().toLowerCase().replace(",", ".");
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) return 0;

  return normalized.includes("t") ? amount * 1000 : amount;
}
