import assert from "node:assert/strict";
import test from "node:test";

import { EndToEndCooperativeManagementCapability } from "./end-to-end-cooperative-management-capability";
import { EndToEndSaleDeliverySettlementCapability } from "./end-to-end-sale-delivery-settlement-capability";
import { EndToEndTerritorialSupervisionCapability } from "./end-to-end-territorial-supervision-capability";

const createdAt = "2026-07-27T08:00:00Z";
const later = "2026-07-27T12:00:00Z";

test("une vente coordonnée relie offre, qualité, logistique, partage de valeur et règlement", () => {
  const capability = new EndToEndSaleDeliverySettlementCapability();

  capability.openCase({
    id: "sale-case-complete",
    territoryId: "territory-joal",
    sellerEconomicActorId: "actor-cooperative",
    buyerEconomicActorId: "actor-buyer",
    cooperativeId: "cooperative-joal",
    requestedQuantityKg: 1_000,
    createdAt,
  });

  capability.publishOffer({
    caseId: "sale-case-complete",
    offerId: "offer-1",
    speciesCode: "THIOF",
    unitPriceXof: 2_000,
    publishedAt: createdAt,
    actorId: "actor-cooperative",
  });
  capability.attachMatch({
    caseId: "sale-case-complete",
    demandId: "demand-1",
    matchId: "match-1",
    matchedAt: createdAt,
    actorId: "actor-buyer",
  });
  capability.reserveQuantity({
    caseId: "sale-case-complete",
    reservationId: "reservation-1",
    quantityKg: 1_000,
    reservedAt: createdAt,
    actorId: "actor-buyer",
  });
  capability.planDelivery({
    caseId: "sale-case-complete",
    logisticsRequestId: "logistics-request-1",
    logisticsMissionId: "logistics-mission-1",
    deliveryWindowStart: "2026-07-27T09:00:00Z",
    deliveryWindowEnd: "2026-07-27T15:00:00Z",
    logisticsCostXof: 120_000,
    plannedAt: createdAt,
    actorId: "actor-logistics",
  });

  const readiness = capability.assessReadiness({ caseId: "sale-case-complete", generatedAt: createdAt });
  assert.equal(readiness.ready, true);

  capability.startTransit({ caseId: "sale-case-complete", startedAt: "2026-07-27T09:15:00Z", actorId: "actor-logistics" });
  capability.recordDelivery({
    caseId: "sale-case-complete",
    deliveredQuantityKg: 980,
    deliveredAt: "2026-07-27T13:30:00Z",
    traceabilityLotIds: ["lot-1", "lot-2"],
    actorId: "actor-logistics",
  });
  capability.acceptDelivery({
    caseId: "sale-case-complete",
    acceptedQuantityKg: 950,
    rejectedQuantityKg: 30,
    qualityInspectionIds: ["inspection-1"],
    qualityAdjustmentXof: -50_000,
    acceptedAt: "2026-07-27T14:00:00Z",
    actorId: "actor-buyer",
  });
  capability.allocateRevenue({
    caseId: "sale-case-complete",
    valueFlowId: "value-flow-1",
    revenueAllocationId: "allocation-1",
    platformRevenueXof: 75_000,
    sellerNetAmountXof: 1_650_000,
    allocatedAt: "2026-07-27T14:15:00Z",
    actorId: "actor-platform",
  });
  capability.settle({
    caseId: "sale-case-complete",
    settlementReferenceIds: ["payment-1", "payment-2"],
    paymentDueAt: "2026-07-28T18:00:00Z",
    settledAt: "2026-07-27T15:00:00Z",
    actorId: "actor-finance",
  });
  capability.close({ caseId: "sale-case-complete", closedAt: later, actorId: "actor-platform" });

  const summary = capability.buildSettlementSummary({ caseId: "sale-case-complete", generatedAt: later });
  assert.equal(summary.grossAmountXof, 1_850_000);
  assert.equal(summary.platformRevenueXof, 75_000);
  assert.equal(summary.sellerNetAmountXof, 1_650_000);
  assert.equal(summary.deliveryPerformancePercent, 98);
  assert.equal(summary.paymentPerformancePercent, 100);
  assert.equal(summary.rejectionRatePercent, 3.06);

  const board = capability.getTerritorySalesBoard("territory-joal");
  assert.equal(board.closedCases.length, 1);
  assert.equal(board.deliveredQuantityKg, 980);
  assert.equal(board.acceptedQuantityKg, 950);
});

