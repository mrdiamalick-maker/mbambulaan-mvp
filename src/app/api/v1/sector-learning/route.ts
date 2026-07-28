import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getSectorLearningRuntime, type SectorLearningCommand } from "@/platform/knowledge/sector-learning-runtime";

const publicationCommands = new Set<SectorLearningCommand["type"]>([
  "register_source",
  "create_lesson",
  "review_lesson",
  "publish_lesson",
  "create_practice",
  "activate_practice",
  "record_outcome",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "knowledge.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getSectorLearningRuntime().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: SectorLearningCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_KNOWLEDGE_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }

  const permission = publicationCommands.has(body.command.type) ? "knowledge.write" : "knowledge.read";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const result = getSectorLearningRuntime().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "KNOWLEDGE_COMMAND_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
