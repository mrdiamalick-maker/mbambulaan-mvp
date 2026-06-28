import { getArrivages } from "@/lib/arrivages";
import { getBesoins } from "@/lib/besoins";
import { computeMatching } from "@/lib/coordination";
import type { Opportunite } from "@/lib/coordination";
import { computeImpactMetrics } from "@/lib/impact";
import { computePrioritizationMetrics } from "@/lib/prioritization";
import { computeLotsQuality } from "@/lib/quality";
import { computeTensionMetrics } from "@/lib/tension";
import { computeTraceability } from "@/lib/traceability";
import {
  mvpActions,
  mvpActors,
  mvpNeeds,
  mvpOrganizations,
  mvpProofs,
  mvpQualityStatuses,
  mvpQuays,
  mvpReportMetrics,
  mvpSignals,
  mvpTerritories,
  mvpTrustSignals
} from "@/data/mvpSlice";
import type { MvpAction, MvpNeed, MvpProof, MvpQualityStatus, MvpReportMetric, MvpSignal, MvpTensionLevel, MvpTrustSignal } from "@/data/mvpSlice";

export type SliceStepKey = "signal" | "qualification" | "tension" | "opportunity" | "action" | "proof" | "report";

export type MvpSliceStep = {
  key: SliceStepKey;
  title: string;
  description: string;
  module: string;
  decision: string;
  href: string;
  status: string;
};

export type MvpSliceSummary = {
  signal: MvpSignal;
  need: MvpNeed;
  opportunity?: Opportunite;
  action: MvpAction;
  proofs: MvpProof[];
  quality: MvpQualityStatus;
  trustSignals: MvpTrustSignal[];
  reportMetrics: MvpReportMetric[];
  tension: {
    quay: string;
    level: MvpTensionLevel;
    reason: string;
  };
  report: {
    title: string;
    decision: string;
    limits: string;
    impact: string;
  };
  steps: MvpSliceStep[];
};

export function computeMatchingEngine() {
  return computeMatching(getArrivages(), getBesoins());
}

export function computeQualityHelper() {
  return computeLotsQuality(getArrivages(), { besoins: getBesoins(), opportunites: computeMatchingEngine() });
}

export function computeTensionEngine() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatchingEngine();
  return computeTensionMetrics(arrivages, besoins, opportunites);
}

export function computePrioritizationHelper() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatchingEngine();
  return computePrioritizationMetrics(arrivages, besoins, opportunites);
}

export function computeTrustHelper() {
  const average = Math.round(mvpTrustSignals.reduce((total, signal) => total + signal.score, 0) / Math.max(1, mvpTrustSignals.length));

  return {
    average,
    signals: mvpTrustSignals,
    label: average >= 85 ? "Confiance élevée" : average >= 70 ? "Confiance moyenne" : "Confiance à vérifier"
  };
}

export function computeTraceabilityHelper() {
  return computeTraceability(getArrivages(), computeMatchingEngine(), []);
}

export function computeImpactReportSummary() {
  const arrivages = getArrivages();
  const besoins = getBesoins();
  const opportunites = computeMatchingEngine();
  const impact = computeImpactMetrics(arrivages, besoins, opportunites, []);

  return {
    impact,
    metrics: mvpReportMetrics,
    title: "Rapport opérationnel du slice MVP",
    decision: "Prioriser le lot qualifié à Joal, activer la réservation et conserver la preuve de décision.",
    limits: "Données locales mockées : la preuve est démonstrative et doit être remplacée par des validations terrain en pilote."
  };
}

