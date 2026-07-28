import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getUnifiedWorkOrchestrationRuntime, type UnifiedWorkCommand } from "@/platform/coordination/unified-work-orchestration-runtime";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const url = new URL(request.url);
  return NextResponse.json(getUnifiedWorkOrchestrationRuntime().snapshot(url.searchParams.get("at") ?? undefined));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: UnifiedWorkCommand; planAt?: string } | undefined;
  if (!body?.commandId || !body.command?.type) return NextResponse.json({ error: { code: "INVALID_WORK_COMMAND", message: "La commande et son identifiant sont obligatoires." } }, { status: 400 });
  const permission = body.command.type === "mark_notification_sent" ? "admin.manage" : "government.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    const runtime = getUnifiedWorkOrchestrationRuntime();
    const result = runtime.execute({ commandId: body.commandId, command: body.command });
    const planned = body.planAt ? runtime.planNotifications(body.planAt) : undefined;
    return NextResponse.json({ ...result, planned }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "WORK_COMMAND_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
