import assert from "node:assert/strict";
import test from "node:test";

import { EndToEndMbambulaanEconomicSteeringCapability } from "./end-to-end-mbambulaan-economic-steering-capability";

const periodStart = "2026-01-01T00:00:00Z";
const periodEnd = "2026-12-31T23:59:59Z";
const recordedAt = "2026-07-27T10:30:00Z";

function createEconomicCase() {
  const capability = new EndToEndMbambulaanEconomicSteeringCapability();
  capability.openPeriod({
    id: "economic-2026",
    companyId: "mbambulaan-company",
    periodStart,
    periodEnd,
    openingCashXof: 60_000_000,
    createdAt: periodStart,
    actorId: "actor-founder",
  });
  return capability;
}

test("Mbàmbulaan mesure un mix de revenus, ses coûts et sa valeur créée pour l'écosystème", () => {
  const capability = createEconomicCase();

  const revenues = [
    {
      id: "revenue-commission",
      modelType: "transaction_commission" as const,
      amountXof: 18_000_000,
      recognizedAmountXof: 15_000_000,
      collectedAmountXof: 13_500_000,
      status: "partially_collected" as const,
      recurring: false,
      dimension: { capabilityId: "interterritorial-coordination", territoryId: "territory-joal", payerActorId: "payer-buyers" },
    },
    {
      id: "revenue-subscription",
      modelType: "subscription" as const,
      amountXof: 12_000_000,
      recognizedAmountXof: 12_000_000,
      collectedAmountXof: 12_000_000,
      status: "collected" as const,
      recurring: true,
      dimension: { capabilityId: "cooperative-management", territoryId: "territory-mbour", payerActorId: "payer-cooperatives" },
    },
    {
      id: "revenue-public-contract",
      modelType: "public_service_contract" as const,
      amountXof: 30_000_000,
      recognizedAmountXof: 25_000_000,
      collectedAmountXof: 20_000_000,
      status: "partially_collected" as const,
      recurring: true,
      dimension: { capabilityId: "national-governance", territoryId: "territory-national", payerActorId: "payer-ministry", contractId: "contract-ministry-1" },
    },
    {
      id: "revenue-grant",
      modelType: "grant" as const,
      amountXof: 10_000_000,
      recognizedAmountXof: 10_000_000,
      collectedAmountXof: 10_000_000,
      status: "collected" as const,
      recurring: false,
      dimension: { capabilityId: "ecosystem-foundation", payerActorId: "payer-donor", publicProgramId: "grant-program-1" },
    },
  ];

  for (const revenue of revenues) {
    capability.recordRevenue({
      caseId: "economic-2026",
      revenue: {
        ...revenue,
        periodStart,
        periodEnd,
        dueAt: periodEnd,
        sourceReferenceIds: [`source-${revenue.id}`],
        evidenceIds: [`evidence-${revenue.id}`],
        recordedAt,
      },
    });
  }

  const costs = [
    { id: "cost-product", costType: "product" as const, amountXof: 14_000_000, fixed: true, capabilityId: "ecosystem-foundation" },
    { id: "cost-tech", costType: "technology" as const, amountXof: 8_000_000, fixed: true, capabilityId: "ecosystem-foundation" },
    { id: "cost-field", costType: "field_operations" as const, amountXof: 12_000_000, fixed: false, capabilityId: "interterritorial-coordination", territoryId: "territory-joal" },
    { id: "cost-support", costType: "customer_success" as const, amountXof: 6_000_000, fixed: false, capabilityId: "cooperative-management", territoryId: "territory-mbour" },
    { id: "cost-compliance", costType: "compliance" as const, amountXof: 4_000_000, fixed: true, capabilityId: "national-governance", territoryId: "territory-national" },
  ];

  for (const cost of costs) {
    capability.recordCost({
      caseId: "economic-2026",
      cost: {
        id: cost.id,
        costType: cost.costType,
        amountXof: cost.amountXof,
        committedAmountXof: cost.amountXof,
        paidAmountXof: cost.amountXof,
        fixed: cost.fixed,
        avoidable: !cost.fixed,
        periodStart,
        periodEnd,
        dimension: { capabilityId: cost.capabilityId, territoryId: cost.territoryId },
        evidenceIds: [`evidence-${cost.id}`],
        recordedAt,
      },
    });
  }

  capability.recordValueCreation({
    caseId: "economic-2026",
    record: {
      id: "value-interterritorial",
      valueType: "value_protected",
      monetaryValueXof: 110_000_000,
      quantity: 28_000,
      unit: "kg",
      dimension: { capabilityId: "interterritorial-coordination", territoryId: "territory-joal", beneficiaryActorId: "beneficiary-fishers" },
      sourceReferenceIds: ["crisis-outcome-1"],
      evidenceIds: ["evidence-value-1"],
      measuredAt: recordedAt,
    },
  });
  capability.recordValueCreation({
    caseId: "economic-2026",
    record: {
      id: "value-cooperatives",
      valueType: "value_created",
      monetaryValueXof: 45_000_000,
      dimension: { capabilityId: "cooperative-management", territoryId: "territory-mbour", beneficiaryActorId: "beneficiary-cooperatives" },
      sourceReferenceIds: ["cooperative-performance-1"],
      evidenceIds: ["evidence-value-2"],
      measuredAt: recordedAt,
    },
  });

  const review = capability.reviewPeriod({ caseId: "economic-2026", reviewedAt: recordedAt, actorId: "actor-cfo" });
  assert.equal(review.snapshot.revenueXof, 70_000_000);
  assert.equal(review.snapshot.recognizedRevenueXof, 62_000_000);
  assert.equal(review.snapshot.collectedRevenueXof, 55_500_000);
  assert.equal(review.snapshot.totalCostXof, 44_000_000);
  assert.equal(review.snapshot.operatingResultXof, 18_000_000);
  assert.equal(review.snapshot.valueCreatedAndProtectedXof, 155_000_000);
  assert.equal(review.snapshot.grantDependencyPercent, 14.29);
  assert.equal(review.snapshot.recurringRevenueSharePercent, 60);
  assert.equal(review.snapshot.collectionRatePercent, 89.52);
  assert.equal(review.blockers.length, 0);

  const commandCenter = capability.getCommandCenter({ caseId: "economic-2026", generatedAt: recordedAt });
  assert.equal(commandCenter.byCapability.find((entry) => entry.key === "interterritorial-coordination")?.revenueXof, 18_000_000);
  assert.equal(commandCenter.byCapability.find((entry) => entry.key === "cooperative-management")?.operatingResultXof, 6_000_000);
  assert.equal(commandCenter.byPayer.length, 4);
  assert.equal(commandCenter.byRevenueModel[0].modelType, "public_service_contract");
});

