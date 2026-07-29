import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { buildDefaultViabilityScenarios, calculateUnitEconomics, type UnitEconomicsAssumptions } from "@/platform/economics/mbambulaan-unit-economics";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "finance.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    currency: "XOF",
    scenarios: buildDefaultViabilityScenarios(),
    disclaimer: "Ces résultats sont des hypothèses de travail à valider par un pilote terrain et des coûts fournisseurs réels.",
  });
}

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "finance.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const body = await request.json().catch(() => undefined) as UnitEconomicsAssumptions | undefined;
  if (!body) return NextResponse.json({ error: { code: "INVALID_ECONOMICS_INPUT", message: "Les hypothèses économiques sont obligatoires." } }, { status: 400 });
  try {
    return NextResponse.json({ currency: "XOF", assumptions: body, result: calculateUnitEconomics(body) });
  } catch (error) {
    return NextResponse.json({ error: { code: "ECONOMICS_CALCULATION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
