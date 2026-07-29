import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@/domain/types";
import { setSession } from "@/server/session";

const roleActors: Record<Role, string> = {
  administrateur: "act-admin",
  operateur: "act-operateur",
  capitaine: "act-capitaine",
  mareyeur: "act-mareyeur",
  transformateur: "act-transform",
  prestataire: "act-prestataire",
  gestionnaire_organisation: "act-gestionnaire",
  coordinateur: "act-coordinateur",
  institution: "act-institution",
  partenaire: "act-partenaire"
};

export async function POST(request: NextRequest) {
  const { role } = (await request.json()) as { role: Role };
  if (!roleActors[role]) return NextResponse.json({ error: "Rôle inconnu." }, { status: 400 });
  await setSession({
    actorId: roleActors[role],
    role,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    demo: true
  });
  return NextResponse.json({ ok: true });
}
