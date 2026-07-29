import { NextRequest, NextResponse } from "next/server";
import { applyCommand } from "@/domain/rules";
import type { Command, CommandInput, ProductState } from "@/domain/types";
import { assertCan } from "@/server/permissions";
import { dispatch, persistenceMode } from "@/server/repository";
import { currentSession } from "@/server/session";

type ActionRequest = CommandInput & {
  demoState?: ProductState;
};

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as ActionRequest;
    const { demoState, ...commandInput } = input;
    const session = await currentSession();
    const command = { ...commandInput, actorId: session.actorId } as Command;
    assertCan(session.role, command);

    if (persistenceMode() === "memoire_locale_demo" && demoState) {
      return NextResponse.json({ state: applyCommand(demoState, command) });
    }

    const key = request.headers.get("idempotency-key") ?? crypto.randomUUID();
    return NextResponse.json({ state: await dispatch(command, key) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action impossible." },
      { status: 400 }
    );
  }
}
