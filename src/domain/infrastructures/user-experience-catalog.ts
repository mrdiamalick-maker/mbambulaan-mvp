import type { EntityId, ISODateTime } from "./types";
import type { MbambulaanProductCode } from "./mbambulaan-product-system";
import type { MvpActorKind } from "./mvp-completeness-model";
import type { MvpSurfaceKind } from "./mvp-blueprint";

export type ExperiencePriority = "must_have" | "should_have" | "later";
export type ExperienceStatus = "draft" | "ready" | "blocked" | "validated";

export interface ExperienceOutcome {
  id: EntityId;
  actorKind: MvpActorKind;
  statement: string;
  measurableBy: string[];
  valueType: "time_saved" | "income" | "visibility" | "trust" | "access" | "compliance" | "coordination";
}

export interface ExperienceMoment {
  id: EntityId;
  code: string;
  name: string;
  actorKind: MvpActorKind;
  productCode: MbambulaanProductCode;
  surface: MvpSurfaceKind;
  priority: ExperiencePriority;
  trigger: string;
  userGoal: string;
  userActions: string[];
  systemResponses: string[];
  visibleData: string[];
  emittedEvents: string[];
  workflowCodes: string[];
  capabilityCodes: string[];
  successCriteria: string[];
  failureRecovery: string[];
  offlineSupport: boolean;
  assistedMode: boolean;
  status: ExperienceStatus;
}

export interface ActorExperienceCatalogEntry {
  id: EntityId;
  actorKind: MvpActorKind;
  productCodes: MbambulaanProductCode[];
  promise: string;
  onboardingMoments: EntityId[];
  dailyMoments: EntityId[];
  coordinationMoments: EntityId[];
  exceptionMoments: EntityId[];
  decisionMoments: EntityId[];
  outcomeIds: EntityId[];
  ministryDemonstrationValue: string[];
  atlasPremiumValue: string[];
  completeForMvp: boolean;
}

export interface CrossActorExperienceFlow {
  id: EntityId;
  code: string;
  name: string;
  actorKinds: MvpActorKind[];
  orderedMomentIds: EntityId[];
  expectedSharedOutputs: string[];
  governmentOutputs: string[];
  atlasOutputs: string[];
  successCriteria: string[];
  mandatoryForMvp: boolean;
  status: ExperienceStatus;
}

export interface ExperienceCatalogAssessment {
  id: EntityId;
  actorKind?: MvpActorKind;
  flowId?: EntityId;
  ready: boolean;
  score: number;
  blockers: string[];
  warnings: string[];
  assessedAt: ISODateTime;
}

