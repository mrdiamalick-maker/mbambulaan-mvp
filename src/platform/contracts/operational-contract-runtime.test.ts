import test from "node:test";
import assert from "node:assert/strict";
import { OperationalContractRuntime } from "./operational-contract-runtime";

test("active un contrat, detecte une rupture et impose un plan correctif", () => {
  const runtime = new OperationalContractRuntime();

  runtime.execute({
    commandId: "cmd-contract-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-national",
    command: {
      type: "register_contract",
      contract: {
        id: "contract-cold-chain-1",
        code: "CC-DAKAR-2026-01",
        title: "Maintien de la chaîne du froid Dakar",
        contractType: "public_service",
        territoryIds: ["territory-dakar"],
        partyOrganizationIds: ["org-service-peche-dakar", "org-cold-chain-dakar"],
        signatoryActorIds: ["actor-government", "actor-cold-chain-manager"],
        signedContractDocumentIds: ["contrat-signe-cc-dakar-2026"],
        effectiveAt: "2026-07-01T00:00:00.000Z",
        expiresAt: "2027-06-30T23:59:59.000Z",
        status: "under_review",
      },
    },
  });

  runtime.execute({
    commandId: "cmd-contract-2",
    actorId: "actor-government",
    activeTerritoryId: "territory-national",
    command: {
      type: "add_obligation",
      obligation: {
        id: "obligation-availability-1",
        contractId: "contract-cold-chain-1",
        responsibleOrganizationId: "org-cold-chain-dakar",
        responsibleActorId: "actor-cold-chain-manager",
        beneficiaryOrganizationId: "org-service-peche-dakar",
        obligationType: "maintain_availability",
        description: "Maintenir une disponibilité mensuelle minimale de 95 % des chambres froides.",
        territoryIds: ["territory-dakar"],
        targetValue: 95,
        unit: "percent",
        warningThreshold: 92,
        breachThreshold: 90,
        evaluationMode: "minimum",
        status: "planned",
        sourceDocumentIds: ["annexe-sla-availability-1"],
      },
    },
  });

  runtime.execute({
    commandId: "cmd-contract-3",
    actorId: "actor-government",
    activeTerritoryId: "territory-national",
    command: {
      type: "record_governance_decision",
      decision: {
        id: "decision-activate-contract-1",
        contractId: "contract-cold-chain-1",
        decisionType: "activate",
        decidedByActorId: "actor-government",
        reason: "Contrat signé et obligation de disponibilité validée.",
        decisionDocumentIds: ["decision-activation-contract-1"],
        decidedAt: "2026-07-01T00:00:00.000Z",
      },
    },
  });

  runtime.execute({
    commandId: "cmd-contract-4",
    actorId: "actor-cold-chain-manager",
    activeTerritoryId: "territory-dakar",
    command: {
      type: "record_execution",
      record: {
        id: "execution-july-1",
        obligationId: "obligation-availability-1",
        recordedByActorId: "actor-cold-chain-manager",
        measuredValue: 88,
        periodStart: "2026-07-01T00:00:00.000Z",
        periodEnd: "2026-07-31T23:59:59.000Z",
        completionDocumentIds: ["rapport-disponibilite-juillet-2026"],
        comment: "Deux pannes ont réduit la disponibilité mensuelle.",
        recordedAt: "2026-08-01T08:00:00.000Z",
        outcome: "warning",
      },
    },
  });

  runtime.execute({
    commandId: "cmd-contract-5",
    actorId: "actor-government",
    activeTerritoryId: "territory-national",
    command: {
      type: "register_corrective_plan",
      plan: {
        id: "plan-correctif-1",
        contractId: "contract-cold-chain-1",
        obligationId: "obligation-availability-1",
        ownerActorId: "actor-cold-chain-manager",
        actions: ["Remplacer le compresseur principal", "Mettre en place une astreinte de maintenance"],
        dueAt: "2026-08-15T18:00:00.000Z",
        planDocumentIds: ["compte-rendu-plan-correctif-1"],
        status: "planned",
      },
    },
  });

  const snapshot = runtime.snapshot("2026-08-02T00:00:00.000Z");
  assert.equal(snapshot.contracts[0].status, "at_risk");
  assert.equal(snapshot.obligations[0].status, "breached");
  assert.equal(snapshot.correctivePlans[0].status, "planned");
  assert.equal(snapshot.metrics.atRiskContractCount, 1);
  assert.equal(snapshot.metrics.correctivePlanOpenCount, 1);
});

test("enregistre une assurance obligatoire comme contrainte institutionnelle", () => {
  const runtime = new OperationalContractRuntime();
  runtime.execute({
    commandId: "cmd-contract-insurance-1",
    actorId: "actor-government",
    activeTerritoryId: "territory-national",
    command: {
      type: "register_contract",
      contract: {
        id: "contract-insurance-1",
        code: "INS-PROGRAM-2026",
        title: "Couverture imposée par le programme public",
        contractType: "insurance",
        territoryIds: ["territory-national"],
        partyOrganizationIds: ["org-public-program", "org-insurer"],
        signatoryActorIds: ["actor-public-program", "actor-insurer"],
        signedContractDocumentIds: ["police-assurance-signee-2026"],
        status: "under_review",
        institutionalConstraint: {
          constraintType: "mandatory_insurance",
          institutionName: "Programme public de modernisation halieutique",
          reference: "Clause 12 du programme 2026",
          supportingDocumentIds: ["programme-public-clause-12"],
        },
      },
    },
  });
  const snapshot = runtime.snapshot("2026-07-28T00:00:00.000Z");
  assert.equal(snapshot.metrics.institutionalConstraintCount, 1);
  assert.equal(snapshot.contracts[0].institutionalConstraint?.constraintType, "mandatory_insurance");
});
