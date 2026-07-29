import type { EntityId, ISODateTime } from "../infrastructures/types";

export type EcosystemOrchestrationStatus =
  | "initializing"
  | "ready"
  | "operating"
  | "under_pressure"
  | "blocked"
  | "completed";

export type EcosystemStage =
  | "ecosystem_setup"
  | "campaign_planning"
  | "fishing_operation"
  | "landing_and_lot_creation"
  | "commercial_coordination"
  | "logistics_and_delivery"
  | "settlement_and_value_distribution"
  | "territorial_supervision"
  | "national_governance";

export type EcosystemActorRole =
  | "fisher"
  | "crew_member"
  | "cooperative"
  | "landing_agent"
  | "quality_agent"
  | "buyer"
  | "logistics_provider"
  | "cold_chain_provider"
  | "processor"
  | "financial_partner"
  | "insurer"
  | "territorial_coordinator"
  | "ministry_decision_maker"
  | "platform_operator";

export interface EcosystemParticipant {
  actorId: EntityId;
  organizationId?: EntityId;
  roles: EcosystemActorRole[];
  territoryIds: EntityId[];
  active: boolean;
  verified: boolean;
  consentEvidenceId?: EntityId;
}

export interface EcosystemCaseLinks {
  fishingCampaignCaseIds: EntityId[];
  saleDeliverySettlementCaseIds: EntityId[];
  cooperativeManagementCaseIds: EntityId[];
  territorialSupervisionCaseIds: EntityId[];
  nationalGovernanceCaseId?: EntityId;
}

export interface EcosystemStageState {
  stage: EcosystemStage;
  status: "not_started" | "ready" | "in_progress" | "blocked" | "completed";
  requiredRoles: EcosystemActorRole[];
  accountableActorId?: EntityId;
  startedAt?: ISODateTime;
  completedAt?: ISODateTime;
  blockers: string[];
  evidenceIds: EntityId[];
  linkedCaseIds: EntityId[];
}

export interface EcosystemSharedReference {
  referenceType:
    | "territory"
    | "landing_site"
    | "organization"
    | "vessel"
    | "campaign"
    | "landing"
    | "lot"
    | "commercial_agreement"
    | "delivery"
    | "payment"
    | "public_program"
    | "intervention";
  canonicalId: EntityId;
  sourceCaseId: EntityId;
  sourceEntityId: EntityId;
  registeredAt: ISODateTime;
}

export interface EcosystemTransition {
  id: EntityId;
  fromStage: EcosystemStage;
  toStage: EcosystemStage;
  status: "requested" | "approved" | "rejected" | "executed";
  requestedByActorId: EntityId;
  approvedByActorId?: EntityId;
  requestedAt: ISODateTime;
  decidedAt?: ISODateTime;
  executedAt?: ISODateTime;
  prerequisites: string[];
  unmetPrerequisites: string[];
  evidenceIds: EntityId[];
  rationale?: string;
}

export interface EcosystemRisk {
  id: EntityId;
  category:
    | "resource"
    | "operational"
    | "quality"
    | "commercial"
    | "logistics"
    | "financial"
    | "social"
    | "compliance"
    | "governance";
  severity: "low" | "medium" | "high" | "critical";
  territoryIds: EntityId[];
  affectedStageIds: EcosystemStage[];
  ownerActorId?: EntityId;
  status: "open" | "mitigating" | "resolved" | "accepted";
  detectedAt: ISODateTime;
  dueAt?: ISODateTime;
  mitigationActions: string[];
  evidenceIds: EntityId[];
}

export interface EcosystemValueFlow {
  id: EntityId;
  sourceActorId?: EntityId;
  beneficiaryActorId?: EntityId;
  payerActorId?: EntityId;
  territoryId: EntityId;
  flowType:
    | "catch_value"
    | "service_fee"
    | "commercial_payment"
    | "platform_revenue"
    | "cooperative_contribution"
    | "public_funding"
    | "financing"
    | "insurance_compensation"
    | "value_protected"
    | "value_created";
  amountXof: number;
  status: "expected" | "committed" | "due" | "paid" | "reconciled" | "cancelled";
  linkedCaseId: EntityId;
  evidenceIds: EntityId[];
  recordedAt: ISODateTime;
}

