import { NextResponse } from "next/server";
import { ForbiddenError, requireRole, UnauthorizedError } from "@/server/session";
import { markPublicRequestInStudy } from "@/server/public-repository";

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
  console.error("public_request_mark_in_study_failed", error);
  return NextResponse.json({ error: "Impossible de mettre à jour la demande publique." }, { status: 500 });
}

// Appelée uniquement après la création réussie du ServiceRequest côté
// Produit (CoordinationWorkspace.tsx) — une seule transition possible ici
// (recue → en_etude), pas une API générique de changement de statut.
// Mêmes rôles que la lecture (GET ../route.ts) et que /app/coordination.
export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("administrateur", "operateur", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "partenaire");
    const { id } = await params;
    await markPublicRequestInStudy(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
