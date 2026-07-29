import test from "node:test";
import assert from "node:assert/strict";
import { CommercialFinancialExecution } from "./commercial-financial-execution";
import { CommercialIncidentManagement } from "./commercial-incident-management";
import { CommercialSettlementAdjustments } from "./commercial-settlement-adjustments";

function deliveredExecution() {
  const execution = new CommercialFinancialExecution();
  execution.publishOffer({
    id: "offer-adjustment",
    sellerOrganizationId: "org-seller",
    territoryId: "territory-dakar",
    speciesCode: "thiof",
    qualityGrade: "A",
    availableQuantityKg: 400,
    unitPriceXof: 2_500,
  });
  execution.placeOrder({
    id: "order-adjustment",
    offerId: "offer-adjustment",
    buyerOrganizationId: "org-buyer",
    quantityKg: 400,
    logisticsAmountXof: 100_000,
    platformCommissionRateBps: 250,
  });
  execution.allocateOrder("order-adjustment");
  execution.startTransport("order-adjustment");
  execution.confirmDelivery({ orderId: "order-adjustment", proofId: "proof-adjustment" });
  return execution;
}

function assessedIncident(execution: CommercialFinancialExecution) {
  const incidents = new CommercialIncidentManagement();
  incidents.open({
    id: "incident-adjustment",
    orderId: "order-adjustment",
    type: "partial_delivery",
    openedByOrganizationId: "org-buyer",
    description: "80 kg manquants",
    execution: execution.snapshot(),
  });
  incidents.assess({
    incidentId: "incident-adjustment",
    execution: execution.snapshot(),
    deliveredQuantityKg: 320,
    acceptedQuantityKg: 320,
    logisticsPenaltyXof: 20_000,
    platformGoodwillXof: 5_000,
    note: "Écart confirmé",
  });
  return incidents.snapshot(execution.snapshot());
}

test("un remboursement exécuté reste borné par l'incident", () => {
  const execution = deliveredExecution();
  const incidents = assessedIncident(execution);
  const adjustments = new CommercialSettlementAdjustments();
  const requested = adjustments.request({
    id: "refund-001",
    orderId: "order-adjustment",
    type: "refund",
    requestedByOrganizationId: "org-buyer",
    amountXof: 225_000,
    reason: "Remboursement de la livraison partielle",
    incidentId: "incident-adjustment",
    execution: execution.snapshot(),
    incidents,
  });
  adjustments.approve({ adjustmentId: requested.id, note: "Montant conforme" });
  adjustments.execute({ adjustmentId: requested.id, reference: "REFUND-MM-001" });
  assert.equal(adjustments.snapshot(execution.snapshot()).economics.executedRefundsXof, 225_000);
  assert.throws(() => adjustments.request({
    id: "refund-002",
    orderId: "order-adjustment",
    type: "refund",
    requestedByOrganizationId: "org-buyer",
    amountXof: 1,
    reason: "Dépassement",
    incidentId: "incident-adjustment",
    execution: execution.snapshot(),
    incidents,
  }), /dépasse/);
});

test("les paiements partiels cumulés ne dépassent pas le total acheteur", () => {
  const execution = deliveredExecution();
  const adjustments = new CommercialSettlementAdjustments();
  const incidents = new CommercialIncidentManagement().snapshot(execution.snapshot());
  for (const [id, amount] of [["partial-1", 600_000], ["partial-2", 525_000]] as const) {
    adjustments.request({ id, orderId: "order-adjustment", type: "partial_payment", requestedByOrganizationId: "org-buyer",
      amountXof: amount, reason: "Échéance", execution: execution.snapshot(), incidents });
    adjustments.approve({ adjustmentId: id, note: "Validé" });
    adjustments.execute({ adjustmentId: id, reference: `PAY-${id}` });
  }
  assert.equal(adjustments.snapshot(execution.snapshot()).economics.collectedPartialPaymentsXof, 1_125_000);
  assert.throws(() => adjustments.request({ id: "partial-3", orderId: "order-adjustment", type: "partial_payment",
    requestedByOrganizationId: "org-buyer", amountXof: 1, reason: "Trop-perçu",
    execution: execution.snapshot(), incidents }), /dépasse/);
});

test("annulation et remplacement logistique sont bloqués après le départ", () => {
  const execution = deliveredExecution();
  const adjustments = new CommercialSettlementAdjustments();
  const incidents = new CommercialIncidentManagement().snapshot(execution.snapshot());
  assert.throws(() => adjustments.request({ id: "cancel-late", orderId: "order-adjustment", type: "order_cancellation",
    requestedByOrganizationId: "org-buyer", reason: "Trop tard", execution: execution.snapshot(), incidents }), /ne peut plus être annulée/);
  assert.throws(() => adjustments.request({ id: "reassign-late", orderId: "order-adjustment", type: "logistics_reassignment",
    requestedByOrganizationId: "org-seller", reason: "Changer de transporteur", replacementLogisticsOrganizationId: "org-logistics-2",
    execution: execution.snapshot(), incidents }), /après le départ/);
});
