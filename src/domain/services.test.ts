import assert from "node:assert/strict";
import test from "node:test";

import { domainData } from "./data";
import {
  getCompatibleCapacitiesForNeed,
  getServiceNeedCoverage,
  getServiceNeedsAtRisk,
} from "./selectors";
import { DomainService } from "./services";
import { validateDomainData } from "./validation";

function createService(): DomainService {
  return new DomainService(structuredClone(domainData));
}

test("les données de démonstration respectent les invariants métier", () => {
  assert.deepEqual(validateDomainData(structuredClone(domainData)), []);
});

test("un besoin de service peut être créé avec un statut ouvert", () => {
  const service = createService();
  const need = service.createServiceNeed({
    id: "service-need-new",
    expectedReturnId: "return-003",
    requestedByActorId: "actor-ibrahima",
    needType: "ice",
    requestedQuantity: 300,
    unit: "kg",
    neededAt: "2026-07-25T10:00:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-secondaire",
    priority: "urgent",
    createdAt: "2026-07-25T08:00:00Z",
  });

  assert.equal(need.status, "open");
});

test("une capacité déclarée devient immédiatement disponible", () => {
  const service = createService();
  const capacity = service.declareCapacity({
    id: "capacity-new",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-secondaire",
    initialQuantity: 600,
    unit: "kg",
    availableFrom: "2026-07-25T09:00:00Z",
    availableUntil: "2026-07-25T13:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T08:00:00Z",
  });

  assert.equal(capacity.availableQuantity, 600);
  assert.equal(capacity.status, "available");
});

