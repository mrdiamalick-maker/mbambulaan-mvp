import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getPersistentUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/persistent-unified-work-orchestration-runtime";
import { getUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/unified-work-orchestration-runtime";
import { UnifiedWorkSourceProjector, type WorkSourceRecord } from "@/platform/coordination/unified-work-source-projector";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as {
    sourceRecord?: WorkSourceRecord;
    escalationPolicyId?: string;
    channels?: Array<"in_app" | "email" | "sms" | "whatsapp">;
    createdAt?: string;
  } | undefined;
  if (!body?.sourceRecord) return NextResponse.json({ error: { code: "WORK_SOURCE_REQUIRED", message: "La tâche source est obligatoire." } }, { status: 400 });
  try {
    const workItem = new UnifiedWorkSourceProjector().project(body.sourceRecord, {
      escalationPolicyId: body.escalationPolicyId,
      channels: body.channels,
      createdAt: body.createdAt,
    });
    const commandId = `project-${workItem.id}`;
    const persistent = hasRuntimeDatabase();
    const result = persistent
      ? await getPersistentUnifiedWorkOrchestrationRuntime().execute({
          commandId,
          actorId: authorization.identity.id,
          activeTerritoryId: authorization.session.activeTerritoryId,
          command: { type: "register_work", workItem },
        })
      : getUnifiedWorkOrchestrationRuntime().execute({ commandId, command: { type: "register_work", workItem } });
    return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "WORK_PROJECTION_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
