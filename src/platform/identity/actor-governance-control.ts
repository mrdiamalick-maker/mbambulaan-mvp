import type { ActiveActorMandate } from "./ecosystem-actor-governance-runtime";

export interface TemporaryDelegation {
  id: string;
  mandateId: string;
  delegatorActorId: string;
  delegateActorId: string;
  roleCodes: string[];
  territoryIds: string[];
  validFrom: string;
  validUntil: string;
  maximumAmountXof?: number;
  maximumQuantityKg?: number;
  allowedActionTypes: string[];
  requiresDualApproval: boolean;
  delegationDocumentIds: string[];
  status: "active" | "suspended" | "expired" | "revoked";
}

export interface SensitiveActionRequest {
  id: string;
  actorId: string;
  mandateId: string;
  delegationId?: string;
  actionType: string;
  territoryId: string;
  amountXof?: number;
  quantityKg?: number;
  supportingDocumentIds: string[];
  requestedAt: string;
  requiredApprovalCount: number;
  approverActorIds: string[];
  status: "pending" | "partially_approved" | "approved" | "rejected" | "executed";
  rejectionReason?: string;
}

const prohibitedRoleCombinations = [
  ["finance.request", "finance.approve"],
  ["payment.prepare", "payment.execute"],
  ["quality.inspect", "quality.final_approve"],
  ["actor.review", "actor.activate"],
  ["commercial.sell", "commercial.settlement_approve"],
];

export class ActorGovernanceControl {
  private readonly delegations: TemporaryDelegation[] = [];
  private readonly requests: SensitiveActionRequest[] = [];

  createDelegation(input: { mandate: ActiveActorMandate; delegation: TemporaryDelegation }) {
    const delegation = input.delegation;
    if (input.mandate.status !== "active" && input.mandate.status !== "restricted") throw new Error("Seul un mandat actif ou restreint peut être délégué.");
    if (delegation.delegatorActorId !== input.mandate.actorId || delegation.mandateId !== input.mandate.id) throw new Error("Le délégant ne détient pas le mandat indiqué.");
    if (delegation.validUntil <= delegation.validFrom) throw new Error("La période de délégation est invalide.");
    if (!delegation.delegationDocumentIds.length) throw new Error("La délégation doit être appuyée par une lettre ou une décision signée.");
    const excessiveRoles = delegation.roleCodes.filter((role) => !input.mandate.roleCodes.includes(role));
    const excessiveTerritories = delegation.territoryIds.filter((territory) => !input.mandate.territoryIds.includes(territory));
    if (excessiveRoles.length || excessiveTerritories.length) throw new Error("La délégation dépasse le mandat du délégant.");
    if ((delegation.maximumAmountXof ?? 0) > (input.mandate.maximumAmountXof ?? Number.MAX_SAFE_INTEGER)) throw new Error("La limite financière de la délégation dépasse celle du mandat.");
    if ((delegation.maximumQuantityKg ?? 0) > (input.mandate.maximumQuantityKg ?? Number.MAX_SAFE_INTEGER)) throw new Error("La limite quantitative de la délégation dépasse celle du mandat.");
    this.assertNoRoleConflict(delegation.roleCodes);
    if (this.delegations.some((item) => item.id === delegation.id)) throw new Error("Cette délégation existe déjà.");
    this.delegations.push(structuredClone(delegation));
    return structuredClone(delegation);
  }

