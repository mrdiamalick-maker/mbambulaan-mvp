import type { Arrivage } from "@/lib/arrivages";
import type { Besoin } from "@/lib/besoins";
import type { Opportunite, Transaction } from "@/lib/coordination";
import { computeImpactMetrics } from "@/lib/impact";
import { getEspeceReference } from "@/lib/reference";
import { computeTensionMetrics, type TensionMetrics } from "@/lib/tension";
import { getOpportunityTrust } from "@/lib/trust";

export type BusinessPriority = "Critique" | "Haute" | "Moyenne" | "Faible";

export type NeedPriority = {
  id: string;
  besoin: Besoin;
  priorite: BusinessPriority;
  score: number;
  raisons: string[];
};

export type OpportunityPriority = {
  id: string;
  opportunite: Opportunite;
  priorite: BusinessPriority;
  score: number;
  valeurEconomique: string;
  raisons: string[];
};

export type PriorityAction = {
  id: string;
  titre: string;
  description: string;
  priorite: BusinessPriority;
  href: string;
};

export type PrioritizationMetrics = {
  besoinsPriorises: NeedPriority[];
  opportunitesPriorisees: OpportunityPriority[];
  actionsPrioritaires: PriorityAction[];
};

export function computePrioritizationMetrics(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], transactions: Transaction[] = []): PrioritizationMetrics {
  const tensions = computeTensionMetrics(arrivages, besoins, opportunites, transactions);
  const impact = computeImpactMetrics(arrivages, besoins, opportunites, transactions);
  const besoinsPriorises = computeNeedPriorities(arrivages, besoins, opportunites, tensions);
  const opportunitesPriorisees = computeOpportunityPriorities(opportunites, tensions);

  return {
    besoinsPriorises,
    opportunitesPriorisees,
    actionsPrioritaires: computePriorityActions(besoinsPriorises, opportunitesPriorisees, tensions, impact.quaisImpactes[0]?.quai)
  };
}

export function getPriorityTone(priority: BusinessPriority) {
  if (priority === "Critique") return "critical";
  if (priority === "Haute") return "high";
  if (priority === "Moyenne") return "medium";
  return "low";
}

function computeNeedPriorities(arrivages: Arrivage[], besoins: Besoin[], opportunites: Opportunite[], tensions: TensionMetrics): NeedPriority[] {
  return besoins
    .map((besoin) => {
      const raisons: string[] = [];
      let score = 0;

      if (besoin.urgence === "Haute") {
        score += 30;
        raisons.push("besoin urgent");
      } else if (besoin.urgence === "Moyenne") {
        score += 18;
        raisons.push("urgence moyenne");
      } else {
        score += 8;
      }

      const quantiteKg = parseQuantityInKg(besoin.quantite);
      if (quantiteKg >= 1000) {
        score += 18;
        raisons.push("volume important");
      } else if (quantiteKg >= 300) {
        score += 10;
        raisons.push("volume significatif");
      }

      if (isSensitiveSpecies(besoin.espece, besoins)) {
        score += 18;
        raisons.push("espèce sensible ou très demandée");
      }

      const hasCompatibleOffer = opportunites.some((opportunite) => opportunite.besoinId === besoin.id);
      if (!hasCompatibleOffer && !arrivages.some((arrivage) => sameValue(arrivage.espece, besoin.espece) && parseQuantityInKg(arrivage.quantite) >= quantiteKg)) {
        score += 22;
        raisons.push("absence d'offre compatible");
      }

      const quaiTension = tensions.tensionsParQuai.find((tension) => sameValue(tension.quai, besoin.quai));
      if (quaiTension?.niveau === "Critique") {
        score += 18;
        raisons.push("quai en tension critique");
      } else if (quaiTension?.niveau === "Forte") {
        score += 12;
        raisons.push("quai en forte tension");
      }

      return {
        id: besoin.id,
        besoin,
        score: Math.min(100, score),
        priorite: scoreToPriority(score),
        raisons: raisons.length ? raisons : ["besoin à suivre"]
      };
    })
    .sort((first, second) => second.score - first.score);
}

