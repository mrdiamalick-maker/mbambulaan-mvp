import type { EntityId, ISODateTime } from "./types";
import type { EcosystemActorKind } from "./ecosystem";
import type { CapabilityMarketplaceData } from "./capability-marketplace";
import type { PlatformOperatingSystemData } from "./platform-operating-system";
import type { AtlasClientSegment } from "./atlas";

export type MbambulaanProductCode =
  | "fisher"
  | "cooperative"
  | "business"
  | "government"
  | "development"
  | "finance"
  | "community"
  | "knowledge"
  | "atlas";

export type ProductLayer =
  | "field_operations"
  | "organization_operations"
  | "ecosystem_coordination"
  | "decision_intelligence";

export interface ProductDefinition {
  id: EntityId;
  code: MbambulaanProductCode;
  name: string;
  layer: ProductLayer;
  targetActorKinds: EcosystemActorKind[];
  buyerActorKinds: EcosystemActorKind[];
  beneficiaryActorKinds: EcosystemActorKind[];
  capabilityCodes: string[];
  requiredProductCodes: MbambulaanProductCode[];
  primaryJobsToBeDone: string[];
  valueOutcomes: string[];
  strategicRole:
    | "adoption"
    | "coordination"
    | "transaction"
    | "control"
    | "intelligence"
    | "network_effect";
  monetizationModes: Array<
    | "subscription"
    | "transaction_fee"
    | "program_license"
    | "institutional_contract"
    | "data_service"
    | "success_fee"
  >;
  status: "draft" | "active" | "retired";
}

export interface ProductPortfolioRule {
  id: EntityId;
  name: string;
  description: string;
  condition: {
    productCode?: MbambulaanProductCode;
    actorKind?: EcosystemActorKind;
    atlasClientSegment?: AtlasClientSegment;
  };
  effect:
    | "require_product"
    | "recommend_product"
    | "forbid_standalone"
    | "require_payer"
    | "require_capability_coverage";
  targetProductCodes?: MbambulaanProductCode[];
  targetCapabilityCodes?: string[];
}

export interface ProductActivationPlan {
  id: EntityId;
  tenantId: EntityId;
  organizationId: EntityId;
  requestedProductCodes: MbambulaanProductCode[];
  recommendedProductCodes: MbambulaanProductCode[];
  mandatoryProductCodes: MbambulaanProductCode[];
  capabilityCodes: string[];
  payerOrganizationId?: EntityId;
  expectedOutcomes: string[];
  rolloutSequence: MbambulaanProductCode[];
  status: "draft" | "validated" | "provisioned" | "rejected";
  createdAt: ISODateTime;
}

