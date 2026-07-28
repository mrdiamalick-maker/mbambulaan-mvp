import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import type { EcosystemBusinessEvent, EcosystemBusinessEventDelivery } from "./ecosystem-business-event-bus";
import { getConfiguredEcosystemBusinessEventBus } from "./ecosystem-business-event-registry";
import { PostgresEcosystemBusinessEventRepository } from "./postgres-ecosystem-business-event-repository";

export class PersistentEcosystemBusinessEventService {
  private readonly bus = getConfiguredEcosystemBusinessEventBus();
  private readonly repository = new PostgresEcosystemBusinessEventRepository(getRuntimeSqlExecutor);
  private hydrated = false;

  async publish(event: EcosystemBusinessEvent, processedAt = new Date().toISOString()) {
    await this.hydrate();
    await this.repository.appendEvent(event);
    const snapshot = await this.bus.publish(event, processedAt);
    await this.persistLatestDeliveries(snapshot.deliveries, event.id);
    return snapshot;
  }

  async retry(input: { eventId: string; handlerName: string; processedAt?: string }) {
    await this.hydrate();
    const snapshot = await this.bus.retry(input.eventId, input.handlerName, input.processedAt ?? new Date().toISOString());
    await this.persistLatestDeliveries(snapshot.deliveries, input.eventId, input.handlerName);
    return snapshot;
  }

  async dueFailures(at = new Date().toISOString()) {
    await this.hydrate();
    return this.repository.listDueFailures(at);
  }

  async snapshot() {
    await this.hydrate();
    return this.bus.snapshot();
  }

  private async hydrate() {
    if (this.hydrated) return;
    const [events, deliveries] = await Promise.all([
      this.repository.listEvents(),
      this.repository.listDeliveries(),
    ]);
    this.bus.restore({ events, deliveries });
    this.hydrated = true;
  }

  private async persistLatestDeliveries(deliveries: EcosystemBusinessEventDelivery[], eventId: string, handlerName?: string) {
    const latest = new Map<string, EcosystemBusinessEventDelivery>();
    for (const delivery of deliveries) {
      if (delivery.eventId !== eventId || delivery.status === "ignored_duplicate") continue;
      if (handlerName && delivery.handlerName !== handlerName) continue;
      latest.set(delivery.handlerName, delivery);
    }
    for (const delivery of latest.values()) await this.repository.saveDelivery(delivery);
  }
}

const globalService = globalThis as typeof globalThis & { __mbPersistentBusinessEventService?: PersistentEcosystemBusinessEventService };
export function getPersistentEcosystemBusinessEventService() {
  globalService.__mbPersistentBusinessEventService ??= new PersistentEcosystemBusinessEventService();
  return globalService.__mbPersistentBusinessEventService;
}
