import type { Arrivage } from "@/lib/arrivages";
import type { NotificationMetier } from "@/lib/notifications";
import type { Opportunite, Transaction, TransactionStatus } from "@/lib/coordination";
import { getEspeceReference, getQuaiReference } from "@/lib/reference";

export type TraceabilityEventType =
  | "Arrivage déclaré"
  | "Opportunité détectée"
  | "Lot réservé"
  | "Transaction créée"
  | "Transaction en préparation"
  | "Transaction en cours de retrait"
  | "Transaction terminée"
  | "Notification envoyée";

export type TraceabilityEvent = {
  id: string;
  type: TraceabilityEventType;
  date: string;
  titre: string;
  description: string;
  module: string;
};

export type TraceableLot = {
  lotId: string;
  arrivageId: string;
  espece: string;
  categorieEspece: string;
  quai: string;
  region: string;
  quantite: string;
  heureArrivee: string;
  statutActuel: string;
  opportuniteLiee?: Opportunite;
  transactionLiee?: Transaction;
  historique: TraceabilityEvent[];
};

export function computeTraceability(
  arrivages: Arrivage[],
  opportunites: Opportunite[],
  transactions: Transaction[] = [],
  notifications: NotificationMetier[] = []
): TraceableLot[] {
  return arrivages.map((arrivage, index) => {
    const linkedOpportunities = opportunites.filter((opportunite) => opportunite.arrivageId === arrivage.id);
    const opportuniteLiee = linkedOpportunities[0];
    const transactionLiee = transactions.find((transaction) => linkedOpportunities.some((opportunite) => opportunite.id === transaction.opportuniteId));

    return {
      lotId: createLotId(arrivage, index),
      arrivageId: arrivage.id,
      espece: arrivage.espece,
      categorieEspece: getEspeceReference(arrivage.espece)?.categorie ?? "Espèce pilote",
      quai: arrivage.quai,
      region: getQuaiReference(arrivage.quai)?.region ?? "Zone pilote",
      quantite: arrivage.quantite,
      heureArrivee: arrivage.heureDebarquement,
      statutActuel: computeCurrentStatus(arrivage, opportuniteLiee, transactionLiee),
      opportuniteLiee,
      transactionLiee,
      historique: buildTraceEvents(arrivage, linkedOpportunities, transactionLiee, notifications)
    };
  });
}

export function findTraceableLotByOpportunityId(lots: TraceableLot[], opportunityId: string) {
  return lots.find((lot) => lot.opportuniteLiee?.id === opportunityId);
}

export function computeTraceableLotForOpportunity(opportunite: Opportunite, transactionStatus?: TransactionStatus | null) {
  const transaction = transactionStatus
    ? [
        {
          id: `trx-${opportunite.id}`,
          opportuniteId: opportunite.id,
          statut: transactionStatus,
          espece: opportunite.espece,
          quai: opportunite.lieu,
          quantite: opportunite.quantiteDemandee,
          date: new Date(Date.UTC(2026, 5, 27, 12, 45)).toISOString(),
          acteurReserve: "Transformateur pilote"
        }
      ]
    : [];

  return computeTraceability(
    [
      {
        id: opportunite.arrivageId,
        espece: opportunite.espece,
        quai: opportunite.offre.quai,
        quantite: opportunite.offre.quantite,
        heureDebarquement: opportunite.offre.heureDebarquement,
        vendeur: opportunite.offre.vendeur,
        statut: opportunite.offre.statut as Arrivage["statut"]
      }
    ],
    [opportunite],
    transaction
  )[0];
}

export function createLotId(arrivage: Arrivage, index: number) {
  const quaiCode = slugify(arrivage.quai).split("-")[0]?.toUpperCase() || "LOT";
  return `MBA-${quaiCode}-2026-${String(index + 1).padStart(4, "0")}`;
}

function computeCurrentStatus(arrivage: Arrivage, opportunite?: Opportunite, transaction?: Transaction) {
  if (transaction?.statut === "Terminée") return "Livré";
  if (transaction) return transaction.statut;
  if (opportunite?.statut === "Réservée") return "Réservé";
  if (opportunite) return "Opportunité détectée";
  return arrivage.statut;
}

function buildTraceEvents(arrivage: Arrivage, opportunites: Opportunite[], transaction: Transaction | undefined, notifications: NotificationMetier[]) {
  const events: TraceabilityEvent[] = [
    {
      id: `${arrivage.id}-arrivage`,
      type: "Arrivage déclaré",
      date: createTraceDate(0, arrivage.heureDebarquement),
      titre: "Arrivage déclaré",
      description: `${arrivage.quantite} de ${arrivage.espece} déclarés à ${arrivage.quai}.`,
      module: "Arrivages"
    }
  ];

  opportunites.forEach((opportunite, index) => {
    events.push({
      id: `${opportunite.id}-opportunite`,
      type: "Opportunité détectée",
      date: createTraceDate(index + 8, arrivage.heureDebarquement),
      titre: "Opportunité détectée",
      description: `${opportunite.acheteur} peut être mis en relation avec ${opportunite.vendeur}.`,
      module: "Opportunités"
    });
  });

  if (transaction) {
    events.push({
      id: `${transaction.id}-reserve`,
      type: "Lot réservé",
      date: transaction.date,
      titre: "Lot réservé",
      description: `${transaction.acteurReserve} réserve ${transaction.quantite}.`,
      module: "Opportunités"
    });
    events.push({
      id: `${transaction.id}-created`,
      type: "Transaction créée",
      date: createTraceDate(2, transaction.date),
      titre: "Transaction créée",
      description: `Transaction ouverte au statut ${transaction.statut}.`,
      module: "Transactions"
    });

    transactionWorkflowEvents(transaction.statut).forEach((type, index) => {
      events.push({
        id: `${transaction.id}-${slugify(type)}`,
        type,
        date: createTraceDate(index + 5, transaction.date),
        titre: type,
        description: `${transaction.espece} suit le statut ${type.toLowerCase()}.`,
        module: "Transactions"
      });
    });
  }

  notifications
    .filter((notification) => notification.description.toLowerCase().includes(arrivage.espece.toLowerCase()) || notification.description.toLowerCase().includes(arrivage.quai.toLowerCase()))
    .slice(0, 3)
    .forEach((notification) => {
      events.push({
        id: `${arrivage.id}-${notification.id}`,
        type: "Notification envoyée",
        date: notification.date,
        titre: notification.titre,
        description: notification.description,
        module: "Notifications"
      });
    });

  return events.sort((first, second) => first.date.localeCompare(second.date));
}

function transactionWorkflowEvents(status: TransactionStatus): TraceabilityEventType[] {
  const events: TraceabilityEventType[] = ["Transaction en préparation", "Transaction en cours de retrait", "Transaction terminée"];

  if (status === "Réservée") return [];
  if (status === "En préparation") return events.slice(0, 1);
  if (status === "En cours de retrait") return events.slice(0, 2);
  if (status === "Terminée") return events;
  return [];
}

function createTraceDate(offsetMinutes: number, timeOrIso = "12:00") {
  const isIso = timeOrIso.includes("T");
  const date = isIso ? new Date(timeOrIso) : new Date(Date.UTC(2026, 5, 27, ...parseTime(timeOrIso)));
  date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
  return date.toISOString();
}

function parseTime(value: string): [number, number] {
  const [hours, minutes] = value.split(":").map(Number);
  return [hours || 12, minutes || 0];
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
