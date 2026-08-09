export type ConfidenceLevel = "declared" | "confirmed" | "verified" | "disputed";
export type WeighingMethod = "digital_scale" | "mechanical_scale" | "estimated";
export type LotQualityGrade = "premium" | "standard" | "processing" | "rejected";
export type ConservationStatus = "fresh" | "iced" | "chilled" | "frozen" | "at_risk";
export type LotStatus = "draft" | "available" | "blocked" | "reserved" | "sold" | "cancelled";
export type LotDestination = "fresh_market" | "cold_storage" | "processing" | "community_program" | "rejected";

export interface ExpectedReturnReference {
  id: string;
  vesselId: string;
  expectedLandingSiteId: string;
  territoryId: string;
  expectedAt: string;
  expectedWeightKg?: number;
  status: "announced" | "approaching" | "arrived" | "cancelled";
}

export interface LandingRecord {
  id: string;
  expectedReturnId?: string;
  vesselId: string;
  landingSiteId: string;
  territoryId: string;
  landedAt: string;
  confirmedByActorId: string;
  status: "confirmed" | "cancelled";
}

export interface WeighingRecord {
  id: string;
  landingId: string;
  totalWeightKg: number;
  method: WeighingMethod;
  confidenceLevel: ConfidenceLevel;
  recordedByActorId: string;
  recordedAt: string;
  verifiedByActorId?: string;
  disputedByActorId?: string;
  disputeReason?: string;
}

export interface LotRecord {
  id: string;
  landingId: string;
  speciesCode: string;
  weightKg: number;
  reservedWeightKg: number;
  qualityGrade: LotQualityGrade;
  conservationStatus: ConservationStatus;
  status: LotStatus;
  createdByActorId: string;
  createdAt: string;
  blockedReason?: string;
  destination?: LotDestination;
}

export interface LandingReconciliationDecision {
  landingId: string;
  expectedWeightKg?: number;
  actualWeightKg?: number;
  weightVarianceKg?: number;
  weightVariancePercent?: number;
  arrivalDelayMinutes?: number;
  significantWeightVariance: boolean;
  significantArrivalDelay: boolean;
  serviceNeedsReassessmentRequired: boolean;
}

export interface LotDestinationDecision {
  lotId: string;
  recommendedDestination: LotDestination;
  requiresColdChain: boolean;
  requiresHumanValidation: boolean;
  reasons: string[];
  sustainabilitySignals: string[];
  communityValueSignals: string[];
}

export interface LandingLotSnapshot {
  expectedReturns: ExpectedReturnReference[];
  landings: LandingRecord[];
  weighings: WeighingRecord[];
  lots: LotRecord[];
}

export class LandingLotLifecycle {
  private state: LandingLotSnapshot = { expectedReturns: [], landings: [], weighings: [], lots: [] };

  registerExpectedReturn(reference: ExpectedReturnReference) {
    this.ensureUnique(reference.id, this.state.expectedReturns, "retour prévu");
    this.state.expectedReturns.push(structuredClone(reference));
    return structuredClone(reference);
  }

  confirmLanding(input: Omit<LandingRecord, "status">) {
    this.ensureUnique(input.id, this.state.landings, "débarquement");
    const expectedReturn = input.expectedReturnId
      ? this.state.expectedReturns.find((item) => item.id === input.expectedReturnId)
      : undefined;
    if (input.expectedReturnId && !expectedReturn) throw new Error("Le retour prévu est introuvable.");
    if (expectedReturn?.status === "cancelled") throw new Error("Un retour annulé ne peut pas être débarqué.");
    if (expectedReturn && expectedReturn.vesselId !== input.vesselId) throw new Error("L'embarcation ne correspond pas au retour prévu.");
    if (expectedReturn && expectedReturn.expectedLandingSiteId !== input.landingSiteId) throw new Error("Le site ne correspond pas au retour prévu.");
    if (expectedReturn && expectedReturn.territoryId !== input.territoryId) throw new Error("Le territoire du débarquement est incohérent.");
    if (input.expectedReturnId && this.state.landings.some((item) => item.expectedReturnId === input.expectedReturnId && item.status === "confirmed")) {
      throw new Error("Ce retour prévu possède déjà un débarquement actif.");
    }
    const landing: LandingRecord = { ...structuredClone(input), status: "confirmed" };
    this.state.landings.push(landing);
    if (expectedReturn) expectedReturn.status = "arrived";
    return structuredClone(landing);
  }

  cancelLanding(landingId: string) {
    const landing = this.requireLanding(landingId);
    if (this.state.weighings.some((item) => item.landingId === landingId)) throw new Error("Un débarquement pesé ne peut pas être annulé sans procédure de correction.");
    landing.status = "cancelled";
    return structuredClone(landing);
  }

