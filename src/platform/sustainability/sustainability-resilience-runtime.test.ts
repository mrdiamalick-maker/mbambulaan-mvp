import test from "node:test";
import assert from "node:assert/strict";
import { SustainabilityResilienceRuntime } from "./sustainability-resilience-runtime";

function createRuntime() {
  const runtime = new SustainabilityResilienceRuntime();
  runtime.execute({
    commandId: "open-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: { type: "open_case", caseId: "case-1", caseCode: "DAKAR-01", countryId: "SN", territoryIds: ["territory-dakar"], at: "2026-07-28T08:00:00.000Z" },
  });
  return runtime;
}

test("une alerte critique interdit une autorisation simple", () => {
  const runtime = createRuntime();
  runtime.execute({
    commandId: "signal-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "register_signal",
      caseId: "case-1",
      signal: {
        id: "signal-1",
        territoryId: "territory-dakar",
        riskType: "storm",
        severity: "critical",
        probabilityPercent: 90,
        confidencePercent: 85,
        validFrom: "2026-07-28T08:00:00.000Z",
        validUntil: "2026-07-29T08:00:00.000Z",
        sourceReferenceIds: ["weather-1"],
        evidenceIds: ["evidence-1"],
        expectedEffects: ["Mer dangereuse"],
      },
    },
  });

  assert.throws(() => runtime.execute({
    commandId: "decision-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "decide_activity",
      caseId: "case-1",
      decision: {
        id: "decision-1",
        territoryId: "territory-dakar",
        decision: "authorized",
        reasons: ["Demande locale"],
        conditions: [],
        relatedSignalIds: ["signal-1"],
        relatedMeasureIds: [],
        decidedByActorId: "actor-government",
        validFrom: "2026-07-28T10:00:00.000Z",
        evidenceIds: ["evidence-decision-1"],
      },
    },
  }), /ne peut pas être autorisée/);
});

test("une fermeture active interdit une autorisation conditionnelle", () => {
  const runtime = createRuntime();
  runtime.execute({
    commandId: "measure-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "decide_measure",
      caseId: "case-1",
      at: "2026-07-28T09:00:00.000Z",
      measure: {
        id: "measure-1",
        measureType: "seasonal_closure",
        territoryIds: ["territory-dakar"],
        speciesCodes: ["thiof"],
        decidedByActorId: "actor-government",
        validFrom: "2026-07-28T09:00:00.000Z",
        validUntil: "2026-08-28T09:00:00.000Z",
        allowedGearCodes: [],
        rationale: ["Pression sur la ressource"],
        status: "active",
        evidenceIds: ["evidence-measure-1"],
      },
    },
  });

  assert.throws(() => runtime.execute({
    commandId: "decision-2",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "decide_activity",
      caseId: "case-1",
      decision: {
        id: "decision-2",
        territoryId: "territory-dakar",
        speciesCode: "thiof",
        decision: "authorized_with_conditions",
        reasons: ["Sortie courte"],
        conditions: ["Retour avant midi"],
        relatedSignalIds: [],
        relatedMeasureIds: ["measure-1"],
        decidedByActorId: "actor-government",
        validFrom: "2026-07-28T10:00:00.000Z",
        evidenceIds: ["evidence-decision-2"],
      },
    },
  }), /ne peut pas être autorisée/);
});

test("une action achevée et son résultat alimentent le centre de commandement", () => {
  const runtime = createRuntime();
  runtime.execute({
    commandId: "signal-2",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "register_signal",
      caseId: "case-1",
      signal: {
        id: "signal-2",
        territoryId: "territory-dakar",
        riskType: "cold_chain_disruption",
        severity: "high",
        probabilityPercent: 80,
        confidencePercent: 75,
        validFrom: "2026-07-28T08:00:00.000Z",
        validUntil: "2026-07-30T08:00:00.000Z",
        sourceReferenceIds: ["incident-cold-1"],
        evidenceIds: ["evidence-cold-1"],
        expectedEffects: ["Pertes post-capture"],
      },
    },
  });
  runtime.execute({
    commandId: "action-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "plan_action",
      caseId: "case-1",
      at: "2026-07-28T09:00:00.000Z",
      action: {
        id: "action-1",
        actionType: "secure_cold_storage",
        territoryIds: ["territory-dakar"],
        ownerActorId: "actor-cooperative",
        beneficiaryActorIds: ["fisher-1", "fisher-2"],
        relatedSignalIds: ["signal-2"],
        relatedMeasureIds: [],
        plannedStartAt: "2026-07-28T09:00:00.000Z",
        plannedEndAt: "2026-07-28T18:00:00.000Z",
        budgetXof: 500000,
        expectedProtectedValueXof: 2000000,
        expectedProtectedJobs: 8,
        expectedAvoidedLossKg: 700,
        status: "ready",
        evidenceIds: ["plan-evidence-1"],
      },
    },
  });
  runtime.execute({
    commandId: "complete-1",
    actorId: "actor-cooperative",
    activeTerritoryId: "territory-dakar",
    command: { type: "complete_action", caseId: "case-1", actionId: "action-1", at: "2026-07-28T17:00:00.000Z", evidenceIds: ["execution-evidence-1"] },
  });
  runtime.execute({
    commandId: "outcome-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "record_outcome",
      caseId: "case-1",
      outcome: {
        id: "outcome-1",
        measuredAt: "2026-07-29T08:00:00.000Z",
        avoidedLossKg: 650,
        protectedValueXof: 1800000,
        protectedJobs: 8,
        supportedActorCount: 12,
        fishingEffortChangePercent: 0,
        juvenileCatchChangePercent: 0,
        stockPressureChangePercent: 0,
        ecosystemRestoredHectares: 0,
        platformRevenueXof: 25000,
        confidencePercent: 85,
        evidenceIds: ["outcome-evidence-1"],
      },
    },
  });

  const snapshot = runtime.snapshot("2026-07-29T09:00:00.000Z");
  assert.equal(snapshot.commandCenters[0]?.avoidedLossKg, 650);
  assert.equal(snapshot.commandCenters[0]?.protectedValueXof, 1800000);
  assert.equal(snapshot.commandCenters[0]?.completedActionCount, 1);
});
