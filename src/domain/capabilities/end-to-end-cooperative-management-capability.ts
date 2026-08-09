import type { EntityId, ISODateTime } from "../infrastructures/types";

export type CooperativeLifecycleStatus =
  | "draft"
  | "forming"
  | "active"
  | "restricted"
  | "suspended"
  | "closed";

export type CooperativeMemberStatus = "candidate" | "active" | "inactive" | "suspended" | "exited";
export type CooperativeServiceType =
  | "fuel"
  | "ice"
  | "cold_storage"
  | "transport"
  | "equipment"
  | "maintenance"
  | "financing"
  | "insurance"
  | "market_access"
  | "training"
  | "documentation"
  | "other";

export interface CooperativeMemberJourney {
  id: EntityId;
  actorId: EntityId;
  status: CooperativeMemberStatus;
  joinedAt?: ISODateTime;
  exitedAt?: ISODateTime;
  roles: string[];
  contributionPlanId?: EntityId;
  contributionPaidXof: number;
  contributionDueXof: number;
  trustScore: number;
  delegatedAuthorityIds: EntityId[];
  warnings: string[];
}

export interface CooperativeServiceRequest {
  id: EntityId;
  memberId: EntityId;
  serviceType: CooperativeServiceType;
  requestedAt: ISODateTime;
  quantity?: number;
  unit?: string;
  estimatedCostXof?: number;
  financingRequestId?: EntityId;
  reservationId?: EntityId;
  assetId?: EntityId;
  logisticsMissionId?: EntityId;
  status: "requested" | "approved" | "reserved" | "delivered" | "rejected" | "cancelled";
  decisionReason?: string;
}

export interface CooperativeGovernanceCycle {
  id: EntityId;
  assemblyId?: EntityId;
  openedAt: ISODateTime;
  quorumRequiredPercent: number;
  quorumReachedPercent: number;
  resolutionIds: EntityId[];
  voteIds: EntityId[];
  status: "prepared" | "open" | "quorum_reached" | "decided" | "closed" | "cancelled";
  closedAt?: ISODateTime;
}

export interface CooperativeFinancialPosition {
  memberContributionsCollectedXof: number;
  memberContributionsDueXof: number;
  cooperativeFundBalanceXof: number;
  outstandingFinancingXof: number;
  operatingCostsXof: number;
  serviceRevenueXof: number;
  commercialRevenueXof: number;
  platformFeesXof: number;
  netPositionXof: number;
}

export interface EndToEndCooperativeCase {
  id: EntityId;
  cooperativeId: EntityId;
  territoryId: EntityId;
  organizationId: EntityId;
  name: string;
  status: CooperativeLifecycleStatus;
  memberTarget: number;
  members: CooperativeMemberJourney[];
  serviceRequests: CooperativeServiceRequest[];
  governanceCycles: CooperativeGovernanceCycle[];
  sharedAssetIds: EntityId[];
  cooperativeFundAccountId?: EntityId;
  financialPosition: CooperativeFinancialPosition;
  activeCampaignIds: EntityId[];
  activeSaleCaseIds: EntityId[];
  complianceAssessmentIds: EntityId[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  activatedAt?: ISODateTime;
  suspendedAt?: ISODateTime;
  closedAt?: ISODateTime;
  events: Array<{
    id: EntityId;
    type: string;
    occurredAt: ISODateTime;
    actorId?: EntityId;
    details: Record<string, unknown>;
  }>;
}

export interface CooperativeReadinessAssessment {
  caseId: EntityId;
  score: number;
  readyForActivation: boolean;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export interface CooperativePerformanceSnapshot {
  cooperativeId: EntityId;
  territoryId: EntityId;
  activeMembers: number;
  contributionCollectionRatePercent: number;
  fulfilledServiceRequestRatePercent: number;
  governanceCompletionRatePercent: number;
  sharedAssetUtilizationSignals: number;
  activeCampaignCount: number;
  activeSaleCaseCount: number;
  cooperativeFundBalanceXof: number;
  netPositionXof: number;
  healthScore: number;
  generatedAt: ISODateTime;
}

export class EndToEndCooperativeManagementCapability {
  private readonly cases = new Map<EntityId, EndToEndCooperativeCase>();

