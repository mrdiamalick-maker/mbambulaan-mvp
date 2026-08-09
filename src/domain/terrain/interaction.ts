export type InteractionType =
  | "arrival"
  | "need"
  | "incident"
  | "availability"
  | "request"
  | "information";


export interface TerrainInteraction {

  id: string;


  actorId?: string;


  territoryId?: string;


  type: InteractionType;


  channel:
    | "whatsapp_business"
    | "phone"
    | "sms"
    | "agent";


  message: string;


  createdAt: string;


  processed: boolean;

}