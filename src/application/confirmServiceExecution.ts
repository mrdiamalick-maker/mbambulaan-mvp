import type { ServiceExecution } from "../domain/types";
import {
  DomainService,
  type ConfirmServiceExecutionInput,
} from "../domain/services";

export interface ConfirmServiceExecutionResult {
  execution: ServiceExecution;
}

export function confirmServiceExecution(
  service: DomainService,
  input: ConfirmServiceExecutionInput,
): ConfirmServiceExecutionResult {
  return {
    execution: service.confirmServiceExecution(input),
  };
}