test("une réservation partielle met à jour le besoin et la capacité", () => {
  const service = createService();
  const allocation = service.reserveCapacity({
    id: "allocation-new-partial",
    serviceNeedId: "service-need-004",
    capacityId: "capacity-002",
    allocatedQuantity: 300,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-ibrahima",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });

  const snapshot = service.getSnapshot();
  assert.equal(allocation.status, "reserved");
  assert.equal(snapshot.serviceNeeds.find((item) => item.id === "service-need-004")?.status, "partially_allocated");
  assert.equal(snapshot.capacities.find((item) => item.id === "capacity-002")?.availableQuantity, 700);
});

test("une réservation complète place le besoin au statut alloué", () => {
  const service = createService();
  const allocation = service.reserveCapacity({
    id: "allocation-new-complete",
    serviceNeedId: "service-need-004",
    capacityId: "capacity-002",
    allocatedQuantity: 700,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-ibrahima",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });

  const snapshot = service.getSnapshot();
  assert.equal(allocation.status, "reserved");
  assert.equal(snapshot.serviceNeeds.find((item) => item.id === "service-need-004")?.status, "allocated");
});

test("une réservation supérieure à la capacité disponible est refusée", () => {
  const service = createService();

  assert.throws(
    () => service.reserveCapacity({
      id: "allocation-too-large",
      serviceNeedId: "service-need-004",
      capacityId: "capacity-002",
      allocatedQuantity: 1100,
      beneficiaryOrganizationId: "org-piroguiers-joal",
      beneficiaryActorId: "actor-ibrahima",
      allocatedByActorId: "actor-aminata",
      allocatedAt: "2026-07-25T08:30:00Z",
    }),
    /capacité disponible est insuffisante/i,
  );
});

test("une sur-allocation d'un besoin est refusée", () => {
  const service = createService();

  assert.throws(
    () => service.reserveCapacity({
      id: "allocation-over-need",
      serviceNeedId: "service-need-003",
      capacityId: "capacity-001",
      allocatedQuantity: 300,
      beneficiaryOrganizationId: "org-piroguiers-joal",
      beneficiaryActorId: "actor-mamadou",
      allocatedByActorId: "actor-aminata",
      allocatedAt: "2026-07-25T08:30:00Z",
    }),
    /dépasserait la quantité demandée/i,
  );
});

test("une exécution partielle maintient l'allocation en cours", () => {
  const service = createService();
  const execution = service.confirmServiceExecution({
    id: "execution-partial",
    allocationId: "allocation-003",
    executedQuantity: 200,
    executedAt: "2026-07-25T09:00:00Z",
    confirmedByActorId: "actor-cheikh",
    evidence: [],
  });

  const snapshot = service.getSnapshot();
  assert.equal(execution.status, "confirmed");
  assert.equal(snapshot.serviceAllocations.find((item) => item.id === "allocation-003")?.status, "in_progress");
  assert.equal(snapshot.serviceNeeds.find((item) => item.id === "service-need-003")?.status, "partially_allocated");
});

test("une exécution complète clôt le besoin", () => {
  const service = createService();
  service.reserveCapacity({
    id: "allocation-final-coverage",
    serviceNeedId: "service-need-003",
    capacityId: "capacity-001",
    allocatedQuantity: 200,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-mamadou",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });
  service.confirmServiceExecution({
    id: "execution-existing-allocation",
    allocationId: "allocation-003",
    executedQuantity: 500,
    executedAt: "2026-07-25T09:00:00Z",
    confirmedByActorId: "actor-cheikh",
    evidence: [],
  });
  service.confirmServiceExecution({
    id: "execution-final-allocation",
    allocationId: "allocation-final-coverage",
    executedQuantity: 200,
    executedAt: "2026-07-25T09:05:00Z",
    confirmedByActorId: "actor-cheikh",
    evidence: [],
  });

  const snapshot = service.getSnapshot();
  assert.equal(snapshot.serviceNeeds.find((item) => item.id === "service-need-003")?.status, "fulfilled");
});

test("une exécution supérieure à l'allocation est refusée", () => {
  const service = createService();

  assert.throws(
    () => service.confirmServiceExecution({
      id: "execution-too-large",
      allocationId: "allocation-003",
      executedQuantity: 600,
      executedAt: "2026-07-25T09:00:00Z",
      confirmedByActorId: "actor-cheikh",
      evidence: [],
    }),
    /dépasserait la quantité réservée/i,
  );
});

test("l'annulation d'une allocation restitue la capacité et rouvre le besoin", () => {
  const service = createService();

  service.cancelServiceAllocation({ allocationId: "allocation-002" });

  const snapshot = service.getSnapshot();
  assert.equal(
    snapshot.serviceAllocations.find((item) => item.id === "allocation-002")?.status,
    "cancelled",
  );
  assert.equal(
    snapshot.serviceNeeds.find((item) => item.id === "service-need-002")?.status,
    "open",
  );
  assert.equal(
    snapshot.capacities.find((item) => item.id === "capacity-003")?.availableQuantity,
    1,
  );
});

test("les sélecteurs identifient la couverture et les capacités compatibles", () => {
  const snapshot = structuredClone(domainData);
  const coverage = getServiceNeedCoverage(snapshot, "service-need-003");
  assert.ok(coverage);
  const compatible = getCompatibleCapacitiesForNeed(
    snapshot,
    "service-need-003",
  );

  assert.equal(coverage.requestedQuantity, 700);
  assert.equal(coverage.allocatedQuantity, 500);
  assert.equal(coverage.remainingToAllocate, 200);
  assert.equal(coverage.allocationCoverageRate, 500 / 700);
  assert.equal(compatible.some((item) => item.id === "capacity-001"), true);
});

test("les besoins proches de leur échéance et insuffisamment couverts sont détectés", () => {
  const atRisk = getServiceNeedsAtRisk(
    structuredClone(domainData),
    "2026-07-25T10:15:00Z",
  );

  assert.equal(atRisk.some((item) => item.id === "service-need-003"), true);
  assert.equal(atRisk.some((item) => item.id === "service-need-004"), true);
  assert.equal(atRisk.some((item) => item.id === "service-need-001"), false);
});