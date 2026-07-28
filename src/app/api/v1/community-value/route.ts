import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getCommunityValueLoopRuntime, type CommunityCommand } from "@/platform/community/community-value-loop-runtime";

const governanceCommands = new Set<CommunityCommand["type"]>([
  "qualify_need",
  "create_initiative",
  "open_vote",
  "close_vote",
  "approve_allocation",
  "record_outcome",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getCommunityValueLoopRuntime().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: CommunityCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_COMMUNITY_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }
  const permission = governanceCommands.has(body.command.type) ? "government.write" : "knowledge.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    const result = getCommunityValueLoopRuntime().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "COMMUNITY_COMMAND_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
