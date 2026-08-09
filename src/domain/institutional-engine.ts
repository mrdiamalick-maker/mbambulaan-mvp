import type { ProductState } from "./types";


export interface InstitutionalSnapshot {
  territories: number;
  activeSituations: number;
  criticalSituations: number;
  activeCoordinations: number;
  actorsMobilized: number;
  volumeTracked: number;
  opportunities: number;
}


export function generateInstitutionalSnapshot(
  state: ProductState
): InstitutionalSnapshot {

  const activeSituations =
    state.situations.filter(
      (item) =>
        item.status !== "reglee"
    );


  const criticalSituations =
    activeSituations.filter(
      (item) =>
        item.priority === "critique"
    );


  const activeCoordinations =
    state.coordinationSpaces.filter(
      (space) =>
        space.commitments.some(
          (item) =>
            item.status !== "terminee"
        ) ||
        space.commitments.length === 0
    );


  const actorsMobilized =
    new Set(
      state.coordinationSpaces.flatMap(
        (space) =>
          space.participantIds
      )
    );


  const volumeTracked =
    state.landings.reduce(
      (total, landing) =>
        total + landing.totalWeightKg,
      0
    );


  return {
    territories:
      state.territories.length,

    activeSituations:
      activeSituations.length,

    criticalSituations:
      criticalSituations.length,

    activeCoordinations:
      activeCoordinations.length,

    actorsMobilized:
      actorsMobilized.size,

    volumeTracked,

    opportunities:
      state.opportunities.length
  };
}