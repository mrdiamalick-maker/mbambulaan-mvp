import { NextRequest, NextResponse } from "next/server";
import type { Role } from "@/domain/types";
import { setSession } from "@/server/session";

const roles: Role[] = ["agent_terrain", "coordinateur", "responsable_initiative", "decideur", "partenaire", "expert", "administrateur"];

export async function POST(request: NextRequest) {
  const { role } = (await request.json()) as { role: Role };
  if (!roles.includes(role)) return NextResponse.json({ error: "Rôle inconnu." }, { status: 400 });
  await setSession({
    actorId: role === "agent_terrain" ? "act-terrain" : role === "decideur" ? "act-decision" : role === "partenaire" ? "act-partner" : "act-coordinateur",
    role,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    demo: true
  });
  return NextResponse.json({ ok: true });
}
