import type { EntityId, ISODateTime } from "./types";

export type PlanningHorizon = "day" | "week" | "campaign";
export type PlanStatus = "draft" | "proposed" | "approved" | "active" | "completed" | "cancelled";
export type ResourceKind = "vessel" | "crew" | "gear" | "ice" | "fuel" | "cold_storage" | "transport" | "landing_slot";

export interface ResourceAvailability {
  id: EntityId;
  resourceKind: ResourceKind;
  resourceId: EntityId;
  territoryId: EntityId;
  availableFrom: ISODateTime;
  availableUntil: ISODateTime;
  capacity?: number;
  capacityUnit?: string;
  status: "available" | "reserved" | "unavailable" | "maintenance";
  constraints: string[];
}

export interface OperationalDemandSignal {
  id: EntityId;
  territoryId: EntityId;
  speciesCode?: string;
  quantityKg: number;
  requiredBy: ISODateTime;
  priority: "low" | "medium" | "high" | "urgent";
  sourceType: "forecast" | "order" | "contract" | "market_signal" | "public_program";
  sourceId: EntityId;
  buyerSegment?: string;
  qualityRequirements: string[];
}

export interface SustainabilityConstraint {
  id: EntityId;
  territoryId: EntityId;
  fishingZoneId?: EntityId;
  speciesCode?: string;
  type: "effort_limit" | "temporary_rest" | "gear_restriction" | "species_protection" | "risk_threshold";
  severity: "advisory" | "blocking";
  startsAt: ISODateTime;
  endsAt?: ISODateTime;
  rationale: string[];
}

export interface ResourcePlanLine {
  id: EntityId;
  planId: EntityId;
  demandSignalId: EntityId;
  resourceAssignments: Partial<Record<ResourceKind, EntityId[]>>;
  plannedQuantityKg: number;
  plannedStart: ISODateTime;
  plannedEnd: ISODateTime;
  fishingZoneId?: EntityId;
  speciesCode?: string;
  expectedCostXof?: number;
  expectedRevenueXof?: number;
  risks: string[];
  status: "planned" | "ready" | "in_progress" | "completed" | "cancelled";
}

export interface ResourcePlan {
  id: EntityId;
  territoryId: EntityId;
  horizon: PlanningHorizon;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  status: PlanStatus;
  objective: string;
  lines: ResourcePlanLine[];
  uncoveredDemandKg: number;
  totalPlannedQuantityKg: number;
  expectedGrossRevenueXof: number;
  expectedOperationalCostXof: number;
  sustainabilityWarnings: string[];
  createdAt: ISODateTime;
  approvedAt?: ISODateTime;
  approvedByActorId?: EntityId;
}

export interface PlanningScenario {
  id: EntityId;
  planId: EntityId;
  name: string;
  assumptions: string[];
  expectedQuantityKg: number;
  expectedRevenueXof: number;
  expectedCostXof: number;
  expectedMarginXof: number;
  resourceUtilizationPercent: number;
  sustainabilityScore: number;
  feasibilityScore: number;
  recommended: boolean;
}

export class ResourcePlanningEngine {
  private readonly availability = new Map<EntityId, ResourceAvailability>();
  private readonly demands = new Map<EntityId, OperationalDemandSignal>();
  private readonly constraints = new Map<EntityId, SustainabilityConstraint>();
  private readonly plans = new Map<EntityId, ResourcePlan>();
  private readonly scenarios = new Map<EntityId, PlanningScenario>();

