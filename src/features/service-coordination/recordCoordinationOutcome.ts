import {
  recordOutcome,
  type RecordOutcomeResult,
} from "../../application/recordOutcome";
import { getOutcomesByRelatedEntity } from "../../domain/selectors";
import type {
  DomainService,
  RecordOutcomeInput,
} from "../../domain/services";

export interface RecordCoordinationOutcomeInput
  extends RecordOutcomeInput {}

export interface RecordCoordinationOutcomeResult {
  outcome: RecordOutcomeResult["outcome"];
  outcomes: ReturnType<typeof getOutcomesByRelatedEntity>;
}

export function recordCoordinationOutcome(
  service: DomainService,
  input: RecordCoordinationOutcomeInput,
): RecordCoordinationOutcomeResult {
  const outcome = recordOutcome(service, input).outcome;
  const outcomes = getOutcomesByRelatedEntity(
    service.getSnapshot(),
    input.relatedEntityType,
    input.relatedEntityId,
  );

  return {
    outcome,
    outcomes,
  };
}
