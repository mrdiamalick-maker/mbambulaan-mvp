import { NextResponse } from "next/server";
import type { AtlasScenario } from "@/domain/infrastructures/atlas";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

function isScenario(value: unknown): value is AtlasScenario {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<AtlasScenario>;
  return Boolean(
    input.id && input.workspaceId && input.name && input.decisionDomain &&
    Array.isArray(input.actions) && input.actions.length > 0 &&
    Array.isArray(input.assumptions) && input.status && input.createdAt,
  );
}

export async function GET(request: Request) {
  const runtime = getIntegratedPlatformRuntime();
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const scenarios = runtime.atlas.snapshot().scenarios.filter(
    (scenario) => !workspaceId || scenario.workspaceId === workspaceId,
  );
  return NextResponse.json({ items: scenarios, total: scenarios.length });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  if (!isScenario(body)) {
    return NextResponse.json(
      { error: { code: "INVALID_ATLAS_SCENARIO", message: "Le scénario Atlas est invalide." } },
      { status: 400 },
    );
  }
  try {
    const scenario = getIntegratedPlatformRuntime().atlas.createScenario(body);
    return NextResponse.json(scenario, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "ATLAS_SCENARIO_REJECTED", message: error instanceof Error ? error.message : String(error) } },
      { status: 409 },
    );
  }
}