  registerAvailability(input: ResourceAvailability) {
    if (this.availability.has(input.id)) throw new Error(`La disponibilité ${input.id} existe déjà.`);
    if (input.availableUntil <= input.availableFrom) throw new Error("La période de disponibilité est invalide.");
    this.availability.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  registerDemand(input: OperationalDemandSignal) {
    if (this.demands.has(input.id)) return structuredClone(this.demands.get(input.id)!);
    if (input.quantityKg <= 0) throw new Error("La quantité demandée doit être positive.");
    this.demands.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  registerConstraint(input: SustainabilityConstraint) {
    if (this.constraints.has(input.id)) throw new Error(`La contrainte ${input.id} existe déjà.`);
    if (input.endsAt && input.endsAt <= input.startsAt) throw new Error("La période de contrainte est invalide.");
    this.constraints.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  createPlan(input: Omit<ResourcePlan, "lines" | "uncoveredDemandKg" | "totalPlannedQuantityKg" | "expectedGrossRevenueXof" | "expectedOperationalCostXof" | "sustainabilityWarnings">) {
    if (this.plans.has(input.id)) throw new Error(`Le plan ${input.id} existe déjà.`);
    if (input.periodEnd <= input.periodStart) throw new Error("La période de planification est invalide.");
    const plan: ResourcePlan = {
      ...structuredClone(input),
      lines: [],
      uncoveredDemandKg: 0,
      totalPlannedQuantityKg: 0,
      expectedGrossRevenueXof: 0,
      expectedOperationalCostXof: 0,
      sustainabilityWarnings: [],
    };
    this.plans.set(plan.id, plan);
    return structuredClone(plan);
  }

  allocateDemand(input: {
    planId: EntityId;
    demandSignalId: EntityId;
    lineId: EntityId;
    plannedQuantityKg: number;
    plannedStart: ISODateTime;
    plannedEnd: ISODateTime;
    fishingZoneId?: EntityId;
    speciesCode?: string;
    resourceAssignments: Partial<Record<ResourceKind, EntityId[]>>;
    expectedCostXof?: number;
    expectedRevenueXof?: number;
  }) {
    const plan = this.requirePlan(input.planId);
    const demand = this.requireDemand(input.demandSignalId);
    if (plan.status !== "draft") throw new Error("Les allocations ne peuvent être ajoutées qu'à un plan en brouillon.");
    if (demand.territoryId !== plan.territoryId) throw new Error("La demande n'appartient pas au territoire du plan.");
    if (input.plannedQuantityKg <= 0 || input.plannedQuantityKg > demand.quantityKg) throw new Error("La quantité planifiée est invalide.");
    if (input.plannedEnd <= input.plannedStart) throw new Error("La période de la ligne est invalide.");

    const risks: string[] = [];
    for (const [kind, resourceIds] of Object.entries(input.resourceAssignments) as [ResourceKind, EntityId[]][]) {
      for (const resourceId of resourceIds) {
        const slot = [...this.availability.values()].find((item) => item.resourceKind === kind && item.resourceId === resourceId);
        if (!slot || slot.status !== "available" || slot.availableFrom > input.plannedStart || slot.availableUntil < input.plannedEnd) {
          risks.push(`${kind}:${resourceId} non disponible sur toute la période.`);
        }
      }
    }

    const blockingConstraints = this.getApplicableConstraints({
      territoryId: plan.territoryId,
      speciesCode: input.speciesCode ?? demand.speciesCode,
      fishingZoneId: input.fishingZoneId,
      startsAt: input.plannedStart,
      endsAt: input.plannedEnd,
    }).filter((item) => item.severity === "blocking");
    if (blockingConstraints.length) throw new Error(`Allocation bloquée par ${blockingConstraints.length} contrainte(s) de durabilité.`);

    const advisory = this.getApplicableConstraints({
      territoryId: plan.territoryId,
      speciesCode: input.speciesCode ?? demand.speciesCode,
      fishingZoneId: input.fishingZoneId,
      startsAt: input.plannedStart,
      endsAt: input.plannedEnd,
    }).filter((item) => item.severity === "advisory");
    risks.push(...advisory.flatMap((item) => item.rationale));

    const line: ResourcePlanLine = {
      id: input.lineId,
      planId: plan.id,
      demandSignalId: demand.id,
      resourceAssignments: structuredClone(input.resourceAssignments),
      plannedQuantityKg: input.plannedQuantityKg,
      plannedStart: input.plannedStart,
      plannedEnd: input.plannedEnd,
      fishingZoneId: input.fishingZoneId,
      speciesCode: input.speciesCode ?? demand.speciesCode,
      expectedCostXof: input.expectedCostXof,
      expectedRevenueXof: input.expectedRevenueXof,
      risks,
      status: risks.length ? "planned" : "ready",
    };
    plan.lines.push(line);
    this.recalculatePlan(plan);
    this.plans.set(plan.id, plan);
    return structuredClone(line);
  }

  proposePlan(planId: EntityId) {
    const plan = this.requirePlan(planId);
    if (plan.status !== "draft") throw new Error("Seul un plan en brouillon peut être proposé.");
    if (plan.lines.length === 0) throw new Error("Le plan doit contenir au moins une allocation.");
    plan.status = "proposed";
    this.recalculatePlan(plan);
    this.plans.set(plan.id, plan);
    return structuredClone(plan);
  }

  approvePlan(input: { planId: EntityId; approvedAt: ISODateTime; approvedByActorId: EntityId }) {
    const plan = this.requirePlan(input.planId);
    if (plan.status !== "proposed") throw new Error("Seul un plan proposé peut être approuvé.");
    const blockingRisk = plan.lines.some((line) => line.risks.some((risk) => risk.includes("non disponible")));
    if (blockingRisk) throw new Error("Le plan contient des ressources indisponibles.");
    plan.status = "approved";
    plan.approvedAt = input.approvedAt;
    plan.approvedByActorId = input.approvedByActorId;
    this.plans.set(plan.id, plan);
    return structuredClone(plan);
  }

  generateScenarios(planId: EntityId) {
    const plan = this.requirePlan(planId);
    const baseRevenue = plan.expectedGrossRevenueXof;
    const baseCost = plan.expectedOperationalCostXof;
    const resourceCount = plan.lines.reduce((sum, line) => sum + Object.values(line.resourceAssignments).flat().length, 0);
    const riskCount = plan.lines.reduce((sum, line) => sum + line.risks.length, 0);
    const variants = [
      { code: "conservative", quantityFactor: 0.8, revenueFactor: 0.9, costFactor: 0.85, assumptions: ["Priorité à la préservation de la ressource", "Capacité réservée avec marge de sécurité"] },
      { code: "balanced", quantityFactor: 1, revenueFactor: 1, costFactor: 1, assumptions: ["Équilibre demande, rentabilité et durabilité"] },
      { code: "growth", quantityFactor: 1.15, revenueFactor: 1.12, costFactor: 1.1, assumptions: ["Mobilisation maximale des capacités disponibles", "Risque opérationnel plus élevé"] },
    ];
    const results = variants.map((variant) => {
      const expectedQuantityKg = Math.round(plan.totalPlannedQuantityKg * variant.quantityFactor);
      const expectedRevenueXof = Math.round(baseRevenue * variant.revenueFactor);
      const expectedCostXof = Math.round(baseCost * variant.costFactor);
      const sustainabilityScore = Math.max(0, Math.round(100 - riskCount * 8 - (variant.code === "growth" ? 15 : variant.code === "conservative" ? -10 : 0)));
      const feasibilityScore = Math.max(0, Math.round(100 - riskCount * 10 - Math.max(0, resourceCount - 20)));
      const scenario: PlanningScenario = {
        id: `scenario:${plan.id}:${variant.code}`,
        planId: plan.id,
        name: variant.code,
        assumptions: variant.assumptions,
        expectedQuantityKg,
        expectedRevenueXof,
        expectedCostXof,
        expectedMarginXof: expectedRevenueXof - expectedCostXof,
        resourceUtilizationPercent: Math.min(100, Math.round(variant.quantityFactor * 80)),
        sustainabilityScore,
        feasibilityScore,
        recommended: variant.code === "balanced" && sustainabilityScore >= 60 && feasibilityScore >= 60,
      };
      this.scenarios.set(scenario.id, scenario);
      return structuredClone(scenario);
    });
    return results.sort((a, b) => Number(b.recommended) - Number(a.recommended) || b.expectedMarginXof - a.expectedMarginXof);
  }

  getTerritoryPlanningBoard(territoryId: EntityId) {
    const plans = [...this.plans.values()].filter((item) => item.territoryId === territoryId);
    return {
      territoryId,
      activePlans: plans.filter((item) => ["approved", "active"].includes(item.status)).map((item) => structuredClone(item)),
      upcomingDemand: [...this.demands.values()].filter((item) => item.territoryId === territoryId).sort((a, b) => a.requiredBy.localeCompare(b.requiredBy)).map((item) => structuredClone(item)),
      availableResources: [...this.availability.values()].filter((item) => item.territoryId === territoryId && item.status === "available").map((item) => structuredClone(item)),
      activeConstraints: [...this.constraints.values()].filter((item) => item.territoryId === territoryId).map((item) => structuredClone(item)),
    };
  }

  snapshot() {
    return {
      availability: [...this.availability.values()].map((item) => structuredClone(item)),
      demands: [...this.demands.values()].map((item) => structuredClone(item)),
      constraints: [...this.constraints.values()].map((item) => structuredClone(item)),
      plans: [...this.plans.values()].map((item) => structuredClone(item)),
      scenarios: [...this.scenarios.values()].map((item) => structuredClone(item)),
    };
  }

  private getApplicableConstraints(input: { territoryId: EntityId; speciesCode?: string; fishingZoneId?: EntityId; startsAt: ISODateTime; endsAt: ISODateTime }) {
    return [...this.constraints.values()].filter((item) =>
      item.territoryId === input.territoryId &&
      (!item.speciesCode || item.speciesCode === input.speciesCode) &&
      (!item.fishingZoneId || item.fishingZoneId === input.fishingZoneId) &&
      item.startsAt < input.endsAt &&
      (!item.endsAt || item.endsAt > input.startsAt),
    );
  }

  private recalculatePlan(plan: ResourcePlan) {
    const demandById = new Map([...this.demands.values()].map((item) => [item.id, item]));
    plan.totalPlannedQuantityKg = plan.lines.reduce((sum, line) => sum + line.plannedQuantityKg, 0);
    plan.expectedGrossRevenueXof = plan.lines.reduce((sum, line) => sum + (line.expectedRevenueXof ?? 0), 0);
    plan.expectedOperationalCostXof = plan.lines.reduce((sum, line) => sum + (line.expectedCostXof ?? 0), 0);
    const demanded = [...new Set(plan.lines.map((line) => line.demandSignalId))]
      .map((id) => demandById.get(id))
      .filter((item): item is OperationalDemandSignal => Boolean(item))
      .reduce((sum, item) => sum + item.quantityKg, 0);
    plan.uncoveredDemandKg = Math.max(0, demanded - plan.totalPlannedQuantityKg);
    plan.sustainabilityWarnings = [...new Set(plan.lines.flatMap((line) => line.risks))];
  }

  private requirePlan(id: EntityId) {
    const item = this.plans.get(id);
    if (!item) throw new Error(`Plan introuvable : ${id}.`);
    return item;
  }

  private requireDemand(id: EntityId) {
    const item = this.demands.get(id);
    if (!item) throw new Error(`Demande introuvable : ${id}.`);
    return item;
  }
}
