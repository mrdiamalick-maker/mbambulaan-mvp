import { NextRequest, NextResponse } from "next/server";
import { applyCommand } from "@/domain/rules";
import type { Command, CommandInput, ProductState } from "@/domain/types";
import { assertCan } from "@/server/permissions";
import { dispatch, persistenceMode } from "@/server/repository";
import { requireSession, UnauthorizedError } from "@/server/session";
import { projectStateForSession } from "@/server/access-projection";
import { attemptCoordinationNotifications } from "@/server/coordination-notifications";

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
      let next = applyCommand(demoState, command);
      if (command.type === "initiate_terrain_coordination") {
        next = await notifyAfterCoordinationInitiation(next, command, (state, inner) => applyCommand(state, inner));
      }
      return NextResponse.json({ state: projectStateForSession(next, session) });
    }

    const key = request.headers.get("idempotency-key") ?? crypto.randomUUID();
    let next = await dispatch(command, key);
    if (command.type === "initiate_terrain_coordination") {
      next = await notifyAfterCoordinationInitiation(next, command, (_state, inner) => dispatch(inner, crypto.randomUUID()));
    }
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

// notifyAfterCoordinationInitiation — Sprint T03 (mandat §9). Seul geste
// humain de ce endpoint qui déclenche une E/S réelle (envoi WhatsApp) ;
// voir src/server/coordination-notifications.ts pour pourquoi ce n'est
// pas un second pont webhook. Portée volontairement limitée à
// initiate_terrain_coordination — aucune autre commande de ce endpoint
// n'est affectée par cet ajout.
async function notifyAfterCoordinationInitiation(
  state: ProductState,
  command: Extract<Command, { type: "initiate_terrain_coordination" }>,
  applyAndPersist: (state: ProductState, inner: Command) => Promise<ProductState> | ProductState
): Promise<ProductState> {
  const coordination = state.terrainCoordinations.find((item) => item.matchId === command.matchId);
  if (!coordination) return state;
  return attemptCoordinationNotifications(state, coordination.id, applyAndPersist);
}
