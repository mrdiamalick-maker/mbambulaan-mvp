import assert from "node:assert/strict";
import test from "node:test";
import { IntegratedPlatformRuntime } from "./integrated-platform-runtime";

test("un flux bloqué alimente le jumeau, le graphe et Atlas", async () => {
  const runtime = new IntegratedPlatformRuntime();
  runtime.start("2026-07-27T10:00:00.000Z");

  const accepted = runtime.publish({
    id: "event-flow-blocked-1",
    type: "operational.flow.blocked",
    occurredAt: "2026-07-27T10:01:00.000Z",
    correlationId: "correlation-1",
    tenantId: "tenant-national",
    territoryId: "territory-dakar",
    payload: {
      flowId: "flow-cold-chain-1",
      flowKind: "service" as const,
      fromEntityId: "cooperative-1",
      fromLabel: "Coopérative pilote",
      toEntityId: "cold-room-1",
      toLabel: "Chambre froide pilote",
      quantity: 1_200,
      unit: "kg" as const,
    },
  });

  assert.equal(accepted, true);
  await runtime.drain("2026-07-27T10:02:00.000Z");

  const afterFlow = runtime.snapshot();
  assert.equal(afterFlow.digitalTwin.flows.length, 1);
  assert.equal(afterFlow.digitalTwin.flows[0]?.status, "blocked");
  assert.ok(afterFlow.digitalTwin.signals.some((signal) => signal.signalType === "service_delay"));
  assert.ok(afterFlow.knowledgeGraph.nodes.length > 0);

  runtime.publish({
    id: "event-atlas-question-1",
    type: "atlas.question.requested",
    occurredAt: "2026-07-27T10:03:00.000Z",
    correlationId: "correlation-1",
    causationId: "event-flow-blocked-1",
    tenantId: "tenant-national",
    territoryId: "territory-dakar",
    payload: {
      questionId: "atlas-question-1",
      workspaceId: "atlas-national-operations",
      askedByActorId: "actor-ministry-1",
      question: "Où renforcer la chaîne du froid ?",
      decisionDomain: "operational_resilience" as const,
      horizon: "90_days" as const,
    },
  });

  await runtime.drain("2026-07-27T10:04:00.000Z");
  const snapshot = runtime.snapshot();

  assert.equal(snapshot.pendingEvents, 0);
  assert.equal(snapshot.failedEvents, 0);
  assert.ok(snapshot.atlas.questions.some((question) => question.id === "atlas-question-1"));
  assert.ok(snapshot.atlas.evidence.length > 0);
  assert.ok(snapshot.atlas.insights.length > 0);
  assert.ok(snapshot.audit.some((record) => record.eventId === "event-atlas-question-1" && record.status === "processed"));
});

test("le runtime refuse le rejeu d'un événement déjà accepté", async () => {
  const runtime = new IntegratedPlatformRuntime();
  runtime.start("2026-07-27T10:00:00.000Z");

  const event = {
    id: "event-idempotent-1",
    type: "operational.flow.completed" as const,
    occurredAt: "2026-07-27T10:01:00.000Z",
    correlationId: "correlation-2",
    tenantId: "tenant-national",
    territoryId: "territory-thies",
    payload: {
      flowId: "flow-payment-1",
      flowKind: "financial" as const,
      fromEntityId: "buyer-1",
      fromLabel: "Acheteur pilote",
      toEntityId: "cooperative-2",
      toLabel: "Coopérative bénéficiaire",
      valueXof: 850_000,
      unit: "xof" as const,
    },
  };

  assert.equal(runtime.publish(event), true);
  assert.equal(runtime.publish(event), false);
  await runtime.drain("2026-07-27T10:02:00.000Z");

  const snapshot = runtime.snapshot();
  assert.equal(snapshot.digitalTwin.flows.length, 1);
  assert.ok(snapshot.audit.some((record) => record.status === "ignored_duplicate"));
});
