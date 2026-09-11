// LOT V3.6 ("Results / Analytics — National Performance, Accountability &
// Learning") — dérivations pures pour la lecture analytique de Résultat/
// Changement/Impact, même esprit que domain/programme-intelligence.ts
// (V3.5) et domain/atlas-overview.ts (V3.4) : uniquement des lectures
// depuis un ProductState déjà chargé, aucune commande, aucune donnée
// fabriquée, aucune IA.
//
// Pré-code A/B/C/D/E (mandat §1) — constats structurants :
//  - Result/Outcome/ImpactEvidence (LOT 4) forment le registre CANONIQUE,
//    typé, relié à une preuve (Evidence) et à un niveau d'attribution
//    explicite. Dans ce Demo World : 1 Result, 1 Outcome, 0
//    ImpactEvidence — le seul Result existant est rattaché à un
//    PROGRAMME (Initiative), pas à une Situation/Décision (vérifié par
//    lecture directe : sourceRef.objectType === "initiative"). C'est un
//    fait réel du jeu de données, pas une lacune de ce module — présenté
//    honnêtement plutôt que masqué (mandat §12, "prefer honest
//    incomplete chains over fake complete chains").
//  - En PARALLÈLE existe une chaîne plus ancienne, jamais fusionnée avec
//    la précédente (déjà documenté ainsi dans
//    src/app/app/etat/redevabilite/page.tsx avant ce lot) : Decision →
//    CoordinationSpace.commitments (texte libre `result`) — 13 décisions
//    sur 18 y trouvent un résultat renseigné dans ce Demo World. Les deux
//    comptages restent DISTINCTS ici aussi, jamais réconciliés en un seul
//    chiffre (mandat §4, "non-negotiable").
//  - Aucune série temporelle réelle n'existe pour Result/Outcome/
//    ImpactEvidence/Decision/Learning : toutes les dates réelles du Demo
//    World se concentrent sur 1-2 jours (vérifié par lecture directe de
//    demo-state.ts). Catégorie D (lacune historique réelle) — la série
//    d'évolution affichée par ce module reste donc la série Demo World
//    déjà approuvée (etat-presentation.ts, ETAT_DEMO_SERIES_NOTICE),
//    jamais une série fabriquée pour ce lot.
//  - buildValueTrail (situation-narrative.ts, déjà réel et déjà utilisé
//    par SituationActionsTab/SituationDetail) relie déjà Signal →
//    Compréhension → Décision → Engagement → Résultat → Changement →
//    Impact → Apprentissage pour UNE situation ; ce module l'agrège en
//    entonnoir sur l'ensemble des situations plutôt que de dupliquer sa
//    logique (mandat §22/§23, "share components/read models").
import type { Decision, ImpactEvidence, Initiative, Learning, Outcome, ProductState, Result, Situation, TrustLevel } from "@/domain/types";
import { buildValueTrail, type ValueTrailStepKey } from "@/domain/situation-narrative";

// --- Entonnoir de la Value Trail (mandat §5/§12) ---------------------------
//
// Agrégat déterministe : pour chaque étape réelle de buildValueTrail,
// combien de situations (du périmètre fourni) l'ont effectivement
// atteinte (`proven === true`). Ordre fixe, jamais recalculé par
// popularité — la Value Trail EST la séquence, un entonnoir doit la
// respecter pour rester lisible comme un entonnoir.
export const VALUE_TRAIL_STEP_ORDER: ValueTrailStepKey[] = [
  "signal",
  "comprehension",
  "decision",
  "engagement",
  "resultat",
  "changement",
  "impact",
  "apprentissage"
];

export const valueTrailStepLabel: Record<ValueTrailStepKey, string> = {
  signal: "Signal",
  comprehension: "Compréhension",
  decision: "Décision",
  engagement: "Engagement",
  resultat: "Résultat",
  changement: "Changement",
  impact: "Impact",
  apprentissage: "Apprentissage"
};

export interface ValueTrailFunnelStep {
  key: ValueTrailStepKey;
  label: string;
  count: number;
}

