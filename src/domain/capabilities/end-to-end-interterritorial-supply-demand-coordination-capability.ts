import type { EntityId, ISODateTime } from "../infrastructures/types";

export type InterterritorialCoordinationStatus =
  | "collecting"
  | "analyzing"
  | "proposed"
  | "arbitrating"
  | "committed"
  | "executing"
  | "reconciling"
  | "completed"
  | "cancelled";

export type InterterritorialFlowType =
  | "product"
  | "cold_storage"
  | "ice"
  | "transport"
  | "processing"
  | "quality_control"
  | "market_access"
  | "financing";

export interface TerritorialSupplySignal {
  id: EntityId;
  territoryId: EntityId;
  actorId: EntityId;
  organizationId?: EntityId;
  flowType: InterterritorialFlowType;
  speciesCode?: string;
  quantity: number;
  unit: string;
  availableFrom: ISODateTime;
  availableUntil: ISODateTime;
  minimumTransferQuantity?: number;
  unitPriceXof?: number;
  qualityGrade?: string;
  traceabilityReferenceIds: EntityId[];
  sustainabilityConstraints: string[];
  evidenceIds: EntityId[];
  status: "declared" | "validated" | "partially_reserved" | "reserved" | "consumed" | "expired" | "cancelled";
}

export interface TerritorialDemandSignal {
  id: EntityId;
  territoryId: EntityId;
  actorId: EntityId;
  organizationId?: EntityId;
  flowType: InterterritorialFlowType;
  speciesCode?: string;
  requiredQuantity: number;
  coveredQuantity: number;
  unit: string;
  neededFrom: ISODateTime;
  neededUntil: ISODateTime;
  maximumUnitPriceXof?: number;
  qualityRequirements: string[];
  priority: "low" | "medium" | "high" | "critical";
  publicInterestReason?: string;
  evidenceIds: EntityId[];
  status: "open" | "partially_covered" | "covered" | "expired" | "cancelled";
}

export interface InterterritorialCapacitySignal {
  id: EntityId;
  territoryId: EntityId;
  providerActorId: EntityId;
  providerOrganizationId?: EntityId;
  flowType: Exclude<InterterritorialFlowType, "product" | "market_access" | "financing">;
  availableQuantity: number;
  reservedQuantity: number;
  unit: string;
  availableFrom: ISODateTime;
  availableUntil: ISODateTime;
  serviceCostXof?: number;
  supportedTerritoryIds: EntityId[];
  evidenceIds: EntityId[];
  status: "available" | "partially_reserved" | "reserved" | "unavailable" | "cancelled";
}

export interface InterterritorialMatchProposal {
  id: EntityId;
  supplySignalId?: EntityId;
  demandSignalId: EntityId;
  capacitySignalIds: EntityId[];
  sourceTerritoryId: EntityId;
  destinationTerritoryId: EntityId;
  proposedQuantity: number;
  unit: string;
  proposedUnitPriceXof?: number;
  estimatedLogisticsCostXof: number;
  estimatedServiceCostXof: number;
  estimatedPlatformRevenueXof: number;
  estimatedValueProtectedXof: number;
  expectedWasteAvoidedKg: number;
  expectedServiceLevelGainPercent: number;
  expectedFishingPressureEffectPercent: number;
  compatibilityScore: number;
  urgencyScore: number;
  sustainabilityScore: number;
  fairnessScore: number;
  rationale: string[];
  blockers: string[];
  recommendationId?: EntityId;
  status: "proposed" | "accepted" | "rejected" | "expired" | "executed";
  generatedAt: ISODateTime;
}

export interface InterterritorialArbitration {
  id: EntityId;
  proposalIds: EntityId[];
  arbitratedByActorId: EntityId;
  decision: "approved" | "partially_approved" | "rejected";
  approvedQuantity: number;
  budgetAuthorizedXof: number;
  conditions: string[];
  rationale: string;
  evidenceIds: EntityId[];
  decidedAt: ISODateTime;
}

export interface InterterritorialCommitment {
  id: EntityId;
  arbitrationId: EntityId;
  actorId: EntityId;
  organizationId?: EntityId;
  role: "supplier" | "buyer" | "logistics_provider" | "cold_chain_provider" | "processor" | "financier" | "territorial_authority";
  committedQuantity?: number;
  committedAmountXof?: number;
  dueAt: ISODateTime;
  status: "proposed" | "accepted" | "in_execution" | "fulfilled" | "failed" | "cancelled";
  evidenceIds: EntityId[];
  failureReason?: string;
}

