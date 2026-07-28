export type EcosystemBusinessEventType =
  | "commerce.delivery.confirmed"
  | "commerce.incident.reported"
  | "finance.payment.confirmed"
  | "finance.adjustment.approved"
  | "contracts.contract.registered"
  | "contracts.obligation.breached"
  | "identity.mandate.activated"
  | "governance.decision.recorded"
  | "crisis.recovery.recorded"
  | "crisis.situation.reported"
  | "documents.requirement.missing"
  | "coordination.work.completed"
  | "coordination.notification.failed";

export interface