export function valueTrailFunnel(state: ProductState, situations: Situation[] = state.situations): ValueTrailFunnelStep[] {
  const counts = new Map<ValueTrailStepKey, number>(VALUE_TRAIL_STEP_ORDER.map((key) => [key, 0]));
  for (const situation of situations) {
    for (const step of buildValueTrail(state, situation)) {
      if (step.proven) counts.set(step.key, (counts.get(step.key) ?? 0) + 1);
    }
  }
  return VALUE_TRAIL_STEP_ORDER.map((key) => ({ key, label: valueTrailStepLabel[key], count: counts.get(key) ?? 0 }));
}

// --- Chaîne Résultat → Changement → Impact d'un PROGRAMME (mandat §11) ----
//
// Même chaîne que celle déjà construite en ligne dans ProgrammeCockpit.tsx
// (V3.5) — extraite ici pour être la SEULE version (mandat §22/§23,
// "share read models" plutôt que dupliquer un 2e calcul qui pourrait
// diverger). ProgrammeCockpit.tsx est mis à jour pour l'appeler plutôt
// que de recalculer la même chose (refactor sûr : même résultat, un seul
// endroit qui le calcule).
export interface ProgrammeResultChain {
  results: Result[];
  outcomes: Outcome[];
  impacts: ImpactEvidence[];
  learnings: Learning[];
}

