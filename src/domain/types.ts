export type EntityId = string;
export type ISODateTime = string;

export type RecordStatus = "active" | "inactive" | "archived";
export type ConfidenceLevel = "declared" | "confirmed" | "verified";

export type ActorType =
  | "fisher"
  | "captain"
  | "landing_site_agent"
  | "weigher"
  | "buyer"
  | "processor"
  | "transporter"
  | "cold_chain_operator"
  | "territorial_coordinator"
  | "institutional_decision_maker";

export interface Actor {
  id: EntityId;
  name: string;
  actorType: ActorType;
  organizationId?: EntityId;
  territoryId: EntityId;
  phone?: string;
  status: RecordStatus;
}

export type OrganizationType =
  | "fisher_organization"
  | "landing_site_management"
  | "buyer"
  | "processor"
  | "transport_provider"
  | "cold_chain_provider"
  | "public_authority"
  | "community_organization";

export interface Organization {
  id: EntityId;
  name: string;
  organizationType: OrganizationType;
  territoryId: EntityId;
  status: RecordStatus;
}

export interface Territory {
  id: EntityId;
  name: string;
  region: string;
  status: RecordStatus;
}

export type LandingSiteOperationalStatus =
  | "operational"
  | "constrained"
  | "saturated"
  | "unavailable";

export interface LandingSiteCapacitySummary {
  iceKgAvailable?: number;
  coldStorageKgAvailable?: number;
  transportKgAvailable?: number;
  processingKgAvailable?: number;
}

export interface LandingSite {
  id: EntityId;
  name: string;
  territoryId: EntityId;
  managerOrganizationId: EntityId;
  capacities: LandingSiteCapacitySummary;
  operationalStatus: LandingSiteOperationalStatus;
}

export type VesselStatus = "operational" | "maintenance" | "inactive";

export interface Vessel {
  id: EntityId;
  name: string;
  registrationNumber: string;
  ownerOrganizationId: EntityId;
  homeLandingSiteId: EntityId;
  status: VesselStatus;
}

export interface CatchEstimate {
  species: string;
  estimatedWeightKg: number;
}

export type ExpectedReturnStatus =
  | "announced"
  | "approaching"
  | "arrived"
  | "cancelled";

export interface ExpectedReturn {
  id: EntityId;
  vesselId: EntityId;
  expectedLandingSiteId: EntityId;
  expectedAt: ISODateTime;
  estimatedCatch: CatchEstimate[];
  status: ExpectedReturnStatus;
  createdByActorId: EntityId;
  createdAt: ISODateTime;
}

export type ServiceNeedType = "ice" | "cold_storage" | "transport" | "handling";
export type ServiceNeedUnit = "kg" | "vehicle" | "team" | "slot";
export type ServiceNeedPriority = "normal" | "urgent" | "critical";
export type ServiceNeedStatus =
  | "open"
  | "partially_allocated"
  | "allocated"
  | "fulfilled"
  | "cancelled";

export interface ServiceNeed {
  id: EntityId;
  expectedReturnId: EntityId;
  requestedByActorId: EntityId;
  needType: ServiceNeedType;
  requestedQuantity: number;
  unit: ServiceNeedUnit;
  neededAt: ISODateTime;
  territoryId: EntityId;
  landingSiteId?: EntityId;
  priority: ServiceNeedPriority;
  status: ServiceNeedStatus;
  note?: string;
  createdAt: ISODateTime;
}

export type ServiceAllocationStatus =
  | "proposed"
  | "reserved"
  | "in_progress"
  | "fulfilled"
  | "cancelled"
  | "expired";

export interface ServiceAllocation {
  id: EntityId;
  serviceNeedId: EntityId;
  capacityId: EntityId;
  allocatedQuantity: number;
  unit: ServiceNeedUnit;
  providerOrganizationId: EntityId;
  beneficiaryOrganizationId?: EntityId;
  beneficiaryActorId?: EntityId;
  allocatedByActorId: EntityId;
  allocatedAt: ISODateTime;
  expiresAt?: ISODateTime;
  status: ServiceAllocationStatus;
}

export type ServiceExecutionStatus = "confirmed" | "contested";

export interface ServiceExecution {
  id: EntityId;
  allocationId: EntityId;
  executedQuantity: number;
  executedAt: ISODateTime;
  confirmedByActorId: EntityId;
  evidence: OutcomeEvidence[];
  status: ServiceExecutionStatus;
}

export type LandingStatus = "draft" | "confirmed" | "cancelled";

export interface Landing {
  id: EntityId;
  expectedReturnId?: EntityId;
  vesselId: EntityId;
  landingSiteId: EntityId;
  landedAt: ISODateTime;
  status: LandingStatus;
  confirmedByActorId: EntityId;
}

