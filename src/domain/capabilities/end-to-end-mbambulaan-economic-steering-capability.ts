import type { EntityId, ISODateTime } from "../infrastructures/types";

export type RevenueModelType =
  | "transaction_commission"
  | "service_fee"
  | "subscription"
  | "public_service_contract"
  | "data_service"
  | "financing_facilitation"
  | "insurance_facilitation"
  | "integration_fee"
  | "training_fee"
  | "grant"
  | "other";

export type CostType =
  | "product"
  | "technology"
  | "field_operations"
  | "customer_success"
  | "sales"
  | "data_and_ai"
  | "compliance"
  | "integration"
  | "support"
  | "infrastructure"
  | "administration"
  | "other";

export interface EconomicDimension {
  capabilityId?: EntityId;
  territoryId?: EntityId;
  payerActorId?: EntityId;
  beneficiaryActorId?: EntityId;
  customerSegment?: string;
  contractId?: EntityId;
  publicProgramId?: EntityId;
}

export interface RevenueRecord {
  id: EntityId;
  modelType: RevenueModelType;
  amountXof: number;
  recognizedAmountXof: number;
  collectedAmountXof: number;
  status: "forecast" | "contracted" | "invoiced" | "partially_collected" | "collected" | "cancelled";
  recurring: boolean;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  dueAt?: ISODateTime;
  dimension: EconomicDimension;
  sourceReferenceIds: EntityId[];
  evidenceIds: EntityId[];
  recordedAt: ISODateTime;
}

export interface CostRecord {
  id: EntityId;
  costType: CostType;
  amountXof: number;
  committedAmountXof: number;
  paidAmountXof: number;
  fixed: boolean;
  avoidable: boolean;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  dimension: EconomicDimension;
  vendorActorId?: EntityId;
  evidenceIds: EntityId[];
  recordedAt: ISODateTime;
}

export interface ValueCreationRecord {
  id: EntityId;
  valueType: "value_created" | "value_protected" | "waste_avoided" | "jobs_supported" | "service_level_gain" | "resource_pressure_reduction";
  monetaryValueXof: number;
  quantity?: number;
  unit?: string;
  dimension: EconomicDimension;
  sourceReferenceIds: EntityId[];
  evidenceIds: EntityId[];
  measuredAt: ISODateTime;
}

export interface EconomicTarget {
  id: EntityId;
  metric:
    | "revenue"
    | "gross_margin"
    | "operating_margin"
    | "collection_rate"
    | "recurring_revenue_share"
    | "grant_dependency"
    | "payer_concentration"
    | "cost_to_value_ratio"
    | "runway_months";
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  dimension: EconomicDimension;
}

export interface EconomicScenario {
  id: EntityId;
  label: string;
  assumptions: {
    transactionVolumeGrowthPercent: number;
    averageCommissionRatePercent: number;
    subscriberGrowthPercent: number;
    publicContractRevenueXof: number;
    grantRevenueXof: number;
    variableCostGrowthPercent: number;
    fixedCostGrowthPercent: number;
    collectionRatePercent: number;
  };
  projectedRevenueXof: number;
  projectedCostXof: number;
  projectedOperatingResultXof: number;
  projectedRunwayMonths: number;
  projectedGrantDependencyPercent: number;
  projectedRecurringRevenueSharePercent: number;
  riskFactors: string[];
  status: "draft" | "simulated" | "approved" | "rejected";
  simulatedAt?: ISODateTime;
}

export interface EconomicDecision {
  id: EntityId;
  decisionType:
    | "adjust_pricing"
    | "reduce_cost"
    | "invest_capability"
    | "enter_territory"
    | "exit_territory"
    | "renegotiate_contract"
    | "diversify_payers"
    | "raise_funding"
    | "prioritize_collection";
  dimension: EconomicDimension;
  rationale: string;
  expectedAnnualImpactXof: number;
  ownerActorId: EntityId;
  dueAt: ISODateTime;
  status: "decided" | "in_execution" | "completed" | "cancelled";
  evidenceIds: EntityId[];
  decidedAt: ISODateTime;
}

