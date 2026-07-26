import type { EntityId, ISODateTime } from "./types";

export type FishingTripOutcome = "successful" | "low_catch" | "empty_return" | "aborted";
export type ResourceTrend = "improving" | "stable" | "declining" | "critical" | "unknown";
export type SustainabilityRiskLevel = "low" | "moderate" | "high" | "critical";
export type RecommendationPriority = "low" | "medium" | "high" | "urgent";

export interface FishingTripObservation {
  id: EntityId;
  vesselId: EntityId;
  fisherActorId: EntityId;
  cooperativeId?: EntityId;
  territoryId: EntityId;
  departureAt: ISODateTime;
  returnAt: ISODateTime;
  durationHours: number;
  estimatedDistanceNm?: number;
  fuelCostXof?: number;
  crewSize?: number;
  fishingZoneIds: EntityId[];
  gearCodes: string[];
  outcome: FishingTripOutcome;
  totalCatchKg: number;
  speciesBreakdownKg: Record<string, number>;
  rejectedCatchKg?: number;
  selfConsumedKg?: number;
  dataQualityScore: number;
  source: "fisher" | "cooperative" | "landing_site" | "integration";
  createdAt: ISODateTime;
}

export interface FishingEffortMetric {
  territoryId: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  tripCount: number;
  totalHoursAtSea: number;
  totalDistanceNm: number;
  totalCatchKg: number;
  catchPerTripKg: number;
  catchPerHourKg: number;
  catchPerNauticalMileKg?: number;
  emptyReturnRatePercent: number;
  lowCatchRatePercent: number;
  averageFuelCostPerKgXof?: number;
  dataQualityScore: number;
}

export interface SpeciesResourceSignal {
  id: EntityId;
  speciesCode: string;
  territoryId: EntityId;
  fishingZoneId?: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  currentCatchKg: number;
  previousCatchKg?: number;
  currentCatchPerHourKg: number;
  previousCatchPerHourKg?: number;
  trend: ResourceTrend;
  riskLevel: SustainabilityRiskLevel;
  confidenceScore: number;
  reasons: string[];
  generatedAt: ISODateTime;
}

export interface FishingZonePressureSignal {
  id: EntityId;
  fishingZoneId: EntityId;
  territoryId: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  tripCount: number;
  totalHoursAtSea: number;
  totalCatchKg: number;
  catchPerHourKg: number;
  previousCatchPerHourKg?: number;
  vesselCount: number;
  pressureIndex: number;
  riskLevel: SustainabilityRiskLevel;
  trend: ResourceTrend;
  reasons: string[];
  generatedAt: ISODateTime;
}

export interface ResourceRecommendation {
  id: EntityId;
  type:
    | "reduce_effort"
    | "temporary_rest"
    | "diversify_species"
    | "change_zone"
    | "improve_data_capture"
    | "activate_income_support"
    | "optimize_post_harvest_value";
  territoryId: EntityId;
  fishingZoneId?: EntityId;
  speciesCode?: string;
  targetActorKinds: string[];
  priority: RecommendationPriority;
  title: string;
  rationale: string[];
  expectedImpact: string[];
  generatedAt: ISODateTime;
  expiresAt?: ISODateTime;
}

export interface ResourceIntelligenceBriefing {
  territoryId: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  effort: FishingEffortMetric;
  speciesSignals: SpeciesResourceSignal[];
  zoneSignals: FishingZonePressureSignal[];
  recommendations: ResourceRecommendation[];
  overallRiskLevel: SustainabilityRiskLevel;
  keyMessages: string[];
  generatedAt: ISODateTime;
}

export interface HistoricalComparisonOptions {
  currentPeriodStart: ISODateTime;
  currentPeriodEnd: ISODateTime;
  previousPeriodStart: ISODateTime;
  previousPeriodEnd: ISODateTime;
  territoryId: EntityId;
}

export class FisheriesResourceAndSustainabilityIntelligenceEngine {
  private readonly trips = new Map<EntityId, FishingTripObservation>();
  private readonly speciesSignals = new Map<EntityId, SpeciesResourceSignal>();
  private readonly zoneSignals = new Map<EntityId, FishingZonePressureSignal>();
  private readonly recommendations = new Map<EntityId, ResourceRecommendation>();

