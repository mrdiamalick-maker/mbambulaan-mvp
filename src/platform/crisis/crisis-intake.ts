import type { CrisisCommand, CrisisSituationType } from "./ecosystem-crisis-response-runtime";

export interface CrisisTriggerInput {
  triggerId: string;
  sourceType: "operational_incident" | "commercial_incident" | "sanitary_notice" | "weather_notice" | "territorial_tension" | "institutional_notice";
  sourceReferenceId: string;
  territoryIds: string[];
  title: string;
  description: string;
  severity: "moderate" | "high" | "critical" | "national_emergency";
  category: "cold_chain" | "fuel" | "transport" | "sanitary" | "weather" | "market" | "resource" | "social" | "combined";
  reportedByActorId: string;
  supportingDocumentIds: string[];
  occurredAt: string;
  institutionalConstraint?: {
    kind: "mandatory_insurance" | "public_support" | "partner_requirement" | "legal_obligation";
    institutionName: string;
    requirementReference: string;
    contractOrDecisionDocumentIds: string[];
  };
}

const typeByCategory: Record<CrisisTriggerInput["category"], CrisisSituationType> = {
  cold_chain: "cold_chain_breakdown",
  fuel: "fuel_shortage",
  transport: "transport_disruption",
  sanitary: "sanitary_risk",
  weather: "weather_disruption",
  market: "market_disruption",
  resource: "resource_pressure",
  social: "social_tension",
  combined: "combined_crisis",
};

export function createCrisisCommandFromTrigger(input: CrisisTriggerInput): { commandId: string; command: CrisisCommand; institutionalContext?: CrisisTriggerInput["institutionalConstraint"] } {
  if (!input.territoryIds.length) throw new Error("Le signal doit identifier au moins un territoire concerné.");
  if (!input.supportingDocumentIds.length) throw new Error("Le signal doit comporter un constat, un avis officiel ou un compte rendu.");
  if (input.institutionalConstraint) {
    if (!input.institutionalConstraint.institutionName.trim() || !input.institutionalConstraint.requirementReference.trim()) {
      throw new Error("L'institution et la référence de l'exigence doivent être indiquées.");
    }
    if (!input.institutionalConstraint.contractOrDecisionDocumentIds.length) {
      throw new Error("Le document imposant la contrainte institutionnelle est obligatoire.");
    }
  }

  const documentIds = [
    ...input.supportingDocumentIds,
    ...(input.institutionalConstraint?.contractOrDecisionDocumentIds ?? []),
  ];

  return {
    commandId: `crisis-trigger:${input.triggerId}`,
    command: {
      type: "report_crisis",
      crisis: {
        id: `crisis:${input.triggerId}`,
        title: input.title,
        type: typeByCategory[input.category],
        territoryIds: [...new Set(input.territoryIds)],
        severity: input.severity,
        description: input.description,
        reportedByActorId: input.reportedByActorId,
        reportedAt: input.occurredAt,
        situationDocumentIds: [...new Set(documentIds)],
        status: "reported",
      },
    },
    institutionalContext: input.institutionalConstraint,
  };
}
