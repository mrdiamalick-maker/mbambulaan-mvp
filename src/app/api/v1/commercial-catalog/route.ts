import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getCommercialCatalog } from "@/platform/commercial/commercial-catalog-registry";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  return NextResponse.json(getCommercialCatalog().snapshot());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => undefined) as Record<string, unknown> | undefined;
  const action = typeof body?.action === "string" ? body.action : undefined;
  if (!action) return NextResponse.json({ error: { code: "INVALID_CATALOG_ACTION", message: "L'action catalogue est obligatoire." } }, { status: 400 });

  const authorization = authorizeDemoRequest({ request, permission: "trade.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const catalog = getCommercialCatalog();

  try {
    switch (action) {
      case "seed_demo": {
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
          sellerOrganizationId: "org-cooperative-dakar",
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
      case "confirm_reservation":
        return NextResponse.json({ reservation: catalog.confirmReservation(String(body.reservationId)), catalog: catalog.snapshot() });
      case "cancel_reservation":
        return NextResponse.json({ reservation: catalog.cancelReservation(String(body.reservationId)), catalog: catalog.snapshot() });
      default:
        return NextResponse.json({ error: { code: "UNKNOWN_CATALOG_ACTION", message: "Action catalogue inconnue." } }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: { code: "CATALOG_ACTION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
