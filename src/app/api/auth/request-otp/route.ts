import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
    return NextResponse.json(
      { error: "Le fournisseur OTP doit être configuré avant l'ouverture d'un accès réel." },
      { status: 503 }
    );
  }
  const { contact } = (await request.json()) as { contact?: string };
  if (!contact?.trim()) return NextResponse.json({ error: "Contact requis." }, { status: 400 });
  return NextResponse.json({
    ok: true,
    channel: contact.includes("@") ? "email" : "telephone",
    demoCode: "246810",
    message: "Le connecteur de messagerie doit être configuré avant un déploiement réel."
  });
}
