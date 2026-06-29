import type { MvpProofLevel, MvpStatus, MvpTensionLevel } from "@/data/mvpSlice";
import { computeCoordinationEngine, getMvpReferenceData } from "@/lib/mvpSlice";

export type TerritoryPilotStep = {
  id: string;
  title: string;
  description: string;
  module: string;
  decision: string;
  href: string;
  status: MvpStatus | MvpTensionLevel | string;
  proofLevel: MvpProofLevel;
};

export type TerritoryPilotSummary = {
  territory: string;
  region: string;
  quay: string;
  tensionLevel: MvpTensionLevel;
  headline: string;
  narrative: string;
  signal: ReturnType<typeof computeCoordinationEngine>["signal"];
  need: ReturnType<typeof computeCoordinationEngine>["need"];
  action: ReturnType<typeof computeCoordinationEngine>["action"];
  proofs: ReturnType<typeof computeCoordinationEngine>["proofs"];
  flow: TerritoryPilotStep[];
  actors: Array<{
    id: string;
    name: string;
    role: string;
    status: MvpStatus;
    proofLevel: MvpProofLevel;
  }>;
  organizations: Array<{
    id: string;
    name: string;
    type: string;
    status: MvpStatus;
    proofLevel: MvpProofLevel;
  }>;
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    proofLevel: MvpProofLevel;
  }>;
  synthesis: {
    title: string;
    decision: string;
    impact: string;
    limits: string;
  };
  nextActions: Array<{
    label: string;
    href: string;
  }>;
};

export function computeTerritoryPilot(): TerritoryPilotSummary {
  const slice = computeCoordinationEngine();
  const reference = getMvpReferenceData();
  const territory = reference.territories.find((item) => item.name === slice.signal.territory);
  const actors = reference.actors.filter((actor) => actor.territory === slice.signal.territory || actor.id === slice.need.actorId);
  const organizations = reference.organizations.filter((organization) => organization.territory === slice.signal.territory);

  return {
    territory: slice.signal.territory,
    region: territory?.region ?? "Thiès",
    quay: slice.signal.quay,
    tensionLevel: slice.tension.level,
    headline: `${slice.signal.quay} / ${slice.signal.territory}`,
    narrative:
      "Un signal terrain qualifié devient une décision territoriale lisible : le besoin est identifié, l'action est coordonnée, la preuve est conservée et la synthèse peut être présentée.",
    signal: slice.signal,
    need: slice.need,
    action: slice.action,
    proofs: slice.proofs,
    actors: actors.map((actor) => ({
      id: actor.id,
      name: actor.name,
      role: actor.role,
      status: actor.status,
      proofLevel: actor.proofLevel
    })),
    organizations: organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      type: organization.type,
      status: organization.status,
      proofLevel: organization.proofLevel
    })),
    metrics: slice.reportMetrics.map((metric) => ({
      id: metric.id,
      label: metric.label,
      value: metric.value,
      proofLevel: metric.proofLevel
    })),
    synthesis: {
      title: "Synthèse territoire pilote",
      decision: slice.report.decision,
      impact: slice.report.impact,
      limits: slice.report.limits
    },
    flow: [
      {
        id: "signal",
        title: "Signal terrain",
        description: `${slice.signal.volume} de ${slice.signal.species} déclaré à ${slice.signal.quay} par un acteur local.`,
        module: "Arrivages",
        decision: "Qualifier le signal avant toute action de coordination.",
        href: "/arrivages",
        status: slice.signal.status,
        proofLevel: slice.signal.proofLevel
      },
      {
        id: "besoin-tension",
        title: "Besoin ou tension",
        description: `${slice.need.volume} recherchés et tension ${slice.tension.level.toLowerCase()} sur ${slice.tension.quay}.`,
        module: "Besoins / Coordination",
        decision: slice.tension.reason,
        href: "/coordination",
        status: slice.tension.level,
        proofLevel: slice.need.proofLevel
      },
      {
        id: "action",
        title: "Action coordonnée",
        description: slice.action.title,
        module: "Opportunités",
        decision: slice.action.description,
        href: slice.action.targetHref,
        status: slice.action.status,
        proofLevel: slice.action.proofLevel
      },
      {
        id: "preuve",
        title: "Preuve",
        description: `${slice.proofs.length} preuves locales restent liées au lot, à l'action et à la décision.`,
        module: "Traçabilité",
        decision: "Conserver un historique lisible pour corriger, expliquer et rendre compte.",
        href: "/coordination",
        status: "Prouvé",
        proofLevel: "validé"
      },
      {
        id: "synthese",
        title: "Synthèse territoire",
        description: slice.report.impact,
        module: "Vue exécutive",
        decision: slice.report.decision,
        href: "/executive",
        status: "Synthétisé",
        proofLevel: "système"
      }
    ],
    nextActions: [
      { label: "Voir le signal", href: "/arrivages" },
      { label: "Voir les besoins", href: "/besoins" },
      { label: "Coordonner l'action", href: "/coordination" },
      { label: "Lire la synthèse", href: "/executive" }
    ]
  };
}
