export type MessageChannel =
  | "whatsapp_business"
  | "sms"
  | "phone"
  | "application";


export type MessageDirection =
  | "incoming"
  | "outgoing";


export interface ChannelMessage {

  id: string;

  channel: MessageChannel;


  direction: MessageDirection;


  sender?: string;

  recipient?: string;


  content: string;


  receivedAt: string;


  metadata?: Record<string,string>;

}