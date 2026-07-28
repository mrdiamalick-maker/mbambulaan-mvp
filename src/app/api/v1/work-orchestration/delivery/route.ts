import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getNotificationDeliveryGateway } from "@/platform/coordination/notification-delivery-gateway";
import { getPersistentUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/persistent-unified-work-orchestration-runtime";
import { getUnifiedWorkOrchestrationRuntime } from "@/platform/coordination/unified-work-orchestration-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getNotificationDeliveryGateway().snapshot());
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as
    | { action?: "prepare"; notificationId?: string; recipientReference?: string; at?: string }
    | { action?: "confirm"; attemptId?: string; providerReference?: string; deliveredAt?: string }
    | undefined;
  if (!body?.action) return NextResponse.json({ error: { code: "INVALID_DELIVERY_ACTION", message: "L'action de remise est obligatoire." } }, { status: 400 });
  try {
    const gateway = getNotificationDeliveryGateway();
    if (body.action === "confirm") {
      if (!body.attemptId || !body.providerReference || !body.deliveredAt) throw new Error("La tentative, la référence fournisseur et la date de remise sont obligatoires.");
      return NextResponse.json(gateway.confirmDelivery({ attemptId: body.attemptId, providerReference: body.providerReference, deliveredAt: body.deliveredAt }), { status: 201 });
    }
    if (!body.notificationId || !body.recipientReference) throw new Error("La notification et la référence destinataire sont obligatoires.");
    const snapshot = hasRuntimeDatabase()
      ? await getPersistentUnifiedWorkOrchestrationRuntime().snapshot()
      : getUnifiedWorkOrchestrationRuntime().snapshot();
    const notification = snapshot.notifications.find((item) => item.id === body.notificationId);
    if (!notification) throw new Error(`Notification introuvable : ${body.notificationId}.`);
    return NextResponse.json(gateway.prepare({ notification, recipientReference: body.recipientReference, at: body.at ?? new Date().toISOString() }), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "DELIVERY_ACTION_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
