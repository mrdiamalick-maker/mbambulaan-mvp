import type { EntityId, ISODateTime } from "./types";

export type FinancialAccountType = "wallet" | "settlement" | "escrow" | "cooperative_fund" | "reserve";
export type TransactionType = "payment" | "advance" | "refund" | "fee" | "contribution" | "payout" | "insurance_premium" | "claim_payment";
export type TransactionStatus = "draft" | "authorized" | "pending" | "settled" | "failed" | "cancelled" | "reversed";
export type FinancingStatus = "requested" | "under_review" | "approved" | "funded" | "repaid" | "defaulted" | "rejected" | "cancelled";
export type RiskBand = "very_low" | "low" | "moderate" | "high" | "very_high";

export interface FinancialAccount {
  id: EntityId;
  ownerActorId?: EntityId;
  ownerOrganizationId?: EntityId;
  type: FinancialAccountType;
  currency: "XOF";
  balanceXof: number;
  availableBalanceXof: number;
  status: "active" | "suspended" | "closed";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FinancialTransaction {
  id: EntityId;
  type: TransactionType;
  sourceAccountId?: EntityId;
  destinationAccountId?: EntityId;
  amountXof: number;
  currency: "XOF";
  status: TransactionStatus;
  referenceType?: string;
  referenceId?: EntityId;
  description?: string;
  initiatedByActorId: EntityId;
  initiatedAt: ISODateTime;
  authorizedAt?: ISODateTime;
  settledAt?: ISODateTime;
  failureReason?: string;
  metadata: Record<string, unknown>;
}

export interface FinancingRequest {
  id: EntityId;
  applicantActorId?: EntityId;
  applicantOrganizationId?: EntityId;
  cooperativeId?: EntityId;
  purpose: "campaign" | "fuel" | "ice" | "equipment" | "maintenance" | "working_capital" | "insurance";
  amountRequestedXof: number;
  amountApprovedXof?: number;
  expectedRepaymentAt?: ISODateTime;
  linkedRevenueSharePercent?: number;
  status: FinancingStatus;
  submittedAt: ISODateTime;
  decidedAt?: ISODateTime;
  fundedAt?: ISODateTime;
  closedAt?: ISODateTime;
  riskAssessmentId?: EntityId;
  notes: string[];
}

export interface FinancialRiskAssessment {
  id: EntityId;
  subjectActorId?: EntityId;
  subjectOrganizationId?: EntityId;
  assessedAt: ISODateTime;
  transactionHistoryScore: number;
  deliveryReliabilityScore: number;
  repaymentHistoryScore: number;
  revenueStabilityScore: number;
  dataQualityScore: number;
  overallScore: number;
  riskBand: RiskBand;
  reasons: string[];
  recommendedMaximumExposureXof: number;
}

export interface InsurancePolicy {
  id: EntityId;
  holderActorId?: EntityId;
  holderOrganizationId?: EntityId;
  productCode: string;
  insuredRisks: string[];
  coverageAmountXof: number;
  premiumAmountXof: number;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  status: "quoted" | "active" | "expired" | "cancelled" | "claimed";
  providerOrganizationId?: EntityId;
}

export interface InsuranceClaim {
  id: EntityId;
  policyId: EntityId;
  claimantActorId?: EntityId;
  claimantOrganizationId?: EntityId;
  eventType: string;
  eventAt: ISODateTime;
  declaredLossXof: number;
  approvedAmountXof?: number;
  status: "submitted" | "under_review" | "approved" | "rejected" | "paid";
  evidenceIds: EntityId[];
  submittedAt: ISODateTime;
  decidedAt?: ISODateTime;
  paidAt?: ISODateTime;
}

export interface SettlementInstruction {
  id: EntityId;
  referenceType: string;
  referenceId: EntityId;
  grossAmountXof: number;
  platformFeeXof: number;
  cooperativeShareXof: number;
  serviceProviderShareXof: number;
  sellerNetAmountXof: number;
  beneficiaryAccountIds: EntityId[];
  status: "prepared" | "authorized" | "executed" | "failed";
  createdAt: ISODateTime;
  executedAt?: ISODateTime;
}

export class FinancialServicesEngine {
  private readonly accounts = new Map<EntityId, FinancialAccount>();
  private readonly transactions = new Map<EntityId, FinancialTransaction>();
  private readonly financings = new Map<EntityId, FinancingRequest>();
  private readonly assessments = new Map<EntityId, FinancialRiskAssessment>();
  private readonly policies = new Map<EntityId, InsurancePolicy>();
  private readonly claims = new Map<EntityId, InsuranceClaim>();
  private readonly settlements = new Map<EntityId, SettlementInstruction>();

