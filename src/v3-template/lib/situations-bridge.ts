// Pont Situations ↔ domaine réel — PD.4, mandat "Product Dressing —
// Situations & Flux Real Domain Integration". Même discipline que
// landing-bridge.ts/flux-bridge.ts : le SEUL endroit où l'écran
// Situations (gabarit gelé) touche le domaine réel Mbàmbulaan.
//
// SituationRowView.id est un entier séquentiel (0..N-1), pas
// Situation.id (une chaîne) — même raison que FluxRowView (flux-bridge.ts) :
// AppState.sitOpen/sitChoice (state.ts, gabarit gelé) sont typés `number`,
// laissés inchangés pour ce lot.
import { DEMO_STATE } from "./demo-state";
import type { Decision, DecisionType, Situation } from "@/domain/types";
import { decisionTypeLabels } from "@/domain/types";
import {
  buildKnownItems,
  buildRealTimeline,
  buildSituationMetrics,
  buildSituationSources,
  buildSituationsAging,
  buildSituationsFunnel,
  buildUncertainties,
  isOpenSituation,
  resolveFindingConvergence,
  resolveMaritimeContext,
  situationAgeDays,
  situationRecommendation,
  situationStageBucket,
  trustGlyph,
  trustGlyphTier
} from "@/domain/situation-intelligence";
import { trustLabels } from "@/lib/status-tokens";
import { formatCalendarDate } from "./landing-bridge";

// Sévérité à 3 paliers (mandat §7, "preserve the frozen V3 structure") —
// même palette exacte que celle déjà utilisée par l'Atlas (theme.ts :
// LV/LVD/LVT), jamais une nouvelle couleur. "faible"/"moyenne" partagent
// le palier "Modéré" : le gabarit n'a que 3 niveaux visuels pour 4
// priorités réelles, un collapsus documenté plutôt qu'une distinction
// fabriquée.
const SEVERITY_BY_PRIORITY: Record<Situation["priority"], { label: "Critique" | "Élevé" | "Modéré"; color: string; textColor: string }> = {
  critique: { label: "Critique", color: "#C8452B", textColor: "#A63A22" },
  haute: { label: "Élevé", color: "#D89A4A", textColor: "#8E6420" },
  moyenne: { label: "Modéré", color: "#9FB9CE", textColor: "#4A6478" },
  faible: { label: "Modéré", color: "#9FB9CE", textColor: "#4A6478" }
};

const STAGE_LABELS = ["", "Signal reçu", "En instruction", "Qualifiée", "Résultat/close"];

function sinceLabel(state: typeof DEMO_STATE, situation: Situation): string {
  const days = situationAgeDays(state, situation);
  if (days === undefined) return "ancienneté inconnue";
  if (days === 0) return "aujourd'hui";
  if (days === 1) return "depuis 1 jour";
  if (days < 14) return `depuis ${days} jours`;
  if (days < 60) return `depuis ${Math.round(days / 7)} semaines`;
  return `depuis ${Math.round(days / 30)} mois`;
}

export interface SituationRowView {
  id: number;
  realId: string;
  territoryLabel: string;
  title: string;
  severityLabel: "Critique" | "Élevé" | "Modéré";
  severityColor: string;
  severityTextColor: string;
  trustGlyph: string;
  trustLabel: string;
  trustTier: 0 | 1 | 2;
  since: string;
  stageBucket: 1 | 2 | 3 | 4;
  stageLabel: string;
  priority: Situation["priority"];
  isOpen: boolean;
}

function territoryName(situation: Situation): string {
  return DEMO_STATE.territories.find((t) => t.id === situation.territoryId)?.name ?? situation.territoryId;
}

function toRowView(situation: Situation, index: number): SituationRowView {
  const severity = SEVERITY_BY_PRIORITY[situation.priority];
  const stageBucket = situationStageBucket(situation);
  return {
    id: index,
    realId: situation.id,
    territoryLabel: territoryName(situation),
    title: situation.title,
    severityLabel: severity.label,
    severityColor: severity.color,
    severityTextColor: severity.textColor,
    trustGlyph: trustGlyph(situation.trust),
    trustLabel: trustLabels[situation.trust],
    trustTier: trustGlyphTier(situation.trust),
    since: sinceLabel(DEMO_STATE, situation),
    stageBucket,
    stageLabel: STAGE_LABELS[stageBucket],
    priority: situation.priority,
    isOpen: isOpenSituation(situation)
  };
}

// SITUATION_ROWS — triées par ancienneté décroissante de première trace
// connue (la plus ancienne en tête), même convention de lecture que le
// reste du produit (Débarquements récents, etc., "le plus significatif
// en premier").
const sortedSituations = [...DEMO_STATE.situations].sort((a, b) => {
  const aAge = situationAgeDays(DEMO_STATE, a) ?? 0;
  const bAge = situationAgeDays(DEMO_STATE, b) ?? 0;
  return bAge - aAge || a.id.localeCompare(b.id);
});

export const SITUATION_ROWS: SituationRowView[] = sortedSituations.map(toRowView);

export interface SituationHeaderStats {
  openCount: number;
  criticalCount: number;
  toQualifyCount: number;
  closedWithProofCount: number;
}

export function buildSituationHeaderStats(): SituationHeaderStats {
  const open = DEMO_STATE.situations.filter(isOpenSituation);
  const funnel = buildSituationsFunnel(DEMO_STATE);
  return {
    openCount: open.length,
    criticalCount: open.filter((s) => s.priority === "critique").length,
    toQualifyCount: DEMO_STATE.situations.filter((s) => situationStageBucket(s) === 1).length,
    closedWithProofCount: funnel[3].count
  };
}

