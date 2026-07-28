import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getValueRecoveryRuntime, type ValueRecoveryCommand } from "@/platform/value-recovery/value-recovery-runtime";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getValueRecoveryRuntime().snapshot(authorization.session.activeTerritoryId));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: ValueRecoveryCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_VALUE_RECOVERY_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }

  const permission = ["register_initiative", "approve_plan"].includes(body.command.type)
    ? "government.write"
    : "trade.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const result = getValueRecoveryRuntime().execute(body.commandId, body.command);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "VALUE_RECOVERY_COMMAND_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