  registerFishingTrip(input: FishingTripObservation) {
    if (this.trips.has(input.id)) return structuredClone(this.trips.get(input.id)!);
    if (input.returnAt <= input.departureAt) throw new Error("Le retour doit être postérieur au départ.");
    if (input.durationHours <= 0) throw new Error("La durée de sortie doit être positive.");
    if (input.totalCatchKg < 0) throw new Error("La capture totale ne peut pas être négative.");
    if (input.dataQualityScore < 0 || input.dataQualityScore > 100) throw new Error("Le score de qualité des données doit être compris entre 0 et 100.");
    const breakdownTotal = Object.values(input.speciesBreakdownKg).reduce((sum, value) => sum + value, 0);
    if (Math.abs(breakdownTotal - input.totalCatchKg) > 0.5) throw new Error("Le détail par espèce ne correspond pas à la capture totale.");
    this.trips.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  computeEffortMetric(input: { territoryId: EntityId; periodStart: ISODateTime; periodEnd: ISODateTime }): FishingEffortMetric {
    const trips = this.getTripsForPeriod(input.territoryId, input.periodStart, input.periodEnd);
    const tripCount = trips.length;
    const totalHoursAtSea = trips.reduce((sum, trip) => sum + trip.durationHours, 0);
    const totalDistanceNm = trips.reduce((sum, trip) => sum + (trip.estimatedDistanceNm ?? 0), 0);
    const totalCatchKg = trips.reduce((sum, trip) => sum + trip.totalCatchKg, 0);
    const emptyReturnCount = trips.filter((trip) => trip.outcome === "empty_return").length;
    const lowCatchCount = trips.filter((trip) => trip.outcome === "low_catch").length;
    const totalFuelCost = trips.reduce((sum, trip) => sum + (trip.fuelCostXof ?? 0), 0);
    const dataQualityScore = tripCount ? Math.round(trips.reduce((sum, trip) => sum + trip.dataQualityScore, 0) / tripCount) : 0;

    return {
      territoryId: input.territoryId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      tripCount,
      totalHoursAtSea,
      totalDistanceNm,
      totalCatchKg,
      catchPerTripKg: tripCount ? Math.round((totalCatchKg / tripCount) * 100) / 100 : 0,
      catchPerHourKg: totalHoursAtSea ? Math.round((totalCatchKg / totalHoursAtSea) * 100) / 100 : 0,
      catchPerNauticalMileKg: totalDistanceNm ? Math.round((totalCatchKg / totalDistanceNm) * 100) / 100 : undefined,
      emptyReturnRatePercent: tripCount ? Math.round((emptyReturnCount / tripCount) * 10000) / 100 : 0,
      lowCatchRatePercent: tripCount ? Math.round((lowCatchCount / tripCount) * 10000) / 100 : 0,
      averageFuelCostPerKgXof: totalCatchKg > 0 && totalFuelCost > 0 ? Math.round(totalFuelCost / totalCatchKg) : undefined,
      dataQualityScore,
    };
  }

  generateSpeciesSignals(options: HistoricalComparisonOptions) {
    const currentTrips = this.getTripsForPeriod(options.territoryId, options.currentPeriodStart, options.currentPeriodEnd);
    const previousTrips = this.getTripsForPeriod(options.territoryId, options.previousPeriodStart, options.previousPeriodEnd);
    const speciesCodes = new Set<string>();
    currentTrips.forEach((trip) => Object.keys(trip.speciesBreakdownKg).forEach((code) => speciesCodes.add(code)));
    previousTrips.forEach((trip) => Object.keys(trip.speciesBreakdownKg).forEach((code) => speciesCodes.add(code)));
    const results: SpeciesResourceSignal[] = [];

    for (const speciesCode of speciesCodes) {
      const currentCatchKg = currentTrips.reduce((sum, trip) => sum + (trip.speciesBreakdownKg[speciesCode] ?? 0), 0);
      const previousCatchKg = previousTrips.reduce((sum, trip) => sum + (trip.speciesBreakdownKg[speciesCode] ?? 0), 0);
      const currentHours = currentTrips.reduce((sum, trip) => sum + trip.durationHours, 0);
      const previousHours = previousTrips.reduce((sum, trip) => sum + trip.durationHours, 0);
      const currentCatchPerHourKg = currentHours ? currentCatchKg / currentHours : 0;
      const previousCatchPerHourKg = previousHours ? previousCatchKg / previousHours : 0;
      const declinePercent = previousCatchPerHourKg > 0 ? ((previousCatchPerHourKg - currentCatchPerHourKg) / previousCatchPerHourKg) * 100 : 0;
      let trend: ResourceTrend = "stable";
      let riskLevel: SustainabilityRiskLevel = "low";
      const reasons: string[] = [];

      if (previousCatchPerHourKg === 0 && currentCatchPerHourKg === 0) {
        trend = "unknown";
        riskLevel = "moderate";
        reasons.push("Données insuffisantes pour établir une tendance.");
      } else if (declinePercent >= 50) {
        trend = "critical";
        riskLevel = "critical";
        reasons.push(`Le rendement par heure a baissé de ${Math.round(declinePercent)} %.`);
      } else if (declinePercent >= 25) {
        trend = "declining";
        riskLevel = "high";
        reasons.push(`Le rendement par heure a baissé de ${Math.round(declinePercent)} %.`);
      } else if (declinePercent >= 10) {
        trend = "declining";
        riskLevel = "moderate";
        reasons.push(`Le rendement par heure a baissé de ${Math.round(declinePercent)} %.`);
      } else if (currentCatchPerHourKg > previousCatchPerHourKg * 1.1) {
        trend = "improving";
        reasons.push("Le rendement par heure progresse.");
      } else reasons.push("Le rendement reste globalement stable.");

      const totalTrips = currentTrips.length + previousTrips.length;
      const averageDataQuality = totalTrips ? [...currentTrips, ...previousTrips].reduce((sum, trip) => sum + trip.dataQualityScore, 0) / totalTrips : 0;
      const confidenceScore = Math.round(Math.min(100, totalTrips * 4) * (averageDataQuality / 100));
      const signal: SpeciesResourceSignal = {
        id: `resource:species:${speciesCode}:${options.territoryId}:${options.currentPeriodEnd}`,
        speciesCode,
        territoryId: options.territoryId,
        periodStart: options.currentPeriodStart,
        periodEnd: options.currentPeriodEnd,
        currentCatchKg: Math.round(currentCatchKg * 100) / 100,
        previousCatchKg: Math.round(previousCatchKg * 100) / 100,
        currentCatchPerHourKg: Math.round(currentCatchPerHourKg * 100) / 100,
        previousCatchPerHourKg: Math.round(previousCatchPerHourKg * 100) / 100,
        trend,
        riskLevel,
        confidenceScore,
        reasons,
        generatedAt: options.currentPeriodEnd,
      };
      this.speciesSignals.set(signal.id, signal);
      results.push(structuredClone(signal));
    }
    return results.sort((a, b) => this.riskRank(b.riskLevel) - this.riskRank(a.riskLevel));
  }

  generateZonePressureSignals(options: HistoricalComparisonOptions) {
    const currentTrips = this.getTripsForPeriod(options.territoryId, options.currentPeriodStart, options.currentPeriodEnd);
    const previousTrips = this.getTripsForPeriod(options.territoryId, options.previousPeriodStart, options.previousPeriodEnd);
    const zoneIds = new Set(currentTrips.flatMap((trip) => trip.fishingZoneIds));
    const results: FishingZonePressureSignal[] = [];

    for (const zoneId of zoneIds) {
      const current = currentTrips.filter((trip) => trip.fishingZoneIds.includes(zoneId));
      const previous = previousTrips.filter((trip) => trip.fishingZoneIds.includes(zoneId));
      const totalHoursAtSea = current.reduce((sum, trip) => sum + trip.durationHours, 0);
      const totalCatchKg = current.reduce((sum, trip) => sum + trip.totalCatchKg, 0);
      const previousHours = previous.reduce((sum, trip) => sum + trip.durationHours, 0);
      const previousCatchKg = previous.reduce((sum, trip) => sum + trip.totalCatchKg, 0);
      const catchPerHourKg = totalHoursAtSea ? totalCatchKg / totalHoursAtSea : 0;
      const previousCatchPerHourKg = previousHours ? previousCatchKg / previousHours : 0;
      const vesselCount = new Set(current.map((trip) => trip.vesselId)).size;
      const effortGrowth = previous.length > 0 ? current.length / previous.length : current.length;
      const yieldRatio = previousCatchPerHourKg > 0 ? catchPerHourKg / previousCatchPerHourKg : 1;
      const pressureIndex = Math.round(Math.min(100, Math.max(0, effortGrowth * 35 + (1 - Math.min(1, yieldRatio)) * 65)));
      let riskLevel: SustainabilityRiskLevel = "low";
      let trend: ResourceTrend = "stable";
      const reasons: string[] = [];
      if (pressureIndex >= 80) {
        riskLevel = "critical";
        trend = "critical";
        reasons.push("L'effort augmente alors que le rendement se dégrade fortement.");
      } else if (pressureIndex >= 60) {
        riskLevel = "high";
        trend = "declining";
        reasons.push("Pression élevée sur la zone.");
      } else if (pressureIndex >= 40) {
        riskLevel = "moderate";
        trend = catchPerHourKg < previousCatchPerHourKg ? "declining" : "stable";
        reasons.push("Pression à surveiller.");
      } else reasons.push("Pression maîtrisée sur la période.");

      const signal: FishingZonePressureSignal = {
        id: `resource:zone:${zoneId}:${options.territoryId}:${options.currentPeriodEnd}`,
        fishingZoneId: zoneId,
        territoryId: options.territoryId,
        periodStart: options.currentPeriodStart,
        periodEnd: options.currentPeriodEnd,
        tripCount: current.length,
        totalHoursAtSea,
        totalCatchKg,
        catchPerHourKg: Math.round(catchPerHourKg * 100) / 100,
        previousCatchPerHourKg: Math.round(previousCatchPerHourKg * 100) / 100,
        vesselCount,
        pressureIndex,
        riskLevel,
        trend,
        reasons,
        generatedAt: options.currentPeriodEnd,
      };
      this.zoneSignals.set(signal.id, signal);
      results.push(structuredClone(signal));
    }
    return results.sort((a, b) => b.pressureIndex - a.pressureIndex);
  }

  generateRecommendations(input: { territoryId: EntityId; periodEnd: ISODateTime; effort: FishingEffortMetric; speciesSignals: SpeciesResourceSignal[]; zoneSignals: FishingZonePressureSignal[] }) {
    const output: ResourceRecommendation[] = [];
    const generatedAt = input.periodEnd;

    if (input.effort.emptyReturnRatePercent >= 20 || input.effort.lowCatchRatePercent >= 40) {
      output.push(this.saveRecommendation({
        id: `resource:rec:post-harvest:${input.territoryId}:${generatedAt}`,
        type: "optimize_post_harvest_value",
        territoryId: input.territoryId,
        targetActorKinds: ["cooperative", "buyer", "logistics"],
        priority: input.effort.emptyReturnRatePercent >= 35 ? "urgent" : "high",
        title: "Créer davantage de valeur avec les volumes disponibles",
        rationale: [`Retours à vide : ${input.effort.emptyReturnRatePercent} %.`, `Faibles captures : ${input.effort.lowCatchRatePercent} %.`],
        expectedImpact: ["Réduire les pertes après débarquement", "Améliorer le prix moyen par kilogramme", "Sécuriser les débouchés avant le retour"],
        generatedAt,
      }));
    }

    if (input.effort.averageFuelCostPerKgXof !== undefined && input.effort.averageFuelCostPerKgXof > 500) {
      output.push(this.saveRecommendation({
        id: `resource:rec:income-support:${input.territoryId}:${generatedAt}`,
        type: "activate_income_support",
        territoryId: input.territoryId,
        targetActorKinds: ["ministry", "public_agency", "cooperative"],
        priority: "high",
        title: "Réduire le risque économique des sorties peu productives",
        rationale: [`Le coût moyen du carburant atteint ${input.effort.averageFuelCostPerKgXof} XOF/kg.`],
        expectedImpact: ["Limiter les sorties destructrices de valeur", "Mieux cibler les aides", "Orienter l'effort vers des alternatives viables"],
        generatedAt,
      }));
    }

    for (const signal of input.speciesSignals.filter((item) => ["high", "critical"].includes(item.riskLevel))) {
      output.push(this.saveRecommendation({
        id: `resource:rec:species:${signal.speciesCode}:${input.territoryId}:${generatedAt}`,
        type: signal.riskLevel === "critical" ? "temporary_rest" : "diversify_species",
        territoryId: input.territoryId,
        speciesCode: signal.speciesCode,
        targetActorKinds: ["fisher", "cooperative", "ministry"],
        priority: signal.riskLevel === "critical" ? "urgent" : "high",
        title: signal.riskLevel === "critical" ? "Envisager un repos temporaire ciblé" : "Diversifier l'effort de pêche",
        rationale: signal.reasons,
        expectedImpact: ["Réduire la pression sur l'espèce", "Préserver le revenu à moyen terme", "Éviter une dégradation irréversible"],
        generatedAt,
      }));
    }

    for (const signal of input.zoneSignals.filter((item) => ["high", "critical"].includes(item.riskLevel))) {
      output.push(this.saveRecommendation({
        id: `resource:rec:zone:${signal.fishingZoneId}:${generatedAt}`,
        type: signal.riskLevel === "critical" ? "temporary_rest" : "change_zone",
        territoryId: input.territoryId,
        fishingZoneId: signal.fishingZoneId,
        targetActorKinds: ["fisher", "cooperative", "ministry"],
        priority: signal.riskLevel === "critical" ? "urgent" : "high",
        title: signal.riskLevel === "critical" ? "Réduire temporairement l'effort sur la zone" : "Réorienter une partie des sorties",
        rationale: signal.reasons,
        expectedImpact: ["Réduire les sorties à faible rendement", "Diminuer la pression locale", "Améliorer le rendement par sortie"],
        generatedAt,
      }));
    }

    if (input.effort.dataQualityScore < 60) {
      output.push(this.saveRecommendation({
        id: `resource:rec:data:${input.territoryId}:${generatedAt}`,
        type: "improve_data_capture",
        territoryId: input.territoryId,
        targetActorKinds: ["fisher", "cooperative", "landing_site"],
        priority: "high",
        title: "Renforcer la collecte des données de sorties et de captures",
        rationale: [`Le score de qualité des données est de ${input.effort.dataQualityScore}/100.`],
        expectedImpact: ["Améliorer la fiabilité des recommandations", "Mieux cibler les zones et espèces", "Renforcer la légitimité des décisions publiques"],
        generatedAt,
      }));
    }
    return output.map((item) => structuredClone(item));
  }

  buildBriefing(options: HistoricalComparisonOptions): ResourceIntelligenceBriefing {
    const effort = this.computeEffortMetric({ territoryId: options.territoryId, periodStart: options.currentPeriodStart, periodEnd: options.currentPeriodEnd });
    const speciesSignals = this.generateSpeciesSignals(options);
    const zoneSignals = this.generateZonePressureSignals(options);
    const recommendations = this.generateRecommendations({ territoryId: options.territoryId, periodEnd: options.currentPeriodEnd, effort, speciesSignals, zoneSignals });
    const allRisks = [...speciesSignals.map((item) => item.riskLevel), ...zoneSignals.map((item) => item.riskLevel)];
    const overallRiskLevel = allRisks.length ? allRisks.sort((a, b) => this.riskRank(b) - this.riskRank(a))[0] : "moderate";
    const keyMessages = [
      `${effort.tripCount} sorties observées pour ${effort.totalCatchKg} kg capturés.`,
      `Rendement moyen : ${effort.catchPerHourKg} kg par heure de mer.`,
      `Retours à vide : ${effort.emptyReturnRatePercent} %.`,
    ];
    if (speciesSignals.some((item) => ["high", "critical"].includes(item.riskLevel))) keyMessages.push("Au moins une espèce présente une dégradation significative du rendement.");
    if (zoneSignals.some((item) => ["high", "critical"].includes(item.riskLevel))) keyMessages.push("Au moins une zone présente une pression de pêche élevée.");
    return { territoryId: options.territoryId, periodStart: options.currentPeriodStart, periodEnd: options.currentPeriodEnd, effort, speciesSignals, zoneSignals, recommendations, overallRiskLevel, keyMessages, generatedAt: options.currentPeriodEnd };
  }

  getFisherWorkspace(input: { fisherActorId: EntityId; periodStart: ISODateTime; periodEnd: ISODateTime }) {
    const trips = [...this.trips.values()].filter((trip) => trip.fisherActorId === input.fisherActorId && trip.departureAt >= input.periodStart && trip.returnAt <= input.periodEnd);
    const totalCatchKg = trips.reduce((sum, trip) => sum + trip.totalCatchKg, 0);
    const totalHours = trips.reduce((sum, trip) => sum + trip.durationHours, 0);
    const totalFuelCostXof = trips.reduce((sum, trip) => sum + (trip.fuelCostXof ?? 0), 0);
    return {
      fisherActorId: input.fisherActorId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      tripCount: trips.length,
      totalCatchKg,
      catchPerHourKg: totalHours ? Math.round((totalCatchKg / totalHours) * 100) / 100 : 0,
      emptyReturnCount: trips.filter((trip) => trip.outcome === "empty_return").length,
      lowCatchCount: trips.filter((trip) => trip.outcome === "low_catch").length,
      totalFuelCostXof,
      fuelCostPerKgXof: totalCatchKg > 0 ? Math.round(totalFuelCostXof / totalCatchKg) : undefined,
      speciesBreakdownKg: trips.reduce<Record<string, number>>((accumulator, trip) => {
        for (const [speciesCode, quantity] of Object.entries(trip.speciesBreakdownKg)) accumulator[speciesCode] = (accumulator[speciesCode] ?? 0) + quantity;
        return accumulator;
      }, {}),
      trips: trips.map((trip) => structuredClone(trip)),
    };
  }

  snapshot() {
    return {
      trips: [...this.trips.values()].map((item) => structuredClone(item)),
      speciesSignals: [...this.speciesSignals.values()].map((item) => structuredClone(item)),
      zoneSignals: [...this.zoneSignals.values()].map((item) => structuredClone(item)),
      recommendations: [...this.recommendations.values()].map((item) => structuredClone(item)),
    };
  }

  private getTripsForPeriod(territoryId: EntityId, periodStart: ISODateTime, periodEnd: ISODateTime) {
    return [...this.trips.values()].filter((trip) => trip.territoryId === territoryId && trip.departureAt >= periodStart && trip.returnAt <= periodEnd);
  }

  private saveRecommendation(input: ResourceRecommendation) {
    this.recommendations.set(input.id, structuredClone(input));
    return input;
  }

  private riskRank(level: SustainabilityRiskLevel) {
    return { low: 1, moderate: 2, high: 3, critical: 4 }[level];
  }
}

export function validateFisheriesResourceIntelligenceModel() {
  const outcomes: FishingTripOutcome[] = ["successful", "low_catch", "empty_return", "aborted"];
  return {
    valid: outcomes.length === 4,
    errors: outcomes.length === 4 ? [] : ["Le catalogue des résultats de sortie est incomplet."],
    summary: {
      tripOutcomeCount: outcomes.length,
      monitoredDimensions: ["capture par sortie", "capture par heure", "capture par mille nautique", "retours à vide", "faibles captures", "coût carburant par kilogramme", "pression par zone", "tendance par espèce"],
      currency: "XOF",
    },
  };
}
