export type OperationalContractStatus = "draft" | "under_review" | "active" | "at_risk" | "suspended" | "expired" | "closed";
export type ObligationStatus = "planned" | "due" | "in_progress" | "fulfilled" | "partially_fulfilled" | "breached" | "waived" | "cancelled";

export interface OperationalContract {
  id: string;
  code: string;
  title: string;
  contractType: "commercial" | "public_service" | "framework" | "subscription" | "service_provider" | "cooperative" | "financing" | "insurance" | "data_service";
  territoryIds: string[];
  partyOrganizationIds: string[];
  signatoryActorIds: string[];
  signedContractDocumentIds: string[];
  effectiveAt?: string;
  expiresAt?: string;
  status: OperationalContractStatus;
  institutionalConstraint?: {
    constraintType: "legal_obligation" | "partner_requirement" | "mandatory_insurance" | "public_program_condition";
    institutionName: string;
    reference: string;
    supportingDocumentIds: string[];
  };
}

export interface OperationalObligation {
  id: string;
  contractId: string;
  responsibleOrganizationId: string;
  responsibleActorId: string;
  beneficiaryOrganizationId?: string;
  obligationType: "deliver_service" | "provide_capacity" | "pay" | "report" | "maintain_compliance" | "share_data" | "support_beneficiaries" | "maintain_availability" | "respond_to_incident" | "other";
  description: string;
  territoryIds: string[];
  dueAt?: string;
  targetValue?: number;
  unit?: string;
  warningThreshold?: number;
  breachThreshold?: number;
  evaluationMode?: "minimum" | "maximum" | "exact";
  status: ObligationStatus;
  sourceDocumentIds: string[];
}

export interface ObligationExecutionRecord {
  id: string;
  obligationId: string;
  recordedByActorId: string;
  measuredValue?: number;
  periodStart?: string;
  periodEnd?: string;
  completionDocumentIds: string[];
  comment: string;
  recordedAt: string;
  outcome: "fulfilled" | "partially_fulfilled" | "warning" | "breached";
}

export interface CorrectiveActionPlan {
  id: string;
  contractId: string;
  obligationId: string;
  ownerActorId: string;
  actions: string[];
  dueAt: string;
  planDocumentIds: string[];
  status: "planned" | "in_progress" | "completed" | "overdue";
}

export interface ContractGovernanceDecision {
  id: string;
  contractId: string;
  decisionType: "activate" | "suspend" | "restore" | "waive_obligation" | "close" | "renew";
  decidedByActorId: string;
  reason: string;
  decisionDocumentIds: string[];
  decidedAt: string;
  newExpiresAt?: string;
  obligationId?: string;
}

export type OperationalContractCommand =
  | { type: "register_contract"; contract: OperationalContract }
  | { type: "add_obligation"; obligation: OperationalObligation }
  | { type: "record_execution"; record: ObligationExecutionRecord }
  | { type: "register_corrective_plan"; plan: CorrectiveActionPlan }
  | { type: "update_corrective_plan"; planId: string; status: CorrectiveActionPlan["status"] }
  | { type: "record_governance_decision"; decision: ContractGovernanceDecision };

export interface OperationalContractSnapshot {
  contracts: OperationalContract[];
  obligations: OperationalObligation[];
  executionRecords: ObligationExecutionRecord[];
  correctivePlans: CorrectiveActionPlan[];
  governanceDecisions: ContractGovernanceDecision[];
  metrics: {
    activeContractCount: number;
    atRiskContractCount: number;
    dueObligationCount: number;
    breachedObligationCount: number;
    fulfillmentPercent: number;
    correctivePlanOpenCount: number;
    institutionalConstraintCount: number;
  };
}

export interface OperationalContractExecutionResult {
  result: unknown;
  snapshot: OperationalContractSnapshot;
}

export class OperationalContractRuntime {
  private readonly contracts: OperationalContract[] = [];
  private readonly obligations: OperationalObligation[] = [];
  private readonly executionRecords: ObligationExecutionRecord[] = [];
  private readonly correctivePlans: CorrectiveActionPlan[] = [];
  private readonly decisions: ContractGovernanceDecision[] = [];
  private readonly processed = new Map<string, OperationalContractExecutionResult>();

  execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: OperationalContractCommand }): OperationalContractExecutionResult {
    const previous = this.processed.get(input.commandId);
    if (previous) return structuredClone(previous);
    let result: unknown;
    const command = input.command;

    switch (command.type) {
      case "register_contract": {
        const contract = command.contract;
        this.ensureUnique(contract.id, this.contracts, "contrat");
        if (!contract.code.trim() || !contract.title.trim()) throw new Error("Le code et le titre du contrat sont obligatoires.");
        if (!contract.territoryIds.length || !contract.partyOrganizationIds.length) throw new Error("Le territoire et les organisations parties sont obligatoires.");
        if (!contract.signatoryActorIds.length || !contract.signedContractDocumentIds.length) throw new Error("Les signataires et le contrat signé sont obligatoires.");
        if (contract.institutionalConstraint) {
          if (!contract.institutionalConstraint.institutionName.trim() || !contract.institutionalConstraint.reference.trim() || !contract.institutionalConstraint.supportingDocumentIds.length) {
            throw new Error("La contrainte institutionnelle doit préciser l'institution, la référence et le document justificatif.");
          }
        }
        this.assertTerritory(contract.territoryIds, input.activeTerritoryId);
        this.contracts.push(structuredClone(contract));
        result = contract;
        break;
      }
      case "add_obligation": {
        const obligation = command.obligation;
        this.ensureUnique(obligation.id, this.obligations, "obligation");
        const contract = this.requireContract(obligation.contractId);
        if (!["draft", "under_review", "active"].includes(contract.status)) throw new Error("Ce contrat ne permet plus l'ajout d'obligations.");
        if (!obligation.description.trim() || !obligation.sourceDocumentIds.length) throw new Error("L'obligation doit être décrite et reliée à une clause ou une annexe contractuelle.");
        if (!contract.partyOrganizationIds.includes(obligation.responsibleOrganizationId)) throw new Error("L'organisation responsable n'est pas partie au contrat.");
        if (obligation.targetValue !== undefined && (!obligation.unit || !obligation.evaluationMode)) throw new Error("Une obligation mesurable doit préciser son unité et son mode d'évaluation.");
        this.obligations.push(structuredClone(obligation));
        result = obligation;
        break;
      }
      case "record_execution": {
        const record = command.record;
        this.ensureUnique(record.id, this.executionRecords, "compte rendu d'exécution");
        const obligation = this.requireObligation(record.obligationId);
        const contract = this.requireContract(obligation.contractId);
        if (contract.status !== "active" && contract.status !== "at_risk") throw new Error("Le contrat doit être actif pour enregistrer une exécution.");
        if (!record.comment.trim() || !record.completionDocumentIds.length) throw new Error("Un commentaire et un document d'exécution sont obligatoires.");
        record.outcome = this.evaluateOutcome(obligation, record);
        obligation.status = record.outcome === "warning" ? "in_progress" : record.outcome;
        if (record.outcome === "breached") contract.status = "at_risk";
        this.executionRecords.push(structuredClone(record));
        result = record;
        break;
      }
      case "register_corrective_plan": {
        const plan = command.plan;
        this.ensureUnique(plan.id, this.correctivePlans, "plan correctif");
        const obligation = this.requireObligation(plan.obligationId);
        if (obligation.contractId !== plan.contractId) throw new Error("Le plan correctif ne correspond pas au contrat de l'obligation.");
        if (!plan.actions.length || !plan.planDocumentIds.length) throw new Error("Le plan correctif doit préciser les actions et le compte rendu validé.");
        this.correctivePlans.push(structuredClone(plan));
        result = plan;
        break;
      }
      case "update_corrective_plan": {
        const plan = this.requirePlan(command.planId);
        plan.status = command.status;
        result = plan;
        break;
      }
      case "record_governance_decision": {
        const decision = command.decision;
        this.ensureUnique(decision.id, this.decisions, "décision contractuelle");
        const contract = this.requireContract(decision.contractId);
        if (!decision.reason.trim() || !decision.decisionDocumentIds.length) throw new Error("La décision doit être motivée et accompagnée d'un document signé.");
        if (decision.decisionType === "activate") {
          if (!contract.effectiveAt || !contract.expiresAt || contract.expiresAt <= contract.effectiveAt) throw new Error("Les dates d'effet et d'échéance doivent être valides avant activation.");
          if (!this.obligations.some((item) => item.contractId === contract.id)) throw new Error("Le contrat doit contenir au moins une obligation avant activation.");
          contract.status = "active";
        } else if (decision.decisionType === "suspend") contract.status = "suspended";
        else if (decision.decisionType === "restore") contract.status = "active";
        else if (decision.decisionType === "close") contract.status = "closed";
        else if (decision.decisionType === "renew") {
          if (!decision.newExpiresAt || (contract.expiresAt && decision.newExpiresAt <= contract.expiresAt)) throw new Error("La nouvelle échéance doit prolonger le contrat.");
          contract.expiresAt = decision.newExpiresAt;
          contract.status = "active";
        } else {
          if (!decision.obligationId) throw new Error("La dérogation doit identifier l'obligation concernée.");
          const obligation = this.requireObligation(decision.obligationId);
          if (obligation.contractId !== contract.id) throw new Error("L'obligation n'appartient pas à ce contrat.");
          obligation.status = "waived";
        }
        this.decisions.push(structuredClone(decision));
        result = decision;
        break;
      }
    }

    const response: OperationalContractExecutionResult = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processed.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot(at = new Date().toISOString()): OperationalContractSnapshot {
    for (const contract of this.contracts) {
      if (contract.expiresAt && contract.expiresAt < at && !["closed", "suspended"].includes(contract.status)) contract.status = "expired";
    }
    for (const obligation of this.obligations) {
      if (obligation.dueAt && obligation.dueAt < at && ["planned", "in_progress"].includes(obligation.status)) obligation.status = "due";
    }
    const activeContractIds = new Set(this.contracts.filter((item) => item.status === "active" || item.status === "at_risk").map((item) => item.id));
    const activeObligations = this.obligations.filter((item) => activeContractIds.has(item.contractId));
    return structuredClone({
      contracts: this.contracts,
      obligations: this.obligations,
      executionRecords: this.executionRecords,
      correctivePlans: this.correctivePlans,
      governanceDecisions: this.decisions,
      metrics: {
        activeContractCount: this.contracts.filter((item) => item.status === "active").length,
        atRiskContractCount: this.contracts.filter((item) => item.status === "at_risk").length,
        dueObligationCount: this.obligations.filter((item) => item.status === "due").length,
        breachedObligationCount: this.obligations.filter((item) => item.status === "breached").length,
        fulfillmentPercent: activeObligations.length === 0 ? 0 : Math.round(activeObligations.filter((item) => item.status === "fulfilled").length / activeObligations.length * 100),
        correctivePlanOpenCount: this.correctivePlans.filter((item) => item.status === "planned" || item.status === "in_progress").length,
        institutionalConstraintCount: this.contracts.filter((item) => item.institutionalConstraint).length,
      },
    });
  }

  private evaluateOutcome(obligation: OperationalObligation, record: ObligationExecutionRecord): ObligationExecutionRecord["outcome"] {
    if (obligation.targetValue === undefined || record.measuredValue === undefined || !obligation.evaluationMode) return record.outcome;
    const value = record.measuredValue;
    if (obligation.evaluationMode === "minimum") {
      if (value >= obligation.targetValue) return "fulfilled";
      if (obligation.breachThreshold !== undefined && value < obligation.breachThreshold) return "breached";
      return "warning";
    }
    if (obligation.evaluationMode === "maximum") {
      if (value <= obligation.targetValue) return "fulfilled";
      if (obligation.breachThreshold !== undefined && value > obligation.breachThreshold) return "breached";
      return "warning";
    }
    return value === obligation.targetValue ? "fulfilled" : "breached";
  }

  private assertTerritory(territoryIds: string[], activeTerritoryId: string) { if (activeTerritoryId !== "territory-national" && !territoryIds.every((item) => item === activeTerritoryId)) throw new Error("Le territoire actif ne couvre pas ce contrat."); }
  private ensureUnique<T extends { id: string }>(id: string, items: T[], label: string) { if (items.some((item) => item.id === id)) throw new Error(`${label} déjà existant : ${id}.`); }
  private requireContract(id: string) { const value = this.contracts.find((item) => item.id === id); if (!value) throw new Error(`Contrat introuvable : ${id}.`); return value; }
  private requireObligation(id: string) { const value = this.obligations.find((item) => item.id === id); if (!value) throw new Error(`Obligation introuvable : ${id}.`); return value; }
  private requirePlan(id: string) { const value = this.correctivePlans.find((item) => item.id === id); if (!value) throw new Error(`Plan correctif introuvable : ${id}.`); return value; }
}

const globalRuntime = globalThis as typeof globalThis & { __mbOperationalContractRuntime?: OperationalContractRuntime };
export function getOperationalContractRuntime() {
  globalRuntime.__mbOperationalContractRuntime ??= new OperationalContractRuntime();
  return globalRuntime.__mbOperationalContractRuntime;
}
