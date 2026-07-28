import type { WorkNotification } from "./unified-work-orchestration-runtime";

export type NotificationDeliveryStatus = "prepared" | "submitted" | "delivered" | "failed";

export interface NotificationDeliveryAttempt {
  id: string;
  notificationId: string;
  channel: WorkNotification["channel"];
  recipientReference: string;
  providerReference?: string;
  status: NotificationDeliveryStatus;
  preparedAt: string;
  submittedAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  failureReason?: string;
}

export interface NotificationChannelAdapter {
  channel: WorkNotification["channel"];
  submit(input: { notification: WorkNotification; recipientReference: string }): Promise<{ providerReference: string }>;
}

export class NotificationDeliveryGateway {
  private readonly attempts: NotificationDeliveryAttempt[] = [];

  prepare(input: { notification: WorkNotification; recipientReference: string; at: string }) {
    if (input.notification.status !== "scheduled") throw new Error("Seule une notification planifiée peut être préparée.");
    if (!input.recipientReference.trim()) throw new Error("La référence du destinataire est obligatoire.");
    const id = `delivery-${input.notification.id}-${input.notification.channel}`;
    const existing = this.attempts.find((attempt) => attempt.id === id);
    if (existing) return structuredClone(existing);
    const attempt: NotificationDeliveryAttempt = {
      id,
      notificationId: input.notification.id,
      channel: input.notification.channel,
      recipientReference: input.recipientReference,
      status: "prepared",
      preparedAt: input.at,
    };
    this.attempts.push(attempt);
    return structuredClone(attempt);
  }

  async submit(input: { attemptId: string; notification: WorkNotification; adapter: NotificationChannelAdapter; at: string }) {
    const attempt = this.requireAttempt(input.attemptId);
    if (attempt.channel !== input.adapter.channel || attempt.notificationId !== input.notification.id) throw new Error("Le canal ou la notification ne correspond pas à la tentative.");
    if (attempt.status === "delivered" || attempt.status === "submitted") return structuredClone(attempt);
    try {
      const result = await input.adapter.submit({ notification: input.notification, recipientReference: attempt.recipientReference });
      attempt.providerReference = result.providerReference;
      attempt.status = "submitted";
      attempt.submittedAt = input.at;
      return structuredClone(attempt);
    } catch (error) {
      attempt.status = "failed";
      attempt.failedAt = input.at;
      attempt.failureReason = error instanceof Error ? error.message : String(error);
      return structuredClone(attempt);
    }
  }

  confirmDelivery(input: { attemptId: string; providerReference: string; deliveredAt: string }) {
    const attempt = this.requireAttempt(input.attemptId);
    if (attempt.providerReference !== input.providerReference) throw new Error("La référence fournisseur ne correspond pas à la tentative.");
    attempt.status = "delivered";
    attempt.deliveredAt = input.deliveredAt;
    return structuredClone(attempt);
  }

  snapshot() {
    return structuredClone({
      attempts: this.attempts,
      metrics: {
        preparedCount: this.attempts.filter((item) => item.status === "prepared").length,
        submittedCount: this.attempts.filter((item) => item.status === "submitted").length,
        deliveredCount: this.attempts.filter((item) => item.status === "delivered").length,
        failedCount: this.attempts.filter((item) => item.status === "failed").length,
      },
    });
  }

  private requireAttempt(id: string) {
    const attempt = this.attempts.find((item) => item.id === id);
    if (!attempt) throw new Error(`Tentative de notification introuvable : ${id}.`);
    return attempt;
  }
}

const globalGateway = globalThis as typeof globalThis & { __mbNotificationDeliveryGateway?: NotificationDeliveryGateway };
export function getNotificationDeliveryGateway() {
  globalGateway.__mbNotificationDeliveryGateway ??= new NotificationDeliveryGateway();
  return globalGateway.__mbNotificationDeliveryGateway;
}
