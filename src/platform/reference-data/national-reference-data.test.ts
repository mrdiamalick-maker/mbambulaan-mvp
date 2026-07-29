import test from "node:test";
import assert from "node:assert/strict";
import {
  DataQualityService,
  DuplicateDetectionService,
  InMemoryReferenceRepository,
  NationalReferenceDataService,
  type QualityRule,
} from "./national-reference-data";
import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";

const now = "2026-07-27T12:00:00.000Z" as ISODateTime;
const clock = { now: () => now };
let sequence = 0;
const ids = { next: (prefix: string) => `${prefix}-${++sequence}` as EntityId };

function proposal(code = "SPECIES-YFT") {
  return {
    type: "species" as const,
    code,
    canonicalLabel: "Albacore",
    alternateLabels: ["Thon jaune", "Albacore", "Thon jaune"],
    attributes: { scientificName: "Thunnus albacares" },
    status: "active" as const,
    validFrom: now,
  };
}

test("un changement de référentiel exige une approbation séparée", async () => {
  const repository = new InMemoryReferenceRepository();
  const service = new NationalReferenceDataService(repository, clock, ids);
  const request = await service.createChangeRequest({
    referenceType: "species",
    requestedByIdentityId: "identity-requester" as EntityId,
    reason: "Normaliser l'espèce",
    proposedRecord: proposal(),
  });
  await service.submit(request.id);
  await assert.rejects(() => service.approve(request.id, "identity-requester" as EntityId), /propre modification/);
  await service.approve(request.id, "identity-approver" as EntityId);
  const record = await service.apply(request.id);
  assert.equal(record.version, 1);
  assert.deepEqual(record.alternateLabels, ["Thon jaune", "Albacore"]);
});

test("un code actif ne peut pas être réutilisé dans le même périmètre", async () => {
  const repository = new InMemoryReferenceRepository();
  const service = new NationalReferenceDataService(repository, clock, ids);
  for (const label of ["Albacore", "Autre libellé"]) {
    const request = await service.createChangeRequest({
      referenceType: "species",
      requestedByIdentityId: `requester-${label}` as EntityId,
      reason: "Création",
      proposedRecord: { ...proposal(), canonicalLabel: label },
    });
    await service.submit(request.id);
    await service.approve(request.id, "approver" as EntityId);
    if (label === "Albacore") await service.apply(request.id);
    else await assert.rejects(() => service.apply(request.id), /utilise déjà ce code/);
  }
});

test("les règles de qualité identifient les anomalies bloquantes", async () => {
  const repository = new InMemoryReferenceRepository();
  const rules: QualityRule[] = [{
    code: "LANDING-WEIGHT-POSITIVE",
    entityType: "landing",
    fieldPath: "weightKg",
    description: "Le poids débarqué doit être strictement positif.",
    severity: "blocking",
    active: true,
    evaluate: (record) => typeof record.weightKg === "number" && record.weightKg > 0,
  }];
  const service = new DataQualityService(repository, rules, clock, ids);
  const issues = await service.assess({ entityType: "landing", entityId: "landing-1" as EntityId, record: { weightKg: 0 } });
  assert.equal(issues.length, 1);
  assert.equal(service.hasBlockingIssues(issues), true);
});

test("la détection de doublons normalise accents et ponctuation", async () => {
  const repository = new InMemoryReferenceRepository();
  const service = new DuplicateDetectionService(repository, clock, ids);
  const candidate = await service.compare({
    entityType: "actor",
    leftEntityId: "actor-1" as EntityId,
    rightEntityId: "actor-2" as EntityId,
    left: { name: "Mamadou N'Diaye", phone: "+221 77 000 00 00" },
    right: { name: "Mamadou Ndiaye", phone: "221770000000" },
    weightedFields: { name: 40, phone: 60 },
    threshold: 80,
  });
  assert.ok(candidate);
  assert.equal(candidate.score, 100);
  assert.deepEqual(candidate.matchedFields.sort(), ["name", "phone"]);
});