export interface MbambulaanEconomicSteeringCase {
  id: EntityId;
  companyId: EntityId;
  currency: "XOF";
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  openingCashXof: number;
  closingCashXof: number;
  status: "open" | "reviewing" | "deciding" | "closed";
  revenues: RevenueRecord[];
  costs: CostRecord[];
  valueCreation: ValueCreationRecord[];
  targets: EconomicTarget[];
  scenarios: EconomicScenario[];
  decisions: EconomicDecision[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  events: Array<{
    id: EntityId;
    type: string;
    occurredAt: ISODateTime;
    actorId?: EntityId;
    details: Record<string, unknown>;
  }>;
}

export interface EconomicSnapshot {
  revenueXof: number;
  recognizedRevenueXof: number;
  collectedRevenueXof: number;
  recurringRevenueXof: number;
  grantRevenueXof: number;
  totalCostXof: number;
  fixedCostXof: number;
  variableCostXof: number;
  paidCostXof: number;
  grossMarginXof: number;
  operatingResultXof: number;
  collectionRatePercent: number;
  recurringRevenueSharePercent: number;
  grantDependencyPercent: number;
  payerConcentrationPercent: number;
  costToValueRatioPercent: number;
  valueCreatedAndProtectedXof: number;
  netCashChangeXof: number;
  runwayMonths: number;
}

export interface EconomicUnitPerformance {
  key: string;
  revenueXof: number;
  costXof: number;
  operatingResultXof: number;
  marginPercent: number;
  valueCreatedAndProtectedXof: number;
  costToValueRatioPercent: number;
  payerCount: number;
}

export class EndToEndMbambulaanEconomicSteeringCapability {
  private readonly cases = new Map<EntityId, MbambulaanEconomicSteeringCase>();

