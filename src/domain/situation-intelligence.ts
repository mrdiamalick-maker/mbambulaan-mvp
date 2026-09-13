// Situation Intelligence — PD.4 (mandat "Product Dressing — Situations &
// Flux Real Domain Integration"). Moteurs de lecture PURS pour l'écran
// Situations : synthèse, chronologie, sources, contexte maritime,
// suggestion système. Réutilise délibérément ce qui existe déjà plutôt
// que de dupliquer un second pipeline (mandat §2/§7) :
//   - situation-narrative.ts (LOT 1/2/4) : collectSituationSignals,
//     resolveFindingForSituation, findKnowledgeGapForSituation,
//     resolveSourceRefDisplay, describeFindingTrust,
//     relatedDecisionsForSituation.
//   - coordination-engine.ts (recommendCoordination) : "ce que le
//     système suggère", jamais recalculé ici.
//   - knowledge-pipeline.ts (resolveKnowledgeSourceRef) : validité d'une
//     référence avant affichage.
// Rien ici ne mute ProductState ni ne persiste quoi que ce soit — lecture
// seule, recalculée à chaque appel (même discipline que
// territory-intelligence.ts, PD.1/PD.3).
import type {
  Decision,
  Evidence,
  Finding,
  KnowledgeSourceRef,
  ProductState,
  Signal,
  Situation,
  TrustLevel
} from "./types";
import {
  collectSituationSignals,
  relatedDecisionsForSituation,
  resolveFindingForSituation,
  resolveSourceRefDisplay,
  findKnowledgeGapForSituation,
  type ResolvedSource
} from "./situation-narrative";
import { recommendCoordination, type CoordinationRecommendation } from "./coordination-engine";
import { deriveDatasetReferenceAt } from "./signal-crossing";
import { computeFindingConvergences, type FindingConvergenceGroup } from "./finding-convergence";

export function isOpenSituation(situation: Situation): boolean {
  return situation.status !== "reglee";
}

// Bucket de progression à 4 paliers (mandat §7 : "Preserve the frozen V3
// structure ... tabs"), aligné sur l'ordre réel de SituationStatus plutôt
// que sur une correspondance 1:1 inexistante (8 statuts réels pour 4
// paliers du gabarit) :
//  1 = reçue, pas encore qualifiée (recue)
//  2 = en cours de qualification/priorisation (qualification, priorisee)
//  3 = une réponse est engagée (coordination, intervention, attente)
//  4 = un résultat existe, close ou non (resultat, reglee)
export function situationStageBucket(situation: Situation): 1 | 2 | 3 | 4 {
  switch (situation.status) {
    case "recue":
      return 1;
    case "qualification":
    case "priorisee":
      return 2;
    case "coordination":
    case "intervention":
    case "attente":
      return 3;
    case "resultat":
    case "reglee":
      return 4;
  }
}

// Bucket de glyphe de confiance à 3 paliers — UNIQUEMENT pour l'élément
// visuel décoratif (○/◐/●) déjà utilisé par le gabarit gelé, jamais pour
// le libellé affiché (mandat §17 : "do not flatten these into
// verified/unverified" — le libellé textuel reste toujours l'un des 10
// TrustLevel réels, cf. trustGlyphAndLabel ci-dessous).
const TRUST_GLYPH_TIER: Record<TrustLevel, 0 | 1 | 2> = {
  declaree: 0,
  estimee: 0,
  contestee: 0,
  expiree: 0,
  observee: 1,
  rapprochee: 1,
  documentee: 1,
  verifiee: 2,
  consolidee: 2,
  officielle: 2
};
const TRUST_GLYPHS = ["○", "◐", "●"] as const;

export function trustGlyph(trust: TrustLevel): string {
  return TRUST_GLYPHS[TRUST_GLYPH_TIER[trust]];
}

export function trustGlyphTier(trust: TrustLevel): 0 | 1 | 2 {
  return TRUST_GLYPH_TIER[trust];
}

// "now" du jeu de démonstration — même ancrage que signal-crossing.ts
// (mandat implicite, leçon PD.3 : calculer une ancienneté contre
// Date.now() rendrait tout artificiellement "très vieux" puisque les
// dates simulées sont figées mi-2026). Repli sur la date la plus récente
// trouvée dans les Situation elles-mêmes si deriveDatasetReferenceAt ne
// résout rien (jeu de données non "demonstration").
function referenceTime(state: ProductState): number {
  const derived = deriveDatasetReferenceAt(state);
  if (derived) {
    const t = Date.parse(derived);
    if (!Number.isNaN(t)) return t;
  }
  const allTimestamps = state.situations.flatMap((s) => s.history.map((h) => Date.parse(h.at))).filter((t) => !Number.isNaN(t));
  return allTimestamps.length > 0 ? Math.max(...allTimestamps) : Date.now();
}

