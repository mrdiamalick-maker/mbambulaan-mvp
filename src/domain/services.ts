import { domainRepository } from "./repositories";
import type {
  Capacity,
  Commitment,
  DomainData,
  EntityId,
  ExpectedReturn,
  Landing,
  Lot,
  Outcome,
  ServiceAllocation,
  ServiceExecution,
  ServiceNeed,
  Tension,
  Weighing,
} from "./types";
import { assertValidDomainData } from "./validation";

export interface CreateExpectedReturnInput {
  id: EntityId;
  vesselId: EntityId;
  expectedLandingSiteId: EntityId;
  expectedAt: string;
  estimatedCatch: ExpectedReturn["estimatedCatch"];
  createdByActorId: EntityId;
  createdAt: string;
}

export interface CreateServiceNeedInput {
  id: EntityId;
  expectedReturnId: EntityId;
  requestedByActorId: EntityId;
  needType: ServiceNeed["needType"];
  requestedQuantity: number;
  unit: ServiceNeed["unit"];
  neededAt: string;
  territoryId: EntityId;
  landingSiteId?: EntityId;
  priority: ServiceNeed["priority"];
  note?: string;
  createdAt: string;
}

export interface DeclareCapacityInput {
  id: EntityId;
  providerOrganizationId: EntityId;
  capacityType: Capacity["capacityType"];
  territoryId: EntityId;
  landingSiteId?: EntityId;
  initialQuantity: number;
  unit: Capacity["unit"];
  availableFrom: string;
  availableUntil?: string;
  declaredByActorId: EntityId;
  createdAt: string;
}

export interface ReserveCapacityInput {
  id: EntityId;
  serviceNeedId: EntityId;
  capacityId: EntityId;
  allocatedQuantity: number;
  beneficiaryOrganizationId?: EntityId;
  beneficiaryActorId?: EntityId;
  allocatedByActorId: EntityId;
  allocatedAt: string;
  expiresAt?: string;
}

export interface ConfirmServiceExecutionInput {
  id: EntityId;
  allocationId: EntityId;
  executedQuantity: number;
  executedAt: string;
  confirmedByActorId: EntityId;
  evidence: ServiceExecution["evidence"];
}

export interface CancelServiceAllocationInput {
  allocationId: EntityId;
}

export interface ConfirmLandingInput {
  id: EntityId;
  expectedReturnId?: EntityId;
  vesselId: EntityId;
  landingSiteId: EntityId;
  landedAt: string;
  confirmedByActorId: EntityId;
}

export interface RegisterWeighingInput {
  id: EntityId;
  landingId: EntityId;
  measuredAt: string;
  totalWeightKg: number;
  method: Weighing["method"];
  confidenceLevel: Weighing["confidenceLevel"];
  verifiedByActorId?: EntityId;
}

export interface CreateLotInput {
  id: EntityId;
  landingId: EntityId;
  species: string;
  weightKg: number;
  qualityGrade: Lot["qualityGrade"];
  conservationStatus: Lot["conservationStatus"];
  askingPricePerKg?: number;
}

export interface ReportTensionInput {
  id: EntityId;
  tensionType: Tension["tensionType"];
  severity: Tension["severity"];
  territoryId: EntityId;
  relatedEntityType: Tension["relatedEntityType"];
  relatedEntityId: EntityId;
  description: string;
  reportedByActorId: EntityId;
  reportedAt: string;
}

export interface CreateCommitmentInput {
  id: EntityId;
  tensionId: EntityId;
  actorId?: EntityId;
  organizationId?: EntityId;
  action: string;
  dueAt: string;
}

export interface RecordOutcomeInput {
  id: EntityId;
  relatedEntityType: Outcome["relatedEntityType"];
  relatedEntityId: EntityId;
  outcomeType: Outcome["outcomeType"];
  description: string;
  valueSavedKg?: number;
  valueCreated?: number;
  recordedAt: string;
  evidence: Outcome["evidence"];
}

function cloneData(data: DomainData): DomainData {
  return structuredClone(data);
}

