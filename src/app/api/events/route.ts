import { NextRequest, NextResponse } from "next/server";
import type { MbambulaanEvent } from "@/domain/events";
import type { ProductState } from "@/domain/types";
import { applyEvent } from "@/runtime/event-engine";
import { dispatchEvent, persistenceMode } from "@/server/repository";
import { currentSession } from "@/server/session";

type EventRequest = Omit<MbambulaanEvent, "actorId"> & {
  demoState?: ProductState;
};

export async function POST(request: NextRequest) {
  try {
    const input = (await request.json()) as EventRequest;
    const { demoState, ...eventInput } = input;
    const session = await currentSession();
    const event = { ...eventInput, actorId: session.actorId } as MbambulaanEvent;

    if (persistenceMode() === "memoire_locale_demo" && demoState) {
      return NextResponse.json({ state: applyEvent(demoState, event) });
    }

    return NextResponse.json({ state: await dispatchEvent(event) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Événement impossible à enregistrer." },
      { status: 400 }
    );
  }
}