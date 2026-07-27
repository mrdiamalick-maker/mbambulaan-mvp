import assert from "node:assert/strict";
import test from "node:test";

import { EndToEndFishingCampaignCapability } from "./end-to-end-fishing-campaign-capability";
import { EndToEndNationalFisheriesGovernanceCapability } from "./end-to-end-national-fisheries-governance-capability";

const t0 = "2026-07-27T08:00:00Z";
const t1 = "2026-07-27T09:00:00Z";
const t2 = "2026-07-27T10:00:00Z";
const t3 = "2026-07-27T11:00:00Z";
const t4 = "2026-07-27T12:00:00Z";

function createCampaignCapability() {
  const capability = new EndToEndFishingCampaignCapability();
  capability.createCampaign({
    id: "campaign-1",
    cooperativeId: "cooperative-1",
    fisherActorId: "fisher-1",
    territoryId: "territory-joal",
    campaignCode: "JOAL-2026-001",
    plannedDepartureAt: t1,
    plannedReturnAt: "2026-07-28T08:00:00Z",
    objective: "Créer de la valeur sans accroître la pression sur la ressource",
    resourcePlan: {
      vesselId: "vessel-1",
      crewMemberIds: ["crew-1", "crew-2"],
      gearIds: ["gear-1"],
      fuelQuantityLiters: 120,
      iceQuantityKg: 500,
      coldStorageCapacityKg: 1_000,
      transportCapacityKg: 1_000,
      landingSiteId: "site-joal",
      fishingZoneId: "zone-1",
      targetSpeciesCodes: ["THIOF"],
    },
    financialPlan: {
      estimatedCostXof: 450_000,
    },
    commercialPlan: {
      demandSignalIds: ["demand-1"],
      buyerIds: ["buyer-1"],
      expectedQuantityKg: 800,
      targetPriceXofPerKg: 2_500,
      marketplaceOfferIds: [],
      reservationIds: [],
    },
    qualityPlan: {
      traceabilityLotIds: [],
      certificateIds: [],
      temperatureMonitoringIds: [],
    },
    decisionRecommendationIds: [],
    ministryAlertIds: [],
    createdAt: t0,
  });
  return capability;
}

test("une campagne de pêche traverse toute la chaîne jusqu'à la clôture économique", () => {
  const capability = createCampaignCapability();

  capability.linkOperationalPlan({
    campaignId: "campaign-1",
    resourcePlanId: "resource-plan-1",
    sustainabilityAssessmentId: "sustainability-1",
    decisionRecommendationIds: ["recommendation-1"],
    approvedAt: t0,
    actorId: "coordinator-1",
  });
  capability.requestFinancing({ campaignId: "campaign-1", financingRequestId: "finance-request-1", requestedAt: t0, actorId: "cooperative-1" });
  capability.approveFinancing({ campaignId: "campaign-1", advanceTransactionId: "advance-1", insurancePolicyId: "policy-1", approvedAt: t0, actorId: "finance-1" });
  capability.reserveResources({ campaignId: "campaign-1", logisticsMissionId: "logistics-1", reservedAt: t0, actorId: "coordinator-1" });
  capability.recordDeparture({ campaignId: "campaign-1", departedAt: t1, actorId: "fisher-1" });
  capability.recordLanding({ campaignId: "campaign-1", returnedAt: t2, landedQuantityKg: 760, traceabilityLotIds: ["lot-1", "lot-2"], actorId: "landing-agent-1" });
  capability.validateQuality({ campaignId: "campaign-1", inspectionId: "inspection-1", certificateIds: ["certificate-1"], temperatureMonitoringIds: ["temperature-1"], rejectedQuantityKg: 20, validatedAt: t2, actorId: "quality-agent-1" });
  capability.publishOffers({ campaignId: "campaign-1", marketplaceOfferIds: ["offer-1"], publishedAt: t2, actorId: "cooperative-1" });
  capability.reserveSales({ campaignId: "campaign-1", reservationIds: ["reservation-1"], soldQuantityKg: 700, grossRevenueXof: 1_750_000, reservedAt: t3, actorId: "buyer-1" });
  capability.settleCampaign({ campaignId: "campaign-1", settlementAllocationId: "settlement-1", netRevenueXof: 1_300_000, settledAt: t4, actorId: "finance-1" });
  const closure = capability.closeCampaign({ campaignId: "campaign-1", closedAt: t4, actorId: "cooperative-1" });

  assert.equal(closure.landedQuantityKg, 760);
  assert.equal(closure.soldQuantityKg, 700);
  assert.equal(closure.rejectedQuantityKg, 20);
  assert.equal(closure.netRevenueXof, 1_300_000);
  assert.equal(closure.saleThroughRatePercent, 92.11);
  assert.equal(capability.getCampaignWorkspace("campaign-1").campaign.status, "closed");
});

