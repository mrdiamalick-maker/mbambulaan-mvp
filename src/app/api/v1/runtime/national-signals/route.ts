import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getNationalCoordinationSignalProjection } from "@/platform/runtime/national-coordination-signal-projection";
import { getPersistentNationalCoordinationSignalService } from "@/platform/runtime/persistent-national-coordination-signal-service";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const url = new URL(request.url);
  const requestedTerritory = url.searchParams.get("territoryId") ?? authorization.session.activeTerritoryId;
  const territoryId = authorization.identity.territoryIds.includes("territory-national")
    ? requestedTerritory
    : authorization.session.activeTerritoryId;
  const input = { territoryId, correlationId: url.searchParams.get("correlationId") ?? undefined };
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentNationalCoordinationSignalService().snapshot(input)
    : getNationalCoordinationSignalProjection().snapshot(input);
  return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" });
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as { action?: "resolve_correlation"; correlationId?: string; resolvedAt?: string } | undefined;
  if (body?.action !== "resolve_correlation" || !body.correlationId) {
    return NextResponse.json({ error: { code: "INVALID_SIGNAL_ACTION", message: "La corrélation à résoudre est obligatoire." } }, { status: 400 });
  }
  const persistent = hasRuntimeDatabase();
  if (persistent) {
    await getPersistentNationalCoordinationSignalService().resolveByCorrelation(body.correlationId, body.resolvedAt);
  } else {
    getNationalCoordinationSignalProjection().resolveByCorrelation(body.correlationId);
  }
  const snapshot = persistent
    ? await getPersistentNationalCoordinationSignalService().snapshot({ correlationId: body.correlationId })
    : getNationalCoordinationSignalProjection().snapshot({ correlationId: body.correlationId });
  return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
}
