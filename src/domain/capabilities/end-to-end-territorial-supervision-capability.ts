import type { EntityId, ISODateTime } from "../infrastructures/types";

export type TerritorialSupervisionStatus =
  | "initializing"
  | "operational"
  | "degraded"
  | "critical"
  | "restricted"
  | "suspended";

export interface TerritorialActorCoverage {
  actorType: "fisher" | "cooperative" | "buyer" | "logistics_provider" | "cold_storage" | "landing_site" | "authority" | "financial_partner";
  registeredCount: number;
  activeCount: number;
  verifiedCount: number;
}

export interface TerritorialOperationalSnapshot {
  activeCampaignCount: number;
  activeSaleCaseCount: number;
  activeCooperativeCount: number;
  logisticsMissionCount: number;
  coldStorageUtilizationPercent: number;
  pendingQualityInspectionCount: number;
  openComplianceIssueCount: number;
  openCriticalAlertCount: number;
  serviceLevelPercent: number;
  wasteRatePercent: number;
}

export interface TerritorialEconomicSnapshot {
  grossCommercialValueXof: number;
  sellerNetValueXof: number;
  platformRevenueXof: number;
  cooperativeFundBalanceXof: number;
  financingExposureXof: number;
  operatingCostXof: number;
  valueRetentionPercent: number;
}

export interface TerritorialSustainabilitySnapshot {
  fishingPressureIndex: number;
  lowCatchRatePercent: number;
  emptyReturnRatePercent: number;
  catchPerTripKg: number;
  protectedSpeciesAlertCount: number;
  sustainabilityRiskLevel: "low" | "moderate" | "high" | "critical";
}

export interface TerritorialSupervisionCase {
  id: EntityId;
  territoryId: EntityId;
  authorityActorId: EntityId;
  status: TerritorialSupervisionStatus;
  actorCoverage: TerritorialActorCoverage[];
  operational: TerritorialOperationalSnapshot;
  economic: TerritorialEconomicSnapshot;
  sustainability: TerritorialSustainabilitySnapshot;
  campaignIds: EntityId[];
  saleCaseIds: EntityId[];
  cooperativeCaseIds: EntityId[];
  alertIds: EntityId[];
  complianceAssessmentIds: EntityId[];
  publicProgramIds: EntityId[];
  recommendationIds: EntityId[];
  decisionIds: EntityId[];
  documentIds: EntityId[];
  blockers: string[];
  warnings: string[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  lastReviewAt?: ISODateTime;
  events: Array<{
    id: EntityId;
    type: string;
    occurredAt: ISODateTime;
    actorId?: EntityId;
    details: Record<string, unknown>;
  }>;
}

export interface TerritorialReadinessAssessment {
  caseId: EntityId;
  score: number;
  operationallyReady: boolean;
  blockers: string[];
  warnings: string[];
  generatedAt: ISODateTime;
}

export interface TerritorialDecisionBrief {
  territoryId: EntityId;
  status: TerritorialSupervisionStatus;
  headline: string;
  topRisks: string[];
  priorityDecisions: string[];
  operational: TerritorialOperationalSnapshot;
  economic: TerritorialEconomicSnapshot;
  sustainability: TerritorialSustainabilitySnapshot;
  generatedAt: ISODateTime;
}

export class EndToEndTerritorialSupervisionCapability {
  private readonly cases = new Map<EntityId, TerritorialSupervisionCase>();

