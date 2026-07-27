import type { EntityId, ISODateTime } from "../infrastructures/types";

export type EcosystemPrincipalType = "person" | "organization" | "public_authority" | "service_account";
export type VerificationLevel = "unverified" | "declared" | "document_checked" | "field_verified" | "trusted";
export type AccessDecision = "allowed" | "denied" | "step_up_required";

export interface EcosystemIdentity {
  id: EntityId;
  principalType: EcosystemPrincipalType;
  displayName: string;
  legalName?: string;
  nationalIdentifierHash?: string;
  organizationId?: EntityId;
  territoryIds: EntityId[];
  actorTypes: string[];
  verificationLevel: VerificationLevel;
  status: "pending" | "active" | "restricted" | "suspended" | "revoked";
  verifiedByActorIds: EntityId[];
  evidenceIds: EntityId[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface EcosystemRoleAssignment {
  id: EntityId;
  identityId: EntityId;
  roleCode: string;
  scopeType: "ecosystem" | "country" | "territory" | "organization" | "cooperative" | "capability" | "case";
  scopeId: EntityId;
  permissionCodes: string[];
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  assignedByActorId: EntityId;
  status: "proposed" | "active" | "expired" | "revoked";
  evidenceIds: EntityId[];
}

export interface EcosystemDelegation {
  id: EntityId;
  delegatorIdentityId: EntityId;
  delegateIdentityId: EntityId;
  roleAssignmentId: EntityId;
  permissionCodes: string[];
  scopeId: EntityId;
  validFrom: ISODateTime;
  validUntil: ISODateTime;
  maximumAmountXof?: number;
  maximumQuantity?: number;
  allowedActionTypes: string[];
  requiresDualApproval: boolean;
  status: "proposed" | "active" | "suspended" | "expired" | "revoked";
  reason: string;
  evidenceIds: EntityId[];
  createdAt: ISODateTime;
}

export interface TrustSignal {
  id: EntityId;
  identityId: EntityId;
  signalType:
    | "identity_verified"
    | "commitment_fulfilled"
    | "payment_completed"
    | "quality_compliant"
    | "delivery_completed"
    | "governance_participation"
    | "dispute_opened"
    | "commitment_failed"
    | "fraud_suspected"
    | "sanction_applied";
  impact: number;
  capabilityId?: EntityId;
  caseId?: EntityId;
  territoryId?: EntityId;
  sourceActorId?: EntityId;
  evidenceIds: EntityId[];
  recordedAt: ISODateTime;
}

export interface ApprovalPolicy {
  id: EntityId;
  actionType: string;
  scopeType: EcosystemRoleAssignment["scopeType"];
  scopeId: EntityId;
  requiredPermissionCodes: string[];
  minimumVerificationLevel: VerificationLevel;
  minimumTrustScore: number;
  dualApprovalRequired: boolean;
  amountThresholdXof?: number;
  quantityThreshold?: number;
  prohibitedRoleCombinations: string[][];
  status: "active" | "inactive";
}

export interface ApprovalRequest {
  id: EntityId;
  actionType: string;
  requestedByIdentityId: EntityId;
  onBehalfOfIdentityId?: EntityId;
  delegationId?: EntityId;
  scopeType: EcosystemRoleAssignment["scopeType"];
  scopeId: EntityId;
  amountXof?: number;
  quantity?: number;
  payloadReferenceIds: EntityId[];
  evidenceIds: EntityId[];
  status: "pending" | "partially_approved" | "approved" | "rejected" | "expired" | "executed";
  approverIdentityIds: EntityId[];
  rejectionReason?: string;
  requestedAt: ISODateTime;
  decidedAt?: ISODateTime;
}

export interface AuthorizationAuditRecord {
  id: EntityId;
  identityId: EntityId;
  actionType: string;
  scopeId: EntityId;
  decision: AccessDecision;
  permissionCodesChecked: string[];
  roleAssignmentIds: EntityId[];
  delegationId?: EntityId;
  approvalRequestId?: EntityId;
  reasons: string[];
  occurredAt: ISODateTime;
}

export interface IdentityTrustGovernanceCase {
  id: EntityId;
  ecosystemId: EntityId;
  countryId: EntityId;
  status: "initializing" | "operational" | "restricted" | "under_review";
  identities: EcosystemIdentity[];
  roleAssignments: EcosystemRoleAssignment[];
  delegations: EcosystemDelegation[];
  trustSignals: TrustSignal[];
  approvalPolicies: ApprovalPolicy[];
  approvalRequests: ApprovalRequest[];
  auditRecords: AuthorizationAuditRecord[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

const verificationWeights: Record<VerificationLevel, number> = {
  unverified: 0,
  declared: 25,
  document_checked: 50,
  field_verified: 75,
  trusted: 100,
};

export class EndToEndEcosystemIdentityTrustGovernanceCapability {
  private readonly cases = new Map<EntityId, IdentityTrustGovernanceCase>();

  openCase(input: { id: EntityId; ecosystemId: EntityId; countryId: EntityId; createdAt: ISODateTime }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier ${input.id} existe déjà.`);
    const item: IdentityTrustGovernanceCase = {
      id: input.id,
      ecosystemId: input.ecosystemId,
      countryId: input.countryId,
      status: "initializing",
      identities: [],
      roleAssignments: [],
      delegations: [],
      trustSignals: [],
      approvalPolicies: [],
      approvalRequests: [],
      auditRecords: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  registerIdentity(input: { caseId: EntityId; identity: EcosystemIdentity }) {
    const item = this.requireCase(input.caseId);
    if (item.identities.some((entry) => entry.id === input.identity.id)) throw new Error(`L'identité ${input.identity.id} existe déjà.`);
    item.identities.push(structuredClone(input.identity));
    this.touch(item, input.identity.createdAt);
    return structuredClone(item);
  }

  verifyIdentity(input: { caseId: EntityId; identityId: EntityId; level: VerificationLevel; verifiedByActorId: EntityId; evidenceIds: EntityId[]; verifiedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const identity = this.requireIdentity(item, input.identityId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour vérifier une identité.");
    if (verificationWeights[input.level] < verificationWeights[identity.verificationLevel]) throw new Error("Le niveau de vérification ne peut pas régresser.");
    identity.verificationLevel = input.level;
    identity.verifiedByActorIds = this.unique([...identity.verifiedByActorIds, input.verifiedByActorId]);
    identity.evidenceIds = this.unique([...identity.evidenceIds, ...input.evidenceIds]);
    identity.status = input.level === "unverified" ? "pending" : "active";
    identity.updatedAt = input.verifiedAt;
    this.touch(item, input.verifiedAt);
    return structuredClone(identity);
  }

  assignRole(input: { caseId: EntityId; assignment: EcosystemRoleAssignment }) {
    const item = this.requireCase(input.caseId);
    const identity = this.requireIdentity(item, input.assignment.identityId);
    if (identity.status !== "active") throw new Error("Une identité non active ne peut pas recevoir de rôle.");
    if (input.assignment.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour attribuer un rôle.");
    if (input.assignment.validUntil && input.assignment.validUntil <= input.assignment.validFrom) throw new Error("La période du rôle est invalide.");
    if (item.roleAssignments.some((entry) => entry.id === input.assignment.id)) throw new Error(`Le rôle ${input.assignment.id} existe déjà.`);
    item.roleAssignments.push(structuredClone(input.assignment));
    this.touch(item, input.assignment.validFrom);
    return structuredClone(item);
  }

  createDelegation(input: { caseId: EntityId; delegation: EcosystemDelegation }) {
    const item = this.requireCase(input.caseId);
    const delegator = this.requireIdentity(item, input.delegation.delegatorIdentityId);
    const delegate = this.requireIdentity(item, input.delegation.delegateIdentityId);
    const role = this.requireRole(item, input.delegation.roleAssignmentId);
    if (role.identityId !== delegator.id) throw new Error("Le délégant ne détient pas le rôle délégué.");
    if (delegator.status !== "active" || delegate.status !== "active") throw new Error("Les identités de délégation doivent être actives.");
    if (input.delegation.validUntil <= input.delegation.validFrom) throw new Error("La période de délégation est invalide.");
    if (input.delegation.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour déléguer.");
    const excessivePermissions = input.delegation.permissionCodes.filter((permission) => !role.permissionCodes.includes(permission));
    if (excessivePermissions.length > 0) throw new Error(`La délégation dépasse les permissions du délégant : ${excessivePermissions.join(", ")}.`);
    item.delegations.push(structuredClone(input.delegation));
    this.touch(item, input.delegation.createdAt);
    return structuredClone(item);
  }

  recordTrustSignal(input: { caseId: EntityId; signal: TrustSignal }) {
    const item = this.requireCase(input.caseId);
    this.requireIdentity(item, input.signal.identityId);
    if (input.signal.impact < -100 || input.signal.impact > 100) throw new Error("L'impact de confiance doit être compris entre -100 et 100.");
    if (input.signal.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour un signal de confiance.");
    item.trustSignals.push(structuredClone(input.signal));
    this.applyAutomaticRestriction(item, input.signal.identityId);
    this.touch(item, input.signal.recordedAt);
    return structuredClone(item);
  }

  defineApprovalPolicy(input: { caseId: EntityId; policy: ApprovalPolicy; definedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (input.policy.minimumTrustScore < 0 || input.policy.minimumTrustScore > 100) throw new Error("Le score minimum de confiance est invalide.");
    item.approvalPolicies.push(structuredClone(input.policy));
    this.touch(item, input.definedAt);
    return structuredClone(item);
  }

  requestApproval(input: { caseId: EntityId; request: ApprovalRequest }) {
    const item = this.requireCase(input.caseId);
    this.requireIdentity(item, input.request.requestedByIdentityId);
    if (input.request.onBehalfOfIdentityId) this.requireIdentity(item, input.request.onBehalfOfIdentityId);
    if (input.request.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour demander une approbation.");
    item.approvalRequests.push(structuredClone(input.request));
    this.touch(item, input.request.requestedAt);
    return structuredClone(item);
  }

  decideApproval(input: { caseId: EntityId; requestId: EntityId; approverIdentityId: EntityId; approved: boolean; reason: string; decidedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const request = this.requireApprovalRequest(item, input.requestId);
    const policy = this.requirePolicy(item, request.actionType, request.scopeType, request.scopeId);
    const approverDecision = this.authorize({ caseId: item.id, identityId: input.approverIdentityId, actionType: "approve", scopeType: request.scopeType, scopeId: request.scopeId, requiredPermissionCodes: ["approve"], occurredAt: input.decidedAt });
    if (approverDecision.decision !== "allowed") throw new Error("L'approbateur n'est pas autorisé.");
    if (!input.approved) {
      request.status = "rejected";
      request.rejectionReason = input.reason;
      request.decidedAt = input.decidedAt;
      this.touch(item, input.decidedAt);
      return structuredClone(request);
    }
    request.approverIdentityIds = this.unique([...request.approverIdentityIds, input.approverIdentityId]);
    request.status = policy.dualApprovalRequired && request.approverIdentityIds.length < 2 ? "partially_approved" : "approved";
    request.decidedAt = input.decidedAt;
    this.touch(item, input.decidedAt);
    return structuredClone(request);
  }

  authorize(input: { caseId: EntityId; identityId: EntityId; actionType: string; scopeType: EcosystemRoleAssignment["scopeType"]; scopeId: EntityId; requiredPermissionCodes: string[]; amountXof?: number; quantity?: number; delegationId?: EntityId; approvalRequestId?: EntityId; occurredAt: ISODateTime }): AuthorizationAuditRecord {
    const item = this.requireCase(input.caseId);
    const identity = this.requireIdentity(item, input.identityId);
    const reasons: string[] = [];
    let decision: AccessDecision = "allowed";
    if (identity.status !== "active") {
      decision = "denied";
      reasons.push(`Identité non active : ${identity.status}.`);
    }
    const policy = this.findPolicy(item, input.actionType, input.scopeType, input.scopeId);
    if (policy && verificationWeights[identity.verificationLevel] < verificationWeights[policy.minimumVerificationLevel]) {
      decision = "step_up_required";
      reasons.push("Niveau de vérification insuffisant.");
    }
    const trustScore = this.getTrustScore(item.id, identity.id);
    if (policy && trustScore < policy.minimumTrustScore) {
      decision = "denied";
      reasons.push("Score de confiance insuffisant.");
    }
    const roles = item.roleAssignments.filter((role) => role.identityId === identity.id && role.status === "active" && role.scopeId === input.scopeId && role.validFrom <= input.occurredAt && (!role.validUntil || role.validUntil >= input.occurredAt));
    let permissions = new Set(roles.flatMap((role) => role.permissionCodes));
    let delegation: EcosystemDelegation | undefined;
    if (input.delegationId) {
      delegation = this.requireDelegation(item, input.delegationId);
      if (delegation.delegateIdentityId !== identity.id || delegation.status !== "active" || delegation.validFrom > input.occurredAt || delegation.validUntil < input.occurredAt) {
        decision = "denied";
        reasons.push("Délégation inactive, expirée ou attribuée à une autre identité.");
      } else {
        permissions = new Set([...permissions, ...delegation.permissionCodes]);
        if (!delegation.allowedActionTypes.includes(input.actionType)) {
          decision = "denied";
          reasons.push("Action non couverte par la délégation.");
        }
        if (input.amountXof !== undefined && delegation.maximumAmountXof !== undefined && input.amountXof > delegation.maximumAmountXof) {
          decision = "denied";
          reasons.push("Montant supérieur au plafond de délégation.");
        }
        if (input.quantity !== undefined && delegation.maximumQuantity !== undefined && input.quantity > delegation.maximumQuantity) {
          decision = "denied";
          reasons.push("Quantité supérieure au plafond de délégation.");
        }
      }
    }
    const missingPermissions = input.requiredPermissionCodes.filter((permission) => !permissions.has(permission));
    if (missingPermissions.length > 0) {
      decision = "denied";
      reasons.push(`Permissions manquantes : ${missingPermissions.join(", ")}.`);
    }
    if (policy) {
      const roleCodes = roles.map((role) => role.roleCode);
      for (const forbiddenCombination of policy.prohibitedRoleCombinations) {
        if (forbiddenCombination.every((roleCode) => roleCodes.includes(roleCode))) {
          decision = "denied";
          reasons.push(`Séparation des responsabilités violée : ${forbiddenCombination.join(" + ")}.`);
        }
      }
      const overThreshold = (policy.amountThresholdXof !== undefined && (input.amountXof ?? 0) >= policy.amountThresholdXof) || (policy.quantityThreshold !== undefined && (input.quantity ?? 0) >= policy.quantityThreshold);
      if ((policy.dualApprovalRequired || overThreshold || delegation?.requiresDualApproval) && input.actionType !== "approve") {
        const approval = input.approvalRequestId ? this.requireApprovalRequest(item, input.approvalRequestId) : undefined;
        if (!approval || approval.status !== "approved") {
          decision = "step_up_required";
          reasons.push("Une approbation préalable complète est requise.");
        }
      }
    }
    const audit: AuthorizationAuditRecord = {
      id: `audit:${item.id}:${item.auditRecords.length + 1}`,
      identityId: identity.id,
      actionType: input.actionType,
      scopeId: input.scopeId,
      decision,
      permissionCodesChecked: [...input.requiredPermissionCodes],
      roleAssignmentIds: roles.map((role) => role.id),
      delegationId: delegation?.id,
      approvalRequestId: input.approvalRequestId,
      reasons,
      occurredAt: input.occurredAt,
    };
    item.auditRecords.push(audit);
    this.touch(item, input.occurredAt);
    return structuredClone(audit);
  }

  revokeDelegation(input: { caseId: EntityId; delegationId: EntityId; revokedAt: ISODateTime; reason: string }) {
    const item = this.requireCase(input.caseId);
    const delegation = this.requireDelegation(item, input.delegationId);
    delegation.status = "revoked";
    delegation.reason = `${delegation.reason} | Révoquée : ${input.reason}`;
    this.touch(item, input.revokedAt);
    return structuredClone(delegation);
  }

  suspendIdentity(input: { caseId: EntityId; identityId: EntityId; suspendedAt: ISODateTime; reason: string; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    const identity = this.requireIdentity(item, input.identityId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour suspendre une identité.");
    identity.status = "suspended";
    identity.evidenceIds = this.unique([...identity.evidenceIds, ...input.evidenceIds]);
    identity.updatedAt = input.suspendedAt;
    for (const delegation of item.delegations.filter((entry) => entry.delegatorIdentityId === identity.id || entry.delegateIdentityId === identity.id)) delegation.status = "suspended";
    item.warnings.push(`Identité suspendue ${identity.id} : ${input.reason}`);
    this.touch(item, input.suspendedAt);
    return structuredClone(identity);
  }

  getTrustScore(caseId: EntityId, identityId: EntityId) {
    const item = this.requireCase(caseId);
    const identity = this.requireIdentity(item, identityId);
    const base = verificationWeights[identity.verificationLevel] * 0.4 + 30;
    const signalImpact = item.trustSignals.filter((signal) => signal.identityId === identity.id).reduce((sum, signal) => sum + signal.impact, 0);
    return Math.max(0, Math.min(100, Math.round((base + signalImpact) * 100) / 100));
  }

  getGovernanceCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const activeIdentities = item.identities.filter((identity) => identity.status === "active");
    const lowTrustIdentities = activeIdentities.map((identity) => ({ identityId: identity.id, trustScore: this.getTrustScore(item.id, identity.id) })).filter((entry) => entry.trustScore < 40);
    const expiredDelegations = item.delegations.filter((delegation) => delegation.status === "active" && delegation.validUntil < input.generatedAt);
    const deniedActions = item.auditRecords.filter((record) => record.decision === "denied");
    const stepUpActions = item.auditRecords.filter((record) => record.decision === "step_up_required");
    return {
      caseId: item.id,
      status: item.status,
      identityCount: item.identities.length,
      activeIdentityCount: activeIdentities.length,
      verifiedIdentityCount: item.identities.filter((identity) => verificationWeights[identity.verificationLevel] >= verificationWeights.document_checked).length,
      activeRoleCount: item.roleAssignments.filter((role) => role.status === "active").length,
      activeDelegationCount: item.delegations.filter((delegation) => delegation.status === "active").length,
      pendingApprovalCount: item.approvalRequests.filter((request) => ["pending", "partially_approved"].includes(request.status)).length,
      deniedActionCount: deniedActions.length,
      stepUpActionCount: stepUpActions.length,
      lowTrustIdentities,
      expiredDelegations: expiredDelegations.map((delegation) => structuredClone(delegation)),
      recentDeniedActions: deniedActions.slice(-20).map((record) => structuredClone(record)),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private applyAutomaticRestriction(item: IdentityTrustGovernanceCase, identityId: EntityId) {
    const identity = this.requireIdentity(item, identityId);
    const score = this.getTrustScore(item.id, identityId);
    const criticalSignals = item.trustSignals.filter((signal) => signal.identityId === identityId && ["fraud_suspected", "sanction_applied"].includes(signal.signalType));
    if (score < 20 || criticalSignals.length >= 2) identity.status = "restricted";
  }

  private findPolicy(item: IdentityTrustGovernanceCase, actionType: string, scopeType: ApprovalPolicy["scopeType"], scopeId: EntityId) {
    return item.approvalPolicies.find((policy) => policy.status === "active" && policy.actionType === actionType && policy.scopeType === scopeType && policy.scopeId === scopeId);
  }

  private requirePolicy(item: IdentityTrustGovernanceCase, actionType: string, scopeType: ApprovalPolicy["scopeType"], scopeId: EntityId) {
    const policy = this.findPolicy(item, actionType, scopeType, scopeId);
    if (!policy) throw new Error(`Politique d'approbation introuvable pour ${actionType}.`);
    return policy;
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier d'identité introuvable : ${id}.`);
    return item;
  }

  private requireIdentity(item: IdentityTrustGovernanceCase, id: EntityId) {
    const identity = item.identities.find((entry) => entry.id === id);
    if (!identity) throw new Error(`Identité introuvable : ${id}.`);
    return identity;
  }

  private requireRole(item: IdentityTrustGovernanceCase, id: EntityId) {
    const role = item.roleAssignments.find((entry) => entry.id === id);
    if (!role) throw new Error(`Rôle introuvable : ${id}.`);
    return role;
  }

  private requireDelegation(item: IdentityTrustGovernanceCase, id: EntityId) {
    const delegation = item.delegations.find((entry) => entry.id === id);
    if (!delegation) throw new Error(`Délégation introuvable : ${id}.`);
    return delegation;
  }

  private requireApprovalRequest(item: IdentityTrustGovernanceCase, id: EntityId) {
    const request = item.approvalRequests.find((entry) => entry.id === id);
    if (!request) throw new Error(`Demande d'approbation introuvable : ${id}.`);
    return request;
  }

  private touch(item: IdentityTrustGovernanceCase, updatedAt: ISODateTime) {
    item.updatedAt = updatedAt;
    item.status = item.identities.length > 0 && item.approvalPolicies.length > 0 ? "operational" : item.status;
    this.cases.set(item.id, item);
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }
}
