import type { ProductState } from "@/domain/types";

import type {
  PilotIndicator
} from "./pilot";


export function generatePilotIndicators(
  state: ProductState
): PilotIndicator[] {


  return [

    {
      name:
        "Acteurs connectés",

      target:
        100,

      current:
        state.actors.length,

      unit:
        "acteurs"
    },


    {
      name:
        "Situations suivies",

      target:
        50,

      current:
        state.situations.length,

      unit:
        "situations"
    },


    {
      name:
        "Coordinations réalisées",

      target:
        20,

      current:
        state.coordinationSpaces.length,

      unit:
        "coordinations"
    },


    {
      name:
        "Débarquements documentés",

      target:
        100,

      current:
        state.landings.length,

      unit:
        "débarquements"
    }

  ];

}