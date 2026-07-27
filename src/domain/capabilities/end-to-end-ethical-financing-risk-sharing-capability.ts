import type { EntityId, ISODateTime } from "../infrastructures/types";

export type EthicalFinanceInstrumentType =
  | "qard_hasan"
  | "murabaha"
  | "mudaraba"
  | "musharaka"
  | "ijara"
  | "salam"
  | "istisna"
  | "wakala"
  | "grant"
  | "public_support"
  | "cooperative_advance";

export type RiskProtectionModel =
  | "takaful"
  | "mutual_guarantee_fund"
  | "cooperative_reserve"
  | "public_compensation_fund"
  | "self_protection_reserve"
  | "none";

export type EthicalComplianceStatus =
  | "pending_review"
  | "compliant"
  | "compliant_with_conditions"
  | "non_compliant"
  | "suspended";

export interface EthicalGuardrailPolicy {
  id: EntityId;
  policyCode: string;
  prohibitInterest: boolean;
  prohibitGuaranteedReturnWithoutRisk: boolean;
  prohibitExcessiveUncertainty: boolean;
  prohibitSpeculation: boolean;
  prohibitFinancingProhibitedActivities: boolean;
  requireAssetOrServiceLink: boolean;
  requireTransparentFees: boolean;
  requireSharedRiskForPartnerships: boolean;
  requireIndependentEthicalReview: boolean;
  approvedInstrumentTypes: EthicalFinanceInstrumentType[];
  approvedRiskProtectionModels: RiskProtectionModel[];
  reviewerActorIds: EntityId[];
  evidenceIds: EntityId[];
  status: "active" | "inactive";
  effectiveAt: ISODateTime;
}

export interface FinancingNeed {
  id: EntityId;
  applicantActorId: EntityId;
  territoryId: EntityId;
  purpose:
    | "campaign_working_capital"
    | "equipment_purchase"
    | "cold_storage"
    | "transport"
    | "processing"
    | "market_order_financing"
    | "emergency_support"
    | "training"
    | "digital_service"
    | "other";
  requestedAmountXof: number;
  requestedAt: ISODateTime;
  expectedEconomicValueXof: number;
  expectedRepaymentSource: string;
  linkedCampaignId?: EntityId;
  linkedContractId?: EntityId;
  linkedAssetId?: EntityId;
  linkedOrderId?: EntityId;
  vulnerabilityScore: number;
  evidenceIds: EntityId[];
  status: "submitted" | "qualified" | "rejected" | "matched" | "funded" | "closed";
}

export interface EthicalFinancingOffer {
  id: EntityId;
  financingNeedId: EntityId;
  providerActorId: EntityId;
  instrumentType: EthicalFinanceInstrumentType;
  principalAmountXof: number;
  acquisitionCostXof?: number;
  disclosedMarginXof?: number;
  profitSharingPercent?: number;
  lossSharingPercent?: number;
  leasePaymentXof?: number;
  advancePurchaseQuantity?: number;
  advancePurchaseUnit?: string;
  maturityAt?: ISODateTime;
  repaymentSchedule: Array<{ dueAt: ISODateTime; amountXof: number }>;
  collateralAssetIds: EntityId[];
  guaranteeFundIds: EntityId[];
  feeItems: Array<{ code: string; label: string; amountXof: number; refundable: boolean }>;
  prohibitedUseCodes: string[];
  assetOrServiceReferenceIds: EntityId[];
  conditions: string[];
  evidenceIds: EntityId[];
  complianceStatus: EthicalComplianceStatus;
  status: "draft" | "proposed" | "accepted" | "funded" | "active" | "completed" | "defaulted" | "cancelled";
}

export interface EthicalComplianceReview {
  id: EntityId;
  offerId: EntityId;
  reviewedByActorId: EntityId;
  reviewedAt: ISODateTime;
  status: EthicalComplianceStatus;
  findings: string[];
  requiredConditions: string[];
  evidenceIds: EntityId[];
}

