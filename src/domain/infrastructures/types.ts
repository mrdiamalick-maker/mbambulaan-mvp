export type EntityId = string;
export type ISODateTime = string;

export type InfrastructureCode =
  | "identity_trust"
  | "operational_visibility"
  | "traceability"
  | "availability_allocation"
  | "tension_coordination"
  | "transaction_settlement"
  | "sector_piloting"
  | "interoperability";

export type RoleCode =
  | "declare_return"
  | "confirm_landing"
  | "record_weighing"
  | "verify_weighing"
  | "create_lot"
  | "publish_capacity"
  | "allocate_capacity"
  | "report_tension"
  | "manage_commitment"
  | "approve_transaction"
  | "view_institutional_metrics"
  | "manage_integrations";

export interface Affiliation {
  id: EntityId;
  actorId: EntityId;
  organizationId: EntityId;
  territoryId: EntityId;
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  status: "active" | "suspended" | "ended";
}

export interface RoleAssignment {
  id: EntityId;
  actorId: EntityId;
  role: RoleCode;
  organizationId?: EntityId;
  territoryId?: EntityId;
  grantedAt: ISODateTime;
  grantedByActorId: EntityId;
  status: "active" | "suspended" | "revoked";
}

export interface TrustProfile {
  actorId: EntityId;
  completedCommitments: number;
  failedCommitments: number;
  verifiedActions: number;
  disputedActions: number;
  score: number;
  calculatedAt: ISODateTime;
}

export interface FishingTrip {
  id: EntityId;
  vesselId: EntityId;
  captainActorId: EntityId;
  departureLandingSiteId: EntityId;
  departedAt: ISODateTime;
  expectedReturnAt?: ISODateTime;
  status:
    | "planned"
    | "departed"
    | "return_announced"
    | "completed"
    | "cancelled";
}

export interface TraceabilityEvent {
  id: EntityId;
  entityType: "landing" | "weighing" | "lot";
  entityId: EntityId;
  eventType:
    | "created"
    | "verified"
    | "disputed"
    | "blocked"
    | "released"
    | "split"
    | "merged"
    | "transformed";
  actorId: EntityId;
  occurredAt: ISODateTime;
  evidenceReference?: string;
}

export interface CommercialReservation {
  id: EntityId;
  lotId: EntityId;
  buyerActorId?: EntityId;
  buyerOrganizationId?: EntityId;
  reservedWeightKg: number;
  reservedAt: ISODateTime;
  expiresAt?: ISODateTime;
  status: "proposed" | "reserved" | "confirmed" | "cancelled" | "expired";
}

export interface CommercialAgreement {
  id: EntityId;
  reservationId: EntityId;
  sellerOrganizationId: EntityId;
  buyerOrganizationId: EntityId;
  unitPrice: number;
  currency: "XOF";
  agreedWeightKg: number;
  agreedAt: ISODateTime;
  status: "draft" | "confirmed" | "fulfilled" | "cancelled" | "disputed";
}

export interface Payment {
  id: EntityId;
  agreementId: EntityId;
  amount: number;
  currency: "XOF";
  initiatedAt: ISODateTime;
  settledAt?: ISODateTime;
  externalReference?: string;
  status: "pending" | "settled" | "failed" | "refunded" | "disputed";
}

export interface Commission {
  id: EntityId;
  agreementId: EntityId;
  amount: number;
  currency: "XOF";
  ratePercent?: number;
  status: "calculated" | "due" | "collected" | "waived";
}

export interface TerritorialMetric {
  id: EntityId;
  territoryId: EntityId;
  metricCode:
    | "expected_returns"
    | "confirmed_landings"
    | "available_lot_weight_kg"
    | "open_service_needs"
    | "open_tensions"
    | "loss_avoided_kg"
    | "value_created_xof"
    | "capacity_utilization_rate";
  value: number;
  measuredAt: ISODateTime;
  sourceEntityIds: EntityId[];
}

export interface IntegrationEndpoint {
  id: EntityId;
  organizationId?: EntityId;
  channel:
    | "api"
    | "webhook"
    | "sms"
    | "whatsapp"
    | "ussd"
    | "device"
    | "payment";
  name: string;
  status: "active" | "paused" | "disabled";
  createdAt: ISODateTime;
}

export interface ExternalIdentifier {
  id: EntityId;
  endpointId: EntityId;
  entityType: string;
  entityId: EntityId;
  externalSystem: string;
  externalId: string;
}

export interface InfrastructureDomainData {
  affiliations: Affiliation[];
  roleAssignments: RoleAssignment[];
  trustProfiles: TrustProfile[];
  fishingTrips: FishingTrip[];
  traceabilityEvents: TraceabilityEvent[];
  commercialReservations: CommercialReservation[];
  commercialAgreements: CommercialAgreement[];
  payments: Payment[];
  commissions: Commission[];
  territorialMetrics: TerritorialMetric[];
  integrationEndpoints: IntegrationEndpoint[];
  externalIdentifiers: ExternalIdentifier[];
}
