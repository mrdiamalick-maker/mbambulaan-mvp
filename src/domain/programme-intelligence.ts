// LOT V3.5 ("Programme Portfolio & Cockpit") — dérivations pures pour le
// portefeuille de Programmes (Initiative), même esprit que
// domain/situation-overview.ts (V3.2) et domain/atlas-overview.ts (V3.4) :
// uniquement des lectures depuis un ProductState déjà chargé, aucune
// commande, aucune donnée fabriquée, aucune IA.
//
// Pré-code A/B/C/D/E (mandat §1) — constats structurants qui gouvernent ce
// fichier :
//  - Initiative.funding[] n'est écrit par AUCUNE commande réelle
//    (create_initiative l'initialise toujours à [], vérifié par lecture de
//    rules.ts/initiative-lifecycle.ts) — seules les fixtures statiques du
//    Demo World le peuplent. Catégorie C (présentation Demo World),
//    JAMAIS traité ici comme un décaissement réel — seul un "financement
//    confirmé" à titre indicatif est calculé, jamais un "dépensé".
//  - Initiative.situationIds suit la même discipline (toujours [] à la
//    création réelle, jamais réécrit ensuite) — Catégorie C. La
//    "trajectoire administrative" ci-dessous ne s'appuie donc PAS sur ce
//    champ pour ses éléments réels ; l'"écosystème" ci-dessous ne
//    s'appuie JAMAIS dessus non plus (il dérive des territoires réels du
//    programme, jamais d'un lien démo).
//  - CoordinationSpace.opportunityId référence `state.opportunities`
//    (marketplace logistique, Opportunity), PAS `ProgramOpportunity` —
//    confirmé par lecture de rules.ts. CoordinationSpace/Commitment ne
//    sont donc PAS reliés au domaine Programme aujourd'hui : Catégorie E
//    (non applicable), documenté comme telle dans le rapport de lot
//    plutôt que fabriqué.
//  - Aucune notion de "dépensé/décaissé" n'existe dans le domaine — Funding.status
//    ("a_mobiliser"/"en_instruction"/"confirme") est un statut de
//    MOBILISATION, jamais une preuve de dépense. Catégorie E pour
//    "spent/disbursed" (mandat §5).
//  - Aucune date d'échéance générale n'existe sur Initiative — seule
//    Initiative.indicators/budgetStatus/status sont des champs réels
//    exploitables pour une pression d'échéance ; l'échéance par situation
//    liée (mandat "upcoming deadline pressure") reste Catégorie E ici
//    (dépendrait de situationIds, Catégorie C).
import type { Finding, FindingStatus, Initiative, ProductState, Situation } from "@/domain/types";
import { indicatorProgress } from "@/components/etat/shared";
import { engagementsForInitiative } from "@/domain/programme-mobilization";

// --- Écosystème réel autour du programme (mandat §7/§9) -------------------
//
// "CE QUE L'ÉCOSYSTÈME DIT" — jamais "le programme cause ces problèmes" :
// une projection déterministe des Situations/Findings/Infrastructures
// réels situés sur les territoires du programme (Initiative.territoryIds,
// champ réel, rempli par create_initiative), sans jamais impliquer de
// causalité. Symétrique du principe déjà appliqué en V3.4 (Atlas) : les
// mêmes objets réels (Situation.territoryId, Finding.territoryIds,
// Infrastructure.territoryId), jamais une seconde source de vérité.
const UNRESOLVED_FINDING_STATUSES: FindingStatus[] = ["proposed", "under_review", "confirmed"];

export interface ProgrammeEcosystem {
  openSituations: Situation[];
  criticalOpenSituations: number;
  unresolvedFindings: Finding[];
  fragileInfrastructureCount: number;
}

export function programmeEcosystem(state: ProductState, initiative: Initiative): ProgrammeEcosystem {
  const territoryIds = new Set(initiative.territoryIds);
  const openSituations = state.situations.filter((item) => territoryIds.has(item.territoryId) && item.status !== "reglee");
  const unresolvedFindings = state.findings.filter(
    (item) => item.territoryIds.some((tid) => territoryIds.has(tid)) && UNRESOLVED_FINDING_STATUSES.includes(item.status)
  );
  const fragileInfrastructureCount = state.infrastructures.filter((item) => territoryIds.has(item.territoryId) && item.status !== "operationnelle").length;
  return {
    openSituations,
    criticalOpenSituations: openSituations.filter((item) => item.priority === "critique").length,
    unresolvedFindings,
    fragileInfrastructureCount
  };
}

