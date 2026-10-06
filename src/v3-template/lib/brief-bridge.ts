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
import { findLatestDecisionForSituation } from "./situations-bridge";
import { ARB, type Arbitrage } from "../data/arbitrages";

export interface BriefDecisionView {
  dueN: string;
  dueU: string;
  dueC: string;
  title: string;
  meta: string;
}

// isArbitragePending — même filtre que pendingArbitrages
// (presentation-bridge.ts) / preparedArbitration (programme-bridge.ts) :
// un arbitrage sans situationId (ex. ARB[2], arbitrage de portefeuille
// programme) ne peut recevoir aucune Decision réelle et reste donc
// toujours attendu par construction, jamais fabriqué décidé.
function isArbitragePending(state: ProductState, arbitrage: Arbitrage): boolean {
  return !(arbitrage.situationId && findLatestDecisionForSituation(state, arbitrage.situationId));
}

// dueParts — ARB.due est au format "J−2"/"J−4"/"J−9" (texte), alors que
// le gabarit V3 gelé (data/brief.ts BRIEF_DEC, composition visuelle
// inchangée) attend un nombre et une unité séparés pour ce même fait —
// un simple reformatage, aucune donnée nouvelle.
function dueParts(due: string): { dueN: string; dueU: string } {
  const digits = due.replace(/[^0-9]/g, "");
  return { dueN: digits || due, dueU: "jours" };
}

export function getPendingBriefDecisions(state: ProductState = DEMO_STATE): BriefDecisionView[] {
  return ARB.filter((a) => isArbitragePending(state, a)).map((a) => ({
    ...dueParts(a.due),
    dueC: a.dueC,
    title: a.title,
    meta: `Arbitrage · ${a.meta}`
  }));
}
