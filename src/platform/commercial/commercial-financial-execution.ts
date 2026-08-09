export type CommercialFlowStatus =
  | "offer_published"
  | "ordered"
  | "allocated"
  | "in_transit"
  | "delivered"
  | "payment_requested"
  | "paid"
  | "reconciled"
  | "disputed"
  | "resolved";

export interface CommercialOffer {
  id: string;
  sellerOrganizationId: string;
  territoryId: string;
  speciesCode: string;
  qualityGrade: string;
  availableQuantityKg: number;
  unitPriceXof: number;
  status: "available" | "reserved" | "sold_out";
  publishedAt: string;
}

export interface CommercialOrder {
  id: string;
  offerId: string;
  buyerOrganizationId: string;
  sellerOrganizationId: string;
  territoryId: string;
  quantityKg: number;
  seafoodAmountXof: number;
  logisticsAmountXof: number;
  platformCommissionRateBps: number;
  platformCommissionXof: number;
  buyerTotalXof: number;
  sellerNetXof: number;
  logisticsNetXof: number;
  status: CommercialFlowStatus;
  createdAt: string;
  deliveredAt?: string;
  reconciledAt?: string;
  deliveryProofId?: string;
  paymentId?: string;
}

export interface CommercialPayment {
  id: string;
  orderId: string;
  payerOrganizationId: string;
  amountXof: number;
  provider: "mobile_money_simulator";
  status: "requested" | "confirmed";
  providerReference?: string;
  requestedAt: string;
  confirmedAt?: string;
}

export interface CommercialLedgerEntry {
  id: string;
  orderId: string;
  beneficiaryType: "seller" | "logistics" | "platform";
  beneficiaryId: string;
  amountXof: number;
  status: "payable" | "settled";
  settledAt?: string;
}

export interface CommercialDispute {
  id: string;
  orderId: string;
  openedByOrganizationId: string;
  reason: string;
  status: "open" | "resolved";
  openedAt: string;
  resolution?: string;
  resolvedAt?: string;
}

export interface CommercialExecutionSnapshot {
  offers: CommercialOffer[];
  orders: CommercialOrder[];
  payments: CommercialPayment[];
  ledger: CommercialLedgerEntry[];
  disputes: CommercialDispute[];
  economics: {
    grossMerchandiseValueXof: number;
    logisticsRevenueXof: number;
    platformRevenueXof: number;
    sellerRevenueXof: number;
    confirmedPaymentsXof: number;
  };
}

class CommercialIds {
  private sequence = 0;
  next(prefix: string) {
    this.sequence += 1;
    return `${prefix}-${String(this.sequence).padStart(4, "0")}`;
  }
  reset() { this.sequence = 0; }
}

export class CommercialFinancialExecution {
  private readonly ids = new CommercialIds();
  private readonly offers = new Map<string, CommercialOffer>();
  private readonly orders = new Map<string, CommercialOrder>();
  private readonly payments = new Map<string, CommercialPayment>();
  private readonly ledger = new Map<string, CommercialLedgerEntry>();
  private readonly disputes = new Map<string, CommercialDispute>();

  publishOffer(input: {
    id?: string;
    sellerOrganizationId: string;
    territoryId: string;
    speciesCode: string;
    qualityGrade: string;
    availableQuantityKg: number;
    unitPriceXof: number;
    at?: string;
  }) {
    if (input.availableQuantityKg <= 0) throw new Error("La quantité disponible doit être positive.");
    if (input.unitPriceXof <= 0) throw new Error("Le prix unitaire doit être positif.");
    const offer: CommercialOffer = {
      id: input.id ?? this.ids.next("offer"),
      sellerOrganizationId: input.sellerOrganizationId,
      territoryId: input.territoryId,
      speciesCode: input.speciesCode,
      qualityGrade: input.qualityGrade,
      availableQuantityKg: input.availableQuantityKg,
      unitPriceXof: input.unitPriceXof,
      status: "available",
      publishedAt: input.at ?? new Date().toISOString(),
    };
    this.offers.set(offer.id, offer);
    return structuredClone(offer);
  }

