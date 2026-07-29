import type { EntityId, ISODateTime } from "./types";
import type { MbambulaanProductCode } from "./mbambulaan-product-system";

export type PilotStakeholderKind =
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
  | "development_partner";

export type PilotObjective =
  | "prove_operational_value"
  | "prove_coordination_value"
  | "prove_data_reliability"
  | "prove_ministry_visibility"
  | "prove_payment_willingness"
  | "prove_repeat_usage";

export interface PilotTerritory {
  id: EntityId;
  name: string;
  landingSiteIds: EntityId[];
  organizationIds: EntityId[];
  selectionRationale: string[];
  status: "proposed" | "validated" | "active" | "closed";
}

export interface PilotStakeholder {
  id: EntityId;
  kind: PilotStakeholderKind;
  actorId?: EntityId;
  organizationId?: EntityId;
  territoryId: EntityId;
  roleCodes: string[];
  onboardingStatus: "identified" | "invited" | "trained" | "active" | "inactive";
  ministryVisible: boolean;
}

export interface PilotJourney {
  id: EntityId;
  code:
    | "expected_return_to_landing"
    | "landing_to_weighing"
    | "weighing_to_lot"
    | "lot_to_buyer_commitment"
    | "service_need_to_execution"
    | "incident_to_resolution";
  name: string;
  productCodes: MbambulaanProductCode[];
  capabilityCodes: string[];
  requiredStakeholderKinds: PilotStakeholderKind[];
  successEventTypes: string[];
  status: "draft" | "active" | "retired";
}

export interface PilotKpi {
  id: EntityId;
  code:
    | "active_users"
    | "weekly_active_organizations"
    | "expected_returns_registered"
    | "landings_confirmed"
    | "weighings_registered"
    | "lots_created"
    | "service_needs_fulfilled"
    | "commitments_created"
    | "commitments_completed"
    | "data_completeness_rate"
    | "coordination_lead_time_hours"
    | "repeat_usage_rate"
    | "ministry_briefings_generated"
    | "validated_value_cases"
    | "identified_payers";
  name: string;
  targetValue: number;
  unit: "count" | "percent" | "hours";
  objective: PilotObjective;
  frequency: "daily" | "weekly" | "monthly" | "end_of_pilot";
}

export interface PilotKpiMeasurement {
  id: EntityId;
  pilotId: EntityId;
  kpiId: EntityId;
  value: number;
  measuredAt: ISODateTime;
  source: string;
  validatedByActorId?: EntityId;
}

export interface PilotMinistryParticipation {
  ministryOrganizationId: EntityId;
  sponsorActorId?: EntityId;
  observerActorIds: EntityId[];
  expectedContributions: Array<
    | "institutional_sponsorship"
    | "pilot_site_access"
    | "stakeholder_mobilization"
    | "data_access"
    | "field_validation"
    | "financial_support"
    | "regulatory_guidance"
  >;
  governanceCadence: "weekly" | "biweekly" | "monthly";
  decisionRights: string[];
  reportingProductCode: "government" | "atlas";
}

export interface PilotCommercialHypothesis {
  id: EntityId;
  payerKind: PilotStakeholderKind;
  payerOrganizationId?: EntityId;
  paidCapabilityCodes: string[];
  pricingModel:
    | "pilot_fee"
    | "monthly_subscription"
    | "per_transaction"
    | "program_license"
    | "institutional_contract";
  proposedAmountXof?: number;
  validationMethod: "interview" | "letter_of_intent" | "paid_pilot" | "contract";
  status: "untested" | "interested" | "validated" | "rejected";
  evidence: string[];
}

export interface PilotDefinition {
  id: EntityId;
  name: string;
  territoryIds: EntityId[];
  stakeholderIds: EntityId[];
  journeyIds: EntityId[];
  kpiIds: EntityId[];
  ministryParticipation?: PilotMinistryParticipation;
  commercialHypothesisIds: EntityId[];
  durationWeeks: number;
  startAt?: ISODateTime;
  endAt?: ISODateTime;
  status: "draft" | "ready" | "running" | "completed" | "cancelled";
  goLiveCriteria: string[];
  stopCriteria: string[];
  createdAt: ISODateTime;
}

export interface PilotReadinessAssessment {
  pilotId: EntityId;
  ready: boolean;
  blockers: string[];
  warnings: string[];
  assessedAt: ISODateTime;
}

