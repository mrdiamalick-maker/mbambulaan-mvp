import type { EntityId, ISODateTime } from "../infrastructures/types";

export type FishingCampaignStatus =
  | "draft"
  | "planned"
  | "funding"
  | "ready"
  | "at_sea"
  | "landed"
  | "quality_checked"
  | "marketed"
  | "settled"
  | "closed"
  | "cancelled";

export interface FishingCampaignResourcePlan {
  vesselId: EntityId;
  crewMemberIds: EntityId[];
  gearIds: EntityId[];
  fuelQuantityLiters: number;
  iceQuantityKg: number;
  coldStorageCapacityKg?: number;
  transportCapacityKg?: number;
  landingSiteId: EntityId;
  fishingZoneId?: EntityId;
  targetSpeciesCodes: string[];
}

export interface FishingCampaignFinancialPlan {
  estimatedCostXof: number;
  financingRequestId?: EntityId;
  insurancePolicyId?: EntityId;
  advanceTransactionId?: EntityId;
  settlementAllocationId?: EntityId;
}

export interface FishingCampaignCommercialPlan {
  demandSignalIds: EntityId[];
  buyerIds: EntityId[];
  expectedQuantityKg: number;
  targetPriceXofPerKg?: number;
  marketplaceOfferIds: EntityId[];
  reservationIds: EntityId[];
}

export interface FishingCampaignQualityPlan {
  inspectionId?: EntityId;
  traceabilityLotIds: EntityId[];
  certificateIds: EntityId[];
  temperatureMonitoringIds: EntityId[];
}

export interface FishingCampaignEvent {
  id: EntityId;
  campaignId: EntityId;
  type:
    | "campaign_created"
    | "plan_approved"
    | "financing_requested"
    | "financing_approved"
    | "resources_reserved"
    | "departure_recorded"
    | "landing_recorded"
    | "quality_validated"
    | "offer_published"
    | "sale_reserved"
    | "settlement_completed"
    | "campaign_closed"
    | "campaign_cancelled";
  occurredAt: ISODateTime;
  actorId?: EntityId;
  referenceId?: EntityId;
  payload: Record<string, unknown>;
}

