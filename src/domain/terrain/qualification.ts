import type {
  TerrainInteraction
} from "./interaction";


export interface QualifiedSignal {

  type:
    | "situation"
    | "request"
    | "information";


  category:
    | "operation"
    | "capacity"
    | "market"
    | "quality";


  summary: string;


  priority:
    | "low"
    | "medium"
    | "high";

}


export function qualifyInteraction(
  interaction: TerrainInteraction
): QualifiedSignal {


  const text =
    interaction.message.toLowerCase();


  if (
    text.includes("glace") ||
    text.includes("froid")
  ) {

    return {

      type:
        "situation",

      category:
        "capacity",

      summary:
        "Risque lié à la capacité froide.",

      priority:
        "high"

    };

  }


  if (
    text.includes("arrive") ||
    text.includes("retour")
  ) {

    return {

      type:
        "information",

      category:
        "operation",

      summary:
        "Retour ou activité attendue.",

      priority:
        "medium"

    };

  }


  return {

    type:
      "information",

    category:
      "operation",

    summary:
      "Information terrain reçue.",

    priority:
      "low"

  };

}