export interface PilotOperatingData {
  territories: PilotTerritory[];
  stakeholders: PilotStakeholder[];
  journeys: PilotJourney[];
  kpis: PilotKpi[];
  measurements: PilotKpiMeasurement[];
  commercialHypotheses: PilotCommercialHypothesis[];
  pilots: PilotDefinition[];
  readinessAssessments: PilotReadinessAssessment[];
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export class PilotOperatingModel {
  private state: PilotOperatingData = {
    territories: [],
    stakeholders: [],
    journeys: [],
    kpis: [],
    measurements: [],
    commercialHypotheses: [],
    pilots: [],
    readinessAssessments: [],
  };

  registerTerritory(territory: PilotTerritory) {
    this.ensureUnique(this.state.territories, territory.id, "territoire pilote");
    this.state.territories.push(clone(territory));
    return clone(territory);
  }

  registerStakeholder(stakeholder: PilotStakeholder) {
    this.ensureUnique(this.state.stakeholders, stakeholder.id, "partie prenante pilote");
    if (!this.state.territories.some((item) => item.id === stakeholder.territoryId)) {
      throw new Error(`Le territoire ${stakeholder.territoryId} est introuvable.`);
    }
    this.state.stakeholders.push(clone(stakeholder));
    return clone(stakeholder);
  }

  registerJourney(journey: PilotJourney) {
    this.ensureUnique(this.state.journeys, journey.id, "parcours pilote");
    if (journey.capabilityCodes.length === 0) {
      throw new Error("Un parcours pilote doit activer au moins une capability.");
    }
    this.state.journeys.push(clone(journey));
    return clone(journey);
  }

  registerKpi(kpi: PilotKpi) {
    this.ensureUnique(this.state.kpis, kpi.id, "KPI pilote");
    this.state.kpis.push(clone(kpi));
    return clone(kpi);
  }

  registerCommercialHypothesis(hypothesis: PilotCommercialHypothesis) {
    this.ensureUnique(this.state.commercialHypotheses, hypothesis.id, "hypothèse commerciale");
    if (hypothesis.paidCapabilityCodes.length === 0) {
      throw new Error("Une hypothèse commerciale doit identifier les capabilities payées.");
    }
    this.state.commercialHypotheses.push(clone(hypothesis));
    return clone(hypothesis);
  }

  createPilot(pilot: PilotDefinition) {
    this.ensureUnique(this.state.pilots, pilot.id, "pilote");
    this.assertReferences(pilot);
    this.state.pilots.push(clone(pilot));
    return clone(pilot);
  }

  assessReadiness(pilotId: EntityId, assessedAt: ISODateTime): PilotReadinessAssessment {
    const pilot = this.state.pilots.find((item) => item.id === pilotId);
    if (!pilot) throw new Error(`Le pilote ${pilotId} est introuvable.`);

    const blockers: string[] = [];
    const warnings: string[] = [];
    const stakeholders = this.state.stakeholders.filter((item) => pilot.stakeholderIds.includes(item.id));
    const journeys = this.state.journeys.filter((item) => pilot.journeyIds.includes(item.id));
    const kpis = this.state.kpis.filter((item) => pilot.kpiIds.includes(item.id));
    const hypotheses = this.state.commercialHypotheses.filter((item) =>
      pilot.commercialHypothesisIds.includes(item.id),
    );

    if (pilot.durationWeeks < 6 || pilot.durationWeeks > 16) {
      warnings.push("La durée recommandée du pilote est comprise entre 6 et 16 semaines.");
    }
    if (pilot.territoryIds.length !== 1) {
      blockers.push("Le premier pilote doit rester concentré sur un seul territoire.");
    }
    if (journeys.length < 2 || journeys.length > 4) {
      blockers.push("Le pilote doit couvrir 2 à 4 parcours métier, pas davantage.");
    }
    if (kpis.length < 5) {
      blockers.push("Le pilote doit disposer d'au moins 5 KPI de validation.");
    }
    if (!stakeholders.some((item) => item.kind === "fisher")) {
      blockers.push("Au moins un pêcheur doit être inclus.");
    }
    if (!stakeholders.some((item) => item.kind === "cooperative" || item.kind === "landing_site")) {
      blockers.push("Une structure de coordination locale doit être incluse.");
    }
    if (!stakeholders.some((item) => item.kind === "buyer" || item.kind === "processor")) {
      blockers.push("Un acteur aval doit être inclus pour prouver la coordination de bout en bout.");
    }
    if (!pilot.ministryParticipation) {
      warnings.push("La participation du ministère n'est pas encore formalisée.");
    } else if (pilot.ministryParticipation.expectedContributions.length === 0) {
      blockers.push("La participation ministérielle doit préciser des contributions concrètes.");
    }
    if (hypotheses.length === 0) {
      blockers.push("Au moins une hypothèse de paiement doit être testée pendant le pilote.");
    }
    if (!pilot.goLiveCriteria.length) {
      blockers.push("Les critères de démarrage opérationnel doivent être explicités.");
    }
    if (!pilot.stopCriteria.length) {
      warnings.push("Des critères d'arrêt doivent être définis pour éviter un pilote sans fin.");
    }

    const assessment: PilotReadinessAssessment = {
      pilotId,
      ready: blockers.length === 0,
      blockers,
      warnings,
      assessedAt,
    };
    this.state.readinessAssessments.push(clone(assessment));
    if (assessment.ready) pilot.status = "ready";
    return clone(assessment);
  }

  startPilot(pilotId: EntityId, startAt: ISODateTime, endAt: ISODateTime) {
    const pilot = this.state.pilots.find((item) => item.id === pilotId);
    if (!pilot) throw new Error(`Le pilote ${pilotId} est introuvable.`);
    const latestAssessment = [...this.state.readinessAssessments]
      .filter((item) => item.pilotId === pilotId)
      .sort((a, b) => b.assessedAt.localeCompare(a.assessedAt))[0];
    if (!latestAssessment?.ready) {
      throw new Error("Le pilote ne peut pas démarrer sans assessment de readiness positif.");
    }
    pilot.status = "running";
    pilot.startAt = startAt;
    pilot.endAt = endAt;
    return clone(pilot);
  }

  recordMeasurement(measurement: PilotKpiMeasurement) {
    this.ensureUnique(this.state.measurements, measurement.id, "mesure pilote");
    if (!this.state.pilots.some((item) => item.id === measurement.pilotId)) {
      throw new Error(`Le pilote ${measurement.pilotId} est introuvable.`);
    }
    if (!this.state.kpis.some((item) => item.id === measurement.kpiId)) {
      throw new Error(`Le KPI ${measurement.kpiId} est introuvable.`);
    }
    this.state.measurements.push(clone(measurement));
    return clone(measurement);
  }

  getPilotScorecard(pilotId: EntityId) {
    const pilot = this.state.pilots.find((item) => item.id === pilotId);
    if (!pilot) throw new Error(`Le pilote ${pilotId} est introuvable.`);

    return pilot.kpiIds.map((kpiId) => {
      const kpi = this.state.kpis.find((item) => item.id === kpiId);
      if (!kpi) throw new Error(`Le KPI ${kpiId} est introuvable.`);
      const measurements = this.state.measurements
        .filter((item) => item.pilotId === pilotId && item.kpiId === kpiId)
        .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
      const latest = measurements[0];
      return {
        kpiId,
        code: kpi.code,
        targetValue: kpi.targetValue,
        latestValue: latest?.value,
        targetReached: latest ? latest.value >= kpi.targetValue : false,
        measuredAt: latest?.measuredAt,
      };
    });
  }

  snapshot(): PilotOperatingData {
    return clone(this.state);
  }

  private assertReferences(pilot: PilotDefinition) {
    const missingTerritories = pilot.territoryIds.filter(
      (id) => !this.state.territories.some((item) => item.id === id),
    );
    const missingStakeholders = pilot.stakeholderIds.filter(
      (id) => !this.state.stakeholders.some((item) => item.id === id),
    );
    const missingJourneys = pilot.journeyIds.filter(
      (id) => !this.state.journeys.some((item) => item.id === id),
    );
    const missingKpis = pilot.kpiIds.filter(
      (id) => !this.state.kpis.some((item) => item.id === id),
    );
    const missingHypotheses = pilot.commercialHypothesisIds.filter(
      (id) => !this.state.commercialHypotheses.some((item) => item.id === id),
    );

    const missing = [
      ...missingTerritories,
      ...missingStakeholders,
      ...missingJourneys,
      ...missingKpis,
      ...missingHypotheses,
    ];
    if (missing.length > 0) {
      throw new Error(`Références pilote introuvables : ${missing.join(", ")}.`);
    }
  }

  private ensureUnique<T extends { id: EntityId }>(items: T[], id: EntityId, label: string) {
    if (items.some((item) => item.id === id)) {
      throw new Error(`Le ${label} ${id} existe déjà.`);
    }
  }
}
