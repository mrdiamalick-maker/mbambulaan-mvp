import type { DemoIdentity } from "@/platform/access/demo-access-control";
import { getDemoAccessControl } from "@/platform/access/demo-access-registry";
import { getRuntimeSqlExecutor, hasRuntimeDatabase } from "@/platform/persistence/postgres-runtime-pool";
import { getCommercialCatalog } from "./commercial-catalog-registry";
import { getPersistentCommercialWorkflow } from "./persistent-commercial-workflow";

export interface CatalogExecutionLink {
  reservationId: string;
  catalogOfferId: string;
  executionOfferId: string;
  orderId: string;
  sellerOrganizationId: string;
  buyerOrganizationId: string;
  logisticsOrganizationId: string;
  logisticsOptionId: string;
  territoryId: string;
  createdAt: string;
}

export interface CatalogExecutionLinkRepository {
  findByReservationId(reservationId: string): Promise<CatalogExecutionLink | undefined>;
  findByOrderId(orderId: string): Promise<CatalogExecutionLink | undefined>;
  save(link: CatalogExecutionLink): Promise<void>;
}

export class VolatileCatalogExecutionLinkRepository implements CatalogExecutionLinkRepository {
  private readonly links = new Map<string, CatalogExecutionLink>();
  async findByReservationId(reservationId: string) {
    const link = this.links.get(reservationId);
    return link ? structuredClone(link) : undefined;
  }
  async findByOrderId(orderId: string) {
    const link = [...this.links.values()].find((item) => item.orderId === orderId);
    return link ? structuredClone(link) : undefined;
  }
  async save(link: CatalogExecutionLink) {
    this.links.set(link.reservationId, structuredClone(link));
  }
}

export class PostgresCatalogExecutionLinkRepository implements CatalogExecutionLinkRepository {
  async findByReservationId(reservationId: string) {
    const result = await getRuntimeSqlExecutor().query<Record<string, unknown>>(
      "SELECT * FROM mbambulaan.catalog_execution_links WHERE reservation_id=$1",
      [reservationId],
    );
    return result.rows[0] ? mapLink(result.rows[0]) : undefined;
  }

  async findByOrderId(orderId: string) {
    const result = await getRuntimeSqlExecutor().query<Record<string, unknown>>(
      "SELECT * FROM mbambulaan.catalog_execution_links WHERE order_id=$1",
      [orderId],
    );
    return result.rows[0] ? mapLink(result.rows[0]) : undefined;
  }

  async save(link: CatalogExecutionLink) {
    await getRuntimeSqlExecutor().query(
      `INSERT INTO mbambulaan.catalog_execution_links
       (reservation_id,catalog_offer_id,execution_offer_id,order_id,seller_organization_id,buyer_organization_id,logistics_organization_id,logistics_option_id,territory_id,created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (reservation_id) DO NOTHING`,
      [link.reservationId, link.catalogOfferId, link.executionOfferId, link.orderId,
       link.sellerOrganizationId, link.buyerOrganizationId, link.logisticsOrganizationId,
       link.logisticsOptionId, link.territoryId, link.createdAt],
    );
  }
}

export class CommercialCatalogExecutionService {
  constructor(private readonly links: CatalogExecutionLinkRepository) {}

