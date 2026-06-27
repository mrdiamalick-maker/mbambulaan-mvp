import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeIntelligentAlerts } from "@/lib/alerts";
import type { NotificationMetier } from "@/lib/notifications";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { computeImpactMetrics } from "@/lib/impact";
import { computePrioritizationMetrics } from "@/lib/prioritization";
import { computeSensitiveLots } from "@/lib/quality";
import { getQuaiReference } from "@/lib/reference";
import { computeRoleRecommendations } from "@/lib/roleRecommendations";
import { getRecommendedActors } from "@/lib/trust";
import { computeTensionMetrics, type TensionLevel } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";

export type ExecutiveLevel = "info" | "attention" | "critique";
export type ExecutiveMetric = { label: string; value: string; detail: string };
export type ExecutiveDecision = { id: string; titre: string; description: string; niveau: ExecutiveLevel; actionRecommandee: string; moduleCible: string; lienMetier: string; quai: string; impactAttendu: string };
export type ExecutiveTerritoryItem = { quai: string; region: string; volume: string; tension: TensionLevel; risque: ExecutiveLevel; impact: string };
export type ExecutiveRisk = { id: string; titre: string; description: string; niveau: ExecutiveLevel; lienMetier: string; quai: string };
export type ExecutiveSummary = {
  resumeExecutif: ExecutiveMetric[];
  decisionsRecommandees: ExecutiveDecision[];
  lectureTerritoriale: { quaisLesPlusActifs: ExecutiveTerritoryItem[]; quaisLesPlusSousTension: ExecutiveTerritoryItem[]; quaisARisque: ExecutiveTerritoryItem[]; quaisAFortImpact: ExecutiveTerritoryItem[] };
  lectureImpact: ExecutiveMetric[];
  risquesExecutifs: ExecutiveRisk[];
};

type ExecutiveContext = { arrivages: Arrivage[]; besoins: Besoin[]; opportunites: Opportunite[]; transactions?: Transaction[]; notifications?: NotificationMetier[] };

export function computeExecutiveSummary({ arrivages, besoins, opportunites, transactions = [], notifications = [] }: ExecutiveContext): ExecutiveSummary {
  const impact = computeImpactMetrics(arrivages, besoins, opportunites, transactions);
  const tensions = computeTensionMetrics(arrivages, besoins, opportunites, transactions);
  const priorities = computePrioritizationMetrics(arrivages, besoins, opportunites, transactions);
  const alerts = computeIntelligentAlerts(arrivages, besoins, opportunites, transactions);
  const lots = computeTraceability(arrivages, opportunites, transactions, notifications);
  const sensitiveLots = computeSensitiveLots(arrivages, { besoins, opportunites, transactions });
  const recommendations = computeRoleRecommendations({ arrivages, besoins, opportunites, transactions, notifications });
  const recommendedActors = getRecommendedActors().slice(0, 4);
  const totalVolumeKg = sumQuantities(arrivages.map((arrivage) => arrivage.quantite));
  const criticalAlerts = alerts.filter((alert) => alert.niveau === "critique");
  const tenseQuais = tensions.tensionsParQuai.filter((tension) => tension.niveau === "Forte" || tension.niveau === "Critique");
  const finishedTransactions = transactions.filter((transaction) => transaction.statut === "Terminée").length;
  const territorialItems = buildTerritorialItems(arrivages, tensions.tensionsParQuai, impact.quaisImpactes);

  return {
    resumeExecutif: [
      { label: "Volume total suivi", value: formatKg(totalVolumeKg), detail: `${lots.length} lot(s) tracés dans le MVP.` },
      { label: "Volume valorisé", value: impact.volumeValorise, detail: "Arrivages ayant trouvé une opportunité ou une transaction." },
      { label: "Valeur économique estimée", value: impact.valeurEconomique, detail: "Calculée depuis le référentiel espèces." },
      { label: "Besoins couverts", value: `${impact.besoinsCouverts}/${impact.besoinsTotal}`, detail: `${impact.tauxBesoinsCouverts}% des besoins disposent d'une couverture.` },
      { label: "Lots sensibles", value: String(sensitiveLots.length), detail: "Lots à risque qualité, tension ou non-valorisation." },
      { label: "Transactions finalisées", value: String(finishedTransactions), detail: `${transactions.length} transaction(s) suivie(s) dans la journée.` },
      { label: "Alertes critiques", value: String(criticalAlerts.length), detail: "Alertes métier nécessitant une décision rapide." },
      { label: "Quais sous tension", value: String(tenseQuais.length), detail: tenseQuais.map((tension) => tension.quai).slice(0, 3).join(", ") || "Aucun quai critique détecté." }
    ],
    decisionsRecommandees: buildExecutiveDecisions({ priorities, tensions, sensitiveLots, alerts, recommendations, transactions, recommendedActors }),
    lectureTerritoriale: {
      quaisLesPlusActifs: [...territorialItems].sort((first, second) => parseQuantity(second.volume) - parseQuantity(first.volume)).slice(0, 4),
      quaisLesPlusSousTension: [...territorialItems].sort((first, second) => tensionWeight(second.tension) - tensionWeight(first.tension)).slice(0, 4),
      quaisARisque: [...territorialItems].filter((item) => item.risque !== "info").slice(0, 4),
      quaisAFortImpact: [...territorialItems].sort((first, second) => impactWeight(second.impact) - impactWeight(first.impact)).slice(0, 4)
    },
    lectureImpact: [
      { label: "Impact économique", value: impact.valeurEconomique, detail: `${impact.volumeValorise} valorisés sur les données mock.` },
      { label: "Impact social estimé", value: `${impact.acteursImpactes} acteurs`, detail: `${impact.famillesImpactees} familles ou acteurs indirectement impactés.` },
      { label: "Impact territorial", value: `${impact.quaisImpactes.length} quais`, detail: impact.quaisImpactes.slice(0, 3).map((quai) => quai.quai).join(", ") || "Aucun quai impacté." },
      { label: "Volume sauvé du gaspillage", value: impact.poissonSauve, detail: "Volume réservé ou transactionné." },
      { label: "Acteurs à mobiliser", value: String(recommendedActors.length), detail: recommendedActors.map((actor) => actor.nom).join(", ") }
    ],
    risquesExecutifs: buildExecutiveRisks({ sensitiveLots, priorities, tensions, alerts, transactions, recommendedActors })
  };
}

