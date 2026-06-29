export type MvpProofLevel = "déclaratif" | "estimé" | "validé" | "système" | "audité";
export type MvpStatus = "Nouveau" | "Qualifié" | "Prioritaire" | "En action" | "Prouvé" | "Synthétisé";
export type MvpTensionLevel = "Faible" | "Moyenne" | "Forte" | "Critique";

export type MvpActor = {
  id: string;
  name: string;
  role: string;
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
};

export type MvpOrganization = {
  id: string;
  name: string;
  type: string;
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
};

export type MvpTerritory = {
  id: string;
  name: string;
  region: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
};

export type MvpQuay = {
  id: string;
  name: string;
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
  tensionLevel: MvpTensionLevel;
};

export type MvpSignal = {
  id: string;
  arrivalId: string;
  title: string;
  species: string;
  volume: string;
  territory: string;
  quay: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
  actorId: string;
  qualityStatusId: string;
};

export type MvpNeed = {
  id: string;
  needId: string;
  title: string;
  species: string;
  volume: string;
  territory: string;
  quay: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
  actorId: string;
};

export type MvpAction = {
  id: string;
  title: string;
  description: string;
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
  ownerRole: string;
  targetHref: string;
};

export type MvpProof = {
  id: string;
  title: string;
  description: string;
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
  linkedObjectId: string;
};

export type MvpQualityStatus = {
  id: string;
  label: string;
  score: number;
  risk: "Faible" | "Moyen" | "Élevé" | "Critique";
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
};

export type MvpTrustSignal = {
  id: string;
  label: string;
  score: number;
  actorId: string;
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
};

export type MvpReportMetric = {
  id: string;
  label: string;
  value: string;
  territory: string;
  source: string;
  status: MvpStatus;
  proofLevel: MvpProofLevel;
  date: string;
};

export const mvpActors: MvpActor[] = [
  { id: "act-pecheur-joal", name: "Pirogue Joal Kër Gi", role: "Pêcheur référent", territory: "Petite-Côte", source: "Déclaration agent terrain", status: "Qualifié", proofLevel: "validé", date: "2026-06-29" },
  { id: "act-mareyeur-dakar", name: "Mareyeur Dakar Frais", role: "Acheteur demandeur", territory: "Dakar", source: "Besoin publié", status: "Qualifié", proofLevel: "déclaratif", date: "2026-06-29" },
  { id: "act-agent-joal", name: "Awa Diouf", role: "Animatrice territoriale", territory: "Petite-Côte", source: "Réseau terrain Mbàmbulaan", status: "Qualifié", proofLevel: "validé", date: "2026-06-29" },
  { id: "act-collectivite", name: "Cellule économie locale", role: "Décideur territorial", territory: "Petite-Côte", source: "Espace collectivité", status: "Synthétisé", proofLevel: "système", date: "2026-06-29" }
];

export const mvpOrganizations: MvpOrganization[] = [
  { id: "org-coop-joal", name: "Union Joal Pêche", type: "Coopérative", territory: "Petite-Côte", source: "Référentiel local", status: "Qualifié", proofLevel: "validé", date: "2026-06-29" },
  { id: "org-municipal", name: "Collectivité de Joal-Fadiouth", type: "Collectivité", territory: "Petite-Côte", source: "Partenaire pilote", status: "Synthétisé", proofLevel: "validé", date: "2026-06-29" }
];

export const mvpTerritories: MvpTerritory[] = [
  { id: "ter-petite-cote", name: "Petite-Côte", region: "Thiès", source: "Référentiel Mbàmbulaan", status: "Qualifié", proofLevel: "validé", date: "2026-06-29" },
  { id: "ter-dakar", name: "Dakar", region: "Dakar", source: "Référentiel Mbàmbulaan", status: "Qualifié", proofLevel: "validé", date: "2026-06-29" }
];

export const mvpQuays: MvpQuay[] = [
  { id: "quay-joal", name: "Joal", territory: "Petite-Côte", source: "Carte des quais", status: "Prioritaire", proofLevel: "système", date: "2026-06-29", tensionLevel: "Forte" },
  { id: "quay-mbour", name: "Mbour", territory: "Petite-Côte", source: "Carte des quais", status: "Qualifié", proofLevel: "système", date: "2026-06-29", tensionLevel: "Moyenne" },
  { id: "quay-soumbedioune", name: "Soumbédioune", territory: "Dakar", source: "Carte des quais", status: "Qualifié", proofLevel: "système", date: "2026-06-29", tensionLevel: "Forte" }
];

