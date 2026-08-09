export interface NotificationRule {

  event: string;

  targetRole: string;

  channel:
    | "whatsapp"
    | "sms"
    | "application"
    | "email";


  messageTemplate: string;

}


export const notificationRules: NotificationRule[] = [

  {
    event:
      "capacity_risk_detected",

    targetRole:
      "coordinateur",

    channel:
      "whatsapp",

    messageTemplate:
      "Une capacité critique nécessite votre attention."
  },


  {
    event:
      "coordination_started",

    targetRole:
      "participant",

    channel:
      "application",

    messageTemplate:
      "Une nouvelle coordination vous concerne."
  },


  {
    event:
      "landing_expected",

    targetRole:
      "operateur",

    channel:
      "whatsapp",

    messageTemplate:
      "Un débarquement est attendu sur votre territoire."
  }

];