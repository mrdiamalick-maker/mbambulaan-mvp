import { NextResponse } from "next/server";
import { getAtlasOperationalLoop } from "@/platform/atlas/atlas-operational-loop-registry";

export async function GET() {
  return NextResponse.json(getAtlasOperationalLoop().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  if (!body?.decisionId || !body?.scenarioId || !body?.approvedByActorId || !body?.territoryId) {
    return NextResponse.json({ error: { code: "INVALID_ATLAS_DECISION", message: "La décision Atlas est invalide." } }, { status: 400 });
  }
  try {
    const decision = await getAtlasOperationalLoop().approveScenario(body);
    return NextResponse.json(decision, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "ATLAS_DECISION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
