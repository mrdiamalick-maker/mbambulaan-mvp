import type { EntityId, ISODateTime } from "../infrastructures/types";

export type EcosystemConsistencySeverity = "info" | "warning" | "critical";

export interface EcosystemConsistencyFinding {
  id: EntityId;
  ruleCode: string;
  severity: EcosystemConsistencySeverity;
  scope: "campaign" | "sale" | "cooperative" | "territory" | "national" | "cross_capability";
  message: string;
  relatedIds: EntityId[];
  recommendedAction: string;
}

export interface EcosystemConsistencyInput {
  campaign: {
    id: EntityId;
    territoryId: EntityId;
    cooperativeId?: EntityId;
    traceabilityLotIds: EntityId[];
    landedQuantityKg: number;
    soldQuantityKg: number;
    rejectedQuantityKg: number;
    grossRevenueXof: number;
    netRevenueXof: number;
    status: string;
  };
  sale: {
    id: EntityId;
    territoryId: EntityId;
    cooperativeId?: EntityId;
    traceabilityLotIds: EntityId[];
    reservedQuantityKg: number;
    deliveredQuantityKg: number;
    acceptedQuantityKg: number;
    rejectedQuantityKg: number;
    grossAmountXof: number;
    sellerNetAmountXof: number;
    platformRevenueXof: number;
    logisticsCostXof: number;
    status: string;
  };
  cooperative: {
    id: EntityId;
    cooperativeId: EntityId;
    territoryId: EntityId;
    activeCampaignIds: EntityId[];
    activeSaleCaseIds: EntityId[];
    commercialRevenueXof: number;
    platformFeesXof: number;
    cooperativeFundBalanceXof: number;
    status: string;
  };
  territory: {
    id: EntityId;
    territoryId: EntityId;
    campaignIds: EntityId[];
    saleCaseIds: EntityId[];
    cooperativeCaseIds: EntityId[];
    grossCommercialValueXof: number;
    sellerNetValueXof: number;
    platformRevenueXof: number;
    status: string;
  };
  national: {
    id: EntityId;
    territoryIds: EntityId[];
    grossCommercialValueXof: number;
    sellerNetValueXof: number;
    platformRevenueXof: number;
    status: string;
  };
  evidenceIds: EntityId[];
  generatedAt: ISODateTime;
}

export interface EcosystemConsistencyReport {
  generatedAt: ISODateTime;
  score: number;
  consistent: boolean;
  criticalFindingCount: number;
  warningFindingCount: number;
  findings: EcosystemConsistencyFinding[];
  reconciledMetrics: {
    physicalFlowReconciled: boolean;
    commercialFlowReconciled: boolean;
    sellerValueReconciled: boolean;
    platformRevenueReconciled: boolean;
    territorialAggregationReconciled: boolean;
    nationalAggregationReconciled: boolean;
    traceabilityReconciled: boolean;
    governanceLinksReconciled: boolean;
  };
}

