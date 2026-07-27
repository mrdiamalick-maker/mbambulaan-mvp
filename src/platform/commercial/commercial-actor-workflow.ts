import type { CommercialExecutionSnapshot } from "./commercial-financial-execution";
import { getCommercialFinancialExecution } from "./commercial-financial-registry";

export type CommercialActorKind = "seller" | "buyer" | "logistics" | "finance";

export type CommercialWorkflowCommand =
  | { type: "publish_offer"; offerId?: string; sellerOrganizationId: string; territoryId: string; speciesCode: string; qualityGrade: string; available