  openAccount(input: FinancialAccount) {
    if (this.accounts.has(input.id)) throw new Error(`Le compte financier ${input.id} existe déjà.`);
    if (input.balanceXof < 0 || input.availableBalanceXof < 0) throw new Error("Le solde ne peut pas être négatif.");
    if (input.availableBalanceXof > input.balanceXof) throw new Error("Le solde disponible ne peut pas dépasser le solde comptable.");
    this.accounts.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  initiateTransaction(input: FinancialTransaction) {
    if (this.transactions.has(input.id)) return structuredClone(this.transactions.get(input.id)!);
    if (input.amountXof <= 0) throw new Error("Le montant doit être positif.");
    if (!input.sourceAccountId && !input.destinationAccountId) throw new Error("La transaction doit avoir une source ou une destination.");
    if (input.sourceAccountId) this.requireAccount(input.sourceAccountId);
    if (input.destinationAccountId) this.requireAccount(input.destinationAccountId);
    const transaction = { ...structuredClone(input), status: "draft" as TransactionStatus };
    this.transactions.set(transaction.id, transaction);
    return structuredClone(transaction);
  }

  authorizeTransaction(input: { transactionId: EntityId; authorizedAt: ISODateTime }) {
    const transaction = this.requireTransaction(input.transactionId);
    if (transaction.status !== "draft") throw new Error("Seule une transaction en brouillon peut être autorisée.");
    if (transaction.sourceAccountId) {
      const source = this.requireAccount(transaction.sourceAccountId);
      if (source.status !== "active") throw new Error("Le compte source n'est pas actif.");
      if (source.availableBalanceXof < transaction.amountXof) throw new Error("Solde disponible insuffisant.");
      source.availableBalanceXof -= transaction.amountXof;
      source.updatedAt = input.authorizedAt;
      this.accounts.set(source.id, source);
    }
    transaction.status = "authorized";
    transaction.authorizedAt = input.authorizedAt;
    this.transactions.set(transaction.id, transaction);
    return structuredClone(transaction);
  }

  settleTransaction(input: { transactionId: EntityId; settledAt: ISODateTime }) {
    const transaction = this.requireTransaction(input.transactionId);
    if (!['authorized', 'pending'].includes(transaction.status)) throw new Error("La transaction doit être autorisée avant règlement.");
    if (transaction.sourceAccountId) {
      const source = this.requireAccount(transaction.sourceAccountId);
      source.balanceXof -= transaction.amountXof;
      source.updatedAt = input.settledAt;
      this.accounts.set(source.id, source);
    }
    if (transaction.destinationAccountId) {
      const destination = this.requireAccount(transaction.destinationAccountId);
      destination.balanceXof += transaction.amountXof;
      destination.availableBalanceXof += transaction.amountXof;
      destination.updatedAt = input.settledAt;
      this.accounts.set(destination.id, destination);
    }
    transaction.status = "settled";
    transaction.settledAt = input.settledAt;
    this.transactions.set(transaction.id, transaction);
    return structuredClone(transaction);
  }

  requestFinancing(input: FinancingRequest) {
    if (this.financings.has(input.id)) throw new Error(`La demande de financement ${input.id} existe déjà.`);
    if (input.amountRequestedXof <= 0) throw new Error("Le montant demandé doit être positif.");
    const request = { ...structuredClone(input), status: "requested" as FinancingStatus };
    this.financings.set(request.id, request);
    return structuredClone(request);
  }

  assessRisk(input: Omit<FinancialRiskAssessment, "overallScore" | "riskBand">) {
    const weightedScore = Math.round(
      input.transactionHistoryScore * 0.2 +
      input.deliveryReliabilityScore * 0.2 +
      input.repaymentHistoryScore * 0.3 +
      input.revenueStabilityScore * 0.2 +
      input.dataQualityScore * 0.1,
    );
    const riskBand: RiskBand = weightedScore >= 85 ? "very_low" : weightedScore >= 70 ? "low" : weightedScore >= 55 ? "moderate" : weightedScore >= 35 ? "high" : "very_high";
    const assessment: FinancialRiskAssessment = { ...structuredClone(input), overallScore: weightedScore, riskBand };
    this.assessments.set(assessment.id, assessment);
    return structuredClone(assessment);
  }

  decideFinancing(input: { financingId: EntityId; riskAssessmentId: EntityId; approvedAmountXof: number; decidedAt: ISODateTime }) {
    const financing = this.requireFinancing(input.financingId);
    const assessment = this.requireAssessment(input.riskAssessmentId);
    if (!['requested', 'under_review'].includes(financing.status)) throw new Error("La demande ne peut plus être décidée.");
    if (input.approvedAmountXof <= 0 || input.approvedAmountXof > financing.amountRequestedXof) throw new Error("Le montant approuvé est invalide.");
    if (input.approvedAmountXof > assessment.recommendedMaximumExposureXof) throw new Error("Le montant dépasse l'exposition recommandée.");
    financing.amountApprovedXof = input.approvedAmountXof;
    financing.riskAssessmentId = assessment.id;
    financing.status = "approved";
    financing.decidedAt = input.decidedAt;
    this.financings.set(financing.id, financing);
    return structuredClone(financing);
  }

  fundFinancing(input: { financingId: EntityId; sourceAccountId: EntityId; destinationAccountId: EntityId; transactionId: EntityId; fundedAt: ISODateTime; actorId: EntityId }) {
    const financing = this.requireFinancing(input.financingId);
    if (financing.status !== "approved" || !financing.amountApprovedXof) throw new Error("Le financement doit être approuvé avant décaissement.");
    this.initiateTransaction({
      id: input.transactionId,
      type: "advance",
      sourceAccountId: input.sourceAccountId,
      destinationAccountId: input.destinationAccountId,
      amountXof: financing.amountApprovedXof,
      currency: "XOF",
      status: "draft",
      referenceType: "financing",
      referenceId: financing.id,
      initiatedByActorId: input.actorId,
      initiatedAt: input.fundedAt,
      metadata: {},
    });
    this.authorizeTransaction({ transactionId: input.transactionId, authorizedAt: input.fundedAt });
    this.settleTransaction({ transactionId: input.transactionId, settledAt: input.fundedAt });
    financing.status = "funded";
    financing.fundedAt = input.fundedAt;
    this.financings.set(financing.id, financing);
    return structuredClone(financing);
  }

  issuePolicy(input: InsurancePolicy) {
    if (this.policies.has(input.id)) throw new Error(`La police ${input.id} existe déjà.`);
    if (input.coverageAmountXof <= 0 || input.premiumAmountXof <= 0) throw new Error("Les montants de couverture et de prime doivent être positifs.");
    if (input.endsAt <= input.startsAt) throw new Error("La période de couverture est invalide.");
    this.policies.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  submitClaim(input: InsuranceClaim) {
    if (this.claims.has(input.id)) throw new Error(`Le sinistre ${input.id} existe déjà.`);
    const policy = this.requirePolicy(input.policyId);
    if (policy.status !== "active") throw new Error("La police n'est pas active.");
    if (input.declaredLossXof <= 0) throw new Error("La perte déclarée doit être positive.");
    const claim = { ...structuredClone(input), status: "submitted" as const };
    this.claims.set(claim.id, claim);
    policy.status = "claimed";
    this.policies.set(policy.id, policy);
    return structuredClone(claim);
  }

  prepareSettlement(input: SettlementInstruction) {
    if (this.settlements.has(input.id)) throw new Error(`Le règlement ${input.id} existe déjà.`);
    const distributed = input.platformFeeXof + input.cooperativeShareXof + input.serviceProviderShareXof + input.sellerNetAmountXof;
    if (distributed !== input.grossAmountXof) throw new Error("La répartition ne correspond pas au montant brut.");
    const settlement = { ...structuredClone(input), status: "prepared" as const };
    this.settlements.set(settlement.id, settlement);
    return structuredClone(settlement);
  }

  getActorFinancialProfile(actorId: EntityId) {
    const accounts = [...this.accounts.values()].filter((item) => item.ownerActorId === actorId);
    const accountIds = new Set(accounts.map((item) => item.id));
    const transactions = [...this.transactions.values()].filter((item) =>
      (item.sourceAccountId && accountIds.has(item.sourceAccountId)) ||
      (item.destinationAccountId && accountIds.has(item.destinationAccountId)),
    );
    const financings = [...this.financings.values()].filter((item) => item.applicantActorId === actorId);
    const policies = [...this.policies.values()].filter((item) => item.holderActorId === actorId);
    return {
      actorId,
      totalBalanceXof: accounts.reduce((sum, item) => sum + item.balanceXof, 0),
      availableBalanceXof: accounts.reduce((sum, item) => sum + item.availableBalanceXof, 0),
      settledInflowXof: transactions.filter((item) => item.status === "settled" && item.destinationAccountId && accountIds.has(item.destinationAccountId)).reduce((sum, item) => sum + item.amountXof, 0),
      settledOutflowXof: transactions.filter((item) => item.status === "settled" && item.sourceAccountId && accountIds.has(item.sourceAccountId)).reduce((sum, item) => sum + item.amountXof, 0),
      activeFinancingExposureXof: financings.filter((item) => ['approved', 'funded'].includes(item.status)).reduce((sum, item) => sum + (item.amountApprovedXof ?? 0), 0),
      activePolicyCount: policies.filter((item) => item.status === "active").length,
      accounts: accounts.map((item) => structuredClone(item)),
    };
  }

  snapshot() {
    return {
      accounts: [...this.accounts.values()].map((item) => structuredClone(item)),
      transactions: [...this.transactions.values()].map((item) => structuredClone(item)),
      financings: [...this.financings.values()].map((item) => structuredClone(item)),
      assessments: [...this.assessments.values()].map((item) => structuredClone(item)),
      policies: [...this.policies.values()].map((item) => structuredClone(item)),
      claims: [...this.claims.values()].map((item) => structuredClone(item)),
      settlements: [...this.settlements.values()].map((item) => structuredClone(item)),
    };
  }

  private requireAccount(id: EntityId) {
    const item = this.accounts.get(id);
    if (!item) throw new Error(`Compte introuvable : ${id}.`);
    return item;
  }

  private requireTransaction(id: EntityId) {
    const item = this.transactions.get(id);
    if (!item) throw new Error(`Transaction introuvable : ${id}.`);
    return item;
  }

  private requireFinancing(id: EntityId) {
    const item = this.financings.get(id);
    if (!item) throw new Error(`Financement introuvable : ${id}.`);
    return item;
  }

  private requireAssessment(id: EntityId) {
    const item = this.assessments.get(id);
    if (!item) throw new Error(`Évaluation de risque introuvable : ${id}.`);
    return item;
  }

  private requirePolicy(id: EntityId) {
    const item = this.policies.get(id);
    if (!item) throw new Error(`Police d'assurance introuvable : ${id}.`);
    return item;
  }
}
