import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import type { CommercialWorkflowCommand } from "@/platform/commercial/commercial-actor-workflow";
import { getCommercialCatalogExecutionService } from "@/platform/commercial/commercial-catalog-execution";
import { getPersistentCommercialWorkflow } from "@/platform/commercial/persistent-commercial-workflow";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    return NextResponse.json(await getPersistentCommercialWorkflow().snapshot());
  } catch (error) {
    return NextResponse.json({ error: { code: "COMMERCIAL_RESTORE_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as
    | { commandId?: string; command?: CommercialWorkflowCommand }
    | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_COMMERCIAL_COMMAND", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }

  const financeCommands = new Set(["confirm_payment", "reconcile_order", "resolve_dispute"]);
  const permission = financeCommands.has(body.command.type) ? "finance.write" : "trade.write";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    if (body.command.type === "start_transport" || body.command.type === "confirm_delivery") {
      await getCommercialCatalogExecutionService().assertSelectedLogistics(body.command.orderId, authorization.identity);
    }
    const snapshot = await getPersistentCommercialWorkflow().execute({
      commandId: body.commandId,
      identity: authorization.identity,
      territoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "COMMERCIAL_COMMAND_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
