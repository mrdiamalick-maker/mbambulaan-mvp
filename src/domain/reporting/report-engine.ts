import type {
  ProductState
} from "@/domain/types";

import type {
  Report,
  ReportType
} from "./report";


export function generateReport(
  state: ProductState,
  type: ReportType
): Report {


  return {

    id:
      `report-${Date.now()}`,

    type,


    title:
      getTitle(type),


    period:
      "Période actuelle",


    generatedAt:
      new Date().toISOString(),


    indicators:[

      {
        label:
          "Situations suivies",

        value:
          String(state.situations.length),

        source:
          "Mbàmbulaan Core"
      },


      {
        label:
          "Coordinations",

        value:
          String(state.coordinationSpaces.length),

        source:
          "Coordination Engine"
      },


      {
        label:
          "Acteurs",

        value:
          String(state.actors.length),

        source:
          "Réseau de confiance"
      }

    ]

  };

}


function getTitle(
  type: ReportType
){

  switch(type){

    case "territory":
      return "Rapport territorial Mbàmbulaan";

    case "organization":
      return "Rapport organisation";

    case "institutional":
      return "Rapport institutionnel";

    default:
      return "Rapport opérationnel";

  }

}
