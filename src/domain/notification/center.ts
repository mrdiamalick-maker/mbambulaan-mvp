export type NotificationChannel =
  | "whatsapp_business"
  | "sms"
  | "application"
  | "email";


export type NotificationStatus =
  | "created"
  | "sent"
  | "delivered"
  | "read"
  | "acknowledged";


export interface MbNotification {

  id: string;


  recipientId: string;


  channel: NotificationChannel;


  title: string;


  message: string;


  status: NotificationStatus;


  createdAt: string;


  relatedWorkflowId?: string;

}