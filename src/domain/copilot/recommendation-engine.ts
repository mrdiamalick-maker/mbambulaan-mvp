import type {
  ProductState,
  Territory
} from "@/domain/types";

import type {
  CopilotContext
} from "./context";


export function buildCopilotContext(
  state: ProductState,
  territory?: Territory
): CopilotContext {


  const situations =
    territory
      ? state.situations.filter(
          (item)=>
            item.territoryId === territory.id &&
            item.status !== "reglee"
        )
      : state.situations.filter(
          (item)=>
            item.status !== "reglee"
        );


  const coordinations =
    state.coordinationSpaces.filter(
      (space)=>
        space.commitments.some(
          (item)=>
            item.status !== "terminee"
        )
    );


  const opportunities =
    territory
      ? state.opportunities.filter(
          (item)=>
            item.territoryId === territory.id
        )
      : state.opportunities;


  return {

    territory,

    activeSituations:
      situations.length,

    activeCoordinations:
      coordinations.length,

    trustLevel:
      state.actors.length
        ? Math.round(
            state.actors.filter(
              (actor)=>actor.verified
            ).length /
            state.actors.length *
            100
          )
        : 0,

    opportunities:
      opportunities.length,

    risks:
      situations
        .filter(
          (item)=>
            item.priority === "critique"
        )
        .map(
          (item)=>
            item.title
        )

  };

}