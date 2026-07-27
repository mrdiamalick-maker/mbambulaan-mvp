import test from "node:test";
import assert from "node:assert/strict";
import { EndToEndEthicalFinancingRiskSharingCapability } from "./end-to-end-ethical-financing-risk-sharing-capability";

const at = (value: string) => value as never;
const id = (value: string) => value as never;

test("finance un équipement par murabaha avec validation éthique et fonds mutualisé", () => {
  const capability = new EndToEndEthicalFinancingRiskSharingCapability();
  capability.openCase({
    id: id("ethical-case-1"),
    caseCode: "ETH-FIN-2026-01",
    countryId: id("sn"),
    territoryIds: [id("joal")],
    createdAt: at("2026-01-01T00:00:00Z"),
  });

  capability.defineGuardrailPolicy({
    caseId: id("ethical-case-1"),
    policy: {
      id: id("policy-1"),
      policyCode: "SHARIA-GUARDRAILS-01",
      prohibitInterest: true,
      prohibitGuaranteedReturnWithoutRisk: true,
      prohibitExcessiveUncertainty: true,
      prohibitSpeculation: true,
      prohibitFinancingProhibitedActivities: true,
      requireAssetOrServiceLink: true,
      requireTransparentFees: true,
      requireSharedRiskForPartnerships: true,
      requireIndependentEthicalReview: true,
      approvedInstrumentTypes: ["qard_hasan", "murabaha", "mudaraba", "musharaka", "ijara", "salam", "istisna", "wakala", "grant", "public_support", "cooperative_advance"],
      approvedRiskProtectionModels: ["takaful", "mutual_guarantee_fund", "cooperative_reserve", "public_compensation_fund", "self_protection_reserve", "none"],
      reviewerActorIds: [id("ethics-board")],
      evidenceIds: [id("fatwa-policy-doc")],
      status: "active",
      effectiveAt: at("2026-01-01T00:00:00Z"),
    },
  });

  capability.submitNeed({
    caseId: id("ethical-case-1"),
    need: {
      id: id("need-1"),
      applicantActorId: id("coop-joal"),
      territoryId: id("joal"),
      purpose: "equipment_purchase",
      requestedAmountXof: 24_000_000,
      requestedAt: at("2026-01-10T00:00:00Z"),
      expectedEconomicValueXof: 45_000_000,
      expectedRepaymentSource: "revenus de transformation et ventes contractualisées",
      linkedAssetId: id("ice-machine-1"),
      vulnerabilityScore: 70,
      evidenceIds: [id("equipment-quote"), id("business-plan")],
      status: "qualified",
    },
  });

  capability.proposeOffer({
    caseId: id("ethical-case-1"),
    proposedAt: at("2026-01-15T00:00:00Z"),
    offer: {
      id: id("offer-1"),
      financingNeedId: id("need-1"),
      providerActorId: id("ethical-finance-provider"),
      instrumentType: "murabaha",
      principalAmountXof: 24_000_000,
      acquisitionCostXof: 21_000_000,
      disclosedMarginXof: 3_000_000,
      maturityAt: at("2027-01-15T00:00:00Z"),
      repaymentSchedule: [
        { dueAt: at("2026-07-15T00:00:00Z"), amountXof: 12_000_000 },
        { dueAt: at("2027-01-15T00:00:00Z"), amountXof: 12_000_000 },
      ],
      collateralAssetIds: [id("ice-machine-1")],
      guaranteeFundIds: [id("risk-pool-1")],
      feeItems: [{ code: "admin_fee", label: "Frais administratifs documentés", amountXof: 150_000, refundable: false }],
      prohibitedUseCodes: ["alcohol", "gambling", "interest_bearing_refinancing"],
      assetOrServiceReferenceIds: [id("ice-machine-1"), id("supplier-contract")],
      conditions: ["achat réel de l'équipement avant revente", "marge fixe divulguée"],
      evidenceIds: [id("murabaha-draft"), id("supplier-quote")],
      complianceStatus: "pending_review",
      status: "draft",
    },
  });

  capability.reviewOffer({
    caseId: id("ethical-case-1"),
    review: {
      id: id("review-1"),
      offerId: id("offer-1"),
      reviewedByActorId: id("ethics-board"),
      reviewedAt: at("2026-01-18T00:00:00Z"),
      status: "compliant_with_conditions",
      findings: ["actif identifié", "coût et marge divulgués", "absence d'intérêt contractuel"],
      requiredConditions: ["preuve d'acquisition avant décaissement"],
      evidenceIds: [id("ethical-review-report")],
    },
  });

  capability.createRiskArrangement({
    caseId: id("ethical-case-1"),
    arrangement: {
      id: id("risk-pool-1"),
      financingOfferId: id("offer-1"),
      participantActorIds: [id("coop-joal"), id("coop-mbour"), id("public-backstop")],
      model: "takaful",
      operatorActorId: id("mutual-operator"),
      contributionAmountXof: 2_000_000,
      reserveBalanceXof: 50_000_000,
      maximumSupportXof: 15_000_000,
      coveredRiskCodes: ["storm_damage", "fire", "cold_chain_breakdown"],
      excludedRiskCodes: ["fraud", "wilful_misconduct"],
      surplusPolicy: "retain_in_pool",
      deficitPolicy: "qard_hasan_facility",
      evidenceIds: [id("mutual-fund-rules"), id("participant-agreement")],
      status: "active",
      effectiveAt: at("2026-01-20T00:00:00Z"),
    },
  });

  capability.acceptOffer({ caseId: id("ethical-case-1"), offerId: id("offer-1"), acceptedAt: at("2026-01-20T00:00:00Z"), evidenceIds: [id("signed-acceptance")] });
  capability.disburse({
    caseId: id("ethical-case-1"),
    disbursement: {
      id: id("disb-1"), offerId: id("offer-1"), amountXof: 24_000_000, disbursedToActorId: id("coop-joal"), assetOrSupplierActorId: id("equipment-supplier"),
      disbursedAt: at("2026-01-25T00:00:00Z"), purposeReferenceIds: [id("ice-machine-1"), id("supplier-invoice")], evidenceIds: [id("bank-transfer-proof")], status: "released",
    },
  });
  capability.recordSettlement({
    caseId: id("ethical-case-1"),
    settlement: { id: id("settlement-1"), offerId: id("offer-1"), settlementType: "asset_purchase_payment", amountXof: 12_000_000, paidByActorId: id("coop-joal"), paidToActorId: id("ethical-finance-provider"), settledAt: at("2026-07-15T00:00:00Z"), evidenceIds: [id("payment-proof-1")], status: "confirmed" },
  });

  capability.reportLoss({
    caseId: id("ethical-case-1"),
    event: {
      id: id("loss-1"), arrangementId: id("risk-pool-1"), affectedActorId: id("coop-joal"), territoryId: id("joal"), riskCode: "storm_damage",
      occurredAt: at("2026-08-01T00:00:00Z"), estimatedLossXof: 11_000_000, eligibleLossXof: 9_000_000, approvedSupportXof: 8_000_000,
      cause: "dommages causés par une tempête documentée", evidenceIds: [id("inspection-report"), id("weather-alert")], status: "approved",
    },
  });
  const support = capability.payRiskSupport({
    caseId: id("ethical-case-1"),
    payment: { id: id("support-1"), lossEventId: id("loss-1"), arrangementId: id("risk-pool-1"), beneficiaryActorId: id("coop-joal"), amountXof: 8_000_000, paidAt: at("2026-08-05T00:00:00Z"), evidenceIds: [id("support-transfer-proof")], status: "paid" },
  });
  assert.equal(support.remainingReserveXof, 42_000_000);

  const command = capability.getEthicalFinanceCommandCenter({ caseId: id("ethical-case-1"), generatedAt: at("2026-08-10T00:00:00Z") });
  assert.equal(command.compliantOfferCount, 1);
  assert.equal(command.disbursedXof, 24_000_000);
  assert.equal(command.mutualReserveXof, 42_000_000);
  assert.equal(command.paidRiskSupportXof, 8_000_000);
});

