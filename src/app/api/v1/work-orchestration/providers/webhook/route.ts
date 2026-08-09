import { NextResponse } from "next/server";
import { NotificationProviderWebhookVerifier } from "@/platform/coordination/notification-provider-webhook";
import { getPersistentNotificationDeliveryService } from "@/platform/coordination/persistent-notification-delivery-service";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function POST(request: Request) {
  if (!hasRuntimeDatabase()) {
    return NextResponse.json({ error: { code: "PERSISTENCE_REQUIRED", message: "Les callbacks fournisseurs exigent PostgreSQL." } }, { status: 503 });
  }

  const secret = process.env.MBAMBULAAN_NOTIFICATION_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: { code: "WEBHOOK_NOT_CONFIGURED", message: "Le secret de callback fournisseur n'est pas configuré." } }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-mbambulaan-provider-signature") ?? "";
  const verifier = new NotificationProviderWebhookVerifier();
  if (!signature || !verifier.verify({ rawBody, signature, secret })) {
    return NextResponse.json({ error: { code: "INVALID_PROVIDER_SIGNATURE", message: "La signature du fournisseur est invalide." } }, { status: 401 });
  }

  try {
    const event = verifier.parse(rawBody);
    const attempt = await getPersistentNotificationDeliveryService().applyProviderEvent({
      providerReference: event.providerReference,
      status: event.status,
      occurredAt: event.occurredAt,
      failureReason: event.failureReason,
    });
    return NextResponse.json({ accepted: true, providerCode: event.providerCode, attempt }, { status: 202 });
  } catch (error) {
    return NextResponse.json({ error: { code: "PROVIDER_EVENT_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
