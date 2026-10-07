// Pont Brief ↔ décisions attendues réelles — etat-v5 checkpoint F.1
// (clôture de la dette documentée en F). "Décisions attendues" lisait
// jusqu'ici data/brief.ts BRIEF_DEC, une fixture figée : un arbitrage
// dont la Situation porte déjà une Decision réelle enregistrée
// (state.decisions) continuait d'y apparaître comme attendu — même
// défaut déjà corrigé pour la Présentation (presentation-bridge.ts) et la
// décision attendue d'un programme (programme-bridge.ts). Même doctrine,
// même fonction canonique (findLatestDecisionForSituation,
// situations-bridge.ts), jamais une seconde logique d'exclusion.
//
// La source de vérité devient directement ARB (data/arbitrages.ts), pas
// BRIEF_DEC : un des trois éléments de BRIEF_DEC ("Instruire le
// financement du volet froid Petite-Côte") ne correspond à aucun
// arbitrage réel (aucun titre ARB ne lui correspond) — plutôt que
// d'inventer une correspondance, cet écran affiche désormais uniquement
// ce que le domaine peut réellement soutenir, honnêtement réduit si
// nécessaire (voir getPendingBriefDecisions ci-dessous).
import { DEMO_STATE } from "./demo-state";
import type { ProductState } from "@/domain/types";
import { isOpenSituation } from "@/domain/situation-intelligence";
import { getArbitrageItems, type ArbitrageItemView } from "./arbitrages-bridge";
import { getOpportunities } from "./opportunity-bridge";
import { getProgrammePortfolioMetrics } from "./programme-bridge";
import { BRIEF_PROG } from "../data/brief";

export interface BriefDecisionView {
  dueN: string;
  dueU: string;
  dueC: string;
  title: string;
  meta: string;
}

// dueParts — ArbitrageItemView.dueLabel est soit au format "J−2"/"J−4"
// (situation-anchoré, cf. data/arbitrages.ts), soit "—" (opportunité
// pending_arbitration, cf. arbitrages-bridge.ts : "l'instruction est
// terminée", aucun délai en jours ne lui correspond) — alors que le
// gabarit V3 gelé (data/brief.ts BRIEF_DEC, composition visuelle
// inchangée) attend un nombre et une unité séparés pour ce même fait.
// Un simple reformatage, aucune donnée nouvelle ; "—" reste "—", sans
// unité inventée.
function dueParts(dueLabel: string): { dueN: string; dueU: string } {
  if (dueLabel === "—") return { dueN: "—", dueU: "" };
  const digits = dueLabel.replace(/[^0-9]/g, "");
  return { dueN: digits || dueLabel, dueU: "jours" };
}

// getPendingBriefDecisions (G2.4, correctif "Brief Data Alignment") —
// lisait jusqu'ici uniquement ARB (data/arbitrages.ts) filtré sans
// décision réelle, AVANT que G2.2 ne fusionne deux sources d'arbitrage
// réelles (situations ET ProgramOpportunity pending_arbitration,
// lib/arbitrages-bridge.ts getArbitrageItems) pour l'écran Arbitrages lui-
// même — laissant le Brief afficher un compte des « décisions attendues »
// incohérent avec Arbitrages (une opportunité réellement en attente
// d'arbitrage n'y apparaissait jamais). Désormais la MÊME source unique,
// jamais une deuxième logique de comptage.
export function getPendingBriefDecisions(state: ProductState = DEMO_STATE): BriefDecisionView[] {
  return getArbitrageItems(state).map((item: ArbitrageItemView) => ({
    ...dueParts(item.dueLabel),
    dueC: item.dueColor,
    title: item.title,
    meta: `Arbitrage · ${item.metaLabel}`
  }));
}

