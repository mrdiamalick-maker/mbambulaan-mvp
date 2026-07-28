export type EcosystemBusinessEventType =
  | "commerce.delivery.confirmed"
  | "commerce.incident.reported"
  | "finance.payment.confirmed"
  | "finance.adjustment.approved"
  | "contracts.contract.registered"
  | "contracts.obligation.breached"
  | "identity.mandate.activated"
  | "governance.decision.recorded"
  | "crisis.recovery.recorded"
  | "crisis.situation.reported"
  | "documents.requirement.missing"
  | "coordination.work.completed"
  | "coordination.notification.failed";

export interface EcosystemBusinessEvent {
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
  payload: Record<string, unknown>;
}

export type EcosystemBusinessEventDeliveryStatus = "delivered" | "failed" | "ignored_duplicate";

export interface EcosystemBusinessEventDelivery {
  eventId: string;
  handlerName: string;
  status: EcosystemBusinessEventDeliveryStatus;
  attempts: number;
  processedAt: string;
  nextRetryAt?: string;
  error?: string;
}

export interface EcosystemBusinessEventHandler {
  name: string;
  eventTypes: EcosystemBusinessEventType[];
  handle(event: EcosystemBusinessEvent): Promise<void> | void;
}

export interface EcosystemBusinessEventSnapshot {
  events: EcosystemBusinessEvent[];
  deliveries: EcosystemBusinessEventDelivery[];
  deadLetters: EcosystemBusinessEventDelivery[];
}

function retryAt(processedAt: string, attempts: number) {
  const delaySeconds = Math.min(3600, 30 * 2 ** Math.max(0, attempts - 1));
  return new Date(new Date(processedAt).getTime() + delaySeconds * 1000).toISOString();
}

export class EcosystemBusinessEventBus {
  private readonly handlers = new Map<string, EcosystemBusinessEventHandler>();
  private readonly events = new Map<string, EcosystemBusinessEvent>();
  private readonly deliveries: EcosystemBusinessEventDelivery[] = [];

  subscribe(handler: EcosystemBusinessEventHandler) {
    this.handlers.set(handler.name, handler);
  }

  async publish(event: EcosystemBusinessEvent, processedAt = new Date().toISOString()) {
    if (this.events.has(event.id)) {
      for (const handler of this.handlers.values()) {
        if (!handler.eventTypes.includes(event.type)) continue;
        this.deliveries.push({
          eventId: event.id,
          handlerName: handler.name,
          status: "ignored_duplicate",
          attempts: this.latestDelivery(event.id, handler.name)?.attempts ?? 0,
          processedAt,
        });
      }
      return this.snapshot();
    }

    this.events.set(event.id, event);
    for (const handler of this.handlers.values()) {
      if (!handler.eventTypes.includes(event.type)) continue;
      await this.deliver(event, handler, processedAt);
    }
    return this.snapshot();
  }

  async retry(eventId: string, handlerName: string, processedAt = new Date().toISOString()) {
    const event = this.events.get(eventId);
    if (!event) throw new Error(`Événement métier introuvable : ${eventId}.`);
    const handler = this.handlers.get(handlerName);
    if (!handler) throw new Error(`Abonné métier introuvable : ${handlerName}.`);
    if (!handler.eventTypes.includes(event.type)) throw new Error(`L'abonné ${handlerName} ne traite pas ${event.type}.`);
    await this.deliver(event, handler, processedAt);
    return this.snapshot();
  }

  restore(input: { events: EcosystemBusinessEvent[]; deliveries: EcosystemBusinessEventDelivery[] }) {
    this.events.clear();
    this.deliveries.length = 0;
    for (const event of input.events) this.events.set(event.id, event);
    this.deliveries.push(...input.deliveries);
  }

  snapshot(): EcosystemBusinessEventSnapshot {
    const events = [...this.events.values()].sort((left, right) => left.occurredAt.localeCompare(right.occurredAt) || left.id.localeCompare(right.id));
    const deliveries = [...this.deliveries];
    const latest = new Map<string, EcosystemBusinessEventDelivery>();
    for (const delivery of deliveries) latest.set(`${delivery.eventId}:${delivery.handlerName}`, delivery);
    const deadLetters = [...latest.values()].filter((delivery) => delivery.status === "failed");
    return { events, deliveries, deadLetters };
  }

  private latestDelivery(eventId: string, handlerName: string) {
    for (let index = this.deliveries.length - 1; index >= 0; index -= 1) {
      const delivery = this.deliveries[index];
      if (delivery.eventId === eventId && delivery.handlerName === handlerName) return delivery;
    }
    return undefined;
  }

  private async deliver(event: EcosystemBusinessEvent, handler: EcosystemBusinessEventHandler, processedAt: string) {
    const attempts = (this.latestDelivery(event.id, handler.name)?.attempts ?? 0) + 1;
    try {
      await handler.handle(event);
      this.deliveries.push({ eventId: event.id, handlerName: handler.name, status: "delivered", attempts, processedAt });
    } catch (error) {
      this.deliveries.push({
        eventId: event.id,
        handlerName: handler.name,
        status: "failed",
        attempts,
        processedAt,
        nextRetryAt: retryAt(processedAt, attempts),
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

const globalBus = globalThis as typeof globalThis & { __mbEcosystemBusinessEventBus?: EcosystemBusinessEventBus };

export function getEcosystemBusinessEventBus() {
  globalBus.__mbEcosystemBusinessEventBus ??= new EcosystemBusinessEventBus();
  return globalBus.__mbEcosystemBusinessEventBus;
}
