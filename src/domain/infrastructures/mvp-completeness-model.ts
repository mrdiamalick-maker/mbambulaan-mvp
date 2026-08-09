import type { EntityId, ISODateTime } from "./types";
import type { MbambulaanProductCode } from "./mbambulaan-product-system";

export type MvpActorKind =
  | "fisher"
  | "cooperative"
  | "landing_site"
  | "buyer"
  | "processor"
  | "logistics"
  | "municipality"
  | "public_agency"
  | "ministry"
  | "ngo"
  | "development_partner"
  | "financial_institution"
  | "insurer";

export interface MvpActorProductScope {
  id: EntityId;
  actorKind: MvpActorKind;
  productCodes: MbambulaanProductCode[];
  mustHaveJobs: string[];
  mustHaveCapabilities: string[];
  mustHaveOutputs: string[];
  demonstrationScenarioIds: EntityId[];
  iterationBacklog: string[];
  status: "draft" | "complete" | "incomplete";
}

export interface MvpDemonstrationScenario {
  id: EntityId;
  code: string;
  name: string;
  participatingActorKinds: MvpActorKind[];
  entryCondition: string;
  steps: string[];
  expectedOutputs: string[];
  ministryVisible: boolean;
  atlasPremiumVisible: boolean;
  status: "draft" | "ready" | "blocked";
}

export interface MvpCompletenessCriterion {
  id: EntityId;
  code:
    | "actor_coverage"
    | "journey_coverage"
    | "end_to_end_transaction"
    | "traceability"
    | "coordination"
    | "decision_visibility"
    | "institutional_value"
    | "commercial_test"
    | "data_quality"
    | "operational_resilience"
    | "role_based_access"
    | "auditability";
  name: string;
  description: string;
  weight: number;
  blocking: boolean;
}

export interface MvpCriterionAssessment {
  id: EntityId;
  mvpId: EntityId;
  criterionId: EntityId;
  score: number;
  evidence: string[];
  blockers: string[];
  assessedAt: ISODateTime;
}

export interface MvpReleaseDefinition {
  id: EntityId;
  name: string;
  actorScopeIds: EntityId[];
  scenarioIds: EntityId[];
  criterionIds: EntityId[];
  mandatoryActorKinds: MvpActorKind[];
  mandatoryScenarioCodes: string[];
  minimumWeightedScore: number;
  status: "draft" | "candidate" | "ready" | "released" | "rejected";
  createdAt: ISODateTime;
}

export interface MvpReadinessResult {
  mvpId: EntityId;
  ready: boolean;
  weightedScore: number;
  missingActorKinds: MvpActorKind[];
  missingScenarioCodes: string[];
  incompleteActorScopes: EntityId[];
  blockingCriteria: string[];
  warnings: string[];
  assessedAt: ISODateTime;
}

