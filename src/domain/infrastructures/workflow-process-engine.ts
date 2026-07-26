import type { EntityId, ISODateTime } from "./types";
import type { MbambulaanProductCode } from "./mbambulaan-product-system";

export type WorkflowStatus = "draft" | "active" | "suspended" | "retired";
export type WorkflowInstanceStatus =
  | "pending"
  | "running"
  | "waiting"
  | "completed"
  | "cancelled"
  | "failed";

export type WorkflowStepKind =
  | "human_task"
  | "service_task"
  | "approval"
  | "decision"
  | "event_wait"
  | "notification"
  | "sub_process";

export interface WorkflowDefinition {
  id: EntityId;
  code: string;
  name: string;
  productCodes: MbambulaanProductCode[];
  capabilityCodes: string[];
  actorRoleCodes: string[];
  territoryScoped: boolean;
  version: number;
  status: WorkflowStatus;
  steps: WorkflowStepDefinition[];
  createdAt: ISODateTime;
}

export interface WorkflowStepDefinition {
  id: EntityId;
  code: string;
  name: string;
  kind: WorkflowStepKind;
  requiredRoleCodes: string[];
  requiredCapabilityCodes: string[];
  inputKeys: string[];
  outputKeys: string[];
  timeoutHours?: number;
  retryLimit?: number;
  nextStepCodes: string[];
  failureStepCode?: string;
}

export interface WorkflowTrigger {
  id: EntityId;
  workflowCode: string;
  eventType: string;
  sourceProductCode?: MbambulaanProductCode;
  conditionExpression?: string;
  status: "active" | "inactive";
}

export interface WorkflowInstance {
  id: EntityId;
  workflowDefinitionId: EntityId;
  tenantId: EntityId;
  organizationId?: EntityId;
  territoryId?: EntityId;
  sourceEntityIds: EntityId[];
  status: WorkflowInstanceStatus;
  currentStepCodes: string[];
  context: Record<string, string | number | boolean | null>;
  startedAt: ISODateTime;
  completedAt?: ISODateTime;
  failedAt?: ISODateTime;
}

export interface WorkflowTask {
  id: EntityId;
  instanceId: EntityId;
  stepCode: string;
  assignedActorId?: EntityId;
  assignedRoleCode?: string;
  status: "open" | "in_progress" | "completed" | "cancelled" | "failed";
  dueAt?: ISODateTime;
  createdAt: ISODateTime;
  completedAt?: ISODateTime;
  result?: Record<string, string | number | boolean | null>;
}

export interface WorkflowDecision {
  id: EntityId;
  instanceId: EntityId;
  stepCode: string;
  decidedByActorId?: EntityId;
  outcome: string;
  rationale?: string;
  decidedAt: ISODateTime;
}

export interface WorkflowEvent {
  id: EntityId;
  instanceId: EntityId;
  eventType:
    | "instance_started"
    | "step_started"
    | "task_created"
    | "task_completed"
    | "decision_recorded"
    | "instance_waiting"
    | "instance_completed"
    | "instance_failed"
    | "instance_cancelled";
  stepCode?: string;
  actorId?: EntityId;
  occurredAt: ISODateTime;
  details: Record<string, string | number | boolean | null>;
}