export interface UserExperienceCatalogData {
  outcomes: ExperienceOutcome[];
  moments: ExperienceMoment[];
  actorEntries: ActorExperienceCatalogEntry[];
  flows: CrossActorExperienceFlow[];
  assessments: ExperienceCatalogAssessment[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class UserExperienceCatalog {
  private state: UserExperienceCatalogData = {
    outcomes: [],
    moments: [],
    actorEntries: [],
    flows: [],
    assessments: [],
  };

  registerOutcome(outcome: ExperienceOutcome) {
    this.ensureUnique(this.state.outcomes, outcome.id, "outcome d'expérience");
    this.state.outcomes.push(clone(outcome));
    return clone(outcome);
  }

  registerMoment(moment: ExperienceMoment) {
    this.ensureUnique(this.state.moments, moment.id, "moment d'expérience");
    if (moment.userActions.length === 0) {
      throw new Error("Un moment d'expérience doit contenir au moins une action utilisateur.");
    }
    if (moment.systemResponses.length === 0) {
      throw new Error("Un moment d'expérience doit préciser les réponses du système.");
    }
    if (moment.capabilityCodes.length === 0) {
      throw new Error("Un moment d'expérience doit être relié à au moins une capability.");
    }
    this.state.moments.push(clone(moment));
    return clone(moment);
  }

  registerActorEntry(entry: ActorExperienceCatalogEntry) {
    this.ensureUnique(this.state.actorEntries, entry.id, "entrée de catalogue acteur");
    this.assertActorEntryReferences(entry);
    this.state.actorEntries.push(clone(entry));
    return clone(entry);
  }

  registerFlow(flow: CrossActorExperienceFlow) {
    this.ensureUnique(this.state.flows, flow.id, "flux d'expérience transverse");
    if (flow.actorKinds.length < 2) {
      throw new Error("Un flux transverse doit relier au moins deux types d'acteurs.");
    }
    const missingMoments = flow.orderedMomentIds.filter(
      (id) => !this.state.moments.some((item) => item.id === id),
    );
    if (missingMoments.length > 0) {
      throw new Error(`Moments introuvables : ${missingMoments.join(", ")}.`);
    }
    this.state.flows.push(clone(flow));
    return clone(flow);
  }

  assessActor(actorKind: MvpActorKind, assessedAt: ISODateTime): ExperienceCatalogAssessment {
    const entry = this.state.actorEntries.find((item) => item.actorKind === actorKind);
    const blockers: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    if (!entry) {
      const assessment: ExperienceCatalogAssessment = {
        id: `ux-assessment-${actorKind}-${assessedAt}`,
        actorKind,
        ready: false,
        score: 0,
        blockers: ["Aucune entrée de catalogue n'est définie pour cet acteur."],
        warnings,
        assessedAt,
      };
      this.state.assessments.push(clone(assessment));
      return clone(assessment);
    }

    const allMomentIds = [
      ...entry.onboardingMoments,
      ...entry.dailyMoments,
      ...entry.coordinationMoments,
      ...entry.exceptionMoments,
      ...entry.decisionMoments,
    ];
    const moments = this.state.moments.filter((item) => allMomentIds.includes(item.id));
    const mustHave = moments.filter((item) => item.priority === "must_have");

    if (entry.onboardingMoments.length === 0) {
      blockers.push("Parcours d'onboarding absent.");
      score -= 20;
    }
    if (entry.dailyMoments.length === 0) {
      blockers.push("Usage quotidien absent.");
      score -= 25;
    }
    if (entry.coordinationMoments.length === 0) {
      blockers.push("Aucun moment de coordination avec l'écosystème.");
      score -= 20;
    }
    if (entry.outcomeIds.length === 0) {
      blockers.push("Aucun outcome utilisateur défini.");
      score -= 15;
    }
    if (mustHave.some((item) => item.status !== "ready" && item.status !== "validated")) {
      blockers.push("Certains moments indispensables ne sont pas prêts.");
      score -= 20;
    }
    if (entry.exceptionMoments.length === 0) {
      warnings.push("Aucun cas d'exception ou de récupération n'est défini.");
      score -= 5;
    }
    if (entry.ministryDemonstrationValue.length === 0) {
      warnings.push("La valeur démontrable au ministère n'est pas explicitée.");
      score -= 5;
    }

    score = Math.max(0, score);
    const assessment: ExperienceCatalogAssessment = {
      id: `ux-assessment-${actorKind}-${assessedAt}`,
      actorKind,
      ready: blockers.length === 0 && entry.completeForMvp && score >= 75,
      score,
      blockers,
      warnings,
      assessedAt,
    };
    this.state.assessments.push(clone(assessment));
    return clone(assessment);
  }

  assessFlow(flowId: EntityId, assessedAt: ISODateTime): ExperienceCatalogAssessment {
    const flow = this.state.flows.find((item) => item.id === flowId);
    if (!flow) throw new Error(`Le flux ${flowId} est introuvable.`);

    const blockers: string[] = [];
    const warnings: string[] = [];
    let score = 100;
    const moments = flow.orderedMomentIds.map((id) => this.state.moments.find((item) => item.id === id));

    if (moments.some((item) => !item)) {
      blockers.push("Le flux contient des moments introuvables.");
      score -= 40;
    }
    if (moments.some((item) => item && item.status !== "ready" && item.status !== "validated")) {
      blockers.push("Le flux contient des moments non prêts.");
      score -= 30;
    }
    if (flow.expectedSharedOutputs.length === 0) {
      blockers.push("Aucun résultat partagé n'est défini.");
      score -= 15;
    }
    if (flow.governmentOutputs.length === 0) {
      warnings.push("Aucune sortie Government n'est définie.");
      score -= 5;
    }
    if (flow.atlasOutputs.length === 0) {
      warnings.push("Aucune sortie Atlas Premium n'est définie.");
      score -= 5;
    }

    score = Math.max(0, score);
    const assessment: ExperienceCatalogAssessment = {
      id: `ux-flow-assessment-${flowId}-${assessedAt}`,
      flowId,
      ready: blockers.length === 0 && flow.status === "ready" && score >= 75,
      score,
      blockers,
      warnings,
      assessedAt,
    };
    this.state.assessments.push(clone(assessment));
    return clone(assessment);
  }

  getActorCatalog(actorKind: MvpActorKind) {
    const entry = this.state.actorEntries.find((item) => item.actorKind === actorKind);
    if (!entry) return undefined;
    const ids = [
      ...entry.onboardingMoments,
      ...entry.dailyMoments,
      ...entry.coordinationMoments,
      ...entry.exceptionMoments,
      ...entry.decisionMoments,
    ];
    return {
      ...clone(entry),
      moments: clone(this.state.moments.filter((item) => ids.includes(item.id))),
      outcomes: clone(this.state.outcomes.filter((item) => entry.outcomeIds.includes(item.id))),
    };
  }

  snapshot(): UserExperienceCatalogData {
    return clone(this.state);
  }

  private assertActorEntryReferences(entry: ActorExperienceCatalogEntry) {
    const momentIds = [
      ...entry.onboardingMoments,
      ...entry.dailyMoments,
      ...entry.coordinationMoments,
      ...entry.exceptionMoments,
      ...entry.decisionMoments,
    ];
    const missingMoments = momentIds.filter(
      (id) => !this.state.moments.some((item) => item.id === id && item.actorKind === entry.actorKind),
    );
    const missingOutcomes = entry.outcomeIds.filter(
      (id) => !this.state.outcomes.some((item) => item.id === id && item.actorKind === entry.actorKind),
    );
    const missing = [...missingMoments, ...missingOutcomes];
    if (missing.length > 0) {
      throw new Error(`Références de catalogue acteur introuvables : ${missing.join(", ")}.`);
    }
  }

  private ensureUnique<T extends { id: EntityId }>(items: T[], id: EntityId, label: string) {
    if (items.some((item) => item.id === id)) {
      throw new Error(`Le ${label} ${id} existe déjà.`);
    }
  }
}