function ensureUniqueId(
  data: DomainData,
  collection: keyof DomainData,
  id: EntityId,
): void {
  const exists = (data[collection] as Array<{ id: EntityId }>).some(
    (item) => item.id === id,
  );

  if (exists) {
    throw new Error(`L'identifiant ${id} existe déjà dans ${collection}.`);
  }
}

function getServiceNeedStatus(
  data: DomainData,
  serviceNeedId: EntityId,
): ServiceNeed["status"] {
  const need = data.serviceNeeds.find((item) => item.id === serviceNeedId);
  if (!need) {
    throw new Error(`Le besoin de service ${serviceNeedId} est introuvable.`);
  }

  if (need.status === "cancelled") {
    return "cancelled";
  }

  const activeAllocations = data.serviceAllocations.filter(
    (item) =>
      item.serviceNeedId === serviceNeedId &&
      ["proposed", "reserved", "in_progress", "fulfilled"].includes(item.status),
  );
  const allocatedQuantity = activeAllocations.reduce(
    (total, item) => total + item.allocatedQuantity,
    0,
  );
  const allocationIds = new Set(activeAllocations.map((item) => item.id));
  const executedQuantity = data.serviceExecutions
    .filter(
      (item) =>
        allocationIds.has(item.allocationId) && item.status === "confirmed",
    )
    .reduce((total, item) => total + item.executedQuantity, 0);

  if (executedQuantity >= need.requestedQuantity) {
    return "fulfilled";
  }
  if (allocatedQuantity === 0) {
    return "open";
  }
  if (allocatedQuantity < need.requestedQuantity) {
    return "partially_allocated";
  }
  return "allocated";
}

function refreshServiceNeedStatus(
  data: DomainData,
  serviceNeedId: EntityId,
): DomainData {
  const status = getServiceNeedStatus(data, serviceNeedId);
  return {
    ...data,
    serviceNeeds: data.serviceNeeds.map((item) =>
      item.id === serviceNeedId ? { ...item, status } : item,
    ),
  };
}

function refreshCapacityState(data: DomainData, capacityId: EntityId): DomainData {
  const capacity = data.capacities.find((item) => item.id === capacityId);
  if (!capacity) {
    throw new Error(`La capacité ${capacityId} est introuvable.`);
  }

  const allocatedQuantity = data.serviceAllocations
    .filter(
      (item) =>
        item.capacityId === capacityId &&
        ["proposed", "reserved", "in_progress", "fulfilled"].includes(item.status),
    )
    .reduce((total, item) => total + item.allocatedQuantity, 0);
  const availableQuantity = capacity.initialQuantity - allocatedQuantity;
  const status: Capacity["status"] =
    availableQuantity <= 0
      ? "allocated"
      : availableQuantity < capacity.initialQuantity
        ? "partially_available"
        : "available";

  return {
    ...data,
    capacities: data.capacities.map((item) =>
      item.id === capacityId
        ? { ...item, availableQuantity, status }
        : item,
    ),
  };
}

export class DomainService {
  private data: DomainData;

  constructor(initialData: DomainData = domainRepository.getData()) {
    assertValidDomainData(initialData);
    this.data = cloneData(initialData);
  }

  getSnapshot(): DomainData {
    return cloneData(this.data);
  }

  private commit(nextData: DomainData): void {
    assertValidDomainData(nextData);
    this.data = nextData;
  }

  announceExpectedReturn(input: CreateExpectedReturnInput): ExpectedReturn {
    ensureUniqueId(this.data, "expectedReturns", input.id);

    const item: ExpectedReturn = { ...input, status: "announced" };
    this.commit({
      ...this.data,
      expectedReturns: [...this.data.expectedReturns, item],
    });
    return item;
  }

  createServiceNeed(input: CreateServiceNeedInput): ServiceNeed {
    if (input.requestedQuantity <= 0) {
      throw new Error("La quantité demandée doit être strictement positive.");
    }

    ensureUniqueId(this.data, "serviceNeeds", input.id);

    const need: ServiceNeed = { ...input, status: "open" };
    this.commit({
      ...this.data,
      serviceNeeds: [...this.data.serviceNeeds, need],
    });
    return need;
  }

