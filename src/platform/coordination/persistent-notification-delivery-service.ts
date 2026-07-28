import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { NotificationDeliveryGateway, type NotificationChannelAdapter } from "./notification-delivery-gateway";
import { PostgresNotificationDeliveryRepository, type NotificationContactPoint } from "./postgres-notification-delivery-repository";
import type { WorkNotification } from "./unified-work-orchestration-runtime";

export class PersistentNotificationDeliveryService {
  private readonly gateway = new NotificationDeliveryGateway();
  private readonly repository = new PostgresNotificationDeliveryRepository(getRuntimeSqlExecutor);
  private hydrated = false;

  async upsertContact(contact: NotificationContactPoint) {
    return this.repository.upsertContact(contact);
  }

  async prepare(input: { notification: WorkNotification; territoryId: string; at: string }) {
    await this.hydrate();
    const contact = await this.repository.resolveContact({
      actorId: input.notification.recipientActorId,
      organizationId: input.notification.recipientOrganizationId,
      territoryId: input.territoryId,
      channel: input.notification.channel,
    });
    if (!contact) throw new Error(`Aucune coordonnée active pour ${input.notification.recipientOrganizationId} sur le canal ${input.notification.channel}.`);
    if (input.notification.channel !== "in_app" && !contact.verifiedAt) throw new Error("La coordonnée doit être vérifiée avant tout envoi externe.");
    const attempt = this.gateway.prepare({ notification: input.notification, recipientReference: contact.recipientReference, at: input.at });
    await this.repository.saveAttempt(attempt);
    return attempt;
  }

  async submit(input: { attemptId: string; notification: WorkNotification; adapter: NotificationChannelAdapter; at: string; retryDelayMinutes?: number }) {
    await this.hydrate();
    const attempt = await this.gateway.submit(input);
    await this.repository.saveAttempt(attempt);
    return attempt;
  }

  async confirmDelivery(input: { attemptId: string; providerReference: string; deliveredAt: string }) {
    await this.hydrate();
    const attempt = this.gateway.confirmDelivery(input);
    await this.repository.saveAttempt(attempt);
    return attempt;
  }

  async dueRetries(at: string) {
    await this.hydrate();
    return this.gateway.dueRetries(at);
  }

  async snapshot() {
    await this.hydrate();
    return this.gateway.snapshot();
  }

  private async hydrate() {
    if (this.hydrated) return;
    this.gateway.restore(await this.repository.listAttempts());
    this.hydrated = true;
  }
}

const globalService = globalThis as typeof globalThis & { __mbPersistentNotificationDeliveryService?: PersistentNotificationDeliveryService };
export function getPersistentNotificationDeliveryService() {
  globalService.__mbPersistentNotificationDeliveryService ??= new PersistentNotificationDeliveryService();
  return globalService.__mbPersistentNotificationDeliveryService;
}