  openCooperative(input: {
    id: EntityId;
    cooperativeId: EntityId;
    territoryId: EntityId;
    organizationId: EntityId;
    name: string;
    memberTarget: number;
    createdAt: ISODateTime;
    createdByActorId?: EntityId;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier coopératif ${input.id} existe déjà.`);
    if (input.memberTarget <= 0) throw new Error("La cible de membres doit être positive.");
    const item: EndToEndCooperativeCase = {
      id: input.id,
      cooperativeId: input.cooperativeId,
      territoryId: input.territoryId,
      organizationId: input.organizationId,
      name: input.name,
      status: "draft",
      memberTarget: input.memberTarget,
      members: [],
      serviceRequests: [],
      governanceCycles: [],
      sharedAssetIds: [],
      financialPosition: this.emptyFinancialPosition(),
      activeCampaignIds: [],
      activeSaleCaseIds: [],
      complianceAssessmentIds: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      events: [this.event(`event:${input.id}:opened`, "cooperative_case_opened", input.createdAt, input.createdByActorId, {})],
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  startFormation(input: { caseId: EntityId; startedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["draft"]);
    item.status = "forming";
    this.touch(item, input.startedAt, this.event(`event:${item.id}:formation`, "formation_started", input.startedAt, input.actorId, {}));
    return structuredClone(item);
  }

  addMemberCandidate(input: {
    caseId: EntityId;
    memberId: EntityId;
    actorId: EntityId;
    roles?: string[];
    trustScore?: number;
    contributionPlanId?: EntityId;
    contributionDueXof?: number;
    addedAt: ISODateTime;
    addedByActorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["forming", "active", "restricted"]);
    if (item.members.some((member) => member.id === input.memberId || member.actorId === input.actorId)) {
      throw new Error("Ce membre existe déjà dans la coopérative.");
    }
    const trustScore = input.trustScore ?? 50;
    if (trustScore < 0 || trustScore > 100) throw new Error("Le score de confiance doit être compris entre 0 et 100.");
    item.members.push({
      id: input.memberId,
      actorId: input.actorId,
      status: "candidate",
      roles: [...new Set(input.roles ?? ["member"])],
      contributionPlanId: input.contributionPlanId,
      contributionPaidXof: 0,
      contributionDueXof: input.contributionDueXof ?? 0,
      trustScore,
      delegatedAuthorityIds: [],
      warnings: [],
    });
    this.recalculateFinancialPosition(item);
    this.touch(item, input.addedAt, this.event(`event:${item.id}:candidate:${input.memberId}`, "member_candidate_added", input.addedAt, input.addedByActorId, { memberId: input.memberId }));
    return structuredClone(item);
  }

  activateMember(input: { caseId: EntityId; memberId: EntityId; joinedAt: ISODateTime; activatedByActorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const member = this.requireMember(item, input.memberId);
    if (member.status !== "candidate") throw new Error("Seul un candidat peut être activé.");
    if (member.trustScore < 30) throw new Error("Le niveau de confiance est insuffisant pour activer ce membre.");
    member.status = "active";
    member.joinedAt = input.joinedAt;
    this.touch(item, input.joinedAt, this.event(`event:${item.id}:member-active:${member.id}`, "member_activated", input.joinedAt, input.activatedByActorId, { memberId: member.id }));
    return structuredClone(item);
  }

  suspendMember(input: { caseId: EntityId; memberId: EntityId; reason: string; suspendedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const member = this.requireMember(item, input.memberId);
    if (!["active", "inactive"].includes(member.status)) throw new Error("Ce membre ne peut pas être suspendu.");
    member.status = "suspended";
    member.warnings.push(input.reason);
    this.touch(item, input.suspendedAt, this.event(`event:${item.id}:member-suspended:${member.id}`, "member_suspended", input.suspendedAt, input.actorId, { memberId: member.id, reason: input.reason }));
    return structuredClone(item);
  }

  exitMember(input: { caseId: EntityId; memberId: EntityId; exitedAt: ISODateTime; reason?: string; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const member = this.requireMember(item, input.memberId);
    if (member.status === "exited") return structuredClone(item);
    member.status = "exited";
    member.exitedAt = input.exitedAt;
    if (input.reason) member.warnings.push(input.reason);
    this.touch(item, input.exitedAt, this.event(`event:${item.id}:member-exit:${member.id}`, "member_exited", input.exitedAt, input.actorId, { memberId: member.id, reason: input.reason }));
    return structuredClone(item);
  }

  recordContribution(input: {
    caseId: EntityId;
    memberId: EntityId;
    amountXof: number;
    transactionId: EntityId;
    paidAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const member = this.requireMember(item, input.memberId);
    if (input.amountXof <= 0) throw new Error("Le montant de cotisation doit être positif.");
    member.contributionPaidXof += input.amountXof;
    item.financialPosition.memberContributionsCollectedXof += input.amountXof;
    item.financialPosition.cooperativeFundBalanceXof += input.amountXof;
    this.recalculateFinancialPosition(item);
    this.touch(item, input.paidAt, this.event(`event:${item.id}:contribution:${input.transactionId}`, "contribution_recorded", input.paidAt, input.actorId, {
      memberId: member.id,
      amountXof: input.amountXof,
      transactionId: input.transactionId,
    }));
    return structuredClone(item);
  }

  openCooperativeFund(input: { caseId: EntityId; financialAccountId: EntityId; openedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["forming", "active", "restricted"]);
    item.cooperativeFundAccountId = input.financialAccountId;
    this.touch(item, input.openedAt, this.event(`event:${item.id}:fund`, "cooperative_fund_opened", input.openedAt, input.actorId, { financialAccountId: input.financialAccountId }));
    return structuredClone(item);
  }

  registerSharedAsset(input: { caseId: EntityId; assetId: EntityId; registeredAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.sharedAssetIds.includes(input.assetId)) item.sharedAssetIds.push(input.assetId);
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:asset:${input.assetId}`, "shared_asset_registered", input.registeredAt, input.actorId, { assetId: input.assetId }));
    return structuredClone(item);
  }

