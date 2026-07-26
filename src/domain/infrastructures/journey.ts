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
  reservation