// --- G2.4 "Brief Data Alignment" — synthèse honnête du Brief ------------
//
// Le hero ("La Petite-Côte concentre l'attention...") et la "Lecture en 20
// secondes" étaient jusqu'ici un texte figé par rôle (data/roles.ts), sans
// aucun lien au domaine réel — pouvant contredire silencieusement l'état
// courant (ex. "deux décisions attendues" alors qu'aucune ne l'est
// réellement). getBriefSummary calcule les seuls faits que le domaine peut
// réellement soutenir aujourd'hui ; getBriefHeroLine/getBriefTldrLine n'en
// composent que la mise en mots, jamais une estimation ou une tendance
// fabriquée (cf. KPI tiles, Brief.tsx : "Ne pas inventer des tendances").
export interface BriefSummary {
  attentionTerritoryIds: string[];
  attentionTerritoryNames: string[];
  opportunitiesInProgressCount: number;
  opportunitiesQualifiedCount: number;
  pendingArbitrationsCount: number;
  initiativesInProgressCount: number;
  recentResultsCount: number;
  notableOpportunity?: { problem: string; uiStep: string };
}

export function getBriefSummary(state: ProductState = DEMO_STATE): BriefSummary {
  // attentionTerritoryIds — territoires portant au moins une Situation
  // ouverte de priorité critique ou haute (même seuil que SEVERITY_BY_
  // PRIORITY, situations-bridge.ts) : un fait directement lu depuis le
  // domaine, jamais une estimation.
  const attentionTerritoryIds = Array.from(
    new Set(
      state.situations
        .filter((s) => isOpenSituation(s) && (s.priority === "critique" || s.priority === "haute"))
        .map((s) => s.territoryId)
    )
  );
  const attentionTerritoryNames = attentionTerritoryIds.map((id) => state.territories.find((t) => t.id === id)?.name ?? id);

  // opportunitiesInProgressCount — pas encore arbitrées (uiStepIndex < 3,
  // cf. OPPORTUNITY_UI_STEPS, opportunity-bridge.ts), jamais une opportunité
  // déjà retenue/écartée comptée comme "en instruction".
  const opportunities = getOpportunities(state);
  const inProgress = opportunities.filter((o) => o.uiStepIndex < 3);

  const initiativesInProgress = state.initiatives.filter((i) => i.status !== "terminee");

  return {
    attentionTerritoryIds,
    attentionTerritoryNames,
    opportunitiesInProgressCount: inProgress.length,
    opportunitiesQualifiedCount: inProgress.filter((o) => o.uiStep === "Qualifiée").length,
    // pendingArbitrationsCount — même source unique que getPendingBriefDecisions
    // ci-dessus (getArbitrageItems) : toujours le même nombre affiché dans
    // les deux panneaux du Brief (KPI et "Décisions attendues"), jamais
    // deux comptages divergents.
    pendingArbitrationsCount: getArbitrageItems(state).length,
    initiativesInProgressCount: initiativesInProgress.length,
    recentResultsCount: state.results.length,
    notableOpportunity: inProgress[0] ? { problem: inProgress[0].problem, uiStep: inProgress[0].uiStep } : undefined
  };
}

function plural(n: number, singular: string, plural_: string): string {
  return n > 1 ? plural_ : singular;
}

// getBriefHeroLine — une phrase, jamais une recommandation algorithmique :
// le fait le plus saillant que le domaine peut réellement soutenir
// aujourd'hui, avec un repli honnête si rien ne ressort (mandat Partie B,
// HERO : "pas de texte figé contredisant le runtime").
export function getBriefHeroLine(summary: BriefSummary): string {
  if (summary.attentionTerritoryIds.length > 0 && summary.pendingArbitrationsCount > 0) {
    const n = summary.attentionTerritoryIds.length;
    const m = summary.pendingArbitrationsCount;
    return `${n} territoire${plural(n, "", "s")} sous attention, ${m} décision${plural(m, "", "s")} attendue${plural(m, "", "s")}`;
  }
  if (summary.attentionTerritoryIds.length > 0) {
    const n = summary.attentionTerritoryIds.length;
    return `${n} territoire${plural(n, "", "s")} concentre${plural(n, "", "nt")} les principaux sujets à instruire`;
  }
  if (summary.pendingArbitrationsCount > 0 || summary.opportunitiesInProgressCount > 0) {
    const m = summary.pendingArbitrationsCount;
    const o = summary.opportunitiesInProgressCount;
    return `${m} décision${plural(m, "", "s")} attendue${plural(m, "", "s")} et ${o} opportunité${plural(o, "", "s")} en instruction`;
  }
  return "Aucun territoire ne concentre de sujet critique ou élevé aujourd’hui";
}

