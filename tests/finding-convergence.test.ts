import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";
import { computeFindingConvergences } from "../src/domain/finding-convergence";
import type { Finding, ProductState, Signal, TrustLevel } from "../src/domain/types";

const createdAt = "2026-08-08T13:12:00.000Z";

function makeFinding(id: string, overrides: Partial<Finding> = {}): Finding {
  return {
    id,
    type: "recurrence",
    title: `Constat ${id}`,
    statement: `Énoncé documenté ${id}.`,
    territoryIds: ["kayar"],
    sourceRefs: [],
    explanation: `Explication ${id}.`,
    trust: "observee",
    status: "confirmed",
    provenance: "human",
    nextStep: "Faire examiner ce constat.",
    createdAt,
    ...overrides
  };
}

function makeSignal(state: ProductState, id: string, territoryId = "kayar"): Signal {
  return {
    ...state.signals[0],
    id,
    territoryId,
    title: `Signal ${id}`,
    description: `Description ${id}.`,
    createdAt
  };
}

function withSyntheticFindings(findings: Finding[], signals: Signal[] = []): ProductState {
  const state = createDemoState();
  return { ...state, findings, signals: [...state.signals, ...signals] };
}

test("TEST A — Kayar : le knowledge gap et le constat racine convergent avec leur lignée et leurs 5 sources réelles", () => {
  const state = createDemoState();
  const groups = computeFindingConvergences(state);
  const group = groups.find((item) => item.findingIds.includes("fnd-kayar-motorisation"));

  assert.ok(group, "la convergence Kayar doit être calculée depuis la référence Finding explicite");
  assert.deepEqual(group!.findingIds, ["fnd-kayar-motorisation", "fnd-kayar-motorisation-connaissance-manquante"]);
  assert.ok(group!.reasons.some((reason) => reason.kind === "explicit_finding_lineage"));
  assert.equal(group!.sources.filter((source) => source.ref.objectType === "signal").length, 2);
  assert.equal(group!.sources.filter((source) => source.ref.objectType === "service_request").length, 3);
  assert.deepEqual(group!.uncertainties.map((item) => item.findingId), ["fnd-kayar-motorisation-connaissance-manquante"]);
});

test("TEST B — deux constats du même territoire sans source commune ne convergent jamais", () => {
  const state = createDemoState();
  const signalA = makeSignal(state, "sig-same-territory-a");
  const signalB = makeSignal(state, "sig-same-territory-b");
  const findingA = makeFinding("fnd-same-territory-a", {
    sourceRefs: [{ objectType: "territory", objectId: "kayar" }, { objectType: "signal", objectId: signalA.id }]
  });
  const findingB = makeFinding("fnd-same-territory-b", {
    sourceRefs: [{ objectType: "territory", objectId: "kayar" }, { objectType: "signal", objectId: signalB.id }]
  });

  assert.deepEqual(computeFindingConvergences(withSyntheticFindings([findingA, findingB], [signalA, signalB])), []);
});

test("TEST C — deux constats du même type sans source commune ne convergent jamais", () => {
  const state = createDemoState();
  const signalA = makeSignal(state, "sig-same-type-a", "joal");
  const signalB = makeSignal(state, "sig-same-type-b", "kayar");
  const findingA = makeFinding("fnd-same-type-a", { territoryIds: ["joal"], sourceRefs: [{ objectType: "signal", objectId: signalA.id }] });
  const findingB = makeFinding("fnd-same-type-b", { territoryIds: ["kayar"], sourceRefs: [{ objectType: "signal", objectId: signalB.id }] });

  assert.deepEqual(computeFindingConvergences(withSyntheticFindings([findingA, findingB], [signalA, signalB])), []);
});

test("TEST D — le calcul est déterministe : mêmes groupes, ids, ordres, motifs et sources", () => {
  const state = createDemoState();
  const stateBefore = JSON.stringify(state);
  assert.deepEqual(computeFindingConvergences(state), computeFindingConvergences(state));
  assert.equal(JSON.stringify(state), stateBefore, "la projection ne doit jamais muter ProductState");
});

test("TEST E — une source partagée citée plusieurs fois reste une seule source sous-jacente", () => {
  const state = createDemoState();
  const signal = makeSignal(state, "sig-shared-source");
  const sharedRef = { objectType: "signal" as const, objectId: signal.id };
  const findingA = makeFinding("fnd-shared-a", { sourceRefs: [sharedRef, sharedRef] });
  const findingB = makeFinding("fnd-shared-b", { sourceRefs: [sharedRef] });
  const group = computeFindingConvergences(withSyntheticFindings([findingA, findingB], [signal]))[0];

  assert.ok(group);
  assert.equal(group.sources.length, 1);
  assert.deepEqual(group.sources[0].findingIds, [findingA.id, findingB.id]);
  assert.equal(group.reasons.filter((reason) => reason.kind === "shared_source").length, 1);
});

test("TEST F — les chaînes circulaires A↔B et A→B→C→A ne fabriquent aucune convergence", () => {
  const reciprocalA = makeFinding("fnd-cycle-ab-a", { sourceRefs: [{ objectType: "finding", objectId: "fnd-cycle-ab-b" }] });
  const reciprocalB = makeFinding("fnd-cycle-ab-b", { sourceRefs: [{ objectType: "finding", objectId: "fnd-cycle-ab-a" }] });
  assert.deepEqual(computeFindingConvergences(withSyntheticFindings([reciprocalA, reciprocalB])), []);

  const longA = makeFinding("fnd-cycle-long-a", { sourceRefs: [{ objectType: "finding", objectId: "fnd-cycle-long-b" }] });
  const longB = makeFinding("fnd-cycle-long-b", { sourceRefs: [{ objectType: "finding", objectId: "fnd-cycle-long-c" }] });
  const longC = makeFinding("fnd-cycle-long-c", { sourceRefs: [{ objectType: "finding", objectId: "fnd-cycle-long-a" }] });
  assert.deepEqual(computeFindingConvergences(withSyntheticFindings([longA, longB, longC])), []);
});

test("TEST G — chaque confiance reste portée par son Finding ou sa source, jamais agrégée au groupe", () => {
  const state = createDemoState();
  const group = computeFindingConvergences(state).find((item) => item.findingIds.includes("fnd-kayar-motorisation"))!;
  const expectedTrust = new Map(state.findings.map((finding) => [finding.id, finding.trust]));

  assert.equal(Object.prototype.hasOwnProperty.call(group, "trust"), false, "le groupe ne doit porter aucun niveau de confiance synthétique");
  group.findings.forEach((finding) => assert.equal(finding.trust, expectedTrust.get(finding.id)));
  group.sources.forEach((source) => {
    if (source.ref.objectType !== "signal") return;
    const originalTrust: TrustLevel | undefined = state.signals.find((signal) => signal.id === source.ref.objectId)?.trust;
    assert.equal(source.trust, originalTrust);
  });
});
