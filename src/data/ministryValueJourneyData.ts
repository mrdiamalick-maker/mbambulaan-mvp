import type { DataTrustLevel, Level } from "./ministryControlTowerData";

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
  documentType?: string;
  sections?: Array<{ title: string; items: Array<{ label: string; value: string }> }>;
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
  source: string;
  trustLevel: DataTrustLevel;
  nextAction: string;
  linkedDossierId?: string;
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
  compatibilityScore: number;
  status: "À qualifier" | "Éligible au financement" | "En instruction" | "Dossier constitué" | "Transmis" | "En négociation" | "Financé" | "Décliné";
};

export type FundingRequest = {
  id: string;
  opportunityId: string;
  title: string;
  amountRequested: number;
  beneficiaryCount: number;
  targetFunder: string;
  ministryUnit: string;
  maturityScore: number;
  eligibilityStatus: "Éligible au financement" | "En instruction" | "Dossier constitué" | "Transmis" | "En négociation" | "Financé" | "Décliné";
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

export type ProgramAssociation = {
  id: string;
  sourceId: string;
  program: string;
  owner: string;
  nextMilestone: string;
  expectedImpact: string;
  artifactId: string;
};

export type FundingDossierRecord = {
  id: string;
  needId: string;
  title: string;
  amountRequested: number;
  targetPartner: string;
  status: "Dossier constitué" | "Transmission à confirmer" | "Transmis" | "En négociation" | "Financé" | "Décliné";
  owner: string;
  updatedAt: string;
  nextAction: string;
  trustLevel: "declared" | "verified" | "consolidated";
  transmittedAt?: string;
  transmittedBy?: string;
  artifactId: string;
};

export type PartnerRelationship = {
  id: string;
  dossierId?: string;
  partnerName: string;
  category: "Programme public" | "Bailleur" | "Partenaire technique" | "ONG" | "Collectivité" | "Recherche / biodiversité" | "Chaîne du froid / équipement";
  interestTags: string[];
  compatibilityReason: string;
  status: "Candidat compatible" | "Sollicitation préparée" | "Sollicité" | "En négociation" | "Partenaire actif" | "Décliné";
  lastInteractionDate: string;
  followUpDueDate: string;
  owner: string;
};

export type VerificationTask = {
  id: string;
  targetId: string;
  target: string;
  scope: string;
  recipient: string;
  channel: "WhatsApp structuré" | "Application terrain";
  status: "Demandée" | "Message préparé" | "Assignée" | "En cours" | "Constat déposé" | "Vérifiée" | "Clôturée";
  dueDate: string;
  owner: string;
  message: string;
  artifactId: string;
};

export type SignalRecord = {
  id: string;
  title: string;
  scope: string;
  sender: string;
  receivingCell: string;
  messageType: string;
  attachmentHint: string;
  nature: "Information" | "Alerte préventive" | "Incident" | "Besoin filière";
  treatmentStatus: "Signalée" | "À qualifier" | "À traiter" | "En vérification" | "Vérifiée" | "Clôturée";
  criticality: "Normale" | "Vigilance" | "Critique";
  trustLevel: "raw" | "declared";
  status: "Signalé" | "Qualifié" | "En traitement" | "Clôturé" | "Escaladé en alerte";
  createdAt: string;
  artifactId: string;
};

export type DecisionRecord = {
  id: string;
  noteTitle: string;
  recommendation: string;
  status: "Recommandée" | "À arbitrer" | "Arbitrée" | "En exécution" | "Exécutée";
  priority: "Standard" | "Prioritaire" | "Urgente";
  source: string;
  owner: string;
  createdAt: string;
  nextAction: string;
  artifactId: string;
};

export type ZoneReportRecord = {
  id: string;
  title: string;
  zone: string;
  period: string;
  author: string;
  generatedAt: string;
  trustLevel: "verified" | "consolidated";
  linkedObjectsCount: number;
  purpose: string;
  artifactId: string;
};

export const maritimeIncidents: IncidentRecord[] = [
  { id: "incident-1", quayId: "mbour", title: "Capacité de froid réduite", category: "Technique", level: "surveillance", openedAt: "09:35", owner: "Maintenance régionale", status: "En vérification", source: "Gestionnaire du quai", trustLevel: "verified", nextAction: "Confirmer la capacité restante et joindre le constat de maintenance." },
  { id: "incident-2", quayId: "saint-louis", title: "Retour de pirogue non confirmé", category: "Sécurité", level: "urgent", openedAt: "10:18", owner: "Cellule quai", status: "Ouvert", source: "Appel au poste de quai", trustLevel: "declared", nextAction: "Relancer le poste officiel et consigner le résumé d’appel.", linkedDossierId: "INC-2026-0081" },
  { id: "incident-3", quayId: "kayar", title: "Écart de pesée déclaré", category: "Qualité", level: "surveillance", openedAt: "10:05", owner: "Service contrôle", status: "Ouvert", source: "Poste officiel de Kayar", trustLevel: "declared", nextAction: "Demander une vérification terrain.", linkedDossierId: "VER-2026-0142" },
];

export const initialFundingOpportunities: FundingOpportunity[] = [
  { id: "fund-op-1", needId: "need-1", title: "Chaîne de froid Joal–Mbour", category: "Infrastructure", territory: "Thiès", estimatedAmount: 1480000000, maturityScore: 82, beneficiaries: 680, compatibleFunder: "Programme public froid", compatibilityScore: 91, expectedImpact: "Réduire les pertes post-débarquement et sécuriser les revenus de 680 acteurs.", status: "Éligible au financement" },
  { id: "fund-op-2", needId: "need-2", title: "Sécurité des pirogues de Guet Ndar", category: "Équipement", territory: "Saint-Louis", estimatedAmount: 780000000, maturityScore: 74, beneficiaries: 760, compatibleFunder: "ONG sécurité maritime", compatibilityScore: 87, expectedImpact: "Équiper les capitaines et améliorer la prévention en mer.", status: "Éligible au financement" },
  { id: "fund-op-3", needId: "need-3", title: "Pesée et traçabilité à Kayar", category: "Équipement", territory: "Thiès", estimatedAmount: 620000000, maturityScore: 88, beneficiaries: 430, compatibleFunder: "Partenaire technique traçabilité", compatibilityScore: 94, expectedImpact: "Fiabiliser les volumes déclarés et les preuves de commercialisation.", status: "Éligible au financement" },
  { id: "fund-op-4", needId: "need-6", title: "Parcours métiers bleus Fass Boye", category: "Formation", territory: "Louga", estimatedAmount: 540000000, maturityScore: 61, beneficiaries: 320, compatibleFunder: "Coopération internationale filière bleue", compatibilityScore: 79, expectedImpact: "Structurer l’insertion de jeunes dans la chaîne de valeur.", status: "À qualifier" },
  { id: "fund-op-5", needId: "need-4", title: "Modernisation des débarcadères de la Petite Côte", category: "Infrastructure", territory: "Thiès", estimatedAmount: 520000000, maturityScore: 77, beneficiaries: 940, compatibleFunder: "Fonds de valorisation de la filière", compatibilityScore: 89, expectedImpact: "Sécuriser les flux de Joal-Fadiouth, Mbour et Soumbédioune.", status: "En instruction" },
  { id: "fund-op-6", needId: "need-5", title: "Conservation et valorisation à Kafountine", category: "Financement direct", territory: "Ziguinchor", estimatedAmount: 260000000, maturityScore: 69, beneficiaries: 210, compatibleFunder: "Programme public froid", compatibilityScore: 84, expectedImpact: "Intégrer 42 mareyeuses au dispositif de froid et réduire les pertes.", status: "Éligible au financement" },
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
    filename: "Mbambulaan_PreuveVerification_Joal-Fadiouth_2026-07-12.html",
    content: "MBÀMBULAAN — PREUVE DE VÉRIFICATION\nObjet : besoin de glace à Joal-Fadiouth\nMéthode : recoupement terrain\nValidation humaine : A. Diouf\nStatut : vérifié",
    documentType: "Preuve de vérification",
    sections: [{ title: "Contrôle terrain", items: [{ label: "Objet", value: "Besoin de glace à Joal-Fadiouth" }, { label: "Méthode", value: "Recoupement terrain" }, { label: "Conclusion", value: "Besoin confirmé et éligible à l’instruction" }] }],
  },
];

export const impactProofs = [
  { id: "impact-1", figure: "320", unit: "pêcheurs bénéficiaires", detail: "Parcours métiers bleus · Fass Boye", level: "normal" as const },
  { id: "impact-2", figure: "+18 %", unit: "de volumes déclarés", detail: "Depuis la vérification des pesées à Kayar", level: "normal" as const },
  { id: "impact-3", figure: "42", unit: "mareyeuses intégrées", detail: "Programme froid Joal–Mbour", level: "surveillance" as const },
  { id: "impact-4", figure: "11", unit: "quais couverts", detail: "Dispositif de coordination et de preuve", level: "normal" as const },
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
