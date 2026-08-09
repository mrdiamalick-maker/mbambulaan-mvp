export type NotificationChannel =
  | "whatsapp"
  | "sms"
  | "application"
  | "email";


export type NotificationPriority =
  | "low"
  | "medium"
  | "high";


export interface Notification {

  id: string;

  recipientId: string;

  channel: NotificationChannel;

  priority: NotificationPriority;

  title: string;

  message: string;

  createdAt: string;

  read: boolean;
}