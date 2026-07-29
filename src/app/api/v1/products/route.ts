import { NextResponse } from "next/server";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";
import { getIntegratedProductSuite } from "@/platform/product-suite/integrated-product-suite";

export async function GET() {
  const runtime = getIntegratedPlatformRuntime().snapshot();
  const suite = getIntegratedProductSuite({
    running: runtime.running,
    pendingEvents: runtime.pendingEvents,
    failedEvents: runtime.failedEvents,
    openSignals: runtime.digitalTwin.signals.filter((signal) => signal.status === "open").length,
    atlasInsights: runtime.atlas.insights.length,
    atlasScenarios: runtime.atlas.scenarios.length,
    graphNodes: runtime.knowledgeGraph.nodes.length,
  });

  return NextResponse.json(suite);
}
