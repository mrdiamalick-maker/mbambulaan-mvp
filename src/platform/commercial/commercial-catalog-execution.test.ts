import test from "node:test";
import assert from "node:assert/strict";
import { getDemoAccessControl } from "@/platform/access/demo-access-registry";
import {
  CommercialCatalogExecutionService,
  VolatileCatalogExecutionLinkRepository,
  type CatalogExecutionLink,
} from "./commercial-catalog-execution";

test("le logisticien sélectionné est le seul autorisé sur la commande", async () => {
  const repository = new VolatileCatalogExecutionLinkRepository();
  const service = new CommercialCatalogExecutionService(repository);
  const link: CatalogExecutionLink = {
    reservationId: "reservation-01",
    catalogOfferId: "offer-01",
    executionOfferId: "execution-offer-01",
    orderId: "order-reservation-01",
    sellerOrganizationId: "org-cooperative-dakar",
    buyerOrganizationId: "org-buyer-hotel-dakar",
    logisticsOrganizationId: "org-cold-chain-dakar",
    logisticsOptionId: "log-dakar-cold",
    territoryId: "territory-dakar",
    createdAt: "2026-07-27T09:10:00.000Z",
  };
  await repository.save(link);

  const selected = getDemoAccessControl().getIdentity("demo-cold-chain-operator");
  assert.ok(selected);
  assert.equal((await service.assertSelectedLogistics(link.orderId, selected))?.reservationId, link.reservationId);

  const otherOperator = { ...selected, organizationId: "org-other-logistics" };
  await assert.rejects(
    () => service.assertSelectedLogistics(link.orderId, otherOperator),
    /autre opérateur logistique/,
  );
});

test("la liaison réservation commande est idempotente dans le repository", async () => {
  const repository = new VolatileCatalogExecutionLinkRepository();
  const link: CatalogExecutionLink = {
    reservationId: "reservation-02",
    catalogOfferId: "offer-02",
    executionOfferId: "execution-offer-02",
    orderId: "order-reservation-02",
    sellerOrganizationId: "org-cooperative-dakar",
    buyerOrganizationId: "org-buyer-hotel-dakar",
    logisticsOrganizationId: "org-cold-chain-dakar",
    logisticsOptionId: "log-dakar-cold",
    territoryId: "territory-dakar",
    createdAt: "2026-07-27T10:00:00.000Z",
  };
  await repository.save(link);
  await repository.save(link);
  assert.deepEqual(await repository.findByReservationId(link.reservationId), link);
  assert.deepEqual(await repository.findByOrderId(link.orderId), link);
});