  requestSensitiveAction(input: { mandate: ActiveActorMandate; delegation?: TemporaryDelegation; request: SensitiveActionRequest }) {
    const request = input.request;
    if (!request.supportingDocumentIds.length) throw new Error("L'action sensible doit être appuyée par un document métier.");
    if (!input.mandate.territoryIds.includes(request.territoryId)) throw new Error("Le mandat ne couvre pas ce territoire.");
    if ((request.amountXof ?? 0) > (input.mandate.maximumAmountXof ?? Number.MAX_SAFE_INTEGER)) throw new Error("Le montant dépasse la limite du mandat.");
    if ((request.quantityKg ?? 0) > (input.mandate.maximumQuantityKg ?? Number.MAX_SAFE_INTEGER)) throw new Error("La quantité dépasse la limite du mandat.");

    if (input.delegation) {
      const delegation = input.delegation;
      if (delegation.delegateActorId !== request.actorId || delegation.status !== "active") throw new Error("La délégation n'est pas active pour cet acteur.");
      if (!delegation.allowedActionTypes.includes(request.actionType)) throw new Error("La délégation n'autorise pas cette action.");
      if (!delegation.territoryIds.includes(request.territoryId)) throw new Error("La délégation ne couvre pas ce territoire.");
      if ((request.amountXof ?? 0) > (delegation.maximumAmountXof ?? Number.MAX_SAFE_INTEGER)) throw new Error("Le montant dépasse la délégation.");
      if ((request.quantityKg ?? 0) > (delegation.maximumQuantityKg ?? Number.MAX_SAFE_INTEGER)) throw new Error("La quantité dépasse la délégation.");
      request.requiredApprovalCount = delegation.requiresDualApproval ? Math.max(2, request.requiredApprovalCount) : request.requiredApprovalCount;
    }

    if (this.requests.some((item) => item.id === request.id)) throw new Error("Cette demande d'action existe déjà.");
    this.requests.push(structuredClone(request));
    return structuredClone(request);
  }

  approve(input: { requestId: string; approverActorId: string }) {
    const request = this.requireRequest(input.requestId);
    if (request.actorId === input.approverActorId) throw new Error("Le demandeur ne peut pas approuver sa propre action.");
    if (["rejected", "executed"].includes(request.status)) throw new Error("Cette demande ne peut plus être approuvée.");
    request.approverActorIds = [...new Set([...request.approverActorIds, input.approverActorId])];
    request.status = request.approverActorIds.length >= request.requiredApprovalCount ? "approved" : "partially_approved";
    return structuredClone(request);
  }

  reject(input: { requestId: string; approverActorId: string; reason: string }) {
    const request = this.requireRequest(input.requestId);
    if (!input.reason.trim()) throw new Error("Le motif de rejet est obligatoire.");
    request.status = "rejected";
    request.rejectionReason = input.reason;
    request.approverActorIds = [...new Set([...request.approverActorIds, input.approverActorId])];
    return structuredClone(request);
  }

  markExecuted(input: { requestId: string }) {
    const request = this.requireRequest(input.requestId);
    if (request.status !== "approved") throw new Error("L'action doit être approuvée avant exécution.");
    request.status = "executed";
    return structuredClone(request);
  }

  expireDelegations(now: string) {
    for (const delegation of this.delegations) {
      if (delegation.status === "active" && delegation.validUntil < now) delegation.status = "expired";
    }
    return this.snapshot();
  }

  snapshot() {
    return structuredClone({
      delegations: this.delegations,
      sensitiveActionRequests: this.requests,
      metrics: {
        activeDelegationCount: this.delegations.filter((item) => item.status === "active").length,
        expiredDelegationCount: this.delegations.filter((item) => item.status === "expired").length,
        pendingApprovalCount: this.requests.filter((item) => ["pending", "partially_approved"].includes(item.status)).length,
        approvedActionCount: this.requests.filter((item) => item.status === "approved").length,
        executedActionCount: this.requests.filter((item) => item.status === "executed").length,
      },
    });
  }

  private assertNoRoleConflict(roleCodes: string[]) {
    for (const pair of prohibitedRoleCombinations) {
      if (pair.every((role) => roleCodes.includes(role))) throw new Error(`Combinaison de rôles interdite : ${pair.join(" + ")}.`);
    }
  }

  private requireRequest(id: string) {
    const request = this.requests.find((item) => item.id === id);
    if (!request) throw new Error(`Demande d'action introuvable : ${id}.`);
    return request;
  }
}
