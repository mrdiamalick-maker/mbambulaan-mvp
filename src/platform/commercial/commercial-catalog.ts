export type CatalogOfferStatus = "draft" | "published" | "suspended" | "sold_out" | "expired";
export type ReservationStatus = "active" | "confirmed" | "cancelled" | "expired";

export interface CatalogOffer {
  id: string;
  sellerOrganizationId: string;
  territoryId: string;
  speciesCode: string;
  qualityGrade: string;
  landingSiteId: string;
  availableQuantityKg: number;
  reservedQuantityKg: number;
  unitPriceXof: number;
  minimumOrderKg: number;
  availableFrom: string;
  expiresAt: string;
  status: CatalogOfferStatus;
  publishedAt?: string;
}

export interface LogisticsOption {
  id: string;
  operatorOrganizationId: string;
  territoryIds: string[];
  pricePerKgXof: number;
  minimumFeeXof: number;
  estimatedHours: number;
  coldChain: boolean;
  active: boolean;
}

export interface CatalogReservation {
  id: string;
  offerId: string;
  buyerOrganizationId: string;
  quantityKg: number;
  logisticsOptionId: string;
  seafoodAmountXof: number;
  logisticsAmountXof: number;
  platformCommissionXof: number;
  totalAmountXof: number;
  status: ReservationStatus;
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

export interface CommercialCatalogSnapshot {
  offers: CatalogOffer[];
  logisticsOptions: LogisticsOption[];
  reservations: CatalogReservation[];
  availableQuantityKg: number;
  activeReservedQuantityKg: number;
}

export class CommercialCatalog {
  private readonly offers = new Map<string, CatalogOffer>();
  private readonly logisticsOptions = new Map<string, LogisticsOption>();
  private readonly reservations = new Map<string, CatalogReservation>();

  upsertLogisticsOption(option: LogisticsOption) {
    if (option.pricePerKgXof < 0 || option.minimumFeeXof < 0) throw new Error("Le tarif logistique est invalide.");
    if (option.estimatedHours <= 0) throw new Error("Le délai logistique doit être positif.");
    this.logisticsOptions.set(option.id, structuredClone(option));
    return structuredClone(option);
  }

  createOffer(input: Omit<CatalogOffer, "reservedQuantityKg" | "status" | "publishedAt">) {
    if (this.offers.has(input.id)) throw new Error("Une offre avec cet identifiant existe déjà.");
    if (input.availableQuantityKg <= 0 || input.minimumOrderKg <= 0) throw new Error("Les quantités de l'offre sont invalides.");
    if (input.unitPriceXof <= 0) throw new Error("Le prix unitaire doit être positif.");
    if (Date.parse(input.expiresAt) <= Date.parse(input.availableFrom)) throw new Error("La date d'expiration doit être postérieure à la disponibilité.");
    const offer: CatalogOffer = { ...input, reservedQuantityKg: 0, status: "draft" };
    this.offers.set(offer.id, offer);
    return structuredClone(offer);
  }

  publishOffer(offerId: string, at = new Date().toISOString()) {
    const offer = this.requireOffer(offerId);
    if (offer.status !== "draft" && offer.status !== "suspended") throw new Error("L'offre ne peut pas être publiée dans cet état.");
    if (Date.parse(offer.expiresAt) <= Date.parse(at)) throw new Error("L'offre est déjà expirée.");
    offer.status = "published";
    offer.publishedAt = at;
    return structuredClone(offer);
  }

