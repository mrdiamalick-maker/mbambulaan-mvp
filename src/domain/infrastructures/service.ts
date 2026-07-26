import type {
  Affiliation,
  CommercialAgreement,
  CommercialReservation,
  Commission,
  ExternalIdentifier,
  FishingTrip,
  InfrastructureDomainData,
  IntegrationEndpoint,
  Payment,
  RoleAssignment,
  TerritorialMetric,
  TraceabilityEvent,
  TrustProfile,
} from "./types";
import {
  assessOperationalVisibility,
  calculateCommission,
  calculateTrustProfile,
  canActorPerformRole,
  reconcileAgreementPayment,
} from "./engines";

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertUniqueId<T extends { id: string }>(items: T[], id: string, label: string) {
  if (items.some((item) => item.id === id)) {
    throw new Error(`${label} ${id} existe déjà.`);
  }
}

export class InfrastructureService {
  private state: InfrastructureDomainData;

  constructor(initialState?: Partial<InfrastructureDomainData>) {
    this.state = {
      affiliations: initialState?.affiliations ?? [],
      roleAssignments: initialState?.roleAssignments ?? [],
      trustProfiles: initialState?.trustProfiles ?? [],
      fishingTrips: initialState?.fishingTrips ?? [],
      traceabilityEvents: initialState?.traceabilityEvents ?? [],
      commercialReservations: initialState?.commercialReservations ?? [],
      commercialAgreements: initialState?.commercialAgreements ?? [],
      payments: initialState?.payments ?? [],
      commissions: initialState?.commissions ?? [],
      territorialMetrics: initialState?.territorialMetrics ?? [],
      integrationEndpoints: initialState?.integrationEndpoints ?? [],
      externalIdentifiers: initialState?.externalIdentifiers ?? [],
    };
  }

  snapshot(): InfrastructureDomainData {
    return clone(this.state);
  }

  registerAffiliation(affiliation: Affiliation) {
    assertUniqueId(this.state.affiliations, affiliation.id, "L'affiliation");
    this.state.affiliations.push(clone(affiliation));
    return clone(affiliation);
  }

  assignRole(assignment: RoleAssignment) {
    assertUniqueId(this.state.roleAssignments, assignment.id, "L'attribution de rôle");
    this.state.roleAssignments.push(clone(assignment));
    return clone(assignment);
  }

  assertActorCan(actorId: string, role: RoleAssignment["role"], context?: { organizationId?: string; territoryId?: string }) {
    if (!canActorPerformRole(this.state.roleAssignments, actorId, role, context)) {
      throw new Error(`L'acteur ${actorId} n'est pas habilité pour ${role}.`);
    }
  }

  refreshTrustProfile(input: Omit<TrustProfile, "score">) {
    const profile = calculateTrustProfile(input);
    const existingIndex = this.state.trustProfiles.findIndex(
      (item) => item.actorId === profile.actorId,
    );

    if (existingIndex >= 0) {
      this.state.trustProfiles[existingIndex] = profile;
    } else {
      this.state.trustProfiles.push(profile);
    }

    return clone(profile);
  }

  openFishingTrip(trip: FishingTrip) {
    assertUniqueId(this.state.fishingTrips, trip.id, "La campagne");
    this.state.fishingTrips.push(clone(trip));
    return clone(trip);
  }

  updateFishingTripStatus(tripId: string, status: FishingTrip["status"], expectedReturnAt?: string) {
    const trip = this.state.fishingTrips.find((item) => item.id === tripId);
    if (!trip) throw new Error(`La campagne ${tripId} est introuvable.`);
    trip.status = status;
    if (expectedReturnAt) trip.expectedReturnAt = expectedReturnAt;
    return clone(trip);
  }

  appendTraceabilityEvent(event: TraceabilityEvent) {
    assertUniqueId(this.state.traceabilityEvents, event.id, "L'événement de traçabilité");
    this.state.traceabilityEvents.push(clone(event));
    return clone(event);
  }

  reserveLot(reservation: CommercialReservation, availableWeightKg: number) {
    assertUniqueId(this.state.commercialReservations, reservation.id, "La réservation");
    const activeWeight = this.state.commercialReservations
      .filter(
        (item) =>
          item.lotId === reservation.lotId &&
          ["proposed", "reserved", "confirmed"].includes(item.status),
      )
      .reduce((sum, item) => sum + item.reservedWeightKg, 0);

    if (activeWeight + reservation.reservedWeightKg > availableWeightKg) {
      throw new Error("La quantité réservée dépasse le poids disponible du lot.");
    }

    this.state.commercialReservations.push(clone(reservation));
    return clone(reservation);
  }

  confirmAgreement(agreement: CommercialAgreement, commissionRatePercent: number) {
    assertUniqueId(this.state.commercialAgreements, agreement.id, "L'accord commercial");
    if (agreement.status !== "confirmed") {
      throw new Error("Seul un accord confirmé peut être enregistré.");
    }

    this.state.commercialAgreements.push(clone(agreement));
    const commission = calculateCommission(agreement, commissionRatePercent);
    this.state.commissions.push(commission);

    return { agreement: clone(agreement), commission: clone(commission) };
  }

  registerPayment(payment: Payment) {
    assertUniqueId(this.state.payments, payment.id, "Le paiement");
    const agreement = this.state.commercialAgreements.find(
      (item) => item.id === payment.agreementId,
    );
    if (!agreement) {
      throw new Error(`L'accord ${payment.agreementId} est introuvable.`);
    }
    this.state.payments.push(clone(payment));
    return {
      payment: clone(payment),
      reconciliation: reconcileAgreementPayment(agreement, this.state.payments),
    };
  }

  registerTerritorialMetric(metric: TerritorialMetric) {
    assertUniqueId(this.state.territorialMetrics, metric.id, "La métrique");
    this.state.territorialMetrics.push(clone(metric));
    return clone(metric);
  }

  registerIntegrationEndpoint(endpoint: IntegrationEndpoint) {
    assertUniqueId(this.state.integrationEndpoints, endpoint.id, "Le point d'intégration");
    this.state.integrationEndpoints.push(clone(endpoint));
    return clone(endpoint);
  }

  mapExternalIdentifier(identifier: ExternalIdentifier) {
    assertUniqueId(this.state.externalIdentifiers, identifier.id, "L'identifiant externe");
    const duplicate = this.state.externalIdentifiers.some(
      (item) =>
        item.externalSystem === identifier.externalSystem &&
        item.externalId === identifier.externalId,
    );
    if (duplicate) {
      throw new Error("Cet identifiant externe est déjà associé.");
    }
    this.state.externalIdentifiers.push(clone(identifier));
    return clone(identifier);
  }

  getOperationalVisibility(referenceDate: string) {
    return assessOperationalVisibility(this.state, referenceDate);
  }

  getAgreementBalance(agreementId: string) {
    const agreement = this.state.commercialAgreements.find(
      (item) => item.id === agreementId,
    );
    if (!agreement) throw new Error(`L'accord ${agreementId} est introuvable.`);
    return reconcileAgreementPayment(agreement, this.state.payments);
  }

  getCommission(agreementId: string): Commission | undefined {
    const commission = this.state.commissions.find(
      (item) => item.agreementId === agreementId,
    );
    return commission ? clone(commission) : undefined;
  }
}
