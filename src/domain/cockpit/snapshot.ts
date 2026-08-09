import type { ProductState } from "@/domain/types";


export interface OperationalSnapshot {

  activeSituations: number;

  criticalSituations: number;

  activeCoordinations: number;

  terrainSignals: number;

  opportunities: number;

  actorsConnected: number;

}


export function generateOperationalSnapshot(
  state: ProductState
): OperationalSnapshot {


  const activeSituations =
    state.situations.filter(
      (item) =>
        item.status !== "reglee"
    );


  return {

    activeSituations:
      activeSituations.length,


    criticalSituations:
      activeSituations.filter(
        (item) =>
          item.priority === "critique"
      ).length,


    activeCoordinations:
      state.coordinationSpaces.length,


    terrainSignals:
      state.observations.length,


    opportunities:
      state.opportunities.length,


    actorsConnected:
      state.actors.length

  };

}