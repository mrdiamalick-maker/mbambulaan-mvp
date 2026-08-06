import type { Observation, Priority, TrustLevel } from "./types";

export type MbambulaanEvent =
  | {
      id: string;
      type: "infrastructure_status_changed";
      occurredAt: string;
      territoryId: string;
      actorId: string;
      infrastructureId: string;
      status: "operationnelle" | "fragile" | "indisponible";
      availableCapacity: number;
      source: string;
      channel: Observation["channel"];
    }
  | {
      id: string;
      type: "fishing_trip_return_announced";
      occurredAt: string;
      territoryId: string;
      actorId: string;
      tripId: string;
      expectedReturnAt: string;
      source: string;
      channel: Observation["channel"];
    }
  | {
      id: string;
      type: "communication_requested";
      occurredAt: string;
      territoryId: string;
      actorId: string;
      subject: string;
      requestedChannel: "appel" | "sms" | "whatsapp" | "poste_quai";
      source: string;
      channel: Observation["channel"];
    };

export interface EventAssessment {
  title: string;
  description: string;
  category: Observation["category"];
  priority: Priority;
  trust: TrustLevel;
  nextStep: string;
}