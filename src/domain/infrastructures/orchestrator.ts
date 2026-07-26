import type {
  CommercialAgreement,
  CommercialReservation,
  InfrastructureDomainData,
  Payment,
  TerritorialMetric,
  TraceabilityEvent,
} from "./types";
import { InfrastructureService } from "./service";

export interface SecureLotTransactionInput {
  reservation: CommercialReservation;
  availableWeightKg: number;
  agreement: CommercialAgreement;
  commissionRatePercent: number;
  payment?: Payment;
  traceabilityEvents?: TraceabilityEvent[];
  territorialMetrics?: TerritorialMetric[];
}

export interface SecureLotTransactionResult {
  reservationId: string;
  agreementId: string;
  commissionAmount: number;
  paymentStatus?: Payment["status"];
  fullySettled?: boolean;
  traceabilityEventIds: string[];
  territorialMetricIds: string[];
}

export class InfrastructureOrchestrator {
  constructor(private readonly service: InfrastructureService) {}

  secureLotTransaction(input: SecureLotTransactionInput): SecureLotTransactionResult {
    this.service.reserveLot(input.reservation, input.availableWeightKg);

    const { agreement, commission } = this.service.confirmAgreement(
      input.agreement,
      input.commissionRatePercent,
    );

    const traceabilityEventIds = (input.traceabilityEvents ?? []).map(
      (event) => this.service.appendTraceabilityEvent(event).id,
    );

    const territorialMetricIds = (input.territorialMetrics ?? []).map(
      (metric) => this.service.registerTerritorialMetric(metric).id,
    );

    const paymentResult = input.payment
      ? this.service.registerPayment(input.payment)
      : undefined;

    return {
      reservationId: input.reservation.id,
      agreementId: agreement.id,
      commissionAmount: commission.amount,
      paymentStatus: paymentResult?.payment.status,
      fullySettled: paymentResult?.reconciliation.fullySettled,
      traceabilityEventIds,
      territorialMetricIds,
    };
  }

  getInfrastructureSnapshot(): InfrastructureDomainData {
    return this.service.snapshot();
  }
}
