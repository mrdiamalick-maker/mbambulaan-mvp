import { createHash, randomUUID } from "node:crypto";
import type { NotificationChannelAdapter } from "./notification-delivery-gateway";
import type { WorkNotification } from "./unified-work-orchestration-runtime";

export interface NotificationProviderConfiguration {
  providerCode: string;
  endpoint?: string;
  apiKey?: string;
  senderReference?: string;
  enabled: boolean;
  simulationMode: boolean;
}

export interface NotificationProviderTransport {
  post(input: { endpoint: string; headers: Record<string, string>; payload: Record<string, unknown> }): Promise<{ providerReference: string }>;
}

export class FetchNotificationProviderTransport implements NotificationProviderTransport {
  async post(input: { endpoint: string; headers: Record<string, string>; payload: Record<string, unknown> }) {
    const response = await fetch(input.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", ...input.headers },
      body: JSON.stringify(input.payload),
    });
    if (!response.ok) throw new Error(`Le fournisseur de notification a répondu ${response.status}.`);
    const body = await response.json().catch(() => ({})) as { id?: string; reference?: string };
    return { providerReference: body.id ?? body.reference ?? response.headers.get("x-provider-reference") ?? randomUUID() };
  }
}

abstract class ConfiguredNotificationAdapter implements NotificationChannelAdapter {
  abstract readonly channel: WorkNotification["channel"];

  constructor(
    protected readonly configuration: NotificationProviderConfiguration,
    private readonly transport: NotificationProviderTransport = new FetchNotificationProviderTransport(),
  ) {}

  async submit(input: { notification: WorkNotification; recipientReference: string }) {
    if (!this.configuration.enabled) throw new Error(`Le fournisseur ${this.configuration.providerCode} est désactivé.`);
    if (this.configuration.simulationMode) {
      const digest = createHash("sha256")
        .update(`${this.configuration.providerCode}:${input.notification.id}:${input.recipientReference}`)
        .digest("hex")
        .slice(0, 24);
      return { providerReference: `sim-${this.configuration.providerCode}-${digest}` };
    }
    if (!this.configuration.endpoint || !this.configuration.apiKey) throw new Error(`La configuration du fournisseur ${this.configuration.providerCode} est incomplète.`);
    return this.transport.post({
      endpoint: this.configuration.endpoint,
      headers: { authorization: `Bearer ${this.configuration.apiKey}` },
      payload: this.payload(input.notification, input.recipientReference),
    });
  }

  protected payload(notification: WorkNotification, recipientReference: string): Record<string, unknown> {
    return {
      recipient: recipientReference,
      sender: this.configuration.senderReference,
      message: notification.message,
      notificationId: notification.id,
      workItemId: notification.workItemId,
    };
  }
}

export class InAppNotificationAdapter extends ConfiguredNotificationAdapter {
  readonly channel = "in_app" as const;
}

export class EmailNotificationAdapter extends ConfiguredNotificationAdapter {
  readonly channel = "email" as const;
}

export class SmsNotificationAdapter extends ConfiguredNotificationAdapter {
  readonly channel = "sms" as const;
}

export class WhatsAppNotificationAdapter extends ConfiguredNotificationAdapter {
  readonly channel = "whatsapp" as const;
}

export class NotificationProviderAdapterRegistry {
  private readonly adapters = new Map<WorkNotification["channel"], NotificationChannelAdapter>();

  register(adapter: NotificationChannelAdapter) {
    this.adapters.set(adapter.channel, adapter);
  }

  require(channel: WorkNotification["channel"]) {
    const adapter = this.adapters.get(channel);
    if (!adapter) throw new Error(`Aucun fournisseur n'est configuré pour le canal ${channel}.`);
    return adapter;
  }
}
