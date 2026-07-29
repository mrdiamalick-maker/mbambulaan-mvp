import type { CrisisCommand, CrisisPriorityNeed } from "./ecosystem-crisis-response-runtime";

export interface TerritoryCapacityOffer {
  id: string;
  crisisId: string;
  sourceTerritoryId: string;
  capacityType: CrisisPriorityNeed["needType"];
  availableQuantity: number;
  unit: string;
  ownerActorId: string;
  ownerOrganizationId: string;
  earliestDepartureAt: string;
  estimatedArrivalAt: string;
  estimatedTransferCostXof: number;
  conditions: string[];
  availabilityDocumentIds: string[];
  status: "available" | "reserved" | "in_transfer" | "delivered" | "withdrawn";
}

export interface InterterritorialTransfer {
  id: string;
  crisisId: string;
  needId: string;
  capacityOfferId: string;
  sourceTerritoryId: string;
  destinationTerritoryId: string;
  responsibleActorId: string;
  quantity: number;
  unit: string;
  authorizedBudgetXof: number;
  departureDocumentIds: string[];
  receptionDocumentIds: string[];
  status: "planned" | "departed" | "received" | "cancelled";
  plannedAt: string;
  departedAt?: string;
  receivedAt?: string;
}

export class InterterritorialCapacityCoordination {
  private readonly offers: TerritoryCapacityOffer[] = [];
  private readonly transfers: InterterritorialTransfer[] = [];

  registerOffer(input: TerritoryCapacityOffer) {
    this.ensureUnique(input.id, this.offers, "capacité disponible");
    if (input.availableQuantity <= 0) throw new Error("La quantité disponible doit être positive.");
    if (!input.availabilityDocumentIds.length) throw new Error("La capacité disponible doit être confirmée par un relevé ou une attestation du responsable.");
    if (input.estimatedTransferCostXof < 0) throw new Error("Le coût estimé du transfert ne peut pas être négatif.");
    this.offers.push(structuredClone(input));
    return structuredClone(input);
  }

  selectBestOffer(input: { crisisId: string; need: CrisisPriorityNeed; maximumBudgetXof: number }) {
    const candidates = this.offers
      .filter((offer) => offer.crisisId === input.crisisId)
      .filter((offer) => offer.capacityType === input.need.needType)
      .filter((offer) => offer.unit === input.need.unit)
      .filter((offer) => offer.status === "available")
      .filter((offer) => offer.availableQuantity > 0)
      .filter((offer) => offer.estimatedTransferCostXof <= input.maximumBudgetXof)
      .sort((left, right) => {
        const arrival = Date.parse(left.estimatedArrivalAt) - Date.parse(right.estimatedArrivalAt);
        if (arrival !== 0) return arrival;
        return left.estimatedTransferCostXof - right.estimatedTransferCostXof;
      });
    const selected = candidates[0];
    if (!selected) throw new Error("Aucune capacité compatible n'est disponible dans le délai et le budget autorisés.");
    return structuredClone(selected);
  }

  planTransfer(input: InterterritorialTransfer) {
    this.ensureUnique(input.id, this.transfers, "transfert interterritorial");
    const offer = this.requireOffer(input.capacityOfferId);
    if (offer.status !== "available") throw new Error("La capacité sélectionnée n'est plus disponible.");
    if (offer.crisisId !== input.crisisId || offer.sourceTerritoryId !== input.sourceTerritoryId) throw new Error("La capacité sélectionnée ne correspond pas à la crise ou au territoire source.");
    if (input.quantity <= 0 || input.quantity > offer.availableQuantity) throw new Error("La quantité du transfert dépasse la capacité disponible.");
    if (input.authorizedBudgetXof < offer.estimatedTransferCostXof) throw new Error("Le budget autorisé ne couvre pas le transfert.");
    offer.status = "reserved";
    this.transfers.push(structuredClone(input));
    return structuredClone(input);
  }

  confirmDeparture(input: { transferId: string; departureDocumentIds: string[]; departedAt: string }) {
    const transfer = this.requireTransfer(input.transferId);
    const offer = this.requireOffer(transfer.capacityOfferId);
    if (transfer.status !== "planned") throw new Error("Seul un transfert planifié peut partir.");
    if (!input.departureDocumentIds.length) throw new Error("Le bon de départ ou le relevé de chargement est obligatoire.");
    transfer.status = "departed";
    transfer.departedAt = input.departedAt;
    transfer.departureDocumentIds = [...new Set([...transfer.departureDocumentIds, ...input.departureDocumentIds])];
    offer.status = "in_transfer";
    return structuredClone(transfer);
  }

  confirmReception(input: { transferId: string; receptionDocumentIds: string[]; receivedAt: string; commandId: string }): { transfer: InterterritorialTransfer; crisisCommand: { commandId: string; command: CrisisCommand } } {
    const transfer = this.requireTransfer(input.transferId);
    const offer = this.requireOffer(transfer.capacityOfferId);
    if (transfer.status !== "departed") throw new Error("Le transfert doit avoir quitté le territoire source avant réception.");
    if (!input.receptionDocumentIds.length) throw new Error("Le bon de réception ou la confirmation du site destinataire est obligatoire.");
    transfer.status = "received";
    transfer.receivedAt = input.receivedAt;
    transfer.receptionDocumentIds = [...new Set([...transfer.receptionDocumentIds, ...input.receptionDocumentIds])];
    offer.status = "delivered";
    offer.availableQuantity -= transfer.quantity;
    return {
      transfer: structuredClone(transfer),
      crisisCommand: {
        commandId: input.commandId,
        command: {
          type: "mobilize_need",
          needId: transfer.needId,
          quantity: transfer.quantity,
          supportingDocumentIds: transfer.receptionDocumentIds,
        },
      },
    };
  }

  snapshot() {
    return structuredClone({
      offers: this.offers,
      transfers: this.transfers,
      metrics: {
        availableOfferCount: this.offers.filter((item) => item.status === "available").length,
        transferUnderwayCount: this.transfers.filter((item) => item.status === "departed").length,
        deliveredTransferCount: this.transfers.filter((item) => item.status === "received").length,
        deliveredQuantity: this.transfers.filter((item) => item.status === "received").reduce((sum, item) => sum + item.quantity, 0),
        committedTransferBudgetXof: this.transfers.filter((item) => item.status !== "cancelled").reduce((sum, item) => sum + item.authorizedBudgetXof, 0),
      },
    });
  }

  private ensureUnique<T extends { id: string }>(id: string, values: T[], label: string) { if (values.some((item) => item.id === id)) throw new Error(`${label} déjà enregistré : ${id}.`); }
  private requireOffer(id: string) { const value = this.offers.find((item) => item.id === id); if (!value) throw new Error(`Capacité disponible introuvable : ${id}.`); return value; }
  private requireTransfer(id: string) { const value = this.transfers.find((item) => item.id === id); if (!value) throw new Error(`Transfert introuvable : ${id}.`); return value; }
}
