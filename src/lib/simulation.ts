import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";
import type { Opportunite, Transaction } from "@/lib/coordination";
import type { NotificationMetier } from "@/lib/notifications";

export const coordinationSimulationStorageKey = "mbambulaan:coordination-simulation";

export type ActivityEvent = {
  id: string;
  time: string;
  label: string;
};

export type CoordinationSimulation = {
  arrivages: Arrivage[];
  besoins: Besoin[];
  opportunites: Opportunite[];
  notifications: NotificationMetier[];
  transactions: Transaction[];
  activity: ActivityEvent[];
};

export function createCoordinationSimulation(baseArrivages: Arrivage[], baseBesoins: Besoin[]): CoordinationSimulation {
  const simulatedArrivages: Arrivage[] = [
    {
      id: "sim-arr-001",
      espece: "Thiof",
      quai: "Joal",
      quantite: "250 kg",
      heureDebarquement: "08:15",
      vendeur: "Pêcheur A",
      statut: "Disponible"
    }
  ];
  const simulatedBesoins: Besoin[] = [
    {
      id: "sim-bes-001",
      espece: "Thiof",
      quai: "Joal",
      quantite: "200 kg",
      urgence: "Haute",
      acheteur: "Mareyeur Démo",
      commentaire: "Besoin prioritaire pour démonstration de coordination."
    }
  ];
  const opportunites = computeMatching([...simulatedArrivages, ...baseArrivages], [...simulatedBesoins, ...baseBesoins]).filter(
    (opportunite) => opportunite.arrivageId.startsWith("sim-") || opportunite.besoinId.startsWith("sim-")
  );
  const primaryOpportunity = opportunites[0];
  const transactions: Transaction[] = primaryOpportunity
    ? [
        {
          id: `trx-${primaryOpportunity.id}`,
          opportuniteId: primaryOpportunity.id,
          statut: "Terminée",
          espece: primaryOpportunity.espece,
          quai: primaryOpportunity.lieu,
          quantite: primaryOpportunity.quantiteDemandee,
          date: "2026-06-27T08:30:00.000Z",
          acteurReserve: "Mareyeur Démo"
        }
      ]
    : [];

  return {
    arrivages: simulatedArrivages,
    besoins: simulatedBesoins,
    opportunites,
    transactions,
    notifications: [
      {
        id: "sim-notif-arrivage",
        type: "arrivage",
        titre: "Nouvel arrivage",
        description: "Le pêcheur A déclare 250 kg de Thiof sur le quai de Joal.",
        date: "2026-06-27T08:15:00.000Z",
        niveau: "succès",
        lu: false,
        lien: "/arrivages"
      },
      {
        id: "sim-notif-besoin",
        type: "besoin",
        titre: "Besoin urgent",
        description: "Un besoin compatible de 200 kg de Thiof est prioritaire.",
        date: "2026-06-27T08:18:00.000Z",
        niveau: "attention",
        lu: false,
        lien: "/besoins"
      },
      {
        id: "sim-notif-reservation",
        type: "reservation",
        titre: "Réservation",
        description: "Le mareyeur réserve le lot détecté par Mbàmbulaan.",
        date: "2026-06-27T08:20:00.000Z",
        niveau: "succès",
        lu: false,
        lien: "/opportunites"
      },
      {
        id: "sim-notif-transaction",
        type: "transaction",
        titre: "Transaction terminée",
        description: "La transaction de démonstration est terminée.",
        date: "2026-06-27T08:30:00.000Z",
        niveau: "succès",
        lu: false,
        lien: "/transactions"
      }
    ],
    activity: [
      { id: "sim-act-1", time: "08:15", label: "Le pêcheur A déclare 250 kg." },
      { id: "sim-act-2", time: "08:20", label: "Le mareyeur réserve." },
      { id: "sim-act-3", time: "08:24", label: "Notification envoyée." },
      { id: "sim-act-4", time: "08:30", label: "Transaction terminée." }
    ]
  };
}

export function parseCoordinationSimulation(value: string | null): CoordinationSimulation | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as CoordinationSimulation;
    if (!parsed || !Array.isArray(parsed.arrivages) || !Array.isArray(parsed.besoins)) return null;
    return parsed;
  } catch {
    return null;
  }
}
