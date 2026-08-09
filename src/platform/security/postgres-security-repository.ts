import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";
import type { SqlExecutor } from "../persistence/postgres-platform-adapters";
import type {
  OrganizationMembership,
  PermissionGrant,
  SecurityAuditEvent,
  SecurityDelegation,
  SecurityIdentity,
  SecurityRepository,
  SecuritySession,
} from "./national-access-control";

export class PostgresSecurityRepository implements SecurityRepository {
  constructor(private readonly executor: () => SqlExecutor) {}

  async findIdentity(identityId: EntityId): Promise<SecurityIdentity | undefined> {
    const result = await this.executor().query<any>(
      `select id, external_subject, phone_number_hash, email_hash, identity_type,
              verification_level, status, created_at, updated_at
       from security_identities where id = $1`,
      [identityId],
    );
    const row = result.rows[0];
    return row ? {
      id: row.id,
      externalSubject: row.external_subject ?? undefined,
      phoneNumberHash: row.phone_number_hash ?? undefined,
      emailHash: row.email_hash ?? undefined,
      identityType: row.identity_type,
      verificationLevel: row.verification_level,
      status: row.status,
      createdAt: row.created_at as ISODateTime,
      updatedAt: row.updated_at as ISODateTime,
    } : undefined;
  }

  async findSessionById(sessionId: EntityId) {
    return this.findSession("id = $1", sessionId);
  }

  async findSessionByTokenHash(tokenHash: string) {
    return this.findSession("token_hash = $1", tokenHash);
  }

  async saveSession(session: SecuritySession): Promise<void> {
    await this.executor().query(
      `insert into security_sessions
       (id, identity_id, token_hash, authentication_level, factors, organization_id,
        selected_territory_ids, issued_at, expires_at, last_seen_at, revoked_at,
        status, device_id_hash, ip_address_hash)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       on conflict (id) do update set
         authentication_level = excluded.authentication_level,
         factors = excluded.factors,
         organization_id = excluded.organization_id,
         selected_territory_ids = excluded.selected_territory_ids,
         expires_at = excluded.expires_at,
         last_seen_at = excluded.last_seen_at,
         revoked_at = excluded.revoked_at,
         status = excluded.status,
         device_id_hash = excluded.device_id_hash,
         ip_address_hash = excluded.ip_address_hash`,
      [session.id, session.identityId, session.tokenHash, session.authenticationLevel, session.factors,
       session.organizationId ?? null, session.selectedTerritoryIds, session.issuedAt, session.expiresAt,
       session.lastSeenAt, session.revokedAt ?? null, session.status, session.deviceIdHash ?? null,
       session.ipAddressHash ?? null],
    );
  }

  async listMemberships(identityId: EntityId): Promise<OrganizationMembership[]> {
    const result = await this.executor().query<any>(
      `select id, identity_id, organization_id, territory_ids, status, valid_from, valid_until, created_at
       from organization_memberships where identity_id = $1`,
      [identityId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      identityId: row.identity_id,
      organizationId: row.organization_id,
      territoryIds: row.territory_ids ?? [],
      status: row.status,
      validFrom: row.valid_from as ISODateTime,
      validUntil: row.valid_until as ISODateTime | undefined,
      createdAt: row.created_at as ISODateTime,
    }));
  }

  async listGrants(identityId: EntityId): Promise<PermissionGrant[]> {
    const result = await this.executor().query<any>(
      `select id, identity_id, organization_id, role_code, permission_codes, territory_ids,
              scope_type, scope_id, valid_from, valid_until, status, granted_by_identity_id
       from permission_grants where identity_id = $1`,
      [identityId],
    );
    return result.rows.map((row) => ({
      id: row.id,
      identityId: row.identity_id,
      organizationId: row.organization_id ?? undefined,
      roleCode: row.role_code,
      permissionCodes: row.permission_codes ?? [],
      territoryIds: row.territory_ids ?? [],
      scopeType: row.scope_type,
      scopeId: row.scope_id ?? undefined,
      validFrom: row.valid_from as ISODateTime,
      validUntil: row.valid_until as ISODateTime | undefined,
      status: row.status,
      grantedByIdentityId: row.granted_by_identity_id,
    }));
  }

  async findDelegation(delegationId: EntityId): Promise<SecurityDelegation | undefined> {
    const result = await this.executor().query<any>(
      `select id, delegator_identity_id, delegate_identity_id, permission_codes, territory_ids,
              scope_type, scope_id, valid_from, valid_until, maximum_amount_xof,
              allowed_action_types, requires_dual_approval, status, evidence_ids
       from security_delegations where id = $1`,
      [delegationId],
    );
    const row = result.rows[0];
    return row ? {
      id: row.id,
      delegatorIdentityId: row.delegator_identity_id,
      delegateIdentityId: row.delegate_identity_id,
      permissionCodes: row.permission_codes ?? [],
      territoryIds: row.territory_ids ?? [],
      scopeType: row.scope_type,
      scopeId: row.scope_id ?? undefined,
      validFrom: row.valid_from as ISODateTime,
      validUntil: row.valid_until as ISODateTime,
      maximumAmountXof: row.maximum_amount_xof === null ? undefined : Number(row.maximum_amount_xof),
      allowedActionTypes: row.allowed_action_types ?? [],
      requiresDualApproval: row.requires_dual_approval,
      status: row.status,
      evidenceIds: row.evidence_ids ?? [],
    } : undefined;
  }

  async appendAudit(event: SecurityAuditEvent): Promise<void> {
    await this.executor().query(
      `insert into security_audit_events
       (id, identity_id, session_id, event_type, action_type, resource_type,
        resource_id, territory_ids, reasons, correlation_id, occurred_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [event.id, event.identityId ?? null, event.sessionId ?? null, event.eventType,
       event.actionType ?? null, event.resourceType ?? null, event.resourceId ?? null,
       event.territoryIds, event.reasons, event.correlationId ?? null, event.occurredAt],
    );
  }

  private async findSession(predicate: string, value: string): Promise<SecuritySession | undefined> {
    const result = await this.executor().query<any>(
      `select id, identity_id, token_hash, authentication_level, factors, organization_id,
              selected_territory_ids, issued_at, expires_at, last_seen_at, revoked_at,
              status, device_id_hash, ip_address_hash
       from security_sessions where ${predicate}`,
      [value],
    );
    const row = result.rows[0];
    return row ? {
      id: row.id,
      identityId: row.identity_id,
      tokenHash: row.token_hash,
      authenticationLevel: row.authentication_level,
      factors: row.factors ?? [],
      organizationId: row.organization_id ?? undefined,
      selectedTerritoryIds: row.selected_territory_ids ?? [],
      issuedAt: row.issued_at as ISODateTime,
      expiresAt: row.expires_at as ISODateTime,
      lastSeenAt: row.last_seen_at as ISODateTime,
      revokedAt: row.revoked_at as ISODateTime | undefined,
      status: row.status,
      deviceIdHash: row.device_id_hash ?? undefined,
      ipAddressHash: row.ip_address_hash ?? undefined,
    } : undefined;
  }
}
