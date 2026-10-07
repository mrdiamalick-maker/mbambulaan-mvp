// Pont Résultats ↔ domaine réel (G2.2, mandat "Simplification des vues").
// Premier branchement de cet écran sur Initiative/Result (domain/types.ts) —
// jusqu'ici l'écran ne lisait que des séries de gabarit (data/programmes.ts,
// "(gabarit)" explicite dans l'UI) sans aucun lien au domaine canonique.
//
// Modèle simplifié imposé par le mandat : Décidé → Réalisé → Résultat
// observé → Écart. Une rangée = une Initiative réelle, jamais une série
// synthétique multipliée par territoire/programme (l'ancien mult/progFactor
// retiré avec ce lot). Les projections (Initiative.indicators[].target)
// restent toujours affichées distinctement de l'observé (current) —
// jamais fusionnées dans un seul nombre.
import { DEMO_STATE } from "./demo-state";
import type { ProductState } from "@/domain/types";
import { decisionTypeLabels } from "@/domain/types";
import { findLatestDecisionForSituation } from "./situations-bridge";
import { getArbitrageItems } from "./arbitrages-bridge";

const STATUS_LABEL: Record<string, string> = {
  cadrage: "En cadrage",
  financee: "Financée",
  execution: "En exécution",
  terminee: "Terminée"
};

export interface IndicatorGapView {
  label: string;
  currentLabel: string;
  targetLabel: string;
  // gap — écart signé (current - target), jamais un jugement "bon/mauvais"
  // fabriqué : le domaine ne porte pas de sens de variation par indicateur
  // (baisse ou hausse souhaitée selon l'indicateur), donc aucune couleur
  // "réussite" n'est déduite ici — seul le nombre brut est montré.
  gapLabel: string;
}

export interface ObservedResultView {
  title: string;
  description: string;
  recordedAtLabel: string;
  trustLabel: string;
}

export interface NextDecisionView {
  title: string;
  territoryId?: string;
}

export interface InitiativeResultView {
  id: string;
  title: string;
  territoryIds: string[];
  territoryLabel: string;
  objective: string;
  statusLabel: string;
  decidedLabel?: string;
  observedResults: ObservedResultView[];
  indicatorGaps: IndicatorGapView[];
  nextDecision?: NextDecisionView;
}

function territoryLabelOf(state: ProductState, territoryIds: string[]): string {
  const names = territoryIds.map((id) => state.territories.find((t) => t.id === id)?.name ?? id);
  return names.join(", ") || "Territoire non résolu";
}

// resolveDecidedLabel — la Decision réelle qui a initié cette Initiative :
// via la ProgramOpportunity dont elle est issue (G1, decisionId), sinon
// via la plus récente Decision réelle parmi les Situations qu'elle cite.
// Jamais déduite du seul statut de l'Initiative.
function resolveDecidedLabel(state: ProductState, initiative: ProductState["initiatives"][number]): string | undefined {
  if (initiative.programOpportunityId) {
    const opportunity = state.programOpportunities.find((o) => o.id === initiative.programOpportunityId);
    const decision = opportunity?.decisionId ? state.decisions.find((d) => d.id === opportunity.decisionId) : undefined;
    if (decision) return `${decisionTypeLabels[decision.type]} · ${decision.decidedAt.slice(0, 10)}`;
  }
  const candidates = initiative.situationIds
    .map((situationId) => findLatestDecisionForSituation(state, situationId))
    .filter((d): d is NonNullable<typeof d> => Boolean(d))
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt));
  const latest = candidates[0];
  return latest ? `${decisionTypeLabels[latest.type]} · ${latest.decidedAt.slice(0, 10)}` : undefined;
}

function resolveNextDecision(state: ProductState, initiative: ProductState["initiatives"][number]): NextDecisionView | undefined {
  const items = getArbitrageItems(state);
  const match = items.find((item) => item.territoryId && initiative.territoryIds.includes(item.territoryId));
  return match ? { title: match.title, territoryId: match.territoryId } : undefined;
}

function toInitiativeResultView(state: ProductState, initiative: ProductState["initiatives"][number]): InitiativeResultView {
  const observedResults: ObservedResultView[] = state.results
    .filter((r) => r.sourceRef.objectType === "initiative" && r.sourceRef.objectId === initiative.id)
    .map((r) => ({
      title: r.title,
      description: r.description,
      recordedAtLabel: r.recordedAt.slice(0, 10),
      trustLabel: r.trust
    }));

  const indicatorGaps: IndicatorGapView[] = initiative.indicators.map((ind) => {
    const gap = Math.round((ind.current - ind.target) * 10) / 10;
    return {
      label: ind.label,
      currentLabel: `${ind.current}${ind.unit}`,
      targetLabel: `${ind.target}${ind.unit}`,
      gapLabel: `${gap > 0 ? "+" : ""}${gap}${ind.unit}`
    };
  });

  return {
    id: initiative.id,
    title: initiative.title,
    territoryIds: initiative.territoryIds,
    territoryLabel: territoryLabelOf(state, initiative.territoryIds),
    objective: initiative.objective,
    statusLabel: STATUS_LABEL[initiative.status] ?? initiative.status,
    decidedLabel: resolveDecidedLabel(state, initiative),
    observedResults,
    indicatorGaps,
    nextDecision: resolveNextDecision(state, initiative)
  };
}

// getInitiativeResults — triée par volume de résultats observés d'abord
// (ce qui a réellement produit quelque chose de mesuré en tête), puis par
// titre, pour une lecture stable d'un chargement à l'autre.
export function getInitiativeResults(state: ProductState = DEMO_STATE): InitiativeResultView[] {
  return [...state.initiatives]
    .map((initiative) => toInitiativeResultView(state, initiative))
    .sort((a, b) => b.observedResults.length - a.observedResults.length || a.title.localeCompare(b.title));
}