// earliestKnownAt — première date réellement connue pour cette Situation
// (premliteralement son plus ancien HistoryEntry). Jamais Situation elle-
// même n'a de createdAt propre ; l'historique est la seule source réelle
// de "depuis quand". Retourne undefined si l'historique est vide (ne
// devrait pas arriver, mais aucune Situation n'est garantie non-vide par
// le type — mieux vaut un undefined honnête qu'une date fabriquée).
export function situationOpenedAt(situation: Situation): string | undefined {
  if (situation.history.length === 0) return undefined;
  return [...situation.history].map((h) => h.at).sort()[0];
}

export function situationAgeDays(state: ProductState, situation: Situation): number | undefined {
  const openedAt = situationOpenedAt(situation);
  if (!openedAt) return undefined;
  const opened = Date.parse(openedAt);
  if (Number.isNaN(opened)) return undefined;
  return Math.max(0, Math.floor((referenceTime(state) - opened) / (24 * 60 * 60 * 1000)));
}

// --- Synthèse : ce que nous savons / ce qui reste incertain -----------

export interface SituationKnownItem {
  label: string;
  detail: string;
}

// buildKnownItems — chaque entrée vient d'un champ réel (description,
// Finding.statement/explanation, result, confirmation) — jamais un texte
// composé pour l'occasion (mandat §8 : "Do not generate unsupported
// narrative").
export function buildKnownItems(state: ProductState, situation: Situation): SituationKnownItem[] {
  const items: SituationKnownItem[] = [{ label: "Description", detail: situation.description }];
  const finding = resolveFindingForSituation(state, situation);
  if (finding) {
    items.push({ label: "Constat", detail: finding.statement });
    items.push({ label: "Explication du constat", detail: finding.explanation });
  }
  if (situation.result) items.push({ label: "Résultat", detail: situation.result });
  if (situation.confirmation) items.push({ label: "Confirmation", detail: situation.confirmation });
  return items;
}

export interface SituationUncertainty {
  label: string;
  detail: string;
}

// buildUncertainties — dérivé uniquement de champs réels et de
// findKnowledgeGapForSituation (situation-narrative.ts, déjà écrit) :
// jamais une liste de "unknowns" inventée par situation (mandat §8).
export function buildUncertainties(state: ProductState, situation: Situation): SituationUncertainty[] {
  const items: SituationUncertainty[] = [];
  if (!situation.findingId) {
    items.push({ label: "Compréhension", detail: "Aucun constat formalisé pour ce dossier à ce stade." });
  }
  const knowledgeGap = findKnowledgeGapForSituation(state, situation);
  if (knowledgeGap) {
    items.push({ label: "Connaissance manquante identifiée", detail: knowledgeGap.statement });
  }
  if (situation.waitingReason) {
    items.push({ label: "En attente", detail: situation.waitingReason });
  }
  if (TRUST_GLYPH_TIER[situation.trust] === 0) {
    items.push({ label: "Confiance", detail: "Ce dossier n'a pas encore été recoupé par une seconde source." });
  }
  return items;
}

// --- KPI réels (remplace les 4 tuiles "affected" du gabarit, mandat
// §8 : mêmes 4 emplacements visuels, contenu entièrement réel et
// traçable) ---------------------------------------------------------

export interface SituationMetric {
  value: number;
  label: string;
}

export function buildSituationMetrics(state: ProductState, situation: Situation): SituationMetric[] {
  const signals = collectSituationSignals(state, situation);
  const evidences = state.evidences.filter((item) => item.situationId === situation.id);
  const decisions = relatedDecisionsForSituation(state, situation);
  const ageDays = situationAgeDays(state, situation);
  return [
    { value: signals.length, label: signals.length > 1 ? "signaux liés" : "signal lié" },
    { value: ageDays ?? 0, label: ageDays === 1 ? "jour ouvert" : "jours ouverts" },
    { value: evidences.length, label: evidences.length > 1 ? "preuves enregistrées" : "preuve enregistrée" },
    { value: decisions.length, label: decisions.length > 1 ? "décisions prises" : "décision prise" }
  ];
}

