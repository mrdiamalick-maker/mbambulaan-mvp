import type { EntityId, ISODateTime } from "./types";

export type ForecastGranularity = "day" | "week" | "month";
export type ForecastTrend = "rising" | "stable" | "declining" | "volatile" | "unknown";

export interface DemandObservation {
  id: EntityId;
  buyerActorId?: EntityId;
  buyerOrganizationId?: EntityId;
  buyerSegment: string;
  territoryId: EntityId;
  speciesCode: string;
  requestedQuantityKg: number;
  acceptedQuantityKg?: number;
  fulfilledQuantityKg?: number;
  maximumUnitPriceXof?: number;
  observedAt: ISODateTime;
  source: "order" | "request" | "contract" | "survey" | "integration";
  attributes: Record<string, unknown>;
}

export interface DemandForecast {
  id: EntityId;
  territoryId: EntityId;
  buyerSegment?: string;
  speciesCode: string;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  granularity: ForecastGranularity;
  expectedQuantityKg: number;
  lowerBoundKg: number;
  upperBoundKg: number;
  expectedUnitPriceXof?: number;
  trend: ForecastTrend;
  seasonalityIndex: number;
  confidenceScore: number;
  drivers: string[];
  risks: string[];
  generatedAt: ISODateTime;
}

export interface ProcurementPlan {
  id: EntityId;
  territoryId: EntityId;
  speciesCode: string;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  forecastQuantityKg: number;
  securedQuantityKg: number;
  residualQuantityKg: number;
  recommendedCommitmentQuantityKg: number;
  requiredColdStorageKg: number;
  requiredTransportCapacityKg: number;
  recommendedBuyerSegments: string[];
  actions: string[];
  generatedAt: ISODateTime;
}

export class DemandForecastingEngine {
  private readonly observations = new Map<EntityId, DemandObservation>();
  private readonly forecasts = new Map<EntityId, DemandForecast>();

