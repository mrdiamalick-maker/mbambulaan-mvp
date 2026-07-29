import type { EntityId, ISODateTime } from "./types";
import type { MbambulaanProductCode } from "./mbambulaan-product-system";
import type { MvpActorKind } from "./mvp-completeness-model";

export type MvpSurfaceKind =
  | "mobile"
  | "web"
  | "assisted"
  | "api"
  | "command_center"
  | "atlas_workspace";

export interface MvpScreenDefinition {
  id: EntityId;
  code: string;
  name: string;
  actorKind: MvpActorKind;
  productCode: MbambulaanProductCode;
  surface: MvpSurfaceKind;
  primaryJob: string;
  visibleDataKeys: string[];
  availableActionCodes: string[];
  emittedEventTypes: string[];
  status: "draft" | "ready" | "blocked";
}

export interface MvpActionDefinition {
  id: EntityId;
  code: string;
  name: string;
  actorKinds: MvpActorKind[];
  capabilityCodes: string[];
  workflowCodes: string[];
  requiredInputKeys: string[];
  producedOutputKeys: string[];
  emittedEventTypes: string[];
  successMessage: string;
  failureMessages: string[];
  auditable: boolean;
  status: "draft" | "ready" | "blocked";
}

export interface MvpActorExperience {
  id: EntityId;
  actorKind: MvpActorKind;
  productCodes: MbambulaanProductCode[];
  screenIds: EntityId[];
  actionIds: EntityId[];
  onboardingSteps: string[];
  dailyJobs: string[];
  coordinationPartners: MvpActorKind[];
  visibleOutcomes: string[];
  ministryEvidence: string[];
  atlasPremiumSignals: string[];
  demoReady: boolean;
}

export interface MvpEndToEndJourney {
  id: EntityId;
  code:
    | "sea_to_landing"
    | "landing_to_lot"
    | "lot_to_commitment"
    | "service_need_to_execution"
    | "incident_to_resolution"
    | "pilot_to_ministry_briefing";
  name: string;
  actorKinds: MvpActorKind[];
  stepActionCodes: string[];
  expectedOutputs: string[];
  governmentOutputs: string[];
  atlasOutputs: string[];
  mandatoryForDemo: boolean;
  status: "draft" | "ready" | "blocked";
}

export interface MvpDemonstrationPlan {
  id: EntityId;
  name: string;
  actorExperienceIds: EntityId[];
  journeyIds: EntityId[];
  sequence: Array<{
    order: number;
    actorKind: MvpActorKind;
    screenCode: string;
    actionCode?: string;
    narration: string;
  }>;
  ministryMoments: string[];
  atlasPremiumMoments: string[];
  successCriteria: string[];
  durationMinutes: number;
  status: "draft" | "ready" | "blocked";
  createdAt: ISODateTime;
}

