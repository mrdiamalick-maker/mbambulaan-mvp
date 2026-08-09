import type { EntityId, ISODateTime } from "./types";

export type CooperativeMemberStatus = "pending" | "active" | "suspended" | "inactive" | "exited";
export type CooperativeRole = "member" | "president" | "secretary" | "treasurer" | "board_member" | "auditor" | "manager";
export type ContributionStatus = "due" | "partially_paid" | "paid" | "overdue" | "waived";
export type MeetingStatus = "scheduled" | "open" | "closed" | "cancelled";
export type ResolutionStatus = "draft" | "submitted" | "approved" | "rejected" | "implemented" | "cancelled";
export type SharedAssetStatus = "available" | "reserved" | "in_use" | "maintenance" | "unavailable" | "retired";

export interface Cooperative {
  id: EntityId;
  name: string;
  registrationNumber?: string;
  territoryId: EntityId;
  landingSiteIds: EntityId[];
  legalForm?: string;
  status: "forming" | "active" | "suspended" | "dissolved";
  financialAccountId?: EntityId;
  governancePolicy: {
    quorumPercent: number;
    ordinaryMajorityPercent: number;
    qualifiedMajorityPercent: number;
    contributionFrequency: "weekly" | "monthly" | "quarterly" | "annual" | "custom";
  };
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface CooperativeMember {
  id: EntityId;
  cooperativeId: EntityId;
  actorId: EntityId;
  membershipNumber: string;
  roles: CooperativeRole[];
  status: CooperativeMemberStatus;
  joinedAt?: ISODateTime;
  exitedAt?: ISODateTime;
  votingRights: boolean;
  shareCount: number;
  emergencyContact?: string;
  metadata: Record<string, unknown>;
}

export interface CooperativeContribution {
  id: EntityId;
  cooperativeId: EntityId;
  memberId: EntityId;
  periodLabel: string;
  amountDueXof: number;
  amountPaidXof: number;
  dueAt: ISODateTime;
  paidAt?: ISODateTime;
  status: ContributionStatus;
  transactionIds: EntityId[];
}

export interface CooperativeMeeting {
  id: EntityId;
  cooperativeId: EntityId;
  type: "general_assembly" | "board" | "committee" | "extraordinary";
  title: string;
  agenda: string[];
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  location?: string;
  status: MeetingStatus;
  participantMemberIds: EntityId[];
  proxyByMemberId: Record<EntityId, EntityId>;
  quorumReached?: boolean;
  minutesDocumentId?: EntityId;
}

export interface CooperativeResolution {
  id: EntityId;
  cooperativeId: EntityId;
  meetingId: EntityId;
  title: string;
  description: string;
  votingRule: "simple_majority" | "qualified_majority" | "unanimity";
  votesFor: number;
  votesAgainst: number;
  abstentions: number;
  eligibleVoters: number;
  status: ResolutionStatus;
  approvedAt?: ISODateTime;
  implementationOwnerActorId?: EntityId;
  implementationDueAt?: ISODateTime;
  implementedAt?: ISODateTime;
}

export interface SharedAsset {
  id: EntityId;
  cooperativeId: EntityId;
  assetType: "canoe" | "engine" | "ice_box" | "cold_room" | "vehicle" | "net" | "safety_equipment" | "office_equipment" | "other";
  name: string;
  serialNumber?: string;
  capacity?: number;
  capacityUnit?: string;
  status: SharedAssetStatus;
  acquisitionCostXof?: number;
  acquiredAt?: ISODateTime;
  currentLocation?: string;
  nextMaintenanceAt?: ISODateTime;
  metadata: Record<string, unknown>;
}

export interface SharedAssetReservation {
  id: EntityId;
  cooperativeId: EntityId;
  assetId: EntityId;
  requestedByMemberId: EntityId;
  startsAt: ISODateTime;
  endsAt: ISODateTime;
  purpose: string;
  status: "requested" | "approved" | "rejected" | "active" | "completed" | "cancelled";
  approvedByMemberId?: EntityId;
  approvedAt?: ISODateTime;
}

export interface CooperativeServiceRequest {
  id: EntityId;
  cooperativeId: EntityId;
  requestedByMemberId: EntityId;
  serviceType: "financing" | "insurance" | "logistics" | "cold_storage" | "training" | "legal_support" | "market_access" | "maintenance";
  referenceId?: EntityId;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "submitted" | "assigned" | "in_progress" | "resolved" | "cancelled";
  submittedAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface CooperativePerformanceSnapshot {
  cooperativeId: EntityId;
  activeMemberCount: number;
  votingMemberCount: number;
  contributionCollectionRatePercent: number;
  overdueContributionAmountXof: number;
  availableSharedAssetCount: number;
  openServiceRequestCount: number;
  implementedResolutionRatePercent: number;
  governanceHealthScore: number;
  generatedAt: ISODateTime;
}

export class CooperativeManagementEngine {
  private readonly cooperatives = new Map<EntityId, Cooperative>();
  private readonly members = new Map<EntityId, CooperativeMember>();
  private readonly contributions = new Map<EntityId, CooperativeContribution>();
  private readonly meetings = new Map<EntityId, CooperativeMeeting>();
  private readonly resolutions = new Map<EntityId, CooperativeResolution>();
  private readonly assets = new Map<EntityId, SharedAsset>();
  private readonly reservations = new Map<EntityId, SharedAssetReservation>();
  private readonly serviceRequests = new Map<EntityId, CooperativeServiceRequest>();

