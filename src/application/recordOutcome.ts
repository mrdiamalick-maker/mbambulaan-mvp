import type { Outcome } from "../domain/types";
import {
  DomainService,
  type RecordOutcomeInput,
} from "../domain/services";

export interface RecordOutcomeResult {
  outcome: Outcome;
}

export function recordOutcome(
  service: DomainService,
  input: RecordOutcomeInput,
): RecordOutcomeResult {
  return {
    outcome: service.recordOutcome(input),
  };
}
