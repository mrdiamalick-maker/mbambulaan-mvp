import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getEcosystemCrisisResponseRuntime, type CrisisCommand } from "@/platform/crisis/ecosystem-crisis-response-runtime";
import { getPersistentCrisisResponseRuntime } from "@/platform/crisis/persistent-crisis-response-runtime";
import { getDocumentEventIngestionService } from "@/platform/documents/document-event-ingestion-service";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

const decisionCommands = new Set<CrisisCommand["type"]>([
  "qualify_crisis",
  "activate_response_cell",
  "record_decision",
  "advance_crisis",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const persistence = hasRuntimeDatabase() ? "postgres" : "memory";
  const snapshot = persistence === "postgres"
    ? await getPersistentCrisisResponseRuntime().snapshot()
    : getEcosystemCrisisResponseRuntime().snapshot();
  return NextResponse.json({ ...snapshot, persistence });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: CrisisCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_CRISIS_ACTION", message: "L’action et son identifiant sont obligatoires." } }, { status: 400 });
  }
  const permission = decisionCommands.has(body.command.type) ? "government.write" : "government.read";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const input = {
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    };
    const persistence = hasRuntimeDatabase() ? "postgres" : "memory";
    const result = persistence === "postgres"
      ? await getPersistentCrisisResponseRuntime().execute(input)
      : getEcosystemCrisisResponseRuntime().execute(input);

    let documentIngestion: unknown;
    if (body.command.type === "record_recovery_result") {
      const reference = body.command.result.resultDocumentIds[0];
      if (reference) {
        documentIngestion = await getDocumentEventIngestionService().ingest({
          type: "crisis_recovery_recorded",
          entityId: body.command.result.crisisId,
          organizationId: authorization.identity.organizationId,
          actorId: authorization.identity.id,
          territoryIds: [body.command.result.territoryId],
          occurredAt: body.command.result.measuredAt,
          recoveryReportReference: reference,
          checksumSha256: reference,
        });
      }
    }

    return NextResponse.json({ ...result, persistence, documentIngestion }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "CRISIS_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