export interface MvpCompletenessData {
  actorScopes: MvpActorProductScope[];
  scenarios: MvpDemonstrationScenario[];
  criteria: MvpCompletenessCriterion[];
  assessments: MvpCriterionAssessment[];
  releases: MvpReleaseDefinition[];
  readinessResults: MvpReadinessResult[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MvpCompletenessModel {
  private state: MvpCompletenessData = {
    actorScopes: [],
    scenarios: [],
    criteria: [],
    assessments: [],
    releases: [],
    readinessResults: [],
  };

  registerActorScope(scope: MvpActorProductScope) {
    this.ensureUnique(this.state.actorScopes, scope.id, "périmètre acteur MVP");
    if (scope.mustHaveJobs.length === 0) {
      throw new Error("Chaque acteur MVP doit avoir au moins un job-to-be-done indispensable.");
    }
    if (scope.mustHaveCapabilities.length === 0) {
      throw new Error("Chaque acteur MVP doit avoir au moins une capability indispensable.");
    }
    this.state.actorScopes.push(clone(scope));
    return clone(scope);
  }

  registerScenario(scenario: MvpDemonstrationScenario) {
    this.ensureUnique(this.state.scenarios, scenario.id, "scénario de démonstration MVP");
    if (scenario.participatingActorKinds.length < 2) {
      throw new Error("Un scénario de démonstration doit coordonner au moins deux types d'acteurs.");
    }
    if (scenario.steps.length === 0 || scenario.expectedOutputs.length === 0) {
      throw new Error("Un scénario de démonstration doit définir ses étapes et ses résultats attendus.");
    }
    this.state.scenarios.push(clone(scenario));
    return clone(scenario);
  }

  registerCriterion(criterion: MvpCompletenessCriterion) {
    this.ensureUnique(this.state.criteria, criterion.id, "critère de complétude MVP");
    if (criterion.weight <= 0) throw new Error("Le poids d'un critère doit être positif.");
    this.state.criteria.push(clone(criterion));
    return clone(criterion);
  }

  createRelease(release: MvpReleaseDefinition) {
    this.ensureUnique(this.state.releases, release.id, "release MVP");
    this.assertReleaseReferences(release);
    this.state.releases.push(clone(release));
    return clone(release);
  }

  assessCriterion(assessment: MvpCriterionAssessment) {
    this.ensureUnique(this.state.assessments, assessment.id, "assessment MVP");
    if (assessment.score < 0 || assessment.score > 100) {
      throw new Error("Le score d'un critère doit être compris entre 0 et 100.");
    }
    if (!this.state.releases.some((item) => item.id === assessment.mvpId)) {
      throw new Error(`La release MVP ${assessment.mvpId} est introuvable.`);
    }
    if (!this.state.criteria.some((item) => item.id === assessment.criterionId)) {
      throw new Error(`Le critère ${assessment.criterionId} est introuvable.`);
    }
    this.state.assessments.push(clone(assessment));
    return clone(assessment);
  }

  evaluateRelease(mvpId: EntityId, assessedAt: ISODateTime): MvpReadinessResult {
    const release = this.state.releases.find((item) => item.id === mvpId);
    if (!release) throw new Error(`La release MVP ${mvpId} est introuvable.`);

    const actorScopes = this.state.actorScopes.filter((item) =>
      release.actorScopeIds.includes(item.id),
    );
    const scenarios = this.state.scenarios.filter((item) =>
      release.scenarioIds.includes(item.id),
    );
    const criteria = this.state.criteria.filter((item) =>
      release.criterionIds.includes(item.id),
    );
    const assessments = this.state.assessments.filter((item) => item.mvpId === mvpId);

    const missingActorKinds = release.mandatoryActorKinds.filter(
      (actorKind) => !actorScopes.some((scope) => scope.actorKind === actorKind),
    );
    const missingScenarioCodes = release.mandatoryScenarioCodes.filter(
      (code) => !scenarios.some((scenario) => scenario.code === code && scenario.status === "ready"),
    );
    const incompleteActorScopes = actorScopes
      .filter((scope) => scope.status !== "complete")
      .map((scope) => scope.id);

    let totalWeight = 0;
    let weightedTotal = 0;
    const blockingCriteria: string[] = [];
    const warnings: string[] = [];

    for (const criterion of criteria) {
      totalWeight += criterion.weight;
      const assessment = [...assessments]
        .filter((item) => item.criterionId === criterion.id)
        .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))[0];

      if (!assessment) {
        if (criterion.blocking) blockingCriteria.push(`${criterion.name} non évalué`);
        else warnings.push(`${criterion.name} non évalué`);
        continue;
      }

      weightedTotal += assessment.score * criterion.weight;
      if (criterion.blocking && (assessment.score < 70 || assessment.blockers.length > 0)) {
        blockingCriteria.push(criterion.name);
      }
      if (!criterion.blocking && assessment.score < 60) {
        warnings.push(`${criterion.name} reste faible (${assessment.score}/100).`);
      }
    }

    const weightedScore = totalWeight === 0 ? 0 : Math.round(weightedTotal / totalWeight);
    const ready =
      missingActorKinds.length === 0 &&
      missingScenarioCodes.length === 0 &&
      incompleteActorScopes.length === 0 &&
      blockingCriteria.length === 0 &&
      weightedScore >= release.minimumWeightedScore;

    const result: MvpReadinessResult = {
      mvpId,
      ready,
      weightedScore,
      missingActorKinds,
      missingScenarioCodes,
      incompleteActorScopes,
      blockingCriteria,
      warnings,
      assessedAt,
    };

    this.state.readinessResults.push(clone(result));
    release.status = ready ? "ready" : "candidate";
    return clone(result);
  }

  getActorDemonstrationCoverage(actorKind: MvpActorKind) {
    const scope = this.state.actorScopes.find((item) => item.actorKind === actorKind);
    if (!scope) return { actorKind, covered: false, scenarios: [] as string[] };

    const scenarios = this.state.scenarios
      .filter((scenario) =>
        scope.demonstrationScenarioIds.includes(scenario.id) &&
        scenario.participatingActorKinds.includes(actorKind),
      )
      .map((scenario) => scenario.code);

    return {
      actorKind,
      covered: scope.status === "complete" && scenarios.length > 0,
      scenarios,
    };
  }

  snapshot(): MvpCompletenessData {
    return clone(this.state);
  }

  private assertReleaseReferences(release: MvpReleaseDefinition) {
    const missingActorScopes = release.actorScopeIds.filter(
      (id) => !this.state.actorScopes.some((item) => item.id === id),
    );
    const missingScenarios = release.scenarioIds.filter(
      (id) => !this.state.scenarios.some((item) => item.id === id),
    );
    const missingCriteria = release.criterionIds.filter(
      (id) => !this.state.criteria.some((item) => item.id === id),
    );
    const missing = [...missingActorScopes, ...missingScenarios, ...missingCriteria];
    if (missing.length > 0) {
      throw new Error(`Références MVP introuvables : ${missing.join(", ")}.`);
    }
  }

  private ensureUnique<T extends { id: EntityId }>(items: T[], id: EntityId, label: string) {
    if (items.some((item) => item.id === id)) {
      throw new Error(`Le ${label} ${id} existe déjà.`);
    }
  }
}
