import { NextResponse } from "next/server";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

export async function GET() {
  const snapshot = getIntegratedPlatformRuntime().snapshot();
  return NextResponse.json({
    status: snapshot.running ? "running" : "stopped",
    running: snapshot.running,
    pendingEvents: snapshot.pendingEvents,
    failedEvents: snapshot.failedEvents,
    processedEvents: snapshot.processedEventIds.length,
    atlas: {
      workspaces: snapshot.atlas.workspaces.length,
      questions: snapshot.atlas.questions.length,
      insights: snapshot.atlas.insights.length,
      evidence: snapshot.atlas.evidence.length,
      scenarios: snapshot.atlas.scenarios.length,
      briefings: snapshot.atlas.briefings.length,
    },
    digitalTwin: {
      nodes: snapshot.digitalTwin.nodes.length,
      flows: snapshot.digitalTwin.flows.length,
      signals: snapshot.digitalTwin.signals.length,
      openSignals: snapshot.digitalTwin.signals.filter((signal) => signal.status === "open").length,
      snapshots: snapshot.digitalTwin.snapshots.length,
    },
    knowledgeGraph: {
      nodes: snapshot.knowledgeGraph.nodes.length,
      edges: snapshot.knowledgeGraph.edges.length,
      causalPaths: snapshot.knowledgeGraph.causalPaths.length,
    },
  });
}
