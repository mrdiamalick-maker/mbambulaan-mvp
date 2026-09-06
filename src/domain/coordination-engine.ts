import type {
  Actor,
  CoordinationSpace,
  ProductState,
  Situation,
  Territory
} from "./types";


export interface CoordinationRecommendation {
  reason: string;
  objective: string;
  actorIds: string[];
  risks: string[];
  firstAction: string;
}


export interface CoordinationProposal extends CoordinationSpace {
  sourceSituationId: string;
}


/**
 * Analyse une situation et propose une réponse coordonnée.
 *
 * Cette fonction ne modifie pas l'état du produit.
 * Elle produit une recommandation explicable.
 */
export function recommendCoordination(
  state: ProductState,
  situation: Situation
): CoordinationRecommendation | null {

  const territory = state.territories.find(
    (item) => item.id === situation.territoryId
  );

  if (!territory) return null;


  const actors = findRelevantActors(
    state,
    territory
  );


  const risks = findRisks(
    state,
    territory
  );


  return {
    reason:
      `La situation "${situation.title}" nécessite une coordination territoriale.`,

    objective:
      situation.nextStep,

    actorIds:
      actors.map((actor) => actor.id),

    risks,

    firstAction:
      "Réunir les acteurs concernés et confirmer les responsabilités."
  };
}


/**
 * Transforme une recommandation en mission de coordination proposée.
 *
 * La mission reste une proposition :
 * elle pourra ensuite être validée par un acteur humain.
 */
export function buildCoordinationProposal(
  state: ProductState,
  situation: Situation
): CoordinationProposal | null {

  const recommendation = recommendCoordination(
    state,
    situation
  );

  if (!recommendation) return null;


  const now = new Date();


  return {
    id: `coord-proposal-${situation.id}`,

    sourceSituationId:
      situation.id,

    situationId:
      situation.id,

    title:
      `Coordination · ${situation.title}`,

    participantIds:
      recommendation.actorIds,

    objective:
      recommendation.objective,

    decision:
      recommendation.firstAction,

    commitments:
      recommendation.actorIds
        .slice(0, 3)
        .map((actorId, index) => ({
          id:
            `commitment-${situation.id}-${index + 1}`,

          actorId,

          label:
            index === 0
              ? "Qualifier la situation terrain"
              : index === 1
                ? "Confirmer la capacité disponible"
                : "Coordonner l'action avec les acteurs concernés",

          dueAt:
            new Date(
              now.getTime() +
              (index + 1) *
              2 *
              60 *
              60 *
              1000
            ).toISOString(),

          status:
            "a_faire"
        })),

    risks:
      recommendation.risks,

    nextReviewAt:
      new Date(
        now.getTime() +
        4 *
        60 *
        60 *
        1000
      ).toISOString()
  };
}


function findRelevantActors(
  state: ProductState,
  territory: Territory
): Actor[] {

  return state.actors.filter(
    (actor) =>
      actor.territoryIds.includes(
        territory.id
      )
  );
}


function findRisks(
  state: ProductState,
  territory: Territory
): string[] {

  const infrastructures =
    state.infrastructures.filter(
      (item) =>
        item.territoryId === territory.id &&
        item.status !== "operationnelle"
    );


  const risks: string[] = [];


  if (infrastructures.length > 0) {

    risks.push(
      `${infrastructures.length} capacité(s) opérationnelle(s) sous tension`
    );

  }


  return risks;
}