import type { ProductState } from "./types";


export interface CopilotInsight {
  question: string;
  answer: string;
  priority: "faible" | "moyenne" | "forte";
  evidence: string[];
}


export function generateCopilotInsights(
  state: ProductState
): CopilotInsight[] {

  const insights: CopilotInsight[] = [];


  const criticalSituations =
    state.situations.filter(
      (item) =>
        item.priority === "critique" &&
        item.status !== "reglee"
    );


  if (criticalSituations.length > 0) {

    insights.push({
      question:
        "Quelle est la priorité actuelle ?",

      answer:
        `${criticalSituations[0].title}. Action recommandée : ${criticalSituations[0].nextStep}`,

      priority:
        "forte",

      evidence:
        criticalSituations.map(
          (item) =>
            item.reference
        )
    });

  }


  const activeCoordinations =
    state.coordinationSpaces.filter(
      (space) =>
        space.commitments.some(
          (item) =>
            item.status !== "terminee"
        )
    );


  if (activeCoordinations.length > 0) {

    insights.push({
      question:
        "Quelles coordinations sont en cours ?",

      answer:
        `${activeCoordinations.length} coordination(s) nécessitent un suivi.`,

      priority:
        "moyenne",

      evidence:
        activeCoordinations.map(
          (item) =>
            item.title
        )
    });

  }


  insights.push({
    question:
      "Quelle valeur est suivie ?",

    answer:
      `${state.landings.length} débarquement(s) documenté(s) et ${state.opportunities.length} opportunité(s) identifiée(s).`,

    priority:
      "faible",

    evidence:
      [
        "Données opérationnelles Mbàmbulaan"
      ]
  });


  return insights;
}