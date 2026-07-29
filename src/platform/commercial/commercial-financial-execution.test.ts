import assert from "node:assert/strict";
import test from "node:test";
import { CommercialFinancialExecution } from "./commercial-financial-execution";

test("exécute une vente complète et réconcilie tous les bénéficiaires", () => {
  const engine = new CommercialFinancialExecution();
  const snapshot = engine.runDemo();
  assert.equal(snapshot.orders.length, 1);
  assert.equal(snapshot.orders[0]?.status, "reconciled");
  assert.equal(snapshot.orders[0]?.buyerTotalXof, 6_750_000);
  assert.equal(snapshot.economics.grossMerchandiseValueXof, 6_000_000);
  assert.equal(snapshot.economics.logisticsRevenueXof, 600_000);
  assert.equal(snapshot.economics.platformRevenueXof, 150_000);
  assert.equal(snapshot.economics.sellerRevenueXof, 6_000_000);
  assert.equal(snapshot.economics.confirmedPaymentsXof, 6_750_000);
  assert.equal(snapshot.ledger.length, 3);
  assert.ok(snapshot.ledger.every((entry) => entry.status === "settled"));
  assert.equal(snapshot.ledger.reduce((sum, entry) => sum + entry.amountXof, 0), 6_750_000);
});

test("bloque la surallocation d'une offre", () => {
  const engine = new CommercialFinancialExecution();
  const offer = engine.publishOffer({
    sellerOrganizationId: "seller-1",
    territoryId: "territory-dakar",
    speciesCode: "thiof",
    qualityGrade: "A",
    availableQuantityKg: 100,
    unitPriceXof: 2_500,
  });
  assert.throws(() => engine.placeOrder({
    offerId: offer.id,
    buyerOrganizationId: "buyer-1",
    quantityKg: 101,
    logisticsAmountXof: 10_000,
  }), /quantité commandée/i);
});

test("ouvre puis résout un litige après livraison", () => {
  const engine = new CommercialFinancialExecution();
  const offer = engine.publishOffer({
    sellerOrganizationId: "seller-1",
    territoryId: "territory-dakar",
    speciesCode: "sardinelle",
    qualityGrade: "B",
    availableQuantityKg: 50,
    unitPriceXof: 1_000,
  });
  const order = engine.placeOrder({
    offerId: offer.id,
    buyerOrganizationId: "buyer-1",
    quantityKg: 50,
    logisticsAmountXof: 5_000,
  });
  engine.allocateOrder(order.id);
  engine.startTransport(order.id);
  engine.confirmDelivery({ orderId: order.id, proofId: "proof-1" });
  const dispute = engine.openDispute({ orderId: order.id, openedByOrganizationId: "buyer-1", reason: "Température contestée" });
  assert.equal(dispute.status, "open");
  const resolved = engine.resolveDispute({ disputeId: dispute.id, resolution: "Contrôle contradictoire accepté" });
  assert.equal(resolved.status, "resolved");
  assert.equal(engine.snapshot().orders[0]?.status, "resolved");
});
