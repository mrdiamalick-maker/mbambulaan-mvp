import type { EntityId, ISODateTime } from "../infrastructures/types";

export type SaleDeliverySettlementStatus =
  | "draft"
  | "offer_published"
  | "matched"
  | "reserved"
  | "delivery_planned"
  | "in_transit"
  | "delivered"
  | "accepted"
  | "allocated"
  | "settled"
  | "closed"
  | "cancelled";

export interface SaleDeliverySettlementCase {
  id: EntityId;
  territoryId: EntityId;
  sellerEconomicActorId: EntityId;
  buyerEconomicActorId: EntityId;
  cooperativeId?: EntityId;
  offerId?: EntityId;
  demandId?: EntityId;
  matchId?: EntityId;
  reservationId?: EntityId;
  logisticsRequestId?: EntityId;
  logisticsMissionId?: EntityId;
  valueFlowId?: EntityId;
  revenueAllocationId?: EntityId;
  settlementReferenceIds: EntityId[];
  traceabilityLotIds: EntityId[];
  qualityInspectionIds: EntityId[];
  status: SaleDeliverySettlementStatus;
  speciesCode?: string;
  requestedQuantityKg: number;
  reservedQuantityKg: number;
  deliveredQuantityKg: number;
  acceptedQuantityKg: number;
  rejectedQuantityKg: number;
  unitPriceXof?: number;
  grossAmountXof: number;
  logisticsCostXof: number;
  qualityAdjustmentXof: number;
  platformRevenueXof: number;
  sellerNetAmountXof: number;
  deliveryWindowStart?: ISODateTime;
  deliveryWindowEnd?: ISODateTime;
  paymentDueAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  closedAt?: ISODateTime;
  blockers: string[];
  warnings: string[];
  events: Array<{
    id: EntityId;
    type: string;
    occurredAt: ISODateTime;
    actorId?: EntityId;
    details: Record<string, unknown>;
  }>;
}

export interface SaleReadinessAssessment {
  caseId: EntityId;
  score: number;
  ready: boolean;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export interface SaleSettlementSummary {
  caseId: EntityId;
  grossAmountXof: number;
  logisticsCostXof: number;
  qualityAdjustmentXof: number;
  platformRevenueXof: number;
  sellerNetAmountXof: number;
  rejectionRatePercent: number;
  deliveryPerformancePercent: number;
  paymentPerformancePercent: number;
  generatedAt: ISODateTime;
}

export class EndToEndSaleDeliverySettlementCapability {
  private readonly cases = new Map<EntityId, SaleDeliverySettlementCase>();

