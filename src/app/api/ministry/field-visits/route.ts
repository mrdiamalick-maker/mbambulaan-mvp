import { NextRequest, NextResponse } from "next/server";
import type { FieldVisitObjective } from "@/domain/ministry/field-visit";
import { createFieldVisit, listFieldVisits } from "@/server/ministry-repository";
import { ForbiddenError, requireRole, UnauthorizedError } from "@/server/session";
import { getState } from "@/server/repository";

function errorResponse(error: unknown) {
  if (error instanceof UnauthorizedError) return NextResponse.json({ error: error.message }, { status: 401 });
  if (error instanceof ForbiddenError) return NextResponse.json({ error: error.message }, { status: 403 });
  return NextResponse.json({ error: error instanceof Error ? error.message : "Action impossible." }, { status: 400 });
}

export async function GET() {
  try {
    await requireRole("institution", "administrateur");
    return NextResponse.json({ visits: await listFieldVisits() });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole("institution", "administrateur");
    const body = (await request.json()) as {
      title?: string;
      territoryId?: string;
      objective?: FieldVisitObjective;
      plannedAt?: string;
      notes?: string;
    };
    if (!body.title?.trim() || !body.territoryId || !body.objective || !body.plannedAt) {
      return NextResponse.json({ error: "Titre, territoire, objectif et date sont requis." }, { status: 400 });
    }
    const state = await getState();
    const territory = state.territories.find((item) => item.id === body.territoryId);
    if (!territory) return NextResponse.json({ error: "Territoire inconnu." }, { status: 400 });
    const actor = state.actors.find((item) => item.id === session.actorId);

    const visit = await createFieldVisit({
      title: body.title.trim(),
      territoryId: territory.id,
      territoryLabel: territory.name,
      objective: body.objective,
      plannedAt: body.plannedAt,
      notes: body.notes?.trim() || undefined,
      createdByActorId: session.actorId,
      createdByName: actor?.name ?? "Ministère"
    });
    return NextResponse.json({ visit });
  } catch (error) {
    return errorResponse(error);
  }
}
