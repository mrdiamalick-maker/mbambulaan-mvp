import {
  reportTension,
  type ReportTensionResult,
} from "../../application/reportTension";
import { getServiceNeedCoverage } from "../../domain/selectors";
import type {
  DomainService,
  ReportTensionInput,
} from "../../domain/services";

export interface ReportNeedTensionInput
  extends Omit<ReportTensionInput, "relatedEntityType" | "relatedEntityId"> {
  serviceNeedId: string;
}

export interface ReportNeedTensionResult {
  tension: ReportTensionResult["tension"];
  coverage: ReturnType<typeof getServiceNeedCoverage>;
}

export function reportNeedTension(
  service: DomainService,
  input: ReportNeedTensionInput,
): ReportNeedTensionResult {
  const coverage = getServiceNeedCoverage(
    service.getSnapshot(),
    input.serviceNeedId,
  );

  if (!coverage) {
    throw new Error(
      `Le besoin de service ${input.serviceNeedId} est introuvable.`,
    );
  }

  const tension = reportTension(service, {
    id: input.id,
    tensionType: input.tensionType,
    severity: input.severity,
    territoryId: input.territoryId,
    relatedEntityType: "service_need",
    relatedEntityId: input.serviceNeedId,
    description: input.description,
    reportedByActorId: input.reportedByActorId,
    reportedAt: input.reportedAt,
  }).tension;

  return {
    tension,
    coverage,
  };
}
