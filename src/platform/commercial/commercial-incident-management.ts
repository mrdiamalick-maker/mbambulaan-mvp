import type { CommercialExecutionSnapshot } from "./commercial-financial-execution";

export type CommercialIncidentType =
  | "partial_delivery"
  | "quality_damage"
  | "delivery_refused"
  | "cold_chain_break"
  | "logistics_reassignment";

export type CommercialIncidentStatus = "open" | "assessed" | "resolved";

export interface CommercialIncident {
  id: string;
  orderId: string;
  type: CommercialIncidentType;
  openedByOrganizationId: string;
  description: string;
  status: CommercialIncidentStatus;
  openedAt: string;
  deliveredQuantityKg?: number;
  acceptedQuantityKg?: number;
  sellerAdjustmentXof: number;
  logisticsAdjustmentXof: number;
  platformAdjustmentXof: number;
  buyerRefundXof: number;
  replacementLogisticsOrganizationId?: string;
  assessmentNote?: string;
  resolutionNote?: string;
  assessedAt?: string;
  resolvedAt?: string;
}

export interface CommercialIncidentSnapshot {
  incidents: CommercialIncident[];
  economics: {
    totalBuyerRefundXof: number;
    totalSellerAdjustmentXof: number;
    totalLogisticsAdjustmentXof: number;
    totalPlatformAdjustmentXof: number;
    netPlatformRevenueXof: number;
  };
}

export class CommercialIncidentManagement {
  private readonly incidents = new Map<string, CommercialIncident>();

  open(input: {
    id: string;
    orderId: string;
    type: CommercialIncidentType;
    openedByOrganizationId: string;
    description: string;
    execution: CommercialExecutionSnapshot;
    at?: string;
  }) {
    const existing = this.incidents.get(input.id);
    if (existing) return structuredClone(existing);
    const order = requireOrder(input.execution, input.orderId);
    if (!['allocated', 'in_transit', 'delivered', 'payment_requested', 'paid', 'reconciled'].includes(order.status)) {
      throw new Error("Un incident ne peut pas être ouvert à ce stade.");
    }
    if (!input.description.trim()) throw new Error("La description de l'incident est obligatoire.");
    const incident: CommercialIncident = {
      id: input.id,
      orderId: input.orderId,
      type: input.type,
      openedByOrganizationId: input.openedByOrganizationId,
      description: input.description,
      status: "open",
      openedAt: input.at ?? new Date().toISOString(),
      sellerAdjustmentXof: 0,
      logisticsAdjustmentXof: 0,
      platformAdjustmentXof: 0,
      buyerRefundXof: 0,
    };
    this.incidents.set(incident.id, incident);
    return structuredClone(incident);
  }

  assess(input: {
    incidentId: string;
    execution: CommercialExecutionSnapshot;
    deliveredQuantityKg?: number;
    acceptedQuantityKg?: number;
    logisticsPenaltyXof?: number;
    platformGoodwillXof?: number;
    replacementLogisticsOrganizationId?: string;
    note: string;
    at?: string;
  }) {
    const incident = this.requireIncident(input.incidentId);
    if (incident.status !== "open") throw new Error("Seul un incident ouvert peut être évalué.");
    const order = requireOrder(input.execution, incident.orderId);
    if (!input.note.trim()) throw new Error("La note d'évaluation est obligatoire.");

    const delivered = input.deliveredQuantityKg ?? order.quantityKg;
    const accepted = input.acceptedQuantityKg ?? delivered;
    if (delivered < 0 || delivered > order.quantityKg) throw new Error("La quantité livrée est invalide.");
    if (accepted < 0 || accepted > delivered) throw new Error("La quantité acceptée est invalide.");
    const logisticsPenalty = input.logisticsPenaltyXof ?? 0;
    const platformGoodwill = input.platformGoodwillXof ?? 0;
    if (logisticsPenalty < 0 || logisticsPenalty > order.logisticsAmountXof) throw new Error("La pénalité logistique est invalide.");
    if (platformGoodwill < 0 || platformGoodwill > order.platformCommissionXof) throw new Error("Le geste commercial plateforme est invalide.");

    const rejectedQuantityKg = order.quantityKg - accepted;
    const seafoodRefundXof = Math.round(rejectedQuantityKg * (order.seafoodAmountXof / order.quantityKg));
    incident.deliveredQuantityKg = delivered;
    incident.acceptedQuantityKg = accepted;
    incident.sellerAdjustmentXof = -seafoodRefundXof;
    incident.logisticsAdjustmentXof = -logisticsPenalty;
    incident.platformAdjustmentXof = -platformGoodwill;
    incident.buyerRefundXof = seafoodRefundXof + logisticsPenalty + platformGoodwill;
    incident.replacementLogisticsOrganizationId = input.replacementLogisticsOrganizationId;
    incident.assessmentNote = input.note;
    incident.assessedAt = input.at ?? new Date().toISOString();
    incident.status = "assessed";
    return structuredClone(incident);
  }

  resolve(input: { incidentId: string; note: string; at?: string }) {
    const incident = this.requireIncident(input.incidentId);
    if (incident.status !== "assessed") throw new Error("L'incident doit être évalué avant résolution.");
    if (!input.note.trim()) throw new Error("La note de résolution est obligatoire.");
    incident.status = "resolved";
    incident.resolutionNote = input.note;
    incident.resolvedAt = input.at ?? new Date().toISOString();
    return structuredClone(incident);
  }

  snapshot(execution: CommercialExecutionSnapshot): CommercialIncidentSnapshot {
    const incidents = [...this.incidents.values()];
    const totals = incidents.filter((item) => item.status !== "open").reduce((acc, item) => ({
      buyerRefundXof: acc.buyerRefundXof + item.buyerRefundXof,
      sellerAdjustmentXof: acc.sellerAdjustmentXof + item.sellerAdjustmentXof,
      logisticsAdjustmentXof: acc.logisticsAdjustmentXof + item.logisticsAdjustmentXof,
      platformAdjustmentXof: acc.platformAdjustmentXof + item.platformAdjustmentXof,
    }), { buyerRefundXof: 0, sellerAdjustmentXof: 0, logisticsAdjustmentXof: 0, platformAdjustmentXof: 0 });
    return {
      incidents: structuredClone(incidents),
      economics: {
        totalBuyerRefundXof: totals.buyerRefundXof,
        totalSellerAdjustmentXof: totals.sellerAdjustmentXof,
        totalLogisticsAdjustmentXof: totals.logisticsAdjustmentXof,
        totalPlatformAdjustmentXof: totals.platformAdjustmentXof,
        netPlatformRevenueXof: execution.economics.platformRevenueXof + totals.platformAdjustmentXof,
      },
    };
  }

  reset() { this.incidents.clear(); }

  private requireIncident(id: string) {
    const incident = this.incidents.get(id);
    if (!incident) throw new Error("Incident commercial introuvable.");
    return incident;
  }
}

function requireOrder(execution: CommercialExecutionSnapshot, orderId: string) {
  const order = execution.orders.find((item) => item.id === orderId);
  if (!order) throw new Error("Commande introuvable.");
  return order;
}
