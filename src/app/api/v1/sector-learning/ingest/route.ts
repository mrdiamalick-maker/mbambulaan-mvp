import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { convertBusinessEventToKnowledgeSource, type SectorBusinessEvent } from "@/platform/knowledge/sector-learning-ingestion";
import { getPersistentSectorLearningRuntime } from "@/platform/knowledge/persistent-sector-learning-runtime";
import { getSectorLearningRuntime } from "@/platform/knowledge/sector-learning-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "knowledge.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const body = await request.json().catch(() => undefined) as { commandId?: string; event?: SectorBusinessEvent } | undefined;
  if (!body?.commandId || !body.event) {
    return NextResponse.json({ error: { code: "INVALID_KNOWLEDGE_EVENT", message: "commandId et event sont obligatoires." } }, { status: 400 });
  }

  try {
    const source = convertBusinessEventToKnowledgeSource(body.event);
    const execution = {
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: { type: "register_source" as const, source },
    };
    const persistent = hasRuntimeDatabase();
    const result = persistent
      ? await getPersistentSectorLearningRuntime().execute({ ...execution, occurredAt: body.event.occurredAt })
      : getSectorLearningRuntime().execute(execution);
    return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "KNOWLEDGE_INGESTION_FAILED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
