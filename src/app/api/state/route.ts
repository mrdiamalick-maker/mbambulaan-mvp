import { NextResponse } from "next/server";
import { getState, persistenceMode } from "@/server/repository";
import { currentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    state: await getState(),
    session: await currentSession(),
    persistence: persistenceMode()
  });
}
