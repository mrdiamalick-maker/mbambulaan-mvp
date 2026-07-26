import type { EntityId, ISODateTime } from "./types";

export type OfferStatus = "draft" | "published" | "partially_reserved" | "reserved" | "sold" | "expired" | "withdrawn";
export type DemandStatus = "draft" | "active" | "partially_matched" | "matched" | "fulfilled" | "expired" | "cancelled";
export type MatchStatus = "proposed" | "accepted_by_seller" | "accepted_by_buyer" | "confirmed" | "rejected" | "expired" | "cancelled";
export type PriceMode = "fixed" | "negotiable" | "market_reference" | "request_quote";
export type DeliveryMode = "buyer_pickup" | "seller_delivery" | "third_party_logistics";
export type PaymentTerm = "cash" | "on_delivery" | "advance" | "deferred";

export interface MarketOffer {
  id: EntityId;
  lotId: EntityId;
  sellerActorId: EntityId;
  sellerOrganizationId?: EntityId;
  speciesCode: string;
  qualityGrade: string;
  traceabilityScore: number;
  availableQuantityKg: number;
  minimumOrderKg: number;
  unitPriceXof?: number;
  priceMode: PriceMode;
  currency: "XOF";
  landingSiteId: EntityId;
  territoryId: EntityId;
  availableFrom: ISODateTime;
  availableUntil: ISODateTime;
  deliveryModes: DeliveryMode[];
  paymentTerms: PaymentTerm[];
  coldChainRequired: boolean;
  coldChainAvailable: boolean;
  logisticsRequired: boolean;
  status: OfferStatus;
  createdAt: ISODateTime;
  publishedAt?: ISODateTime;
  metadata: Record<string, unknown>;
}

export interface MarketDemand {
  id: EntityId;
  buyerActorId: EntityId;
  buyerOrganizationId?: EntityId;
  speciesCodes: string[];
  acceptedQualityGrades: string[];
  requestedQuantityKg: number;
  minimumAcceptableQuantityKg: number;
  maximumUnitPriceXof?: number;
  territoryIds: EntityId[];
  preferredLandingSiteIds: EntityId[];
  neededFrom: ISODateTime;
  neededUntil: ISODateTime;
  acceptedDeliveryModes: DeliveryMode[];
  acceptedPaymentTerms: PaymentTerm[];
  coldChainRequired: boolean;
  minimumTraceabilityScore: number;
  status: DemandStatus;
  createdAt: ISODateTime;
  activatedAt?: ISODateTime;
  metadata: Record<string, unknown>;
}

export interface MatchingConstraintResult {
  code: string;
  label: string;
  passed: boolean;
  blocking: boolean;
  scoreImpact: number;
  explanation: string;
}

export interface MarketMatch {
  id: EntityId;
  offerId: EntityId;
  demandId: EntityId;
  proposedQuantityKg: number;
  proposedUnitPriceXof?: number;
  currency: "XOF";
  deliveryMode: DeliveryMode;
  paymentTerm: PaymentTerm;
  score: number;
  status: MatchStatus;
  constraints: MatchingConstraintResult[];
  rationale: string[];
  risks: string[];
  proposedAt: ISODateTime;
  expiresAt: ISODateTime;
  acceptedBySellerAt?: ISODateTime;
  acceptedByBuyerAt?: ISODateTime;
  confirmedAt?: ISODateTime;
  commitmentId?: EntityId;
}

export interface MatchingWeights {
  species: number;
  quality: number;
  quantity: number;
  price: number;
  geography: number;
  deliveryWindow: number;
  logistics: number;
  payment: number;
  traceability: number;
}

export interface MatchGenerationOptions {
  generatedAt: ISODateTime;
  validityHours: number;
  minimumScore: number;
  maxMatchesPerDemand: number;
  weights?: Partial<MatchingWeights>;
}

export interface MarketLiquiditySnapshot {
  territoryId?: EntityId;
  speciesCode?: string;
  activeOfferCount: number;
  activeDemandCount: number;
  availableQuantityKg: number;
  requestedQuantityKg: number;
  imbalanceKg: number;
  averageOfferPriceXof?: number;
  averageDemandCeilingXof?: number;
  coverageRatePercent: number;
  generatedAt: ISODateTime;
}

