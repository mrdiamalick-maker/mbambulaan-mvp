import type {
  BusinessEvent
} from "@/domain/events/event";

import type {
  Notification
} from "@/domain/events/notification";

import {
  notificationRules
} from "./notification-rules";


export function generateNotifications(
  event: BusinessEvent,
  recipientId: string
): Notification[] {


  const rules =
    notificationRules.filter(
      (rule) =>
        rule.event === event.type
    );


  return rules.map(
    (rule, index) => ({

      id:
        `notif-${Date.now()}-${index}`,

      recipientId,

      channel:
        rule.channel,

      priority:
        "medium",

      title:
        "Nouvelle action Mbàmbulaan",

      message:
        rule.messageTemplate,

      createdAt:
        new Date().toISOString(),

      read:
        false
    })
  );

}