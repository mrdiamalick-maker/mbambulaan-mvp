import assert from "node:assert/strict";
import test from "node:test";

import {
  EndToEndFisheriesEcosystemOrchestrationCapability,
  type EcosystemActorRole,
} from "./end-to-end-fisheries-ecosystem-orchestration-capability";

const now = "2026-07-27T12:00:00Z";

function createCompleteEcosystem() {
  const capability = new EndToEndFisheriesEcosystemOrchestrationCapability();
  capability.openEcosystem({ id: "eco-case-1", ecosystemId: "ecosystem-fisheries-sn", countryId: "sn", createdAt: now, actorId: "actor-platform" });

  const participants: Array<{ actorId: string; roles: EcosystemActorRole[] }> = [
    { actorId: "actor-platform", roles: ["platform_operator"] },
    { actorId: "actor-coordinator", roles: ["territorial_coordinator"] },
    { actorId: "actor-fisher", roles: ["fisher"] },
    { actorId: "actor-cooperative", roles: ["cooperative"] },
    { actorId: "actor-landing", roles: ["landing_agent"] },
    { actorId: "actor-quality", roles: ["quality_agent"] },
    { actorId: "actor-buyer", roles: ["buyer"] },
    { actorId: "actor-logistics", roles: ["logistics_provider"] },
    { actorId: "actor-finance", roles: ["financial_partner"] },
    { actorId: "actor-ministry", roles: ["ministry_decision_maker"] },
  ];

  for (const participant of participants) {
    capability.registerParticipant({
      caseId: "eco-case-1",
      participant: {
        actorId: participant.actorId,
        roles: participant.roles,
        territoryIds: ["territory-joal"],
        active: true,
        verified: true,
      },
      registeredAt: now,
      actorId: "actor-platform",
    });
  }

  capability.linkCapabilityCase({ caseId: "eco-case-1", capability: "fishing_campaign", linkedCaseId: "campaign-case-1", linkedAt: now });
  capability.linkCapabilityCase({ caseId: "eco-case-1", capability: "sale_delivery_settlement", linkedCaseId: "sale-case-1", linkedAt: now });
  capability.linkCapabilityCase({ caseId: "eco-case-1", capability: "cooperative_management", linkedCaseId: "cooperative-case-1", linkedAt: now });
  capability.linkCapabilityCase({ caseId: "eco-case-1", capability: "territorial_supervision", linkedCaseId: "territory-case-1", linkedAt: now });
  capability.linkCapabilityCase({ caseId: "eco-case-1", capability: "national_governance", linkedCaseId: "national-case-1", linkedAt: now });

  const accountabilities = [
    ["ecosystem_setup", "actor-platform"],
    ["campaign_planning", "actor-coordinator"],
    ["fishing_operation", "actor-fisher"],
    ["landing_and_lot_creation", "actor-landing"],
    ["commercial_coordination", "actor-cooperative"],
    ["logistics_and_delivery", "actor-logistics"],
    ["settlement_and_value_distribution", "actor-finance"],
    ["territorial_supervision", "actor-coordinator"],
    ["national_governance", "actor-ministry"],
  ] as const;

  for (const [stage, actorId] of accountabilities) {
    capability.assignStageAccountability({ caseId: "eco-case-1", stage, accountableActorId: actorId, assignedAt: now });
  }

  return capability;
}

test("un écosystème complet devient prêt uniquement quand tous les grands dossiers et rôles sont reliés", () => {
  const capability = createCompleteEcosystem();
  const readiness = capability.assessReadiness({ caseId: "eco-case-1", generatedAt: now });

  assert.equal(readiness.readyToOperate, true);
  assert.equal(readiness.participantCoveragePercent, 100);
  assert.equal(readiness.stageCoveragePercent, 100);
  assert.equal(capability.snapshot()[0].status, "ready");
});

test("une transition ne peut pas contourner une étape de la chaîne de valeur", () => {
  const capability = createCompleteEcosystem();

  assert.throws(
    () => capability.requestTransition({
      caseId: "eco-case-1",
      transitionId: "transition-invalid",
      fromStage: "ecosystem_setup",
      toStage: "landing_and_lot_creation",
      requestedByActorId: "actor-platform",
      prerequisites: [],
      requestedAt: now,
    }),
    /deux étapes consécutives/i,
  );
});