function buildExecutiveDecisions({ alerts, priorities, recommendations, recommendedActors, sensitiveLots, tensions, transactions }: { priorities: ReturnType<typeof computePrioritizationMetrics>; tensions: ReturnType<typeof computeTensionMetrics>; sensitiveLots: ReturnType<typeof computeSensitiveLots>; alerts: ReturnType<typeof computeIntelligentAlerts>; recommendations: ReturnType<typeof computeRoleRecommendations>; transactions: Transaction[]; recommendedActors: ReturnType<typeof getRecommendedActors> }): ExecutiveDecision[] {
  const tenseZone = tensions.zonesPrioritaires[0];
  const criticalNeed = priorities.besoinsPriorises.find((besoin) => besoin.priorite === "Critique" || besoin.priorite === "Haute");
  const priorityOpportunity = priorities.opportunitesPriorisees.find((opportunite) => opportunite.priorite === "Critique" || opportunite.priorite === "Haute");
  const sensitiveLot = sensitiveLots[0];
  const activeTransaction = transactions.find((transaction) => transaction.statut !== "Terminée" && transaction.statut !== "Annulée");
  const criticalAlert = alerts.find((alert) => alert.niveau === "critique");
  const roleRecommendation = recommendations.find((recommendation) => recommendation.niveau !== "info");
  const actor = recommendedActors[0];
  const decisions: (ExecutiveDecision | false | null | undefined)[] = [
    tenseZone && { id: "decision-renforcer-quai", titre: `Renforcer ${tenseZone.quai}`, description: tenseZone.raison, niveau: levelFromTension(tenseZone.niveau), actionRecommandee: "Renforcer le quai et orienter les flux prioritaires", moduleCible: "Carte des quais", lienMetier: "/quais", quai: tenseZone.quai, impactAttendu: "Réduire la tension territoriale et fluidifier les débarquements." },
    criticalNeed && { id: "decision-besoin-critique", titre: `Suivre le besoin ${criticalNeed.besoin.espece}`, description: `${criticalNeed.besoin.quantite} demandés à ${criticalNeed.besoin.quai}.`, niveau: criticalNeed.priorite === "Critique" ? "critique" : "attention", actionRecommandee: "Traiter le besoin critique avant les demandes secondaires", moduleCible: "Besoins", lienMetier: "/besoins", quai: criticalNeed.besoin.quai, impactAttendu: criticalNeed.raisons.join(", ") },
    priorityOpportunity && { id: "decision-opportunite-prioritaire", titre: `Réserver ${priorityOpportunity.opportunite.espece}`, description: `${priorityOpportunity.opportunite.quantiteDemandee} avec ${priorityOpportunity.score}% de priorité.`, niveau: priorityOpportunity.priorite === "Critique" ? "critique" : "attention", actionRecommandee: "Réserver ou confirmer l'opportunité prioritaire", moduleCible: "Opportunités", lienMetier: `/opportunites/${priorityOpportunity.id}`, quai: priorityOpportunity.opportunite.lieu, impactAttendu: `${priorityOpportunity.valeurEconomique} estimés.` },
    sensitiveLot && { id: "decision-lot-sensible", titre: `Sécuriser ${sensitiveLot.lotId}`, description: `${sensitiveLot.espece} à ${sensitiveLot.quai} présente un risque ${sensitiveLot.risqueGaspillage.toLowerCase()}.`, niveau: sensitiveLot.risqueGaspillage === "Critique" ? "critique" : "attention", actionRecommandee: sensitiveLot.actionRecommandee, moduleCible: "Arrivages", lienMetier: "/arrivages", quai: sensitiveLot.quai, impactAttendu: "Limiter la perte de valeur et accélérer la valorisation du lot." },
    activeTransaction && { id: "decision-transaction", titre: `Accélérer ${activeTransaction.id}`, description: `${activeTransaction.quantite} de ${activeTransaction.espece} sont au statut ${activeTransaction.statut}.`, niveau: "attention", actionRecommandee: "Accélérer la transaction", moduleCible: "Transactions", lienMetier: "/transactions", quai: activeTransaction.quai, impactAttendu: "Transformer une réservation en transaction aboutie." },
    criticalAlert && { id: "decision-alerte", titre: criticalAlert.titre, description: criticalAlert.description, niveau: criticalAlert.niveau, actionRecommandee: "Traiter l'alerte prioritaire", moduleCible: "Notifications", lienMetier: criticalAlert.lienAction, quai: criticalAlert.zoneOuQuai, impactAttendu: "Mettre le bon acteur en action avant dégradation." },
    roleRecommendation && { id: "decision-role", titre: roleRecommendation.titre, description: roleRecommendation.description, niveau: roleRecommendation.niveau === "critique" ? "critique" : "attention", actionRecommandee: roleRecommendation.actionRecommandee, moduleCible: roleRecommendation.moduleCible, lienMetier: roleRecommendation.lienMetier, quai: roleRecommendation.quai, impactAttendu: roleRecommendation.impactAttendu },
    actor && { id: "decision-acteur", titre: `Mobiliser ${actor.nom}`, description: `${actor.type} recommandé sur ${actor.zone} avec un score de confiance de ${actor.scoreConfiance}%.`, niveau: actor.scoreConfiance >= 85 ? "info" : "attention", actionRecommandee: "Mobiliser l'acteur compatible", moduleCible: "Espaces", lienMetier: "/espaces", quai: actor.zone, impactAttendu: "Appuyer la mise en relation avec un acteur fiable." }
  ];
  return compact(decisions).slice(0, 7);
}