export interface ProductPortfolioData {
  products: ProductDefinition[];
  rules: ProductPortfolioRule[];
  activationPlans: ProductActivationPlan[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MbambulaanProductSystem {
  private state: ProductPortfolioData = {
    products: [],
    rules: [],
    activationPlans: [],
  };

  registerProduct(product: ProductDefinition) {
    if (this.state.products.some((item) => item.code === product.code || item.id === product.id)) {
      throw new Error(`Le produit ${product.code} existe déjà.`);
    }
    this.state.products.push(clone(product));
    return clone(product);
  }

  registerRule(rule: ProductPortfolioRule) {
    if (this.state.rules.some((item) => item.id === rule.id)) {
      throw new Error(`La règle ${rule.id} existe déjà.`);
    }
    this.state.rules.push(clone(rule));
    return clone(rule);
  }

  planActivation(input: {
    id: EntityId;
    tenantId: EntityId;
    organizationId: EntityId;
    requestedProductCodes: MbambulaanProductCode[];
    actorKind: EcosystemActorKind;
    payerOrganizationId?: EntityId;
    expectedOutcomes: string[];
    createdAt: ISODateTime;
    marketplace: CapabilityMarketplaceData;
    platform: PlatformOperatingSystemData;
  }): ProductActivationPlan {
    const selectedProducts = this.state.products.filter(
      (item) => input.requestedProductCodes.includes(item.code) && item.status === "active",
    );

    const missingRequestedProducts = input.requestedProductCodes.filter(
      (code) => !selectedProducts.some((item) => item.code === code),
    );
    if (missingRequestedProducts.length > 0) {
      throw new Error(`Produits actifs introuvables : ${missingRequestedProducts.join(", ")}.`);
    }

    const mandatory = new Set<MbambulaanProductCode>();
    const recommended = new Set<MbambulaanProductCode>();

    for (const product of selectedProducts) {
      for (const dependency of product.requiredProductCodes) mandatory.add(dependency);
    }

    for (const rule of this.state.rules) {
      const matchesProduct = !rule.condition.productCode || input.requestedProductCodes.includes(rule.condition.productCode);
      const matchesActor = !rule.condition.actorKind || rule.condition.actorKind === input.actorKind;
      if (!matchesProduct || !matchesActor) continue;

      if (rule.effect === "require_product") {
        for (const code of rule.targetProductCodes ?? []) mandatory.add(code);
      }
      if (rule.effect === "recommend_product") {
        for (const code of rule.targetProductCodes ?? []) recommended.add(code);
      }
      if (rule.effect === "forbid_standalone" && rule.condition.productCode) {
        const hasCompanion = (rule.targetProductCodes ?? []).some(
          (code) => input.requestedProductCodes.includes(code) || mandatory.has(code),
        );
        if (!hasCompanion) {
          throw new Error(`Le produit ${rule.condition.productCode} ne peut pas être activé seul.`);
        }
      }
      if (rule.effect === "require_payer" && !input.payerOrganizationId) {
        throw new Error("Un payeur économique est obligatoire pour ce plan d'activation.");
      }
    }

    const allProductCodes = Array.from(new Set([
      ...input.requestedProductCodes,
      ...mandatory,
      ...recommended,
    ]));

    const allProducts = this.state.products.filter(
      (item) => allProductCodes.includes(item.code) && item.status === "active",
    );
    const capabilityCodes = Array.from(new Set(allProducts.flatMap((item) => item.capabilityCodes)));

    const missingCapabilities = capabilityCodes.filter(
      (code) => !input.marketplace.capabilities.some((item) => item.code === code && item.status === "active"),
    );
    if (missingCapabilities.length > 0) {
      throw new Error(`Capabilities manquantes : ${missingCapabilities.join(", ")}.`);
    }

    const platformTenantExists = input.platform.tenants.some((item) => item.id === input.tenantId);
    if (!platformTenantExists) {
      throw new Error(`Le tenant ${input.tenantId} n'existe pas dans le Platform Operating System.`);
    }

    const rolloutSequence = [...allProducts]
      .sort((a, b) => this.layerWeight(a.layer) - this.layerWeight(b.layer))
      .map((item) => item.code);

    const plan: ProductActivationPlan = {
      id: input.id,
      tenantId: input.tenantId,
      organizationId: input.organizationId,
      requestedProductCodes: input.requestedProductCodes,
      recommendedProductCodes: Array.from(recommended),
      mandatoryProductCodes: Array.from(mandatory),
      capabilityCodes,
      payerOrganizationId: input.payerOrganizationId,
      expectedOutcomes: input.expectedOutcomes,
      rolloutSequence,
      status: "validated",
      createdAt: input.createdAt,
    };

    this.state.activationPlans.push(clone(plan));
    return clone(plan);
  }

  validateAtlasPositioning(productCode: MbambulaanProductCode): {
    valid: boolean;
    reason: string;
  } {
    const product = this.state.products.find((item) => item.code === productCode);
    if (!product) return { valid: false, reason: "Produit introuvable." };
    if (product.code !== "atlas") {
      return {
        valid: true,
        reason: "Le produit appartient au portefeuille opérationnel ou de coordination.",
      };
    }
    if (product.layer !== "decision_intelligence") {
      return {
        valid: false,
        reason: "Atlas doit rester dans la couche d'intelligence décisionnelle.",
      };
    }
    if (product.strategicRole !== "intelligence") {
      return {
        valid: false,
        reason: "Atlas ne doit pas absorber les rôles d'adoption, transaction ou coordination.",
      };
    }
    return {
      valid: true,
      reason: "Atlas complète le système produit sans résumer Mbàmbulaan.",
    };
  }

  snapshot(): ProductPortfolioData {
    return clone(this.state);
  }

  private layerWeight(layer: ProductLayer): number {
    if (layer === "field_operations") return 1;
    if (layer === "organization_operations") return 2;
    if (layer === "ecosystem_coordination") return 3;
    return 4;
  }
}
