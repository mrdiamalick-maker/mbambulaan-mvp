import { NextResponse } from "next/server";
import { assertCan } from "@/server/permissions";
import { dispatch, persistenceMode } from "@/server/repository";
import { requireSession, UnauthorizedError } from "@/server/session";
import { projectStateForSession } from "@/server/access-projection";

// Réinitialisation réservée à l'environnement de démonstration (sans base
// réelle configurée). Dès qu'une base réelle est branchée (DATABASE_URL),
// cette route reste inerte : elle ne doit jamais pouvoir effacer des
// données ministère/terrain réelles.
export async function POST() {
  if (persistenceMode() !== "memoire_locale_demo") {
    return NextResponse.json(
      { error: "Réinitialisation indisponible : un environnement de production est configuré." },
      { status: 403 }
    );
  }
  try {
    const session = await requireSession();
    assertCan(session.role, { type: "reset_demo", actorId: session.actorId });
    // P2.1-B.1 (§8/§9) — même correctif que POST /api/actions : reset_demo
    // renvoyait le ProductState complet régénéré, non filtré, à toute
    // session autorisée à le déclencher (administrateur/coordinateur/
    // institution) — institution n'a pourtant jamais eu
    // convert_message_to_signal (P2.1-B, §2) : sans reprojection, cette
    // route réintroduisait exactement la fuite d'IncomingMessage que
    // access-projection.ts ferme ailleurs.
    const next = await dispatch({ type: "reset_demo", actorId: session.actorId }, crypto.randomUUID());
    return NextResponse.json({ state: projectStateForSession(next, session) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Réinitialisation impossible." },
      { status: 400 }
    );
  }
}
