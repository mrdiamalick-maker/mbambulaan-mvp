import type { EntityId, ISODateTime } from "../infrastructures/types";

export type ContractType =
  | "commercial"
  | "public_service"
  | "framework"
  | "subscription"
  | "service_provider"
  | "cooperative"
  | "financing"
  | "insurance"
  | "data_service";

export type ContractStatus =
  | "draft"
  | "negotiating"
  | "approved"
  | "active"
  | "at_risk"
  | "suspended"
  | "expired"
  | "terminated"
  | "closed";

export interface ContractParty {
  actorId: EntityId;
  organizationId?: EntityId;
  role: "customer" | "provider" | "payer" | "beneficiary" | "authority" | "guarantor" | "partner";
  signatoryIdentityId?: EntityId;
  paymentResponsibilityPercent?: number;
}

export interface ContractObligation {
  id: EntityId;
  partyActorId: EntityId;
  obligationType:
    | "deliver_service"
    | "provide_capacity"
    | "pay"
    | "report"
    | "maintain_compliance"
    | "share_data"
    | "support_beneficiaries"
    | "maintain_availability"
    | "respond_to_incident"
    | "other";
  description: string;
  capabilityId?: EntityId;
  territoryIds: EntityId[];
  dueAt?: ISODateTime;
  recurring: boolean;
  recurrenceCode?: string;
  measurable: boolean;
  targetValue?: number;
  unit?: string;
  status: "planned" | "due" | "in_progress" | "fulfilled" | "partially_fulfilled" | "breached" | "waived" | "cancelled";
  evidenceIds: EntityId[];
}

export interface ServiceLevelAgreement {
  id: EntityId;
  obligationId: EntityId;
  metricCode: string;
  metricLabel: string;
  targetValue: number;
  warningThreshold: number;
  breachThreshold: number;
  evaluationMode: "minimum" | "maximum" | "exact";
  unit: string;
  measurementFrequency: "real_time" | "daily" | "weekly" | "monthly" | "quarterly" | "annual" | "on_event";
  gracePeriodHours: number;
  serviceCreditPercent?: number;
  fixedPenaltyXof?: number;
  maximumPenaltyXof?: number;
  status: "active" | "inactive";
}

export interface ServiceLevelMeasurement {
  id: EntityId;
  slaId: EntityId;
  obligationId: EntityId;
  measuredValue: number;
  measuredAt: ISODateTime;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  status: "met" | "warning" | "breached";
  evidenceIds: EntityId[];
  sourceReferenceIds: EntityId[];
}

export interface ContractFinancialTerm {
  id: EntityId;
  termType: "fixed_fee" | "subscription" | "usage_fee" | "commission" | "milestone_payment" | "grant" | "bonus";
  payerActorId: EntityId;
  beneficiaryActorId: EntityId;
  amountXof?: number;
  ratePercent?: number;
  billingFrequency?: "one_time" | "monthly" | "quarterly" | "annual" | "on_event";
  paymentDueDays: number;
  linkedObligationIds: EntityId[];
  status: "active" | "inactive";
}

