export interface TerritoryView {

  territoryId: string;

  activity: {

    landings: number;

    volumeKg: number;

    activeActors: number;

  };


  operations: {

    openSituations: number;

    activeCoordinations: number;

    criticalCapacities: number;

  };


  trust: {

    verifiedActors: number;

    averageTrust: number;

  };


  market: {

    opportunities: number;

    observations: number;

  };

}