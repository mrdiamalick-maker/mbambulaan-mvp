export type BusinessEventType =
  | "signal_received"
  | "situation_created"
  | "situation_prioritized"
  | "coordination_started"
  | "capacity_risk_detected"
  | "landing_expected"
  | "report_generated";


export interface BusinessEvent {
  id: string;
  type: BusinessEventType;
  territoryId?: string;
  actorId?: string;
  situationId?: string;
  createdAt: string;
  payload: Record<string, unknown>;
}