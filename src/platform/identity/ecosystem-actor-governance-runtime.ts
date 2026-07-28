export type ActorGovernanceStatus =
  | "submitted"
  | "under_review"
  | "active"
  | "restricted"
  | "suspended"
  | "expired"
  | "rejected";

export interface EcosystemActorApplication {
  id: string;
  actorKind: "fisher" | "cooperative_manager" | "landing_operator" | "quality_agent" | "logistics_operator" | "buyer" | "processor" | "finance_partner" | "public_agent" | "research_partner" | "service_provider";
  personOrOrganizationName: string;
  legalName?: string;
  organizationId?: string;
  territoryIds: string[];
  requestedRoleCodes: string[];
  submittedByActorId: string;
  identityDocumentIds: string[];
  organizationDocumentIds: string[];
  mandateDocumentIds: string[];
  contactReference: string;
  submittedAt: string;
  status: ActorGovernanceStatus;
}

export interface ActorGovernanceReview {
  id: string;
  applicationId: string;
  reviewedByActorId: string;
  identityChecked: boolean;
  organizationChecked: boolean;
  mandateChecked: boolean;
  fieldConfirmationRequired: boolean;
  fieldConfirmationDocumentIds: string[];
  decision: "approve" | "request_changes" | "reject";
  decisionReason: string;
  approvedRoleCodes: string[];
  approvedTerritoryIds: string[];
  validUntil?: string;
  reviewDocumentIds: string[];
  reviewedAt: string;
}

export interface ActiveActorMandate {
  id: string;
  applicationId: string;
  actorId: string;
  organizationId?: string;
  roleCodes: string[];
  territoryIds: string[];
  activatedByActorId: string;
  validFrom: string;
  validUntil?: string;
  maximumAmountXof?: number;
  maximumQuantityKg?: number;
  restrictions: string[];
  activationDocumentIds: string[];
  status: "active" | "restricted" | "suspended" | "expired" | "revoked";
}

export interface ActorGovernanceAction {
  id: string;
  mandateId: string;
  actionType: "restrict" | "suspend" | "restore" | "renew" | "revoke";
  decidedByActorId: string;
  reason: string;
  effectiveAt: string;
  newValidUntil?: string;
  restrictionNotes?: string[];
  decisionDocumentIds: string[];
}

export type ActorGovernanceCommand =
  | { type: "submit_application"; application: EcosystemActorApplication }
  | { type: "start_review"; applicationId: string }
  | { type: "record_review"; review: ActorGovernanceReview }
  | { type: "activate_mandate"; mandate: ActiveActorMandate }
  | { type: "record_governance_action"; action: ActorGovernanceAction };

export class EcosystemActorGovernanceRuntime {
  private readonly applications: EcosystemActorApplication[] = [];
  private readonly reviews: ActorGovernanceReview[] = [];
  private readonly mandates: ActiveActorMandate[] = [];
  private readonly actions: ActorGovernanceAction[] = [];
  private readonly processed = new Map<string, unknown>();

  execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: ActorGovernanceCommand }) {
    const previous = this.processed.get(input.commandId);
    if (previous) return structuredClone(previous);
    const command = input.command;
    let result: unknown;

    switch (command.type) {
      case "submit_application": {
        const application = command.application;
        this.ensureUnique(application.id, this.applications, "demande d'entrée");
        if (!application.personOrOrganizationName.trim() || !application.contactReference.trim()) throw new Error("Le nom et le contact de l'acteur sont obligatoires.");
        if (!application.territoryIds.length || !application.requestedRoleCodes.length) throw new Error("Le territoire et le rôle demandé sont obligatoires.");
        if (!application.identityDocumentIds.length) throw new Error("Un document d'identité ou d'immatriculation est obligatoire.");
        if (application.organizationId && !application.organizationDocumentIds.length) throw new Error("Le rattachement à une organisation doit être confirmé par un document d'organisation.");
        if (["cooperative_manager", "public_agent", "quality_agent", "finance_partner"].includes(application.actorKind) && !application.mandateDocumentIds.length) {
          throw new Error("Une lettre de mission, une décision de nomination ou un mandat signé est obligatoire pour ce rôle.");
        }
        this.assertTerritoryAccess(application.territoryIds, input.activeTerritoryId);
        this.applications.push(structuredClone(application));
        result = application;
        break;
      }
      case "start_review": {
        const application = this.requireApplication(command.applicationId);
        if (application.status !== "submitted") throw new Error("Seule une demande soumise peut entrer en revue.");
        application.status = "under_review";
        result = application;
        break;
      }
      case "record_review": {
        const review = command.review;
        this.ensureUnique(review.id, this.reviews, "revue d'acteur");
        const application = this.requireApplication(review.applicationId);
        if (application.status !== "under_review") throw new Error("La demande doit être en revue avant décision.");
        if (!review.decisionReason.trim() || !review.reviewDocumentIds.length) throw new Error("La décision doit comporter un motif et un compte rendu de revue.");
        if (review.fieldConfirmationRequired && !review.fieldConfirmationDocumentIds.length) throw new Error("La confirmation terrain demandée doit être enregistrée.");
        if (review.decision === "approve") {
          if (!review.identityChecked) throw new Error("L'identité doit être contrôlée avant approbation.");
          if (application.organizationId && !review.organizationChecked) throw new Error("L'organisation doit être contrôlée avant approbation.");
          if (application.mandateDocumentIds.length && !review.mandateChecked) throw new Error("Le mandat doit être contrôlé avant approbation.");
          if (!review.approvedRoleCodes.length || !review.approvedTerritoryIds.length) throw new Error("Les rôles et territoires approuvés doivent être précisés.");
          const excessiveRoles = review.approvedRoleCodes.filter((role) => !application.requestedRoleCodes.includes(role));
          if (excessiveRoles.length) throw new Error(`La revue ne peut pas accorder un rôle non demandé : ${excessiveRoles.join(", ")}.`);
        }
        application.status = review.decision === "approve" ? "under_review" : review.decision === "reject" ? "rejected" : "submitted";
        this.reviews.push(structuredClone(review));
        result = review;
        break;
      }
      case "activate_mandate": {
        const mandate = command.mandate;
        this.ensureUnique(mandate.id, this.mandates, "mandat actif");
        const application = this.requireApplication(mandate.applicationId);
        const review = this.reviews.find((item) => item.applicationId === application.id && item.decision === "approve");
        if (!review) throw new Error("Une revue favorable est obligatoire avant activation.");
        if (!mandate.activationDocumentIds.length) throw new Error("La décision d'activation ou le contrat de rattachement est obligatoire.");
        if (mandate.validUntil && mandate.validUntil <= mandate.validFrom) throw new Error("La période du mandat est invalide.");
        const unauthorizedRoles = mandate.roleCodes.filter((role) => !review.approvedRoleCodes.includes(role));
        const unauthorizedTerritories = mandate.territoryIds.filter((territory) => !review.approvedTerritoryIds.includes(territory));
        if (unauthorizedRoles.length || unauthorizedTerritories.length) throw new Error("Le mandat dépasse la revue approuvée.");
        if ((mandate.maximumAmountXof ?? 0) < 0 || (mandate.maximumQuantityKg ?? 0) < 0) throw new Error("Les limites du mandat ne peuvent pas être négatives.");
        this.mandates.push(structuredClone(mandate));
        application.status = "active";
        result = mandate;
        break;
      }
      case "record_governance_action": {
        const action = command.action;
        this.ensureUnique(action.id, this.actions, "décision de gouvernance");
        const mandate = this.requireMandate(action.mandateId);
        if (!action.reason.trim() || !action.decisionDocumentIds.length) throw new Error("Une décision motivée et son document signé sont obligatoires.");
        if (action.actionType === "renew") {
          if (!action.newValidUntil || action.newValidUntil <= action.effectiveAt) throw new Error("La nouvelle date de validité est obligatoire pour un renouvellement.");
          mandate.validUntil = action.newValidUntil;
          mandate.status = "active";
        } else if (action.actionType === "restrict") {
          if (!action.restrictionNotes?.length) throw new Error("Les restrictions appliquées doivent être décrites.");
          mandate.restrictions = [...new Set([...mandate.restrictions, ...action.restrictionNotes])];
          mandate.status = "restricted";
        } else if (action.actionType === "suspend") mandate.status = "suspended";
        else if (action.actionType === "restore") mandate.status = "active";
        else mandate.status = "revoked";
        const application = this.requireApplication(mandate.applicationId);
        application.status = mandate.status === "revoked" ? "rejected" : mandate.status;
        this.actions.push(structuredClone(action));
        result = mandate;
        break;
      }
      default:
        throw new Error("Action de gouvernance inconnue.");
    }

    const response = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processed.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot() {
    const now = new Date().toISOString();
    for (const mandate of this.mandates) {
      if (mandate.validUntil && mandate.validUntil < now && ["active", "restricted"].includes(mandate.status)) mandate.status = "expired";
    }
    return structuredClone({
      applications: this.applications,
      reviews: this.reviews,
      mandates: this.mandates,
      governanceActions: this.actions,
      metrics: {
        pendingApplicationCount: this.applications.filter((item) => ["submitted", "under_review"].includes(item.status)).length,
        activeMandateCount: this.mandates.filter((item) => item.status === "active").length,
        restrictedMandateCount: this.mandates.filter((item) => item.status === "restricted").length,
        suspendedMandateCount: this.mandates.filter((item) => item.status === "suspended").length,
        expiredMandateCount: this.mandates.filter((item) => item.status === "expired").length,
        actorOrganizationCoveragePercent: this.applications.length === 0 ? 0 : Math.round(this.applications.filter((item) => item.organizationId).length / this.applications.length * 100),
      },
    });
  }

  private assertTerritoryAccess(territoryIds: string[], activeTerritoryId: string) {
    if (activeTerritoryId !== "territory-national" && !territoryIds.every((id) => id === activeTerritoryId)) throw new Error("Le territoire actif ne permet pas de déposer cette demande.");
  }
  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) { if (values.some((item) => item.id === id)) throw new Error(`${label} déjà existant : ${id}.`); }
  private requireApplication(id: string) { const value = this.applications.find((item) => item.id === id); if (!value) throw new Error(`Demande d'entrée introuvable : ${id}.`); return value; }
  private requireMandate(id: string) { const value = this.mandates.find((item) => item.id === id); if (!value) throw new Error(`Mandat introuvable : ${id}.`); return value; }
}

const globalRuntime = globalThis as typeof globalThis & { __mbActorGovernanceRuntime?: EcosystemActorGovernanceRuntime };
export function getEcosystemActorGovernanceRuntime() {
  globalRuntime.__mbActorGovernanceRuntime ??= new EcosystemActorGovernanceRuntime();
  return globalRuntime.__mbActorGovernanceRuntime;
}