const defaultWeights: MatchingWeights = {
  species: 25,
  quality: 10,
  quantity: 15,
  price: 15,
  geography: 10,
  deliveryWindow: 10,
  logistics: 5,
  payment: 5,
  traceability: 5,
};

export class MarketplaceAndMatchingEngine {
  private readonly offers = new Map<EntityId, MarketOffer>();
  private readonly demands = new Map<EntityId, MarketDemand>();
  private readonly matches = new Map<EntityId, MarketMatch>();

  createOffer(input: MarketOffer) {
    if (this.offers.has(input.id)) throw new Error(`L'offre ${input.id} existe déjà.`);
    this.validateOffer(input);
    this.offers.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  publishOffer(input: { offerId: EntityId; publishedAt: ISODateTime }) {
    const offer = this.requireOffer(input.offerId);
    if (offer.status !== "draft") throw new Error("Seule une offre en brouillon peut être publiée.");
    if (offer.availableUntil <= input.publishedAt) throw new Error("La période de disponibilité de l'offre est expirée.");
    offer.status = "published";
    offer.publishedAt = input.publishedAt;
    this.offers.set(offer.id, offer);
    return structuredClone(offer);
  }

  createDemand(input: MarketDemand) {
    if (this.demands.has(input.id)) throw new Error(`La demande ${input.id} existe déjà.`);
    this.validateDemand(input);
    this.demands.set(input.id, structuredClone(input));
    return structuredClone(input);
  }

  activateDemand(input: { demandId: EntityId; activatedAt: ISODateTime }) {
    const demand = this.requireDemand(input.demandId);
    if (demand.status !== "draft") throw new Error("Seule une demande en brouillon peut être activée.");
    if (demand.neededUntil <= input.activatedAt) throw new Error("La fenêtre de besoin est expirée.");
    demand.status = "active";
    demand.activatedAt = input.activatedAt;
    this.demands.set(demand.id, demand);
    return structuredClone(demand);
  }

  generateMatchesForDemand(demandId: EntityId, options: MatchGenerationOptions) {
    const demand = this.requireDemand(demandId);
    if (!["active", "partially_matched"].includes(demand.status)) {
      throw new Error("La demande doit être active pour générer des correspondances.");
    }

    const weights = { ...defaultWeights, ...(options.weights ?? {}) };
    const activeOffers = [...this.offers.values()].filter((offer) =>
      ["published", "partially_reserved"].includes(offer.status) &&
      offer.availableUntil >= options.generatedAt &&
      offer.availableFrom <= demand.neededUntil,
    );

    const ranked = activeOffers
      .map((offer) => this.evaluateOfferAgainstDemand(offer, demand, weights, options))
      .filter((candidate) => candidate !== null)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, options.maxMatchesPerDemand) as MarketMatch[];

    for (const match of ranked) this.matches.set(match.id, structuredClone(match));
    return ranked.map((match) => structuredClone(match));
  }

  acceptMatchBySeller(input: { matchId: EntityId; acceptedAt: ISODateTime }) {
    const match = this.requireMatch(input.matchId);
    if (match.status !== "proposed" && match.status !== "accepted_by_buyer") {
      throw new Error("Cette correspondance ne peut plus être acceptée par le vendeur.");
    }
    match.acceptedBySellerAt = input.acceptedAt;
    match.status = match.acceptedByBuyerAt ? "confirmed" : "accepted_by_seller";
    if (match.status === "confirmed") match.confirmedAt = input.acceptedAt;
    this.matches.set(match.id, match);
    if (match.status === "confirmed") this.reserveMatchedQuantity(match);
    return structuredClone(match);
  }

  acceptMatchByBuyer(input: { matchId: EntityId; acceptedAt: ISODateTime }) {
    const match = this.requireMatch(input.matchId);
    if (match.status !== "proposed" && match.status !== "accepted_by_seller") {
      throw new Error("Cette correspondance ne peut plus être acceptée par l'acheteur.");
    }
    match.acceptedByBuyerAt = input.acceptedAt;
    match.status = match.acceptedBySellerAt ? "confirmed" : "accepted_by_buyer";
    if (match.status === "confirmed") match.confirmedAt = input.acceptedAt;
    this.matches.set(match.id, match);
    if (match.status === "confirmed") this.reserveMatchedQuantity(match);
    return structuredClone(match);
  }

