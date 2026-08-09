import type {
  ProductState,
  Situation
} from "./types";


export interface ValueImpact {
  volumeProtected: number;
  actorsMobilized: number;
  situationsResolved: number;
  opportunitiesCreated: number;
  risksReduced: string[];
}


export function evaluateTerritorialValue(
  state: ProductState,
  situation?: Situation
): ValueImpact {

  const actorsMobilized =
    state.coordinationSpaces
      .filter((space) =>
        situation
          ? space.situationId === situation.id
          : true
      )
      .reduce(
        (total, space) =>
          total + space.participantIds.length,
        0
      );


  const opportunitiesCreated =
    state.opportunities.length;


  const situationsResolved =
    state.situations.filter(
      (item) =>
        item.status === "reglee"
    ).length;


  const risksReduced =
    state.audit
      .filter((item) =>
        item.action.includes("coordinate") ||
        item.action.includes("close")
      )
      .map(
        (item) => item.detail
      )
      .slice(0, 5);


  const volumeProtected =
    state.landings.reduce(
      (total, landing) =>
        total + landing.totalWeightKg,
      0
    );


  return {
    volumeProtected,
    actorsMobilized,
    situationsResolved,
    opportunitiesCreated,
    risksReduced
  };
}