import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getDevelopmentProgramRuntime, type DevelopmentProgramCommand } from "@/platform/development/development-program-runtime";

const governanceCommands = new Set<DevelopmentProgramCommand["type"]>([
  "open_program",
  "define_objective",
  "add_intervention",
  "add_budget_line",
  "approve_program",
  "launch_program",
  "record_decision",
  "seed_demo",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getDevelopmentProgramRuntime().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: DevelopmentProgramCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_DEVELOPMENT_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }

  const permission = governanceCommands.has(body.command.type) ? "government.write" : "knowledge.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const result = getDevelopmentProgramRuntime().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "DEVELOPMENT_COMMAND_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
