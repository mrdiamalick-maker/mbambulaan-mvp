import type {
  CommercialAgreement,
  CommercialReservation,
  Commission,
  InfrastructureDomainData,
  Payment,
  RoleAssignment,
  RoleCode,
  TerritorialMetric,
  TrustProfile,
} from "./types";

export function canActorPerformRole(
  assignments: RoleAssignment[],
  actorId: string,
  role: RoleCode,
  context?: { organizationId?: string; territoryId?: string },
): boolean {
  return assignments.some(
    (assignment) =>
      assignment.actorId === actorId &&
      assignment.role === role &&
      assignment.status === "active" &&
      (!context?.organizationId ||
        !assignment.organizationId ||
        assignment.organizationId === context.organizationId) &&
      (!context?.territoryId ||
        !assignment.territoryId ||
        assignment.territoryId === context.territoryId),
  );
}

export function calculateTrustProfile(input: {
  actorId: string;
  completedCommitments: number;
  failedCommitments: number;
  verifiedActions: number;
  disputedActions: number;
  calculatedAt: string;
}): TrustProfile {
  const positive = input.completedCommitments * 8 + input.verifiedActions * 3;
  const negative = input.failedCommitments * 12 + input.disputedActions * 5;
  const score = Math.max(0, Math.min(100, 50 + positive - negative));

  return { ...input, score };
}

export function assessOperationalVisibility(
  data: InfrastructureDomainData,
  referenceDate: string,
) {
  const referenceTime = Date.parse(referenceDate);
  const activeTrips = data.fishingTrips.filter((trip) =>
    ["departed", "return_announced"].includes(trip.status),
  );
  const overdueTrips = activeTrips.filter(
    (trip) =>
      trip.expectedReturnAt && Date.parse(trip.expectedReturnAt) < referenceTime,
  );

  return {
    activeTripsCount: activeTrips.length,
    announcedReturnsCount: activeTrips.filter(
      (trip) => trip.status === "return_announced",
    ).length,
    overdueTripsCount: overdueTrips.length,
    overdueTripIds: overdueTrips.map((trip) => trip.id),
  };
}

export function buildTraceabilityChain(
  data: InfrastructureDomainData,
  entityType: "landing" | "weighing" | "lot",
  entityId: string,
) {
  return data.traceabilityEvents
    .filter(
      (event) => event.entityType === entityType && event.entityId === entityId,
    )
    .sort(
      (left, right) =>
        Date.parse(left.occurredAt) - Date.parse(right.occurredAt),
    );
}

export function getActiveCommercialReservationWeight(
  reservations: CommercialReservation[],
  lotId: string,
): number {
  return reservations
    .filter(
      (reservation) =>
        reservation.lotId === lotId &&
        ["proposed", "reserved", "confirmed"].includes(reservation.status),
    )
    .reduce((total, reservation) => total + reservation.reservedWeightKg, 0);
}

export function calculateCommission(
  agreement: CommercialAgreement,
  ratePercent: number,
): Commission {
  if (ratePercent < 0 || ratePercent > 100) {
    throw new Error("Le taux de commission doit être compris entre 0 et 100.");
  }

  return {
    id: `commission-${agreement.id}`,
    agreementId: agreement.id,
    amount:
      (agreement.unitPrice * agreement.agreedWeightKg * ratePercent) / 100,
    currency: agreement.currency,
    ratePercent,
    status: "calculated",
  };
}

export function reconcileAgreementPayment(
  agreement: CommercialAgreement,
  payments: Payment[],
) {
  const expectedAmount = agreement.unitPrice * agreement.agreedWeightKg;
  const settledAmount = payments
    .filter(
      (payment) =>
        payment.agreementId === agreement.id && payment.status === "settled",
    )
    .reduce((total, payment) => total + payment.amount, 0);

  return {
    agreementId: agreement.id,
    expectedAmount,
    settledAmount,
    remainingAmount: Math.max(expectedAmount - settledAmount, 0),
    fullySettled: settledAmount >= expectedAmount,
  };
}

export function aggregateTerritorialMetrics(
  metrics: TerritorialMetric[],
  territoryId: string,
  metricCode: TerritorialMetric["metricCode"],
) {
  const selected = metrics.filter(
    (metric) =>
      metric.territoryId === territoryId && metric.metricCode === metricCode,
  );

  return {
    territoryId,
    metricCode,
    total: selected.reduce((sum, metric) => sum + metric.value, 0),
    count: selected.length,
    latestMeasuredAt: selected
      .map((metric) => metric.measuredAt)
      .sort()
      .at(-1),
  };
}

export function findExternalIdentifier(
  data: InfrastructureDomainData,
  externalSystem: string,
  externalId: string,
) {
  return data.externalIdentifiers.find(
    (identifier) =>
      identifier.externalSystem === externalSystem &&
      identifier.externalId === externalId,
  );
}