  linkCommitment(input: { matchId: EntityId; commitmentId: EntityId }) {
    const match = this.requireMatch(input.matchId);
    if (match.status !== "confirmed") throw new Error("La correspondance doit être confirmée avant de créer un engagement.");
    match.commitmentId = input.commitmentId;
    this.matches.set(match.id, match);
    return structuredClone(match);
  }

  rejectMatch(input: { matchId: EntityId; rejectedAt: ISODateTime }) {
    const match = this.requireMatch(input.matchId);
    if (["confirmed", "cancelled", "expired"].includes(match.status)) {
      throw new Error("Cette correspondance ne peut plus être rejetée.");
    }
    match.status = "rejected";
    this.matches.set(match.id, match);
    return structuredClone(match);
  }

  expireMatches(at: ISODateTime) {
    const expired: MarketMatch[] = [];
    for (const match of this.matches.values()) {
      if (["proposed", "accepted_by_seller", "accepted_by_buyer"].includes(match.status) && match.expiresAt < at) {
        match.status = "expired";
        this.matches.set(match.id, match);
        expired.push(structuredClone(match));
      }
    }
    return expired;
  }

  getBuyerOpportunityFeed(buyerActorId: EntityId, generatedAt: ISODateTime) {
    const demandIds = [...this.demands.values()]
      .filter((demand) => demand.buyerActorId === buyerActorId && ["active", "partially_matched"].includes(demand.status))
      .map((demand) => demand.id);

    return [...this.matches.values()]
      .filter((match) => demandIds.includes(match.demandId) && ["proposed", "accepted_by_seller", "confirmed"].includes(match.status))
      .filter((match) => match.expiresAt >= generatedAt)
      .sort((a, b) => b.score - a.score)
      .map((match) => ({
        match: structuredClone(match),
        offer: structuredClone(this.requireOffer(match.offerId)),
        demand: structuredClone(this.requireDemand(match.demandId)),
      }));
  }

  getSellerOpportunityFeed(sellerActorId: EntityId, generatedAt: ISODateTime) {
    const offerIds = [...this.offers.values()]
      .filter((offer) => offer.sellerActorId === sellerActorId && ["published", "partially_reserved"].includes(offer.status))
      .map((offer) => offer.id);

    return [...this.matches.values()]
      .filter((match) => offerIds.includes(match.offerId) && ["proposed", "accepted_by_buyer", "confirmed"].includes(match.status))
      .filter((match) => match.expiresAt >= generatedAt)
      .sort((a, b) => b.score - a.score)
      .map((match) => ({
        match: structuredClone(match),
        offer: structuredClone(this.requireOffer(match.offerId)),
        demand: structuredClone(this.requireDemand(match.demandId)),
      }));
  }

