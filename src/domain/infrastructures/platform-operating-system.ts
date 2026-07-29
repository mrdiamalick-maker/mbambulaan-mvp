import type { EntityId, ISODateTime } from "./types";
import type { CapabilityActivationAssessment } from "./capability-marketplace";

export type TenantStatus = "provisioning" | "active" | "suspended" | "terminated";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "suspended" | "cancelled";

export interface PlatformTenant {
  id: EntityId;
  organizationId: EntityId;
  name: string;
  territoryIds: EntityId[];
  status: TenantStatus;
  createdAt: ISODateTime;
  activatedAt?: ISODateTime;
  dataResidency?: "senegal" | "regional" | "custom";
}

export interface TenantProduct {
  id: EntityId;
  tenantId: EntityId;
  productCode:
    | "community"
    | "business"
    | "government"
    | "development"
    | "finance"
    | "knowledge"
    | "atlas";
  capabilityCodes: string[];
  status: "draft" | "active" | "suspended" | "retired";
  provisionedAt?: ISODateTime;
}

export interface PlatformUser {
  id: EntityId;
  actorId: EntityId;
  tenantId: EntityId;
  roleCodes: string[];
  status: "invited" | "active" | "suspended" | "revoked";
  invitedAt: ISODateTime;
  activatedAt?: ISODateTime;
}

export interface AccessPolicy {
  id: EntityId;
  tenantId: EntityId;
  roleCode: string;
  resourceCodes: string[];
  actionCodes: Array<"read" | "create" | "update" | "delete" | "approve" | "export" | "administer">;
  territoryIds?: EntityId[];
  dataScopes?: Array<"own" | "organization" | "territory" | "national" | "cross_tenant">;
}

export interface PlatformSubscription {
  id: EntityId;
  tenantId: EntityId;
  productId: EntityId;
  offerId: EntityId;
  payerOrganizationId: EntityId;
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  status: SubscriptionStatus;
  monthlyMinimumXof?: number;
  quotaPolicyId?: EntityId;
}

export interface QuotaPolicy {
  id: EntityId;
  tenantId: EntityId;
  metricCode:
    | "active_users"
    | "transactions"
    | "api_calls"
    | "reports"
    | "beneficiaries"
    | "storage_mb"
    | "atlas_queries";
  period: "day" | "month" | "year";
  includedQuantity: number;
  hardLimit?: number;
  overageUnitPriceXof?: number;
}

export interface UsageRecord {
  id: EntityId;
  tenantId: EntityId;
  subscriptionId: EntityId;
  metricCode: QuotaPolicy["metricCode"];
  quantity: number;
  occurredAt: ISODateTime;
  sourceEntityIds: EntityId[];
}

export interface IntegrationRegistration {
  id: EntityId;
  tenantId: EntityId;
  name: string;
  kind: "api" | "webhook" | "batch" | "manual_import" | "data_stream";
  endpoint?: string;
  status: "draft" | "active" | "degraded" | "disabled";
  capabilityCodes: string[];
  createdAt: ISODateTime;
}

export interface PlatformAuditEvent {
  id: EntityId;
  tenantId: EntityId;
  actorId?: EntityId;
  eventType:
    | "tenant_created"
    | "product_provisioned"
    | "user_invited"
    | "policy_changed"
    | "subscription_activated"
    | "quota_exceeded"
    | "integration_changed"
    | "data_exported"
    | "administrative_override";
  occurredAt: ISODateTime;
  targetEntityIds: EntityId[];
  details: Record<string, string | number | boolean | null>;
}

export interface PlatformHealthSnapshot {
  generatedAt: ISODateTime;
  activeTenants: number;
  activeSubscriptions: number;
  activeProducts: number;
  activeUsers: number;
  degradedIntegrations: number;
  quotaBreaches: number;
}

