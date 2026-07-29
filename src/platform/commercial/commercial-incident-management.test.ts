import test from "node:test";
import assert from "node:assert/strict";
import { CommercialFinancialExecution } from "./commercial-financial-execution";
import { CommercialIncidentManagement } from "./commercial-incident-management";

function deliveredExecution() {
  const engine = new CommercialFinancialExecution();
  const offer = engine.publishOffer({
    id: "offer-incident", sellerOrganizationId: "seller", territoryId: "territory-dakar",
    speciesCode: "thiof", qualityGrade: "A", availableQuantityKg: 400, unitPriceXof: 2_500,
  });
  const order = engine.placeOrder({
    id: "order-incident", offerId: offer.id, buyerOrganizationId: "buyer",
    quantityKg: 400, logisticsAmountXof: 100_000, platformCommissionRateBps: 250,
  });
  engine.allocateOrder(order.id);
  engine.startTransport(order.id);
  engine.confirmDelivery({ orderId: order.id, proofId: "proof-incident" });
  return engine;
}

test("une livraison partielle calcule un remboursement traçable", () => {
  const execution = deliveredExecution();
  const incidents = new CommercialIncidentManagement();
  incidents.open({
    id: "incident-1", orderId: "order-incident", type: "partial_delivery",
    openedByOrganizationId: "buyer", description: "80 kg manquants",
    execution: execution.snapshot(),
  });
  const assessed = incidents.assess({
    incidentId: "incident-1", execution: execution.snapshot(), deliveredQuantityKg: 320,
    acceptedQuantityKg: 320, logisticsPenaltyXof: 20_000, platformGoodwillXof: 5_000,
    note: "Écart confirmé par la preuve de pesée.",
  });
  assert.equal(assessed.sellerAdjustmentXof, -200_000);
  assert.equal(assessed.logisticsAdjustmentXof, -20_000);
  assert.equal(assessed.platformAdjustmentXof, -5_000);
  assert.equal(assessed.buyerRefundXof, 225_000);
  const snapshot = incidents.snapshot(execution.snapshot());
  assert.equal(snapshot.economics.netPlatformRevenueXof, 20_000);
});

test("un remboursement ne peut pas dépasser les montants de la commande", () => {
  const execution = deliveredExecution();
  const incidents = new CommercialIncidentManagement();
  incidents.open({
    id: "incident-2", orderId: "order-incident", type: "quality_damage",
    openedByOrganizationId: "buyer", description: "Produit détérioré",
    execution: execution.snapshot(),
  });
  assert.throws(() => incidents.assess({
    incidentId: "incident-2", execution: execution.snapshot(), acceptedQuantityKg: 300,
    logisticsPenaltyXof: 150_000, note: "Pénalité excessive",
  }), /pénalité logistique/);
});

test("un incident doit être évalué avant résolution", () => {
  const execution = deliveredExecution();
  const incidents = new CommercialIncidentManagement();
  incidents.open({
    id: "incident-3", orderId: "order-incident", type: "delivery_refused",
    openedByOrganizationId: "buyer", description: "Livraison refusée",
    execution: execution.snapshot(),
  });
  assert.throws(() => incidents.resolve({ incidentId: "incident-3", note: "Clôture" }), /évalué/);
});
