import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export type IdentityStatus = "invited" | "pending_verification" | "active" | "suspended" | "revoked" | "archived";
export type VerificationLevel = "unverified" | "declared" | "document_verified" | "institution_verified" | "strong";
export type AccessDecision = "allow" | "deny" | "require_approval" | "require_step_up";
export type AssignmentStatus = "pending" | "active" | "suspended" | "expired" | "revoked";
export type DelegationStatus = "draft" | "active" | "expired" | "revoked";
export type ConsentStatus = "granted" | "withdrawn" | "expired";

export interface IdentityProfile {
  id: EntityId;
  actorId: EntityId;
  actorKind: MvpActorKind;
  displayName: string;
  phoneNumber?: string;
  email?: string;
  preferredLanguage: "fr" | "wo" | "en";
  status: IdentityStatus;
  verificationLevel: VerificationLevel;
  verificationScore: number;
  organizationIds: EntityId[];
  territoryIds: EntityId[];
  landingSiteIds: EntityId[];
  cooperativeIds: EntityId[];
  attributes: Record<string, unknown>;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RoleDefinition {
  code: string;
  name: string;
  actorKinds: MvpActorKind[];
  permissions: string[];
  approvalPermissions: string[];
  incompatibleRoleCodes: string[];
  minimumVerificationLevel: VerificationLevel;
  sensitive: boolean;
}

export interface RoleAssignment {
  id: EntityId;
  identityId: EntityId;
  roleCode: string;
  status: AssignmentStatus;
  organizationId?: EntityId;
  territoryId?: EntityId;
  landingSiteId?: EntityId;
  cooperativeId?: EntityId;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  assignedByIdentityId: EntityId;
  evidenceDocumentIds: EntityId[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface DelegationMandate {
  id: EntityId;
  delegatorIdentityId: EntityId;
  delegateIdentityId: EntityId;
  permissionCodes: string[];
  scope: {
    organizationId?: EntityId;
    territoryId?: EntityId;
    landingSiteId?: EntityId;
    cooperativeId?: EntityId;
  };
  status: DelegationStatus;
  validFrom: ISODateTime;
  validUntil: ISODateTime;
  reason: string;
  createdAt: ISODateTime;
  revokedAt?: ISODateTime;
}

export interface AccessContext {
  identityId: EntityId;
  permissionCode: string;
  organizationId?: EntityId;
  territoryId?: EntityId;
  landingSiteId?: EntityId;
  cooperativeId?: EntityId;
  resourceOwnerActorId?: EntityId;
  resourceSensitivity?: "standard" | "sensitive" | "highly_sensitive";
  amount?: number;
  currentTime: ISODateTime;
}

export interface AccessEvaluation {
  decision: AccessDecision;
  reasons: string[];
  matchedRoleAssignments: EntityId[];
  matchedDelegationIds: EntityId[];
  requiredApprovalRoleCodes: string[];
}

export interface ConsentGrant {
  id: EntityId;
  identityId: EntityId;
  purposeCode: string;
  dataCategories: string[];
  beneficiaryActorKinds: MvpActorKind[];
  status: ConsentStatus;
  grantedAt: ISODateTime;
  expiresAt?: ISODateTime;
  withdrawnAt?: ISODateTime;
}

export interface TrustEvent {
  id: EntityId;
  identityId: EntityId;
  type:
    | "identity_verified"
    | "document_expired"
    | "suspicious_activity"
    | "role_assigned"
    | "role_revoked"
    | "delegation_created"
    | "delegation_revoked"
    | "access_denied"
    | "access_approved";
  impact: number;
  description: string;
  occurredAt: ISODateTime;
  metadata: Record<string, unknown>;
}

export interface AccessAuditEntry {
  id: EntityId;
  identityId: EntityId;
  permissionCode: string;
  decision: AccessDecision;
  reasons: string[];
  scope: {
    organizationId?: EntityId;
    territoryId?: EntityId;
    landingSiteId?: EntityId;
    cooperativeId?: EntityId;
  };
  occurredAt: ISODateTime;
  correlationId?: string;
}

const verificationRank: Record<VerificationLevel, number> = {
  unverified: 0,
  declared: 1,
  document_verified: 2,
  institution_verified: 3,
  strong: 4,
};

const roleDefinitions: RoleDefinition[] = [
  {
    code: "fisher_member",
    name: "Pêcheur membre",
    actorKinds: ["fisher"],
    permissions: [
      "expected_return:create_own",
      "landing:confirm_own",
      "document:submit_own",
      "profile:read_own",
      "profile:update_own",
      "lot:read_own",
    ],
    approvalPermissions: [],
    incompatibleRoleCodes: [],
    minimumVerificationLevel: "declared",
    sensitive: false,
  },
  {
    code: "cooperative_operator",
    name: "Opérateur de coopérative",
    actorKinds: ["cooperative"],
    permissions: [
      "expected_return:create_for_member",
      "landing:coordinate",
      "service_need:create",
      "lot:create",
      "commitment:read",
      "incident:report",
      "member:read",
    ],
    approvalPermissions: [],
    incompatibleRoleCodes: ["cooperative_auditor"],
    minimumVerificationLevel: "document_verified",
    sensitive: false,
  },
  {
    code: "cooperative_manager",
    name: "Responsable de coopérative",
    actorKinds: ["cooperative"],
    permissions: [
      "member:approve",
      "service_allocation:approve",
      "lot:publish",
      "commercial_commitment:approve",
      "incident:assign",
      "report:read_cooperative",
      "revenue:read_cooperative",
    ],
    approvalPermissions: ["member:approve", "service_allocation:approve", "commercial_commitment:approve"],
    incompatibleRoleCodes: ["cooperative_auditor"],
    minimumVerificationLevel: "institution_verified",
    sensitive: true,
  },
  {
    code: "landing_site_operator",
    name: "Opérateur de site de débarquement",
    actorKinds: ["landing_site"],
    permissions: [
      "arrival:register",
      "weighing:register",
      "weighing:evidence_attach",
      "service_execution:confirm",
      "incident:report",
    ],
    approvalPermissions: [],
    incompatibleRoleCodes: ["landing_site_auditor"],
    minimumVerificationLevel: "document_verified",
    sensitive: false,
  },
  {
    code: "landing_site_supervisor",
    name: "Superviseur de site de débarquement",
    actorKinds: ["landing_site", "public_agency"],
    permissions: [
      "weighing:verify",
      "lot:validate",
      "service_execution:validate",
      "incident:resolve",
      "report:read_landing_site",
      "actor:suspend_landing_site",
    ],
    approvalPermissions: ["weighing:verify", "lot:validate", "service_execution:validate"],
    incompatibleRoleCodes: ["landing_site_auditor"],
    minimumVerificationLevel: "institution_verified",
    sensitive: true,
  },
  {
    code: "buyer_operator",
    name: "Acheteur",
    actorKinds: ["buyer", "processor"],
    permissions: [
      "lot:search",
      "lot:read",
      "commitment:create",
      "reception:confirm",
      "delivery_issue:report",
    ],
    approvalPermissions: [],
    incompatibleRoleCodes: [],
    minimumVerificationLevel: "document_verified",
    sensitive: false,
  },
  {
    code: "logistics_provider",
    name: "Prestataire logistique",
    actorKinds: ["logistics"],
    permissions: [
      "capacity:publish",
      "allocation:accept",
      "service_execution:confirm",
      "service_execution:evidence_attach",
      "incident:report",
    ],
    approvalPermissions: [],
    incompatibleRoleCodes: [],
    minimumVerificationLevel: "document_verified",
    sensitive: false,
  },
  {
    code: "ministry_analyst",
    name: "Analyste ministère",
    actorKinds: ["ministry", "public_agency"],
    permissions: [
      "report:read_national",
      "decision_briefing:read",
      "territory:readiness_read",
      "signal:read",
      "scenario:run",
    ],
    approvalPermissions: [],
    incompatibleRoleCodes: ["ministry_decision_maker"],
    minimumVerificationLevel: "institution_verified",
    sensitive: true,
  },
  {
    code: "ministry_decision_maker",
    name: "Décideur ministère",
    actorKinds: ["ministry"],
    permissions: [
      "territory:activate",
      "program:approve",
      "recommendation:approve",
      "actor:suspend_national",
      "decision_briefing:approve",
    ],
    approvalPermissions: ["territory:activate", "program:approve", "recommendation:approve", "decision_briefing:approve"],
    incompatibleRoleCodes: ["ministry_analyst"],
    minimumVerificationLevel: "strong",
    sensitive: true,
  },
  {
    code: "ecosystem_auditor",
    name: "Auditeur écosystème",
    actorKinds: ["public_agency", "development_partner"],
    permissions: [
      "audit:read",
      "document:read_verified",
      "access_log:read",
      "metric:read",
      "incident:read",
    ],
    approvalPermissions: [],
    incompatibleRoleCodes: ["cooperative_operator", "cooperative_manager", "landing_site_operator", "landing_site_supervisor"],
    minimumVerificationLevel: "institution_verified",
    sensitive: true,
  },
];

export class IdentityAccessAndTrustEngine {
  private readonly identities = new Map<EntityId, IdentityProfile>();
  private readonly assignments = new Map<EntityId, RoleAssignment>();
  private readonly delegations = new Map<EntityId, DelegationMandate>();
  private readonly consents = new Map<EntityId, ConsentGrant>();
  private readonly trustEvents: TrustEvent[] = [];
  private readonly auditEntries: AccessAuditEntry[] = [];
  private readonly roles = new Map<string, RoleDefinition>(roleDefinitions.map((role) => [role.code, role]));

  registerIdentity(input: IdentityProfile) {
    if (this.identities.has(input.id)) throw new Error(`L'identité ${input.id} existe déjà.`);
    if (input.verificationScore < 0 || input.verificationScore > 100) {
      throw new Error("Le score de vérification doit être compris entre 0 et 100.");
    }
    this.identities.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  updateIdentityStatus(input: { identityId: EntityId; status: IdentityStatus; updatedAt: ISODateTime }) {
    const identity = this.requireIdentity(input.identityId);
    identity.status = input.status;
    identity.updatedAt = input.updatedAt;
    this.identities.set(identity.id, identity);
    return structuredClone(identity);
  }

  setVerification(input: {
    identityId: EntityId;
    level: VerificationLevel;
    score: number;
    verifiedAt: ISODateTime;
    evidenceDocumentIds?: EntityId[];
  }) {
    const identity = this.requireIdentity(input.identityId);
    if (input.score < 0 || input.score > 100) throw new Error("Le score de vérification doit être compris entre 0 et 100.");
    identity.verificationLevel = input.level;
    identity.verificationScore = input.score;
    identity.status = input.level === "unverified" ? "pending_verification" : "active";
    identity.updatedAt = input.verifiedAt;
    this.identities.set(identity.id, identity);
    this.recordTrustEvent({
      id: `trust:identity_verified:${identity.id}:${input.verifiedAt}`,
      identityId: identity.id,
      type: "identity_verified",
      impact: Math.max(0, Math.min(25, input.score / 4)),
      description: `Niveau de vérification mis à jour vers ${input.level}.`,
      occurredAt: input.verifiedAt,
      metadata: { evidenceDocumentIds: input.evidenceDocumentIds ?? [] },
    });
    return structuredClone(identity);
  }

  assignRole(input: RoleAssignment) {
    if (this.assignments.has(input.id)) throw new Error(`L'affectation ${input.id} existe déjà.`);
    const identity = this.requireIdentity(input.identityId);
    this.requireIdentity(input.assignedByIdentityId);
    const role = this.requireRole(input.roleCode);
    if (!role.actorKinds.includes(identity.actorKind)) {
      throw new Error(`Le rôle ${role.code} n'est pas applicable au type d'acteur ${identity.actorKind}.`);
    }
    if (verificationRank[identity.verificationLevel] < verificationRank[role.minimumVerificationLevel]) {
      throw new Error(`Le niveau de vérification de ${identity.displayName} est insuffisant pour le rôle ${role.name}.`);
    }

    const activeRoleCodes = [...this.assignments.values()]
      .filter((assignment) => assignment.identityId === identity.id && assignment.status === "active")
      .map((assignment) => assignment.roleCode);
    const conflict = activeRoleCodes.find((code) => role.incompatibleRoleCodes.includes(code) || this.requireRole(code).incompatibleRoleCodes.includes(role.code));
    if (conflict) throw new Error(`Conflit de séparation des responsabilités entre ${role.code} et ${conflict}.`);

    this.assignments.set(input.id, structuredClone(input));
    this.recordTrustEvent({
      id: `trust:role_assigned:${input.id}`,
      identityId: input.identityId,
      type: "role_assigned",
      impact: role.sensitive ? 2 : 1,
      description: `Rôle ${role.name} attribué.`,
      occurredAt: input.createdAt,
      metadata: { roleCode: input.roleCode, assignmentId: input.id },
    });
    return structuredClone(input);
  }

  revokeRole(input: { assignmentId: EntityId; revokedAt: ISODateTime }) {
    const assignment = this.requireAssignment(input.assignmentId);
    assignment.status = "revoked";
    assignment.updatedAt = input.revokedAt;
    this.assignments.set(assignment.id, assignment);
    this.recordTrustEvent({
      id: `trust:role_revoked:${assignment.id}:${input.revokedAt}`,
      identityId: assignment.identityId,
      type: "role_revoked",
      impact: -2,
      description: `Rôle ${assignment.roleCode} révoqué.`,
      occurredAt: input.revokedAt,
      metadata: { assignmentId: assignment.id },
    });
    return structuredClone(assignment);
  }

  createDelegation(input: DelegationMandate) {
    if (this.delegations.has(input.id)) throw new Error(`La délégation ${input.id} existe déjà.`);
    const delegator = this.requireIdentity(input.delegatorIdentityId);
    const delegate = this.requireIdentity(input.delegateIdentityId);
    if (delegator.status !== "active" || delegate.status !== "active") {
      throw new Error("Le délégant et le délégataire doivent être actifs.");
    }
    if (input.validUntil <= input.validFrom) throw new Error("La fin de délégation doit être postérieure à son début.");
    for (const permission of input.permissionCodes) {
      const canDelegate = this.getEffectivePermissions(input.delegatorIdentityId, input.validFrom).has(permission);
      if (!canDelegate) throw new Error(`Le délégant ne possède pas la permission ${permission}.`);
    }
    this.delegations.set(input.id, structuredClone(input));
    this.recordTrustEvent({
      id: `trust:delegation_created:${input.id}`,
      identityId: input.delegateIdentityId,
      type: "delegation_created",
      impact: 0,
      description: `Délégation créée par ${delegator.displayName} pour ${delegate.displayName}.`,
      occurredAt: input.createdAt,
      metadata: { permissionCodes: input.permissionCodes },
    });
    return structuredClone(input);
  }

  revokeDelegation(input: { delegationId: EntityId; revokedAt: ISODateTime }) {
    const delegation = this.requireDelegation(input.delegationId);
    delegation.status = "revoked";
    delegation.revokedAt = input.revokedAt;
    this.delegations.set(delegation.id, delegation);
    this.recordTrustEvent({
      id: `trust:delegation_revoked:${delegation.id}:${input.revokedAt}`,
      identityId: delegation.delegateIdentityId,
      type: "delegation_revoked",
      impact: 0,
      description: "Délégation révoquée.",
      occurredAt: input.revokedAt,
      metadata: { delegationId: delegation.id },
    });
    return structuredClone(delegation);
  }

  grantConsent(input: ConsentGrant) {
    if (this.consents.has(input.id)) throw new Error(`Le consentement ${input.id} existe déjà.`);
    this.requireIdentity(input.identityId);
    this.consents.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  withdrawConsent(input: { consentId: EntityId; withdrawnAt: ISODateTime }) {
    const consent = this.requireConsent(input.consentId);
    consent.status = "withdrawn";
    consent.withdrawnAt = input.withdrawnAt;
    this.consents.set(consent.id, consent);
    return structuredClone(consent);
  }

  evaluateAccess(context: AccessContext, correlationId?: string): AccessEvaluation {
    const identity = this.requireIdentity(context.identityId);
    const reasons: string[] = [];
    const matchedRoleAssignments: EntityId[] = [];
    const matchedDelegationIds: EntityId[] = [];
    const requiredApprovalRoleCodes: string[] = [];

    if (identity.status !== "active") {
      reasons.push(`Identité non active : ${identity.status}.`);
      return this.audit(context, "deny", reasons, matchedRoleAssignments, matchedDelegationIds, requiredApprovalRoleCodes, correlationId);
    }

    const roleAssignments = this.getActiveAssignments(identity.id, context.currentTime).filter((assignment) =>
      this.matchesScope(assignment, context),
    );

    for (const assignment of roleAssignments) {
      const role = this.requireRole(assignment.roleCode);
      if (role.permissions.includes(context.permissionCode) || role.approvalPermissions.includes(context.permissionCode)) {
        matchedRoleAssignments.push(assignment.id);
        if (role.approvalPermissions.includes(context.permissionCode)) requiredApprovalRoleCodes.push(role.code);
      }
    }

    const delegations = [...this.delegations.values()].filter((delegation) =>
      delegation.delegateIdentityId === identity.id &&
      delegation.status === "active" &&
      delegation.validFrom <= context.currentTime &&
      delegation.validUntil >= context.currentTime &&
      delegation.permissionCodes.includes(context.permissionCode) &&
      this.matchesDelegationScope(delegation, context),
    );
    matchedDelegationIds.push(...delegations.map((delegation) => delegation.id));

    if (matchedRoleAssignments.length === 0 && matchedDelegationIds.length === 0) {
      reasons.push("Aucun rôle ni mandat actif ne donne cette permission dans ce périmètre.");
      return this.audit(context, "deny", reasons, matchedRoleAssignments, matchedDelegationIds, requiredApprovalRoleCodes, correlationId);
    }

    if (context.resourceSensitivity === "highly_sensitive" && verificationRank[identity.verificationLevel] < verificationRank.strong) {
      reasons.push("Une vérification forte est requise pour cette ressource.");
      return this.audit(context, "require_step_up", reasons, matchedRoleAssignments, matchedDelegationIds, requiredApprovalRoleCodes, correlationId);
    }

    if ((context.amount ?? 0) >= 1000000 && requiredApprovalRoleCodes.length === 0) {
      reasons.push("Une validation de niveau responsable est requise pour cette opération financière.");
      return this.audit(context, "require_approval", reasons, matchedRoleAssignments, matchedDelegationIds, ["cooperative_manager"], correlationId);
    }

    if (requiredApprovalRoleCodes.length > 0) {
      reasons.push("Cette action est soumise à approbation selon le rôle actif.");
      return this.audit(context, "require_approval", reasons, matchedRoleAssignments, matchedDelegationIds, requiredApprovalRoleCodes, correlationId);
    }

    reasons.push("Accès accordé dans le périmètre autorisé.");
    return this.audit(context, "allow", reasons, matchedRoleAssignments, matchedDelegationIds, requiredApprovalRoleCodes, correlationId);
  }

  getEffectivePermissions(identityId: EntityId, at: ISODateTime) {
    const permissions = new Set<string>();
    for (const assignment of this.getActiveAssignments(identityId, at)) {
      const role = this.requireRole(assignment.roleCode);
      role.permissions.forEach((permission) => permissions.add(permission));
      role.approvalPermissions.forEach((permission) => permissions.add(permission));
    }
    for (const delegation of this.delegations.values()) {
      if (
        delegation.delegateIdentityId === identityId &&
        delegation.status === "active" &&
        delegation.validFrom <= at &&
        delegation.validUntil >= at
      ) {
        delegation.permissionCodes.forEach((permission) => permissions.add(permission));
      }
    }
    return permissions;
  }

  getIdentityTrustSnapshot(identityId: EntityId) {
    const identity = this.requireIdentity(identityId);
    const events = this.trustEvents.filter((event) => event.identityId === identityId);
    const trustAdjustment = events.reduce((sum, event) => sum + event.impact, 0);
    const computedScore = Math.max(0, Math.min(100, Math.round(identity.verificationScore + trustAdjustment)));
    const assignments = this.getActiveAssignments(identityId, new Date().toISOString());
    const delegations = [...this.delegations.values()].filter(
      (delegation) => delegation.delegateIdentityId === identityId && delegation.status === "active",
    );
    return {
      identity: structuredClone(identity),
      computedTrustScore: computedScore,
      activeAssignments: assignments.map((assignment) => structuredClone(assignment)),
      activeDelegations: delegations.map((delegation) => structuredClone(delegation)),
      recentTrustEvents: events.slice(-20).map((event) => structuredClone(event)),
      highTrust: computedScore >= 80 && verificationRank[identity.verificationLevel] >= verificationRank.institution_verified,
    };
  }

  getMvpAccessMatrix() {
    return roleDefinitions.map((role) => ({
      roleCode: role.code,
      roleName: role.name,
      actorKinds: [...role.actorKinds],
      permissionCount: role.permissions.length,
      approvalPermissionCount: role.approvalPermissions.length,
      minimumVerificationLevel: role.minimumVerificationLevel,
      sensitive: role.sensitive,
    }));
  }

  snapshot() {
    return {
      roleDefinitions: structuredClone(roleDefinitions),
      identities: [...this.identities.values()].map((item) => structuredClone(item)),
      assignments: [...this.assignments.values()].map((item) => structuredClone(item)),
      delegations: [...this.delegations.values()].map((item) => structuredClone(item)),
      consents: [...this.consents.values()].map((item) => structuredClone(item)),
      trustEvents: this.trustEvents.map((item) => structuredClone(item)),
      auditEntries: this.auditEntries.map((item) => structuredClone(item)),
    };
  }

  private audit(
    context: AccessContext,
    decision: AccessDecision,
    reasons: string[],
    matchedRoleAssignments: EntityId[],
    matchedDelegationIds: EntityId[],
    requiredApprovalRoleCodes: string[],
    correlationId?: string,
  ): AccessEvaluation {
    this.auditEntries.push({
      id: `access:${context.identityId}:${context.permissionCode}:${context.currentTime}:${this.auditEntries.length}`,
      identityId: context.identityId,
      permissionCode: context.permissionCode,
      decision,
      reasons: [...reasons],
      scope: {
        organizationId: context.organizationId,
        territoryId: context.territoryId,
        landingSiteId: context.landingSiteId,
        cooperativeId: context.cooperativeId,
      },
      occurredAt: context.currentTime,
      correlationId,
    });

    if (decision === "deny" || decision === "allow") {
      this.recordTrustEvent({
        id: `trust:${decision === "deny" ? "access_denied" : "access_approved"}:${context.identityId}:${context.currentTime}:${this.trustEvents.length}`,
        identityId: context.identityId,
        type: decision === "deny" ? "access_denied" : "access_approved",
        impact: decision === "deny" ? -1 : 0.1,
        description: reasons.join(" "),
        occurredAt: context.currentTime,
        metadata: { permissionCode: context.permissionCode },
      });
    }

    return {
      decision,
      reasons: [...reasons],
      matchedRoleAssignments,
      matchedDelegationIds,
      requiredApprovalRoleCodes,
    };
  }

  private getActiveAssignments(identityId: EntityId, at: ISODateTime) {
    return [...this.assignments.values()].filter(
      (assignment) =>
        assignment.identityId === identityId &&
        assignment.status === "active" &&
        assignment.validFrom <= at &&
        (!assignment.validUntil || assignment.validUntil >= at),
    );
  }

  private matchesScope(assignment: RoleAssignment, context: AccessContext) {
    if (assignment.organizationId && assignment.organizationId !== context.organizationId) return false;
    if (assignment.territoryId && assignment.territoryId !== context.territoryId) return false;
    if (assignment.landingSiteId && assignment.landingSiteId !== context.landingSiteId) return false;
    if (assignment.cooperativeId && assignment.cooperativeId !== context.cooperativeId) return false;
    return true;
  }

  private matchesDelegationScope(delegation: DelegationMandate, context: AccessContext) {
    if (delegation.scope.organizationId && delegation.scope.organizationId !== context.organizationId) return false;
    if (delegation.scope.territoryId && delegation.scope.territoryId !== context.territoryId) return false;
    if (delegation.scope.landingSiteId && delegation.scope.landingSiteId !== context.landingSiteId) return false;
    if (delegation.scope.cooperativeId && delegation.scope.cooperativeId !== context.cooperativeId) return false;
    return true;
  }

  private recordTrustEvent(event: TrustEvent) {
    this.trustEvents.push(structuredClone(event));
  }

  private requireIdentity(id: EntityId) {
    const identity = this.identities.get(id);
    if (!identity) throw new Error(`Identité introuvable : ${id}.`);
    return identity;
  }

  private requireRole(code: string) {
    const role = this.roles.get(code);
    if (!role) throw new Error(`Rôle introuvable : ${code}.`);
    return role;
  }

  private requireAssignment(id: EntityId) {
    const assignment = this.assignments.get(id);
    if (!assignment) throw new Error(`Affectation introuvable : ${id}.`);
    return assignment;
  }

  private requireDelegation(id: EntityId) {
    const delegation = this.delegations.get(id);
    if (!delegation) throw new Error(`Délégation introuvable : ${id}.`);
    return delegation;
  }

  private requireConsent(id: EntityId) {
    const consent = this.consents.get(id);
    if (!consent) throw new Error(`Consentement introuvable : ${id}.`);
    return consent;
  }
}

export function getMvpIdentityAccessCatalog() {
  return structuredClone(roleDefinitions);
}

export function validateMvpIdentityAccessCatalog() {
  const errors: string[] = [];
  const roleCodes = new Set<string>();
  for (const role of roleDefinitions) {
    if (roleCodes.has(role.code)) errors.push(`Code de rôle dupliqué : ${role.code}.`);
    roleCodes.add(role.code);
    if (role.actorKinds.length === 0) errors.push(`${role.code}: aucun type d'acteur.`);
    if (role.permissions.length === 0 && role.approvalPermissions.length === 0) {
      errors.push(`${role.code}: aucune permission.`);
    }
    for (const incompatible of role.incompatibleRoleCodes) {
      if (!roleDefinitions.some((candidate) => candidate.code === incompatible)) {
        errors.push(`${role.code}: rôle incompatible inconnu ${incompatible}.`);
      }
    }
  }

  const coveredActorKinds = new Set(roleDefinitions.flatMap((role) => role.actorKinds));
  const mandatoryMvpActorKinds: MvpActorKind[] = [
    "fisher",
    "cooperative",
    "landing_site",
    "buyer",
    "processor",
    "logistics",
    "ministry",
    "public_agency",
  ];
  for (const actorKind of mandatoryMvpActorKinds) {
    if (!coveredActorKinds.has(actorKind)) errors.push(`Type d'acteur MVP non couvert : ${actorKind}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      roleCount: roleDefinitions.length,
      actorKindCoverage: [...coveredActorKinds],
      sensitiveRoleCount: roleDefinitions.filter((role) => role.sensitive).length,
      approvalPermissionCount: roleDefinitions.reduce((sum, role) => sum + role.approvalPermissions.length, 0),
    },
  };
}
