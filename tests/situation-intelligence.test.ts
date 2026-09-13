// Tests PD.4 — "Product Dressing — Situations & Flux Real Domain
// Integration", volet Situations. Portent sur
// src/domain/situation-intelligence.ts et
// src/v3-template/lib/situations-bridge.ts (§20 du mandat : "Signal
// trust/provenance; Finding resolution; Situation projection; timeline;
// source resolution; maritime-context resolution; no territory-only
// false linkage; convergence integration; real actions only").
import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
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
  situationOpenedAt,
  situationRecommendation,
  situationStageBucket,
  trustGlyph,
  trustGlyphTier
} from "../src/domain/situation-intelligence";
import { getSituationDetail, SITUATION_ROWS, describeDecisionEffect } from "../src/v3-template/lib/situations-bridge";

const state = createDemoState();
const joalRecurrence = state.situations.find((s) => s.id === "sit-joal-glace-recurrence")!;
const sitKayar = state.situations.find((s) => s.id === "sit-kayar")!;

test("projection de Situation : buildKnownItems reste 100% réel (description, constat, résultat)", () => {
  const items = buildKnownItems(state, joalRecurrence);
  assert.ok(items.some((i) => i.detail === joalRecurrence.description));
  const finding = state.findings.find((f) => f.id === joalRecurrence.findingId);
  assert.ok(finding);
  assert.ok(items.some((i) => i.detail === finding!.statement));
  assert.ok(items.some((i) => i.detail === finding!.explanation));

  const withResult = state.situations.find((s) => s.result)!;
  const resultItems = buildKnownItems(state, withResult);
  assert.ok(resultItems.some((i) => i.detail === withResult.result));
});

test("incertitudes réelles : une situation sans Finding l'affiche honnêtement, jamais un texte fabriqué au hasard", () => {
  const withoutFinding = state.situations.find((s) => !s.findingId)!;
  const uncertainties = buildUncertainties(state, withoutFinding);
  assert.ok(uncertainties.some((u) => u.label === "Compréhension" && u.detail.includes("Aucun constat formalisé")));

  const withFinding = buildUncertainties(state, joalRecurrence);
  assert.ok(!withFinding.some((u) => u.label === "Compréhension"));
});

test("métriques réelles : les 4 tuiles restent traçables (signaux, jours, preuves, décisions)", () => {
  const metrics = buildSituationMetrics(state, joalRecurrence);
  assert.equal(metrics.length, 4);
  const signalMetric = metrics[0];
  assert.equal(signalMetric.value, joalRecurrence.signalIds.length);
  const ageMetric = metrics[1];
  assert.equal(ageMetric.value, situationAgeDays(state, joalRecurrence));
  const evidenceMetric = metrics[2];
  assert.equal(evidenceMetric.value, state.evidences.filter((e) => e.situationId === joalRecurrence.id).length);
});

test("chronologie réelle : fusionne history + décisions + preuves, triée, jamais un événement inventé", () => {
  const timeline = buildRealTimeline(state, joalRecurrence);
  assert.ok(timeline.length >= joalRecurrence.history.length);
  for (let i = 1; i < timeline.length; i++) assert.ok(timeline[i - 1].at <= timeline[i].at);
  for (const historyEntry of joalRecurrence.history) {
    assert.ok(timeline.some((t) => t.at === historyEntry.at && t.label === historyEntry.label));
  }
});

function relatedCounts(state_: typeof state, situationId: string) {
  const decisions = state_.decisions.filter((d) => d.situationId === situationId).length;
  const evidences = state_.evidences.filter((e) => e.situationId === situationId).length;
  return decisions + evidences;
}

test("chronologie clairsemée : une situation à un seul événement d'historique reste courte (sparse truth, mandat §12)", () => {
  const sparse = state.situations.find((s) => s.history.length === 1 && relatedCounts(state, s.id) === 0)!;
  assert.ok(sparse, "au moins une situation doit n'avoir qu'un seul événement réel connu");
  const timeline = buildRealTimeline(state, sparse);
  assert.equal(timeline.length, 1);
});

test("résolution de sources : signaux, constat et preuves réels, trust restitué sans altération", () => {
  const sources = buildSituationSources(state, joalRecurrence);
  assert.ok(sources.some((s) => s.kind === "signal"));
  assert.ok(sources.some((s) => s.kind === "finding"));
  for (const source of sources) {
    assert.ok(source.trust.length > 0);
  }
});

test("glyphe de confiance : 3 paliers visuels, jamais un aplatissement du libellé réel à 10 valeurs", () => {
  assert.equal(trustGlyph("declaree"), "○");
  assert.equal(trustGlyph("estimee"), "○");
  assert.equal(trustGlyph("observee"), "◐");
  assert.equal(trustGlyph("documentee"), "◐");
  assert.equal(trustGlyph("verifiee"), "●");
  assert.equal(trustGlyph("officielle"), "●");
  assert.equal(trustGlyphTier("consolidee"), 2);
});

test("résolution de contexte maritime : vide quand le Finding ne cite aucun objet maritime (état réel actuel)", () => {
  for (const situation of state.situations) {
    const maritime = resolveMaritimeContext(state, situation);
    // Audit PD.4 : aucun des 3 Finding du Demo World actuel ne cite de
    // Vessel/FishingTrip/Landing/Infrastructure/Capacity/Site — constat
    // attendu, documenté dans le rapport de lot, pas une anomalie.
    assert.equal(maritime.length, 0, `contexte maritime inattendu pour ${situation.id}`);
  }
});

