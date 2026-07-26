import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export type OfferAudience =
  | "fisher"
  | "cooperative"
  | "landing_site"
  | "buyer"
  | "processor"
  | "logistics"
  | "ministry"
  | "public_agency"
  | "development_partner"
  | "financial_institution"
  | "insurer";

export type BillingModel =
  | "free"
  | "subscription"
  | "usage_based"
  | "commission"
  | "license"
  | "sponsored_program"
  | "hybrid";

export type ChargeUnit =
  | "month"
  | "year"
  | "active_actor"
  | "landing"
  | "weighing"
  | "lot"
  | "service_execution"
  | "commitment"
  | "transaction_value"
  | "financing_case"
  | "insurance_case"
  | "territory"
  | "program"
  | "api_call";

export interface ProductOffer {
  id: EntityId;
  code: string;
  name: string;
  audience: OfferAudience[];
  billingModel: BillingModel;
  description: string;
  includedCapabilities: string[];
  excludedCapabilities: string[];
  currency: "XOF" | "EUR" | "USD";
  basePriceMinor: number;
  billingUnit?: ChargeUnit;
  minimumCommitmentMinor?: number;
  commissionRateBasisPoints?: number;
  active: boolean;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
}

export interface Subscription {
  id: EntityId;
  offerCode: string;
  customerActorId: EntityId;
  customerActorKind: MvpActorKind;
  organizationId?: EntityId;
  territoryId?: EntityId;
  status: "trial" | "active" | "past_due" | "suspended" | "cancelled" | "expired";
  startsAt: ISODateTime;
  renewsAt?: ISODateTime;
  endsAt?: ISODateTime;
  billingCycle: "monthly" | "yearly" | "one_time";
  quantity: number;
  metadata: Record<string, unknown>;
}

export interface UsageRecord {
  id: EntityId;
  subscriptionId?: EntityId;
  actorId?: EntityId;
  organizationId?: EntityId;
  territoryId?: EntityId;
  unit: ChargeUnit;
  quantity: number;
  referenceId?: EntityId;
  referenceType?: string;
  occurredAt: ISODateTime;
  attributes: Record<string, unknown>;
}

export interface RevenueShareRule {
  id: EntityId;
  code: string;
  appliesToOfferCodes: string[];
  appliesToUnits: ChargeUnit[];
  beneficiaryType:
    | "mbambulaan"
    | "cooperative"
    | "landing_site"
    | "service_provider"
    | "public_partner"
    | "program_sponsor";
  beneficiaryActorId?: EntityId;
  beneficiaryOrganizationId?: EntityId;
  percentageBasisPoints?: number;
  fixedAmountMinor?: number;
  priority: number;
  active: boolean;
}

export interface InvoiceLine {
  id: EntityId;
  description: string;
  offerCode?: string;
  usageRecordIds: EntityId[];
  quantity: number;
  unitPriceMinor: number;
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  revenueShareRuleIds: EntityId[];
}

