import { NextResponse } from "next/server";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

export async function GET(request: Request) {
  const runtime = getIntegratedPlatformRuntime();
  const params = new URL(request.url).searchParams;
  const nodeId = params.get("nodeId");
  const depth = Math.min(5, Math.max(1, Number(params.get("depth") ?? 2)));
  const graph = runtime.knowledgeGraph.snapshot();

  if (!nodeId) {
    return NextResponse.json({
      nodes: graph.nodes,
      edges: graph.edges,
      causalPaths: graph.causalPaths,
      totals: {
        nodes: graph.nodes.length,
        edges: graph.edges.length,
        causalPaths: graph.causalPaths.length,
      },
    });
  }

  const root = graph.nodes.find((node) => node.id === nodeId);
  if (!root) {
    return NextResponse.json(
      { error: { code: "ATLAS_NODE_NOT_FOUND", message: "Le nœud Atlas est introuvable." } },
      { status: 404 },
    );
  }

  const related = runtime.knowledgeGraph.findRelatedNodes(nodeId, depth);
  const visibleIds = new Set([nodeId, ...related.map((node) => node.id)]);
  return NextResponse.json({
    root,
    related,
    edges: graph.edges.filter((edge) => visibleIds.has(edge.fromNodeId) && visibleIds.has(edge.toNodeId)),
    depth,
  });
}
