import { NextResponse } from "next/server";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const runtime = getIntegratedPlatformRuntime();
  try {
    const evaluation = runtime.atlas.evaluateScenario(id, {
      digitalTwin: runtime.digitalTwin.snapshot(),
      coordination: runtime.coordination.snapshot(),
      marketplace: runtime.marketplace.snapshot(),
      platform: runtime.platform.snapshot(),
      revenue: runtime.revenue.snapshot(),
    }, new Date().toISOString());
    return NextResponse.json(evaluation);
  } catch (error) {
    return NextResponse.json(
      { error: { code: "ATLAS_SCENARIO_EVALUATION_FAILED", message: error instanceof Error ? error.message : String(error) } },
      { status: 404 },
    );
  }
}
