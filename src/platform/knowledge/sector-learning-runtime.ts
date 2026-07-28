export type KnowledgeSourceType =
  | "incident"
  | "landing"
  | "commercial_execution"
  | "value_recovery"
  | "sustainability"
  | "development_program"
  | "field_observation"
  | "research";

export interface KnowledgeSource {
  id: string;
  sourceType: KnowledgeSourceType;
  sourceReferenceId: string;
  territoryId: string;
  title: string;
  summary: string;
  evidenceIds: string[];
  confidenceScore: number;
  occurredAt: string;
  recordedByActorId: string;
}

export interface SectorLesson {
  id: string;
  sourceIds: string[];
  territoryIds: string[];
  actorKinds: string[];
  problem: string;
  finding: string;
  causalFactors: string[];
  recommendation: string;
  expectedValue: string[];
  confidenceScore: number;
  status: "draft" | "reviewed" | "published" | "retired";
  createdAt: string;
  reviewedByActorId?: string;
  publishedAt?: string;
}

export interface RecommendedPractice {
  id: string;
  lessonId: string;
  title: string;
  targetActorKinds: string[];
  steps: string[];
  requiredCapabilities: string[];
  successIndicators: string[];
  status: "draft" | "active" | "suspended" | "retired";
  activatedAt?: string;
}

export interface PracticeAdoption {
  id: string;
  practiceId: string;
  organizationId: string;
  territoryId: string;
  adoptedByActorId: string;
  adoptedAt: string;
  status: "planned" | "in_progress" | "applied" | "abandoned";
  evidenceIds: string[];
}

export interface LearningOutcome {
  id: string;
  adoptionId: string;
  measuredAt: string;
  indicatorValues: Record<string, number>;
  valueCreatedXof: number;
  avoidedLossKg: number;
  incidentReductionPercent: number;
  confidenceScore: number;
  evidenceIds: string[];
}

export interface SectorLearningSnapshot {
  sources: KnowledgeSource[];
  lessons: SectorLesson[];
  practices: RecommendedPractice[];
  adoptions: PracticeAdoption[];
  outcomes: LearningOutcome[];
}

export type SectorLearningCommand =
  | { type: "register_source"; source: KnowledgeSource }
  | { type: "create_lesson"; lesson: SectorLesson }
  | { type: "review_lesson"; lessonId: string; actorId: string }
  | { type: "publish_lesson"; lessonId: string; at: string }
  | { type: "create_practice"; practice: RecommendedPractice }
  | { type: "activate_practice"; practiceId: string; at: string }
  | { type: "adopt_practice"; adoption: PracticeAdoption }
  | { type: "record_outcome"; outcome: LearningOutcome };

export class SectorLearningRuntime {
  private readonly state: SectorLearningSnapshot = { sources: [], lessons: [], practices: [], adoptions: [], outcomes: [] };
  private readonly processedCommands = new Map<string, unknown>();

