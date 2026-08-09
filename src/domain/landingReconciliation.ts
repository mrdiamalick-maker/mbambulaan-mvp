import type {
  DomainData,
  EntityId,
  ExpectedReturn,
  Landing,
  Weighing,
} from "./types";

export interface LandingReconciliationThresholds {
  significantWeightVariancePercent: number;
  significantArrivalDelayMinutes: number;
}

export interface LandingReconciliationDecision {
  landingId: EntityId;
  expectedReturnId?: EntityId;
  expectedWeightKg?: number;
  actualWeightKg?: number;
  weightVarianceKg?: number;
  weightVariancePercent?: number;
  expectedArrivalAt?: string;
  actualLandingAt: string;
  arrivalDelayMinutes?: number;
  significantWeightVariance: boolean;
  significantArrivalDelay: boolean;
  serviceNeedsReassessmentRequired: boolean;
}

const CONFIDENCE_RANK: Record<Weighing["confidenceLevel"], number> = {
  declared: 1,
  confirmed: 2,
  verified: 3,
};

export function selectReferenceWeighing(
  weighings: Weighing[],
): Weighing | undefined {
  return [...weighings].sort((left, right) => {
    const confidenceDifference =
      CONFIDENCE_RANK[right.confidenceLevel] -
      CONFIDENCE_RANK[left.confidenceLevel];

    if (confidenceDifference !== 0) {
      return confidenceDifference;
    }

    return Date.parse(right.measuredAt) - Date.parse(left.measuredAt);
  })[0];
}

function getExpectedWeightKg(expectedReturn?: ExpectedReturn): number | undefined {
  if (!expectedReturn) {
    return undefined;
  }

  return expectedReturn.estimatedCatch.reduce(
    (total, item) => total + item.estimatedWeightKg,
    0,
  );
}

function getArrivalDelayMinutes(
  expectedReturn: ExpectedReturn | undefined,
  landing: Landing,
): number | undefined {
  if (!expectedReturn) {
    return undefined;
  }

  return Math.round(
    (Date.parse(landing.landedAt) - Date.parse(expectedReturn.expectedAt)) /
      (60 * 1000),
  );
}

export function reconcileLanding(
  data: DomainData,
  landingId: EntityId,
  thresholds: LandingReconciliationThresholds,
): LandingReconciliationDecision {
  const landing = data.landings.find((item) => item.id === landingId);

  if (!landing) {
    throw new Error(`Le débarquement ${landingId} est introuvable.`);
  }

  if (landing.status !== "confirmed") {
    throw new Error("Seul un débarquement confirmé peut être réconcilié.");
  }

  const expectedReturn = landing.expectedReturnId
    ? data.expectedReturns.find((item) => item.id === landing.expectedReturnId)
    : undefined;
  const referenceWeighing = selectReferenceWeighing(
    data.weighings.filter((item) => item.landingId === landingId),
  );
  const expectedWeightKg = getExpectedWeightKg(expectedReturn);
  const actualWeightKg = referenceWeighing?.totalWeightKg;
  const weightVarianceKg =
    expectedWeightKg !== undefined && actualWeightKg !== undefined
      ? actualWeightKg - expectedWeightKg
      : undefined;
  const weightVariancePercent =
    weightVarianceKg !== undefined && expectedWeightKg && expectedWeightKg > 0
      ? (weightVarianceKg / expectedWeightKg) * 100
      : undefined;
  const arrivalDelayMinutes = getArrivalDelayMinutes(expectedReturn, landing);
  const significantWeightVariance =
    weightVariancePercent !== undefined &&
    Math.abs(weightVariancePercent) >=
      thresholds.significantWeightVariancePercent;
  const significantArrivalDelay =
    arrivalDelayMinutes !== undefined &&
    arrivalDelayMinutes >= thresholds.significantArrivalDelayMinutes;

  return {
    landingId: landing.id,
    expectedReturnId: landing.expectedReturnId,
    expectedWeightKg,
    actualWeightKg,
    weightVarianceKg,
    weightVariancePercent,
    expectedArrivalAt: expectedReturn?.expectedAt,
    actualLandingAt: landing.landedAt,
    arrivalDelayMinutes,
    significantWeightVariance,
    significantArrivalDelay,
    serviceNeedsReassessmentRequired: significantWeightVariance,
  };
}