  requestService(input: {
    caseId: EntityId;
    requestId: EntityId;
    memberId: EntityId;
    serviceType: CooperativeServiceType;
    requestedAt: ISODateTime;
    quantity?: number;
    unit?: string;
    estimatedCostXof?: number;
  }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["active", "restricted"]);
    const member = this.requireMember(item, input.memberId);
    if (member.status !== "active") throw new Error("Seul un membre actif peut demander un service.");
    if (item.serviceRequests.some((request) => request.id === input.requestId)) throw new Error("La demande de service existe déjà.");
    item.serviceRequests.push({
      id: input.requestId,
      memberId: input.memberId,
      serviceType: input.serviceType,
      requestedAt: input.requestedAt,
      quantity: input.quantity,
      unit: input.unit,
      estimatedCostXof: input.estimatedCostXof,
      status: "requested",
    });
    this.touch(item, input.requestedAt, this.event(`event:${item.id}:service:${input.requestId}`, "service_requested", input.requestedAt, member.actorId, { requestId: input.requestId, serviceType: input.serviceType }));
    return structuredClone(item);
  }

  approveService(input: {
    caseId: EntityId;
    requestId: EntityId;
    approvedAt: ISODateTime;
    approvedByActorId: EntityId;
    financingRequestId?: EntityId;
    reservationId?: EntityId;
    assetId?: EntityId;
    logisticsMissionId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const request = this.requireServiceRequest(item, input.requestId);
    if (request.status !== "requested") throw new Error("Seule une demande ouverte peut être approuvée.");
    request.status = input.reservationId || input.assetId || input.logisticsMissionId ? "reserved" : "approved";
    request.financingRequestId = input.financingRequestId;
    request.reservationId = input.reservationId;
    request.assetId = input.assetId;
    request.logisticsMissionId = input.logisticsMissionId;
    this.touch(item, input.approvedAt, this.event(`event:${item.id}:service-approved:${request.id}`, "service_approved", input.approvedAt, input.approvedByActorId, { requestId: request.id }));
    return structuredClone(item);
  }

  deliverService(input: { caseId: EntityId; requestId: EntityId; deliveredAt: ISODateTime; serviceRevenueXof?: number; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const request = this.requireServiceRequest(item, input.requestId);
    if (!["approved", "reserved"].includes(request.status)) throw new Error("Le service n'est pas prêt à être livré.");
    request.status = "delivered";
    if (input.serviceRevenueXof) item.financialPosition.serviceRevenueXof += input.serviceRevenueXof;
    this.recalculateFinancialPosition(item);
    this.touch(item, input.deliveredAt, this.event(`event:${item.id}:service-delivered:${request.id}`, "service_delivered", input.deliveredAt, input.actorId, { requestId: request.id, serviceRevenueXof: input.serviceRevenueXof }));
    return structuredClone(item);
  }

  openGovernanceCycle(input: { caseId: EntityId; cycleId: EntityId; assemblyId?: EntityId; quorumRequiredPercent: number; openedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["forming", "active", "restricted"]);
    if (input.quorumRequiredPercent <= 0 || input.quorumRequiredPercent > 100) throw new Error("Le quorum requis est invalide.");
    if (item.governanceCycles.some((cycle) => cycle.id === input.cycleId)) throw new Error("Le cycle de gouvernance existe déjà.");
    item.governanceCycles.push({
      id: input.cycleId,
      assemblyId: input.assemblyId,
      openedAt: input.openedAt,
      quorumRequiredPercent: input.quorumRequiredPercent,
      quorumReachedPercent: 0,
      resolutionIds: [],
      voteIds: [],
      status: "open",
    });
    this.touch(item, input.openedAt, this.event(`event:${item.id}:governance:${input.cycleId}`, "governance_cycle_opened", input.openedAt, input.actorId, { cycleId: input.cycleId }));
    return structuredClone(item);
  }

  recordQuorum(input: { caseId: EntityId; cycleId: EntityId; quorumReachedPercent: number; recordedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const cycle = this.requireGovernanceCycle(item, input.cycleId);
    if (cycle.status !== "open") throw new Error("Le cycle de gouvernance n'est pas ouvert.");
    cycle.quorumReachedPercent = input.quorumReachedPercent;
    if (input.quorumReachedPercent >= cycle.quorumRequiredPercent) cycle.status = "quorum_reached";
    this.touch(item, input.recordedAt, this.event(`event:${item.id}:quorum:${cycle.id}`, "quorum_recorded", input.recordedAt, input.actorId, { quorumReachedPercent: input.quorumReachedPercent }));
    return structuredClone(item);
  }

  recordGovernanceDecision(input: {
    caseId: EntityId;
    cycleId: EntityId;
    resolutionIds: EntityId[];
    voteIds: EntityId[];
    decidedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    const cycle = this.requireGovernanceCycle(item, input.cycleId);
    if (cycle.status !== "quorum_reached") throw new Error("Le quorum doit être atteint avant décision.");
    cycle.resolutionIds = [...new Set(input.resolutionIds)];
    cycle.voteIds = [...new Set(input.voteIds)];
    cycle.status = "decided";
    this.touch(item, input.decidedAt, this.event(`event:${item.id}:decision:${cycle.id}`, "governance_decision_recorded", input.decidedAt, input.actorId, { resolutionIds: cycle.resolutionIds }));
    return structuredClone(item);
  }

  closeGovernanceCycle(input: { caseId: EntityId; cycleId: EntityId; closedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const cycle = this.requireGovernanceCycle(item, input.cycleId);
    if (cycle.status !== "decided") throw new Error("Le cycle doit être décidé avant clôture.");
    cycle.status = "closed";
    cycle.closedAt = input.closedAt;
    this.touch(item, input.closedAt, this.event(`event:${item.id}:governance-closed:${cycle.id}`, "governance_cycle_closed", input.closedAt, input.actorId, { cycleId: cycle.id }));
    return structuredClone(item);
  }

  linkCampaign(input: { caseId: EntityId; campaignId: EntityId; linkedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.activeCampaignIds.includes(input.campaignId)) item.activeCampaignIds.push(input.campaignId);
    this.touch(item, input.linkedAt, this.event(`event:${item.id}:campaign:${input.campaignId}`, "campaign_linked", input.linkedAt, input.actorId, { campaignId: input.campaignId }));
    return structuredClone(item);
  }

  linkSaleCase(input: { caseId: EntityId; saleCaseId: EntityId; linkedAt: ISODateTime; commercialRevenueXof?: number; platformFeesXof?: number; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.activeSaleCaseIds.includes(input.saleCaseId)) item.activeSaleCaseIds.push(input.saleCaseId);
    if (input.commercialRevenueXof) item.financialPosition.commercialRevenueXof += input.commercialRevenueXof;
    if (input.platformFeesXof) item.financialPosition.platformFeesXof += input.platformFeesXof;
    this.recalculateFinancialPosition(item);
    this.touch(item, input.linkedAt, this.event(`event:${item.id}:sale:${input.saleCaseId}`, "sale_case_linked", input.linkedAt, input.actorId, { saleCaseId: input.saleCaseId }));
    return structuredClone(item);
  }

  recordOperatingCost(input: { caseId: EntityId; costId: EntityId; amountXof: number; recordedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (input.amountXof < 0) throw new Error("Le coût ne peut pas être négatif.");
    item.financialPosition.operatingCostsXof += input.amountXof;
    this.recalculateFinancialPosition(item);
    this.touch(item, input.recordedAt, this.event(`event:${item.id}:cost:${input.costId}`, "operating_cost_recorded", input.recordedAt, input.actorId, { amountXof: input.amountXof }));
    return structuredClone(item);
  }

  recordFinancingExposure(input: { caseId: EntityId; financingRequestId: EntityId; outstandingAmountXof: number; recordedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (input.outstandingAmountXof < 0) throw new Error("L'exposition financière ne peut pas être négative.");
    item.financialPosition.outstandingFinancingXof = input.outstandingAmountXof;
    this.recalculateFinancialPosition(item);
    this.touch(item, input.recordedAt, this.event(`event:${item.id}:financing:${input.financingRequestId}`, "financing_exposure_recorded", input.recordedAt, input.actorId, { outstandingAmountXof: input.outstandingAmountXof }));
    return structuredClone(item);
  }

  attachComplianceAssessment(input: { caseId: EntityId; assessmentId: EntityId; status: "compliant" | "partially_compliant" | "non_compliant" | "unknown"; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.complianceAssessmentIds.includes(input.assessmentId)) item.complianceAssessmentIds.push(input.assessmentId);
    if (input.status === "non_compliant") {
      item.status = item.status === "active" ? "restricted" : item.status;
      item.blockers.push(`Non-conformité ouverte : ${input.assessmentId}`);
    }
    if (input.status === "partially_compliant") item.warnings.push(`Conformité partielle : ${input.assessmentId}`);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:compliance:${input.assessmentId}`, "compliance_assessment_attached", input.attachedAt, input.actorId, { assessmentId: input.assessmentId, status: input.status }));
    return structuredClone(item);
  }

  attachDocument(input: { caseId: EntityId; documentId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.documentIds.includes(input.documentId)) item.documentIds.push(input.documentId);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:document:${input.documentId}`, "document_attached", input.attachedAt, input.actorId, { documentId: input.documentId }));
    return structuredClone(item);
  }

  assessActivationReadiness(input: { caseId: EntityId; generatedAt: ISODateTime }): CooperativeReadinessAssessment {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    const warnings: string[] = [];
    const activeMembers = item.members.filter((member) => member.status === "active");
    const activeShare = activeMembers.length / item.memberTarget;
    if (activeMembers.length === 0) blockers.push("Aucun membre actif.");
    if (activeShare < 0.5) blockers.push("Moins de 50 % de la cible de membres est active.");
    if (!item.cooperativeFundAccountId) blockers.push("Le fonds coopératif n'est pas ouvert.");
    if (!item.governanceCycles.some((cycle) => cycle.status === "closed")) blockers.push("Aucun cycle de gouvernance n'a été clôturé.");
    if (!item.documentIds.length) warnings.push("Aucun document institutionnel attaché.");
    if (!item.sharedAssetIds.length) warnings.push("Aucun actif mutualisé enregistré.");
    if (item.financialPosition.memberContributionsDueXof > item.financialPosition.memberContributionsCollectedXof) {
      warnings.push("Les cotisations dues dépassent les cotisations encaissées.");
    }
    const maxCriteria = 6;
    const penalty = blockers.length * 18 + warnings.length * 5;
    const score = Math.max(0, Math.min(100, 100 - penalty + Math.round(Math.min(1, activeShare) * 10)));
    item.blockers = blockers;
    item.warnings = warnings;
    this.cases.set(item.id, item);
    return { caseId: item.id, score, readyForActivation: blockers.length === 0, blockers, warnings, generatedAt: input.generatedAt };
  }

  activateCooperative(input: { caseId: EntityId; activatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.requireStatus(item, ["forming", "restricted"]);
    const readiness = this.assessActivationReadiness({ caseId: item.id, generatedAt: input.activatedAt });
    if (!readiness.readyForActivation) throw new Error(`La coopérative n'est pas prête : ${readiness.blockers.join("; ")}`);
    item.status = "active";
    item.activatedAt = input.activatedAt;
    this.touch(item, input.activatedAt, this.event(`event:${item.id}:activated`, "cooperative_activated", input.activatedAt, input.actorId, {}));
    return structuredClone(item);
  }

  suspendCooperative(input: { caseId: EntityId; reason: string; suspendedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!["active", "restricted"].includes(item.status)) throw new Error("La coopérative ne peut pas être suspendue dans son état actuel.");
    item.status = "suspended";
    item.suspendedAt = input.suspendedAt;
    item.blockers.push(input.reason);
    this.touch(item, input.suspendedAt, this.event(`event:${item.id}:suspended`, "cooperative_suspended", input.suspendedAt, input.actorId, { reason: input.reason }));
    return structuredClone(item);
  }

  closeCooperative(input: { caseId: EntityId; closedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.status === "closed") return structuredClone(item);
    if (item.activeCampaignIds.length || item.activeSaleCaseIds.length) throw new Error("Les opérations actives doivent être clôturées avant fermeture.");
    item.status = "closed";
    item.closedAt = input.closedAt;
    this.touch(item, input.closedAt, this.event(`event:${item.id}:closed`, "cooperative_closed", input.closedAt, input.actorId, {}));
    return structuredClone(item);
  }

  buildPerformanceSnapshot(input: { caseId: EntityId; generatedAt: ISODateTime }): CooperativePerformanceSnapshot {
    const item = this.requireCase(input.caseId);
    const activeMembers = item.members.filter((member) => member.status === "active").length;
    const due = item.financialPosition.memberContributionsDueXof;
    const collected = item.financialPosition.memberContributionsCollectedXof;
    const contributionCollectionRatePercent = due > 0 ? Math.min(100, Math.round((collected / due) * 10000) / 100) : 100;
    const serviceRequests = item.serviceRequests.filter((request) => !["cancelled"].includes(request.status));
    const fulfilledServiceRequestRatePercent = serviceRequests.length
      ? Math.round((serviceRequests.filter((request) => request.status === "delivered").length / serviceRequests.length) * 10000) / 100
      : 100;
    const governanceCycles = item.governanceCycles.filter((cycle) => cycle.status !== "cancelled");
    const governanceCompletionRatePercent = governanceCycles.length
      ? Math.round((governanceCycles.filter((cycle) => cycle.status === "closed").length / governanceCycles.length) * 10000) / 100
      : 0;
    const memberScore = item.memberTarget ? Math.min(100, (activeMembers / item.memberTarget) * 100) : 0;
    const financialScore = item.financialPosition.netPositionXof >= 0 ? 100 : 40;
    const compliancePenalty = item.complianceAssessmentIds.length && item.status === "restricted" ? 20 : 0;
    const healthScore = Math.max(0, Math.round((memberScore * 0.25) + (contributionCollectionRatePercent * 0.2) + (fulfilledServiceRequestRatePercent * 0.2) + (governanceCompletionRatePercent * 0.15) + (financialScore * 0.2) - compliancePenalty));
    return {
      cooperativeId: item.cooperativeId,
      territoryId: item.territoryId,
      activeMembers,
      contributionCollectionRatePercent,
      fulfilledServiceRequestRatePercent,
      governanceCompletionRatePercent,
      sharedAssetUtilizationSignals: item.serviceRequests.filter((request) => request.assetId).length,
      activeCampaignCount: item.activeCampaignIds.length,
      activeSaleCaseCount: item.activeSaleCaseIds.length,
      cooperativeFundBalanceXof: item.financialPosition.cooperativeFundBalanceXof,
      netPositionXof: item.financialPosition.netPositionXof,
      healthScore,
      generatedAt: input.generatedAt,
    };
  }

  getTerritoryCooperativeBoard(territoryId: EntityId, generatedAt: ISODateTime) {
    const items = [...this.cases.values()].filter((item) => item.territoryId === territoryId);
    const snapshots = items.map((item) => this.buildPerformanceSnapshot({ caseId: item.id, generatedAt }));
    return {
      territoryId,
      cooperativeCount: items.length,
      activeCooperativeCount: items.filter((item) => item.status === "active").length,
      restrictedCooperativeCount: items.filter((item) => item.status === "restricted").length,
      activeMemberCount: snapshots.reduce((sum, snapshot) => sum + snapshot.activeMembers, 0),
      cooperativeFundBalanceXof: snapshots.reduce((sum, snapshot) => sum + snapshot.cooperativeFundBalanceXof, 0),
      netPositionXof: snapshots.reduce((sum, snapshot) => sum + snapshot.netPositionXof, 0),
      averageHealthScore: snapshots.length ? Math.round(snapshots.reduce((sum, snapshot) => sum + snapshot.healthScore, 0) / snapshots.length) : 0,
      snapshots,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private recalculateFinancialPosition(item: EndToEndCooperativeCase) {
    item.financialPosition.memberContributionsDueXof = item.members.reduce((sum, member) => sum + member.contributionDueXof, 0);
    item.financialPosition.memberContributionsCollectedXof = item.members.reduce((sum, member) => sum + member.contributionPaidXof, 0);
    item.financialPosition.netPositionXof =
      item.financialPosition.cooperativeFundBalanceXof +
      item.financialPosition.serviceRevenueXof +
      item.financialPosition.commercialRevenueXof -
      item.financialPosition.operatingCostsXof -
      item.financialPosition.outstandingFinancingXof -
      item.financialPosition.platformFeesXof;
  }

  private emptyFinancialPosition(): CooperativeFinancialPosition {
    return {
      memberContributionsCollectedXof: 0,
      memberContributionsDueXof: 0,
      cooperativeFundBalanceXof: 0,
      outstandingFinancingXof: 0,
      operatingCostsXof: 0,
      serviceRevenueXof: 0,
      commercialRevenueXof: 0,
      platformFeesXof: 0,
      netPositionXof: 0,
    };
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier coopératif introuvable : ${id}.`);
    return item;
  }

  private requireMember(item: EndToEndCooperativeCase, memberId: EntityId) {
    const member = item.members.find((candidate) => candidate.id === memberId);
    if (!member) throw new Error(`Membre introuvable : ${memberId}.`);
    return member;
  }

  private requireServiceRequest(item: EndToEndCooperativeCase, requestId: EntityId) {
    const request = item.serviceRequests.find((candidate) => candidate.id === requestId);
    if (!request) throw new Error(`Demande de service introuvable : ${requestId}.`);
    return request;
  }

  private requireGovernanceCycle(item: EndToEndCooperativeCase, cycleId: EntityId) {
    const cycle = item.governanceCycles.find((candidate) => candidate.id === cycleId);
    if (!cycle) throw new Error(`Cycle de gouvernance introuvable : ${cycleId}.`);
    return cycle;
  }

  private requireStatus(item: EndToEndCooperativeCase, allowed: CooperativeLifecycleStatus[]) {
    if (!allowed.includes(item.status)) throw new Error(`Transition impossible depuis le statut ${item.status}.`);
  }

  private touch(item: EndToEndCooperativeCase, updatedAt: ISODateTime, event: EndToEndCooperativeCase["events"][number]) {
    item.updatedAt = updatedAt;
    item.events.push(event);
    this.cases.set(item.id, item);
  }

  private event(id: EntityId, type: string, occurredAt: ISODateTime, actorId: EntityId | undefined, details: Record<string, unknown>) {
    return { id, type, occurredAt, actorId, details };
  }
}
