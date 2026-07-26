import type { EntityId, ISODateTime } from "./types";

export type ValueFlowKind =
  | "sale"
  | "service"
  | "subscription"
  | "commission"
  | "contribution"
  | "subsidy"
  | "grant"
  | "insurance"
  | "financing"
  | "penalty"
  | "refund";

export type AllocationRuleKind = "fixed_amount" | "percentage" | "tiered_percentage" | "residual";
export type EconomicActorKind =
  | "fisher"
  | "crew"
  | "cooperative"
  | "buyer"
  | "processor"
  | "logistics_provider"
  | "cold_chain_provider"
  | "financial_partner"
  | "public_agency"
  | "platform"
  | "other";

export interface EcosystemEconomicActor {
  id: EntityId;
  actorKind: EconomicActorKind;
  actorId?: EntityId;
  organizationId?: EntityId;
  territoryId?: EntityId;
  financialAccountId?: EntityId;
  status: "active" | "suspended" | "inactive";
  createdAt: ISODateTime;
}

export interface ValueFlow {
  id: EntityId;
  kind: ValueFlowKind;
  territoryId?: EntityId;
  sourceEconomicActorId?: EntityId;
  destinationEconomicActorId?: EntityId;
  grossAmountXof: number;
  currency: "XOF";
  referenceType: string;
  referenceId: EntityId;
  occurredAt: ISODateTime;
  status: "expected" | "recognized" | "allocated" | "settled" | "cancelled";
  metadata: Record<string, unknown>;
}

export interface RevenueAllocationRule {
  id: EntityId;
  name: string;
  appliesToFlowKinds: ValueFlowKind[];
  referenceType?: string;
  territoryId?: EntityId;
  priority: number;
  activeFrom: ISODateTime;
  activeUntil?: ISODateTime;
  lines: RevenueAllocationRuleLine[];
  status: "draft" | "active" | "inactive";
}

export interface RevenueAllocationRuleLine {
  id: EntityId;
  beneficiaryActorKind?: EconomicActorKind;
  beneficiaryEconomicActorId?: EntityId;
  kind: AllocationRuleKind;
  fixedAmountXof?: number;
  percentage?: number;
  tiers?: Array<{
    thresholdXof: number;
    percentage: number;
  }>;
  label: string;
  order: number;
}

export interface RevenueAllocationLine {
  id: EntityId;
  allocationId: EntityId;
  beneficiaryEconomicActorId: EntityId;
  beneficiaryActorKind: EconomicActorKind;
  label: string;
  amountXof: number;
  percentageOfGross: number;
  status: "calculated" | "approved" | "settled" | "reversed";
  transactionId?: EntityId;
}

export interface RevenueAllocation {
  id: EntityId;
  valueFlowId: EntityId;
  ruleId: EntityId;
  grossAmountXof: number;
  allocatedAmountXof: number;
  unallocatedAmountXof: number;
  lines: RevenueAllocationLine[];
  status: "calculated" | "approved" | "settled" | "reversed";
  calculatedAt: ISODateTime;
  approvedAt?: ISODateTime;
  settledAt?: ISODateTime;
}

export interface EconomicUnitSnapshot {
  unitId: EntityId;
  unitType: "territory" | "cooperative" | "actor" | "service" | "platform";
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  grossValueCreatedXof: number;
  platformRevenueXof: number;
  cooperativeRevenueXof: number;
  fisherRevenueXof: number;
  serviceProviderRevenueXof: number;
  publicFundingXof: number;
  operatingCostsXof: number;
  netValueXof: number;
  takeRatePercent: number;
  flowCount: number;
  generatedAt: ISODateTime;
}

export interface UnitEconomicsModel {
  id: EntityId;
  scopeType: "service" | "territory" | "cooperative" | "platform";
  scopeId: EntityId;
  periodStart: ISODateTime;
  periodEnd: ISODateTime;
  activeUsers: number;
  transactionCount: number;
  grossMerchandiseValueXof: number;
  recurringRevenueXof: number;
  transactionRevenueXof: number;
  serviceRevenueXof: number;
  directCostsXof: number;
  variableCostsXof: number;
  contributionMarginXof: number;
  contributionMarginPercent: number;
  averageRevenuePerActiveUserXof: number;
  averageRevenuePerTransactionXof: number;
  breakEvenTransactionCount?: number;
  generatedAt: ISODateTime;
}

