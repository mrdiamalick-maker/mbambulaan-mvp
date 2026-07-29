import type { CommercialExecutionSnapshot } from "./commercial-financial-execution";
import type { CommercialIncidentSnapshot } from "./commercial-incident-management";

export type SettlementAdjustmentType =
  | "partial_payment"
  | "credit_note"
  | "refund"
  | "order_cancellation"
  | "logistics_reassignment";

export type SettlementAdjustmentStatus = "pending" | "approved" | "executed" | "cancelled";

export interface SettlementAdjustment {
  id: string;
  orderId: string;
  type: SettlementAdjustmentType;
  status: SettlementAdjustmentStatus;
  requestedByOrganizationId: string;
  amountXof: number;
  reason: string;
  incidentId?: string;
  targetOrganizationId?: string;
  replacementLogisticsOrganizationId?: string;
  requestedAt: string;
  approvedAt?: string;
  executedAt?: string;
  cancelledAt?: string;
  approvalNote?: string;
  executionReference?: string;
}

export interface SettlementAdjustmentSnapshot {
  adjustments: SettlementAdjustment[];
  economics: {
    pendingAmountXof: number;
    approvedAmountXof: number;
    executedRefundsXof: number;
    executedCreditsXof: number;
    collectedPartialPaymentsXof: number;
    netCollectedPaymentsXof: number;
  };
}

export class CommercialSettlementAdjustments {
  private readonly adjustments = new Map<string, SettlementAdjustment>();

  request(input: {
    id: string;
    orderId: string;
    type: SettlementAdjustmentType;
    requestedByOrganizationId: string;
    amountXof?: number;
    reason: string;
    incidentId?: string;
    targetOrganizationId?: string;
    replacementLogisticsOrganizationId?: string;
    execution: CommercialExecutionSnapshot;
    incidents: CommercialIncidentSnapshot;
    at?: string;
  }) {
    const existing = this.adjustments.get(input.id);
    if (existing) return structuredClone(existing);
    const order = requireOrder(input.execution, input.orderId);
    if (!input.reason.trim()) throw new Error("Le motif de l'ajustement est obligatoire.");
    const amountXof = input.amountXof ?? 0;
    if (amountXof < 0) throw new Error("Le montant de l'ajustement ne peut pas être négatif.");

    if (input.type === "partial_payment") {
      if (!['delivered', 'payment_requested'].includes(order.status)) throw new Error("Un paiement partiel ne peut être demandé qu'après livraison.");
      const alreadyCollected = this.sumExecuted(order.id, "partial_payment");
      if (amountXof <= 0 || alreadyCollected + amountXof > order.buyerTotalXof) throw new Error("Le paiement partiel dépasse le solde de la commande.");
    }
    if (input.type === "refund" || input.type === "credit_note") {
      const incident = input.incidentId ? input.incidents.incidents.find((item) => item.id === input.incidentId) : undefined;
      if (!incident || incident.orderId !== order.id || incident.status === "open") throw new Error("Un remboursement ou avoir doit être rattaché à un incident évalué.");
      const authorized = incident.buyerRefundXof;
      const alreadyExecuted = this.sumExecuted(order.id, "refund") + this.sumExecuted(order.id, "credit_note");
      if (amountXof <= 0 || alreadyExecuted + amountXof > authorized) throw new Error("Le montant dépasse l'ajustement autorisé par l'incident.");
    }
    if (input.type === "order_cancellation") {
      if (!['ordered', 'allocated'].includes(order.status)) throw new Error("La commande ne peut plus être annulée à ce stade.");
      if (this.forOrder(order.id).some((item) => item.type === "order_cancellation" && item.status !== "cancelled")) throw new Error("Une annulation existe déjà pour cette commande.");
    }
    if (input.type === "logistics_reassignment") {
      if (!['ordered', 'allocated'].includes(order.status)) throw new Error("Le logisticien ne peut plus être remplacé après le départ du transport.");
      if (!input.replacementLogisticsOrganizationId) throw new Error("Le nouvel opérateur logistique est obligatoire.");
    }

    const adjustment: SettlementAdjustment = {
      id: input.id,
      orderId: order.id,
      type: input.type,
      status: "pending",
      requestedByOrganizationId: input.requestedByOrganizationId,
      amountXof,
      reason: input.reason,
      incidentId: input.incidentId,
      targetOrganizationId: input.targetOrganizationId,
      replacementLogisticsOrganizationId: input.replacementLogisticsOrganizationId,
      requestedAt: input.at ?? new Date().toISOString(),
    };
    this.adjustments.set(adjustment.id, adjustment);
    return structuredClone(adjustment);
  }

