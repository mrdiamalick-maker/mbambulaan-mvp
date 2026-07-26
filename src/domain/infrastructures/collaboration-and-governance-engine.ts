import type { EntityId, ISODateTime } from "./types";
import type { MvpActorKind } from "./mvp-completeness-model";

export type CollaborationCaseType =
  | "onboarding"
  | "landing"
  | "weighing"
  | "lot"
  | "service"
  | "commitment"
  | "incident"
  | "program"
  | "financing"
  | "insurance"
  | "public_decision";

export type CollaborationCaseStatus =
  | "open"
  | "waiting_for_actor"
  | "under_review"
  | "approved"
  | "rejected"
  | "resolved"
  | "closed";

export type ParticipationRole =
  | "owner"
  | "contributor"
  | "validator"
  | "observer"
  | "escalation_authority";

export interface CollaborationParticipant {
  actorId: EntityId;
  actorKind: MvpActorKind;
  role: ParticipationRole;
  organizationId?: EntityId;
  canComment: boolean;
  canAttachEvidence: boolean;
  canValidate: boolean;
  canEscalate: boolean;
  joinedAt: ISODateTime;
}

export interface CollaborationComment {
  id: EntityId;
  caseId: EntityId;
  authorId: EntityId;
  authorKind: MvpActorKind;
  body: string;
  visibility: "all_participants" | "validators_only" | "institutional_only";
  createdAt: ISODateTime;
}

export interface EvidenceAttachment {
  id: EntityId;
  caseId: EntityId;
  uploadedBy: EntityId;
  uploadedByKind: MvpActorKind;
  evidenceType:
    | "photo"
    | "document"
    | "weighing_record"
    | "delivery_proof"
    | "identity_document"
    | "decision_note"
    | "other";
  filename: string;
  contentType: string;
  checksum: string;
  subjectId?: EntityId;
  capturedAt?: ISODateTime;
  createdAt: ISODateTime;
  verified: boolean;
  verifiedBy?: EntityId;
  verifiedAt?: ISODateTime;
}

export interface ApprovalRequirement {
  code: string;
  name: string;
  requiredActorKinds: MvpActorKind[];
  minimumApprovals: number;
  allowSelfApproval: boolean;
  blocking: boolean;
}

export interface ApprovalRecord {
  id: EntityId;
  caseId: EntityId;
  requirementCode: string;
  actorId: EntityId;
  actorKind: MvpActorKind;
  decision: "approved" | "rejected" | "needs_changes";
  reason?: string;
  decidedAt: ISODateTime;
}

export interface Delegation {
  id: EntityId;
  delegatorActorId: EntityId;
  delegateActorId: EntityId;
  actorKind: MvpActorKind;
  organizationId?: EntityId;
  scopes: string[];
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  active: boolean;
}

export interface CollaborationCase {
  id: EntityId;
  type: CollaborationCaseType;
  title: string;
  status: CollaborationCaseStatus;
  territoryId: EntityId;
  subjectId?: EntityId;
  parentCaseId?: EntityId;
  ownerActorId: EntityId;
  ownerActorKind: MvpActorKind;
  participants: CollaborationParticipant[];
  approvalRequirements: ApprovalRequirement[];
  approvalRecords: ApprovalRecord[];
  comments: CollaborationComment[];
  attachments: EvidenceAttachment[];
  tags: string[];
  dueAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  closedAt?: ISODateTime;
}

export interface CollaborationCaseTemplate {
  code: string;
  type: CollaborationCaseType;
  titleTemplate: string;
  defaultParticipants: Array<{
    actorKind: MvpActorKind;
    role: ParticipationRole;
  }>;
  approvalRequirements: ApprovalRequirement[];
  defaultDueInHours?: number;
  requiredEvidenceTypes: EvidenceAttachment["evidenceType"][];
}

