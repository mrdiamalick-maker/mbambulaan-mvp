import { NextResponse } from "next/server";
import { getAtlasOperationalLoop } from "@/platform/atlas/atlas-operational-loop-registry";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({
    request,
    permission: "atlas.read",
    productCode: "atlas",
  });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getAtlasOperationalLoop().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  if (!body?.decisionId || !body?.scenarioId || !body?.territoryId) {
    return NextResponse.json({ error: { code: "INVALID_ATLAS_DECISION", message: "La décision Atlas est invalide." } }, { status: 400 });
  }

  const authorization = authorizeDemoRequest({
    request,
    permission: "atlas.approve",
    territoryId: body.territoryId,
    productCode: "atlas",
  });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  try {
    const decision = await getAtlasOperationalLoop().approveScenario({
      decisionId: body.decisionId,
      scenarioId: body.scenarioId,
      approvedByActorId: authorization.identity.id,
      territoryId: body.territoryId,
      at: body.at,
    });
    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "ATLAS_DECISION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
