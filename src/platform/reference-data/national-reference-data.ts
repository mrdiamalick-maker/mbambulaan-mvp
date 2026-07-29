import type { EntityId, ISODateTime } from "../../domain/infrastructures/types";

export type ReferenceType =
  | "species"
  | "territory"
  | "landing_site"
  | "fishing_zone"
  | "unit"
  | "gear"
  | "vessel_type"
  | "quality_grade"
  | "incident_reason"
  | "organization_type";

export type ReferenceStatus = "draft" | "active" | "deprecated" | "retired";
export type ChangeStatus = "draft" | "submitted" | "approved" | "rejected" | "applied" | "cancelled";
export type QualitySeverity = "info" | "warning" | "error" | "blocking";

export interface ReferenceRecord {
  id: EntityId;
  type: ReferenceType;
  code: string;
  canonicalLabel: string;
  alternateLabels: string[];
  parentId?: EntityId;
  territoryId?: EntityId;
  attributes: Record<string, string | number | boolean | null>;
  version: number;
  status: ReferenceStatus;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ReferenceChangeRequest {
  id: EntityId;
  referenceType: ReferenceType;
  referenceId?: EntityId;
  requestedByIdentityId: EntityId;
  approvedByIdentityId?: EntityId;
  reason: string;
  proposedRecord: Omit<ReferenceRecord, "id" | "version" | "createdAt" | "updatedAt">;
  status: ChangeStatus;
  submittedAt?: ISODateTime;
  decidedAt?: ISODateTime;
  appliedAt?: ISODateTime;
  rejectionReason?: string;
}

export interface QualityRule {
  code: string;
  entityType: string;
  fieldPath?: string;
  description: string;
  severity: QualitySeverity;
  territoryId?: EntityId;
  active: boolean;
  evaluate: (record: Record<string, unknown>) => boolean;
}

export interface QualityIssue {
  id: EntityId;
  ruleCode: string;
  entityType: string;
  entityId: EntityId;
  fieldPath?: string;
  severity: QualitySeverity;
  message: string;
  territoryId?: EntityId;
  detectedAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface DuplicateCandidate {
  id: EntityId;
  entityType: string;
  leftEntityId: EntityId;
  rightEntityId: EntityId;
  score: number;
  matchedFields: string[];
  status: "open" | "confirmed_duplicate" | "not_duplicate" | "merged";
  detectedAt: ISODateTime;
  reviewedAt?: ISODateTime;
  reviewedByIdentityId?: EntityId;
}

export interface ReferenceRepository {
  findByCode(type: ReferenceType, code: string, territoryId?: EntityId): Promise<ReferenceRecord | undefined>;
  getReference(id: EntityId): Promise<ReferenceRecord | undefined>;
  saveReference(record: ReferenceRecord): Promise<void>;
  saveChangeRequest(request: ReferenceChangeRequest): Promise<void>;
  getChangeRequest(id: EntityId): Promise<ReferenceChangeRequest | undefined>;
  saveQualityIssue(issue: QualityIssue): Promise<void>;
  saveDuplicateCandidate(candidate: DuplicateCandidate): Promise<void>;
}

export interface ReferenceClock { now(): ISODateTime; }
export interface ReferenceIds { next(prefix: string): EntityId; }

export class NationalReferenceDataService {
  constructor(
    private readonly repository: ReferenceRepository,
    private readonly clock: ReferenceClock,
    private readonly ids: ReferenceIds,
  ) {}

  async createChangeRequest(input: Omit<ReferenceChangeRequest, "id" | "status" | "submittedAt" | "decidedAt" | "appliedAt">) {
    this.validateProposal(input.proposedRecord);
    const request: ReferenceChangeRequest = {
      id: this.ids.next("reference-change"),
      ...input,
      status: "draft",
    };
    await this.repository.saveChangeRequest(request);
    return structuredClone(request);
  }

  async submit(requestId: EntityId) {
    const request = await this.requireRequest(requestId);
    if (request.status !== "draft") throw new Error("Seule une demande en brouillon peut être soumise.");
    request.status = "submitted";
    request.submittedAt = this.clock.now();
    await this.repository.saveChangeRequest(request);
    return structuredClone(request);
  }

  async approve(requestId: EntityId, approverIdentityId: EntityId) {
    const request = await this.requireRequest(requestId);
    if (request.status !== "submitted") throw new Error("La demande doit être soumise avant approbation.");
    if (request.requestedByIdentityId === approverIdentityId) throw new Error("Le demandeur ne peut pas approuver sa propre modification.");
    request.status = "approved";
    request.approvedByIdentityId = approverIdentityId;
    request.decidedAt = this.clock.now();
    await this.repository.saveChangeRequest(request);
    return structuredClone(request);
  }

  async reject(requestId: EntityId, approverIdentityId: EntityId, reason: string) {
    const request = await this.requireRequest(requestId);
    if (request.status !== "submitted") throw new Error("La demande doit être soumise avant rejet.");
    if (!reason.trim()) throw new Error("Le motif de rejet est obligatoire.");
    request.status = "rejected";
    request.approvedByIdentityId = approverIdentityId;
    request.rejectionReason = reason.trim();
    request.decidedAt = this.clock.now();
    await this.repository.saveChangeRequest(request);
    return structuredClone(request);
  }