const templates: CollaborationCaseTemplate[] = [
  {
    code: "fisher_onboarding_review",
    type: "onboarding",
    titleTemplate: "Validation de l'enrôlement de {{actor_name}}",
    defaultParticipants: [
      { actorKind: "fisher", role: "owner" },
      { actorKind: "cooperative", role: "validator" },
      { actorKind: "landing_site", role: "observer" },
    ],
    approvalRequirements: [
      {
        code: "cooperative_membership",
        name: "Validation du rattachement au GIE",
        requiredActorKinds: ["cooperative"],
        minimumApprovals: 1,
        allowSelfApproval: false,
        blocking: true,
      },
    ],
    defaultDueInHours: 48,
    requiredEvidenceTypes: ["identity_document"],
  },
  {
    code: "weighing_validation",
    type: "weighing",
    titleTemplate: "Validation de la pesée {{weighing_reference}}",
    defaultParticipants: [
      { actorKind: "landing_site", role: "owner" },
      { actorKind: "cooperative", role: "validator" },
      { actorKind: "fisher", role: "observer" },
    ],
    approvalRequirements: [
      {
        code: "weighing_reference_validation",
        name: "Validation de la pesée de référence",
        requiredActorKinds: ["landing_site", "cooperative"],
        minimumApprovals: 1,
        allowSelfApproval: false,
        blocking: true,
      },
    ],
    defaultDueInHours: 4,
    requiredEvidenceTypes: ["weighing_record"],
  },
  {
    code: "service_execution_confirmation",
    type: "service",
    titleTemplate: "Confirmation du service {{service_type}}",
    defaultParticipants: [
      { actorKind: "logistics", role: "owner" },
      { actorKind: "landing_site", role: "validator" },
      { actorKind: "cooperative", role: "validator" },
      { actorKind: "fisher", role: "observer" },
      { actorKind: "buyer", role: "observer" },
    ],
    approvalRequirements: [
      {
        code: "service_receiver_confirmation",
        name: "Confirmation par le bénéficiaire ou coordinateur",
        requiredActorKinds: ["landing_site", "cooperative", "fisher", "buyer"],
        minimumApprovals: 1,
        allowSelfApproval: false,
        blocking: true,
      },
    ],
    defaultDueInHours: 12,
    requiredEvidenceTypes: ["delivery_proof"],
  },
  {
    code: "commitment_dispute_resolution",
    type: "commitment",
    titleTemplate: "Résolution du litige {{commitment_reference}}",
    defaultParticipants: [
      { actorKind: "buyer", role: "contributor" },
      { actorKind: "processor", role: "contributor" },
      { actorKind: "cooperative", role: "validator" },
      { actorKind: "fisher", role: "contributor" },
      { actorKind: "public_agency", role: "escalation_authority" },
    ],
    approvalRequirements: [
      {
        code: "commercial_resolution",
        name: "Accord de résolution",
        requiredActorKinds: ["buyer", "processor", "cooperative", "fisher"],
        minimumApprovals: 2,
        allowSelfApproval: true,
        blocking: true,
      },
    ],
    defaultDueInHours: 72,
    requiredEvidenceTypes: ["delivery_proof", "photo"],
  },
  {
    code: "critical_incident_resolution",
    type: "incident",
    titleTemplate: "Incident critique {{incident_reference}}",
    defaultParticipants: [
      { actorKind: "cooperative", role: "contributor" },
      { actorKind: "landing_site", role: "contributor" },
      { actorKind: "public_agency", role: "owner" },
      { actorKind: "ministry", role: "escalation_authority" },
    ],
    approvalRequirements: [
      {
        code: "field_resolution_validation",
        name: "Validation de la résolution terrain",
        requiredActorKinds: ["public_agency"],
        minimumApprovals: 1,
        allowSelfApproval: true,
        blocking: true,
      },
      {
        code: "institutional_closure",
        name: "Clôture institutionnelle",
        requiredActorKinds: ["ministry", "public_agency"],
        minimumApprovals: 1,
        allowSelfApproval: true,
        blocking: false,
      },
    ],
    defaultDueInHours: 24,
    requiredEvidenceTypes: ["photo", "decision_note"],
  },
  {
    code: "program_beneficiary_approval",
    type: "program",
    titleTemplate: "Éligibilité du bénéficiaire {{beneficiary_name}}",
    defaultParticipants: [
      { actorKind: "development_partner", role: "owner" },
      { actorKind: "public_agency", role: "validator" },
      { actorKind: "ministry", role: "observer" },
      { actorKind: "cooperative", role: "contributor" },
    ],
    approvalRequirements: [
      {
        code: "beneficiary_eligibility",
        name: "Validation de l'éligibilité",
        requiredActorKinds: ["development_partner", "public_agency"],
        minimumApprovals: 1,
        allowSelfApproval: true,
        blocking: true,
      },
    ],
    defaultDueInHours: 120,
    requiredEvidenceTypes: ["identity_document", "document"],
  },
  {
    code: "financing_case_review",
    type: "financing",
    titleTemplate: "Étude du dossier de financement {{case_reference}}",
    defaultParticipants: [
      { actorKind: "financial_institution", role: "owner" },
      { actorKind: "fisher", role: "contributor" },
      { actorKind: "cooperative", role: "contributor" },
    ],
    approvalRequirements: [
      {
        code: "financing_decision",
        name: "Décision de financement",
        requiredActorKinds: ["financial_institution"],
        minimumApprovals: 1,
        allowSelfApproval: true,
        blocking: true,
      },
    ],
    defaultDueInHours: 240,
    requiredEvidenceTypes: ["document"],
  },
  {
    code: "insurance_case_review",
    type: "insurance",
    titleTemplate: "Étude du dossier d'assurance {{case_reference}}",
    defaultParticipants: [
      { actorKind: "insurer", role: "owner" },
      { actorKind: "fisher", role: "contributor" },
      { actorKind: "cooperative", role: "contributor" },
    ],
    approvalRequirements: [
      {
        code: "insurance_decision",
        name: "Décision d'assurance",
        requiredActorKinds: ["insurer"],
        minimumApprovals: 1,
        allowSelfApproval: true,
        blocking: true,
      },
    ],
    defaultDueInHours: 240,
    requiredEvidenceTypes: ["document"],
  },
];

