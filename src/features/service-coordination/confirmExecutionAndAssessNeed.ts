import {
  confirmServiceExecution,
  type ConfirmServiceExecutionResult,
} from "../../application/confirmServiceExecution";
import {
  getServiceNeedCoverage,
  getServiceNeedsAtRisk,
} from "../../domain/selectors";
import type {
  ConfirmServiceExecutionInput,
  DomainService,
} from "../../domain/services";
import type { ServiceNeed } from "../../domain/types";

export interface ConfirmExecutionAndAssessNeedInput {
  execution: ConfirmServiceExecutionInput;
  referenceDate: string;
}

export interface ConfirmExecutionAndAssessNeedResult
  extends ConfirmServiceExecutionResult {
  serviceNeedId: string;
  coverage: NonNullable<ReturnType<typeof getServiceNeedCoverage>>;
  needAtRisk: boolean;
  needsAtRisk: ServiceNeed[];
}

export function confirmExecutionAndAssessNeed(
  service: DomainService,
  input: ConfirmExecutionAndAssessNeedInput,
): ConfirmExecutionAndAssessNeedResult {
  const result = confirmServiceExecution(service, input.execution);
  const snapshot = service.getSnapshot();
  const allocation = snapshot.serviceAllocations.find(
    (item) => item.id === input.execution.allocationId,
  );
  if (!allocation) {
    throw new Error(`L'allocation ${input.execution.allocationId} est introuvable après confirmation.`);
  }

  const coverage = getServiceNeedCoverage(snapshot, allocation.serviceNeedId);
  if (!coverage) {
    throw new Error(`Le besoin ${allocation.serviceNeedId} est introuvable après confirmation.`);
  }

  const needsAtRisk = getServiceNeedsAtRisk(snapshot, input.referenceDate);
  return {
    ...result,
    serviceNeedId: allocation.serviceNeedId,
    coverage,
    needAtRisk: needsAtRisk.some((need) => need.id === allocation.serviceNeedId),
    needsAtRisk,
  };
}
