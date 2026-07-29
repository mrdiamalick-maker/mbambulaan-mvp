import { NextResponse } from "next/server";
import { persistenceMode } from "@/server/repository";

export async function GET() {
  return NextResponse.json({ status: "ok", persistence: persistenceMode(), timestamp: new Date().toISOString() });
}
