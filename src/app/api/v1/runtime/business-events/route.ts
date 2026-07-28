import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import type { EcosystemBusinessEvent } from "@/platform/runtime/ecosystem-business-event-bus";
import { getConfiguredEcosystemBusinessEventBus } from "@/platform/runtime/ecosystem-business-event-registry";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getConfiguredEcosystemBusinessEventBus().snapshot());
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "admin.manage" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as { event?: EcosystemBusinessEvent; processedAt?: string } | undefined;
  if (!body?.event) return NextResponse.json({ error: { code: "INVALID_BUSINESS_EVENT", message: "L'événement métier est obligatoire." } }, { status: 400 });
  try {
    const snapshot = await getConfiguredEcosystemBusinessEventBus().publish(body.event, body.processedAt);
    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "BUSINESS_EVENT_REFUSED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
