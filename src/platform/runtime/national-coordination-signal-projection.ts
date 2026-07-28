import type { EcosystemBusinessEvent } from "./ecosystem-business-event-bus";

export interface NationalCoordinationSignal {
  id: string;
  correlationId: string;
  eventType: EcosystemBusinessEvent["type"];
  territoryIds: string[];
  organizationId: string;
  entityType: string;
  entityId: string;
  severity: "information" | "attention" | "critical";
  title: string;
  summary: string;
  valueXof?: number;
  quantityKg?: number;
  occurredAt: string;
  status: "open" | "resolved";
}

export class NationalCoordinationSignalProjection {
  private readonly signals: NationalCoordinationSignal[] = [];

  project(event: EcosystemBusinessEvent) {
    const signal = this.toSignal(event);
    if (!signal) return undefined;
    const existing = this.signals.find((item) => item.id === signal.id);
    if (existing) return structuredClone(existing);
    this.signals.push(signal);
    return structuredClone(signal);
  }

  resolveByCorrelation(correlationId: string) {
    for (const signal of this.signals) {
      if (signal.correlationId === correlationId) signal.status = "resolved";
    }
  }

  snapshot(input?: { territoryId?: string; correlationId?: string }) {
    const filtered = this.signals.filter((signal) =>
      (!input?.territoryId || signal.territoryIds.includes(input.territoryId) || signal.territoryIds.includes("territory-national"))
      && (!input?.correlationId || signal.correlationId === input.correlationId),
    );
    return structuredClone({
      signals: filtered,
      metrics: {
        openCount: filtered.filter((item) => item.status === "open").length,
        criticalCount: filtered.filter((item) => item.status === "open" && item.severity === "critical").length,
        affectedTerritoryCount: new Set(filtered.flatMap((item) => item.territoryIds)).size,
        exposedValueXof: filtered.reduce((total, item) => total + (item.valueXof ?? 0), 0),
        exposedQuantityKg: filtered.reduce((total, item) => total + (item.quantityKg ?? 0), 0),
      },
    });
  }

  private toSignal(event: EcosystemBusinessEvent): NationalCoordinationSignal | undefined {
    const base = {
      id: `national-signal-${event.id}`,
      correlationId: event.correlationId,
      eventType: event.type,
      territoryIds: [...event.territoryIds],
      organizationId: event.organizationId,
      entityType: event.entityType,
      entityId: event.entityId,
      occurredAt: event.occurredAt,
      status: "open" as const,
      valueXof: numberValue(event.payload.valueXof ?? event.payload.exposedValueXof ?? event.payload.authorizedAmountXof),
      quantityKg: numberValue(event.payload.quantityKg ?? event.payload.affectedQuantityKg ?? event.payload.exposedVolumeKg),
    };

    switch (event.type) {
      case "commerce.incident.reported":
        return { ...base, severity: event.payload.critical === true ? "critical" : "attention", title: "Incident commercial signalé", summary: String(event.payload.summary ?? "Un incident commercial nécessite une coordination.") };
      case "contracts.obligation.breached":
        return { ...base, severity: "critical", title: "Obligation contractuelle non respectée", summary: String(event.payload.summary ?? "Une obligation contractuelle est en rupture.") };
      case "crisis.situation.reported":
        return { ...base, severity: "critical", title: "Situation de crise signalée", summary: String(event.payload.summary ?? "Une situation de crise affecte la continuité de la filière.") };
      case "documents.requirement.missing":
        return { ...base, severity: event.payload.priority === "critical" ? "critical" : "attention", title: "Document obligatoire manquant", summary: String(event.payload.title ?? "Une pièce obligatoire bloque le parcours.") };
      case "coordination.notification.failed":
        return { ...base, severity: "attention", title: "Notification non délivrée", summary: String(event.payload.title ?? "Un acteur n'a pas pu être joint.") };
      case "finance.adjustment.approved":
        return { ...base, severity: "information", title: "Ajustement financier approuvé", summary: String(event.payload.summary ?? "Un ajustement financier contractuel a été approuvé.") };
      case "governance.decision.recorded":
        return { ...base, severity: "information", title: "Décision de gouvernance enregistrée", summary: String(event.payload.summary ?? "Une décision de gouvernance a été enregistrée.") };
      default:
        return undefined;
    }
  }
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

const globalProjection = globalThis as typeof globalThis & { __mbNationalCoordinationSignals?: NationalCoordinationSignalProjection };
export function getNationalCoordinationSignalProjection() {
  globalProjection.__mbNationalCoordinationSignals ??= new NationalCoordinationSignalProjection();
  return globalProjection.__mbNationalCoordinationSignals;
}
