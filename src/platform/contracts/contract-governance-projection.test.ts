import test from "node:test";
import assert from "node:assert/strict";
import { projectContractGovernance } from "./contract-governance-projection";
import type { OperationalContractRuntime } from "./operational-contract-runtime";

test("recommande un renouvellement sous conditions lorsqu'un ecart reste ouvert", () => {
  const snapshot = {
    contracts: [{ id: "contract-1", code: "COLD-2026", title: "Maintenance chaîne du froid", contractType: "public_service", territoryIds: ["territory-dakar"], partyOrganizationIds: ["org-ministry", "org-provider"], signatoryActorIds: ["actor-1", "actor-2"], signedContractDocumentIds: ["contract-signed"], effectiveAt: "2026-01-01T00:00:00.000Z", expiresAt: "2026-08-31T00:00:00.000Z", status: "at_risk" as const }],
    obligations: [{ id: "obligation-1", contractId: "contract-1", responsibleOrganizationId: "org-provider", responsibleActorId: "actor-provider", obligationType: "maintain_availability", description: "Maintenir 95 % de disponibilité", territoryIds: ["territory-dakar"], targetValue: 95, unit: "%", breachThreshold: 90, evaluationMode: "minimum", status: "breached" as const, sourceDocumentIds: ["annexe-sla"] }],
    executionRecords: [],
    correctivePlans: [{ id: "plan-1", contractId: "contract-1", obligationId: "obligation-1", ownerActorId: "actor-provider", actions: ["Remplacer le compresseur"], dueAt: "2026-08-10T00:00:00.000Z", planDocumentIds: ["plan-signed"], status: "in_progress" as const }],
    governanceDecisions: [],
    metrics: { activeContractCount: 0, atRiskContractCount: 1, dueObligationCount: 0, breachedObligationCount: 1, fulfillmentPercent: 0, correctivePlanOpenCount: 1, institutionalConstraintCount: 0 },
  } satisfies ReturnType<OperationalContractRuntime["snapshot"]>;

  const projection = projectContractGovernance(snapshot, "2026-07-28T00:00:00.000Z");
  assert.equal(projection.metrics.expiringWithin60Days, 1);
  assert.equal(projection.upcomingExpirations[0].recommendation, "renew_with_conditions");
  assert.deepEqual(projection.atRiskContracts[0].openPlanIds, ["plan-1"]);
});
