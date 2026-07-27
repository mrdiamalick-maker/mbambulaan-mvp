import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";
import type { ApiAuthenticator, ApiPrincipal, ApiRequest } from "../api/versioned-business-api";

export type AuthenticationFactor = "password" | "otp_sms" | "otp_whatsapp" | "totp" | "passkey" | "federated" | "service_secret";
export type AuthenticationLevel = ApiPrincipal["authenticationLevel"];
export type SessionStatus = "active" | "revoked" | "expired" | "compromised";
export type MembershipStatus = "pending" | "active" | "suspended" | "revoked";

export interface SecurityIdentity {
  id: EntityId;
  externalSubject?: string;
  phoneNumberHash?: string;
  emailHash?: string;
  identityType: "person" | "service_account";
  verificationLevel: "unverified" | "declared" | "document_checked" | "field_verified" | "trusted";
  status: "pending" | "active" | "restricted" | "suspended" | "revoked";
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface OrganizationMembership {
  id: EntityId;
  identityId: EntityId;
  organizationId: EntityId;
  territoryIds: EntityId[];
  status: MembershipStatus;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  createdAt: ISODateTime;
}

export interface PermissionGrant {
  id: EntityId;
  identityId: EntityId;
  organizationId?: EntityId;
  roleCode: string;
  permissionCodes: string[];
  territoryIds: EntityId[];
  scopeType: "national" | "territory" | "organization" | "resource";
  scopeId?: EntityId;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  status: "active" | "suspended" | "revoked" | "expired";
  grantedByIdentityId: EntityId;
}

export interface SecurityDelegation {
  id: EntityId;
  delegatorIdentityId: EntityId;
  delegateIdentityId: EntityId;
  permissionCodes: string[];
  territoryIds: EntityId[];
  scopeType: PermissionGrant["scopeType"];
  scopeId?: EntityId;
  validFrom: ISODateTime;
  validUntil: ISODateTime;
  maximumAmountXof?: number;
  allowedActionTypes: string[];
  requiresDualApproval: boolean;
  status: "active" | "suspended" | "revoked" | "expired";
  evidenceIds: EntityId[];
}

export interface SecuritySession {
  id: EntityId;
  identityId: EntityId;
  tokenHash: string;
  authenticationLevel: AuthenticationLevel;
  factors: AuthenticationFactor[];
  organizationId?: EntityId;
  selectedTerritoryIds: EntityId[];
  issuedAt: ISODateTime;
  expiresAt: ISODateTime;
  lastSeenAt: ISODateTime;
  revokedAt?: ISODateTime;
  status: SessionStatus;
  deviceIdHash?: string;
  ipAddressHash?: string;
}

export interface SecurityAuditEvent {
  id: EntityId;
  identityId?: EntityId;
  sessionId?: EntityId;
  eventType:
    | "authentication_succeeded"
    | "authentication_failed"
    | "session_revoked"
    | "authorization_allowed"
    | "authorization_denied"
    | "step_up_required"
    | "delegation_used"
    | "security_policy_violation";
  actionType?: string;
  resourceType?: string;
  resourceId?: EntityId;
  territoryIds: EntityId[];
  reasons: string[];
  correlationId?: EntityId;
  occurredAt: ISODateTime;
}

export interface AuthorizationRequest {
  identityId: EntityId;
  sessionId?: EntityId;
  organizationId?: EntityId;
  actionType: string;
  requiredPermissionCodes: string[];
  territoryIds: EntityId[];
  resourceType?: string;
  resourceId?: EntityId;
  amountXof?: number;
  delegationId?: EntityId;
  requiredAuthenticationLevel?: AuthenticationLevel;
  occurredAt: ISODateTime;
  correlationId?: EntityId;
}

export interface AuthorizationDecision {
  decision: "allowed" | "denied" | "step_up_required";
  reasons: string[];
  permissionCodes: string[];
  territoryIds: EntityId[];
  grantIds: EntityId[];
  delegationId?: EntityId;
  authenticationLevel: AuthenticationLevel;
}

export interface SecurityRepository {
  findIdentity(identityId: EntityId): Promise<SecurityIdentity | undefined>;
  findSessionByTokenHash(tokenHash: string): Promise<SecuritySession | undefined>;
  saveSession(session: SecuritySession): Promise<void>;
  listMemberships(identityId: EntityId): Promise<OrganizationMembership[]>;
  listGrants(identityId: EntityId): Promise<PermissionGrant[]>;
  findDelegation(delegationId: EntityId): Promise<SecurityDelegation | undefined>;
  appendAudit(event: SecurityAuditEvent): Promise<void>;
}

export interface SecurityClock { now(): ISODateTime; }
export interface SecurityIdGenerator { next(prefix: string): EntityId; }
export interface TokenHasher { hash(token: string): string; }

const authOrder: AuthenticationLevel[] = ["anonymous", "basic", "verified", "strong"];

export class NationalAccessControl {
  constructor(
    private readonly repository: SecurityRepository,
    private readonly clock: SecurityClock,
    private readonly ids: SecurityIdGenerator,
  ) {}

