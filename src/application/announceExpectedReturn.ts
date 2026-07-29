import type { ExpectedReturn } from "../domain/types";
import {
  DomainService,
  type CreateExpectedReturnInput,
} from "../domain/services";

export interface AnnounceExpectedReturnResult {
  expectedReturn: ExpectedReturn;
}

export function announceExpectedReturn(
  service: DomainService,
  input: CreateExpectedReturnInput,
): AnnounceExpectedReturnResult {
  return {
    expectedReturn: service.announceExpectedReturn(input),
  };
}
