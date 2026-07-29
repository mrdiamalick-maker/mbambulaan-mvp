import assert from "node:assert/strict";
import test from "node:test";

import { EndToEndContractObligationServiceLevelCapability } from "./end-to-end-contract-obligation-service-level-capability";

const start = "2026-01-01T00:00:00Z";
const mid = "2026-06-30T12:00:00Z";
const end = "2026-12-31T23:59:59Z";

test("un contrat public relie obligations, SLA, pénalités, facturation, paiement et renouvellement", () => {
  const capability = new EndToEndContractObligationServiceLevelCapability();

  capability.openContract({
    id: "contract-public-1",
    contractCode: "MPEM-MB-2026-01",
    contractType: "public_service",
    title: "Coordination numérique de trois territoires pilotes",
    countryId: "country-sn",
    territoryIds: ["territory-joal", "territory-mbour", "territory-dakar"],
    capabilityIds: ["territorial-supervision", "interterritorial-coordination"],
    createdAt: start,
  });

  capability.addParty({ caseId: "contract-public-1", party: { actorId: "ministry", role: "authority", signatoryIdentityId: "identity-ministry" }, addedAt: start });
  capability.addParty({ caseId: "contract-public-1", party: { actorId: "mbambulaan", role: "provider", signatoryIdentityId: "identity-ceo" }, addedAt: start });
  capability.addParty({ caseId: "contract-public-1", party: { actorId: "ministry", role: "payer", paymentResponsibilityPercent: 100 }, addedAt: start });
  capability.addParty({ caseId: "contract-public-1", party: { actorId: "fisheries-ecosystem", role: "beneficiary" }, addedAt: start });

  capability.addObligation({
    caseId: "contract-public-1",
    addedAt: start,
    obligation: {
      id: "obligation-availability",
      partyActorId: "mbambulaan",
      obligationType: "maintain_availability",
      description: "Maintenir la disponibilité opérationnelle du service de coordination",
      capabilityId: "territorial-supervision",
      territoryIds: ["territory-joal", "territory-mbour", "territory-dakar"],
      recurring: true,
      recurrenceCode: "monthly",
      measurable: true,
      targetValue: 98,
      unit: "%",
      status: "planned",
      evidenceIds: [],
    },
  });

  capability.addObligation({
    caseId: "contract-public-1",
    addedAt: start,
    obligation: {
      id: "obligation-reporting",
      partyActorId: "mbambulaan",
      obligationType: "report",
      description: "Produire un rapport mensuel de coordination et d'impact",
      capabilityId: "territorial-supervision",
      territoryIds: ["territory-joal", "territory-mbour", "territory-dakar"],
      recurring: true,
      recurrenceCode: "monthly",
      measurable: true,
      targetValue: 100,
      unit: "%",
      status: "planned",
      evidenceIds: [],
    },
  });

  capability.addServiceLevel({
    caseId: "contract-public-1",
    addedAt: start,
    sla: {
      id: "sla-availability",
      obligationId: "obligation-availability",
      metricCode: "SERVICE_AVAILABILITY",
      metricLabel: "Disponibilité du service",
      targetValue: 98,
      warningThreshold: 95,
      breachThreshold: 92,
      evaluationMode: "minimum",
      unit: "%",
      measurementFrequency: "monthly",
      gracePeriodHours: 4,
      serviceCreditPercent: 10,
      fixedPenaltyXof: 500_000,
      maximumPenaltyXof: 2_000_000,
      status: "active",
    },
  });

  capability.addFinancialTerm({
    caseId: "contract-public-1",
    addedAt: start,
    term: {
      id: "term-public-service",
      termType: "fixed_fee",
      payerActorId: "ministry",
      beneficiaryActorId: "mbambulaan",
      amountXof: 24_000_000,
      billingFrequency: "quarterly",
      paymentDueDays: 30,
      linkedObligationIds: ["obligation-availability", "obligation-reporting"],
      status: "active",
    },
  });

  capability.attachDocument({ caseId: "contract-public-1", documentId: "signed-contract-1", attachedAt: start });
  capability.approveContract({ caseId: "contract-public-1", approvedAt: start });
  capability.activateContract({ caseId: "contract-public-1", effectiveAt: start, expiresAt: end });

  const met = capability.recordMeasurement({
    caseId: "contract-public-1",
    measurement: {
      id: "measurement-q1",
      slaId: "sla-availability",
      obligationId: "obligation-availability",
      measuredValue: 98.5,
      measuredAt: "2026-03-31T23:00:00Z",
      periodStart: start,
      periodEnd: "2026-03-31T23:59:59Z",
      evidenceIds: ["monitoring-report-q1"],
      sourceReferenceIds: ["monitoring-source-q1"],
    },
  });
  assert.equal(met.status, "met");

  const breached = capability.recordMeasurement({
    caseId: "contract-public-1",
    measurement: {
      id: "measurement-q2",
      slaId: "sla-availability",
      obligationId: "obligation-availability",
      measuredValue: 90,
      measuredAt: mid,
      periodStart: "2026-04-01T00:00:00Z",
      periodEnd: "2026-06-30T23:59:59Z",
      evidenceIds: ["monitoring-report-q2"],
      sourceReferenceIds: ["monitoring-source-q2"],
    },
  });
  assert.equal(breached.status, "breached");

  const penalty = capability.calculatePenalty({
    caseId: "contract-public-1",
    penaltyId: "penalty-q2",
    measurementId: "measurement-q2",
    beneficiaryActorId: "ministry",
    calculatedAt: mid,
  });
  assert.equal(penalty.amountXof, 2_000_000);

  capability.issueInvoice({
    caseId: "contract-public-1",
    invoice: {
      id: "invoice-q2",
      financialTermId: "term-public-service",
      payerActorId: "ministry",
      beneficiaryActorId: "mbambulaan",
      amountXof: 6_000_000,
      issuedAt: "2026-07-01T08:00:00Z",
      dueAt: "2026-07-31T23:59:59Z",
      paidAmountXof: 0,
      status: "issued",
      sourceReferenceIds: ["quarterly-service-q2"],
      evidenceIds: ["invoice-document-q2"],
    },
  });

  const partial = capability.recordPayment({
    caseId: "contract-public-1",
    invoiceId: "invoice-q2",
    amountXof: 4_000_000,
    paidAt: "2026-07-20T10:00:00Z",
    evidenceIds: ["bank-transfer-partial"],
  });
  assert.equal(partial.status, "partially_paid");

  const paid = capability.recordPayment({
    caseId: "contract-public-1",
    invoiceId: "invoice-q2",
    amountXof: 2_000_000,
    paidAt: "2026-07-29T10:00:00Z",
    evidenceIds: ["bank-transfer-final"],
  });
  assert.equal(paid.status, "paid");

  capability.openDispute({
    caseId: "contract-public-1",
    dispute: {
      id: "dispute-penalty-q2",
      raisedByActorId: "mbambulaan",
      againstActorId: "ministry",
      relatedObligationIds: ["obligation-availability"],
      relatedInvoiceIds: ["invoice-q2"],
      relatedPenaltyIds: ["penalty-q2"],
      subject: "Contestations des causes de la rupture de disponibilité",
      description: "Une partie de l'indisponibilité dépendait d'un tiers télécom.",
      amountInDisputeXof: 2_000_000,
      status: "open",
      evidenceIds: ["incident-analysis-q2"],
      openedAt: "2026-07-05T09:00:00Z",
    },
  });

  capability.resolveDispute({
    caseId: "contract-public-1",
    disputeId: "dispute-penalty-q2",
    resolution: "Pénalité maintenue avec plan correctif obligatoire.",
    resolvedAt: "2026-08-01T10:00:00Z",
  });

  const renewal = capability.assessRenewal({
    caseId: "contract-public-1",
    assessment: {
      id: "renewal-assessment-1",
      assessedAt: "2026-11-30T12:00:00Z",
      performanceScore: 76,
      commercialScore: 85,
      strategicValueScore: 92,
      complianceScore: 88,
      recommendation: "renew_with_conditions",
      conditions: ["Renforcer la résilience télécom", "Réviser le SLA de disponibilité"],
      evidenceIds: ["annual-contract-review"],
    },
  });
  assert.equal(renewal.recommendation, "renew_with_conditions");

  const commandCenter = capability.getContractCommandCenter({ caseId: "contract-public-1", generatedAt: "2026-12-01T00:00:00Z" });
  assert.equal(commandCenter.status, "at_risk");
  assert.equal(commandCenter.breachedObligationCount, 1);
  assert.equal(commandCenter.calculatedPenaltyXof, 2_000_000);
  assert.equal(commandCenter.invoicedAmountXof, 6_000_000);
  assert.equal(commandCenter.collectedAmountXof, 6_000_000);
  assert.equal(commandCenter.collectionRatePercent, 100);
  assert.equal(commandCenter.activeDisputeCount, 0);
  assert.equal(commandCenter.latestRenewalRecommendation, "renew_with_conditions");
});

