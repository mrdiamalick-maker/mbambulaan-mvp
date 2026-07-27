import assert from "node:assert/strict";
import test from "node:test";

import { EndToEndMultiTerritoryCrisisManagementCapability } from "./end-to-end-multi-territory-crisis-management-capability";

const t0 = "2026-07-27T08:00:00Z";
const t1 = "2026-07-27T10:00:00Z";
const t2 = "2026-07-27T14:00:00Z";
const t3 = "2026-07-28T08:00:00Z";

function createQualifiedCrisis() {
  const capability = new EndToEndMultiTerritoryCrisisManagementCapability();
  capability.openCrisis({
    id: "crisis-1",
    crisisCode: "CRISIS-COLD-001",
    crisisType: "cold_chain_failure",
    severity: "high",
    countryId: "sn",
    nationalGovernanceCaseId: "national-case-1",
    nationalLeadActorId: "actor-national-lead",
    detectedAt: t0,
    createdAt: t0,
  });

  capability.addTerritoryImpact({
    caseId: "crisis-1",
    impact: {
      territoryId: "territory-joal",
      territorialSupervisionCaseId: "territory-case-joal",
      severity: "critical",
      affectedActorCount: 180,
      affectedCampaignCount: 12,
      exposedVolumeKg: 20_000,
      exposedEconomicValueXof: 80_000_000,
      estimatedJobsAtRisk: 240,
      foodSecurityImpactScore: 72,
      sustainabilityImpactScore: 40,
      serviceContinuityScore: 20,
      criticalAlertIds: ["alert-joal-cold"],
      blockers: ["Chambre froide principale indisponible"],
      updatedAt: t0,
    },
  });
  capability.addTerritoryImpact({
    caseId: "crisis-1",
    impact: {
      territoryId: "territory-mbour",
      territorialSupervisionCaseId: "territory-case-mbour",
      severity: "critical",
      affectedActorCount: 140,
      affectedCampaignCount: 8,
      exposedVolumeKg: 12_000,
      exposedEconomicValueXof: 45_000_000,
      estimatedJobsAtRisk: 150,
      foodSecurityImpactScore: 65,
      sustainabilityImpactScore: 35,
      serviceContinuityScore: 25,
      criticalAlertIds: ["alert-mbour-cold"],
      blockers: ["Capacité de glace saturée"],
      updatedAt: t0,
    },
  });

  capability.configureCommandStructure({
    caseId: "crisis-1",
    structure: {
      territorialLeadActorIds: ["actor-joal-lead", "actor-mbour-lead"],
      technicalLeadActorIds: ["actor-cold-chain-expert"],
      logisticsLeadActorId: "actor-logistics-lead",
      financeLeadActorId: "actor-finance-lead",
      communicationsLeadActorId: "actor-comms-lead",
      ministryDecisionMakerIds: ["actor-ministry"],
      partnerActorIds: ["actor-insurer", "actor-public-program"],
    },
    configuredAt: t0,
    actorId: "actor-national-lead",
  });

  capability.qualifyCrisis({
    caseId: "crisis-1",
    qualifiedAt: t1,
    actorId: "actor-ministry",
    rationale: "Défaillance simultanée de la chaîne du froid sur deux territoires majeurs.",
    evidenceIds: ["evidence-national-qualification"],
  });

  return capability;
}

