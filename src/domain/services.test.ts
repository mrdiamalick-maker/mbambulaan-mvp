import assert from "node:assert/strict";
import test from "node:test";

import { domainData } from "./data";
import {
  getCompatibleCapacitiesForServiceNeed,
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
    id: "service-need-test-create",
    expectedReturnId: "return-004",
    requestedByActorId: "actor-mamadou",
    needType: "ice",
    requestedQuantity: 400,
    unit: "kg",
    neededAt: "2026-07-25T10:45:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    priority: "urgent",
    createdAt: "2026-07-25T08:15:00Z",
  });

  assert.equal(need.status, "open");
  assert.equal(
    service.getSnapshot().serviceNeeds.some((item) => item.id === need.id),
    true,
  );
});

test("une capacité déclarée devient immédiatement disponible", () => {
  const service = createService();

  const capacity = service.declareCapacity({
    id: "capacity-test-declare",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 600,
    unit: "kg",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T12:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T07:30:00Z",
  });

  assert.equal(capacity.availableQuantity, 600);
  assert.equal(capacity.status, "available");
});

test("une réservation partielle met à jour le besoin et la capacité", () => {
  const service = createService();

  service.createServiceNeed({
    id: "service-need-test-partial",
    expectedReturnId: "return-004",
    requestedByActorId: "actor-mamadou",
    needType: "ice",
    requestedQuantity: 500,
    unit: "kg",
    neededAt: "2026-07-25T11:00:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    priority: "urgent",
    createdAt: "2026-07-25T08:20:00Z",
  });

  service.declareCapacity({
    id: "capacity-test-partial",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 500,
    unit: "kg",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T12:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T07:30:00Z",
  });

  service.reserveCapacity({
    id: "allocation-test-partial",
    serviceNeedId: "service-need-test-partial",
    capacityId: "capacity-test-partial",
    allocatedQuantity: 300,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-mamadou",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });

  const snapshot = service.getSnapshot();
  const need = snapshot.serviceNeeds.find(
    (item) => item.id === "service-need-test-partial",
  );
  const capacity = snapshot.capacities.find(
    (item) => item.id === "capacity-test-partial",
  );

  assert.equal(need?.status, "partially_allocated");
  assert.equal(capacity?.availableQuantity, 200);
  assert.equal(capacity?.status, "partially_available");
});

test("une réservation complète place le besoin au statut alloué", () => {
  const service = createService();

  service.createServiceNeed({
    id: "service-need-test-full",
    expectedReturnId: "return-004",
    requestedByActorId: "actor-mamadou",
    needType: "transport",
    requestedQuantity: 1,
    unit: "vehicle",
    neededAt: "2026-07-25T11:30:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    priority: "critical",
    createdAt: "2026-07-25T08:20:00Z",
  });

  service.declareCapacity({
    id: "capacity-test-full",
    providerOrganizationId: "org-mareyeurs-thies",
    capacityType: "transport",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 1,
    unit: "vehicle",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T14:00:00Z",
    declaredByActorId: "actor-omar",
    createdAt: "2026-07-25T07:30:00Z",
  });

  service.reserveCapacity({
    id: "allocation-test-full",
    serviceNeedId: "service-need-test-full",
    capacityId: "capacity-test-full",
    allocatedQuantity: 1,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-mamadou",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });

  const snapshot = service.getSnapshot();
  assert.equal(
    snapshot.serviceNeeds.find((item) => item.id === "service-need-test-full")
      ?.status,
    "allocated",
  );
  assert.equal(
    snapshot.capacities.find((item) => item.id === "capacity-test-full")
      ?.availableQuantity,
    0,
  );
});

test("une réservation supérieure à la capacité disponible est refusée", () => {
  const service = createService();

  service.createServiceNeed({
    id: "service-need-test-capacity-refusal",
    expectedReturnId: "return-004",
    requestedByActorId: "actor-mamadou",
    needType: "ice",
    requestedQuantity: 500,
    unit: "kg",
    neededAt: "2026-07-25T11:00:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    priority: "urgent",
    createdAt: "2026-07-25T08:20:00Z",
  });

  service.declareCapacity({
    id: "capacity-test-capacity-refusal",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 200,
    unit: "kg",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T12:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T07:30:00Z",
  });

  assert.throws(
    () =>
      service.reserveCapacity({
        id: "allocation-test-capacity-refusal",
        serviceNeedId: "service-need-test-capacity-refusal",
        capacityId: "capacity-test-capacity-refusal",
        allocatedQuantity: 300,
        beneficiaryOrganizationId: "org-piroguiers-joal",
        beneficiaryActorId: "actor-mamadou",
        allocatedByActorId: "actor-aminata",
        allocatedAt: "2026-07-25T08:30:00Z",
      }),
    /capacité disponible est insuffisante/i,
  );
});

test("une sur-allocation d'un besoin est refusée", () => {
  const service = createService();

  service.createServiceNeed({
    id: "service-need-test-overallocation",
    expectedReturnId: "return-004",
    requestedByActorId: "actor-mamadou",
    needType: "ice",
    requestedQuantity: 400,
    unit: "kg",
    neededAt: "2026-07-25T11:00:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    priority: "urgent",
    createdAt: "2026-07-25T08:20:00Z",
  });

  service.declareCapacity({
    id: "capacity-test-overallocation-a",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 300,
    unit: "kg",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T12:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T07:30:00Z",
  });
  service.declareCapacity({
    id: "capacity-test-overallocation-b",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 300,
    unit: "kg",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T12:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T07:31:00Z",
  });

  service.reserveCapacity({
    id: "allocation-test-overallocation-a",
    serviceNeedId: "service-need-test-overallocation",
    capacityId: "capacity-test-overallocation-a",
    allocatedQuantity: 300,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-mamadou",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });

  assert.throws(
    () =>
      service.reserveCapacity({
        id: "allocation-test-overallocation-b",
        serviceNeedId: "service-need-test-overallocation",
        capacityId: "capacity-test-overallocation-b",
        allocatedQuantity: 200,
        beneficiaryOrganizationId: "org-piroguiers-joal",
        beneficiaryActorId: "actor-mamadou",
        allocatedByActorId: "actor-aminata",
        allocatedAt: "2026-07-25T08:35:00Z",
      }),
    /dépasserait la quantité demandée/i,
  );
});

test("une exécution partielle maintient l'allocation en cours", () => {
  const service = createService();

  service.createServiceNeed({
    id: "service-need-test-partial-execution",
    expectedReturnId: "return-004",
    requestedByActorId: "actor-mamadou",
    needType: "ice",
    requestedQuantity: 400,
    unit: "kg",
    neededAt: "2026-07-25T11:00:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    priority: "urgent",
    createdAt: "2026-07-25T08:20:00Z",
  });
  service.declareCapacity({
    id: "capacity-test-partial-execution",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 400,
    unit: "kg",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T12:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T07:30:00Z",
  });
  service.reserveCapacity({
    id: "allocation-test-partial-execution",
    serviceNeedId: "service-need-test-partial-execution",
    capacityId: "capacity-test-partial-execution",
    allocatedQuantity: 400,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-mamadou",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });

  service.confirmServiceExecution({
    id: "execution-test-partial",
    allocationId: "allocation-test-partial-execution",
    executedQuantity: 150,
    executedAt: "2026-07-25T09:00:00Z",
    confirmedByActorId: "actor-cheikh",
    evidence: [],
  });

  const snapshot = service.getSnapshot();
  assert.equal(
    snapshot.serviceAllocations.find(
      (item) => item.id === "allocation-test-partial-execution",
    )?.status,
    "in_progress",
  );
  assert.equal(
    snapshot.serviceNeeds.find(
      (item) => item.id === "service-need-test-partial-execution",
    )?.status,
    "allocated",
  );
});

test("une exécution complète clôt le besoin", () => {
  const service = createService();

  service.createServiceNeed({
    id: "service-need-test-complete-execution",
    expectedReturnId: "return-004",
    requestedByActorId: "actor-mamadou",
    needType: "ice",
    requestedQuantity: 250,
    unit: "kg",
    neededAt: "2026-07-25T11:00:00Z",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    priority: "urgent",
    createdAt: "2026-07-25T08:20:00Z",
  });
  service.declareCapacity({
    id: "capacity-test-complete-execution",
    providerOrganizationId: "org-froid-saloum",
    capacityType: "ice",
    territoryId: "territory-joal",
    landingSiteId: "site-joal-central",
    initialQuantity: 250,
    unit: "kg",
    availableFrom: "2026-07-25T08:00:00Z",
    availableUntil: "2026-07-25T12:00:00Z",
    declaredByActorId: "actor-cheikh",
    createdAt: "2026-07-25T07:30:00Z",
  });
  service.reserveCapacity({
    id: "allocation-test-complete-execution",
    serviceNeedId: "service-need-test-complete-execution",
    capacityId: "capacity-test-complete-execution",
    allocatedQuantity: 250,
    beneficiaryOrganizationId: "org-piroguiers-joal",
    beneficiaryActorId: "actor-mamadou",
    allocatedByActorId: "actor-aminata",
    allocatedAt: "2026-07-25T08:30:00Z",
  });

  service.confirmServiceExecution({
    id: "execution-test-complete",
    allocationId: "allocation-test-complete-execution",
    executedQuantity: 250,
    executedAt: "2026-07-25T09:00:00Z",
    confirmedByActorId: "actor-cheikh",
    evidence: [],
  });

  const snapshot = service.getSnapshot();
  assert.equal(
    snapshot.serviceAllocations.find(
      (item) => item.id === "allocation-test-complete-execution",
    )?.status,
    "fulfilled",
  );
  assert.equal(
    snapshot.serviceNeeds.find(
      (item) => item.id === "service-need-test-complete-execution",
    )?.status,
    "fulfilled",
  );
});

test("une exécution supérieure à l'allocation est refusée", () => {
  const service = createService();

  assert.throws(
    () =>
      service.confirmServiceExecution({
        id: "execution-test-over",
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
    snapshot.serviceAllocations.find((item) => item.id === "allocation-002")
      ?.status,
    "cancelled",
  );
  assert.equal(
    snapshot.serviceNeeds.find((item) => item.id === "service-need-002")
      ?.status,
    "open",
  );
  assert.equal(
    snapshot.capacities.find((item) => item.id === "capacity-003")
      ?.availableQuantity,
    1,
  );
});

test("les sélecteurs identifient la couverture et les capacités compatibles", () => {
  const snapshot = structuredClone(domainData);
  const coverage = getServiceNeedCoverage(snapshot, "service-need-003");
  const compatible = getCompatibleCapacitiesForServiceNeed(
    snapshot,
    "service-need-004",
  );

  assert.equal(coverage.requestedQuantity, 700);
  assert.equal(coverage.allocatedQuantity, 500);
  assert.equal(coverage.remainingQuantity, 200);
  assert.equal(coverage.allocationCoverageRate, 500 / 700);
  assert.equal(compatible.some((item) => item.id === "capacity-002"), true);
});

test("les besoins proches de leur échéance et insuffisamment couverts sont détectés", () => {
  const atRisk = getServiceNeedsAtRisk(
    structuredClone(domainData),
    "2026-07-25T09:50:00Z",
    60,
  );

  assert.equal(atRisk.some((item) => item.id === "service-need-003"), true);
  assert.equal(atRisk.some((item) => item.id === "service-need-004"), true);
  assert.equal(atRisk.some((item) => item.id === "service-need-001"), false);
});
