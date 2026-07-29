import { PostCaptureValueRecovery, type CommunityInitiative, type RecoveryEvidence, type RecoveryPlan } from "./post-capture-value-recovery";

export type ValueRecoveryCommand =
  | { type: "register_initiative"; initiative: CommunityInitiative }
  | { type: "propose_plan"; plan: Omit<RecoveryPlan, "status"> }
  | { type: "approve_plan"; planId: string; approvedAt: string }
  | { type: "reserve_capacity"; planId: string }
  | { type: "start_plan"; planId: string; startedAt: string }
  | { type: "record_evidence"; evidence: RecoveryEvidence }
  | { type: "complete_plan"; outcomeId: string; planId: string; quantitySavedKg: number; quantityLostKg: number; beneficiaryCount: number; processingYieldKg?: number; completedAt: string }
  | { type: "fail_plan"; planId: string; failureReason: string };

export class ValueRecoveryRuntime {
  private readonly engine = new PostCaptureValueRecovery();
  private readonly processedCommands = new Map<string, unknown>();

  execute(commandId: string, command: ValueRecoveryCommand) {
    const previous = this.processedCommands.get(commandId);
    if (previous) return structuredClone(previous);
    let result: unknown;
    switch (command.type) {
      case "register_initiative": result = this.engine.registerCommunityInitiative(command.initiative); break;
      case "propose_plan": result = this.engine.proposePlan(command.plan); break;
      case "approve_plan": result = this.engine.approvePlan(command.planId, command.approvedAt); break;
      case "reserve_capacity": result = this.engine.reserveCapacity(command.planId); break;
      case "start_plan": result = this.engine.startPlan(command.planId, command.startedAt); break;
      case "record_evidence": result = this.engine.recordEvidence(command.evidence); break;
      case "complete_plan": result = this.engine.completePlan(command); break;
      case "fail_plan": result = this.engine.failPlan(command.planId, command.failureReason); break;
      default: throw new Error("Commande de valorisation inconnue.");
    }
    const response = { result, snapshot: this.engine.snapshot(), impact: this.engine.getImpactSummary() };
    this.processedCommands.set(commandId, structuredClone(response));
    return response;
  }

  snapshot(territoryId?: string) {
    return { ...this.engine.snapshot(), impact: this.engine.getImpactSummary(territoryId) };
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbValueRecoveryRuntime?: ValueRecoveryRuntime };

export function getValueRecoveryRuntime() {
  globalRuntime.__mbValueRecoveryRuntime ??= new ValueRecoveryRuntime();
  return globalRuntime.__mbValueRecoveryRuntime;
}
