export interface WhatsAppScenario {

  trigger: string;

  response: string;

  action: string;

}


export const whatsappScenarios: WhatsAppScenario[] = [

  {
    trigger:
      "retour",

    response:
      "Votre retour a été enregistré.",

    action:
      "Mettre à jour l'activité terrain."
  },


  {
    trigger:
      "glace",

    response:
      "Votre besoin de capacité froide a été transmis.",

    action:
      "Créer une analyse de capacité."
  },


  {
    trigger:
      "incident",

    response:
      "Votre incident a été enregistré.",

    action:
      "Qualifier une situation."
  }

];