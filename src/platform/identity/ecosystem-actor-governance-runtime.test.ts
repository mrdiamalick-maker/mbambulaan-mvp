import test from "node:test";
import assert from "node:assert/strict";
import { EcosystemActorGovernanceRuntime } from "./ecosystem-actor-governance-runtime";

test("active puis restreint le mandat d'un responsable cooperatif", () => {
  const runtime = new EcosystemActorGovernanceRuntime();

  runtime.execute({
    commandId: "cmd-actor-1",
    actorId: "actor-national-admin",
    activeTerritoryId: "territory-national",
    command: {
      type: "submit_application",
      application: {
        id: "application-1",
        actorKind: "cooperative_manager",
        personOrOrganizationName: "Awa Ndiaye",
        organizationId: "cooperative-kayar-1",
        territoryIds: ["territory-kayar"],
        requestedRoleCodes: ["cooperative.manager", "landing.read"],
        submittedByActorId: "actor-awa",
        identityDocumentIds: ["document-identite-awa"],
        organizationDocumentIds: ["statuts-cooperative-kayar"],
        mandateDocumentIds: ["proces-verbal-nomination-awa"],
        contactReference: "+221770000000",
        submittedAt: "2026-07-28T08:00:00.000Z",
        status: "submitted",
      },
    },
  });

  runtime.execute({ commandId: "cmd-actor-2", actorId: "actor-national-admin", activeTerritoryId: "territory-national", command: { type: "start_review", applicationId: "application-1" } });

  runtime.execute({
    commandId: "cmd-actor-3",
    actorId: "actor-governance-reviewer",
    activeTerritoryId: "territory-national",
    command: {
      type: "record_review",
      review: {
        id: "review-1",
        applicationId: "application-1",
        reviewedByActorId: "actor-governance-reviewer",
        identityChecked: true,
        organizationChecked: true,
        mandateChecked: true,
        fieldConfirmationRequired: true,
        fieldConfirmationDocumentIds: ["compte-rendu-visite-kayar"],
        decision: "approve",
        decisionReason: "Identité, organisation et mandat confirmés.",
        approvedRoleCodes: ["cooperative.manager", "landing.read"],
        approvedTerritoryIds: ["territory-kayar"],
        validUntil: "2027-07-28T00:00:00.000Z",
        reviewDocumentIds: ["compte-rendu-revue-1"],
        reviewedAt: "2026-07-28T10:00:00.000Z",
      },
    },
  });

  runtime.execute({
    commandId: "cmd-actor-4",
    actorId: "actor-national-admin",
    activeTerritoryId: "territory-national",
    command: {
      type: "activate_mandate",
      mandate: {
        id: "mandate-1",
        applicationId: "application-1",
        actorId: "actor-awa",
        organizationId: "cooperative-kayar-1",
        roleCodes: ["cooperative.manager", "landing.read"],
        territoryIds: ["territory-kayar"],
        activatedByActorId: "actor-national-admin",
        validFrom: "2026-07-28T10:30:00.000Z",
        validUntil: "2027-07-28T00:00:00.000Z",
        maximumAmountXof: 5_000_000,
        maximumQuantityKg: 50_000,
        restrictions: [],
        activationDocumentIds: ["decision-activation-mandat-1"],
        status: "active",
      },
    },
  });

  const result = runtime.execute({
    commandId: "cmd-actor-5",
    actorId: "actor-national-admin",
    activeTerritoryId: "territory-national",
    command: {
      type: "record_governance_action",
      action: {
        id: "action-1",
        mandateId: "mandate-1",
        actionType: "restrict",
        decidedByActorId: "actor-national-admin",
        reason: "La validation des dépenses supérieures à 2 000 000 FCFA nécessite une double signature.",
        effectiveAt: "2026-08-02T09:00:00.000Z",
        restrictionNotes: ["Double signature au-delà de 2 000 000 FCFA"],
        decisionDocumentIds: ["decision-restriction-mandat-1"],
      },
    },
  });

  assert.equal(result.snapshot.metrics.restrictedMandateCount, 1);
  assert.equal(result.snapshot.mandates[0].status, "restricted");
  assert.deepEqual(result.snapshot.mandates[0].restrictions, ["Double signature au-delà de 2 000 000 FCFA"]);
});

test("refuse d'accorder un role qui n'a pas ete demande", () => {
  const runtime = new EcosystemActorGovernanceRuntime();
  runtime.execute({
    commandId: "cmd-refusal-1",
    actorId: "actor-admin",
    activeTerritoryId: "territory-national",
    command: {
      type: "submit_application",
      application: {
        id: "application-refusal",
        actorKind: "buyer",
        personOrOrganizationName: "Acheteur Dakar",
        territoryIds: ["territory-dakar"],
        requestedRoleCodes: ["trade.buy"],
        submittedByActorId: "actor-buyer",
        identityDocumentIds: ["registre-commerce-buyer"],
        organizationDocumentIds: [],
        mandateDocumentIds: [],
        contactReference: "buyer@example.sn",
        submittedAt: "2026-07-28T08:00:00.000Z",
        status: "submitted",
      },
    },
  });
  runtime.execute({ commandId: "cmd-refusal-2", actorId: "actor-admin", activeTerritoryId: "territory-national", command: { type: "start_review", applicationId: "application-refusal" } });

  assert.throws(() => runtime.execute({
    commandId: "cmd-refusal-3",
    actorId: "actor-reviewer",
    activeTerritoryId: "territory-national",
    command: {
      type: "record_review",
      review: {
        id: "review-refusal",
        applicationId: "application-refusal",
        reviewedByActorId: "actor-reviewer",
        identityChecked: true,
        organizationChecked: false,
        mandateChecked: false,
        fieldConfirmationRequired: false,
        fieldConfirmationDocumentIds: [],
        decision: "approve",
        decisionReason: "Revue réalisée.",
        approvedRoleCodes: ["finance.write"],
        approvedTerritoryIds: ["territory-dakar"],
        reviewDocumentIds: ["compte-rendu-refusal"],
        reviewedAt: "2026-07-28T09:00:00.000Z",
      },
    },
  }), /role non demande/i);
});