  execute(input: { commandId: string; actorId: string; activeTerritoryId: string; command: SectorLearningCommand }) {
    const previous = this.processedCommands.get(input.commandId);
    if (previous) return structuredClone(previous);
    const command = input.command;
    let result: unknown;

    switch (command.type) {
      case "register_source":
        this.assertTerritory(command.source.territoryId, input.activeTerritoryId);
        this.ensureUnique(command.source.id, this.state.sources, "source");
        if (command.source.evidenceIds.length === 0) throw new Error("Une source de connaissance doit posséder au moins une preuve.");
        this.assertScore(command.source.confidenceScore, "confiance de la source");
        this.state.sources.push(structuredClone(command.source));
        result = command.source;
        break;
      case "create_lesson":
        this.ensureUnique(command.lesson.id, this.state.lessons, "enseignement");
        if (command.lesson.sourceIds.length === 0) throw new Error("Un enseignement doit être relié à au moins une source.");
        command.lesson.sourceIds.forEach((id) => this.requireSource(id));
        this.assertScore(command.lesson.confidenceScore, "confiance de l'enseignement");
        this.state.lessons.push(structuredClone(command.lesson));
        result = command.lesson;
        break;
      case "review_lesson": {
        const lesson = this.requireLesson(command.lessonId);
        if (lesson.status !== "draft") throw new Error("Seul un enseignement en brouillon peut être revu.");
        lesson.status = "reviewed";
        lesson.reviewedByActorId = command.actorId;
        result = lesson;
        break;
      }
      case "publish_lesson": {
        const lesson = this.requireLesson(command.lessonId);
        if (lesson.status !== "reviewed") throw new Error("Un enseignement doit être revu avant publication.");
        lesson.status = "published";
        lesson.publishedAt = command.at;
        result = lesson;
        break;
      }
      case "create_practice":
        this.ensureUnique(command.practice.id, this.state.practices, "pratique");
        if (this.requireLesson(command.practice.lessonId).status !== "published") throw new Error("Une pratique ne peut provenir que d'un enseignement publié.");
        if (command.practice.steps.length === 0 || command.practice.successIndicators.length === 0) throw new Error("La pratique doit décrire des étapes et des indicateurs de succès.");
        this.state.practices.push(structuredClone(command.practice));
        result = command.practice;
        break;
      case "activate_practice": {
        const practice = this.requirePractice(command.practiceId);
        if (practice.status !== "draft") throw new Error("Seule une pratique en brouillon peut être activée.");
        practice.status = "active";
        practice.activatedAt = command.at;
        result = practice;
        break;
      }
      case "adopt_practice":
        this.assertTerritory(command.adoption.territoryId, input.activeTerritoryId);
        this.ensureUnique(command.adoption.id, this.state.adoptions, "adoption");
        if (this.requirePractice(command.adoption.practiceId).status !== "active") throw new Error("La pratique doit être active avant adoption.");
        if (command.adoption.evidenceIds.length === 0) throw new Error("Une preuve d'adoption est obligatoire.");
        this.state.adoptions.push(structuredClone(command.adoption));
        result = command.adoption;
        break;
      case "record_outcome":
        this.ensureUnique(command.outcome.id, this.state.outcomes, "résultat");
        if (this.requireAdoption(command.outcome.adoptionId).status !== "applied") throw new Error("La pratique doit être appliquée avant mesure du résultat.");
        if (command.outcome.evidenceIds.length === 0) throw new Error("Une preuve de résultat est obligatoire.");
        this.assertScore(command.outcome.confidenceScore, "confiance du résultat");
        if (command.outcome.valueCreatedXof < 0 || command.outcome.avoidedLossKg < 0) throw new Error("Les résultats de valeur ne peuvent pas être négatifs.");
        this.state.outcomes.push(structuredClone(command.outcome));
        result = command.outcome;
        break;
      default:
        throw new Error("Commande Knowledge inconnue.");
    }

    const response = { result: structuredClone(result), snapshot: this.snapshot() };
    this.processedCommands.set(input.commandId, structuredClone(response));
    return response;
  }

  snapshot() {
    return structuredClone({
      ...this.state,
      metrics: {
        verifiedSourceCount: this.state.sources.filter((item) => item.confidenceScore >= 70).length,
        publishedLessonCount: this.state.lessons.filter((item) => item.status === "published").length,
        activePracticeCount: this.state.practices.filter((item) => item.status === "active").length,
        appliedAdoptionCount: this.state.adoptions.filter((item) => item.status === "applied").length,
        measuredOutcomeCount: this.state.outcomes.length,
        valueCreatedXof: this.state.outcomes.reduce((sum, item) => sum + item.valueCreatedXof, 0),
        avoidedLossKg: this.state.outcomes.reduce((sum, item) => sum + item.avoidedLossKg, 0),
        averageIncidentReductionPercent: this.state.outcomes.length
          ? this.state.outcomes.reduce((sum, item) => sum + item.incidentReductionPercent, 0) / this.state.outcomes.length
          : 0,
      },
    });
  }

  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) {
    if (values.some((item) => item.id === id)) throw new Error(`${label} déjà existant : ${id}.`);
  }

  private assertScore(value: number, label: string) {
    if (value < 0 || value > 100) throw new Error(`Le score de ${label} doit être compris entre 0 et 100.`);
  }

  private assertTerritory(value: string, active: string) {
    if (active !== "territory-national" && value !== active) throw new Error("Le territoire actif ne permet pas cette opération.");
  }

  private requireSource(id: string) {
    const value = this.state.sources.find((item) => item.id === id);
    if (!value) throw new Error(`Source introuvable : ${id}.`);
    return value;
  }

  private requireLesson(id: string) {
    const value = this.state.lessons.find((item) => item.id === id);
    if (!value) throw new Error(`Enseignement introuvable : ${id}.`);
    return value;
  }

  private requirePractice(id: string) {
    const value = this.state.practices.find((item) => item.id === id);
    if (!value) throw new Error(`Pratique introuvable : ${id}.`);
    return value;
  }

  private requireAdoption(id: string) {
    const value = this.state.adoptions.find((item) => item.id === id);
    if (!value) throw new Error(`Adoption introuvable : ${id}.`);
    return value;
  }
}

const globalRuntime = globalThis as typeof globalThis & { __mbSectorLearningRuntime?: SectorLearningRuntime };

export function getSectorLearningRuntime() {
  globalRuntime.__mbSectorLearningRuntime ??= new SectorLearningRuntime();
  return globalRuntime.__mbSectorLearningRuntime;
}