  getMarketLiquidity(input: { generatedAt: ISODateTime; territoryId?: EntityId; speciesCode?: string }): MarketLiquiditySnapshot {
    const offers = [...this.offers.values()].filter((offer) =>
      ["published", "partially_reserved"].includes(offer.status) &&
      offer.availableUntil >= input.generatedAt &&
      (!input.territoryId || offer.territoryId === input.territoryId) &&
      (!input.speciesCode || offer.speciesCode === input.speciesCode),
    );
    const demands = [...this.demands.values()].filter((demand) =>
      ["active", "partially_matched"].includes(demand.status) &&
      demand.neededUntil >= input.generatedAt &&
      (!input.territoryId || demand.territoryIds.length === 0 || demand.territoryIds.includes(input.territoryId)) &&
      (!input.speciesCode || demand.speciesCodes.includes(input.speciesCode)),
    );

    const availableQuantityKg = offers.reduce((sum, offer) => sum + offer.availableQuantityKg, 0);
    const requestedQuantityKg = demands.reduce((sum, demand) => sum + demand.requestedQuantityKg, 0);
    const pricedOffers = offers.filter((offer) => offer.unitPriceXof !== undefined);
    const pricedDemands = demands.filter((demand) => demand.maximumUnitPriceXof !== undefined);

    return {
      territoryId: input.territoryId,
      speciesCode: input.speciesCode,
      activeOfferCount: offers.length,
      activeDemandCount: demands.length,
      availableQuantityKg,
      requestedQuantityKg,
      imbalanceKg: availableQuantityKg - requestedQuantityKg,
      averageOfferPriceXof: pricedOffers.length
        ? Math.round(pricedOffers.reduce((sum, offer) => sum + (offer.unitPriceXof ?? 0), 0) / pricedOffers.length)
        : undefined,
      averageDemandCeilingXof: pricedDemands.length
        ? Math.round(pricedDemands.reduce((sum, demand) => sum + (demand.maximumUnitPriceXof ?? 0), 0) / pricedDemands.length)
        : undefined,
      coverageRatePercent: requestedQuantityKg > 0 ? Math.round((Math.min(availableQuantityKg, requestedQuantityKg) / requestedQuantityKg) * 10000) / 100 : 100,
      generatedAt: input.generatedAt,
    };
  }

  snapshot() {
    return {
      offers: [...this.offers.values()].map((item) => structuredClone(item)),
      demands: [...this.demands.values()].map((item) => structuredClone(item)),
      matches: [...this.matches.values()].map((item) => structuredClone(item)),
      defaultWeights: structuredClone(defaultWeights),
    };
  }

