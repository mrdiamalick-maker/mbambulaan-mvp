import test from "node:test";
import assert from "node:assert/strict";
import { ContractObligationScheduler, type RecurringObligationTemplate } from "./contract-obligation-scheduler";
import { ContractBusinessEventProjector } from "./contract-business-event-projector";
import type { OperationalContract, OperationalObligation } from "./operational-contract-runtime";

const contract: OperationalContract = {
  id: "contract-cold-chain-1",
  code: "CC-DAKAR-2026",
  title: "Maintenance chaîne du froid Dakar",
  contractType: "public_service",
  territoryIds: ["territory-dakar"],
  partyOrganizationIds: ["org-ministry", "org-cold-chain"],
  signatoryActorIds: ["actor-ministry", "actor-provider"],
  signedContractDocumentIds: ["contrat-signe-1"],
  effectiveAt: "2026-07-01T00:00:00.000Z",
  expiresAt: "2027-06-30T23:59:59.000Z",
  status: "active",
};

const obligation: OperationalObligation = {
  id: "obligation-availability-1",
  contractId: contract.id,
  responsibleOrganizationId: "org-cold-chain",
  responsibleActorId: "actor-provider",
  beneficiaryOrganizationId: "org-ministry",
  obligationType: "maintain_availability",
  description: "Maintenir une disponibilité mensuelle de 95 %.",
  territoryIds: ["territory-dakar"],
  dueAt: "2026-08-31T23:59:59.000Z",
  targetValue: 95,
  unit: "%",
  breachThreshold: 90,
  evaluationMode: "minimum",
  status: "planned",
  sourceDocumentIds: ["annexe-sla-1"],
};

test("genere les occurrences mensuelles sans doublon", () => {
  const scheduler = new ContractObligationScheduler();
  const template: RecurringObligationTemplate = {
    id: "template-monthly-report",
    contractId: contract.id,
    responsibleOrganizationId: "org-cold-chain",
    responsibleActorId: "actor-provider",
    beneficiaryOrganizationId: "org-ministry",
    obligationType: "report",
    description: "Transmettre le rapport mensuel de disponibilité",
    territoryIds: ["territory-dakar"],
    recurrenceCode: "monthly",
    firstDueAt: "2026-08-31T23:59:59.000Z",
    sourceDocumentIds: ["clause-reporting-4"],
    active: true,
  };
  const generated = scheduler.generateOccurrences({ template, until: "2026-10-31T23:59:59.000Z", existingObligationIds: ["template-monthly-report-2026-09-30"] });
  assert.deepEqual(generated.map((item) => item.id), ["template-monthly-report-2026-08-31", "template-monthly-report-2026-10-31"]);
});

test("emet les alertes avant echeance et pour un plan correctif en retard", () => {
  const scheduler = new ContractObligationScheduler();
  const alerts = scheduler.alerts({
    contracts: [{ ...contract, expiresAt: "2026-08-20T00:00:00.000Z" }],
    obligations: [obligation],
    correctivePlans: [{ id: "plan-1", contractId: contract.id, obligationId: obligation.id, dueAt: "2026-07-20T00:00:00.000Z", status: "in_progress" }],
    at: "2026-07-28T00:00:00.000Z",
    warningDays: 40,
  });
  assert.deepEqual(alerts.map((item) => item.alertType), ["corrective_plan_overdue", "contract_expiring", "obligation_due_soon"]);
});

test("refuse une derogation qui depasse l'echeance du contrat", () => {
  const scheduler = new ContractObligationScheduler();
  assert.throws(() => scheduler.validateWaiver({
    contract,
    obligation,
    waiver: {
      id: "waiver-1",
      contractId: contract.id,
      obligationId: obligation.id,
      validFrom: "2027-06-15T00:00:00.000Z",
      validUntil: "2027-07-15T00:00:00.000Z",
      reason: "Travaux exceptionnels sur le site.",
      decisionDocumentIds: ["decision-derogation-1"],
      decidedByActorId: "actor-ministry",
    },
  }), /ne peut pas dépasser/i);
});

test("convertit une livraison et un paiement en executions contractuelles documentees", () => {
  const projector = new ContractBusinessEventProjector();
  const delivery = projector.project({
    obligation: { ...obligation, obligationType: "deliver_service", targetValue: 400, unit: "kg" },
    event: {
      type: "commercial_delivery_confirmed",
      eventId: "delivery-1",
      obligationId: obligation.id,
      actorId: "actor-logistics",
      deliveredQuantityKg: 400,
      deliveryNoteDocumentIds: ["bon-livraison-1", "confirmation-site-1"],
      confirmedAt: "2026-07-28T10:00:00.000Z",
    },
  });
  assert.equal(delivery.command.type, "record_execution");
  assert.equal(delivery.command.record.measuredValue, 400);

  const payment = projector.project({
    obligation: { ...obligation, obligationType: "pay", targetValue: 1_125_000, unit: "XOF" },
    event: {
      type: "payment_transfer_confirmed",
      eventId: "payment-1",
      obligationId: obligation.id,
      actorId: "actor-finance",
      amountXof: 1_125_000,
      transferReferenceDocumentIds: ["reference-virement-1"],
      confirmedAt: "2026-07-28T11:00:00.000Z",
    },
  });
  assert.equal(payment.command.type, "record_execution");
  assert.equal(payment.command.record.measuredValue, 1_125_000);
});