export interface PlatformOperatingSystemData {
  tenants: PlatformTenant[];
  products: TenantProduct[];
  users: PlatformUser[];
  accessPolicies: AccessPolicy[];
  subscriptions: PlatformSubscription[];
  quotaPolicies: QuotaPolicy[];
  usageRecords: UsageRecord[];
  integrations: IntegrationRegistration[];
  auditEvents: PlatformAuditEvent[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function assertUniqueId<T extends { id: string }>(items: T[], id: string, label: string) {
  if (items.some((item) => item.id === id)) {
    throw new Error(`${label} ${id} existe déjà.`);
  }
}

export class PlatformOperatingSystem {
  private state: PlatformOperatingSystemData = {
    tenants: [],
    products: [],
    users: [],
    accessPolicies: [],
    subscriptions: [],
    quotaPolicies: [],
    usageRecords: [],
    integrations: [],
    auditEvents: [],
  };

  provisionTenant(tenant: PlatformTenant) {
    assertUniqueId(this.state.tenants, tenant.id, "Le tenant");
    this.state.tenants.push(clone(tenant));
    this.recordAudit({
      id: `audit-tenant-${tenant.id}`,
      tenantId: tenant.id,
      eventType: "tenant_created",
      occurredAt: tenant.createdAt,
      targetEntityIds: [tenant.id, tenant.organizationId],
      details: { status: tenant.status },
    });
    return clone(tenant);
  }

  activateTenant(tenantId: EntityId, activatedAt: ISODateTime) {
    const tenant = this.state.tenants.find((item) => item.id === tenantId);
    if (!tenant) throw new Error(`Le tenant ${tenantId} est introuvable.`);
    tenant.status = "active";
    tenant.activatedAt = activatedAt;
    return clone(tenant);
  }

  provisionProduct(
    product: TenantProduct,
    assessment: CapabilityActivationAssessment,
    provisionedAt: ISODateTime,
  ) {
    assertUniqueId(this.state.products, product.id, "Le produit tenant");
    const tenant = this.state.tenants.find((item) => item.id === product.tenantId);
    if (!tenant || tenant.status !== "active") {
      throw new Error("Le tenant doit être actif avant le provisioning d'un produit.");
    }
    if (!assessment.viable) {
      throw new Error("L'activation des capabilities n'est pas viable.");
    }
    product.status = "active";
    product.provisionedAt = provisionedAt;
    this.state.products.push(clone(product));
    this.recordAudit({
      id: `audit-product-${product.id}`,
      tenantId: product.tenantId,
      eventType: "product_provisioned",
      occurredAt: provisionedAt,
      targetEntityIds: [product.id],
      details: { productCode: product.productCode },
    });
    return clone(product);
  }

  inviteUser(user: PlatformUser) {
    assertUniqueId(this.state.users, user.id, "L'utilisateur plateforme");
    if (!this.state.tenants.some((item) => item.id === user.tenantId)) {
      throw new Error(`Le tenant ${user.tenantId} est introuvable.`);
    }
    this.state.users.push(clone(user));
    this.recordAudit({
      id: `audit-user-${user.id}`,
      tenantId: user.tenantId,
      actorId: user.actorId,
      eventType: "user_invited",
      occurredAt: user.invitedAt,
      targetEntityIds: [user.id],
      details: { roles: user.roleCodes.join(",") },
    });
    return clone(user);
  }

  registerAccessPolicy(policy: AccessPolicy, occurredAt: ISODateTime) {
    assertUniqueId(this.state.accessPolicies, policy.id, "La politique d'accès");
    this.state.accessPolicies.push(clone(policy));
    this.recordAudit({
      id: `audit-policy-${policy.id}`,
      tenantId: policy.tenantId,
      eventType: "policy_changed",
      occurredAt,
      targetEntityIds: [policy.id],
      details: { roleCode: policy.roleCode },
    });
    return clone(policy);
  }

  activateSubscription(subscription: PlatformSubscription) {
    assertUniqueId(this.state.subscriptions, subscription.id, "L'abonnement");
    const product = this.state.products.find((item) => item.id === subscription.productId);
    if (!product || product.status !== "active") {
      throw new Error("L'abonnement doit cibler un produit actif.");
    }
    if (subscription.status !== "active" && subscription.status !== "trial") {
      throw new Error("Le nouvel abonnement doit être actif ou en période d'essai.");
    }
    this.state.subscriptions.push(clone(subscription));
    this.recordAudit({
      id: `audit-subscription-${subscription.id}`,
      tenantId: subscription.tenantId,
      eventType: "subscription_activated",
      occurredAt: subscription.startsAt,
      targetEntityIds: [subscription.id, subscription.productId],
      details: { payerOrganizationId: subscription.payerOrganizationId },
    });
    return clone(subscription);
  }

  registerQuotaPolicy(policy: QuotaPolicy) {
    assertUniqueId(this.state.quotaPolicies, policy.id, "La politique de quota");
    this.state.quotaPolicies.push(clone(policy));
    return clone(policy);
  }

  recordUsage(record: UsageRecord) {
    assertUniqueId(this.state.usageRecords, record.id, "L'usage");
    const subscription = this.state.subscriptions.find(
      (item) => item.id === record.subscriptionId,
    );
    if (!subscription || !["trial", "active"].includes(subscription.status)) {
      throw new Error("L'usage doit être rattaché à un abonnement exploitable.");
    }
    this.state.usageRecords.push(clone(record));

    const policy = this.state.quotaPolicies.find(
      (item) => item.tenantId === record.tenantId && item.metricCode === record.metricCode,
    );
    if (policy?.hardLimit !== undefined) {
      const total = this.state.usageRecords
        .filter((item) => item.tenantId === record.tenantId && item.metricCode === record.metricCode)
        .reduce((sum, item) => sum + item.quantity, 0);
      if (total > policy.hardLimit) {
        this.recordAudit({
          id: `audit-quota-${record.id}`,
          tenantId: record.tenantId,
          eventType: "quota_exceeded",
          occurredAt: record.occurredAt,
          targetEntityIds: [record.subscriptionId, policy.id],
          details: { total, hardLimit: policy.hardLimit, metricCode: record.metricCode },
        });
      }
    }
    return clone(record);
  }

  registerIntegration(integration: IntegrationRegistration) {
    assertUniqueId(this.state.integrations, integration.id, "L'intégration");
    this.state.integrations.push(clone(integration));
    this.recordAudit({
      id: `audit-integration-${integration.id}`,
      tenantId: integration.tenantId,
      eventType: "integration_changed",
      occurredAt: integration.createdAt,
      targetEntityIds: [integration.id],
      details: { kind: integration.kind, status: integration.status },
    });
    return clone(integration);
  }

  authorize(input: {
    tenantId: EntityId;
    roleCodes: string[];
    resourceCode: string;
    actionCode: AccessPolicy["actionCodes"][number];
    territoryId?: EntityId;
  }): boolean {
    return this.state.accessPolicies.some((policy) =>
      policy.tenantId === input.tenantId &&
      input.roleCodes.includes(policy.roleCode) &&
      policy.resourceCodes.includes(input.resourceCode) &&
      policy.actionCodes.includes(input.actionCode) &&
      (!input.territoryId || !policy.territoryIds || policy.territoryIds.includes(input.territoryId)),
    );
  }

  healthSnapshot(generatedAt: ISODateTime): PlatformHealthSnapshot {
    const quotaBreaches = this.state.auditEvents.filter(
      (item) => item.eventType === "quota_exceeded",
    ).length;
    return {
      generatedAt,
      activeTenants: this.state.tenants.filter((item) => item.status === "active").length,
      activeSubscriptions: this.state.subscriptions.filter((item) => item.status === "active").length,
      activeProducts: this.state.products.filter((item) => item.status === "active").length,
      activeUsers: this.state.users.filter((item) => item.status === "active").length,
      degradedIntegrations: this.state.integrations.filter((item) => item.status === "degraded").length,
      quotaBreaches,
    };
  }

  snapshot(): PlatformOperatingSystemData {
    return clone(this.state);
  }

  private recordAudit(event: PlatformAuditEvent) {
    this.state.auditEvents.push(clone(event));
  }
}