export interface MvpBlueprintData {
  screens: MvpScreenDefinition[];
  actions: MvpActionDefinition[];
  actorExperiences: MvpActorExperience[];
  journeys: MvpEndToEndJourney[];
  demonstrationPlans: MvpDemonstrationPlan[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class MvpBlueprint {
  private state: MvpBlueprintData = {
    screens: [],
    actions: [],
    actorExperiences: [],
    journeys: [],
    demonstrationPlans: [],
  };

  registerScreen(screen: MvpScreenDefinition) {
    this.ensureUnique(this.state.screens, screen.id, "écran MVP");
    if (screen.availableActionCodes.length === 0 && screen.primaryJob.trim().length === 0) {
      throw new Error("Un écran MVP doit servir un job clair ou permettre une action.");
    }
    this.state.screens.push(clone(screen));
    return clone(screen);
  }

  registerAction(action: MvpActionDefinition) {
    this.ensureUnique(this.state.actions, action.id, "action MVP");
    if (action.capabilityCodes.length === 0) {
      throw new Error("Une action MVP doit être reliée à au moins une capability.");
    }
    if (action.emittedEventTypes.length === 0) {
      throw new Error("Une action MVP doit émettre au moins un événement métier.");
    }
    this.state.actions.push(clone(action));
    return clone(action);
  }

  registerActorExperience(experience: MvpActorExperience) {
    this.ensureUnique(this.state.actorExperiences, experience.id, "expérience acteur MVP");
    this.assertActorExperienceReferences(experience);
    this.state.actorExperiences.push(clone(experience));
    return clone(experience);
  }

  registerJourney(journey: MvpEndToEndJourney) {
    this.ensureUnique(this.state.journeys, journey.id, "parcours MVP");
    const missingActions = journey.stepActionCodes.filter(
      (code) => !this.state.actions.some((item) => item.code === code && item.status === "ready"),
    );
    if (missingActions.length > 0) {
      throw new Error(`Actions prêtes introuvables pour le parcours : ${missingActions.join(", ")}.`);
    }
    this.state.journeys.push(clone(journey));
    return clone(journey);
  }

  createDemonstrationPlan(plan: MvpDemonstrationPlan) {
    this.ensureUnique(this.state.demonstrationPlans, plan.id, "plan de démonstration MVP");
    this.assertDemonstrationReferences(plan);

    const coveredActors = new Set(
      plan.actorExperienceIds
        .map((id) => this.state.actorExperiences.find((item) => item.id === id))
        .filter((item): item is MvpActorExperience => Boolean(item))
        .map((item) => item.actorKind),
    );

    const missingInSequence = [...coveredActors].filter(
      (actorKind) => !plan.sequence.some((step) => step.actorKind === actorKind),
    );
    if (missingInSequence.length > 0) {
      throw new Error(`Le plan de démonstration ne montre pas : ${missingInSequence.join(", ")}.`);
    }

    const mandatoryJourneys = this.state.journeys.filter((item) => item.mandatoryForDemo);
    const missingMandatoryJourneys = mandatoryJourneys.filter(
      (journey) => !plan.journeyIds.includes(journey.id),
    );
    if (missingMandatoryJourneys.length > 0) {
      throw new Error(
        `Parcours obligatoires manquants : ${missingMandatoryJourneys.map((item) => item.code).join(", ")}.`,
      );
    }

    this.state.demonstrationPlans.push(clone(plan));
    return clone(plan);
  }

  assessActorDemoReadiness(actorKind: MvpActorKind) {
    const experience = this.state.actorExperiences.find((item) => item.actorKind === actorKind);
    if (!experience) {
      return {
        actorKind,
        ready: false,
        blockers: ["Aucune expérience produit n'est définie pour cet acteur."],
      };
    }

    const blockers: string[] = [];
    const screens = this.state.screens.filter((item) => experience.screenIds.includes(item.id));
    const actions = this.state.actions.filter((item) => experience.actionIds.includes(item.id));

    if (screens.length === 0) blockers.push("Aucun écran démontrable.");
    if (actions.length === 0) blockers.push("Aucune action démontrable.");
    if (screens.some((item) => item.status !== "ready")) blockers.push("Certains écrans ne sont pas prêts.");
    if (actions.some((item) => item.status !== "ready")) blockers.push("Certaines actions ne sont pas prêtes.");
    if (experience.onboardingSteps.length === 0) blockers.push("Onboarding non défini.");
    if (experience.dailyJobs.length === 0) blockers.push("Aucun usage quotidien démontré.");
    if (experience.visibleOutcomes.length === 0) blockers.push("Aucune valeur visible pour l'acteur.");

    return {
      actorKind,
      ready: blockers.length === 0 && experience.demoReady,
      blockers,
    };
  }

  assessDemonstrationPlan(planId: EntityId) {
    const plan = this.state.demonstrationPlans.find((item) => item.id === planId);
    if (!plan) throw new Error(`Le plan de démonstration ${planId} est introuvable.`);

    const blockers: string[] = [];
    for (const experienceId of plan.actorExperienceIds) {
      const experience = this.state.actorExperiences.find((item) => item.id === experienceId);
      if (!experience) {
        blockers.push(`Expérience ${experienceId} introuvable.`);
        continue;
      }
      const actorAssessment = this.assessActorDemoReadiness(experience.actorKind);
      blockers.push(...actorAssessment.blockers.map((item) => `${experience.actorKind}: ${item}`));
    }

    const journeys = this.state.journeys.filter((item) => plan.journeyIds.includes(item.id));
    const blockedJourneys = journeys.filter((item) => item.status !== "ready");
    if (blockedJourneys.length > 0) {
      blockers.push(
        `Parcours non prêts : ${blockedJourneys.map((item) => item.code).join(", ")}.`,
      );
    }
    if (plan.ministryMoments.length === 0) {
      blockers.push("La démonstration ne contient aucun moment de valeur explicite pour le ministère.");
    }
    if (plan.atlasPremiumMoments.length === 0) {
      blockers.push("La valeur premium d'Atlas n'est pas démontrée.");
    }
    if (plan.durationMinutes > 45) {
      blockers.push("La démonstration doit rester inférieure ou égale à 45 minutes.");
    }

    return {
      planId,
      ready: blockers.length === 0 && plan.status === "ready",
      blockers,
      durationMinutes: plan.durationMinutes,
    };
  }

  snapshot(): MvpBlueprintData {
    return clone(this.state);
  }

  private assertActorExperienceReferences(experience: MvpActorExperience) {
    const missingScreens = experience.screenIds.filter(
      (id) => !this.state.screens.some((item) => item.id === id && item.actorKind === experience.actorKind),
    );
    const missingActions = experience.actionIds.filter(
      (id) => !this.state.actions.some((item) => item.id === id && item.actorKinds.includes(experience.actorKind)),
    );
    const missing = [...missingScreens, ...missingActions];
    if (missing.length > 0) {
      throw new Error(`Références d'expérience acteur introuvables : ${missing.join(", ")}.`);
    }
  }

  private assertDemonstrationReferences(plan: MvpDemonstrationPlan) {
    const missingExperiences = plan.actorExperienceIds.filter(
      (id) => !this.state.actorExperiences.some((item) => item.id === id),
    );
    const missingJourneys = plan.journeyIds.filter(
      (id) => !this.state.journeys.some((item) => item.id === id),
    );
    const missing = [...missingExperiences, ...missingJourneys];
    if (missing.length > 0) {
      throw new Error(`Références de démonstration introuvables : ${missing.join(", ")}.`);
    }
  }

  private ensureUnique<T extends { id: EntityId }>(items: T[], id: EntityId, label: string) {
    if (items.some((item) => item.id === id)) {
      throw new Error(`Le ${label} ${id} existe déjà.`);
    }
  }
}
