import { NextResponse } from "next/server";

export async function GET() {
  const required = ["DATABASE_URL", "OBJECT_STORAGE_ENDPOINT", "OBJECT_STORAGE_BUCKET", "ENCRYPTION_KEY_ID"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    return NextResponse.json({ status: "degraded", check: "ready", missing }, { status: 503 });
  }
  return NextResponse.json({ status: "ok", check: "ready", timestamp: new Date().toISOString() }, { status: 200 });
}