export interface WorkflowEngineData {
  definitions: WorkflowDefinition[];
  triggers: WorkflowTrigger[];
  instances: WorkflowInstance[];
  tasks: WorkflowTask[];
  decisions: WorkflowDecision[];
  events: WorkflowEvent[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class WorkflowProcessEngine {
  private state: WorkflowEngineData = {
    definitions: [],
    triggers: [],
    instances: [],
    tasks: [],
    decisions: [],
    events: [],
  };

  registerDefinition(definition: WorkflowDefinition) {
    if (this.state.definitions.some((item) => item.id === definition.id)) {
      throw new Error(`Le workflow ${definition.id} existe déjà.`);
    }
    const duplicatedSteps = definition.steps.filter(
      (step, index, items) => items.findIndex((candidate) => candidate.code === step.code) !== index,
    );
    if (duplicatedSteps.length > 0) {
      throw new Error("Un workflow ne peut pas contenir plusieurs étapes avec le même code.");
    }
    this.state.definitions.push(clone(definition));
    return clone(definition);
  }

  registerTrigger(trigger: WorkflowTrigger) {
    if (this.state.triggers.some((item) => item.id === trigger.id)) {
      throw new Error(`Le déclencheur ${trigger.id} existe déjà.`);
    }
    if (!this.state.definitions.some((item) => item.code === trigger.workflowCode)) {
      throw new Error(`Le workflow ${trigger.workflowCode} est introuvable.`);
    }
    this.state.triggers.push(clone(trigger));
    return clone(trigger);
  }

  startInstance(input: {
    id: EntityId;
    workflowCode: string;
    tenantId: EntityId;
    organizationId?: EntityId;
    territoryId?: EntityId;
    sourceEntityIds: EntityId[];
    context?: Record<string, string | number | boolean | null>;
    startedAt: ISODateTime;
  }) {
    if (this.state.instances.some((item) => item.id === input.id)) {
      throw new Error(`L'instance ${input.id} existe déjà.`);
    }
    const definition = this.state.definitions
      .filter((item) => item.code === input.workflowCode && item.status === "active")
      .sort((a, b) => b.version - a.version)[0];
    if (!definition) throw new Error(`Aucune version active du workflow ${input.workflowCode}.`);

    const firstStep = definition.steps[0];
    if (!firstStep) throw new Error("Le workflow ne contient aucune étape.");

    const instance: WorkflowInstance = {
      id: input.id,
      workflowDefinitionId: definition.id,
      tenantId: input.tenantId,
      organizationId: input.organizationId,
      territoryId: input.territoryId,
      sourceEntityIds: input.sourceEntityIds,
      status: "running",
      currentStepCodes: [firstStep.code],
      context: input.context ?? {},
      startedAt: input.startedAt,
    };

    this.state.instances.push(clone(instance));
    this.recordEvent({
      id: `workflow-event-start-${input.id}`,
      instanceId: input.id,
      eventType: "instance_started",
      stepCode: firstStep.code,
      occurredAt: input.startedAt,
      details: { workflowCode: definition.code, version: definition.version },
    });
    this.activateStep(instance, definition, firstStep.code, input.startedAt);
    return clone(instance);
  }

  completeTask(input: {
    taskId: EntityId;
    actorId: EntityId;
    result?: Record<string, string | number | boolean | null>;
    completedAt: ISODateTime;
  }) {
    const task = this.state.tasks.find((item) => item.id === input.taskId);
    if (!task) throw new Error(`La tâche ${input.taskId} est introuvable.`);
    if (!["open", "in_progress"].includes(task.status)) {
      throw new Error("Seule une tâche ouverte ou en cours peut être complétée.");
    }
    task.status = "completed";
    task.assignedActorId = input.actorId;
    task.completedAt = input.completedAt;
    task.result = input.result;

    const instance = this.getInstance(task.instanceId);
    Object.assign(instance.context, input.result ?? {});
    this.recordEvent({
      id: `workflow-event-task-${task.id}`,
      instanceId: instance.id,
      eventType: "task_completed",
      stepCode: task.stepCode,
      actorId: input.actorId,
      occurredAt: input.completedAt,
      details: {},
    });
    this.advance(instance, task.stepCode, input.completedAt);
    return clone(task);
  }

  recordDecision(input: {
    id: EntityId;
    instanceId: EntityId;
    stepCode: string;
    decidedByActorId?: EntityId;
    outcome: string;
    rationale?: string;
    decidedAt: ISODateTime;
  }) {
    if (this.state.decisions.some((item) => item.id === input.id)) {
      throw new Error(`La décision ${input.id} existe déjà.`);
    }
    const instance = this.getInstance(input.instanceId);
    const definition = this.getDefinition(instance.workflowDefinitionId);
    const step = definition.steps.find((item) => item.code === input.stepCode);
    if (!step || !["approval", "decision"].includes(step.kind)) {
      throw new Error("La décision doit cibler une étape de type approval ou decision.");
    }

    const decision: WorkflowDecision = { ...input };
    this.state.decisions.push(clone(decision));
    instance.context[`decision:${input.stepCode}`] = input.outcome;
    this.recordEvent({
      id: `workflow-event-decision-${input.id}`,
      instanceId: input.instanceId,
      eventType: "decision_recorded",
      stepCode: input.stepCode,
      actorId: input.decidedByActorId,
      occurredAt: input.decidedAt,
      details: { outcome: input.outcome },
    });
    this.advance(instance, input.stepCode, input.decidedAt);
    return clone(decision);
  }

  receiveEvent(input: {
    eventType: string;
    tenantId: EntityId;
    sourceEntityIds: EntityId[];
    occurredAt: ISODateTime;
    context?: Record<string, string | number | boolean | null>;
  }): WorkflowInstance[] {
    const matchingTriggers = this.state.triggers.filter(
      (item) => item.eventType === input.eventType && item.status === "active",
    );
    return matchingTriggers.map((trigger, index) =>
      this.startInstance({
        id: `workflow-instance-${trigger.id}-${input.occurredAt}-${index}`,
        workflowCode: trigger.workflowCode,
        tenantId: input.tenantId,
        sourceEntityIds: input.sourceEntityIds,
        context: input.context,
        startedAt: input.occurredAt,
      }),
    );
  }

  cancelInstance(instanceId: EntityId, occurredAt: ISODateTime, reason: string) {
    const instance = this.getInstance(instanceId);
    if (["completed", "cancelled"].includes(instance.status)) {
      throw new Error("Cette instance ne peut plus être annulée.");
    }
    instance.status = "cancelled";
    this.state.tasks
      .filter((item) => item.instanceId === instanceId && ["open", "in_progress"].includes(item.status))
      .forEach((item) => { item.status = "cancelled"; });
    this.recordEvent({
      id: `workflow-event-cancel-${instanceId}-${occurredAt}`,
      instanceId,
      eventType: "instance_cancelled",
      occurredAt,
      details: { reason },
    });
    return clone(instance);
  }

  snapshot(): WorkflowEngineData {
    return clone(this.state);
  }

  private advance(instance: WorkflowInstance, completedStepCode: string, occurredAt: ISODateTime) {
    const definition = this.getDefinition(instance.workflowDefinitionId);
    const step = definition.steps.find((item) => item.code === completedStepCode);
    if (!step) throw new Error(`L'étape ${completedStepCode} est introuvable.`);

    instance.currentStepCodes = instance.currentStepCodes.filter((code) => code !== completedStepCode);
    if (step.nextStepCodes.length === 0) {
      if (instance.currentStepCodes.length === 0) {
        instance.status = "completed";
        instance.completedAt = occurredAt;
        this.recordEvent({
          id: `workflow-event-complete-${instance.id}`,
          instanceId: instance.id,
          eventType: "instance_completed",
          occurredAt,
          details: {},
        });
      }
      return;
    }

    for (const nextStepCode of step.nextStepCodes) {
      if (!instance.currentStepCodes.includes(nextStepCode)) {
        instance.currentStepCodes.push(nextStepCode);
      }
      this.activateStep(instance, definition, nextStepCode, occurredAt);
    }
  }

  private activateStep(
    instance: WorkflowInstance,
    definition: WorkflowDefinition,
    stepCode: string,
    occurredAt: ISODateTime,
  ) {
    const step = definition.steps.find((item) => item.code === stepCode);
    if (!step) throw new Error(`L'étape ${stepCode} est introuvable.`);

    this.recordEvent({
      id: `workflow-event-step-${instance.id}-${stepCode}-${occurredAt}`,
      instanceId: instance.id,
      eventType: "step_started",
      stepCode,
      occurredAt,
      details: { kind: step.kind },
    });

    if (["human_task", "approval"].includes(step.kind)) {
      const task: WorkflowTask = {
        id: `workflow-task-${instance.id}-${stepCode}`,
        instanceId: instance.id,
        stepCode,
        assignedRoleCode: step.requiredRoleCodes[0],
        status: "open",
        createdAt: occurredAt,
      };
      this.state.tasks.push(task);
      this.recordEvent({
        id: `workflow-event-task-created-${task.id}`,
        instanceId: instance.id,
        eventType: "task_created",
        stepCode,
        occurredAt,
        details: { assignedRoleCode: task.assignedRoleCode ?? null },
      });
      return;
    }

    if (step.kind === "event_wait") {
      instance.status = "waiting";
      this.recordEvent({
        id: `workflow-event-wait-${instance.id}-${stepCode}`,
        instanceId: instance.id,
        eventType: "instance_waiting",
        stepCode,
        occurredAt,
        details: {},
      });
      return;
    }

    if (["service_task", "notification"].includes(step.kind)) {
      this.advance(instance, stepCode, occurredAt);
    }
  }

  private getInstance(instanceId: EntityId) {
    const instance = this.state.instances.find((item) => item.id === instanceId);
    if (!instance) throw new Error(`L'instance ${instanceId} est introuvable.`);
    return instance;
  }

  private getDefinition(definitionId: EntityId) {
    const definition = this.state.definitions.find((item) => item.id === definitionId);
    if (!definition) throw new Error(`Le workflow ${definitionId} est introuvable.`);
    return definition;
  }

  private recordEvent(event: WorkflowEvent) {
    this.state.events.push(clone(event));
  }
}