  async createSession(input: {
    id: EntityId;
    identityId: EntityId;
    tokenHash: string;
    authenticationLevel: AuthenticationLevel;
    factors: AuthenticationFactor[];
    organizationId?: EntityId;
    selectedTerritoryIds: EntityId[];
    expiresAt: ISODateTime;
    deviceIdHash?: string;
    ipAddressHash?: string;
  }) {
    const identity = await this.repository.findIdentity(input.identityId);
    if (!identity || identity.status !== "active") throw new Error("L'identité doit être active pour ouvrir une session.");
    if (Date.parse(input.expiresAt) <= Date.parse(this.clock.now())) throw new Error("La session doit expirer dans le futur.");
    if (input.authenticationLevel === "strong" && input.factors.length < 2 && !input.factors.includes("passkey")) {
      throw new Error("Une authentification forte nécessite deux facteurs ou une passkey.");
    }
    const memberships = (await this.repository.listMemberships(input.identityId)).filter((item) => this.isActiveWindow(item, this.clock.now()));
    const authorizedTerritories = new Set(memberships.flatMap((item) => item.territoryIds));
    if (input.selectedTerritoryIds.some((territoryId) => !authorizedTerritories.has(territoryId))) {
      throw new Error("La session demande un territoire hors des appartenances actives.");
    }
    const session: SecuritySession = {
      ...input,
      issuedAt: this.clock.now(),
      lastSeenAt: this.clock.now(),
      status: "active",
    };
    await this.repository.saveSession(session);
    await this.audit({ identityId: input.identityId, sessionId: input.id, eventType: "authentication_succeeded", territoryIds: input.selectedTerritoryIds, reasons: [], occurredAt: this.clock.now() });
    return structuredClone(session);
  }

  async revokeSession(session: SecuritySession, reason: string) {
    if (session.status !== "active") return structuredClone(session);
    session.status = "revoked";
    session.revokedAt = this.clock.now();
    await this.repository.saveSession(session);
    await this.audit({ identityId: session.identityId, sessionId: session.id, eventType: "session_revoked", territoryIds: session.selectedTerritoryIds, reasons: [reason], occurredAt: this.clock.now() });
    return structuredClone(session);
  }

  async authorize(input: AuthorizationRequest): Promise<AuthorizationDecision> {
    const identity = await this.repository.findIdentity(input.identityId);
    const reasons: string[] = [];
    let level: AuthenticationLevel = "anonymous";
    if (!identity || identity.status !== "active") reasons.push("Identité absente ou non active.");

    if (input.sessionId) {
      const session = await this.findSessionByIdThroughTokenUnsupported(input.sessionId);
      if (session) level = session.authenticationLevel;
    }

    const grants = (await this.repository.listGrants(input.identityId)).filter((grant) =>
      grant.status === "active" && this.isActiveWindow(grant, input.occurredAt) &&
      (!input.organizationId || !grant.organizationId || grant.organizationId === input.organizationId) &&
      input.territoryIds.every((territoryId) => grant.scopeType === "national" || grant.territoryIds.includes(territoryId)),
    );
    const permissions = new Set(grants.flatMap((grant) => grant.permissionCodes));
    let delegation: SecurityDelegation | undefined;
    if (input.delegationId) {
      delegation = await this.repository.findDelegation(input.delegationId);
      if (!delegation || delegation.delegateIdentityId !== input.identityId || delegation.status !== "active" || !this.isActiveWindow(delegation, input.occurredAt)) {
        reasons.push("Délégation absente, inactive ou expirée.");
      } else {
        if (!delegation.allowedActionTypes.includes(input.actionType)) reasons.push("Action non autorisée par la délégation.");
        if (input.amountXof !== undefined && delegation.maximumAmountXof !== undefined && input.amountXof > delegation.maximumAmountXof) reasons.push("Montant supérieur au plafond de délégation.");
        if (input.territoryIds.some((id) => !delegation!.territoryIds.includes(id))) reasons.push("Territoire hors délégation.");
        delegation.permissionCodes.forEach((permission) => permissions.add(permission));
      }
    }

    const missing = input.requiredPermissionCodes.filter((permission) => !permissions.has(permission));
    if (missing.length) reasons.push(`Permissions manquantes : ${missing.join(", ")}.`);
    const requiredLevel = input.requiredAuthenticationLevel ?? "basic";
    let decision: AuthorizationDecision["decision"] = reasons.length ? "denied" : "allowed";
    if (!reasons.length && authOrder.indexOf(level) < authOrder.indexOf(requiredLevel)) {
      decision = "step_up_required";
      reasons.push(`Niveau ${requiredLevel} requis.`);
    }
    const result: AuthorizationDecision = {
      decision,
      reasons,
      permissionCodes: [...permissions],
      territoryIds: [...input.territoryIds],
      grantIds: grants.map((grant) => grant.id),
      delegationId: delegation?.id,
      authenticationLevel: level,
    };
    await this.audit({
      identityId: input.identityId,
      sessionId: input.sessionId,
      eventType: decision === "allowed" ? "authorization_allowed" : decision === "step_up_required" ? "step_up_required" : "authorization_denied",
      actionType: input.actionType,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      territoryIds: input.territoryIds,
      reasons,
      correlationId: input.correlationId,
      occurredAt: input.occurredAt,
    });
    return result;
  }

