import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getPersistentUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/persistent-unified-work-orchestration-runtime";
import { getUnifiedWorkOrchestrationRuntime, type UnifiedWorkCommand } from "@/platform/coordination/unified-work-orchestration-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { publishEcosystemBusinessEvent } from "@/platform/runtime/publish-ecosystem-business-event";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const url = new URL(request.url);
  const at = url.searchParams.get("at") ?? undefined;
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentUnifiedWorkOrchestrationRuntime().snapshot(at)
    : getUnifiedWorkOrchestrationRuntime().snapshot(at);
  const workItems = snapshot.workItems.filter((item) => {
    const territoryAllowed = authorization.session.activeTerritoryId === "territory-national" || item.territoryId === authorization.session.activeTerritoryId;
    const organizationAllowed = item.organizationId === authorization.session.activeOrganizationId || authorization.identity.permissions.includes("government.read");
    const actorAllowed = !item.actorId || item.actorId === authorization.identity.id || authorization.identity.permissions.includes("government.read");
    return territoryAllowed && organizationAllowed && actorAllowed;
  });
  const workItemIds = new Set(workItems.map((item) => item.id));
  return NextResponse.json({
    ...snapshot,
    workItems,
    notifications: snapshot.notifications.filter((item) => workItemIds.has(item.workItemId)),
    persistence: persistent ? "postgres" : "memory",
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: UnifiedWorkCommand; planAt?: string } | undefined;
  if (!body?.commandId || !body.command?.type) return NextResponse.json({ error: { code: "INVALID_WORK_COMMAND", message: "La commande et son identifiant sont obligatoires." } }, { status: 400 });
  const permission = body.command.type === "mark_notification_sent" ? "admin.manage" : "government.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    const persistent = hasRuntimeDatabase();
    const result = persistent
      ? await getPersistentUnifiedWorkOrchestrationRuntime().execute({
          commandId: body.commandId,
          actorId: authorization.identity.id,
          activeTerritoryId: authorization.session.activeTerritoryId,
          command: body.command,
        })
      : getUnifiedWorkOrchestrationRuntime().execute({ commandId: body.commandId, command: body.command });
    const planned = body.planAt
      ? persistent
        ? await getPersistentUnifiedWorkOrchestrationRuntime().planNotifications(body.planAt)
        : getUnifiedWorkOrchestrationRuntime().planNotifications(body.planAt)
      : undefined;

    let businessEvent: unknown;
    if (body.command.type === "complete_work") {
      const item = result.snapshot.workItems.find((entry) => entry.id === body.command.workItemId);
      if (item?.sourceCorrelationId) {
        businessEvent = await publishEcosystemBusinessEvent({
          id: `event-work-completed-${body.commandId}`,
          type: "coordination.work.completed",
          occurredAt: body.command.at,
          correlationId: item.sourceCorrelationId,
          causationId: body.commandId,
          actorId: authorization.identity.id,
          organizationId: item.organizationId,
          territoryIds: [item.territoryId],
          entityType: "work_item",
          entityId: item.id,
          payload: {
            workType: item.workType,
            relatedEntityType: item.relatedEntityType,
            relatedEntityId: item.relatedEntityId,
            completedByActorId: authorization.identity.id,
          },
        });
      }
    }

    return NextResponse.json({ ...result, planned, businessEvent, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "WORK_COMMAND_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