export interface RiskProtectionArrangement {
  id: EntityId;
  financingOfferId?: EntityId;
  participantActorIds: EntityId[];
  model: RiskProtectionModel;
  operatorActorId: EntityId;
  contributionAmountXof: number;
  reserveBalanceXof: number;
  maximumSupportXof: number;
  coveredRiskCodes: string[];
  excludedRiskCodes: string[];
  surplusPolicy: "retain_in_pool" | "return_to_participants" | "reduce_future_contributions" | "social_fund";
  deficitPolicy: "additional_participant_contribution" | "qard_hasan_facility" | "public_backstop" | "proportional_reduction";
  evidenceIds: EntityId[];
  status: "proposed" | "active" | "suspended" | "closed";
  effectiveAt: ISODateTime;
  expiresAt?: ISODateTime;
}

export interface FinancingDisbursement {
  id: EntityId;
  offerId: EntityId;
  amountXof: number;
  disbursedToActorId: EntityId;
  assetOrSupplierActorId?: EntityId;
  disbursedAt: ISODateTime;
  purposeReferenceIds: EntityId[];
  evidenceIds: EntityId[];
  status: "planned" | "released" | "reversed";
}

export interface FinancingSettlement {
  id: EntityId;
  offerId: EntityId;
  settlementType: "repayment" | "profit_share" | "lease_payment" | "asset_purchase_payment" | "loss_allocation" | "waiver";
  amountXof: number;
  paidByActorId: EntityId;
  paidToActorId: EntityId;
  dueAt?: ISODateTime;
  settledAt: ISODateTime;
  evidenceIds: EntityId[];
  status: "recorded" | "confirmed" | "reversed";
}

export interface ProtectedLossEvent {
  id: EntityId;
  arrangementId: EntityId;
  affectedActorId: EntityId;
  territoryId: EntityId;
  riskCode: string;
  occurredAt: ISODateTime;
  estimatedLossXof: number;
  eligibleLossXof: number;
  approvedSupportXof: number;
  cause: string;
  evidenceIds: EntityId[];
  status: "reported" | "assessing" | "approved" | "rejected" | "supported" | "closed";
}

export interface RiskSupportPayment {
  id: EntityId;
  lossEventId: EntityId;
  arrangementId: EntityId;
  beneficiaryActorId: EntityId;
  amountXof: number;
  paidAt: ISODateTime;
  evidenceIds: EntityId[];
  status: "planned" | "paid" | "reversed";
}

