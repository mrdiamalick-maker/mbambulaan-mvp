import assert from "node:assert/strict";
import test from "node:test";

import { EndToEndEcosystemIdentityTrustGovernanceCapability } from "./end-to-end-ecosystem-identity-trust-governance-capability";

const createdAt = "2026-07-27T08:00:00Z";
const later = "2026-07-27T12:00:00Z";

function registerActiveIdentity(capability: EndToEndEcosystemIdentityTrustGovernanceCapability, caseId: string, identityId: string, actorTypes: string[]) {
  capability.registerIdentity({
    caseId,
    identity: {
      id: identityId,
      principalType: "person",
      displayName: identityId,
      territoryIds: ["territory-joal"],
      actorTypes,
      verificationLevel: "declared",
      status: "pending",
      verifiedByActorIds: [],
      evidenceIds: [],
      createdAt,
      updatedAt: createdAt,
    },
  });
  capability.verifyIdentity({
    caseId,
    identityId,
    level: "field_verified",
    verifiedByActorId: "identity-verifier",
    evidenceIds: [`proof-${identityId}`],
    verifiedAt: createdAt,
  });
}

test("une action financière sensible exige identité vérifiée, permissions, délégation plafonnée et double approbation", () => {
  const capability = new EndToEndEcosystemIdentityTrustGovernanceCapability();
  capability.openCase({ id: "identity-case", ecosystemId: "mbambulaan", countryId: "sn", createdAt });

  registerActiveIdentity(capability, "identity-case", "identity-director", ["director"]);
  registerActiveIdentity(capability, "identity-case", "identity-delegate", ["finance_officer"]);
  registerActiveIdentity(capability, "identity-case", "identity-approver-1", ["approver"]);
  registerActiveIdentity(capability, "identity-case", "identity-approver-2", ["approver"]);

  capability.assignRole({
    caseId: "identity-case",
    assignment: {
      id: "role-director",
      identityId: "identity-director",
      roleCode: "economic_director",
      scopeType: "capability",
      scopeId: "economic-steering",
      permissionCodes: ["release_funds", "delegate_funds"],
      validFrom: createdAt,
      assignedByActorId: "board",
      status: "active",
      evidenceIds: ["board-resolution"],
    },
  });
  for (const approver of ["identity-approver-1", "identity-approver-2"]) {
    capability.assignRole({
      caseId: "identity-case",
      assignment: {
        id: `role-${approver}`,
        identityId: approver,
        roleCode: "independent_approver",
        scopeType: "capability",
        scopeId: "economic-steering",
        permissionCodes: ["approve"],
        validFrom: createdAt,
        assignedByActorId: "board",
        status: "active",
        evidenceIds: [`resolution-${approver}`],
      },
    });
  }

  capability.createDelegation({
    caseId: "identity-case",
    delegation: {
      id: "delegation-funds",
      delegatorIdentityId: "identity-director",
      delegateIdentityId: "identity-delegate",
      roleAssignmentId: "role-director",
      permissionCodes: ["release_funds"],
      scopeId: "economic-steering",
      validFrom: createdAt,
      validUntil: "2026-12-31T23:59:59Z",
      maximumAmountXof: 5_000_000,
      allowedActionTypes: ["release_funds"],
      requiresDualApproval: true,
      status: "active",
      reason: "Continuité opérationnelle",
      evidenceIds: ["delegation-mandate"],
      createdAt,
    },
  });

  capability.defineApprovalPolicy({
    caseId: "identity-case",
    policy: {
      id: "policy-release-funds",
      actionType: "release_funds",
      scopeType: "capability",
      scopeId: "economic-steering",
      requiredPermissionCodes: ["release_funds"],
      minimumVerificationLevel: "document_checked",
      minimumTrustScore: 50,
      dualApprovalRequired: true,
      amountThresholdXof: 1_000_000,
      prohibitedRoleCombinations: [["economic_director", "independent_approver"]],
      status: "active",
    },
    definedAt: createdAt,
  });
  capability.defineApprovalPolicy({
    caseId: "identity-case",
    policy: {
      id: "policy-approve",
      actionType: "approve",
      scopeType: "capability",
      scopeId: "economic-steering",
      requiredPermissionCodes: ["approve"],
      minimumVerificationLevel: "document_checked",
      minimumTrustScore: 50,
      dualApprovalRequired: false,
      prohibitedRoleCombinations: [],
      status: "active",
    },
    definedAt: createdAt,
  });

  capability.requestApproval({
    caseId: "identity-case",
    request: {
      id: "approval-release-funds",
      actionType: "release_funds",
      requestedByIdentityId: "identity-delegate",
      onBehalfOfIdentityId: "identity-director",
      delegationId: "delegation-funds",
      scopeType: "capability",
      scopeId: "economic-steering",
      amountXof: 4_000_000,
      payloadReferenceIds: ["financing-case-1"],
      evidenceIds: ["funding-need-proof"],
      status: "pending",
      approverIdentityIds: [],
      requestedAt: createdAt,
    },
  });

  const firstApproval = capability.decideApproval({ caseId: "identity-case", requestId: "approval-release-funds", approverIdentityId: "identity-approver-1", approved: true, reason: "Besoin justifié", decidedAt: later });
  assert.equal(firstApproval.status, "partially_approved");
  const secondApproval = capability.decideApproval({ caseId: "identity-case", requestId: "approval-release-funds", approverIdentityId: "identity-approver-2", approved: true, reason: "Budget disponible", decidedAt: later });
  assert.equal(secondApproval.status, "approved");

  const authorization = capability.authorize({
    caseId: "identity-case",
    identityId: "identity-delegate",
    actionType: "release_funds",
    scopeType: "capability",
    scopeId: "economic-steering",
    requiredPermissionCodes: ["release_funds"],
    amountXof: 4_000_000,
    delegationId: "delegation-funds",
    approvalRequestId: "approval-release-funds",
    occurredAt: later,
  });
  assert.equal(authorization.decision, "allowed");

  const overLimit = capability.authorize({
    caseId: "identity-case",
    identityId: "identity-delegate",
    actionType: "release_funds",
    scopeType: "capability",
    scopeId: "economic-steering",
    requiredPermissionCodes: ["release_funds"],
    amountXof: 7_000_000,
    delegationId: "delegation-funds",
    approvalRequestId: "approval-release-funds",
    occurredAt: later,
  });
  assert.equal(overLimit.decision, "denied");
  assert.match(overLimit.reasons.join(" "), /plafond de délégation/i);
});

