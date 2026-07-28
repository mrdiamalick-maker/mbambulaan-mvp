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
});

test("filtre par territoire et resout toute une correlation", () => {
  const projection = new NationalCoordinationSignalProjection();
  projection.project(event());
  projection.project(event({ id: "event-thies", territoryIds: ["territory-thies"], entityId: "order-2", correlationId: "correlation-thies" }));

  assert.equal(projection.snapshot({ territoryId: "territory-dakar" }).signals.length, 1);
  projection.resolveByCorrelation("campaign-to-payment-1");
  assert.equal(projection.snapshot({ correlationId: "campaign-to-payment-1" }).signals[0]?.status, "resolved");
});
