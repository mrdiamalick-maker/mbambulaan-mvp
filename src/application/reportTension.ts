import type { Tension } from "../domain/types";
import {
  DomainService,
  type ReportTensionInput,
} from "../domain/services";

export interface ReportTensionResult {
  tension: Tension;
}

export function reportTension(
  service: DomainService,
  input: ReportTensionInput,
): ReportTensionResult {
  return {
    tension: service.reportTension(input),
  };
}
