import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import type { EcosystemBusinessEvent } from "@/platform/runtime/ecosystem-business-event-bus";
import { getConfiguredEcosystemBusinessEventBus } from "@/platform/runtime/ecosystem-business-event-registry";
import { getPersistentEcosystemBusinessEventService } from "@/platform/runtime/persistent-ecosystem-business-event-service";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

type BusinessEventAction =
  | { action: "publish"; event?: EcosystemBusinessEvent; processedAt?: string }
  | { action: "retry"; eventId?: string; handlerName?: string; processedAt?: string }
  | { action: "retry_due"; processedAt?: string };

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  if (hasRuntimeDatabase()) {
    const service = getPersistentEcosystemBusinessEventService();
    const snapshot = await service.snapshot();
    const dueFailures = await service.dueFailures(new URL(request.url).searchParams.get("at") ?? new Date().toISOString());
    return NextResponse.json({ ...snapshot, dueFailures, persistence: "postgres" });
  }
  return NextResponse.json({ ...getConfiguredEcosystemBusinessEventBus().snapshot(), persistence: "memory" });
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as BusinessEventAction | undefined;
  if (!body?.action) return NextResponse.json({ error: { code: "INVALID_BUSINESS_EVENT_ACTION", message: "L'action métier est obligatoire." } }, { status: 400 });
  try {
    const persistent = hasRuntimeDatabase();
    const processedAt = body.processedAt ?? new Date().toISOString();
    if (body.action === "retry_due") {
      if (!persistent) throw new Error("Le rejeu groupé nécessite PostgreSQL.");
      return NextResponse.json(await getPersistentEcosystemBusinessEventService().retryDue(processedAt), { status: 201 });
    }
    if (body.action === "retry") {
      if (!body.eventId || !body.handlerName) throw new Error("L'événement et l'abonné à rejouer sont obligatoires.");
      const snapshot = persistent
        ? await getPersistentEcosystemBusinessEventService().retry({ eventId: body.eventId, handlerName: body.handlerName, processedAt })
        : await getConfiguredEcosystemBusinessEventBus().retry(body.eventId, body.handlerName, processedAt);
      return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
    }
    if (!body.event) throw new Error("L'événement métier est obligatoire.");
    const snapshot = persistent
      ? await getPersistentEcosystemBusinessEventService().publish(body.event, processedAt)
      : await getConfiguredEcosystemBusinessEventBus().publish(body.event, processedAt);
    return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "BUSINESS_EVENT_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
