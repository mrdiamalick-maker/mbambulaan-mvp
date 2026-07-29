import type { Capacity } from "../domain/types";
import {
  DomainService,
  type DeclareCapacityInput,
} from "../domain/services";

export interface DeclareCapacityResult {
  capacity: Capacity;
}

export function declareCapacity(
  service: DomainService,
  input: DeclareCapacityInput,
): DeclareCapacityResult {
  return {
    capacity: service.declareCapacity(input),
  };
}