export interface Invoice {
  id: EntityId;
  customerActorId: EntityId;
  customerActorKind: MvpActorKind;
  organizationId?: EntityId;
  currency: "XOF" | "EUR" | "USD";
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  issuedAt?: ISODateTime;
  dueAt?: ISODateTime;
  lines: InvoiceLine[];
  subtotalMinor: number;
  taxMinor: number;
  totalMinor: number;
  amountPaidMinor: number;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface PaymentAllocation {
  invoiceId: EntityId;
  amountMinor: number;
}

export interface PaymentReceipt {
  id: EntityId;
  payerActorId: EntityId;
  payerActorKind: MvpActorKind;
  currency: "XOF" | "EUR" | "USD";
  amountMinor: number;
  method: "cash" | "bank_transfer" | "mobile_money" | "card" | "wallet" | "offset";
  externalReference?: string;
  allocations: PaymentAllocation[];
  status: "pending" | "confirmed" | "failed" | "reversed";
  receivedAt: ISODateTime;
  confirmedAt?: ISODateTime;
}

export interface SettlementEntry {
  id: EntityId;
  sourceInvoiceId: EntityId;
  sourceInvoiceLineId: EntityId;
  beneficiaryType: RevenueShareRule["beneficiaryType"];
  beneficiaryActorId?: EntityId;
  beneficiaryOrganizationId?: EntityId;
  currency: "XOF" | "EUR" | "USD";
  amountMinor: number;
  status: "pending" | "ready" | "paid" | "cancelled";
  createdAt: ISODateTime;
  paidAt?: ISODateTime;
}

const offers: ProductOffer[] = [
  {
    id: "offer-fisher-essential",
    code: "fisher_essential",
    name: "Pêcheur Essentiel",
    audience: ["fisher"],
    billingModel: "free",
    description: "Accès aux parcours essentiels : profil, retour attendu, activité et preuves.",
    includedCapabilities: [
      "actor_profile",
      "expected_return",
      "activity_history",
      "document_wallet",
      "consent_management",
    ],
    excludedCapabilities: ["atlas_premium", "advanced_financing_tools"],
    currency: "XOF",
    basePriceMinor: 0,
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-cooperative-pro",
    code: "cooperative_pro",
    name: "Coopérative Pro",
    audience: ["cooperative"],
    billingModel: "hybrid",
    description: "Coordination des membres, retours, pesées, lots, services, incidents et preuves.",
    includedCapabilities: [
      "member_management",
      "landing_coordination",
      "weighing_validation",
      "lot_management",
      "service_coordination",
      "incident_management",
      "basic_reporting",
    ],
    excludedCapabilities: ["atlas_advanced_scenarios"],
    currency: "XOF",
    basePriceMinor: 15000000,
    billingUnit: "month",
    minimumCommitmentMinor: 180000000,
    commissionRateBasisPoints: 50,
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-landing-site-operations",
    code: "landing_site_operations",
    name: "Site de débarquement Opérations",
    audience: ["landing_site"],
    billingModel: "license",
    description: "Gestion des arrivées, pesées, tensions, capacité et traçabilité du site.",
    includedCapabilities: [
      "arrival_board",
      "weighing_operations",
      "service_capacity_coordination",
      "incident_management",
      "operational_metrics",
    ],
    excludedCapabilities: [],
    currency: "XOF",
    basePriceMinor: 50000000,
    billingUnit: "year",
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-buyer-network",
    code: "buyer_network",
    name: "Acheteur Réseau",
    audience: ["buyer", "processor"],
    billingModel: "hybrid",
    description: "Accès aux lots, engagements, coordination logistique et suivi de réception.",
    includedCapabilities: [
      "lot_discovery",
      "commercial_commitments",
      "delivery_coordination",
      "reception_tracking",
      "dispute_management",
    ],
    excludedCapabilities: ["public_command_center"],
    currency: "XOF",
    basePriceMinor: 25000000,
    billingUnit: "month",
    commissionRateBasisPoints: 100,
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-logistics-provider",
    code: "logistics_provider",
    name: "Prestataire Logistique",
    audience: ["logistics"],
    billingModel: "commission",
    description: "Publication de capacité, réception de missions et preuve d'exécution.",
    includedCapabilities: [
      "capacity_publication",
      "service_allocations",
      "mission_execution",
      "delivery_proofs",
      "provider_performance",
    ],
    excludedCapabilities: [],
    currency: "XOF",
    basePriceMinor: 0,
    billingUnit: "service_execution",
    commissionRateBasisPoints: 300,
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-government-platform",
    code: "government_platform",
    name: "Plateforme Gouvernementale",
    audience: ["ministry", "public_agency"],
    billingModel: "license",
    description: "Pilotage territorial, supervision opérationnelle, qualité des données et décisions publiques.",
    includedCapabilities: [
      "government_command_center",
      "territorial_supervision",
      "incident_escalation",
      "data_quality_monitoring",
      "official_reporting",
      "atlas_standard",
    ],
    excludedCapabilities: ["atlas_unlimited_scenarios"],
    currency: "XOF",
    basePriceMinor: 2500000000,
    billingUnit: "year",
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-atlas-premium",
    code: "atlas_premium",
    name: "Atlas Premium",
    audience: ["ministry", "public_agency", "development_partner", "financial_institution", "insurer"],
    billingModel: "subscription",
    description: "Analyse causale, scénarios, signaux faibles, recommandations et briefings décisionnels.",
    includedCapabilities: [
      "advanced_signals",
      "scenario_simulation",
      "decision_briefings",
      "portfolio_monitoring",
      "custom_thresholds",
    ],
    excludedCapabilities: [],
    currency: "XOF",
    basePriceMinor: 100000000,
    billingUnit: "month",
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-development-program",
    code: "development_program",
    name: "Programme Partenaire",
    audience: ["development_partner"],
    billingModel: "sponsored_program",
    description: "Gestion des bénéficiaires, engagements, preuves et résultats d'un programme.",
    includedCapabilities: [
      "program_management",
      "beneficiary_validation",
      "commitment_tracking",
      "outcome_tracking",
      "impact_reporting",
    ],
    excludedCapabilities: [],
    currency: "XOF",
    basePriceMinor: 500000000,
    billingUnit: "program",
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "offer-finance-risk",
    code: "finance_risk",
    name: "Finance & Risque",
    audience: ["financial_institution", "insurer"],
    billingModel: "usage_based",
    description: "Accès consenti aux preuves d'activité et traitement des dossiers de financement ou assurance.",
    includedCapabilities: [
      "consented_activity_evidence",
      "case_assessment",
      "risk_signals",
      "decision_recording",
      "portfolio_monitoring",
    ],
    excludedCapabilities: ["raw_personal_data_export"],
    currency: "XOF",
    basePriceMinor: 2500000,
    billingUnit: "financing_case",
    active: true,
    validFrom: "2026-01-01T00:00:00.000Z",
  },
];

const defaultRevenueShareRules: RevenueShareRule[] = [
  {
    id: "share-mbambulaan-core",
    code: "mbambulaan_core",
    appliesToOfferCodes: offers.map((offer) => offer.code),
    appliesToUnits: [
      "month",
      "year",
      "active_actor",
      "landing",
      "weighing",
      "lot",
      "service_execution",
      "commitment",
      "transaction_value",
      "financing_case",
      "insurance_case",
      "territory",
      "program",
      "api_call",
    ],
    beneficiaryType: "mbambulaan",
    percentageBasisPoints: 10000,
    priority: 100,
    active: true,
  },
  {
    id: "share-cooperative-transaction",
    code: "cooperative_transaction_share",
    appliesToOfferCodes: ["buyer_network"],
    appliesToUnits: ["transaction_value", "commitment"],
    beneficiaryType: "cooperative",
    percentageBasisPoints: 1500,
    priority: 10,
    active: true,
  },
  {
    id: "share-landing-site-operations",
    code: "landing_site_operations_share",
    appliesToOfferCodes: ["buyer_network", "logistics_provider"],
    appliesToUnits: ["lot", "service_execution"],
    beneficiaryType: "landing_site",
    percentageBasisPoints: 500,
    priority: 20,
    active: true,
  },
  {
    id: "share-service-provider",
    code: "service_provider_share",
    appliesToOfferCodes: ["logistics_provider"],
    appliesToUnits: ["service_execution"],
    beneficiaryType: "service_provider",
    percentageBasisPoints: 9000,
    priority: 5,
    active: true,
  },
];

export class CommercialAndRevenueEngine {
  private readonly offers = new Map<string, ProductOffer>(offers.map((offer) => [offer.code, offer]));
  private readonly subscriptions = new Map<EntityId, Subscription>();
  private readonly usageRecords = new Map<EntityId, UsageRecord>();
  private readonly revenueShareRules = new Map<EntityId, RevenueShareRule>(
    defaultRevenueShareRules.map((rule) => [rule.id, rule]),
  );
  private readonly invoices = new Map<EntityId, Invoice>();
  private readonly payments = new Map<EntityId, PaymentReceipt>();
  private readonly settlements = new Map<EntityId, SettlementEntry>();

