import assert from "node:assert/strict";
import test from "node:test";

import {
  BearerTokenApiAuthenticator,
  InMemorySecurityRepository,
  NationalAccessControl,
  type PermissionGrant,
  type SecurityIdentity,
} from "./national-access-control";

const now = "2026-07-27T15:00:00.000Z";
const later = "2026-07-28T15:00:00.000Z";

function fixture() {
  const repository = new InMemorySecurityRepository();
  const identity: SecurityIdentity = {
    id: "identity:agent",
    identityType: "person",
    verificationLevel: "field_verified",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  repository.identities.set(identity.id, identity);
  repository.memberships.push({
    id: "membership:agent:joal",
    identityId: identity.id,
    organizationId: "org:quai:joal",
    territoryIds: ["territory:joal"],
    status: "active",
    validFrom: "2026-01-01T00:00:00.000Z",
    createdAt: now,
  });
  const grant: PermissionGrant = {
    id: "grant:landing-agent",
    identityId: identity.id,
    organizationId: "org:quai:joal",
    roleCode: "landing_agent",
    permissionCodes: ["landing.confirm", "weighing.create"],
    territoryIds: ["territory:joal"],
    scopeType: "territory",
    validFrom: "2026-01-01T00:00:00.000Z",
    status: "active",
    grantedByIdentityId: identity.id,
  };
  repository.grants.push(grant);
  const access = new NationalAccessControl(
    repository,
    { now: () => now },
    { next: (prefix) => `${prefix}:${repository.audits.length + 1}` },
  );
  return { repository, identity, access };
}

test("ouvre une session forte uniquement sur les territoires autorisés", async () => {
  const { repository, access } = fixture();
  const session = await access.createSession({
    id: "session:1",
    identityId: "identity:agent",
    tokenHash: "hash:token",
    authenticationLevel: "strong",
    factors: ["password", "otp_sms"],
    organizationId: "org:quai:joal",
    selectedTerritoryIds: ["territory:joal"],
    expiresAt: later,
  });
  assert.equal(session.status, "active");
  assert.equal(repository.audits[0]?.eventType, "authentication_succeeded");
});

test("refuse une session sur un territoire hors appartenance", async () => {
  const { access } = fixture();
  await assert.rejects(
    access.createSession({
      id: "session:2",
      identityId: "identity:agent",
      tokenHash: "hash:token:2",
      authenticationLevel: "verified",
      factors: ["otp_sms"],
      selectedTerritoryIds: ["territory:kayar"],
      expiresAt: later,
    }),
    /hors des appartenances actives/i,
  );
});

test("autorise une action dans le territoire et la permission de la session", async () => {
  const { access } = fixture();
  const session = await access.createSession({
    id: "session:3",
    identityId: "identity:agent",
    tokenHash: "hash:token:3",
    authenticationLevel: "verified",
    factors: ["otp_sms"],
    selectedTerritoryIds: ["territory:joal"],
    expiresAt: later,
  });
  const decision = await access.authorize({
    identityId: "identity:agent",
    sessionId: session.id,
    organizationId: "org:quai:joal",
    actionType: "confirm_landing",
    requiredPermissionCodes: ["landing.confirm"],
    territoryIds: ["territory:joal"],
    requiredAuthenticationLevel: "verified",
    occurredAt: now,
  });
  assert.equal(decision.decision, "allowed");
});

test("refuse une action hors périmètre territorial", async () => {
  const { access } = fixture();
  const session = await access.createSession({
    id: "session:4",
    identityId: "identity:agent",
    tokenHash: "hash:token:4",
    authenticationLevel: "verified",
    factors: ["otp_sms"],
    selectedTerritoryIds: ["territory:joal"],
    expiresAt: later,
  });
  const decision = await access.authorize({
    identityId: "identity:agent",
    sessionId: session.id,
    actionType: "confirm_landing",
    requiredPermissionCodes: ["landing.confirm"],
    territoryIds: ["territory:kayar"],
    occurredAt: now,
  });
  assert.equal(decision.decision, "denied");
  assert.equal(decision.reasons.some((reason) => reason.includes("session")), true);
});

test("impose une élévation de niveau pour une opération sensible", async () => {
  const { access } = fixture();
  const session = await access.createSession({
    id: "session:5",
    identityId: "identity:agent",
    tokenHash: "hash:token:5",
    authenticationLevel: "basic",
    factors: ["password"],
    selectedTerritoryIds: ["territory:joal"],
    expiresAt: later,
  });
  const decision = await access.authorize({
    identityId: "identity:agent",
    sessionId: session.id,
    actionType: "confirm_landing",
    requiredPermissionCodes: ["landing.confirm"],
    territoryIds: ["territory:joal"],
    requiredAuthenticationLevel: "strong",
    occurredAt: now,
  });
  assert.equal(decision.decision, "step_up_required");
});

test("applique une délégation plafonnée et territorialisée", async () => {
  const { repository, access } = fixture();
  repository.grants.length = 0;
  repository.delegations.set("delegation:1", {
    id: "delegation:1",
    delegatorIdentityId: "identity:supervisor",
    delegateIdentityId: "identity:agent",
    permissionCodes: ["payment.approve"],
    territoryIds: ["territory:joal"],
    scopeType: "territory",
    validFrom: "2026-01-01T00:00:00.000Z",
    validUntil: later,
    maximumAmountXof: 500_000,
    allowedActionTypes: ["approve_payment"],
    requiresDualApproval: false,
    status: "active",
    evidenceIds: ["evidence:delegation"],
  });
  const session = await access.createSession({
    id: "session:6",
    identityId: "identity:agent",
    tokenHash: "hash:token:6",
    authenticationLevel: "strong",
    factors: ["password", "otp_sms"],
    selectedTerritoryIds: ["territory:joal"],
    expiresAt: later,
  });
  const allowed = await access.authorize({
    identityId: "identity:agent",
    sessionId: session.id,
    delegationId: "delegation:1",
    actionType: "approve_payment",
    requiredPermissionCodes: ["payment.approve"],
    territoryIds: ["territory:joal"],
    amountXof: 400_000,
    requiredAuthenticationLevel: "strong",
    occurredAt: now,
  });
  assert.equal(allowed.decision, "allowed");
  const denied = await access.authorize({
    identityId: "identity:agent",
    sessionId: session.id,
    delegationId: "delegation:1",
    actionType: "approve_payment",
    requiredPermissionCodes: ["payment.approve"],
    territoryIds: ["territory:joal"],
    amountXof: 700_000,
    requiredAuthenticationLevel: "strong",
    occurredAt: now,
  });
  assert.equal(denied.decision, "denied");
});

test("bloque une combinaison de rôles contraire à la séparation des responsabilités", async () => {
  const { repository, access } = fixture();
  repository.grants.push({
    ...repository.grants[0]!,
    id: "grant:payment-approver",
    roleCode: "payment_approver",
    permissionCodes: ["payment.approve"],
  });
  const session = await access.createSession({
    id: "session:7",
    identityId: "identity:agent",
    tokenHash: "hash:token:7",
    authenticationLevel: "strong",
    factors: ["password", "otp_sms"],
    selectedTerritoryIds: ["territory:joal"],
    expiresAt: later,
  });
  const decision = await access.authorize({
    identityId: "identity:agent",
    sessionId: session.id,
    actionType: "approve_payment",
    requiredPermissionCodes: ["payment.approve"],
    territoryIds: ["territory:joal"],
    prohibitedRoleCombinations: [["landing_agent", "payment_approver"]],
    occurredAt: now,
  });
  assert.equal(decision.decision, "denied");
});

test("authentifie l'API par jeton Bearer et propage le principal", async () => {
  const { repository, access } = fixture();
  await access.createSession({
    id: "session:8",
    identityId: "identity:agent",
    tokenHash: "hash:bearer",
    authenticationLevel: "verified",
    factors: ["otp_sms"],
    organizationId: "org:quai:joal",
    selectedTerritoryIds: ["territory:joal"],
    expiresAt: later,
  });
  const authenticator = new BearerTokenApiAuthenticator(repository, access, { hash: (token) => `hash:${token}` });
  const principal = await authenticator.authenticate({ method: "GET", path: "/api/v1/landings", headers: { authorization: "Bearer bearer" }, query: {}, params: {} });
  assert.equal(principal.identityId, "identity:agent");
  assert.equal(principal.permissions.includes("landing.confirm"), true);
});