export interface ContractInvoice {
  id: EntityId;
  financialTermId: EntityId;
  payerActorId: EntityId;
  beneficiaryActorId: EntityId;
  amountXof: number;
  issuedAt: ISODateTime;
  dueAt: ISODateTime;
  paidAmountXof: number;
  paidAt?: ISODateTime;
  status: "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled";
  sourceReferenceIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface ContractPenalty {
  id: EntityId;
  slaId?: EntityId;
  obligationId: EntityId;
  liableActorId: EntityId;
  beneficiaryActorId: EntityId;
  penaltyType: "service_credit" | "fixed_penalty" | "payment_withholding" | "bonus_reduction";
  amountXof: number;
  reason: string;
  status: "calculated" | "approved" | "applied" | "waived" | "disputed";
  evidenceIds: EntityId[];
  calculatedAt: ISODateTime;
}

export interface ContractDispute {
  id: EntityId;
  raisedByActorId: EntityId;
  againstActorId: EntityId;
  relatedObligationIds: EntityId[];
  relatedInvoiceIds: EntityId[];
  relatedPenaltyIds: EntityId[];
  subject: string;
  description: string;
  amountInDisputeXof: number;
  status: "open" | "under_review" | "mediation" | "resolved" | "rejected" | "withdrawn";
  resolution?: string;
  evidenceIds: EntityId[];
  openedAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface ContractRenewalAssessment {
  id: EntityId;
  assessedAt: ISODateTime;
  performanceScore: number;
  commercialScore: number;
  strategicValueScore: number;
  complianceScore: number;
  recommendation: "renew" | "renew_with_conditions" | "renegotiate" | "do_not_renew";
  conditions: string[];
  evidenceIds: EntityId[];
}

export interface ContractCase {
  id: EntityId;
  contractCode: string;
  contractType: ContractType;
  title: string;
  status: ContractStatus;
  countryId: EntityId;
  territoryIds: EntityId[];
  capabilityIds: EntityId[];
  parties: ContractParty[];
  obligations: ContractObligation[];
  serviceLevels: ServiceLevelAgreement[];
  measurements: ServiceLevelMeasurement[];
  financialTerms: ContractFinancialTerm[];
  invoices: ContractInvoice[];
  penalties: ContractPenalty[];
  disputes: ContractDispute[];
  renewalAssessments: ContractRenewalAssessment[];
  effectiveAt?: ISODateTime;
  expiresAt?: ISODateTime;
  terminatedAt?: ISODateTime;
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export class EndToEndContractObligationServiceLevelCapability {
  private readonly cases = new Map<EntityId, ContractCase>();

  openContract(input: {
    id: EntityId;
    contractCode: string;
    contractType: ContractType;
    title: string;
    countryId: EntityId;
    territoryIds: EntityId[];
    capabilityIds: EntityId[];
    createdAt: ISODateTime;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le contrat ${input.id} existe déjà.`);
    const item: ContractCase = {
      ...structuredClone(input),
      status: "draft",
      parties: [],
      obligations: [],
      serviceLevels: [],
      measurements: [],
      financialTerms: [],
      invoices: [],
      penalties: [],
      disputes: [],
      renewalAssessments: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  addParty(input: { caseId: EntityId; party: ContractParty; addedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.parties.some((entry) => entry.actorId === input.party.actorId && entry.role === input.party.role)) throw new Error("Cette partie est déjà enregistrée avec ce rôle.");
    item.parties.push(structuredClone(input.party));
    item.status = "negotiating";
    this.touch(item, input.addedAt);
    return structuredClone(item);
  }

  addObligation(input: { caseId: EntityId; obligation: ContractObligation; addedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (!item.parties.some((entry) => entry.actorId === input.obligation.partyActorId)) throw new Error("La partie responsable de l'obligation n'est pas enregistrée.");
    if (item.obligations.some((entry) => entry.id === input.obligation.id)) throw new Error(`L'obligation ${input.obligation.id} existe déjà.`);
    item.obligations.push(structuredClone(input.obligation));
    this.touch(item, input.addedAt);
    return structuredClone(item);
  }

  addServiceLevel(input: { caseId: EntityId; sla: ServiceLevelAgreement; addedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const obligation = this.requireObligation(item, input.sla.obligationId);
    if (!obligation.measurable) throw new Error("Un SLA nécessite une obligation mesurable.");
    if (item.serviceLevels.some((entry) => entry.id === input.sla.id)) throw new Error(`Le SLA ${input.sla.id} existe déjà.`);
    item.serviceLevels.push(structuredClone(input.sla));
    this.touch(item, input.addedAt);
    return structuredClone(item);
  }

  addFinancialTerm(input: { caseId: EntityId; term: ContractFinancialTerm; addedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (!item.parties.some((entry) => entry.actorId === input.term.payerActorId)) throw new Error("Le payeur n'est pas une partie du contrat.");
    if (!item.parties.some((entry) => entry.actorId === input.term.beneficiaryActorId)) throw new Error("Le bénéficiaire n'est pas une partie du contrat.");
    for (const obligationId of input.term.linkedObligationIds) this.requireObligation(item, obligationId);
    item.financialTerms.push(structuredClone(input.term));
    this.touch(item, input.addedAt);
    return structuredClone(item);
  }

  attachDocument(input: { caseId: EntityId; documentId: EntityId; attachedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    item.documentIds = this.unique([...item.documentIds, input.documentId]);
    this.touch(item, input.attachedAt);
    return structuredClone(item);
  }

  approveContract(input: { caseId: EntityId; approvedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    if (!item.parties.some((entry) => entry.role === "customer" || entry.role === "authority")) blockers.push("Aucun client ou autorité contractante.");
    if (!item.parties.some((entry) => entry.role === "provider")) blockers.push("Aucun fournisseur contractuel.");
    if (!item.obligations.length) blockers.push("Aucune obligation contractuelle.");
    if (!item.financialTerms.length) blockers.push("Aucune condition financière.");
    if (!item.documentIds.length) blockers.push("Aucun document contractuel signé.");
    item.blockers = blockers;
    if (blockers.length) throw new Error(`Le contrat ne peut pas être approuvé : ${blockers.join("; ")}`);
    item.status = "approved";
    this.touch(item, input.approvedAt);
    return structuredClone(item);
  }

  activateContract(input: { caseId: EntityId; effectiveAt: ISODateTime; expiresAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.status !== "approved") throw new Error("Le contrat doit être approuvé avant activation.");
    if (input.expiresAt <= input.effectiveAt) throw new Error("La période contractuelle est invalide.");
    item.status = "active";
    item.effectiveAt = input.effectiveAt;
    item.expiresAt = input.expiresAt;
    this.touch(item, input.effectiveAt);
    return structuredClone(item);
  }

  recordMeasurement(input: { caseId: EntityId; measurement: Omit<ServiceLevelMeasurement, "status"> }) {
    const item = this.requireCase(input.caseId);
    const sla = this.requireSla(item, input.measurement.slaId);
    const status = this.evaluateSla(sla, input.measurement.measuredValue);
    const measurement: ServiceLevelMeasurement = { ...structuredClone(input.measurement), status };
    item.measurements.push(measurement);
    const obligation = this.requireObligation(item, input.measurement.obligationId);
    obligation.evidenceIds = this.unique([...obligation.evidenceIds, ...input.measurement.evidenceIds]);
    if (status === "breached") {
      obligation.status = "breached";
      item.status = "at_risk";
    } else if (status === "warning" && obligation.status === "planned") {
      obligation.status = "in_progress";
    } else if (status === "met") {
      obligation.status = "fulfilled";
    }
    this.touch(item, input.measurement.measuredAt);
    return structuredClone(measurement);
  }

  calculatePenalty(input: { caseId: EntityId; penaltyId: EntityId; measurementId: EntityId; beneficiaryActorId: EntityId; calculatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const measurement = this.requireMeasurement(item, input.measurementId);
    if (measurement.status !== "breached") throw new Error("Une pénalité ne peut être calculée que sur un SLA en rupture.");
    const sla = this.requireSla(item, measurement.slaId);
    const obligation = this.requireObligation(item, measurement.obligationId);
    let amountXof = sla.fixedPenaltyXof ?? 0;
    if (sla.serviceCreditPercent) {
      const linkedTerms = item.financialTerms.filter((term) => term.linkedObligationIds.includes(obligation.id));
      const base = linkedTerms.reduce((sum, term) => sum + (term.amountXof ?? 0), 0);
      amountXof += Math.round(base * sla.serviceCreditPercent / 100);
    }
    if (sla.maximumPenaltyXof !== undefined) amountXof = Math.min(amountXof, sla.maximumPenaltyXof);
    const penalty: ContractPenalty = {
      id: input.penaltyId,
      slaId: sla.id,
      obligationId: obligation.id,
      liableActorId: obligation.partyActorId,
      beneficiaryActorId: input.beneficiaryActorId,
      penaltyType: sla.fixedPenaltyXof ? "fixed_penalty" : "service_credit",
      amountXof,
      reason: `Rupture du SLA ${sla.metricCode}`,
      status: "calculated",
      evidenceIds: [...measurement.evidenceIds],
      calculatedAt: input.calculatedAt,
    };
    item.penalties.push(penalty);
    this.touch(item, input.calculatedAt);
    return structuredClone(penalty);
  }

  issueInvoice(input: { caseId: EntityId; invoice: ContractInvoice }) {
    const item = this.requireCase(input.caseId);
    this.requireFinancialTerm(item, input.invoice.financialTermId);
    if (input.invoice.amountXof <= 0) throw new Error("Le montant de facture doit être positif.");
    item.invoices.push(structuredClone(input.invoice));
    this.touch(item, input.invoice.issuedAt);
    return structuredClone(item);
  }

  recordPayment(input: { caseId: EntityId; invoiceId: EntityId; amountXof: number; paidAt: ISODateTime; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    const invoice = this.requireInvoice(item, input.invoiceId);
    if (input.amountXof <= 0) throw new Error("Le paiement doit être positif.");
    if (invoice.paidAmountXof + input.amountXof > invoice.amountXof) throw new Error("Le paiement dépasse le montant facturé.");
    invoice.paidAmountXof += input.amountXof;
    invoice.paidAt = input.paidAt;
    invoice.evidenceIds = this.unique([...invoice.evidenceIds, ...input.evidenceIds]);
    invoice.status = invoice.paidAmountXof >= invoice.amountXof ? "paid" : "partially_paid";
    this.touch(item, input.paidAt);
    return structuredClone(invoice);
  }

  openDispute(input: { caseId: EntityId; dispute: ContractDispute }) {
    const item = this.requireCase(input.caseId);
    if (input.dispute.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour ouvrir un litige.");
    item.disputes.push(structuredClone(input.dispute));
    item.status = "at_risk";
    this.touch(item, input.dispute.openedAt);
    return structuredClone(item);
  }

  resolveDispute(input: { caseId: EntityId; disputeId: EntityId; resolution: string; resolvedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const dispute = this.requireDispute(item, input.disputeId);
    dispute.status = "resolved";
    dispute.resolution = input.resolution;
    dispute.resolvedAt = input.resolvedAt;
    if (!item.disputes.some((entry) => entry.status === "open" || entry.status === "under_review" || entry.status === "mediation")) {
      item.status = item.obligations.some((entry) => entry.status === "breached") ? "at_risk" : "active";
    }
    this.touch(item, input.resolvedAt);
    return structuredClone(dispute);
  }

  assessRenewal(input: { caseId: EntityId; assessment: ContractRenewalAssessment }) {
    const item = this.requireCase(input.caseId);
    if (input.assessment.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour évaluer le renouvellement.");
    item.renewalAssessments.push(structuredClone(input.assessment));
    this.touch(item, input.assessment.assessedAt);
    return structuredClone(input.assessment);
  }

  getContractCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    for (const invoice of item.invoices) {
      if (!["paid", "cancelled"].includes(invoice.status) && invoice.dueAt < input.generatedAt) invoice.status = "overdue";
    }
    const met = item.measurements.filter((entry) => entry.status === "met").length;
    const measured = item.measurements.length;
    const invoiced = item.invoices.filter((entry) => entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amountXof, 0);
    const collected = item.invoices.reduce((sum, entry) => sum + entry.paidAmountXof, 0);
    return {
      caseId: item.id,
      contractCode: item.contractCode,
      status: item.status,
      obligationCount: item.obligations.length,
      fulfilledObligationCount: item.obligations.filter((entry) => entry.status === "fulfilled").length,
      breachedObligationCount: item.obligations.filter((entry) => entry.status === "breached").length,
      slaCompliancePercent: measured ? this.round(met / measured * 100) : 100,
      activeDisputeCount: item.disputes.filter((entry) => !["resolved", "rejected", "withdrawn"].includes(entry.status)).length,
      calculatedPenaltyXof: item.penalties.filter((entry) => entry.status !== "waived").reduce((sum, entry) => sum + entry.amountXof, 0),
      invoicedAmountXof: invoiced,
      collectedAmountXof: collected,
      collectionRatePercent: invoiced ? this.round(collected / invoiced * 100) : 100,
      overdueInvoiceCount: item.invoices.filter((entry) => entry.status === "overdue").length,
      latestRenewalRecommendation: item.renewalAssessments.at(-1)?.recommendation,
      blockers: [...item.blockers],
      warnings: [...item.warnings],
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private evaluateSla(sla: ServiceLevelAgreement, value: number): ServiceLevelMeasurement["status"] {
    if (sla.evaluationMode === "minimum") {
      if (value < sla.breachThreshold) return "breached";
      if (value < sla.warningThreshold) return "warning";
      return "met";
    }
    if (sla.evaluationMode === "maximum") {
      if (value > sla.breachThreshold) return "breached";
      if (value > sla.warningThreshold) return "warning";
      return "met";
    }
    if (value === sla.targetValue) return "met";
    const distance = Math.abs(value - sla.targetValue);
    return distance >= Math.abs(sla.breachThreshold - sla.targetValue) ? "breached" : "warning";
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Contrat introuvable : ${id}.`);
    return item;
  }

  private requireObligation(item: ContractCase, id: EntityId) {
    const value = item.obligations.find((entry) => entry.id === id);
    if (!value) throw new Error(`Obligation introuvable : ${id}.`);
    return value;
  }

  private requireSla(item: ContractCase, id: EntityId) {
    const value = item.serviceLevels.find((entry) => entry.id === id);
    if (!value) throw new Error(`SLA introuvable : ${id}.`);
    return value;
  }

  private requireMeasurement(item: ContractCase, id: EntityId) {
    const value = item.measurements.find((entry) => entry.id === id);
    if (!value) throw new Error(`Mesure SLA introuvable : ${id}.`);
    return value;
  }

  private requireFinancialTerm(item: ContractCase, id: EntityId) {
    const value = item.financialTerms.find((entry) => entry.id === id);
    if (!value) throw new Error(`Condition financière introuvable : ${id}.`);
    return value;
  }

  private requireInvoice(item: ContractCase, id: EntityId) {
    const value = item.invoices.find((entry) => entry.id === id);
    if (!value) throw new Error(`Facture introuvable : ${id}.`);
    return value;
  }

  private requireDispute(item: ContractCase, id: EntityId) {
    const value = item.disputes.find((entry) => entry.id === id);
    if (!value) throw new Error(`Litige introuvable : ${id}.`);
    return value;
  }

  private touch(item: ContractCase, updatedAt: ISODateTime) {
    item.updatedAt = updatedAt;
    this.cases.set(item.id, item);
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