  approve(input: { adjustmentId: string; note: string; at?: string }) {
    const adjustment = this.requireAdjustment(input.adjustmentId);
    if (adjustment.status !== "pending") throw new Error("Seul un ajustement en attente peut être approuvé.");
    if (!input.note.trim()) throw new Error("La note d'approbation est obligatoire.");
    adjustment.status = "approved";
    adjustment.approvalNote = input.note;
    adjustment.approvedAt = input.at ?? new Date().toISOString();
    return structuredClone(adjustment);
  }

  execute(input: { adjustmentId: string; reference: string; at?: string }) {
    const adjustment = this.requireAdjustment(input.adjustmentId);
    if (adjustment.status !== "approved") throw new Error("L'ajustement doit être approuvé avant exécution.");
    if (!input.reference.trim()) throw new Error("La référence d'exécution est obligatoire.");
    adjustment.status = "executed";
    adjustment.executionReference = input.reference;
    adjustment.executedAt = input.at ?? new Date().toISOString();
    return structuredClone(adjustment);
  }

  cancel(input: { adjustmentId: string; at?: string }) {
    const adjustment = this.requireAdjustment(input.adjustmentId);
    if (!['pending', 'approved'].includes(adjustment.status)) throw new Error("Cet ajustement ne peut plus être annulé.");
    adjustment.status = "cancelled";
    adjustment.cancelledAt = input.at ?? new Date().toISOString();
    return structuredClone(adjustment);
  }

  snapshot(execution: CommercialExecutionSnapshot): SettlementAdjustmentSnapshot {
    const adjustments = [...this.adjustments.values()];
    const executed = adjustments.filter((item) => item.status === "executed");
    const partialPayments = executed.filter((item) => item.type === "partial_payment").reduce((sum, item) => sum + item.amountXof, 0);
    const refunds = executed.filter((item) => item.type === "refund").reduce((sum, item) => sum + item.amountXof, 0);
    const credits = executed.filter((item) => item.type === "credit_note").reduce((sum, item) => sum + item.amountXof, 0);
    return {
      adjustments: structuredClone(adjustments),
      economics: {
        pendingAmountXof: adjustments.filter((item) => item.status === "pending").reduce((sum, item) => sum + item.amountXof, 0),
        approvedAmountXof: adjustments.filter((item) => item.status === "approved").reduce((sum, item) => sum + item.amountXof, 0),
        executedRefundsXof: refunds,
        executedCreditsXof: credits,
        collectedPartialPaymentsXof: partialPayments,
        netCollectedPaymentsXof: execution.economics.confirmedPaymentsXof + partialPayments - refunds - credits,
      },
    };
  }

  forOrder(orderId: string) { return [...this.adjustments.values()].filter((item) => item.orderId === orderId); }
  reset() { this.adjustments.clear(); }

  private sumExecuted(orderId: string, type: SettlementAdjustmentType) {
    return this.forOrder(orderId).filter((item) => item.type === type && item.status === "executed").reduce((sum, item) => sum + item.amountXof, 0);
  }
  private requireAdjustment(id: string) {
    const adjustment = this.adjustments.get(id);
    if (!adjustment) throw new Error("Ajustement commercial introuvable.");
    return adjustment;
  }
}

function requireOrder(execution: CommercialExecutionSnapshot, orderId: string) {
  const order = execution.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Commande introuvable.");
  return order;
}