export interface InterterritorialExecution {
  id: EntityId;
  arbitrationId: EntityId;
  proposalId: EntityId;
  logisticsMissionId?: EntityId;
  commercialAgreementId?: EntityId;
  financingReferenceId?: EntityId;
  insuranceReferenceId?: EntityId;
  qualityInspectionIds: EntityId[];
  traceabilityReferenceIds: EntityId[];
  dispatchedQuantity: number;
  deliveredQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  grossCommercialValueXof: number;
  logisticsCostXof: number;
  serviceCostXof: number;
  platformRevenueXof: number;
  sellerNetValueXof: number;
  status: "planned" | "dispatched" | "in_transit" | "delivered" | "accepted" | "settled" | "closed" | "cancelled";
  dispatchedAt?: ISODateTime;
  deliveredAt?: ISODateTime;
  settledAt?: ISODateTime;
  evidenceIds: EntityId[];
}

export interface InterterritorialOutcome {
  id: EntityId;
  executionId: EntityId;
  measuredAt: ISODateTime;
  sourceTerritoryId: EntityId;
  destinationTerritoryId: EntityId;
  volumeReallocatedKg: number;
  wasteAvoidedKg: number;
  valueProtectedXof: number;
  additionalSellerValueXof: number;
  buyerServiceLevelChangePercent: number;
  sourceTerritoryPressureChangePercent: number;
  destinationTerritoryPressureChangePercent: number;
  jobsSupported: number;
  beneficiaryActorCount: number;
  confidenceScore: number;
  evidenceIds: EntityId[];
  lessonsLearned: string[];
}

export interface InterterritorialCoordinationCase {
  id: EntityId;
  coordinationCode: string;
  countryId: EntityId;
  status: InterterritorialCoordinationStatus;
  territoryIds: EntityId[];
  nationalGovernanceCaseId?: EntityId;
  supplySignals: TerritorialSupplySignal[];
  demandSignals: TerritorialDemandSignal[];
  capacitySignals: InterterritorialCapacitySignal[];
  proposals: InterterritorialMatchProposal[];
  arbitrations: InterterritorialArbitration[];
  commitments: InterterritorialCommitment[];
  executions: InterterritorialExecution[];
  outcomes: InterterritorialOutcome[];
  publicProgramIds: EntityId[];
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

export interface InterterritorialCoordinationReadiness {
  caseId: EntityId;
  score: number;
  readyForArbitration: boolean;
  signalCoveragePercent: number;
  capacityCoveragePercent: number;
  evidenceCoveragePercent: number;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export class EndToEndInterterritorialSupplyDemandCoordinationCapability {
  private readonly cases = new Map<EntityId, InterterritorialCoordinationCase>();

  openCoordination(input: {
    id: EntityId;
    coordinationCode: string;
    countryId: EntityId;
    territoryIds: EntityId[];
    nationalGovernanceCaseId?: EntityId;
    createdAt: ISODateTime;
    actorId?: EntityId;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier ${input.id} existe déjà.`);
    if (new Set(input.territoryIds).size < 2) throw new Error("Une coordination interterritoriale doit couvrir au moins deux territoires.");
    const item: InterterritorialCoordinationCase = {
      id: input.id,
      coordinationCode: input.coordinationCode,
      countryId: input.countryId,
      status: "collecting",
      territoryIds: this.unique(input.territoryIds),
      nationalGovernanceCaseId: input.nationalGovernanceCaseId,
      supplySignals: [],
      demandSignals: [],
      capacitySignals: [],
      proposals: [],
      arbitrations: [],
      commitments: [],
      executions: [],
      outcomes: [],
      publicProgramIds: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      events: [this.event(`event:${input.id}:opened`, "interterritorial_coordination_opened", input.createdAt, input.actorId, { territoryIds: input.territoryIds })],
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  registerSupply(input: { caseId: EntityId; signal: TerritorialSupplySignal; actorId?: EntityId; registeredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.signal.territoryId);
    if (input.signal.quantity <= 0) throw new Error("La quantité offerte doit être positive.");
    if (input.signal.availableUntil <= input.signal.availableFrom) throw new Error("La fenêtre de disponibilité est invalide.");
    if (item.supplySignals.some((entry) => entry.id === input.signal.id)) throw new Error(`Le signal d'offre ${input.signal.id} existe déjà.`);
    item.supplySignals.push(structuredClone(input.signal));
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:supply:${input.signal.id}`, "interterritorial_supply_registered", input.registeredAt, input.actorId, { supplySignalId: input.signal.id, territoryId: input.signal.territoryId, quantity: input.signal.quantity }));
    return structuredClone(item);
  }

  registerDemand(input: { caseId: EntityId; signal: TerritorialDemandSignal; actorId?: EntityId; registeredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.signal.territoryId);
    if (input.signal.requiredQuantity <= 0) throw new Error("La quantité demandée doit être positive.");
    if (input.signal.neededUntil <= input.signal.neededFrom) throw new Error("La fenêtre de besoin est invalide.");
    if (item.demandSignals.some((entry) => entry.id === input.signal.id)) throw new Error(`Le signal de demande ${input.signal.id} existe déjà.`);
    item.demandSignals.push(structuredClone(input.signal));
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:demand:${input.signal.id}`, "interterritorial_demand_registered", input.registeredAt, input.actorId, { demandSignalId: input.signal.id, territoryId: input.signal.territoryId, quantity: input.signal.requiredQuantity, priority: input.signal.priority }));
    return structuredClone(item);
  }