export interface EcosystemImpactSnapshot {
  grossCommercialValueXof: number;
  sellerNetValueXof: number;
  platformRevenueXof: number;
  publicFundingXof: number;
  financingMobilizedXof: number;
  valueProtectedXof: number;
  additionalValueCreatedXof: number;
  paidValueXof: number;
  reconciledValueXof: number;
  estimatedWasteAvoidedKg: number;
  traceableVolumeKg: number;
  beneficiaryActorCount: number;
  activeTerritoryCount: number;
  resolvedRiskCount: number;
  openCriticalRiskCount: number;
}

export interface EcosystemOrchestrationCase {
  id: EntityId;
  ecosystemId: EntityId;
  countryId: EntityId;
  status: EcosystemOrchestrationStatus;
  participants: EcosystemParticipant[];
  links: EcosystemCaseLinks;
  stages: EcosystemStageState[];
  sharedReferences: EcosystemSharedReference[];
  transitions: EcosystemTransition[];
  risks: EcosystemRisk[];
  valueFlows: EcosystemValueFlow[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  events: Array<{
    id: EntityId;
    type: string;
    occurredAt: ISODateTime;
    actorId?: EntityId;
    details: Record<string, unknown>;
  }>;
}

export interface EcosystemReadinessAssessment {
  caseId: EntityId;
  score: number;
  readyToOperate: boolean;
  participantCoveragePercent: number;
  stageCoveragePercent: number;
  evidenceCoveragePercent: number;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export interface EcosystemCommandCenter {
  caseId: EntityId;
  ecosystemId: EntityId;
  status: EcosystemOrchestrationStatus;
  readiness: EcosystemReadinessAssessment;
  impact: EcosystemImpactSnapshot;
  stages: EcosystemStageState[];
  criticalRisks: EcosystemRisk[];
  pendingTransitions: EcosystemTransition[];
  activeParticipantsByRole: Record<EcosystemActorRole, number>;
  unresolvedBlockers: string[];
  generatedAt: ISODateTime;
}

const STAGE_SEQUENCE: EcosystemStage[] = [
  "ecosystem_setup",
  "campaign_planning",
  "fishing_operation",
  "landing_and_lot_creation",
  "commercial_coordination",
  "logistics_and_delivery",
  "settlement_and_value_distribution",
  "territorial_supervision",
  "national_governance",
];

const REQUIRED_ROLES: Record<EcosystemStage, EcosystemActorRole[]> = {
  ecosystem_setup: ["platform_operator", "territorial_coordinator"],
  campaign_planning: ["fisher", "cooperative", "territorial_coordinator"],
  fishing_operation: ["fisher"],
  landing_and_lot_creation: ["fisher", "landing_agent", "quality_agent"],
  commercial_coordination: ["cooperative", "buyer"],
  logistics_and_delivery: ["buyer", "logistics_provider"],
  settlement_and_value_distribution: ["cooperative", "buyer", "financial_partner"],
  territorial_supervision: ["territorial_coordinator"],
  national_governance: ["ministry_decision_maker"],
};

export class EndToEndFisheriesEcosystemOrchestrationCapability {
  private readonly cases = new Map<EntityId, EcosystemOrchestrationCase>();

