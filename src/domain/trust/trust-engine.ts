import type {
  ProductState,
  Actor
} from "@/domain/types";

import type {
  TrustScore
} from "./trust";


export function calculateActorTrust(
  state: ProductState,
  actor: Actor
): TrustScore {


  const commitments =
    state.coordinationSpaces
      .flatMap(
        (space) =>
          space.commitments
      )
      .filter(
        (item) =>
          item.actorId === actor.id
      );


  const completed =
    commitments.filter(
      (item) =>
        item.status === "terminee"
    );


  const commitmentScore =
    commitments.length === 0
      ? 50
      : Math.round(
          completed.length /
          commitments.length *
          100
        );


  const identityScore =
    actor.verified
      ? 100
      : 50;


  const overall =
    Math.round(
      (
        identityScore +
        commitmentScore
      ) / 2
    );


  return {

    actorId:
      actor.id,


    overall,


    dimensions: [

      {
        dimension:
          "identity",

        score:
          identityScore,

        evidence:
          actor.verified
            ? [
                "Identité vérifiée"
              ]
            : [
                "Identité déclarée"
              ]
      },


      {
        dimension:
          "commitment",

        score:
          commitmentScore,

        evidence:
          [
            `${completed.length}/${commitments.length} engagements terminés`
          ]
      }

    ],


    updatedAt:
      new Date().toISOString()

  };

}