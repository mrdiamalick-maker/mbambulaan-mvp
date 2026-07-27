import test from "node:test";
import assert from "node:assert/strict";
import { DemoAccessControl } from "@/platform/access/demo-access-control";
import { PersistentCommercialCatalog, type CatalogCommandJournal, type PersistedCatalogCommand } from "./persistent-commercial-catalog";

class MemoryCatalogJournal implements CatalogCommandJournal {
  readonly entries: PersistedCatalogCommand[] = [];
  async append(entry: PersistedCatalogCommand) {
    if (!this.entries.some((item) => item.commandId === entry.commandId)) this.entries.push(structuredClone(entry));
  }
  async list() { return structuredClone(this.entries); }
}

test("le catalogue, le stock réservé et l'acheteur sont restaurés après redémarrage", async () => {
  const access = new DemoAccessControl();
  const seller = access.getIdentity("demo-cooperative-dakar")!;
  const buyer = access.getIdentity("demo-buyer-hotel-dakar")!;
  const journal = new MemoryCatalogJournal();
  const first = new PersistentCommercialCatalog(journal);

  await first.execute({
    commandId: "catalog-seed-001",
    identity: seller,
    territoryId: "territory-dakar",
    command: { type: "seed_demo", at: "2026-07-27T08:00:00.000Z" },
  });
  await first.execute({
    commandId: "catalog-reserve-001",
    identity: buyer,
    territoryId: "territory-dakar",
    command: {
      type: "reserve",
      reservationId: "reservation-restart-001",
      offerId: "offer-thiof-01",
      quantityKg: 400,
      logisticsOptionId: "log-dakar-cold",
      at: "2026-07-27T09:00:00.000Z",
    },
  });

  const restarted = new PersistentCommercialCatalog(journal);
  const snapshot = await restarted.snapshot("2026-07-27T09:01:00.000Z");
  assert.equal(snapshot.offers.length, 1);
  assert.equal(snapshot.reservations.length, 1);
  assert.equal(snapshot.reservations[0]?.buyerOrganizationId, buyer.organizationId);
  assert.equal(snapshot.activeReservedQuantityKg, 400);
  assert.equal(snapshot.availableQuantityKg, 600);
});

test("un profil non acheteur ne peut pas réserver", async () => {
  const access = new DemoAccessControl();
  const seller = access.getIdentity("demo-cooperative-dakar")!;
  const journal = new MemoryCatalogJournal();
  const service = new PersistentCommercialCatalog(journal);

  await service.execute({
    commandId: "catalog-seed-002",
    identity: seller,
    territoryId: "territory-dakar",
    command: { type: "seed_demo", at: "2026-07-27T08:00:00.000Z" },
  });
  await assert.rejects(() => service.execute({
    commandId: "catalog-invalid-reserve",
    identity: seller,
    territoryId: "territory-dakar",
    command: {
      type: "reserve",
      reservationId: "reservation-invalid",
      offerId: "offer-thiof-01",
      quantityKg: 100,
      logisticsOptionId: "log-dakar-cold",
      at: "2026-07-27T09:00:00.000Z",
    },
  }), /acheteur professionnel/);
});
