import assert from "node:assert/strict";
import test from "node:test";
import {
  BackupContinuityService,
  IncidentManager,
  InMemoryOperationsRepository,
  NationalObservabilityService,
  OfflineSyncService,
} from "./national-operational-resilience";

const now = "2026-07-27T18:00:00.000Z" as const;
const clock = { now: () => now };
let sequence = 0;
const ids = { next: (prefix: string) => `${prefix}-${++sequence}` };

test("enregistre la santé d'un composant et évalue un SLO", async () => {
  const repository = new InMemoryOperationsRepository();
  repository.slos.set("api-availability", {
    code: "api-availability",
    serviceName: "api",
    objectiveType: "availability",
    target: 99,
    measurementWindowMinutes: 60,
    errorBudgetPercent: 1,
    status: "active",
  });
  const service = new NationalObservabilityService(
    repository,
    { api: { check: async () => ({ status: "healthy", latencyMs: 42 }) } },
    clock,
    ids,
  );

  const health = await service.checkComponent("api");
  const evaluation = await service.evaluateSlo("api-availability");

  assert.equal(health.status, "healthy");
  assert.equal(evaluation.compliant, true);
  assert.equal(evaluation.measuredValue, 100);
});

test("ouvre, acquitte et résout un incident", async () => {
  const repository = new InMemoryOperationsRepository();
  const manager = new IncidentManager(repository, clock, ids);
  const incident = await manager.open({
    title: "API indisponible à Joal",
    description: "Les agents ne peuvent plus synchroniser.",
    severity: "sev2",
    serviceName: "api",
    territoryIds: ["territory-joal"],
    runbookCode: "RB-API-001",
    correlationIds: ["corr-1"],
    impact: "Saisie différée des débarquements.",
  });

  await manager.acknowledge(incident.id, "identity-ops");
  const resolved = await manager.resolve(incident.id, "Panne réseau du fournisseur", ["Basculer sur le lien secondaire"]);

  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.rootCause, "Panne réseau du fournisseur");
});

test("n'accepte une sauvegarde vérifiée qu'après sa réalisation", async () => {
  const repository = new InMemoryOperationsRepository();
  const service = new BackupContinuityService(repository, clock, ids);
  const backup = await service.schedule({
    backupType: "full",
    databaseName: "mbambulaan",
    regionCode: "sn-dakar-1",
    storageLocation: "s3://backup-primary",
    retentionDays: 30,
  });
  const completed = await service.markCompleted(backup, { sizeBytes: 1024, checksum: "a".repeat(64) });
  const verified = await service.markRestoreVerified(completed);

  assert.equal(verified.status, "verified");
  assert.equal(verified.restoreTestedAt, now);
});

test("déduplique les mutations hors ligne par appareil et séquence", async () => {
  const repository = new InMemoryOperationsRepository();
  const service = new OfflineSyncService(repository, { execute: async () => ({ aggregateVersion: 2 }) }, clock, ids);
  const input = {
    deviceId: "device-1",
    identityId: "identity-agent",
    territoryId: "territory-joal",
    aggregateType: "landing",
    aggregateId: "landing-1",
    commandType: "confirm_landing",
    clientSequence: 12,
    baseVersion: 1,
    payload: { landedAt: now },
    payloadHash: "b".repeat(64),
    capturedAt: now,
  } as const;

  const first = await service.receive(input);
  const second = await service.receive(input);
  const applied = await service.synchronize(first);

  assert.equal(second.id, first.id);
  assert.equal(applied.status, "applied");
});

test("isole un conflit de version pendant la synchronisation", async () => {
  const repository = new InMemoryOperationsRepository();
  const service = new OfflineSyncService(
    repository,
    { execute: async () => { throw new Error("Conflit de version sur landing/1"); } },
    clock,
    ids,
  );
  const mutation = await service.receive({
    deviceId: "device-2",
    identityId: "identity-agent",
    territoryId: "territory-kayar",
    aggregateType: "landing",
    aggregateId: "landing-2",
    commandType: "confirm_landing",
    clientSequence: 1,
    baseVersion: 2,
    payload: {},
    payloadHash: "c".repeat(64),
    capturedAt: now,
  });

  const result = await service.synchronize(mutation);
  assert.equal(result.status, "conflict");
  assert.match(result.conflictReason ?? "", /version/i);
});
