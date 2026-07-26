import type { ServiceAllocation } from "../domain/types";
import {
  DomainService,
  type CancelServiceAllocationInput,
} from "../domain/services";

export interface CancelServiceAllocationResult {
  allocation: ServiceAllocation;
}

export function cancelServiceAllocation(
  service: DomainService,
  input: CancelServiceAllocationInput,
): CancelServiceAllocationResult {
  return {
    allocation: service.cancelServiceAllocation(input),
  };
}