export interface EthicalFinanceCase {
  id: EntityId;
  caseCode: string;
  countryId: EntityId;
  territoryIds: EntityId[];
  status: "configuring" | "operational" | "restricted" | "under_review" | "closed";
  guardrailPolicies: EthicalGuardrailPolicy[];
  financingNeeds: FinancingNeed[];
  offers: EthicalFinancingOffer[];
  complianceReviews: EthicalComplianceReview[];
  riskArrangements: RiskProtectionArrangement[];
  disbursements: FinancingDisbursement[];
  settlements: FinancingSettlement[];
  lossEvents: ProtectedLossEvent[];
  supportPayments: RiskSupportPayment[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export class EndToEndEthicalFinancingRiskSharingCapability {
  private readonly cases = new Map<EntityId, EthicalFinanceCase>();

  openCase(input: { id: EntityId; caseCode: string; countryId: EntityId; territoryIds: EntityId[]; createdAt: ISODateTime }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier ${input.id} existe déjà.`);
    const item: EthicalFinanceCase = {
      id: input.id,
      caseCode: input.caseCode,
      countryId: input.countryId,
      territoryIds: [...new Set(input.territoryIds)],
      status: "configuring",
      guardrailPolicies: [],
      financingNeeds: [],
      offers: [],
      complianceReviews: [],
      riskArrangements: [],
      disbursements: [],
      settlements: [],
      lossEvents: [],
      supportPayments: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  defineGuardrailPolicy(input: { caseId: EntityId; policy: EthicalGuardrailPolicy }) {
    const item = this.requireCase(input.caseId);
    if (!input.policy.approvedInstrumentTypes.length) throw new Error("Au moins un instrument autorisé doit être défini.");
    if (input.policy.requireIndependentEthicalReview && !input.policy.reviewerActorIds.length) throw new Error("Un comité ou réviseur éthique indépendant est requis.");
    if (!input.policy.evidenceIds.length) throw new Error("Une preuve de validation de la politique est obligatoire.");
    item.guardrailPolicies.push(structuredClone(input.policy));
    item.status = "operational";
    this.touch(item, input.policy.effectiveAt);
    return structuredClone(item);
  }

  submitNeed(input: { caseId: EntityId; need: FinancingNeed }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.need.territoryId);
    if (input.need.requestedAmountXof <= 0) throw new Error("Le montant demandé doit être positif.");
    if (input.need.vulnerabilityScore < 0 || input.need.vulnerabilityScore > 100) throw new Error("Le score de vulnérabilité est invalide.");
    if (!input.need.evidenceIds.length) throw new Error("Une preuve du besoin est obligatoire.");
    item.financingNeeds.push(structuredClone(input.need));
    this.touch(item, input.need.requestedAt);
    return structuredClone(item);
  }

  proposeOffer(input: { caseId: EntityId; offer: EthicalFinancingOffer; proposedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const policy = this.requireActivePolicy(item);
    const need = this.requireNeed(item, input.offer.financingNeedId);
    if (need.status === "rejected" || need.status === "closed") throw new Error("Le besoin ne peut plus recevoir d'offre.");
    if (!policy.approvedInstrumentTypes.includes(input.offer.instrumentType)) throw new Error("Instrument non autorisé par la politique éthique.");
    if (input.offer.principalAmountXof <= 0) throw new Error("Le montant principal doit être positif.");
    if (!input.offer.evidenceIds.length) throw new Error("Une preuve contractuelle est obligatoire.");
    this.assertOfferGuardrails(policy, input.offer);
    input.offer.complianceStatus = policy.requireIndependentEthicalReview ? "pending_review" : "compliant";
    input.offer.status = "proposed";
    item.offers.push(structuredClone(input.offer));
    need.status = "matched";
    this.touch(item, proposedAt);
    return structuredClone(input.offer);
  }

  reviewOffer(input: { caseId: EntityId; review: EthicalComplianceReview }) {
    const item = this.requireCase(input.caseId);
    const policy = this.requireActivePolicy(item);
    const offer = this.requireOffer(item, input.review.offerId);
    if (policy.requireIndependentEthicalReview && !policy.reviewerActorIds.includes(input.review.reviewedByActorId)) throw new Error("Le réviseur n'est pas autorisé par la politique éthique.");
    if (!input.review.evidenceIds.length) throw new Error("Une preuve de revue est obligatoire.");
    item.complianceReviews.push(structuredClone(input.review));
    offer.complianceStatus = input.review.status;
    if (input.review.status === "non_compliant") {
      offer.status = "cancelled";
      item.status = "restricted";
    }
    this.touch(item, input.review.reviewedAt);
    return structuredClone(offer);
  }

  createRiskArrangement(input: { caseId: EntityId; arrangement: RiskProtectionArrangement }) {
    const item = this.requireCase(input.caseId);
    const policy = this.requireActivePolicy(item);
    if (!policy.approvedRiskProtectionModels.includes(input.arrangement.model)) throw new Error("Modèle de protection non autorisé par la politique éthique.");
    if (input.arrangement.model === "none") throw new Error("Aucun arrangement ne doit être créé pour le modèle none.");
    if (input.arrangement.contributionAmountXof < 0 || input.arrangement.reserveBalanceXof < 0 || input.arrangement.maximumSupportXof < 0) throw new Error("Les montants de mutualisation sont invalides.");
    if (!input.arrangement.participantActorIds.length) throw new Error("La mutualisation nécessite des participants identifiés.");
    if (!input.arrangement.coveredRiskCodes.length) throw new Error("Les risques couverts doivent être explicites.");
    if (!input.arrangement.evidenceIds.length) throw new Error("Une preuve de gouvernance du fonds est obligatoire.");
    if (input.arrangement.financingOfferId) this.requireOffer(item, input.arrangement.financingOfferId);
    item.riskArrangements.push(structuredClone(input.arrangement));
    this.touch(item, input.arrangement.effectiveAt);
    return structuredClone(item);
  }

  acceptOffer(input: { caseId: EntityId; offerId: EntityId; acceptedAt: ISODateTime; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    const offer = this.requireOffer(item, input.offerId);
    if (!["compliant", "compliant_with_conditions"].includes(offer.complianceStatus)) throw new Error("Une offre non validée ne peut pas être acceptée.");
    if (!input.evidenceIds.length) throw new Error("Une preuve d'acceptation est obligatoire.");
    offer.evidenceIds = this.unique([...offer.evidenceIds, ...input.evidenceIds]);
    offer.status = "accepted";
    this.touch(item, input.acceptedAt);
    return structuredClone(offer);
  }

  disburse(input: { caseId: EntityId; disbursement: FinancingDisbursement }) {
    const item = this.requireCase(input.caseId);
    const offer = this.requireOffer(item, input.disbursement.offerId);
    if (offer.status !== "accepted" && offer.status !== "funded") throw new Error("L'offre doit être acceptée avant décaissement.");
    if (!input.disbursement.evidenceIds.length) throw new Error("Une preuve de décaissement est obligatoire.");
    const released = item.disbursements.filter((entry) => entry.offerId === offer.id && entry.status === "released").reduce((sum, entry) => sum + entry.amountXof, 0);
    if (released + input.disbursement.amountXof > offer.principalAmountXof) throw new Error("Le décaissement dépasse le montant autorisé.");
    if (offer.instrumentType === "murabaha" && !input.disbursement.assetOrSupplierActorId) throw new Error("La murabaha doit financer un actif ou fournisseur identifié.");
    item.disbursements.push(structuredClone(input.disbursement));
    offer.status = released + input.disbursement.amountXof >= offer.principalAmountXof ? "active" : "funded";
    this.requireNeed(item, offer.financingNeedId).status = "funded";
    this.touch(item, input.disbursement.disbursedAt);
    return structuredClone(offer);
  }

  recordSettlement(input: { caseId: EntityId; settlement: FinancingSettlement }) {
    const item = this.requireCase(input.caseId);
    const offer = this.requireOffer(item, input.settlement.offerId);
    if (!input.settlement.evidenceIds.length) throw new Error("Une preuve de règlement est obligatoire.");
    if (input.settlement.amountXof < 0) throw new Error("Le règlement ne peut pas être négatif.");
    item.settlements.push(structuredClone(input.settlement));
    const settled = item.settlements.filter((entry) => entry.offerId === offer.id && entry.status !== "reversed").reduce((sum, entry) => sum + entry.amountXof, 0);
    const expected = this.expectedSettlementAmount(offer);
    if (expected > 0 && settled >= expected) {
      offer.status = "completed";
      this.requireNeed(item, offer.financingNeedId).status = "closed";
    }
    this.touch(item, input.settlement.settledAt);
    return structuredClone(offer);
  }

  reportLoss(input: { caseId: EntityId; event: ProtectedLossEvent }) {
    const item = this.requireCase(input.caseId);
    const arrangement = this.requireArrangement(item, input.event.arrangementId);
    this.requireTerritory(item, input.event.territoryId);
    if (!arrangement.coveredRiskCodes.includes(input.event.riskCode)) throw new Error("Le risque déclaré n'est pas couvert par le fonds.");
    if (arrangement.excludedRiskCodes.includes(input.event.riskCode)) throw new Error("Le risque déclaré est explicitement exclu.");
    if (!input.event.evidenceIds.length) throw new Error("Une preuve du sinistre est obligatoire.");
    if (input.event.approvedSupportXof > input.event.eligibleLossXof || input.event.approvedSupportXof > arrangement.maximumSupportXof) throw new Error("Le soutien approuvé dépasse les plafonds autorisés.");
    item.lossEvents.push(structuredClone(input.event));
    this.touch(item, input.event.occurredAt);
    return structuredClone(item);
  }

  payRiskSupport(input: { caseId: EntityId; payment: RiskSupportPayment }) {
    const item = this.requireCase(input.caseId);
    const event = this.requireLossEvent(item, input.payment.lossEventId);
    const arrangement = this.requireArrangement(item, input.payment.arrangementId);
    if (event.status !== "approved") throw new Error("Le soutien doit être approuvé avant paiement.");
    if (input.payment.amountXof > event.approvedSupportXof) throw new Error("Le paiement dépasse le soutien approuvé.");
    if (input.payment.amountXof > arrangement.reserveBalanceXof) throw new Error("La réserve disponible est insuffisante.");
    if (!input.payment.evidenceIds.length) throw new Error("Une preuve de paiement est obligatoire.");
    arrangement.reserveBalanceXof -= input.payment.amountXof;
    event.status = "supported";
    item.supportPayments.push(structuredClone(input.payment));
    this.touch(item, input.payment.paidAt);
    return structuredClone(paymentSummary(event, arrangement, input.payment));
  }

  getEthicalFinanceCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const activeOffers = item.offers.filter((offer) => ["accepted", "funded", "active"].includes(offer.status));
    const principalCommittedXof = activeOffers.reduce((sum, offer) => sum + offer.principalAmountXof, 0);
    const disbursedXof = item.disbursements.filter((entry) => entry.status === "released").reduce((sum, entry) => sum + entry.amountXof, 0);
    const settledXof = item.settlements.filter((entry) => entry.status !== "reversed").reduce((sum, entry) => sum + entry.amountXof, 0);
    const mutualReserveXof = item.riskArrangements.filter((entry) => entry.status === "active").reduce((sum, entry) => sum + entry.reserveBalanceXof, 0);
    const paidRiskSupportXof = item.supportPayments.filter((entry) => entry.status === "paid").reduce((sum, entry) => sum + entry.amountXof, 0);
    return {
      caseId: item.id,
      status: item.status,
      activePolicyCount: item.guardrailPolicies.filter((policy) => policy.status === "active").length,
      submittedNeedCount: item.financingNeeds.length,
      fundedNeedCount: item.financingNeeds.filter((need) => need.status === "funded" || need.status === "closed").length,
      compliantOfferCount: item.offers.filter((offer) => ["compliant", "compliant_with_conditions"].includes(offer.complianceStatus)).length,
      nonCompliantOfferCount: item.offers.filter((offer) => offer.complianceStatus === "non_compliant").length,
      principalCommittedXof,
      disbursedXof,
      settledXof,
      mutualReserveXof,
      reportedLossXof: item.lossEvents.reduce((sum, event) => sum + event.estimatedLossXof, 0),
      approvedRiskSupportXof: item.lossEvents.reduce((sum, event) => sum + event.approvedSupportXof, 0),
      paidRiskSupportXof,
      pendingEthicalReviewCount: item.offers.filter((offer) => offer.complianceStatus === "pending_review").length,
      warnings: [...item.warnings],
      blockers: [...item.blockers],
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private assertOfferGuardrails(policy: EthicalGuardrailPolicy, offer: EthicalFinancingOffer) {
    if (policy.prohibitInterest && offer.feeItems.some((fee) => fee.code.toLowerCase().includes("interest") || fee.code.toLowerCase().includes("riba"))) throw new Error("Une composante assimilable à l'intérêt est interdite.");
    if (policy.requireTransparentFees && offer.feeItems.some((fee) => !fee.label || fee.amountXof < 0)) throw new Error("Tous les frais doivent être explicites et valides.");
    if (policy.requireAssetOrServiceLink && ["murabaha", "ijara", "salam", "istisna"].includes(offer.instrumentType) && !offer.assetOrServiceReferenceIds.length) throw new Error("L'instrument doit être relié à un actif, un service ou une livraison réelle.");
    if (offer.instrumentType === "murabaha") {
      if (offer.acquisitionCostXof === undefined || offer.disclosedMarginXof === undefined) throw new Error("Le coût d'acquisition et la marge doivent être divulgués.");
      if (offer.acquisitionCostXof + offer.disclosedMarginXof !== offer.principalAmountXof) throw new Error("Le prix murabaha doit correspondre au coût plus la marge divulguée.");
    }
    if (["mudaraba", "musharaka"].includes(offer.instrumentType)) {
      if (offer.profitSharingPercent === undefined || offer.lossSharingPercent === undefined) throw new Error("Les règles de partage des profits et pertes doivent être explicites.");
      if (offer.profitSharingPercent < 0 || offer.profitSharingPercent > 100 || offer.lossSharingPercent < 0 || offer.lossSharingPercent > 100) throw new Error("Les taux de partage sont invalides.");
    }
    if (offer.instrumentType === "qard_hasan" && (offer.disclosedMarginXof ?? 0) !== 0) throw new Error("Le qard hasan ne peut pas comporter de marge contractuelle.");
  }

  private expectedSettlementAmount(offer: EthicalFinancingOffer) {
    if (offer.instrumentType === "qard_hasan") return offer.principalAmountXof;
    if (offer.instrumentType === "murabaha") return offer.principalAmountXof + offer.feeItems.reduce((sum, fee) => sum + fee.amountXof, 0);
    if (offer.instrumentType === "ijara") return offer.repaymentSchedule.reduce((sum, entry) => sum + entry.amountXof, 0);
    return offer.repaymentSchedule.reduce((sum, entry) => sum + entry.amountXof, 0);
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier de finance éthique introuvable : ${id}.`);
    return item;
  }

  private requireTerritory(item: EthicalFinanceCase, id: EntityId) {
    if (!item.territoryIds.includes(id)) throw new Error(`Territoire hors périmètre : ${id}.`);
  }

  private requireActivePolicy(item: EthicalFinanceCase) {
    const policy = item.guardrailPolicies.find((entry) => entry.status === "active");
    if (!policy) throw new Error("Aucune politique éthique active n'est définie.");
    return policy;
  }

  private requireNeed(item: EthicalFinanceCase, id: EntityId) {
    const value = item.financingNeeds.find((entry) => entry.id === id);
    if (!value) throw new Error(`Besoin de financement introuvable : ${id}.`);
    return value;
  }

  private requireOffer(item: EthicalFinanceCase, id: EntityId) {
    const value = item.offers.find((entry) => entry.id === id);
    if (!value) throw new Error(`Offre de financement introuvable : ${id}.`);
    return value;
  }

  private requireArrangement(item: EthicalFinanceCase, id: EntityId) {
    const value = item.riskArrangements.find((entry) => entry.id === id);
    if (!value) throw new Error(`Dispositif de mutualisation introuvable : ${id}.`);
    return value;
  }

  private requireLossEvent(item: EthicalFinanceCase, id: EntityId) {
    const value = item.lossEvents.find((entry) => entry.id === id);
    if (!value) throw new Error(`Événement de perte introuvable : ${id}.`);
    return value;
  }

  private touch(item: EthicalFinanceCase, updatedAt: ISODateTime) {
    item.updatedAt = updatedAt;
    this.cases.set(item.id, item);
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }
}

function paymentSummary(event: ProtectedLossEvent, arrangement: RiskProtectionArrangement, payment: RiskSupportPayment) {
  return {
    lossEventId: event.id,
    eventStatus: event.status,
    paymentId: payment.id,
    paidAmountXof: payment.amountXof,
    remainingReserveXof: arrangement.reserveBalanceXof,
  };
}
