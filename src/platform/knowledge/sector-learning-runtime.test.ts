import test from "node:test";
import assert from "node:assert/strict";
import { SectorLearningRuntime } from "./sector-learning-runtime";

const at = "2026-07-28T16:00:00.000Z";

function buildPublishedPractice(runtime: SectorLearningRuntime) {
  runtime.execute({ commandId: "source", actorId: "knowledge-01", activeTerritoryId: "territory-national", command: {
    type: "register_source",
    source: {
      id: "source-01", sourceType: "value_recovery", sourceReferenceId: "recovery-01", territoryId: "territory-dakar",
      title: "Rupture de froid sur lots à risque", summary: "Des lots ont été sauvés par prépositionnement de glace.",
      evidenceIds: ["proof-01"], confidenceScore: 85, occurredAt: at, recordedByActorId: "knowledge-01",
    },
  }});
  runtime.execute({ commandId: "lesson", actorId: "knowledge-01", activeTerritoryId: "territory-national", command: {
    type: "create_lesson",
    lesson: {
      id: "lesson-01", sourceIds: ["source-01"], territoryIds: ["territory-dakar"], actorKinds: ["cooperative", "cold_operator"],
      problem: "Glace indisponible avant débarquement", finding: "Le prépositionnement réduit les pertes.", causalFactors: ["Alerte tardive"],
      recommendation: "Prépositionner la glace dès l'annonce du retour.", expectedValue: ["Réduire les pertes"], confidenceScore: 80,
      status: "draft", createdAt: at,
    },
  }});
  runtime.execute({ commandId: "review", actorId: "expert-01", activeTerritoryId: "territory-national", command: { type: "review_lesson", lessonId: "lesson-01", actorId: "expert-01" } });
  runtime.execute({ commandId: "publish", actorId: "knowledge-01", activeTerritoryId: "territory-national", command: { type: "publish_lesson", lessonId: "lesson-01", at } });
  runtime.execute({ commandId: "practice", actorId: "knowledge-01", activeTerritoryId: "territory-national", command: {
    type: "create_practice",
    practice: {
      id: "practice-01", lessonId: "lesson-01", title: "Prépositionnement de glace", targetActorKinds: ["cooperative"],
      steps: ["Lire les retours annoncés", "Réserver la glace", "Confirmer la disponibilité"], requiredCapabilities: ["campaign", "capacity"],
      successIndicators: ["avoided_loss_kg", "incident_reduction_percent"], status: "draft",
    },
  }});
  runtime.execute({ commandId: "activate", actorId: "knowledge-01", activeTerritoryId: "territory-national", command: { type: "activate_practice", practiceId: "practice-01", at } });
}

test("refuse une source sans preuve", () => {
  const runtime = new SectorLearningRuntime();
  assert.throws(() => runtime.execute({ commandId: "source", actorId: "knowledge-01", activeTerritoryId: "territory-national", command: {
    type: "register_source",
    source: {
      id: "source-01", sourceType: "incident", sourceReferenceId: "incident-01", territoryId: "territory-dakar",
      title: "Incident", summary: "Résumé", evidenceIds: [], confidenceScore: 80, occurredAt: at, recordedByActorId: "knowledge-01",
    },
  }}), /preuve/i);
});

test("mesure la valeur créée par une pratique appliquée", () => {
  const runtime = new SectorLearningRuntime();
  buildPublishedPractice(runtime);
  runtime.execute({ commandId: "adopt", actorId: "cooperative-01", activeTerritoryId: "territory-dakar", command: {
    type: "adopt_practice",
    adoption: {
      id: "adoption-01", practiceId: "practice-01", organizationId: "org-cooperative-dakar", territoryId: "territory-dakar",
      adoptedByActorId: "cooperative-01", adoptedAt: at, status: "applied", evidenceIds: ["adoption-proof-01"],
    },
  }});
  const result = runtime.execute({ commandId: "outcome", actorId: "knowledge-01", activeTerritoryId: "territory-national", command: {
    type: "record_outcome",
    outcome: {
      id: "outcome-01", adoptionId: "adoption-01", measuredAt: at, indicatorValues: { avoided_loss_kg: 420 },
      valueCreatedXof: 1_260_000, avoidedLossKg: 420, incidentReductionPercent: 35, confidenceScore: 82,
      evidenceIds: ["outcome-proof-01"],
    },
  }}) as { snapshot: { metrics: { publishedLessonCount: number; activePracticeCount: number; appliedAdoptionCount: number; valueCreatedXof: number; avoidedLossKg: number } } };
  assert.equal(result.snapshot.metrics.publishedLessonCount, 1);
  assert.equal(result.snapshot.metrics.activePracticeCount, 1);
  assert.equal(result.snapshot.metrics.appliedAdoptionCount, 1);
  assert.equal(result.snapshot.metrics.valueCreatedXof, 1_260_000);
  assert.equal(result.snapshot.metrics.avoidedLossKg, 420);
});
