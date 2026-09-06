import { NextRequest, NextResponse } from "next/server";
import { applyCommand } from "@/domain/rules";
import type { Command, CommandInput, ProductState } from "@/domain/types";
import { assertCan } from "@/server/permissions";
import { dispatch, persistenceMode } from "@/server/repository";
import { requireSession, UnauthorizedError } from "@/server/session";
import { projectStateForSession } from "@/server/access-projection";

type ActionRequest = CommandInput & {
  demoState?: ProductState;
};

// P2.1-B.1 (mandat "Session-State Isolation", §8/§9) — "les données
// envoyées par le client ne sont jamais une preuve d'autorisation."
// En persistance memoire_locale_demo, demoState (le state du CLIENT,
// jamais vérifié) sert de base au calcul — nécessaire au fonctionnement
// sans base de données (mandat §9, "si demoState est indispensable...").
// Mais la RÉPONSE, elle, est désormais systématiquement reprojetée par
// projectStateForSession avant d'être renvoyée — que demoState ait été
// fidèle, obsolète (résidu d'une session précédente) ou falsifié, aucun
// objet que la session courante n'est pas autorisée à voir ne peut plus
// ressortir de ce endpoint. Même correctif dans les deux branches
// (memoire_locale_demo et postgresql) : ce endpoint renvoyait déjà, dans
// les deux cas, un ProductState complet non filtré que le client adopte
// tel quel comme son état affiché (ProductProvider.tsx, setState) — un
// angle mort de P2.1-A jamais couvert (Fondation B n'avait câblé que
// GET /api/state).
export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as ActionRequest;
    const { demoState, ...commandInput } = input;
    const session = await requireSession();
    const command = { ...commandInput, actorId: session.actorId } as Command;
    assertCan(session.role, command);

    if (persistenceMode() === "memoire_locale_demo" && demoState) {
      const next = applyCommand(demoState, command);
      return NextResponse.json({ state: projectStateForSession(next, session) });
    }

    const key = request.headers.get("idempotency-key") ?? crypto.randomUUID();
    const next = await dispatch(command, key);
    return NextResponse.json({ state: projectStateForSession(next, session) });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action impossible." },
      { status: 400 }
    );
  }
}