  openPeriod(input: {
    id: EntityId;
    companyId: EntityId;
    periodStart: ISODateTime;
    periodEnd: ISODateTime;
    openingCashXof: number;
    createdAt: ISODateTime;
    actorId?: EntityId;
  }) {
    if (this.cases.has(input.id)) throw new Error(`La période économique ${input.id} existe déjà.`);
    if (input.periodEnd <= input.periodStart) throw new Error("La période économique est invalide.");
    if (input.openingCashXof < 0) throw new Error("La trésorerie d'ouverture ne peut pas être négative.");
    const item: MbambulaanEconomicSteeringCase = {
      id: input.id,
      companyId: input.companyId,
      currency: "XOF",
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      openingCashXof: input.openingCashXof,
      closingCashXof: input.openingCashXof,
      status: "open",
      revenues: [],
      costs: [],
      valueCreation: [],
      targets: [],
      scenarios: [],
      decisions: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      events: [this.event(`event:${input.id}:opened`, "economic_period_opened", input.createdAt, input.actorId, {})],
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  recordRevenue(input: { caseId: EntityId; revenue: RevenueRecord; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.assertWithinPeriod(item, input.revenue.periodStart, input.revenue.periodEnd);
    if (input.revenue.amountXof < 0 || input.revenue.recognizedAmountXof < 0 || input.revenue.collectedAmountXof < 0) throw new Error("Les montants de revenu ne peuvent pas être négatifs.");
    if (input.revenue.recognizedAmountXof > input.revenue.amountXof) throw new Error("Le revenu reconnu dépasse le revenu total.");
    if (input.revenue.collectedAmountXof > input.revenue.amountXof) throw new Error("Le revenu encaissé dépasse le revenu total.");
    if (item.revenues.some((entry) => entry.id === input.revenue.id)) throw new Error(`Le revenu ${input.revenue.id} existe déjà.`);
    item.revenues.push(structuredClone(input.revenue));
    this.recalculateCash(item);
    this.touch(item, input.revenue.recordedAt, this.event(`event:${item.id}:revenue:${input.revenue.id}`, "economic_revenue_recorded", input.revenue.recordedAt, input.actorId, { modelType: input.revenue.modelType, amountXof: input.revenue.amountXof }));
    return structuredClone(item);
  }

  recordCost(input: { caseId: EntityId; cost: CostRecord; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    this.assertWithinPeriod(item, input.cost.periodStart, input.cost.periodEnd);
    if (input.cost.amountXof < 0 || input.cost.committedAmountXof < 0 || input.cost.paidAmountXof < 0) throw new Error("Les montants de coût ne peuvent pas être négatifs.");
    if (input.cost.committedAmountXof > input.cost.amountXof || input.cost.paidAmountXof > input.cost.amountXof) throw new Error("Le coût engagé ou payé dépasse le coût total.");
    if (item.costs.some((entry) => entry.id === input.cost.id)) throw new Error(`Le coût ${input.cost.id} existe déjà.`);
    item.costs.push(structuredClone(input.cost));
    this.recalculateCash(item);
    this.touch(item, input.cost.recordedAt, this.event(`event:${item.id}:cost:${input.cost.id}`, "economic_cost_recorded", input.cost.recordedAt, input.actorId, { costType: input.cost.costType, amountXof: input.cost.amountXof }));
    return structuredClone(item);
  }

  recordValueCreation(input: { caseId: EntityId; record: ValueCreationRecord; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (input.record.monetaryValueXof < 0) throw new Error("La valeur créée ou protégée ne peut pas être négative.");
    if (input.record.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour comptabiliser la valeur créée.");
    if (item.valueCreation.some((entry) => entry.id === input.record.id)) throw new Error(`La mesure de valeur ${input.record.id} existe déjà.`);
    item.valueCreation.push(structuredClone(input.record));
    this.touch(item, input.record.measuredAt, this.event(`event:${item.id}:value:${input.record.id}`, "economic_value_creation_recorded", input.record.measuredAt, input.actorId, { valueType: input.record.valueType, monetaryValueXof: input.record.monetaryValueXof }));
    return structuredClone(item);
  }

  defineTarget(input: { caseId: EntityId; target: EconomicTarget; actorId?: EntityId; definedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    if (item.targets.some((entry) => entry.id === input.target.id)) throw new Error(`La cible ${input.target.id} existe déjà.`);
    item.targets.push(structuredClone(input.target));
    this.touch(item, input.definedAt, this.event(`event:${item.id}:target:${input.target.id}`, "economic_target_defined", input.definedAt, input.actorId, { metric: input.target.metric, targetValue: input.target.targetValue }));
    return structuredClone(item);
  }

  simulateScenario(input: { caseId: EntityId; scenario: Omit<EconomicScenario, "projectedRevenueXof" | "projectedCostXof" | "projectedOperatingResultXof" | "projectedRunwayMonths" | "projectedGrantDependencyPercent" | "projectedRecurringRevenueSharePercent" | "riskFactors" | "status" | "simulatedAt">; simulatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.scenarios.some((entry) => entry.id === input.scenario.id)) throw new Error(`Le scénario ${input.scenario.id} existe déjà.`);
    const baseline = this.buildSnapshot(item);
    const transactionalRevenue = item.revenues.filter((entry) => entry.modelType === "transaction_commission" || entry.modelType === "service_fee").reduce((sum, entry) => sum + entry.amountXof, 0);
    const subscriptionRevenue = item.revenues.filter((entry) => entry.modelType === "subscription").reduce((sum, entry) => sum + entry.amountXof, 0);
    const otherCommercialRevenue = Math.max(0, baseline.revenueXof - transactionalRevenue - subscriptionRevenue - baseline.grantRevenueXof);
    const projectedTransactionRevenue = transactionalRevenue * (1 + input.scenario.assumptions.transactionVolumeGrowthPercent / 100) * (input.scenario.assumptions.averageCommissionRatePercent / Math.max(0.01, this.currentCommissionRate(item)));
    const projectedSubscriptionRevenue = subscriptionRevenue * (1 + input.scenario.assumptions.subscriberGrowthPercent / 100);
    const projectedRevenueXof = Math.round(projectedTransactionRevenue + projectedSubscriptionRevenue + otherCommercialRevenue + input.scenario.assumptions.publicContractRevenueXof + input.scenario.assumptions.grantRevenueXof);
    const projectedVariableCost = baseline.variableCostXof * (1 + input.scenario.assumptions.variableCostGrowthPercent / 100);
    const projectedFixedCost = baseline.fixedCostXof * (1 + input.scenario.assumptions.fixedCostGrowthPercent / 100);
    const projectedCostXof = Math.round(projectedVariableCost + projectedFixedCost);
    const projectedOperatingResultXof = projectedRevenueXof - projectedCostXof;
    const monthlyBurn = Math.max(0, -projectedOperatingResultXof / 12);
    const projectedRunwayMonths = monthlyBurn > 0 ? this.round(item.closingCashXof / monthlyBurn) : 999;
    const projectedGrantDependencyPercent = projectedRevenueXof ? this.round(input.scenario.assumptions.grantRevenueXof / projectedRevenueXof * 100) : 0;
    const projectedRecurringRevenueSharePercent = projectedRevenueXof ? this.round((projectedSubscriptionRevenue + input.scenario.assumptions.publicContractRevenueXof) / projectedRevenueXof * 100) : 0;
    const riskFactors: string[] = [];
    if (projectedGrantDependencyPercent > 35) riskFactors.push("Dépendance excessive aux subventions.");
    if (projectedOperatingResultXof < 0) riskFactors.push("Résultat opérationnel projeté négatif.");
    if (projectedRunwayMonths < 12) riskFactors.push("Runway projeté inférieur à douze mois.");
    if (projectedRecurringRevenueSharePercent < 30) riskFactors.push("Part de revenus récurrents insuffisante.");
    const scenario: EconomicScenario = {
      ...structuredClone(input.scenario),
      projectedRevenueXof,
      projectedCostXof,
      projectedOperatingResultXof,
      projectedRunwayMonths,
      projectedGrantDependencyPercent,
      projectedRecurringRevenueSharePercent,
      riskFactors,
      status: "simulated",
      simulatedAt: input.simulatedAt,
    };
    item.scenarios.push(scenario);
    this.touch(item, input.simulatedAt, this.event(`event:${item.id}:scenario:${scenario.id}`, "economic_scenario_simulated", input.simulatedAt, input.actorId, { projectedOperatingResultXof, projectedRunwayMonths }));
    return structuredClone(scenario);
  }

  decide(input: { caseId: EntityId; decision: EconomicDecision }) {
    const item = this.requireCase(input.caseId);
    if (input.decision.evidenceIds.length === 0) throw new Error("Une décision économique doit être soutenue par une preuve.");
    if (item.decisions.some((entry) => entry.id === input.decision.id)) throw new Error(`La décision ${input.decision.id} existe déjà.`);
    item.decisions.push(structuredClone(input.decision));
    item.status = "deciding";
    this.touch(item, input.decision.decidedAt, this.event(`event:${item.id}:decision:${input.decision.id}`, "economic_decision_recorded", input.decision.decidedAt, input.decision.ownerActorId, { decisionType: input.decision.decisionType, expectedAnnualImpactXof: input.decision.expectedAnnualImpactXof }));
    return structuredClone(item);
  }

  reviewPeriod(input: { caseId: EntityId; reviewedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const snapshot = this.buildSnapshot(item);
    const blockers: string[] = [];
    const warnings: string[] = [];
    if (snapshot.operatingResultXof < 0 && snapshot.runwayMonths < 6) blockers.push("Résultat négatif et runway inférieur à six mois.");
    if (snapshot.collectionRatePercent < 60) blockers.push("Le taux d'encaissement est inférieur à 60 %.");
    if (snapshot.payerConcentrationPercent > 70) warnings.push("Plus de 70 % des revenus dépendent d'un seul payeur.");
    if (snapshot.grantDependencyPercent > 35) warnings.push("La dépendance aux subventions dépasse 35 %.");
    if (snapshot.recurringRevenueSharePercent < 30) warnings.push("La part de revenus récurrents est inférieure à 30 %.");
    if (snapshot.costToValueRatioPercent > 25) warnings.push("Le coût de coordination dépasse 25 % de la valeur créée ou protégée.");
    if (!item.valueCreation.length) warnings.push("La valeur créée pour l'écosystème n'est pas mesurée.");
    item.blockers = blockers;
    item.warnings = warnings;
    item.status = "reviewing";
    this.touch(item, input.reviewedAt, this.event(`event:${item.id}:review`, "economic_period_reviewed", input.reviewedAt, input.actorId, { blockers, warnings, snapshot }));
    return { snapshot, blockers, warnings };
  }

  closePeriod(input: { caseId: EntityId; closedAt: ISODateTime; actorId?: EntityId; evidenceIds: EntityId[] }) {
    const item = this.requireCase(input.caseId);
    if (input.evidenceIds.length === 0) throw new Error("Une preuve de clôture économique est obligatoire.");
    if (item.blockers.length > 0) throw new Error(`La période ne peut pas être clôturée : ${item.blockers.join("; ")}`);
    item.documentIds = this.unique([...item.documentIds, ...input.evidenceIds]);
    item.status = "closed";
    this.touch(item, input.closedAt, this.event(`event:${item.id}:closed`, "economic_period_closed", input.closedAt, input.actorId, { closingCashXof: item.closingCashXof }));
    return structuredClone(item);
  }

  getCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    const snapshot = this.buildSnapshot(item);
    return {
      caseId: item.id,
      companyId: item.companyId,
      periodStart: item.periodStart,
      periodEnd: item.periodEnd,
      status: item.status,
      snapshot,
      byCapability: this.aggregateUnits(item, "capability"),
      byTerritory: this.aggregateUnits(item, "territory"),
      byPayer: this.aggregateUnits(item, "payer"),
      byRevenueModel: this.aggregateRevenueModels(item),
      targetAlerts: this.evaluateTargets(item, snapshot),
      scenarios: item.scenarios.map((entry) => structuredClone(entry)),
      decisions: item.decisions.map((entry) => structuredClone(entry)),
      blockers: [...item.blockers],
      warnings: [...item.warnings],
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private buildSnapshot(item: MbambulaanEconomicSteeringCase): EconomicSnapshot {
    const revenueXof = item.revenues.filter((entry) => entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amountXof, 0);
    const recognizedRevenueXof = item.revenues.reduce((sum, entry) => sum + entry.recognizedAmountXof, 0);
    const collectedRevenueXof = item.revenues.reduce((sum, entry) => sum + entry.collectedAmountXof, 0);
    const recurringRevenueXof = item.revenues.filter((entry) => entry.recurring && entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amountXof, 0);
    const grantRevenueXof = item.revenues.filter((entry) => entry.modelType === "grant" && entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amountXof, 0);
    const totalCostXof = item.costs.reduce((sum, entry) => sum + entry.amountXof, 0);
    const fixedCostXof = item.costs.filter((entry) => entry.fixed).reduce((sum, entry) => sum + entry.amountXof, 0);
    const variableCostXof = totalCostXof - fixedCostXof;
    const paidCostXof = item.costs.reduce((sum, entry) => sum + entry.paidAmountXof, 0);
    const valueCreatedAndProtectedXof = item.valueCreation.reduce((sum, entry) => sum + entry.monetaryValueXof, 0);
    const payers = new Map<EntityId, number>();
    for (const revenue of item.revenues.filter((entry) => entry.status !== "cancelled" && entry.dimension.payerActorId)) {
      payers.set(revenue.dimension.payerActorId!, (payers.get(revenue.dimension.payerActorId!) ?? 0) + revenue.amountXof);
    }
    const largestPayerRevenue = payers.size ? Math.max(...payers.values()) : 0;
    const monthlyBurn = Math.max(0, (paidCostXof - collectedRevenueXof) / Math.max(1, this.monthCount(item.periodStart, item.periodEnd)));
    return {
      revenueXof,
      recognizedRevenueXof,
      collectedRevenueXof,
      recurringRevenueXof,
      grantRevenueXof,
      totalCostXof,
      fixedCostXof,
      variableCostXof,
      paidCostXof,
      grossMarginXof: recognizedRevenueXof - variableCostXof,
      operatingResultXof: recognizedRevenueXof - totalCostXof,
      collectionRatePercent: recognizedRevenueXof ? this.round(collectedRevenueXof / recognizedRevenueXof * 100) : 0,
      recurringRevenueSharePercent: revenueXof ? this.round(recurringRevenueXof / revenueXof * 100) : 0,
      grantDependencyPercent: revenueXof ? this.round(grantRevenueXof / revenueXof * 100) : 0,
      payerConcentrationPercent: revenueXof ? this.round(largestPayerRevenue / revenueXof * 100) : 0,
      costToValueRatioPercent: valueCreatedAndProtectedXof ? this.round(totalCostXof / valueCreatedAndProtectedXof * 100) : 0,
      valueCreatedAndProtectedXof,
      netCashChangeXof: collectedRevenueXof - paidCostXof,
      runwayMonths: monthlyBurn > 0 ? this.round(item.closingCashXof / monthlyBurn) : 999,
    };
  }

  private aggregateUnits(item: MbambulaanEconomicSteeringCase, mode: "capability" | "territory" | "payer"): EconomicUnitPerformance[] {
    const keys = new Set<string>();
    const keyFor = (dimension: EconomicDimension) => mode === "capability" ? dimension.capabilityId : mode === "territory" ? dimension.territoryId : dimension.payerActorId;
    for (const revenue of item.revenues) if (keyFor(revenue.dimension)) keys.add(keyFor(revenue.dimension)!);
    for (const cost of item.costs) if (keyFor(cost.dimension)) keys.add(keyFor(cost.dimension)!);
    for (const value of item.valueCreation) if (keyFor(value.dimension)) keys.add(keyFor(value.dimension)!);
    return [...keys].map((key) => {
      const revenueXof = item.revenues.filter((entry) => keyFor(entry.dimension) === key && entry.status !== "cancelled").reduce((sum, entry) => sum + entry.amountXof, 0);
      const costXof = item.costs.filter((entry) => keyFor(entry.dimension) === key).reduce((sum, entry) => sum + entry.amountXof, 0);
      const valueCreatedAndProtectedXof = item.valueCreation.filter((entry) => keyFor(entry.dimension) === key).reduce((sum, entry) => sum + entry.monetaryValueXof, 0);
      const payerCount = new Set(item.revenues.filter((entry) => keyFor(entry.dimension) === key).map((entry) => entry.dimension.payerActorId).filter(Boolean)).size;
      const operatingResultXof = revenueXof - costXof;
      return {
        key,
        revenueXof,
        costXof,
        operatingResultXof,
        marginPercent: revenueXof ? this.round(operatingResultXof / revenueXof * 100) : 0,
        valueCreatedAndProtectedXof,
        costToValueRatioPercent: valueCreatedAndProtectedXof ? this.round(costXof / valueCreatedAndProtectedXof * 100) : 0,
        payerCount,
      };
    }).sort((a, b) => b.operatingResultXof - a.operatingResultXof);
  }

  private aggregateRevenueModels(item: MbambulaanEconomicSteeringCase) {
    const models = this.unique(item.revenues.map((entry) => entry.modelType));
    return models.map((modelType) => {
      const rows = item.revenues.filter((entry) => entry.modelType === modelType && entry.status !== "cancelled");
      return {
        modelType,
        revenueXof: rows.reduce((sum, entry) => sum + entry.amountXof, 0),
        collectedRevenueXof: rows.reduce((sum, entry) => sum + entry.collectedAmountXof, 0),
        recurringRevenueXof: rows.filter((entry) => entry.recurring).reduce((sum, entry) => sum + entry.amountXof, 0),
        payerCount: new Set(rows.map((entry) => entry.dimension.payerActorId).filter(Boolean)).size,
      };
    }).sort((a, b) => b.revenueXof - a.revenueXof);
  }

  private evaluateTargets(item: MbambulaanEconomicSteeringCase, snapshot: EconomicSnapshot) {
    const valueOf = (metric: EconomicTarget["metric"]) => {
      if (metric === "revenue") return snapshot.revenueXof;
      if (metric === "gross_margin") return snapshot.revenueXof ? this.round(snapshot.grossMarginXof / snapshot.revenueXof * 100) : 0;
      if (metric === "operating_margin") return snapshot.revenueXof ? this.round(snapshot.operatingResultXof / snapshot.revenueXof * 100) : 0;
      if (metric === "collection_rate") return snapshot.collectionRatePercent;
      if (metric === "recurring_revenue_share") return snapshot.recurringRevenueSharePercent;
      if (metric === "grant_dependency") return snapshot.grantDependencyPercent;
      if (metric === "payer_concentration") return snapshot.payerConcentrationPercent;
      if (metric === "cost_to_value_ratio") return snapshot.costToValueRatioPercent;
      return snapshot.runwayMonths;
    };
    return item.targets.map((target) => {
      const actualValue = valueOf(target.metric);
      const reverse = ["grant_dependency", "payer_concentration", "cost_to_value_ratio"].includes(target.metric);
      const status = reverse
        ? actualValue >= target.criticalThreshold ? "critical" : actualValue >= target.warningThreshold ? "warning" : "on_target"
        : actualValue <= target.criticalThreshold ? "critical" : actualValue <= target.warningThreshold ? "warning" : "on_target";
      return { targetId: target.id, metric: target.metric, actualValue, targetValue: target.targetValue, status };
    });
  }

  private currentCommissionRate(item: MbambulaanEconomicSteeringCase) {
    const commissions = item.revenues.filter((entry) => entry.modelType === "transaction_commission");
    const linkedCommercialValue = item.valueCreation.filter((entry) => entry.valueType === "value_created").reduce((sum, entry) => sum + entry.monetaryValueXof, 0);
    const commissionRevenue = commissions.reduce((sum, entry) => sum + entry.amountXof, 0);
    return linkedCommercialValue > 0 ? Math.max(0.01, commissionRevenue / linkedCommercialValue * 100) : 1;
  }

  private recalculateCash(item: MbambulaanEconomicSteeringCase) {
    item.closingCashXof = item.openingCashXof
      + item.revenues.reduce((sum, entry) => sum + entry.collectedAmountXof, 0)
      - item.costs.reduce((sum, entry) => sum + entry.paidAmountXof, 0);
  }

  private assertWithinPeriod(item: MbambulaanEconomicSteeringCase, start: ISODateTime, end: ISODateTime) {
    if (start < item.periodStart || end > item.periodEnd || end < start) throw new Error("L'enregistrement est hors de la période économique.");
  }

  private monthCount(start: ISODateTime, end: ISODateTime) {
    const days = Math.max(1, (Date.parse(end) - Date.parse(start)) / 86_400_000);
    return Math.max(1, days / 30.4375);
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Période économique introuvable : ${id}.`);
    return item;
  }

  private touch(item: MbambulaanEconomicSteeringCase, updatedAt: ISODateTime, event: MbambulaanEconomicSteeringCase["events"][number]) {
    item.updatedAt = updatedAt;
    item.events.push(event);
    this.cases.set(item.id, item);
  }

  private event(id: EntityId, type: string, occurredAt: ISODateTime, actorId: EntityId | undefined, details: Record<string, unknown>) {
    return { id, type, occurredAt, actorId, details };
  }

  private unique<T>(values: T[]) {
    return [...new Set(values)];
  }

  private round(value: number) {
    return Math.round(value * 100) / 100;
  }
}
