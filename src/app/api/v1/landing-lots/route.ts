import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getLandingLotRuntime, type LandingLotCommand } from "@/platform/landing/landing-lot-runtime";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "landing.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getLandingLotRuntime().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: LandingLotCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_LANDING_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }

  const authorization = authorizeDemoRequest({ request, permission: "landing.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const result = getLandingLotRuntime().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      territoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "LANDING_COMMAND_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