test("une transaction refuse une répartition supérieure à la valeur réellement acceptée", () => {
  const capability = new EndToEndSaleDeliverySettlementCapability();
  capability.openCase({
    id: "sale-case-overallocation",
    territoryId: "territory-joal",
    sellerEconomicActorId: "actor-seller",
    buyerEconomicActorId: "actor-buyer",
    requestedQuantityKg: 100,
    createdAt,
  });
  capability.publishOffer({ caseId: "sale-case-overallocation", offerId: "offer-2", speciesCode: "SARDINE", unitPriceXof: 1_000, publishedAt: createdAt });
  capability.attachMatch({ caseId: "sale-case-overallocation", demandId: "demand-2", matchId: "match-2", matchedAt: createdAt });
  capability.reserveQuantity({ caseId: "sale-case-overallocation", reservationId: "reservation-2", quantityKg: 100, reservedAt: createdAt });
  capability.planDelivery({
    caseId: "sale-case-overallocation",
    logisticsRequestId: "request-2",
    logisticsMissionId: "mission-2",
    deliveryWindowStart: "2026-07-27T09:00:00Z",
    deliveryWindowEnd: "2026-07-27T12:00:00Z",
    logisticsCostXof: 10_000,
    plannedAt: createdAt,
  });
  capability.startTransit({ caseId: "sale-case-overallocation", startedAt: createdAt });
  capability.recordDelivery({ caseId: "sale-case-overallocation", deliveredQuantityKg: 100, deliveredAt: later, traceabilityLotIds: ["lot-3"] });
  capability.acceptDelivery({ caseId: "sale-case-overallocation", acceptedQuantityKg: 80, rejectedQuantityKg: 20, qualityInspectionIds: ["inspection-2"], acceptedAt: later });

  assert.throws(
    () => capability.allocateRevenue({
      caseId: "sale-case-overallocation",
      valueFlowId: "flow-invalid",
      revenueAllocationId: "allocation-invalid",
      platformRevenueXof: 20_000,
      sellerNetAmountXof: 70_000,
      allocatedAt: later,
    }),
    /dépasse le montant brut/i,
  );
});

