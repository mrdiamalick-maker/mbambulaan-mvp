// Pont Opportunités ↔ domaine réel — mandat G1 ("Territory → Situation →
// Opportunity → Arbitration → Initiative/Result"). Bridge créé par
// anticipation d'un futur écran /etat "Opportunités" (non construit dans
// G1, mandat explicite "ne pas redesign les écrans") : lit exclusivement
// ProgramOpportunity (src/domain/types.ts), jamais une seconde source de
// vérité. Même convention que les autres ponts de v3-template/lib
// (landing-bridge.ts, programme-bridge.ts, situations-bridge.ts) : des
// fonctions pures qui rendent une vue déjà résolue, state en paramètre
// avec repli DEMO_STATE.
import { DEMO_STATE } from "./demo-state";
import type { Decision, ProductState, ProgramOpportunity, ProgramOpportunityStatus } from "@/domain/types";
import { decisionTypeLabels, programOpportunityStatusLabels } from "@/domain/types";
import { TERR } from "../data/territories";

// --- G2.1 ("Vision territoriale") — mapping UI explicite ----------------
//
// Le HTML source de vérité affiche un cycle à 4 paliers (Repérée → En
// instruction → Qualifiée → Arbitrée), plus simple que les 8 statuts
// canoniques de ProgramOpportunity. Mapping documenté une fois ici,
// jamais recalculé ailleurs (mandat §6 : "créer un mapping UI explicite
// et documenté", "aucun statut UI ne doit falsifier l'état métier réel").
// Le domaine reste la seule source de vérité — ce mapping n'écrit jamais
// dans ProgramOpportunity.status, il ne fait que le lire.
export const OPPORTUNITY_UI_STEPS = ["Repérée", "En instruction", "Qualifiée", "Arbitrée"] as const;
export type OpportunityUiStep = (typeof OPPORTUNITY_UI_STEPS)[number];

// pending_arbitration reste "Qualifiée" côté UI : l'arbitrage n'a pas
// encore eu lieu, afficher "Arbitrée" avant la Decision réelle serait
// exactement la falsification que le mandat interdit. designing/
// converted_to_program/rejected sont les 3 issues possibles une fois la
// Decision prise (retenue en cours, convertie, ou écartée) — toutes
// honnêtement "Arbitrée" au sens du palier UI (l'arbitrage a eu lieu),
// distinguées par `outcome` pour l'affichage (ex. couleur), jamais par
// une falsification du palier lui-même.
function uiStepIndex(status: ProgramOpportunityStatus): number {
  switch (status) {
    case "detected":
      return 0;
    case "qualifying":
      return 1;
    case "qualified":
    case "pending_arbitration":
      return 2;
    case "designing":
    case "converted_to_program":
    case "rejected":
      return 3;
    case "paused":
      // État de mise en veille — aucun palier canonique ne lui
      // correspond directement ; repli honnête sur "En instruction"
      // (ni régression à "Repérée", ni avance non vérifiée à "Qualifiée").
      return 1;
  }
}

export type OpportunityOutcome = "retenue" | "ecartee" | undefined;

function uiOutcome(status: ProgramOpportunityStatus): OpportunityOutcome {
  if (status === "designing" || status === "converted_to_program") return "retenue";
  if (status === "rejected") return "ecartee";
  return undefined;
}

export interface OpportunityRowView {
  id: string;
  createdAt: string;
  problem: string;
  subLabel: string;
  statusLabel: string;
  status: ProgramOpportunityStatus;
  uiStep: OpportunityUiStep;
  uiStepIndex: number;
  outcome: OpportunityOutcome;
  missingCount: number;
  territoryIds: string[];
  territoryNames: string[];
  zone?: string;
  maturity: ProgramOpportunity["maturity"];
  hasDecision: boolean;
}

function territoryNames(state: ProductState, territoryIds: string[]): string[] {
  return territoryIds.map((territoryId) => state.territories.find((item) => item.id === territoryId)?.name ?? territoryId);
}

// zoneOf (G2.1) — regroupement géographique (Grande-Côte/Cap-Vert/
// Petite-Côte/Sine-Saloum/Casamance), lu depuis le gabarit V3
// data/territories.ts (TERR) : une donnée de référence géographique déjà
// utilisée par Atlas.tsx, jamais une donnée métier fabriquée (mandat
// §11 : "preserve the frozen V3 structure"). Repli undefined si le nom ne
// résout à aucune entrée connue plutôt qu'une zone inventée.
function zoneOf(territoryName: string): string | undefined {
  return TERR.find((row) => row[0] === territoryName)?.[6];
}

