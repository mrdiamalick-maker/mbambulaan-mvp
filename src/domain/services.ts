import { domainRepository } from "./repositories";
import type {
  Commitment,
  DomainData,
  EntityId,
  ExpectedReturn,
  Landing,
  Lot,
  Outcome,
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
  serviceNeeds: ExpectedReturn["serviceNeeds"];
  createdByActorId: EntityId;
  createdAt: string;
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
