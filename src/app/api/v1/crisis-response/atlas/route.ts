import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { getEcosystemCrisisResponseRuntime } from "@/platform/crisis/ecosystem-crisis-response-runtime";
import { getPersistentCrisisResponseRuntime } from "@/platform/crisis/persistent-crisis-response-runtime";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "atlas.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const snapshot = hasRuntimeDatabase()
    ? await getPersistentCrisisResponseRuntime().snapshot()
    : getEcosystemCrisisResponseRuntime().snapshot();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    persistence: hasRuntimeDatabase() ? "postgres" : "memory",
    headline: snapshot.metrics.activeCrisisCount > 0
      ? `${snapshot.metrics.activeCrisisCount} situation grave nécessite encore une coordination active.`
      : "Aucune situation grave active.",
    exposure: {
      affectedActors: snapshot.metrics.affectedActorCount,
      exposedVolumeKg: snapshot.metrics.exposedVolumeKg,
      exposedValueXof: snapshot.metrics.exposedValueXof,
    },
    response: {
      priorityNeedCoveragePercent: snapshot.metrics.priorityNeedCoveragePercent,
      fulfilledCommitments: snapshot.metrics.fulfilledCommitmentCount,
      blockedCommitments: snapshot.metrics.blockedCommitmentCount,
      averageResponseTimeHours: snapshot.metrics.averageResponseTimeHours,
    },
    protectedValue: {
      actorsProtected: snapshot.metrics.actorsProtectedCount,
      volumeSavedKg: snapshot.metrics.volumeSavedKg,
      valueProtectedXof: snapshot.metrics.valueProtectedXof,
      jobsProtected: snapshot.metrics.jobsProtectedCount,
    },
    crises: snapshot.crises.map((crisis) => ({
      id: crisis.id,
      title: crisis.title,
      type: crisis.type,
      severity: crisis.severity,
      status: crisis.status,
      territoryIds: crisis.territoryIds,
    })),
    urgentNeeds: snapshot.priorityNeeds.filter((need) => need.status !== "covered").map((need) => ({
      id: need.id,
      territoryId: need.territoryId,
      needType: need.needType,
      missingQuantity: Math.max(0, need.requiredQuantity - need.availableQuantity - need.mobilizedQuantity),
      unit: need.unit,
      latestRequiredAt: need.latestRequiredAt,
    })),
    blockedCommitments: snapshot.commitments.filter((item) => item.status === "blocked").map((item) => ({
      id: item.id,
      action: item.actionDescription,
      ownerActorId: item.ownerActorId,
      territoryIds: item.territoryIds,
      dueAt: item.dueAt,
      progressNote: item.progressNote,
    })),
  });
}
