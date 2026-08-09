export type EthicalFinanceMode =
  | "qard_hasan"
  | "murabaha"
  | "ijara"
  | "musharaka"
  | "mudaraba"
  | "salam"
  | "istisna"
  | "grant"
  | "public_support"
  | "cooperative_advance";

export type SolidarityProtectionMode =
  | "cooperative_solidarity_fund"
  | "mutual_guarantee_fund"
  | "community_reserve"
  | "public_compensation_fund"
  | "takaful_reviewed"
  | "none";

export interface FinancingNeedCase {
  id: string;
  territoryId: string;
  applicantActorId: string;
  applicantOrganizationId?: string;
  purpose: "campaign" | "equipment" | "cold_storage" | "transport" | "processing" | "market_order" | "emergency_support" | "training";
  requestedAmountXof: number;
  activityReferenceIds: string[];
  assetReferenceIds: string[];
  expectedValueXof: number;
  expectedSettlementSource: string;
  supportingDocumentIds: string[];
  status: "submitted" | "qualified" | "rejected" | "matched" | "funded" | "active" | "completed" | "cancelled";
  submittedAt: string;
}

export interface EthicalFinanceOfferCase {
  id: string;
  financingNeedId: string;
  providerOrganizationId: string;
  mode: EthicalFinanceMode;
  principalAmountXof: number;
  acquisitionCostXof?: number;
  disclosedMarginXof?: number;
  profitSharePercent?: number;
  lossSharePercent?: number;
  leasePaymentXof?: number;
  installments: Array<{ dueAt: string; amountXof: number }>;
  serviceFeeXof: number;
  serviceDescription: string;
  activityReferenceIds: string[];
  contractDocumentIds: string[];
  independentReviewRequired: boolean;
  status: "draft" | "under_review" | "compliant" | "rejected" | "accepted" | "funded" | "active" | "completed" | "cancelled";
  proposedAt: string;
}

export interface IndependentEthicalReview {
  id: string;
  offerId: string;
  reviewerActorId: string;
  decision: "compliant" | "compliant_with_conditions" | "non_compliant";
  findings: string[];
  requiredConditions: string[];
  reviewDocumentIds: string[];
  reviewedAt: string;
}

export interface FinancingDisbursementCase {
  id: string;
  offerId: string;
  amountXof: number;
  paidToActorId: string;
  supplierActorId?: string;
  purposeReferenceIds: string[];
  paymentReference: string;
  status: "released" | "reversed";
  disbursedAt: string;
}

export interface FinanceSettlementCase {
  id: string;
  offerId: string;
  type: "principal_return" | "profit_share" | "lease_payment" | "asset_purchase_payment" | "loss_share" | "waiver";
  amountXof: number;
  paymentReference: string;
  settledAt: string;
  status: "recorded" | "confirmed" | "reversed";
}

export interface SolidarityFundCase {
  id: string;
  territoryId: string;
  mode: SolidarityProtectionMode;
  operatorOrganizationId: string;
  participantOrganizationIds: string[];
  coveredSituations: string[];
  excludedSituations: string[];
  contributionBalanceXof: number;
  maximumSupportXof: number;
  governanceDocumentIds: string[];
  independentReviewDocumentIds: string[];
  status: "draft" | "active" | "suspended" | "closed";
}

export interface SolidaritySupportCase {
  id: string;
  fundId: string;
  affectedActorId: string;
  situation: string;
  lossAmountXof: number;
  approvedSupportXof: number;
  situationDocumentIds: string[];
  paymentReference?: string;
  status: "reported" | "assessed" | "approved" | "paid" | "rejected";
  reportedAt: string;
  paidAt?: string;
}