export function getSituationsFunnelView() {
  return buildSituationsFunnel(DEMO_STATE).map((step) => ({ label: step.label, count: step.count, pctLabel: `${step.pct}%`, read: step.read }));
}

export function getSituationsAgingView() {
  return buildSituationsAging(DEMO_STATE);
}

export interface SituationMetricView {
  value: string;
  label: string;
}

export interface SituationTimelineRow {
  dateLabel: string;
  label: string;
  detail: string;
  who: string;
}

export interface SituationSourceRow {
  kind: "signal" | "finding" | "evidence";
  label: string;
  detail?: string;
  trustLabel: string;
  glyph: string;
}

export interface MaritimeContextRow {
  kind: string;
  label: string;
  detail?: string;
}

export interface SituationOptionView {
  decisionType: DecisionType;
  label: string;
  suggested: boolean;
  suggestionReason?: string;
}

export interface SituationDetailView extends SituationRowView {
  description: string;
  channelLabel?: string;
  nextStep: string;
  known: Array<{ label: string; detail: string }>;
  unknown: Array<{ label: string; detail: string }>;
  metrics: SituationMetricView[];
  timeline: SituationTimelineRow[];
  sources: SituationSourceRow[];
  maritimeContext: MaritimeContextRow[];
  convergenceNote?: string;
  systemNote?: string;
  systemSuggestion?: string;
  systemRisks: string[];
  options: SituationOptionView[];
}

function timeLabel(iso: string): string {
  const time = new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });
  return `${formatCalendarDate(iso.slice(0, 10))} ${time}`;
}

const ALL_DECISION_TYPES = Object.keys(decisionTypeLabels) as DecisionType[];

export function getSituationDetail(rowId: number): SituationDetailView | undefined {
  const situation = sortedSituations[rowId];
  if (!situation) return undefined;
  const row = toRowView(situation, rowId);

  const firstSignalChannel = (() => {
    const signals = DEMO_STATE.signals.filter((s) => situation.signalIds.includes(s.id));
    return signals[0]?.channel;
  })();

  const recommendation = situationRecommendation(DEMO_STATE, situation);
  const maritime = resolveMaritimeContext(DEMO_STATE, situation);
  const convergence = resolveFindingConvergence(DEMO_STATE, situation);

  return {
    ...row,
    description: situation.description,
    channelLabel: firstSignalChannel,
    nextStep: situation.nextStep,
    known: buildKnownItems(DEMO_STATE, situation),
    unknown: buildUncertainties(DEMO_STATE, situation),
    metrics: buildSituationMetrics(DEMO_STATE, situation).map((m) => ({ value: String(m.value), label: m.label })),
    timeline: buildRealTimeline(DEMO_STATE, situation).map((entry) => ({ dateLabel: timeLabel(entry.at), label: entry.label, detail: entry.detail, who: entry.who })),
    sources: buildSituationSources(DEMO_STATE, situation).map((source) => ({
      kind: source.kind,
      label: source.label,
      detail: source.detail,
      trustLabel: trustLabels[source.trust],
      glyph: trustGlyph(source.trust)
    })),
    // Contexte maritime (mandat §9) — vide pour toute Situation dont le
    // Finding (s'il existe) ne cite aucun Vessel/FishingTrip/Landing/
    // Infrastructure/Capacity/Site : jamais déduit du seul territoire
    // (mandat §10). Cf. rapport de lot pour le constat d'audit (0
    // Situation du Demo World actuel n'en porte à ce jour — le mécanisme
        // reste réel et générique).
    maritimeContext: maritime.map((item) => ({ kind: item.ref.objectType, label: item.resolved.label, detail: item.resolved.detail })),
    // convergenceNote (mandat §14) — P2.3-A réutilisé tel quel
    // (finding-convergence.ts) : présent uniquement si le Finding de
    // cette Situation appartient réellement à un groupe de convergence
    // (référence croisée entre Finding, ou même source citée par
    // plusieurs). 0/31 situations du Demo World actuel en ont un
    // aujourd'hui (audit PD.4, cf. rapport de lot) — le mécanisme reste
    // réel et générique.
    convergenceNote: convergence
      ? `Ce constat converge avec ${convergence.findingIds.length - 1} autre${convergence.findingIds.length - 1 > 1 ? "s" : ""} constat${convergence.findingIds.length - 1 > 1 ? "s" : ""} documentaire${convergence.findingIds.length - 1 > 1 ? "s" : ""} — ${convergence.decisionBoundary}`
      : undefined,
    systemNote: recommendation?.reason,
    systemSuggestion: recommendation ? `${recommendation.firstAction} (${recommendation.objective})` : undefined,
    systemRisks: recommendation?.risks ?? [],
    options: ALL_DECISION_TYPES.map((decisionType) => ({
      decisionType,
      label: decisionTypeLabels[decisionType],
      suggested: decisionType === "ouvrir_coordination" && Boolean(recommendation),
      suggestionReason: decisionType === "ouvrir_coordination" && recommendation ? recommendation.reason : undefined
    }))
  };
}

// Description fidèle de create_decision (mandat §15) — jamais une
// exécution simulée : /private-v3 ne mute aucun état.
export function describeDecisionEffect(option: SituationOptionView): string {
  return `Ceci enregistrerait une Decision réelle (${option.label}) rattachée à cette situation, avec motif, auteur et horodatage (create_decision) — non exécuté dans cet environnement de démonstration.`;
}

export type { Decision };