  registerCooperative(input: Cooperative) {
    if (this.cooperatives.has(input.id)) throw new Error(`La coopérative ${input.id} existe déjà.`);
    this.validateGovernancePolicy(input.governancePolicy);
    this.cooperatives.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  addMember(input: CooperativeMember) {
    this.requireCooperative(input.cooperativeId);
    if (this.members.has(input.id)) throw new Error(`Le membre ${input.id} existe déjà.`);
    const duplicate = [...this.members.values()].some((item) =>
      item.cooperativeId === input.cooperativeId &&
      (item.actorId === input.actorId || item.membershipNumber === input.membershipNumber) &&
      item.status !== "exited",
    );
    if (duplicate) throw new Error("Cet acteur ou ce numéro d'adhésion est déjà actif dans la coopérative.");
    if (input.shareCount < 0) throw new Error("Le nombre de parts ne peut pas être négatif.");
    this.members.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  activateMember(input: { memberId: EntityId; joinedAt: ISODateTime }) {
    const member = this.requireMember(input.memberId);
    if (!['pending', 'inactive'].includes(member.status)) throw new Error("Ce membre ne peut pas être activé.");
    member.status = "active";
    member.joinedAt = input.joinedAt;
    member.exitedAt = undefined;
    this.members.set(member.id, member);
    return structuredClone(member);
  }

  exitMember(input: { memberId: EntityId; exitedAt: ISODateTime }) {
    const member = this.requireMember(input.memberId);
    if (member.status === "exited") return structuredClone(member);
    member.status = "exited";
    member.votingRights = false;
    member.exitedAt = input.exitedAt;
    this.members.set(member.id, member);
    return structuredClone(member);
  }

  assignRoles(input: { memberId: EntityId; roles: CooperativeRole[] }) {
    const member = this.requireMember(input.memberId);
    member.roles = [...new Set(input.roles)];
    this.members.set(member.id, member);
    return structuredClone(member);
  }

  createContribution(input: CooperativeContribution) {
    this.requireCooperative(input.cooperativeId);
    const member = this.requireMember(input.memberId);
    if (member.cooperativeId !== input.cooperativeId) throw new Error("Le membre n'appartient pas à cette coopérative.");
    if (this.contributions.has(input.id)) throw new Error(`La cotisation ${input.id} existe déjà.`);
    if (input.amountDueXof <= 0) throw new Error("Le montant dû doit être positif.");
    if (input.amountPaidXof < 0 || input.amountPaidXof > input.amountDueXof) throw new Error("Le montant payé est invalide.");
    const contribution = structuredClone(input);
    contribution.status = this.computeContributionStatus(contribution);
    this.contributions.set(contribution.id, contribution);
    return structuredClone(contribution);
  }

  recordContributionPayment(input: { contributionId: EntityId; amountXof: number; transactionId: EntityId; paidAt: ISODateTime }) {
    const contribution = this.requireContribution(input.contributionId);
    if (input.amountXof <= 0) throw new Error("Le paiement doit être positif.");
    if (contribution.amountPaidXof + input.amountXof > contribution.amountDueXof) throw new Error("Le paiement dépasse le montant restant dû.");
    contribution.amountPaidXof += input.amountXof;
    contribution.transactionIds.push(input.transactionId);
    contribution.paidAt = input.paidAt;
    contribution.status = this.computeContributionStatus(contribution);
    this.contributions.set(contribution.id, contribution);
    return structuredClone(contribution);
  }

  scheduleMeeting(input: CooperativeMeeting) {
    this.requireCooperative(input.cooperativeId);
    if (this.meetings.has(input.id)) throw new Error(`La réunion ${input.id} existe déjà.`);
    if (input.endsAt && input.endsAt <= input.startsAt) throw new Error("L'heure de fin doit être postérieure à l'heure de début.");
    this.meetings.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  openMeeting(input: { meetingId: EntityId; participantMemberIds: EntityId[]; proxyByMemberId?: Record<EntityId, EntityId> }) {
    const meeting = this.requireMeeting(input.meetingId);
    if (meeting.status !== "scheduled") throw new Error("Seule une réunion planifiée peut être ouverte.");
    const activeVoters = this.getActiveVotingMembers(meeting.cooperativeId);
    const eligibleIds = new Set(activeVoters.map((item) => item.id));
    const directParticipants = [...new Set(input.participantMemberIds)].filter((id) => eligibleIds.has(id));
    const proxyMap = input.proxyByMemberId ?? {};
    const representedMemberIds = Object.keys(proxyMap).filter((id) => eligibleIds.has(id));
    const representedCount = new Set([...directParticipants, ...representedMemberIds]).size;
    const cooperative = this.requireCooperative(meeting.cooperativeId);
    const quorumPercent = activeVoters.length ? (representedCount / activeVoters.length) * 100 : 0;
    meeting.participantMemberIds = directParticipants;
    meeting.proxyByMemberId = structuredClone(proxyMap);
    meeting.quorumReached = quorumPercent >= cooperative.governancePolicy.quorumPercent;
    meeting.status = "open";
    this.meetings.set(meeting.id, meeting);
    return structuredClone(meeting);
  }

  closeMeeting(input: { meetingId: EntityId; endsAt: ISODateTime; minutesDocumentId?: EntityId }) {
    const meeting = this.requireMeeting(input.meetingId);
    if (meeting.status !== "open") throw new Error("Seule une réunion ouverte peut être clôturée.");
    if (input.endsAt <= meeting.startsAt) throw new Error("L'heure de clôture est invalide.");
    meeting.endsAt = input.endsAt;
    meeting.minutesDocumentId = input.minutesDocumentId;
    meeting.status = "closed";
    this.meetings.set(meeting.id, meeting);
    return structuredClone(meeting);
  }

  submitResolution(input: CooperativeResolution) {
    const meeting = this.requireMeeting(input.meetingId);
    if (meeting.cooperativeId !== input.cooperativeId) throw new Error("La résolution n'appartient pas à cette réunion.");
    if (this.resolutions.has(input.id)) throw new Error(`La résolution ${input.id} existe déjà.`);
    if (input.votesFor < 0 || input.votesAgainst < 0 || input.abstentions < 0) throw new Error("Les votes ne peuvent pas être négatifs.");
    if (input.votesFor + input.votesAgainst + input.abstentions > input.eligibleVoters) throw new Error("Le total des votes dépasse le nombre d'électeurs éligibles.");
    const resolution = structuredClone(input);
    resolution.status = "submitted";
    this.resolutions.set(resolution.id, resolution);
    return structuredClone(resolution);
  }

  decideResolution(input: { resolutionId: EntityId; decidedAt: ISODateTime }) {
    const resolution = this.requireResolution(input.resolutionId);
    const cooperative = this.requireCooperative(resolution.cooperativeId);
    const meeting = this.requireMeeting(resolution.meetingId);
    if (!meeting.quorumReached) throw new Error("La résolution ne peut pas être décidée sans quorum.");
    if (resolution.status !== "submitted") throw new Error("La résolution n'est pas en attente de décision.");
    const expressedVotes = resolution.votesFor + resolution.votesAgainst;
    const approvalPercent = expressedVotes ? (resolution.votesFor / expressedVotes) * 100 : 0;
    const threshold = resolution.votingRule === "simple_majority"
      ? cooperative.governancePolicy.ordinaryMajorityPercent
      : resolution.votingRule === "qualified_majority"
        ? cooperative.governancePolicy.qualifiedMajorityPercent
        : 100;
    resolution.status = approvalPercent >= threshold ? "approved" : "rejected";
    resolution.approvedAt = resolution.status === "approved" ? input.decidedAt : undefined;
    this.resolutions.set(resolution.id, resolution);
    return structuredClone(resolution);
  }

  markResolutionImplemented(input: { resolutionId: EntityId; implementedAt: ISODateTime }) {
    const resolution = this.requireResolution(input.resolutionId);
    if (resolution.status !== "approved") throw new Error("Seule une résolution approuvée peut être mise en œuvre.");
    resolution.status = "implemented";
    resolution.implementedAt = input.implementedAt;
    this.resolutions.set(resolution.id, resolution);
    return structuredClone(resolution);
  }

  registerSharedAsset(input: SharedAsset) {
    this.requireCooperative(input.cooperativeId);
    if (this.assets.has(input.id)) throw new Error(`L'équipement ${input.id} existe déjà.`);
    if (input.acquisitionCostXof !== undefined && input.acquisitionCostXof < 0) throw new Error("Le coût d'acquisition ne peut pas être négatif.");
    this.assets.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  reserveSharedAsset(input: SharedAssetReservation) {
    const asset = this.requireAsset(input.assetId);
    const member = this.requireMember(input.requestedByMemberId);
    if (asset.cooperativeId !== input.cooperativeId || member.cooperativeId !== input.cooperativeId) throw new Error("L'équipement et le membre doivent appartenir à la même coopérative.");
    if (input.endsAt <= input.startsAt) throw new Error("La période de réservation est invalide.");
    if (asset.status === "maintenance" || asset.status === "unavailable" || asset.status === "retired") throw new Error("L'équipement n'est pas réservable.");
    const conflict = [...this.reservations.values()].some((item) =>
      item.assetId === input.assetId &&
      ["approved", "active"].includes(item.status) &&
      item.startsAt < input.endsAt &&
      item.endsAt > input.startsAt,
    );
    if (conflict) throw new Error("L'équipement est déjà réservé sur cette période.");
    this.reservations.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  approveSharedAssetReservation(input: { reservationId: EntityId; approvedByMemberId: EntityId; approvedAt: ISODateTime }) {
    const reservation = this.requireReservation(input.reservationId);
    if (reservation.status !== "requested") throw new Error("La réservation ne peut plus être approuvée.");
    const approver = this.requireMember(input.approvedByMemberId);
    if (approver.cooperativeId !== reservation.cooperativeId) throw new Error("L'approbateur n'appartient pas à la coopérative.");
    if (!approver.roles.some((role) => ["president", "manager", "board_member"].includes(role))) throw new Error("Ce membre n'est pas habilité à approuver la réservation.");
    reservation.status = "approved";
    reservation.approvedByMemberId = input.approvedByMemberId;
    reservation.approvedAt = input.approvedAt;
    this.reservations.set(reservation.id, reservation);
    const asset = this.requireAsset(reservation.assetId);
    asset.status = "reserved";
    this.assets.set(asset.id, asset);
    return structuredClone(reservation);
  }

  submitServiceRequest(input: CooperativeServiceRequest) {
    this.requireCooperative(input.cooperativeId);
    const member = this.requireMember(input.requestedByMemberId);
    if (member.cooperativeId !== input.cooperativeId) throw new Error("Le membre n'appartient pas à cette coopérative.");
    if (this.serviceRequests.has(input.id)) throw new Error(`La demande ${input.id} existe déjà.`);
    this.serviceRequests.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  resolveServiceRequest(input: { requestId: EntityId; resolvedAt: ISODateTime }) {
    const request = this.requireServiceRequest(input.requestId);
    if (["resolved", "cancelled"].includes(request.status)) return structuredClone(request);
    request.status = "resolved";
    request.resolvedAt = input.resolvedAt;
    this.serviceRequests.set(request.id, request);
    return structuredClone(request);
  }

  buildPerformanceSnapshot(input: { cooperativeId: EntityId; generatedAt: ISODateTime }): CooperativePerformanceSnapshot {
    this.requireCooperative(input.cooperativeId);
    const members = [...this.members.values()].filter((item) => item.cooperativeId === input.cooperativeId);
    const contributions = [...this.contributions.values()].filter((item) => item.cooperativeId === input.cooperativeId);
    const resolutions = [...this.resolutions.values()].filter((item) => item.cooperativeId === input.cooperativeId && ["approved", "implemented"].includes(item.status));
    const assets = [...this.assets.values()].filter((item) => item.cooperativeId === input.cooperativeId);
    const serviceRequests = [...this.serviceRequests.values()].filter((item) => item.cooperativeId === input.cooperativeId);
    const totalDue = contributions.reduce((sum, item) => sum + item.amountDueXof, 0);
    const totalPaid = contributions.reduce((sum, item) => sum + item.amountPaidXof, 0);
    const overdueContributionAmountXof = contributions
      .filter((item) => item.status === "overdue")
      .reduce((sum, item) => sum + (item.amountDueXof - item.amountPaidXof), 0);
    const implementedCount = resolutions.filter((item) => item.status === "implemented").length;
    const implementedResolutionRatePercent = resolutions.length ? Math.round((implementedCount / resolutions.length) * 10000) / 100 : 100;
    const collectionRate = totalDue ? Math.round((totalPaid / totalDue) * 10000) / 100 : 100;
    const governanceHealthScore = Math.round(
      Math.min(100,
        collectionRate * 0.35 +
        implementedResolutionRatePercent * 0.35 +
        (members.filter((item) => item.status === "active").length ? 15 : 0) +
        (serviceRequests.filter((item) => !["resolved", "cancelled"].includes(item.status)).length === 0 ? 15 : 5),
      ),
    );
    return {
      cooperativeId: input.cooperativeId,
      activeMemberCount: members.filter((item) => item.status === "active").length,
      votingMemberCount: members.filter((item) => item.status === "active" && item.votingRights).length,
      contributionCollectionRatePercent: collectionRate,
      overdueContributionAmountXof,
      availableSharedAssetCount: assets.filter((item) => item.status === "available").length,
      openServiceRequestCount: serviceRequests.filter((item) => !["resolved", "cancelled"].includes(item.status)).length,
      implementedResolutionRatePercent,
      governanceHealthScore,
      generatedAt: input.generatedAt,
    };
  }

  getCooperativeWorkspace(cooperativeId: EntityId) {
    const cooperative = this.requireCooperative(cooperativeId);
    return {
      cooperative: structuredClone(cooperative),
      members: [...this.members.values()].filter((item) => item.cooperativeId === cooperativeId).map((item) => structuredClone(item)),
      contributions: [...this.contributions.values()].filter((item) => item.cooperativeId === cooperativeId).map((item) => structuredClone(item)),
      meetings: [...this.meetings.values()].filter((item) => item.cooperativeId === cooperativeId).map((item) => structuredClone(item)),
      resolutions: [...this.resolutions.values()].filter((item) => item.cooperativeId === cooperativeId).map((item) => structuredClone(item)),
      assets: [...this.assets.values()].filter((item) => item.cooperativeId === cooperativeId).map((item) => structuredClone(item)),
      reservations: [...this.reservations.values()].filter((item) => item.cooperativeId === cooperativeId).map((item) => structuredClone(item)),
      serviceRequests: [...this.serviceRequests.values()].filter((item) => item.cooperativeId === cooperativeId).map((item) => structuredClone(item)),
    };
  }

  snapshot() {
    return {
      cooperatives: [...this.cooperatives.values()].map((item) => structuredClone(item)),
      members: [...this.members.values()].map((item) => structuredClone(item)),
      contributions: [...this.contributions.values()].map((item) => structuredClone(item)),
      meetings: [...this.meetings.values()].map((item) => structuredClone(item)),
      resolutions: [...this.resolutions.values()].map((item) => structuredClone(item)),
      assets: [...this.assets.values()].map((item) => structuredClone(item)),
      reservations: [...this.reservations.values()].map((item) => structuredClone(item)),
      serviceRequests: [...this.serviceRequests.values()].map((item) => structuredClone(item)),
    };
  }

  private computeContributionStatus(input: CooperativeContribution): ContributionStatus {
    if (input.amountPaidXof >= input.amountDueXof) return "paid";
    if (input.amountPaidXof > 0) return "partially_paid";
    return input.dueAt < new Date().toISOString() ? "overdue" : "due";
  }

  private getActiveVotingMembers(cooperativeId: EntityId) {
    return [...this.members.values()].filter((item) => item.cooperativeId === cooperativeId && item.status === "active" && item.votingRights);
  }

  private validateGovernancePolicy(policy: Cooperative["governancePolicy"]) {
    for (const value of [policy.quorumPercent, policy.ordinaryMajorityPercent, policy.qualifiedMajorityPercent]) {
      if (value <= 0 || value > 100) throw new Error("Les seuils de gouvernance doivent être compris entre 0 et 100.");
    }
    if (policy.qualifiedMajorityPercent < policy.ordinaryMajorityPercent) throw new Error("La majorité qualifiée ne peut pas être inférieure à la majorité ordinaire.");
  }

  private requireCooperative(id: EntityId) {
    const item = this.cooperatives.get(id);
    if (!item) throw new Error(`Coopérative introuvable : ${id}.`);
    return item;
  }

  private requireMember(id: EntityId) {
    const item = this.members.get(id);
    if (!item) throw new Error(`Membre introuvable : ${id}.`);
    return item;
  }

  private requireContribution(id: EntityId) {
    const item = this.contributions.get(id);
    if (!item) throw new Error(`Cotisation introuvable : ${id}.`);
    return item;
  }

  private requireMeeting(id: EntityId) {
    const item = this.meetings.get(id);
    if (!item) throw new Error(`Réunion introuvable : ${id}.`);
    return item;
  }

  private requireResolution(id: EntityId) {
    const item = this.resolutions.get(id);
    if (!item) throw new Error(`Résolution introuvable : ${id}.`);
    return item;
  }

  private requireAsset(id: EntityId) {
    const item = this.assets.get(id);
    if (!item) throw new Error(`Équipement introuvable : ${id}.`);
    return item;
  }

  private requireReservation(id: EntityId) {
    const item = this.reservations.get(id);
    if (!item) throw new Error(`Réservation introuvable : ${id}.`);
    return item;
  }

  private requireServiceRequest(id: EntityId) {
    const item = this.serviceRequests.get(id);
    if (!item) throw new Error(`Demande de service introuvable : ${id}.`);
    return item;
  }
}
