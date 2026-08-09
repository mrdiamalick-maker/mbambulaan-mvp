import type {
  ChannelMessage
} from "./message";


export interface WhatsAppPayload {

  from: string;

  text: string;

  timestamp: string;

}


export function parseWhatsAppMessage(
  payload: WhatsAppPayload
): ChannelMessage {


  return {

    id:
      `wa-${Date.now()}`,

    channel:
      "whatsapp_business",

    direction:
      "incoming",

    sender:
      payload.from,

    content:
      payload.text,

    receivedAt:
      payload.timestamp

  };

}