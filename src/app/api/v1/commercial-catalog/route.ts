import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getCommercialCatalogExecutionService } from "@/platform/commercial/commercial-catalog-execution";
import { getPersistentCommercialCatalog } from "@/platform/commercial/persistent-commercial-catalog";

export async function GET(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.read" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  try {
    return NextResponse.json(await getPersistentCommercialCatalog().snapshot());
  } catch (error) {
    return NextResponse.json({ error: { code: "CATALOG_RESTORE_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const parsed = await request.json().catch(() => undefined) as Record<string, unknown> | undefined;
  const action = typeof parsed?.action === "string" ? parsed.action : undefined;
  if (!parsed || !action) {
    return NextResponse.json({ error: { code: "INVALID_CATALOG_ACTION", message: "L'action catalogue est obligatoire." } }, { status: 400 });
  }

  const authorization = authorizeDemoRequest({ request, permission: "trade.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const commandId = typeof parsed.commandId === "string" && parsed.commandId.trim()
    ? parsed.commandId
    : `catalog-${action}-${Date.now()}`;
  const catalog = getPersistentCommercialCatalog();

  try {
    switch (action) {
      case "seed_demo": {
        const result = await catalog.execute({
          commandId,
          identity: authorization.identity,
          territoryId: authorization.session.activeTerritoryId,
          command: { type: "seed_demo", at: typeof parsed.at === "string" ? parsed.at : undefined },
        });
        return NextResponse.json({ result, catalog: await catalog.snapshot() }, { status: 201 });
      }
      case "reserve": {
        const reservation = await catalog.execute({
          commandId,
          identity: authorization.identity,
          territoryId: authorization.session.activeTerritoryId,
          command: {
            type: "reserve",
            reservationId: String(parsed.reservationId),
            offerId: String(parsed.offerId),
            quantityKg: Number(parsed.quantityKg),
            logisticsOptionId: String(parsed.logisticsOptionId),
            ttlMinutes: parsed.ttlMinutes === undefined ? undefined : Number(parsed.ttlMinutes),
            at: typeof parsed.at === "string" ? parsed.at : undefined,
          },
        });
        return NextResponse.json({ reservation, catalog: await catalog.snapshot() }, { status: 201 });
      }
      case "confirm_reservation": {
        const reservationId = String(parsed.reservationId);
        const reservation = await catalog.execute({
          commandId,
          identity: authorization.identity,
          territoryId: authorization.session.activeTerritoryId,
          command: { type: "confirm_reservation", reservationId, at: typeof parsed.at === "string" ? parsed.at : undefined },
        });
        const conversion = await getCommercialCatalogExecutionService().convertConfirmedReservation({
          reservationId,
          buyerIdentity: authorization.identity,
          at: typeof parsed.at === "string" ? parsed.at : undefined,
        });
        return NextResponse.json({ reservation, conversion, catalog: await catalog.snapshot() });
      }
      case "cancel_reservation": {
        const reservation = await catalog.execute({
          commandId,
          identity: authorization.identity,
          territoryId: authorization.session.activeTerritoryId,
          command: {
            type: "cancel_reservation",
            reservationId: String(parsed.reservationId),
            at: typeof parsed.at === "string" ? parsed.at : undefined,
          },
        });
        return NextResponse.json({ reservation, catalog: await catalog.snapshot() });
      }
      default:
        return NextResponse.json({ error: { code: "UNKNOWN_CATALOG_ACTION", message: "Action catalogue inconnue." } }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: { code: "CATALOG_ACTION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
