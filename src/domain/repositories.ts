import { domainData } from "./data";
import type {
  Actor,
  Capacity,
  Commitment,
  DomainData,
  EntityId,
  ExpectedReturn,
  Landing,
  LandingSite,
  Lot,
  MarketNeed,
  Organization,
  Outcome,
  Territory,
  Tension,
  Vessel,
  Weighing,
} from "./types";

export interface DomainRepository {
  getData(): DomainData;
  getTerritoryById(id: EntityId): Territory | undefined;
  getOrganizationById(id: EntityId): Organization | undefined;
  getActorById(id: EntityId): Actor | undefined;
  getLandingSiteById(id: EntityId): LandingSite | undefined;
  getVesselById(id: EntityId): Vessel | undefined;
  getExpectedReturnById(id: EntityId): ExpectedReturn | undefined;
  getLandingById(id: EntityId): Landing | undefined;
  getWeighingById(id: EntityId): Weighing | undefined;
  getLotById(id: EntityId): Lot | undefined;
  getMarketNeedById(id: EntityId): MarketNeed | undefined;
  getCapacityById(id: EntityId): Capacity | undefined;
  getTensionById(id: EntityId): Tension | undefined;
  getCommitmentById(id: EntityId): Commitment | undefined;
  getOutcomeById(id: EntityId): Outcome | undefined;
}

class InMemoryDomainRepository implements DomainRepository {
  constructor(private readonly data: DomainData) {}

  getData(): DomainData {
    return this.data;
  }

  getTerritoryById(id: EntityId): Territory | undefined {
    return this.data.territories.find((item) => item.id === id);
  }

  getOrganizationById(id: EntityId): Organization | undefined {
    return this.data.organizations.find((item) => item.id === id);
  }

  getActorById(id: EntityId): Actor | undefined {
    return this.data.actors.find((item) => item.id === id);
  }

  getLandingSiteById(id: EntityId): LandingSite | undefined {
    return this.data.landingSites.find((item) => item.id === id);
  }

  getVesselById(id: EntityId): Vessel | undefined {
    return this.data.vessels.find((item) => item.id === id);
  }

  getExpectedReturnById(id: EntityId): ExpectedReturn | undefined {
    return this.data.expectedReturns.find((item) => item.id === id);
  }

  getLandingById(id: EntityId): Landing | undefined {
    return this.data.landings.find((item) => item.id === id);
  }

  getWeighingById(id: EntityId): Weighing | undefined {
    return this.data.weighings.find((item) => item.id === id);
  }

  getLotById(id: EntityId): Lot | undefined {
    return this.data.lots.find((item) => item.id === id);
  }

  getMarketNeedById(id: EntityId): MarketNeed | undefined {
    return this.data.marketNeeds.find((item) => item.id === id);
  }

  getCapacityById(id: EntityId): Capacity | undefined {
    return this.data.capacities.find((item) => item.id === id);
  }

  getTensionById(id: EntityId): Tension | undefined {
    return this.data.tensions.find((item) => item.id === id);
  }

  getCommitmentById(id: EntityId): Commitment | undefined {
    return this.data.commitments.find((item) => item.id === id);
  }

  getOutcomeById(id: EntityId): Outcome | undefined {
    return this.data.outcomes.find((item) => item.id === id);
  }
}

export const domainRepository: DomainRepository = new InMemoryDomainRepository(domainData);
