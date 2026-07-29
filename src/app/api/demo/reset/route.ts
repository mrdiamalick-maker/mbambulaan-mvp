import { NextResponse } from "next/server";
import { dispatch } from "@/server/repository";
import { currentSession } from "@/server/session";

export async function POST() {
  const session = await currentSession();
  return NextResponse.json({
    state: await dispatch({ type: "reset_demo", actorId: session.actorId }, crypto.randomUUID())
  });
}
