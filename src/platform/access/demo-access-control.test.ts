import assert from "node:assert/strict";
import test from "node:test";
import { DemoAccessControl } from "./demo-access-control";

test("un pêcheur reste limité à son territoire et à Fisher", () => {
  const access = new DemoAccessControl();
  const session = access.createSession({ identityId: "demo-fisher-joal", issuedAt: "2026-07-27T20:30:00.000Z" });

  assert.equal(access.authorize({ sessionId: session.id, permission: "campaign.write", territoryId: "territory-joal", productCode: "fisher", at: "2026-07-27T21:00:00.000Z" }).allowed, true);
  assert.equal(access.authorize({ sessionId: session.id, permission: "government.read", territoryId: "territory-joal", productCode: "government", at: "2026-07-27T21:00:00.000Z" }).allowed, false);
  assert.equal(access.authorize({ sessionId: session.id, permission: "campaign.read", territoryId: "territory-dakar", productCode: "fisher", at: "2026-07-27T21:00:00.000Z" }).allowed, false);
});

test("une coopérative ne peut pas approuver une décision Atlas", () => {
  const access = new DemoAccessControl();
  const session = access.createSession({ identityId: "demo-cooperative-dakar", issuedAt: "2026-07-27T20:30:00.000Z" });
  const result = access.authorize({ sessionId: session.id, permission: "atlas.approve", territoryId: "territory-dakar", productCode: "atlas", at: "2026-07-27T21:00:00.000Z" });
  assert.equal(result.allowed, false);
});

test("le superviseur national peut approuver Atlas dans un territoire", () => {
  const access = new DemoAccessControl();
  const session = access.createSession({ identityId: "demo-government-supervisor", territoryId: "territory-dakar", issuedAt: "2026-07-27T20:30:00.000Z" });
  const result = access.authorize({ sessionId: session.id, permission: "atlas.approve", territoryId: "territory-dakar", productCode: "atlas", at: "2026-07-27T21:00:00.000Z" });
  assert.equal(result.allowed, true);
});

test("une session expire après huit heures", () => {
  const access = new DemoAccessControl();
  const session = access.createSession({ identityId: "demo-finance-officer", issuedAt: "2026-07-27T08:00:00.000Z" });
  assert.equal(access.getSession(session.id, "2026-07-27T15:59:59.000Z")?.id, session.id);
  assert.equal(access.getSession(session.id, "2026-07-27T16:00:00.000Z"), undefined);
});