function computeOpportunityPriorities(opportunites: Opportunite[], tensions: TensionMetrics): OpportunityPriority[] {
  return opportunites
    .map((opportunite) => {
      const raisons: string[] = [];
      let score = 0;

      if (opportunite.scoreCompatibilite >= 90) {
        score += 24;
        raisons.push("score de recommandation élevé");
      } else if (opportunite.scoreCompatibilite >= 80) {
        score += 16;
        raisons.push("bonne recommandation");
      } else {
        score += 8;
      }

      const tension = tensions.tensionsParQuai.find((item) => sameValue(item.quai, opportunite.lieu));
      if (tension?.niveau === "Critique") {
        score += 22;
        raisons.push("zone critique");
      } else if (tension?.niveau === "Forte") {
        score += 14;
        raisons.push("zone en forte tension");
      }

      const quantityKg = parseQuantityInKg(opportunite.quantiteDemandee);
      if (quantityKg >= 1000) {
        score += 16;
        raisons.push("volume structurant");
      } else if (quantityKg >= 300) {
        score += 9;
        raisons.push("volume utile");
      }

      const economicValue = quantityKg * getIndicativePrice(opportunite.espece);
      if (economicValue >= 1_500_000) {
        score += 16;
        raisons.push("impact économique élevé");
      } else if (economicValue >= 500_000) {
        score += 9;
        raisons.push("impact économique significatif");
      }

      const trust = getOpportunityTrust(opportunite).scoreMoyen;
      if (trust >= 85) {
        score += 14;
        raisons.push("acteurs très fiables");
      } else if (trust >= 65) {
        score += 8;
        raisons.push("confiance acceptable");
      }

      return {
        id: opportunite.id,
        opportunite,
        score: Math.min(100, score),
        priorite: scoreToPriority(score),
        valeurEconomique: formatFcfa(economicValue),
        raisons: raisons.length ? raisons : ["opportunité à suivre"]
      };
    })
    .sort((first, second) => second.score - first.score);
}

function computePriorityActions(besoins: NeedPriority[], opportunites: OpportunityPriority[], tensions: TensionMetrics, impactQuai?: string): PriorityAction[] {
  const actions: PriorityAction[] = [];
  const firstNeed = besoins[0];
  const firstOpportunity = opportunites[0];
  const firstZone = tensions.zonesPrioritaires[0];

  if (firstNeed) {
    actions.push({
      id: `need-${firstNeed.id}`,
      titre: `Traiter d'abord ${firstNeed.besoin.espece}`,
      description: `${firstNeed.besoin.quantite} demandés à ${firstNeed.besoin.quai}.`,
      priorite: firstNeed.priorite,
      href: "/besoins"
    });
  }

  if (firstOpportunity) {
    actions.push({
      id: `opportunity-${firstOpportunity.id}`,
      titre: `Réserver le lot ${firstOpportunity.opportunite.espece}`,
      description: `${firstOpportunity.opportunite.quantiteDemandee} avec ${firstOpportunity.score}% de priorité.`,
      priorite: firstOpportunity.priorite,
      href: `/opportunites/${firstOpportunity.id}`
    });
  }

  if (firstZone) {
    actions.push({
      id: `zone-${firstZone.quai}`,
      titre: `Orienter les mareyeurs vers ${firstZone.quai}`,
      description: firstZone.raison,
      priorite: firstZone.niveau === "Critique" ? "Critique" : firstZone.niveau === "Forte" ? "Haute" : "Moyenne",
      href: "/quais"
    });
  }

  if (impactQuai) {
    actions.push({
      id: `impact-${impactQuai}`,
      titre: `Renforcer ${impactQuai}`,
      description: "Quai à fort impact opérationnel dans les données du jour.",
      priorite: "Moyenne",
      href: "/dashboard"
    });
  }

  return actions.slice(0, 5);
}

function scoreToPriority(score: number): BusinessPriority {
  if (score >= 78) return "Critique";
  if (score >= 58) return "Haute";
  if (score >= 32) return "Moyenne";
  return "Faible";
}

function isSensitiveSpecies(espece: string, besoins: Besoin[]) {
  const reference = getEspeceReference(espece);
  const demandCount = besoins.filter((besoin) => sameValue(besoin.espece, espece)).length;

  return demandCount >= 2 || (reference?.prixIndicatifFcfaKg ?? 0) >= 2500 || reference?.categorie.toLowerCase().includes("noble");
}

function getIndicativePrice(espece: string) {
  return getEspeceReference(espece)?.prixIndicatifFcfaKg ?? 1000;
}

function parseQuantityInKg(value: string) {
  const normalized = value.trim().toLowerCase().replace(",", ".");
  const amount = Number.parseFloat(normalized);

  if (Number.isNaN(amount)) return 0;

  return normalized.includes("t") ? amount * 1000 : amount;
}

function formatFcfa(value: number) {
  return `${Math.round(value).toLocaleString("fr-FR")} FCFA`;
}

function sameValue(first: string, second: string) {
  return normalize(first) === normalize(second);
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^quai de /i, "")
    .trim()
    .toLowerCase();
}
