import { NextResponse } from "next/server";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

interface BriefingRequest {
  id: string;
  workspaceId: string;
  title: string;
  generatedAt?: string;
  nextReviewAt?: string;
}

function isBriefingRequest(value: unknown): value is BriefingRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<BriefingRequest>;
  return Boolean(input.id && input.workspaceId && input.title);
}

export async function GET(request: Request) {
  const runtime = getIntegratedPlatformRuntime();
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const briefings = runtime.atlas.snapshot().briefings.filter(
    (briefing) => !workspaceId || briefing.workspaceId === workspaceId,
  );
  return NextResponse.json({ items: briefings, total: briefings.length });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  if (!isBriefingRequest(body)) {
    return NextResponse.json(
      { error: { code: "INVALID_ATLAS_BRIEFING", message: "Le briefing Atlas est invalide." } },
      { status: 400 },
    );
  }

  const runtime = getIntegratedPlatformRuntime();
  try {
    const briefing = runtime.atlas.generateBriefing({
      id: body.id,
      workspaceId: body.workspaceId,
      generatedAt: body.generatedAt ?? new Date().toISOString(),
      title: body.title,
      sources: {
        digitalTwin: runtime.digitalTwin.snapshot(),
        coordination: runtime.coordination.snapshot(),
        marketplace: runtime.marketplace.snapshot(),
        platform: runtime.platform.snapshot(),
        revenue: runtime.revenue.snapshot(),
      },
      nextReviewAt: body.nextReviewAt,
    });
    return NextResponse.json(briefing, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: { code: "ATLAS_BRIEFING_FAILED", message: error instanceof Error ? error.message : String(error) } },
      { status: 409 },
    );
  }
}