  openTerritory(input: {
    id: EntityId;
    territoryId: EntityId;
    authorityActorId: EntityId;
    createdAt: ISODateTime;
  }) {
    if (this.cases.has(input.id)) throw new Error(`Le dossier territorial ${input.id} existe déjà.`);
    const item: TerritorialSupervisionCase = {
      id: input.id,
      territoryId: input.territoryId,
      authorityActorId: input.authorityActorId,
      status: "initializing",
      actorCoverage: [],
      operational: {
        activeCampaignCount: 0,
        activeSaleCaseCount: 0,
        activeCooperativeCount: 0,
        logisticsMissionCount: 0,
        coldStorageUtilizationPercent: 0,
        pendingQualityInspectionCount: 0,
        openComplianceIssueCount: 0,
        openCriticalAlertCount: 0,
        serviceLevelPercent: 0,
        wasteRatePercent: 0,
      },
      economic: {
        grossCommercialValueXof: 0,
        sellerNetValueXof: 0,
        platformRevenueXof: 0,
        cooperativeFundBalanceXof: 0,
        financingExposureXof: 0,
        operatingCostXof: 0,
        valueRetentionPercent: 0,
      },
      sustainability: {
        fishingPressureIndex: 0,
        lowCatchRatePercent: 0,
        emptyReturnRatePercent: 0,
        catchPerTripKg: 0,
        protectedSpeciesAlertCount: 0,
        sustainabilityRiskLevel: "low",
      },
      campaignIds: [],
      saleCaseIds: [],
      cooperativeCaseIds: [],
      alertIds: [],
      complianceAssessmentIds: [],
      publicProgramIds: [],
      recommendationIds: [],
      decisionIds: [],
      documentIds: [],
      blockers: [],
      warnings: [],
      createdAt: input.createdAt,
      updatedAt: input.createdAt,
      events: [this.event(`event:${input.id}:opened`, "territory_supervision_opened", input.createdAt, input.authorityActorId, {})],
    };
    this.cases.set(item.id, item);
    return structuredClone(item);
  }

  updateActorCoverage(input: { caseId: EntityId; coverage: TerritorialActorCoverage[]; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.actorCoverage = structuredClone(input.coverage);
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:actor-coverage`, "actor_coverage_updated", input.updatedAt, input.actorId, {}));
    return structuredClone(item);
  }

  linkCampaign(input: { caseId: EntityId; campaignId: EntityId; linkedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.campaignIds.includes(input.campaignId)) item.campaignIds.push(input.campaignId);
    item.operational.activeCampaignCount = item.campaignIds.length;
    this.touch(item, input.linkedAt, this.event(`event:${item.id}:campaign:${input.campaignId}`, "campaign_linked", input.linkedAt, input.actorId, { campaignId: input.campaignId }));
    return structuredClone(item);
  }

  linkSaleCase(input: {
    caseId: EntityId;
    saleCaseId: EntityId;
    grossCommercialValueXof?: number;
    sellerNetValueXof?: number;
    platformRevenueXof?: number;
    linkedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    if (!item.saleCaseIds.includes(input.saleCaseId)) item.saleCaseIds.push(input.saleCaseId);
    item.operational.activeSaleCaseCount = item.saleCaseIds.length;
    item.economic.grossCommercialValueXof += input.grossCommercialValueXof ?? 0;
    item.economic.sellerNetValueXof += input.sellerNetValueXof ?? 0;
    item.economic.platformRevenueXof += input.platformRevenueXof ?? 0;
    this.recalculateEconomic(item);
    this.touch(item, input.linkedAt, this.event(`event:${item.id}:sale:${input.saleCaseId}`, "sale_case_linked", input.linkedAt, input.actorId, { saleCaseId: input.saleCaseId }));
    return structuredClone(item);
  }

  linkCooperative(input: {
    caseId: EntityId;
    cooperativeCaseId: EntityId;
    cooperativeFundBalanceXof?: number;
    financingExposureXof?: number;
    linkedAt: ISODateTime;
    actorId?: EntityId;
  }) {
    const item = this.requireCase(input.caseId);
    if (!item.cooperativeCaseIds.includes(input.cooperativeCaseId)) item.cooperativeCaseIds.push(input.cooperativeCaseId);
    item.operational.activeCooperativeCount = item.cooperativeCaseIds.length;
    item.economic.cooperativeFundBalanceXof += input.cooperativeFundBalanceXof ?? 0;
    item.economic.financingExposureXof += input.financingExposureXof ?? 0;
    this.recalculateEconomic(item);
    this.touch(item, input.linkedAt, this.event(`event:${item.id}:cooperative:${input.cooperativeCaseId}`, "cooperative_case_linked", input.linkedAt, input.actorId, { cooperativeCaseId: input.cooperativeCaseId }));
    return structuredClone(item);
  }

  updateOperationalSnapshot(input: { caseId: EntityId; snapshot: Partial<TerritorialOperationalSnapshot>; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.operational = { ...item.operational, ...structuredClone(input.snapshot) };
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:operations`, "operational_snapshot_updated", input.updatedAt, input.actorId, {}));
    return structuredClone(item);
  }

