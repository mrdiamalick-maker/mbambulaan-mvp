import { NextResponse } from "next/server";

export async function GET() {
  const startedAt = process.env.SERVICE_STARTED_AT ?? "unknown";
  return NextResponse.json({ status: "ok", check: "startup", startedAt, timestamp: new Date().toISOString() }, { status: 200 });
}
