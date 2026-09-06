import type {
  ProductState
} from "@/domain/types";


export interface InstitutionInsight {

  territoryId: string;

  territoryName: string;

  level:
    | "critique"
    | "attention"
    | "opportunite";

  title: string;

  explanation: string;

  action: string;

}


export function generateInstitutionInsights(
  state: ProductState
): InstitutionInsight[] {


  const insights: InstitutionInsight[] = [];


  state.situations
    .filter(
      (item) =>
        item.status !== "reglee"
    )
    .forEach(
      (situation)=>{

        const territory =
          state.territories.find(
            (item)=>
              item.id === situation.territoryId
          );


        if (!territory) return;


        insights.push({

          territoryId:
            territory.id,


          territoryName:
            territory.name,


          level:
            situation.priority === "critique"
              ? "critique"
              : "attention",


          title:
            situation.title,


          explanation:
            situation.description,


          action:
            situation.nextStep

        });

      }
    );


  return insights;

}