export const mvpSignals: MvpSignal[] = [
  {
    id: "sig-joal-001",
    arrivalId: "arr-004",
    title: "Arrivage sensible déclaré à Joal",
    species: "Crevette",
    volume: "180 kg",
    territory: "Petite-Côte",
    quay: "Joal",
    source: "Pêcheur référent + agent terrain",
    status: "Qualifié",
    proofLevel: "validé",
    date: "2026-06-29 09:20",
    actorId: "act-pecheur-joal",
    qualityStatusId: "qual-joal-001"
  }
];

export const mvpNeeds: MvpNeed[] = [
  {
    id: "need-export-001",
    needId: "bes-004",
    title: "Besoin export urgent compatible",
    species: "Crevette",
    volume: "160 kg",
    territory: "Petite-Côte",
    quay: "Joal",
    source: "Besoin acheteur publié",
    status: "Prioritaire",
    proofLevel: "déclaratif",
    date: "2026-06-29 09:35",
    actorId: "act-mareyeur-dakar"
  }
];

export const mvpActions: MvpAction[] = [
  {
    id: "action-reserver-joal",
    title: "Qualifier le lot, mobiliser l'acheteur compatible et conserver la preuve de décision",
    description: "Le signal qualifié, le besoin urgent et la tension locale déclenchent une action de coordination : mobiliser l'acheteur compatible, suivre l'avancement et conserver la preuve de décision.",
    territory: "Petite-Côte",
    source: "Coordination engine",
    status: "En action",
    proofLevel: "système",
    date: "2026-06-29 09:42",
    ownerRole: "Coordination / mareyeur",
    targetHref: "/opportunites/arr-004-bes-004"
  }
];

export const mvpProofs: MvpProof[] = [
  {
    id: "proof-signal-joal",
    title: "Signal validé par animatrice territoriale",
    description: "La déclaration du pêcheur est recoupée avec l'heure de débarquement, le quai et le besoin publié.",
    territory: "Petite-Côte",
    source: "Agent terrain",
    status: "Prouvé",
    proofLevel: "validé",
    date: "2026-06-29 09:30",
    linkedObjectId: "sig-joal-001"
  },
  {
    id: "proof-report-joal",
    title: "Synthèse intégrée au rapport exécutif",
    description: "Le lot, l'opportunité et l'action prioritaire alimentent la lecture décideur.",
    territory: "Petite-Côte",
    source: "Impact / report summary helper",
    status: "Synthétisé",
    proofLevel: "système",
    date: "2026-06-29 10:00",
    linkedObjectId: "action-reserver-joal"
  }
];

export const mvpQualityStatuses: MvpQualityStatus[] = [
  { id: "qual-joal-001", label: "À traiter rapidement", score: 84, risk: "Élevé", territory: "Petite-Côte", source: "Quality helper", status: "Qualifié", proofLevel: "estimé", date: "2026-06-29 09:25" }
];

export const mvpTrustSignals: MvpTrustSignal[] = [
  { id: "trust-pecheur-joal", label: "Acteur référencé, historique positif", score: 88, actorId: "act-pecheur-joal", territory: "Petite-Côte", source: "Trust helper", status: "Qualifié", proofLevel: "système", date: "2026-06-29" },
  { id: "trust-acheteur-dakar", label: "Acheteur actif, besoin urgent déclaré", score: 81, actorId: "act-mareyeur-dakar", territory: "Dakar", source: "Trust helper", status: "Qualifié", proofLevel: "système", date: "2026-06-29" }
];

export const mvpReportMetrics: MvpReportMetric[] = [
  { id: "metric-signal", label: "Signal terrain qualifié", value: "1", territory: "Petite-Côte", source: "Coordination engine", status: "Synthétisé", proofLevel: "système", date: "2026-06-29" },
  { id: "metric-opportunity", label: "Opportunité prioritaire", value: "1", territory: "Petite-Côte", source: "Matching engine", status: "Synthétisé", proofLevel: "système", date: "2026-06-29" },
  { id: "metric-action", label: "Action recommandée", value: "1", territory: "Petite-Côte", source: "Prioritization helper", status: "Synthétisé", proofLevel: "système", date: "2026-06-29" },
  { id: "metric-proof", label: "Preuves liées", value: "2", territory: "Petite-Côte", source: "Traceability helper", status: "Synthétisé", proofLevel: "système", date: "2026-06-29" }
];
