import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getCommercialFinancialExecution } from "@/platform/commercial/commercial-financial-registry";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getCommercialFinancialExecution().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as
    | { action?: string; orderId?: string; disputeId?: string; reason?: string; resolution?: string }
    | undefined;
  if (!body?.action) return NextResponse.json({ error: { code: "INVALID_COMMERCIAL_ACTION", message: "L'action commerciale est obligatoire." } }, { status: 400 });

  const permission = body.action === "resolve_dispute" ? "finance.write" : body.action === "reset" ? "admin.manage" : "trade.write";
  const authorization = authorizeDemoRequest({ request, permission, productCode: permission === "finance.write" ? "finance" : undefined });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const engine = getCommercialFinancialExecution();
  try {
    switch (body.action) {
      case "run_demo":
        return NextResponse.json(engine.runDemo());
      case "reset":
        engine.reset();
        return NextResponse.json(engine.snapshot());
      case "open_dispute": {
        if (!body.orderId || !body.reason) throw new Error("orderId et reason sont obligatoires.");
        const dispute = engine.openDispute({
          orderId: body.orderId,
          openedByOrganizationId: authorization.identity.organizationId,
          reason: body.reason,
        });
        return NextResponse.json({ dispute, environment: engine.snapshot() }, { status: 201 });
      }
      case "resolve_dispute": {
        if (!body.disputeId || !body.resolution) throw new Error("disputeId et resolution sont obligatoires.");
        const dispute = engine.resolveDispute({ disputeId: body.disputeId, resolution: body.resolution });
        return NextResponse.json({ dispute, environment: engine.snapshot() });
      }
      default:
        return NextResponse.json({ error: { code: "UNKNOWN_COMMERCIAL_ACTION", message: "Action commerciale inconnue." } }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: { code: "COMMERCIAL_FLOW_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