  placeOrder(input: {
    id?: string;
    offerId: string;
    buyerOrganizationId: string;
    quantityKg: number;
    logisticsAmountXof: number;
    platformCommissionRateBps?: number;
    at?: string;
  }) {
    const offer = this.requireOffer(input.offerId);
    if (offer.status !== "available") throw new Error("L'offre n'est plus disponible.");
    if (input.quantityKg <= 0 || input.quantityKg > offer.availableQuantityKg) throw new Error("La quantité commandée est invalide.");
    if (input.logisticsAmountXof < 0) throw new Error("Le coût logistique ne peut pas être négatif.");
    const rate = input.platformCommissionRateBps ?? 250;
    if (rate < 0 || rate > 10_000) throw new Error("Le taux de commission est invalide.");
    const seafoodAmountXof = Math.round(input.quantityKg * offer.unitPriceXof);
    const platformCommissionXof = Math.round(seafoodAmountXof * rate / 10_000);
    const buyerTotalXof = seafoodAmountXof + input.logisticsAmountXof + platformCommissionXof;
    const order: CommercialOrder = {
      id: input.id ?? this.ids.next("order"),
      offerId: offer.id,
      buyerOrganizationId: input.buyerOrganizationId,
      sellerOrganizationId: offer.sellerOrganizationId,
      territoryId: offer.territoryId,
      quantityKg: input.quantityKg,
      seafoodAmountXof,
      logisticsAmountXof: input.logisticsAmountXof,
      platformCommissionRateBps: rate,
      platformCommissionXof,
      buyerTotalXof,
      sellerNetXof: seafoodAmountXof,
      logisticsNetXof: input.logisticsAmountXof,
      status: "ordered",
      createdAt: input.at ?? new Date().toISOString(),
    };
    offer.availableQuantityKg -= input.quantityKg;
    offer.status = offer.availableQuantityKg === 0 ? "sold_out" : "reserved";
    this.orders.set(order.id, order);
    return structuredClone(order);
  }

  allocateOrder(orderId: string) {
    const order = this.requireOrder(orderId);
    this.assertStatus(order, ["ordered"]);
    order.status = "allocated";
    return structuredClone(order);
  }

  startTransport(orderId: string) {
    const order = this.requireOrder(orderId);
    this.assertStatus(order, ["allocated"]);
    order.status = "in_transit";
    return structuredClone(order);
  }

  confirmDelivery(input: { orderId: string; proofId: string; at?: string }) {
    const order = this.requireOrder(input.orderId);
    this.assertStatus(order, ["in_transit"]);
    if (!input.proofId.trim()) throw new Error("La preuve de livraison est obligatoire.");
    order.status = "delivered";
    order.deliveryProofId = input.proofId;
    order.deliveredAt = input.at ?? new Date().toISOString();
    return structuredClone(order);
  }

  requestPayment(input: { orderId: string; payerOrganizationId?: string; at?: string }) {
    const order = this.requireOrder(input.orderId);
    this.assertStatus(order, ["delivered"]);
    const payment: CommercialPayment = {
      id: this.ids.next("payment"),
      orderId: order.id,
      payerOrganizationId: input.payerOrganizationId ?? order.buyerOrganizationId,
      amountXof: order.buyerTotalXof,
      provider: "mobile_money_simulator",
      status: "requested",
      requestedAt: input.at ?? new Date().toISOString(),
    };
    order.status = "payment_requested";
    order.paymentId = payment.id;
    this.payments.set(payment.id, payment);
    return structuredClone(payment);
  }

  confirmPayment(input: { paymentId: string; providerReference?: string; at?: string }) {
    const payment = this.payments.get(input.paymentId);
    if (!payment) throw new Error("Paiement introuvable.");
    if (payment.status === "confirmed") return structuredClone(payment);
    const order = this.requireOrder(payment.orderId);
    this.assertStatus(order, ["payment_requested"]);
    payment.status = "confirmed";
    payment.providerReference = input.providerReference ?? `MM-SIM-${payment.id.toUpperCase()}`;
    payment.confirmedAt = input.at ?? new Date().toISOString();
    order.status = "paid";
    this.createPayables(order);
    return structuredClone(payment);
  }

  reconcileOrder(input: { orderId: string; at?: string }) {
    const order = this.requireOrder(input.orderId);
    this.assertStatus(order, ["paid"]);
    const entries = [...this.ledger.values()].filter((entry) => entry.orderId === order.id);
    if (entries.length !== 3) throw new Error("Les écritures de répartition sont incomplètes.");
    const distributed = entries.reduce((sum, entry) => sum + entry.amountXof, 0);
    if (distributed !== order.buyerTotalXof) throw new Error("La répartition ne correspond pas au montant payé.");
    const at = input.at ?? new Date().toISOString();
    for (const entry of entries) {
      entry.status = "settled";
      entry.settledAt = at;
    }
    order.status = "reconciled";
    order.reconciledAt = at;
    return { order: structuredClone(order), entries: structuredClone(entries) };
  }