  registerObservation(input: DemandObservation) {
    if (this.observations.has(input.id)) return structuredClone(this.observations.get(input.id)!);
    if (input.requestedQuantityKg <= 0) throw new Error("La quantité demandée doit être positive.");
    if (input.acceptedQuantityKg !== undefined && input.acceptedQuantityKg < 0) throw new Error("La quantité acceptée ne peut pas être négative.");
    if (input.fulfilledQuantityKg !== undefined && input.fulfilledQuantityKg < 0) throw new Error("La quantité livrée ne peut pas être négative.");
    this.observations.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  generateForecast(input: {
    territoryId: EntityId;
    speciesCode: string;
    historicalStart: ISODateTime;
    historicalEnd: ISODateTime;
    forecastStart: ISODateTime;
    forecastEnd: ISODateTime;
    granularity: ForecastGranularity;
    buyerSegment?: string;
    securedQuantityKg?: number;
  }): DemandForecast {
    const rows = [...this.observations.values()].filter((item) =>
      item.territoryId === input.territoryId &&
      item.speciesCode === input.speciesCode &&
      item.observedAt >= input.historicalStart &&
      item.observedAt <= input.historicalEnd &&
      (!input.buyerSegment || item.buyerSegment === input.buyerSegment),
    );
    if (rows.length === 0) throw new Error("Aucune observation de demande disponible pour établir une prévision.");

    const quantities = rows.map((item) => item.requestedQuantityKg);
    const average = quantities.reduce((sum, value) => sum + value, 0) / quantities.length;
    const recent = rows.slice(Math.max(0, rows.length - Math.min(4, rows.length)));
    const recentAverage = recent.reduce((sum, item) => sum + item.requestedQuantityKg, 0) / recent.length;
    const first = rows.slice(0, Math.max(1, Math.floor(rows.length / 2)));
    const second = rows.slice(Math.max(1, Math.floor(rows.length / 2)));
    const firstAverage = first.reduce((sum, item) => sum + item.requestedQuantityKg, 0) / first.length;
    const secondAverage = second.length ? second.reduce((sum, item) => sum + item.requestedQuantityKg, 0) / second.length : firstAverage;
    const trendDelta = firstAverage ? (secondAverage - firstAverage) / firstAverage : 0;
    const trend: ForecastTrend = trendDelta > 0.15 ? "rising" : trendDelta < -0.15 ? "declining" : "stable";
    const variance = quantities.reduce((sum, value) => sum + Math.pow(value - average, 2), 0) / quantities.length;
    const coefficientOfVariation = average ? Math.sqrt(variance) / average : 0;
    const finalTrend = coefficientOfVariation > 0.45 ? "volatile" : trend;
    const seasonalityIndex = average ? recentAverage / average : 1;
    const expectedQuantityKg = Math.max(0, Math.round(recentAverage * Math.max(0.5, Math.min(1.5, 1 + trendDelta))));
    const spread = Math.max(expectedQuantityKg * 0.15, Math.sqrt(variance));
    const priced = rows.filter((item) => item.maximumUnitPriceXof !== undefined);
    const expectedUnitPriceXof = priced.length
      ? Math.round(priced.reduce((sum, item) => sum + (item.maximumUnitPriceXof ?? 0), 0) / priced.length)
      : undefined;
    const confidenceScore = Math.round(Math.max(10, Math.min(100, rows.length * 6 * (1 - Math.min(0.8, coefficientOfVariation)))));
    const drivers = [
      `${rows.length} observations historiques analysées.`,
      `Indice de saisonnalité : ${Math.round(seasonalityIndex * 100) / 100}.`,
      `Tendance observée : ${finalTrend}.`,
    ];
    const risks: string[] = [];
    if (coefficientOfVariation > 0.45) risks.push("Demande historiquement volatile.");
    if (rows.length < 6) risks.push("Profondeur historique limitée.");
    if ((input.securedQuantityKg ?? 0) < expectedQuantityKg * 0.5) risks.push("Moins de la moitié de la demande anticipée est sécurisée.");

    const forecast: DemandForecast = {
      id: `forecast:${input.territoryId}:${input.speciesCode}:${input.forecastStart}:${input.buyerSegment ?? "all"}`,
      territoryId: input.territoryId,
      buyerSegment: input.buyerSegment,
      speciesCode: input.speciesCode,
      periodStart: input.forecastStart,
      periodEnd: input.forecastEnd,
      granularity: input.granularity,
      expectedQuantityKg,
      lowerBoundKg: Math.max(0, Math.round(expectedQuantityKg - spread)),
      upperBoundKg: Math.round(expectedQuantityKg + spread),
      expectedUnitPriceXof,
      trend: finalTrend,
      seasonalityIndex: Math.round(seasonalityIndex * 100) / 100,
      confidenceScore,
      drivers,
      risks,
      generatedAt: input.forecastStart,
    };
    this.forecasts.set(forecast.id, forecast);
    return structuredClone(forecast);
  }

  buildProcurementPlan(input: {
    forecastId: EntityId;
    securedQuantityKg: number;
    coldStorageCoveragePercent?: number;
    transportCoveragePercent?: number;
  }): ProcurementPlan {
    const forecast = this.requireForecast(input.forecastId);
    if (input.securedQuantityKg < 0) throw new Error("La quantité sécurisée ne peut pas être négative.");
    const residualQuantityKg = Math.max(0, forecast.expectedQuantityKg - input.securedQuantityKg);
    const safetyMargin = forecast.confidenceScore < 60 ? 0.2 : 0.1;
    const recommendedCommitmentQuantityKg = Math.round(residualQuantityKg * (1 + safetyMargin));
    const storageCoverage = Math.max(0, Math.min(100, input.coldStorageCoveragePercent ?? 0)) / 100;
    const transportCoverage = Math.max(0, Math.min(100, input.transportCoveragePercent ?? 0)) / 100;
    const actions: string[] = [];
    if (residualQuantityKg > 0) actions.push(`Sécuriser ${recommendedCommitmentQuantityKg} kg supplémentaires.`);
    if (storageCoverage < 1) actions.push("Réserver une capacité de stockage froid complémentaire.");
    if (transportCoverage < 1) actions.push("Réserver une capacité logistique complémentaire.");
    if (forecast.trend === "rising") actions.push("Anticiper des engagements commerciaux avant la période de tension.");
    if (forecast.trend === "volatile") actions.push("Fractionner les engagements et réviser la prévision plus fréquemment.");

    return {
      id: `procurement:${forecast.id}`,
      territoryId: forecast.territoryId,
      speciesCode: forecast.speciesCode,
      periodStart: forecast.periodStart,
      periodEnd: forecast.periodEnd,
      forecastQuantityKg: forecast.expectedQuantityKg,
      securedQuantityKg: input.securedQuantityKg,
      residualQuantityKg,
      recommendedCommitmentQuantityKg,
      requiredColdStorageKg: Math.round(forecast.expectedQuantityKg * (1 - storageCoverage)),
      requiredTransportCapacityKg: Math.round(forecast.expectedQuantityKg * (1 - transportCoverage)),
      recommendedBuyerSegments: forecast.buyerSegment ? [forecast.buyerSegment] : ["mareyeurs", "transformateurs", "hotels-restaurants", "exportateurs"],
      actions,
      generatedAt: forecast.generatedAt,
    };
  }

  getForecastsForTerritory(territoryId: EntityId) {
    return [...this.forecasts.values()]
      .filter((item) => item.territoryId === territoryId)
      .sort((a, b) => b.expectedQuantityKg - a.expectedQuantityKg)
      .map((item) => structuredClone(item));
  }

  snapshot() {
    return {
      observations: [...this.observations.values()].map((item) => structuredClone(item)),
      forecasts: [...this.forecasts.values()].map((item) => structuredClone(item)),
    };
  }

  private requireForecast(id: EntityId) {
    const item = this.forecasts.get(id);
    if (!item) throw new Error(`Prévision introuvable : ${id}.`);
    return item;
  }
}
