import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getCommercialCatalogExecutionService } from "@/platform/commercial/commercial-catalog-execution";
import { getCommercialCatalog } from "@/platform/commercial/commercial-catalog-registry";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getCommercialCatalog().snapshot());
}

export async function POST(request: Request) {
  const parsed = await request.json().catch(() => undefined) as Record<string, unknown> | undefined;
  const action = typeof parsed?.action === "string" ? parsed.action : undefined;
  if (!parsed || !action) {
    return NextResponse.json({ error: { code: "INVALID_CATALOG_ACTION", message: "L'action catalogue est obligatoire." } }, { status: 400 });
  }
  const body = parsed;

  const authorization = authorizeDemoRequest({ request, permission: "trade.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const catalog = getCommercialCatalog();

  try {
    switch (action) {
      case "seed_demo": {
        if (!new Set(["cooperative_manager", "platform_admin"]).has(authorization.identity.roleCode)) {
          return NextResponse.json({ error: { code: "SELLER_REQUIRED", message: "Seul un vendeur ou administrateur peut initialiser le catalogue." } }, { status: 403 });
        }
        catalog.reset();
        catalog.upsertLogisticsOption({
          id: "log-dakar-cold",
          operatorOrganizationId: "org-cold-chain-dakar",
          territoryIds: ["territory-dakar"],
          pricePerKgXof: 250,
          minimumFeeXof: 100_000,
          estimatedHours: 4,
          coldChain: true,
          active: true,
        });
        catalog.createOffer({
          id: "offer-thiof-01",
          sellerOrganizationId: authorization.identity.roleCode === "cooperative_manager"
            ? authorization.identity.organizationId
            : "org-cooperative-dakar",
          territoryId: "territory-dakar",
          speciesCode: "thiof",
          qualityGrade: "A",
          landingSiteId: "landing-dakar-01",
          availableQuantityKg: 1_000,
          unitPriceXof: 2_500,
          minimumOrderKg: 100,
          availableFrom: "2026-07-27T08:00:00.000Z",
          expiresAt: "2026-07-28T08:00:00.000Z",
        });
        catalog.publishOffer("offer-thiof-01", "2026-07-27T08:00:00.000Z");
        return NextResponse.json(catalog.snapshot("2026-07-27T08:01:00.000Z"), { status: 201 });
      }
      case "reserve": {
        assertBuyer(authorization.identity.roleCode);
        const reservation = catalog.reserve({
          id: String(body.reservationId),
          offerId: String(body.offerId),
          buyerOrganizationId: authorization.identity.organizationId,
          quantityKg: Number(body.quantityKg),
          logisticsOptionId: String(body.logisticsOptionId),
          ttlMinutes: body.ttlMinutes === undefined ? undefined : Number(body.ttlMinutes),
        });
        return NextResponse.json({ reservation, catalog: catalog.snapshot() }, { status: 201 });
      }
      case "confirm_reservation": {
        assertBuyer(authorization.identity.roleCode);
        const reservationId = String(body.reservationId);
        const reservation = catalog.confirmReservation(reservationId);
        const conversion = await getCommercialCatalogExecutionService().convertConfirmedReservation({
          reservationId,
          buyerIdentity: authorization.identity,
        });
        return NextResponse.json({ reservation, conversion, catalog: catalog.snapshot() });
      }
      case "cancel_reservation":
        assertBuyer(authorization.identity.roleCode);
        return NextResponse.json({ reservation: catalog.cancelReservation(String(body.reservationId)), catalog: catalog.snapshot() });
      default:
        return NextResponse.json({ error: { code: "UNKNOWN_CATALOG_ACTION", message: "Action catalogue inconnue." } }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: { code: "CATALOG_ACTION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}

function assertBuyer(roleCode: string) {
  if (roleCode !== "buyer_operator") throw new Error("Seul un acheteur professionnel peut gérer une réservation.");
}
