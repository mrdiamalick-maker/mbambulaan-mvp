import {
  EndToEndPublicProgramPolicyImpactCapability,
  type PublicPolicyObjective,
  type PublicProgramBeneficiary,
  type PublicProgramBudgetLine,
  type PublicProgramDelivery,
  type PublicProgramGovernanceDecision,
  type PublicProgramImpactEvaluation,
  type PublicProgramIndicatorMeasurement,
  type PublicProgramIntervention,
} from "@/domain/capabilities/end-to-end-public-program-policy-impact-capability";

export type DevelopmentProgramCommand =
  | { type: "open_program"; programId: string; programCode: string; title: string; countryId: string; territoryIds: string[]; periodStart: string; periodEnd: string; totalBudgetCeilingXof: number; at: string; platformContractId?: string }
  | { type: "define_objective"; programId: string; objective: PublicPolicyObjective; at: string }
  | { type: "add_intervention"; programId: string; intervention: PublicProgramIntervention; at: string }
  | { type: "register_beneficiary"; programId: string; beneficiary: PublicProgramBeneficiary }
  | { type: "add_budget_line"; programId: string; budgetLine: PublicProgramBudgetLine; at: string }
  | { type: "approve_program"; programId: string; decision: PublicProgramGovernanceDecision }
  | { type: "launch_program"; programId: string; at: string }
  | { type: "record_delivery"; programId: string; delivery: PublicProgramDelivery }
  | { type: "record_measurement"; programId: string; measurement: PublicProgramIndicatorMeasurement }
  | { type: "evaluate_impact"; programId: string; evaluation: Omit<PublicProgramImpactEvaluation, "objectiveAchievementPercent" | "budgetExecutionPercent" | "beneficiaryCoveragePercent" | "costPerBeneficiaryXof"> }
  | { type: "record_decision"; programId: string; decision: PublicProgramGovernanceDecision }
  | { type: "seed_demo"; territoryId: string; at: string };

export interface DevelopmentProgramExecutionInput {
  commandId: string;
  actorId: string;
  activeTerritoryId: string;
  command: DevelopmentProgramCommand;
}

export class DevelopmentProgramRuntime {
  private readonly capability = new EndToEndPublicProgramPolicyImpactCapability();
  private readonly processedCommands = new Map<string, unknown>();

  execute(input: DevelopmentProgramExecutionInput) {
    const previous = this.processedCommands.get(input.commandId);
    if (previous) return structuredClone(previous);

    const command = input.command;
    let result: unknown;
    switch (command.type) {
      case "open_program":
        this.assertTerritoryScope(command.territoryIds, input.activeTerritoryId);
        result = this.capability.openProgram({
          id: command.programId,
          programCode: command.programCode,
          title: command.title,
          ministryActorId: input.actorId,
          countryId: command.countryId,
          territoryIds: command.territoryIds,
          periodStart: command.periodStart,
          periodEnd: command.periodEnd,
          totalBudgetCeilingXof: command.totalBudgetCeilingXof,
          createdAt: command.at,
          platformContractId: command.platformContractId,
        });
        break;
      case "define_objective":
        result = this.capability.defineObjective({ caseId: command.programId, objective: command.objective, definedAt: command.at });
        break;
      case "add_intervention":
        this.assertTerritoryScope(command.intervention.territoryIds, input.activeTerritoryId);
        result = this.capability.addIntervention({ caseId: command.programId, intervention: command.intervention, addedAt: command.at });
        break;
      case "register_beneficiary":
        this.assertTerritory(command.beneficiary.territoryId, input.activeTerritoryId);
        result = this.capability.registerBeneficiary({ caseId: command.programId, beneficiary: command.beneficiary });
        break;
      case "add_budget_line":
        result = this.capability.addBudgetLine({ caseId: command.programId, budgetLine: command.budgetLine, addedAt: command.at });
        break;
      case "approve_program":
        result = this.capability.approveProgram({ caseId: command.programId, decision: command.decision });
        break;
      case "launch_program":
        result = this.capability.launchProgram({ caseId: command.programId, launchedAt: command.at });
        break;
      case "record_delivery":
        result = this.capability.recordDelivery({ caseId: command.programId, delivery: command.delivery });
        break;
      case "record_measurement":
        result = this.capability.recordMeasurement({ caseId: command.programId, measurement: command.measurement });
        break;
      case "evaluate_impact":
        result = this.capability.evaluateImpact({ caseId: command.programId, evaluation: command.evaluation });
        break;
      case "record_decision":
        this.assertTerritoryScope(command.decision.affectedTerritoryIds, input.activeTerritoryId);
        result = this.capability.recordDecision({ caseId: command.programId, decision: command.decision });
        break;
      case "seed_demo":
        result = this.seedDemo(command.territoryId, input.actorId, command.at);
        break;
      default:
        throw new Error("Commande de programme de développement inconnue.");
    }

    const response = { result, snapshot: this.snapshot(command.type === "seed_demo" ? command.at : new Date().toISOString()) };
    this.processedCommands.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot(generatedAt = new Date().toISOString()) {
    const programs = this.capability.snapshot();
    return {
      programs,
      commandCenters: programs.map((program) => this.capability.getPublicProgramCommandCenter({ caseId: program.id, generatedAt })),
    };
  }

  private seedDemo(territoryId: string, actorId: string, at: string) {
    if (this.capability.snapshot().some((item) => item.id === "development-pilot-01")) return { seeded: false };
    const periodEnd = new Date(Date.parse(at) + 365 * 24 * 60 * 60_000).toISOString();
    this.capability.openProgram({
      id: "development-pilot-01",
      programCode: "REDUCTION-PERTES-01",
      title: "Réduction des pertes post-capture et autonomisation des transformatrices",
      ministryActorId: actorId,
      countryId: "SN",
      territoryIds: [territoryId],
      periodStart: at,
      periodEnd,
      totalBudgetCeilingXof: 250_000_000,
      createdAt: at,
    });
    return { seeded: true, programId: "development-pilot-01" };
  }

  private assertTerritory(value: string, active: string) {
    if (active !== "territory-national" && value !== active) throw new Error("Le territoire actif ne permet pas cette opération.");
  }

  private assertTerritoryScope(values: string[], active: string) {
    if (active !== "territory-national" && values.some((value) => value !== active)) throw new Error("Le périmètre territorial dépasse les droits actifs.");
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbDevelopmentProgramRuntime?: DevelopmentProgramRuntime };

export function getDevelopmentProgramRuntime() {
  globalRuntime.__mbDevelopmentProgramRuntime ??= new DevelopmentProgramRuntime();
  return globalRuntime.__mbDevelopmentProgramRuntime;
}
