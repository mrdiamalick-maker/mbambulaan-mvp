import type { KnowledgeSource, KnowledgeSourceType } from "./sector-learning-runtime";

export interface SectorBusinessEvent {
  id: string;
  eventType: string;
  aggregateId: string;
  territoryId: string;
  actorId: string;
  occurredAt: string;
  evidenceIds: string[];
  confidenceScore?: number;
  payload: Record<string, unknown>;
}

const sourceTypes: Record<string, KnowledgeSourceType> = {
  commercial_incident_resolved: "incident",
  landing_reconciled: "landing",
  commercial_order_reconciled: "commercial_execution",
  value_recovery_completed: "value_recovery",
  climate_resource_outcome_recorded: "sustainability",
  development_impact_evaluated: "development_program",
  field_observation_verified: "field_observation",
  research_finding_validated: "research",
};

export function convertBusinessEventToKnowledgeSource(event: SectorBusinessEvent): KnowledgeSource {
  const sourceType = sourceTypes[event.eventType];
  if (!sourceType) throw new Error(`Événement non pris en charge par Knowledge : ${event.eventType}.`);
  if (event.evidenceIds.length === 0) throw new Error("Un événement doit être prouvé avant ingestion dans Knowledge.");

  const title = readText(event.payload.title) ?? titleFor(event.eventType, event.aggregateId);
  const summary = readText(event.payload.summary) ?? summarizePayload(event.payload);
  if (!summary) throw new Error("L'événement ne contient pas assez d'information pour produire une source de connaissance.");

  return {
    id: `knowledge-source:${event.id}`,
    sourceType,
    sourceReferenceId: event.aggregateId,
    territoryId: event.territoryId,
    title,
    summary,
    evidenceIds: [...new Set(event.evidenceIds)],
    confidenceScore: event.confidenceScore ?? 70,
    occurredAt: event.occurredAt,
    recordedByActorId: event.actorId,
  };
}

function readText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function titleFor(eventType: string, aggregateId: string) {
  const labels: Record<string, string> = {
    commercial_incident_resolved: "Incident commercial résolu",
    landing_reconciled: "Débarquement réconcilié",
    commercial_order_reconciled: "Transaction commerciale réconciliée",
    value_recovery_completed: "Plan de valorisation achevé",
    climate_resource_outcome_recorded: "Résultat de résilience mesuré",
    development_impact_evaluated: "Impact de programme évalué",
    field_observation_verified: "Observation terrain vérifiée",
    research_finding_validated: "Résultat de recherche validé",
  };
  return `${labels[eventType]} — ${aggregateId}`;
}

function summarizePayload(payload: Record<string, unknown>) {
  const entries = Object.entries(payload)
    .filter(([, value]) => ["string", "number", "boolean"].includes(typeof value))
    .slice(0, 6)
    .map(([key, value]) => `${key}: ${String(value)}`);
  return entries.join(" ; ");
}
