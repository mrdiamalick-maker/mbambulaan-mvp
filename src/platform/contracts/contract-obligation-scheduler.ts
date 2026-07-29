import type { OperationalContract, OperationalObligation } from "./operational-contract-runtime";

export type RecurrenceCode = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export interface RecurringObligationTemplate {
  id: string;
  contractId: string;
  responsibleOrganizationId: string;
  responsibleActorId: string;
  beneficiaryOrganizationId?: string;
  obligationType: OperationalObligation["obligationType"];
  description: string;
  territoryIds: string[];
  recurrenceCode: RecurrenceCode;
  firstDueAt: string;
  targetValue?: number;
  unit?: string;
  warningThreshold?: number;
  breachThreshold?: number;
  evaluationMode?: OperationalObligation["evaluationMode"];
  sourceDocumentIds: string[];
  active: boolean;
}

export interface ContractAlert {
  id: string;
  contractId: string;
  obligationId?: string;
  alertType: "contract_expiring" | "obligation_due_soon" | "obligation_overdue" | "corrective_plan_overdue";
  severity: "info" | "warning" | "critical";
  dueAt: string;
  message: string;
}

export interface TemporaryObligationWaiver {
  id: string;
  contractId: string;
  obligationId: string;
  validFrom: string;
  validUntil: string;
  reason: string;
  decisionDocumentIds: string[];
  decidedByActorId: string;
}

const recurrenceMonths: Record<Exclude<RecurrenceCode, "daily" | "weekly">, number> = {
  monthly: 1,
  quarterly: 3,
  annual: 12,
};

export class ContractObligationScheduler {
  generateOccurrences(input: {
    template: RecurringObligationTemplate;
    until: string;
    existingObligationIds: string[];
  }): OperationalObligation[] {
    if (!input.template.active) return [];
    if (!input.template.sourceDocumentIds.length) throw new Error("La clause ou l'annexe contractuelle de récurrence est obligatoire.");
    const occurrences: OperationalObligation[] = [];
    let dueAt = new Date(input.template.firstDueAt);
    const limit = new Date(input.until);
    let index = 1;
    while (dueAt <= limit) {
      const id = `${input.template.id}-${dueAt.toISOString().slice(0, 10)}`;
      if (!input.existingObligationIds.includes(id)) {
        occurrences.push({
          id,
          contractId: input.template.contractId,
          responsibleOrganizationId: input.template.responsibleOrganizationId,
          responsibleActorId: input.template.responsibleActorId,
          beneficiaryOrganizationId: input.template.beneficiaryOrganizationId,
          obligationType: input.template.obligationType,
          description: `${input.template.description} — échéance ${index}`,
          territoryIds: [...input.template.territoryIds],
          dueAt: dueAt.toISOString(),
          targetValue: input.template.targetValue,
          unit: input.template.unit,
          warningThreshold: input.template.warningThreshold,
          breachThreshold: input.template.breachThreshold,
          evaluationMode: input.template.evaluationMode,
          status: "planned",
          sourceDocumentIds: [...input.template.sourceDocumentIds],
        });
      }
      dueAt = this.nextDate(dueAt, input.template.recurrenceCode);
      index += 1;
    }
    return occurrences;
  }

  alerts(input: {
    contracts: OperationalContract[];
    obligations: OperationalObligation[];
    correctivePlans: Array<{ id: string; contractId: string; obligationId: string; dueAt: string; status: string }>;
    at: string;
    warningDays?: number;
  }): ContractAlert[] {
    const warningMs = (input.warningDays ?? 30) * 86_400_000;
    const now = Date.parse(input.at);
    const alerts: ContractAlert[] = [];
    for (const contract of input.contracts) {
      if (!contract.expiresAt || ["closed", "expired"].includes(contract.status)) continue;
      const remaining = Date.parse(contract.expiresAt) - now;
      if (remaining >= 0 && remaining <= warningMs) alerts.push({ id: `contract-expiring-${contract.id}`, contractId: contract.id, alertType: "contract_expiring", severity: "warning", dueAt: contract.expiresAt, message: `Le contrat ${contract.code} arrive à échéance.` });
    }
    for (const obligation of input.obligations) {
      if (!obligation.dueAt || ["fulfilled", "waived", "cancelled"].includes(obligation.status)) continue;
      const remaining = Date.parse(obligation.dueAt) - now;
      if (remaining < 0) alerts.push({ id: `obligation-overdue-${obligation.id}`, contractId: obligation.contractId, obligationId: obligation.id, alertType: "obligation_overdue", severity: "critical", dueAt: obligation.dueAt, message: `L'obligation ${obligation.id} est en retard.` });
      else if (remaining <= warningMs) alerts.push({ id: `obligation-due-${obligation.id}`, contractId: obligation.contractId, obligationId: obligation.id, alertType: "obligation_due_soon", severity: "warning", dueAt: obligation.dueAt, message: `L'obligation ${obligation.id} doit être exécutée prochainement.` });
    }
    for (const plan of input.correctivePlans) {
      if (["completed"].includes(plan.status) || Date.parse(plan.dueAt) >= now) continue;
      alerts.push({ id: `plan-overdue-${plan.id}`, contractId: plan.contractId, obligationId: plan.obligationId, alertType: "corrective_plan_overdue", severity: "critical", dueAt: plan.dueAt, message: `Le plan correctif ${plan.id} est en retard.` });
    }
    return alerts.sort((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt));
  }

  validateWaiver(input: { waiver: TemporaryObligationWaiver; contract: OperationalContract; obligation: OperationalObligation }) {
    const waiver = input.waiver;
    if (waiver.contractId !== input.contract.id || waiver.obligationId !== input.obligation.id) throw new Error("La dérogation ne correspond pas au contrat et à l'obligation.");
    if (waiver.validUntil <= waiver.validFrom) throw new Error("La période de dérogation est invalide.");
    if (!waiver.reason.trim() || !waiver.decisionDocumentIds.length) throw new Error("La dérogation doit être motivée et accompagnée d'une décision signée.");
    if (input.contract.expiresAt && waiver.validUntil > input.contract.expiresAt) throw new Error("La dérogation ne peut pas dépasser l'échéance du contrat.");
    return structuredClone(waiver);
  }

  private nextDate(value: Date, recurrence: RecurrenceCode) {
    const next = new Date(value);
    if (recurrence === "daily") next.setUTCDate(next.getUTCDate() + 1);
    else if (recurrence === "weekly") next.setUTCDate(next.getUTCDate() + 7);
    else next.setUTCMonth(next.getUTCMonth() + recurrenceMonths[recurrence]);
    return next;
  }
}
