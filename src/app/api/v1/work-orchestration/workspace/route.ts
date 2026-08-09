import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { ActorDailyWorkspace } from "@/platform/coordination/actor-daily-workspace";
import { getPersistentUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/persistent-unified-work-orchestration-runtime";
import { getUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/unified-work-orchestration-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const at = new URL(request.url).searchParams.get("at") ?? new Date().toISOString();
  const snapshot = hasRuntimeDatabase()
    ? await getPersistentUnifiedWorkOrchestrationRuntime().snapshot(at)
    : getUnifiedWorkOrchestrationRuntime().snapshot(at);
  const workspace = new ActorDailyWorkspace().project({
    actorId: authorization.identity.id,
    organizationId: authorization.session.activeOrganizationId,
    territoryId: authorization.session.activeTerritoryId,
    workItems: snapshot.workItems,
    notifications: snapshot.notifications,
    at,
  });
  return NextResponse.json({ ...workspace, persistence: hasRuntimeDatabase() ? "postgres" : "memory" });
}