  private evaluateOfferAgainstDemand(
    offer: MarketOffer,
    demand: MarketDemand,
    weights: MatchingWeights,
    options: MatchGenerationOptions,
  ): MarketMatch | null {
    const constraints: MatchingConstraintResult[] = [];
    const rationale: string[] = [];
    const risks: string[] = [];

    const speciesPass = demand.speciesCodes.includes(offer.speciesCode);
    constraints.push({
      code: "species",
      label: "Espèce",
      passed: speciesPass,
      blocking: true,
      scoreImpact: speciesPass ? weights.species : -weights.species,
      explanation: speciesPass ? "Espèce demandée." : "Espèce non recherchée.",
    });

    const qualityPass = demand.acceptedQualityGrades.includes(offer.qualityGrade);
    constraints.push({
      code: "quality",
      label: "Qualité",
      passed: qualityPass,
      blocking: true,
      scoreImpact: qualityPass ? weights.quality : -weights.quality,
      explanation: qualityPass ? "Qualité acceptée." : "Qualité non acceptée par l'acheteur.",
    });

    const quantityPass = offer.availableQuantityKg >= demand.minimumAcceptableQuantityKg && offer.availableQuantityKg >= offer.minimumOrderKg;
    const proposedQuantityKg = Math.min(offer.availableQuantityKg, demand.requestedQuantityKg);
    constraints.push({
      code: "quantity",
      label: "Quantité",
      passed: quantityPass,
      blocking: true,
      scoreImpact: quantityPass ? weights.quantity * Math.min(1, proposedQuantityKg / demand.requestedQuantityKg) : -weights.quantity,
      explanation: quantityPass ? `${proposedQuantityKg} kg peuvent être proposés.` : "Quantité insuffisante.",
    });

    const pricePass = demand.maximumUnitPriceXof === undefined || offer.unitPriceXof === undefined || offer.unitPriceXof <= demand.maximumUnitPriceXof;
    constraints.push({
      code: "price",
      label: "Prix",
      passed: pricePass,
      blocking: demand.maximumUnitPriceXof !== undefined && offer.priceMode === "fixed",
      scoreImpact: pricePass ? weights.price : -weights.price,
      explanation: pricePass ? "Prix compatible avec le plafond acheteur." : "Prix supérieur au plafond acheteur.",
    });

    const geographyPass = demand.territoryIds.length === 0 || demand.territoryIds.includes(offer.territoryId) || demand.preferredLandingSiteIds.includes(offer.landingSiteId);
    constraints.push({
      code: "geography",
      label: "Géographie",
      passed: geographyPass,
      blocking: false,
      scoreImpact: geographyPass ? weights.geography : 0,
      explanation: geographyPass ? "Origine géographique compatible." : "Origine hors zone préférée.",
    });

    const deliveryWindowPass = offer.availableFrom <= demand.neededUntil && offer.availableUntil >= demand.neededFrom;
    constraints.push({
      code: "delivery_window",
      label: "Fenêtre de livraison",
      passed: deliveryWindowPass,
      blocking: true,
      scoreImpact: deliveryWindowPass ? weights.deliveryWindow : -weights.deliveryWindow,
      explanation: deliveryWindowPass ? "Fenêtres temporelles compatibles." : "Fenêtres temporelles incompatibles.",
    });

    const deliveryModes = offer.deliveryModes.filter((mode) => demand.acceptedDeliveryModes.includes(mode));
    const deliveryMode = deliveryModes[0];
    const logisticsPass = Boolean(deliveryMode) && (!demand.coldChainRequired || offer.coldChainAvailable);
    constraints.push({
      code: "logistics",
      label: "Logistique",
      passed: logisticsPass,
      blocking: true,
      scoreImpact: logisticsPass ? weights.logistics : -weights.logistics,
      explanation: logisticsPass ? "Mode logistique et chaîne du froid compatibles." : "Contrainte logistique non couverte.",
    });

    const paymentTerms = offer.paymentTerms.filter((term) => demand.acceptedPaymentTerms.includes(term));
    const paymentTerm = paymentTerms[0];
    const paymentPass = Boolean(paymentTerm);
    constraints.push({
      code: "payment",
      label: "Paiement",
      passed: paymentPass,
      blocking: true,
      scoreImpact: paymentPass ? weights.payment : -weights.payment,
      explanation: paymentPass ? "Conditions de paiement compatibles." : "Aucune condition de paiement commune.",
    });

    const traceabilityPass = offer.traceabilityScore >= demand.minimumTraceabilityScore;
    constraints.push({
      code: "traceability",
      label: "Traçabilité",
      passed: traceabilityPass,
      blocking: true,
      scoreImpact: traceabilityPass ? weights.traceability : -weights.traceability,
      explanation: traceabilityPass ? "Niveau de traçabilité suffisant." : "Traçabilité insuffisante.",
    });

    if (constraints.some((constraint) => constraint.blocking && !constraint.passed)) return null;

    const score = Math.max(0, Math.min(100, Math.round(constraints.reduce((sum, constraint) => sum + Math.max(0, constraint.scoreImpact), 0))));
    if (score < options.minimumScore) return null;

    if (offer.traceabilityScore >= 80) rationale.push("Lot fortement traçable.");
    if (offer.qualityGrade === "premium") rationale.push("Qualité premium.");
    if (pricePass && offer.unitPriceXof !== undefined && demand.maximumUnitPriceXof !== undefined) {
      rationale.push(`Prix inférieur ou égal au plafond de ${demand.maximumUnitPriceXof} XOF/kg.`);
    }
    if (!geographyPass) risks.push("Distance ou coût logistique potentiellement supérieur.");
    if (offer.logisticsRequired) risks.push("Une capacité logistique doit être réservée.");
    if (demand.coldChainRequired && offer.coldChainAvailable) rationale.push("Chaîne du froid disponible.");

    return {
      id: `match:${offer.id}:${demand.id}:${options.generatedAt}`,
      offerId: offer.id,
      demandId: demand.id,
      proposedQuantityKg,
      proposedUnitPriceXof: offer.unitPriceXof,
      currency: "XOF",
      deliveryMode,
      paymentTerm,
      score,
      status: "proposed",
      constraints,
      rationale,
      risks,
      proposedAt: options.generatedAt,
      expiresAt: new Date(new Date(options.generatedAt).getTime() + options.validityHours * 3600000).toISOString(),
    };
  }