export function computeCoordinationEngine(): MvpSliceSummary {
  const opportunities = computeMatchingEngine();
  const signal = mvpSignals[0];
  const need = mvpNeeds[0];
  const opportunity = opportunities.find((item) => item.arrivageId === signal.arrivalId && item.besoinId === need.needId) ?? opportunities[0];
  const action = mvpActions[0];
  const quality = mvpQualityStatuses[0];
  const trust = computeTrustHelper();
  const reportSummary = computeImpactReportSummary();
  const tensions = computeTensionEngine();
  const linkedQuay = mvpQuays.find((quay) => quay.name === signal.quay);
  const tensionZone = tensions.zonesPrioritaires.find((zone) => zone.quai === signal.quay);
  const tension = {
    quay: signal.quay,
    level: linkedQuay?.tensionLevel ?? "Forte",
    reason: tensionZone?.raison ?? "Besoin urgent, lot sensible et capacité de décision locale à mobiliser."
  };

  return {
    signal,
    need,
    opportunity,
    action,
    proofs: mvpProofs,
    quality,
    trustSignals: trust.signals,
    reportMetrics: reportSummary.metrics,
    tension,
    report: {
      title: reportSummary.title,
      decision: reportSummary.decision,
      limits: reportSummary.limits,
      impact: `${reportSummary.impact.volumeValorise} valorisés · ${reportSummary.impact.poissonSauve} potentiellement sauvés`
    },
    steps: buildSliceSteps(signal, need, opportunity, action)
  };
}

export function getMvpReferenceData() {
  return {
    actors: mvpActors,
    organizations: mvpOrganizations,
    territories: mvpTerritories,
    quays: mvpQuays,
    signals: mvpSignals,
    needs: mvpNeeds,
    opportunities: computeMatchingEngine(),
    actions: mvpActions,
    proofs: mvpProofs,
    qualityStatuses: mvpQualityStatuses,
    trustSignals: mvpTrustSignals,
    reportMetrics: mvpReportMetrics
  };
}

function buildSliceSteps(signal: MvpSignal, need: MvpNeed, opportunity: Opportunite | undefined, action: MvpAction): MvpSliceStep[] {
  return [
    {
      key: "signal",
      title: "Signal terrain",
      description: `${signal.volume} de ${signal.species} déclaré à ${signal.quay}.`,
      module: "Arrivages",
      decision: "Qualifier le signal avant de le pousser vers le marché.",
      href: "/arrivages",
      status: signal.status
    },
    {
      key: "qualification",
      title: "Qualification",
      description: `Source : ${signal.source}. Niveau de preuve : ${signal.proofLevel}.`,
      module: "Trust & Quality",
      decision: "Afficher une donnée exploitable, pas une promesse brute.",
      href: "/arrivages",
      status: "Qualifié"
    },
    {
      key: "tension",
      title: "Tension territoriale",
      description: `${signal.quay} passe en lecture prioritaire pour la coordination.`,
      module: "Carte / Coordination",
      decision: "Prioriser le quai et surveiller le besoin critique.",
      href: "/coordination",
      status: "Prioritaire"
    },
    {
      key: "opportunity",
      title: "Opportunité détectée",
      description: opportunity ? `${opportunity.acheteur} peut couvrir ${need.volume} de ${need.species}.` : `Besoin compatible identifié pour ${need.species}.`,
      module: "Opportunités",
      decision: "Proposer la mise en relation avec explication du score.",
      href: opportunity ? `/opportunites/${opportunity.id}` : "/opportunites",
      status: opportunity?.statut ?? "Correspondance trouvée"
    },
    {
      key: "action",
      title: "Action prioritaire",
      description: action.title,
      module: "Coordination",
      decision: action.description,
      href: action.targetHref,
      status: action.status
    },
    {
      key: "proof",
      title: "Preuve",
      description: "La validation terrain et la synthèse système restent liées au lot.",
      module: "Traçabilité",
      decision: "Rendre la décision vérifiable et corrigeable.",
      href: "/coordination",
      status: "Prouvé"
    },
    {
      key: "report",
      title: "Rapport",
      description: "La synthèse exécutive montre impact, limites et prochaine décision.",
      module: "Executive",
      decision: "Aider un décideur à arbitrer sans lire tous les modules.",
      href: "/executive",
      status: "Synthétisé"
    }
  ];
}