  registerWeighing(input: Omit<WeighingRecord, "confidenceLevel"> & { confidenceLevel?: ConfidenceLevel }) {
    this.ensureUnique(input.id, this.state.weighings, "pesée");
    const landing = this.requireLanding(input.landingId);
    if (landing.status !== "confirmed") throw new Error("Le débarquement doit être actif.");
    if (input.totalWeightKg <= 0) throw new Error("Le poids doit être strictement positif.");
    const defaultConfidence: ConfidenceLevel = input.method === "estimated" ? "declared" : "confirmed";
    if (input.method === "estimated" && input.confidenceLevel === "verified") throw new Error("Une estimation ne peut pas être vérifiée directement.");
    const weighing: WeighingRecord = { ...structuredClone(input), confidenceLevel: input.confidenceLevel ?? defaultConfidence };
    this.state.weighings.push(weighing);
    return structuredClone(weighing);
  }

  verifyWeighing(weighingId: string, actorId: string) {
    const weighing = this.requireWeighing(weighingId);
    if (weighing.method === "estimated") throw new Error("Une pesée estimée nécessite une mesure complémentaire.");
    weighing.confidenceLevel = "verified";
    weighing.verifiedByActorId = actorId;
    weighing.disputedByActorId = undefined;
    weighing.disputeReason = undefined;
    return structuredClone(weighing);
  }

  disputeWeighing(weighingId: string, actorId: string, reason: string) {
    if (!reason.trim()) throw new Error("Le motif de contestation est obligatoire.");
    const weighing = this.requireWeighing(weighingId);
    weighing.confidenceLevel = "disputed";
    weighing.disputedByActorId = actorId;
    weighing.disputeReason = reason.trim();
    return structuredClone(weighing);
  }

  selectReferenceWeighing(landingId: string) {
    const rank: Record<ConfidenceLevel, number> = { disputed: 0, declared: 1, confirmed: 2, verified: 3 };
    return structuredClone(this.state.weighings
      .filter((item) => item.landingId === landingId && item.confidenceLevel !== "disputed")
      .sort((a, b) => rank[b.confidenceLevel] - rank[a.confidenceLevel] || b.recordedAt.localeCompare(a.recordedAt))[0]);
  }

  createLot(input: Omit<LotRecord, "reservedWeightKg" | "status">) {
    this.ensureUnique(input.id, this.state.lots, "lot");
    const landing = this.requireLanding(input.landingId);
    if (landing.status !== "confirmed") throw new Error("Le débarquement doit être actif.");
    const reference = this.selectReferenceWeighing(input.landingId);
    if (!reference) throw new Error("Une pesée de référence exploitable est obligatoire.");
    if (input.weightKg <= 0) throw new Error("Le poids du lot doit être strictement positif.");
    const allocated = this.state.lots
      .filter((item) => item.landingId === input.landingId && !["cancelled"].includes(item.status))
      .reduce((sum, item) => sum + item.weightKg, 0);
    if (allocated + input.weightKg > reference.totalWeightKg) throw new Error("La somme des lots dépasserait la pesée de référence.");
    const lot: LotRecord = { ...structuredClone(input), reservedWeightKg: 0, status: "draft" };
    this.state.lots.push(lot);
    return structuredClone(lot);
  }

  makeLotAvailable(lotId: string) {
    const lot = this.requireLot(lotId);
    if (lot.status === "blocked") throw new Error("Un lot bloqué ne peut pas être rendu disponible.");
    if (lot.qualityGrade === "rejected") throw new Error("Un lot rejeté ne peut pas être commercialisé.");
    if (lot.conservationStatus === "at_risk") throw new Error("Un lot à risque nécessite une décision de destination explicite.");
    lot.status = "available";
    return structuredClone(lot);
  }

  blockLot(lotId: string, reason: string) {
    if (!reason.trim()) throw new Error("Le motif de blocage est obligatoire.");
    const lot = this.requireLot(lotId);
    if (["sold", "cancelled"].includes(lot.status)) throw new Error("Ce lot ne peut plus être bloqué.");
    lot.status = "blocked";
    lot.blockedReason = reason.trim();
    return structuredClone(lot);
  }

