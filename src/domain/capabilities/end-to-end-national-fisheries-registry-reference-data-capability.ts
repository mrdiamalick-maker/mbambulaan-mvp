import type { EntityId, ISODateTime } from "../infrastructures/types";

export type RegistryEntityType =
  | "actor"
  | "organization"
  | "vessel"
  | "facility"
  | "equipment"
  | "species"
  | "territory"
  | "license"
  | "permit"
  | "market"
  | "landing_site";

export type RegistryRecordStatus =
  | "draft"
  | "pending_verification"
  | "active"
  | "restricted"
  | "suspended"
  | "expired"
  | "revoked"
  | "archived";

export interface RegistryIdentityKey {
  keyType:
    | "national_id_hash"
    | "registration_number"
    | "license_number"
    | "imo_number"
    | "local_registry_number"
    | "tax_identifier"
    | "internal_reference";
  value: string;
  issuingAuthorityActorId?: EntityId;
  validFrom?: ISODateTime;
  validUntil?: ISODateTime;
}

export interface RegistryRelationship {
  id: EntityId;
  relationshipType:
    | "member_of"
    | "owns"
    | "operates"
    | "manages"
    | "licensed_for"
    | "located_in"
    | "serves"
    | "supplies"
    | "certified_by"
    | "regulated_by"
    | "equipped_with";
  sourceRecordId: EntityId;
  targetRecordId: EntityId;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  status: "active" | "inactive" | "expired" | "revoked";
  evidenceIds: EntityId[];
}

export interface RegistryAttribute {
  code: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  sourceAuthorityActorId?: EntityId;
  verified: boolean;
  updatedAt: ISODateTime;
}

