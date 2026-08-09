import { NextResponse } from "next/server";
import type { AtlasWorkspace } from "@/domain/infrastructures/atlas";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

function isWorkspace(value: unknown): value is AtlasWorkspace {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<AtlasWorkspace>;
  return Boolean(
    input.id &&
    input.tenantId &&
    input.name &&
    input.clientSegment &&
    Array.isArray(input.territoryIds) &&
    Array.isArray(input.decisionDomains) &&
    Array.isArray(input.capabilityCodes) &&
    input.capabilityCodes.length > 0 &&
    input.status &&
    input.createdAt,
  );
}

export async function GET(request: Request) {
  const runtime = getIntegratedPlatformRuntime();
  const tenantId = new URL(request.url).searchParams.get("tenantId");
  const workspaces = runtime.atlas.snapshot().workspaces.filter(
    (workspace) => !tenantId || workspace.tenantId === tenantId,
  );
  return NextResponse.json({ items: workspaces, total: workspaces.length });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  if (!isWorkspace(body)) {
    return NextResponse.json(
      { error: { code: "INVALID_ATLAS_WORKSPACE", message: "L'espace Atlas est invalide." } },
      { status: 400 },
    );
  }
  try {
    const workspace = getIntegratedPlatformRuntime().atlas.createWorkspace(body);
    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "ATLAS_WORKSPACE_REJECTED", message: error instanceof Error ? error.message : String(error) } },
      { status: 409 },
    );
  }
}
