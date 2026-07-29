import assert from "node:assert/strict";
import test from "node:test";
import type { DemoIdentity } from "@/platform/access/demo-access-control";
import { PersistentCommercialWorkflow, type CommercialCommandJournal } from "./persistent-commercial-workflow";
import type { PersistedCommercialCommand } from "./postgres-commercial-command-journal";

class MemoryJournal implements CommercialCommandJournal {
  entries: PersistedCommercialCommand[] = [];
  async append(entry: PersistedCommercialCommand) {
    if (!this.entries.some((item) => item.commandId === entry.commandId)) this.entries.push(structuredClone(entry));
  }
  async list() { return structuredClone(this.entries); }
}

const identity = (input: Pick<DemoIdentity, "id" | "roleCode" | "organizationId">): DemoIdentity => ({
  ...input,
  displayName: input.id,
  organizationName: input.organizationId,
  territoryIds: ["territory-dakar"],
  productCodes: ["business", "finance"],
  permissions: ["trade.read", "trade.write", "finance.read", "finance.write"],
  locale: "fr",
  status: "active",
});

test("restaure une transaction commerciale depuis le journal après redémarrage", async () => {
  const journal = new MemoryJournal();
  const seller = identity({ id: "seller", roleCode: "cooperative_manager", organizationId: "org-cooperative-dakar" });
  const buyer = identity({ id: "buyer", roleCode: "buyer_operator", organizationId: "org-buyer-hotel-dakar" });
  const logistics = identity({ id: "logistics", roleCode: "business_operator", organizationId: "org-cold-chain-dakar" });
  const finance = identity({ id: "finance", roleCode: "finance_officer", organizationId: "org-finance-partner" });
  const first = new PersistentCommercialWorkflow(journal);
  const execute = (commandId: string, actor: DemoIdentity, command: Parameters<PersistentCommercialWorkflow["execute"]>[0]["command"]) =>
    first.execute({ commandId, identity: actor, territoryId: "territory-dakar", command });

  await execute("cmd-01", seller, { type: "publish_offer", offerId: "offer-01", sellerOrganizationId: seller.organizationId, territoryId: "territory-dakar", speciesCode: "thiof", qualityGrade: "A", availableQuantityKg: 2400, unitPriceXof: 2500 });
  await execute("cmd-02", buyer, { type: "place_order", orderId: "order-01", offerId: "offer-01", buyerOrganizationId: buyer.organizationId, quantityKg: 2400, logisticsAmountXof: 600000, platformCommissionRateBps: 250 });
  await execute("cmd-03", seller, { type: "allocate_order", orderId: "order-01" });
  await execute("cmd-04", logistics, { type: "start_transport", orderId: "order-01" });
  await execute("cmd-05", logistics, { type: "confirm_delivery", orderId: "order-01", proofId: "proof-01" });
  await execute("cmd-06", buyer, { type: "request_payment", orderId: "order-01", payerOrganizationId: buyer.organizationId });
  await execute("cmd-07", finance, { type: "confirm_payment", paymentId: "payment-0001", providerReference: "MM-SIM-01" });
  await execute("cmd-08", finance, { type: "reconcile_order", orderId: "order-01" });

  const restarted = new PersistentCommercialWorkflow(journal);
  const snapshot = await restarted.snapshot();
  assert.equal(snapshot.orders[0]?.status, "reconciled");
  assert.equal(snapshot.payments[0]?.status, "confirmed");
  assert.equal(snapshot.economics.platformRevenueXof, 150000);
  assert.equal(snapshot.economics.confirmedPaymentsXof, 6750000);
  assert.equal(snapshot.ledger.filter((entry) => entry.status === "settled").length, 3);
  assert.equal(journal.entries.length, 8);
});

test("refuse qu'un acteur exécute l'étape d'un autre acteur", async () => {
  const workflow = new PersistentCommercialWorkflow(new MemoryJournal());
  const buyer = identity({ id: "buyer", roleCode: "buyer_operator", organizationId: "org-buyer-hotel-dakar" });
  await assert.rejects(
    workflow.execute({
      commandId: "forbidden-01",
      identity: buyer,
      territoryId: "territory-dakar",
      command: { type: "publish_offer", sellerOrganizationId: "org-cooperative-dakar", territoryId: "territory-dakar", speciesCode: "thiof", qualityGrade: "A", availableQuantityKg: 10, unitPriceXof: 2500 },
    }),
    /ne peut pas exécuter publish_offer/,
  );
});
