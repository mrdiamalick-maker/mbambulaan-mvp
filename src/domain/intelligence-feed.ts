// Intelligence Feed — LOT 8 (mandat "Maritime Intelligence Engine —
// détecter, expliquer, prioriser sans décider à la place de l'humain").
// Couche d'orchestration PURE entre le moteur de règles déterministe
// (signal-crossing.ts, qui ne connaît que ProductState et ne sait pas ce
// qui a déjà été traité) et le pipeline de connaissance
// (knowledge-pipeline.ts, seule porte d'écriture d'un Finding). Ce fichier
// ne modifie jamais l'état — même discipline que territory-intelligence.ts
// (LOT 5) et actor-network.ts (LOT 7) : une projection recalculée à
// chaque appel, jamais un cache ni un objet stocké.
//
// Ce qu'il assemble : "voici ce que les règles détectent maintenant, et
// voici, parmi ces détections, celles qui ont déjà reçu une décision
// humaine" (Finding enregistré, ou détection écartée avec une raison) —
// grâce à Finding.detectionKey (mandat §6, idempotence). Une détection
// sans Finding correspondant reste "nouvelle" : à examiner.
import {
  computeSignalCrossingAlerts,
  signalCrossingAlertToFindingDraft,
  INTELLIGENCE_RULE_REGISTRY,
  type FindingDraftFromAlert,
  type SignalCrossingAlert
} from "./signal-crossing";
import type { Finding, ProductState } from "./types";

export type IntelligenceFeedItemStatus = "nouvelle" | "enregistree" | "ecartee";

export interface IntelligenceFeedItem {
  alert: SignalCrossingAlert;
  draft: FindingDraftFromAlert;
  status: IntelligenceFeedItemStatus;
  // Renseigné seulement quand status !== "nouvelle" — le Finding déjà
  // matérialisé pour cette occurrence (enregistré ou écarté).
  finding?: Finding;
}

export function computeIntelligenceFeed(state: ProductState): IntelligenceFeedItem[] {
  return computeSignalCrossingAlerts(state).map((alert) => {
    const draft = signalCrossingAlertToFindingDraft(alert);
    const existing = state.findings.find((item) => item.detectionKey === draft.detectionKey);
    if (!existing) return { alert, draft, status: "nouvelle" as const };
    return {
      alert,
      draft,
      status: existing.status === "rejected" ? ("ecartee" as const) : ("enregistree" as const),
      finding: existing
    };
  });
}

// Observabilité du moteur (mandat §32) — "pas un tableau de bord
// technique complexe, mais savoir : règles exécutées, détections
// produites, détections examinées, Finding créés, rejets." Entièrement
// calculée à partir de computeIntelligenceFeed, aucun compteur stocké
// séparément (qui pourrait diverger de la réalité) — même discipline
// "jamais de score, toujours une projection honnête" que le reste du
// produit. Pas de KPI de performance d'IA (mandat §32, dernier point) :
// ces nombres décrivent une activité, jamais une qualité.
export interface IntelligenceObservability {
  rulesActive: number;
  detectionsProduced: number;
  findingsCreatedFromRules: number;
  detectionsDismissed: number;
  // "détections examinées" = celles ayant déjà reçu une décision humaine
  // (enregistrées ou écartées) — "Examiner" seul (sans décision) n'est pas
  // une commande persistée, donc pas comptabilisé séparément ici.
  detectionsExamined: number;
}

export function computeIntelligenceObservability(state: ProductState): IntelligenceObservability {
  const feed = computeIntelligenceFeed(state);
  const findingsCreatedFromRules = feed.filter((item) => item.status === "enregistree").length;
  const detectionsDismissed = feed.filter((item) => item.status === "ecartee").length;
  return {
    rulesActive: INTELLIGENCE_RULE_REGISTRY.filter((rule) => rule.active).length,
    detectionsProduced: feed.length,
    findingsCreatedFromRules,
    detectionsDismissed,
    detectionsExamined: findingsCreatedFromRules + detectionsDismissed
  };
}
