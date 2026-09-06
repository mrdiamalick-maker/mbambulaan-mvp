import { NextResponse } from "next/server";
import { getState, persistenceMode } from "@/server/repository";
import { currentSession } from "@/server/session";
import { projectStateForSession } from "@/server/access-projection";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "Session absente ou expirée." }, { status: 401 });
  // P2.1-A (Fondation B, "Data Access") — projectStateForSession est
  // désormais le seul point de filtrage serveur avant l'envoi au client :
  // le ProductState complet n'est plus jamais renvoyé tel quel à un rôle
  // non transverse. Cf. server/access-projection.ts.
  return NextResponse.json({
    state: projectStateForSession(await getState(), session),
    session,
    persistence: persistenceMode()
  });
}
