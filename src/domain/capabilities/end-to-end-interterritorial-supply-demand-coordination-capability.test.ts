import assert from "node:assert/strict";
import test from "node:test";

import { EndToEndInterterritorialSupplyDemandCoordinationCapability } from "./end-to-end-interterritorial-supply-demand-coordination-capability";

const t0 = "2026-07-27T08:00:00Z";
const t1 = "2026-07-27T10:00:00Z";
const t2 = "2026-07-27T14:00:00Z";
const t3 = "2026-07-27T18:00:00Z";

function setupCompleteCoordination() {
  const capability = new EndToEndInterterritorialSupplyDemandCoordinationCapability();
  capability.openCoordination({
    id: "coordination-1",
    coordinationCode: "SN-INT-001",
    countryId: "sn",
    territoryIds: ["territory-joal", "territory-mbour", "territory-dakar"],
    nationalGovernanceCaseId: "national-case-1",
    createdAt: t0,
    actorId: "actor-national-coordinator",
  });

  capability.registerSupply({
    caseId: "coordination-1",
    signal: {
      id: "supply-joal-fish",
      territoryId: "territory-joal",
      actorId: "actor-cooperative-joal",
      organizationId: "cooperative-joal",
      flowType: "product",
      speciesCode: "SARDINE",
      quantity: 10_000,
      unit: "kg",
      availableFrom: t0,
      availableUntil: t3,
      minimumTransferQuantity: 1_000,
      unitPriceXof: 800,
      qualityGrade: "A",
      traceabilityReferenceIds: ["lot-joal-1", "lot-joal-2"],
      sustainabilityConstraints: ["respecter les quotas territoriaux", "éviter toute pression additionnelle"],
      evidenceIds: ["evidence-supply-joal"],
      status: "validated",
    },
    registeredAt: t0,
    actorId: "actor-cooperative-joal",
  });

  capability.registerDemand({
    caseId: "coordination-1",
    signal: {
      id: "demand-dakar-fish",
      territoryId: "territory-dakar",
      actorId: "actor-buyer-dakar",
      organizationId: "buyer-dakar",
      flowType: "product",
      speciesCode: "SARDINE",
      requiredQuantity: 8_000,
      coveredQuantity: 0,
      unit: "kg",
      neededFrom: t1,
      neededUntil: t3,
      maximumUnitPriceXof: 1_000,
      qualityRequirements: ["grade A", "température contrôlée"],
      priority: "high",
      publicInterestReason: "sécuriser l'approvisionnement des marchés urbains",
      evidenceIds: ["evidence-demand-dakar"],
      status: "open",
    },
    registeredAt: t0,
    actorId: "actor-buyer-dakar",
  });

  capability.registerCapacity({
    caseId: "coordination-1",
    signal: {
      id: "capacity-mbour-cold-storage",
      territoryId: "territory-mbour",
      providerActorId: "actor-cold-chain-mbour",
      providerOrganizationId: "cold-chain-mbour",
      flowType: "cold_storage",
      availableQuantity: 12_000,
      reservedQuantity: 0,
      unit: "kg",
      availableFrom: t0,
      availableUntil: t3,
      serviceCostXof: 250_000,
      supportedTerritoryIds: ["territory-joal", "territory-dakar"],
      evidenceIds: ["evidence-cold-storage"],
      status: "available",
    },
    registeredAt: t0,
  });

  capability.registerCapacity({
    caseId: "coordination-1",
    signal: {
      id: "capacity-dakar-transport",
      territoryId: "territory-dakar",
      providerActorId: "actor-logistics-dakar",
      providerOrganizationId: "logistics-dakar",
      flowType: "transport",
      availableQuantity: 10_000,
      reservedQuantity: 0,
      unit: "kg",
      availableFrom: t0,
      availableUntil: t3,
      serviceCostXof: 300_000,
      supportedTerritoryIds: ["territory-joal", "territory-dakar"],
      evidenceIds: ["evidence-transport"],
      status: "available",
    },
    registeredAt: t0,
  });

  capability.generateProposal({
    caseId: "coordination-1",
    proposalId: "proposal-1",
    supplySignalId: "supply-joal-fish",
    demandSignalId: "demand-dakar-fish",
    capacitySignalIds: ["capacity-mbour-cold-storage", "capacity-dakar-transport"],
    proposedQuantity: 8_000,
    proposedUnitPriceXof: 900,
    estimatedLogisticsCostXof: 300_000,
    estimatedServiceCostXof: 250_000,
    estimatedPlatformRevenueXof: 180_000,
    estimatedValueProtectedXof: 6_000_000,
    expectedWasteAvoidedKg: 6_000,
    expectedServiceLevelGainPercent: 15,
    expectedFishingPressureEffectPercent: -4,
    compatibilityScore: 92,
    urgencyScore: 88,
    sustainabilityScore: 85,
    fairnessScore: 80,
    rationale: ["offre excédentaire disponible", "demande urbaine non couverte", "capacités froid et transport disponibles"],
    recommendationId: "recommendation-1",
    generatedAt: t0,
    actorId: "actor-platform",
  });

  return capability;
}