function toRowView(state: ProductState, opportunity: ProgramOpportunity): OpportunityRowView {
  const names = territoryNames(state, opportunity.territoryIds);
  return {
    id: opportunity.id,
    createdAt: opportunity.createdAt,
    problem: opportunity.problem,
    // subLabel (G2.1) — pas de champ de tagline dédié sur
    // ProgramOpportunity (G1) ; potentialBeneficiaries est le champ réel
    // le plus proche d'une description courte, jamais un texte fabriqué
    // pour imiter la forme exacte du HTML (mandat §8 : repli honnête
    // plutôt qu'une valeur inventée).
    subLabel: opportunity.potentialBeneficiaries,
    statusLabel: programOpportunityStatusLabels[opportunity.status],
    status: opportunity.status,
    uiStep: OPPORTUNITY_UI_STEPS[uiStepIndex(opportunity.status)],
    uiStepIndex: uiStepIndex(opportunity.status),
    outcome: uiOutcome(opportunity.status),
    missingCount: opportunity.knowledgeGaps.length,
    territoryIds: opportunity.territoryIds,
    territoryNames: names,
    zone: names[0] ? zoneOf(names[0]) : undefined,
    maturity: opportunity.maturity,
    hasDecision: Boolean(opportunity.decisionId)
  };
}

// getOpportunities — vue liste, triée par création la plus récente
// d'abord (même convention de lecture que le reste du produit, cf.
// sortedSituationsOf, situations-bridge.ts : le plus significatif en
// premier — ici le plus récemment instruit).
export function getOpportunities(state: ProductState = DEMO_STATE): OpportunityRowView[] {
  return [...state.programOpportunities].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((opportunity) => toRowView(state, opportunity));
}

// getOpportunitiesForTerritory (G2.1) — utilisée par la fiche territoire
// (section 02 "Opportunités") : mêmes vues, filtrées sur un territoire
// réel, triées identiquement.
export function getOpportunitiesForTerritory(territoryId: string, state: ProductState = DEMO_STATE): OpportunityRowView[] {
  return getOpportunities(state).filter((item) => item.territoryIds.includes(territoryId));
}

export interface OpportunityDetailView extends OpportunityRowView {
  justification: string;
  siteNames: string[];
  situationIds: string[];
  situationTitles: string[];
  involvedActorNames: string[];
  establishedFacts: string[];
  hypotheses: string[];
  knowledgeGaps: string[];
  potentialBeneficiaries: string;
  potentialValueHypothesis?: string;
  possibleInterventions: string[];
  desiredOutcomes: string[];
  // decision (G1) — Decision canonique réelle qui a tranché l'arbitrage,
  // résolue depuis state.decisions via decisionId (jamais déduite du
  // seul statut) ; absente tant qu'aucun arbitrage n'a eu lieu.
  decision?: { label: string; rationale: string; decidedAt: string };
  // initiativeId (G1) — Programme réellement issu de cette opportunité,
  // résolu depuis Initiative.programOpportunityId (relation déjà
  // existante, cf. applyInitiativeCommand) : jamais fabriqué si aucune
  // Initiative ne cite cette opportunité.
  initiativeId?: string;
}

export function getOpportunityDetail(id: string, state: ProductState = DEMO_STATE): OpportunityDetailView | undefined {
  const opportunity = state.programOpportunities.find((item) => item.id === id);
  if (!opportunity) return undefined;

  const decision: Decision | undefined = opportunity.decisionId ? state.decisions.find((item) => item.id === opportunity.decisionId) : undefined;
  const initiative = state.initiatives.find((item) => item.programOpportunityId === opportunity.id);

  return {
    ...toRowView(state, opportunity),
    justification: opportunity.justification,
    siteNames: (opportunity.siteIds ?? []).map((siteId) => state.sites.find((item) => item.id === siteId)?.name ?? siteId),
    situationIds: opportunity.situationIds ?? [],
    situationTitles: (opportunity.situationIds ?? []).map((situationId) => state.situations.find((item) => item.id === situationId)?.title ?? situationId),
    involvedActorNames: (opportunity.involvedActorIds ?? []).map((actorId) => state.actors.find((item) => item.id === actorId)?.name ?? actorId),
    establishedFacts: opportunity.establishedFacts,
    hypotheses: opportunity.hypotheses,
    knowledgeGaps: opportunity.knowledgeGaps,
    potentialBeneficiaries: opportunity.potentialBeneficiaries,
    potentialValueHypothesis: opportunity.potentialValueHypothesis,
    possibleInterventions: opportunity.possibleInterventions,
    desiredOutcomes: opportunity.desiredOutcomes,
    hasDecision: Boolean(decision),
    decision: decision ? { label: decisionTypeLabels[decision.type], rationale: decision.rationale, decidedAt: decision.decidedAt } : undefined,
    initiativeId: initiative?.id
  };
}