test("une coopérative devient une capacité collective active, gouvernée et économiquement mesurable", () => {
  const capability = new EndToEndCooperativeManagementCapability();
  capability.openCooperative({
    id: "cooperative-case-complete",
    cooperativeId: "cooperative-joal",
    territoryId: "territory-joal",
    organizationId: "organization-cooperative-joal",
    name: "Coopérative de Joal",
    memberTarget: 2,
    createdAt,
    createdByActorId: "actor-founder",
  });
  capability.startFormation({ caseId: "cooperative-case-complete", startedAt: createdAt, actorId: "actor-founder" });

  for (const [memberId, actorId] of [["member-1", "actor-fisher-1"], ["member-2", "actor-fisher-2"]] as const) {
    capability.addMemberCandidate({
      caseId: "cooperative-case-complete",
      memberId,
      actorId,
      roles: ["fisher", "member"],
      trustScore: 80,
      contributionPlanId: "contribution-plan-1",
      contributionDueXof: 50_000,
      addedAt: createdAt,
      addedByActorId: "actor-founder",
    });
    capability.activateMember({ caseId: "cooperative-case-complete", memberId, joinedAt: createdAt, activatedByActorId: "actor-founder" });
    capability.recordContribution({
      caseId: "cooperative-case-complete",
      memberId,
      amountXof: 50_000,
      transactionId: `transaction-${memberId}`,
      paidAt: createdAt,
      actorId,
    });
  }

  capability.openCooperativeFund({ caseId: "cooperative-case-complete", financialAccountId: "fund-account-1", openedAt: createdAt, actorId: "actor-finance" });
  capability.registerSharedAsset({ caseId: "cooperative-case-complete", assetId: "cold-room-1", registeredAt: createdAt, actorId: "actor-founder" });
  capability.attachDocument({ caseId: "cooperative-case-complete", documentId: "statutes-1", attachedAt: createdAt, actorId: "actor-founder" });
  capability.openGovernanceCycle({
    caseId: "cooperative-case-complete",
    cycleId: "governance-cycle-1",
    assemblyId: "assembly-1",
    quorumRequiredPercent: 60,
    openedAt: createdAt,
    actorId: "actor-founder",
  });
  capability.recordQuorum({ caseId: "cooperative-case-complete", cycleId: "governance-cycle-1", quorumReachedPercent: 100, recordedAt: createdAt });
  capability.recordGovernanceDecision({
    caseId: "cooperative-case-complete",
    cycleId: "governance-cycle-1",
    resolutionIds: ["resolution-budget", "resolution-services"],
    voteIds: ["vote-1", "vote-2"],
    decidedAt: createdAt,
  });
  capability.closeGovernanceCycle({ caseId: "cooperative-case-complete", cycleId: "governance-cycle-1", closedAt: createdAt });

  const readiness = capability.assessActivationReadiness({ caseId: "cooperative-case-complete", generatedAt: createdAt });
  assert.equal(readiness.readyForActivation, true);
  capability.activateCooperative({ caseId: "cooperative-case-complete", activatedAt: createdAt, actorId: "actor-founder" });

  capability.requestService({
    caseId: "cooperative-case-complete",
    requestId: "service-request-ice",
    memberId: "member-1",
    serviceType: "ice",
    requestedAt: createdAt,
    quantity: 300,
    unit: "kg",
    estimatedCostXof: 30_000,
  });
  capability.approveService({
    caseId: "cooperative-case-complete",
    requestId: "service-request-ice",
    approvedAt: createdAt,
    approvedByActorId: "actor-founder",
    reservationId: "reservation-ice-1",
    assetId: "cold-room-1",
  });
  capability.deliverService({ caseId: "cooperative-case-complete", requestId: "service-request-ice", deliveredAt: later, serviceRevenueXof: 30_000, actorId: "actor-service-provider" });
  capability.linkCampaign({ caseId: "cooperative-case-complete", campaignId: "campaign-1", linkedAt: later });
  capability.linkSaleCase({
    caseId: "cooperative-case-complete",
    saleCaseId: "sale-case-complete",
    linkedAt: later,
    commercialRevenueXof: 1_650_000,
    platformFeesXof: 75_000,
  });
  capability.recordOperatingCost({ caseId: "cooperative-case-complete", costId: "cost-1", amountXof: 200_000, recordedAt: later });
  capability.recordFinancingExposure({ caseId: "cooperative-case-complete", financingRequestId: "financing-1", outstandingAmountXof: 300_000, recordedAt: later });

  const performance = capability.buildPerformanceSnapshot({ caseId: "cooperative-case-complete", generatedAt: later });
  assert.equal(performance.activeMembers, 2);
  assert.equal(performance.contributionCollectionRatePercent, 100);
  assert.equal(performance.fulfilledServiceRequestRatePercent, 100);
  assert.equal(performance.governanceCompletionRatePercent, 100);
  assert.equal(performance.activeCampaignCount, 1);
  assert.equal(performance.activeSaleCaseCount, 1);
  assert.equal(performance.cooperativeFundBalanceXof, 100_000);
  assert.ok(performance.healthScore >= 70);
});