  openEcosystem(input: {
    id: EntityId;
    ecosystemId: EntityId;
    countryId: EntityId;
    createdAt: ISODateTime;
    actorId?: EntityId;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier d'orchestration ${input.id} existe déjà.`);
    const item: EcosystemOrchestrationCase = {
      id: input.id,
      ecosystemId: input.ecosystemId,
      countryId: input.countryId,
      status: "initializing",
      participants: [],
      links: {
        fishingCampaignCaseIds: [],
        saleDeliverySettlementCaseIds: [],
        cooperativeManagementCaseIds: [],
        territorialSupervisionCaseIds: [],
      },
      stages: STAGE_SEQUENCE.map((stage) => ({
        stage,
        status: stage === "ecosystem_setup" ? "in_progress" : "not_started",
        requiredRoles: [...REQUIRED_ROLES[stage]],
        blockers: [],
        evidenceIds: [],
        linkedCaseIds: [],
        startedAt: stage === "ecosystem_setup" ? input.createdAt : undefined,
      })),
      sharedReferences: [],
      transitions: [],
      risks: [],
      valueFlows: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      events: [this.event(`event:${input.id}:opened`, "ecosystem_orchestration_opened", input.createdAt, input.actorId, {})],
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  registerParticipant(input: {
    caseId: EntityId;
    participant: EcosystemParticipant;
    registeredAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const existingIndex = item.participants.findIndex((participant) => participant.actorId === input.participant.actorId);
    if (existingIndex >= 0) item.participants[existingIndex] = structuredClone(input.participant);
    else item.participants.push(structuredClone(input.participant));
    this.refreshStageReadiness(item);
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:participant:${input.participant.actorId}`, "ecosystem_participant_registered", input.registeredAt, input.actorId, { actorId: input.participant.actorId, roles: input.participant.roles }));
    return structuredClone(item);
  }

  linkCapabilityCase(input: {
    caseId: EntityId;
    capability: "fishing_campaign" | "sale_delivery_settlement" | "cooperative_management" | "territorial_supervision" | "national_governance";
    linkedCaseId: EntityId;
    linkedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    if (input.capability === "fishing_campaign") {
      item.links.fishingCampaignCaseIds = this.unique([...item.links.fishingCampaignCaseIds, input.linkedCaseId]);
      this.linkCaseToStages(item, input.linkedCaseId, ["campaign_planning", "fishing_operation", "landing_and_lot_creation"]);
    } else if (input.capability === "sale_delivery_settlement") {
      item.links.saleDeliverySettlementCaseIds = this.unique([...item.links.saleDeliverySettlementCaseIds, input.linkedCaseId]);
      this.linkCaseToStages(item, input.linkedCaseId, ["commercial_coordination", "logistics_and_delivery", "settlement_and_value_distribution"]);
    } else if (input.capability === "cooperative_management") {
      item.links.cooperativeManagementCaseIds = this.unique([...item.links.cooperativeManagementCaseIds, input.linkedCaseId]);
      this.linkCaseToStages(item, input.linkedCaseId, ["ecosystem_setup", "campaign_planning", "commercial_coordination", "settlement_and_value_distribution"]);
    } else if (input.capability === "territorial_supervision") {
      item.links.territorialSupervisionCaseIds = this.unique([...item.links.territorialSupervisionCaseIds, input.linkedCaseId]);
      this.linkCaseToStages(item, input.linkedCaseId, ["territorial_supervision"]);
    } else {
      item.links.nationalGovernanceCaseId = input.linkedCaseId;
      this.linkCaseToStages(item, input.linkedCaseId, ["national_governance"]);
    }
    this.refreshStageReadiness(item);
    this.touch(item, input.linkedAt, this.event(`event:${item.id}:capability:${input.capability}:${input.linkedCaseId}`, "ecosystem_capability_case_linked", input.linkedAt, input.actorId, { capability: input.capability, linkedCaseId: input.linkedCaseId }));
    return structuredClone(item);
  }

  registerCanonicalReference(input: {
    caseId: EntityId;
    reference: EcosystemSharedReference;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const conflict = item.sharedReferences.find((entry) => entry.referenceType === input.reference.referenceType && entry.sourceEntityId === input.reference.sourceEntityId && entry.canonicalId !== input.reference.canonicalId);
    if (conflict) throw new Error(`L'entité ${input.reference.sourceEntityId} est déjà reliée à une autre référence canonique.`);
    const exists = item.sharedReferences.some((entry) => entry.referenceType === input.reference.referenceType && entry.canonicalId === input.reference.canonicalId && entry.sourceCaseId === input.reference.sourceCaseId && entry.sourceEntityId === input.reference.sourceEntityId);
    if (!exists) item.sharedReferences.push(structuredClone(input.reference));
    this.touch(item, input.reference.registeredAt, this.event(`event:${item.id}:reference:${input.reference.referenceType}:${input.reference.canonicalId}`, "ecosystem_canonical_reference_registered", input.reference.registeredAt, input.actorId, { referenceType: input.reference.referenceType, canonicalId: input.reference.canonicalId, sourceCaseId: input.reference.sourceCaseId }));
    return structuredClone(item);
  }

  assignStageAccountability(input: {
    caseId: EntityId;
    stage: EcosystemStage;
    accountableActorId: EntityId;
    assignedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const stage = this.requireStage(item, input.stage);
    const participant = item.participants.find((entry) => entry.actorId === input.accountableActorId && entry.active);
    if (!participant) throw new Error(`L'acteur responsable ${input.accountableActorId} n'est pas actif dans l'écosystème.`);
    if (!participant.roles.some((role) => stage.requiredRoles.includes(role))) throw new Error(`L'acteur ${input.accountableActorId} ne possède aucun rôle requis pour l'étape ${input.stage}.`);
    stage.accountableActorId = input.accountableActorId;
    this.refreshStageReadiness(item);
    this.touch(item, input.assignedAt, this.event(`event:${item.id}:accountability:${input.stage}`, "ecosystem_stage_accountability_assigned", input.assignedAt, input.actorId, { stage: input.stage, accountableActorId: input.accountableActorId }));
    return structuredClone(item);
  }

  requestTransition(input: {
    caseId: EntityId;
    transitionId: EntityId;
    fromStage: EcosystemStage;
    toStage: EcosystemStage;
    requestedByActorId: EntityId;
    prerequisites: string[];
    evidenceIds?: EntityId[];
    requestedAt: ISODateTime;
  }) {
    const item = this.requireCase(input.caseId);
    if (item.transitions.some((transition) => transition.id === input.transitionId)) throw new Error(`La transition ${input.transitionId} existe déjà.`);
    const fromIndex = STAGE_SEQUENCE.indexOf(input.fromStage);
    const toIndex = STAGE_SEQUENCE.indexOf(input.toStage);
    if (toIndex !== fromIndex + 1) throw new Error("Une transition doit relier deux étapes consécutives de la chaîne de valeur.");
    const fromStage = this.requireStage(item, input.fromStage);
    const toStage = this.requireStage(item, input.toStage);
    const unmetPrerequisites: string[] = [];
    if (fromStage.status !== "completed") unmetPrerequisites.push(`L'étape ${input.fromStage} n'est pas terminée.`);
    if (!toStage.accountableActorId) unmetPrerequisites.push(`Aucun responsable n'est assigné à l'étape ${input.toStage}.`);
    if (!this.stageHasRoleCoverage(item, toStage)) unmetPrerequisites.push(`Les rôles requis pour l'étape ${input.toStage} ne sont pas tous couverts.`);
    if (toStage.linkedCaseIds.length === 0 && input.toStage !== "ecosystem_setup") unmetPrerequisites.push(`Aucun dossier métier n'est relié à l'étape ${input.toStage}.`);
    const transition: EcosystemTransition = {
      id: input.transitionId,
      fromStage: input.fromStage,
      toStage: input.toStage,
      status: "requested",
      requestedByActorId: input.requestedByActorId,
      requestedAt: input.requestedAt,
      prerequisites: [...input.prerequisites],
      unmetPrerequisites,
      evidenceIds: [...(input.evidenceIds ?? [])],
    };
    item.transitions.push(transition);
    this.touch(item, input.requestedAt, this.event(`event:${item.id}:transition-requested:${transition.id}`, "ecosystem_transition_requested", input.requestedAt, input.requestedByActorId, { transitionId: transition.id, fromStage: transition.fromStage, toStage: transition.toStage, unmetPrerequisites }));
    return structuredClone(transition);
  }

  decideTransition(input: {
    caseId: EntityId;
    transitionId: EntityId;
    approved: boolean;
    approvedByActorId: EntityId;
    rationale: string;
    evidenceIds?: EntityId[];
    decidedAt: ISODateTime;
  }) {
    const item = this.requireCase(input.caseId);
    const transition = this.requireTransition(item, input.transitionId);
    if (transition.status !== "requested") throw new Error(`La transition ${transition.id} n'est plus en attente de décision.`);
    transition.status = input.approved && transition.unmetPrerequisites.length === 0 ? "approved" : "rejected";
    transition.approvedByActorId = input.approvedByActorId;
    transition.decidedAt = input.decidedAt;
    transition.rationale = input.rationale;
    transition.evidenceIds = this.unique([...transition.evidenceIds, ...(input.evidenceIds ?? [])]);
    this.touch(item, input.decidedAt, this.event(`event:${item.id}:transition-decided:${transition.id}`, "ecosystem_transition_decided", input.decidedAt, input.approvedByActorId, { transitionId: transition.id, status: transition.status, rationale: input.rationale }));
    return structuredClone(transition);
  }

  executeTransition(input: {
    caseId: EntityId;
    transitionId: EntityId;
    executedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const transition = this.requireTransition(item, input.transitionId);
    if (transition.status !== "approved") throw new Error(`La transition ${transition.id} n'est pas approuvée.`);
    const toStage = this.requireStage(item, transition.toStage);
    transition.status = "executed";
    transition.executedAt = input.executedAt;
    toStage.status = "in_progress";
    toStage.startedAt = input.executedAt;
    item.status = "operating";
    this.touch(item, input.executedAt, this.event(`event:${item.id}:transition-executed:${transition.id}`, "ecosystem_transition_executed", input.executedAt, input.actorId, { transitionId: transition.id, toStage: transition.toStage }));
    return structuredClone(item);
  }

  completeStage(input: {
    caseId: EntityId;
    stage: EcosystemStage;
    evidenceIds: EntityId[];
    completedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const stage = this.requireStage(item, input.stage);
    if (stage.status !== "in_progress" && stage.status !== "ready") throw new Error(`L'étape ${input.stage} ne peut pas être terminée depuis le statut ${stage.status}.`);
    if (!stage.accountableActorId) throw new Error(`Aucun responsable n'est assigné à l'étape ${input.stage}.`);
    if (!this.stageHasRoleCoverage(item, stage)) throw new Error(`Les rôles requis pour l'étape ${input.stage} ne sont pas couverts.`);
    if (input.evidenceIds.length === 0) throw new Error(`Une preuve est obligatoire pour terminer l'étape ${input.stage}.`);
    stage.status = "completed";
    stage.completedAt = input.completedAt;
    stage.evidenceIds = this.unique([...stage.evidenceIds, ...input.evidenceIds]);
    stage.blockers = [];
    const nextStage = this.nextStage(item, input.stage);
    if (nextStage && nextStage.status === "not_started" && this.stageHasRoleCoverage(item, nextStage) && nextStage.accountableActorId && nextStage.linkedCaseIds.length > 0) nextStage.status = "ready";
    if (input.stage === "national_governance") item.status = "completed";
    this.touch(item, input.completedAt, this.event(`event:${item.id}:stage-completed:${input.stage}`, "ecosystem_stage_completed", input.completedAt, input.actorId, { stage: input.stage, evidenceIds: input.evidenceIds }));
    return structuredClone(item);
  }

  reportRisk(input: { caseId: EntityId; risk: EcosystemRisk; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.risks.some((risk) => risk.id === input.risk.id)) throw new Error(`Le risque ${input.risk.id} existe déjà.`);
    item.risks.push(structuredClone(input.risk));
    for (const stageId of input.risk.affectedStageIds) {
      const stage = this.requireStage(item, stageId);
      if (input.risk.severity === "critical") {
        stage.status = "blocked";
        stage.blockers = this.unique([...stage.blockers, `Risque critique ${input.risk.id}.`]);
      }
    }
    if (input.risk.severity === "critical") item.status = "blocked";
    else if (input.risk.severity === "high" && item.status !== "blocked") item.status = "under_pressure";
    this.touch(item, input.risk.detectedAt, this.event(`event:${item.id}:risk:${input.risk.id}`, "ecosystem_risk_reported", input.risk.detectedAt, input.actorId, { riskId: input.risk.id, category: input.risk.category, severity: input.risk.severity }));
    return structuredClone(item);
  }

  resolveRisk(input: {
    caseId: EntityId;
    riskId: EntityId;
    evidenceIds: EntityId[];
    lessonsLearned?: string[];
    resolvedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const risk = this.requireRisk(item, input.riskId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour résoudre un risque.");
    risk.status = "resolved";
    risk.evidenceIds = this.unique([...risk.evidenceIds, ...input.evidenceIds]);
    for (const stageId of risk.affectedStageIds) {
      const stage = this.requireStage(item, stageId);
      stage.blockers = stage.blockers.filter((blocker) => !blocker.includes(risk.id));
      if (stage.status === "blocked" && stage.blockers.length === 0) stage.status = stage.startedAt ? "in_progress" : "ready";
    }
    const openCriticalRisks = item.risks.filter((entry) => entry.status !== "resolved" && entry.severity === "critical");
    if (openCriticalRisks.length === 0 && item.status === "blocked") item.status = "operating";
    this.touch(item, input.resolvedAt, this.event(`event:${item.id}:risk-resolved:${risk.id}`, "ecosystem_risk_resolved", input.resolvedAt, input.actorId, { riskId: risk.id, lessonsLearned: input.lessonsLearned ?? [] }));
    return structuredClone(item);
  }

  recordValueFlow(input: { caseId: EntityId; flow: EcosystemValueFlow; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (input.flow.amountXof < 0) throw new Error("Un flux de valeur ne peut pas avoir un montant négatif.");
    if (item.valueFlows.some((flow) => flow.id === input.flow.id)) throw new Error(`Le flux de valeur ${input.flow.id} existe déjà.`);
    item.valueFlows.push(structuredClone(input.flow));
    this.touch(item, input.flow.recordedAt, this.event(`event:${item.id}:value-flow:${input.flow.id}`, "ecosystem_value_flow_recorded", input.flow.recordedAt, input.actorId, { flowId: input.flow.id, flowType: input.flow.flowType, amountXof: input.flow.amountXof, status: input.flow.status }));
    return structuredClone(item);
  }

  reconcileValueFlow(input: {
    caseId: EntityId;
    flowId: EntityId;
    evidenceIds: EntityId[];
    reconciledAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const flow = item.valueFlows.find((entry) => entry.id === input.flowId);
    if (!flow) throw new Error(`Flux de valeur introuvable : ${input.flowId}.`);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour rapprocher un flux de valeur.");
    flow.status = "reconciled";
    flow.evidenceIds = this.unique([...flow.evidenceIds, ...input.evidenceIds]);
    this.touch(item, input.reconciledAt, this.event(`event:${item.id}:value-flow-reconciled:${flow.id}`, "ecosystem_value_flow_reconciled", input.reconciledAt, input.actorId, { flowId: flow.id }));
    return structuredClone(item);
  }

  attachDocument(input: { caseId: EntityId; documentId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.documentIds = this.unique([...item.documentIds, input.documentId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:document:${input.documentId}`, "ecosystem_document_attached", input.attachedAt, input.actorId, { documentId: input.documentId }));
    return structuredClone(item);
  }

  assessReadiness(input: { caseId: EntityId; generatedAt: ISODateTime }): EcosystemReadinessAssessment {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    const warnings: string[] = [];
    const mandatoryRoles = this.unique(STAGE_SEQUENCE.flatMap((stage) => REQUIRED_ROLES[stage]));
    const coveredRoles = mandatoryRoles.filter((role) => item.participants.some((participant) => participant.active && participant.verified && participant.roles.includes(role)));
    const participantCoveragePercent = this.round(coveredRoles.length / mandatoryRoles.length * 100);
    const configuredStages = item.stages.filter((stage) => stage.accountableActorId && (stage.linkedCaseIds.length > 0 || stage.stage === "ecosystem_setup"));
    const stageCoveragePercent = this.round(configuredStages.length / item.stages.length * 100);
    const evidenceBearingStages = item.stages.filter((stage) => stage.status === "completed");
    const evidenceCoveragePercent = evidenceBearingStages.length ? this.round(evidenceBearingStages.filter((stage) => stage.evidenceIds.length > 0).length / evidenceBearingStages.length * 100) : 0;
    if (participantCoveragePercent < 70) blockers.push("La couverture des rôles de la filière est inférieure à 70 %.");
    if (!item.links.fishingCampaignCaseIds.length) blockers.push("Aucune campagne de pêche n'est reliée.");
    if (!item.links.saleDeliverySettlementCaseIds.length) blockers.push("Aucun parcours vente-livraison-règlement n'est relié.");
    if (!item.links.cooperativeManagementCaseIds.length) blockers.push("Aucune coopérative n'est reliée.");
    if (!item.links.territorialSupervisionCaseIds.length) blockers.push("Aucune supervision territoriale n'est reliée.");
    if (!item.links.nationalGovernanceCaseId) blockers.push("Aucun pilotage national n'est relié.");
    if (item.risks.some((risk) => risk.status !== "resolved" && risk.severity === "critical")) blockers.push("Des risques critiques restent ouverts.");
    if (stageCoveragePercent < 80) warnings.push("Moins de 80 % des étapes disposent d'un responsable et d'un dossier métier relié.");
    if (item.participants.some((participant) => participant.active && !participant.verified)) warnings.push("Des participants actifs ne sont pas encore vérifiés.");
    if (item.documentIds.length === 0) warnings.push("Aucun document global d'orchestration n'est attaché.");
    const score = Math.max(0, Math.min(100, 100 - blockers.length * 14 - warnings.length * 5 - (participantCoveragePercent < 90 ? 5 : 0) - (stageCoveragePercent < 90 ? 5 : 0)));
    item.blockers = blockers;
    item.warnings = warnings;
    if (blockers.length === 0 && item.status === "initializing") item.status = "ready";
    this.cases.set(item.id, item);
    return { caseId: item.id, score, readyToOperate: blockers.length === 0, participantCoveragePercent, stageCoveragePercent, evidenceCoveragePercent, blockers, warnings, generatedAt: input.generatedAt };
  }

  getCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }): EcosystemCommandCenter {
    const item = this.requireCase(input.caseId);
    const activeParticipantsByRole = {} as Record<EcosystemActorRole, number>;
    for (const role of this.unique(STAGE_SEQUENCE.flatMap((stage) => REQUIRED_ROLES[stage]))) {
      activeParticipantsByRole[role] = item.participants.filter((participant) => participant.active && participant.roles.includes(role)).length;
    }
    return {
      caseId: item.id,
      ecosystemId: item.ecosystemId,
      status: item.status,
      readiness: this.assessReadiness({ caseId: item.id, generatedAt: input.generatedAt }),
      impact: this.computeImpact(item),
      stages: item.stages.map((stage) => structuredClone(stage)),
      criticalRisks: item.risks.filter((risk) => risk.status !== "resolved" && risk.severity === "critical").map((risk) => structuredClone(risk)),
      pendingTransitions: item.transitions.filter((transition) => transition.status === "requested" || transition.status === "approved").map((transition) => structuredClone(transition)),
      activeParticipantsByRole,
      unresolvedBlockers: this.unique([...item.blockers, ...item.stages.flatMap((stage) => stage.blockers)]),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private computeImpact(item: EcosystemOrchestrationCase): EcosystemImpactSnapshot {
    const sum = (type: EcosystemValueFlow["flowType"], statuses?: EcosystemValueFlow["status"][]) => item.valueFlows
      .filter((flow) => flow.flowType === type && (!statuses || statuses.includes(flow.status)))
      .reduce((total, flow) => total + flow.amountXof, 0);
    return {
      grossCommercialValueXof: sum("commercial_payment"),
      sellerNetValueXof: sum("catch_value", ["paid", "reconciled"]),
      platformRevenueXof: sum("platform_revenue", ["paid", "reconciled"]),
      publicFundingXof: sum("public_funding"),
      financingMobilizedXof: sum("financing"),
      valueProtectedXof: sum("value_protected"),
      additionalValueCreatedXof: sum("value_created"),
      paidValueXof: item.valueFlows.filter((flow) => flow.status === "paid" || flow.status === "reconciled").reduce((total, flow) => total + flow.amountXof, 0),
      reconciledValueXof: item.valueFlows.filter((flow) => flow.status === "reconciled").reduce((total, flow) => total + flow.amountXof, 0),
      estimatedWasteAvoidedKg: 0,
      traceableVolumeKg: 0,
      beneficiaryActorCount: new Set(item.valueFlows.map((flow) => flow.beneficiaryActorId).filter(Boolean)).size,
      activeTerritoryCount: new Set(item.participants.flatMap((participant) => participant.territoryIds)).size,
      resolvedRiskCount: item.risks.filter((risk) => risk.status === "resolved").length,
      openCriticalRiskCount: item.risks.filter((risk) => risk.status !== "resolved" && risk.severity === "critical").length,
    };
  }

  private refreshStageReadiness(item: EcosystemOrchestrationCase) {
    for (const stage of item.stages) {
      if (stage.status === "not_started" && this.stageHasRoleCoverage(item, stage) && stage.accountableActorId && (stage.linkedCaseIds.length > 0 || stage.stage === "ecosystem_setup")) stage.status = "ready";
    }
  }

  private stageHasRoleCoverage(item: EcosystemOrchestrationCase, stage: EcosystemStageState) {
    return stage.requiredRoles.every((role) => item.participants.some((participant) => participant.active && participant.verified && participant.roles.includes(role)));
  }

  private linkCaseToStages(item: EcosystemOrchestrationCase, linkedCaseId: EntityId, stages: EcosystemStage[]) {
    for (const stageId of stages) {
      const stage = this.requireStage(item, stageId);
      stage.linkedCaseIds = this.unique([...stage.linkedCaseIds, linkedCaseId]);
    }
  }

  private nextStage(item: EcosystemOrchestrationCase, stage: EcosystemStage) {
    const index = STAGE_SEQUENCE.indexOf(stage);
    return index >= 0 && index < STAGE_SEQUENCE.length - 1 ? this.requireStage(item, STAGE_SEQUENCE[index + 1]) : undefined;
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier d'orchestration introuvable : ${id}.`);
    return item;
  }

  private requireStage(item: EcosystemOrchestrationCase, stage: EcosystemStage) {
    const found = item.stages.find((entry) => entry.stage === stage);
    if (!found) throw new Error(`Étape d'écosystème introuvable : ${stage}.`);
    return found;
  }

  private requireTransition(item: EcosystemOrchestrationCase, id: EntityId) {
    const found = item.transitions.find((entry) => entry.id === id);
    if (!found) throw new Error(`Transition introuvable : ${id}.`);
    return found;
  }

  private requireRisk(item: EcosystemOrchestrationCase, id: EntityId) {
    const found = item.risks.find((entry) => entry.id === id);
    if (!found) throw new Error(`Risque introuvable : ${id}.`);
    return found;
  }

  private touch(item: EcosystemOrchestrationCase, updatedAt: ISODateTime, event: EcosystemOrchestrationCase["events"][number]) {
    item.updatedAt = updatedAt;
    item.events.push(event);
    this.cases.set(item.id, item);
  }

  private event(id: EntityId, type: string, occurredAt: ISODateTime, actorId: EntityId | undefined, details: Record<string, unknown>) {
    return { id, type, occurredAt, actorId, details };
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