function buildTerritorialItems(arrivages: Arrivage[], tensions: ReturnType<typeof computeTensionMetrics>["tensionsParQuai"], impacts: ReturnType<typeof computeImpactMetrics>["quaisImpactes"]): ExecutiveTerritoryItem[] {
  const byQuai = new Map<string, { volumeKg: number; count: number }>();
  arrivages.forEach((arrivage) => {
    const current = byQuai.get(arrivage.quai) ?? { volumeKg: 0, count: 0 };
    current.volumeKg += parseQuantity(arrivage.quantite);
    current.count += 1;
    byQuai.set(arrivage.quai, current);
  });
  return Array.from(byQuai.entries()).map(([quai, stats]) => {
    const tension = tensions.find((item) => sameValue(item.quai, quai));
    const impact = impacts.find((item) => sameValue(item.quai, quai));
    return { quai, region: getQuaiReference(quai)?.region ?? "Zone pilote", volume: formatKg(stats.volumeKg), tension: tension?.niveau ?? "Faible", risque: levelFromTension(tension?.niveau ?? "Faible"), impact: impact ? `${impact.volumeValorise} valorisés` : `${stats.count} arrivage(s) suivis` };
  });
}

function buildExecutiveRisks({ alerts, priorities, recommendedActors, sensitiveLots, tensions, transactions }: { sensitiveLots: ReturnType<typeof computeSensitiveLots>; priorities: ReturnType<typeof computePrioritizationMetrics>; tensions: ReturnType<typeof computeTensionMetrics>; alerts: ReturnType<typeof computeIntelligentAlerts>; transactions: Transaction[]; recommendedActors: ReturnType<typeof getRecommendedActors> }): ExecutiveRisk[] {
  const sensitiveLot = sensitiveLots.find((lot) => lot.risqueGaspillage === "Critique" || lot.score < 65);
  const criticalNeed = priorities.besoinsPriorises.find((besoin) => besoin.priorite === "Critique");
  const criticalTension = tensions.tensionsParQuai.find((tension) => tension.niveau === "Critique");
  const blockedTransaction = transactions.find((transaction) => transaction.statut === "En préparation" || transaction.statut === "En cours de retrait");
  const actorToWatch = recommendedActors.find((actor) => actor.scoreConfiance < 85);
  const criticalAlert = alerts.find((alert) => alert.niveau === "critique");
  const risks: (ExecutiveRisk | false | null | undefined)[] = [
    sensitiveLot && { id: "risk-sensitive-lot", titre: "Lot sensible non traité", description: `${sensitiveLot.lotId} doit être sécurisé : ${sensitiveLot.actionRecommandee}.`, niveau: sensitiveLot.risqueGaspillage === "Critique" ? "critique" : "attention", lienMetier: "/arrivages", quai: sensitiveLot.quai },
    criticalNeed && { id: "risk-critical-need", titre: "Besoin critique non couvert", description: `${criticalNeed.besoin.quantite} de ${criticalNeed.besoin.espece} demandés à ${criticalNeed.besoin.quai}.`, niveau: "critique", lienMetier: "/besoins", quai: criticalNeed.besoin.quai },
    criticalTension && { id: "risk-territory", titre: "Tension territoriale élevée", description: `${criticalTension.volumeDemande} demandés pour ${criticalTension.volumeDisponible} disponibles.`, niveau: "critique", lienMetier: "/quais", quai: criticalTension.quai },
    sensitiveLot && sensitiveLot.score < 70 && { id: "risk-quality", titre: "Qualité de lot dégradée", description: `${sensitiveLot.espece} affiche ${sensitiveLot.score}% qualité et un risque ${sensitiveLot.risqueGaspillage.toLowerCase()}.`, niveau: "attention", lienMetier: "/arrivages", quai: sensitiveLot.quai },
    blockedTransaction && { id: "risk-transaction", titre: "Transaction à accélérer", description: `${blockedTransaction.id} est encore au statut ${blockedTransaction.statut}.`, niveau: "attention", lienMetier: "/transactions", quai: blockedTransaction.quai },
    actorToWatch && { id: "risk-trust", titre: "Confiance acteur à surveiller", description: `${actorToWatch.nom} doit être vérifié avant mobilisation prioritaire.`, niveau: "attention", lienMetier: "/espaces", quai: actorToWatch.zone },
    criticalAlert && { id: "risk-alert", titre: criticalAlert.titre, description: criticalAlert.description, niveau: "critique", lienMetier: criticalAlert.lienAction, quai: criticalAlert.zoneOuQuai }
  ];
  return compact(risks).slice(0, 6);
}

function compact<T>(items: (T | false | null | undefined)[]) { return items.filter(Boolean) as T[]; }
function levelFromTension(level: TensionLevel): ExecutiveLevel { if (level === "Critique") return "critique"; if (level === "Forte" || level === "Moyenne") return "attention"; return "info"; }
function tensionWeight(level: TensionLevel) { if (level === "Critique") return 4; if (level === "Forte") return 3; if (level === "Moyenne") return 2; return 1; }
function impactWeight(value: string) { return parseQuantity(value.replace(" valorisés", "")); }
function sumQuantities(values: string[]) { return values.reduce((total, value) => total + parseQuantity(value), 0); }
function parseQuantity(value: string) { const normalized = value.trim().toLowerCase().replace(",", "."); const amount = Number.parseFloat(normalized); if (Number.isNaN(amount)) return 0; return normalized.includes("t") ? amount * 1000 : amount; }
function formatKg(value: number) { if (value >= 1000) { const tonnes = value / 1000; return `${Number.isInteger(tonnes) ? tonnes : tonnes.toFixed(1).replace(".", ",")} t`; } return `${Math.round(value)} kg`; }
function sameValue(first: string, second: string) { return normalize(first) === normalize(second); }
function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase(); }
