import assert from "node:assert/strict";
import test from "node:test";

import { FisheriesEcosystemConsistencyAudit } from "./fisheries-ecosystem-consistency-audit";

const generatedAt = "2026-07-27T16:00:00Z";

function createConsistentInput() {
  return {
    campaign: {
      id: "campaign-1",
      territoryId: "territory-joal",
      cooperativeId: "cooperative-joal",
      traceabilityLotIds: ["lot-1", "lot-2"],
      landedQuantityKg: 1_000,
      soldQuantityKg: 950,
      rejectedQuantityKg: 50,
      grossRevenueXof: 1_850_000,
      netRevenueXof: 1_650_000,
      status: "closed",
    },
    sale: {
      id: "sale-1",
      territoryId: "territory-joal",
      cooperativeId: "cooperative-joal",
      traceabilityLotIds: ["lot-1", "lot-2"],
      reservedQuantityKg: 1_000,
      deliveredQuantityKg: 980,
      acceptedQuantityKg: 950,
      rejectedQuantityKg: 30,
      grossAmountXof: 1_850_000,
      sellerNetAmountXof: 1_650_000,
      platformRevenueXof: 75_000,
      logisticsCostXof: 120_000,
      status: "closed",
    },
    cooperative: {
      id: "cooperative-case-1",
      cooperativeId: "cooperative-joal",
      territoryId: "territory-joal",
      activeCampaignIds: ["campaign-1"],
      activeSaleCaseIds: ["sale-1"],
      commercialRevenueXof: 1_650_000,
      platformFeesXof: 75_000,
      cooperativeFundBalanceXof: 100_000,
      status: "active",
    },
    territory: {
      id: "territory-case-1",
      territoryId: "territory-joal",
      campaignIds: ["campaign-1"],
      saleCaseIds: ["sale-1"],
      cooperativeCaseIds: ["cooperative-case-1"],
      grossCommercialValueXof: 1_850_000,
      sellerNetValueXof: 1_650_000,
      platformRevenueXof: 75_000,
      status: "operational",
    },
    national: {
      id: "national-case-1",
      territoryIds: ["territory-joal"],
      grossCommercialValueXof: 1_850_000,
      sellerNetValueXof: 1_650_000,
      platformRevenueXof: 75_000,
      status: "active",
    },
    evidenceIds: ["weighing-proof", "quality-proof", "delivery-proof", "payment-proof"],
    generatedAt,
  };
}

test("une chaîne complète et réconciliée ne produit aucun écart critique", () => {
  const audit = new FisheriesEcosystemConsistencyAudit();
  const report = audit.audit(createConsistentInput());

  assert.equal(report.consistent, true);
  assert.equal(report.criticalFindingCount, 0);
  assert.equal(report.warningFindingCount, 0);
  assert.equal(report.score, 100);
  assert.deepEqual(report.reconciledMetrics, {
    physicalFlowReconciled: true,
    commercialFlowReconciled: true,
    sellerValueReconciled: true,
    platformRevenueReconciled: true,
    territorialAggregationReconciled: true,
    nationalAggregationReconciled: true,
    traceabilityReconciled: true,
    governanceLinksReconciled: true,
  });
});

test("des lots inconnus et des quantités incohérentes bloquent la réconciliation", () => {
  const audit = new FisheriesEcosystemConsistencyAudit();
  const input = createConsistentInput();
  input.sale.traceabilityLotIds = ["lot-inconnu"];
  input.sale.acceptedQuantityKg = 990;
  input.sale.rejectedQuantityKg = 20;
  input.campaign.soldQuantityKg = 900;

  const report = audit.audit(input);

  assert.equal(report.consistent, false);
  assert.ok(report.criticalFindingCount >= 3);
  assert.equal(report.reconciledMetrics.physicalFlowReconciled, false);
  assert.equal(report.reconciledMetrics.traceabilityReconciled, false);
  assert.ok(report.findings.some((finding) => finding.ruleCode === "UNRECOGNIZED_SALE_LOTS"));
  assert.ok(report.findings.some((finding) => finding.ruleCode === "DELIVERY_ACCEPTANCE_INVALID"));
  assert.ok(report.findings.some((finding) => finding.ruleCode === "ACCEPTED_QUANTITY_EXCEEDS_CAMPAIGN_SALE"));
});

test("un territoire absent du pilotage national est détecté comme rupture de gouvernance", () => {
  const audit = new FisheriesEcosystemConsistencyAudit();
  const input = createConsistentInput();
  input.national.territoryIds = ["territory-saint-louis"];

  const report = audit.audit(input);

  assert.equal(report.consistent, false);
  assert.equal(report.reconciledMetrics.governanceLinksReconciled, false);
  assert.equal(report.reconciledMetrics.nationalAggregationReconciled, false);
  assert.ok(report.findings.some((finding) => finding.ruleCode === "NATIONAL_TERRITORY_MISSING"));
});

test("une sous-consolidation nationale de valeur est refusée", () => {
  const audit = new FisheriesEcosystemConsistencyAudit();
  const input = createConsistentInput();
  input.national.grossCommercialValueXof = 1_000_000;
  input.national.sellerNetValueXof = 900_000;
  input.national.platformRevenueXof = 40_000;

  const report = audit.audit(input);

  assert.equal(report.consistent, false);
  assert.ok(report.findings.some((finding) => finding.ruleCode === "NATIONAL_GROSS_VALUE_UNDERSTATED"));
  assert.ok(report.findings.some((finding) => finding.ruleCode === "NATIONAL_SELLER_VALUE_UNDERSTATED"));
  assert.ok(report.findings.some((finding) => finding.ruleCode === "NATIONAL_PLATFORM_REVENUE_UNDERSTATED"));
  assert.equal(report.reconciledMetrics.nationalAggregationReconciled, false);
});
