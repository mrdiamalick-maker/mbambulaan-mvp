import type { CommercialExecutionSnapshot } from "./commercial-financial-execution";
import { getCommercialFinancialExecution } from "./commercial-financial-registry";

export type CommercialActorKind = "seller" | "buyer" | "logistics" | "finance";

export type CommercialWorkflowCommand =
  | {
      type: "publish_offer";
      offerId?: string;
      sellerOrganizationId: string;
      territoryId: string;
      speciesCode: string;
      qualityGrade: string;
      availableQuantityKg: number;
      unitPriceXof: number;
      at?: string;
    }
  | {
      type: "place_order";
      orderId?: string;
      offerId: string;
      buyerOrganizationId: string;
      quantityKg: number;
      logisticsAmountXof: number;
      platformCommissionRateBps?: number;
      at?: string;
    }
  | { type: "allocate_order"; orderId: string }
  | { type: "start_transport"; orderId: string }
  | { type: "confirm_delivery"; orderId: string; proofId: string; destinationConfirmationReference?: string; documentChecksumSha256?: string; at?: string }
  | { type: "request_payment"; orderId: string; payerOrganizationId?: string; at?: string }
  | { type: "confirm_payment"; paymentId: string; providerReference?: string; documentChecksumSha256?: string; at?: string }
  | { type: "reconcile_order"; orderId: string; at?: string }
  | { type: "open_dispute"; orderId: string; openedByOrganizationId: string; reason: string; at?: string }
  | { type: "resolve_dispute"; disputeId: string; resolution: string; at?: string };

const allowedActors: Record<CommercialWorkflowCommand["type"], CommercialActorKind[]> = {
  publish_offer: ["seller"],
  place_order: ["buyer"],
  allocate_order: ["seller"],
  start_transport: ["logistics"],
  confirm_delivery: ["logistics"],
  request_payment: ["buyer"],
  confirm_payment: ["finance"],
  reconcile_order: ["finance"],
  open_dispute: ["seller", "buyer"],
  resolve_dispute: ["finance"],
};

export class CommercialActorWorkflow {
  execute(actorKind: CommercialActorKind, command: CommercialWorkflowCommand): CommercialExecutionSnapshot {
    if (!allowedActors[command.type].includes(actorKind)) {
      throw new Error(`L'acteur ${actorKind} ne peut pas exécuter ${command.type}.`);
    }

    const engine = getCommercialFinancialExecution();
    switch (command.type) {
      case "publish_offer":
        engine.publishOffer({
          id: command.offerId,
          sellerOrganizationId: command.sellerOrganizationId,
          territoryId: command.territoryId,
          speciesCode: command.speciesCode,
          qualityGrade: command.qualityGrade,
          availableQuantityKg: command.availableQuantityKg,
          unitPriceXof: command.unitPriceXof,
          at: command.at,
        });
        break;
      case "place_order":
        engine.placeOrder({
          id: command.orderId,
          offerId: command.offerId,
          buyerOrganizationId: command.buyerOrganizationId,
          quantityKg: command.quantityKg,
          logisticsAmountXof: command.logisticsAmountXof,
          platformCommissionRateBps: command.platformCommissionRateBps,
          at: command.at,
        });
        break;
      case "allocate_order":
        engine.allocateOrder(command.orderId);
        break;
      case "start_transport":
        engine.startTransport(command.orderId);
        break;
      case "confirm_delivery":
        engine.confirmDelivery({ orderId: command.orderId, proofId: command.proofId, at: command.at });
        break;
      case "request_payment":
        engine.requestPayment({ orderId: command.orderId, payerOrganizationId: command.payerOrganizationId, at: command.at });
        break;
      case "confirm_payment":
        engine.confirmPayment({ paymentId: command.paymentId, providerReference: command.providerReference, at: command.at });
        break;
      case "reconcile_order":
        engine.reconcileOrder({ orderId: command.orderId, at: command.at });
        break;
      case "open_dispute":
        engine.openDispute({
          orderId: command.orderId,
          openedByOrganizationId: command.openedByOrganizationId,
          reason: command.reason,
          at: command.at,
        });
        break;
      case "resolve_dispute":
        engine.resolveDispute({ disputeId: command.disputeId, resolution: command.resolution, at: command.at });
        break;
    }
    return engine.snapshot();
  }
}