test("la séparation des responsabilités interdit à une même personne de décider et approuver", () => {
  const capability = new EndToEndEcosystemIdentityTrustGovernanceCapability();
  capability.openCase({ id: "segregation-case", ecosystemId: "mbambulaan", countryId: "sn", createdAt });
  registerActiveIdentity(capability, "segregation-case", "identity-conflicted", ["director", "approver"]);

  capability.assignRole({
    caseId: "segregation-case",
    assignment: {
      id: "role-conflicted-director",
      identityId: "identity-conflicted",
      roleCode: "economic_director",
      scopeType: "capability",
      scopeId: "economic-steering",
      permissionCodes: ["release_funds"],
      validFrom: createdAt,
      assignedByActorId: "board",
      status: "active",
      evidenceIds: ["proof-role-1"],
    },
  });
  capability.assignRole({
    caseId: "segregation-case",
    assignment: {
      id: "role-conflicted-approver",
      identityId: "identity-conflicted",
      roleCode: "independent_approver",
      scopeType: "capability",
      scopeId: "economic-steering",
      permissionCodes: ["approve"],
      validFrom: createdAt,
      assignedByActorId: "board",
      status: "active",
      evidenceIds: ["proof-role-2"],
    },
  });
  capability.defineApprovalPolicy({
    caseId: "segregation-case",
    policy: {
      id: "policy-segregation",
      actionType: "release_funds",
      scopeType: "capability",
      scopeId: "economic-steering",
      requiredPermissionCodes: ["release_funds"],
      minimumVerificationLevel: "document_checked",
      minimumTrustScore: 50,
      dualApprovalRequired: false,
      prohibitedRoleCombinations: [["economic_director", "independent_approver"]],
      status: "active",
    },
    definedAt: createdAt,
  });

  const decision = capability.authorize({
    caseId: "segregation-case",
    identityId: "identity-conflicted",
    actionType: "release_funds",
    scopeType: "capability",
    scopeId: "economic-steering",
    requiredPermissionCodes: ["release_funds"],
    amountXof: 500_000,
    occurredAt: later,
  });
  assert.equal(decision.decision, "denied");
  assert.match(decision.reasons.join(" "), /séparation des responsabilités/i);
});