  activateSubscription(input: Subscription) {
    if (this.subscriptions.has(input.id)) throw new Error(`L'abonnement ${input.id} existe déjà.`);
    const offer = this.requireOffer(input.offerCode);
    if (!offer.active) throw new Error(`L'offre ${offer.code} n'est pas active.`);
    if (!offer.audience.includes(input.customerActorKind as OfferAudience)) {
      throw new Error(`L'offre ${offer.code} ne cible pas ${input.customerActorKind}.`);
    }
    if (input.quantity <= 0) throw new Error("La quantité d'abonnement doit être positive.");
    this.subscriptions.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  recordUsage(input: UsageRecord) {
    if (this.usageRecords.has(input.id)) throw new Error(`L'usage ${input.id} existe déjà.`);
    if (input.quantity <= 0) throw new Error("La quantité d'usage doit être positive.");
    if (input.subscriptionId) this.requireSubscription(input.subscriptionId);
    this.usageRecords.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  createRevenueShareRule(rule: RevenueShareRule) {
    if (this.revenueShareRules.has(rule.id)) throw new Error(`La règle ${rule.id} existe déjà.`);
    if (!rule.percentageBasisPoints && !rule.fixedAmountMinor) {
      throw new Error("Une règle de partage doit définir un pourcentage ou un montant fixe.");
    }
    this.revenueShareRules.set(rule.id, structuredClone(rule));
    return structuredClone(rule);
  }

  generateInvoice(input: {
    id: EntityId;
    customerActorId: EntityId;
    customerActorKind: MvpActorKind;
    organizationId?: EntityId;
    currency: Invoice["currency"];
    periodStart: ISODateTime;
    periodEnd: ISODateTime;
    createdAt: ISODateTime;
    usageRecordIds: EntityId[];
    subscriptionIds: EntityId[];
    taxRateBasisPoints?: number;
  }) {
    if (this.invoices.has(input.id)) throw new Error(`La facture ${input.id} existe déjà.`);
    const lines: InvoiceLine[] = [];
    let lineCounter = 0;

    for (const subscriptionId of input.subscriptionIds) {
      const subscription = this.requireSubscription(subscriptionId);
      if (subscription.customerActorId !== input.customerActorId) continue;
      const offer = this.requireOffer(subscription.offerCode);
      if (offer.currency !== input.currency) {
        throw new Error(`La devise de l'offre ${offer.code} ne correspond pas à la facture.`);
      }
      if (offer.billingModel === "free") continue;

      const quantity = subscription.quantity;
      const subtotalMinor = offer.basePriceMinor * quantity;
      const taxMinor = this.computeTax(subtotalMinor, input.taxRateBasisPoints ?? 0);
      lines.push({
        id: `${input.id}:line:${++lineCounter}`,
        description: `${offer.name} - ${subscription.billingCycle}`,
        offerCode: offer.code,
        usageRecordIds: [],
        quantity,
        unitPriceMinor: offer.basePriceMinor,
        subtotalMinor,
        taxMinor,
        totalMinor: subtotalMinor + taxMinor,
        revenueShareRuleIds: this.findApplicableRevenueShareRules(offer.code, offer.billingUnit ?? "month").map(
          (rule) => rule.id,
        ),
      });
    }

    for (const usageRecordId of input.usageRecordIds) {
      const usage = this.requireUsage(usageRecordId);
      const subscription = usage.subscriptionId ? this.requireSubscription(usage.subscriptionId) : undefined;
      const offer = subscription ? this.requireOffer(subscription.offerCode) : undefined;
      if (!offer || offer.billingModel === "free" || offer.currency !== input.currency) continue;

      let unitPriceMinor = offer.basePriceMinor;
      if (offer.billingModel === "commission" || offer.billingModel === "hybrid") {
        const transactionValue = Number(usage.attributes.transactionValueMinor ?? 0);
        if (transactionValue > 0 && offer.commissionRateBasisPoints) {
          unitPriceMinor = Math.round((transactionValue * offer.commissionRateBasisPoints) / 10000);
        }
      }

      const subtotalMinor = unitPriceMinor * usage.quantity;
      const taxMinor = this.computeTax(subtotalMinor, input.taxRateBasisPoints ?? 0);
      lines.push({
        id: `${input.id}:line:${++lineCounter}`,
        description: `${offer.name} - usage ${usage.unit}`,
        offerCode: offer.code,
        usageRecordIds: [usage.id],
        quantity: usage.quantity,
        unitPriceMinor,
        subtotalMinor,
        taxMinor,
        totalMinor: subtotalMinor + taxMinor,
        revenueShareRuleIds: this.findApplicableRevenueShareRules(offer.code, usage.unit).map((rule) => rule.id),
      });
    }

    const subtotalMinor = lines.reduce((sum, line) => sum + line.subtotalMinor, 0);
    const taxMinor = lines.reduce((sum, line) => sum + line.taxMinor, 0);
    const invoice: Invoice = {
      id: input.id,
      customerActorId: input.customerActorId,
      customerActorKind: input.customerActorKind,
      organizationId: input.organizationId,
      currency: input.currency,
      status: "draft",
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      lines,
      subtotalMinor,
      taxMinor,
      totalMinor: subtotalMinor + taxMinor,
      amountPaidMinor: 0,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.invoices.set(invoice.id, invoice);
    this.createSettlementEntries(invoice);
    return structuredClone(invoice);
  }

  issueInvoice(input: { invoiceId: EntityId; issuedAt: ISODateTime; dueAt: ISODateTime }) {
    const invoice = this.requireInvoice(input.invoiceId);
    if (invoice.status !== "draft") throw new Error("Seule une facture brouillon peut être émise.");
    invoice.status = "issued";
    invoice.issuedAt = input.issuedAt;
    invoice.dueAt = input.dueAt;
    invoice.updatedAt = input.issuedAt;
    this.invoices.set(invoice.id, invoice);
    return structuredClone(invoice);
  }

  registerPayment(input: PaymentReceipt) {
    if (this.payments.has(input.id)) throw new Error(`Le paiement ${input.id} existe déjà.`);
    if (input.amountMinor <= 0) throw new Error("Le montant doit être positif.");
    const allocated = input.allocations.reduce((sum, item) => sum + item.amountMinor, 0);
    if (allocated !== input.amountMinor) throw new Error("Le total alloué doit correspondre au paiement.");
    for (const allocation of input.allocations) this.requireInvoice(allocation.invoiceId);
    this.payments.set(input.id, structuredClone(input));
    if (input.status === "confirmed") this.applyPayment(input);
    return structuredClone(input);
  }

  confirmPayment(paymentId: EntityId, confirmedAt: ISODateTime) {
    const payment = this.requirePayment(paymentId);
    if (payment.status !== "pending") throw new Error("Seul un paiement en attente peut être confirmé.");
    payment.status = "confirmed";
    payment.confirmedAt = confirmedAt;
    this.payments.set(payment.id, payment);
    this.applyPayment(payment);
    return structuredClone(payment);
  }

  markOverdue(at: ISODateTime) {
    const updated: Invoice[] = [];
    for (const invoice of this.invoices.values()) {
      if (invoice.status === "issued" || invoice.status === "partially_paid") {
        if (invoice.dueAt && invoice.dueAt < at && invoice.amountPaidMinor < invoice.totalMinor) {
          invoice.status = "overdue";
          invoice.updatedAt = at;
          this.invoices.set(invoice.id, invoice);
          updated.push(structuredClone(invoice));
        }
      }
    }
    return updated;
  }

  markSettlementPaid(settlementId: EntityId, paidAt: ISODateTime) {
    const settlement = this.requireSettlement(settlementId);
    if (!['pending', 'ready'].includes(settlement.status)) {
      throw new Error("Ce règlement ne peut plus être marqué comme payé.");
    }
    settlement.status = "paid";
    settlement.paidAt = paidAt;
    this.settlements.set(settlement.id, settlement);
    return structuredClone(settlement);
  }

  getOfferCatalog() {
    return [...this.offers.values()].map((offer) => structuredClone(offer));
  }

  getCustomerRevenueSnapshot(customerActorId: EntityId) {
    const invoices = [...this.invoices.values()].filter((invoice) => invoice.customerActorId === customerActorId);
    const subscriptions = [...this.subscriptions.values()].filter(
      (subscription) => subscription.customerActorId === customerActorId,
    );
    return {
      customerActorId,
      subscriptions: subscriptions.map((item) => structuredClone(item)),
      invoiceCount: invoices.length,
      totalBilledByCurrency: this.groupAmountByCurrency(invoices, (item) => item.totalMinor),
      totalPaidByCurrency: this.groupAmountByCurrency(invoices, (item) => item.amountPaidMinor),
      openBalanceByCurrency: this.groupAmountByCurrency(invoices, (item) => item.totalMinor - item.amountPaidMinor),
    };
  }

  getRevenueSnapshot() {
    const invoices = [...this.invoices.values()];
    return {
      activeSubscriptions: [...this.subscriptions.values()].filter((item) => item.status === "active").length,
      invoicesByStatus: this.groupCount(invoices.map((invoice) => invoice.status)),
      billedByCurrency: this.groupAmountByCurrency(invoices, (item) => item.totalMinor),
      collectedByCurrency: this.groupAmountByCurrency(invoices, (item) => item.amountPaidMinor),
      settlementPayableByCurrency: this.groupAmountByCurrency(
        [...this.settlements.values()].filter((item) => item.status === "ready" || item.status === "pending"),
        (item) => item.amountMinor,
      ),
      offerCount: this.offers.size,
      usageRecordCount: this.usageRecords.size,
    };
  }

  snapshot() {
    return {
      offers: this.getOfferCatalog(),
      subscriptions: [...this.subscriptions.values()].map((item) => structuredClone(item)),
      usageRecords: [...this.usageRecords.values()].map((item) => structuredClone(item)),
      revenueShareRules: [...this.revenueShareRules.values()].map((item) => structuredClone(item)),
      invoices: [...this.invoices.values()].map((item) => structuredClone(item)),
      payments: [...this.payments.values()].map((item) => structuredClone(item)),
      settlements: [...this.settlements.values()].map((item) => structuredClone(item)),
    };
  }

  private createSettlementEntries(invoice: Invoice) {
    for (const line of invoice.lines) {
      const applicable = line.revenueShareRuleIds
        .map((ruleId) => this.requireRevenueShareRule(ruleId))
        .sort((a, b) => a.priority - b.priority);
      let allocatedMinor = 0;
      for (const rule of applicable) {
        if (rule.beneficiaryType === "mbambulaan") continue;
        const amountMinor = rule.fixedAmountMinor ?? Math.round((line.subtotalMinor * (rule.percentageBasisPoints ?? 0)) / 10000);
        if (amountMinor <= 0) continue;
        allocatedMinor += amountMinor;
        const settlement: SettlementEntry = {
          id: `${invoice.id}:${line.id}:${rule.id}`,
          sourceInvoiceId: invoice.id,
          sourceInvoiceLineId: line.id,
          beneficiaryType: rule.beneficiaryType,
          beneficiaryActorId: rule.beneficiaryActorId,
          beneficiaryOrganizationId: rule.beneficiaryOrganizationId,
          currency: invoice.currency,
          amountMinor,
          status: "pending",
          createdAt: invoice.createdAt,
        };
        this.settlements.set(settlement.id, settlement);
      }

      const mbambulaanAmountMinor = Math.max(0, line.subtotalMinor - allocatedMinor);
      const mbambulaanSettlement: SettlementEntry = {
        id: `${invoice.id}:${line.id}:mbambulaan`,
        sourceInvoiceId: invoice.id,
        sourceInvoiceLineId: line.id,
        beneficiaryType: "mbambulaan",
        currency: invoice.currency,
        amountMinor: mbambulaanAmountMinor,
        status: "pending",
        createdAt: invoice.createdAt,
      };
      this.settlements.set(mbambulaanSettlement.id, mbambulaanSettlement);
    }
  }

  private applyPayment(payment: PaymentReceipt) {
    for (const allocation of payment.allocations) {
      const invoice = this.requireInvoice(allocation.invoiceId);
      if (invoice.currency !== payment.currency) throw new Error("La devise du paiement ne correspond pas à la facture.");
      invoice.amountPaidMinor += allocation.amountMinor;
      invoice.updatedAt = payment.confirmedAt ?? payment.receivedAt;
      if (invoice.amountPaidMinor >= invoice.totalMinor) invoice.status = "paid";
      else if (invoice.amountPaidMinor > 0) invoice.status = "partially_paid";
      this.invoices.set(invoice.id, invoice);

      if (invoice.status === "paid") {
        for (const settlement of this.settlements.values()) {
          if (settlement.sourceInvoiceId === invoice.id && settlement.status === "pending") {
            settlement.status = "ready";
            this.settlements.set(settlement.id, settlement);
          }
        }
      }
    }
  }

  private findApplicableRevenueShareRules(offerCode: string, unit: ChargeUnit) {
    return [...this.revenueShareRules.values()].filter(
      (rule) => rule.active && rule.appliesToOfferCodes.includes(offerCode) && rule.appliesToUnits.includes(unit),
    );
  }

  private computeTax(amountMinor: number, rateBasisPoints: number) {
    return Math.round((amountMinor * rateBasisPoints) / 10000);
  }

  private groupCount(values: string[]) {
    return values.reduce<Record<string, number>>((result, value) => {
      result[value] = (result[value] ?? 0) + 1;
      return result;
    }, {});
  }

  private groupAmountByCurrency<T extends { currency: Invoice["currency"] }>(items: T[], selector: (item: T) => number) {
    return items.reduce<Record<string, number>>((result, item) => {
      result[item.currency] = (result[item.currency] ?? 0) + selector(item);
      return result;
    }, {});
  }

  private requireOffer(code: string) {
    const offer = this.offers.get(code);
    if (!offer) throw new Error(`Offre introuvable : ${code}.`);
    return offer;
  }

  private requireSubscription(id: EntityId) {
    const subscription = this.subscriptions.get(id);
    if (!subscription) throw new Error(`Abonnement introuvable : ${id}.`);
    return subscription;
  }

  private requireUsage(id: EntityId) {
    const usage = this.usageRecords.get(id);
    if (!usage) throw new Error(`Usage introuvable : ${id}.`);
    return usage;
  }

  private requireInvoice(id: EntityId) {
    const invoice = this.invoices.get(id);
    if (!invoice) throw new Error(`Facture introuvable : ${id}.`);
    return invoice;
  }

  private requirePayment(id: EntityId) {
    const payment = this.payments.get(id);
    if (!payment) throw new Error(`Paiement introuvable : ${id}.`);
    return payment;
  }

  private requireRevenueShareRule(id: EntityId) {
    const rule = this.revenueShareRules.get(id);
    if (!rule) throw new Error(`Règle de partage introuvable : ${id}.`);
    return rule;
  }

  private requireSettlement(id: EntityId) {
    const settlement = this.settlements.get(id);
    if (!settlement) throw new Error(`Règlement introuvable : ${id}.`);
    return settlement;
  }
}

export function getCommercialOfferCatalog() {
  return structuredClone(offers);
}

export function validateCommercialAndRevenueCatalog() {
  const errors: string[] = [];
  const codes = new Set<string>();
  for (const offer of offers) {
    if (codes.has(offer.code)) errors.push(`Code d'offre dupliqué : ${offer.code}.`);
    codes.add(offer.code);
    if (offer.audience.length === 0) errors.push(`${offer.code}: aucune audience.`);
    if (offer.includedCapabilities.length === 0) errors.push(`${offer.code}: aucune capability incluse.`);
    if (offer.basePriceMinor < 0) errors.push(`${offer.code}: prix négatif.`);
    if ((offer.billingModel === "commission" || offer.billingModel === "hybrid") && !offer.commissionRateBasisPoints) {
      errors.push(`${offer.code}: taux de commission manquant.`);
    }
  }
  for (const rule of defaultRevenueShareRules) {
    if (!rule.percentageBasisPoints && !rule.fixedAmountMinor) errors.push(`${rule.code}: partage sans valeur.`);
  }
  return {
    valid: errors.length === 0,
    errors,
    summary: {
      offerCount: offers.length,
      billingModels: [...new Set(offers.map((offer) => offer.billingModel))],
      audiences: [...new Set(offers.flatMap((offer) => offer.audience))],
      revenueShareRuleCount: defaultRevenueShareRules.length,
    },
  };
}
