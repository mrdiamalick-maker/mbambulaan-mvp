import { NextRequest, NextResponse } from "next/server";
import { verifyLogin } from "@/server/accounts-repository";
import { setSession } from "@/server/session";

const failureMessages: Record<string, string> = {
  identifiants_invalides: "Identifiants incorrects.",
  compte_suspendu: "Ce compte est suspendu. Contactez un administrateur.",
  compte_verrouille: "Trop de tentatives : compte temporairement verrouillé. Réessayez dans quelques minutes."
};

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  if (!email?.trim() || !password) {
    return NextResponse.json({ error: "E-mail et mot de passe requis." }, { status: 400 });
  }

  const result = await verifyLogin(email, password);
  if ("error" in result) {
    return NextResponse.json({ error: failureMessages[result.error] ?? "Connexion impossible." }, { status: 401 });
  }

  await setSession({
    actorId: result.account.actorId,
    role: result.account.role,
    expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    demo: false
  });
  return NextResponse.json({ ok: true });
}
