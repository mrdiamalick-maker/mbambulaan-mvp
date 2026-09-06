import assert from "node:assert/strict";
import test from "node:test";
import { createDemoState } from "../src/data/demo-state";

test("chaque organisation de démonstration possède un plan et des droits explicites", () => {
  const state = createDemoState();
  for (const organization of state.organizations) {
    const subscription = state.subscriptions.find((item) => item.organizationId === organization.id);
    assert.ok(subscription, `abonnement absent pour ${organization.id}`);
    assert.ok(state.plans.some((item) => item.id === subscription.planId));
    assert.ok(subscription.entitlements.length > 0);
  }
  assert.equal(state.plans.length, 7);
  assert.ok(state.plans.some((item) => item.name === "Atlas Premium" && item.onQuote));
});