  updateEconomicSnapshot(input: { caseId: EntityId; snapshot: Partial<TerritorialEconomicSnapshot>; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.economic = { ...item.economic, ...structuredClone(input.snapshot) };
    this.recalculateEconomic(item);
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:economy`, "economic_snapshot_updated", input.updatedAt, input.actorId, {}));
    return structuredClone(item);
  }

  updateSustainabilitySnapshot(input: { caseId: EntityId; snapshot: Partial<TerritorialSustainabilitySnapshot>; updatedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.sustainability = { ...item.sustainability, ...structuredClone(input.snapshot) };
    item.sustainability.sustainabilityRiskLevel = this.computeSustainabilityRisk(item.sustainability);
    this.touch(item, input.updatedAt, this.event(`event:${item.id}:sustainability`, "sustainability_snapshot_updated", input.updatedAt, input.actorId, {}));
    return structuredClone(item);
  }

  attachAlert(input: { caseId: EntityId; alertId: EntityId; severity: "info" | "warning" | "critical" | "emergency"; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.alertIds.includes(input.alertId)) item.alertIds.push(input.alertId);
    if (["critical", "emergency"].includes(input.severity)) item.operational.openCriticalAlertCount += 1;
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:alert:${input.alertId}`, "alert_attached", input.attachedAt, input.actorId, { alertId: input.alertId, severity: input.severity }));
    return structuredClone(item);
  }

  attachComplianceAssessment(input: { caseId: EntityId; assessmentId: EntityId; status: "compliant" | "partially_compliant" | "non_compliant" | "unknown"; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.complianceAssessmentIds.includes(input.assessmentId)) item.complianceAssessmentIds.push(input.assessmentId);
    if (input.status === "non_compliant") item.operational.openComplianceIssueCount += 1;
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:compliance:${input.assessmentId}`, "compliance_assessment_attached", input.attachedAt, input.actorId, { assessmentId: input.assessmentId, status: input.status }));
    return structuredClone(item);
  }

  attachPublicProgram(input: { caseId: EntityId; publicProgramId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.publicProgramIds.includes(input.publicProgramId)) item.publicProgramIds.push(input.publicProgramId);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:program:${input.publicProgramId}`, "public_program_attached", input.attachedAt, input.actorId, { publicProgramId: input.publicProgramId }));
    return structuredClone(item);
  }

  attachRecommendation(input: { caseId: EntityId; recommendationId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.recommendationIds.includes(input.recommendationId)) item.recommendationIds.push(input.recommendationId);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:recommendation:${input.recommendationId}`, "recommendation_attached", input.attachedAt, input.actorId, { recommendationId: input.recommendationId }));
    return structuredClone(item);
  }

  recordDecision(input: { caseId: EntityId; decisionId: EntityId; decidedAt: ISODateTime; actorId?: EntityId; details?: Record<string, unknown> }) {
    const item = this.requireCase(input.caseId);
    if (!item.decisionIds.includes(input.decisionId)) item.decisionIds.push(input.decisionId);
    this.touch(item, input.decidedAt, this.event(`event:${item.id}:decision:${input.decisionId}`, "territorial_decision_recorded", input.decidedAt, input.actorId, input.details ?? {}));
    return structuredClone(item);
  }

  attachDocument(input: { caseId: EntityId; documentId: EntityId; attachedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    if (!item.documentIds.includes(input.documentId)) item.documentIds.push(input.documentId);
    this.touch(item, input.attachedAt, this.event(`event:${item.id}:document:${input.documentId}`, "document_attached", input.attachedAt, input.actorId, { documentId: input.documentId }));
    return structuredClone(item);
  }

  assessReadiness(input: { caseId: EntityId; generatedAt: ISODateTime }): TerritorialReadinessAssessment {
    const item = this.requireCase(input.caseId);
    const blockers: string[] = [];
    const warnings: string[] = [];
    const requiredActorTypes: TerritorialActorCoverage["actorType"][] = ["fisher", "cooperative", "buyer", "logistics_provider", "authority"];
    for (const actorType of requiredActorTypes) {
      const coverage = item.actorCoverage.find((entry) => entry.actorType === actorType);
      if (!coverage || coverage.activeCount === 0) blockers.push(`Aucun acteur actif pour ${actorType}.`);
    }
    if (item.operational.serviceLevelPercent < 60) blockers.push("Le niveau de service territorial est inférieur à 60 %.");
    if (item.operational.openCriticalAlertCount > 0) blockers.push("Des alertes critiques sont ouvertes.");
    if (item.operational.openComplianceIssueCount > 0) warnings.push("Des non-conformités sont encore ouvertes.");
    if (item.sustainability.sustainabilityRiskLevel === "high") warnings.push("La pression sur la ressource est élevée.");
    if (item.sustainability.sustainabilityRiskLevel === "critical") blockers.push("Le risque de durabilité est critique.");
    if (!item.documentIds.length) warnings.push("Aucun document de supervision attaché.");
    const score = Math.max(0, Math.min(100, 100 - blockers.length * 15 - warnings.length * 5));
    item.blockers = blockers;
    item.warnings = warnings;
    this.cases.set(item.id, item);
    return { caseId: item.id, score, operationallyReady: blockers.length === 0, blockers, warnings, generatedAt: input.generatedAt };
  }

  reviewTerritory(input: { caseId: EntityId; reviewedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    const readiness = this.assessReadiness({ caseId: item.id, generatedAt: input.reviewedAt });
    if (item.operational.openCriticalAlertCount >= 3 || item.sustainability.sustainabilityRiskLevel === "critical") item.status = "critical";
    else if (item.operational.openCriticalAlertCount > 0 || item.operational.serviceLevelPercent < 60) item.status = "degraded";
    else if (item.operational.openComplianceIssueCount > 0) item.status = "restricted";
    else item.status = readiness.operationallyReady ? "operational" : "initializing";
    item.lastReviewAt = input.reviewedAt;
    this.touch(item, input.reviewedAt, this.event(`event:${item.id}:review`, "territorial_review_completed", input.reviewedAt, input.actorId, { score: readiness.score, status: item.status }));
    return structuredClone(item);
  }

  suspendTerritory(input: { caseId: EntityId; reason: string; suspendedAt: ISODateTime; actorId?: EntityId }) {
    const item = this.requireCase(input.caseId);
    item.status = "suspended";
    item.blockers.push(input.reason);
    this.touch(item, input.suspendedAt, this.event(`event:${item.id}:suspended`, "territory_suspended", input.suspendedAt, input.actorId, { reason: input.reason }));
    return structuredClone(item);
  }

  buildDecisionBrief(input: { caseId: EntityId; generatedAt: ISODateTime }): TerritorialDecisionBrief {
    const item = this.requireCase(input.caseId);
    const topRisks: string[] = [];
    const priorityDecisions: string[] = [];
    if (item.operational.openCriticalAlertCount > 0) {
      topRisks.push(`${item.operational.openCriticalAlertCount} alerte(s) critique(s) ouverte(s).`);
      priorityDecisions.push("Arbitrer les alertes critiques et assigner un responsable de réponse.");
    }
    if (item.operational.openComplianceIssueCount > 0) {
      topRisks.push(`${item.operational.openComplianceIssueCount} non-conformité(s) ouverte(s).`);
      priorityDecisions.push("Lancer un plan de mise en conformité territoriale.");
    }
    if (["high", "critical"].includes(item.sustainability.sustainabilityRiskLevel)) {
      topRisks.push(`Risque de durabilité ${item.sustainability.sustainabilityRiskLevel}.`);
      priorityDecisions.push("Réduire l'effort de pêche sur les zones ou espèces sous pression.");
    }
    if (item.operational.serviceLevelPercent < 75) {
      topRisks.push("Niveau de service insuffisant.");
      priorityDecisions.push("Renforcer les capacités logistiques, qualité ou stockage qui limitent les opérations.");
    }
    if (item.economic.valueRetentionPercent < 70 && item.economic.grossCommercialValueXof > 0) {
      topRisks.push("La valeur retenue par les acteurs locaux est insuffisante.");
      priorityDecisions.push("Revoir les coûts de coordination et la répartition de valeur.");
    }
    return {
      territoryId: item.territoryId,
      status: item.status,
      headline: item.status === "critical"
        ? "Territoire en situation critique"
        : item.status === "degraded"
          ? "Performance territoriale dégradée"
          : item.status === "restricted"
            ? "Territoire opérationnel sous restrictions"
            : "Territoire sous supervision active",
      topRisks,
      priorityDecisions,
      operational: structuredClone(item.operational),
      economic: structuredClone(item.economic),
      sustainability: structuredClone(item.sustainability),
      generatedAt: input.generatedAt,
    };
  }

  getTerritorialCommandCenter() {
    const items = [...this.cases.values()];
    return {
      territoryCount: items.length,
      operationalTerritoryCount: items.filter((item) => item.status === "operational").length,
      degradedTerritoryCount: items.filter((item) => item.status === "degraded").length,
      criticalTerritoryCount: items.filter((item) => item.status === "critical").length,
      restrictedTerritoryCount: items.filter((item) => item.status === "restricted").length,
      activeCampaignCount: items.reduce((sum, item) => sum + item.operational.activeCampaignCount, 0),
      activeSaleCaseCount: items.reduce((sum, item) => sum + item.operational.activeSaleCaseCount, 0),
      activeCooperativeCount: items.reduce((sum, item) => sum + item.operational.activeCooperativeCount, 0),
      grossCommercialValueXof: items.reduce((sum, item) => sum + item.economic.grossCommercialValueXof, 0),
      sellerNetValueXof: items.reduce((sum, item) => sum + item.economic.sellerNetValueXof, 0),
      platformRevenueXof: items.reduce((sum, item) => sum + item.economic.platformRevenueXof, 0),
      criticalAlertCount: items.reduce((sum, item) => sum + item.operational.openCriticalAlertCount, 0),
      averageServiceLevelPercent: items.length ? Math.round(items.reduce((sum, item) => sum + item.operational.serviceLevelPercent, 0) / items.length) : 0,
      cases: items.map((item) => structuredClone(item)),
    };
  }

  snapshot() {
    return [...this.cases.values()].map((item) => structuredClone(item));
  }

  private recalculateEconomic(item: TerritorialSupervisionCase) {
    const retained = item.economic.sellerNetValueXof + item.economic.cooperativeFundBalanceXof;
    item.economic.valueRetentionPercent = item.economic.grossCommercialValueXof > 0
      ? Math.round((retained / item.economic.grossCommercialValueXof) * 10000) / 100
      : 0;
  }

  private computeSustainabilityRisk(snapshot: TerritorialSustainabilitySnapshot): TerritorialSustainabilitySnapshot["sustainabilityRiskLevel"] {
    const score =
      Math.min(100, snapshot.fishingPressureIndex) * 0.45 +
      Math.min(100, snapshot.lowCatchRatePercent) * 0.2 +
      Math.min(100, snapshot.emptyReturnRatePercent) * 0.2 +
      Math.min(100, snapshot.protectedSpeciesAlertCount * 20) * 0.15;
    if (score >= 75) return "critical";
    if (score >= 55) return "high";
    if (score >= 30) return "moderate";
    return "low";
  }

  private requireCase(id: EntityId) {
    const item = this.cases.get(id);
    if (!item) throw new Error(`Dossier territorial introuvable : ${id}.`);
    return item;
  }

  private touch(item: TerritorialSupervisionCase, updatedAt: ISODateTime, event: TerritorialSupervisionCase["events"][number]) {
    item.updatedAt = updatedAt;
    item.events.push(event);
    this.cases.set(item.id, item);
  }

  private event(id: EntityId, type: string, occurredAt: ISODateTime, actorId: EntityId | undefined, details: Record<string, unknown>) {
    return { id, type, occurredAt, actorId, details };
  }
}
