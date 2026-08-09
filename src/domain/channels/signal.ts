export type SignalChannel =
  | "whatsapp"
  | "whatsapp_business"
  | "sms"
  | "phone"
  | "application"
  | "field_agent"
  | "file_import"
  | "institution_report";


export type SignalStatus =
  | "received"
  | "processed"
  | "qualified"
  | "converted";


export interface Signal {

  id: string;

  channel: SignalChannel;

  status: SignalStatus;


  actorId?: string;

  organizationId?: string;

  territoryId?: string;


  content: string;


  receivedAt: string;


  metadata?: Record<string, string>;

}