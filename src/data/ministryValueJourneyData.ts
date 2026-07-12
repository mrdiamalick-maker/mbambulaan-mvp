import type { Level } from "./ministryControlTowerData";

export type WorkflowKind =
  | "verification"
  | "alert"
  | "full-record"
  | "export-zone"
  | "qualification"
  | "funding"
  | "program"
  | "partner"
  | "note"
  | "institutional-export";

export type GeneratedArtifact = {
  id: string;
  kind: WorkflowKind;
  title: string;
  createdAt: string;
  scope: string;
  validator: string;
  summary: string;
  filename: string;
  content: string;
};

export type IncidentRecord = {
  id: string;
  quayId: string;
  title: string;
  category: "Technique" | "Sécurité" | "Qualité";
  level: Level;
  openedAt: string;
  owner: string;
  status: "Ouvert" | "En vérification" | "Résolu";
};

export type FundingOpportunity = {
  id: string;
  needId: string;
  title: string;
  category: "Équipement" | "Formation" | "Infrastructure" | "Financement direct";
  territory: string;
  estimatedAmount: number;
  maturityScore: number;
  beneficiaries: number;
  compatibleFunder: string;
  expectedImpact: string;
  status: "À qualifier" | "Prête à instruire" | "Dossier généré";
};

export type FundingRequest = {
  id: string;
  opportunityId: string;
  title: string;
  amountRequested: number;
  beneficiaryCount: number;
  targetFunder: string;
  ministryUnit: string;
  status: "Brouillon" | "Validée" | "Transmise";
  artifactId: string;
};

export type QualifiedNeedRecord = {
  id: string;
  sourceNeedId: string;
  category: string;
  actorsAffected: number;
  estimatedAmount: number;
  maturityScore: number;
  community: string;
  validator: string;
  artifactId: string;
};

export type PartnerSolicitation = {
  id: string;
  partner: string;
  supportType: string;
  requestedContribution: string;
  responseDate: string;
  owner: string;
  status: "Brouillon" | "Envoyée" | "En discussion" | "Confirmée" | "Déclinée";
  artifactId: string;
};

export const maritimeIncidents: IncidentRecord[] = [
  { id: "incident-1", quayId: "mbour", title: "Capacité de froid réduite", category: "Technique", level: "surveillance", openedAt: "09:35", owner: "Maintenance régionale", status: "En vérification" },
  { id: "incident-2", quayId: "saint-louis", title: "Retour de pirogue non confirmé", category: "Sécurité", level: "urgent", openedAt: "10:18", owner: "Cellule quai", status: "Ouvert" },
  { id: "incident-3", quayId: "kayar", title: "Écart de pesée déclaré", category: "Qualité", level: "surveillance", openedAt: "10:05", owner: "Service contrôle", status: "Ouvert" },
];

export const initialFundingOpportunities: FundingOpportunity[] = [
  { id: "fund-op-1", needId: "need-1", title: "Chaîne de froid Joal–Mbour", category: "Infrastructure", territory: "Thiès", estimatedAmount: 85000000, maturityScore: 82, beneficiaries: 680, compatibleFunder: "Programme public froid", expectedImpact: "Réduire les pertes post-débarquement et sécuriser les revenus.", status: "Prête à instruire" },
  { id: "fund-op-2", needId: "need-2", title: "Sécurité des pirogues de Guet Ndar", category: "Équipement", territory: "Saint-Louis", estimatedAmount: 46000000, maturityScore: 74, beneficiaries: 760, compatibleFunder: "ONG maritime", expectedImpact: "Équiper les capitaines et améliorer la prévention en mer.", status: "Prête à instruire" },
  { id: "fund-op-3", needId: "need-3", title: "Pesée et traçabilité à Kayar", category: "Équipement", territory: "Thiès", estimatedAmount: 38000000, maturityScore: 88, beneficiaries: 430, compatibleFunder: "Partenaire technique", expectedImpact: "Fiabiliser les volumes et les preuves de commercialisation.", status: "Prête à instruire" },
  { id: "fund-op-4", needId: "need-6", title: "Parcours métiers bleus Fass Boye", category: "Formation", territory: "Louga", estimatedAmount: 64000000, maturityScore: 61, beneficiaries: 320, compatibleFunder: "Coopération internationale", expectedImpact: "Structurer l'insertion de jeunes dans la chaîne de valeur.", status: "À qualifier" },
];

export const initialGeneratedArtifacts: GeneratedArtifact[] = [
  {
    id: "artifact-initial-1",
    kind: "verification",
    title: "Preuve de vérification · Joal-Fadiouth",
    createdAt: "12/07/2026 09:58",
    scope: "Joal-Fadiouth",
    validator: "A. Diouf · Agent territorial",
    summary: "Le besoin de glace a été recoupé avec le comité de quai et qualifié pour instruction.",
    filename: "preuve-verification-joal.txt",
    content: "MBÀMBULAAN — PREUVE DE VÉRIFICATION\nObjet : besoin de glace à Joal-Fadiouth\nMéthode : recoupement terrain\nValidation humaine : A. Diouf\nStatut : vérifié",
  },
];

export const needMaturityScores: Record<string, number> = {
  "need-1": 82,
  "need-2": 74,
  "need-3": 88,
  "need-4": 58,
  "need-5": 66,
  "need-6": 61,
};

export const quayTrends: Record<string, number[]> = {
  joal: [42, 48, 45, 57, 62, 68, 71],
  mbour: [51, 54, 58, 56, 67, 73, 78],
  kayar: [38, 44, 41, 53, 49, 61, 65],
  "saint-louis": [47, 43, 52, 58, 55, 63, 59],
  hann: [30, 35, 39, 42, 46, 49, 52],
  soumbedioune: [28, 31, 34, 36, 41, 44, 46],
  "fass-boye": [24, 29, 33, 31, 38, 42, 45],
  kafountine: [32, 38, 41, 47, 51, 55, 60],
};

export function formatFcfa(value: number) {
  return `${new Intl.NumberFormat("fr-FR").format(value)} FCFA`;
}