test("la chaîne de valeur impose responsabilité, rôles, dossier métier et preuve avant passage", () => {
  const capability = createCompleteEcosystem();
  capability.completeStage({ caseId: "eco-case-1", stage: "ecosystem_setup", evidenceIds: ["evidence-setup"], completedAt: now, actorId: "actor-platform" });

  const transition = capability.requestTransition({
    caseId: "eco-case-1",
    transitionId: "transition-setup-campaign",
    fromStage: "ecosystem_setup",
    toStage: "campaign_planning",
    requestedByActorId: "actor-platform",
    prerequisites: ["écosystème configuré", "acteurs vérifiés"],
    evidenceIds: ["evidence-setup"],
    requestedAt: now,
  });

  assert.deepEqual(transition.unmetPrerequisites, []);

  const approved = capability.decideTransition({
    caseId: "eco-case-1",
    transitionId: transition.id,
    approved: true,
    approvedByActorId: "actor-coordinator",
    rationale: "Les acteurs et moyens nécessaires sont disponibles.",
    decidedAt: now,
  });
  assert.equal(approved.status, "approved");

  const result = capability.executeTransition({ caseId: "eco-case-1", transitionId: transition.id, executedAt: now, actorId: "actor-coordinator" });
  assert.equal(result.stages.find((stage) => stage.stage === "campaign_planning")?.status, "in_progress");
  assert.equal(result.status, "operating");
});

test("un risque critique bloque les étapes concernées puis les libère avec une preuve de résolution", () => {
  const capability = createCompleteEcosystem();

  capability.reportRisk({
    caseId: "eco-case-1",
    risk: {
      id: "risk-cold-chain",
      category: "logistics",
      severity: "critical",
      territoryIds: ["territory-joal"],
      affectedStageIds: ["logistics_and_delivery", "settlement_and_value_distribution"],
      status: "open",
      detectedAt: now,
      mitigationActions: ["Mobiliser une chambre froide alternative"],
      evidenceIds: ["evidence-alert"],
    },
  });

  let snapshot = capability.snapshot()[0];
  assert.equal(snapshot.status, "blocked");
  assert.equal(snapshot.stages.find((stage) => stage.stage === "logistics_and_delivery")?.status, "blocked");

  capability.resolveRisk({
    caseId: "eco-case-1",
    riskId: "risk-cold-chain",
    evidenceIds: ["evidence-cold-room-confirmation"],
    lessonsLearned: ["Pré-réserver une capacité de secours en haute saison"],
    resolvedAt: now,
    actorId: "actor-coordinator",
  });

  snapshot = capability.snapshot()[0];
  assert.equal(snapshot.status, "operating");
  assert.equal(snapshot.risks[0].status, "resolved");
});

test("les flux financiers et la valeur créée sont consolidés pour tous les acteurs de l'écosystème", () => {
  const capability = createCompleteEcosystem();

  capability.recordValueFlow({
    caseId: "eco-case-1",
    flow: {
      id: "flow-commercial",
      sourceActorId: "actor-buyer",
      beneficiaryActorId: "actor-cooperative",
      payerActorId: "actor-buyer",
      territoryId: "territory-joal",
      flowType: "commercial_payment",
      amountXof: 1_000_000,
      status: "paid",
      linkedCaseId: "sale-case-1",
      evidenceIds: ["evidence-payment"],
      recordedAt: now,
    },
  });
  capability.recordValueFlow({
    caseId: "eco-case-1",
    flow: {
      id: "flow-seller",
      beneficiaryActorId: "actor-fisher",
      territoryId: "territory-joal",
      flowType: "catch_value",
      amountXof: 800_000,
      status: "reconciled",
      linkedCaseId: "sale-case-1",
      evidenceIds: ["evidence-settlement"],
      recordedAt: now,
    },
  });
  capability.recordValueFlow({
    caseId: "eco-case-1",
    flow: {
      id: "flow-platform",
      beneficiaryActorId: "actor-platform",
      territoryId: "territory-joal",
      flowType: "platform_revenue",
      amountXof: 50_000,
      status: "reconciled",
      linkedCaseId: "sale-case-1",
      evidenceIds: ["evidence-platform-fee"],
      recordedAt: now,
    },
  });
  capability.recordValueFlow({
    caseId: "eco-case-1",
    flow: {
      id: "flow-protected",
      beneficiaryActorId: "actor-cooperative",
      territoryId: "territory-joal",
      flowType: "value_protected",
      amountXof: 150_000,
      status: "reconciled",
      linkedCaseId: "campaign-case-1",
      evidenceIds: ["evidence-loss-avoided"],
      recordedAt: now,
    },
  });

  const commandCenter = capability.getCommandCenter({ caseId: "eco-case-1", generatedAt: now });
  assert.equal(commandCenter.impact.grossCommercialValueXof, 1_000_000);
  assert.equal(commandCenter.impact.sellerNetValueXof, 800_000);
  assert.equal(commandCenter.impact.platformRevenueXof, 50_000);
  assert.equal(commandCenter.impact.valueProtectedXof, 150_000);
  assert.equal(commandCenter.impact.beneficiaryActorCount, 3);
});