test("une coopérative non conforme est restreinte et ne peut masquer son risque institutionnel", () => {
  const capability = new EndToEndCooperativeManagementCapability();
  capability.openCooperative({
    id: "cooperative-case-risk",
    cooperativeId: "cooperative-risk",
    territoryId: "territory-joal",
    organizationId: "organization-risk",
    name: "Coopérative à risque",
    memberTarget: 1,
    createdAt,
  });
  capability.startFormation({ caseId: "cooperative-case-risk", startedAt: createdAt });
  capability.addMemberCandidate({ caseId: "cooperative-case-risk", memberId: "member-risk", actorId: "actor-risk", trustScore: 80, addedAt: createdAt });
  capability.activateMember({ caseId: "cooperative-case-risk", memberId: "member-risk", joinedAt: createdAt });
  capability.openCooperativeFund({ caseId: "cooperative-case-risk", financialAccountId: "fund-risk", openedAt: createdAt });
  capability.openGovernanceCycle({ caseId: "cooperative-case-risk", cycleId: "cycle-risk", quorumRequiredPercent: 50, openedAt: createdAt });
  capability.recordQuorum({ caseId: "cooperative-case-risk", cycleId: "cycle-risk", quorumReachedPercent: 100, recordedAt: createdAt });
  capability.recordGovernanceDecision({ caseId: "cooperative-case-risk", cycleId: "cycle-risk", resolutionIds: ["resolution-risk"], voteIds: ["vote-risk"], decidedAt: createdAt });
  capability.closeGovernanceCycle({ caseId: "cooperative-case-risk", cycleId: "cycle-risk", closedAt: createdAt });
  capability.activateCooperative({ caseId: "cooperative-case-risk", activatedAt: createdAt });
  const restricted = capability.attachComplianceAssessment({
    caseId: "cooperative-case-risk",
    assessmentId: "assessment-non-compliant",
    status: "non_compliant",
    attachedAt: later,
  });
  assert.equal(restricted.status, "restricted");
  assert.match(restricted.blockers.join(" "), /non-conformité/i);
});

test("la supervision territoriale consolide opérations, économie, durabilité et décisions", () => {
  const capability = new EndToEndTerritorialSupervisionCapability();
  capability.openTerritory({ id: "territory-case-complete", territoryId: "territory-joal", authorityActorId: "actor-authority", createdAt });
  capability.updateActorCoverage({
    caseId: "territory-case-complete",
    coverage: [
      { actorType: "fisher", registeredCount: 120, activeCount: 90, verifiedCount: 80 },
      { actorType: "cooperative", registeredCount: 5, activeCount: 4, verifiedCount: 4 },
      { actorType: "buyer", registeredCount: 20, activeCount: 15, verifiedCount: 12 },
      { actorType: "logistics_provider", registeredCount: 8, activeCount: 6, verifiedCount: 5 },
      { actorType: "authority", registeredCount: 2, activeCount: 2, verifiedCount: 2 },
      { actorType: "cold_storage", registeredCount: 3, activeCount: 2, verifiedCount: 2 },
    ],
    updatedAt: createdAt,
    actorId: "actor-authority",
  });
  capability.linkCampaign({ caseId: "territory-case-complete", campaignId: "campaign-1", linkedAt: createdAt });
  capability.linkSaleCase({
    caseId: "territory-case-complete",
    saleCaseId: "sale-case-complete",
    grossCommercialValueXof: 1_850_000,
    sellerNetValueXof: 1_650_000,
    platformRevenueXof: 75_000,
    linkedAt: createdAt,
  });
  capability.linkCooperative({
    caseId: "territory-case-complete",
    cooperativeCaseId: "cooperative-case-complete",
    cooperativeFundBalanceXof: 100_000,
    financingExposureXof: 300_000,
    linkedAt: createdAt,
  });
  capability.updateOperationalSnapshot({
    caseId: "territory-case-complete",
    snapshot: {
      logisticsMissionCount: 1,
      coldStorageUtilizationPercent: 65,
      pendingQualityInspectionCount: 0,
      serviceLevelPercent: 88,
      wasteRatePercent: 4,
    },
    updatedAt: later,
  });
  capability.updateEconomicSnapshot({
    caseId: "territory-case-complete",
    snapshot: { operatingCostXof: 250_000 },
    updatedAt: later,
  });
  capability.updateSustainabilitySnapshot({
    caseId: "territory-case-complete",
    snapshot: {
      fishingPressureIndex: 38,
      lowCatchRatePercent: 18,
      emptyReturnRatePercent: 12,
      catchPerTripKg: 420,
      protectedSpeciesAlertCount: 0,
    },
    updatedAt: later,
  });
  capability.attachPublicProgram({ caseId: "territory-case-complete", publicProgramId: "program-cold-chain", attachedAt: later });
  capability.attachRecommendation({ caseId: "territory-case-complete", recommendationId: "recommendation-1", attachedAt: later });
  capability.recordDecision({ caseId: "territory-case-complete", decisionId: "decision-1", decidedAt: later, actorId: "actor-authority", details: { action: "renforcer la chaîne du froid" } });
  capability.attachDocument({ caseId: "territory-case-complete", documentId: "territorial-brief-1", attachedAt: later });

  const readiness = capability.assessReadiness({ caseId: "territory-case-complete", generatedAt: later });
  assert.equal(readiness.operationallyReady, true);
  assert.ok(readiness.score >= 90);

  const reviewed = capability.reviewTerritory({ caseId: "territory-case-complete", reviewedAt: later, actorId: "actor-authority" });
  assert.equal(reviewed.status, "operational");

  const brief = capability.buildDecisionBrief({ caseId: "territory-case-complete", generatedAt: later });
  assert.equal(brief.status, "operational");
  assert.equal(brief.economic.grossCommercialValueXof, 1_850_000);
  assert.equal(brief.economic.sellerNetValueXof, 1_650_000);
  assert.equal(brief.operational.activeCampaignCount, 1);

  const commandCenter = capability.getTerritorialCommandCenter();
  assert.equal(commandCenter.territoryCount, 1);
  assert.equal(commandCenter.operationalTerritoryCount, 1);
  assert.equal(commandCenter.activeCooperativeCount, 1);
  assert.equal(commandCenter.platformRevenueXof, 75_000);
});

