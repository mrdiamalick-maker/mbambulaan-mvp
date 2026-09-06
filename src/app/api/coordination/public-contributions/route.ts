import { NextResponse } from "next/server";
import { ForbiddenError, requireRole, UnauthorizedError } from "@/server/session";
import { getPendingPublicContributions } from "@/server/public-repository";

export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
  console.error("public_contributions_list_failed", error);
  return NextResponse.json({ error: "Impossible de charger les contributions publiques." }, { status: 500 });
}

// LOT 7 (mandat "Actor & Trust Network") — mêmes rôles que
// qualify_signal_as_network_capacity côté permissions.ts
// (coordinateur/gestionnaire_organisation/institution) + administrateur :
// seuls ceux qui peuvent réellement qualifier une contribution ont besoin
// de la lire ici. Même discipline que /api/coordination/public-requests
// (vérifié explicitement, pas seulement via une garde de layout).
export async function GET() {
  try {
    await requireRole("administrateur", "coordinateur", "gestionnaire_organisation", "institution");
    const contributions = await getPendingPublicContributions();
    return NextResponse.json({ contributions });
  } catch (error) {
    return errorResponse(error);
  }
}