  openDispute(input: { orderId: string; openedByOrganizationId: string; reason: string; at?: string }) {
    const order = this.requireOrder(input.orderId);
    if (!["delivered", "payment_requested", "paid", "reconciled"].includes(order.status)) throw new Error("Un litige ne peut pas être ouvert à ce stade.");
    if (!input.reason.trim()) throw new Error("Le motif du litige est obligatoire.");
    const dispute: CommercialDispute = {
      id: this.ids.next("dispute"),
      orderId: order.id,
      openedByOrganizationId: input.openedByOrganizationId,
      reason: input.reason,
      status: "open",
      openedAt: input.at ?? new Date().toISOString(),
    };
    order.status = "disputed";
    this.disputes.set(dispute.id, dispute);
    return structuredClone(dispute);
  }

  resolveDispute(input: { disputeId: string; resolution: string; at?: string }) {
    const dispute = this.disputes.get(input.disputeId);
    if (!dispute) throw new Error("Litige introuvable.");
    if (dispute.status === "resolved") return structuredClone(dispute);
    if (!input.resolution.trim()) throw new Error("La résolution est obligatoire.");
    const order = this.requireOrder(dispute.orderId);
    dispute.status = "resolved";
    dispute.resolution = input.resolution;
    dispute.resolvedAt = input.at ?? new Date().toISOString();
    order.status = "resolved";
    return structuredClone(dispute);
  }

  runDemo(at = "2026-07-27T12:00:00.000Z") {
    this.reset();
    const offer = this.publishOffer({
      id: "offer-demo-thiof",
      sellerOrganizationId: "org-cooperative-dakar",
      territoryId: "territory-dakar",
      speciesCode: "thiof",
      qualityGrade: "A",
      availableQuantityKg: 2_400,
      unitPriceXof: 2_500,
      at,
    });
    const order = this.placeOrder({
      id: "order-demo-thiof",
      offerId: offer.id,
      buyerOrganizationId: "org-buyer-hotel-dakar",
      quantityKg: 2_400,
      logisticsAmountXof: 600_000,
      platformCommissionRateBps: 250,
      at,
    });
    this.allocateOrder(order.id);
    this.startTransport(order.id);
    this.confirmDelivery({ orderId: order.id, proofId: "proof-delivery-demo-001", at });
    const payment = this.requestPayment({ orderId: order.id, at });
    this.confirmPayment({ paymentId: payment.id, providerReference: "WAVE-SIM-000001", at });
    this.reconcileOrder({ orderId: order.id, at });
    return this.snapshot();
  }

  snapshot(): CommercialExecutionSnapshot {
    const orders = [...this.orders.values()];
    const confirmedPayments = [...this.payments.values()].filter((payment) => payment.status === "confirmed");
    return {
      offers: structuredClone([...this.offers.values()]),
      orders: structuredClone(orders),
      payments: structuredClone([...this.payments.values()]),
      ledger: structuredClone([...this.ledger.values()]),
      disputes: structuredClone([...this.disputes.values()]),
      economics: {
        grossMerchandiseValueXof: orders.reduce((sum, order) => sum + order.seafoodAmountXof, 0),
        logisticsRevenueXof: orders.reduce((sum, order) => sum + order.logisticsAmountXof, 0),
        platformRevenueXof: orders.reduce((sum, order) => sum + order.platformCommissionXof, 0),
        sellerRevenueXof: orders.reduce((sum, order) => sum + order.sellerNetXof, 0),
        confirmedPaymentsXof: confirmedPayments.reduce((sum, payment) => sum + payment.amountXof, 0),
      },
    };
  }

  reset() {
    this.offers.clear();
    this.orders.clear();
    this.payments.clear();
    this.ledger.clear();
    this.disputes.clear();
    this.ids.reset();
  }

  private createPayables(order: CommercialOrder) {
    const definitions: Array<Omit<CommercialLedgerEntry, "id">> = [
      { orderId: order.id, beneficiaryType: "seller", beneficiaryId: order.sellerOrganizationId, amountXof: order.sellerNetXof, status: "payable" },
      { orderId: order.id, beneficiaryType: "logistics", beneficiaryId: "org-cold-chain-dakar", amountXof: order.logisticsNetXof, status: "payable" },
      { orderId: order.id, beneficiaryType: "platform", beneficiaryId: "org-mbambulaan", amountXof: order.platformCommissionXof, status: "payable" },
    ];
    for (const definition of definitions) {
      const entry: CommercialLedgerEntry = { id: this.ids.next("ledger"), ...definition };
      this.ledger.set(entry.id, entry);
    }
  }

  private requireOffer(id: string) {
    const offer = this.offers.get(id);
    if (!offer) throw new Error("Offre introuvable.");
    return offer;
  }

  private requireOrder(id: string) {
    const order = this.orders.get(id);
    if (!order) throw new Error("Commande introuvable.");
    return order;
  }

  private assertStatus(order: CommercialOrder, allowed: CommercialFlowStatus[]) {
    if (!allowed.includes(order.status)) throw new Error(`Transition commerciale interdite depuis ${order.status}.`);
  }
}