test("les signaux critiques réduisent la confiance et restreignent automatiquement l'identité", () => {
  const capability = new EndToEndEcosystemIdentityTrustGovernanceCapability();
  capability.openCase({ id: "trust-case", ecosystemId: "mbambulaan", countryId: "sn", createdAt });
  registerActiveIdentity(capability, "trust-case", "identity-risk", ["supplier"]);

  capability.recordTrustSignal({
    caseId: "trust-case",
    signal: {
      id: "signal-fraud-1",
      identityId: "identity-risk",
      signalType: "fraud_suspected",
      impact: -35,
      capabilityId: "sale-settlement",
      caseId: "sale-risk-1",
      territoryId: "territory-joal",
      evidenceIds: ["fraud-proof-1"],
      recordedAt: createdAt,
    },
  });
  const restrictedCase = capability.recordTrustSignal({
    caseId: "trust-case",
    signal: {
      id: "signal-fraud-2",
      identityId: "identity-risk",
      signalType: "sanction_applied",
      impact: -35,
      capabilityId: "sale-settlement",
      caseId: "sale-risk-1",
      territoryId: "territory-joal",
      evidenceIds: ["sanction-proof"],
      recordedAt: later,
    },
  });
  const identity = restrictedCase.identities.find((entry) => entry.id === "identity-risk");
  assert.equal(identity?.status, "restricted");
  assert.ok(capability.getTrustScore("trust-case", "identity-risk") < 40);

  const authorization = capability.authorize({
    caseId: "trust-case",
    identityId: "identity-risk",
    actionType: "publish_offer",
    scopeType: "territory",
    scopeId: "territory-joal",
    requiredPermissionCodes: ["publish_offer"],
    occurredAt: later,
  });
  assert.equal(authorization.decision, "denied");
});

test("le command center rend visibles refus, demandes de renforcement et délégations expirées", () => {
  const capability = new EndToEndEcosystemIdentityTrustGovernanceCapability();
  capability.openCase({ id: "command-case", ecosystemId: "mbambulaan", countryId: "sn", createdAt });
  registerActiveIdentity(capability, "command-case", "identity-operator", ["operator"]);
  registerActiveIdentity(capability, "command-case", "identity-delegator", ["manager"]);

  capability.assignRole({
    caseId: "command-case",
    assignment: {
      id: "role-manager",
      identityId: "identity-delegator",
      roleCode: "manager",
      scopeType: "territory",
      scopeId: "territory-joal",
      permissionCodes: ["approve_transfer"],
      validFrom: createdAt,
      assignedByActorId: "authority",
      status: "active",
      evidenceIds: ["role-proof"],
    },
  });
  capability.createDelegation({
    caseId: "command-case",
    delegation: {
      id: "expired-delegation",
      delegatorIdentityId: "identity-delegator",
      delegateIdentityId: "identity-operator",
      roleAssignmentId: "role-manager",
      permissionCodes: ["approve_transfer"],
      scopeId: "territory-joal",
      validFrom: createdAt,
      validUntil: "2026-07-27T10:00:00Z",
      maximumQuantity: 1_000,
      allowedActionTypes: ["approve_transfer"],
      requiresDualApproval: false,
      status: "active",
      reason: "Relais temporaire",
      evidenceIds: ["delegation-proof"],
      createdAt,
    },
  });
  capability.defineApprovalPolicy({
    caseId: "command-case",
    policy: {
      id: "policy-transfer",
      actionType: "approve_transfer",
      scopeType: "territory",
      scopeId: "territory-joal",
      requiredPermissionCodes: ["approve_transfer"],
      minimumVerificationLevel: "trusted",
      minimumTrustScore: 80,
      dualApprovalRequired: false,
      prohibitedRoleCombinations: [],
      status: "active",
    },
    definedAt: createdAt,
  });

  const stepUp = capability.authorize({
    caseId: "command-case",
    identityId: "identity-operator",
    actionType: "approve_transfer",
    scopeType: "territory",
    scopeId: "territory-joal",
    requiredPermissionCodes: ["approve_transfer"],
    quantity: 500,
    delegationId: "expired-delegation",
    occurredAt: later,
  });
  assert.ok(["denied", "step_up_required"].includes(stepUp.decision));

  const commandCenter = capability.getGovernanceCommandCenter({ caseId: "command-case", generatedAt: later });
  assert.equal(commandCenter.identityCount, 2);
  assert.equal(commandCenter.expiredDelegations.length, 1);
  assert.ok(commandCenter.deniedActionCount + commandCenter.stepUpActionCount >= 1);
});
