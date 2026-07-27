import type {
  CommercialAgreement,
  CommercialReservation,
  FishingTrip,
  Payment,
  TerritorialMetric,
  TraceabilityEvent,
} from "./types";
import { InfrastructureOrchestrator } from "./orchestrator";
import { InfrastructureService } from "./service";

export interface SeaToSettlementInput {
  trip: FishingTrip;
  returnAnnouncementAt: string;
  reservation: CommercialReservation;
  availableWeightKg: number;
  agreement: CommercialAgreement;
  commissionRatePercent: number;
  payment?: Payment;
  traceabilityEvents?: TraceabilityEvent[];
  territorialMetrics?: TerritorialMetric[];
}

export interface SeaToSettlementResult {
  tripId: string;
  tripStatus: FishingTrip["status"];
  expectedReturnAt: string;
  reservationId: string;
  agreementId: string;
  commissionAmount: number;
  paymentStatus?: Payment["status"];
  fullySettled?: boolean;
  traceabilityEventIds: string[];
  territorialMetricIds: string[];
}

export class SeaToSettlementJourney {
  private readonly orchestrator: InfrastructureOrchestrator;

  constructor(private readonly service: InfrastructureService) {
    this.orchestrator = new InfrastructureOrchestrator(service);
  }

  execute(input: SeaToSettlementInput): SeaToSettlementResult {
    if (input.trip.status === "cancelled" || input.trip.status === "completed") {
      throw new Error("La campagne ne peut pas entrer dans le parcours de règlement.");
    }
    if (Date.parse(input.returnAnnouncementAt) < Date.parse(input.trip.departedAt)) {
      throw new Error("L'annonce de retour ne peut pas précéder le départ.");
    }

    const openedTrip = this.service.openFishingTrip(input.trip);
    const announcedTrip = this.service.updateFishingTripStatus(
      openedTrip.id,
      "return_announced",
      input.returnAnnouncementAt,
    );
    const transaction = this.orchestrator.secureLotTransaction({
      reservation: input.reservation,
      availableWeightKg: input.availableWeightKg,
      agreement: input.agreement,
      commissionRatePercent: input.commissionRatePercent,
      payment: input.payment,
      traceabilityEvents: input.traceabilityEvents,
      territorialMetrics: input.territorialMetrics,
    });

    return {
      tripId: announcedTrip.id,
      tripStatus: announcedTrip.status,
      expectedReturnAt: input.returnAnnouncementAt,
      reservationId: transaction.reservationId,
      agreementId: transaction.agreementId,
      commissionAmount: transaction.commissionAmount,
      paymentStatus: transaction.paymentStatus,
      fullySettled: transaction.fullySettled,
      traceabilityEventIds: transaction.traceabilityEventIds,
      territorialMetricIds: transaction.territorialMetricIds,
    };
  }
}