  declareCapacity(input: DeclareCapacityInput): Capacity {
    if (input.initialQuantity <= 0) {
      throw new Error("La capacité déclarée doit être strictement positive.");
    }

    ensureUniqueId(this.data, "capacities", input.id);

    const capacity: Capacity = {
      ...input,
      availableQuantity: input.initialQuantity,
      status: "available",
    };
    this.commit({
      ...this.data,
      capacities: [...this.data.capacities, capacity],
    });
    return capacity;
  }

  reserveCapacity(input: ReserveCapacityInput): ServiceAllocation {
    if (input.allocatedQuantity <= 0) {
      throw new Error("La quantité réservée doit être strictement positive.");
    }

    ensureUniqueId(this.data, "serviceAllocations", input.id);

    const need = this.data.serviceNeeds.find(
      (item) => item.id === input.serviceNeedId,
    );
    if (!need) {
      throw new Error(`Le besoin de service ${input.serviceNeedId} est introuvable.`);
    }
    if (["fulfilled", "cancelled"].includes(need.status)) {
      throw new Error("Ce besoin de service ne peut plus recevoir d'allocation.");
    }

    const capacity = this.data.capacities.find(
      (item) => item.id === input.capacityId,
    );
    if (!capacity) {
      throw new Error(`La capacité ${input.capacityId} est introuvable.`);
    }
    if (capacity.availableQuantity < input.allocatedQuantity) {
      throw new Error("La capacité disponible est insuffisante pour cette réservation.");
    }

    const alreadyAllocated = this.data.serviceAllocations
      .filter(
        (item) =>
          item.serviceNeedId === need.id &&
          ["proposed", "reserved", "in_progress", "fulfilled"].includes(item.status),
      )
      .reduce((total, item) => total + item.allocatedQuantity, 0);
    if (alreadyAllocated + input.allocatedQuantity > need.requestedQuantity) {
      throw new Error("Cette réservation dépasserait la quantité demandée.");
    }

    const allocation: ServiceAllocation = {
      ...input,
      unit: need.unit,
      providerOrganizationId: capacity.providerOrganizationId,
      status: "reserved",
    };

    let nextData: DomainData = {
      ...this.data,
      serviceAllocations: [...this.data.serviceAllocations, allocation],
    };
    nextData = refreshCapacityState(nextData, capacity.id);
    nextData = refreshServiceNeedStatus(nextData, need.id);
    this.commit(nextData);
    return allocation;
  }

  confirmServiceExecution(
    input: ConfirmServiceExecutionInput,
  ): ServiceExecution {
    if (input.executedQuantity <= 0) {
      throw new Error("La quantité exécutée doit être strictement positive.");
    }

    ensureUniqueId(this.data, "serviceExecutions", input.id);

    const allocation = this.data.serviceAllocations.find(
      (item) => item.id === input.allocationId,
    );
    if (!allocation) {
      throw new Error(`L'allocation ${input.allocationId} est introuvable.`);
    }
    if (["cancelled", "expired"].includes(allocation.status)) {
      throw new Error("Cette allocation ne peut plus être exécutée.");
    }

    const alreadyExecuted = this.data.serviceExecutions
      .filter(
        (item) =>
          item.allocationId === allocation.id && item.status === "confirmed",
      )
      .reduce((total, item) => total + item.executedQuantity, 0);
    if (alreadyExecuted + input.executedQuantity > allocation.allocatedQuantity) {
      throw new Error("L'exécution dépasserait la quantité réservée.");
    }

    const execution: ServiceExecution = {
      ...input,
      status: "confirmed",
    };
    const executedTotal = alreadyExecuted + input.executedQuantity;
    const allocationStatus: ServiceAllocation["status"] =
      executedTotal >= allocation.allocatedQuantity ? "fulfilled" : "in_progress";

    let nextData: DomainData = {
      ...this.data,
      serviceExecutions: [...this.data.serviceExecutions, execution],
      serviceAllocations: this.data.serviceAllocations.map((item) =>
        item.id === allocation.id
          ? { ...item, status: allocationStatus }
          : item,
      ),
    };
    nextData = refreshServiceNeedStatus(nextData, allocation.serviceNeedId);
    this.commit(nextData);
    return execution;
  }