export type EthicalFinanceCommand =
  | { type: "submit_need"; need: FinancingNeedCase }
  | { type: "qualify_need"; needId: string }
  | { type: "propose_offer"; offer: EthicalFinanceOfferCase }
  | { type: "review_offer"; review: IndependentEthicalReview }
  | { type: "accept_offer"; offerId: string }
  | { type: "record_disbursement"; disbursement: FinancingDisbursementCase }
  | { type: "record_settlement"; settlement: FinanceSettlementCase }
  | { type: "create_solidarity_fund"; fund: SolidarityFundCase }
  | { type: "activate_solidarity_fund"; fundId: string }
  | { type: "report_supported_loss"; support: SolidaritySupportCase }
  | { type: "approve_support"; supportId: string; approvedSupportXof: number }
  | { type: "record_support_payment"; supportId: string; paymentReference: string; paidAt: string };

export class EthicalFinanceRuntime {
  private readonly needs: FinancingNeedCase[] = [];
  private readonly offers: EthicalFinanceOfferCase[] = [];
  private readonly reviews: IndependentEthicalReview[] = [];
  private readonly disbursements: FinancingDisbursementCase[] = [];
  private readonly settlements: FinanceSettlementCase[] = [];
  private readonly funds: SolidarityFundCase[] = [];
  private readonly supports: SolidaritySupportCase[] = [];
  private readonly processed = new Map<string, unknown>();

  execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: EthicalFinanceCommand }) {
    const previous = this.processed.get(input.commandId);
    if (previous) return structuredClone(previous);
    const command = input.command;
    let result: unknown;

    switch (command.type) {
      case "submit_need":
        this.assertTerritory(command.need.territoryId, input.activeTerritoryId);
        this.ensureUnique(command.need.id, this.needs, "besoin de financement");
        if (command.need.requestedAmountXof <= 0 || command.need.expectedValueXof < 0) throw new Error("Les montants du besoin sont invalides.");
        if (!command.need.activityReferenceIds.length && !command.need.assetReferenceIds.length) throw new Error("Le financement doit être rattaché à une activité ou un actif réel.");
        if (!command.need.supportingDocumentIds.length) throw new Error("Un document décrivant le besoin est obligatoire.");
        this.needs.push(structuredClone(command.need));
        result = command.need;
        break;
      case "qualify_need": {
        const need = this.requireNeed(command.needId);
        if (need.status !== "submitted") throw new Error("Seul un besoin déposé peut être qualifié.");
        need.status = "qualified";
        result = need;
        break;
      }
      case "propose_offer": {
        const offer = command.offer;
        const need = this.requireNeed(offer.financingNeedId);
        if (need.status !== "qualified") throw new Error("Le besoin doit être qualifié avant proposition.");
        this.ensureUnique(offer.id, this.offers, "offre");
        this.validateOffer(offer);
        offer.status = offer.independentReviewRequired ? "under_review" : "compliant";
        this.offers.push(structuredClone(offer));
        need.status = "matched";
        result = offer;
        break;
      }
      case "review_offer": {
        const offer = this.requireOffer(command.review.offerId);
        if (offer.status !== "under_review") throw new Error("Cette offre n'attend pas de revue indépendante.");
        if (!command.review.reviewDocumentIds.length) throw new Error("Le compte rendu de la revue indépendante est obligatoire.");
        this.ensureUnique(command.review.id, this.reviews, "revue");
        this.reviews.push(structuredClone(command.review));
        offer.status = command.review.decision === "non_compliant" ? "rejected" : "compliant";
        result = offer;
        break;
      }
      case "accept_offer": {
        const offer = this.requireOffer(command.offerId);
        if (offer.status !== "compliant") throw new Error("Seule une offre reconnue conforme peut être acceptée.");
        offer.status = "accepted";
        result = offer;
        break;
      }
      case "record_disbursement": {
        const offer = this.requireOffer(command.disbursement.offerId);
        if (offer.status !== "accepted") throw new Error("L'offre doit être acceptée avant décaissement.");
        if (command.disbursement.amountXof <= 0 || command.disbursement.amountXof > offer.principalAmountXof) throw new Error("Le montant décaissé est invalide.");
        if (!command.disbursement.paymentReference || !command.disbursement.purposeReferenceIds.length) throw new Error("La référence du paiement et son usage sont obligatoires.");
        this.ensureUnique(command.disbursement.id, this.disbursements, "décaissement");
        this.disbursements.push(structuredClone(command.disbursement));
        offer.status = "active";
        this.requireNeed(offer.financingNeedId).status = "active";
        result = command.disbursement;
        break;
      }
      case "record_settlement": {
        const offer = this.requireOffer(command.settlement.offerId);
        if (offer.status !== "active") throw new Error("Le financement doit être actif avant règlement.");
        if (command.settlement.amountXof < 0 || !command.settlement.paymentReference) throw new Error("Le règlement doit comporter un montant valide et une référence.");
        this.ensureUnique(command.settlement.id, this.settlements, "règlement");
        this.settlements.push(structuredClone(command.settlement));
        result = command.settlement;
        break;
      }
      case "create_solidarity_fund":
        this.assertTerritory(command.fund.territoryId, input.activeTerritoryId);
        this.ensureUnique(command.fund.id, this.funds, "fonds solidaire");
        if (command.fund.mode === "none") throw new Error("Aucun fonds ne doit être créé sans mode de protection.");
        if (command.fund.mode === "takaful_reviewed" && !command.fund.independentReviewDocumentIds.length) throw new Error("Le mécanisme de type takaful exige une revue indépendante documentée.");
        if (!command.fund.participantOrganizationIds.length || !command.fund.governanceDocumentIds.length) throw new Error("Les participants et les règles de gouvernance du fonds sont obligatoires.");
        this.funds.push(structuredClone(command.fund));
        result = command.fund;
        break;
      case "activate_solidarity_fund": {
        const fund = this.requireFund(command.fundId);
        if (fund.status !== "draft") throw new Error("Seul un fonds en préparation peut être activé.");
        fund.status = "active";
        result = fund;
        break;
      }
      case "report_supported_loss": {
        const fund = this.requireFund(command.support.fundId);
        if (fund.status !== "active") throw new Error("Le fonds solidaire n'est pas actif.");
        if (command.support.lossAmountXof <= 0 || !command.support.situationDocumentIds.length) throw new Error("La perte constatée doit être positive et documentée.");
        this.ensureUnique(command.support.id, this.supports, "demande de soutien");
        this.supports.push(structuredClone(command.support));
        result = command.support;
        break;
      }
      case "approve_support": {
        const support = this.requireSupport(command.supportId);
        const fund = this.requireFund(support.fundId);
        if (support.status !== "reported" && support.status !== "assessed") throw new Error("La demande de soutien ne peut plus être approuvée.");
        if (command.approvedSupportXof <= 0 || command.approvedSupportXof > support.lossAmountXof || command.approvedSupportXof > fund.maximumSupportXof || command.approvedSupportXof > fund.contributionBalanceXof) throw new Error("Le montant de soutien dépasse les limites autorisées.");
        support.approvedSupportXof = command.approvedSupportXof;
        support.status = "approved";
        result = support;
        break;
      }
      case "record_support_payment": {
        const support = this.requireSupport(command.supportId);
        const fund = this.requireFund(support.fundId);
        if (support.status !== "approved") throw new Error("Le soutien doit être approuvé avant paiement.");
        if (!command.paymentReference) throw new Error("La référence du paiement est obligatoire.");
        fund.contributionBalanceXof -= support.approvedSupportXof;
        support.paymentReference = command.paymentReference;
        support.paidAt = command.paidAt;
        support.status = "paid";
        result = support;
        break;
      }
      default:
        throw new Error("Action Finance inconnue.");
    }

    const response = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processed.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot() {
    return structuredClone({
      needs: this.needs,
      offers: this.offers,
      reviews: this.reviews,
      disbursements: this.disbursements,
      settlements: this.settlements,
      solidarityFunds: this.funds,
      solidaritySupports: this.supports,
      metrics: {
        qualifiedNeedCount: this.needs.filter((item) => ["qualified", "matched", "funded", "active", "completed"].includes(item.status)).length,
        compliantOfferCount: this.offers.filter((item) => ["compliant", "accepted", "funded", "active", "completed"].includes(item.status)).length,
        activeFinancingAmountXof: this.disbursements.filter((item) => item.status === "released").reduce((sum, item) => sum + item.amountXof, 0),
        settledAmountXof: this.settlements.filter((item) => item.status !== "reversed").reduce((sum, item) => sum + item.amountXof, 0),
        solidarityFundBalanceXof: this.funds.filter((item) => item.status === "active").reduce((sum, item) => sum + item.contributionBalanceXof, 0),
        solidaritySupportPaidXof: this.supports.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.approvedSupportXof, 0),
        mbambulaanServiceRevenueXof: this.offers.filter((item) => ["accepted", "funded", "active", "completed"].includes(item.status)).reduce((sum, item) => sum + item.serviceFeeXof, 0),
      },
    });
  }

  private validateOffer(offer: EthicalFinanceOfferCase) {
    if (offer.principalAmountXof <= 0) throw new Error("Le montant proposé doit être positif.");
    if (!offer.activityReferenceIds.length || !offer.contractDocumentIds.length) throw new Error("L'offre doit être reliée à l'activité réelle et à un contrat.");
    if (offer.serviceFeeXof < 0 || !offer.serviceDescription.trim()) throw new Error("Les frais de service doivent être transparents et liés à un service réel.");
    if (offer.mode === "murabaha") {
      if (offer.acquisitionCostXof === undefined || offer.disclosedMarginXof === undefined) throw new Error("Le coût d'acquisition et la marge doivent être affichés pour une vente avec marge connue.");
      if (offer.acquisitionCostXof + offer.disclosedMarginXof !== offer.principalAmountXof) throw new Error("Le montant total doit correspondre au coût d'acquisition et à la marge annoncée.");
    }
    if (["musharaka", "mudaraba"].includes(offer.mode)) {
      if (offer.profitSharePercent === undefined || offer.lossSharePercent === undefined) throw new Error("Le partage du résultat et du risque doit être explicite.");
      if (offer.profitSharePercent < 0 || offer.profitSharePercent > 100 || offer.lossSharePercent < 0 || offer.lossSharePercent > 100) throw new Error("Les pourcentages de partage sont invalides.");
    }
    if (offer.mode === "qard_hasan" && (offer.disclosedMarginXof ?? 0) > 0) throw new Error("Une avance sans intérêt ne peut comporter de marge financière.");
  }

  private assertTerritory(value: string, active: string) { if (active !== "territory-national" && value !== active) throw new Error("Le territoire actif ne permet pas cette action."); }
  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) { if (values.some((item) => item.id === id)) throw new Error(`${label} déjà existant : ${id}.`); }
  private requireNeed(id: string) { const value = this.needs.find((item) => item.id === id); if (!value) throw new Error(`Besoin introuvable : ${id}.`); return value; }
  private requireOffer(id: string) { const value = this.offers.find((item) => item.id === id); if (!value) throw new Error(`Offre introuvable : ${id}.`); return value; }
  private requireFund(id: string) { const value = this.funds.find((item) => item.id === id); if (!value) throw new Error(`Fonds solidaire introuvable : ${id}.`); return value; }
  private requireSupport(id: string) { const value = this.supports.find((item) => item.id === id); if (!value) throw new Error(`Demande de soutien introuvable : ${id}.`); return value; }
}

const globalRuntime = globalThis as typeof globalThis & { __mbEthicalFinanceRuntime?: EthicalFinanceRuntime };
export function getEthicalFinanceRuntime() {
  globalRuntime.__mbEthicalFinanceRuntime ??= new EthicalFinanceRuntime();
  return globalRuntime.__mbEthicalFinanceRuntime;
}