test("le pilotage économique alerte sur la concentration, les subventions et un encaissement insuffisant", () => {
  const capability = createEconomicCase();

  capability.recordRevenue({
    caseId: "economic-2026",
    revenue: {
      id: "revenue-dominant-grant",
      modelType: "grant",
      amountXof: 80_000_000,
      recognizedAmountXof: 80_000_000,
      collectedAmountXof: 20_000_000,
      status: "partially_collected",
      recurring: false,
      periodStart,
      periodEnd,
      dueAt: periodEnd,
      dimension: { payerActorId: "payer-single-donor", capabilityId: "ecosystem-foundation" },
      sourceReferenceIds: ["grant-contract"],
      evidenceIds: ["grant-evidence"],
      recordedAt,
    },
  });
  capability.recordRevenue({
    caseId: "economic-2026",
    revenue: {
      id: "revenue-small-commercial",
      modelType: "subscription",
      amountXof: 10_000_000,
      recognizedAmountXof: 10_000_000,
      collectedAmountXof: 5_000_000,
      status: "partially_collected",
      recurring: true,
      periodStart,
      periodEnd,
      dimension: { payerActorId: "payer-cooperatives", capabilityId: "cooperative-management" },
      sourceReferenceIds: ["subscription-contract"],
      evidenceIds: ["subscription-evidence"],
      recordedAt,
    },
  });
  capability.recordCost({
    caseId: "economic-2026",
    cost: {
      id: "cost-heavy",
      costType: "field_operations",
      amountXof: 75_000_000,
      committedAmountXof: 75_000_000,
      paidAmountXof: 75_000_000,
      fixed: false,
      avoidable: true,
      periodStart,
      periodEnd,
      dimension: { capabilityId: "ecosystem-foundation" },
      evidenceIds: ["cost-evidence"],
      recordedAt,
    },
  });

  const review = capability.reviewPeriod({ caseId: "economic-2026", reviewedAt: recordedAt });
  assert.ok(review.blockers.some((entry) => entry.includes("encaissement")));
  assert.ok(review.warnings.some((entry) => entry.includes("payeur")));
  assert.ok(review.warnings.some((entry) => entry.includes("subventions")));
  assert.ok(review.warnings.some((entry) => entry.includes("récurrents")));
});

