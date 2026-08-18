import { NextResponse } from "next/server";
import { ForbiddenError, requireRole, UnauthorizedError } from "@/server/session";
import { getPendingPublicRequests } from "@/server/public-repository";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
  console.error("public_requests_list_failed", error);
  return NextResponse.json({ error: "Impossible de charger les demandes publiques." }, { status: 500 });
}

// Mêmes rôles que /app/coordination aujourd'hui (AppSidebar.tsx, nav
// "Coordinations") — pas de garde plus stricte par anticipation (arbitrage
// CEO du 2026-08-12) : institution et capitaine en sont exclus, comme sur
// la page elle-même. Vérifié explicitement ici plutôt que de compter
// uniquement sur la garde de layout de /app/(coordination) — même
// discipline que le correctif P0 du 2026-08-12 (une garde de page ne
// protège pas une route API appelée directement).
export async function GET() {
  try {
    await requireRole("administrateur", "operateur", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "partenaire");
    const requests = await getPendingPublicRequests();
    return NextResponse.json({ requests });
  } catch (error) {
    return errorResponse(error);
  }
}
