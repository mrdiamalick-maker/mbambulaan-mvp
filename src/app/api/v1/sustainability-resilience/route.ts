import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getSustainabilityResilienceRuntime, type SustainabilityCommand } from "@/platform/sustainability/sustainability-resilience-runtime";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getSustainabilityResilienceRuntime().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: SustainabilityCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_SUSTAINABILITY_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }

  const permission = ["deliver_support", "record_outcome"].includes(body.command.type) ? "government.write" : "government.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const result = getSustainabilityResilienceRuntime().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "SUSTAINABILITY_COMMAND_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
