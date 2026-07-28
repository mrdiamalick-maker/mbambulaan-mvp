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

  async publish(event: EcosystemBusinessEvent, processedAt = new Date().toISOString()) {
    if (!event.id || !event.type || !event.correlationId || !event.entityId) throw new Error("L'événement métier est incomplet.");
    if (!event.territoryIds.length) throw new Error("Au moins un territoire est obligatoire.");
    if (!this.events.some((item) => item.id === event.id)) this.events.push(structuredClone(event));

    for (const handler of this.handlers.filter((item) => item.eventTypes.includes(event.type))) {
      const key = `${event.id}:${handler.name}`;
      if (this.processedKeys.has(key)) {
        this.deliveries.push({ eventId: event.id, handlerName: handler.name, status: "ignored_duplicate", attempts: 0, processedAt });
        continue;
      }
      const previousAttempts = this.deliveries.filter((item) => item.eventId === event.id && item.handlerName === handler.name).length;
      try {
        await handler.handle(structuredClone(event));
        this.processedKeys.add(key);
        this.deliveries.push({ eventId: event.id, handlerName: handler.name, status: "processed", attempts: previousAttempts + 1, processedAt });
      } catch (error) {
        this.deliveries.push({
          eventId: event.id,
          handlerName: handler.name,
          status: "failed",
          attempts: previousAttempts + 1,
          processedAt,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    return this.snapshot();
  }

  snapshot() {
    return structuredClone({
      events: this.events,
      deliveries: this.deliveries,
      subscriptions: this.handlers.map((item) => ({ name: item.name, eventTypes: item.eventTypes })),
      metrics: {
        eventCount: this.events.length,
        processedDeliveryCount: this.deliveries.filter((item) => item.status === "processed").length,
        failedDeliveryCount: this.deliveries.filter((item) => item.status === "failed").length,
        duplicateDeliveryCount: this.deliveries.filter((item) => item.status === "ignored_duplicate").length,
      },
    });
  }
}

const globalBus = globalThis as typeof globalThis & { __mbEcosystemBusinessEventBus?: EcosystemBusinessEventBus };
export function getEcosystemBusinessEventBus() {
  globalBus.__mbEcosystemBusinessEventBus ??= new EcosystemBusinessEventBus();
  return globalBus.__mbEcosystemBusinessEventBus;
}
