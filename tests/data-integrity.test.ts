import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { createDemoState } from "../src/data/demo-state";
import { validateSituation } from "../src/domain/rules";

test("le tenant de démonstration relie les objets sans référence orpheline", () => {
  const state = createDemoState();
  const territoryIds = new Set(state.territories.map((item) => item.id));
  const actorIds = new Set(state.actors.map((item) => item.id));
  for (const situation of state.situations) {
    assert.ok(territoryIds.has(situation.territoryId));
    if (situation.responsibleId) assert.ok(actorIds.has(situation.responsibleId));
    validateSituation(situation);
  }
  for (const initiative of state.initiatives) {
    initiative.territoryIds.forEach((id) => assert.ok(territoryIds.has(id)));
    initiative.funding.forEach((fund) => assert.ok(actorIds.has(fund.partnerId)));
  }
});

test("la migration contient le stockage tenant et l'idempotence des commandes", () => {
  const sql = readFileSync(new URL("../db/migrations/001_initial.sql", import.meta.url), "utf8");
  assert.match(sql, /mbambulaan_tenant_state/);
  assert.match(sql, /mbambulaan_command_log/);
  assert.match(sql, /mbambulaan_outbox/);
  assert.match(sql, /idempotency_key text primary key/);
});