test("une coordination interterritoriale réalloue produits et capacités jusqu'au règlement et à l'impact", () => {
  const capability = setupCompleteCoordination();

  const readiness = capability.assessReadiness({ caseId: "coordination-1", generatedAt: t0 });
  assert.equal(readiness.readyForArbitration, true);
  assert.equal(readiness.signalCoveragePercent, 100);
  assert.equal(readiness.capacityCoveragePercent, 100);

  capability.recordArbitration({
    caseId: "coordination-1",
    arbitration: {
      id: "arbitration-1",
      proposalIds: ["proposal-1"],
      arbitratedByActorId: "actor-national-coordinator",
      decision: "approved",
      approvedQuantity: 8_000,
      budgetAuthorizedXof: 550_000,
      conditions: ["maintenir la chaîne du froid", "prioriser les marchés ciblés"],
      rationale: "Le transfert protège la valeur, réduit les pertes et améliore le service sans pression de pêche supplémentaire.",
      evidenceIds: ["evidence-arbitration"],
      decidedAt: t1,
    },
  });

  const commitments = [
    { id: "commitment-supplier", actorId: "actor-cooperative-joal", role: "supplier" as const, committedQuantity: 8_000 },
    { id: "commitment-buyer", actorId: "actor-buyer-dakar", role: "buyer" as const, committedQuantity: 8_000, committedAmountXof: 7_200_000 },
    { id: "commitment-logistics", actorId: "actor-logistics-dakar", role: "logistics_provider" as const, committedQuantity: 8_000, committedAmountXof: 300_000 },
    { id: "commitment-authority", actorId: "actor-territorial-authority", role: "territorial_authority" as const },
  ];

  for (const commitment of commitments) {
    capability.registerCommitment({
      caseId: "coordination-1",
      commitment: {
        id: commitment.id,
        arbitrationId: "arbitration-1",
        actorId: commitment.actorId,
        role: commitment.role,
        committedQuantity: commitment.committedQuantity,
        committedAmountXof: commitment.committedAmountXof,
        dueAt: t2,
        status: "accepted",
        evidenceIds: [`evidence-${commitment.id}`],
      },
      registeredAt: t1,
    });
  }

  capability.openExecution({
    caseId: "coordination-1",
    execution: {
      id: "execution-1",
      arbitrationId: "arbitration-1",
      proposalId: "proposal-1",
      logisticsMissionId: "logistics-mission-1",
      commercialAgreementId: "commercial-agreement-1",
      financingReferenceId: "financing-1",
      insuranceReferenceId: "insurance-1",
      qualityInspectionIds: [],
      traceabilityReferenceIds: [],
      dispatchedQuantity: 0,
      deliveredQuantity: 0,
      acceptedQuantity: 0,
      rejectedQuantity: 0,
      grossCommercialValueXof: 0,
      logisticsCostXof: 0,
      serviceCostXof: 0,
      platformRevenueXof: 0,
      sellerNetValueXof: 0,
      status: "planned",
      evidenceIds: [],
    },
    openedAt: t1,
    actorId: "actor-platform",
  });

  capability.dispatch({
    caseId: "coordination-1",
    executionId: "execution-1",
    quantity: 8_000,
    dispatchedAt: t1,
    evidenceIds: ["evidence-dispatch"],
    actorId: "actor-cooperative-joal",
  });
  capability.recordDelivery({
    caseId: "coordination-1",
    executionId: "execution-1",
    deliveredQuantity: 7_900,
    deliveredAt: t2,
    traceabilityReferenceIds: ["lot-joal-1", "lot-joal-2"],
    qualityInspectionIds: ["inspection-dakar-1"],
    actorId: "actor-logistics-dakar",
  });
  capability.acceptDelivery({
    caseId: "coordination-1",
    executionId: "execution-1",
    acceptedQuantity: 7_800,
    rejectedQuantity: 100,
    grossCommercialValueXof: 7_020_000,
    logisticsCostXof: 300_000,
    serviceCostXof: 250_000,
    platformRevenueXof: 180_000,
    sellerNetValueXof: 6_200_000,
    acceptedAt: t2,
    evidenceIds: ["evidence-acceptance"],
    actorId: "actor-buyer-dakar",
  });
  capability.settleExecution({
    caseId: "coordination-1",
    executionId: "execution-1",
    settlementReferenceIds: ["payment-seller", "payment-logistics", "payment-platform"],
    settledAt: t3,
    actorId: "actor-finance",
  });
  capability.recordOutcome({
    caseId: "coordination-1",
    outcome: {
      id: "outcome-1",
      executionId: "execution-1",
      measuredAt: t3,
      sourceTerritoryId: "territory-joal",
      destinationTerritoryId: "territory-dakar",
      volumeReallocatedKg: 7_800,
      wasteAvoidedKg: 6_000,
      valueProtectedXof: 6_000_000,
      additionalSellerValueXof: 1_200_000,
      buyerServiceLevelChangePercent: 15,
      sourceTerritoryPressureChangePercent: -4,
      destinationTerritoryPressureChangePercent: -2,
      jobsSupported: 45,
      beneficiaryActorCount: 18,
      confidenceScore: 88,
      evidenceIds: ["evidence-outcome"],
      lessonsLearned: ["pré-réserver les capacités froid et transport", "déclencher l'arbitrage avant saturation locale"],
    },
    actorId: "actor-national-coordinator",
  });

  const commandCenter = capability.getInterterritorialCommandCenter({ caseId: "coordination-1", generatedAt: t3 });
  assert.equal(commandCenter.status, "completed");
  assert.equal(commandCenter.totalVolumeReallocatedKg, 7_800);
  assert.equal(commandCenter.totalWasteAvoidedKg, 6_000);
  assert.equal(commandCenter.totalValueProtectedXof, 6_000_000);
  assert.equal(commandCenter.totalAdditionalSellerValueXof, 1_200_000);
  assert.equal(commandCenter.totalPlatformRevenueXof, 180_000);
  assert.equal(commandCenter.totalJobsSupported, 45);
  assert.equal(commandCenter.openDemandCount, 1);
});