export function programmeResultChain(state: ProductState, initiative: Initiative): ProgrammeResultChain {
  const results = state.results.filter((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === initiative.id);
  const resultIds = results.map((item) => item.id);
  const outcomes = state.outcomes.filter((item) => item.sourceResultIds.some((id) => resultIds.includes(id)));
  const outcomeIds = outcomes.map((item) => item.id);
  const impacts = state.impactEvidences.filter((item) => outcomeIds.includes(item.outcomeId));
  const learnings = state.learnings.filter((item) => item.initiativeId === initiative.id);
  return { results, outcomes, impacts, learnings };
}

// --- Distribution territoriale et programmatique (mandat §5/§10/§11) ------
//
// Comptages directs sur Result.territoryIds / sourceRef — jamais une
// intersection déduite. Un Result peut couvrir plusieurs territoires
// (programme multi-territoire) : il compte une fois pour chacun, même
// discipline que "résultats documentés par territoire" déjà en place
// (EtatResultsOverview.tsx, redevabilite/page.tsx).
export interface TerritoryResultsRow {
  territoryId: string;
  territoryName: string;
  results: number;
  outcomes: number;
}

export function territorialResultsDistribution(state: ProductState): TerritoryResultsRow[] {
  const rows = new Map<string, { results: number; outcomes: number }>();
  const bump = (territoryId: string, field: "results" | "outcomes") => {
    const entry = rows.get(territoryId) ?? { results: 0, outcomes: 0 };
    entry[field] += 1;
    rows.set(territoryId, entry);
  };
  for (const result of state.results) for (const territoryId of result.territoryIds) bump(territoryId, "results");
  for (const outcome of state.outcomes) for (const territoryId of outcome.territoryIds) bump(territoryId, "outcomes");
  return [...rows.entries()]
    .map(([territoryId, counts]) => ({ territoryId, territoryName: state.territories.find((item) => item.id === territoryId)?.name ?? territoryId, ...counts }))
    .sort((a, b) => b.results - a.results || b.outcomes - a.outcomes);
}

export interface ProgrammeResultsRow {
  initiativeId: string;
  title: string;
  results: number;
  outcomes: number;
  impacts: number;
}

export function programmeResultsDistribution(state: ProductState): ProgrammeResultsRow[] {
  return state.initiatives
    .map((initiative) => {
      const chain = programmeResultChain(state, initiative);
      return { initiativeId: initiative.id, title: initiative.title, results: chain.results.length, outcomes: chain.outcomes.length, impacts: chain.impacts.length };
    })
    .filter((row) => row.results > 0 || row.outcomes > 0 || row.impacts > 0)
    .sort((a, b) => b.results - a.results || b.outcomes - a.outcomes);
}

// --- Maturité de la preuve (mandat §5, "evidence maturity") ---------------
//
// Répartition par TrustLevel des 2 registres canoniques qui portent ce
// champ (Result/Outcome — ImpactEvidence n'en porte pas, son "niveau de
// preuve" est déjà porté par ImpactStatus, distinct). Jamais un score
// composite : une répartition brute, comptable et vérifiable.
export interface EvidenceMaturityBucket {
  trust: TrustLevel;
  results: number;
  outcomes: number;
}

export function evidenceMaturityBreakdown(state: ProductState): EvidenceMaturityBucket[] {
  const trusts = new Set<TrustLevel>([...state.results.map((item) => item.trust), ...state.outcomes.map((item) => item.trust)]);
  return [...trusts]
    .map((trust) => ({
      trust,
      results: state.results.filter((item) => item.trust === trust).length,
      outcomes: state.outcomes.filter((item) => item.trust === trust).length
    }))
    .sort((a, b) => b.results + b.outcomes - (a.results + a.outcomes));
}

// --- Lignage Décision → Résultat canonique → Apprentissage (mandat §12) ---
//
// Pour chaque Décision réelle : le Result canonique QUI LA CONCERNE
// vraiment n'existe que si un Result porte sourceRef {situation,
// decision.situationId} — jamais déduit d'un Result d'Initiative, même
// si cette Initiative est par ailleurs liée à la même situation (mandat
// §12, "if Result is programme-linked but not decision-linked, show the
// true lineage" — ce module respecte cette distinction au lieu de la
// combler silencieusement). `legacyResultText` reste la chaîne plus
// ancienne (Situation.result), déjà réelle, montrée séparément.
export interface DecisionLineageRow {
  decision: Decision;
  situation?: Situation;
  legacyResultText?: string;
  canonicalResult?: Result;
  outcome?: Outcome;
  learning?: Learning;
}

export function decisionResultLineage(state: ProductState): DecisionLineageRow[] {
  return [...state.decisions]
    .sort((a, b) => (a.decidedAt < b.decidedAt ? 1 : -1))
    .map((decision) => {
      const situation = state.situations.find((item) => item.id === decision.situationId);
      const canonicalResult = situation
        ? state.results.find((item) => item.sourceRef.objectType === "situation" && item.sourceRef.objectId === situation.id)
        : undefined;
      const outcome = canonicalResult ? state.outcomes.find((item) => item.sourceResultIds.includes(canonicalResult.id)) : undefined;
      const learning = situation ? state.learnings.find((item) => item.situationId === situation.id) : undefined;
      return { decision, situation, legacyResultText: situation?.result, canonicalResult, outcome, learning };
    });
}

// --- Constat honnête : le Result programme-lié non relié à une décision ---
//
// Complément explicite du lignage ci-dessus (mandat §12) : les Result
// dont sourceRef pointe vers une Initiative n'apparaissent JAMAIS dans
// decisionResultLineage (qui ne connaît que les Situations) — ce
// helper les rend visibles séparément plutôt que silencieusement omis.
export function programmeLinkedResultsWithoutDecision(state: ProductState): Result[] {
  return state.results.filter((item) => item.sourceRef.objectType === "initiative");
}

// --- Constat de connaissance manquante (mandat §2, "what remains unproven,
// what needs attention") ---------------------------------------------------
export interface ResultsKnowledgeGaps {
  situationsWithoutCanonicalResult: number;
  outcomesWithoutImpact: number;
  learningsWithoutSource: number;
}

export function resultsKnowledgeGaps(state: ProductState): ResultsKnowledgeGaps {
  const situationsWithoutCanonicalResult = state.situations.filter(
    (situation) => situation.status === "reglee" && !state.results.some((result) => result.sourceRef.objectType === "situation" && result.sourceRef.objectId === situation.id)
  ).length;
  const outcomeIdsWithImpact = new Set(state.impactEvidences.map((item) => item.outcomeId));
  const outcomesWithoutImpact = state.outcomes.filter((item) => !outcomeIdsWithImpact.has(item.id)).length;
  const learningsWithoutSource = state.learnings.filter(
    (item) => !item.situationId && !item.initiativeId && !item.outcomeId && !item.fieldMissionId && (!item.sourceRefs || item.sourceRefs.length === 0)
  ).length;
  return { situationsWithoutCanonicalResult, outcomesWithoutImpact, learningsWithoutSource };
}
