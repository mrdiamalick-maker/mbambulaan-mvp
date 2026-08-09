import { describe, expect, it } from "@/test/vitest-compat";
import { EthicalFinanceRuntime } from "./ethical-finance-runtime";

describe("EthicalFinanceRuntime", () => {
  it("finance un actif réel sans intérêt et suit un fonds solidaire", () => {
    const runtime = new EthicalFinanceRuntime();
    const territory = "territory-dakar";
    const at = "2026-07-28T12:00:00.000Z";

    runtime.execute({ commandId: "need", actorId: "fisher-1", activeTerritoryId: territory, command: { type: "submit_need", need: {
      id: "need-1", territoryId: territory, applicantActorId: "fisher-1", applicantOrganizationId: "coop-1", purpose: "equipment",
      requestedAmountXof: 6_000_000, activityReferenceIds: ["campaign-1"], assetReferenceIds: ["engine-1"], expectedValueXof: 9_000_000,
      expectedSettlementSource: "revenus des campagnes", supportingDocumentIds: ["supplier-quote-1"], status: "submitted", submittedAt: at,
    } } });
    runtime.execute({ commandId: "qualify", actorId: "finance-1", activeTerritoryId: territory, command: { type: "qualify_need", needId: "need-1" } });
    runtime.execute({ commandId: "offer", actorId: "finance-1", activeTerritoryId: territory, command: { type: "propose_offer", offer: {
      id: "offer-1", financingNeedId: "need-1", providerOrganizationId: "fund-1", mode: "murabaha", principalAmountXof: 6_000_000,
      acquisitionCostXof: 5_400_000, disclosedMarginXof: 600_000, installments: [{ dueAt: "2026-12-31T00:00:00.000Z", amountXof: 6_000_000 }],
      serviceFeeXof: 100_000, serviceDescription: "Qualification et suivi de l'achat du moteur", activityReferenceIds: ["engine-1"],
      contractDocumentIds: ["contract-1"], independentReviewRequired: true, status: "draft", proposedAt: at,
    } } });
    runtime.execute({ commandId: "review", actorId: "reviewer-1", activeTerritoryId: territory, command: { type: "review_offer", review: {
      id: "review-1", offerId: "offer-1", reviewerActorId: "reviewer-1", decision: "compliant", findings: [], requiredConditions: [], reviewDocumentIds: ["review-report-1"], reviewedAt: at,
    } } });
    runtime.execute({ commandId: "accept", actorId: "fisher-1", activeTerritoryId: territory, command: { type: "accept_offer", offerId: "offer-1" } });
    runtime.execute({ commandId: "pay", actorId: "finance-1", activeTerritoryId: territory, command: { type: "record_disbursement", disbursement: {
      id: "pay-1", offerId: "offer-1", amountXof: 6_000_000, paidToActorId: "supplier-1", supplierActorId: "supplier-1", purposeReferenceIds: ["engine-1"], paymentReference: "TRANSFER-001", status: "released", disbursedAt: at,
    } } });

    runtime.execute({ commandId: "fund", actorId: "coop-1", activeTerritoryId: territory, command: { type: "create_solidarity_fund", fund: {
      id: "solidarity-1", territoryId: territory, mode: "cooperative_solidarity_fund", operatorOrganizationId: "coop-1", participantOrganizationIds: ["coop-1", "coop-2"],
      coveredSituations: ["engine_breakdown"], excludedSituations: ["intentional_damage"], contributionBalanceXof: 2_000_000, maximumSupportXof: 750_000,
      governanceDocumentIds: ["fund-rules-1"], independentReviewDocumentIds: [], status: "draft",
    } } });
    runtime.execute({ commandId: "activate", actorId: "coop-1", activeTerritoryId: territory, command: { type: "activate_solidarity_fund", fundId: "solidarity-1" } });
    runtime.execute({ commandId: "loss", actorId: "fisher-2", activeTerritoryId: territory, command: { type: "report_supported_loss", support: {
      id: "support-1", fundId: "solidarity-1", affectedActorId: "fisher-2", situation: "engine_breakdown", lossAmountXof: 600_000, approvedSupportXof: 0,
      situationDocumentIds: ["mechanic-report-1"], status: "reported", reportedAt: at,
    } } });
    runtime.execute({ commandId: "approve-support", actorId: "coop-1", activeTerritoryId: territory, command: { type: "approve_support", supportId: "support-1", approvedSupportXof: 500_000 } });
    runtime.execute({ commandId: "pay-support", actorId: "coop-1", activeTerritoryId: territory, command: { type: "record_support_payment", supportId: "support-1", paymentReference: "SOLIDARITY-001", paidAt: at } });
    const snapshot = runtime.snapshot();

    expect(snapshot.metrics.activeFinancingAmountXof).toBe(6_000_000);
    expect(snapshot.metrics.solidaritySupportPaidXof).toBe(500_000);
    expect(snapshot.metrics.mbambulaanServiceRevenueXof).toBe(100_000);
  });

  it("refuse une marge sur une avance sans intérêt", () => {
    const runtime = new EthicalFinanceRuntime();
    runtime.execute({ commandId: "need", actorId: "fisher", activeTerritoryId: "territory-dakar", command: { type: "submit_need", need: {
      id: "need", territoryId: "territory-dakar", applicantActorId: "fisher", purpose: "campaign", requestedAmountXof: 1_000_000,
      activityReferenceIds: ["campaign"], assetReferenceIds: [], expectedValueXof: 2_000_000, expectedSettlementSource: "vente", supportingDocumentIds: ["budget"], status: "submitted", submittedAt: "2026-07-28T00:00:00.000Z",
    } } });
    runtime.execute({ commandId: "qualify", actorId: "finance", activeTerritoryId: "territory-dakar", command: { type: "qualify_need", needId: "need" } });

    expect(() => runtime.execute({ commandId: "offer", actorId: "finance", activeTerritoryId: "territory-dakar", command: { type: "propose_offer", offer: {
      id: "offer", financingNeedId: "need", providerOrganizationId: "fund", mode: "qard_hasan", principalAmountXof: 1_000_000,
      disclosedMarginXof: 50_000, installments: [], serviceFeeXof: 0, serviceDescription: "Aucun service facturé", activityReferenceIds: ["campaign"], contractDocumentIds: ["agreement"], independentReviewRequired: false, status: "draft", proposedAt: "2026-07-28T00:00:00.000Z",
    } } })).toThrow("avance sans intérêt");
  });
});
