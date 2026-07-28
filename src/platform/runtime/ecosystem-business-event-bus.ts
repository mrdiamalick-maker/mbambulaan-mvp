export type EcosystemBusinessEventType =
  | "commerce.delivery.confirmed"
  | "finance.payment.confirmed"
  | "contracts.contract.registered"
  | "identity.mandate.activated"
  | "crisis.recovery.recorded"
  | "documents.requirement.missing"
  | "coordination.work.completed"
  | "coordination.notification.failed";

export interface EcosystemBusinessEvent<TPayload = Record<string, unknown>> {
  id: string;
  type: EcosystemBusinessEventType;
  occurredAt: string;
  correlationId: string;
  causationId?: string;
  actorId: string;
  organizationId: string;
  territoryIds: string[];
  entityType: string;
  entityId: string;
  payload: TPayload;
}

export interface EcosystemBusinessEventHandler {
  name: string;
  eventTypes: EcosystemBusinessEventType[];
  handle(event: EcosystemBusinessEvent): Promise<void> | void;
}

export interface EcosystemBusinessEventDelivery {
  eventId: string;
  handlerName: string;
  status: "processed" | "failed" | "ignored_duplicate";
  attempts: number;
  processedAt: string;
  nextRetryAt?: string;
  error?: string;
}

export class EcosystemBusinessEventBus {
  private readonly handlers: EcosystemBusinessEventHandler[] = [];
  private readonly events: EcosystemBusinessEvent[] = [];
  private readonly deliveries: EcosystemBusinessEventDelivery[] = [];
  private readonly processedKeys = new Set<string>();

  subscribe(handler: EcosystemBusinessEventHandler) {
    if (this.handlers.some((item) => item.name === handler.name)) throw new Error(`Abonnement déjà enregistré : ${handler.name}.`);
    this.handlers.push(handler);
  }

  restore(input: { events: EcosystemBusinessEvent[]; deliveries: EcosystemBusinessEventDelivery[] }) {
    this.events.splice(0, this.events.length, ...structuredClone(input.events));
    this.deliveries.splice(0, this.deliveries.length, ...structuredClone(input.deliveries));
    this.processedKeys.clear();
    for (const delivery of input.deliveries) {
      if (delivery.status === "processed") this.processedKeys.add(`${delivery.eventId}:${delivery.handlerName}`);
    }
  }

  async publish(event: EcosystemBusinessEvent, processedAt = new Date().toISOString()) {
    this.validateEvent(event);
    if (!this.events.some((item) => item.id === event.id)) this.events.push(structuredClone(event));
    for (const handler of this.handlers.filter((item) => item.eventTypes.includes(event.type))) {
      await this.deliver(event, handler, processedAt);
    }
    return this.snapshot();
  }

  async retry(eventId: string, handlerName: string, processedAt = new Date().toISOString()) {
    const event = this.events.find((item) => item.id === eventId);
    if (!event) throw new Error(`Événement métier introuvable : ${eventId}.`);
    const handler = this.handlers.find((item) => item.name === handlerName && item.eventTypes.includes(event.type));
    if (!handler) throw new Error(`Abonné métier introuvable : ${handlerName}.`);
    this.processedKeys.delete(`${eventId}:${handlerName}`);
    await this.deliver(event, handler, processedAt, true);
    return this.snapshot();
  }

  snapshot() {
    return structuredClone({
      events: this.events,
      deliveries: this.deliveries,
      deadLetters: this.latestDeliveries().filter((item) => item.status === "failed"),
      subscriptions: this.handlers.map((item) => ({ name: item.name, eventTypes: item.eventTypes })),
      metrics: {
        eventCount: this.events.length,
        processedDeliveryCount: this.latestDeliveries().filter((item) => item.status === "processed").length,
        failedDeliveryCount: this.latestDeliveries().filter((item) => item.status === "failed").length,
        duplicateDeliveryCount: this.deliveries.filter((item) => item.status === "ignored_duplicate").length,
      },
    });
  }

  private async deliver(event: EcosystemBusinessEvent, handler: EcosystemBusinessEventHandler, processedAt: string, force = false) {
    const key = `${event.id}:${handler.name}`;
    if (!force && this.processedKeys.has(key)) {
      this.deliveries.push({ eventId: event.id, handlerName: handler.name, status: "ignored_duplicate", attempts: 0, processedAt });
      return;
    }
    const previousAttempts = this.deliveries
      .filter((item) => item.eventId === event.id && item.handlerName === handler.name && item.status !== "ignored_duplicate")
      .reduce((maximum, item) => Math.max(maximum, item.attempts), 0);
    try {
      await handler.handle(structuredClone(event));
      this.processedKeys.add(key);
      this.deliveries.push({ eventId: event.id, handlerName: handler.name, status: "processed", attempts: previousAttempts + 1, processedAt });
    } catch (error) {
      const attempts = previousAttempts + 1;
      const retryMinutes = Math.min(24 * 60, 5 * 2 ** Math.max(0, attempts - 1));
      this.deliveries.push({
        eventId: event.id,
        handlerName: handler.name,
        status: "failed",
        attempts,
        processedAt,
        nextRetryAt: new Date(Date.parse(processedAt) + retryMinutes * 60_000).toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private latestDeliveries() {
    const latest = new Map<string, EcosystemBusinessEventDelivery>();
    for (const delivery of this.deliveries) {
      if (delivery.status === "ignored_duplicate") continue;
      latest.set(`${delivery.eventId}:${delivery.handlerName}`, delivery);
    }
    return Array.from(latest.values());
  }

  private validateEvent(event: EcosystemBusinessEvent) {
    if (!event.id || !event.type || !event.correlationId || !event.entityId) throw new Error("L'événement métier est incomplet.");
    if (!event.territoryIds.length) throw new Error("Au moins un territoire est obligatoire.");
  }
}

const globalBus = globalThis as typeof globalThis & { __mbEcosystemBusinessEventBus?: EcosystemBusinessEventBus };
export function getEcosystemBusinessEventBus() {
  globalBus.__mbEcosystemBusinessEventBus ??= new EcosystemBusinessEventBus();
  return globalBus.__mbEcosystemBusinessEventBus;
}
