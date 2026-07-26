import type { EntityId, ISODateTime } from "./types";
import type { EcosystemActorKind } from "./ecosystem";
import type { RevenueModel, BillingUnit } from "./revenue-architecture";

export type CapabilityCategory =
  | "identity_and_trust"
  | "coordination"
  | "traceability"
  | "availability_and_allocation"
  | "transaction_and_settlement"
  | "program_management"
  | "impact_measurement"
  | "sector_steering"
  | "data_and_intelligence"
  | "interoperability";

export interface CapabilityDefinition {
  id: EntityId;
  code: string;
  name: string;
  category: CapabilityCategory;
  description: string;
  targetActorKinds: EcosystemActorKind[];
  requiredCapabilityCodes: string[];
  incompatibleCapabilityCodes: string[];
  deliveredOutcomes: string[];
  valueMetrics: string[];
  serviceLevel?: {
    availabilityPercent?: number;
    responseTimeHours?: number;
    supportLevel?: "standard" | "priority" | "critical";
  };
  commercialModel: {
    revenueModels: RevenueModel[];
    billingUnits: BillingUnit[];
    setupFeeXof?: number;
    minimumMonthlyXof?: number;
    variableRatePercent?: number;
  };
  status: "draft" | "active" | "deprecated";
}

export interface CapabilityBundle {
  id: EntityId;
  code: string;
  name: string;
  targetActorKinds: EcosystemActorKind[];
  capabilityCodes: string[];
  businessOutcome: string;
  recommendedContractMonths?: number;
  status: "draft" | "active" | "retired";
}

export interface CapabilityActivationRequest {
  id: EntityId;
  organizationId: EntityId;
  requestedCapabilityCodes: string[];
  requestedBundleId?: EntityId;
  requestedAt: ISODateTime;
  requestedByActorId: EntityId;
  businessNeed: string;
  expectedOutcomes: string[];
  payerOrganizationId?: EntityId;
  status: "requested" | "assessed" | "approved" | "rejected" | "provisioned";
}

export interface CapabilityActivationAssessment {
  requestId: EntityId;
  viable: boolean;
  missingPrerequisites: string[];
  commercialWarnings: string[];
  recommendedCapabilityCodes: string[];
  recommendedRevenueModels: RevenueModel[];
  estimatedMinimumMonthlyXof: number;
}

export interface CapabilityMarketplaceData {
  capabilities: CapabilityDefinition[];
  bundles: CapabilityBundle[];
  activationRequests: CapabilityActivationRequest[];
  assessments: CapabilityActivationAssessment[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class CapabilityMarketplace {
  private state: CapabilityMarketplaceData = {
    capabilities: [],
    bundles: [],
    activationRequests: [],
    assessments: [],
  };

  registerCapability(capability: CapabilityDefinition) {
    if (this.state.capabilities.some((item) => item.code === capability.code)) {
      throw new Error(`La capability ${capability.code} existe déjà.`);
    }
    this.state.capabilities.push(clone(capability));
    return clone(capability);
  }

  registerBundle(bundle: CapabilityBundle) {
    if (this.state.bundles.some((item) => item.id === bundle.id || item.code === bundle.code)) {
      throw new Error(`Le bundle ${bundle.code} existe déjà.`);
    }
    const missing = bundle.capabilityCodes.filter(
      (code) => !this.state.capabilities.some((item) => item.code === code && item.status === "active"),
    );
    if (missing.length > 0) {
      throw new Error(`Capabilities actives manquantes : ${missing.join(", ")}.`);
    }
    this.state.bundles.push(clone(bundle));
    return clone(bundle);
  }

  requestActivation(request: CapabilityActivationRequest) {
    if (this.state.activationRequests.some((item) => item.id === request.id)) {
      throw new Error(`La demande ${request.id} existe déjà.`);
    }
    this.state.activationRequests.push(clone(request));
    return clone(request);
  }

  assessActivation(requestId: EntityId): CapabilityActivationAssessment {
    const request = this.state.activationRequests.find((item) => item.id === requestId);
    if (!request) throw new Error(`La demande ${requestId} est introuvable.`);

    const bundleCodes = request.requestedBundleId
      ? this.state.bundles.find((item) => item.id === request.requestedBundleId)?.capabilityCodes ?? []
      : [];
    const requestedCodes = Array.from(
      new Set([...request.requestedCapabilityCodes, ...bundleCodes]),
    );
    const selected = this.state.capabilities.filter((item) => requestedCodes.includes(item.code));
    const unknown = requestedCodes.filter(
      (code) => !this.state.capabilities.some((item) => item.code === code && item.status === "active"),
    );
    const required = new Set(selected.flatMap((item) => item.requiredCapabilityCodes));
    const missingPrerequisites = [
      ...unknown,
      ...Array.from(required).filter((code) => !requestedCodes.includes(code)),
    ];

    const incompatibilities = selected.flatMap((item) =>
      item.incompatibleCapabilityCodes.filter((code) => requestedCodes.includes(code)),
    );
    const commercialWarnings = Array.from(new Set(incompatibilities)).map(
      (code) => `Incompatibilité détectée avec ${code}.`,
    );

    if (!request.payerOrganizationId) {
      commercialWarnings.push("Aucun payeur économique n'est renseigné.");
    }

    const estimatedMinimumMonthlyXof = selected.reduce(
      (sum, item) => sum + (item.commercialModel.minimumMonthlyXof ?? 0),
      0,
    );
    const recommendedRevenueModels = Array.from(
      new Set(selected.flatMap((item) => item.commercialModel.revenueModels)),
    );
    const recommendedCapabilityCodes = Array.from(
      new Set([...requestedCodes, ...missingPrerequisites.filter((code) => !unknown.includes(code))]),
    );

    const assessment: CapabilityActivationAssessment = {
      requestId,
      viable: missingPrerequisites.length === 0 && commercialWarnings.length === 0,
      missingPrerequisites,
      commercialWarnings,
      recommendedCapabilityCodes,
      recommendedRevenueModels,
      estimatedMinimumMonthlyXof,
    };

    request.status = "assessed";
    this.state.assessments.push(clone(assessment));
    return clone(assessment);
  }

  snapshot(): CapabilityMarketplaceData {
    return clone(this.state);
  }
}
