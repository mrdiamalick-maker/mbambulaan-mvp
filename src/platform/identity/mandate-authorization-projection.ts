import type { ActiveActorMandate } from "./ecosystem-actor-governance-runtime";
import type { ActorDelegation } from "./actor-governance-control";

export interface MandateAuthorizationRequest {
  actorId: string;
  permissionCode: string;
  territoryId: string;
  organizationId?: string;
  amountXof?: number;
  quantityKg?: number;
  actionType?: string;
  at: string;
}

export interface MandateAuthorizationDecision {
  allowed: boolean;
  reason:
    | "authorized_by_mandate"
    | "authorized_by_delegation"
    | "mandate_missing"
    | "mandate_inactive"
    | "mandate_expired"
    | "territory_denied"
    | "organization_denied"
    | "permission_denied"
    | "amount_limit_exceeded"
    | "quantity_limit_exceeded"
    | "action_denied"
    | "delegation_expired"
    | "dual_approval_required";
  mandateId?: string;
  delegationId?: string;
  requiresDualApproval: boolean;
  restrictions: string[];
}

const rolePermissions: Record<string, string[]> = {
  "cooperative.manager": ["campaign.read", "landing.read", "capacity.read", "capacity.write", "trade.read", "trade.write", "finance.read"],
  "landing.read": ["landing.read"],
  "landing.operator": ["landing.read", "landing.write", "capacity.read"],
  "quality.agent": ["landing.read", "landing.write", "knowledge.read"],
  "trade.buy": ["trade.read", "trade.write", "finance.read"],
  "trade.sell": ["trade.read", "trade.write"],
  "logistics.operator": ["capacity.read", "capacity.write", "trade.read", "trade.write"],
  "finance.operator": ["finance.read", "finance.write", "trade.read"],
  "government.supervisor": ["government.read", "government.write", "atlas.read", "atlas.ask"],
  "knowledge.manager": ["knowledge.read", "knowledge.write", "atlas.read"],
};

export class MandateAuthorizationProjection {
  decide(input: {
    request: MandateAuthorizationRequest;
    mandates: ActiveActorMandate[];
    delegations?: ActorDelegation[];
  }): MandateAuthorizationDecision {
    const directMandates = input.mandates.filter((item) => item.actorId === input.request.actorId);
    for (const mandate of directMandates) {
      const decision = this.evaluateMandate(mandate, input.request);
      if (decision.allowed) return decision;
      if (!["permission_denied", "territory_denied", "organization_denied"].includes(decision.reason)) return decision;
    }

    const delegations = (input.delegations ?? []).filter((item) => item.delegateActorId === input.request.actorId);
    for (const delegation of delegations) {
      const mandate = input.mandates.find((item) => item.id === delegation.mandateId);
      if (!mandate) continue;
      const decision = this.evaluateDelegation(delegation, mandate, input.request);
      if (decision.allowed) return decision;
      if (!["permission_denied", "territory_denied", "organization_denied", "action_denied"].includes(decision.reason)) return decision;
    }

    return { allowed: false, reason: "mandate_missing", requiresDualApproval: false, restrictions: [] };
  }

  expiringMandates(input: { mandates: ActiveActorMandate[]; at: string; withinDays: number }) {
    const limit = Date.parse(input.at) + input.withinDays * 86_400_000;
    return input.mandates
      .filter((item) => item.validUntil)
      .filter((item) => ["active", "restricted"].includes(item.status))
      .filter((item) => Date.parse(item.validUntil!) >= Date.parse(input.at) && Date.parse(item.validUntil!) <= limit)
      .sort((left, right) => Date.parse(left.validUntil!) - Date.parse(right.validUntil!));
  }

  private evaluateMandate(mandate: ActiveActorMandate, request: MandateAuthorizationRequest): MandateAuthorizationDecision {
    if (!["active", "restricted"].includes(mandate.status)) return this.denied("mandate_inactive", mandate);
    if (mandate.validUntil && Date.parse(mandate.validUntil) <= Date.parse(request.at)) return this.denied("mandate_expired", mandate);
    if (!mandate.territoryIds.includes("territory-national") && !mandate.territoryIds.includes(request.territoryId)) return this.denied("territory_denied", mandate);
    if (request.organizationId && mandate.organizationId && request.organizationId !== mandate.organizationId) return this.denied("organization_denied", mandate);
    if (!this.permissionsFor(mandate.roleCodes).has(request.permissionCode)) return this.denied("permission_denied", mandate);
    if (request.amountXof !== undefined && mandate.maximumAmountXof !== undefined && request.amountXof > mandate.maximumAmountXof) return this.denied("amount_limit_exceeded", mandate);
    if (request.quantityKg !== undefined && mandate.maximumQuantityKg !== undefined && request.quantityKg > mandate.maximumQuantityKg) return this.denied("quantity_limit_exceeded", mandate);
    const requiresDualApproval = mandate.restrictions.some((item) => /double signature|double validation/i.test(item));
    return {
      allowed: !requiresDualApproval,
      reason: requiresDualApproval ? "dual_approval_required" : "authorized_by_mandate",
      mandateId: mandate.id,
      requiresDualApproval,
      restrictions: [...mandate.restrictions],
    };
  }

  private evaluateDelegation(delegation: ActorDelegation, mandate: ActiveActorMandate, request: MandateAuthorizationRequest): MandateAuthorizationDecision {
    if (delegation.status !== "active") return this.deniedDelegation("mandate_inactive", delegation, mandate);
    if (Date.parse(delegation.validUntil) <= Date.parse(request.at)) return this.deniedDelegation("delegation_expired", delegation, mandate);
    if (!delegation.territoryIds.includes(request.territoryId)) return this.deniedDelegation("territory_denied", delegation, mandate);
    if (request.actionType && !delegation.allowedActionTypes.includes(request.actionType)) return this.deniedDelegation("action_denied", delegation, mandate);
    if (!this.permissionsFor(delegation.roleCodes).has(request.permissionCode)) return this.deniedDelegation("permission_denied", delegation, mandate);
    if (request.amountXof !== undefined && delegation.maximumAmountXof !== undefined && request.amountXof > delegation.maximumAmountXof) return this.deniedDelegation("amount_limit_exceeded", delegation, mandate);
    if (request.quantityKg !== undefined && delegation.maximumQuantityKg !== undefined && request.quantityKg > delegation.maximumQuantityKg) return this.deniedDelegation("quantity_limit_exceeded", delegation, mandate);
    return {
      allowed: !delegation.requiresDualApproval,
      reason: delegation.requiresDualApproval ? "dual_approval_required" : "authorized_by_delegation",
      mandateId: mandate.id,
      delegationId: delegation.id,
      requiresDualApproval: delegation.requiresDualApproval,
      restrictions: [...mandate.restrictions],
    };
  }

  private permissionsFor(roleCodes: string[]) {
    return new Set(roleCodes.flatMap((roleCode) => rolePermissions[roleCode] ?? []));
  }

  private denied(reason: MandateAuthorizationDecision["reason"], mandate: ActiveActorMandate): MandateAuthorizationDecision {
    return { allowed: false, reason, mandateId: mandate.id, requiresDualApproval: false, restrictions: [...mandate.restrictions] };
  }

  private deniedDelegation(reason: MandateAuthorizationDecision["reason"], delegation: ActorDelegation, mandate: ActiveActorMandate): MandateAuthorizationDecision {
    return { allowed: false, reason, mandateId: mandate.id, delegationId: delegation.id, requiresDualApproval: delegation.requiresDualApproval, restrictions: [...mandate.restrictions] };
  }
}
