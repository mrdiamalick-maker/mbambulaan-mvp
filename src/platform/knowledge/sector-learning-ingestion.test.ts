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
    evidenceIds: ["proof-01"],
    confidenceScore: 85,
    payload: {
      title: "Valorisation communautaire du lot",
      summary: "90 kg valorisés sur 100 kg avec une contribution communautaire vérifiée.",
      avoidedLossKg: 90,
    },
  });

  assert.equal(source.sourceType, "value_recovery");
  assert.equal(source.sourceReferenceId, "plan-01");
  assert.equal(source.confidenceScore, 85);
  assert.deepEqual(source.evidenceIds, ["proof-01"]);
});

test("refuse un événement non prouvé", () => {
  assert.throws(() => convertBusinessEventToKnowledgeSource({
    id: "event-02",
    eventType: "commercial_incident_resolved",
    aggregateId: "incident-01",
    territoryId: "territory-dakar",
    actorId: "operator-01",
    occurredAt: "2026-07-28T14:00:00.000Z",
    evidenceIds: [],
    payload: { summary: "Incident résolu" },
  }), /prouvé/i);
});