test("rejette les frais d'intérêt et protège le qard hasan", () => {
  const capability = new EndToEndEthicalFinancingRiskSharingCapability();
  capability.openCase({ id: id("ethical-case-2"), caseCode: "ETH-FIN-2026-02", countryId: id("sn"), territoryIds: [id("mbour")], createdAt: at("2026-01-01T00:00:00Z") });
  capability.defineGuardrailPolicy({
    caseId: id("ethical-case-2"),
    policy: {
      id: id("policy-2"), policyCode: "STRICT-NO-RIBA", prohibitInterest: true, prohibitGuaranteedReturnWithoutRisk: true, prohibitExcessiveUncertainty: true,
      prohibitSpeculation: true, prohibitFinancingProhibitedActivities: true, requireAssetOrServiceLink: true, requireTransparentFees: true,
      requireSharedRiskForPartnerships: true, requireIndependentEthicalReview: false, approvedInstrumentTypes: ["qard_hasan", "murabaha"],
      approvedRiskProtectionModels: ["cooperative_reserve", "none"], reviewerActorIds: [], evidenceIds: [id("policy-proof")], status: "active", effectiveAt: at("2026-01-01T00:00:00Z"),
    },
  });
  capability.submitNeed({ caseId: id("ethical-case-2"), need: { id: id("need-2"), applicantActorId: id("fisher-1"), territoryId: id("mbour"), purpose: "emergency_support", requestedAmountXof: 2_000_000, requestedAt: at("2026-01-02T00:00:00Z"), expectedEconomicValueXof: 3_000_000, expectedRepaymentSource: "revenus de campagne", vulnerabilityScore: 85, evidenceIds: [id("need-proof")], status: "qualified" } });

  assert.throws(() => capability.proposeOffer({
    caseId: id("ethical-case-2"), proposedAt: at("2026-01-03T00:00:00Z"), offer: {
      id: id("bad-offer"), financingNeedId: id("need-2"), providerActorId: id("lender"), instrumentType: "qard_hasan", principalAmountXof: 2_000_000,
      disclosedMarginXof: 200_000, repaymentSchedule: [{ dueAt: at("2026-06-01T00:00:00Z"), amountXof: 2_200_000 }], collateralAssetIds: [], guaranteeFundIds: [],
      feeItems: [{ code: "interest_charge", label: "Intérêt", amountXof: 200_000, refundable: false }], prohibitedUseCodes: [], assetOrServiceReferenceIds: [], conditions: [], evidenceIds: [id("bad-contract")], complianceStatus: "pending_review", status: "draft",
    },
  }), /intérêt|qard hasan/i);
});