// --- Chronologie réelle (mandat §12) -----------------------------------

export interface SituationTimelineEntry {
  at: string;
  label: string;
  detail: string;
  who: string;
  kind: "history" | "decision" | "evidence";
}

// buildRealTimeline — fusionne Situation.history avec les horodatages
// réels d'audit qui s'y rattachent (Decision.decidedAt, Evidence
// rattachée à cette situation) — mandat §12 : "real Situation.history and
// related command/audit timestamps". Jamais un événement inventé ; si
// l'historique est court, la chronologie reste courte (§12 : "show sparse
// truth").
export function buildRealTimeline(state: ProductState, situation: Situation): SituationTimelineEntry[] {
  const entries: SituationTimelineEntry[] = situation.history.map((h) => ({
    at: h.at,
    label: h.label,
    detail: h.detail,
    who: h.actor,
    kind: "history" as const
  }));

  for (const decision of relatedDecisionsForSituation(state, situation)) {
    entries.push({
      at: decision.decidedAt,
      label: `Décision — ${decision.type}`,
      detail: decision.rationale,
      who: decision.decidedByActorId,
      kind: "decision"
    });
  }

  for (const evidence of state.evidences.filter((item) => item.situationId === situation.id)) {
    entries.push({
      at: evidence.recordedAt,
      label: `Preuve enregistrée — ${evidence.label}`,
      detail: evidence.detail,
      who: evidence.recordedByActorId,
      kind: "evidence"
    });
  }

  return entries.sort((a, b) => a.at.localeCompare(b.at));
}

// --- Sources réelles (mandat §13) --------------------------------------

export interface SituationSourceItem {
  kind: "signal" | "finding" | "evidence";
  label: string;
  detail?: string;
  trust: TrustLevel;
}

export function buildSituationSources(state: ProductState, situation: Situation): SituationSourceItem[] {
  const items: SituationSourceItem[] = [];
  for (const signal of collectSituationSignals(state, situation)) {
    items.push({ kind: "signal", label: signal.title, detail: signal.description, trust: signal.trust });
  }
  const finding = resolveFindingForSituation(state, situation);
  if (finding) items.push({ kind: "finding", label: finding.title, detail: finding.statement, trust: finding.trust });
  for (const evidence of state.evidences.filter((item) => item.situationId === situation.id)) {
    items.push({ kind: "evidence", label: evidence.label, detail: evidence.detail, trust: evidence.trust });
  }
  return items;
}

// --- Contexte maritime (mandat §9 — capacité nouvelle de ce lot) -------
//
// Discipline stricte (mandat §9/§10) : UNIQUEMENT via une référence
// explicite et déterministe — le Finding qui explique la Situation citant
// un Vessel/FishingTrip/Landing/Infrastructure/Capacity/Site dans ses
// sourceRefs. Jamais déduit du seul territoire partagé (mandat §10 :
// "If a Situation and a Landing share only a territory: do NOT say the
// landing caused the Situation"). Un lien "related evidence" reste
// toujours présenté comme un élément de contexte documenté, jamais une
// cause (mandat §10).
const MARITIME_SOURCE_TYPES: ReadonlySet<KnowledgeSourceRef["objectType"]> = new Set([
  "vessel",
  "fishing_trip",
  "landing",
  "infrastructure",
  "capacity",
  "site"
]);

export interface MaritimeContextItem {
  ref: KnowledgeSourceRef;
  resolved: ResolvedSource;
}

// resolveMaritimeContext — retourne un tableau vide si rien n'est
// traçable (état honnête, mandat §16/§11) : aujourd'hui, aucun des
// Finding du jeu de démonstration ne cite ce type de source (audit PD.4,
// cf. rapport de lot) — le mécanisme est réel et générique, prêt à
// s'activer dès qu'un Finding réel citera l'un de ces types d'objet.
export function resolveMaritimeContext(state: ProductState, situation: Situation): MaritimeContextItem[] {
  const finding = resolveFindingForSituation(state, situation);
  if (!finding) return [];
  const items: MaritimeContextItem[] = [];
  for (const ref of finding.sourceRefs) {
    if (!MARITIME_SOURCE_TYPES.has(ref.objectType)) continue;
    const resolved = resolveSourceRefDisplay(state, ref);
    if (resolved) items.push({ ref, resolved });
  }
  return items;
}

