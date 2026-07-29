import type { EthicalFinanceCommand, EthicalFinanceOfferCase } from "./ethical-finance-runtime";

export interface FinancedAssetUseRecorded {
  id: string;
  offerId: string;
  territoryId: string;
  assetOrActivityReferenceId: string;
  operatorActorId: string;
  operatingPeriodStart: string;
  operatingPeriodEnd: string;
  useDescription: string;
  operatingQuantity?: number;
  operatingUnit?: string;
  revenueGeneratedXof: number;
  costIncurredXof: number;
  incidentCount: number;
  supportingDocumentIds: string[];
  recordedAt: string;
}

export interface SaleSettlementReceived {
  id: string;
  offerId: string;
  territoryId: string;
  commercialAgreementId: string;
  saleAmountXof: number;
  amountAvailableForSettlementXof: number;
  paymentReference: string;
  supportingDocumentIds: string[];
  receivedAt: string;
}

export interface FinanceCompletionAssessment {
  offerId: string;
  principalAmountXof: number;
  agreedMarginOrReturnXof: number;
  settledAmountXof: number;
  remainingAmountXof: number;
  revenueGeneratedXof: number;
  netOperationalValueXof: number;
  useConfirmed: boolean;
  canClose: boolean;
  closingReason: string;
}

export class EthicalFinanceActivityMonitoring {
  private readonly uses: FinancedAssetUseRecorded[] = [];
  private readonly sales: SaleSettlementReceived[] = [];

  recordUse(input: FinancedAssetUseRecorded) {
    this.ensureUnique(input.id, this.uses, "suivi d'utilisation");
    if (!input.assetOrActivityReferenceId.trim()) throw new Error("L'actif ou l'activité utilisé doit être identifié.");
    if (!input.useDescription.trim()) throw new Error("L'utilisation réelle doit être décrite.");
    if (input.revenueGeneratedXof < 0 || input.costIncurredXof < 0 || input.incidentCount < 0) throw new Error("Les résultats d'utilisation ne peuvent pas être négatifs.");
    if (!input.supportingDocumentIds.length) throw new Error("Le suivi doit comporter un relevé d'activité, un registre ou un constat de terrain.");
    this.uses.push(structuredClone(input));
    return structuredClone(input);
  }

  recordSale(input: SaleSettlementReceived) {
    this.ensureUnique(input.id, this.sales, "vente réglée");
    if (input.saleAmountXof <= 0 || input.amountAvailableForSettlementXof < 0) throw new Error("Les montants de la vente sont invalides.");
    if (input.amountAvailableForSettlementXof > input.saleAmountXof) throw new Error("Le montant affecté au règlement ne peut pas dépasser la vente encaissée.");
    if (!input.paymentReference.trim() || !input.supportingDocumentIds.length) throw new Error("La référence du paiement et le relevé de vente sont obligatoires.");
    this.sales.push(structuredClone(input));
    return structuredClone(input);
  }

  prepareSettlementCommand(input: { commandId: string; offer: EthicalFinanceOfferCase; saleId: string; amountXof?: number; at: string }): { commandId: string; command: EthicalFinanceCommand } {
    const sale = this.requireSale(input.saleId);
    if (sale.offerId !== input.offer.id) throw new Error("La vente ne correspond pas à cette offre de financement.");
    const amountXof = input.amountXof ?? sale.amountAvailableForSettlementXof;
    if (amountXof <= 0 || amountXof > sale.amountAvailableForSettlementXof) throw new Error("Le montant retenu pour le règlement est invalide.");
    return {
      commandId: input.commandId,
      command: {
        type: "record_settlement",
        settlement: {
          id: `settlement:${sale.id}`,
          offerId: input.offer.id,
          type: input.offer.mode === "murabaha" ? "asset_purchase_payment" : input.offer.mode === "ijara" ? "lease_payment" : input.offer.mode === "qard_hasan" ? "principal_return" : "profit_share",
          amountXof,
          paymentReference: sale.paymentReference,
          settledAt: input.at,
          status: "confirmed",
        },
      },
    };
  }

  assessCompletion(input: { offer: EthicalFinanceOfferCase; settledAmountXof: number }) : FinanceCompletionAssessment {
    const relatedUses = this.uses.filter((item) => item.offerId === input.offer.id);
    const revenueGeneratedXof = relatedUses.reduce((sum, item) => sum + item.revenueGeneratedXof, 0);
    const costsXof = relatedUses.reduce((sum, item) => sum + item.costIncurredXof, 0);
    const agreedMarginOrReturnXof = input.offer.mode === "murabaha"
      ? input.offer.disclosedMarginXof ?? 0
      : 0;
    const agreedTotalXof = input.offer.principalAmountXof;
    const remainingAmountXof = Math.max(0, agreedTotalXof - input.settledAmountXof);
    const useConfirmed = relatedUses.length > 0;
    const canClose = useConfirmed && remainingAmountXof === 0;
    return {
      offerId: input.offer.id,
      principalAmountXof: input.offer.principalAmountXof,
      agreedMarginOrReturnXof,
      settledAmountXof: input.settledAmountXof,
      remainingAmountXof,
      revenueGeneratedXof,
      netOperationalValueXof: revenueGeneratedXof - costsXof,
      useConfirmed,
      canClose,
      closingReason: canClose
        ? "L'utilisation de l'actif est constatée et le montant convenu est intégralement réglé."
        : !useConfirmed
          ? "L'utilisation réelle de l'actif ou de l'activité n'est pas encore constatée."
          : "Le montant convenu n'est pas encore intégralement réglé.",
    };
  }

  snapshot() {
    return structuredClone({ uses: this.uses, settledSales: this.sales });
  }

  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) {
    if (values.some((item) => item.id === id)) throw new Error(`${label} déjà enregistré : ${id}.`);
  }
  private requireSale(id: string) {
    const value = this.sales.find((item) => item.id === id);
    if (!value) throw new Error(`Vente réglée introuvable : ${id}.`);
    return value;
  }
}
