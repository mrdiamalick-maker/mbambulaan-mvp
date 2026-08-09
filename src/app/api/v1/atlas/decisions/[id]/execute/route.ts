import { NextResponse } from "next/server";
import { getAtlasOperationalLoop } from "@/platform/atlas/atlas-operational-loop-registry";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = authorizeDemoRequest({
    request,
    permission: "atlas.approve",
    productCode: "atlas",
  });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const { id } = await context.params;
  try {
    const result = await getAtlasOperationalLoop().completeDecision({ decisionId: id });
    return NextResponse.json({ result, executedBy: authorization.identity.id });
  } catch (error) {
    return NextResponse.json({ error: { code: "ATLAS_EXECUTION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
