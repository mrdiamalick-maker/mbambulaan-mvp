import {
  announceExpectedReturn,
  type AnnounceExpectedReturnResult,
} from "../../application/announceExpectedReturn";
import {
  createServiceNeed,
  type CreateServiceNeedResult,
} from "../../application/createServiceNeed";
import type {
  AnnounceExpectedReturnInput,
  CreateServiceNeedInput,
  DomainService,
} from "../../domain/services";

export interface CreateExpectedReturnAndNeedsInput {
  expectedReturn: AnnounceExpectedReturnInput;
  serviceNeeds: Omit<CreateServiceNeedInput, "expectedReturnId">[];
}

export interface CreateExpectedReturnAndNeedsResult {
  expectedReturn: AnnounceExpectedReturnResult["expectedReturn"];
  serviceNeeds: CreateServiceNeedResult["serviceNeed"][];
}

export function createExpectedReturnAndNeeds(
  service: DomainService,
  input: CreateExpectedReturnAndNeedsInput,
): CreateExpectedReturnAndNeedsResult {
  const expectedReturn = announceExpectedReturn(
    service,
    input.expectedReturn,
  ).expectedReturn;

  const serviceNeeds = input.serviceNeeds.map((serviceNeed) =>
    createServiceNeed(service, {
      ...serviceNeed,
      expectedReturnId: expectedReturn.id,
    }).serviceNeed,
  );

  return {
    expectedReturn,
    serviceNeeds,
  };
}
