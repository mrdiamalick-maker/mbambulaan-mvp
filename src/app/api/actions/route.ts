import { NextRequest, NextResponse } from "next/server";
import type { Command, CommandInput } from "@/domain/types";
import { assertCan } from "@/server/permissions";
import { dispatch } from "@/server/repository";
import { currentSession } from "@/server/session";

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as CommandInput;
    const session = await currentSession();
    const command = { ...input, actorId: session.actorId } as Command;
    assertCan(session.role, command);
    const key = request.headers.get("idempotency-key") ?? crypto.randomUUID();
    return NextResponse.json({ state: await dispatch(command, key) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Action impossible." },
      { status: 400 }
    );
  }
}
