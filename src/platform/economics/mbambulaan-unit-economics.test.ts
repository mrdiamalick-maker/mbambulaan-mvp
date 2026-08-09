import test from "node:test";
import assert from "node:assert/strict";
import { buildDefaultViabilityScenarios, calculateUnitEconomics } from "./mbambulaan-unit-economics";

test("sépare le GMV du revenu et calcule le seuil de rentabilité", () => {
  const result = calculateUnitEconomics({
    monthlyGmvXof: 300_000_000,
    commissionRateBps: 250,
    subscriptionRevenueXof: 4_000_000,
    transactionCount: 250,
    paymentFeeRateBps: 80,
    supportCostPerTransactionXof: 3_000,
    disputeLossRateBps: 20,
    monthlyTechnologyCostXof: 1_500_000,
    monthlyOperationsCostXof: 6_000_000,
    monthlySalesCostXof: 3_000_000,
    monthlyAdministrationCostXof: 2_000_000,
  });
  assert.equal(result.monthlyGmvXof, 300_000_000);
  assert.equal(result.commissionRevenueXof, 7_500_000);
  assert.equal(result.totalRevenueXof, 11_500_000);
  assert.equal(result.totalVariableCostXof, 3_750_000);
  assert.equal(result.operatingProfitXof, -4_750_000);
  assert.equal(result.viable, false);
  assert.ok((result.breakEvenGmvXof ?? 0) > 300_000_000);
});

test("les scénarios montrent que la rentabilité exige une vraie échelle", () => {
  const scenarios = buildDefaultViabilityScenarios();
  assert.equal(scenarios.length, 3);
  assert.equal(scenarios[0]?.result.viable, false);
  assert.equal(scenarios[1]?.result.viable, false);
  assert.equal(scenarios[2]?.result.viable, true);
  assert.equal(scenarios[2]?.result.operatingProfitXof, 10_400_000);
});

test("refuse les hypothèses financières négatives", () => {
  assert.throws(() => calculateUnitEconomics({
    monthlyGmvXof: -1,
    commissionRateBps: 250,
    subscriptionRevenueXof: 0,
    transactionCount: 0,
    paymentFeeRateBps: 0,
    supportCostPerTransactionXof: 0,
    disputeLossRateBps: 0,
    monthlyTechnologyCostXof: 0,
    monthlyOperationsCostXof: 0,
    monthlySalesCostXof: 0,
    monthlyAdministrationCostXof: 0,
  }), /monthlyGmvXof/);
});
