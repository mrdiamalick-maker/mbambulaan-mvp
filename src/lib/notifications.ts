import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { DashboardData, Opportunite, Transaction } from "@/lib/coordination";

export type NotificationLevel = "info" | "succès" | "attention";

export type NotificationType = "arrivage" | "besoin" | "opportunite" | "couverture" | "demande" | "quai" | "reservation" | "transaction";

export type NotificationMetier = {
  id: string;
  type: NotificationType;
  titre: string;
  description: string;
  date: string;
  niveau: NotificationLevel;
  lu: boolean;
  lien: string;
};

export const notificationStorageKey = "mbambulaan:notifications-lues";

export function createNotifications(
  arrivages: Arrivage[],
  besoins: Besoin[],
  opportunites: Opportunite[],
  dashboardData: DashboardData
): NotificationMetier[] {
  const notifications = [
    ...createArrivageNotifications(arrivages),
    ...createBesoinNotifications(besoins),
    ...createOpportuniteNotifications(opportunites),
    ...createCoverageNotifications(besoins, opportunites),
    ...createSpeciesNotifications(dashboardData),
    ...createQuaiNotifications(dashboardData)
  ];

  return notifications.sort((first, second) => second.date.localeCompare(first.date));
}

export function countUnreadNotifications(notifications: NotificationMetier[]) {
  return notifications.filter((notification) => !notification.lu).length;
}

export function createReservationNotifications(opportunites: Opportunite[], reservedOpportunityIds: string[]): NotificationMetier[] {
  return opportunites
    .filter((opportunite) => reservedOpportunityIds.includes(opportunite.id))
    .map((opportunite, index) => ({
      id: `reservation-${opportunite.id}`,
      type: "reservation" as const,
      titre: "Une opportunite vient d'etre reservee",
      description: `${opportunite.quantiteDemandee} de ${opportunite.espece} sont reserves par un transformateur.`,
      date: createNotificationDate(index + 48),
      niveau: "succès" as const,
      lu: false,
      lien: `/opportunites/${opportunite.id}`
    }));
}

export function createTransactionNotifications(transactions: Transaction[]): NotificationMetier[] {
  return transactions.map((transaction, index) => ({
    id: `transaction-${transaction.opportuniteId}-${slugify(transaction.statut)}`,
    type: "transaction" as const,
    titre: "Statut de transaction mis a jour",
    description: `${transaction.espece} sur ${transaction.quai} passe au statut ${transaction.statut}.`,
    date: createNotificationDate(index + 56),
    niveau: transaction.statut === "Terminée" ? ("succès" as const) : ("info" as const),
    lu: false,
    lien: `/opportunites/${transaction.opportuniteId}`
  }));
}

function createArrivageNotifications(arrivages: Arrivage[]): NotificationMetier[] {
  return arrivages
    .filter((arrivage) => arrivage.statut === "Disponible")
    .map((arrivage, index) => ({
      id: `arrivage-${arrivage.id}`,
      type: "arrivage" as const,
      titre: "Nouvel arrivage disponible",
      description: `${arrivage.quantite} de ${arrivage.espece} sont disponibles sur ${arrivage.quai}.`,
      date: createNotificationDate(index + 1, arrivage.heureDebarquement),
      niveau: "succès" as const,
      lu: false,
      lien: "/arrivages"
    }));
}

function createBesoinNotifications(besoins: Besoin[]): NotificationMetier[] {
  return besoins.map((besoin, index) => ({
    id: `besoin-${besoin.id}`,
    type: "besoin" as const,
    titre: "Un besoin vient d'etre publie",
    description: `${besoin.acheteur ?? "Un mareyeur"} recherche ${besoin.quantite} de ${besoin.espece} sur ${besoin.quai}.`,
    date: createNotificationDate(index + 8),
    niveau: besoin.urgence === "Haute" ? ("attention" as const) : ("info" as const),
    lu: false,
    lien: "/besoins"
  }));
}

function createOpportuniteNotifications(opportunites: Opportunite[]): NotificationMetier[] {
  return opportunites.map((opportunite, index) => ({
    id: `opportunite-${opportunite.id}`,
    type: "opportunite" as const,
    titre: "Nouvelle opportunite detectee",
    description: `${opportunite.acheteur} peut etre rapproche de ${opportunite.vendeur} pour ${opportunite.quantiteDemandee} de ${opportunite.espece}.`,
    date: createNotificationDate(index + 16),
    niveau: opportunite.priorite === "Haute" ? ("attention" as const) : ("succès" as const),
    lu: false,
    lien: `/opportunites/${opportunite.id}`
  }));
}

function createCoverageNotifications(besoins: Besoin[], opportunites: Opportunite[]): NotificationMetier[] {
  return besoins
    .filter((besoin) => opportunites.some((opportunite) => opportunite.besoinId === besoin.id))
    .map((besoin, index) => ({
      id: `couverture-${besoin.id}`,
      type: "couverture" as const,
      titre: "Le besoin est entierement couvert",
      description: `${besoin.quantite} de ${besoin.espece} disposent d'au moins une correspondance compatible.`,
      date: createNotificationDate(index + 24),
      niveau: "succès" as const,
      lu: false,
      lien: "/opportunites"
    }));
}

function createSpeciesNotifications(dashboardData: DashboardData): NotificationMetier[] {
  return dashboardData.especesDemandees
    .filter((espece) => espece.ecartKg >= 0)
    .slice(0, 3)
    .map((espece, index) => ({
      id: `demande-${slugify(espece.espece)}`,
      type: "demande" as const,
      titre: "Une espece tres demandee est disponible",
      description: `${espece.espece} couvre la demande mockee avec ${espece.volumeDisponible} disponibles.`,
      date: createNotificationDate(index + 32),
      niveau: "info" as const,
      lu: false,
      lien: "/dashboard"
    }));
}

function createQuaiNotifications(dashboardData: DashboardData): NotificationMetier[] {
  return dashboardData.quaisActifs
    .filter((quai) => quai.arrivages >= 2)
    .map((quai, index) => ({
      id: `quai-${slugify(quai.quai)}`,
      type: "quai" as const,
      titre: "Un quai devient fortement actif",
      description: `${quai.quai} concentre ${quai.arrivages} arrivage(s) pour ${quai.volumeTotal}.`,
      date: createNotificationDate(index + 40),
      niveau: "attention" as const,
      lu: false,
      lien: "/quais"
    }));
}

function createNotificationDate(offsetMinutes: number, time = "12:00") {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2026, 5, 27, hours || 12, minutes || 0));
  date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
  return date.toISOString();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
