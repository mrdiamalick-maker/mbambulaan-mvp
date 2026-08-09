import type { EntityId, ISODateTime } from "./types";
import type {
  MbambulaanProductCode,
  ProductDefinition,
  ProductPortfolioData,
} from "./mbambulaan-product-system";
import type { CapabilityMarketplaceData } from "./capability-marketplace";
import type { PlatformOperatingSystemData } from "./platform-operating-system";
import type { AtlasData } from "./atlas";

export type CompositionConstraintKind =
  | "requires_capability"
  | "requires_product"
  | "requires_active_tenant"
  | "requires_payer"
  | "requires_data_coverage"
  | "requires_atlas_workspace"
  | "forbids_standalone";

export interface ProductCompositionConstraint {
  id: EntityId;
  productCode: MbambulaanProductCode;
  kind: CompositionConstraintKind;
  targetCodes: string[];
  description: string;
  severity: "warning" | "blocking";
}

export interface ProductCompositionRequest {
  id: EntityId;
  tenantId: EntityId;
  organizationId: EntityId;
  requestedProductCodes: MbambulaanProductCode[];
  payerOrganizationId?: EntityId;
  expectedOutcomes: string[];
  createdAt: ISODateTime;
}

export interface ProductCompositionDecision {
  id: EntityId;
  requestId: EntityId;
  viable: boolean;
  selectedProductCodes: MbambulaanProductCode[];
  requiredProductCodes: MbambulaanProductCode[];
  requiredCapabilityCodes: string[];
  warnings: string[];
  blockers: string[];
  rolloutSequence: MbambulaanProductCode[];
  atlasPremiumPositioning?: {
    enabled: boolean;
    reason: string;
    requiredWorkspaceCount: number;
  };
  decidedAt: ISODateTime;
}

