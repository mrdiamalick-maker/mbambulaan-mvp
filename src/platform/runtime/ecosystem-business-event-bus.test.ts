import test from "node:test";
import assert from "node:assert/strict";
import { EcosystemBusinessEventBus } from "./ecosystem-business-event-bus";

const event = {
  id: "event-1",
  type: "documents.requirement.missing" as const,
  occurredAt: "2026-08-01T10:00:00.000Z",
  correlationId: "correlation-1",
  actorId: "actor-1",
  organizationId: "org-1",
  territoryIds: ["territory-dakar"],
  entityType: "commercial_order",
  entityId: "order-1",
  payload: {},
};

test("isole les erreurs d'abonnes et reste idempotent par evenement et handler", async () => {
  const bus = new EcosystemBusinessEventBus();
  let successfulCalls = 0;
  bus.subscribe({
    name: "successful-handler",
    eventTypes: ["documents.requirement.missing"],
    handle() { successfulCalls += 1; },
  });
  bus.subscribe({
    name: "failing-handler",
    eventTypes: ["documents.requirement.missing"],
    handle() { throw new Error("indisponible"); },
  });

  await bus.publish(event, "2026-08-01T10:01:00.000Z");
  await bus.publish(event, "2026-08-01T10:02:00.000Z");
  const snapshot = bus.snapshot();

  assert.equal(successfulCalls, 1);
  assert.equal(snapshot.metrics.processedDeliveryCount, 1);
  assert.equal(snapshot.metrics.failedDeliveryCount, 1);
  assert.equal(snapshot.metrics.duplicateDeliveryCount, 1);
  assert.equal(snapshot.deadLetters[0]?.handlerName, "failing-handler");
});

test("restaure les traitements et rejoue seulement la dead-letter ciblee", async () => {
  const initial = new EcosystemBusinessEventBus();
  let shouldFail = true;
  initial.subscribe({
    name: "recoverable-handler",
    eventTypes: ["documents.requirement.missing"],
    handle() {
      if (shouldFail) throw new Error("temporairement indisponible");
    },
  });
  await initial.publish(event, "2026-08-01T10:01:00.000Z");
  const persisted = initial.snapshot();

  const restored = new EcosystemBusinessEventBus();
  restored.subscribe({
    name: "recoverable-handler",
    eventTypes: ["documents.requirement.missing"],
    handle() {
      if (shouldFail) throw new Error("temporairement indisponible");
    },
  });
  restored.restore({ events: persisted.events, deliveries: persisted.deliveries });
  shouldFail = false;
  await restored.retry("event-1", "recoverable-handler", "2026-08-01T10:10:00.000Z");

  const snapshot = restored.snapshot();
  assert.equal(snapshot.metrics.failedDeliveryCount, 0);
  assert.equal(snapshot.metrics.processedDeliveryCount, 1);
  assert.equal(snapshot.deadLetters.length, 0);
  assert.equal(snapshot.deliveries.at(-1)?.attempts, 2);
});