  reserve(input: {
    id: string;
    offerId: string;
    buyerOrganizationId: string;
    quantityKg: number;
    logisticsOptionId: string;
    platformCommissionRateBps?: number;
    ttlMinutes?: number;
    at?: string;
  }) {
    if (this.reservations.has(input.id)) return structuredClone(this.reservations.get(input.id)!);
    const at = input.at ?? new Date().toISOString();
    this.expireReservations(at);
    const offer = this.requireOffer(input.offerId);
    if (offer.status !== "published") throw new Error("L'offre n'est pas disponible.");
    if (Date.parse(offer.expiresAt) <= Date.parse(at)) {
      offer.status = "expired";
      throw new Error("L'offre est expirée.");
    }
    if (input.quantityKg < offer.minimumOrderKg) throw new Error("La quantité est inférieure au minimum de commande.");
    const freeQuantity = offer.availableQuantityKg - offer.reservedQuantityKg;
    if (input.quantityKg > freeQuantity) throw new Error("La quantité disponible est insuffisante.");
    const logistics = this.requireLogisticsOption(input.logisticsOptionId);
    if (!logistics.active || !logistics.territoryIds.includes(offer.territoryId)) throw new Error("L'option logistique n'est pas disponible sur ce territoire.");
    const seafoodAmountXof = Math.round(input.quantityKg * offer.unitPriceXof);
    const logisticsAmountXof = Math.max(logistics.minimumFeeXof, Math.round(input.quantityKg * logistics.pricePerKgXof));
    const commissionRate = input.platformCommissionRateBps ?? 250;
    const platformCommissionXof = Math.round(seafoodAmountXof * commissionRate / 10_000);
    const ttlMinutes = input.ttlMinutes ?? 30;
    const reservation: CatalogReservation = {
      id: input.id,
      offerId: offer.id,
      buyerOrganizationId: input.buyerOrganizationId,
      quantityKg: input.quantityKg,
      logisticsOptionId: logistics.id,
      seafoodAmountXof,
      logisticsAmountXof,
      platformCommissionXof,
      totalAmountXof: seafoodAmountXof + logisticsAmountXof + platformCommissionXof,
      status: "active",
      createdAt: at,
      expiresAt: new Date(Date.parse(at) + ttlMinutes * 60_000).toISOString(),
    };
    offer.reservedQuantityKg += input.quantityKg;
    this.reservations.set(reservation.id, reservation);
    return structuredClone(reservation);
  }

  confirmReservation(reservationId: string, at = new Date().toISOString()) {
    this.expireReservations(at);
    const reservation = this.requireReservation(reservationId);
    if (reservation.status !== "active") throw new Error("La réservation n'est plus active.");
    const offer = this.requireOffer(reservation.offerId);
    reservation.status = "confirmed";
    reservation.confirmedAt = at;
    offer.reservedQuantityKg -= reservation.quantityKg;
    offer.availableQuantityKg -= reservation.quantityKg;
    if (offer.availableQuantityKg === 0) offer.status = "sold_out";
    return structuredClone(reservation);
  }

  cancelReservation(reservationId: string, at = new Date().toISOString()) {
    const reservation = this.requireReservation(reservationId);
    if (reservation.status !== "active") throw new Error("Seule une réservation active peut être annulée.");
    reservation.status = "cancelled";
    reservation.cancelledAt = at;
    const offer = this.requireOffer(reservation.offerId);
    offer.reservedQuantityKg -= reservation.quantityKg;
    return structuredClone(reservation);
  }

  expireReservations(at = new Date().toISOString()) {
    for (const reservation of this.reservations.values()) {
      if (reservation.status === "active" && Date.parse(reservation.expiresAt) <= Date.parse(at)) {
        reservation.status = "expired";
        const offer = this.requireOffer(reservation.offerId);
        offer.reservedQuantityKg -= reservation.quantityKg;
      }
    }
    for (const offer of this.offers.values()) {
      if (["published", "suspended"].includes(offer.status) && Date.parse(offer.expiresAt) <= Date.parse(at)) offer.status = "expired";
    }
  }

  snapshot(at = new Date().toISOString()): CommercialCatalogSnapshot {
    this.expireReservations(at);
    const offers = [...this.offers.values()];
    const reservations = [...this.reservations.values()];
    return {
      offers: structuredClone(offers),
      logisticsOptions: structuredClone([...this.logisticsOptions.values()]),
      reservations: structuredClone(reservations),
      availableQuantityKg: offers.reduce((sum, offer) => sum + Math.max(0, offer.availableQuantityKg - offer.reservedQuantityKg), 0),
      activeReservedQuantityKg: reservations.filter((item) => item.status === "active").reduce((sum, item) => sum + item.quantityKg, 0),
    };
  }

  reset() {
    this.offers.clear();
    this.logisticsOptions.clear();
    this.reservations.clear();
  }

  private requireOffer(id: string) {
    const offer = this.offers.get(id);
    if (!offer) throw new Error("Offre introuvable.");
    return offer;
  }

  private requireReservation(id: string) {
    const reservation = this.reservations.get(id);
    if (!reservation) throw new Error("Réservation introuvable.");
    return reservation;
  }

  private requireLogisticsOption(id: string) {
    const option = this.logisticsOptions.get(id);
    if (!option) throw new Error("Option logistique introuvable.");
    return option;
  }
}
