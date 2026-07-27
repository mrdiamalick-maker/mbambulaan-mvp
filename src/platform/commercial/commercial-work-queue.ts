import type { DemoIdentity } from "@/platform/access/demo-access-control";
import { getCommercialCatalog } from "./commercial-catalog-registry";
import { getCommercialCatalogExecutionService } from "./commercial-catalog-execution";
import { getPersistentCommercialWorkflow } from "./persistent-commercial-workflow";

export type CommercialWorkItemKind =
  | "publish_offer"
  | "reserve_offer"
  | "confirm_reservation"
  | "allocate_order"
  | "start_transport"
  | "confirm_delivery"
  | "request_payment"
  | "confirm_payment"
  | "reconcile_order";

export interface CommercialWorkItem {
  id: string;
  kind: CommercialWorkItemKind;
  actorRole: "cooperative_manager" | "buyer_operator" | "business_operator" | "finance_officer";
  organizationId: string;
  territoryId: string;
  title: string;
  description: string;
  priority: "normal" | "high";
  offerId?: string;
  logisticsOptionId?: string;
  suggestedQuantityKg?: number;
  orderId?: string;
  reservationId?: string;
  paymentId?: string;
  amountXof?: number;
}

export class CommercialWorkQueue {
  async forIdentity(identity: DemoIdentity) {
    const [catalog, execution, links] = await Promise.all([
      Promise.resolve(getCommercialCatalog().snapshot()),
      getPersistentCommercialWorkflow().snapshot(),
      getCommercialCatalogExecutionService().listLinks(),
    ]);
    const items: CommercialWorkItem[] = [];

    if (identity.roleCode === "cooperative_manager") {
      const hasPublishedOffer = catalog.offers.some((offer) => offer.sellerOrganizationId === identity.organizationId && offer.status === "published");
      if (!hasPublishedOffer) items.push({
        id: `publish-${identity.organizationId}`, kind: "publish_offer", actorRole: "cooperative_manager",
        organizationId: identity.organizationId, territoryId: identity.territoryIds[0] ?? "territory-dakar",
        title: "Publier le stock disponible", description: "Aucune offre active n'est visible pour votre organisation.", priority: "high",
      });
      for (const order of execution.orders.filter((order) => order.sellerOrganizationId === identity.organizationId && order.status === "ordered")) {
        items.push({ id: `allocate-${order.id}`, kind: "allocate_order", actorRole: "cooperative_manager",
          organizationId: identity.organizationId, territoryId: order.territoryId, orderId: order.id,
          title: "Allouer la commande", description: `${order.quantityKg} kg à préparer pour l'acheteur.`, priority: "high", amountXof: order.buyerTotalXof });
      }
    }

    if (identity.roleCode === "buyer_operator") {
      const activeReservations = catalog.reservations.filter((item) => item.buyerOrganizationId === identity.organizationId && item.status === "active");
      const linkedReservationIds = new Set(links.filter((link) => link.buyerOrganizationId === identity.organizationId).map((link) => link.reservationId));
      if (activeReservations.length === 0) {
        const offer = catalog.offers.find((item) => item.status === "published" && item.availableQuantityKg - item.reservedQuantityKg >= item.minimumOrderKg);
        const logistics = offer && catalog.logisticsOptions.find((item) => item.active && item.territoryIds.includes(offer.territoryId));
        if (offer && logistics && !catalog.reservations.some((item) => linkedReservationIds.has(item.id) && item.offerId === offer.id)) {
          const suggestedQuantityKg = Math.min(400, offer.availableQuantityKg - offer.reservedQuantityKg);
          items.push({ id: `reserve-${offer.id}`, kind: "reserve_offer", actorRole: "buyer_operator",
            organizationId: identity.organizationId, territoryId: offer.territoryId, offerId: offer.id,
            logisticsOptionId: logistics.id, suggestedQuantityKg, title: "Réserver le stock disponible",
            description: `${suggestedQuantityKg} kg de ${offer.speciesCode} disponibles avec ${logistics.coldChain ? "chaîne du froid" : "transport standard"}.`,
            priority: "high", amountXof: Math.round(suggestedQuantityKg * offer.unitPriceXof) });
        }
      }
      for (const reservation of activeReservations) {
        items.push({ id: `confirm-${reservation.id}`, kind: "confirm_reservation", actorRole: "buyer_operator",
          organizationId: identity.organizationId, territoryId: "territory-dakar", reservationId: reservation.id,
          title: "Confirmer la réservation", description: `${reservation.quantityKg} kg réservés jusqu'au ${new Date(reservation.expiresAt).toLocaleTimeString("fr-FR")}.`,
          priority: "high", amountXof: reservation.totalAmountXof });
      }
      for (const order of execution.orders.filter((order) => order.buyerOrganizationId === identity.organizationId && order.status === "delivered")) {
        items.push({ id: `pay-${order.id}`, kind: "request_payment", actorRole: "buyer_operator", organizationId: identity.organizationId,
          territoryId: order.territoryId, orderId: order.id, title: "Initier le paiement",
          description: "La livraison est confirmée et la preuve est disponible.", priority: "high", amountXof: order.buyerTotalXof });
      }
    }

    if (identity.roleCode === "business_operator") {
      const assignedOrderIds = new Set(links.filter((link) => link.logisticsOrganizationId === identity.organizationId).map((link) => link.orderId));
      for (const order of execution.orders.filter((order) => assignedOrderIds.has(order.id))) {
        if (order.status === "allocated") items.push({ id: `transport-${order.id}`, kind: "start_transport", actorRole: "business_operator",
          organizationId: identity.organizationId, territoryId: order.territoryId, orderId: order.id,
          title: "Démarrer le transport", description: `${order.quantityKg} kg sont prêts à être pris en charge.`, priority: "high" });
        if (order.status === "in_transit") items.push({ id: `deliver-${order.id}`, kind: "confirm_delivery", actorRole: "business_operator",
          organizationId: identity.organizationId, territoryId: order.territoryId, orderId: order.id,
          title: "Confirmer la livraison", description: "Ajoutez une preuve de remise à l'acheteur.", priority: "high" });
      }
    }

    if (identity.roleCode === "finance_officer") {
      for (const payment of execution.payments.filter((payment) => payment.status === "requested")) {
        const order = execution.orders.find((item) => item.id === payment.orderId);
        items.push({ id: `confirm-payment-${payment.id}`, kind: "confirm_payment", actorRole: "finance_officer",
          organizationId: identity.organizationId, territoryId: order?.territoryId ?? "territory-national",
          orderId: payment.orderId, paymentId: payment.id, title: "Confirmer le paiement",
          description: "Vérifier la référence du fournisseur de paiement.", priority: "high", amountXof: payment.amountXof });
      }
      for (const order of execution.orders.filter((order) => order.status === "paid")) {
        items.push({ id: `reconcile-${order.id}`, kind: "reconcile_order", actorRole: "finance_officer",
          organizationId: identity.organizationId, territoryId: order.territoryId, orderId: order.id,
          title: "Réconcilier les fonds", description: "Répartir vendeur, logistique et commission Mbàmbulaan.", priority: "high", amountXof: order.buyerTotalXof });
      }
    }

    return { generatedAt: new Date().toISOString(), identityId: identity.id, organizationId: identity.organizationId, items };
  }
}

declare global { var __mbambulaanCommercialWorkQueue: CommercialWorkQueue | undefined; }
export function getCommercialWorkQueue() {
  globalThis.__mbambulaanCommercialWorkQueue ??= new CommercialWorkQueue();
  return globalThis.__mbambulaanCommercialWorkQueue;
}