  private reserveMatchedQuantity(match: MarketMatch) {
    const offer = this.requireOffer(match.offerId);
    const demand = this.requireDemand(match.demandId);
    if (offer.availableQuantityKg < match.proposedQuantityKg) throw new Error("Quantité d'offre devenue insuffisante.");

    offer.availableQuantityKg -= match.proposedQuantityKg;
    offer.status = offer.availableQuantityKg === 0 ? "reserved" : "partially_reserved";
    demand.requestedQuantityKg -= match.proposedQuantityKg;
    demand.status = demand.requestedQuantityKg <= 0 ? "matched" : "partially_matched";

    this.offers.set(offer.id, offer);
    this.demands.set(demand.id, demand);
  }

  private validateOffer(input: MarketOffer) {
    if (input.availableQuantityKg <= 0) throw new Error("La quantité disponible doit être positive.");
    if (input.minimumOrderKg <= 0 || input.minimumOrderKg > input.availableQuantityKg) {
      throw new Error("La quantité minimale de commande est invalide.");
    }
    if (input.traceabilityScore < 0 || input.traceabilityScore > 100) {
      throw new Error("Le score de traçabilité doit être compris entre 0 et 100.");
    }
    if (input.availableUntil <= input.availableFrom) throw new Error("La fin de disponibilité doit être postérieure au début.");
    if (input.priceMode === "fixed" && (input.unitPriceXof === undefined || input.unitPriceXof <= 0)) {
      throw new Error("Une offre à prix fixe doit avoir un prix positif.");
    }
    if (input.coldChainRequired && !input.coldChainAvailable) {
      throw new Error("Une offre nécessitant la chaîne du froid doit déclarer une capacité disponible.");
    }
    if (input.deliveryModes.length === 0) throw new Error("Au moins un mode de livraison est requis.");
    if (input.paymentTerms.length === 0) throw new Error("Au moins une condition de paiement est requise.");
  }

  private validateDemand(input: MarketDemand) {
    if (input.speciesCodes.length === 0) throw new Error("La demande doit cibler au moins une espèce.");
    if (input.requestedQuantityKg <= 0) throw new Error("La quantité demandée doit être positive.");
    if (input.minimumAcceptableQuantityKg <= 0 || input.minimumAcceptableQuantityKg > input.requestedQuantityKg) {
      throw new Error("La quantité minimale acceptable est invalide.");
    }
    if (input.minimumTraceabilityScore < 0 || input.minimumTraceabilityScore > 100) {
      throw new Error("Le score minimal de traçabilité doit être compris entre 0 et 100.");
    }
    if (input.neededUntil <= input.neededFrom) throw new Error("La fin de besoin doit être postérieure au début.");
    if (input.acceptedDeliveryModes.length === 0) throw new Error("Au moins un mode de livraison accepté est requis.");
    if (input.acceptedPaymentTerms.length === 0) throw new Error("Au moins une condition de paiement acceptée est requise.");
  }

  private requireOffer(id: EntityId) {
    const offer = this.offers.get(id);
    if (!offer) throw new Error(`Offre introuvable : ${id}.`);
    return offer;
  }

  private requireDemand(id: EntityId) {
    const demand = this.demands.get(id);
    if (!demand) throw new Error(`Demande introuvable : ${id}.`);
    return demand;
  }

  private requireMatch(id: EntityId) {
    const match = this.matches.get(id);
    if (!match) throw new Error(`Correspondance introuvable : ${id}.`);
    return match;
  }
}

export function getDefaultMatchingWeights() {
  return structuredClone(defaultWeights);
}

export function validateMarketplaceAndMatchingCatalog() {
  const errors: string[] = [];
  const total = Object.values(defaultWeights).reduce((sum, value) => sum + value, 0);
  if (total !== 100) errors.push(`La somme des poids de matching doit être égale à 100, valeur actuelle : ${total}.`);
  for (const [code, value] of Object.entries(defaultWeights)) {
    if (value < 0) errors.push(`Le poids ${code} ne peut pas être négatif.`);
  }
  return {
    valid: errors.length === 0,
    errors,
    summary: {
      totalWeight: total,
      criteriaCount: Object.keys(defaultWeights).length,
      currency: "XOF",
      supportedPriceModes: ["fixed", "negotiable", "market_reference", "request_quote"],
      supportedDeliveryModes: ["buyer_pickup", "seller_delivery", "third_party_logistics"],
    },
  };
}