  openCase(input: Omit<SaleDeliverySettlementCase, "status" | "reservedQuantityKg" | "deliveredQuantityKg" | "acceptedQuantityKg" | "rejectedQuantityKg" | "grossAmountXof" | "logisticsCostXof" | "qualityAdjustmentXof" | "platformRevenueXof" | "sellerNetAmountXof" | "settlementReferenceIds" | "traceabilityLotIds" | "qualityInspectionIds" | "blockers" | "warnings" | "events" | "updatedAt">) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier de vente ${input.id} existe déjà.`);
    if (input.requestedQuantityKg <= 0) throw new Error("La quantité demandée doit être positive.");
    const item: SaleDeliverySettlementCase = {
      ...structuredClone(input),
      status: "draft",
      reservedQuantityKg: 0,
      deliveredQuantityKg: 0,
      acceptedQuantityKg: 0,
      rejectedQuantityKg: 0,
      grossAmountXof: 0,
      logisticsCostXof: 0,
      qualityAdjustmentXof: 0,
      platformRevenueXof: 0,
      sellerNetAmountXof: 0,
      settlementReferenceIds: [],
      traceabilityLotIds: [],
      qualityInspectionIds: [],
      blockers: [],
      warnings: [],
      events: [this.event(`event:${input.id}:opened`, "case_opened", input.createdAt, undefined, {})],
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  publishOffer(input: { caseId: EntityId; offerId: EntityId; speciesCode: string; unitPriceXof: number; publishedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["draft"]);
    if (input.unitPriceXof <= 0) throw new Error("Le prix unitaire doit être positif.");
    item.offerId = input.offerId;
    item.speciesCode = input.speciesCode;
    item.unitPriceXof = input.unitPriceXof;
    item.status = "offer_published";
    this.touch(item, input.publishedAt, this.event(`event:${item.id}:offer`, "offer_published", input.publishedAt, input.actorId, { offerId: input.offerId }));
    return structuredClone(item);
  }

  attachMatch(input: { caseId: EntityId; demandId: EntityId; matchId: EntityId; matchedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["offer_published"]);
    item.demandId = input.demandId;
    item.matchId = input.matchId;
    item.status = "matched";
    this.touch(item, input.matchedAt, this.event(`event:${item.id}:matched`, "sale_matched", input.matchedAt, input.actorId, { demandId: input.demandId, matchId: input.matchId }));
    return structuredClone(item);
  }

  reserveQuantity(input: { caseId: EntityId; reservationId: EntityId; quantityKg: number; reservedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["matched"]);
    if (input.quantityKg <= 0 || input.quantityKg > item.requestedQuantityKg) throw new Error("La quantité réservée est invalide.");
    item.reservationId = input.reservationId;
    item.reservedQuantityKg = input.quantityKg;
    item.status = "reserved";
    this.touch(item, input.reservedAt, this.event(`event:${item.id}:reserved`, "quantity_reserved", input.reservedAt, input.actorId, { quantityKg: input.quantityKg }));
    return structuredClone(item);
  }

  planDelivery(input: {
    caseId: EntityId;
    logisticsRequestId: EntityId;
    logisticsMissionId: EntityId;
    deliveryWindowStart: ISODateTime;
    deliveryWindowEnd: ISODateTime;
    logisticsCostXof: number;
    plannedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["reserved"]);
    if (input.deliveryWindowEnd <= input.deliveryWindowStart) throw new Error("La fenêtre de livraison est invalide.");
    if (input.logisticsCostXof < 0) throw new Error("Le coût logistique ne peut pas être négatif.");
    item.logisticsRequestId = input.logisticsRequestId;
    item.logisticsMissionId = input.logisticsMissionId;
    item.deliveryWindowStart = input.deliveryWindowStart;
    item.deliveryWindowEnd = input.deliveryWindowEnd;
    item.logisticsCostXof = input.logisticsCostXof;
    item.status = "delivery_planned";
    this.touch(item, input.plannedAt, this.event(`event:${item.id}:delivery-planned`, "delivery_planned", input.plannedAt, input.actorId, { logisticsMissionId: input.logisticsMissionId }));
    return structuredClone(item);
  }

  startTransit(input: { caseId: EntityId; startedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["delivery_planned"]);
    const readiness = this.assessReadiness({ caseId: item.id, generatedAt: input.startedAt });
    if (!readiness.ready) throw new Error(`La livraison ne peut pas démarrer : ${readiness.blockers.join("; ")}`);
    item.status = "in_transit";
    this.touch(item, input.startedAt, this.event(`event:${item.id}:transit`, "transit_started", input.startedAt, input.actorId, {}));
    return structuredClone(item);
  }

  recordDelivery(input: { caseId: EntityId; deliveredQuantityKg: number; deliveredAt: ISODateTime; traceabilityLotIds: EntityId[]; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["in_transit"]);
    if (input.deliveredQuantityKg <= 0 || input.deliveredQuantityKg > item.reservedQuantityKg) throw new Error("La quantité livrée est invalide.");
    item.deliveredQuantityKg = input.deliveredQuantityKg;
    item.traceabilityLotIds = [...new Set([...item.traceabilityLotIds, ...input.traceabilityLotIds])];
    item.status = "delivered";
    this.touch(item, input.deliveredAt, this.event(`event:${item.id}:delivered`, "delivery_recorded", input.deliveredAt, input.actorId, { deliveredQuantityKg: input.deliveredQuantityKg }));
    return structuredClone(item);
  }

  acceptDelivery(input: {
    caseId: EntityId;
    acceptedQuantityKg: number;
    rejectedQuantityKg: number;
    qualityInspectionIds: EntityId[];
    qualityAdjustmentXof?: number;
    acceptedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["delivered"]);
    if (input.acceptedQuantityKg < 0 || input.rejectedQuantityKg < 0) throw new Error("Les quantités ne peuvent pas être négatives.");
    if (input.acceptedQuantityKg + input.rejectedQuantityKg > item.deliveredQuantityKg) throw new Error("Les quantités acceptées et rejetées dépassent la quantité livrée.");
    item.acceptedQuantityKg = input.acceptedQuantityKg;
    item.rejectedQuantityKg = input.rejectedQuantityKg;
    item.qualityInspectionIds = [...new Set([...item.qualityInspectionIds, ...input.qualityInspectionIds])];
    item.qualityAdjustmentXof = input.qualityAdjustmentXof ?? 0;
    const gross = Math.round(input.acceptedQuantityKg * (item.unitPriceXof ?? 0));
    item.grossAmountXof = Math.max(0, gross + item.qualityAdjustmentXof);
    item.status = "accepted";
    this.touch(item, input.acceptedAt, this.event(`event:${item.id}:accepted`, "delivery_accepted", input.acceptedAt, input.actorId, {
      acceptedQuantityKg: input.acceptedQuantityKg,
      rejectedQuantityKg: input.rejectedQuantityKg,
      grossAmountXof: item.grossAmountXof,
    }));
    return structuredClone(item);
  }

  allocateRevenue(input: { caseId: EntityId; valueFlowId: EntityId; revenueAllocationId: EntityId; platformRevenueXof: number; sellerNetAmountXof: number; allocatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["accepted"]);
    if (input.platformRevenueXof < 0 || input.sellerNetAmountXof < 0) throw new Error("Les montants de répartition sont invalides.");
    if (input.platformRevenueXof + input.sellerNetAmountXof > item.grossAmountXof) throw new Error("La répartition dépasse le montant brut.");
    item.valueFlowId = input.valueFlowId;
    item.revenueAllocationId = input.revenueAllocationId;
    item.platformRevenueXof = input.platformRevenueXof;
    item.sellerNetAmountXof = input.sellerNetAmountXof;
    item.status = "allocated";
    this.touch(item, input.allocatedAt, this.event(`event:${item.id}:allocated`, "revenue_allocated", input.allocatedAt, input.actorId, { revenueAllocationId: input.revenueAllocationId }));
    return structuredClone(item);
  }

  settle(input: { caseId: EntityId; settlementReferenceIds: EntityId[]; paymentDueAt?: ISODateTime; settledAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["allocated"]);
    if (!input.settlementReferenceIds.length) throw new Error("Au moins une référence de règlement est requise.");
    item.settlementReferenceIds = [...new Set(input.settlementReferenceIds)];
    item.paymentDueAt = input.paymentDueAt;
    item.status = "settled";
    this.touch(item, input.settledAt, this.event(`event:${item.id}:settled`, "sale_settled", input.settledAt, input.actorId, { settlementReferenceIds: item.settlementReferenceIds }));
    return structuredClone(item);
  }

  close(input: { caseId: EntityId; closedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["settled"]);
    item.status = "closed";
    item.closedAt = input.closedAt;
    this.touch(item, input.closedAt, this.event(`event:${item.id}:closed`, "case_closed", input.closedAt, input.actorId, {}));
    return structuredClone(item);
  }

  cancel(input: { caseId: EntityId; cancelledAt: ISODateTime; reason: string; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (["settled", "closed", "cancelled"].includes(item.status)) throw new Error("Le dossier ne peut plus être annulé.");
    item.status = "cancelled";
    item.blockers.push(input.reason);
    this.touch(item, input.cancelledAt, this.event(`event:${item.id}:cancelled`, "case_cancelled", input.cancelledAt, input.actorId, { reason: input.reason }));
    return structuredClone(item);
  }

  assessReadiness(input: { caseId: EntityId; generatedAt: ISODateTime }): SaleReadinessAssessment {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    const warnings: string[] = [];
    if (!item.offerId) blockers.push("Offre commerciale absente.");
    if (!item.matchId) blockers.push("Matching commercial absent.");
    if (!item.reservationId || item.reservedQuantityKg <= 0) blockers.push("Quantité non réservée.");
    if (!item.logisticsMissionId) blockers.push("Mission logistique non planifiée.");
    if (!item.deliveryWindowStart || !item.deliveryWindowEnd) blockers.push("Fenêtre de livraison absente.");
    if (!item.speciesCode) warnings.push("Espèce non renseignée.");
    if (item.reservedQuantityKg < item.requestedQuantityKg) warnings.push("La réservation ne couvre pas toute la demande.");
    const maxPoints = 6;
    const earned = maxPoints - blockers.length;
    const score = Math.max(0, Math.round((earned / maxPoints) * 100));
    item.blockers = blockers;
    item.warnings = warnings;
    this.cases.set(item.id, item);
    return { caseId: item.id, score, ready: blockers.length === 0, blockers, warnings, generatedAt: input.generatedAt };
  }

  buildSettlementSummary(input: { caseId: EntityId; generatedAt: ISODateTime }): SaleSettlementSummary {
    const item = this.requireCase(input.caseId);
    const rejectionRatePercent = item.deliveredQuantityKg ? Math.round((item.rejectedQuantityKg / item.deliveredQuantityKg) * 10000) / 100 : 0;
    const deliveryPerformancePercent = item.reservedQuantityKg ? Math.round((item.deliveredQuantityKg / item.reservedQuantityKg) * 10000) / 100 : 0;
    const paymentPerformancePercent = item.status === "settled" || item.status === "closed" ? 100 : 0;
    return {
      caseId: item.id,
      grossAmountXof: item.grossAmountXof,
      logisticsCostXof: item.logisticsCostXof,
      qualityAdjustmentXof: item.qualityAdjustmentXof,
      platformRevenueXof: item.platformRevenueXof,
      sellerNetAmountXof: item.sellerNetAmountXof,
      rejectionRatePercent,
      deliveryPerformancePercent,
      paymentPerformancePercent,
      generatedAt: input.generatedAt,
    };
  }

  getTerritorySalesBoard(territoryId: EntityId) {
    const items = [...this.cases.values()].filter((item) => item.territoryId === territoryId);
    return {
      territoryId,
      openCases: items.filter((item) => !["closed", "cancelled"].includes(item.status)).map((item) => structuredClone(item)),
      closedCases: items.filter((item) => item.status === "closed").map((item) => structuredClone(item)),
      grossAmountXof: items.reduce((sum, item) => sum + item.grossAmountXof, 0),
      platformRevenueXof: items.reduce((sum, item) => sum + item.platformRevenueXof, 0),
      sellerNetAmountXof: items.reduce((sum, item) => sum + item.sellerNetAmountXof, 0),
      deliveredQuantityKg: items.reduce((sum, item) => sum + item.deliveredQuantityKg, 0),
      acceptedQuantityKg: items.reduce((sum, item) => sum + item.acceptedQuantityKg, 0),
      rejectedQuantityKg: items.reduce((sum, item) => sum + item.rejectedQuantityKg, 0),
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier de vente introuvable : ${id}.`);
    return item;
  }

  private requireStatus(item: SaleDeliverySettlementCase, allowed: SaleDeliverySettlementStatus[]) {
    if (!allowed.includes(item.status)) throw new Error(`Transition impossible depuis le statut ${item.status}.`);
  }

  private touch(item: SaleDeliverySettlementCase, updatedAt: ISODateTime, event: SaleDeliverySettlementCase["events"][number]) {
    item.updatedAt = updatedAt;
    item.events.push(event);
    this.cases.set(item.id, item);
  }

  private event(id: EntityId, type: string, occurredAt: ISODateTime, actorId: EntityId | undefined, details: Record<string, unknown>) {
    return { id, type, occurredAt, actorId, details };
  }
}
