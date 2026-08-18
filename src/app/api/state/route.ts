import { NextResponse } from "next/server";
import { getState, persistenceMode } from "@/server/repository";
import { currentSession } from "@/server/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "Session absente ou expirée." }, { status: 401 });
  return NextResponse.json({
    state: await getState(),
    session,
    persistence: persistenceMode()
  });
}
