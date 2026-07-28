import test from "node:test";
import assert from "node:assert/strict";
import { ActorGovernanceControl } from "./actor-governance-control";
import type { ActiveActorMandate } from "./ecosystem-actor-governance-runtime";

const mandate: ActiveActorMandate = {
  id: "mandate-coop-1",
  applicationId: "application-coop-1",
  actorId: "actor-manager-1",
  organizationId: "cooperative-kayar-1",
  roleCodes: ["cooperative.manager", "payment.prepare"],
  territoryIds: ["territory-kayar"],
  activatedByActorId: "actor-public-1",
  validFrom: "2026-07-28T08:00:00.000Z",
  validUntil: "2027-07-28T08:00:00.000Z",
  maximumAmountXof: 5_000_000,
  maximumQuantityKg: 50_000,
  restrictions: [],
  activationDocumentIds: ["decision-mandate-coop-1"],
  status: "active",
};

test("delegue une action bornee et exige deux validations distinctes", () => {
  const control = new ActorGovernanceControl();
  const delegation = control.createDelegation({
    mandate,
    delegation: {
      id: "delegation-1",
      mandateId: mandate.id,
      delegatorActorId: mandate.actorId,
      delegateActorId: "actor-deputy-1",
      roleCodes: ["payment.prepare"],
      territoryIds: ["territory-kayar"],
      validFrom: "2026-08-01T08:00:00.000Z",
      validUntil: "2026-08-15T18:00:00.000Z",
      maximumAmountXof: 2_000_000,
      maximumQuantityKg: 10_000,
      allowedActionTypes: ["prepare_cooperative_payment"],
      requiresDualApproval: true,
      delegationDocumentIds: ["lettre-delegation-signee-1"],
      status: "active",
    },
  });

  control.requestSensitiveAction({
    mandate,
    delegation,
    request: {
      id: "request-1",
      actorId: "actor-deputy-1",
      mandateId: mandate.id,
      delegationId: delegation.id,
      actionType: "prepare_cooperative_payment",
      territoryId: "territory-kayar",
      amountXof: 1_500_000,
      supportingDocumentIds: ["bordereau-paiement-1"],
      requestedAt: "2026-08-02T09:00:00.000Z",
      requiredApprovalCount: 1,
      approverActorIds: [],
      status: "pending",
    },
  });

  const first = control.approve({ requestId: "request-1", approverActorId: "actor-approver-1" });
  assert.equal(first.status, "partially_approved");
  const second = control.approve({ requestId: "request-1", approverActorId: "actor-approver-2" });
  assert.equal(second.status, "approved");
  assert.equal(control.markExecuted({ requestId: "request-1" }).status, "executed");
});

test("refuse une combinaison de roles qui permet de preparer et executer le meme paiement", () => {
  const control = new ActorGovernanceControl();
  assert.throws(() => control.createDelegation({
    mandate: { ...mandate, roleCodes: ["payment.prepare", "payment.execute"] },
    delegation: {
      id: "delegation-conflict",
      mandateId: mandate.id,
      delegatorActorId: mandate.actorId,
      delegateActorId: "actor-deputy-2",
      roleCodes: ["payment.prepare", "payment.execute"],
      territoryIds: ["territory-kayar"],
      validFrom: "2026-08-01T08:00:00.000Z",
      validUntil: "2026-08-10T18:00:00.000Z",
      allowedActionTypes: ["prepare_cooperative_payment", "execute_cooperative_payment"],
      requiresDualApproval: true,
      delegationDocumentIds: ["lettre-delegation-conflit"],
      status: "active",
    },
  }), /combinaison de rôles interdite/i);
});
