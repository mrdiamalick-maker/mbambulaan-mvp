import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export type ProductOperationType =
  | "onboarding"
  | "expected_return"
  | "landing"
  | "weighing"
  | "lot_creation"
  | "service_request"
  | "service_allocation"
  | "service_execution"
  | "commercial_commitment"
  | "reception"
  | "incident"
  | "program"
  | "financing"
  | "insurance"
  | "public_decision";

export type ProductOperationStatus =
  | "draft"
  | "pending"
  | "ready"
  | "in_progress"
  | "blocked"
  | "completed"
  | "cancelled";

export interface ProductOperation {
  id: EntityId;
  type: ProductOperationType;
  status: ProductOperationStatus;
  actorKind: MvpActorKind;
  actorId: EntityId;
  organizationId?: EntityId;
  territoryId: EntityId;
  subjectId?: EntityId;
  parentOperationId?: EntityId;
  workflowCode: string;
  currentStepCode: string;
  data: Record<string, unknown>;
  blockingReasons: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  completedAt?: ISODateTime;
}

export interface OperationStepDefinition {
  code: string;
  name: string;
  actorKinds: MvpActorKind[];
  requiredDataKeys: string[];
  allowedFromStatuses: ProductOperationStatus[];
  successStatus: ProductOperationStatus;
  nextStepCodes: string[];
  emittedEventType: string;
  coordinationTargets: MvpActorKind[];
  createsChildOperationTypes?: ProductOperationType[];
}

export interface ProductWorkflowDefinition {
  code: string;
  name: string;
  operationType: ProductOperationType;
  entryStepCode: string;
  terminalStepCodes: string[];
  steps: OperationStepDefinition[];
  measurableOutcomes: string[];
}

export interface ProductEvent {
  id: EntityId;
  operationId: EntityId;
  eventType: string;
  actorKind: MvpActorKind;
  actorId: EntityId;
  territoryId: EntityId;
  payload: Record<string, unknown>;
  occurredAt: ISODateTime;
}

export interface ProductOperationCommand {
  operationId: EntityId;
  stepCode: string;
  actorKind: MvpActorKind;
  actorId: EntityId;
  data?: Record<string, unknown>;
  occurredAt: ISODateTime;
}

export interface ProductOperationExecutionResult {
  operation: ProductOperation;
  event: ProductEvent;
  coordinationTargets: MvpActorKind[];
  suggestedChildOperations: ProductOperationType[];
}