export interface ProductCompositionData {
  constraints: ProductCompositionConstraint[];
  requests: ProductCompositionRequest[];
  decisions: ProductCompositionDecision[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class ProductCompositionEngine {
  private state: ProductCompositionData = {
    constraints: [],
    requests: [],
    decisions: [],
  };

  registerConstraint(constraint: ProductCompositionConstraint) {
    if (this.state.constraints.some((item) => item.id === constraint.id)) {
      throw new Error(`La contrainte ${constraint.id} existe déjà.`);
    }
    this.state.constraints.push(clone(constraint));
    return clone(constraint);
  }

  compose(input: {
    request: ProductCompositionRequest;
    portfolio: ProductPortfolioData;
    marketplace: CapabilityMarketplaceData;
    platform: PlatformOperatingSystemData;
    atlas: AtlasData;
    decidedAt: ISODateTime;
  }): ProductCompositionDecision {
    if (this.state.requests.some((item) => item.id === input.request.id)) {
      throw new Error(`La demande ${input.request.id} existe déjà.`);
    }

    this.state.requests.push(clone(input.request));

    const selectedProducts = input.portfolio.products.filter(
      (item) => input.request.requestedProductCodes.includes(item.code) && item.status === "active",
    );
    const blockers: string[] = [];
    const warnings: string[] = [];

    const unknownProducts = input.request.requestedProductCodes.filter(
      (code) => !selectedProducts.some((item) => item.code === code),
    );
    if (unknownProducts.length > 0) {
      blockers.push(`Produits actifs introuvables : ${unknownProducts.join(", ")}.`);
    }

    const requiredProductCodes = Array.from(
      new Set(selectedProducts.flatMap((item) => item.requiredProductCodes)),
    );
    const requiredCapabilityCodes = Array.from(
      new Set(
        [...selectedProducts, ...input.portfolio.products.filter((item) => requiredProductCodes.includes(item.code))]
          .flatMap((item) => item.capabilityCodes),
      ),
    );

    const tenant = input.platform.tenants.find((item) => item.id === input.request.tenantId);
    if (!tenant || tenant.status !== "active") {
      blockers.push("Le tenant doit être actif dans le Platform Operating System.");
    }

    if (!input.request.payerOrganizationId) {
      blockers.push("Aucun payeur économique n'est renseigné.");
    }

    const missingCapabilities = requiredCapabilityCodes.filter(
      (code) => !input.marketplace.capabilities.some((item) => item.code === code && item.status === "active"),
    );
    if (missingCapabilities.length > 0) {
      blockers.push(`Capabilities actives manquantes : ${missingCapabilities.join(", ")}.`);
    }

    const allProductCodes = Array.from(
      new Set([...input.request.requestedProductCodes, ...requiredProductCodes]),
    );

    for (const constraint of this.state.constraints) {
      if (!allProductCodes.includes(constraint.productCode)) continue;

      const fail = this.evaluateConstraint({
        constraint,
        request: input.request,
        allProductCodes,
        requiredCapabilityCodes,
        tenantActive: Boolean(tenant && tenant.status === "active"),
        atlas: input.atlas,
      });
      if (!fail) continue;
      if (constraint.severity === "blocking") blockers.push(fail);
      else warnings.push(fail);
    }

    const rolloutSequence = [...input.portfolio.products]
      .filter((item) => allProductCodes.includes(item.code))
      .sort((a, b) => this.layerWeight(a) - this.layerWeight(b))
      .map((item) => item.code);

    const atlasEnabled = allProductCodes.includes("atlas");
    const atlasWorkspaces = input.atlas.workspaces.filter(
      (item) => item.tenantId === input.request.tenantId && item.status === "active",
    );

    if (atlasEnabled && atlasWorkspaces.length === 0) {
      warnings.push("Atlas est demandé mais aucun workspace actif n'est encore configuré.");
    }

    const decision: ProductCompositionDecision = {
      id: `composition-${input.request.id}`,
      requestId: input.request.id,
      viable: blockers.length === 0,
      selectedProductCodes: allProductCodes,
      requiredProductCodes,
      requiredCapabilityCodes,
      warnings,
      blockers,
      rolloutSequence,
      atlasPremiumPositioning: atlasEnabled
        ? {
            enabled: true,
            reason:
              "Atlas reste une capacité premium d'intelligence décisionnelle, activée au-dessus des produits opérationnels et de coordination.",
            requiredWorkspaceCount: Math.max(1, atlasWorkspaces.length),
          }
        : undefined,
      decidedAt: input.decidedAt,
    };

    this.state.decisions.push(clone(decision));
    return clone(decision);
  }

  snapshot(): ProductCompositionData {
    return clone(this.state);
  }

  private evaluateConstraint(input: {
    constraint: ProductCompositionConstraint;
    request: ProductCompositionRequest;
    allProductCodes: MbambulaanProductCode[];
    requiredCapabilityCodes: string[];
    tenantActive: boolean;
    atlas: AtlasData;
  }): string | undefined {
    const { constraint } = input;

    if (constraint.kind === "requires_product") {
      const missing = constraint.targetCodes.filter(
        (code) => !input.allProductCodes.includes(code as MbambulaanProductCode),
      );
      if (missing.length > 0) return `${constraint.description} Produits manquants : ${missing.join(", ")}.`;
    }

    if (constraint.kind === "requires_capability") {
      const missing = constraint.targetCodes.filter(
        (code) => !input.requiredCapabilityCodes.includes(code),
      );
      if (missing.length > 0) return `${constraint.description} Capabilities manquantes : ${missing.join(", ")}.`;
    }

    if (constraint.kind === "requires_active_tenant" && !input.tenantActive) {
      return constraint.description;
    }

    if (constraint.kind === "requires_payer" && !input.request.payerOrganizationId) {
      return constraint.description;
    }

    if (constraint.kind === "requires_atlas_workspace") {
      const count = input.atlas.workspaces.filter(
        (item) => item.tenantId === input.request.tenantId && item.status === "active",
      ).length;
      if (count === 0) return constraint.description;
    }

    if (constraint.kind === "forbids_standalone") {
      const companions = constraint.targetCodes.filter((code) =>
        input.allProductCodes.includes(code as MbambulaanProductCode),
      );
      if (companions.length === 0) return constraint.description;
    }

    return undefined;
  }

  private layerWeight(product: ProductDefinition): number {
    if (product.layer === "field_operations") return 1;
    if (product.layer === "organization_operations") return 2;
    if (product.layer === "ecosystem_coordination") return 3;
    return 4;
  }
}
