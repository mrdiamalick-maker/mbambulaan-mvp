import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getEthicalFinanceActivityMonitoring } from "@/platform/finance/ethical-finance-monitoring-registry";
import { getPersistentEthicalFinanceRuntime } from "@/platform/finance/persistent-ethical-finance-runtime";
import { getEthicalFinanceRuntime } from "@/platform/finance/ethical-finance-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "atlas.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const persistent = hasRuntimeDatabase();
  const finance = persistent
    ? await getPersistentEthicalFinanceRuntime().snapshot()
    : getEthicalFinanceRuntime().snapshot();
  const monitoring = getEthicalFinanceActivityMonitoring().snapshot();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    persistence: persistent ? "postgres" : "memory",
    title: "Financements liés à l'activité réelle et protection solidaire",
    summary: {
      needsToReview: finance.needs.filter((item) => item.status === "submitted").length,
      compliantOffers: finance.metrics.compliantOfferCount,
      activeFinancingAmountXof: finance.metrics.activeFinancingAmountXof,
      settledAmountXof: finance.metrics.settledAmountXof,
      solidarityFundBalanceXof: finance.metrics.solidarityFundBalanceXof,
      solidaritySupportPaidXof: finance.metrics.solidaritySupportPaidXof,
      mbambulaanServiceRevenueXof: finance.metrics.mbambulaanServiceRevenueXof,
      financedUsesRecorded: monitoring.uses.length,
      settledSalesRecorded: monitoring.settledSales.length,
    },
    financingCases: finance.offers.map((offer) => ({
      offerId: offer.id,
      financingNeedId: offer.financingNeedId,
      mode: offer.mode,
      amountXof: offer.principalAmountXof,
      acquisitionCostXof: offer.acquisitionCostXof,
      disclosedMarginXof: offer.disclosedMarginXof,
      serviceFeeXof: offer.serviceFeeXof,
      serviceDescription: offer.serviceDescription,
      status: offer.status,
      independentReviewRequired: offer.independentReviewRequired,
      activityReferenceIds: offer.activityReferenceIds,
      useRecords: monitoring.uses.filter((item) => item.offerId === offer.id),
      settledSales: monitoring.settledSales.filter((item) => item.offerId === offer.id),
    })),
    solidarityFunds: finance.solidarityFunds.map((fund) => ({
      fundId: fund.id,
      territoryId: fund.territoryId,
      mode: fund.mode,
      balanceXof: fund.contributionBalanceXof,
      maximumSupportXof: fund.maximumSupportXof,
      coveredSituations: fund.coveredSituations,
      excludedSituations: fund.excludedSituations,
      status: fund.status,
    })),
  });
}
