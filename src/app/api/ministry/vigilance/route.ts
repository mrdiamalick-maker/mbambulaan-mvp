import { NextRequest, NextResponse } from "next/server";
import type { VigilanceCategory, VigilanceSeverity, VigilanceStatus } from "@/domain/ministry/vigilance";
import { createVigilanceCase, listVigilanceCases, updateVigilanceStatus } from "@/server/ministry-repository";
import { ForbiddenError, requireRole, UnauthorizedError } from "@/server/session";
import { getState } from "@/server/repository";

const validStatuses: VigilanceStatus[] = ["signale", "en_verification", "transmis_autorites", "clos"];

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ error: error instanceof Error ? error.message : "Action impossible." }, { status: 400 });
}

export async function GET() {
  try {
    await requireRole("institution", "administrateur");
    return NextResponse.json({ cases: await listVigilanceCases() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole("institution", "administrateur");
    const body = (await request.json()) as {
      category?: VigilanceCategory;
      territoryId?: string;
      severity?: VigilanceSeverity;
      description?: string;
    };
    if (!body.category || !body.territoryId || !body.severity || !body.description?.trim()) {
      return NextResponse.json({ error: "Catégorie, territoire, gravité et description sont requis." }, { status: 400 });
    }
    const state = await getState();
    const territory = state.territories.find((item) => item.id === body.territoryId);
    if (!territory) return NextResponse.json({ error: "Territoire inconnu." }, { status: 400 });
    const actor = state.actors.find((item) => item.id === session.actorId);

    const item = await createVigilanceCase({
      category: body.category,
      territoryId: territory.id,
      territoryLabel: territory.name,
      severity: body.severity,
      description: body.description.trim(),
      reportedByActorId: session.actorId,
      reportedByName: actor?.name ?? "Ministère"
    });
    return NextResponse.json({ case: item });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireRole("institution", "administrateur");
    const body = (await request.json()) as { id?: string; status?: VigilanceStatus };
    if (!body.id || !body.status || !validStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Identifiant et statut valide requis." }, { status: 400 });
    }
    await updateVigilanceStatus(body.id, body.status);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
