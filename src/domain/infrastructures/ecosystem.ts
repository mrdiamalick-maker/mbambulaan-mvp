import type { EntityId, ISODateTime } from "./types";

export type EcosystemActorKind =
  | "fisher"
  | "crew"
  | "cooperative"
  | "association"
  | "ngo"
  | "private_company"
  | "service_operator"
  | "buyer"
  | "processor"
  | "transporter"
  | "cold_chain_operator"
  | "financial_institution"
  | "insurer"
  | "telecom_operator"
  | "technology_provider"
  | "research_institution"
  | "training_provider"
  | "municipality"
  | "public_agency"
  | "ministry"
  | "donor"
  | "development_partner";

export type EcosystemCapabilityCode =
  | "fund_program"
  | "sponsor_equipment"
  | "deliver_training"
  | "publish_program"
  | "enroll_beneficiary"
  | "verify_eligibility"
  | "manage_grant"
  | "manage_subsidy"
  | "provide_credit"
  | "provide_insurance"
  | "provide_connectivity"
  | "provide_technology"
  | "provide_logistics"
  | "provide_cold_chain"
  | "purchase_output"
  | "transform_output"
  | "certify_actor"
  | "certify_product"
  | "collect_field_data"
  | "run_impact_assessment"
  | "coordinate_intervention"
  | "share_operational_data"
  | "access_sector_metrics";

export interface EcosystemOrganizationProfile {
  id: EntityId;
  organizationId: EntityId;
  kind: EcosystemActorKind;
  displayName: string;
  territoryIds: EntityId[];
  capabilityCodes: EcosystemCapabilityCode[];
  status: "pending" | "verified" | "suspended" | "inactive";
  verifiedAt?: ISODateTime;
  verifiedByActorId?: EntityId;
}

export interface InterventionProgram {
  id: EntityId;
  ownerOrganizationId: EntityId;
  partnerOrganizationIds: EntityId[];
  territoryIds: EntityId[];
  title: string;
  objective:
    | "income"
    | "safety"
    | "cold_chain"
    | "traceability"
    | "formalization"
    | "women_empowerment"
    | "youth_employment"
    | "climate_resilience"
    | "resource_management"
    | "digital_inclusion";
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  budgetAmount?: number;
  currency?: "XOF";
  status: "draft" | "open" | "active" | "completed" | "cancelled";
}

export interface ProgramBeneficiary {
  id: EntityId;
  programId: EntityId;
  actorId?: EntityId;
  organizationId?: EntityId;
  enrolledAt: ISODateTime;
  eligibilityStatus: "pending" | "eligible" | "ineligible" | "suspended";
  eligibilityReason?: string;
}

export interface ProgramCommitment {
  id: EntityId;
  programId: EntityId;
  providerOrganizationId: EntityId;
  beneficiaryId: EntityId;
  commitmentType:
    | "grant"
    | "subsidy"
    | "equipment"
    | "training"
    | "service"
    | "credit"
    | "insurance"
    | "purchase_guarantee";
  quantity?: number;
  amount?: number;
  currency?: "XOF";
  dueAt?: ISODateTime;
  status: "planned" | "approved" | "delivered" | "cancelled" | "defaulted";
}

export interface ProgramOutcomeMetric {
  id: EntityId;
  programId: EntityId;
  territoryId: EntityId;
  metricCode:
    | "beneficiaries_enrolled"
    | "beneficiaries_served"
    | "equipment_delivered"
    | "training_completed"
    | "financing_disbursed_xof"
    | "insured_actors"
    | "jobs_created"
    | "income_change_xof"
    | "loss_avoided_kg"
    | "cold_capacity_added_kg"
    | "traceable_volume_kg";
  value: number;
  measuredAt: ISODateTime;
  sourceEntityIds: EntityId[];
}

export interface EcosystemPartnership {
  id: EntityId;
  leadOrganizationId: EntityId;
  partnerOrganizationId: EntityId;
  scope:
    | "data_sharing"
    | "service_delivery"
    | "financing"
    | "procurement"
    | "training"
    | "research"
    | "impact_measurement"
    | "technology_integration";
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  status: "proposed" | "active" | "suspended" | "ended";
}

export interface EcosystemDomainData {
  organizationProfiles: EcosystemOrganizationProfile[];
  interventionPrograms: InterventionProgram[];
  beneficiaries: ProgramBeneficiary[];
  commitments: ProgramCommitment[];
  outcomeMetrics: ProgramOutcomeMetric[];
  partnerships: EcosystemPartnership[];
}

export function listCapabilitiesForActorKind(
  kind: EcosystemActorKind,
): EcosystemCapabilityCode[] {
  const capabilities: Partial<
    Record<EcosystemActorKind, EcosystemCapabilityCode[]>
  > = {
    association: [
      "publish_program",
      "enroll_beneficiary",
      "deliver_training",
      "coordinate_intervention",
      "collect_field_data",
      "run_impact_assessment",
    ],
    ngo: [
      "fund_program",
      "publish_program",
      "enroll_beneficiary",
      "manage_grant",
      "deliver_training",
      "coordinate_intervention",
      "collect_field_data",
      "run_impact_assessment",
      "access_sector_metrics",
    ],
    private_company: [
      "sponsor_equipment",
      "provide_technology",
      "provide_logistics",
      "provide_cold_chain",
      "purchase_output",
      "transform_output",
      "share_operational_data",
    ],
    donor: [
      "fund_program",
      "manage_grant",
      "run_impact_assessment",
      "access_sector_metrics",
    ],
    development_partner: [
      "fund_program",
      "publish_program",
      "manage_grant",
      "coordinate_intervention",
      "run_impact_assessment",
      "access_sector_metrics",
    ],
    financial_institution: ["provide_credit", "share_operational_data"],
    insurer: ["provide_insurance", "share_operational_data"],
    telecom_operator: ["provide_connectivity", "share_operational_data"],
    technology_provider: [
      "provide_technology",
      "share_operational_data",
      "access_sector_metrics",
    ],
    research_institution: [
      "collect_field_data",
      "run_impact_assessment",
      "access_sector_metrics",
    ],
    training_provider: ["deliver_training", "certify_actor"],
  };

  return capabilities[kind] ?? [];
}
