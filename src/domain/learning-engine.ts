import type {
  ProductState,
  Situation
} from "./types";


export interface LearningInsight {
  pattern: string;
  recommendation: string;
  confidence: "faible" | "moyenne" | "forte";
  evidence: string[];
}


export function generateLearningInsights(
  state: ProductState
): LearningInsight[] {

  const resolvedSituations =
    state.situations.filter(
      (item) =>
        item.status === "reglee"
    );


  const insights: LearningInsight[] = [];


  if (resolvedSituations.length === 0) {
    return insights;
  }


  const coordinationCount =
    state.coordinationSpaces.length;


  if (coordinationCount > 0) {

    insights.push({
      pattern:
        "Les situations nécessitant plusieurs acteurs sont traitées via une coordination structurée.",

      recommendation:
        "Proposer rapidement une coordination lorsqu'une situation implique plusieurs responsabilités.",

      confidence:
        "moyenne",

      evidence:
        resolvedSituations
          .slice(0, 5)
          .map(
            (item) =>
              `${item.reference} : ${item.title}`
          )
    });

  }


  const infrastructureIssues =
    resolvedSituations.filter(
      (item) =>
        item.title
          .toLowerCase()
          .includes("glace") ||
        item.description
          .toLowerCase()
          .includes("capacité")
    );


  if (infrastructureIssues.length > 0) {

    insights.push({
      pattern:
        "Les tensions d'infrastructure peuvent impacter la continuité opérationnelle.",

      recommendation:
        "Surveiller les capacités critiques avant les périodes de forte activité.",

      confidence:
        "forte",

      evidence:
        infrastructureIssues.map(
          (item) =>
            item.title
        )
    });

  }


  return insights;
}


export function generateSituationLearning(
  situation: Situation
): LearningInsight | null {

  if (
    situation.status !== "reglee" ||
    !situation.result
  ) {
    return null;
  }


  return {
    pattern:
      `La situation "${situation.title}" a été résolue avec un résultat enregistré.`,

    recommendation:
      situation.nextStep,

    confidence:
      "faible",

    evidence: [
      situation.result
    ]
  };
}