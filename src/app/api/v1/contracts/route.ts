import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getOperationalContractRuntime, type OperationalContractCommand } from "@/platform/contracts/operational-contract-runtime";
import { getPersistentOperationalContractRuntime } from "@/platform/contracts/persistent-operational-contract-runtime";
import { getDocumentEventIngestionService } from "@/platform/documents/document-event-ingestion-service";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

const governanceCommands = new Set<OperationalContractCommand["type"]>([
  "register_contract",
  "add_obligation",
  "register_corrective_plan",
  "update_corrective_plan",
  "record_governance_decision",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "government.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentOperationalContractRuntime().snapshot()
    : getOperationalContractRuntime().snapshot();
  return NextResponse.json({ ...snapshot, persistence: persistent ? "postgres" : "memory" });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: OperationalContractCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_CONTRACT_ACTION", message: "L'action contractuelle et son identifiant sont obligatoires." } }, { status: 400 });
  }

  const permission = governanceCommands.has(body.command.type) ? "government.write" : "government.read";
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
      ? await getPersistentOperationalContractRuntime().execute(execution)
      : getOperationalContractRuntime().execute(execution);

    let documentIngestion: unknown;
    if (body.command.type === "register_contract") {
      const reference = body.command.contract.signedContractDocumentIds[0];
      if (reference) {
        documentIngestion = await getDocumentEventIngestionService().ingest({
          type: "contract_signed",
          entityId: body.command.contract.id,
          organizationId: authorization.identity.organizationId,
          actorId: authorization.identity.id,
          territoryIds: body.command.contract.territoryIds,
          occurredAt: body.command.contract.effectiveAt ?? new Date().toISOString(),
          signedContractReference: reference,
          checksumSha256: reference,
        });
      }
    }

    return NextResponse.json({ ...result, persistence: persistent ? "postgres" : "memory", documentIngestion }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "CONTRACT_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
