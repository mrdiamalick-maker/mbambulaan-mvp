import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getNotificationDeliveryGateway } from "@/platform/coordination/notification-delivery-gateway";
import { getPersistentNotificationDeliveryService } from "@/platform/coordination/persistent-notification-delivery-service";
import { getPersistentUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/persistent-unified-work-orchestration-runtime";
import { getUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/unified-work-orchestration-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

type DeliveryAction =
  | { action: "prepare"; notificationId?: string; recipientReference?: string; territoryId?: string; at?: string }
  | { action: "confirm"; attemptId?: string; providerReference?: string; deliveredAt?: string };

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const url = new URL(request.url);
  if (hasRuntimeDatabase()) {
    const service = getPersistentNotificationDeliveryService();
    const snapshot = await service.snapshot();
    const dueRetries = await service.dueRetries(url.searchParams.get("at") ?? new Date().toISOString());
    return NextResponse.json({ ...snapshot, dueRetries, persistence: "postgres" });
  }
  return NextResponse.json({ ...getNotificationDeliveryGateway().snapshot(), persistence: "memory" });
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as DeliveryAction | undefined;
  if (!body?.action) return NextResponse.json({ error: { code: "INVALID_DELIVERY_ACTION", message: "L'action de remise est obligatoire." } }, { status: 400 });
  try {
    const persistent = hasRuntimeDatabase();
    if (body.action === "confirm") {
      if (!body.attemptId || !body.providerReference || !body.deliveredAt) throw new Error("La tentative, la référence fournisseur et la date de remise sont obligatoires.");
      const attempt = persistent
        ? await getPersistentNotificationDeliveryService().confirmDelivery({ attemptId: body.attemptId, providerReference: body.providerReference, deliveredAt: body.deliveredAt })
        : getNotificationDeliveryGateway().confirmDelivery({ attemptId: body.attemptId, providerReference: body.providerReference, deliveredAt: body.deliveredAt });
      return NextResponse.json({ attempt, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
    }

    if (!body.notificationId) throw new Error("La notification est obligatoire.");
    const snapshot = persistent
      ? await getPersistentUnifiedWorkOrchestrationRuntime().snapshot()
      : getUnifiedWorkOrchestrationRuntime().snapshot();
    const notification = snapshot.notifications.find((item) => item.id === body.notificationId);
    if (!notification) throw new Error(`Notification introuvable : ${body.notificationId}.`);
    const at = body.at ?? new Date().toISOString();
    const attempt = persistent
      ? await getPersistentNotificationDeliveryService().prepare({ notification, territoryId: body.territoryId ?? authorization.session.activeTerritoryId, at })
      : getNotificationDeliveryGateway().prepare({ notification, recipientReference: body.recipientReference ?? notification.recipientActorId ?? notification.recipientOrganizationId, at });
    return NextResponse.json({ attempt, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "DELIVERY_ACTION_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
