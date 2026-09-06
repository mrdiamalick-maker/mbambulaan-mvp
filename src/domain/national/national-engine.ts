import type {
  ProductState
} from "@/domain/types";


export interface NationalSnapshot {

  territories: number;

  activeSituations: number;

  criticalSituations: number;

  actors: number;

  landings: number;

  coordinations: number;

  opportunities: number;

}



export function generateNationalSnapshot(
  state: ProductState
): NationalSnapshot {


  const activeSituations =
    state.situations.filter(
      (item)=>
        item.status !== "reglee"
    );


  return {

    territories:
      state.territories.length,


    activeSituations:
      activeSituations.length,


    criticalSituations:
      activeSituations.filter(
        (item)=>
          item.priority === "critique"
      ).length,


    actors:
      state.actors.length,


    landings:
      state.landings.length,


    coordinations:
      state.coordinationSpaces.length,


    opportunities:
      state.opportunities.length

  };

}