  async convertConfirmedReservation(input: { reservationId: string; buyerIdentity: DemoIdentity; at?: string }) {
    const existing = await this.links.findByReservationId(input.reservationId);
    if (existing) return { link: existing, execution: await getPersistentCommercialWorkflow().snapshot() };

    const catalog = getCommercialCatalog().snapshot(input.at);
    const reservation = catalog.reservations.find((item) => item.id === input.reservationId);
    if (!reservation) throw new Error("Réservation introuvable.");
    if (reservation.status !== "confirmed") throw new Error("La réservation doit être confirmée avant création de la commande.");
    if (reservation.buyerOrganizationId !== input.buyerIdentity.organizationId) throw new Error("La réservation appartient à une autre organisation acheteuse.");
    const offer = catalog.offers.find((item) => item.id === reservation.offerId);
    const logistics = catalog.logisticsOptions.find((item) => item.id === reservation.logisticsOptionId);
    if (!offer || !logistics) throw new Error("Les données catalogue de la réservation sont incomplètes.");
    const sellerIdentity = getDemoAccessControl().listIdentities().find(
      (identity) => identity.organizationId === offer.sellerOrganizationId && identity.roleCode === "cooperative_manager",
    );
    if (!sellerIdentity) throw new Error("Aucun responsable vendeur n'est disponible pour cette offre.");

    const at = input.at ?? new Date().toISOString();
    const executionOfferId = `execution-${offer.id}-${reservation.id}`;
    const orderId = `order-${reservation.id}`;
    const workflow = getPersistentCommercialWorkflow();
    await workflow.execute({
      commandId: `convert-${reservation.id}-offer`,
      identity: sellerIdentity,
      territoryId: offer.territoryId,
      command: {
        type: "publish_offer",
        offerId: executionOfferId,
        sellerOrganizationId: offer.sellerOrganizationId,
        territoryId: offer.territoryId,
        speciesCode: offer.speciesCode,
        qualityGrade: offer.qualityGrade,
        availableQuantityKg: reservation.quantityKg,
        unitPriceXof: offer.unitPriceXof,
        at,
      },
    });
    const commissionRateBps = reservation.seafoodAmountXof === 0
      ? 0
      : Math.round(reservation.platformCommissionXof * 10_000 / reservation.seafoodAmountXof);
    const execution = await workflow.execute({
      commandId: `convert-${reservation.id}-order`,
      identity: input.buyerIdentity,
      territoryId: offer.territoryId,
      command: {
        type: "place_order",
        orderId,
        offerId: executionOfferId,
        buyerOrganizationId: reservation.buyerOrganizationId,
        quantityKg: reservation.quantityKg,
        logisticsAmountXof: reservation.logisticsAmountXof,
        platformCommissionRateBps: commissionRateBps,
        at,
      },
    });
    const link: CatalogExecutionLink = {
      reservationId: reservation.id,
      catalogOfferId: offer.id,
      executionOfferId,
      orderId,
      sellerOrganizationId: offer.sellerOrganizationId,
      buyerOrganizationId: reservation.buyerOrganizationId,
      logisticsOrganizationId: logistics.operatorOrganizationId,
      logisticsOptionId: logistics.id,
      territoryId: offer.territoryId,
      createdAt: at,
    };
    await this.links.save(link);
    return { link, execution };
  }

  async assertSelectedLogistics(orderId: string, identity: DemoIdentity) {
    const link = await this.links.findByOrderId(orderId);
    if (link && link.logisticsOrganizationId !== identity.organizationId) {
      throw new Error("Cette commande est attribuée à un autre opérateur logistique.");
    }
    return link;
  }
}

function mapLink(row: Record<string, unknown>): CatalogExecutionLink {
  return {
    reservationId: String(row.reservation_id),
    catalogOfferId: String(row.catalog_offer_id),
    executionOfferId: String(row.execution_offer_id),
    orderId: String(row.order_id),
    sellerOrganizationId: String(row.seller_organization_id),
    buyerOrganizationId: String(row.buyer_organization_id),
    logisticsOrganizationId: String(row.logistics_organization_id),
    logisticsOptionId: String(row.logistics_option_id),
    territoryId: String(row.territory_id),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

declare global {
  var __mbambulaanCatalogExecutionService: CommercialCatalogExecutionService | undefined;
}

export function getCommercialCatalogExecutionService() {
  globalThis.__mbambulaanCatalogExecutionService ??= new CommercialCatalogExecutionService(
    hasRuntimeDatabase() ? new PostgresCatalogExecutionLinkRepository() : new VolatileCatalogExecutionLinkRepository(),
  );
  return globalThis.__mbambulaanCatalogExecutionService;
}
