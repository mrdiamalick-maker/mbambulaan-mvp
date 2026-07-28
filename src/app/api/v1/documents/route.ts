import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getOperationalDocumentRegistry, type OperationalDocumentCommand } from "@/platform/documents/operational-document-registry";

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
  return NextResponse.json(getOperationalDocumentRegistry().snapshot());
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
    const result = getOperationalDocumentRegistry().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "DOCUMENT_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
