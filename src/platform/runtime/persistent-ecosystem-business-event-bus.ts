import { getRuntimeSqlExecutor } from "@/platform/persistence/postgres-runtime-pool";
import { EcosystemBusinessEventBus, type EcosystemBusinessEvent } from "./ecosystem-business-event-bus";
import { buildDefaultBusinessEventHandlers } from "./ecosystem-business-event-handlers";
import { PostgresEcosystemBusinessEventRepository } from "./postgres-ecosystem-business-event-repository";

export class PersistentEcosystemBusinessEventBus {
  private readonly bus = new EcosystemBusinessEventBus();
  private readonly repository = new PostgresEcosystemBusinessEventRepository(getRuntimeSqlExecutor);
  private initialized = false;
  private hydrated = false;

  async publish(event: EcosystemBusinessEvent, processedAt = new Date().toISOString()) {
    await this.hydrate();
    await this.repository.appendEvent(event);
    const before = this.bus.snapshot().deliveries.length;
    const snapshot = await this.bus.publish(event, processedAt);
    for (const delivery of snapshot.deliveries.slice(before)) await this.repository.saveDelivery(delivery);
    return snapshot;
  }

  async retry(eventId: string, handlerName: string, processedAt = new Date().toISOString()) {
    await this.hydrate();
    const before = this.bus.snapshot().deliveries.length;
    const snapshot = await this.bus.retry(eventId, handlerName, processedAt);
    for (const delivery of snapshot.deliveries.slice(before)) await this.repository.saveDelivery(delivery);
    return snapshot;
  }

  async retryDue(at = new Date().toISOString()) {
    await this.hydrate();
    const results = [];
    for (const item of await this.repository.listDueFailures(at)) {
      results.push(await this.retry(item.eventId, item.handlerName, at));
    }
    return { retriedCount: results.length, snapshot: this.bus.snapshot() };
  }

  async snapshot() {
    await this.hydrate();
    return this.bus.snapshot();
  }

  private async hydrate() {
    if (!this.initialized) {
      for (const handler of buildDefaultBusinessEventHandlers()) this.bus.subscribe(handler);
      this.initialized = true;
    }
    if (this.hydrated) return;
    this.bus.restore({
      events: await this.repository.listEvents(),
      deliveries: await this.repository.listDeliveries(),
    });
    this.hydrated = true;
  }
}

const globalPersistentBus = globalThis as typeof globalThis & {
  __mbPersistentEcosystemBusinessEventBus?: PersistentEcosystemBusinessEventBus;
};

export function getPersistentEcosystemBusinessEventBus() {
  globalPersistentBus.__mbPersistentEcosystemBusinessEventBus ??= new PersistentEcosystemBusinessEventBus();
  return globalPersistentBus.__mbPersistentEcosystemBusinessEventBus;
}