test("une proposition incompatible ou non durable ne peut pas être approuvée", () => {
  const capability = setupCompleteCoordination();
  capability.generateProposal({
    caseId: "coordination-1",
    proposalId: "proposal-blocked",
    supplySignalId: "supply-joal-fish",
    demandSignalId: "demand-dakar-fish",
    capacitySignalIds: ["capacity-mbour-cold-storage"],
    proposedQuantity: 8_000,
    proposedUnitPriceXof: 1_200,
    estimatedLogisticsCostXof: 300_000,
    estimatedServiceCostXof: 250_000,
    estimatedPlatformRevenueXof: 180_000,
    estimatedValueProtectedXof: 2_000_000,
    expectedWasteAvoidedKg: 2_000,
    expectedServiceLevelGainPercent: 5,
    expectedFishingPressureEffectPercent: 8,
    compatibilityScore: 40,
    urgencyScore: 70,
    sustainabilityScore: 35,
    fairnessScore: 20,
    rationale: ["proposition volontairement non conforme"],
    generatedAt: t0,
  });

  assert.throws(
    () => capability.recordArbitration({
      caseId: "coordination-1",
      arbitration: {
        id: "arbitration-invalid",
        proposalIds: ["proposal-blocked"],
        arbitratedByActorId: "actor-national-coordinator",
        decision: "approved",
        approvedQuantity: 8_000,
        budgetAuthorizedXof: 550_000,
        conditions: [],
        rationale: "Approbation impossible",
        evidenceIds: ["evidence-invalid"],
        decidedAt: t1,
      },
    }),
    /proposition bloquée/i,
  );
});

test("l'exécution exige les engagements essentiels de tous les acteurs de la chaîne", () => {
  const capability = setupCompleteCoordination();
  capability.recordArbitration({
    caseId: "coordination-1",
    arbitration: {
      id: "arbitration-2",
      proposalIds: ["proposal-1"],
      arbitratedByActorId: "actor-national-coordinator",
      decision: "approved",
      approvedQuantity: 8_000,
      budgetAuthorizedXof: 550_000,
      conditions: [],
      rationale: "Arbitrage validé",
      evidenceIds: ["evidence-arbitration-2"],
      decidedAt: t1,
    },
  });
  capability.registerCommitment({
    caseId: "coordination-1",
    commitment: {
      id: "commitment-only-supplier",
      arbitrationId: "arbitration-2",
      actorId: "actor-cooperative-joal",
      role: "supplier",
      committedQuantity: 8_000,
      dueAt: t2,
      status: "accepted",
      evidenceIds: ["evidence-supplier"],
    },
    registeredAt: t1,
  });

  assert.throws(
    () => capability.openExecution({
      caseId: "coordination-1",
      execution: {
        id: "execution-invalid",
        arbitrationId: "arbitration-2",
        proposalId: "proposal-1",
        qualityInspectionIds: [],
        traceabilityReferenceIds: [],
        dispatchedQuantity: 0,
        deliveredQuantity: 0,
        acceptedQuantity: 0,
        rejectedQuantity: 0,
        grossCommercialValueXof: 0,
        logisticsCostXof: 0,
        serviceCostXof: 0,
        platformRevenueXof: 0,
        sellerNetValueXof: 0,
        status: "planned",
        evidenceIds: [],
      },
      openedAt: t1,
    }),
    /engagements essentiels manquent/i,
  );
});