export class FisheriesEcosystemConsistencyAudit {
  audit(input: EcosystemConsistencyInput): EcosystemConsistencyReport {
    const findings: EcosystemConsistencyFinding[] = [];
    const add = (
      ruleCode: string,
      severity: EcosystemConsistencySeverity,
      scope: EcosystemConsistencyFinding["scope"],
      message: string,
      relatedIds: EntityId[],
      recommendedAction: string,
    ) => findings.push({
      id: `finding:${ruleCode}:${findings.length + 1}`,
      ruleCode,
      severity,
      scope,
      message,
      relatedIds,
      recommendedAction,
    });

    if (input.campaign.territoryId !== input.sale.territoryId || input.sale.territoryId !== input.cooperative.territoryId || input.cooperative.territoryId !== input.territory.territoryId) {
      add("TERRITORY_CHAIN_MISMATCH", "critical", "cross_capability", "Les opérations reliées ne partagent pas le même territoire canonique.", [input.campaign.id, input.sale.id, input.cooperative.id, input.territory.id], "Corriger les références territoriales avant toute consolidation nationale.");
    }
    if (!input.national.territoryIds.includes(input.territory.territoryId)) {
      add("NATIONAL_TERRITORY_MISSING", "critical", "national", "Le territoire opérationnel n'est pas rattaché au pilotage national.", [input.territory.id, input.national.id], "Rattacher le territoire au dossier national et recalculer les agrégats.");
    }
    if (input.campaign.cooperativeId && input.sale.cooperativeId && input.campaign.cooperativeId !== input.sale.cooperativeId) {
      add("COOPERATIVE_CHAIN_MISMATCH", "critical", "cross_capability", "La campagne et la vente sont rattachées à des coopératives différentes.", [input.campaign.id, input.sale.id], "Résoudre l'identité de la coopérative bénéficiaire avant règlement.");
    }
    if (input.campaign.cooperativeId && input.campaign.cooperativeId !== input.cooperative.cooperativeId) {
      add("COOPERATIVE_REFERENCE_MISMATCH", "critical", "cooperative", "La coopérative de la campagne ne correspond pas au dossier coopératif consolidé.", [input.campaign.id, input.cooperative.id], "Utiliser une référence coopérative canonique partagée.");
    }
    if (!input.cooperative.activeCampaignIds.includes(input.campaign.id)) {
      add("CAMPAIGN_NOT_LINKED_TO_COOPERATIVE", "warning", "cooperative", "La campagne n'est pas reliée au dossier de la coopérative.", [input.campaign.id, input.cooperative.id], "Relier la campagne pour consolider services, gouvernance et résultats économiques.");
    }
    if (!input.cooperative.activeSaleCaseIds.includes(input.sale.id)) {
      add("SALE_NOT_LINKED_TO_COOPERATIVE", "warning", "cooperative", "La vente n'est pas reliée au dossier de la coopérative.", [input.sale.id, input.cooperative.id], "Relier la vente pour consolider la valeur commerciale de la coopérative.");
    }
    if (!input.territory.campaignIds.includes(input.campaign.id)) {
      add("CAMPAIGN_NOT_LINKED_TO_TERRITORY", "critical", "territory", "La campagne n'est pas incluse dans la supervision territoriale.", [input.campaign.id, input.territory.id], "Rattacher la campagne au territoire avant revue territoriale.");
    }
    if (!input.territory.saleCaseIds.includes(input.sale.id)) {
      add("SALE_NOT_LINKED_TO_TERRITORY", "critical", "territory", "La vente n'est pas incluse dans la supervision territoriale.", [input.sale.id, input.territory.id], "Rattacher la vente au territoire avant consolidation économique.");
    }
    if (!input.territory.cooperativeCaseIds.includes(input.cooperative.id)) {
      add("COOPERATIVE_NOT_LINKED_TO_TERRITORY", "critical", "territory", "La coopérative n'est pas incluse dans la supervision territoriale.", [input.cooperative.id, input.territory.id], "Rattacher la coopérative au territoire avant consolidation.");
    }

    if (input.campaign.soldQuantityKg > input.campaign.landedQuantityKg - input.campaign.rejectedQuantityKg) {
      add("CAMPAIGN_SOLD_QUANTITY_INVALID", "critical", "campaign", "La quantité vendue dépasse la quantité débarquée commercialisable.", [input.campaign.id], "Corriger les quantités de campagne et bloquer la clôture économique.");
    }
    if (input.sale.deliveredQuantityKg > input.sale.reservedQuantityKg) {
      add("DELIVERED_QUANTITY_EXCEEDS_RESERVATION", "critical", "sale", "La quantité livrée dépasse la quantité réservée.", [input.sale.id], "Corriger la livraison ou créer une réservation complémentaire.");
    }
    if (input.sale.acceptedQuantityKg + input.sale.rejectedQuantityKg > input.sale.deliveredQuantityKg) {
      add("DELIVERY_ACCEPTANCE_INVALID", "critical", "sale", "Les quantités acceptées et rejetées dépassent la quantité livrée.", [input.sale.id], "Reprendre le contrôle de réception et ses preuves.");
    }
    if (input.sale.acceptedQuantityKg > input.campaign.soldQuantityKg) {
      add("ACCEPTED_QUANTITY_EXCEEDS_CAMPAIGN_SALE", "critical", "cross_capability", "La quantité acceptée dans la livraison dépasse la quantité vendue par la campagne.", [input.campaign.id, input.sale.id], "Réconcilier les lots et quantités avant règlement.");
    }

    const campaignLots = new Set(input.campaign.traceabilityLotIds);
    const unrecognizedSaleLots = input.sale.traceabilityLotIds.filter((lotId) => !campaignLots.has(lotId));
    if (unrecognizedSaleLots.length > 0) {
      add("UNRECOGNIZED_SALE_LOTS", "critical", "cross_capability", "La vente contient des lots qui ne proviennent pas de la campagne reliée.", [input.campaign.id, input.sale.id, ...unrecognizedSaleLots], "Bloquer le règlement et réconcilier la traçabilité des lots.");
    }
    if (input.sale.traceabilityLotIds.length === 0) {
      add("SALE_TRACEABILITY_MISSING", "critical", "sale", "Aucun lot traçable n'est rattaché à la livraison.", [input.sale.id], "Rattacher les lots et preuves de traçabilité avant acceptation.");
    }

    const saleDistributedValue = input.sale.sellerNetAmountXof + input.sale.platformRevenueXof + input.sale.logisticsCostXof;
    if (saleDistributedValue > input.sale.grossAmountXof) {
      add("SALE_VALUE_OVERALLOCATED", "critical", "sale", "La valeur distribuée dépasse le montant commercial brut.", [input.sale.id], "Recalculer la répartition de valeur avant règlement.");
    }
    if (!this.closeEnough(input.campaign.grossRevenueXof, input.sale.grossAmountXof)) {
      add("CAMPAIGN_SALE_GROSS_MISMATCH", "warning", "cross_capability", "Le revenu brut de campagne diffère du montant brut de la vente reliée.", [input.campaign.id, input.sale.id], "Expliquer l'écart par les ventes multiples, ajustements qualité ou lots non encore vendus.");
    }
    if (!this.closeEnough(input.campaign.netRevenueXof, input.sale.sellerNetAmountXof)) {
      add("CAMPAIGN_SELLER_NET_MISMATCH", "warning", "cross_capability", "Le revenu net de campagne diffère du montant net vendeur de la vente.", [input.campaign.id, input.sale.id], "Réconcilier les coûts, commissions et allocations de règlement.");
    }
    if (!this.closeEnough(input.cooperative.commercialRevenueXof, input.sale.sellerNetAmountXof)) {
      add("COOPERATIVE_COMMERCIAL_REVENUE_MISMATCH", "warning", "cooperative", "Le revenu commercial de la coopérative ne correspond pas au montant net vendeur consolidé.", [input.cooperative.id, input.sale.id], "Mettre à jour la position financière coopérative à partir du règlement confirmé.");
    }
    if (!this.closeEnough(input.cooperative.platformFeesXof, input.sale.platformRevenueXof)) {
      add("COOPERATIVE_PLATFORM_FEE_MISMATCH", "warning", "cooperative", "Les frais Mbàmbulaan consolidés par la coopérative diffèrent de la vente.", [input.cooperative.id, input.sale.id], "Réconcilier les frais de plateforme avec la transaction commerciale.");
    }
    if (!this.closeEnough(input.territory.grossCommercialValueXof, input.sale.grossAmountXof)) {
      add("TERRITORIAL_GROSS_VALUE_MISMATCH", "warning", "territory", "La valeur commerciale territoriale ne correspond pas aux ventes reliées.", [input.territory.id, input.sale.id], "Recalculer le snapshot économique territorial.");
    }
    if (!this.closeEnough(input.territory.sellerNetValueXof, input.sale.sellerNetAmountXof)) {
      add("TERRITORIAL_SELLER_VALUE_MISMATCH", "warning", "territory", "La valeur nette vendeur territoriale ne correspond pas au règlement commercial.", [input.territory.id, input.sale.id], "Recalculer la valeur retenue par les acteurs locaux.");
    }
    if (!this.closeEnough(input.territory.platformRevenueXof, input.sale.platformRevenueXof)) {
      add("TERRITORIAL_PLATFORM_REVENUE_MISMATCH", "warning", "territory", "Le revenu Mbàmbulaan territorial ne correspond pas à la vente reliée.", [input.territory.id, input.sale.id], "Réconcilier le revenu de plateforme territorial.");
    }
    if (input.national.grossCommercialValueXof < input.territory.grossCommercialValueXof) {
      add("NATIONAL_GROSS_VALUE_UNDERSTATED", "critical", "national", "La valeur nationale est inférieure à celle du territoire consolidé.", [input.territory.id, input.national.id], "Recalculer les agrégats nationaux à partir des territoires actifs.");
    }
    if (input.national.sellerNetValueXof < input.territory.sellerNetValueXof) {
      add("NATIONAL_SELLER_VALUE_UNDERSTATED", "critical", "national", "La valeur nette vendeur nationale est inférieure à celle du territoire.", [input.territory.id, input.national.id], "Recalculer l'agrégat national de valeur retenue.");
    }
    if (input.national.platformRevenueXof < input.territory.platformRevenueXof) {
      add("NATIONAL_PLATFORM_REVENUE_UNDERSTATED", "critical", "national", "Le revenu Mbàmbulaan national est inférieur à celui du territoire.", [input.territory.id, input.national.id], "Recalculer l'agrégat national de revenu plateforme.");
    }
    if (input.evidenceIds.length === 0) {
      add("CROSS_CAPABILITY_EVIDENCE_MISSING", "warning", "cross_capability", "Aucune preuve transverse n'est fournie pour la réconciliation.", [input.campaign.id, input.sale.id, input.cooperative.id, input.territory.id, input.national.id], "Attacher les preuves de pesée, qualité, livraison, paiement et consolidation.");
    }

    const criticalFindingCount = findings.filter((finding) => finding.severity === "critical").length;
    const warningFindingCount = findings.filter((finding) => finding.severity === "warning").length;
    const score = Math.max(0, Math.min(100, 100 - criticalFindingCount * 15 - warningFindingCount * 5));

    return {
      generatedAt: input.generatedAt,
      score,
      consistent: criticalFindingCount === 0,
      criticalFindingCount,
      warningFindingCount,
      findings,
      reconciledMetrics: {
        physicalFlowReconciled: !findings.some((finding) => ["CAMPAIGN_SOLD_QUANTITY_INVALID", "DELIVERED_QUANTITY_EXCEEDS_RESERVATION", "DELIVERY_ACCEPTANCE_INVALID", "ACCEPTED_QUANTITY_EXCEEDS_CAMPAIGN_SALE"].includes(finding.ruleCode)),
        commercialFlowReconciled: !findings.some((finding) => ["SALE_VALUE_OVERALLOCATED", "CAMPAIGN_SALE_GROSS_MISMATCH"].includes(finding.ruleCode)),
        sellerValueReconciled: !findings.some((finding) => ["CAMPAIGN_SELLER_NET_MISMATCH", "COOPERATIVE_COMMERCIAL_REVENUE_MISMATCH", "TERRITORIAL_SELLER_VALUE_MISMATCH", "NATIONAL_SELLER_VALUE_UNDERSTATED"].includes(finding.ruleCode)),
        platformRevenueReconciled: !findings.some((finding) => ["COOPERATIVE_PLATFORM_FEE_MISMATCH", "TERRITORIAL_PLATFORM_REVENUE_MISMATCH", "NATIONAL_PLATFORM_REVENUE_UNDERSTATED"].includes(finding.ruleCode)),
        territorialAggregationReconciled: !findings.some((finding) => finding.scope === "territory" && finding.severity === "critical"),
        nationalAggregationReconciled: !findings.some((finding) => finding.scope === "national"),
        traceabilityReconciled: !findings.some((finding) => ["UNRECOGNIZED_SALE_LOTS", "SALE_TRACEABILITY_MISSING"].includes(finding.ruleCode)),
        governanceLinksReconciled: !findings.some((finding) => ["TERRITORY_CHAIN_MISMATCH", "NATIONAL_TERRITORY_MISSING", "COOPERATIVE_CHAIN_MISMATCH", "COOPERATIVE_REFERENCE_MISMATCH", "CAMPAIGN_NOT_LINKED_TO_TERRITORY", "SALE_NOT_LINKED_TO_TERRITORY", "COOPERATIVE_NOT_LINKED_TO_TERRITORY"].includes(finding.ruleCode)),
      },
    };
  }

  private closeEnough(left: number, right: number) {
    const tolerance = Math.max(1, Math.max(Math.abs(left), Math.abs(right)) * 0.005);
    return Math.abs(left - right) <= tolerance;
  }
}