export interface FishingCampaign {
  id: EntityId;
  cooperativeId?: EntityId;
  fisherActorId: EntityId;
  territoryId: EntityId;
  campaignCode: string;
  plannedDepartureAt: ISODateTime;
  plannedReturnAt: ISODateTime;
  actualDepartureAt?: ISODateTime;
  actualReturnAt?: ISODateTime;
  status: FishingCampaignStatus;
  objective: string;
  resourcePlan: FishingCampaignResourcePlan;
  financialPlan: FishingCampaignFinancialPlan;
  commercialPlan: FishingCampaignCommercialPlan;
  qualityPlan: FishingCampaignQualityPlan;
  resourcePlanId?: EntityId;
  logisticsMissionId?: EntityId;
  sustainabilityAssessmentId?: EntityId;
  decisionRecommendationIds: EntityId[];
  ministryAlertIds: EntityId[];
  landedQuantityKg?: number;
  soldQuantityKg?: number;
  rejectedQuantityKg?: number;
  grossRevenueXof?: number;
  netRevenueXof?: number;
  events: FishingCampaignEvent[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface FishingCampaignReadiness {
  campaignId: EntityId;
  score: number;
  ready: boolean;
  blockingItems: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export interface FishingCampaignClosure {
  campaignId: EntityId;
  landedQuantityKg: number;
  soldQuantityKg: number;
  rejectedQuantityKg: number;
  grossRevenueXof: number;
  totalCostXof: number;
  netRevenueXof: number;
  saleThroughRatePercent: number;
  rejectionRatePercent: number;
  marginPercent: number;
  closedAt: ISODateTime;
}

export class EndToEndFishingCampaignCapability {
  private readonly campaigns = new Map<EntityId, FishingCampaign>();

  createCampaign(input: Omit<FishingCampaign, "status" | "events" | "createdAt" | "updatedAt"> & { createdAt: ISODateTime }) {
    if (this.campaigns.has(input.id)) throw new Error(`La campagne ${input.id} existe déjà.`);
    if (input.plannedReturnAt <= input.plannedDepartureAt) throw new Error("La date de retour doit être postérieure au départ.");
    if (input.resourcePlan.crewMemberIds.length === 0) throw new Error("Une campagne doit disposer d'un équipage.");
    if (input.resourcePlan.targetSpeciesCodes.length === 0) throw new Error("Une campagne doit définir au moins une espèce cible.");
    const campaign: FishingCampaign = {
      ...structuredClone(input),
      status: "draft",
      events: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
    };
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:created`,
      campaignId: campaign.id,
      type: "campaign_created",
      occurredAt: input.createdAt,
      actorId: campaign.fisherActorId,
      payload: { campaignCode: campaign.campaignCode },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  linkOperationalPlan(input: {
    campaignId: EntityId;
    resourcePlanId: EntityId;
    sustainabilityAssessmentId?: EntityId;
    decisionRecommendationIds?: EntityId[];
    approvedAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["draft"]);
    campaign.resourcePlanId = input.resourcePlanId;
    campaign.sustainabilityAssessmentId = input.sustainabilityAssessmentId;
    campaign.decisionRecommendationIds = [...new Set(input.decisionRecommendationIds ?? [])];
    campaign.status = "planned";
    campaign.updatedAt = input.approvedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:plan-approved`,
      campaignId: campaign.id,
      type: "plan_approved",
      occurredAt: input.approvedAt,
      actorId: input.actorId,
      referenceId: input.resourcePlanId,
      payload: { sustainabilityAssessmentId: input.sustainabilityAssessmentId },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  requestFinancing(input: {
    campaignId: EntityId;
    financingRequestId: EntityId;
    requestedAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["planned", "funding"]);
    campaign.financialPlan.financingRequestId = input.financingRequestId;
    campaign.status = "funding";
    campaign.updatedAt = input.requestedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:financing-requested`,
      campaignId: campaign.id,
      type: "financing_requested",
      occurredAt: input.requestedAt,
      actorId: input.actorId,
      referenceId: input.financingRequestId,
      payload: { estimatedCostXof: campaign.financialPlan.estimatedCostXof },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  approveFinancing(input: {
    campaignId: EntityId;
    advanceTransactionId?: EntityId;
    insurancePolicyId?: EntityId;
    approvedAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["funding", "planned"]);
    campaign.financialPlan.advanceTransactionId = input.advanceTransactionId;
    campaign.financialPlan.insurancePolicyId = input.insurancePolicyId;
    campaign.updatedAt = input.approvedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:financing-approved`,
      campaignId: campaign.id,
      type: "financing_approved",
      occurredAt: input.approvedAt,
      actorId: input.actorId,
      referenceId: input.advanceTransactionId ?? input.insurancePolicyId,
      payload: {},
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  reserveResources(input: {
    campaignId: EntityId;
    logisticsMissionId: EntityId;
    reservedAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["planned", "funding"]);
    campaign.logisticsMissionId = input.logisticsMissionId;
    const readiness = this.evaluateReadiness({ campaignId: campaign.id, generatedAt: input.reservedAt });
    if (!readiness.ready) throw new Error(`Campagne non prête : ${readiness.blockingItems.join("; ")}`);
    campaign.status = "ready";
    campaign.updatedAt = input.reservedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:resources-reserved`,
      campaignId: campaign.id,
      type: "resources_reserved",
      occurredAt: input.reservedAt,
      actorId: input.actorId,
      referenceId: input.logisticsMissionId,
      payload: { readinessScore: readiness.score },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  recordDeparture(input: { campaignId: EntityId; departedAt: ISODateTime; actorId: EntityId }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["ready"]);
    campaign.actualDepartureAt = input.departedAt;
    campaign.status = "at_sea";
    campaign.updatedAt = input.departedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:departure`,
      campaignId: campaign.id,
      type: "departure_recorded",
      occurredAt: input.departedAt,
      actorId: input.actorId,
      payload: {},
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  recordLanding(input: {
    campaignId: EntityId;
    returnedAt: ISODateTime;
    landedQuantityKg: number;
    traceabilityLotIds: EntityId[];
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["at_sea"]);
    if (input.landedQuantityKg < 0) throw new Error("La quantité débarquée ne peut pas être négative.");
    campaign.actualReturnAt = input.returnedAt;
    campaign.landedQuantityKg = input.landedQuantityKg;
    campaign.qualityPlan.traceabilityLotIds = [...new Set(input.traceabilityLotIds)];
    campaign.status = "landed";
    campaign.updatedAt = input.returnedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:landing`,
      campaignId: campaign.id,
      type: "landing_recorded",
      occurredAt: input.returnedAt,
      actorId: input.actorId,
      payload: { landedQuantityKg: input.landedQuantityKg },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  validateQuality(input: {
    campaignId: EntityId;
    inspectionId: EntityId;
    certificateIds?: EntityId[];
    temperatureMonitoringIds?: EntityId[];
    rejectedQuantityKg: number;
    validatedAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["landed"]);
    if (input.rejectedQuantityKg < 0 || input.rejectedQuantityKg > (campaign.landedQuantityKg ?? 0)) {
      throw new Error("La quantité rejetée est invalide.");
    }
    campaign.qualityPlan.inspectionId = input.inspectionId;
    campaign.qualityPlan.certificateIds = [...new Set(input.certificateIds ?? [])];
    campaign.qualityPlan.temperatureMonitoringIds = [...new Set(input.temperatureMonitoringIds ?? [])];
    campaign.rejectedQuantityKg = input.rejectedQuantityKg;
    campaign.status = "quality_checked";
    campaign.updatedAt = input.validatedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:quality`,
      campaignId: campaign.id,
      type: "quality_validated",
      occurredAt: input.validatedAt,
      actorId: input.actorId,
      referenceId: input.inspectionId,
      payload: { rejectedQuantityKg: input.rejectedQuantityKg },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  publishOffers(input: {
    campaignId: EntityId;
    marketplaceOfferIds: EntityId[];
    publishedAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["quality_checked", "marketed"]);
    if (!input.marketplaceOfferIds.length) throw new Error("Au moins une offre doit être publiée.");
    campaign.commercialPlan.marketplaceOfferIds = [...new Set([
      ...campaign.commercialPlan.marketplaceOfferIds,
      ...input.marketplaceOfferIds,
    ])];
    campaign.status = "marketed";
    campaign.updatedAt = input.publishedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:offers:${campaign.commercialPlan.marketplaceOfferIds.length}`,
      campaignId: campaign.id,
      type: "offer_published",
      occurredAt: input.publishedAt,
      actorId: input.actorId,
      payload: { offerIds: input.marketplaceOfferIds },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  reserveSales(input: {
    campaignId: EntityId;
    reservationIds: EntityId[];
    soldQuantityKg: number;
    grossRevenueXof: number;
    reservedAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["marketed"]);
    const sellableQuantity = (campaign.landedQuantityKg ?? 0) - (campaign.rejectedQuantityKg ?? 0);
    if (input.soldQuantityKg < 0 || input.soldQuantityKg > sellableQuantity) throw new Error("La quantité vendue est invalide.");
    if (input.grossRevenueXof < 0) throw new Error("Le chiffre d'affaires ne peut pas être négatif.");
    campaign.commercialPlan.reservationIds = [...new Set(input.reservationIds)];
    campaign.soldQuantityKg = input.soldQuantityKg;
    campaign.grossRevenueXof = input.grossRevenueXof;
    campaign.updatedAt = input.reservedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:sales-reserved`,
      campaignId: campaign.id,
      type: "sale_reserved",
      occurredAt: input.reservedAt,
      actorId: input.actorId,
      payload: { soldQuantityKg: input.soldQuantityKg, grossRevenueXof: input.grossRevenueXof },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  settleCampaign(input: {
    campaignId: EntityId;
    settlementAllocationId: EntityId;
    netRevenueXof: number;
    settledAt: ISODateTime;
    actorId: EntityId;
  }) {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["marketed"]);
    if ((campaign.soldQuantityKg ?? 0) <= 0) throw new Error("Aucune vente n'a été enregistrée.");
    campaign.financialPlan.settlementAllocationId = input.settlementAllocationId;
    campaign.netRevenueXof = input.netRevenueXof;
    campaign.status = "settled";
    campaign.updatedAt = input.settledAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:settled`,
      campaignId: campaign.id,
      type: "settlement_completed",
      occurredAt: input.settledAt,
      actorId: input.actorId,
      referenceId: input.settlementAllocationId,
      payload: { netRevenueXof: input.netRevenueXof },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  closeCampaign(input: { campaignId: EntityId; closedAt: ISODateTime; actorId: EntityId }): FishingCampaignClosure {
    const campaign = this.requireCampaign(input.campaignId);
    this.assertStatus(campaign, ["settled"]);
    const landedQuantityKg = campaign.landedQuantityKg ?? 0;
    const soldQuantityKg = campaign.soldQuantityKg ?? 0;
    const rejectedQuantityKg = campaign.rejectedQuantityKg ?? 0;
    const grossRevenueXof = campaign.grossRevenueXof ?? 0;
    const netRevenueXof = campaign.netRevenueXof ?? 0;
    const totalCostXof = Math.max(0, grossRevenueXof - netRevenueXof);
    campaign.status = "closed";
    campaign.updatedAt = input.closedAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:closed`,
      campaignId: campaign.id,
      type: "campaign_closed",
      occurredAt: input.closedAt,
      actorId: input.actorId,
      payload: {},
    });
    this.campaigns.set(campaign.id, campaign);
    return {
      campaignId: campaign.id,
      landedQuantityKg,
      soldQuantityKg,
      rejectedQuantityKg,
      grossRevenueXof,
      totalCostXof,
      netRevenueXof,
      saleThroughRatePercent: landedQuantityKg ? Math.round((soldQuantityKg / landedQuantityKg) * 10000) / 100 : 0,
      rejectionRatePercent: landedQuantityKg ? Math.round((rejectedQuantityKg / landedQuantityKg) * 10000) / 100 : 0,
      marginPercent: grossRevenueXof ? Math.round((netRevenueXof / grossRevenueXof) * 10000) / 100 : 0,
      closedAt: input.closedAt,
    };
  }

  cancelCampaign(input: { campaignId: EntityId; cancelledAt: ISODateTime; actorId: EntityId; reason: string }) {
    const campaign = this.requireCampaign(input.campaignId);
    if (["closed", "cancelled"].includes(campaign.status)) return structuredClone(campaign);
    campaign.status = "cancelled";
    campaign.updatedAt = input.cancelledAt;
    this.appendEvent(campaign, {
      id: `event:${campaign.id}:cancelled`,
      campaignId: campaign.id,
      type: "campaign_cancelled",
      occurredAt: input.cancelledAt,
      actorId: input.actorId,
      payload: { reason: input.reason },
    });
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  attachMinistryAlerts(input: { campaignId: EntityId; alertIds: EntityId[]; updatedAt: ISODateTime }) {
    const campaign = this.requireCampaign(input.campaignId);
    campaign.ministryAlertIds = [...new Set([...campaign.ministryAlertIds, ...input.alertIds])];
    campaign.updatedAt = input.updatedAt;
    this.campaigns.set(campaign.id, campaign);
    return structuredClone(campaign);
  }

  evaluateReadiness(input: { campaignId: EntityId; generatedAt: ISODateTime }): FishingCampaignReadiness {
    const campaign = this.requireCampaign(input.campaignId);
    const blockingItems: string[] = [];
    const warnings: string[] = [];
    if (!campaign.resourcePlanId) blockingItems.push("Plan opérationnel non lié.");
    if (!campaign.logisticsMissionId) blockingItems.push("Mission logistique non réservée.");
    if (campaign.resourcePlan.fuelQuantityLiters <= 0) blockingItems.push("Carburant non planifié.");
    if (campaign.resourcePlan.iceQuantityKg <= 0) blockingItems.push("Glace non planifiée.");
    if (campaign.financialPlan.estimatedCostXof > 0 && !campaign.financialPlan.financingRequestId && !campaign.financialPlan.advanceTransactionId) {
      warnings.push("Le financement de campagne n'est pas formalisé.");
    }
    if (!campaign.sustainabilityAssessmentId) warnings.push("Évaluation de durabilité absente.");
    if (!campaign.commercialPlan.demandSignalIds.length) warnings.push("Aucun signal de demande n'est rattaché à la campagne.");
    const score = Math.max(0, Math.min(100, 100 - blockingItems.length * 30 - warnings.length * 8));
    return {
      campaignId: campaign.id,
      score,
      ready: blockingItems.length === 0,
      blockingItems,
      warnings,
      generatedAt: input.generatedAt,
    };
  }

  getCampaignWorkspace(campaignId: EntityId) {
    const campaign = this.requireCampaign(campaignId);
    return {
      campaign: structuredClone(campaign),
      readiness: this.evaluateReadiness({ campaignId, generatedAt: campaign.updatedAt }),
      pendingMilestones: this.getPendingMilestones(campaign),
    };
  }

  getTerritoryCampaignBoard(territoryId: EntityId) {
    const campaigns = [...this.campaigns.values()].filter((campaign) => campaign.territoryId === territoryId);
    return {
      territoryId,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter((campaign) => !["closed", "cancelled"].includes(campaign.status)).map((campaign) => structuredClone(campaign)),
      campaignsAtSea: campaigns.filter((campaign) => campaign.status === "at_sea").length,
      campaignsAwaitingSettlement: campaigns.filter((campaign) => campaign.status === "marketed").length,
      totalLandedQuantityKg: campaigns.reduce((sum, campaign) => sum + (campaign.landedQuantityKg ?? 0), 0),
      totalGrossRevenueXof: campaigns.reduce((sum, campaign) => sum + (campaign.grossRevenueXof ?? 0), 0),
      ministryAlertCount: campaigns.reduce((sum, campaign) => sum + campaign.ministryAlertIds.length, 0),
    };
  }

  snapshot() {
    return {
      campaigns: [...this.campaigns.values()].map((campaign) => structuredClone(campaign)),
    };
  }

  private getPendingMilestones(campaign: FishingCampaign) {
    const milestones: string[] = [];
    if (!campaign.resourcePlanId) milestones.push("Approuver le plan de ressources.");
    if (!campaign.logisticsMissionId) milestones.push("Réserver les moyens logistiques.");
    if (!campaign.actualDepartureAt) milestones.push("Enregistrer le départ.");
    if (!campaign.actualReturnAt) milestones.push("Enregistrer le débarquement.");
    if (!campaign.qualityPlan.inspectionId) milestones.push("Valider la qualité et la traçabilité.");
    if (!campaign.commercialPlan.marketplaceOfferIds.length) milestones.push("Publier les offres commerciales.");
    if (!campaign.financialPlan.settlementAllocationId) milestones.push("Régler et répartir les revenus.");
    if (campaign.status !== "closed") milestones.push("Clôturer la campagne.");
    return milestones;
  }

  private appendEvent(campaign: FishingCampaign, event: FishingCampaignEvent) {
    if (!campaign.events.some((item) => item.id === event.id)) campaign.events.push(structuredClone(event));
  }

  private assertStatus(campaign: FishingCampaign, allowed: FishingCampaignStatus[]) {
    if (!allowed.includes(campaign.status)) {
      throw new Error(`Transition impossible depuis le statut ${campaign.status}. Statuts attendus : ${allowed.join(", ")}.`);
    }
  }

  private requireCampaign(id: EntityId) {
    const campaign = this.campaigns.get(id);
    if (!campaign) throw new Error(`Campagne de pêche introuvable : ${id}.`);
    return campaign;
  }
}