export interface EconomicScenario {
  id: EntityId;
  name: string;
  assumptions: {
    monthlyActiveActors: number;
    monthlyTransactions: number;
    averageTransactionValueXof: number;
    transactionTakeRatePercent: number;
    monthlySubscriptionRevenueXof: number;
    monthlyServiceRevenueXof: number;
    monthlyDirectCostsXof: number;
    monthlyVariableCostPerTransactionXof: number;
  };
  grossMerchandiseValueXof: number;
  platformRevenueXof: number;
  totalCostsXof: number;
  operatingContributionXof: number;
  operatingContributionMarginPercent: number;
  breakEvenReached: boolean;
  generatedAt: ISODateTime;
}

export class EcosystemFinanceEngine {
  private readonly economicActors = new Map<EntityId, EcosystemEconomicActor>();
  private readonly valueFlows = new Map<EntityId, ValueFlow>();
  private readonly rules = new Map<EntityId, RevenueAllocationRule>();
  private readonly allocations = new Map<EntityId, RevenueAllocation>();
  private readonly operatingCosts = new Map<EntityId, { id: EntityId; scopeType: string; scopeId: EntityId; amountXof: number; occurredAt: ISODateTime; costKind: "direct" | "variable" | "fixed"; referenceId?: EntityId }>();

