import test from "node:test";
import assert from "node:assert/strict";
import { CommercialWorkQueue } from "./commercial-work-queue";
import { getDemoAccessControl } from "@/platform/access/demo-access-registry";
import { resetCommercialCatalog } from "./commercial-catalog-registry";
import { resetCommercialFinancialExecution } from "./commercial-financial-registry";

test("la coopérative sans offre reçoit une tâche de publication", async () => {
  resetCommercialCatalog();
  resetCommercialFinancialExecution();
  const identity = getDemoAccessControl().getIdentity("demo-cooperative-dakar");
  assert.ok(identity);
  const queue = await new CommercialWorkQueue().forIdentity(identity);
  assert.equal(queue.items[0]?.kind, "publish_offer");
  assert.equal(queue.items[0]?.organizationId, "org-cooperative-dakar");
});

test("un profil non commercial ne reçoit aucune tâche commerciale", async () => {
  resetCommercialCatalog();
  resetCommercialFinancialExecution();
  const identity = getDemoAccessControl().getIdentity("demo-knowledge-manager");
  assert.ok(identity);
  const queue = await new CommercialWorkQueue().forIdentity(identity);
  assert.deepEqual(queue.items, []);
});
