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
  return {
    actors: [...data.actors],
    organizations: [...data.organizations],
    territories: [...data.territories],
    landingSites: [...data.landingSites],
    vessels: [...data.vessels],
    expectedReturns: [...data.expectedReturns],
    landings: [...data.landings],
    weighings: [...data.weighings],
    lots: [...data.lots],
    marketNeeds: [...data.marketNeeds],
    capacities: [...data.capacities],
    tensions: [...data.tensions],
    commitments: [...data.commitments],
    outcomes: [...data.outcomes],
  };
}

export class DomainService {
  private data: DomainData;

  constructor(initialData: DomainData = domainRepository.getData()) {
    this.data = cloneData(initialData);
  }

  getSnapshot(): DomainData {
    return cloneData(this.data);
  }

  announceExpectedReturn(input: CreateExpectedReturnInput): ExpectedReturn {
    const item: ExpectedReturn = { ...input, status: "announced" };
    this.data.expectedReturns = [...this.data.expectedReturns, item];
    return item;
  }

  confirmLanding(input: ConfirmLandingInput): Landing {
    const landing: Landing = { ...input, status: "confirmed" };
    this.data.landings = [...this.data.landings, landing];

    if (input.expectedReturnId) {
      this.data.expectedReturns = this.data.expectedReturns.map((item) =>
        item.id === input.expectedReturnId ? { ...item, status: "arrived" } : item,
      );
    }

    return landing;
  }

  registerWeighing(input: RegisterWeighingInput): Weighing {
    if (input.totalWeightKg <= 0) {
      throw new Error("Le poids doit être strictement positif.");
    }

    const weighing: Weighing = { ...input };
    this.data.weighings = [...this.data.weighings, weighing];
    return weighing;
  }

  createLot(input: CreateLotInput): Lot {
    if (input.weightKg <= 0) {
      throw new Error("Le poids du lot doit être strictement positif.");
    }

    const lot: Lot = {
      ...input,
      availabilityStatus: "available",
      currency: input.askingPricePerKg ? "XOF" : undefined,
    };

    this.data.lots = [...this.data.lots, lot];
    return lot;
  }

  reportTension(input: ReportTensionInput): Tension {
    const tension: Tension = { ...input, status: "open" };
    this.data.tensions = [...this.data.tensions, tension];
    return tension;
  }

  createCommitment(input: CreateCommitmentInput): Commitment {
    if (!input.actorId && !input.organizationId) {
      throw new Error("Un engagement doit être porté par un acteur ou une organisation.");
    }

    const commitment: Commitment = { ...input, status: "proposed" };
    this.data.commitments = [...this.data.commitments, commitment];
    return commitment;
  }

  recordOutcome(input: RecordOutcomeInput): Outcome {
    const outcome: Outcome = {
      ...input,
      currency: input.valueCreated ? "XOF" : undefined,
    };

    this.data.outcomes = [...this.data.outcomes, outcome];
    return outcome;
  }
}

export const domainService = new DomainService();
