import { NextResponse } from "next/server";
import { assertCan } from "@/server/permissions";
import { dispatch, persistenceMode } from "@/server/repository";
import { requireSession, UnauthorizedError } from "@/server/session";

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
    return NextResponse.json({
      state: await dispatch({ type: "reset_demo", actorId: session.actorId }, crypto.randomUUID())
    });
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