// --- Santé du programme (mandat §4) ---------------------------------------
//
// Projection déterministe, jamais un score opaque : un état parmi 3
// (aligné / attention / critique), toujours accompagné des raisons
// réelles qui l'expliquent (`reasons`), jamais un pourcentage
// pseudo-précis. Règle explicite, sans pondération cachée — premier
// déclencheur qui matche l'emporte, documenté ligne par ligne. Un
// programme "terminee" n'est jamais classé "critique"/"attention" : le
// cycle de vie est clos, le jugement porte sur les programmes actifs.
export type ProgrammeHealthState = "aligne" | "attention" | "critique";

export interface ProgrammeHealth {
  state: ProgrammeHealthState;
  reasons: string[];
}

export function programmeHealth(state: ProductState, initiative: Initiative): ProgrammeHealth {
  if (initiative.status === "terminee") return { state: "aligne", reasons: ["Programme clos avec au moins un résultat enregistré."] };

  const ecosystem = programmeEcosystem(state, initiative);
  const engagements = engagementsForInitiative(state, initiative.id);
  const declinedEngagements = engagements.filter((item) => item.status === "declined").length;
  const avgProgress = initiative.indicators.length > 0
    ? Math.round(initiative.indicators.reduce((sum, indicator) => sum + indicatorProgress(indicator), 0) / initiative.indicators.length)
    : null;

  const reasonsCritical: string[] = [];
  if (ecosystem.criticalOpenSituations > 0) reasonsCritical.push(`${ecosystem.criticalOpenSituations} situation(s) prioritaire(s) ouverte(s) sur les territoires du programme.`);
  if (initiative.status !== "cadrage" && initiative.budgetStatus === "a_estimer") reasonsCritical.push("Le programme a dépassé le cadrage sans qu'aucun budget n'ait jamais été chiffré.");
  if (reasonsCritical.length > 0) return { state: "critique", reasons: reasonsCritical };

  const reasonsAttention: string[] = [];
  if (ecosystem.openSituations.length > 0) reasonsAttention.push(`${ecosystem.openSituations.length} situation(s) ouverte(s) (hors priorité critique) sur les territoires du programme.`);
  if (ecosystem.fragileInfrastructureCount > 0) reasonsAttention.push(`${ecosystem.fragileInfrastructureCount} infrastructure(s) fragile(s) ou indisponible(s) sur les territoires du programme.`);
  if (declinedEngagements > 0) reasonsAttention.push(`${declinedEngagements} organisation(s) sollicitée(s) ont décliné.`);
  if (initiative.status === "execution" && avgProgress !== null && avgProgress < 25) reasonsAttention.push(`Indicateurs à ${avgProgress}% en moyenne alors que le programme est en exécution.`);
  if (reasonsAttention.length > 0) return { state: "attention", reasons: reasonsAttention };

  return { state: "aligne", reasons: ["Aucun signal opérationnel ni écart budgétaire identifié sur les données disponibles."] };
}

export const programmeHealthLabel: Record<ProgrammeHealthState, string> = {
  aligne: "Aligné",
  attention: "Attention à prévoir",
  critique: "Attention requise"
};

// --- Jalons opérationnels (mandat §12) -------------------------------------
//
// DÉCISION PRODUIT DÉJÀ PRISE (mandat) : pas d'Initiative.milestones. Ce
// projecteur tente la voie déterministe demandée par le mandat, à partir
// d'événements RÉELLEMENT existants : les transitions de statut du
// programme et les transitions d'engagement partenaire (toutes deux déjà
// auditées via withAudit, state.audit — jamais un second système
// d'historique), plus l'enregistrement de Result (fait daté). Commitment
// (mandat, dans la liste à inspecter) est structurellement hors-jeu ici :
// CoordinationSpace, seul porteur de Commitment, ne référence aucune
// Initiative (cf. constat en tête de fichier) — donc aucun Commitment
// n'entre dans cette timeline, plutôt que d'inventer un lien inexistant.
export type ProgrammeMilestoneKind = "lifecycle" | "engagement" | "result";

export interface ProgrammeMilestone {
  id: string;
  at: string;
  kind: ProgrammeMilestoneKind;
  label: string;
  detail: string;
}

