import test from "node:test";
import assert from "node:assert/strict";
import { CommercialCatalog } from "./commercial-catalog";

function createCatalog() {
  const catalog = new CommercialCatalog();
  catalog.upsertLogisticsOption({
    id: "log-dakar-cold",
    operatorOrganizationId: "org-cold-chain-dakar",
    territoryIds: ["territory-dakar"],
    pricePerKgXof: 250,
    minimumFeeXof: 100_000,
    estimatedHours: 4,
    coldChain: true,
    active: true,
  });
  catalog.createOffer({
    id: "offer-thiof-01",
    sellerOrganizationId: "org-cooperative-dakar",
    territoryId: "territory-dakar",
    speciesCode: "thiof",
    qualityGrade: "A",
    landingSiteId: "landing-dakar-01",
    availableQuantityKg: 1_000,
    unitPriceXof: 2_500,
    minimumOrderKg: 100,
    availableFrom: "2026-07-27T08:00:00.000Z",
    expiresAt: "2026-07-28T08:00:00.000Z",
  });
  catalog.publishOffer("offer-thiof-01", "2026-07-27T08:00:00.000Z");
  return catalog;
}

test("réservation partielle puis confirmation met à jour le stock", () => {
  const catalog = createCatalog();
  const reservation = catalog.reserve({
    id: "reservation-01",
    offerId: "offer-thiof-01",
    buyerOrganizationId: "org-buyer-hotel-dakar",
    quantityKg: 400,
    logisticsOptionId: "log-dakar-cold",
    at: "2026-07-27T09:00:00.000Z",
  });
  assert.equal(reservation.seafoodAmountXof, 1_000_000);
  assert.equal(reservation.logisticsAmountXof, 100_000);
  assert.equal(reservation.platformCommissionXof, 25_000);
  assert.equal(reservation.totalAmountXof, 1_125_000);
  assert.equal(catalog.snapshot("2026-07-27T09:01:00.000Z").availableQuantityKg, 600);
  catalog.confirmReservation("reservation-01", "2026-07-27T09:10:00.000Z");
  const snapshot = catalog.snapshot("2026-07-27T09:11:00.000Z");
  assert.equal(snapshot.offers[0]?.availableQuantityKg, 600);
  assert.equal(snapshot.offers[0]?.reservedQuantityKg, 0);
});

test("annulation libère immédiatement la quantité", () => {
  const catalog = createCatalog();
  catalog.reserve({
    id: "reservation-02",
    offerId: "offer-thiof-01",
    buyerOrganizationId: "org-buyer-hotel-dakar",
    quantityKg: 300,
    logisticsOptionId: "log-dakar-cold",
    at: "2026-07-27T09:00:00.000Z",
  });
  catalog.cancelReservation("reservation-02", "2026-07-27T09:05:00.000Z");
  assert.equal(catalog.snapshot("2026-07-27T09:06:00.000Z").availableQuantityKg, 1_000);
});

test("expiration automatique libère la réservation", () => {
  const catalog = createCatalog();
  catalog.reserve({
    id: "reservation-03",
    offerId: "offer-thiof-01",
    buyerOrganizationId: "org-buyer-hotel-dakar",
    quantityKg: 500,
    logisticsOptionId: "log-dakar-cold",
    ttlMinutes: 15,
    at: "2026-07-27T09:00:00.000Z",
  });
  const snapshot = catalog.snapshot("2026-07-27T09:16:00.000Z");
  assert.equal(snapshot.reservations[0]?.status, "expired");
  assert.equal(snapshot.availableQuantityKg, 1_000);
});

test("deux réservations ne peuvent pas dépasser le stock libre", () => {
  const catalog = createCatalog();
  catalog.reserve({
    id: "reservation-04",
    offerId: "offer-thiof-01",
    buyerOrganizationId: "buyer-1",
    quantityKg: 700,
    logisticsOptionId: "log-dakar-cold",
    at: "2026-07-27T09:00:00.000Z",
  });
  assert.throws(() => catalog.reserve({
    id: "reservation-05",
    offerId: "offer-thiof-01",
    buyerOrganizationId: "buyer-2",
    quantityKg: 400,
    logisticsOptionId: "log-dakar-cold",
    at: "2026-07-27T09:01:00.000Z",
  }), /insuffisante/);
});
