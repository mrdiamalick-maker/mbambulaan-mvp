import type { EntityId, ISODateTime } from "../infrastructures/types";

export type QualityCaseStatus =
  | "open"
  | "under_control"
  | "restricted"
  | "remediating"
  | "certified"
  | "suspended"
  | "closed";

export type ControlResult = "compliant" | "warning" | "non_compliant" | "critical";

export interface TraceabilityNode {
  id: EntityId;
  nodeType:
    | "campaign"
    | "vessel"
    | "crew"
    | "landing"
    | "lot"
    | "storage"
    | "transport"
    | "processing"
    | "sale"
    | "delivery"
    | "certificate";
  referenceId: EntityId;
  territoryId: EntityId;
  actorId?: EntityId;
  organizationId?: EntityId;
  occurredAt: ISODateTime;
  quantityKg?: number;
  speciesCode?: string;
  parentNodeIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface QualityRequirement {
  id: EntityId;
  code: string;
  label: string;
  category:
    | "sanitary"
    | "temperature"
    | "freshness"
    | "species_identity"
    | "size"
    | "handling"
    | "storage"
    | "transport"
    | "processing"
    | "documentation"
    | "sustainability"
    | "market_access";
  appliesToNodeTypes: TraceabilityNode["nodeType"][];
  targetValue?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
  unit?: string;
  mandatory: boolean;
  authorityActorId?: EntityId;
  evidenceRequired: boolean;
  status: "active" | "inactive";
}

export interface QualityControl {
  id: EntityId;
  nodeId: EntityId;
  requirementId: EntityId;
  controlledByActorId: EntityId;
  controlledAt: ISODateTime;
  measuredValue?: number;
  qualitativeValue?: string;
  result: ControlResult;
  remarks: string[];
  evidenceIds: EntityId[];
  sourceDeviceIds: EntityId[];
}

export interface NonComplianceCase {
  id: EntityId;
  nodeId: EntityId;
  requirementId: EntityId;
  controlId: EntityId;
  severity: "minor" | "major" | "critical";
  liableActorIds: EntityId[];
  affectedLotIds: EntityId[];
  affectedQuantityKg: number;
  commercialValueAtRiskXof: number;
  status: "open" | "contained" | "correcting" | "resolved" | "waived" | "escalated";
  containmentActions: string[];
  correctiveActionIds: EntityId[];
  evidenceIds: EntityId[];
  openedAt: ISODateTime;
  resolvedAt?: ISODateTime;
}

export interface CorrectiveAction {
  id: EntityId;
  nonComplianceId: EntityId;
  actionType:
    | "quarantine"
    | "reinspection"
    | "reconditioning"
    | "cold_chain_restoration"
    | "withdrawal"
    | "destruction"
    | "training"
    | "process_change"
    | "supplier_suspension"
    | "documentation_completion";
  ownerActorId: EntityId;
  dueAt: ISODateTime;
  status: "planned" | "in_progress" | "blocked" | "completed" | "cancelled";
  protectedQuantityKg: number;
  protectedValueXof: number;
  evidenceIds: EntityId[];
  completedAt?: ISODateTime;
}

export interface MarketAuthorization {
  id: EntityId;
  nodeId: EntityId;
  lotId: EntityId;
  marketType: "local" | "national" | "institutional" | "export" | "processing_only";
  decision: "authorized" | "authorized_with_conditions" | "restricted" | "prohibited";
  decidedByActorId: EntityId;
  conditions: string[];
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  controlIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface ComplianceCertificate {
  id: EntityId;
  certificateType:
    | "sanitary"
    | "quality"
    | "traceability"
    | "sustainability"
    | "market_access"
    | "facility_compliance"
    | "actor_compliance";
  subjectType: "lot" | "actor" | "organization" | "facility" | "campaign";
  subjectId: EntityId;
  issuedByActorId: EntityId;
  issuedAt: ISODateTime;
  validUntil?: ISODateTime;
  status: "active" | "suspended" | "revoked" | "expired";
  requirementIds: EntityId[];
  controlIds: EntityId[];
  evidenceIds: EntityId[];
}

export interface ComplianceSanction {
  id: EntityId;
  nonComplianceId: EntityId;
  sanctionedActorId: EntityId;
  sanctionType:
    | "warning"
    | "temporary_restriction"
    | "market_suspension"
    | "certificate_suspension"
    | "financial_penalty"
    | "exclusion";
  amountXof?: number;
  validFrom: ISODateTime;
  validUntil?: ISODateTime;
  reason: string;
  status: "decided" | "active" | "completed" | "cancelled";
  evidenceIds: EntityId[];
}

export interface QualityComplianceCase {
  id: EntityId;
  caseCode: string;
  countryId: EntityId;
  territoryIds: EntityId[];
  status: QualityCaseStatus;
  traceabilityNodes: TraceabilityNode[];
  requirements: QualityRequirement[];
  controls: QualityControl[];
  nonCompliances: NonComplianceCase[];
  correctiveActions: CorrectiveAction[];
  marketAuthorizations: MarketAuthorization[];
  certificates: ComplianceCertificate[];
  sanctions: ComplianceSanction[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface TraceabilityAuditReport {
  caseId: EntityId;
  score: number;
  complete: boolean;
  orphanNodeIds: EntityId[];
  nodesWithoutEvidenceIds: EntityId[];
  brokenQuantityNodeIds: EntityId[];
  missingControlNodeIds: EntityId[];
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export class EndToEndQualityComplianceCertificationTraceabilityCapability {
  private readonly cases = new Map<EntityId, QualityComplianceCase>();

  openCase(input: {
    id: EntityId;
    caseCode: string;
    countryId: EntityId;
    territoryIds: EntityId[];
    createdAt: ISODateTime;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier qualité ${input.id} existe déjà.`);
    const item: QualityComplianceCase = {
      id: input.id,
      caseCode: input.caseCode,
      countryId: input.countryId,
      territoryIds: [...new Set(input.territoryIds)],
      status: "open",
      traceabilityNodes: [],
      requirements: [],
      controls: [],
      nonCompliances: [],
      correctiveActions: [],
      marketAuthorizations: [],
      certificates: [],
      sanctions: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  registerRequirement(input: { caseId: EntityId; requirement: QualityRequirement; registeredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.requirements.some((entry) => entry.id === input.requirement.id)) throw new Error(`L'exigence ${input.requirement.id} existe déjà.`);
    item.requirements.push(structuredClone(input.requirement));
    this.touch(item, input.registeredAt);
    return structuredClone(item);
  }

  addTraceabilityNode(input: { caseId: EntityId; node: TraceabilityNode }) {
    const item = this.requireCase(input.caseId);
    if (!item.territoryIds.includes(input.node.territoryId)) throw new Error(`Territoire hors périmètre : ${input.node.territoryId}.`);
    if (item.traceabilityNodes.some((entry) => entry.id === input.node.id)) throw new Error(`Le nœud ${input.node.id} existe déjà.`);
    for (const parentNodeId of input.node.parentNodeIds) this.requireNode(item, parentNodeId);
    if (input.node.quantityKg !== undefined && input.node.quantityKg < 0) throw new Error("La quantité ne peut pas être négative.");
    item.traceabilityNodes.push(structuredClone(input.node));
    this.touch(item, input.node.occurredAt);
    return structuredClone(item);
  }

  recordControl(input: { caseId: EntityId; control: Omit<QualityControl, "result"> }) {
    const item = this.requireCase(input.caseId);
    const node = this.requireNode(item, input.control.nodeId);
    const requirement = this.requireRequirement(item, input.control.requirementId);
    if (!requirement.appliesToNodeTypes.includes(node.nodeType)) throw new Error("L'exigence ne s'applique pas à ce type de nœud.");
    if (requirement.evidenceRequired && input.control.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour ce contrôle.");
    const result = this.evaluateRequirement(requirement, input.control.measuredValue);
    const control: QualityControl = { ...structuredClone(input.control), result };
    item.controls.push(control);
    if (result === "non_compliant" || result === "critical") item.status = "restricted";
    else if (item.status === "open") item.status = "under_control";
    this.touch(item, input.control.controlledAt);
    return structuredClone(control);
  }

  openNonCompliance(input: {
    caseId: EntityId;
    nonCompliance: NonComplianceCase;
  }) {
    const item = this.requireCase(input.caseId);
    const control = this.requireControl(item, input.nonCompliance.controlId);
    if (! ["non_compliant", "critical"].includes(control.result)) throw new Error("Une non-conformité nécessite un contrôle en échec.");
    if (input.nonCompliance.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour ouvrir une non-conformité.");
    item.nonCompliances.push(structuredClone(input.nonCompliance));
    item.status = "restricted";
    this.touch(item, input.nonCompliance.openedAt);
    return structuredClone(item);
  }

  registerCorrectiveAction(input: { caseId: EntityId; action: CorrectiveAction; registeredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const nonCompliance = this.requireNonCompliance(item, input.action.nonComplianceId);
    item.correctiveActions.push(structuredClone(input.action));
    nonCompliance.correctiveActionIds = this.unique([...nonCompliance.correctiveActionIds, input.action.id]);
    nonCompliance.status = "correcting";
    item.status = "remediating";
    this.touch(item, input.registeredAt);
    return structuredClone(item);
  }

  completeCorrectiveAction(input: { caseId: EntityId; actionId: EntityId; completedAt: ISODateTime; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    const action = this.requireCorrectiveAction(item, input.actionId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour terminer une action corrective.");
    action.status = "completed";
    action.completedAt = input.completedAt;
    action.evidenceIds = this.unique([...action.evidenceIds, ...input.evidenceIds]);
    const nonCompliance = this.requireNonCompliance(item, action.nonComplianceId);
    const relatedActions = item.correctiveActions.filter((entry) => entry.nonComplianceId === nonCompliance.id);
    if (relatedActions.length > 0 && relatedActions.every((entry) => ["completed", "cancelled"].includes(entry.status))) {
      nonCompliance.status = "resolved";
      nonCompliance.resolvedAt = input.completedAt;
    }
    if (item.nonCompliances.every((entry) => ["resolved", "waived"].includes(entry.status))) item.status = "under_control";
    this.touch(item, input.completedAt);
    return structuredClone(action);
  }

  decideMarketAuthorization(input: { caseId: EntityId; authorization: MarketAuthorization }) {
    const item = this.requireCase(input.caseId);
    const node = this.requireNode(item, input.authorization.nodeId);
    if (node.nodeType !== "lot") throw new Error("L'autorisation de marché doit porter sur un lot.");
    for (const controlId of input.authorization.controlIds) this.requireControl(item, controlId);
    if (input.authorization.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour décider l'accès au marché.");
    const unresolvedCritical = item.nonCompliances.some((entry) => entry.affectedLotIds.includes(input.authorization.lotId) && entry.severity === "critical" && !["resolved", "waived"].includes(entry.status));
    if (unresolvedCritical && ["authorized", "authorized_with_conditions"].includes(input.authorization.decision)) throw new Error("Un lot avec une non-conformité critique ouverte ne peut pas être autorisé.");
    item.marketAuthorizations.push(structuredClone(input.authorization));
    this.touch(item, input.authorization.validFrom);
    return structuredClone(item);
  }

  issueCertificate(input: { caseId: EntityId; certificate: ComplianceCertificate }) {
    const item = this.requireCase(input.caseId);
    if (input.certificate.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour émettre un certificat.");
    for (const requirementId of input.certificate.requirementIds) this.requireRequirement(item, requirementId);
    for (const controlId of input.certificate.controlIds) {
      const control = this.requireControl(item, controlId);
      if (control.result === "critical" || control.result === "non_compliant") throw new Error("Un certificat ne peut pas s'appuyer sur un contrôle en échec.");
    }
    item.certificates.push(structuredClone(input.certificate));
    item.status = "certified";
    this.touch(item, input.certificate.issuedAt);
    return structuredClone(input.certificate);
  }

  suspendCertificate(input: { caseId: EntityId; certificateId: EntityId; suspendedAt: ISODateTime; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    const certificate = this.requireCertificate(item, input.certificateId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour suspendre un certificat.");
    certificate.status = "suspended";
    certificate.evidenceIds = this.unique([...certificate.evidenceIds, ...input.evidenceIds]);
    item.status = "suspended";
    this.touch(item, input.suspendedAt);
    return structuredClone(certificate);
  }

  applySanction(input: { caseId: EntityId; sanction: ComplianceSanction }) {
    const item = this.requireCase(input.caseId);
    this.requireNonCompliance(item, input.sanction.nonComplianceId);
    if (input.sanction.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour sanctionner.");
    item.sanctions.push(structuredClone(input.sanction));
    if (["market_suspension", "certificate_suspension", "exclusion"].includes(input.sanction.sanctionType)) item.status = "suspended";
    this.touch(item, input.sanction.validFrom);
    return structuredClone(item);
  }

  auditTraceability(input: { caseId: EntityId; generatedAt: ISODateTime }): TraceabilityAuditReport {
    const item = this.requireCase(input.caseId);
    const orphanNodeIds = item.traceabilityNodes
      .filter((node) => !["campaign", "vessel", "crew"].includes(node.nodeType) && node.parentNodeIds.length === 0)
      .map((node) => node.id);
    const nodesWithoutEvidenceIds = item.traceabilityNodes.filter((node) => node.evidenceIds.length === 0).map((node) => node.id);
    const brokenQuantityNodeIds = item.traceabilityNodes.filter((node) => {
      if (node.quantityKg === undefined || node.parentNodeIds.length === 0) return false;
      const parents = node.parentNodeIds.map((id) => this.requireNode(item, id));
      const knownParentQuantity = parents.reduce((sum, parent) => sum + (parent.quantityKg ?? 0), 0);
      return knownParentQuantity > 0 && node.quantityKg! > knownParentQuantity;
    }).map((node) => node.id);
    const missingControlNodeIds = item.traceabilityNodes.filter((node) => {
      const mandatoryRequirements = item.requirements.filter((requirement) => requirement.status === "active" && requirement.mandatory && requirement.appliesToNodeTypes.includes(node.nodeType));
      return mandatoryRequirements.some((requirement) => !item.controls.some((control) => control.nodeId === node.id && control.requirementId === requirement.id));
    }).map((node) => node.id);
    const blockers: string[] = [];
    const warnings: string[] = [];
    if (orphanNodeIds.length > 0) blockers.push("Des nœuds de traçabilité sont orphelins.");
    if (brokenQuantityNodeIds.length > 0) blockers.push("Des quantités dépassent leurs quantités parentes.");
    if (missingControlNodeIds.length > 0) blockers.push("Des contrôles obligatoires sont manquants.");
    if (nodesWithoutEvidenceIds.length > 0) warnings.push("Certains nœuds ne possèdent aucune preuve.");
    const score = Math.max(0, 100 - blockers.length * 25 - warnings.length * 10 - orphanNodeIds.length * 3 - brokenQuantityNodeIds.length * 5 - missingControlNodeIds.length * 3);
    item.blockers = blockers;
    item.warnings = warnings;
    this.touch(item, input.generatedAt);
    return { caseId: item.id, score, complete: blockers.length === 0, orphanNodeIds, nodesWithoutEvidenceIds, brokenQuantityNodeIds, missingControlNodeIds, blockers, warnings, generatedAt: input.generatedAt };
  }

  getQualityCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const audit = this.auditTraceability({ caseId: item.id, generatedAt: input.generatedAt });
    const activeCertificates = item.certificates.filter((certificate) => certificate.status === "active" && (!certificate.validUntil || certificate.validUntil >= input.generatedAt));
    return {
      caseId: item.id,
      status: item.status,
      traceabilityAudit: audit,
      nodeCount: item.traceabilityNodes.length,
      controlCount: item.controls.length,
      compliantControlPercent: item.controls.length ? this.round(item.controls.filter((control) => control.result === "compliant").length / item.controls.length * 100) : 100,
      openNonComplianceCount: item.nonCompliances.filter((entry) => !["resolved", "waived"].includes(entry.status)).length,
      criticalNonComplianceCount: item.nonCompliances.filter((entry) => entry.severity === "critical" && !["resolved", "waived"].includes(entry.status)).length,
      restrictedLotCount: new Set(item.marketAuthorizations.filter((entry) => ["restricted", "prohibited"].includes(entry.decision)).map((entry) => entry.lotId)).size,
      activeCertificateCount: activeCertificates.length,
      activeSanctionCount: item.sanctions.filter((sanction) => sanction.status === "active").length,
      protectedQuantityKg: item.correctiveActions.filter((entry) => entry.status === "completed").reduce((sum, entry) => sum + entry.protectedQuantityKg, 0),
      protectedValueXof: item.correctiveActions.filter((entry) => entry.status === "completed").reduce((sum, entry) => sum + entry.protectedValueXof, 0),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private evaluateRequirement(requirement: QualityRequirement, value?: number): ControlResult {
    if (value === undefined || requirement.targetValue === undefined) return "compliant";
    if (requirement.criticalThreshold !== undefined) {
      const criticalDistance = Math.abs(requirement.criticalThreshold - requirement.targetValue);
      const actualDistance = Math.abs(value - requirement.targetValue);
      if (actualDistance >= criticalDistance) return "critical";
    }
    if (requirement.warningThreshold !== undefined) {
      const warningDistance = Math.abs(requirement.warningThreshold - requirement.targetValue);
      const actualDistance = Math.abs(value - requirement.targetValue);
      if (actualDistance >= warningDistance) return "non_compliant";
    }
    return "compliant";
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier qualité introuvable : ${id}.`);
    return item;
  }

  private requireNode(item: QualityComplianceCase, id: EntityId) {
    const value = item.traceabilityNodes.find((entry) => entry.id === id);
    if (!value) throw new Error(`Nœud de traçabilité introuvable : ${id}.`);
    return value;
  }

  private requireRequirement(item: QualityComplianceCase, id: EntityId) {
    const value = item.requirements.find((entry) => entry.id === id);
    if (!value) throw new Error(`Exigence qualité introuvable : ${id}.`);
    return value;
  }

  private requireControl(item: QualityComplianceCase, id: EntityId) {
    const value = item.controls.find((entry) => entry.id === id);
    if (!value) throw new Error(`Contrôle qualité introuvable : ${id}.`);
    return value;
  }

  private requireNonCompliance(item: QualityComplianceCase, id: EntityId) {
    const value = item.nonCompliances.find((entry) => entry.id === id);
    if (!value) throw new Error(`Non-conformité introuvable : ${id}.`);
    return value;
  }

  private requireCorrectiveAction(item: QualityComplianceCase, id: EntityId) {
    const value = item.correctiveActions.find((entry) => entry.id === id);
    if (!value) throw new Error(`Action corrective introuvable : ${id}.`);
    return value;
  }

  private requireCertificate(item: QualityComplianceCase, id: EntityId) {
    const value = item.certificates.find((entry) => entry.id === id);
    if (!value) throw new Error(`Certificat introuvable : ${id}.`);
    return value;
  }

  private touch(item: QualityComplianceCase, updatedAt: ISODateTime) {
    item.updatedAt = updatedAt;
    this.cases.set(item.id, item);
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
