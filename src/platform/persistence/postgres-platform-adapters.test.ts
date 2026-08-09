import assert from "node:assert/strict";
import test from "node:test";
import {
  OptimisticConcurrencyError,
  PostgresAggregateRepository,
  PostgresAuditTrail,
  PostgresOutboxStore,
  PostgresUnitOfWork,
  type SqlQueryResult,
  type SqlTransaction,
} from "./postgres-platform-adapters";

class FakeTransaction implements SqlTransaction {
  committed = false;
  rolledBack = false;
  released = false;
  readonly calls: Array<{ sql: string; parameters: unknown[] }> = [];
  constructor(private readonly responses: SqlQueryResult[] = []) {}
  async query<TRow>(sql: string, parameters: unknown[] = []): Promise<SqlQueryResult<TRow>> {
    this.calls.push({ sql, parameters });
    return (this.responses.shift() ?? { rows: [], rowCount: 1 }) as SqlQueryResult<TRow>;
  }
  async commit() { this.committed = true; }
  async rollback() { this.rolledBack = true; }
  release() { this.released = true; }
}

class FakePool {
  transaction: FakeTransaction;
  constructor(responses: SqlQueryResult[] = []) { this.transaction = new FakeTransaction(responses); }
  async begin() { return this.transaction; }
  async query<TRow>(sql: string, parameters: unknown[] = []) { return this.transaction.query<TRow>(sql, parameters); }
}

test("valide et annule correctement une unité de travail", async () => {
  const committedPool = new FakePool();
  const committed = new PostgresUnitOfWork(committedPool);
  const value = await committed.execute(async () => 42);
  assert.equal(value, 42);
  assert.equal(committedPool.transaction.committed, true);
  assert.equal(committedPool.transaction.rolledBack, false);
  assert.equal(committedPool.transaction.released, true);

  const rolledBackPool = new FakePool();
  const rolledBack = new PostgresUnitOfWork(rolledBackPool);
  await assert.rejects(() => rolledBack.execute(async () => { throw new Error("boom"); }), /boom/);
  assert.equal(rolledBackPool.transaction.committed, false);
  assert.equal(rolledBackPool.transaction.rolledBack, true);
  assert.equal(rolledBackPool.transaction.released, true);
});

test("protège les agrégats contre les mises à jour concurrentes", async () => {
  const pool = new FakePool([{ rows: [], rowCount: 0 }]);
  const uow = new PostgresUnitOfWork(pool);
  const repository = new PostgresAggregateRepository(() => uow.executor, "campaign");
  await assert.rejects(
    () => repository.update({
      aggregateType: "campaign",
      aggregateId: "campaign:joal:001",
      territoryId: "territory:joal",
      version: 3,
      status: "active",
      payload: { code: "JOAL-001" },
      createdAt: "2027-01-01T00:00:00Z",
      updatedAt: "2027-01-02T00:00:00Z",
    }, 3),
    OptimisticConcurrencyError,
  );
});

test("écrit les événements et messages outbox dans la même transaction", async () => {
  const pool = new FakePool();
  const uow = new PostgresUnitOfWork(pool);
  const outbox = new PostgresOutboxStore(() => uow.executor);
  await uow.execute(() => outbox.append([{
    id: "outbox:001",
    status: "pending",
    attemptCount: 0,
    nextAttemptAt: "2027-01-01T00:00:00Z",
    event: {
      id: "event:001",
      eventType: "CampaignOpened",
      aggregateType: "campaign",
      aggregateId: "campaign:001",
      occurredAt: "2027-01-01T00:00:00Z",
      correlationId: "correlation:001",
      causationId: "command:001",
      actorIdentityId: "actor:001",
      territoryIds: ["territory:joal"],
      schemaVersion: 1,
      payload: { aggregateVersion: 1 },
    },
  }]));
  assert.equal(pool.transaction.calls.length, 2);
  assert.match(pool.transaction.calls[0].sql, /domain_events/);
  assert.match(pool.transaction.calls[1].sql, /outbox_messages/);
  assert.equal(pool.transaction.committed, true);
});

test("conserve une piste d'audit attribuée et territorialisée", async () => {
  const pool = new FakePool();
  const audit = new PostgresAuditTrail(() => pool);
  await audit.append({
    id: "audit:001",
    commandId: "command:001",
    commandType: "OpenCampaign",
    actorIdentityId: "actor:001",
    organizationId: "organization:001",
    territoryIds: ["territory:joal"],
    correlationId: "correlation:001",
    decision: "accepted",
    summary: "Campagne ouverte",
    occurredAt: "2027-01-01T00:00:00Z",
    metadata: { channel: "mobile" },
  });
  assert.equal(pool.transaction.calls.length, 1);
  assert.match(pool.transaction.calls[0].sql, /audit_entries/);
  assert.deepEqual(pool.transaction.calls[0].parameters[3], ["territory:joal"]);
});