export interface RegistryRecord {
  id: EntityId;
  entityType: RegistryEntityType;
  canonicalName: string;
  aliases: string[];
  countryId: EntityId;
  territoryIds: EntityId[];
  identityKeys: RegistryIdentityKey[];
  attributes: RegistryAttribute[];
  status: RegistryRecordStatus;
  verificationLevel: "unverified" | "declared" | "document_checked" | "field_verified" | "authority_verified";
  owningAuthorityActorId?: EntityId;
  sourceSystemIds: EntityId[];
  evidenceIds: EntityId[];
  duplicateOfRecordId?: EntityId;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RegistryChangeRequest {
  id: EntityId;
  recordId: EntityId;
  requestedByActorId: EntityId;
  changeType: "create" | "update" | "merge" | "restrict" | "suspend" | "revoke" | "reactivate";
  proposedAttributes: RegistryAttribute[];
  proposedIdentityKeys: RegistryIdentityKey[];
  rationale: string;
  evidenceIds: EntityId[];
  status: "pending" | "approved" | "rejected" | "applied" | "cancelled";
  requestedAt: ISODateTime;
  decidedAt?: ISODateTime;
  decidedByActorId?: EntityId;
  rejectionReason?: string;
}

export interface RegistryDataQualityIssue {
  id: EntityId;
  recordId: EntityId;
  issueType:
    | "missing_required_attribute"
    | "duplicate_identity"
    | "conflicting_source"
    | "expired_authorization"
    | "orphan_relationship"
    | "invalid_territory"
    | "stale_data"
    | "unverified_critical_data";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  status: "open" | "investigating" | "resolved" | "waived";
  detectedAt: ISODateTime;
  resolvedAt?: ISODateTime;
  evidenceIds: EntityId[];
}

export interface RegistryVersionSnapshot {
  id: EntityId;
  recordId: EntityId;
  version: number;
  snapshot: RegistryRecord;
  changedByActorId: EntityId;
  changeRequestId?: EntityId;
  createdAt: ISODateTime;
}

export interface NationalFisheriesRegistryCase {
  id: EntityId;
  registryCode: string;
  countryId: EntityId;
  status: "initializing" | "operational" | "under_review" | "restricted";
  records: RegistryRecord[];
  relationships: RegistryRelationship[];
  changeRequests: RegistryChangeRequest[];
  qualityIssues: RegistryDataQualityIssue[];
  versions: RegistryVersionSnapshot[];
  requiredAttributesByType: Partial<Record<RegistryEntityType, string[]>>;
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface RegistryDataQualityReport {
  caseId: EntityId;
  score: number;
  complete: boolean;
  activeRecordCount: number;
  duplicateRecordIds: EntityId[];
  missingRequiredAttributeRecordIds: EntityId[];
  expiredAuthorizationRecordIds: EntityId[];
  staleRecordIds: EntityId[];
  openCriticalIssueCount: number;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export class EndToEndNationalFisheriesRegistryReferenceDataCapability {
  private readonly cases = new Map<EntityId, NationalFisheriesRegistryCase>();

  openRegistry(input: {
    id: EntityId;
    registryCode: string;
    countryId: EntityId;
    createdAt: ISODateTime;
    requiredAttributesByType?: Partial<Record<RegistryEntityType, string[]>>;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le registre ${input.id} existe déjà.`);
    const item: NationalFisheriesRegistryCase = {
      id: input.id,
      registryCode: input.registryCode,
      countryId: input.countryId,
      status: "initializing",
      records: [],
      relationships: [],
      changeRequests: [],
      qualityIssues: [],
      versions: [],
      requiredAttributesByType: structuredClone(input.requiredAttributesByType ?? {}),
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  registerRecord(input: { caseId: EntityId; record: RegistryRecord; actorId: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.records.some((entry) => entry.id === input.record.id)) throw new Error(`L'enregistrement ${input.record.id} existe déjà.`);
    this.assertIdentityKeyUniqueness(item, input.record);
    item.records.push(structuredClone(input.record));
    this.snapshotVersion(item, input.record.id, input.actorId, undefined, input.record.createdAt);
    item.status = "operational";
    this.touch(item, input.record.createdAt);
    return structuredClone(item);
  }

  addRelationship(input: { caseId: EntityId; relationship: RegistryRelationship; addedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    this.requireRecord(item, input.relationship.sourceRecordId);
    this.requireRecord(item, input.relationship.targetRecordId);
    if (input.relationship.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour créer une relation de registre.");
    if (input.relationship.validUntil && input.relationship.validUntil <= input.relationship.validFrom) throw new Error("La période de relation est invalide.");
    item.relationships.push(structuredClone(input.relationship));
    this.touch(item, input.addedAt);
    return structuredClone(item);
  }

  requestChange(input: { caseId: EntityId; request: RegistryChangeRequest }) {
    const item = this.requireCase(input.caseId);
    this.requireRecord(item, input.request.recordId);
    if (input.request.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour demander une modification.");
    item.changeRequests.push(structuredClone(input.request));
    this.touch(item, input.request.requestedAt);
    return structuredClone(item);
  }

  decideChange(input: { caseId: EntityId; requestId: EntityId; approved: boolean; decidedByActorId: EntityId; decidedAt: ISODateTime; rejectionReason?: string }) {
    const item = this.requireCase(input.caseId);
    const request = this.requireChangeRequest(item, input.requestId);
    if (request.status !== "pending") throw new Error("La demande n'est plus en attente.");
    request.decidedAt = input.decidedAt;
    request.decidedByActorId = input.decidedByActorId;
    if (!input.approved) {
      request.status = "rejected";
      request.rejectionReason = input.rejectionReason ?? "Demande rejetée.";
      this.touch(item, input.decidedAt);
      return structuredClone(request);
    }
    request.status = "approved";
    this.applyChange(item, request, input.decidedByActorId, input.decidedAt);
    request.status = "applied";
    this.touch(item, input.decidedAt);
    return structuredClone(request);
  }

  detectDataQuality(input: { caseId: EntityId; generatedAt: ISODateTime; staleAfterDays: number }): RegistryDataQualityReport {
    const item = this.requireCase(input.caseId);
    const duplicateRecordIds = this.findDuplicateRecordIds(item);
    const missingRequiredAttributeRecordIds = item.records.filter((record) => {
      const required = item.requiredAttributesByType[record.entityType] ?? [];
      const available = new Set(record.attributes.map((attribute) => attribute.code));
      return required.some((code) => !available.has(code));
    }).map((record) => record.id);
    const expiredAuthorizationRecordIds = item.records.filter((record) =>
      ["license", "permit"].includes(record.entityType) && record.identityKeys.some((key) => key.validUntil && key.validUntil < input.generatedAt)
    ).map((record) => record.id);
    const staleThreshold = Date.parse(input.generatedAt) - input.staleAfterDays * 86_400_000;
    const staleRecordIds = item.records.filter((record) => Date.parse(record.updatedAt) < staleThreshold).map((record) => record.id);

    this.syncIssue(item, "duplicate_identity", duplicateRecordIds, "critical", input.generatedAt);
    this.syncIssue(item, "missing_required_attribute", missingRequiredAttributeRecordIds, "high", input.generatedAt);
    this.syncIssue(item, "expired_authorization", expiredAuthorizationRecordIds, "critical", input.generatedAt);
    this.syncIssue(item, "stale_data", staleRecordIds, "medium", input.generatedAt);

    const blockers: string[] = [];
    const warnings: string[] = [];
    if (duplicateRecordIds.length) blockers.push("Des identités de référence sont dupliquées.");
    if (expiredAuthorizationRecordIds.length) blockers.push("Des licences ou permis sont expirés.");
    if (missingRequiredAttributeRecordIds.length) warnings.push("Des attributs obligatoires sont manquants.");
    if (staleRecordIds.length) warnings.push("Des données de référence sont obsolètes.");
    const openCriticalIssueCount = item.qualityIssues.filter((issue) => issue.severity === "critical" && issue.status !== "resolved").length;
    const score = Math.max(0, 100 - blockers.length * 25 - warnings.length * 10 - openCriticalIssueCount * 5);
    item.blockers = blockers;
    item.warnings = warnings;
    item.status = blockers.length ? "restricted" : "operational";
    this.touch(item, input.generatedAt);
    return {
      caseId: item.id,
      score,
      complete: blockers.length === 0 && warnings.length === 0,
      activeRecordCount: item.records.filter((record) => record.status === "active").length,
      duplicateRecordIds,
      missingRequiredAttributeRecordIds,
      expiredAuthorizationRecordIds,
      staleRecordIds,
      openCriticalIssueCount,
      blockers,
      warnings,
      generatedAt: input.generatedAt,
    };
  }

  resolveQualityIssue(input: { caseId: EntityId; issueId: EntityId; resolvedAt: ISODateTime; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    const issue = item.qualityIssues.find((entry) => entry.id === input.issueId);
    if (!issue) throw new Error(`Incident de qualité introuvable : ${input.issueId}.`);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour résoudre un incident de qualité.");
    issue.status = "resolved";
    issue.resolvedAt = input.resolvedAt;
    issue.evidenceIds = this.unique([...issue.evidenceIds, ...input.evidenceIds]);
    this.touch(item, input.resolvedAt);
    return structuredClone(issue);
  }

  getCanonicalRecord(input: { caseId: EntityId; recordId: EntityId }) {
    const item = this.requireCase(input.caseId);
    let record = this.requireRecord(item, input.recordId);
    const visited = new Set<EntityId>();
    while (record.duplicateOfRecordId) {
      if (visited.has(record.id)) throw new Error("Boucle de fusion détectée dans le registre.");
      visited.add(record.id);
      record = this.requireRecord(item, record.duplicateOfRecordId);
    }
    return structuredClone(record);
  }

  getNationalRegistryCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime; staleAfterDays: number }) {
    const item = this.requireCase(input.caseId);
    const quality = this.detectDataQuality({ caseId: item.id, generatedAt: input.generatedAt, staleAfterDays: input.staleAfterDays });
    const byType = [...new Set(item.records.map((record) => record.entityType))].map((entityType) => ({
      entityType,
      total: item.records.filter((record) => record.entityType === entityType).length,
      active: item.records.filter((record) => record.entityType === entityType && record.status === "active").length,
      authorityVerified: item.records.filter((record) => record.entityType === entityType && record.verificationLevel === "authority_verified").length,
    }));
    return {
      caseId: item.id,
      registryCode: item.registryCode,
      status: item.status,
      quality,
      byType,
      activeRelationshipCount: item.relationships.filter((relationship) => relationship.status === "active").length,
      pendingChangeRequestCount: item.changeRequests.filter((request) => request.status === "pending").length,
      openQualityIssueCount: item.qualityIssues.filter((issue) => issue.status !== "resolved").length,
      versionCount: item.versions.length,
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private applyChange(item: NationalFisheriesRegistryCase, request: RegistryChangeRequest, actorId: EntityId, appliedAt: ISODateTime) {
    const record = this.requireRecord(item, request.recordId);
    if (request.changeType === "update") {
      record.attributes = this.mergeAttributes(record.attributes, request.proposedAttributes);
      if (request.proposedIdentityKeys.length) {
        const candidate = { ...record, identityKeys: [...record.identityKeys, ...request.proposedIdentityKeys] };
        this.assertIdentityKeyUniqueness(item, candidate, record.id);
        record.identityKeys = candidate.identityKeys;
      }
    } else if (request.changeType === "merge") {
      const targetId = String(request.proposedAttributes.find((attribute) => attribute.code === "duplicate_of_record_id")?.value ?? "");
      if (!targetId) throw new Error("La fusion nécessite un enregistrement canonique cible.");
      this.requireRecord(item, targetId);
      record.duplicateOfRecordId = targetId;
      record.status = "archived";
    } else if (request.changeType === "restrict") record.status = "restricted";
    else if (request.changeType === "suspend") record.status = "suspended";
    else if (request.changeType === "revoke") record.status = "revoked";
    else if (request.changeType === "reactivate") record.status = "active";
    record.updatedAt = appliedAt;
    this.snapshotVersion(item, record.id, actorId, request.id, appliedAt);
  }

  private mergeAttributes(existing: RegistryAttribute[], proposed: RegistryAttribute[]) {
    const result = existing.map((attribute) => structuredClone(attribute));
    for (const attribute of proposed) {
      const index = result.findIndex((entry) => entry.code === attribute.code);
      if (index >= 0) result[index] = structuredClone(attribute);
      else result.push(structuredClone(attribute));
    }
    return result;
  }

  private snapshotVersion(item: NationalFisheriesRegistryCase, recordId: EntityId, actorId: EntityId, changeRequestId: EntityId | undefined, createdAt: ISODateTime) {
    const record = this.requireRecord(item, recordId);
    const version = item.versions.filter((entry) => entry.recordId === recordId).length + 1;
    item.versions.push({
      id: `version:${recordId}:${version}`,
      recordId,
      version,
      snapshot: structuredClone(record),
      changedByActorId: actorId,
      changeRequestId,
      createdAt,
    });
  }

  private findDuplicateRecordIds(item: NationalFisheriesRegistryCase) {
    const seen = new Map<string, EntityId>();
    const duplicates = new Set<EntityId>();
    for (const record of item.records.filter((entry) => !entry.duplicateOfRecordId)) {
      for (const key of record.identityKeys) {
        const composite = `${record.entityType}:${key.keyType}:${key.value}`;
        const existing = seen.get(composite);
        if (existing && existing !== record.id) {
          duplicates.add(existing);
          duplicates.add(record.id);
        } else seen.set(composite, record.id);
      }
    }
    return [...duplicates];
  }

  private assertIdentityKeyUniqueness(item: NationalFisheriesRegistryCase, candidate: RegistryRecord, ignoredRecordId?: EntityId) {
    for (const key of candidate.identityKeys) {
      const duplicate = item.records.find((record) => record.id !== ignoredRecordId && record.entityType === candidate.entityType && record.identityKeys.some((existing) => existing.keyType === key.keyType && existing.value === key.value) && !record.duplicateOfRecordId);
      if (duplicate) throw new Error(`Identité de registre déjà utilisée par ${duplicate.id}.`);
    }
  }

  private syncIssue(item: NationalFisheriesRegistryCase, issueType: RegistryDataQualityIssue["issueType"], recordIds: EntityId[], severity: RegistryDataQualityIssue["severity"], detectedAt: ISODateTime) {
    for (const recordId of recordIds) {
      const existing = item.qualityIssues.find((issue) => issue.recordId === recordId && issue.issueType === issueType && issue.status !== "resolved");
      if (!existing) {
        item.qualityIssues.push({
          id: `dq:${issueType}:${recordId}`,
          recordId,
          issueType,
          severity,
          description: `Incident ${issueType} détecté sur ${recordId}.`,
          status: "open",
          detectedAt,
          evidenceIds: [],
        });
      }
    }
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Registre introuvable : ${id}.`);
    return item;
  }

  private requireRecord(item: NationalFisheriesRegistryCase, id: EntityId) {
    const value = item.records.find((entry) => entry.id === id);
    if (!value) throw new Error(`Enregistrement introuvable : ${id}.`);
    return value;
  }

  private requireChangeRequest(item: NationalFisheriesRegistryCase, id: EntityId) {
    const value = item.changeRequests.find((entry) => entry.id === id);
    if (!value) throw new Error(`Demande de changement introuvable : ${id}.`);
    return value;
  }

  private touch(item: NationalFisheriesRegistryCase, updatedAt: ISODateTime) {
    item.updatedAt = updatedAt;
    this.cases.set(item.id, item);
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }
}
