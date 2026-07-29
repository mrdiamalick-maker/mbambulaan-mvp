import {
  buildTerritoryCoordinationPlan,
  type TerritoryCoordinationPlan,
} from "../../domain/territoryCoordinationPlan";
import type { DomainService } from "../../domain/services";
import type { EntityId, ISODateTime } from "../../domain/types";

export interface GetTerritoryCoordinationPlanInput {
  territoryId: EntityId;
  generatedAt: ISODateTime;
}

export interface GetTerritoryCoordinationPlanResult {
  plan: TerritoryCoordinationPlan;
}

export function getTerritoryCoordinationPlan(
  service: DomainService,
  input: GetTerritoryCoordinationPlanInput,
): GetTerritoryCoordinationPlanResult {
  return {
    plan: buildTerritoryCoordinationPlan(
      service.getSnapshot(),
      input.territoryId,
      input.generatedAt,
    ),
  };
}
