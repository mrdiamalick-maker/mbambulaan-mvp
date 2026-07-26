import type { EntityId, ISODateTime } from "./types";

export interface MarketPriceObservation {
  id: EntityId;
  speciesCode: string;
  territoryId: EntityId;
  landingSiteId?: EntityId;
  buyerSegment?: string;
  qualityGrade?: string;
  unitPriceXof: number;
  quantityKg: number;
  observedAt: ISODateTime;
  source: "transaction" | "market_survey" | "buyer_quote" | "integration";
}

export interface PriceIndex {
  speciesCode: string;
  territoryId?: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  minPriceXof: number;
  maxPriceXof: number;
  averagePriceXof: number;
  medianPriceXof: number;
  volumeWeightedPriceXof: number;
  observationCount: number;
  totalQuantityKg: number;
  volatilityPercent: number;
  trend: "up" | "stable" | "down" | "unknown";
}

export interface PricingRecommendation {
  speciesCode: string;
  territoryId?: EntityId;
  recommendedFloorPriceXof: number;
  recommendedTargetPriceXof: number;
  recommendedCeilingPriceXof: number;
  rationale: string[];
  confidenceScore: number;
  generatedAt: ISODateTime;
}

export class PricingAndMarketIntelligenceEngine {
  private readonly observations = new Map<EntityId, MarketPriceObservation>();

  registerObservation(input: MarketPriceObservation) {
    if (this.observations.has(input.id)) return structuredClone(this.observations.get(input.id)!);
    if (input.unitPriceXof <= 0) throw new Error("Le prix unitaire doit être positif.");
    if (input.quantityKg <= 0) throw new Error("La quantité doit être positive.");
    this.observations.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  computeIndex(input: { speciesCode: string; periodStart: ISODateTime; periodEnd: ISODateTime; territoryId?: EntityId }): PriceIndex {
    const rows = [...this.observations.values()].filter((item) =>
      item.speciesCode === input.speciesCode &&
      item.observedAt >= input.periodStart &&
      item.observedAt <= input.periodEnd &&
      (!input.territoryId || item.territoryId === input.territoryId),
    );
    if (rows.length === 0) throw new Error("Aucune observation de prix disponible.");
    const prices = rows.map((item) => item.unitPriceXof).sort((a, b) => a - b);
    const totalQuantityKg = rows.reduce((sum, item) => sum + item.quantityKg, 0);
    const averagePriceXof = rows.reduce((sum, item) => sum + item.unitPriceXof, 0) / rows.length;
    const weighted = rows.reduce((sum, item) => sum + item.unitPriceXof * item.quantityKg, 0) / totalQuantityKg;
    const variance = rows.reduce((sum, item) => sum + Math.pow(item.unitPriceXof - averagePriceXof, 2), 0) / rows.length;
    const medianPriceXof = prices.length % 2 === 0 ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2 : prices[Math.floor(prices.length / 2)];
    const midpoint = Math.floor(rows.length / 2);
    const firstHalf = rows.slice(0, Math.max(1, midpoint));
    const secondHalf = rows.slice(Math.max(1, midpoint));
    const firstAverage = firstHalf.reduce((sum, item) => sum + item.unitPriceXof, 0) / firstHalf.length;
    const secondAverage = secondHalf.length ? secondHalf.reduce((sum, item) => sum + item.unitPriceXof, 0) / secondHalf.length : firstAverage;
    const change = firstAverage ? ((secondAverage - firstAverage) / firstAverage) * 100 : 0;

    return {
      speciesCode: input.speciesCode,
      territoryId: input.territoryId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      minPriceXof: Math.round(prices[0]),
      maxPriceXof: Math.round(prices.at(-1)!),
      averagePriceXof: Math.round(averagePriceXof),
      medianPriceXof: Math.round(medianPriceXof),
      volumeWeightedPriceXof: Math.round(weighted),
      observationCount: rows.length,
      totalQuantityKg,
      volatilityPercent: Math.round((Math.sqrt(variance) / averagePriceXof) * 10000) / 100,
      trend: change > 5 ? "up" : change < -5 ? "down" : "stable",
    };
  }

  recommendPrice(input: { speciesCode: string; periodStart: ISODateTime; periodEnd: ISODateTime; territoryId?: EntityId; qualityPremiumPercent?: number }): PricingRecommendation {
    const index = this.computeIndex(input);
    const premium = 1 + (input.qualityPremiumPercent ?? 0) / 100;
    return {
      speciesCode: input.speciesCode,
      territoryId: input.territoryId,
      recommendedFloorPriceXof: Math.round(index.medianPriceXof * 0.9 * premium),
      recommendedTargetPriceXof: Math.round(index.volumeWeightedPriceXof * premium),
      recommendedCeilingPriceXof: Math.round(index.maxPriceXof * 1.05 * premium),
      rationale: [
        `Prix médian observé : ${index.medianPriceXof} XOF/kg.`,
        `Prix pondéré par les volumes : ${index.volumeWeightedPriceXof} XOF/kg.`,
        `Tendance de marché : ${index.trend}.`,
        `Volatilité : ${index.volatilityPercent} %.`,
      ],
      confidenceScore: Math.min(100, index.observationCount * 8),
      generatedAt: input.periodEnd,
    };
  }

  getTerritorialSpread(input: { speciesCode: string; periodStart: ISODateTime; periodEnd: ISODateTime }) {
    const territories = [...new Set([...this.observations.values()].filter((item) => item.speciesCode === input.speciesCode).map((item) => item.territoryId))];
    return territories.map((territoryId) => this.computeIndex({ ...input, territoryId })).sort((a, b) => b.averagePriceXof - a.averagePriceXof);
  }

  snapshot() {
    return { observations: [...this.observations.values()].map((item) => structuredClone(item)) };
  }
}