// --- Convergence documentaire (mandat §14, réutilise P2.3-A tel quel) --
//
// "Do not change its predicate" : computeFindingConvergences est appelé
// directement, jamais réécrit ni approché par un raccourci local. Une
// Situation n'y participe que via le Finding qui l'explique
// (Situation.findingId) — un IncomingMessage ou un Signal brut ne compte
// jamais comme convergence (mandat §14, garde déjà assurée par
// finding-convergence.ts lui-même, qui ne travaille que sur des Finding).
export function resolveFindingConvergence(state: ProductState, situation: Situation): FindingConvergenceGroup | undefined {
  const finding = resolveFindingForSituation(state, situation);
  if (!finding) return undefined;
  return computeFindingConvergences(state).find((group) => group.findingIds.includes(finding.id));
}

// --- Suggestion système (mandat §8, réutilise coordination-engine.ts) --

export function situationRecommendation(state: ProductState, situation: Situation): CoordinationRecommendation | null {
  return recommendCoordination(state, situation);
}

// --- Vue d'ensemble de l'écran (funnel + ancienneté, mandat §7) --------

export interface SituationsFunnelStep {
  label: string;
  count: number;
  pct: number;
  read: string;
}

// buildSituationsFunnel — projections réelles remplaçant FUNNEL (mandat
// §7). "Signaux qualifiés" = disposition différente de "nouveau" (une
// décision humaine a eu lieu, quelle qu'elle soit) ; "closes avec preuve"
// exige un statut réglé ET au moins une Evidence réelle rattachée — un
// dossier réglé sans preuve enregistrée reste compté comme "réglé" dans
// son propre statut mais pas dans ce palier, plus exigeant (mandat §7 :
// "closes avec preuve" doit signifier une trace vérifiable, pas
// seulement un statut terminal).
export function buildSituationsFunnel(state: ProductState): SituationsFunnelStep[] {
  const totalSignals = state.signals.length;
  const qualifiedSignals = state.signals.filter((s) => s.disposition !== "nouveau").length;
  const totalSituations = state.situations.length;
  const closedWithProof = state.situations.filter(
    (s) => s.status === "reglee" && state.evidences.some((e) => e.situationId === s.id)
  ).length;

  const pct = (n: number) => (totalSignals > 0 ? Math.round((n / totalSignals) * 100) : 0);

  return [
    { label: "Signaux reçus", count: totalSignals, pct: 100, read: `${totalSignals} signaux reçus sur la période, tous canaux confondus.` },
    {
      label: "Signaux qualifiés",
      count: qualifiedSignals,
      pct: pct(qualifiedSignals),
      read: `${totalSignals - qualifiedSignals} signal${totalSignals - qualifiedSignals > 1 ? "aux" : ""} encore au statut "nouveau", sans décision de qualification.`
    },
    {
      label: "Situations suivies",
      count: totalSituations,
      pct: pct(totalSituations),
      read: `${totalSituations} situations ouvertes au total ; ${state.situations.filter(isOpenSituation).length} restent ouvertes aujourd'hui.`
    },
    {
      label: "Closes avec preuve",
      count: closedWithProof,
      pct: pct(closedWithProof),
      read: `Seules ${closedWithProof} situations ont été closes avec au moins une preuve enregistrée — c'est l'indicateur de maturité retenu.`
    }
  ];
}

export interface SituationsAgingBucket {
  label: string;
  count: number;
}

const AGING_BUCKETS: Array<{ label: string; max: number }> = [
  { label: "< 2 j", max: 2 },
  { label: "2–7 j", max: 7 },
  { label: "1–3 sem.", max: 21 },
  { label: "3–6 sem.", max: 42 },
  { label: "> 6 sem.", max: Infinity }
];

export function buildSituationsAging(state: ProductState): SituationsAgingBucket[] {
  const openSituations = state.situations.filter(isOpenSituation);
  const buckets = AGING_BUCKETS.map((b) => ({ label: b.label, count: 0 }));
  for (const situation of openSituations) {
    const age = situationAgeDays(state, situation) ?? 0;
    const index = AGING_BUCKETS.findIndex((b) => age <= b.max);
    buckets[index === -1 ? buckets.length - 1 : index].count += 1;
  }
  return buckets;
}

// Ré-exports pratiques pour le pont v3-template (évite d'importer
// situation-narrative.ts en plus de ce fichier pour les mêmes objets).
export { collectSituationSignals, resolveFindingForSituation, relatedDecisionsForSituation };
export type { Decision, Evidence, Finding, Signal, Situation };
