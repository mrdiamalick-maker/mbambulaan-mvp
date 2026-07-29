import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getPersistentNotificationDeliveryService } from "@/platform/coordination/persistent-notification-delivery-service";
import type { NotificationContactPoint } from "@/platform/coordination/postgres-notification-delivery-repository";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  if (!hasRuntimeDatabase()) return NextResponse.json({ error: { code: "CONTACT_DIRECTORY_REQUIRES_DATABASE", message: "L'annuaire des coordonnées nécessite PostgreSQL." } }, { status: 503 });
  const body = await request.json().catch(() => undefined) as NotificationContactPoint | undefined;
  if (!body?.id || !body.organizationId || !body.territoryId || !body.channel || !body.recipientReference) {
    return NextResponse.json({ error: { code: "INVALID_CONTACT_POINT", message: "L'identifiant, l'organisation, le territoire, le canal et la coordonnée sont obligatoires." } }, { status: 400 });
  }
  try {
    const contact = await getPersistentNotificationDeliveryService().upsertContact(body);
    return NextResponse.json({ contact, persistence: "postgres" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "CONTACT_POINT_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
