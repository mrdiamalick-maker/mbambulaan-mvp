import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";

export type Opportunite = {
  id: string;
  arrivageId: string;
  besoinId: string;
  espece: string;
  quantite: string;
  lieu: string;
  vendeur: string;
  acheteur: string;
  quantiteDisponible: string;
  quantiteDemandee: string;
  scoreCompatibilite: number;
  statut: OpportuniteStatus;
  raisons: string[];
  offre: {
    id: string;
    quai: string;
    vendeur: string;
    quantite: string;
    heureDebarquement: string;
    statut: string;
  };
  besoin: {
    id: string;
    quai: string;
    acheteur: string;
    quantite: string;
    urgence: string;
    commentaire: string;
  };
};

export type OpportuniteStatus = "Correspondance trouvée" | "Contact initié";

export type MatchingSummary = {
  nombreOpportunites: number;
  tauxCouvertureBesoins: number;
  arrivagesDisponibles: number;
  misesEnRelationCreees: number;
};

export function createOpportunites(arrivages: Arrivage[], besoins: Besoin[]): Opportunite[] {
  return besoins.flatMap((besoin) =>
    arrivages
      .filter((arrivage) => isCompatible(arrivage, besoin))
      .map((arrivage) => ({
        id: `${arrivage.id}-${besoin.id}`,
        arrivageId: arrivage.id,
        besoinId: besoin.id,
        espece: besoin.espece,
        quantite: besoin.quantite,
        lieu: arrivage.quai,
        vendeur: arrivage.vendeur ?? `Vendeur ${arrivage.quai}`,
        acheteur: besoin.acheteur ?? `Acheteur ${besoin.quai}`,
        quantiteDisponible: arrivage.quantite,
        quantiteDemandee: besoin.quantite,
        scoreCompatibilite: calculateScore(arrivage, besoin),
        statut: "Correspondance trouvée" as const,
        raisons: [
          `Meme espece detectee : ${besoin.espece}.`,
          `Quantite disponible suffisante : ${arrivage.quantite} pour ${besoin.quantite} demandes.`,
          `Point de coordination propose : ${arrivage.quai}.`
        ],
        offre: {
          id: arrivage.id,
          quai: arrivage.quai,
          vendeur: arrivage.vendeur ?? `Vendeur ${arrivage.quai}`,
          quantite: arrivage.quantite,
          heureDebarquement: arrivage.heureDebarquement,
          statut: arrivage.statut
        },
        besoin: {
          id: besoin.id,
          quai: besoin.quai,
          acheteur: besoin.acheteur ?? `Acheteur ${besoin.quai}`,
          quantite: besoin.quantite,
          urgence: besoin.urgence,
          commentaire: besoin.commentaire
        }
      }))
  );
}

export function createMatchingSummary(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], misesEnRelationCreees = 0): MatchingSummary {
  const besoinsCouverts = new Set(opportunites.map((opportunite) => opportunite.besoinId)).size;

  return {
    nombreOpportunites: opportunites.length,
    tauxCouvertureBesoins: besoins.length === 0 ? 0 : Math.round((besoinsCouverts / besoins.length) * 100),
    arrivagesDisponibles: arrivages.length,
    misesEnRelationCreees
  };
}

export function findOpportuniteById(opportunites: Opportunite[], id: string) {
  return opportunites.find((opportunite) => opportunite.id === id);
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

function calculateScore(arrivage: Arrivage, besoin: Besoin) {
  const disponible = parseQuantiteEnKg(arrivage.quantite);
  const demandee = parseQuantiteEnKg(besoin.quantite);

  if (disponible <= 0 || demandee <= 0) return 90;

  const surplusRatio = Math.max(0, (disponible - demandee) / disponible);

  return Math.max(90, Math.round(98 - surplusRatio * 10));
}
