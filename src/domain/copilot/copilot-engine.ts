import type {
  CopilotContext
} from "./context";


export interface CopilotRecommendation {

  title: string;

  explanation: string;

  action: string;

  priority:
    | "low"
    | "medium"
    | "high";

}


export function generateRecommendation(
  context: CopilotContext
): CopilotRecommendation {


  if(context.risks.length > 0){

    return {

      title:
        context.risks[0],

      explanation:
        "Une situation critique nécessite une coordination rapide.",

      action:
        "Analyser les acteurs disponibles et lancer une réponse coordonnée.",

      priority:
        "high"

    };

  }


  if(context.opportunities > 0){

    return {

      title:
        "Opportunité détectée",

      explanation:
        "Des signaux marché peuvent être valorisés.",

      action:
        "Analyser les acteurs capables de répondre.",

      priority:
        "medium"

    };

  }


  return {

    title:
      "Territoire sous surveillance",

    explanation:
      "Aucune action critique détectée.",

    action:
      "Maintenir la veille opérationnelle.",

    priority:
      "low"

  };

}