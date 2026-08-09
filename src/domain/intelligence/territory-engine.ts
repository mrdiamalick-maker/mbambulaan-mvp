import type {
  ProductState,
  Territory
} from "@/domain/types";

import type {
  Metric
} from "./metrics";


export function generateTerritoryMetrics(
  state: ProductState,
  territory: Territory
): Metric[] {


  const situations =
    state.situations.filter(
      (item) =>
        item.territoryId === territory.id
    );


  const landings =
    state.landings.filter(
      (item) =>
        item.siteId === `quai-${territory.id}`
    );


  const volume =
    landings.reduce(
      (total, item) =>
        total + item.totalWeightKg,
      0
    );


  const actors =
    state.actors.filter(
      (actor) =>
        actor.territoryIds.includes(
          territory.id
        )
    );


  return [

    {
      id: "active-situations",

      category:
        "coordination",

      name:
        "Situations actives",

      value:
        situations.filter(
          (item) =>
            item.status !== "reglee"
        ).length,

      territoryId:
        territory.id,

      period:
        "current",

      source:
        "Mbàmbulaan"
    },


    {
      id: "landing-volume",

      category:
        "activity",

      name:
        "Volume débarqué",

      value:
        volume,

      unit:
        "kg",

      territoryId:
        territory.id,

      period:
        "current",

      source:
        "Déclarations et opérations"
    },


    {
      id: "actors-network",

      category:
        "trust",

      name:
        "Acteurs connectés",

      value:
        actors.length,

      territoryId:
        territory.id,

      period:
        "current",

      source:
        "Réseau Mbàmbulaan"
    }

  ];

}