import test from "node:test";
import assert from "node:assert/strict";
import { convertBusinessEventToKnowledgeSource } from "./sector-learning-ingestion";

test("convertit un résultat de valorisation en source Knowledge", () => {
  const source = convertBusinessEventToKnowledgeSource({
    id: "event-01",
    eventType: "value_recovery_completed",
    aggregateId: "plan-01",
    territoryId: "territory-dakar",
    actorId: "operator-01",
    occurredAt: "2026-07-28T14:00:00.000Z",
    evidenceIds: ["releve-valorisation-01"],
    confidenceScore: 85,
    payload: {
      title: "Valorisation communautaire du lot",
      summary: "90 kg valorisés sur 100 kg avec une contribution communautaire confirmée.",
      avoidedLossKg: 90,
    },
  });

  assert.equal(source.sourceType, "value_recovery");
  assert.equal(source.sourceReferenceId, "plan-01");
  assert.equal(source.confidenceScore, 85);
  assert.deepEqual(source.evidenceIds, ["releve-valorisation-01"]);
});

test("convertit une reprise après crise en source d'enseignement", () => {
  const source = convertBusinessEventToKnowledgeSource({
    id: "event-crisis-recovery-01",
    eventType: "crisis_recovery_result_recorded",
    aggregateId: "crisis-cold-chain-01",
    territoryId: "territory-dakar",
    actorId: "coordinator-01",
    occurredAt: "2026-07-28T18:00:00.000Z",
    evidenceIds: ["releve-reprise-dakar-01", "bon-reception-froid-01"],
    confidenceScore: 90,
    payload: {
      title: "Reprise après rupture de froid",
      summary: "Une capacité froide transférée depuis Thiès a permis de sauver 7 600 kg et de reprendre les opérations en cinq heures.",
      volumeSavedKg: 7600,
      valueProtectedXof: 22_800_000,
      responseTimeHours: 5,
      lesson: "Identifier à l'avance les capacités de secours par territoire et leurs responsables.",
    },
  });

  assert.equal(source.sourceType, "incident");
  assert.equal(source.sourceReferenceId, "crisis-cold-chain-01");
  assert.equal(source.title, "Reprise après rupture de froid");
  assert.equal(source.confidenceScore, 90);
});

test("refuse un événement sans document de référence", () => {
  assert.throws(() => convertBusinessEventToKnowledgeSource({
    id: "event-02",
    eventType: "commercial_incident_resolved",
    aggregateId: "incident-01",
    territoryId: "territory-dakar",
    actorId: "operator-01",
    occurredAt: "2026-07-28T14:00:00.000Z",
    evidenceIds: [],
    payload: { summary: "Incident résolu" },
  }), /document de référence/i);
});