test("une crise multi-territoires orchestre cellule nationale, capacités, financement et actions coordonnées", () => {
  const capability = createQualifiedCrisis();

  capability.registerCapacityRequirement({
    caseId: "crisis-1",
    requirement: {
      id: "requirement-cold-joal",
      territoryId: "territory-joal",
      capacityType: "cold_storage",
      requiredQuantity: 20_000,
      availableQuantity: 4_000,
      mobilizedQuantity: 0,
      unit: "kg",
      priority: "critical",
      estimatedCostXof: 18_000_000,
      status: "validated",
      sourceTerritoryIds: [],
      evidenceIds: ["evidence-capacity-gap-joal"],
    },
    registeredAt: t1,
  });
  capability.registerCapacityRequirement({
    caseId: "crisis-1",
    requirement: {
      id: "requirement-ice-mbour",
      territoryId: "territory-mbour",
      capacityType: "ice",
      requiredQuantity: 8_000,
      availableQuantity: 2_000,
      mobilizedQuantity: 0,
      unit: "kg",
      priority: "critical",
      estimatedCostXof: 7_000_000,
      status: "validated",
      sourceTerritoryIds: [],
      evidenceIds: ["evidence-capacity-gap-mbour"],
    },
    registeredAt: t1,
  });

  capability.attachRecommendation({ caseId: "crisis-1", recommendationId: "recommendation-crisis-1", attachedAt: t1 });
  capability.recordDecision({
    caseId: "crisis-1",
    decision: {
      id: "decision-activate-cell",
      decisionType: "activate_cell",
      territoryIds: ["territory-joal", "territory-mbour"],
      decidedByActorId: "actor-ministry",
      rationale: "Coordonner une réponse nationale immédiate.",
      conditions: ["reporting toutes les six heures"],
      budgetAuthorizedXof: 25_000_000,
      recommendationIds: ["recommendation-crisis-1"],
      policyScenarioIds: [],
      evidenceIds: ["evidence-ministry-decision"],
      decidedAt: t1,
    },
  });
  capability.attachFinancing({ caseId: "crisis-1", financingReferenceId: "emergency-fund-1", attachedAt: t1 });
  capability.attachInsurance({ caseId: "crisis-1", insuranceReferenceId: "insurance-claim-1", attachedAt: t1 });
  capability.attachCommunication({ caseId: "crisis-1", communicationReferenceId: "crisis-bulletin-1", attachedAt: t1 });
  capability.attachPublicProgram({ caseId: "crisis-1", publicProgramId: "public-program-cold-chain", attachedAt: t1 });

  capability.mobilizeCapacity({
    caseId: "crisis-1",
    requirementId: "requirement-cold-joal",
    quantity: 20_000,
    sourceTerritoryId: "territory-dakar",
    evidenceIds: ["evidence-cold-transfer"],
    mobilizedAt: t1,
  });
  capability.mobilizeCapacity({
    caseId: "crisis-1",
    requirementId: "requirement-ice-mbour",
    quantity: 8_000,
    sourceTerritoryId: "territory-thies",
    evidenceIds: ["evidence-ice-transfer"],
    mobilizedAt: t1,
  });

  const readiness = capability.assessReadiness({ caseId: "crisis-1", generatedAt: t1 });
  assert.equal(readiness.readyForResponse, true);
  assert.equal(readiness.capacityCoveragePercent, 100);
  assert.equal(readiness.decisionCoveragePercent, 100);

  capability.launchAction({
    caseId: "crisis-1",
    action: {
      id: "action-transfer-capacity",
      decisionId: "decision-activate-cell",
      territoryIds: ["territory-joal", "territory-mbour"],
      actionType: "capacity_transfer",
      ownerActorId: "actor-logistics-lead",
      partnerActorIds: ["actor-cold-chain-expert"],
      capacityRequirementIds: ["requirement-cold-joal", "requirement-ice-mbour"],
      budgetXof: 25_000_000,
      disbursedXof: 0,
      expectedStartAt: t1,
      expectedEndAt: t2,
      status: "planned",
      blockers: [],
      evidenceIds: ["evidence-action-plan"],
    },
    launchedAt: t1,
    actorId: "actor-national-lead",
  });
  capability.updateAction({
    caseId: "crisis-1",
    actionId: "action-transfer-capacity",
    status: "completed",
    disbursedXof: 23_000_000,
    actualStartAt: t1,
    actualEndAt: t2,
    evidenceIds: ["evidence-action-completed"],
    updatedAt: t2,
    actorId: "actor-logistics-lead",
  });

  capability.recordOutcome({
    caseId: "crisis-1",
    outcome: {
      id: "outcome-joal",
      territoryId: "territory-joal",
      actionId: "action-transfer-capacity",
      measuredAt: t2,
      actorsProtectedCount: 160,
      campaignsStabilizedCount: 10,
      volumeSavedKg: 18_000,
      economicValueProtectedXof: 72_000_000,
      jobsProtectedCount: 210,
      serviceContinuityChangePercent: 65,
      wasteReductionKg: 15_000,
      fishingPressureChangePercent: 0,
      responseTimeHours: 6,
      confidenceScore: 88,
      evidenceIds: ["evidence-outcome-joal"],
      lessonsLearned: ["Pré-positionner des capacités de secours avant la haute saison"],
    },
  });
  capability.recordOutcome({
    caseId: "crisis-1",
    outcome: {
      id: "outcome-mbour",
      territoryId: "territory-mbour",
      actionId: "action-transfer-capacity",
      measuredAt: t2,
      actorsProtectedCount: 120,
      campaignsStabilizedCount: 7,
      volumeSavedKg: 10_000,
      economicValueProtectedXof: 38_000_000,
      jobsProtectedCount: 130,
      serviceContinuityChangePercent: 55,
      wasteReductionKg: 8_000,
      fishingPressureChangePercent: 0,
      responseTimeHours: 7,
      confidenceScore: 84,
      evidenceIds: ["evidence-outcome-mbour"],
      lessonsLearned: ["Formaliser les accords de transfert interterritorial"],
    },
  });

  const commandCenter = capability.getNationalCrisisCommandCenter({ caseId: "crisis-1", generatedAt: t2 });
  assert.equal(commandCenter.status, "responding");
  assert.equal(commandCenter.totalBudgetAuthorizedXof, 25_000_000);
  assert.equal(commandCenter.totalBudgetDisbursedXof, 23_000_000);
  assert.equal(commandCenter.totalEconomicValueProtectedXof, 110_000_000);
  assert.equal(commandCenter.totalVolumeSavedKg, 28_000);
  assert.equal(commandCenter.totalJobsProtectedCount, 340);
});