export type WeighingMethod = "digital_scale" | "mechanical_scale" | "estimated";

export interface Weighing {
  id: EntityId;
  landingId: EntityId;
  measuredAt: ISODateTime;
  totalWeightKg: number;
  method: WeighingMethod;
  confidenceLevel: ConfidenceLevel;
  verifiedByActorId?: EntityId;
}

export type QualityGrade = "premium" | "standard" | "processing";
export type ConservationStatus = "fresh" | "iced" | "chilled" | "at_risk";
export type LotAvailabilityStatus =
  | "available"
  | "partially_reserved"
  | "reserved"
  | "sold"
  | "unavailable";

export interface Lot {
  id: EntityId;
  landingId: EntityId;
  species: string;
  weightKg: number;
  qualityGrade: QualityGrade;
  conservationStatus: ConservationStatus;
  availabilityStatus: LotAvailabilityStatus;
  askingPricePerKg?: number;
  currency?: "XOF";
}

export type MarketNeedStatus = "open" | "matched" | "partially_matched" | "closed";

export interface MarketNeed {
  id: EntityId;
  actorId?: EntityId;
  organizationId?: EntityId;
  species: string;
  quantityKg: number;
  territoryId: EntityId;
  neededBy: ISODateTime;
  status: MarketNeedStatus;
  relatedLotIds: EntityId[];
}

export type CapacityType = "ice" | "cold_storage" | "transport" | "processing";
export type CapacityStatus = "available" | "partially_available" | "allocated" | "unavailable";

export interface Capacity {
  id: EntityId;
  providerOrganizationId: EntityId;
  capacityType: CapacityType;
  territoryId: EntityId;
  landingSiteId?: EntityId;
  initialQuantity: number;
  availableQuantity: number;
  unit: "kg" | "vehicle" | "slot";
  availableFrom: ISODateTime;
  availableUntil?: ISODateTime;
  declaredByActorId: EntityId;
  createdAt: ISODateTime;
  status: CapacityStatus;
}

export type TensionType =
  | "ice_shortage"
  | "cold_storage_shortage"
  | "transport_shortage"
  | "landing_site_saturation"
  | "market_risk"
  | "equipment_failure";

export type Severity = "low" | "medium" | "high" | "critical";
export type TensionStatus = "open" | "coordinating" | "resolved" | "cancelled";

export interface Tension {
  id: EntityId;
  tensionType: TensionType;
  severity: Severity;
  territoryId: EntityId;
  relatedEntityType:
    | "expected_return"
    | "service_need"
    | "landing"
    | "lot"
    | "capacity"
    | "market_need";
  relatedEntityId: EntityId;
  description: string;
  status: TensionStatus;
  reportedByActorId: EntityId;
  reportedAt: ISODateTime;
}

export type CommitmentStatus = "proposed" | "accepted" | "in_progress" | "completed" | "cancelled";

export interface Commitment {
  id: EntityId;
  tensionId: EntityId;
  actorId?: EntityId;
  organizationId?: EntityId;
  action: string;
  dueAt: ISODateTime;
  status: CommitmentStatus;
  completedAt?: ISODateTime;
}

export type OutcomeType =
  | "loss_avoided"
  | "capacity_reallocated"
  | "market_matched"
  | "incident_resolved"
  | "service_continuity_restored";

export interface OutcomeEvidence {
  label: string;
  reference?: string;
  confidenceLevel: ConfidenceLevel;
}

export interface Outcome {
  id: EntityId;
  relatedEntityType:
    | "tension"
    | "service_need"
    | "service_allocation"
    | "service_execution"
    | "landing"
    | "lot"
    | "market_need";
  relatedEntityId: EntityId;
  outcomeType: OutcomeType;
  description: string;
  valueSavedKg?: number;
  valueCreated?: number;
  currency?: "XOF";
  recordedAt: ISODateTime;
  evidence: OutcomeEvidence[];
}

export interface DomainData {
  actors: Actor[];
  organizations: Organization[];
  territories: Territory[];
  landingSites: LandingSite[];
  vessels: Vessel[];
  expectedReturns: ExpectedReturn[];
  serviceNeeds: ServiceNeed[];
  serviceAllocations: ServiceAllocation[];
  serviceExecutions: ServiceExecution[];
  landings: Landing[];
  weighings: Weighing[];
  lots: Lot[];
  marketNeeds: MarketNeed[];
  capacities: Capacity[];
  tensions: Tension[];
  commitments: Commitment[];
  outcomes: Outcome[];
}