test("un contrat incomplet ne peut pas être approuvé", () => {
  const capability = new EndToEndContractObligationServiceLevelCapability();
  capability.openContract({
    id: "contract-incomplete",
    contractCode: "INCOMPLETE-1",
    contractType: "commercial",
    title: "Contrat incomplet",
    countryId: "country-sn",
    territoryIds: ["territory-joal"],
    capabilityIds: ["sale-delivery-settlement"],
    createdAt: start,
  });
  capability.addParty({ caseId: "contract-incomplete", party: { actorId: "buyer", role: "customer" }, addedAt: start });
  capability.addParty({ caseId: "contract-incomplete", party: { actorId: "mbambulaan", role: "provider" }, addedAt: start });

  assert.throws(() => capability.approveContract({ caseId: "contract-incomplete", approvedAt: start }), /aucune obligation contractuelle/i);
});

test("une pénalité ne peut être calculée sans rupture de SLA", () => {
  const capability = new EndToEndContractObligationServiceLevelCapability();
  capability.openContract({
    id: "contract-no-breach",
    contractCode: "NO-BREACH-1",
    contractType: "service_provider",
    title: "Service logistique",
    countryId: "country-sn",
    territoryIds: ["territory-dakar"],
    capabilityIds: ["logistics"],
    createdAt: start,
  });
  capability.addParty({ caseId: "contract-no-breach", party: { actorId: "customer", role: "customer" }, addedAt: start });
  capability.addParty({ caseId: "contract-no-breach", party: { actorId: "provider", role: "provider" }, addedAt: start });
  capability.addObligation({
    caseId: "contract-no-breach",
    addedAt: start,
    obligation: {
      id: "obligation-delivery",
      partyActorId: "provider",
      obligationType: "deliver_service",
      description: "Livrer dans les délais",
      territoryIds: ["territory-dakar"],
      recurring: true,
      measurable: true,
      targetValue: 95,
      unit: "%",
      status: "planned",
      evidenceIds: [],
    },
  });
  capability.addServiceLevel({
    caseId: "contract-no-breach",
    addedAt: start,
    sla: {
      id: "sla-delivery",
      obligationId: "obligation-delivery",
      metricCode: "ONTIME",
      metricLabel: "Livraisons à l'heure",
      targetValue: 95,
      warningThreshold: 90,
      breachThreshold: 80,
      evaluationMode: "minimum",
      unit: "%",
      measurementFrequency: "monthly",
      gracePeriodHours: 1,
      fixedPenaltyXof: 100_000,
      status: "active",
    },
  });
  capability.addFinancialTerm({
    caseId: "contract-no-breach",
    addedAt: start,
    term: {
      id: "term-delivery",
      termType: "fixed_fee",
      payerActorId: "customer",
      beneficiaryActorId: "provider",
      amountXof: 1_000_000,
      billingFrequency: "monthly",
      paymentDueDays: 30,
      linkedObligationIds: ["obligation-delivery"],
      status: "active",
    },
  });
  capability.attachDocument({ caseId: "contract-no-breach", documentId: "signed-contract", attachedAt: start });
  capability.approveContract({ caseId: "contract-no-breach", approvedAt: start });
  capability.activateContract({ caseId: "contract-no-breach", effectiveAt: start, expiresAt: end });
  capability.recordMeasurement({
    caseId: "contract-no-breach",
    measurement: {
      id: "measurement-good",
      slaId: "sla-delivery",
      obligationId: "obligation-delivery",
      measuredValue: 98,
      measuredAt: mid,
      periodStart: start,
      periodEnd: mid,
      evidenceIds: ["delivery-report"],
      sourceReferenceIds: ["mission-data"],
    },
  });

  assert.throws(() => capability.calculatePenalty({ caseId: "contract-no-breach", penaltyId: "penalty-invalid", measurementId: "measurement-good", beneficiaryActorId: "customer", calculatedAt: mid }), /uniquement sur un SLA en rupture/i);
});