test("une campagne ne peut pas réserver ses ressources sans plan opérationnel", () => {
  const capability = createCampaignCapability();
  assert.throws(
    () => capability.reserveResources({ campaignId: "campaign-1", logisticsMissionId: "logistics-1", reservedAt: t0, actorId: "coordinator-1" }),
    /Plan opérationnel non lié/i,
  );
});

function createNationalGovernance() {
  const capability = new EndToEndNationalFisheriesGovernanceCapability();
  capability.openNationalGovernance({ id: "national-1", countryId: "sn", ministryActorId: "ministry-1", createdAt: t0 });

  const objectives = [
    { id: "objective-coordination", dimension: "coordination" as const, label: "Améliorer la coordination nationale", baselineValue: 40, targetValue: 85, currentValue: 40, unit: "%", targetDate: "2027-12-31T00:00:00Z", ownerActorId: "ministry-1", territoryIds: ["territory-joal"], weight: 1, status: "off_track" as const, evidenceIds: [] },
    { id: "objective-value", dimension: "economic_value" as const, label: "Augmenter la valeur retenue par les acteurs", baselineValue: 55, targetValue: 75, currentValue: 55, unit: "%", targetDate: "2027-12-31T00:00:00Z", ownerActorId: "ministry-1", territoryIds: ["territory-joal"], weight: 1, status: "off_track" as const, evidenceIds: [] },
    { id: "objective-resource", dimension: "resource_preservation" as const, label: "Réduire la pression sur la ressource", baselineValue: 80, targetValue: 55, currentValue: 80, unit: "index", targetDate: "2027-12-31T00:00:00Z", ownerActorId: "ministry-1", territoryIds: ["territory-joal"], weight: 1, status: "off_track" as const, evidenceIds: [] },
  ];
  for (const objective of objectives) capability.defineObjective({ caseId: "national-1", objective, definedAt: t0, actorId: "ministry-1" });

  capability.upsertTerritorySnapshot({
    caseId: "national-1",
    snapshot: {
      territoryId: "territory-joal",
      supervisionCaseId: "territorial-1",
      status: "operational",
      registeredActorCount: 1_000,
      activeFisherCount: 400,
      activeCooperativeCount: 12,
      activeBuyerCount: 90,
      activeCampaignCount: 25,
      grossCommercialValueXof: 100_000_000,
      sellerNetValueXof: 75_000_000,
      platformRevenueXof: 1_000_000,
      financingExposureXof: 10_000_000,
      logisticsCapacityScore: 75,
      coldChainCapacityScore: 70,
      qualityCompliancePercent: 90,
      serviceLevelPercent: 82,
      wasteRatePercent: 8,
      fishingPressureIndex: 45,
      emptyReturnRatePercent: 12,
      catchPerTripKg: 180,
      sustainabilityRiskLevel: "moderate",
      openCriticalAlertCount: 0,
      openComplianceIssueCount: 0,
      readinessScore: 88,
      capturedAt: t1,
    },
    updatedAt: t1,
    actorId: "coordinator-1",
  });
  return capability;
}