test("les scénarios économiques comparent croissance commerciale, revenus publics et runway", () => {
  const capability = createEconomicCase();

  capability.recordRevenue({
    caseId: "economic-2026",
    revenue: {
      id: "baseline-commission",
      modelType: "transaction_commission",
      amountXof: 10_000_000,
      recognizedAmountXof: 10_000_000,
      collectedAmountXof: 10_000_000,
      status: "collected",
      recurring: false,
      periodStart,
      periodEnd,
      dimension: { capabilityId: "sale-settlement", payerActorId: "payer-buyers" },
      sourceReferenceIds: ["sales"],
      evidenceIds: ["sales-evidence"],
      recordedAt,
    },
  });
  capability.recordRevenue({
    caseId: "economic-2026",
    revenue: {
      id: "baseline-subscription",
      modelType: "subscription",
      amountXof: 5_000_000,
      recognizedAmountXof: 5_000_000,
      collectedAmountXof: 5_000_000,
      status: "collected",
      recurring: true,
      periodStart,
      periodEnd,
      dimension: { capabilityId: "cooperative-management", payerActorId: "payer-cooperatives" },
      sourceReferenceIds: ["subscriptions"],
      evidenceIds: ["subscriptions-evidence"],
      recordedAt,
    },
  });
  capability.recordCost({
    caseId: "economic-2026",
    cost: {
      id: "baseline-fixed",
      costType: "product",
      amountXof: 18_000_000,
      committedAmountXof: 18_000_000,
      paidAmountXof: 18_000_000,
      fixed: true,
      avoidable: false,
      periodStart,
      periodEnd,
      dimension: { capabilityId: "ecosystem-foundation" },
      evidenceIds: ["fixed-cost-evidence"],
      recordedAt,
    },
  });
  capability.recordCost({
    caseId: "economic-2026",
    cost: {
      id: "baseline-variable",
      costType: "field_operations",
      amountXof: 7_000_000,
      committedAmountXof: 7_000_000,
      paidAmountXof: 7_000_000,
      fixed: false,
      avoidable: true,
      periodStart,
      periodEnd,
      dimension: { capabilityId: "sale-settlement" },
      evidenceIds: ["variable-cost-evidence"],
      recordedAt,
    },
  });
  capability.recordValueCreation({
    caseId: "economic-2026",
    record: {
      id: "baseline-value",
      valueType: "value_created",
      monetaryValueXof: 200_000_000,
      dimension: { capabilityId: "sale-settlement" },
      sourceReferenceIds: ["commercial-value"],
      evidenceIds: ["commercial-value-evidence"],
      measuredAt: recordedAt,
    },
  });

  const scenario = capability.simulateScenario({
    caseId: "economic-2026",
    scenario: {
      id: "scenario-balanced-growth",
      label: "Croissance équilibrée",
      assumptions: {
        transactionVolumeGrowthPercent: 50,
        averageCommissionRatePercent: 6,
        subscriberGrowthPercent: 100,
        publicContractRevenueXof: 20_000_000,
        grantRevenueXof: 5_000_000,
        variableCostGrowthPercent: 25,
        fixedCostGrowthPercent: 10,
        collectionRatePercent: 90,
      },
    },
    simulatedAt: recordedAt,
    actorId: "actor-cfo",
  });

  assert.ok(scenario.projectedRevenueXof > scenario.projectedCostXof);
  assert.ok(scenario.projectedOperatingResultXof > 0);
  assert.ok(scenario.projectedRecurringRevenueSharePercent >= 30);
  assert.ok(scenario.projectedGrantDependencyPercent < 35);
});

test("une décision de direction exige une preuve et une clôture exige l'absence de blocage", () => {
  const capability = createEconomicCase();

  assert.throws(
    () => capability.decide({
      caseId: "economic-2026",
      decision: {
        id: "decision-no-evidence",
        decisionType: "diversify_payers",
        dimension: {},
        rationale: "Réduire la concentration.",
        expectedAnnualImpactXof: 10_000_000,
        ownerActorId: "actor-ceo",
        dueAt: periodEnd,
        status: "decided",
        evidenceIds: [],
        decidedAt: recordedAt,
      },
    }),
    /preuve/i,
  );

  capability.decide({
    caseId: "economic-2026",
    decision: {
      id: "decision-diversify",
      decisionType: "diversify_payers",
      dimension: {},
      rationale: "Limiter la dépendance à un seul financeur.",
      expectedAnnualImpactXof: 15_000_000,
      ownerActorId: "actor-ceo",
      dueAt: periodEnd,
      status: "decided",
      evidenceIds: ["board-decision-1"],
      decidedAt: recordedAt,
    },
  });

  capability.reviewPeriod({ caseId: "economic-2026", reviewedAt: recordedAt });
  const closed = capability.closePeriod({ caseId: "economic-2026", closedAt: periodEnd, actorId: "actor-cfo", evidenceIds: ["annual-accounts-2026"] });
  assert.equal(closed.status, "closed");
});
