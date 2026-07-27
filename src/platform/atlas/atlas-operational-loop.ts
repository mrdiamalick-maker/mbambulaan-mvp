import {
  InMemoryWorkRepository,
  NationalWorkOrchestrator,
  type EscalationPolicy,
  type WorkItem,
} from "@/platform/coordination/national-work-orchestration";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

export interface AtlasOperationalDecision {
  id: string;
  scenarioId: string;
  workspaceId: string;
  approvedByActorId: string;
  territoryId: string;
  status: "approved" | "in_execution" | "completed";
  approvedAt: string;
  completedAt?: string;
  workItemIds: string[];
}

export interface AtlasOperationalResult {
  id: string;
  decisionId: string;
  scenarioId: string;
  territoryId: string;
  completedWorkItems: number;
  evidenceIds: string[];
  observedAt: string;
  summary: string;
}

class MutableClock {
  constructor(public value: string) {}
  now() { return this.value; }
}

class SequentialIds {
  private value = 0;
  next(prefix: string) {
    this.value += 1;
    return `${prefix}-${this.value}`;
  }
}

export class AtlasOperationalLoop {
  private readonly repository = new InMemoryWorkRepository();
  private readonly clock = new MutableClock(new Date().toISOString());
  private readonly ids = new SequentialIds();
  private readonly orchestrator: NationalWorkOrchestrator;
  private readonly decisions = new Map<string, AtlasOperationalDecision>();
  private readonly results = new Map<string, AtlasOperationalResult>();

  constructor() {
    const policy: EscalationPolicy = {
      code: "atlas-decision",
      acknowledgementMinutes: 30,
      resolutionMinutes: 48 * 60,
      maximumLevel: 2,
      levels: [
        { level: 1, afterMinutes: 30, targetRoleCodes: ["territorial_coordinator"], targetScope: "territory", channels: ["in_app", "sms"] },
        { level: 2, afterMinutes: 240, targetRoleCodes: ["national_supervisor"], targetScope: "national", channels: ["in_app", "sms", "email"] },
      ],
    };
    this.repository.policies.set(policy.code, policy);
    this.orchestrator = new NationalWorkOrchestrator(
      this.repository,
      { async resolve() { return [{ identityId: "actor-government-demo" }]; } },
      this.clock,
      this.ids,
    );
  }

  async approveScenario(input: {
    decisionId: string;
    scenarioId: string;
    approvedByActorId: string;
    territoryId: string;
    at?: string;
  }) {
    const existing = this.decisions.get(input.decisionId);
    if (existing) return structuredClone(existing);

    const runtime = getIntegratedPlatformRuntime();
    const scenario = runtime.atlas.snapshot().scenarios.find((item) => item.id === input.scenarioId);
    if (!scenario) throw new Error("Le scénario Atlas est introuvable.");

    const at = input.at ?? new Date().toISOString();
    this.clock.value = at;
    const workItems: WorkItem[] = [];
    for (const [index, action] of scenario.actions.entries()) {
      const work = await this.orchestrator.createWork({
        workType: `atlas.${action.actionType}`,
        title: action.description,
        description: `Action issue du scénario Atlas « ${scenario.name} »`,
        priority: index === 0 ? "urgent" : "high",
        territoryIds: [input.territoryId],
        assignedIdentityId: index === 0 ? "actor-cold-chain-demo" : "actor-government-demo",
        sourceEntityType: "atlas_scenario",
        sourceEntityId: scenario.id,
        dueAt: new Date(Date.parse(at) + Math.max(1, action.expectedDelayDays) * 86_400_000).toISOString(),
        escalationPolicyCode: "atlas-decision",
        metadata: {
          decisionId: input.decisionId,
          scenarioId: scenario.id,
          actionId: action.id,
          estimatedCostXof: String(action.estimatedCostXof),
        },
      });
      workItems.push(work);
    }

    const decision: AtlasOperationalDecision = {
      id: input.decisionId,
      scenarioId: scenario.id,
      workspaceId: scenario.workspaceId,
      approvedByActorId: input.approvedByActorId,
      territoryId: input.territoryId,
      status: "in_execution",
      approvedAt: at,
      workItemIds: workItems.map((item) => item.id),
    };
    this.decisions.set(decision.id, decision);
    return structuredClone(decision);
  }

  async completeDecision(input: { decisionId: string; at?: string }) {
    const decision = this.decisions.get(input.decisionId);
    if (!decision) throw new Error("La décision Atlas est introuvable.");
    if (decision.status === "completed") return this.getDecisionResult(decision.id);

    const runtime = getIntegratedPlatformRuntime();
    const at = input.at ?? new Date().toISOString();
    this.clock.value = at;
    const evidenceIds: string[] = [];

    for (const workItemId of decision.workItemIds) {
      const work = await this.repository.getWorkItem(workItemId);
      if (!work) throw new Error(`La tâche ${workItemId} est introuvable.`);
      const actorId = work.assignedIdentityId ?? "actor-government-demo";
      await this.orchestrator.acknowledge({ workItemId, identityId: actorId });
      const evidenceId = `evidence-${workItemId}`;
      evidenceIds.push(evidenceId);
      await this.orchestrator.complete({ workItemId, identityId: actorId, evidenceIds: [evidenceId] });
      runtime.publish({
        id: `event-result-${workItemId}`,
        type: "operational.flow.completed",
        occurredAt: at,
        correlationId: decision.id,
        causationId: decision.scenarioId,
        tenantId: "tenant-national",
        territoryId: decision.territoryId,
        payload: {
          flowId: `flow-result-${workItemId}`,
          flowKind: "commitment",
          fromEntityId: actorId,
          fromLabel: "Responsable d'exécution",
          toEntityId: decision.scenarioId,
          toLabel: "Scénario Atlas exécuté",
          quantity: 1,
          unit: "service_unit",
        },
      });
    }
    await runtime.drain(at);

    decision.status = "completed";
    decision.completedAt = at;
    const result: AtlasOperationalResult = {
      id: `result-${decision.id}`,
      decisionId: decision.id,
      scenarioId: decision.scenarioId,
      territoryId: decision.territoryId,
      completedWorkItems: decision.workItemIds.length,
      evidenceIds,
      observedAt: at,
      summary: `${decision.workItemIds.length} actions Atlas exécutées et réinjectées dans le jumeau numérique.`,
    };
    this.results.set(decision.id, result);
    return structuredClone(result);
  }

  snapshot() {
    return {
      decisions: Array.from(this.decisions.values()).map((item) => structuredClone(item)),
      results: Array.from(this.results.values()).map((item) => structuredClone(item)),
      workItems: Array.from(this.repository.workItems.values()).map((item) => structuredClone(item)),
      notifications: Array.from(this.repository.notifications.values()).map((item) => structuredClone(item)),
    };
  }

  reset() {
    this.decisions.clear();
    this.results.clear();
    this.repository.workItems.clear();
    this.repository.notifications.clear();
  }

  private getDecisionResult(decisionId: string) {
    const result = this.results.get(decisionId);
    if (!result) throw new Error("Le résultat de la décision est introuvable.");
    return structuredClone(result);
  }
}