  registerCapacity(input: { caseId: EntityId; signal: InterterritorialCapacitySignal; actorId?: EntityId; registeredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    this.requireTerritory(item, input.signal.territoryId);
    for (const territoryId of input.signal.supportedTerritoryIds) this.requireTerritory(item, territoryId);
    if (input.signal.availableQuantity <= 0) throw new Error("La capacité disponible doit être positive.");
    if (item.capacitySignals.some((entry) => entry.id === input.signal.id)) throw new Error(`Le signal de capacité ${input.signal.id} existe déjà.`);
    item.capacitySignals.push(structuredClone(input.signal));
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:capacity:${input.signal.id}`, "interterritorial_capacity_registered", input.registeredAt, input.actorId, { capacitySignalId: input.signal.id, flowType: input.signal.flowType, territoryId: input.signal.territoryId }));
    return structuredClone(item);
  }

  generateProposal(input: {
    caseId: EntityId;
    proposalId: EntityId;
    supplySignalId?: EntityId;
    demandSignalId: EntityId;
    capacitySignalIds: EntityId[];
    proposedQuantity: number;
    proposedUnitPriceXof?: number;
    estimatedLogisticsCostXof: number;
    estimatedServiceCostXof: number;
    estimatedPlatformRevenueXof: number;
    estimatedValueProtectedXof: number;
    expectedWasteAvoidedKg: number;
    expectedServiceLevelGainPercent: number;
    expectedFishingPressureEffectPercent: number;
    compatibilityScore: number;
    urgencyScore: number;
    sustainabilityScore: number;
    fairnessScore: number;
    rationale: string[];
    recommendationId?: EntityId;
    generatedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    if (item.proposals.some((entry) => entry.id === input.proposalId)) throw new Error(`La proposition ${input.proposalId} existe déjà.`);
    const demand = this.requireDemand(item, input.demandSignalId);
    const supply = input.supplySignalId ? this.requireSupply(item, input.supplySignalId) : undefined;
    const capacities = input.capacitySignalIds.map((id) => this.requireCapacity(item, id));
    const blockers: string[] = [];
    if (input.proposedQuantity <= 0) blockers.push("La quantité proposée doit être positive.");
    if (input.proposedQuantity > demand.requiredQuantity - demand.coveredQuantity) blockers.push("La quantité proposée dépasse le besoin restant.");
    if (supply && input.proposedQuantity > supply.quantity) blockers.push("La quantité proposée dépasse l'offre disponible.");
    if (supply && supply.flowType !== demand.flowType) blockers.push("Le type d'offre ne correspond pas au type de demande.");
    if (supply && supply.speciesCode && demand.speciesCode && supply.speciesCode !== demand.speciesCode) blockers.push("L'espèce proposée ne correspond pas à la demande.");
    if (supply && supply.unit !== demand.unit) blockers.push("L'unité de l'offre ne correspond pas à la demande.");
    if (supply && input.proposedUnitPriceXof !== undefined && demand.maximumUnitPriceXof !== undefined && input.proposedUnitPriceXof > demand.maximumUnitPriceXof) blockers.push("Le prix proposé dépasse le prix maximum accepté.");
    if (supply && supply.sustainabilityConstraints.length > 0 && input.sustainabilityScore < 50) blockers.push("Le score de durabilité est insuffisant au regard des contraintes déclarées.");
    if (input.compatibilityScore < 50) blockers.push("La compatibilité globale est insuffisante.");
    if (capacities.some((capacity) => !capacity.supportedTerritoryIds.includes(demand.territoryId))) blockers.push("Une capacité sélectionnée ne dessert pas le territoire destinataire.");

    const proposal: InterterritorialMatchProposal = {
      id: input.proposalId,
      supplySignalId: input.supplySignalId,
      demandSignalId: demand.id,
      capacitySignalIds: [...input.capacitySignalIds],
      sourceTerritoryId: supply?.territoryId ?? capacities[0]?.territoryId ?? demand.territoryId,
      destinationTerritoryId: demand.territoryId,
      proposedQuantity: input.proposedQuantity,
      unit: demand.unit,
      proposedUnitPriceXof: input.proposedUnitPriceXof,
      estimatedLogisticsCostXof: input.estimatedLogisticsCostXof,
      estimatedServiceCostXof: input.estimatedServiceCostXof,
      estimatedPlatformRevenueXof: input.estimatedPlatformRevenueXof,
      estimatedValueProtectedXof: input.estimatedValueProtectedXof,
      expectedWasteAvoidedKg: input.expectedWasteAvoidedKg,
      expectedServiceLevelGainPercent: input.expectedServiceLevelGainPercent,
      expectedFishingPressureEffectPercent: input.expectedFishingPressureEffectPercent,
      compatibilityScore: input.compatibilityScore,
      urgencyScore: input.urgencyScore,
      sustainabilityScore: input.sustainabilityScore,
      fairnessScore: input.fairnessScore,
      rationale: [...input.rationale],
      blockers,
      recommendationId: input.recommendationId,
      status: "proposed",
      generatedAt: input.generatedAt,
    };
    item.proposals.push(proposal);
    item.status = "proposed";
    this.touch(item, input.generatedAt, this.event(`event:${item.id}:proposal:${proposal.id}`, "interterritorial_match_proposed", input.generatedAt, input.actorId, { proposalId: proposal.id, blockers, compatibilityScore: proposal.compatibilityScore }));
    return structuredClone(proposal);
  }

  assessReadiness(input: { caseId: EntityId; generatedAt: ISODateTime }): InterterritorialCoordinationReadiness {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    const warnings: string[] = [];
    const activeSupplies = item.supplySignals.filter((entry) => ["declared", "validated", "partially_reserved"].includes(entry.status));
    const activeDemands = item.demandSignals.filter((entry) => ["open", "partially_covered"].includes(entry.status));
    if (!activeSupplies.length) blockers.push("Aucune offre active n'est disponible.");
    if (!activeDemands.length) blockers.push("Aucune demande active n'est disponible.");
    if (!item.proposals.length) blockers.push("Aucune proposition de coordination n'est générée.");
    const validProposals = item.proposals.filter((entry) => entry.blockers.length === 0 && entry.status === "proposed");
    if (!validProposals.length) blockers.push("Aucune proposition sans blocage n'est disponible.");
    const involvedTerritories = new Set([...activeSupplies.map((entry) => entry.territoryId), ...activeDemands.map((entry) => entry.territoryId)]);
    const signalCoveragePercent = this.round(involvedTerritories.size / item.territoryIds.length * 100);
    const requiredCapacityTypes = new Set(validProposals.flatMap((proposal) => proposal.capacitySignalIds.map((id) => this.requireCapacity(item, id).flowType)));
    const availableCapacityTypes = new Set(item.capacitySignals.filter((entry) => entry.status !== "unavailable" && entry.status !== "cancelled").map((entry) => entry.flowType));
    const capacityCoveragePercent = requiredCapacityTypes.size
      ? this.round([...requiredCapacityTypes].filter((type) => availableCapacityTypes.has(type)).length / requiredCapacityTypes.size * 100)
      : 100;
    if (capacityCoveragePercent < 100) warnings.push("Certaines capacités nécessaires ne sont pas couvertes.");
    const evidenceObjects = [
      ...activeSupplies.map((entry) => entry.evidenceIds.length > 0),
      ...activeDemands.map((entry) => entry.evidenceIds.length > 0),
      ...item.capacitySignals.map((entry) => entry.evidenceIds.length > 0),
    ];
    const evidenceCoveragePercent = evidenceObjects.length ? this.round(evidenceObjects.filter(Boolean).length / evidenceObjects.length * 100) : 0;
    if (evidenceCoveragePercent < 70) warnings.push("La couverture des preuves est inférieure à 70 %.");
    if (!item.nationalGovernanceCaseId && item.territoryIds.length > 3) warnings.push("Aucun dossier national n'est relié à une coordination étendue.");
    const score = Math.max(0, Math.min(100, 100 - blockers.length * 18 - warnings.length * 5));
    item.blockers = blockers;
    item.warnings = warnings;
    if (blockers.length === 0) item.status = "arbitrating";
    this.cases.set(item.id, item);
    return { caseId: item.id, score, readyForArbitration: blockers.length === 0, signalCoveragePercent, capacityCoveragePercent, evidenceCoveragePercent, blockers, warnings, generatedAt: input.generatedAt };
  }

  recordArbitration(input: { caseId: EntityId; arbitration: InterterritorialArbitration }) {
    const item = this.requireCase(input.caseId);
    if (item.arbitrations.some((entry) => entry.id === input.arbitration.id)) throw new Error(`L'arbitrage ${input.arbitration.id} existe déjà.`);
    const proposals = input.arbitration.proposalIds.map((id) => this.requireProposal(item, id));
    if (proposals.some((entry) => entry.blockers.length > 0) && input.arbitration.decision !== "rejected") throw new Error("Une proposition bloquée ne peut pas être approuvée.");
    if (input.arbitration.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour arbitrer.");
    if (input.arbitration.approvedQuantity < 0) throw new Error("La quantité approuvée ne peut pas être négative.");
    item.arbitrations.push(structuredClone(input.arbitration));
    for (const proposal of proposals) {
      proposal.status = input.arbitration.decision === "rejected" ? "rejected" : "accepted";
    }
    item.status = input.arbitration.decision === "rejected" ? "analyzing" : "committed";
    this.touch(item, input.arbitration.decidedAt, this.event(`event:${item.id}:arbitration:${input.arbitration.id}`, "interterritorial_arbitration_recorded", input.arbitration.decidedAt, input.arbitration.arbitratedByActorId, { arbitrationId: input.arbitration.id, decision: input.arbitration.decision, approvedQuantity: input.arbitration.approvedQuantity }));
    return structuredClone(item);
  }

  registerCommitment(input: { caseId: EntityId; commitment: InterterritorialCommitment; registeredAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    this.requireArbitration(item, input.commitment.arbitrationId);
    if (item.commitments.some((entry) => entry.id === input.commitment.id)) throw new Error(`L'engagement ${input.commitment.id} existe déjà.`);
    item.commitments.push(structuredClone(input.commitment));
    this.touch(item, input.registeredAt, this.event(`event:${item.id}:commitment:${input.commitment.id}`, "interterritorial_commitment_registered", input.registeredAt, input.commitment.actorId, { commitmentId: input.commitment.id, role: input.commitment.role }));
    return structuredClone(item);
  }

  updateCommitment(input: { caseId: EntityId; commitmentId: EntityId; status: InterterritorialCommitment["status"]; evidenceIds?: EntityId[]; failureReason?: string; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const commitment = this.requireCommitment(item, input.commitmentId);
    commitment.status = input.status;
    if (input.evidenceIds) commitment.evidenceIds = this.unique([...commitment.evidenceIds, ...input.evidenceIds]);
    if (input.failureReason) commitment.failureReason = input.failureReason;
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:commitment-update:${commitment.id}`, "interterritorial_commitment_updated", input.updatedAt, input.actorId, { commitmentId: commitment.id, status: commitment.status }));
    return structuredClone(item);
  }

  openExecution(input: { caseId: EntityId; execution: InterterritorialExecution; openedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const arbitration = this.requireArbitration(item, input.execution.arbitrationId);
    const proposal = this.requireProposal(item, input.execution.proposalId);
    if (arbitration.decision === "rejected" || proposal.status !== "accepted") throw new Error("L'exécution nécessite une proposition approuvée.");
    const requiredRoles: InterterritorialCommitment["role"][] = ["supplier", "buyer", "logistics_provider", "territorial_authority"];
    const acceptedRoles = new Set(item.commitments.filter((entry) => entry.arbitrationId === arbitration.id && ["accepted", "in_execution", "fulfilled"].includes(entry.status)).map((entry) => entry.role));
    const missingRoles = requiredRoles.filter((role) => !acceptedRoles.has(role));
    if (missingRoles.length > 0) throw new Error(`Des engagements essentiels manquent : ${missingRoles.join(", ")}.`);
    if (item.executions.some((entry) => entry.id === input.execution.id)) throw new Error(`L'exécution ${input.execution.id} existe déjà.`);
    item.executions.push(structuredClone(input.execution));
    item.status = "executing";
    this.touch(item, input.openedAt, this.event(`event:${item.id}:execution:${input.execution.id}`, "interterritorial_execution_opened", input.openedAt, input.actorId, { executionId: input.execution.id, proposalId: input.execution.proposalId }));
    return structuredClone(item);
  }

  dispatch(input: { caseId: EntityId; executionId: EntityId; quantity: number; dispatchedAt: ISODateTime; evidenceIds: EntityId[]; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const execution = this.requireExecution(item, input.executionId);
    const proposal = this.requireProposal(item, execution.proposalId);
    if (execution.status !== "planned") throw new Error("L'exécution n'est pas prête à être expédiée.");
    if (input.quantity <= 0 || input.quantity > proposal.proposedQuantity) throw new Error("La quantité expédiée est invalide.");
    execution.dispatchedQuantity = input.quantity;
    execution.dispatchedAt = input.dispatchedAt;
    execution.status = "dispatched";
    execution.evidenceIds = this.unique([...execution.evidenceIds, ...input.evidenceIds]);
    this.reserveSignals(item, proposal, input.quantity);
    this.touch(item, input.dispatchedAt, this.event(`event:${item.id}:dispatch:${execution.id}`, "interterritorial_dispatch_recorded", input.dispatchedAt, input.actorId, { executionId: execution.id, quantity: input.quantity }));
    return structuredClone(item);
  }

  recordDelivery(input: { caseId: EntityId; executionId: EntityId; deliveredQuantity: number; deliveredAt: ISODateTime; traceabilityReferenceIds: EntityId[]; qualityInspectionIds?: EntityId[]; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const execution = this.requireExecution(item, input.executionId);
    if (! ["dispatched", "in_transit"].includes(execution.status)) throw new Error("L'exécution n'est pas en cours de livraison.");
    if (input.deliveredQuantity <= 0 || input.deliveredQuantity > execution.dispatchedQuantity) throw new Error("La quantité livrée est invalide.");
    execution.deliveredQuantity = input.deliveredQuantity;
    execution.deliveredAt = input.deliveredAt;
    execution.traceabilityReferenceIds = this.unique([...execution.traceabilityReferenceIds, ...input.traceabilityReferenceIds]);
    execution.qualityInspectionIds = this.unique([...execution.qualityInspectionIds, ...(input.qualityInspectionIds ?? [])]);
    execution.status = "delivered";
    this.touch(item, input.deliveredAt, this.event(`event:${item.id}:delivery:${execution.id}`, "interterritorial_delivery_recorded", input.deliveredAt, input.actorId, { executionId: execution.id, deliveredQuantity: input.deliveredQuantity }));
    return structuredClone(item);
  }

  acceptDelivery(input: { caseId: EntityId; executionId: EntityId; acceptedQuantity: number; rejectedQuantity: number; grossCommercialValueXof: number; logisticsCostXof: number; serviceCostXof: number; platformRevenueXof: number; sellerNetValueXof: number; acceptedAt: ISODateTime; evidenceIds: EntityId[]; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const execution = this.requireExecution(item, input.executionId);
    if (execution.status !== "delivered") throw new Error("La livraison doit être enregistrée avant acceptation.");
    if (input.acceptedQuantity < 0 || input.rejectedQuantity < 0 || input.acceptedQuantity + input.rejectedQuantity > execution.deliveredQuantity) throw new Error("Les quantités acceptées et rejetées sont invalides.");
    if (input.platformRevenueXof + input.sellerNetValueXof + input.logisticsCostXof + input.serviceCostXof > input.grossCommercialValueXof) throw new Error("La répartition économique dépasse la valeur commerciale brute.");
    execution.acceptedQuantity = input.acceptedQuantity;
    execution.rejectedQuantity = input.rejectedQuantity;
    execution.grossCommercialValueXof = input.grossCommercialValueXof;
    execution.logisticsCostXof = input.logisticsCostXof;
    execution.serviceCostXof = input.serviceCostXof;
    execution.platformRevenueXof = input.platformRevenueXof;
    execution.sellerNetValueXof = input.sellerNetValueXof;
    execution.status = "accepted";
    execution.evidenceIds = this.unique([...execution.evidenceIds, ...input.evidenceIds]);
    this.coverDemand(item, execution, input.acceptedQuantity);
    this.touch(item, input.acceptedAt, this.event(`event:${item.id}:accepted:${execution.id}`, "interterritorial_delivery_accepted", input.acceptedAt, input.actorId, { executionId: execution.id, acceptedQuantity: input.acceptedQuantity, rejectedQuantity: input.rejectedQuantity }));
    return structuredClone(item);
  }

  settleExecution(input: { caseId: EntityId; executionId: EntityId; settlementReferenceIds: EntityId[]; settledAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const execution = this.requireExecution(item, input.executionId);
    if (execution.status !== "accepted") throw new Error("L'exécution doit être acceptée avant règlement.");
    if (input.settlementReferenceIds.length === 0) throw new Error("Une preuve de règlement est obligatoire.");
    execution.status = "settled";
    execution.settledAt = input.settledAt;
    execution.evidenceIds = this.unique([...execution.evidenceIds, ...input.settlementReferenceIds]);
    item.status = "reconciling";
    this.touch(item, input.settledAt, this.event(`event:${item.id}:settled:${execution.id}`, "interterritorial_execution_settled", input.settledAt, input.actorId, { executionId: execution.id, settlementReferenceIds: input.settlementReferenceIds }));
    return structuredClone(item);
  }

  recordOutcome(input: { caseId: EntityId; outcome: InterterritorialOutcome; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (item.outcomes.some((entry) => entry.id === input.outcome.id)) throw new Error(`Le résultat ${input.outcome.id} existe déjà.`);
    const execution = this.requireExecution(item, input.outcome.executionId);
    if (execution.status !== "settled" && execution.status !== "closed") throw new Error("Le résultat ne peut être mesuré qu'après règlement.");
    if (input.outcome.evidenceIds.length === 0) throw new Error("Une preuve est obligatoire pour mesurer le résultat.");
    item.outcomes.push(structuredClone(input.outcome));
    execution.status = "closed";
    const proposal = this.requireProposal(item, execution.proposalId);
    proposal.status = "executed";
    this.fulfillCommitments(item, execution.arbitrationId, input.outcome.evidenceIds);
    if (item.executions.every((entry) => ["closed", "cancelled"].includes(entry.status))) item.status = "completed";
    this.touch(item, input.outcome.measuredAt, this.event(`event:${item.id}:outcome:${input.outcome.id}`, "interterritorial_outcome_recorded", input.outcome.measuredAt, input.actorId, { outcomeId: input.outcome.id, valueProtectedXof: input.outcome.valueProtectedXof, volumeReallocatedKg: input.outcome.volumeReallocatedKg }));
    return structuredClone(item);
  }

  attachPublicProgram(input: { caseId: EntityId; publicProgramId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.publicProgramIds = this.unique([...item.publicProgramIds, input.publicProgramId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:program:${input.publicProgramId}`, "interterritorial_public_program_attached", input.attachedAt, input.actorId, { publicProgramId: input.publicProgramId }));
    return structuredClone(item);
  }

  attachDocument(input: { caseId: EntityId; documentId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.documentIds = this.unique([...item.documentIds, input.documentId]);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:document:${input.documentId}`, "interterritorial_document_attached", input.attachedAt, input.actorId, { documentId: input.documentId }));
    return structuredClone(item);
  }

  getInterterritorialCommandCenter(input: { caseId: EntityId; generatedAt: ISODateTime }) {
    const item = this.requireCase(input.caseId);
    return {
      caseId: item.id,
      coordinationCode: item.coordinationCode,
      status: item.status,
      readiness: this.assessReadiness({ caseId: item.id, generatedAt: input.generatedAt }),
      territoryIds: [...item.territoryIds],
      openDemandCount: item.demandSignals.filter((entry) => ["open", "partially_covered"].includes(entry.status)).length,
      activeSupplyCount: item.supplySignals.filter((entry) => ["declared", "validated", "partially_reserved"].includes(entry.status)).length,
      activeCapacityCount: item.capacitySignals.filter((entry) => ["available", "partially_reserved"].includes(entry.status)).length,
      proposals: item.proposals.map((entry) => structuredClone(entry)),
      arbitrations: item.arbitrations.map((entry) => structuredClone(entry)),
      commitmentsAtRisk: item.commitments.filter((entry) => entry.status === "failed" || (entry.status !== "fulfilled" && entry.dueAt < input.generatedAt)).map((entry) => structuredClone(entry)),
      activeExecutions: item.executions.filter((entry) => !["closed", "cancelled"].includes(entry.status)).map((entry) => structuredClone(entry)),
      outcomes: item.outcomes.map((entry) => structuredClone(entry)),
      totalVolumeReallocatedKg: item.outcomes.reduce((sum, entry) => sum + entry.volumeReallocatedKg, 0),
      totalWasteAvoidedKg: item.outcomes.reduce((sum, entry) => sum + entry.wasteAvoidedKg, 0),
      totalValueProtectedXof: item.outcomes.reduce((sum, entry) => sum + entry.valueProtectedXof, 0),
      totalAdditionalSellerValueXof: item.outcomes.reduce((sum, entry) => sum + entry.additionalSellerValueXof, 0),
      totalPlatformRevenueXof: item.executions.reduce((sum, entry) => sum + entry.platformRevenueXof, 0),
      totalJobsSupported: item.outcomes.reduce((sum, entry) => sum + entry.jobsSupported, 0),
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private reserveSignals(item: InterterritorialCoordinationCase, proposal: InterterritorialMatchProposal, quantity: number) {
    if (proposal.supplySignalId) {
      const supply = this.requireSupply(item, proposal.supplySignalId);
      const previouslyReserved = item.executions.filter((execution) => execution.proposalId === proposal.id).reduce((sum, execution) => sum + execution.dispatchedQuantity, 0);
      const totalReserved = previouslyReserved + quantity;
      supply.status = totalReserved >= supply.quantity ? "reserved" : "partially_reserved";
    }
    for (const capacityId of proposal.capacitySignalIds) {
      const capacity = this.requireCapacity(item, capacityId);
      capacity.reservedQuantity = Math.min(capacity.availableQuantity, capacity.reservedQuantity + quantity);
      capacity.status = capacity.reservedQuantity >= capacity.availableQuantity ? "reserved" : "partially_reserved";
    }
  }

  private coverDemand(item: InterterritorialCoordinationCase, execution: InterterritorialExecution, acceptedQuantity: number) {
    const proposal = this.requireProposal(item, execution.proposalId);
    const demand = this.requireDemand(item, proposal.demandSignalId);
    demand.coveredQuantity += acceptedQuantity;
    demand.status = demand.coveredQuantity >= demand.requiredQuantity ? "covered" : "partially_covered";
  }

  private fulfillCommitments(item: InterterritorialCoordinationCase, arbitrationId: EntityId, evidenceIds: EntityId[]) {
    for (const commitment of item.commitments.filter((entry) => entry.arbitrationId === arbitrationId && !["failed", "cancelled"].includes(entry.status))) {
      commitment.status = "fulfilled";
      commitment.evidenceIds = this.unique([...commitment.evidenceIds, ...evidenceIds]);
    }
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier de coordination introuvable : ${id}.`);
    return item;
  }

  private requireTerritory(item: InterterritorialCoordinationCase, territoryId: EntityId) {
    if (!item.territoryIds.includes(territoryId)) throw new Error(`Territoire hors périmètre : ${territoryId}.`);
  }

  private requireSupply(item: InterterritorialCoordinationCase, id: EntityId) {
    const signal = item.supplySignals.find((entry) => entry.id === id);
    if (!signal) throw new Error(`Signal d'offre introuvable : ${id}.`);
    return signal;
  }

  private requireDemand(item: InterterritorialCoordinationCase, id: EntityId) {
    const signal = item.demandSignals.find((entry) => entry.id === id);
    if (!signal) throw new Error(`Signal de demande introuvable : ${id}.`);
    return signal;
  }

  private requireCapacity(item: InterterritorialCoordinationCase, id: EntityId) {
    const signal = item.capacitySignals.find((entry) => entry.id === id);
    if (!signal) throw new Error(`Signal de capacité introuvable : ${id}.`);
    return signal;
  }

  private requireProposal(item: InterterritorialCoordinationCase, id: EntityId) {
    const proposal = item.proposals.find((entry) => entry.id === id);
    if (!proposal) throw new Error(`Proposition introuvable : ${id}.`);
    return proposal;
  }

  private requireArbitration(item: InterterritorialCoordinationCase, id: EntityId) {
    const arbitration = item.arbitrations.find((entry) => entry.id === id);
    if (!arbitration) throw new Error(`Arbitrage introuvable : ${id}.`);
    return arbitration;
  }

  private requireCommitment(item: InterterritorialCoordinationCase, id: EntityId) {
    const commitment = item.commitments.find((entry) => entry.id === id);
    if (!commitment) throw new Error(`Engagement introuvable : ${id}.`);
    return commitment;
  }

  private requireExecution(item: InterterritorialCoordinationCase, id: EntityId) {
    const execution = item.executions.find((entry) => entry.id === id);
    if (!execution) throw new Error(`Exécution introuvable : ${id}.`);
    return execution;
  }

  private touch(item: InterterritorialCoordinationCase, updatedAt: ISODateTime, event: InterterritorialCoordinationCase["events"][number]) {
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