  registerEconomicActor(input: EcosystemEconomicActor) {
    if (this.economicActors.has(input.id)) throw new Error(`L'acteur économique ${input.id} existe déjà.`);
    if (!input.actorId && !input.organizationId && input.actorKind !== "platform") {
      throw new Error("Un acteur économique doit référencer un acteur ou une organisation.");
    }
    this.economicActors.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  recognizeValueFlow(input: ValueFlow) {
    if (this.valueFlows.has(input.id)) return structuredClone(this.valueFlows.get(input.id)!);
    if (input.grossAmountXof <= 0) throw new Error("Le montant brut doit être positif.");
    if (input.sourceEconomicActorId) this.requireEconomicActor(input.sourceEconomicActorId);
    if (input.destinationEconomicActorId) this.requireEconomicActor(input.destinationEconomicActorId);
    const flow = { ...structuredClone(input), status: "recognized" as const };
    this.valueFlows.set(flow.id, flow);
    return structuredClone(flow);
  }

  registerAllocationRule(input: RevenueAllocationRule) {
    if (this.rules.has(input.id)) throw new Error(`La règle de répartition ${input.id} existe déjà.`);
    if (input.lines.length === 0) throw new Error("Une règle de répartition doit contenir au moins une ligne.");
    this.validateRule(input);
    this.rules.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  activateAllocationRule(input: { ruleId: EntityId }) {
    const rule = this.requireRule(input.ruleId);
    rule.status = "active";
    this.rules.set(rule.id, rule);
    return structuredClone(rule);
  }

  allocateValueFlow(input: { valueFlowId: EntityId; ruleId?: EntityId; calculatedAt: ISODateTime }) {
    const flow = this.requireFlow(input.valueFlowId);
    if (!["recognized", "allocated"].includes(flow.status)) throw new Error("Le flux ne peut pas être réparti dans son état actuel.");
    const rule = input.ruleId ? this.requireRule(input.ruleId) : this.findApplicableRule(flow);
    if (rule.status !== "active") throw new Error("La règle de répartition n'est pas active.");

    const actorByKind = this.resolveActorsForFlow(flow);
    const lines: RevenueAllocationLine[] = [];
    let remaining = flow.grossAmountXof;
    const orderedLines = [...rule.lines].sort((a, b) => a.order - b.order);

    for (const ruleLine of orderedLines) {
      const beneficiary = ruleLine.beneficiaryEconomicActorId
        ? this.requireEconomicActor(ruleLine.beneficiaryEconomicActorId)
        : ruleLine.beneficiaryActorKind
          ? actorByKind.get(ruleLine.beneficiaryActorKind)
          : undefined;
      if (!beneficiary) throw new Error(`Aucun bénéficiaire résolu pour la ligne ${ruleLine.id}.`);

      let amountXof = 0;
      if (ruleLine.kind === "fixed_amount") amountXof = ruleLine.fixedAmountXof ?? 0;
      if (ruleLine.kind === "percentage") amountXof = Math.round(flow.grossAmountXof * ((ruleLine.percentage ?? 0) / 100));
      if (ruleLine.kind === "tiered_percentage") amountXof = this.computeTieredAmount(flow.grossAmountXof, ruleLine.tiers ?? []);
      if (ruleLine.kind === "residual") amountXof = remaining;
      if (amountXof < 0) throw new Error("Une répartition ne peut pas produire un montant négatif.");
      if (amountXof > remaining) throw new Error(`La ligne ${ruleLine.id} dépasse le montant restant à répartir.`);

      remaining -= amountXof;
      lines.push({
        id: `allocation-line:${flow.id}:${ruleLine.id}`,
        allocationId: `allocation:${flow.id}`,
        beneficiaryEconomicActorId: beneficiary.id,
        beneficiaryActorKind: beneficiary.actorKind,
        label: ruleLine.label,
        amountXof,
        percentageOfGross: Math.round((amountXof / flow.grossAmountXof) * 10000) / 100,
        status: "calculated",
      });
    }

    const allocation: RevenueAllocation = {
      id: `allocation:${flow.id}`,
      valueFlowId: flow.id,
      ruleId: rule.id,
      grossAmountXof: flow.grossAmountXof,
      allocatedAmountXof: flow.grossAmountXof - remaining,
      unallocatedAmountXof: remaining,
      lines,
      status: "calculated",
      calculatedAt: input.calculatedAt,
    };
    this.allocations.set(allocation.id, allocation);
    flow.status = "allocated";
    this.valueFlows.set(flow.id, flow);
    return structuredClone(allocation);
  }

  approveAllocation(input: { allocationId: EntityId; approvedAt: ISODateTime }) {
    const allocation = this.requireAllocation(input.allocationId);
    if (allocation.status !== "calculated") throw new Error("Seule une répartition calculée peut être approuvée.");
    if (allocation.unallocatedAmountXof !== 0) throw new Error("La répartition doit être complète avant approbation.");
    allocation.status = "approved";
    allocation.approvedAt = input.approvedAt;
    allocation.lines = allocation.lines.map((line) => ({ ...line, status: "approved" }));
    this.allocations.set(allocation.id, allocation);
    return structuredClone(allocation);
  }

  markAllocationSettled(input: { allocationId: EntityId; settledAt: ISODateTime; transactionIdsByLineId: Record<EntityId, EntityId> }) {
    const allocation = this.requireAllocation(input.allocationId);
    if (allocation.status !== "approved") throw new Error("La répartition doit être approuvée avant règlement.");
    allocation.status = "settled";
    allocation.settledAt = input.settledAt;
    allocation.lines = allocation.lines.map((line) => ({
      ...line,
      status: "settled",
      transactionId: input.transactionIdsByLineId[line.id],
    }));
    this.allocations.set(allocation.id, allocation);
    const flow = this.requireFlow(allocation.valueFlowId);
    flow.status = "settled";
    this.valueFlows.set(flow.id, flow);
    return structuredClone(allocation);
  }

  recordOperatingCost(input: { id: EntityId; scopeType: string; scopeId: EntityId; amountXof: number; occurredAt: ISODateTime; costKind: "direct" | "variable" | "fixed"; referenceId?: EntityId }) {
    if (this.operatingCosts.has(input.id)) throw new Error(`Le coût ${input.id} existe déjà.`);
    if (input.amountXof < 0) throw new Error("Le coût ne peut pas être négatif.");
    this.operatingCosts.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  buildEconomicSnapshot(input: { unitId: EntityId; unitType: EconomicUnitSnapshot["unitType"]; periodStart: ISODateTime; periodEnd: ISODateTime; generatedAt: ISODateTime }) {
    const flows = [...this.valueFlows.values()].filter((flow) =>
      flow.occurredAt >= input.periodStart &&
      flow.occurredAt <= input.periodEnd &&
      this.flowBelongsToUnit(flow, input.unitType, input.unitId),
    );
    const allocations = [...this.allocations.values()].filter((allocation) => flows.some((flow) => flow.id === allocation.valueFlowId));
    const lines = allocations.flatMap((allocation) => allocation.lines);
    const actorKindById = new Map([...this.economicActors.values()].map((actor) => [actor.id, actor.actorKind]));
    const sumByKind = (kind: EconomicActorKind) => lines
      .filter((line) => actorKindById.get(line.beneficiaryEconomicActorId) === kind)
      .reduce((sum, line) => sum + line.amountXof, 0);
    const operatingCostsXof = [...this.operatingCosts.values()]
      .filter((cost) => cost.scopeType === input.unitType && cost.scopeId === input.unitId && cost.occurredAt >= input.periodStart && cost.occurredAt <= input.periodEnd)
      .reduce((sum, cost) => sum + cost.amountXof, 0);
    const grossValueCreatedXof = flows.filter((flow) => ["recognized", "allocated", "settled"].includes(flow.status)).reduce((sum, flow) => sum + flow.grossAmountXof, 0);
    const platformRevenueXof = sumByKind("platform");
    const publicFundingXof = flows.filter((flow) => ["subsidy", "grant"].includes(flow.kind)).reduce((sum, flow) => sum + flow.grossAmountXof, 0);

    return {
      unitId: input.unitId,
      unitType: input.unitType,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      grossValueCreatedXof,
      platformRevenueXof,
      cooperativeRevenueXof: sumByKind("cooperative"),
      fisherRevenueXof: sumByKind("fisher") + sumByKind("crew"),
      serviceProviderRevenueXof: sumByKind("logistics_provider") + sumByKind("cold_chain_provider") + sumByKind("processor"),
      publicFundingXof,
      operatingCostsXof,
      netValueXof: grossValueCreatedXof - operatingCostsXof,
      takeRatePercent: grossValueCreatedXof ? Math.round((platformRevenueXof / grossValueCreatedXof) * 10000) / 100 : 0,
      flowCount: flows.length,
      generatedAt: input.generatedAt,
    } satisfies EconomicUnitSnapshot;
  }

  buildUnitEconomics(input: {
    id: EntityId;
    scopeType: UnitEconomicsModel["scopeType"];
    scopeId: EntityId;
    periodStart: ISODateTime;
    periodEnd: ISODateTime;
    activeUsers: number;
    transactionCount: number;
    grossMerchandiseValueXof: number;
    recurringRevenueXof: number;
    transactionRevenueXof: number;
    serviceRevenueXof: number;
    directCostsXof: number;
    variableCostsXof: number;
    fixedCostsXof?: number;
    averageContributionPerTransactionXof?: number;
    generatedAt: ISODateTime;
  }): UnitEconomicsModel {
    const totalRevenue = input.recurringRevenueXof + input.transactionRevenueXof + input.serviceRevenueXof;
    const contributionMarginXof = totalRevenue - input.directCostsXof - input.variableCostsXof;
    const contributionMarginPercent = totalRevenue ? Math.round((contributionMarginXof / totalRevenue) * 10000) / 100 : 0;
    const contributionPerTransaction = input.averageContributionPerTransactionXof ?? (input.transactionCount ? contributionMarginXof / input.transactionCount : 0);
    const breakEvenTransactionCount = input.fixedCostsXof !== undefined && contributionPerTransaction > 0
      ? Math.ceil(input.fixedCostsXof / contributionPerTransaction)
      : undefined;
    return {
      id: input.id,
      scopeType: input.scopeType,
      scopeId: input.scopeId,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      activeUsers: input.activeUsers,
      transactionCount: input.transactionCount,
      grossMerchandiseValueXof: input.grossMerchandiseValueXof,
      recurringRevenueXof: input.recurringRevenueXof,
      transactionRevenueXof: input.transactionRevenueXof,
      serviceRevenueXof: input.serviceRevenueXof,
      directCostsXof: input.directCostsXof,
      variableCostsXof: input.variableCostsXof,
      contributionMarginXof,
      contributionMarginPercent,
      averageRevenuePerActiveUserXof: input.activeUsers ? Math.round(totalRevenue / input.activeUsers) : 0,
      averageRevenuePerTransactionXof: input.transactionCount ? Math.round(totalRevenue / input.transactionCount) : 0,
      breakEvenTransactionCount,
      generatedAt: input.generatedAt,
    };
  }

  simulateScenario(input: EconomicScenario["assumptions"] & { id: EntityId; name: string; generatedAt: ISODateTime }): EconomicScenario {
    const grossMerchandiseValueXof = input.monthlyTransactions * input.averageTransactionValueXof;
    const transactionRevenueXof = Math.round(grossMerchandiseValueXof * (input.transactionTakeRatePercent / 100));
    const platformRevenueXof = transactionRevenueXof + input.monthlySubscriptionRevenueXof + input.monthlyServiceRevenueXof;
    const totalCostsXof = input.monthlyDirectCostsXof + input.monthlyTransactions * input.monthlyVariableCostPerTransactionXof;
    const operatingContributionXof = platformRevenueXof - totalCostsXof;
    return {
      id: input.id,
      name: input.name,
      assumptions: {
        monthlyActiveActors: input.monthlyActiveActors,
        monthlyTransactions: input.monthlyTransactions,
        averageTransactionValueXof: input.averageTransactionValueXof,
        transactionTakeRatePercent: input.transactionTakeRatePercent,
        monthlySubscriptionRevenueXof: input.monthlySubscriptionRevenueXof,
        monthlyServiceRevenueXof: input.monthlyServiceRevenueXof,
        monthlyDirectCostsXof: input.monthlyDirectCostsXof,
        monthlyVariableCostPerTransactionXof: input.monthlyVariableCostPerTransactionXof,
      },
      grossMerchandiseValueXof,
      platformRevenueXof,
      totalCostsXof,
      operatingContributionXof,
      operatingContributionMarginPercent: platformRevenueXof ? Math.round((operatingContributionXof / platformRevenueXof) * 10000) / 100 : 0,
      breakEvenReached: operatingContributionXof >= 0,
      generatedAt: input.generatedAt,
    };
  }

  getRevenueArchitectureBoard(input: { periodStart: ISODateTime; periodEnd: ISODateTime }) {
    const flows = [...this.valueFlows.values()].filter((flow) => flow.occurredAt >= input.periodStart && flow.occurredAt <= input.periodEnd);
    const allocations = [...this.allocations.values()].filter((allocation) => flows.some((flow) => flow.id === allocation.valueFlowId));
    const totalGrossXof = flows.reduce((sum, flow) => sum + flow.grossAmountXof, 0);
    const allocatedXof = allocations.reduce((sum, allocation) => sum + allocation.allocatedAmountXof, 0);
    const settledXof = allocations.filter((allocation) => allocation.status === "settled").reduce((sum, allocation) => sum + allocation.allocatedAmountXof, 0);
    return {
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
      totalGrossXof,
      allocatedXof,
      settledXof,
      unallocatedXof: Math.max(0, totalGrossXof - allocatedXof),
      recognizedFlowCount: flows.filter((flow) => flow.status === "recognized").length,
      unsettledAllocationCount: allocations.filter((allocation) => allocation.status !== "settled").length,
      activeRuleCount: [...this.rules.values()].filter((rule) => rule.status === "active").length,
    };
  }

  snapshot() {
    return {
      economicActors: [...this.economicActors.values()].map((item) => structuredClone(item)),
      valueFlows: [...this.valueFlows.values()].map((item) => structuredClone(item)),
      rules: [...this.rules.values()].map((item) => structuredClone(item)),
      allocations: [...this.allocations.values()].map((item) => structuredClone(item)),
      operatingCosts: [...this.operatingCosts.values()].map((item) => structuredClone(item)),
    };
  }

  private validateRule(rule: RevenueAllocationRule) {
    const residualCount = rule.lines.filter((line) => line.kind === "residual").length;
    if (residualCount > 1) throw new Error("Une règle ne peut contenir qu'une seule ligne résiduelle.");
    for (const line of rule.lines) {
      if (!line.beneficiaryActorKind && !line.beneficiaryEconomicActorId) throw new Error(`La ligne ${line.id} n'a pas de bénéficiaire.`);
      if (line.kind === "fixed_amount" && (!line.fixedAmountXof || line.fixedAmountXof < 0)) throw new Error(`Le montant fixe de la ligne ${line.id} est invalide.`);
      if (line.kind === "percentage" && (line.percentage === undefined || line.percentage < 0 || line.percentage > 100)) throw new Error(`Le pourcentage de la ligne ${line.id} est invalide.`);
      if (line.kind === "tiered_percentage" && (!line.tiers || line.tiers.length === 0)) throw new Error(`Les paliers de la ligne ${line.id} sont absents.`);
    }
  }

  private computeTieredAmount(grossAmountXof: number, tiers: Array<{ thresholdXof: number; percentage: number }>) {
    const ordered = [...tiers].sort((a, b) => a.thresholdXof - b.thresholdXof);
    let total = 0;
    let previousThreshold = 0;
    for (const tier of ordered) {
      if (grossAmountXof <= previousThreshold) break;
      const taxable = Math.min(grossAmountXof, tier.thresholdXof) - previousThreshold;
      if (taxable > 0) total += taxable * (tier.percentage / 100);
      previousThreshold = tier.thresholdXof;
    }
    if (ordered.length && grossAmountXof > ordered.at(-1)!.thresholdXof) {
      const last = ordered.at(-1)!;
      total += (grossAmountXof - last.thresholdXof) * (last.percentage / 100);
    }
    return Math.round(total);
  }

  private resolveActorsForFlow(flow: ValueFlow) {
    const result = new Map<EconomicActorKind, EcosystemEconomicActor>();
    for (const actor of this.economicActors.values()) {
      if (actor.status !== "active") continue;
      if (flow.territoryId && actor.territoryId && actor.territoryId !== flow.territoryId) continue;
      if (!result.has(actor.actorKind)) result.set(actor.actorKind, actor);
    }
    return result;
  }

  private findApplicableRule(flow: ValueFlow) {
    const candidates = [...this.rules.values()].filter((rule) =>
      rule.status === "active" &&
      rule.appliesToFlowKinds.includes(flow.kind) &&
      (!rule.referenceType || rule.referenceType === flow.referenceType) &&
      (!rule.territoryId || rule.territoryId === flow.territoryId) &&
      rule.activeFrom <= flow.occurredAt &&
      (!rule.activeUntil || rule.activeUntil >= flow.occurredAt),
    );
    if (candidates.length === 0) throw new Error("Aucune règle de répartition applicable.");
    return candidates.sort((a, b) => b.priority - a.priority)[0];
  }

  private flowBelongsToUnit(flow: ValueFlow, unitType: EconomicUnitSnapshot["unitType"], unitId: EntityId) {
    if (unitType === "territory") return flow.territoryId === unitId;
    if (unitType === "actor") return flow.sourceEconomicActorId === unitId || flow.destinationEconomicActorId === unitId;
    if (unitType === "platform") return [...this.economicActors.values()].some((actor) => actor.id === unitId && actor.actorKind === "platform");
    return flow.referenceId === unitId || flow.sourceEconomicActorId === unitId || flow.destinationEconomicActorId === unitId;
  }

  private requireEconomicActor(id: EntityId) {
    const item = this.economicActors.get(id);
    if (!item) throw new Error(`Acteur économique introuvable : ${id}.`);
    return item;
  }

  private requireFlow(id: EntityId) {
    const item = this.valueFlows.get(id);
    if (!item) throw new Error(`Flux de valeur introuvable : ${id}.`);
    return item;
  }

  private requireRule(id: EntityId) {
    const item = this.rules.get(id);
    if (!item) throw new Error(`Règle de répartition introuvable : ${id}.`);
    return item;
  }

  private requireAllocation(id: EntityId) {
    const item = this.allocations.get(id);
    if (!item) throw new Error(`Répartition introuvable : ${id}.`);
    return item;
  }
}
