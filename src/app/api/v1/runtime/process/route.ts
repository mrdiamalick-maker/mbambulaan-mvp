import { NextResponse } from "next/server";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

export async function POST() {
  const runtime = getIntegratedPlatformRuntime();
  const snapshot = await runtime.drain(new Date().toISOString());
  return NextResponse.json({
    processedEvents: snapshot.processedEventIds.length,
    pendingEvents: snapshot.pendingEvents,
    failedEvents: snapshot.failedEvents,
    atlasInsights: snapshot.atlas.insights.length,
    openSignals: snapshot.digitalTwin.signals.filter((signal) => signal.status === "open").length,
  });
}
