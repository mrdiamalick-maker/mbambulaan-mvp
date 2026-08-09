import type {
  ProductState
} from "@/domain/types";


export interface NotificationTarget {

  actorId: string;

  reason: string;

}


export function findNotificationTargets(
  state: ProductState,
  territoryId: string
): NotificationTarget[] {


  return state.actors

    .filter(
      (actor)=>
        actor.territoryIds.includes(
          territoryId
        )
    )

    .map(
      (actor)=>({

        actorId:
          actor.id,

        reason:
          "Acteur rattaché au territoire concerné."

      })
    );

}