  async apply(requestId: EntityId) {
    const request = await this.requireRequest(requestId);
    if (request.status !== "approved") throw new Error("La demande doit être approuvée avant application.");

    const existingByCode = await this.repository.findByCode(
      request.referenceType,
      request.proposedRecord.code,
      request.proposedRecord.territoryId,
    );
    if (existingByCode && existingByCode.id !== request.referenceId) {
      throw new Error("Un référentiel actif utilise déjà ce code dans ce périmètre.");
    }

    const existing = request.referenceId ? await this.repository.getReference(request.referenceId) : undefined;
    const now = this.clock.now();
    const record: ReferenceRecord = {
      id: existing?.id ?? this.ids.next("reference"),
      ...request.proposedRecord,
      alternateLabels: [...new Set(request.proposedRecord.alternateLabels.map((label) => label.trim()).filter(Boolean))],
      version: (existing?.version ?? 0) + 1,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await this.repository.saveReference(record);
    request.referenceId = record.id;
    request.status = "applied";
    request.appliedAt = now;
    await this.repository.saveChangeRequest(request);
    return structuredClone(record);
  }

  private validateProposal(proposal: ReferenceChangeRequest["proposedRecord"]) {
    if (!proposal.code.trim()) throw new Error("Le code du référentiel est obligatoire.");
    if (!/^[A-Z0-9][A-Z0-9._-]{1,63}$/.test(proposal.code)) throw new Error("Le code du référentiel doit être stable et normalisé.");
    if (!proposal.canonicalLabel.trim()) throw new Error("Le libellé canonique est obligatoire.");
    if (proposal.validUntil && Date.parse(proposal.validUntil) <= Date.parse(proposal.validFrom)) {
      throw new Error("La date de fin doit être postérieure à la date de début.");
    }
  }

  private async requireRequest(id: EntityId) {
    const request = await this.repository.getChangeRequest(id);
    if (!request) throw new Error("Demande de modification introuvable.");
    return request;
  }
}

export class DataQualityService {
  constructor(
    private readonly repository: ReferenceRepository,
    private readonly rules: QualityRule[],
    private readonly clock: ReferenceClock,
    private readonly ids: ReferenceIds,
  ) {}

  async assess(input: { entityType: string; entityId: EntityId; territoryId?: EntityId; record: Record<string, unknown> }) {
    const issues: QualityIssue[] = [];
    for (const rule of this.rules) {
      if (!rule.active || rule.entityType !== input.entityType) continue;
      if (rule.territoryId && rule.territoryId !== input.territoryId) continue;
      if (rule.evaluate(input.record)) continue;
      const issue: QualityIssue = {
        id: this.ids.next("quality-issue"),
        ruleCode: rule.code,
        entityType: input.entityType,
        entityId: input.entityId,
        fieldPath: rule.fieldPath,
        severity: rule.severity,
        message: rule.description,
        territoryId: input.territoryId,
        detectedAt: this.clock.now(),
      };
      await this.repository.saveQualityIssue(issue);
      issues.push(issue);
    }
    return structuredClone(issues);
  }

  hasBlockingIssues(issues: QualityIssue[]) {
    return issues.some((issue) => issue.severity === "blocking");
  }
}

export class DuplicateDetectionService {
  constructor(private readonly repository: ReferenceRepository, private readonly clock: ReferenceClock, private readonly ids: ReferenceIds) {}

  async compare(input: {
    entityType: string;
    leftEntityId: EntityId;
    rightEntityId: EntityId;
    left: Record<string, string | undefined>;
    right: Record<string, string | undefined>;
    weightedFields: Record<string, number>;
    threshold: number;
  }) {
    if (input.leftEntityId === input.rightEntityId) throw new Error("Une entité ne peut pas être comparée avec elle-même.");
    let totalWeight = 0;
    let matchedWeight = 0;
    const matchedFields: string[] = [];
    for (const [field, weight] of Object.entries(input.weightedFields)) {
      totalWeight += weight;
      const left = normalize(input.left[field]);
      const right = normalize(input.right[field]);
      if (left && right && left === right) {
        matchedWeight += weight;
        matchedFields.push(field);
      }
    }
    const score = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 0;
    if (score < input.threshold) return undefined;
    const candidate: DuplicateCandidate = {
      id: this.ids.next("duplicate"),
      entityType: input.entityType,
      leftEntityId: input.leftEntityId,
      rightEntityId: input.rightEntityId,
      score,
      matchedFields,
      status: "open",
      detectedAt: this.clock.now(),
    };
    await this.repository.saveDuplicateCandidate(candidate);
    return structuredClone(candidate);
  }
}

function normalize(value: string | undefined) {
  return value?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export class InMemoryReferenceRepository implements ReferenceRepository {
  readonly references = new Map<EntityId, ReferenceRecord>();
  readonly changeRequests = new Map<EntityId, ReferenceChangeRequest>();
  readonly qualityIssues = new Map<EntityId, QualityIssue>();
  readonly duplicateCandidates = new Map<EntityId, DuplicateCandidate>();

  async findByCode(type: ReferenceType, code: string, territoryId?: EntityId) {
    const record = [...this.references.values()].find((item) => item.type === type && item.code === code && item.territoryId === territoryId && item.status !== "retired");
    return record ? structuredClone(record) : undefined;
  }
  async getReference(id: EntityId) { const item = this.references.get(id); return item ? structuredClone(item) : undefined; }
  async saveReference(record: ReferenceRecord) { this.references.set(record.id, structuredClone(record)); }
  async saveChangeRequest(request: ReferenceChangeRequest) { this.changeRequests.set(request.id, structuredClone(request)); }
  async getChangeRequest(id: EntityId) { const item = this.changeRequests.get(id); return item ? structuredClone(item) : undefined; }
  async saveQualityIssue(issue: QualityIssue) { this.qualityIssues.set(issue.id, structuredClone(issue)); }
  async saveDuplicateCandidate(candidate: DuplicateCandidate) { this.duplicateCandidates.set(candidate.id, structuredClone(candidate)); }
}
