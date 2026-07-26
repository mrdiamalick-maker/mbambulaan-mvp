import {
  reserveCapacity,
  type ReserveCapacityResult,
} from "../../application/reserveCapacity";
import { getCompatibleCapacitiesForNeed } from "../../domain/selectors";
import type {
  DomainService,
  ReserveCapacityInput,
} from "../../domain/services";
import type { Capacity } from "../../domain/types";

export interface ReserveCompatibleCapacityInput
  extends ReserveCapacityInput {}

export interface ReserveCompatibleCapacityResult {
  allocation: ReserveCapacityResult["allocation"];
  compatibleCapacities: Capacity[];
}

export function reserveCompatibleCapacity(
  service: DomainService,
  input: ReserveCompatibleCapacityInput,
): ReserveCompatibleCapacityResult {
  const compatibleCapacities = getCompatibleCapacitiesForNeed(
    service.getSnapshot(),
    input.serviceNeedId,
  );

  const selectedCapacityIsCompatible = compatibleCapacities.some(
    (capacity) => capacity.id === input.capacityId,
  );

  if (!selectedCapacityIsCompatible) {
    throw new Error(
      `La capacité ${input.capacityId} n'est pas compatible avec le besoin ${input.serviceNeedId}.`,
    );
  }

  const allocation = reserveCapacity(service, input).allocation;

  return {
    allocation,
    compatibleCapacities,
  };
}
