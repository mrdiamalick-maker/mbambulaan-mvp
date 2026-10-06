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

export interface OpportunityRowView {
  id: string;
  problem: string;
  statusLabel: string;
  status: ProgramOpportunityStatus;
  territoryNames: string[];
  maturity: ProgramOpportunity["maturity"];
  hasDecision: boolean;
}

function territoryNames(state: ProductState, territoryIds: string[]): string[] {
  return territoryIds.map((territoryId) => state.territories.find((item) => item.id === territoryId)?.name ?? territoryId);
}

// getOpportunities — vue liste, triée par création la plus récente
// d'abord (même convention de lecture que le reste du produit, cf.
// sortedSituationsOf, situations-bridge.ts : le plus significatif en
// premier — ici le plus récemment instruit).
export function getOpportunities(state: ProductState = DEMO_STATE): OpportunityRowView[] {
  return [...state.programOpportunities]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((opportunity) => ({
      id: opportunity.id,
      problem: opportunity.problem,
      statusLabel: programOpportunityStatusLabels[opportunity.status],
      status: opportunity.status,
      territoryNames: territoryNames(state, opportunity.territoryIds),
      maturity: opportunity.maturity,
      hasDecision: Boolean(opportunity.decisionId)
    }));
}

export interface OpportunityDetailView extends OpportunityRowView {
  justification: string;
  siteNames: string[];
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
    id: opportunity.id,
    problem: opportunity.problem,
    justification: opportunity.justification,
    statusLabel: programOpportunityStatusLabels[opportunity.status],
    status: opportunity.status,
    territoryNames: territoryNames(state, opportunity.territoryIds),
    siteNames: (opportunity.siteIds ?? []).map((siteId) => state.sites.find((item) => item.id === siteId)?.name ?? siteId),
    situationTitles: (opportunity.situationIds ?? []).map((situationId) => state.situations.find((item) => item.id === situationId)?.title ?? situationId),
    involvedActorNames: (opportunity.involvedActorIds ?? []).map((actorId) => state.actors.find((item) => item.id === actorId)?.name ?? actorId),
    establishedFacts: opportunity.establishedFacts,
    hypotheses: opportunity.hypotheses,
    knowledgeGaps: opportunity.knowledgeGaps,
    potentialBeneficiaries: opportunity.potentialBeneficiaries,
    potentialValueHypothesis: opportunity.potentialValueHypothesis,
    possibleInterventions: opportunity.possibleInterventions,
    desiredOutcomes: opportunity.desiredOutcomes,
    maturity: opportunity.maturity,
    hasDecision: Boolean(decision),
    decision: decision ? { label: decisionTypeLabels[decision.type], rationale: decision.rationale, decidedAt: decision.decidedAt } : undefined,
    initiativeId: initiative?.id
  };
}