  decideDestination(lotId: string, input: { coldStorageAvailable: boolean; processingAvailable: boolean; communityProgramAvailable: boolean }) {
    const lot = this.requireLot(lotId);
    const reasons: string[] = [];
    const sustainabilitySignals: string[] = [];
    const communityValueSignals: string[] = [];
    let recommendedDestination: LotDestination = "fresh_market";
    let requiresColdChain = false;
    let requiresHumanValidation = false;

    if (lot.qualityGrade === "rejected") {
      recommendedDestination = "rejected";
      reasons.push("Le lot est rejeté pour la consommation ou la transformation commerciale.");
      sustainabilitySignals.push("Documenter la perte et rechercher une voie de valorisation des coproduits conforme.");
    } else if (lot.qualityGrade === "processing") {
      if (input.processingAvailable) {
        recommendedDestination = "processing";
        reasons.push("La qualité du lot est adaptée à la transformation.");
        sustainabilitySignals.push("La transformation réduit le risque de perte post-capture.");
      } else if (input.coldStorageAvailable) {
        recommendedDestination = "cold_storage";
        requiresColdChain = true;
        reasons.push("La transformation n'est pas disponible immédiatement.");
      } else {
        recommendedDestination = "community_program";
        requiresHumanValidation = true;
        reasons.push("Aucune capacité commerciale ou de transformation sûre n'est disponible.");
        communityValueSignals.push("Une initiative communautaire peut organiser une valorisation locale encadrée.");
      }
    } else if (lot.conservationStatus === "at_risk") {
      requiresHumanValidation = true;
      if (input.processingAvailable) {
        recommendedDestination = "processing";
        reasons.push("Le lot doit être transformé rapidement pour éviter une perte.");
      } else if (input.coldStorageAvailable) {
        recommendedDestination = "cold_storage";
        requiresColdChain = true;
        reasons.push("Le stockage froid permet de sécuriser temporairement le lot.");
      } else if (input.communityProgramAvailable) {
        recommendedDestination = "community_program";
        reasons.push("Une action communautaire encadrée est la dernière voie de valorisation disponible.");
        communityValueSignals.push("Mesurer les bénéficiaires et la valeur redistribuée localement.");
      } else {
        recommendedDestination = "rejected";
        reasons.push("Aucune voie sûre de conservation ou de valorisation n'est disponible.");
      }
      sustainabilitySignals.push("Mesurer les kilogrammes sauvés ou perdus et la cause de la rupture.");
    } else if (["chilled", "frozen"].includes(lot.conservationStatus)) {
      requiresColdChain = true;
      recommendedDestination = input.coldStorageAvailable ? "cold_storage" : "fresh_market";
      reasons.push("Le maintien de la chaîne du froid est obligatoire.");
    } else {
      reasons.push("Le lot est compatible avec la vente fraîche sous réserve de disponibilité du marché.");
    }

    lot.destination = recommendedDestination;
    if (recommendedDestination === "rejected") lot.status = "blocked";
    return { lotId, recommendedDestination, requiresColdChain, requiresHumanValidation, reasons, sustainabilitySignals, communityValueSignals } satisfies LotDestinationDecision;
  }

  reconcileLanding(landingId: string, thresholds: { weightVariancePercent: number; arrivalDelayMinutes: number }): LandingReconciliationDecision {
    const landing = this.requireLanding(landingId);
    const expected = landing.expectedReturnId ? this.state.expectedReturns.find((item) => item.id === landing.expectedReturnId) : undefined;
    const actual = this.selectReferenceWeighing(landingId);
    const weightVarianceKg = expected?.expectedWeightKg !== undefined && actual ? actual.totalWeightKg - expected.expectedWeightKg : undefined;
    const weightVariancePercent = weightVarianceKg !== undefined && expected?.expectedWeightKg
      ? Math.abs(weightVarianceKg / expected.expectedWeightKg) * 100
      : undefined;
    const arrivalDelayMinutes = expected ? Math.round((Date.parse(landing.landedAt) - Date.parse(expected.expectedAt)) / 60_000) : undefined;
    const significantWeightVariance = weightVariancePercent !== undefined && weightVariancePercent > thresholds.weightVariancePercent;
    const significantArrivalDelay = arrivalDelayMinutes !== undefined && Math.abs(arrivalDelayMinutes) > thresholds.arrivalDelayMinutes;
    return {
      landingId,
      expectedWeightKg: expected?.expectedWeightKg,
      actualWeightKg: actual?.totalWeightKg,
      weightVarianceKg,
      weightVariancePercent,
      arrivalDelayMinutes,
      significantWeightVariance,
      significantArrivalDelay,
      serviceNeedsReassessmentRequired: significantWeightVariance,
    };
  }

  snapshot() {
    return structuredClone(this.state);
  }

  private ensureUnique<T extends { id: string }>(id: string, items: T[], label: string) {
    if (items.some((item) => item.id === id)) throw new Error(`Le ${label} ${id} existe déjà.`);
  }
  private requireLanding(id: string) {
    const item = this.state.landings.find((entry) => entry.id === id);
    if (!item) throw new Error("Le débarquement est introuvable.");
    return item;
  }
  private requireWeighing(id: string) {
    const item = this.state.weighings.find((entry) => entry.id === id);
    if (!item) throw new Error("La pesée est introuvable.");
    return item;
  }
  private requireLot(id: string) {
    const item = this.state.lots.find((entry) => entry.id === id);
    if (!item) throw new Error("Le lot est introuvable.");
    return item;
  }
}
