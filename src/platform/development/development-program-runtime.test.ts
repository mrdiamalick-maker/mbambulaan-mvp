import test from "node:test";
import assert from "node:assert/strict";
import { DevelopmentProgramRuntime } from "./development-program-runtime";

const at = "2026-07-28T12:00:00.000Z";

function buildReadyProgram(runtime: DevelopmentProgramRuntime) {
  runtime.execute({ commandId: "open", actorId: "government-01", activeTerritoryId: "territory-national", command: {
    type: "open_program", programId: "program-01", programCode: "P-01", title: "Programme pilote", countryId: "SN",
    territoryIds: ["territory-dakar"], periodStart: at, periodEnd: "2027-07-28T12:00:00.000Z", totalBudgetCeilingXof: 100_000_000, at,
  }});
  runtime.execute({ commandId: "objective", actorId: "government-01", activeTerritoryId: "territory-national", command: {
    type: "define_objective", programId: "program-01", at, objective: {
      id: "objective-01", objectiveType: "waste_reduction", label: "Réduire les pertes", baselineValue: 20, targetValue: 10,
      unit: "percent", targetAt: "2027-07-28T12:00:00.000Z", weightPercent: 100, evidenceIds: ["baseline-01"],
    },
  }});
  runtime.execute({ commandId: "intervention", actorId: "government-01", activeTerritoryId: "territory-national", command: {
    type: "add_intervention", programId: "program-01", at, intervention: {
      id: "intervention-01", interventionType: "equipment_distribution", title: "Équipements de froid", territoryIds: ["territory-dakar"],
      capabilityIds: ["cold-storage"], deliveryActorIds: ["operator-01"], beneficiarySegmentCodes: ["women-processors"],
      plannedBeneficiaryCount: 10, plannedBudgetXof: 60_000_000, startAt: at, endAt: "2027-01-28T12:00:00.000Z",
      status: "ready", dependencyIds: [], evidenceIds: ["design-01"],
    },
  }});
  runtime.execute({ commandId: "budget", actorId: "government-01", activeTerritoryId: "territory-national", command: {
    type: "add_budget_line", programId: "program-01", at, budgetLine: {
      id: "budget-01", interventionId: "intervention-01", category: "equipment", allocatedAmountXof: 60_000_000,
      committedAmountXof: 60_000_000, disbursedAmountXof: 40_000_000, spentAmountXof: 30_000_000,
      fundingSourceActorId: "donor-01", status: "partially_disbursed", evidenceIds: ["budget-proof-01"],
    },
  }});
}

test("DevelopmentProgramRuntime refuse une allocation supérieure au plafond", () => {
  const runtime = new DevelopmentProgramRuntime();
  runtime.execute({ commandId: "open", actorId: "government-01", activeTerritoryId: "territory-national", command: {
    type: "open_program", programId: "program-01", programCode: "P-01", title: "Programme", countryId: "SN",
    territoryIds: ["territory-dakar"], periodStart: at, periodEnd: "2027-07-28T12:00:00.000Z", totalBudgetCeilingXof: 50_000_000, at,
  }});
  assert.throws(() => runtime.execute({ commandId: "budget", actorId: "government-01", activeTerritoryId: "territory-national", command: {
    type: "add_budget_line", programId: "program-01", at, budgetLine: {
      id: "budget-01", category: "equipment", allocatedAmountXof: 60_000_000, committedAmountXof: 0,
      disbursedAmountXof: 0, spentAmountXof: 0, fundingSourceActorId: "donor-01", status: "planned", evidenceIds: ["proof-01"],
    },
  }}), /plafond/i);
});

test("DevelopmentProgramRuntime exécute un programme jusqu'à l'évaluation d'impact", () => {
  const runtime = new DevelopmentProgramRuntime();
  buildReadyProgram(runtime);
  runtime.execute({ commandId: "beneficiary", actorId: "development-01", activeTerritoryId: "territory-dakar", command: {
    type: "register_beneficiary", programId: "program-01", beneficiary: {
      id: "beneficiary-01", actorId: "actor-women-group-01", segmentCode: "women-processors", territoryId: "territory-dakar",
      organizationId: "org-women-group-01", eligibilityStatus: "eligible", eligibilityReasons: ["Activité vérifiée"], vulnerabilityScore: 70,
      womenLed: true, youthLed: false, registeredAt: at, evidenceIds: ["eligibility-proof-01"],
    },
  }});
  runtime.execute({ commandId: "approve", actorId: "government-01", activeTerritoryId: "territory-national", command: {
    type: "approve_program", programId: "program-01", decision: {
      id: "decision-01", decisionType: "approve_program", rationale: "Dossier complet", decidedByActorId: "government-01",
      affectedInterventionIds: ["intervention-01"], affectedTerritoryIds: ["territory-dakar"], expectedImpact: ["Réduire les pertes"],
      evidenceIds: ["approval-proof-01"], decidedAt: at,
    },
  }});
  runtime.execute({ commandId: "launch", actorId: "government-01", activeTerritoryId: "territory-national", command: { type: "launch_program", programId: "program-01", at } });
  runtime.execute({ commandId: "delivery", actorId: "development-01", activeTerritoryId: "territory-dakar", command: {
    type: "record_delivery", programId: "program-01", delivery: {
      id: "delivery-01", interventionId: "intervention-01", beneficiaryId: "beneficiary-01", deliveredByActorId: "operator-01",
      deliveryType: "cold-equipment", quantity: 1, unit: "unit", monetaryValueXof: 5_000_000, deliveredAt: at,
      acceptedAt: at, status: "accepted", sourceReferenceIds: ["procurement-01"], evidenceIds: ["delivery-proof-01"],
    },
  }});
  runtime.execute({ commandId: "measurement", actorId: "development-01", activeTerritoryId: "territory-dakar", command: {
    type: "record_measurement", programId: "program-01", measurement: {
      id: "measurement-01", objectiveId: "objective-01", territoryId: "territory-dakar", beneficiarySegmentCode: "women-processors",
      measuredValue: 12, unit: "percent", periodStart: at, periodEnd: "2026-12-28T12:00:00.000Z", measuredAt: "2026-12-29T12:00:00.000Z",
      confidenceScore: 85, methodology: "Mesure des pertes déclarées et vérifiées", evidenceIds: ["measurement-proof-01"],
    },
  }});
  const result = runtime.execute({ commandId: "evaluation", actorId: "development-01", activeTerritoryId: "territory-dakar", command: {
    type: "evaluate_impact", programId: "program-01", evaluation: {
      id: "evaluation-01", evaluatedAt: "2026-12-30T12:00:00.000Z", evaluatorActorId: "evaluator-01",
      valueCreatedAndProtectedXof: 45_000_000, platformRevenueXof: 2_000_000, attributionConfidencePercent: 75,
      unintendedEffects: [], recommendations: ["Étendre à un second territoire"], status: "validated", evidenceIds: ["evaluation-proof-01"],
    },
  }}) as { snapshot: { commandCenters: Array<{ servedBeneficiaryCount: number; budgetExecutionPercent: number; latestValueCreatedAndProtectedXof?: number }> } };
  assert.equal(result.snapshot.commandCenters[0].servedBeneficiaryCount, 1);
  assert.equal(result.snapshot.commandCenters[0].budgetExecutionPercent, 50);
  assert.equal(result.snapshot.commandCenters[0].latestValueCreatedAndProtectedXof, 45_000_000);
});
