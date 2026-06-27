import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { computeImpactMetrics } from "@/lib/impact";
import type { NotificationMetier } from "@/lib/notifications";
import { computePrioritizationMetrics } from "@/lib/prioritization";
import type { BusinessPriority } from "@/lib/prioritization";
import { getTopRecommendations } from "@/lib/recommendation";
import { computeTensionMetrics } from "@/lib/tension";
import { getOpportunityTrust } from "@/lib/trust";

export type IntelligentAlertType = "besoin_critique" | "opportunite_prioritaire" | "tension_territoriale" | "confiance" | "impact";
export type IntelligentAlertLevel = "info" | "attention" | "critique";
export type IntelligentAlertStatus = "nouvelle" | "traitée";

export type IntelligentAlert = {
  id: string;
  type: IntelligentAlertType;
  titre: string;
  description: string;
  niveau: IntelligentAlertLevel;
  acteurConcerne: string;
  zoneOuQuai: string;
  lienAction: string;
  priorite: BusinessPriority;
  statut: IntelligentAlertStatus;
};

export function computeIntelligentAlerts(
  arrivages: Arrivage[],
  besoins: Besoin[],
  opportunites: Opportunite[],
  transactions: Transaction[] = [],
  notifications: NotificationMetier[] = []
): IntelligentAlert[] {
  const priorities = computePrioritizationMetrics(arrivages, besoins, opportunites, transactions);
  const tensions = computeTensionMetrics(arrivages, besoins, opportunites, transactions);
  const impact = computeImpactMetrics(arrivages, besoins, opportunites, transactions);
  const alerts: IntelligentAlert[] = [];

  const coveredNeedIds = new Set(opportunites.map((opportunite) => opportunite.besoinId));
  priorities.besoinsPriorises
    .filter((item) => item.besoin.urgence === "Haute" && !coveredNeedIds.has(item.besoin.id))
    .slice(0, 3)
    .forEach((item) => {
      alerts.push({
        id: `besoin-critique-${item.id}`,
        type: "besoin_critique",
        titre: `Besoin urgent non couvert à ${item.besoin.quai}`,
        description: `Besoin urgent non couvert pour ${item.besoin.quantite} de ${item.besoin.espece} à ${item.besoin.quai}.`,
        niveau: item.priorite === "Critique" ? "critique" : "attention",
        acteurConcerne: item.besoin.acheteur ?? "Mareyeur",
        zoneOuQuai: item.besoin.quai,
        lienAction: "/besoins",
        priorite: item.priorite,
        statut: "nouvelle"
      });
    });

  priorities.opportunitesPriorisees.slice(0, 3).forEach((item) => {
    alerts.push({
      id: `opportunite-prioritaire-${item.id}`,
      type: "opportunite_prioritaire",
      titre: `Opportunité à fort impact disponible à ${item.opportunite.lieu}`,
      description: `${item.opportunite.quantiteDemandee} de ${item.opportunite.espece} peuvent être traités avec une priorité ${item.priorite.toLowerCase()}.`,
      niveau: item.priorite === "Critique" ? "critique" : "attention",
      acteurConcerne: item.opportunite.acheteur,
      zoneOuQuai: item.opportunite.lieu,
      lienAction: `/opportunites/${item.opportunite.id}`,
      priorite: item.priorite,
      statut: "nouvelle"
    });
  });

  tensions.zonesPrioritaires
    .filter((zone) => zone.niveau === "Critique" || zone.niveau === "Forte")
    .slice(0, 3)
    .forEach((zone) => {
      alerts.push({
        id: `tension-territoriale-${slugify(zone.quai)}`,
        type: "tension_territoriale",
        titre: `Tension ${zone.niveau.toLowerCase()} détectée à ${zone.quai}`,
        description: zone.raison,
        niveau: zone.niveau === "Critique" ? "critique" : "attention",
        acteurConcerne: "Collectivité",
        zoneOuQuai: zone.quai,
        lienAction: "/quais",
        priorite: zone.niveau === "Critique" ? "Critique" : "Haute",
        statut: "nouvelle"
      });
    });

  getTopRecommendations(opportunites, 6)
    .filter((opportunite) => getOpportunityTrust(opportunite).scoreMoyen < 65)
    .slice(0, 2)
    .forEach((opportunite) => {
      const trust = getOpportunityTrust(opportunite);

      alerts.push({
        id: `confiance-${opportunite.id}`,
        type: "confiance",
        titre: "Acteur à vérifier avant réservation",
        description: `${opportunite.acheteur} et ${opportunite.vendeur} ont un score moyen de confiance de ${trust.scoreMoyen}%.`,
        niveau: "attention",
        acteurConcerne: trust.scoreMoyen < 65 ? opportunite.acheteur : opportunite.vendeur,
        zoneOuQuai: opportunite.lieu,
        lienAction: `/opportunites/${opportunite.id}`,
        priorite: "Haute",
        statut: "nouvelle"
      });
    });

  if (impact.poissonSauveKg > 0 || impact.volumeValoriseKg > 0) {
    alerts.push({
      id: "impact-volume-valorisable",
      type: "impact",
      titre: "Volume valorisable aujourd'hui",
      description: `${impact.poissonSauve} peuvent être valorisés aujourd'hui si les opportunités prioritaires sont traitées.`,
      niveau: "info",
      acteurConcerne: "Administrateur",
      zoneOuQuai: impact.quaisImpactes[0]?.quai ?? "Tous les quais",
      lienAction: "/dashboard",
      priorite: impact.poissonSauveKg >= 1000 ? "Haute" : "Moyenne",
      statut: "nouvelle"
    });
  }

  const notificationAttentionCount = notifications.filter((notification) => notification.niveau === "attention" && !notification.lu).length;
  if (notificationAttentionCount >= 3) {
    alerts.push({
      id: "notifications-attention",
      type: "impact",
      titre: "Plusieurs signaux métier attendent une action",
      description: `${notificationAttentionCount} notifications d'attention sont ouvertes dans le centre de coordination.`,
      niveau: "attention",
      acteurConcerne: "Administrateur",
      zoneOuQuai: "Plateforme",
      lienAction: "/notifications",
      priorite: "Moyenne",
      statut: "nouvelle"
    });
  }

  return dedupeAlerts(alerts).sort((first, second) => priorityRank(second.priorite) - priorityRank(first.priorite));
}

export function createAlertNotifications(alerts: IntelligentAlert[]): NotificationMetier[] {
  return alerts
    .filter((alert) => alert.niveau === "critique")
    .map((alert, index) => ({
      id: `alerte-${alert.id}`,
      type: "quai" as const,
      titre: alert.titre,
      description: alert.description,
      date: createAlertDate(index),
      niveau: "attention" as const,
      lu: false,
      lien: alert.lienAction
    }));
}

export function getAlertTone(level: IntelligentAlertLevel) {
  if (level === "critique") return "critical";
  if (level === "attention") return "high";
  return "info";
}

function dedupeAlerts(alerts: IntelligentAlert[]) {
  return Array.from(new Map(alerts.map((alert) => [alert.id, alert])).values());
}

function priorityRank(priority: BusinessPriority) {
  if (priority === "Critique") return 4;
  if (priority === "Haute") return 3;
  if (priority === "Moyenne") return 2;
  return 1;
}

function createAlertDate(offsetMinutes: number) {
  const date = new Date(Date.UTC(2026, 5, 27, 13, 0));
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
