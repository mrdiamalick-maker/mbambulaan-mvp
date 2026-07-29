import test from "node:test";
import assert from "node:assert/strict";
import { PostCaptureValueRecovery } from "./post-capture-value-recovery";

function createRecovery() {
  const recovery = new PostCaptureValueRecovery();
  recovery.registerCommunityInitiative({
    id: "community-01",
    territoryId: "territory-dakar",
    title: "Transformation locale anti-perte",
    objective: "women_processing",
    governanceOrganizationId: "org-community-dakar",
    beneficiaryOrganizationIds: ["org-women-processors-dakar"],
    contributionRateBps: 200,
    status: "active",
  });
  return recovery;
}

test("un plan communautaire exige une initiative active", () => {
  const recovery = new PostCaptureValueRecovery();
  assert.throws(() => recovery.proposePlan({
    id: "plan-01",
    lotId: "lot-01",
    territoryId: "territory-dakar",
    route: "community_program",
    quantityKg: 100,
    referenceValuePerKgXof: 2_000,
    responsibleOrganizationId: "org-cooperative-dakar",
    communityInitiativeId: "missing",
    beneficiaryOrganizationIds: ["org-women-processors-dakar"],
    requiresColdChain: false,
    requiresHumanApproval: true,
    proposedAt: "2026-07-28T10:00:00.000Z",
  }), /initiative communautaire/i);
});

test("un plan de transformation exige un prestataire", () => {
  const recovery = createRecovery();
  assert.throws(() => recovery.proposePlan({
    id: "plan-02",
    lotId: "lot-02",
    territoryId: "territory-dakar",
    route: "processing",
    quantityKg: 200,
    referenceValuePerKgXof: 1_500,
    responsibleOrganizationId: "org-cooperative-dakar",
    beneficiaryOrganizationIds: [],
    requiresColdChain: false,
    requiresHumanApproval: true,
    proposedAt: "2026-07-28T10:00:00.000Z",
  }), /prestataire/i);
});

test("la clôture mesure la valeur sauvée et la contribution communautaire", () => {
  const recovery = createRecovery();
  recovery.proposePlan({
    id: "plan-03",
    lotId: "lot-03",
    territoryId: "territory-dakar",
    route: "community_program",
    quantityKg: 100,
    referenceValuePerKgXof: 2_000,
    responsibleOrganizationId: "org-cooperative-dakar",
    communityInitiativeId: "community-01",
    beneficiaryOrganizationIds: ["org-women-processors-dakar"],
    requiresColdChain: false,
    requiresHumanApproval: true,
    proposedAt: "2026-07-28T10:00:00.000Z",
  });
  recovery.approvePlan("plan-03", "2026-07-28T10:05:00.000Z");
  recovery.startPlan("plan-03", "2026-07-28T10:10:00.000Z");
  recovery.recordEvidence({
    id: "evidence-03",
    planId: "plan-03",
    type: "beneficiary_register",
    reference: "beneficiaries-2026-07-28",
    recordedByActorId: "actor-community-manager",
    recordedAt: "2026-07-28T11:00:00.000Z",
  });
  const outcome = recovery.completePlan({
    outcomeId: "outcome-03",
    planId: "plan-03",
    quantitySavedKg: 90,
    quantityLostKg: 10,
    beneficiaryCount: 25,
    completedAt: "2026-07-28T12:00:00.000Z",
  });
  assert.equal(outcome.valuePreservedXof, 180_000);
  assert.equal(outcome.communityContributionXof, 3_600);
  assert.equal(outcome.avoidedLossRate, 0.9);
});

test("une preuve est obligatoire avant la clôture", () => {
  const recovery = createRecovery();
  recovery.proposePlan({
    id: "plan-04",
    lotId: "lot-04",
    territoryId: "territory-dakar",
    route: "processing",
    quantityKg: 100,
    referenceValuePerKgXof: 1_000,
    responsibleOrganizationId: "org-cooperative-dakar",
    serviceProviderOrganizationId: "org-processor-dakar",
    beneficiaryOrganizationIds: [],
    requiresColdChain: false,
    requiresHumanApproval: true,
    proposedAt: "2026-07-28T10:00:00.000Z",
  });
  recovery.approvePlan("plan-04", "2026-07-28T10:05:00.000Z");
  recovery.reserveCapacity("plan-04");
  recovery.startPlan("plan-04", "2026-07-28T10:10:00.000Z");
  assert.throws(() => recovery.completePlan({
    outcomeId: "outcome-04",
    planId: "plan-04",
    quantitySavedKg: 100,
    quantityLostKg: 0,
    beneficiaryCount: 0,
    processingYieldKg: 70,
    completedAt: "2026-07-28T12:00:00.000Z",
  }), /preuve/i);
});

test("le résumé d'impact agrège les résultats du territoire", () => {
  const recovery = createRecovery();
  recovery.proposePlan({
    id: "plan-05",
    lotId: "lot-05",
    territoryId: "territory-dakar",
    route: "cold_storage",
    quantityKg: 50,
    referenceValuePerKgXof: 3_000,
    responsibleOrganizationId: "org-cooperative-dakar",
    serviceProviderOrganizationId: "org-cold-chain-dakar",
    beneficiaryOrganizationIds: [],
    requiresColdChain: true,
    requiresHumanApproval: false,
    proposedAt: "2026-07-28T10:00:00.000Z",
  });
  recovery.approvePlan("plan-05", "2026-07-28T10:05:00.000Z");
  recovery.reserveCapacity("plan-05");
  recovery.startPlan("plan-05", "2026-07-28T10:10:00.000Z");
  recovery.recordEvidence({
    id: "evidence-05",
    planId: "plan-05",
    type: "storage",
    reference: "cold-room-slot-05",
    recordedByActorId: "actor-cold-chain",
    recordedAt: "2026-07-28T10:20:00.000Z",
  });
  recovery.completePlan({
    outcomeId: "outcome-05",
    planId: "plan-05",
    quantitySavedKg: 50,
    quantityLostKg: 0,
    beneficiaryCount: 0,
    completedAt: "2026-07-28T12:00:00.000Z",
  });
  const summary = recovery.getImpactSummary("territory-dakar");
  assert.equal(summary.quantitySavedKg, 50);
  assert.equal(summary.valuePreservedXof, 150_000);
  assert.equal(summary.averageAvoidedLossRate, 1);
});
