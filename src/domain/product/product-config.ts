export type ProductEdition =
  | "pilot"
  | "professional"
  | "institutional";


export interface ProductConfig {

  edition: ProductEdition;


  modules: string[];


  maxUsers: number;


  territories: string[];

}


export const pilotConfig: ProductConfig = {

  edition:
    "pilot",

  modules:[
    "territory_intelligence",
    "coordination",
    "trust_network",
    "reporting",
    "whatsapp_gateway"
  ],

  maxUsers:
    50,

  territories:[
    "joal"
  ]

};