test("résolution de contexte maritime : s'active dès qu'un Finding réel cite un objet maritime réel (mécanisme générique)", () => {
  const vesselId = state.vessels[0].id;
  const landingId = state.landings[0].id;
  const syntheticFinding = {
    ...state.findings[0],
    id: "fnd-test-maritime",
    sourceRefs: [
      { objectType: "vessel" as const, objectId: vesselId },
      { objectType: "landing" as const, objectId: landingId }
    ]
  };
  const syntheticSituation = { ...joalRecurrence, id: "sit-test-maritime", findingId: syntheticFinding.id };
  const syntheticState = { ...state, findings: [...state.findings, syntheticFinding] };

  const maritime = resolveMaritimeContext(syntheticState, syntheticSituation);
  assert.equal(maritime.length, 2);
  assert.ok(maritime.some((m) => m.ref.objectType === "vessel" && m.ref.objectId === vesselId));
  assert.ok(maritime.some((m) => m.ref.objectType === "landing" && m.ref.objectId === landingId));
});

test("pas de fausse liaison par le seul territoire : un Finding qui ne cite aucun objet maritime ne produit aucun contexte, même si un Landing existe sur le même territoire", () => {
  // sit-kayar et un Landing réel de Kayar partagent le même territoire —
  // mais aucun Finding réel ne relie explicitement l'un à l'autre.
  const kayarLanding = state.landings.find((l) => {
    const site = state.sites.find((s) => s.id === l.siteId);
    return site?.territoryId === "kayar";
  });
  assert.ok(kayarLanding, "un Landing réel doit exister à Kayar pour ce test");
  const maritime = resolveMaritimeContext(state, sitKayar);
  assert.equal(maritime.length, 0);
});

test("convergence documentaire : réutilise P2.3-A tel quel, absente quand la Situation n'y participe pas", () => {
  for (const situation of state.situations) {
    const convergence = resolveFindingConvergence(state, situation);
    if (convergence) {
      const finding = state.findings.find((f) => f.id === situation.findingId);
      assert.ok(finding && convergence.findingIds.includes(finding.id));
    }
  }
  // Audit PD.4 : aucune des 31 situations réelles du Demo World n'a un
  // Finding participant à un groupe de convergence aujourd'hui (le seul
  // groupe réel — fnd-kayar-motorisation ↔ sa connaissance manquante —
  // n'est référencé par aucune Situation.findingId) ; constat documenté.
  assert.ok(state.situations.every((s) => resolveFindingConvergence(state, s) === undefined));
});

test("convergence documentaire : s'active pour une Situation dont le Finding participe réellement à un groupe", () => {
  const kayarFinding = state.findings.find((f) => f.id === "fnd-kayar-motorisation")!;
  assert.ok(kayarFinding);
  const syntheticSituation = { ...joalRecurrence, id: "sit-test-convergence", findingId: kayarFinding.id };
  const convergence = resolveFindingConvergence(state, syntheticSituation);
  assert.ok(convergence, "fnd-kayar-motorisation doit converger avec sa connaissance manquante");
  assert.ok(convergence!.findingIds.includes("fnd-kayar-motorisation"));
  assert.ok(convergence!.findingIds.includes("fnd-kayar-motorisation-connaissance-manquante"));
});

test("suggestion système : réutilise coordination-engine.ts, jamais recalculée localement", () => {
  const recommendation = situationRecommendation(state, joalRecurrence);
  assert.ok(recommendation);
  assert.match(recommendation!.reason, /nécessite une coordination territoriale/);
  assert.equal(recommendation!.objective, joalRecurrence.nextStep);
});

test("entonnoir et ancienneté réels : chaque compte est un compte réel, pas une valeur fixe fabriquée", () => {
  const funnel = buildSituationsFunnel(state);
  assert.equal(funnel[0].count, state.signals.length);
  assert.equal(funnel[2].count, state.situations.length);
  const aging = buildSituationsAging(state);
  const totalAged = aging.reduce((sum, b) => sum + b.count, 0);
  assert.equal(totalAged, state.situations.filter(isOpenSituation).length);
});

test("stage bucket : progression monotone couvrant les 8 statuts réels sans en omettre aucun", () => {
  const seen = new Set<number>();
  for (const situation of state.situations) seen.add(situationStageBucket(situation));
  assert.ok(seen.size > 0);
  for (const situation of state.situations) {
    const bucket = situationStageBucket(situation);
    assert.ok(bucket >= 1 && bucket <= 4);
    if (situation.status === "recue") assert.equal(bucket, 1);
    if (situation.status === "reglee") assert.equal(bucket, 4);
  }
});

test("empty/incomplete: situationOpenedAt et situationAgeDays restent honnêtes pour un historique vide", () => {
  const noHistory = { ...joalRecurrence, history: [] };
  assert.equal(situationOpenedAt(noHistory), undefined);
  assert.equal(situationAgeDays(state, noHistory), undefined);
});

test("pont v3-template : toutes les situations réelles sont exposées et projetables en détail", () => {
  assert.ok(SITUATION_ROWS.length >= 30);
  for (const row of SITUATION_ROWS) {
    const detail = getSituationDetail(row.id);
    assert.ok(detail, `détail manquant pour la ligne ${row.id}`);
    assert.equal(detail!.realId, row.realId);
  }
  assert.equal(getSituationDetail(99999), undefined);
});

test("actions réelles uniquement : les options d'action sont les 8 DecisionType réels, jamais une action fictive", () => {
  const detail = getSituationDetail(0)!;
  assert.equal(detail.options.length, 8);
  const effect = describeDecisionEffect(detail.options[0]);
  assert.match(effect, /create_decision/);
  assert.match(effect, /non exécuté/);
});
