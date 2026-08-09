import type { CopilotRecommendation } from "@/domain/copilot/copilot-engine";
import type { RecommendedAction } from "./action";


export function createActionsFromRecommendation(
  recommendation: CopilotRecommendation
): RecommendedAction[] {


  if (recommendation.priority === "high") {

    return [
      {
        id: `action-${Date.now()}`,
        type: "create_coordination",
        title: "Créer une coordination opérationnelle",
        description: recommendation.action,
        targetActorIds: [],
        status: "suggested"
      }
    ];

  }


  return [
    {
      id: `action-${Date.now()}`,
      type: "verify_information",
      title: "Vérifier l'information",
      description: recommendation.action,
      targetActorIds: [],
      status: "suggested"
    }
  ];

}