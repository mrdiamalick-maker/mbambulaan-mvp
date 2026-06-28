import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import { computeIntelligentAlerts } from "@/lib/alerts";
import { computeMatching, computeTransactions } from "@/lib/coordination";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { computeImpactMetrics } from "@/lib/impact";
import type { NotificationMetier } from "@/lib/notifications";
import { computePrioritizationMetrics } from "@/lib/prioritization";
import { computeSensitiveLots } from "@/lib/quality";
import { computeTensionMetrics } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";

export type DaySimulationEventType = "arrivage" | "besoin" | "opportunite" | "qualite" | "reservation" | "transaction" | "tension" | "alerte" | "impact" | "tracabilite";

export type DaySimulationEventStatus = "prévu" | "actif" | "traité" | "critique";

export type DaySimulationEvent = {
  id: string;
  heure: string;
  titre: string;
  description: string;
  type: DaySimulationEventType;
  acteurConcerne: string;
  quai: string;
  espece: string;
  lienMetier: string;
  impactMetier: string;
  statut: DaySimulationEventStatus;
};

export type DaySimulation = {
  events: DaySimulationEvent[];
  criticalEvents: DaySimulationEvent[];
  transactions: Transaction[];
};

export function computeDaySimulation(arrivages: Arrivage[], besoins: Besoin[], opportunitesInput?: Opportunite[]): DaySimulation {
  const opportunites = opportunitesInput ?? computeMatching(arrivages, besoins);
  const primaryArrivage = arrivages.find((arrivage) => arrivage.quai === "Kayar") ?? arrivages[0];
  const urgentBesoin = besoins.find((besoin) => besoin.urgence === "Haute") ?? besoins[0];
  const primaryOpportunity = opportunites.find((opportunite) => opportunite.arrivageId === primaryArrivage?.id) ?? opportunites[0];
  const transactionStatusByOpportunityId = primaryOpportunity ? { [primaryOpportunity.id]: "En cours de retrait" as const } : {};
  const transactions = computeTransactions(opportunites, transactionStatusByOpportunityId);
  const sensitiveLots = computeSensitiveLots(arrivages, { besoins, opportunites, transactions });
  const tensions = computeTensionMetrics(arrivages, besoins, opportunites, transactions);
  const priorities = computePrioritizationMetrics(arrivages, besoins, opportunites, transactions);
  const alerts = computeIntelligentAlerts(arrivages, besoins, opportunites, transactions);
  const impact = computeImpactMetrics(arrivages, besoins, opportunites, transactions);
  const traceableLots = computeTraceability(arrivages, opportunites, transactions);
  const sensitiveLot = sensitiveLots[0];
  const tension = tensions.zonesPrioritaires[0];
  const alert = alerts[0];
  const traceableLot = primaryOpportunity ? traceableLots.find((lot) => lot.opportuniteLiee?.id === primaryOpportunity.id) : traceableLots[0];

  const fallbackQuai = primaryArrivage?.quai ?? urgentBesoin?.quai ?? "Kayar";
  const fallbackEspece = primaryArrivage?.espece ?? urgentBesoin?.espece ?? "Sardinelle ronde";

  const events: DaySimulationEvent[] = [
    {
      id: "day-arrivage-kayar",
      heure: primaryArrivage?.heureDebarquement ?? "07:15",
      titre: `Arrivage déclaré à ${fallbackQuai}`,
      description: primaryArrivage ? `${primaryArrivage.quantite} de ${primaryArrivage.espece} sont déclarés par ${primaryArrivage.vendeur ?? "un pêcheur pilote"}.` : "Un débarquement pilote ouvre la journée.",
      type: "arrivage",
      acteurConcerne: primaryArrivage?.vendeur ?? "Pêcheur pilote",
      quai: fallbackQuai,
      espece: fallbackEspece,
      lienMetier: "/arrivages",
      impactMetier: "Le lot devient visible pour les acheteurs et les acteurs de coordination.",
      statut: "traité"
    },
    {
      id: "day-besoin-urgent",
      heure: "08:05",
      titre: "Besoin urgent publié par un mareyeur",
      description: urgentBesoin ? `${urgentBesoin.acheteur ?? "Un mareyeur"} recherche ${urgentBesoin.quantite} de ${urgentBesoin.espece} sur ${urgentBesoin.quai}.` : "Un besoin d'achat prioritaire est publié.",
      type: "besoin",
      acteurConcerne: urgentBesoin?.acheteur ?? "Mareyeur pilote",
      quai: urgentBesoin?.quai ?? fallbackQuai,
      espece: urgentBesoin?.espece ?? fallbackEspece,
      lienMetier: "/besoins",
      impactMetier: "La demande entre dans le moteur de coordination.",
      statut: urgentBesoin?.urgence === "Haute" ? "critique" : "actif"
    },
    {
      id: "day-opportunite",
      heure: "08:18",
      titre: "Opportunité détectée automatiquement",
      description: primaryOpportunity ? `${primaryOpportunity.vendeur} peut répondre à ${primaryOpportunity.acheteur} avec un score de ${primaryOpportunity.scoreCompatibilite}%.` : "Le moteur recherche les correspondances disponibles.",
      type: "opportunite",
      acteurConcerne: primaryOpportunity?.acheteur ?? "Acheteur pilote",
      quai: primaryOpportunity?.lieu ?? fallbackQuai,
      espece: primaryOpportunity?.espece ?? fallbackEspece,
      lienMetier: primaryOpportunity ? `/opportunites/${primaryOpportunity.id}` : "/opportunites",
      impactMetier: "La plateforme transforme une offre et une demande en proposition de mise en relation.",
      statut: "traité"
    },
    {
      id: "day-qualite",
      heure: "08:24",
      titre: "Lot priorisé pour qualité ou risque de perte",
      description: sensitiveLot ? `${sensitiveLot.lotId} affiche ${sensitiveLot.score}% qualité et un risque ${sensitiveLot.risqueGaspillage.toLowerCase()}.` : "Le moteur qualité vérifie les lots sensibles.",
      type: "qualite",
      acteurConcerne: primaryArrivage?.vendeur ?? "Responsable qualité",
      quai: sensitiveLot?.quai ?? fallbackQuai,
      espece: sensitiveLot?.espece ?? fallbackEspece,
      lienMetier: "/arrivages",
      impactMetier: sensitiveLot?.actionRecommandee ?? "Suivre sans action immédiate",
      statut: sensitiveLot?.risqueGaspillage === "Critique" || sensitiveLot?.risqueGaspillage === "Élevé" ? "critique" : "actif"
    },
    {
      id: "day-reservation",
      heure: "08:31",
      titre: "Réservation confirmée",
      description: primaryOpportunity ? `${primaryOpportunity.quantiteDemandee} de ${primaryOpportunity.espece} sont réservés pour ${primaryOpportunity.acheteur}.` : "Une réservation pilote confirme l'intérêt d'un acheteur.",
      type: "reservation",
      acteurConcerne: primaryOpportunity?.acheteur ?? "Transformateur pilote",
      quai: primaryOpportunity?.lieu ?? fallbackQuai,
      espece: primaryOpportunity?.espece ?? fallbackEspece,
      lienMetier: primaryOpportunity ? `/opportunites/${primaryOpportunity.id}` : "/opportunites",
      impactMetier: "La mise en relation devient une action opérationnelle.",
      statut: "traité"
    },
    {
      id: "day-transaction",
      heure: "08:46",
      titre: "Transaction créée",
      description: transactions[0] ? `La transaction ${transactions[0].id} passe au statut ${transactions[0].statut}.` : "La réservation ouvre une transaction de suivi.",
      type: "transaction",
      acteurConcerne: transactions[0]?.acteurReserve ?? "Transformateur pilote",
      quai: transactions[0]?.quai ?? fallbackQuai,
      espece: transactions[0]?.espece ?? fallbackEspece,
      lienMetier: "/transactions",
      impactMetier: "Le lot peut être suivi jusqu'au retrait et à la livraison.",
      statut: "actif"
    },
    {
      id: "day-tension",
      heure: "09:10",
      titre: "Tension territoriale mise à jour",
      description: tension ? `${tension.quai} passe au niveau ${tension.niveau} avec ${tension.deficit} de déficit.` : "Les tensions territoriales sont recalculées.",
      type: "tension",
      acteurConcerne: "Collectivité",
      quai: tension?.quai ?? fallbackQuai,
      espece: fallbackEspece,
      lienMetier: "/quais",
      impactMetier: tension?.raison ?? priorities.actionsPrioritaires[0]?.description ?? "La plateforme identifie les zones à traiter.",
      statut: tension?.niveau === "Critique" || tension?.niveau === "Forte" ? "critique" : "actif"
    },
    {
      id: "day-alerte",
      heure: "09:18",
      titre: "Alerte envoyée",
      description: alert?.description ?? "Une alerte métier signale l'action à traiter.",
      type: "alerte",
      acteurConcerne: alert?.acteurConcerne ?? "Centre de notifications",
      quai: alert?.zoneOuQuai ?? fallbackQuai,
      espece: fallbackEspece,
      lienMetier: alert?.lienAction ?? "/notifications",
      impactMetier: alert?.titre ?? "Les acteurs reçoivent l'information au bon moment.",
      statut: alert?.niveau === "critique" ? "critique" : "actif"
    },
    {
      id: "day-impact",
      heure: "10:05",
      titre: "Impact économique calculé",
      description: `${impact.volumeValorise} valorisés pour ${impact.valeurEconomique}.`,
      type: "impact",
      acteurConcerne: "Dashboard",
      quai: impact.quaisImpactes[0]?.quai ?? fallbackQuai,
      espece: fallbackEspece,
      lienMetier: "/dashboard",
      impactMetier: `${impact.poissonSauve} potentiellement sauvés du gaspillage.`,
      statut: "traité"
    },
    {
      id: "day-tracabilite",
      heure: "10:30",
      titre: "Lot tracé jusqu'à transaction",
      description: traceableLot ? `${traceableLot.lotId} contient ${traceableLot.historique.length} événement(s) de traçabilité.` : "Le lot est suivi de l'arrivage à la transaction.",
      type: "tracabilite",
      acteurConcerne: traceableLot?.opportuniteLiee?.vendeur ?? primaryArrivage?.vendeur ?? "Pêcheur pilote",
      quai: traceableLot?.quai ?? fallbackQuai,
      espece: traceableLot?.espece ?? fallbackEspece,
      lienMetier: traceableLot?.opportuniteLiee ? `/opportunites/${traceableLot.opportuniteLiee.id}#tracabilite` : "/transactions",
      impactMetier: "La preuve métier relie arrivage, opportunité, réservation et transaction.",
      statut: "traité"
    }
  ];

  return {
    events,
    criticalEvents: events.filter((event) => event.statut === "critique"),
    transactions
  };
}

export function createDaySimulationNotifications(events: DaySimulationEvent[]): NotificationMetier[] {
  return events
    .filter((event) => event.statut === "critique")
    .map((event, index) => ({
      id: `simulation-${event.id}`,
      type: event.type === "transaction" ? ("transaction" as const) : event.type === "opportunite" ? ("opportunite" as const) : ("quai" as const),
      titre: event.titre,
      description: `${event.description} ${event.impactMetier}`,
      date: createSimulationDate(event.heure, index),
      niveau: "attention" as const,
      lu: false,
      lien: event.lienMetier
    }));
}

function createSimulationDate(time: string, offsetMinutes: number) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2026, 5, 27, hours || 12, minutes || 0));
  date.setUTCMinutes(date.getUTCMinutes() + offsetMinutes);
  return date.toISOString();
}
