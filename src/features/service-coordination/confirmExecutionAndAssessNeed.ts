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
import