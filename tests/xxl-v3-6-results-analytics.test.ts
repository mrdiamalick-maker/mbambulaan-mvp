import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createDemoState } from "../src/data/demo-state";
import { buildValueTrail } from "../src/domain/situation-narrative";
import {
  VALUE_TRAIL_STEP_ORDER,
  decisionResultLineage,
  evidenceMaturityBreakdown,
  programmeLinkedResultsWithoutDecision,
  programmeResultChain,
  programmeResultsDistribution,
  resultsKnowledgeGaps,
  territorialResultsDistribution,
  valueTrailFunnel
} from "../src/domain/results-analytics";

// LOT V3.6 — "Results / Analytics". Composants "use client"
// (ResultsAnalyticsOverview/ResultsTrendChart/ProgrammeCockpit) non
// montables via renderToStaticMarkup dans ce jeu de tests Node pur (même
// contrainte déjà documentée pour les LOTs V3.1-V3.5) — vérifiés par
// lecture de source. Le Core (domain/results-analytics.ts, pur) est
// testé en direct.
function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf-8");
}

const state = createDemoState();

// TEST 1 — valueTrailFunnel agrège fidèlement buildValueTrail (déjà réel,
// déjà utilisé par SituationActionsTab/SituationDetail) sur l'ensemble
// des situations — jamais un second calcul divergent.
test("TEST 1 — valueTrailFunnel agrège fidèlement buildValueTrail, dans l'ordre fixe de la Value Trail", () => {
  const funnel = valueTrailFunnel(state);
  assert.deepEqual(funnel.map((step) => step.key), VALUE_TRAIL_STEP_ORDER);
  for (const step of funnel) {
    const expected = state.situations.filter((situation) => buildValueTrail(state, situation).find((item) => item.key === step.key)?.proven).length;
    assert.equal(step.count, expected, `étape ${step.key} : décompte divergent de buildValueTrail`);
  }
  // Filtré sur un sous-ensemble réel de situations, le total ne doit
  // jamais dépasser le nombre de situations fournies pour chaque étape.
  const oneTerritory = state.territories[0].id;
  const scoped = state.situations.filter((item) => item.territoryId === oneTerritory);
  const scopedFunnel = valueTrailFunnel(state, scoped);
  for (const step of scopedFunnel) assert.ok(step.count <= scoped.length);
});

// TEST 2 — programmeResultChain reste la SEULE version de ce calcul,
// réellement consommée par ProgrammeCockpit.tsx (mandat §22/§23, "share
// read models" plutôt que dupliquer) — jamais recalculée en ligne.
test("TEST 2 — programmeResultChain est réellement réutilisée par ProgrammeCockpit, pas recalculée en ligne", () => {
  for (const initiative of state.initiatives) {
    const chain = programmeResultChain(state, initiative);
    const expectedResults = state.results.filter((item) => item.sourceRef.objectType === "initiative" && item.sourceRef.objectId === initiative.id);
    assert.deepEqual(chain.results, expectedResults);
    assert.equal(chain.learnings.length, state.learnings.filter((item) => item.initiativeId === initiative.id).length);
  }
  const cockpitSource = readSource("../src/components/programmes/ProgrammeCockpit.tsx");
  assert.ok(cockpitSource.includes("programmeResultChain(state, initiative)"));
  assert.ok(!cockpitSource.includes('state.results.filter((item) => item.sourceRef.objectType === "initiative"'), "ProgrammeCockpit ne doit plus recalculer la chaîne en ligne — un seul endroit la calcule désormais");
});

// TEST 3 — territorialResultsDistribution/programmeResultsDistribution
// restent des comptages directs et vérifiables, jamais un score composite.
test("TEST 3 — les distributions territoriale et programmatique sont des comptages directs vérifiables", () => {
  const territorial = territorialResultsDistribution(state);
  const totalResultsAcrossTerritories = territorial.reduce((sum, row) => sum + row.results, 0);
  const expectedTotal = state.results.reduce((sum, result) => sum + result.territoryIds.length, 0);
  assert.equal(totalResultsAcrossTerritories, expectedTotal, "un résultat multi-territoire doit compter une fois par territoire, jamais une seule fois globalement");

  const programmes = programmeResultsDistribution(state);
  for (const row of programmes) assert.ok(row.results > 0 || row.outcomes > 0 || row.impacts > 0, "seuls les programmes avec au moins un résultat/changement/impact réel doivent apparaître");
});

// TEST 4 — evidenceMaturityBreakdown reste une répartition brute par
// TrustLevel, dont la somme égale exactement le nombre réel de Result +
// Outcome — jamais un score composite fabriqué.
test("TEST 4 — evidenceMaturityBreakdown est une répartition exhaustive et vérifiable", () => {
  const breakdown = evidenceMaturityBreakdown(state);
  const totalResults = breakdown.reduce((sum, bucket) => sum + bucket.results, 0);
  const totalOutcomes = breakdown.reduce((sum, bucket) => sum + bucket.outcomes, 0);
  assert.equal(totalResults, state.results.length);
  assert.equal(totalOutcomes, state.outcomes.length);
});

