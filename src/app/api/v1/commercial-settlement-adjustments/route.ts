import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getPersistentCommercialSettlementAdjustments, type SettlementAdjustmentCommand } from "@/platform/commercial/persistent-commercial-settlement-adjustments";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    return NextResponse.json(await getPersistentCommercialSettlementAdjustments().snapshot());
  } catch (error) {
    return NextResponse.json({
      error: { code: "SETTLEMENT_ADJUSTMENT_RESTORE_FAILED", message: error instanceof Error ? error.message : String(error) },
    }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: SettlementAdjustmentCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_SETTLEMENT_ADJUSTMENT", message: "commandId et command sont obligatoires." } }, { status: 400 });
  }
  const authorization = authorizeDemoRequest({ request, permission: "trade.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    const result = await getPersistentCommercialSettlementAdjustments().execute({
      commandId: body.commandId,
      identity: authorization.identity,
      territoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: { code: "SETTLEMENT_ADJUSTMENT_FAILED", message: error instanceof Error ? error.message : String(error) },
    }, { status: 422 });
  }
}