test("une crise ne peut pas être qualifiée avec un seul territoire", () => {
  const capability = new EndToEndMultiTerritoryCrisisManagementCapability();
  capability.openCrisis({
    id: "crisis-single",
    crisisCode: "CRISIS-ONE-001",
    crisisType: "fuel_shortage",
    severity: "high",
    countryId: "sn",
    nationalGovernanceCaseId: "national-case-1",
    nationalLeadActorId: "actor-national-lead",
    detectedAt: t0,
    createdAt: t0,
  });
  capability.addTerritoryImpact({
    caseId: "crisis-single",
    impact: {
      territoryId: "territory-joal",
      territorialSupervisionCaseId: "territory-case-joal",
      severity: "high",
      affectedActorCount: 30,
      affectedCampaignCount: 4,
      exposedVolumeKg: 0,
      exposedEconomicValueXof: 10_000_000,
      estimatedJobsAtRisk: 40,
      foodSecurityImpactScore: 40,
      sustainabilityImpactScore: 20,
      serviceContinuityScore: 30,
      criticalAlertIds: ["alert-fuel"],
      blockers: [],
      updatedAt: t0,
    },
  });

  assert.throws(
    () => capability.qualifyCrisis({ caseId: "crisis-single", qualifiedAt: t1, actorId: "actor-ministry", rationale: "Crise locale", evidenceIds: ["evidence-1"] }),
    /au moins deux territoires/i,
  );
});

test("la clôture exige reprise, décision explicite, preuves et actions terminées", () => {
  const capability = createQualifiedCrisis();
  capability.recordDecision({
    caseId: "crisis-1",
    decision: {
      id: "decision-activate-cell",
      decisionType: "activate_cell",
      territoryIds: ["territory-joal", "territory-mbour"],
      decidedByActorId: "actor-ministry",
      rationale: "Activer la réponse.",
      conditions: [],
      budgetAuthorizedXof: 0,
      recommendationIds: [],
      policyScenarioIds: [],
      evidenceIds: ["evidence-decision"],
      decidedAt: t1,
    },
  });
  capability.launchAction({
    caseId: "crisis-1",
    action: {
      id: "action-support",
      decisionId: "decision-activate-cell",
      territoryIds: ["territory-joal", "territory-mbour"],
      actionType: "stakeholder_communication",
      ownerActorId: "actor-comms-lead",
      partnerActorIds: [],
      capacityRequirementIds: [],
      budgetXof: 0,
      disbursedXof: 0,
      expectedStartAt: t1,
      expectedEndAt: t2,
      status: "planned",
      blockers: [],
      evidenceIds: ["evidence-plan"],
    },
    launchedAt: t1,
  });
  capability.updateAction({ caseId: "crisis-1", actionId: "action-support", status: "completed", actualStartAt: t1, actualEndAt: t2, evidenceIds: ["evidence-completed"], updatedAt: t2 });
  capability.recordOutcome({
    caseId: "crisis-1",
    outcome: {
      id: "outcome-support",
      territoryId: "territory-joal",
      actionId: "action-support",
      measuredAt: t2,
      actorsProtectedCount: 100,
      campaignsStabilizedCount: 2,
      volumeSavedKg: 1_000,
      economicValueProtectedXof: 5_000_000,
      jobsProtectedCount: 20,
      serviceContinuityChangePercent: 20,
      wasteReductionKg: 500,
      fishingPressureChangePercent: 0,
      responseTimeHours: 4,
      confidenceScore: 80,
      evidenceIds: ["evidence-outcome"],
      lessonsLearned: [],
    },
  });
  capability.markStabilizing({ caseId: "crisis-1", stabilizedAt: t2 });
  capability.startRecovery({ caseId: "crisis-1", startedAt: t3 });

  assert.throws(
    () => capability.closeCrisis({ caseId: "crisis-1", decisionId: "decision-activate-cell", closedAt: t3, actorId: "actor-ministry", evidenceIds: ["evidence-close"] }),
    /décision explicite de clôture/i,
  );

  capability.recordDecision({
    caseId: "crisis-1",
    decision: {
      id: "decision-close",
      decisionType: "close_crisis",
      territoryIds: ["territory-joal", "territory-mbour"],
      decidedByActorId: "actor-ministry",
      rationale: "Les opérations sont stabilisées et la continuité est restaurée.",
      conditions: ["suivi post-crise pendant trente jours"],
      budgetAuthorizedXof: 0,
      recommendationIds: [],
      policyScenarioIds: [],
      evidenceIds: ["evidence-close-decision"],
      decidedAt: t3,
    },
  });
  const closed = capability.closeCrisis({ caseId: "crisis-1", decisionId: "decision-close", closedAt: t3, actorId: "actor-ministry", evidenceIds: ["evidence-close"] });
  assert.equal(closed.status, "closed");
  assert.equal(closed.closedAt, t3);
});
