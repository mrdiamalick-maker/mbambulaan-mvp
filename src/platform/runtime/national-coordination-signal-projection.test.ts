import test from "node:test";
import assert from "node:assert/strict";
import { NationalCoordinationSignalProjection } from "./national-coordination-signal-projection";

function event(overrides: Record<string, unknown> = {}) {
  return {
    id: "event-incident-1",
    type: "commerce.incident.reported" as const,
    occurredAt: "2026-08-01T10:00:00.000Z",
    correlationId: "campaign-to-payment-1",
    actorId: "actor-1",
    organizationId: "org-1",
    territoryIds: ["territory-dakar"],
    entityType: "commercial_order",
    entityId: "order-1",
    payload: { critical: true, summary: "Rupture de chaîne du froid", exposedValueXof: 225000, affectedQuantityKg: 80 },
    ...overrides,
  };
}

test("agrege exposition et severite par correlation", () => {
  const projection = new NationalCoordinationSignalProjection();
  projection.project(event());
  projection.project(event({ id: "event-obligation-1", type: "contracts.obligation.breached", entityType: "obligation", entityId: "obligation-1", payload: { summary: "Délai de livraison non respecté", valueXof: 100000 } }));

  const snapshot = projection.snapshot({ correlationId: "campaign-to-payment-1" });
  assert.equal(snapshot.signals.length, 2);
  assert.equal(snapshot.metrics.criticalCount, 2);
  assert.equal(snapshot.metrics.exposedValueXof, 325000);
  assert.equal(snapshot.metrics.exposedQuantityKg, 80);
  assert.equal(snapshot.metrics.openCorrelationCount, 1);
  assert.equal(snapshot.timelines[0]?.steps.length, 2);
});

test("filtre par territoire et resout toute une correlation", () => {
  const projection = new NationalCoordinationSignalProjection();
  projection.project(event());
  projection.project(event({ id: "event-thies", territoryIds: ["territory-thies"], entityId: "order-2", correlationId: "correlation-thies" }));

  assert.equal(projection.snapshot({ territoryId: "territory-dakar" }).signals.length, 1);
  projection.resolveByCorrelation("campaign-to-payment-1");
  const resolved = projection.snapshot({ correlationId: "campaign-to-payment-1" });
  assert.equal(resolved.signals[0]?.status, "resolved");
  assert.equal(resolved.timelines[0]?.status, "resolved");
  assert.equal(resolved.metrics.openCorrelationCount, 0);
});

test("restaure les signaux dans l ordre chronologique", () => {
  const initial = new NationalCoordinationSignalProjection();
  initial.project(event({ id: "event-decision", type: "governance.decision.recorded", occurredAt: "2026-08-01T12:00:00.000Z", payload: { summary: "Plan correctif approuvé" } }));
  initial.project(event());
  const persisted = initial.snapshot().signals;

  const restored = new NationalCoordinationSignalProjection();
  restored.restore(persisted);
  const timeline = restored.snapshot({ correlationId: "campaign-to-payment-1" }).timelines[0];

  assert.equal(timeline?.startedAt, "2026-08-01T10:00:00.000Z");
  assert.equal(timeline?.lastEventAt, "2026-08-01T12:00:00.000Z");
  assert.equal(timeline?.steps[0]?.eventType, "commerce.incident.reported");
  assert.equal(timeline?.steps[1]?.eventType, "governance.decision.recorded");
});