export function programmeMilestones(state: ProductState, initiative: Initiative): ProgrammeMilestone[] {
  const engagementIds = new Set(engagementsForInitiative(state, initiative.id).map((item) => item.id));
  const milestones: ProgrammeMilestone[] = [];

  for (const entry of state.audit) {
    if (entry.objectType === "initiative" && entry.objectId === initiative.id) {
      milestones.push({ id: entry.id, at: entry.at, kind: "lifecycle", label: "Étape du programme", detail: entry.detail });
    } else if (entry.objectType === "programme_organization_engagement" && engagementIds.has(entry.objectId)) {
      milestones.push({ id: entry.id, at: entry.at, kind: "engagement", label: "Mobilisation partenaire", detail: entry.detail });
    }
  }

  for (const result of state.results) {
    if (result.sourceRef.objectType === "initiative" && result.sourceRef.objectId === initiative.id) {
      milestones.push({ id: result.id, at: result.recordedAt, kind: "result", label: "Résultat enregistré", detail: result.title });
    }
  }

  return milestones.sort((a, b) => (a.at < b.at ? 1 : -1));
}

// --- Portefeuille (mandat §2/§3) -------------------------------------------
//
// Une ligne par programme, combinant uniquement des champs réels ou des
// projections ci-dessus — consommée à la fois par la liste et le
// scatter/bubble (mandat §3). Axes retenus, chacun explicable :
//  - progressPct (X) : moyenne réelle d'Initiative.indicators (même
//    fonction indicatorProgress que le reste du Produit) — absent (null)
//    si le programme ne porte aucun indicateur, jamais forcé à 0 (0%
//    affirmerait une progression mesurée nulle, alors que "non mesuré"
//    est la vérité).
//  - budgetConfirmedPct (Y) : part du budget chiffré qui est CONFIRMÉE
//    (Funding.status === "confirme") — Catégorie C assumée (funding[] est
//    Demo World, cf. tête de fichier), toujours accompagné du budget en
//    valeur pour que l'utilisateur voie l'ordre de grandeur réel. Absent
//    (null) si budgetFcfa n'est pas chiffré.
//  - health : programmeHealth ci-dessus.
//  - territoryCount : Initiative.territoryIds.length, réel — taille de
//    bulle du scatter.
export interface ProgrammePortfolioRow {
  initiative: Initiative;
  health: ProgrammeHealth;
  progressPct: number | null;
  budgetConfirmedPct: number | null;
  confirmedFundingFcfa: number;
  territoryCount: number;
  ecosystem: ProgrammeEcosystem;
  nextMilestone?: ProgrammeMilestone;
}

export function portfolioRows(state: ProductState): ProgrammePortfolioRow[] {
  return state.initiatives.map((initiative) => {
    const progressPct = initiative.indicators.length > 0
      ? Math.round(initiative.indicators.reduce((sum, indicator) => sum + indicatorProgress(indicator), 0) / initiative.indicators.length)
      : null;
    const confirmedFundingFcfa = initiative.funding.filter((item) => item.status === "confirme").reduce((sum, item) => sum + item.amountFcfa, 0);
    const budgetConfirmedPct = initiative.budgetFcfa && initiative.budgetFcfa > 0 ? Math.min(100, Math.round((confirmedFundingFcfa / initiative.budgetFcfa) * 100)) : null;
    const milestones = programmeMilestones(state, initiative);
    return {
      initiative,
      health: programmeHealth(state, initiative),
      progressPct,
      budgetConfirmedPct,
      confirmedFundingFcfa,
      territoryCount: initiative.territoryIds.length,
      ecosystem: programmeEcosystem(state, initiative),
      nextMilestone: milestones[0]
    };
  });
}

export interface PortfolioStats {
  total: number;
  active: number;
  completed: number;
  attentionOrCritical: number;
  totalBudgetFcfa: number;
  toEstimateCount: number;
  territoriesCovered: number;
}

export function portfolioStats(state: ProductState, rows: ProgrammePortfolioRow[]): PortfolioStats {
  const chiffred = state.initiatives.filter((item) => item.budgetFcfa !== undefined);
  return {
    total: rows.length,
    active: rows.filter((row) => row.initiative.status !== "terminee").length,
    completed: rows.filter((row) => row.initiative.status === "terminee").length,
    attentionOrCritical: rows.filter((row) => row.health.state !== "aligne").length,
    totalBudgetFcfa: chiffred.reduce((sum, item) => sum + (item.budgetFcfa ?? 0), 0),
    toEstimateCount: state.initiatives.length - chiffred.length,
    territoriesCovered: new Set(state.initiatives.flatMap((item) => item.territoryIds)).size
  };
}

// Ré-export pour les appelants qui n'ont besoin que de la traçabilité
// d'origine (mandat §6/§7, "trajectoire administrative") — évite un
// second import direct d'initiative-lifecycle.ts partout où ce fichier
// est déjà importé.
export { traceInitiativeOrigin } from "@/domain/initiative-lifecycle";
export type { InitiativeOriginTrace } from "@/domain/initiative-lifecycle";
