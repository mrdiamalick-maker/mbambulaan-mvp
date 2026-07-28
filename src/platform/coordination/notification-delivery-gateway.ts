import type { WorkNotification } from "./unified-work-orchestration-runtime";

export type NotificationDeliveryStatus = "prepared" | "submitted" | "delivered" | "failed";

export interface NotificationDeliveryAttempt {
  id: string;
  notificationId: string;
  channel: WorkNotification["channel"];
  recipientReference: string;
  providerReference?: string;
  status: NotificationDeliveryStatus;
  attemptNumber: number;
  preparedAt: string;
  submittedAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  nextRetryAt?: string;
  failureReason?: string;
}

export interface NotificationChannelAdapter {
  channel: WorkNotification["channel"];
  submit(input: { notification: WorkNotification; recipientReference: string }): Promise<{ providerReference: string }>;
}

export class NotificationDeliveryGateway {
  private readonly attempts: NotificationDeliveryAttempt[] = [];

  restore(attempts: NotificationDeliveryAttempt[]) {
    this.attempts.splice(0, this.attempts.length, ...structuredClone(attempts));
  }

  prepare(input: { notification: WorkNotification; recipientReference: string; at: string }) {
    if (input.notification.status !== "scheduled") throw new Error("Seule une notification planifiée peut être préparée.");
    if (!input.recipientReference.trim()) throw new Error("La référence du destinataire est obligatoire.");
    const previous = this.latestFor(input.notification.id, input.notification.channel);
    if (previous && ["prepared", "submitted", "delivered"].includes(previous.status)) return structuredClone(previous);
    if (previous?.nextRetryAt && Date.parse(input.at) < Date.parse(previous.nextRetryAt)) {
      throw new Error(`La prochaine tentative est planifiée à ${previous.nextRetryAt}.`);
    }
    const attemptNumber = (previous?.attemptNumber ?? 0) + 1;
    const attempt: NotificationDeliveryAttempt = {
      id: `delivery-${input.notification.id}-${input.notification.channel}-${attemptNumber}`,
      notificationId: input.notification.id,
      channel: input.notification.channel,
      recipientReference: input.recipientReference,
      status: "prepared",
      attemptNumber,
      preparedAt: input.at,
    };
    this.attempts.push(attempt);
    return structuredClone(attempt);
  }

  async submit(input: { attemptId: string; notification: WorkNotification; adapter: NotificationChannelAdapter; at: string; retryDelayMinutes?: number }) {
    const attempt = this.requireAttempt(input.attemptId);
    if (attempt.channel !== input.adapter.channel || attempt.notificationId !== input.notification.id) throw new Error("Le canal ou la notification ne correspond pas à la tentative.");
    if (attempt.status === "delivered" || attempt.status === "submitted") return structuredClone(attempt);
    try {
      const result = await input.adapter.submit({ notification: input.notification, recipientReference: attempt.recipientReference });
      attempt.providerReference = result.providerReference;
      attempt.status = "submitted";
      attempt.submittedAt = input.at;
      attempt.failureReason = undefined;
      attempt.nextRetryAt = undefined;
      return structuredClone(attempt);
    } catch (error) {
      attempt.status = "failed";
      attempt.failedAt = input.at;
      attempt.failureReason = error instanceof Error ? error.message : String(error);
      const baseDelay = input.retryDelayMinutes ?? 15;
      const delayMinutes = Math.min(24 * 60, baseDelay * 2 ** Math.max(0, attempt.attemptNumber - 1));
      attempt.nextRetryAt = new Date(Date.parse(input.at) + delayMinutes * 60_000).toISOString();
      return structuredClone(attempt);
    }
  }

  confirmDelivery(input: { attemptId: string; providerReference: string; deliveredAt: string }) {
    const attempt = this.requireAttempt(input.attemptId);
    if (attempt.status !== "submitted") throw new Error("Seule une tentative soumise peut être confirmée comme délivrée.");
    if (attempt.providerReference !== input.providerReference) throw new Error("La référence fournisseur ne correspond pas à la tentative.");
    attempt.status = "delivered";
    attempt.deliveredAt = input.deliveredAt;
    return structuredClone(attempt);
  }

  dueRetries(at: string) {
    const now = Date.parse(at);
    return structuredClone(this.attempts.filter((attempt) => attempt.status === "failed" && attempt.nextRetryAt && Date.parse(attempt.nextRetryAt) <= now));
  }

  snapshot() {
    return structuredClone({
      attempts: this.attempts,
      dueRetries: this.dueRetries(new Date().toISOString()),
      metrics: {
        preparedCount: this.attempts.filter((item) => item.status === "prepared").length,
        submittedCount: this.attempts.filter((item) => item.status === "submitted").length,
        deliveredCount: this.attempts.filter((item) => item.status === "delivered").length,
        failedCount: this.attempts.filter((item) => item.status === "failed").length,
        retryDueCount: this.dueRetries(new Date().toISOString()).length,
      },
    });
  }

  private latestFor(notificationId: string, channel: WorkNotification["channel"]) {
    return this.attempts
      .filter((attempt) => attempt.notificationId === notificationId && attempt.channel === channel)
      .sort((left, right) => right.attemptNumber - left.attemptNumber)[0];
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