test("une alerte critique transforme la supervision territoriale en dispositif d'intervention", () => {
  const capability = new EndToEndTerritorialSupervisionCapability();
  capability.openTerritory({ id: "territory-case-alert", territoryId: "territory-saint-louis", authorityActorId: "actor-authority", createdAt });
  capability.updateActorCoverage({
    caseId: "territory-case-alert",
    coverage: [
      { actorType: "fisher", registeredCount: 50, activeCount: 40, verifiedCount: 35 },
      { actorType: "cooperative", registeredCount: 2, activeCount: 2, verifiedCount: 2 },
      { actorType: "buyer", registeredCount: 8, activeCount: 6, verifiedCount: 5 },
      { actorType: "logistics_provider", registeredCount: 3, activeCount: 2, verifiedCount: 2 },
      { actorType: "authority", registeredCount: 1, activeCount: 1, verifiedCount: 1 },
    ],
    updatedAt: createdAt,
  });
  capability.updateOperationalSnapshot({ caseId: "territory-case-alert", snapshot: { serviceLevelPercent: 75 }, updatedAt: createdAt });
  capability.updateSustainabilitySnapshot({
    caseId: "territory-case-alert",
    snapshot: { fishingPressureIndex: 80, lowCatchRatePercent: 70, emptyReturnRatePercent: 60, protectedSpeciesAlertCount: 3 },
    updatedAt: later,
  });
  capability.attachAlert({ caseId: "territory-case-alert", alertId: "alert-resource-critical", severity: "critical", attachedAt: later });
  capability.attachDocument({ caseId: "territory-case-alert", documentId: "evidence-alert", attachedAt: later });

  const reviewed = capability.reviewTerritory({ caseId: "territory-case-alert", reviewedAt: later });
  assert.equal(reviewed.status, "critical");
  const brief = capability.buildDecisionBrief({ caseId: "territory-case-alert", generatedAt: later });
  assert.ok(brief.topRisks.length >= 2);
  assert.ok(brief.priorityDecisions.some((decision) => decision.includes("effort de pêche")));
});
