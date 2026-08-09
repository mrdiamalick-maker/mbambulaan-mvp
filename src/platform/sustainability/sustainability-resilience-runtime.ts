import {
  EndToEndClimateResourceResilienceCapability,
  type ClimateAdaptationAction,
  type ClimateResourceOutcome,
  type EnvironmentalSignal,
  type FishingActivityDecision,
  type ResourceManagementMeasure,
  type ResourcePressureAssessment,
  type ResilienceSupport,
} from "@/domain/capabilities/end-to-end-climate-resource-resilience-capability";

export type SustainabilityCommand =
  | { type: "open_case"; caseId: string; caseCode: string; countryId: string; territoryIds: string[]; at: string }
  | { type: "register_signal"; caseId: string; signal: EnvironmentalSignal }
  | { type: "assess_pressure"; caseId: string; assessment: ResourcePressureAssessment }
  | { type: "decide_measure"; caseId: string; measure: ResourceManagementMeasure; at: string }
  | { type: "plan_action"; caseId: string; action: ClimateAdaptationAction; at: string }
  | { type: "decide_activity"; caseId: string; decision: FishingActivityDecision }
  | { type: "deliver_support"; caseId: string; support: ResilienceSupport; at: string }
  | { type: "complete_action"; caseId: string; actionId: string; at: string; evidenceIds: string[] }
  | { type: "record_outcome"; caseId: string; outcome: ClimateResourceOutcome }
  | { type: "seed_demo"; territoryId: string; actorId: string; at: string };

export interface SustainabilityExecutionInput {
  commandId: string;
  actorId: string;
  activeTerritoryId: string;
  command: SustainabilityCommand;
}

export class SustainabilityResilienceRuntime {
  private readonly capability = new EndToEndClimateResourceResilienceCapability();
  private readonly processedCommands = new Map<string, unknown>();

  execute(input: SustainabilityExecutionInput) {
    const previous = this.processedCommands.get(input.commandId);
    if (previous) return structuredClone(previous);

    const command = input.command;
    let result: unknown;
    switch (command.type) {
      case "open_case":
        this.assertTerritoryScope(command.territoryIds, input.activeTerritoryId);
        result = this.capability.openCase({
          id: command.caseId,
          caseCode: command.caseCode,
          countryId: command.countryId,
          territoryIds: command.territoryIds,
          createdAt: command.at,
        });
        break;
      case "register_signal":
        this.assertTerritory(command.signal.territoryId, input.activeTerritoryId);
        result = this.capability.registerSignal({ caseId: command.caseId, signal: command.signal });
        break;
      case "assess_pressure":
        this.assertTerritory(command.assessment.territoryId, input.activeTerritoryId);
        result = this.capability.assessResourcePressure({ caseId: command.caseId, assessment: command.assessment });
        break;
      case "decide_measure":
        this.assertTerritoryScope(command.measure.territoryIds, input.activeTerritoryId);
        result = this.capability.decideMeasure({ caseId: command.caseId, measure: command.measure, decidedAt: command.at });
        break;
      case "plan_action":
        this.assertTerritoryScope(command.action.territoryIds, input.activeTerritoryId);
        result = this.capability.planAdaptationAction({ caseId: command.caseId, action: command.action, plannedAt: command.at });
        break;
      case "decide_activity":
        this.assertTerritory(command.decision.territoryId, input.activeTerritoryId);
        result = this.capability.decideFishingActivity({ caseId: command.caseId, decision: command.decision });
        break;
      case "deliver_support":
        this.assertTerritory(command.support.territoryId, input.activeTerritoryId);
        result = this.capability.deliverSupport({ caseId: command.caseId, support: command.support, deliveredAt: command.at });
        break;
      case "complete_action":
        result = this.capability.completeAction({ caseId: command.caseId, actionId: command.actionId, completedAt: command.at, evidenceIds: command.evidenceIds });
        break;
      case "record_outcome":
        result = this.capability.recordOutcome({ caseId: command.caseId, outcome: command.outcome });
        break;
      case "seed_demo":
        result = this.seedDemo(command.territoryId, command.actorId, command.at);
        break;
      default:
        throw new Error("Commande de durabilité inconnue.");
    }

    const response = { result, cases: this.capability.snapshot() };
    this.processedCommands.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot(generatedAt = new Date().toISOString()) {
    const cases = this.capability.snapshot();
    return {
      cases,
      commandCenters: cases.map((item) => this.capability.getResilienceCommandCenter({ caseId: item.id, generatedAt })),
    };
  }

  private seedDemo(territoryId: string, actorId: string, at: string) {
    if (this.capability.snapshot().some((item) => item.id === "resilience-pilot-01")) return { seeded: false };
    this.capability.openCase({ id: "resilience-pilot-01", caseCode: "DAKAR-RESOURCE-01", countryId: "SN", territoryIds: [territoryId], createdAt: at });
    this.capability.registerSignal({
      caseId: "resilience-pilot-01",
      signal: {
        id: "signal-stock-decline-01",
        territoryId,
        riskType: "stock_decline",
        severity: "high",
        probabilityPercent: 75,
        confidencePercent: 70,
        validFrom: at,
        validUntil: new Date(Date.parse(at) + 30 * 24 * 60 * 60_000).toISOString(),
        sourceActorId: actorId,
        sourceReferenceIds: ["resource-briefing-pilot-01"],
        evidenceIds: ["evidence-cpue-decline-01"],
        expectedEffects: ["Baisse du rendement par sortie", "Hausse du coût par kilogramme"],
      },
    });
    return { seeded: true, caseId: "resilience-pilot-01" };
  }

  private assertTerritory(value: string, active: string) {
    if (active !== "territory-national" && value !== active) throw new Error("Le territoire actif ne permet pas cette opération.");
  }

  private assertTerritoryScope(values: string[], active: string) {
    if (active !== "territory-national" && values.some((value) => value !== active)) throw new Error("Le périmètre territorial dépasse les droits actifs.");
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbSustainabilityRuntime?: SustainabilityResilienceRuntime };

export function getSustainabilityResilienceRuntime() {
  globalRuntime.__mbSustainabilityRuntime ??= new SustainabilityResilienceRuntime();
  return globalRuntime.__mbSustainabilityRuntime;
}
