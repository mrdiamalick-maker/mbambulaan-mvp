import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getPersistentSectorLearningRuntime } from "@/platform/knowledge/persistent-sector-learning-runtime";
import { getSectorLearningRuntime } from "@/platform/knowledge/sector-learning-runtime";
import { hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "atlas.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const persistent = hasRuntimeDatabase();
  const snapshot = persistent
    ? await getPersistentSectorLearningRuntime().snapshot()
    : getSectorLearningRuntime().snapshot();

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    persistence: persistent ? "postgres" : "memory",
    insights: snapshot.lessons
      .filter((lesson) => lesson.status === "published")
      .map((lesson) => ({
        id: lesson.id,
        problem: lesson.problem,
        finding: lesson.finding,
        recommendation: lesson.recommendation,
        territories: lesson.territoryIds,
        actorKinds: lesson.actorKinds,
        confidenceScore: lesson.confidenceScore,
        evidenceSourceIds: lesson.sourceIds,
      })),
    recommendedPractices: snapshot.practices
      .filter((practice) => practice.status === "active")
      .map((practice) => ({
        id: practice.id,
        title: practice.title,
        targetActorKinds: practice.targetActorKinds,
        successIndicators: practice.successIndicators,
        appliedOrganizationCount: snapshot.adoptions.filter((adoption) => adoption.practiceId === practice.id && adoption.status === "applied").length,
      })),
    measuredOutcomes: snapshot.outcomes.map((outcome) => ({
      id: outcome.id,
      adoptionId: outcome.adoptionId,
      valueCreatedXof: outcome.valueCreatedXof,
      avoidedLossKg: outcome.avoidedLossKg,
      incidentReductionPercent: outcome.incidentReductionPercent,
      confidenceScore: outcome.confidenceScore,
      evidenceIds: outcome.evidenceIds,
    })),
    metrics: snapshot.metrics,
  });
}
