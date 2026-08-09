import type { ServiceNeed } from "../domain/types";
import {
  DomainService,
  type CreateServiceNeedInput,
} from "../domain/services";

export interface CreateServiceNeedResult {
  serviceNeed: ServiceNeed;
}

export function createServiceNeed(
  service: DomainService,
  input: CreateServiceNeedInput,
): CreateServiceNeedResult {
  return {
    serviceNeed: service.createServiceNeed(input),
  };
}
