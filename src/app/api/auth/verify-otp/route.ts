import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/server/session";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return NextResponse.json(
      { error: "Le fournisseur OTP doit être configuré avant l'ouverture d'un accès réel." },
      { status: 503 }
    );
  }
  const { code } = (await request.json()) as { code?: string };
  if (code !== "246810") return NextResponse.json({ error: "Code incorrect." }, { status: 401 });
  await setSession({ actorId: "act-coordinateur", role: "coordinateur", demo: true, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
  return NextResponse.json({ ok: true });
}