// TEST 5 — decisionResultLineage : mandat §12, "if Result is
// programme-linked but not decision-linked, show the true lineage" —
// vérifié sur ce Demo World précis (l'unique Result canonique existant
// est rattaché à une Initiative, jamais à une Situation/Décision).
test("TEST 5 — decisionResultLineage présente honnêtement un lignage incomplet, jamais fabriqué", () => {
  const lineage = decisionResultLineage(state);
  assert.equal(lineage.length, state.decisions.length);
  const withCanonicalResult = lineage.filter((row) => row.canonicalResult);
  assert.equal(withCanonicalResult.length, 0, "dans ce Demo World, aucune décision ne doit être reliée à un Result canonique — le seul Result existant est rattaché à un programme, pas à une situation");
  // Toujours triées du plus récent au plus ancien.
  const dates = lineage.map((row) => row.decision.decidedAt);
  assert.deepEqual(dates, [...dates].sort().reverse());

  const orphanResults = programmeLinkedResultsWithoutDecision(state);
  assert.equal(orphanResults.length, 1);
  assert.equal(orphanResults[0].sourceRef.objectType, "initiative");
});

// TEST 6 — resultsKnowledgeGaps reste un constat honnête, jamais négatif,
// jamais un chiffre inventé.
test("TEST 6 — resultsKnowledgeGaps produit des compteurs honnêtes et cohérents", () => {
  const gaps = resultsKnowledgeGaps(state);
  assert.ok(gaps.situationsWithoutCanonicalResult >= 0);
  assert.ok(gaps.outcomesWithoutImpact >= 0);
  assert.ok(gaps.outcomesWithoutImpact <= state.outcomes.length);
});

// TEST 7 — BarMetricChart : prop additive `onSelect`/`selectedKey`
// (mandat §17, cross-filtering), défaut undefined — les appelants
// existants (entonnoir/ancienneté, SituationsExplorer) ne la passent
// jamais et ne sont donc affectés en rien.
test("TEST 7 — BarMetricChart gagne onSelect/selectedKey en prop additive, sans régression pour les appelants existants", () => {
  const source = readSource("../src/components/private/BarMetricChart.tsx");
  assert.ok(source.includes("onSelect?:"));
  assert.ok(source.includes("selectedKey?:"));
  const situationsExplorerSource = readSource("../src/components/situations/SituationsExplorer.tsx");
  assert.ok(situationsExplorerSource.includes("<BarMetricChart"));
  assert.ok(!situationsExplorerSource.includes("onSelect="), "SituationsExplorer ne doit pas passer onSelect — son usage de BarMetricChart doit rester inchangé");
});

// TEST 8 — ResultsTrendChart : deux séries réelles à deux axes Y
// distincts (échelles différentes), recharts + ChartContainer déjà
// présents, aucune nouvelle dépendance.
test("TEST 8 — ResultsTrendChart reste un graphique recharts à deux axes, aucune nouvelle dépendance", () => {
  const source = readSource("../src/components/results/ResultsTrendChart.tsx");
  assert.ok(source.includes('from "recharts"'));
  assert.ok(source.includes('from "@/components/ui/chart"'));
  assert.ok(source.includes('yAxisId="primary"'));
  assert.ok(source.includes('yAxisId="secondary"'));
});

// TEST 9 — ResultsAnalyticsOverview reste UN SEUL composant partagé,
// réellement monté par les deux espaces (mandat §22, "do not create
// separate Results products").
test("TEST 9 — ResultsAnalyticsOverview est réellement partagé entre l'Espace État et la Coordination", () => {
  const etatSource = readSource("../src/app/app/etat/rapport/page.tsx");
  assert.ok(etatSource.includes('from "@/components/results/ResultsAnalyticsOverview"'));
  assert.ok(etatSource.includes("<ResultsAnalyticsOverview state={state} />"));
  const pilotageSource = readSource("../src/components/ecosystem/PilotageWorkspace.tsx");
  assert.ok(pilotageSource.includes('from "@/components/results/ResultsAnalyticsOverview"'));
  assert.ok(pilotageSource.includes("<ResultsAnalyticsOverview state={state} />"));
});

// TEST 10 — le contenu réel existant (registre de rapports, méthodologie,
// registre de décisions) n'a pas été supprimé (mandat §13, "do not
// delete existing real reporting content").
test("TEST 10 — le registre/méthodologie existant d'/app/etat/rapport et /app/etat/redevabilite reste intact", () => {
  const rapportSource = readSource("../src/app/app/etat/rapport/page.tsx");
  assert.ok(rapportSource.includes("Sources, confiance et limites méthodologiques"));
  assert.ok(rapportSource.includes("rapports-territoriaux"));
  const redevabiliteSource = readSource("../src/app/app/etat/redevabilite/page.tsx");
  assert.ok(redevabiliteSource.includes("Décision → apprentissage documenté"));
  assert.ok(redevabiliteSource.includes("Deux comptages distincts, jamais interchangeables"));
});