test("le pilotage national relie objectifs, simulation, décision, intervention et impact réel", () => {
  const capability = createNationalGovernance();

  capability.updateObjectiveProgress({ caseId: "national-1", objectiveId: "objective-coordination", currentValue: 70, evidenceIds: ["evidence-coordination"], updatedAt: t1, actorId: "ministry-1" });
  capability.updateObjectiveProgress({ caseId: "national-1", objectiveId: "objective-value", currentValue: 68, evidenceIds: ["evidence-value"], updatedAt: t1, actorId: "ministry-1" });
  capability.updateObjectiveProgress({ caseId: "national-1", objectiveId: "objective-resource", currentValue: 60, evidenceIds: ["evidence-resource"], updatedAt: t1, actorId: "ministry-1" });

  capability.createPolicyScenario({
    caseId: "national-1",
    scenario: {
      id: "scenario-1",
      title: "Renforcement coordonné du froid et réduction ciblée de l'effort",
      description: "Combiner investissement froid et protection de la ressource.",
      status: "draft",
      territoryIds: ["territory-joal"],
      assumptions: { demandGrowthPercent: 8 },
      measures: [
        { type: "cold_chain_support", value: 50_000_000, unit: "XOF", territoryIds: ["territory-joal"] },
        { type: "fishing_effort_restriction", value: 10, unit: "%", territoryIds: ["territory-joal"] },
      ],
      projectedEconomicImpactXof: 0,
      projectedPublicCostXof: 0,
      projectedJobsImpact: 0,
      projectedWasteReductionPercent: 0,
      projectedFishingPressureChangePercent: 0,
      projectedFoodSecurityChangePercent: 0,
      confidenceScore: 0,
      riskFactors: [],
      createdAt: t1,
    },
    createdAt: t1,
    actorId: "ministry-1",
  });
  capability.simulatePolicyScenario({
    caseId: "national-1",
    scenarioId: "scenario-1",
    results: {
      projectedEconomicImpactXof: 90_000_000,
      projectedPublicCostXof: 50_000_000,
      projectedJobsImpact: 120,
      projectedWasteReductionPercent: 20,
      projectedFishingPressureChangePercent: -12,
      projectedFoodSecurityChangePercent: 8,
      confidenceScore: 82,
      riskFactors: ["Délai de mobilisation des équipements"],
    },
    simulatedAt: t2,
    actorId: "ministry-1",
  });
  capability.recordAIRecommendation({
    caseId: "national-1",
    recommendation: {
      id: "recommendation-1",
      title: "Mettre en œuvre le scénario coordonné",
      rationale: "Meilleur compromis valeur, emploi et ressource.",
      territoryIds: ["territory-joal"],
      objectiveIds: ["objective-coordination", "objective-value", "objective-resource"],
      recommendedActions: ["Financer le froid", "Réduire temporairement l'effort"],
      expectedEconomicImpactXof: 90_000_000,
      expectedSocialImpactScore: 80,
      expectedEnvironmentalImpactScore: 85,
      confidenceScore: 82,
      evidenceIds: ["evidence-simulation"],
      status: "proposed",
      generatedAt: t2,
    },
    actorId: "ai-engine",
  });
  capability.recordDecision({
    caseId: "national-1",
    decision: {
      id: "decision-1",
      title: "Déployer le programme froid et ressource",
      decisionType: "policy",
      territoryIds: ["territory-joal"],
      objectiveIds: ["objective-coordination", "objective-value", "objective-resource"],
      recommendationIds: ["recommendation-1"],
      scenarioIds: ["scenario-1"],
      decidedByActorId: "ministry-1",
      rationale: "Arbitrage validé sur la base des impacts projetés.",
      conditions: ["Suivi mensuel des résultats"],
      expectedResults: ["Réduction des pertes", "Réduction de la pression"],
      budgetAuthorizedXof: 50_000_000,
      status: "decided",
      interventionIds: [],
      evidenceIds: ["evidence-decision"],
      decidedAt: t3,
    },
  });
  capability.launchIntervention({
    caseId: "national-1",
    intervention: {
      id: "intervention-1",
      decisionId: "decision-1",
      territoryIds: ["territory-joal"],
      interventionType: "logistics_support",
      ownerActorId: "ministry-1",
      partnerActorIds: ["coordinator-1", "cooperative-1"],
      status: "proposed",
      budgetXof: 50_000_000,
      disbursedXof: 0,
      expectedStartAt: t3,
      expectedEndAt: "2026-12-31T00:00:00Z",
      milestones: [{ id: "milestone-1", label: "Capacité de froid installée", dueAt: "2026-10-31T00:00:00Z", status: "pending", evidenceIds: [] }],
      blockers: [],
      evidenceIds: [],
    },
    launchedAt: t3,
    actorId: "ministry-1",
  });
  capability.updateIntervention({ caseId: "national-1", interventionId: "intervention-1", status: "completed", disbursedXof: 48_000_000, evidenceIds: ["evidence-installation"], actualStartAt: t3, actualEndAt: t4, updatedAt: t4, actorId: "coordinator-1" });
  capability.completeMilestone({ caseId: "national-1", interventionId: "intervention-1", milestoneId: "milestone-1", evidenceIds: ["evidence-cold-chain"], completedAt: t4, actorId: "coordinator-1" });
  capability.recordInterventionOutcome({
    caseId: "national-1",
    outcome: {
      id: "outcome-1",
      interventionId: "intervention-1",
      measuredAt: t4,
      economicValueCreatedXof: 70_000_000,
      economicValueProtectedXof: 25_000_000,
      beneficiaryCount: 500,
      jobsSupported: 80,
      wasteAvoidedKg: 12_000,
      serviceLevelChangePercent: 12,
      fishingPressureChangePercent: -8,
      emptyReturnRateChangePercent: -4,
      foodSecurityChangePercent: 6,
      confidenceScore: 88,
      evidenceIds: ["evidence-outcome"],
      lessonsLearned: ["Associer investissement et règles d'usage"],
    },
    actorId: "coordinator-1",
  });

  const commandCenter = capability.getNationalCommandCenter({ caseId: "national-1", generatedAt: t4 });
  assert.equal(commandCenter.economic.estimatedAdditionalValueCreatedXof, 70_000_000);
  assert.equal(commandCenter.economic.estimatedValueProtectedXof, 25_000_000);
  assert.equal(commandCenter.social.estimatedJobsSupported, 80);
  assert.equal(commandCenter.sustainability.estimatedWasteAvoidedKg, 12_000);
  assert.equal(commandCenter.recentOutcomes.length, 1);
});

test("le readiness national exige les trois objectifs structurants et un territoire", () => {
  const capability = createNationalGovernance();
  const readiness = capability.assessReadiness({ caseId: "national-1", generatedAt: t2 });
  assert.equal(readiness.readyForNationalSteering, true);
  assert.equal(readiness.territoryCoveragePercent, 100);
});
