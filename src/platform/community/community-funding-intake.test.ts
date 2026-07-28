import test from "node:test";
import assert from "node:assert/strict";
import { convertFundingEventToCommunityContribution } from "./community-funding-intake";

test("calcule la part communautaire d'une vente réglée", () => {
  const contribution = convertFundingEventToCommunityContribution({
    type: "sale_settled",
    id: "sale-01",
    initiativeId: "initiative-01",
    territoryId: "territory-dakar",
    sellerOrganizationId: "org-cooperative-dakar",
    settledAmountXof: 1_000_000,
    communityShareBps: 200,
    paymentReference: "payment-ref-01",
    occurredAt: "2026-07-28T17:00:00.000Z",
  });
  assert.equal(contribution.amountXof, 20_000);
  assert.equal(contribution.sourceType, "transaction_share");
});

test("reprend la contribution issue d'un plan anti-perte terminé", () => {
  const contribution = convertFundingEventToCommunityContribution({
    type: "value_recovery_completed",
    id: "recovery-01",
    initiativeId: "initiative-01",
    territoryId: "territory-dakar",
    responsibleOrganizationId: "org-cooperative-dakar",
    communityContributionXof: 35_000,
    completionReference: "recovery-close-01",
    occurredAt: "2026-07-28T17:00:00.000Z",
  });
  assert.equal(contribution.amountXof, 35_000);
  assert.equal(contribution.sourceType, "cooperative");
});

test("refuse un décaissement sans référence de virement", () => {
  assert.throws(() => convertFundingEventToCommunityContribution({
    type: "development_funds_disbursed",
    id: "program-01",
    initiativeId: "initiative-01",
    territoryId: "territory-dakar",
    programOrganizationId: "org-program",
    disbursedAmountXof: 5_000_000,
    transferReference: "",
    occurredAt: "2026-07-28T17:00:00.000Z",
  }), /référence du virement/i);
});
