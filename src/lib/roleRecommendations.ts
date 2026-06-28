import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeIntelligentAlerts } from "@/lib/alerts";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { computeDaySimulation } from "@/lib/daySimulation";
import { computeImpactMetrics } from "@/lib/impact";
import type { NotificationMetier } from "@/lib/notifications";
import { computePrioritizationMetrics } from "@/lib/prioritization";
import { computeSensitiveLots } from "@/lib/quality";
import { computeTensionMetrics } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";

export type RoleRecommendationRole = "Pêcheur" | "Mareyeur" | "Transformateur" | "Collectivité" | "Administration";
export type RoleRecommendationLevel = "info" | "important" | "critique";

export type RoleRecommendation = {
  id: string;
  role: RoleRecommendationRole;
  titre: string;
  description: string;
  niveau: RoleRecommendationLevel;
  actionRecommandee: string;
  moduleCible: string;
  lienMetier: string;
  quai: string;
  espece: string;
  impactAttendu: string;
};

type RecommendationContext = {
  arrivages: Arrivage[];
  besoins: Besoin[];
  opportunites: Opportunite[];
  transactions?: Transaction[];
  notifications?: NotificationMetier[];
};

export function computeRoleRecommendations({ arrivages, besoins, notifications = [], opportunites, transactions = [] }: RecommendationContext): RoleRecommendation[] {
  const sensitiveLots = computeSensitiveLots(arrivages, { besoins, opportunites, transactions });
  const tensions = computeTensionMetrics(arrivages, besoins, opportunites, transactions);
  const priorities = computePrioritizationMetrics(arrivages, besoins, opportunites, transactions);
  const impact = computeImpactMetrics(arrivages, besoins, opportunites, transactions);
  const alerts = computeIntelligentAlerts(arrivages, besoins, opportunites, transactions, notifications);
  const traceability = computeTraceability(arrivages, opportunites, transactions, notifications);
  const daySimulation = computeDaySimulation(arrivages, besoins, opportunites);

  const sensitiveLot = sensitiveLots[0];
  const priorityOpportunity = priorities.opportunitesPriorisees[0]?.opportunite ?? opportunites[0];
  const priorityNeed = priorities.besoinsPriorises[0]?.besoin ?? besoins[0];
  const tension = tensions.zonesPrioritaires[0];
  const impactQuai = impact.quaisImpactes[0];
  const alert = alerts[0];
  const traceableLot = traceability.find((lot) => lot.transactionLiee) ?? traceability[0];
  const dayEvent = daySimulation.criticalEvents[0] ?? daySimulation.events[0];
  const fallbackQuai = sensitiveLot?.quai ?? priorityOpportunity?.lieu ?? priorityNeed?.quai ?? tension?.quai ?? "Kayar";
  const fallbackEspece = sensitiveLot?.espece ?? priorityOpportunity?.espece ?? priorityNeed?.espece ?? "Sardinelle ronde";

  return [
    {
      id: "pecheur-lot-sensible",
      role: "Pêcheur",
      titre: "Déclarer rapidement un lot sensible",
      description: sensitiveLot ? `${sensitiveLot.lotId} demande une action : ${sensitiveLot.actionRecommandee.toLowerCase()}.` : "Aucun risque critique, mais la déclaration rapide reste prioritaire.",
      niveau: sensitiveLot?.risqueGaspillage === "Critique" ? "critique" : "important",
      actionRecommandee: sensitiveLot?.actionRecommandee ?? "Déclarer le prochain lot dès débarquement",
      moduleCible: "Arrivages",
      lienMetier: "/arrivages",
      quai: sensitiveLot?.quai ?? fallbackQuai,
      espece: sensitiveLot?.espece ?? fallbackEspece,
      impactAttendu: "Réduire le risque de perte et accélérer les réservations."
    },
    {
      id: "pecheur-transaction",
      role: "Pêcheur",
      titre: "Suivre une transaction en cours",
      description: traceableLot ? `${traceableLot.lotId} possède ${traceableLot.historique.length} événement(s) de suivi.` : "Un lot suivi permet de prouver le parcours jusqu'à la livraison.",
      niveau: traceableLot?.transactionLiee ? "important" : "info",
      actionRecommandee: "Consulter la traçabilité du lot",
      moduleCible: "Transactions",
      lienMetier: traceableLot?.opportuniteLiee ? `/opportunites/${traceableLot.opportuniteLiee.id}#tracabilite` : "/transactions",
      quai: traceableLot?.quai ?? fallbackQuai,
      espece: traceableLot?.espece ?? fallbackEspece,
      impactAttendu: "Sécuriser la relation avec l'acheteur et documenter la vente."
    },
    {
      id: "mareyeur-reserver-lot",
      role: "Mareyeur",
      titre: "Réserver un lot recommandé",
      description: priorityOpportunity ? `${priorityOpportunity.quantiteDemandee} de ${priorityOpportunity.espece} sont disponibles à ${priorityOpportunity.lieu}.` : "Le moteur recherche les lots compatibles avec vos besoins.",
      niveau: priorityOpportunity?.priorite === "Haute" ? "important" : "info",
      actionRecommandee: "Réserver le lot recommandé",
      moduleCible: "Opportunités",
      lienMetier: priorityOpportunity ? `/opportunites/${priorityOpportunity.id}` : "/opportunites",
      quai: priorityOpportunity?.lieu ?? fallbackQuai,
      espece: priorityOpportunity?.espece ?? fallbackEspece,
      impactAttendu: "Sécuriser le volume avant qu'il soit réservé par un autre acteur."
    },
    {
      id: "mareyeur-quai-tension",
      role: "Mareyeur",
      titre: "Consulter un quai sous tension",
      description: tension ? `${tension.quai} affiche une tension ${tension.niveau.toLowerCase()} et ${tension.deficit} de déficit.` : "Les tensions orientent les mareyeurs vers les quais à surveiller.",
      niveau: tension?.niveau === "Critique" ? "critique" : "important",
      actionRecommandee: "Comparer les arrivages du quai",
      moduleCible: "Quais",
      lienMetier: "/quais",
      quai: tension?.quai ?? fallbackQuai,
      espece: fallbackEspece,
      impactAttendu: "Améliorer la couverture de la demande locale."
    },
    {
      id: "transformateur-surplus",
      role: "Transformateur",
      titre: "Capter un surplus à risque de perte",
      description: sensitiveLot ? `${sensitiveLot.espece} à ${sensitiveLot.quai} présente un risque ${sensitiveLot.risqueGaspillage.toLowerCase()}.` : "Les lots sensibles peuvent être orientés vers la transformation.",
      niveau: sensitiveLot?.risqueGaspillage === "Critique" ? "critique" : "important",
      actionRecommandee: "Planifier un retrait rapide",
      moduleCible: "Transactions",
      lienMetier: "/transactions",
      quai: sensitiveLot?.quai ?? fallbackQuai,
      espece: sensitiveLot?.espece ?? fallbackEspece,
      impactAttendu: "Sauver du volume et stabiliser l'approvisionnement industriel."
    },
    {
      id: "transformateur-espece-disponible",
      role: "Transformateur",
      titre: "Prioriser une espèce disponible",
      description: priorityOpportunity ? `${priorityOpportunity.espece} est disponible avec un score de recommandation élevé.` : "Les opportunités classées indiquent les espèces à prioriser.",
      niveau: "info",
      actionRecommandee: "Analyser les opportunités disponibles",
      moduleCible: "Opportunités",
      lienMetier: "/opportunites",
      quai: priorityOpportunity?.lieu ?? fallbackQuai,
      espece: priorityOpportunity?.espece ?? fallbackEspece,
      impactAttendu: "Optimiser la capacité de transformation de la journée."
    },
    {
      id: "collectivite-tension",
      role: "Collectivité",
      titre: "Surveiller une tension territoriale",
      description: tension ? `${tension.raison}` : "La carte et le dashboard signalent les zones qui nécessitent une action.",
      niveau: tension?.niveau === "Critique" ? "critique" : "important",
      actionRecommandee: "Ouvrir la carte des quais",
      moduleCible: "Quais",
      lienMetier: "/quais",
      quai: tension?.quai ?? fallbackQuai,
      espece: fallbackEspece,
      impactAttendu: "Orienter les acteurs vers les zones à soutenir."
    },
    {
      id: "collectivite-impact",
      role: "Collectivité",
      titre: "Suivre l'impact de la journée",
      description: `${impact.volumeValorise} valorisés pour ${impact.valeurEconomique}.`,
      niveau: "info",
      actionRecommandee: "Consulter les indicateurs d'impact",
      moduleCible: "Dashboard",
      lienMetier: "/dashboard",
      quai: impactQuai?.quai ?? fallbackQuai,
      espece: fallbackEspece,
      impactAttendu: `${impact.poissonSauve} potentiellement sauvés du gaspillage.`
    },
    {
      id: "administration-zones-critiques",
      role: "Administration",
      titre: "Identifier les zones critiques",
      description: alert?.description ?? dayEvent?.description ?? "Les signaux critiques consolident les besoins d'arbitrage.",
      niveau: alert?.niveau === "critique" ? "critique" : "important",
      actionRecommandee: "Traiter les alertes prioritaires",
      moduleCible: "Coordination",
      lienMetier: alert?.lienAction ?? "/coordination",
      quai: alert?.zoneOuQuai ?? tension?.quai ?? fallbackQuai,
      espece: fallbackEspece,
      impactAttendu: alert?.titre ?? "Réduire les tensions et fluidifier la coordination."
    },
    {
      id: "administration-besoins-non-couverts",
      role: "Administration",
      titre: "Analyser les besoins non couverts",
      description: priorityNeed ? `${priorityNeed.quantite} de ${priorityNeed.espece} à ${priorityNeed.quai} restent à suivre.` : "Les besoins ouverts donnent une lecture de la pression marché.",
      niveau: priorities.besoinsPriorises[0]?.priorite === "Critique" ? "critique" : "important",
      actionRecommandee: "Consulter la file des priorités",
      moduleCible: "Besoins",
      lienMetier: "/besoins",
      quai: priorityNeed?.quai ?? fallbackQuai,
      espece: priorityNeed?.espece ?? fallbackEspece,
      impactAttendu: "Améliorer la couverture et documenter les besoins de régulation."
    }
  ];
}

export function getRecommendationsForRole(recommendations: RoleRecommendation[], role: RoleRecommendationRole) {
  return recommendations.filter((recommendation) => recommendation.role === role);
}

export function getRecommendationLevelTone(level: RoleRecommendationLevel) {
  if (level === "critique") return "critical";
  if (level === "important") return "high";
  return "info";
}