const workflows: ProductWorkflowDefinition[] = [
  {
    code: "fisher_onboarding",
    name: "Enrôlement opérationnel d'un pêcheur",
    operationType: "onboarding",
    entryStepCode: "collect_identity",
    terminalStepCodes: ["activate_profile"],
    measurableOutcomes: ["profil vérifié", "pirogue rattachée", "site de référence défini"],
    steps: [
      {
        code: "collect_identity",
        name: "Collecter l'identité et les contacts",
        actorKinds: ["fisher", "cooperative"],
        requiredDataKeys: ["full_name", "phone"],
        allowedFromStatuses: ["draft", "pending"],
        successStatus: "in_progress",
        nextStepCodes: ["attach_vessel"],
        emittedEventType: "onboarding.identity_collected",
        coordinationTargets: ["cooperative"],
      },
      {
        code: "attach_vessel",
        name: "Rattacher la pirogue et le site",
        actorKinds: ["fisher", "cooperative"],
        requiredDataKeys: ["vessel_id", "landing_site_id"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "in_progress",
        nextStepCodes: ["verify_membership"],
        emittedEventType: "onboarding.vessel_attached",
        coordinationTargets: ["landing_site", "cooperative"],
      },
      {
        code: "verify_membership",
        name: "Vérifier le rattachement organisationnel",
        actorKinds: ["cooperative"],
        requiredDataKeys: ["membership_status"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "ready",
        nextStepCodes: ["activate_profile"],
        emittedEventType: "onboarding.membership_verified",
        coordinationTargets: ["fisher"],
      },
      {
        code: "activate_profile",
        name: "Activer le profil opérationnel",
        actorKinds: ["cooperative"],
        requiredDataKeys: ["activation_confirmed"],
        allowedFromStatuses: ["ready"],
        successStatus: "completed",
        nextStepCodes: [],
        emittedEventType: "onboarding.completed",
        coordinationTargets: ["fisher", "landing_site"],
      },
    ],
  },
  {
    code: "expected_return_to_landing",
    name: "Du retour attendu au débarquement confirmé",
    operationType: "expected_return",
    entryStepCode: "announce_return",
    terminalStepCodes: ["confirm_landing"],
    measurableOutcomes: ["arrivée anticipée", "écart horaire calculé", "site préparé"],
    steps: [
      {
        code: "announce_return",
        name: "Annoncer le retour attendu",
        actorKinds: ["fisher"],
        requiredDataKeys: ["vessel_id", "landing_site_id", "estimated_arrival_at"],
        allowedFromStatuses: ["draft", "pending"],
        successStatus: "ready",
        nextStepCodes: ["prepare_arrival", "confirm_landing"],
        emittedEventType: "expected_return.announced",
        coordinationTargets: ["cooperative", "landing_site", "logistics"],
        createsChildOperationTypes: ["service_request"],
      },
      {
        code: "prepare_arrival",
        name: "Préparer l'accueil au site",
        actorKinds: ["landing_site", "cooperative"],
        requiredDataKeys: ["capacity_status"],
        allowedFromStatuses: ["ready", "in_progress"],
        successStatus: "in_progress",
        nextStepCodes: ["confirm_landing"],
        emittedEventType: "expected_return.arrival_prepared",
        coordinationTargets: ["fisher", "logistics"],
      },
      {
        code: "confirm_landing",
        name: "Confirmer le débarquement",
        actorKinds: ["landing_site", "cooperative"],
        requiredDataKeys: ["actual_arrival_at"],
        allowedFromStatuses: ["ready", "in_progress"],
        successStatus: "completed",
        nextStepCodes: [],
        emittedEventType: "landing.confirmed",
        coordinationTargets: ["fisher", "cooperative", "landing_site"],
        createsChildOperationTypes: ["weighing"],
      },
    ],
  },
  {
    code: "landing_to_lot",
    name: "Du débarquement au lot traçable",
    operationType: "weighing",
    entryStepCode: "register_weighing",
    terminalStepCodes: ["publish_lot"],
    measurableOutcomes: ["poids fiable", "lot traçable", "offre disponible"],
    steps: [
      {
        code: "register_weighing",
        name: "Enregistrer la pesée",
        actorKinds: ["landing_site"],
        requiredDataKeys: ["landing_id", "species", "gross_weight", "net_weight"],
        allowedFromStatuses: ["draft", "pending"],
        successStatus: "in_progress",
        nextStepCodes: ["validate_weighing"],
        emittedEventType: "weighing.registered",
        coordinationTargets: ["fisher", "cooperative"],
      },
      {
        code: "validate_weighing",
        name: "Valider la donnée de référence",
        actorKinds: ["landing_site", "cooperative"],
        requiredDataKeys: ["validation_status"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "ready",
        nextStepCodes: ["create_lot"],
        emittedEventType: "weighing.validated",
        coordinationTargets: ["fisher", "cooperative"],
      },
      {
        code: "create_lot",
        name: "Créer le lot",
        actorKinds: ["landing_site", "cooperative"],
        requiredDataKeys: ["owner_id", "available_quantity"],
        allowedFromStatuses: ["ready"],
        successStatus: "in_progress",
        nextStepCodes: ["publish_lot"],
        emittedEventType: "lot.created",
        coordinationTargets: ["buyer", "processor"],
      },
      {
        code: "publish_lot",
        name: "Publier la disponibilité du lot",
        actorKinds: ["cooperative"],
        requiredDataKeys: ["availability_status"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "completed",
        nextStepCodes: [],
        emittedEventType: "lot.available",
        coordinationTargets: ["buyer", "processor", "logistics"],
        createsChildOperationTypes: ["commercial_commitment"],
      },
    ],
  },
  {
    code: "service_need_to_execution",
    name: "Du besoin de service à l'exécution",
    operationType: "service_request",
    entryStepCode: "create_need",
    terminalStepCodes: ["confirm_execution", "cancel_need"],
    measurableOutcomes: ["besoin couvert", "délai d'allocation", "preuve d'exécution"],
    steps: [
      {
        code: "create_need",
        name: "Créer un besoin de service",
        actorKinds: ["fisher", "landing_site", "cooperative", "buyer"],
        requiredDataKeys: ["service_type", "required_at", "quantity", "location_id"],
        allowedFromStatuses: ["draft", "pending"],
        successStatus: "ready",
        nextStepCodes: ["allocate_capacity", "cancel_need"],
        emittedEventType: "service_need.created",
        coordinationTargets: ["logistics", "landing_site", "cooperative"],
        createsChildOperationTypes: ["service_allocation"],
      },
      {
        code: "allocate_capacity",
        name: "Affecter une capacité",
        actorKinds: ["landing_site", "cooperative", "logistics"],
        requiredDataKeys: ["capacity_id", "provider_id"],
        allowedFromStatuses: ["ready", "blocked"],
        successStatus: "in_progress",
        nextStepCodes: ["accept_allocation", "cancel_need"],
        emittedEventType: "service_allocation.created",
        coordinationTargets: ["logistics", "fisher", "buyer"],
      },
      {
        code: "accept_allocation",
        name: "Accepter la mission",
        actorKinds: ["logistics"],
        requiredDataKeys: ["accepted"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "in_progress",
        nextStepCodes: ["confirm_execution"],
        emittedEventType: "service_allocation.accepted",
        coordinationTargets: ["fisher", "landing_site", "cooperative", "buyer"],
      },
      {
        code: "confirm_execution",
        name: "Confirmer l'exécution",
        actorKinds: ["logistics", "landing_site", "cooperative"],
        requiredDataKeys: ["completed_at"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "completed",
        nextStepCodes: [],
        emittedEventType: "service_execution.confirmed",
        coordinationTargets: ["fisher", "buyer", "cooperative", "landing_site"],
      },
      {
        code: "cancel_need",
        name: "Annuler le besoin",
        actorKinds: ["fisher", "landing_site", "cooperative", "buyer"],
        requiredDataKeys: ["cancellation_reason"],
        allowedFromStatuses: ["ready", "in_progress", "blocked"],
        successStatus: "cancelled",
        nextStepCodes: [],
        emittedEventType: "service_need.cancelled",
        coordinationTargets: ["logistics", "landing_site", "cooperative"],
      },
    ],
  },
  {
    code: "lot_to_reception",
    name: "Du lot à la réception",
    operationType: "commercial_commitment",
    entryStepCode: "create_commitment",
    terminalStepCodes: ["confirm_reception", "close_dispute", "cancel_commitment"],
    measurableOutcomes: ["volume engagé", "taux d'exécution", "litiges résolus"],
    steps: [
      {
        code: "create_commitment",
        name: "Créer l'engagement",
        actorKinds: ["buyer", "processor"],
        requiredDataKeys: ["lot_id", "quantity", "terms"],
        allowedFromStatuses: ["draft", "pending"],
        successStatus: "ready",
        nextStepCodes: ["confirm_preparation", "cancel_commitment"],
        emittedEventType: "commitment.created",
        coordinationTargets: ["fisher", "cooperative", "logistics"],
      },
      {
        code: "confirm_preparation",
        name: "Confirmer la préparation du lot",
        actorKinds: ["cooperative", "fisher"],
        requiredDataKeys: ["prepared_quantity"],
        allowedFromStatuses: ["ready"],
        successStatus: "in_progress",
        nextStepCodes: ["confirm_reception", "open_dispute"],
        emittedEventType: "commitment.prepared",
        coordinationTargets: ["buyer", "processor", "logistics"],
      },
      {
        code: "confirm_reception",
        name: "Confirmer la réception",
        actorKinds: ["buyer", "processor"],
        requiredDataKeys: ["received_quantity", "received_at"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "completed",
        nextStepCodes: [],
        emittedEventType: "lot.reception_confirmed",
        coordinationTargets: ["fisher", "cooperative", "logistics"],
      },
      {
        code: "open_dispute",
        name: "Ouvrir un litige",
        actorKinds: ["buyer", "processor", "cooperative", "fisher"],
        requiredDataKeys: ["issue_type", "description"],
        allowedFromStatuses: ["in_progress"],
        successStatus: "blocked",
        nextStepCodes: ["close_dispute", "cancel_commitment"],
        emittedEventType: "commitment.dispute_opened",
        coordinationTargets: ["buyer", "processor", "cooperative", "fisher", "public_agency"],
        createsChildOperationTypes: ["incident"],
      },
      {
        code: "close_dispute",
        name: "Clôturer le litige",
        actorKinds: ["buyer", "processor", "cooperative", "public_agency"],
        requiredDataKeys: ["resolution"],
        allowedFromStatuses: ["blocked"],
        successStatus: "completed",
        nextStepCodes: [],
        emittedEventType: "commitment.dispute_resolved",
        coordinationTargets: ["buyer", "processor", "cooperative", "fisher"],
      },
      {
        code: "cancel_commitment",
        name: "Annuler l'engagement",
        actorKinds: ["buyer", "processor", "cooperative"],
        requiredDataKeys: ["cancellation_reason"],
        allowedFromStatuses: ["ready", "in_progress", "blocked"],
        successStatus: "cancelled",
        nextStepCodes: [],
        emittedEventType: "commitment.cancelled",
        coordinationTargets: ["fisher", "cooperative", "logistics"],
      },
    ],
  },
  {
    code: "incident_to_resolution",
    name: "De l'incident à la résolution",
    operationType: "incident",
    entryStepCode: "report_incident",
    terminalStepCodes: ["close_incident"],
    measurableOutcomes: ["temps de résolution", "cause documentée", "action préventive"],
    steps: [
      {
        code: "report_incident",
        name: "Signaler l'incident",
        actorKinds: ["fisher", "cooperative", "landing_site", "buyer", "processor", "logistics"],
        requiredDataKeys: ["incident_type", "description", "severity"],
        allowedFromStatuses: ["draft", "pending"],
        successStatus: "ready",
        nextStepCodes: ["assign_incident"],
        emittedEventType: "incident.reported",
        coordinationTargets: ["cooperative", "landing_site", "public_agency"],
      },
      {
        code: "assign_incident",
        name: "Assigner un responsable",
        actorKinds: ["cooperative", "landing_site", "public_agency"],
        requiredDataKeys: ["assignee_id"],
        allowedFromStatuses: ["ready"],
        successStatus: "in_progress",
        nextStepCodes: ["resolve_incident", "escalate_incident"],
        emittedEventType: "incident.assigned",
        coordinationTargets: ["public_agency", "ministry"],
      },
      {
        code: "escalate_incident",
        name: "Escalader l'incident",
        actorKinds: ["cooperative", "landing_site", "public_agency"],
        requiredDataKeys: ["escalation_reason"],
        allowedFromStatuses: ["in_progress", "blocked"],
        successStatus: "blocked",
        nextStepCodes: ["resolve_incident"],
        emittedEventType: "incident.escalated",
        coordinationTargets: ["public_agency", "ministry"],
      },
      {
        code: "resolve_incident",
        name: "Résoudre l'incident",
        actorKinds: ["cooperative", "landing_site", "public_agency", "ministry"],
        requiredDataKeys: ["resolution", "root_cause"],
        allowedFromStatuses: ["in_progress", "blocked"],
        successStatus: "ready",
        nextStepCodes: ["close_incident"],
        emittedEventType: "incident.resolved",
        coordinationTargets: ["fisher", "buyer", "processor", "logistics", "cooperative", "landing_site"],
      },
      {
        code: "close_incident",
        name: "Clôturer et capitaliser",
        actorKinds: ["cooperative", "landing_site", "public_agency"],
        requiredDataKeys: ["closure_confirmed"],
        allowedFromStatuses: ["ready"],
        successStatus: "completed",
        nextStepCodes: [],
        emittedEventType: "incident.closed",
        coordinationTargets: ["ministry", "development_partner"],
        createsChildOperationTypes: ["public_decision"],
      },
    ],
  },
];

export class ProductOperationsEngine {
  private readonly operations = new Map<EntityId, ProductOperation>();
  private readonly events: ProductEvent[] = [];

  createOperation(input: {
    id: EntityId;
    type: ProductOperationType;
    actorKind: MvpActorKind;
    actorId: EntityId;
    organizationId?: EntityId;
    territoryId: EntityId;
    subjectId?: EntityId;
    parentOperationId?: EntityId;
    workflowCode: string;
    data?: Record<string, unknown>;
    createdAt: ISODateTime;
  }): ProductOperation {
    if (this.operations.has(input.id)) throw new Error(`L'opération ${input.id} existe déjà.`);
    const workflow = this.getWorkflow(input.workflowCode);
    if (workflow.operationType !== input.type) {
      throw new Error(`Le workflow ${workflow.code} ne correspond pas au type ${input.type}.`);
    }

    const operation: ProductOperation = {
      id: input.id,
      type: input.type,
      status: "draft",
      actorKind: input.actorKind,
      actorId: input.actorId,
      organizationId: input.organizationId,
      territoryId: input.territoryId,
      subjectId: input.subjectId,
      parentOperationId: input.parentOperationId,
      workflowCode: input.workflowCode,
      currentStepCode: workflow.entryStepCode,
      data: { ...(input.data ?? {}) },
      blockingReasons: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.operations.set(operation.id, operation);
    return structuredClone(operation);
  }

  execute(command: ProductOperationCommand): ProductOperationExecutionResult {
    const operation = this.requireOperation(command.operationId);
    const workflow = this.getWorkflow(operation.workflowCode);
    const step = workflow.steps.find((item) => item.code === command.stepCode);
    if (!step) throw new Error(`Étape inconnue ${command.stepCode} pour ${workflow.code}.`);
    if (!step.actorKinds.includes(command.actorKind)) {
      throw new Error(`L'acteur ${command.actorKind} ne peut pas exécuter ${step.code}.`);
    }
    if (!step.allowedFromStatuses.includes(operation.status)) {
      throw new Error(`L'étape ${step.code} n'est pas autorisée depuis le statut ${operation.status}.`);
    }

    const mergedData = { ...operation.data, ...(command.data ?? {}) };
    const missing = step.requiredDataKeys.filter((key) => mergedData[key] === undefined || mergedData[key] === null || mergedData[key] === "");
    if (missing.length > 0) {
      operation.status = "blocked";
      operation.blockingReasons = missing.map((key) => `Donnée requise manquante : ${key}`);
      operation.updatedAt = command.occurredAt;
      this.operations.set(operation.id, operation);
      throw new Error(operation.blockingReasons.join("; "));
    }

    operation.data = mergedData;
    operation.status = step.successStatus;
    operation.blockingReasons = [];
    operation.updatedAt = command.occurredAt;
    if (step.successStatus === "completed" || step.successStatus === "cancelled") {
      operation.completedAt = command.occurredAt;
    }
    operation.currentStepCode = step.nextStepCodes[0] ?? step.code;

    const event: ProductEvent = {
      id: `${operation.id}:${step.code}:${this.events.length + 1}`,
      operationId: operation.id,
      eventType: step.emittedEventType,
      actorKind: command.actorKind,
      actorId: command.actorId,
      territoryId: operation.territoryId,
      payload: {
        operationType: operation.type,
        workflowCode: operation.workflowCode,
        stepCode: step.code,
        status: operation.status,
        ...command.data,
      },
      occurredAt: command.occurredAt,
    };

    this.operations.set(operation.id, operation);
    this.events.push(event);

    return {
      operation: structuredClone(operation),
      event: structuredClone(event),
      coordinationTargets: [...step.coordinationTargets],
      suggestedChildOperations: [...(step.createsChildOperationTypes ?? [])],
    };
  }

  blockOperation(operationId: EntityId, reasons: string[], at: ISODateTime) {
    const operation = this.requireOperation(operationId);
    operation.status = "blocked";
    operation.blockingReasons = [...reasons];
    operation.updatedAt = at;
    this.operations.set(operation.id, operation);
    return structuredClone(operation);
  }

  resumeOperation(operationId: EntityId, nextStepCode: string, at: ISODateTime) {
    const operation = this.requireOperation(operationId);
    const workflow = this.getWorkflow(operation.workflowCode);
    if (!workflow.steps.some((item) => item.code === nextStepCode)) {
      throw new Error(`Étape de reprise inconnue : ${nextStepCode}.`);
    }
    operation.status = "in_progress";
    operation.blockingReasons = [];
    operation.currentStepCode = nextStepCode;
    operation.updatedAt = at;
    this.operations.set(operation.id, operation);
    return structuredClone(operation);
  }

  getOperation(operationId: EntityId) {
    return structuredClone(this.requireOperation(operationId));
  }

  listOperations(filters?: {
    actorId?: EntityId;
    territoryId?: EntityId;
    type?: ProductOperationType;
    status?: ProductOperationStatus;
  }) {
    return [...this.operations.values()]
      .filter((item) => !filters?.actorId || item.actorId === filters.actorId)
      .filter((item) => !filters?.territoryId || item.territoryId === filters.territoryId)
      .filter((item) => !filters?.type || item.type === filters.type)
      .filter((item) => !filters?.status || item.status === filters.status)
      .map((item) => structuredClone(item));
  }

  listEvents(operationId?: EntityId) {
    return this.events
      .filter((event) => !operationId || event.operationId === operationId)
      .map((event) => structuredClone(event));
  }

  snapshot() {
    return {
      workflows: structuredClone(workflows),
      operations: this.listOperations(),
      events: this.listEvents(),
    };
  }

  private getWorkflow(code: string) {
    const workflow = workflows.find((item) => item.code === code);
    if (!workflow) throw new Error(`Workflow produit introuvable : ${code}.`);
    return workflow;
  }

  private requireOperation(id: EntityId) {
    const operation = this.operations.get(id);
    if (!operation) throw new Error(`Opération produit introuvable : ${id}.`);
    return operation;
  }
}

export function getProductWorkflowCatalog() {
  return structuredClone(workflows);
}

export function validateProductWorkflowCatalog() {
  const errors: string[] = [];
  for (const workflow of workflows) {
    const stepCodes = new Set(workflow.steps.map((item) => item.code));
    if (!stepCodes.has(workflow.entryStepCode)) {
      errors.push(`${workflow.code}: étape d'entrée introuvable ${workflow.entryStepCode}.`);
    }
    for (const terminal of workflow.terminalStepCodes) {
      if (!stepCodes.has(terminal)) errors.push(`${workflow.code}: étape terminale introuvable ${terminal}.`);
    }
    for (const step of workflow.steps) {
      for (const next of step.nextStepCodes) {
        if (!stepCodes.has(next)) errors.push(`${workflow.code}/${step.code}: étape suivante introuvable ${next}.`);
      }
      if (step.actorKinds.length === 0) errors.push(`${workflow.code}/${step.code}: aucun acteur autorisé.`);
      if (step.coordinationTargets.length === 0 && step.nextStepCodes.length > 0) {
        errors.push(`${workflow.code}/${step.code}: aucune cible de coordination.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      workflowCount: workflows.length,
      stepCount: workflows.reduce((sum, item) => sum + item.steps.length, 0),
      operationTypesCovered: [...new Set(workflows.map((item) => item.operationType))],
    },
  };
}
