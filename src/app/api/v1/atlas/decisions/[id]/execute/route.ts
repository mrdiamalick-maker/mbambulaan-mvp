import { NextResponse } from "next/server";
import { getAtlasOperationalLoop } from "@/platform/atlas/atlas-operational-loop-registry";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const result = await getAtlasOperationalLoop().completeDecision({ decisionId: id });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: { code: "ATLAS_EXECUTION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