  cancelServiceAllocation(
    input: CancelServiceAllocationInput,
  ): ServiceAllocation {
    const allocation = this.data.serviceAllocations.find(
      (item) => item.id === input.allocationId,
    );
    if (!allocation) {
      throw new Error(`L'allocation ${input.allocationId} est introuvable.`);
    }
    if (["fulfilled", "cancelled", "expired"].includes(allocation.status)) {
      throw new Error("Cette allocation ne peut pas être annulée.");
    }

    const cancelledAllocation: ServiceAllocation = {
      ...allocation,
      status: "cancelled",
    };
    let nextData: DomainData = {
      ...this.data,
      serviceAllocations: this.data.serviceAllocations.map((item) =>
        item.id === allocation.id ? cancelledAllocation : item,
      ),
    };
    nextData = refreshCapacityState(nextData, allocation.capacityId);
    nextData = refreshServiceNeedStatus(nextData, allocation.serviceNeedId);
    this.commit(nextData);
    return cancelledAllocation;
  }

  confirmLanding(input: ConfirmLandingInput): Landing {
    ensureUniqueId(this.data, "landings", input.id);

    const landing: Landing = { ...input, status: "confirmed" };
    const expectedReturns = input.expectedReturnId
      ? this.data.expectedReturns.map((item) =>
          item.id === input.expectedReturnId
            ? { ...item, status: "arrived" as const }
            : item,
        )
      : this.data.expectedReturns;

    this.commit({
      ...this.data,
      expectedReturns,
      landings: [...this.data.landings, landing],
    });
    return landing;
  }

  registerWeighing(input: RegisterWeighingInput): Weighing {
    if (input.totalWeightKg <= 0) {
      throw new Error("Le poids doit être strictement positif.");
    }

    ensureUniqueId(this.data, "weighings", input.id);

    const weighing: Weighing = { ...input };
    this.commit({
      ...this.data,
      weighings: [...this.data.weighings, weighing],
    });
    return weighing;
  }

  createLot(input: CreateLotInput): Lot {
    if (input.weightKg <= 0) {
      throw new Error("Le poids du lot doit être strictement positif.");
    }

    ensureUniqueId(this.data, "lots", input.id);

    const lot: Lot = {
      ...input,
      availabilityStatus: "available",
      currency: input.askingPricePerKg ? "XOF" : undefined,
    };

    this.commit({
      ...this.data,
      lots: [...this.data.lots, lot],
    });
    return lot;
  }

  reportTension(input: ReportTensionInput): Tension {
    ensureUniqueId(this.data, "tensions", input.id);

    const tension: Tension = { ...input, status: "open" };
    this.commit({
      ...this.data,
      tensions: [...this.data.tensions, tension],
    });
    return tension;
  }

  createCommitment(input: CreateCommitmentInput): Commitment {
    if (!input.actorId && !input.organizationId) {
      throw new Error(
        "Un engagement doit être porté par un acteur ou une organisation.",
      );
    }

    ensureUniqueId(this.data, "commitments", input.id);

    const commitment: Commitment = { ...input, status: "proposed" };
    this.commit({
      ...this.data,
      commitments: [...this.data.commitments, commitment],
    });
    return commitment;
  }

  recordOutcome(input: RecordOutcomeInput): Outcome {
    ensureUniqueId(this.data, "outcomes", input.id);

    const outcome: Outcome = {
      ...input,
      currency: input.valueCreated ? "XOF" : undefined,
    };

    this.commit({
      ...this.data,
      outcomes: [...this.data.outcomes, outcome],
    });
    return outcome;
  }
}

export const domainService = new DomainService();
