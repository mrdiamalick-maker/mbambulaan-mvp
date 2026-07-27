import { NextResponse } from "next/server";
import { authorizeDemoRequest } from "@/platform/access/request-authorization";
import { getCommercialCatalogExecutionService } from "@/platform/commercial/commercial-catalog-execution";

export async function POST(request: Request) {
  const authorization = authorizeDemoRequest({ request, permission: "trade.write" });
  if (!authorization.allowed) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  if (authorization.identity.roleCode !== "buyer_operator") {
    return NextResponse.json({ error: { code: "BUYER_REQUIRED", message: "Seul l'acheteur peut convertir sa réservation en commande." } }, { status: 403 });
  }

  const body = await request.json().catch(() => undefined) as { reservationId?: string } | undefined;
  if (!body?.reservationId) {
    return NextResponse.json({ error: { code: "INVALID_RESERVATION", message: "reservationId est obligatoire." } }, { status: 400 });
  }

  try {
    const result = await getCommercialCatalogExecutionService().convertConfirmedReservation({
      reservationId: body.reservationId,
      buyerIdentity: authorization.identity,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: { code: "CATALOG_CONVERSION_FAILED", message: error instanceof Error ? error.message : String(error) } }, { status: 422 });
  }
}