export class CollaborationAndGovernanceEngine {
  private readonly cases = new Map<EntityId, CollaborationCase>();
  private readonly delegations = new Map<EntityId, Delegation>();

  createCase(input: {
    id: EntityId;
    templateCode: string;
    title: string;
    territoryId: EntityId;
    ownerActorId: EntityId;
    ownerActorKind: MvpActorKind;
    subjectId?: EntityId;
    parentCaseId?: EntityId;
    participants: CollaborationParticipant[];
    tags?: string[];
    createdAt: ISODateTime;
    dueAt?: ISODateTime;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier ${input.id} existe déjà.`);
    const template = this.requireTemplate(input.templateCode);

    const ownerIsParticipant = input.participants.some(
      (participant) => participant.actorId === input.ownerActorId && participant.role === "owner",
    );
    if (!ownerIsParticipant) throw new Error("Le propriétaire doit être participant avec le rôle owner.");

    const collaborationCase: CollaborationCase = {
      id: input.id,
      type: template.type,
      title: input.title,
      status: "open",
      territoryId: input.territoryId,
      subjectId: input.subjectId,
      parentCaseId: input.parentCaseId,
      ownerActorId: input.ownerActorId,
      ownerActorKind: input.ownerActorKind,
      participants: structuredClone(input.participants),
      approvalRequirements: structuredClone(template.approvalRequirements),
      approvalRecords: [],
      comments: [],
      attachments: [],
      tags: [...(input.tags ?? [])],
      dueAt: input.dueAt,
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };

    this.cases.set(collaborationCase.id, collaborationCase);
    return structuredClone(collaborationCase);
  }

  addComment(input: {
    id: EntityId;
    caseId: EntityId;
    authorId: EntityId;
    authorKind: MvpActorKind;
    body: string;
    visibility: CollaborationComment["visibility"];
    createdAt: ISODateTime;
  }) {
    const collaborationCase = this.requireCase(input.caseId);
    const participant = this.requireParticipant(collaborationCase, input.authorId, input.authorKind);
    if (!participant.canComment) throw new Error("Cet acteur ne peut pas commenter ce dossier.");
    if (!input.body.trim()) throw new Error("Le commentaire ne peut pas être vide.");

    const comment: CollaborationComment = { ...input };
    collaborationCase.comments.push(comment);
    collaborationCase.updatedAt = input.createdAt;
    this.cases.set(collaborationCase.id, collaborationCase);
    return structuredClone(comment);
  }

  attachEvidence(input: EvidenceAttachment) {
    const collaborationCase = this.requireCase(input.caseId);
    const participant = this.requireParticipant(collaborationCase, input.uploadedBy, input.uploadedByKind);
    if (!participant.canAttachEvidence) throw new Error("Cet acteur ne peut pas joindre de preuve.");
    if (!input.checksum) throw new Error("Une empreinte de fichier est requise.");

    collaborationCase.attachments.push(structuredClone(input));
    collaborationCase.updatedAt = input.createdAt;
    this.cases.set(collaborationCase.id, collaborationCase);
    return structuredClone(input);
  }

  verifyEvidence(input: {
    caseId: EntityId;
    attachmentId: EntityId;
    verifierId: EntityId;
    verifierKind: MvpActorKind;
    verifiedAt: ISODateTime;
  }) {
    const collaborationCase = this.requireCase(input.caseId);
    const participant = this.requireParticipant(collaborationCase, input.verifierId, input.verifierKind);
    if (!participant.canValidate) throw new Error("Cet acteur ne peut pas vérifier les preuves.");

    const attachment = collaborationCase.attachments.find((item) => item.id === input.attachmentId);
    if (!attachment) throw new Error(`Preuve introuvable : ${input.attachmentId}.`);
    attachment.verified = true;
    attachment.verifiedBy = input.verifierId;
    attachment.verifiedAt = input.verifiedAt;
    collaborationCase.updatedAt = input.verifiedAt;
    this.cases.set(collaborationCase.id, collaborationCase);
    return structuredClone(attachment);
  }

  recordApproval(input: {
    id: EntityId;
    caseId: EntityId;
    requirementCode: string;
    actorId: EntityId;
    actorKind: MvpActorKind;
    decision: ApprovalRecord["decision"];
    reason?: string;
    decidedAt: ISODateTime;
  }) {
    const collaborationCase = this.requireCase(input.caseId);
    const participant = this.requireParticipant(collaborationCase, input.actorId, input.actorKind);
    if (!participant.canValidate) throw new Error("Cet acteur ne peut pas valider ce dossier.");

    const requirement = collaborationCase.approvalRequirements.find(
      (item) => item.code === input.requirementCode,
    );
    if (!requirement) throw new Error(`Exigence inconnue : ${input.requirementCode}.`);
    if (!requirement.requiredActorKinds.includes(input.actorKind)) {
      throw new Error("Ce type d'acteur ne peut pas répondre à cette exigence.");
    }
    if (!requirement.allowSelfApproval && collaborationCase.ownerActorId === input.actorId) {
      throw new Error("L'auto-approbation est interdite pour cette exigence.");
    }

    const existingIndex = collaborationCase.approvalRecords.findIndex(
      (item) => item.requirementCode === input.requirementCode && item.actorId === input.actorId,
    );
    const record: ApprovalRecord = { ...input };
    if (existingIndex >= 0) collaborationCase.approvalRecords[existingIndex] = record;
    else collaborationCase.approvalRecords.push(record);

    collaborationCase.updatedAt = input.decidedAt;
    collaborationCase.status = this.computeCaseStatus(collaborationCase);
    this.cases.set(collaborationCase.id, collaborationCase);
    return structuredClone(collaborationCase);
  }

  closeCase(input: {
    caseId: EntityId;
    actorId: EntityId;
    actorKind: MvpActorKind;
    closedAt: ISODateTime;
  }) {
    const collaborationCase = this.requireCase(input.caseId);
    const participant = this.requireParticipant(collaborationCase, input.actorId, input.actorKind);
    if (!participant.canValidate && participant.role !== "owner") {
      throw new Error("Cet acteur ne peut pas clôturer ce dossier.");
    }

    const missingEvidence = this.getMissingRequiredEvidence(collaborationCase);
    if (missingEvidence.length > 0) {
      throw new Error(`Preuves requises manquantes : ${missingEvidence.join(", ")}.`);
    }

    const blockingRequirements = collaborationCase.approvalRequirements.filter((item) => item.blocking);
    for (const requirement of blockingRequirements) {
      const approvedCount = collaborationCase.approvalRecords.filter(
        (record) => record.requirementCode === requirement.code && record.decision === "approved",
      ).length;
      if (approvedCount < requirement.minimumApprovals) {
        throw new Error(`L'exigence ${requirement.code} n'est pas satisfaite.`);
      }
    }

    collaborationCase.status = "closed";
    collaborationCase.closedAt = input.closedAt;
    collaborationCase.updatedAt = input.closedAt;
    this.cases.set(collaborationCase.id, collaborationCase);
    return structuredClone(collaborationCase);
  }

  createDelegation(input: Delegation) {
    if (this.delegations.has(input.id)) throw new Error(`La délégation ${input.id} existe déjà.`);
    if (input.delegatorActorId === input.delegateActorId) throw new Error("Une délégation doit viser un autre acteur.");
    if (input.scopes.length === 0) throw new Error("Une délégation doit avoir au moins un périmètre.");
    this.delegations.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  resolveDelegatedAuthority(input: {
    actorId: EntityId;
    actorKind: MvpActorKind;
    scope: string;
    at: ISODateTime;
  }) {
    return [...this.delegations.values()]
      .filter((delegation) => delegation.delegateActorId === input.actorId)
      .filter((delegation) => delegation.actorKind === input.actorKind)
      .filter((delegation) => delegation.active)
      .filter((delegation) => delegation.scopes.includes(input.scope))
      .filter((delegation) => delegation.startsAt <= input.at)
      .filter((delegation) => !delegation.endsAt || delegation.endsAt >= input.at)
      .map((delegation) => structuredClone(delegation));
  }

  getCase(caseId: EntityId) {
    return structuredClone(this.requireCase(caseId));
  }

  listCases(filters?: {
    actorId?: EntityId;
    actorKind?: MvpActorKind;
    status?: CollaborationCaseStatus;
    type?: CollaborationCaseType;
    territoryId?: EntityId;
  }) {
    return [...this.cases.values()]
      .filter((item) => !filters?.actorId || item.participants.some((p) => p.actorId === filters.actorId))
      .filter((item) => !filters?.actorKind || item.participants.some((p) => p.actorKind === filters.actorKind))
      .filter((item) => !filters?.status || item.status === filters.status)
      .filter((item) => !filters?.type || item.type === filters.type)
      .filter((item) => !filters?.territoryId || item.territoryId === filters.territoryId)
      .map((item) => structuredClone(item));
  }

  getCaseReadiness(caseId: EntityId) {
    const collaborationCase = this.requireCase(caseId);
    const missingEvidence = this.getMissingRequiredEvidence(collaborationCase);
    const unsatisfiedRequirements = collaborationCase.approvalRequirements
      .filter((requirement) => requirement.blocking)
      .filter((requirement) => {
        const approvedCount = collaborationCase.approvalRecords.filter(
          (record) => record.requirementCode === requirement.code && record.decision === "approved",
        ).length;
        return approvedCount < requirement.minimumApprovals;
      })
      .map((requirement) => requirement.code);

    return {
      readyToClose: missingEvidence.length === 0 && unsatisfiedRequirements.length === 0,
      missingEvidence,
      unsatisfiedRequirements,
      participantCount: collaborationCase.participants.length,
      approvalCount: collaborationCase.approvalRecords.length,
      verifiedEvidenceCount: collaborationCase.attachments.filter((item) => item.verified).length,
    };
  }

  snapshot() {
    return {
      templates: structuredClone(templates),
      cases: this.listCases(),
      delegations: [...this.delegations.values()].map((item) => structuredClone(item)),
    };
  }

  private computeCaseStatus(collaborationCase: CollaborationCase): CollaborationCaseStatus {
    if (collaborationCase.approvalRecords.some((record) => record.decision === "rejected")) return "rejected";
    if (collaborationCase.approvalRecords.some((record) => record.decision === "needs_changes")) {
      return "waiting_for_actor";
    }

    const blocking = collaborationCase.approvalRequirements.filter((item) => item.blocking);
    const allBlockingSatisfied = blocking.every((requirement) => {
      const approvedCount = collaborationCase.approvalRecords.filter(
        (record) => record.requirementCode === requirement.code && record.decision === "approved",
      ).length;
      return approvedCount >= requirement.minimumApprovals;
    });

    return allBlockingSatisfied ? "approved" : "under_review";
  }

  private getMissingRequiredEvidence(collaborationCase: CollaborationCase) {
    const template = templates.find((item) => item.type === collaborationCase.type);
    if (!template) return [];
    return template.requiredEvidenceTypes.filter(
      (requiredType) => !collaborationCase.attachments.some((attachment) => attachment.evidenceType === requiredType),
    );
  }

  private requireTemplate(code: string) {
    const template = templates.find((item) => item.code === code);
    if (!template) throw new Error(`Modèle de collaboration introuvable : ${code}.`);
    return template;
  }

  private requireCase(id: EntityId) {
    const collaborationCase = this.cases.get(id);
    if (!collaborationCase) throw new Error(`Dossier de collaboration introuvable : ${id}.`);
    return collaborationCase;
  }

  private requireParticipant(
    collaborationCase: CollaborationCase,
    actorId: EntityId,
    actorKind: MvpActorKind,
  ) {
    const participant = collaborationCase.participants.find(
      (item) => item.actorId === actorId && item.actorKind === actorKind,
    );
    if (!participant) throw new Error("L'acteur n'est pas participant à ce dossier.");
    return participant;
  }
}

export function getCollaborationCaseTemplates() {
  return structuredClone(templates);
}

export function validateCollaborationAndGovernanceCatalog() {
  const errors: string[] = [];

  for (const template of templates) {
    if (template.defaultParticipants.length < 2) {
      errors.push(`${template.code}: une collaboration doit impliquer au moins deux acteurs.`);
    }
    if (!template.defaultParticipants.some((item) => item.role === "owner")) {
      errors.push(`${template.code}: aucun propriétaire défini.`);
    }
    for (const requirement of template.approvalRequirements) {
      if (requirement.minimumApprovals < 1) {
        errors.push(`${template.code}/${requirement.code}: minimum d'approbations invalide.`);
      }
      if (requirement.requiredActorKinds.length === 0) {
        errors.push(`${template.code}/${requirement.code}: aucun type d'acteur valideur.`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    summary: {
      templateCount: templates.length,
      caseTypesCovered: [...new Set(templates.map((item) => item.type))],
      approvalRequirementCount: templates.reduce(
        (sum, template) => sum + template.approvalRequirements.length,
        0,
      ),
    },
  };
}