// getBriefTldrLine — "Lecture en 20 secondes" : une synthèse à trois
// volets (territoires, décisions, opportunités), chacun honnêtement vide
// si le domaine ne porte rien à ce sujet aujourd'hui.
export function getBriefTldrLine(summary: BriefSummary): string {
  const names = summary.attentionTerritoryNames;
  const territoryPart =
    names.length > 0
      ? `${names.slice(0, 2).join(" et ")}${names.length > 2 ? ` (+${names.length - 2})` : ""} concentre${plural(names.length, "", "nt")} l’attention`
      : "Aucun territoire ne concentre de sujet critique ou élevé actuellement";
  const decisionPart =
    summary.pendingArbitrationsCount > 0
      ? `${summary.pendingArbitrationsCount} arbitrage${plural(summary.pendingArbitrationsCount, "", "s")} réellement en attente de décision`
      : "aucun arbitrage en attente de décision";
  const opportunityPart =
    summary.opportunitiesInProgressCount > 0
      ? `${summary.opportunitiesInProgressCount} opportunité${plural(summary.opportunitiesInProgressCount, "", "s")} en instruction${summary.notableOpportunity ? ` (dont « ${summary.notableOpportunity.problem} »)` : ""}`
      : "aucune opportunité en instruction";
  return `${territoryPart}. ${decisionPart}, ${opportunityPart}.`;
}

// getBriefProgrammeRows (RC1, audit de fonctionnalité) — "Programmes à
// surveiller" affichait jusqu'ici le pourcentage et l'alerte figés de
// data/brief.ts BRIEF_PROG (gabarit gelé), alors que programme-bridge.ts
// calcule déjà le même avancement réel pour Portfolio.tsx/ProgrammeDetail.tsx
// (fixtureId identique) : deux des trois programmes affichaient un
// pourcentage divergent du runtime (43 % contre 37 % réels, 68 % contre
// 56 % réels) — exactement la divergence que l'audit RC1 interdit (§5/§7).
// Mêmes fixtureId/ordre/titres que BRIEF_PROG (aucune redécouverte de
// contenu), seul le pourcentage et le texte d'écart deviennent réels,
// avec le même vocabulaire que Portfolio.tsx (criticalLinkedSituationsCount,
// hasRealMatch), jamais une seconde formulation inventée.
export interface BriefProgrammeRowView {
  id: number;
  title: string;
  pctLabel: string;
  // pctWidth — toujours une valeur CSS "%" valide (jamais "—") pour la
  // barre de progression ; "0%" quand aucun avancement réel n'est mesurable,
  // distincte de pctLabel qui reste le texte honnête affiché.
  pctWidth: string;
  alertLabel: string;
  alertColor: string;
}

export function getBriefProgrammeRows(state: ProductState = DEMO_STATE): BriefProgrammeRowView[] {
  const metrics = getProgrammePortfolioMetrics(state);
  return BRIEF_PROG.map((p) => {
    const m = metrics.find((item) => item.fixtureId === p.id);
    if (!m) {
      return { id: p.id, title: p.title, pctLabel: "—", pctWidth: "0%", alertLabel: "Correspondance réelle non établie", alertColor: "rgba(11,26,42,.5)" };
    }
    const pctLabel = m.avancementPct != null ? `${m.avancementPct}%` : "—";
    const pctWidth = m.avancementPct != null ? `${m.avancementPct}%` : "0%";
    const alertLabel = !m.hasRealMatch
      ? "Correspondance réelle non établie"
      : m.criticalLinkedSituationsCount >= 1
        ? `${m.criticalLinkedSituationsCount} situation${m.criticalLinkedSituationsCount > 1 ? "s" : ""} critique/élevée liée${m.criticalLinkedSituationsCount > 1 ? "s" : ""}`
        : "Aucun écart détecté entre exécution et terrain";
    const alertColor = !m.hasRealMatch ? "rgba(11,26,42,.5)" : m.criticalLinkedSituationsCount >= 1 ? "#B6522F" : "#4E7B5A";
    return { id: p.id, title: m.title, pctLabel, pctWidth, alertLabel, alertColor };
  });
}
