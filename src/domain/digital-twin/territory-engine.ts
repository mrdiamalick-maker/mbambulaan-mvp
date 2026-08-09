import type {
  ProductState,
  Territory
} from "@/domain/types";

import type {
  TerritoryView
} from "./territory-view";


export function generateTerritoryView(
  state: ProductState,
  territory: Territory
): TerritoryView {


  const landings =
    state.landings.filter(
      (item) =>
        item.siteId === `quai-${territory.id}`
    );


  const volume =
    landings.reduce(
      (total,item)=>
        total + item.totalWeightKg,
      0
    );


  const actors =
    state.actors.filter(
      (actor)=>
        actor.territoryIds.includes(
          territory.id
        )
    );


  const situations =
    state.situations.filter(
      (item)=>
        item.territoryId === territory.id &&
        item.status !== "reglee"
    );


  const coordinations =
    state.coordinationSpaces.filter(
      (item)=>
        item.situationId &&
        situations.some(
          (s)=>
            s.id === item.situationId
        )
    );


  const capacities =
    state.infrastructures.filter(
      (item)=>
        item.territoryId === territory.id &&
        item.status !== "operationnelle"
    );


  return {

    territoryId:
      territory.id,


    activity:{
      landings:
        landings.length,

      volumeKg:
        volume,

      activeActors:
        actors.length
    },


    operations:{
      openSituations:
        situations.length,

      activeCoordinations:
        coordinations.length,

      criticalCapacities:
        capacities.length
    },


    trust:{
      verifiedActors:
        actors.filter(
          (a)=>a.verified
        ).length,

      averageTrust:
        actors.length
          ? Math.round(
              actors.filter(
                (a)=>a.verified
              ).length /
              actors.length *
              100
            )
          : 0
    },


    market:{
      opportunities:
        state.opportunities.filter(
          (item)=>
            item.territoryId === territory.id
        ).length,

      observations:
        state.priceObservations.filter(
          (item)=>
            item.territoryId === territory.id
        ).length
    }

  };

}