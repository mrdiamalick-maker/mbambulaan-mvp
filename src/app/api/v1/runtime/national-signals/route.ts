import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getNationalCoordinationSignalProjection } from "@/platform/runtime/national-coordination-signal-projection";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const url = new URL(request.url);
  const requestedTerritory = url.searchParams.get("territoryId") ?? authorization.session.activeTerritoryId;
  const territoryId = authorization.identity.territoryIds.includes("territory-national")
    ? requestedTerritory
    : authorization.session.activeTerritoryId;
  return NextResponse.json(getNationalCoordinationSignalProjection().snapshot({
    territoryId,
    correlationId: url.searchParams.get("correlationId") ?? undefined,
  }));
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as { action?: "resolve_correlation"; correlationId?: string } | undefined;
  if (body?.action !== "resolve_correlation" || !body.correlationId) {
    return NextResponse.json({ error: { code: "INVALID_SIGNAL_ACTION", message: "La corrélation à résoudre est obligatoire." } }, { status: 400 });
  }
  getNationalCoordinationSignalProjection().resolveByCorrelation(body.correlationId);
  return NextResponse.json(getNationalCoordinationSignalProjection().snapshot({ correlationId: body.correlationId }), { status: 201 });
}
