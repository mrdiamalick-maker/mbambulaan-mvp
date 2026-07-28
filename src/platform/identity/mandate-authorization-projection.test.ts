import test from "node:test";
import assert from "node:assert/strict";
import { MandateAuthorizationProjection } from "./mandate-authorization-projection";
import type { ActiveActorMandate } from "./ecosystem-actor-governance-runtime";
import type { TemporaryDelegation } from "./actor-governance-control";

const mandate: ActiveActorMandate = {
  id: "mandate-1",
  applicationId: "application-1",
  actorId: "actor-awa",
  organizationId: "cooperative-kayar-1",
  roleCodes: ["cooperative.manager"],
  territoryIds: ["territory-kayar"],
  activatedByActorId: "actor-admin",
  validFrom: "2026-07-01T00:00:00.000Z",
  validUntil: "2026-08-15T00:00:00.000Z",
  maximumAmountXof: 5_000_000,
  maximumQuantityKg: 50_000,
  restrictions: [],
  activationDocumentIds: ["decision-activation-1"],
  status: "active",
};

test("autorise une action dans le perimetre du mandat et refuse un depassement", () => {
  const projection = new MandateAuthorizationProjection();
  const authorized = projection.decide({
    mandates: [mandate],
    request: {
      actorId: "actor-awa",
      permissionCode: "trade.write",
      territoryId: "territory-kayar",
      organizationId: "cooperative-kayar-1",
      amountXof: 1_500_000,
      quantityKg: 5_000,
      at: "2026-07-28T10:00:00.000Z",
    },
  });
  assert.equal(authorized.allowed, true);
  assert.equal(authorized.reason, "authorized_by_mandate");

  const refused = projection.decide({
    mandates: [mandate],
    request: {
      actorId: "actor-awa",
      permissionCode: "trade.write",
      territoryId: "territory-kayar",
      organizationId: "cooperative-kayar-1",
      amountXof: 6_000_000,
      at: "2026-07-28T10:00:00.000Z",
    },
  });
  assert.equal(refused.allowed, false);
  assert.equal(refused.reason, "amount_limit_exceeded");
});

test("exige une double validation lorsqu'elle est imposee par le mandat", () => {
  const projection = new MandateAuthorizationProjection();
  const decision = projection.decide({
    mandates: [{ ...mandate, status: "restricted", restrictions: ["Double validation pour toute dépense"] }],
    request: {
      actorId: "actor-awa",
      permissionCode: "capacity.write",
      territoryId: "territory-kayar",
      amountXof: 500_000,
      at: "2026-07-28T10:00:00.000Z",
    },
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.requiresDualApproval, true);
  assert.equal(decision.reason, "dual_approval_required");
});

test("autorise une delegation temporaire bornee", () => {
  const projection = new MandateAuthorizationProjection();
  const delegation: TemporaryDelegation = {
    id: "delegation-1",
    mandateId: "mandate-1",
    delegatorActorId: "actor-awa",
    delegateActorId: "actor-adjoint",
    roleCodes: ["cooperative.manager"],
    territoryIds: ["territory-kayar"],
    allowedActionTypes: ["prepare_payment"],
    validFrom: "2026-07-28T08:00:00.000Z",
    validUntil: "2026-07-30T18:00:00.000Z",
    maximumAmountXof: 2_000_000,
    maximumQuantityKg: 10_000,
    requiresDualApproval: false,
    delegationDocumentIds: ["lettre-delegation-1"],
    status: "active",
  };
  const decision = projection.decide({
    mandates: [mandate],
    delegations: [delegation],
    request: {
      actorId: "actor-adjoint",
      permissionCode: "finance.read",
      territoryId: "territory-kayar",
      amountXof: 1_000_000,
      actionType: "prepare_payment",
      at: "2026-07-29T10:00:00.000Z",
    },
  });
  assert.equal(decision.allowed, true);
  assert.equal(decision.reason, "authorized_by_delegation");
  assert.equal(decision.delegationId, "delegation-1");
});

test("identifie les mandats a renouveler dans les trente jours", () => {
  const projection = new MandateAuthorizationProjection();
  const expiring = projection.expiringMandates({ mandates: [mandate], at: "2026-07-28T00:00:00.000Z", withinDays: 30 });
  assert.deepEqual(expiring.map((item) => item.id), ["mandate-1"]);
});
