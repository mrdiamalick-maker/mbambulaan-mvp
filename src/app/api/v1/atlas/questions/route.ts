import { NextResponse } from "next/server";
import type { AtlasQuestion } from "@/domain/infrastructures/atlas";
import { getIntegratedPlatformRuntime } from "@/platform/runtime/runtime-registry";

interface AtlasQuestionRequest {
  id: string;
  workspaceId: string;
  askedByActorId: string;
  askedAt?: string;
  question: string;
  decisionDomain: AtlasQuestion["decisionDomain"];
  territoryId: string;
  horizon: AtlasQuestion["horizon"];
  correlationId?: string;
}

function isQuestionRequest(value: unknown): value is AtlasQuestionRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<AtlasQuestionRequest>;
  return Boolean(
    input.id && input.workspaceId && input.askedByActorId && input.question &&
    input.decisionDomain && input.territoryId && input.horizon,
  );
}

export async function GET(request: Request) {
  const runtime = getIntegratedPlatformRuntime();
  const workspaceId = new URL(request.url).searchParams.get("workspaceId");
  const questions = runtime.atlas.snapshot().questions.filter(
    (question) => !workspaceId || question.workspaceId === workspaceId,
  );
  return NextResponse.json({ items: questions, total: questions.length });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined);
  if (!isQuestionRequest(body)) {
    return NextResponse.json(
      { error: { code: "INVALID_ATLAS_QUESTION", message: "La question Atlas est invalide." } },
      { status: 400 },
    );
  }

  const runtime = getIntegratedPlatformRuntime();
  const occurredAt = body.askedAt ?? new Date().toISOString();
  const eventId = `event-atlas-question-${body.id}`;
  const accepted = runtime.publish({
    id: eventId,
    type: "atlas.question.requested",
    occurredAt,
    correlationId: body.correlationId ?? body.id,
    tenantId: runtime.atlas.snapshot().workspaces.find((item) => item.id === body.workspaceId)?.tenantId ?? "tenant-national",
    territoryId: body.territoryId,
    payload: {
      questionId: body.id,
      workspaceId: body.workspaceId,
      askedByActorId: body.askedByActorId,
      question: body.question,
      decisionDomain: body.decisionDomain,
      horizon: body.horizon,
    },
  });
  if (!accepted) {
    return NextResponse.json({ duplicate: true, eventId }, { status: 200 });
  }

  await runtime.drain(new Date().toISOString());
  const snapshot = runtime.atlas.snapshot();
  return NextResponse.json({
    question: snapshot.questions.find((item) => item.id === body.id),
    evidence: snapshot.evidence.filter((item) =>
      snapshot.insights.some((insight) => insight.questionId === body.id && insight.evidenceIds.includes(item.id)),
    ),
    insights: snapshot.insights.filter((item) => item.questionId === body.id),
    eventId,
  }, { status: 201 });
}
