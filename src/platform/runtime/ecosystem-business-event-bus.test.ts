import test from "node:test";
import assert from "node:assert/strict";
import { EcosystemBusinessEventBus } from "./ecosystem-business-event-bus";

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

  await bus.publish(event, "2026-08-01T10:01:00.000Z");
  await bus.publish(event, "2026-08-01T10:02:00.000Z");
  const snapshot = bus.snapshot();

  assert.equal(successfulCalls, 1);
  assert.equal(snapshot.metrics.processedDeliveryCount, 1);
  assert.equal(snapshot.metrics.failedDeliveryCount, 2);
  assert.equal(snapshot.metrics.duplicateDeliveryCount, 1);
});
