import type {
  ProductState
} from "@/domain/types";


export interface OperationalReport {

  title: string;

  generatedAt: string;

  summary: string;

  indicators: string[];

}


export function generateOperationalReport(
  state: ProductState
): OperationalReport {


  return {

    title:
      "Rapport opérationnel Mbàmbulaan",


    generatedAt:
      new Date().toISOString(),


    summary:
      "Synthèse automatique des activités et coordinations en cours.",


    indicators: [

      `${state.situations.length} situations suivies`,

      `${state.coordinationSpaces.length} coordinations créées`,

      `${state.landings.length} débarquements documentés`

    ]

  };

}