  async resolvePrincipal(session: SecuritySession): Promise<ApiPrincipal> {
    if (session.status !== "active" || Date.parse(session.expiresAt) <= Date.parse(this.clock.now())) throw new Error("Session inactive ou expirée.");
    const identity = await this.repository.findIdentity(session.identityId);
    if (!identity || identity.status !== "active") throw new Error("Identité inactive.");
    const memberships = (await this.repository.listMemberships(identity.id)).filter((item) => this.isActiveWindow(item, this.clock.now()));
    const grants = (await this.repository.listGrants(identity.id)).filter((item) => item.status === "active" && this.isActiveWindow(item, this.clock.now()));
    return {
      identityId: identity.id,
      organizationId: session.organizationId ?? memberships[0]?.organizationId,
      territoryIds: [...new Set(session.selectedTerritoryIds)],
      permissions: [...new Set(grants.flatMap((grant) => grant.permissionCodes))],
      authenticationLevel: session.authenticationLevel,
    };
  }

  private async findSessionByIdThroughTokenUnsupported(_sessionId: EntityId): Promise<SecuritySession | undefined> {
    return undefined;
  }

  private isActiveWindow(item: { validFrom: ISODateTime; validUntil?: ISODateTime; status: string }, at: ISODateTime) {
    return item.status === "active" && Date.parse(item.validFrom) <= Date.parse(at) && (!item.validUntil || Date.parse(item.validUntil) > Date.parse(at));
  }

  private async audit(event: Omit<SecurityAuditEvent, "id">) {
    await this.repository.appendAudit({ id: this.ids.next("security-audit"), ...event });
  }
}

export class BearerTokenApiAuthenticator implements ApiAuthenticator {
  constructor(
    private readonly repository: SecurityRepository,
    private readonly accessControl: NationalAccessControl,
    private readonly hasher: TokenHasher,
  ) {}

  async authenticate(request: ApiRequest): Promise<ApiPrincipal> {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
      return { identityId: "anonymous", territoryIds: [], permissions: [], authenticationLevel: "anonymous" };
    }
    const token = authorization.slice("Bearer ".length).trim();
    if (!token) throw new Error("Jeton Bearer vide.");
    const session = await this.repository.findSessionByTokenHash(this.hasher.hash(token));
    if (!session) throw new Error("Session introuvable.");
    return this.accessControl.resolvePrincipal(session);
  }
}

export class InMemorySecurityRepository implements SecurityRepository {
  readonly identities = new Map<EntityId, SecurityIdentity>();
  readonly sessions = new Map<EntityId, SecuritySession>();
  readonly memberships: OrganizationMembership[] = [];
  readonly grants: PermissionGrant[] = [];
  readonly delegations = new Map<EntityId, SecurityDelegation>();
  readonly audits: SecurityAuditEvent[] = [];

  async findIdentity(identityId: EntityId) { const item = this.identities.get(identityId); return item ? structuredClone(item) : undefined; }
  async findSessionByTokenHash(tokenHash: string) { const item = [...this.sessions.values()].find((session) => session.tokenHash === tokenHash); return item ? structuredClone(item) : undefined; }
  async saveSession(session: SecuritySession) { this.sessions.set(session.id, structuredClone(session)); }
  async listMemberships(identityId: EntityId) { return structuredClone(this.memberships.filter((item) => item.identityId === identityId)); }
  async listGrants(identityId: EntityId) { return structuredClone(this.grants.filter((item) => item.identityId === identityId)); }
  async findDelegation(delegationId: EntityId) { const item = this.delegations.get(delegationId); return item ? structuredClone(item) : undefined; }
  async appendAudit(event: SecurityAuditEvent) { this.audits.push(structuredClone(event)); }
}
