import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getEthicalFinanceRuntime, type EthicalFinanceCommand } from "@/platform/finance/ethical-finance-runtime";

const writeCommands = new Set<EthicalFinanceCommand["type"]>([
  "qualify_need",
  "propose_offer",
  "review_offer",
  "accept_offer",
  "record_disbursement",
  "record_settlement",
  "create_solidarity_fund",
  "activate_solidarity_fund",
  "approve_support",
  "record_support_payment",
]);

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "finance.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getEthicalFinanceRuntime().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as { commandId?: string; command?: EthicalFinanceCommand } | undefined;
  if (!body?.commandId || !body.command?.type) {
    return NextResponse.json({ error: { code: "INVALID_FINANCE_ACTION", message: "L’action et son identifiant sont obligatoires." } }, { status: 400 });
  }

  const permission = writeCommands.has(body.command.type) ? "finance.write" : "finance.read";
  const authorization = authorizeDemoRequest({ request, permission });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const result = getEthicalFinanceRuntime().execute({
      commandId: body.commandId,
      actorId: authorization.identity.id,
      activeTerritoryId: authorization.session.activeTerritoryId,
      command: body.command,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      error: {
        code: "ETHICAL_FINANCE_ACTION_REFUSED",
        message: error instanceof Error ? error.message : String(error),
      },
    }, { status: 422 });
  }
}
