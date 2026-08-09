import { describe, expect, it } from "@/test/vitest-compat";
import { EthicalFinanceActivityMonitoring } from "./ethical-finance-activity-monitoring";
import type { EthicalFinanceOfferCase } from "./ethical-finance-runtime";

const offer: EthicalFinanceOfferCase = {
  id: "offer-1",
  financingNeedId: "need-1",
  providerOrganizationId: "fund-1",
  mode: "murabaha",
  principalAmountXof: 6_000_000,
  acquisitionCostXof: 5_400_000,
  disclosedMarginXof: 600_000,
  installments: [{ dueAt: "2026-12-31T00:00:00.000Z", amountXof: 6_000_000 }],
  serviceFeeXof: 100_000,
  serviceDescription: "Qualification et suivi de l'achat du moteur",
  activityReferenceIds: ["engine-1"],
  contractDocumentIds: ["contract-1"],
  independentReviewRequired: true,
  status: "active",
  proposedAt: "2026-07-28T12:00:00.000Z",
};

describe("EthicalFinanceActivityMonitoring", () => {
  it("relie l utilisation réelle, une vente réglée et la clôture du financement", () => {
    const monitoring = new EthicalFinanceActivityMonitoring();
    monitoring.recordUse({
      id: "use-1",
      offerId: offer.id,
      territoryId: "territory-dakar",
      assetOrActivityReferenceId: "engine-1",
      operatorActorId: "fisher-1",
      operatingPeriodStart: "2026-08-01T00:00:00.000Z",
      operatingPeriodEnd: "2026-10-31T00:00:00.000Z",
      useDescription: "Moteur utilisé sur 14 campagnes de pêche",
      operatingQuantity: 14,
      operatingUnit: "campagnes",
      revenueGeneratedXof: 8_400_000,
      costIncurredXof: 2_100_000,
      incidentCount: 0,
      supportingDocumentIds: ["campaign-register-1"],
      recordedAt: "2026-11-01T00:00:00.000Z",
    });
    monitoring.recordSale({
      id: "sale-1",
      offerId: offer.id,
      territoryId: "territory-dakar",
      commercialAgreementId: "agreement-1",
      saleAmountXof: 6_800_000,
      amountAvailableForSettlementXof: 6_000_000,
      paymentReference: "SALE-PAYMENT-001",
      supportingDocumentIds: ["sale-statement-1"],
      receivedAt: "2026-11-05T00:00:00.000Z",
    });

    const settlement = monitoring.prepareSettlementCommand({ commandId: "settle-1", offer, saleId: "sale-1", at: "2026-11-05T00:00:00.000Z" });
    const completion = monitoring.assessCompletion({ offer, settledAmountXof: settlement.command.type === "record_settlement" ? settlement.command.settlement.amountXof : 0 });

    expect(settlement.command.type).toBe("record_settlement");
    expect(completion.useConfirmed).toBe(true);
    expect(completion.canClose).toBe(true);
    expect(completion.netOperationalValueXof).toBe(6_300_000);
  });

  it("refuse d affecter plus que le montant encaissé", () => {
    const monitoring = new EthicalFinanceActivityMonitoring();
    expect(() => monitoring.recordSale({
      id: "sale-2",
      offerId: offer.id,
      territoryId: "territory-dakar",
      commercialAgreementId: "agreement-2",
      saleAmountXof: 1_000_000,
      amountAvailableForSettlementXof: 1_200_000,
      paymentReference: "SALE-PAYMENT-002",
      supportingDocumentIds: ["sale-statement-2"],
      receivedAt: "2026-11-05T00:00:00.000Z",
    })).toThrow("ne peut pas dépasser");
  });
});
