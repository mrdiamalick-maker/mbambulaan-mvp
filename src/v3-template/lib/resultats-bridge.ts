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
import { getOpportunities } from "./opportunity-bridge";

const STATUS_LABEL: Record<string, string> = {
  cadrage: "En cadrage",
  financee: "Financée",
  execution: "En exécution",
  terminee: "Terminée"
};

// nextStepLabel (G2.3) — le domaine ne porte aucun champ "prochaine étape"
// sur Initiative (contrairement à Situation.nextStep) : dérivé du statut
// réel, jamais un texte libre inventé par dossier. Même discipline que
// STATUS_LABEL ci-dessus : un vocabulaire fixe et documenté, pas une
// génération de texte.
const NEXT_STEP_LABEL: Record<string, string> = {
  cadrage: "Finaliser le cadrage et sécuriser le financement",
  financee: "Démarrer l’exécution",
  execution: "Poursuivre l’exécution jusqu’à la clôture",
  terminee: "Aucune étape suivante — initiative terminée"
};

export interface OriginOpportunityView {
  id: string;
  problem: string;
  uiStep: string;
}

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
  // typeLabel (G2.3 §2) — "programme/projet/pilote/étude/partenariat/
  // autre si disponible" : Initiative (domain/types.ts) ne porte aucun
  // champ de type aujourd'hui — jamais déduit/inventé, donc toujours
  // absent tant que le domaine n'en porte pas un réel.
  typeLabel?: string;
  territoryIds: string[];
  territoryLabel: string;
  objective: string;
  statusLabel: string;
  // nextStepLabel — toujours présent (champ minimum du mandat G2.3 §2),
  // dérivé honnêtement du statut réel (NEXT_STEP_LABEL), jamais un texte
  // de dossier inventé.
  nextStepLabel: string;
  // avancementPct — moyenne de progression baseline→cible sur les
  // indicateurs réels de l'Initiative ; absent si aucun indicateur chiffré
  // n'existe (jamais une estimation fabriquée).
  avancementPct?: number;
  responsibleLabel?: string;
  originOpportunity?: OriginOpportunityView;
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

// resolveNextDecision (correctif de dette G2.2, mandat G2.3 §7) — l'ancien
// filtre ne retenait qu'une simple proximité territoriale (tout arbitrage
// partageant un territoire avec l'Initiative, sans rapport réel entre les
// deux objets) : un faux lien, explicitement interdit par le mandat G2.3.
// Désormais fondé sur une relation canonique réelle uniquement :
// - le même Situation.id référencé à la fois par l'Initiative
//   (situationIds) et par l'arbitrage (ARB.situationId) ;
// - ou la même ProgramOpportunity (initiative.programOpportunityId ===
//   l'opportunité pending_arbitration de l'item).
// Absence de relation canonique ⇒ undefined, jamais un lien de proximité.
function resolveNextDecision(state: ProductState, initiative: ProductState["initiatives"][number]): NextDecisionView | undefined {
  const items = getArbitrageItems(state);
  const match = items.find(
    (item) =>
      (item.situationId && initiative.situationIds.includes(item.situationId)) ||
      (item.opportunityId && item.opportunityId === initiative.programOpportunityId)
  );
  return match ? { title: match.title, territoryId: match.territoryId } : undefined;
}

// resolveOriginOpportunity (G2.3 §2/§3) — l'opportunité réelle dont cette
// Initiative est issue, via programOpportunityId (G1) ; absente si
// l'Initiative n'a pas d'origine opportunité connue (jamais déduite d'une
// simple proximité territoriale ou thématique).
function resolveOriginOpportunity(state: ProductState, initiative: ProductState["initiatives"][number]): OriginOpportunityView | undefined {
  if (!initiative.programOpportunityId) return undefined;
  const opportunity = getOpportunities(state).find((o) => o.id === initiative.programOpportunityId);
  return opportunity ? { id: opportunity.id, problem: opportunity.problem, uiStep: opportunity.uiStep } : undefined;
}

function resolveResponsibleLabel(state: ProductState, initiative: ProductState["initiatives"][number]): string | undefined {
  const owner = state.actors.find((a) => a.id === initiative.ownerId);
  return owner ? `${owner.name} · ${owner.role.replaceAll("_", " ")}` : undefined;
}

function resolveAvancementPct(initiative: ProductState["initiatives"][number]): number | undefined {
  if (initiative.indicators.length === 0) return undefined;
  return Math.round(
    initiative.indicators.reduce((sum, i) => {
      const span = Math.abs(i.target - i.baseline) || 1;
      return sum + Math.min(100, Math.max(0, (Math.abs(i.current - i.baseline) / span) * 100));
    }, 0) / initiative.indicators.length
  );
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
    nextStepLabel: NEXT_STEP_LABEL[initiative.status] ?? "Prochaine étape non documentée.",
    avancementPct: resolveAvancementPct(initiative),
    responsibleLabel: resolveResponsibleLabel(state, initiative),
    originOpportunity: resolveOriginOpportunity(state, initiative),
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
