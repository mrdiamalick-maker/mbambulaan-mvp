import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getOperationalDocumentRegistry, type OperationalDocumentCommand } from "@/platform/documents/operational-document-registry";
import { getPersistentOperationalDocumentRegistry } from "@/platform/documents/persistent-operational-document-registry";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

const writeCommands = new Set<OperationalDocumentCommand["type"]>([
  "register_document",
  "verify_document",
  "supersede_document",
  "revoke_document",
  "record_decision",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentOperationalDocumentRegistry().snapshot()
    : getOperationalDocumentRegistry().snapshot();
  return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: OperationalDocumentCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_DOCUMENT_ACTION", message: "L'action documentaire et son identifiant sont obligatoires." } }, { status: 400 });
  }

  const permission = writeCommands.has(body.command.type) ? "government.write" : "government.read";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const execution = {
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    };
    const persistent = hasRuntimeDatabase();
    const result = persistent
      ? await getPersistentOperationalDocumentRegistry().execute(execution)
      : getOperationalDocumentRegistry().execute(execution);
    return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "DOCUMENT_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
