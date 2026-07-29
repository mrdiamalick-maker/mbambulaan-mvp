export interface UnitEconomicsAssumptions {
  monthlyGmvXof: number;
  commissionRateBps: number;
  subscriptionRevenueXof: number;
  transactionCount: number;
  paymentFeeRateBps: number;
  supportCostPerTransactionXof: number;
  disputeLossRateBps: number;
  monthlyTechnologyCostXof: number;
  monthlyOperationsCostXof: number;
  monthlySalesCostXof: number;
  monthlyAdministrationCostXof: number;
}

export interface UnitEconomicsResult {
  monthlyGmvXof: number;
  transactionCount: number;
  averageTransactionXof: number;
  commissionRevenueXof: number;
  subscriptionRevenueXof: number;
  totalRevenueXof: number;
  paymentFeesXof: number;
  supportCostXof: number;
  expectedDisputeLossXof: number;
  totalVariableCostXof: number;
  contributionMarginXof: number;
  contributionMarginRate: number;
  totalFixedCostXof: number;
  operatingProfitXof: number;
  operatingMarginRate: number;
  breakEvenGmvXof: number | null;
  breakEvenTransactions: number | null;
  viable: boolean;
}

export interface ViabilityScenario {
  name: string;
  assumptions: UnitEconomicsAssumptions;
  result: UnitEconomicsResult;
}

export function calculateUnitEconomics(input: UnitEconomicsAssumptions): UnitEconomicsResult {
  assertNonNegative(input);
  if (input.transactionCount === 0 && input.monthlyGmvXof > 0) throw new Error("Le nombre de transactions doit être positif lorsque le GMV est positif.");
  const commissionRevenueXof = Math.round(input.monthlyGmvXof * input.commissionRateBps / 10_000);
  const totalRevenueXof = commissionRevenueXof + input.subscriptionRevenueXof;
  const paymentFeesXof = Math.round(input.monthlyGmvXof * input.paymentFeeRateBps / 10_000);
  const supportCostXof = Math.round(input.transactionCount * input.supportCostPerTransactionXof);
  const expectedDisputeLossXof = Math.round(input.monthlyGmvXof * input.disputeLossRateBps / 10_000);
  const totalVariableCostXof = paymentFeesXof + supportCostXof + expectedDisputeLossXof;
  const contributionMarginXof = totalRevenueXof - totalVariableCostXof;
  const totalFixedCostXof = input.monthlyTechnologyCostXof + input.monthlyOperationsCostXof + input.monthlySalesCostXof + input.monthlyAdministrationCostXof;
  const operatingProfitXof = contributionMarginXof - totalFixedCostXof;
  const netRateBps = input.commissionRateBps - input.paymentFeeRateBps - input.disputeLossRateBps;
  const averageTransactionXof = input.transactionCount === 0 ? 0 : Math.round(input.monthlyGmvXof / input.transactionCount);
  const netContributionRate = netRateBps / 10_000 - (averageTransactionXof === 0 ? 0 : input.supportCostPerTransactionXof / averageTransactionXof);
  const revenueNeededFromGmv = Math.max(0, totalFixedCostXof - input.subscriptionRevenueXof);
  const breakEvenGmvXof = netContributionRate > 0 ? Math.ceil(revenueNeededFromGmv / netContributionRate) : null;
  const breakEvenTransactions = breakEvenGmvXof !== null && averageTransactionXof > 0 ? Math.ceil(breakEvenGmvXof / averageTransactionXof) : null;
  return {
    monthlyGmvXof: input.monthlyGmvXof,
    transactionCount: input.transactionCount,
    averageTransactionXof,
    commissionRevenueXof,
    subscriptionRevenueXof: input.subscriptionRevenueXof,
    totalRevenueXof,
    paymentFeesXof,
    supportCostXof,
    expectedDisputeLossXof,
    totalVariableCostXof,
    contributionMarginXof,
    contributionMarginRate: totalRevenueXof === 0 ? 0 : contributionMarginXof / totalRevenueXof,
    totalFixedCostXof,
    operatingProfitXof,
    operatingMarginRate: totalRevenueXof === 0 ? 0 : operatingProfitXof / totalRevenueXof,
    breakEvenGmvXof,
    breakEvenTransactions,
    viable: operatingProfitXof >= 0,
  };
}

export function buildDefaultViabilityScenarios(): ViabilityScenario[] {
  const fixed = {
    commissionRateBps: 250,
    paymentFeeRateBps: 80,
    supportCostPerTransactionXof: 3_000,
    disputeLossRateBps: 20,
    monthlyTechnologyCostXof: 1_500_000,
    monthlyOperationsCostXof: 6_000_000,
    monthlySalesCostXof: 3_000_000,
    monthlyAdministrationCostXof: 2_000_000,
  };
  const definitions: Array<[string, number, number, number]> = [
    ["Pilote", 75_000_000, 75, 1_000_000],
    ["Traction", 300_000_000, 250, 4_000_000],
    ["Échelle", 1_000_000_000, 700, 10_000_000],
  ];
  return definitions.map(([name, monthlyGmvXof, transactionCount, subscriptionRevenueXof]) => {
    const assumptions: UnitEconomicsAssumptions = { ...fixed, monthlyGmvXof, transactionCount, subscriptionRevenueXof };
    return { name, assumptions, result: calculateUnitEconomics(assumptions) };
  });
}

function assertNonNegative(input: UnitEconomicsAssumptions) {
  for (const [key, value] of Object.entries(input)) {
    if (!Number.isFinite(value) || value < 0) throw new Error(`${key} doit être un nombre positif ou nul.`);
  }
  for (const key of ["commissionRateBps", "paymentFeeRateBps", "disputeLossRateBps"] as const) {
    if (input[key] > 10_000) throw new Error(`${key} ne peut pas dépasser 100 %.`);
  }
}
