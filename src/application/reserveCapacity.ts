import type { ServiceAllocation } from "../domain/types";
import {
  DomainService,
  type ReserveCapacityInput,
} from "../domain/services";

export interface ReserveCapacityResult {
  allocation: ServiceAllocation;
}

export function reserveCapacity(
  service: DomainService,
  input: ReserveCapacityInput,
): ReserveCapacityResult {
  return {
    allocation: service.reserveCapacity(input),
  };
}
