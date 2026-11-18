import { NextResponse } from "next/server";
import { requireSession, UnauthorizedError } from "@/server/session";
import { checkWhatsappConfiguration } from "@/channels/whatsapp-health";

// GET /api/admin/whatsapp-health — Sprint T04, mandat §3. Seule route qui
// expose checkWhatsappConfiguration() : lit des variables d'environnement
// SERVEUR (process.env), inaccessibles depuis un composant client — ce
// endpoint ne renvoie jamais que des booléens (mandat "never expose
// secret values in UI/logs"), réservé à un administrateur authentifié.
export async function GET() {
  try {
    const session = await requireSession();
    if (session.role !== "administrateur") {
      return NextResponse.json({ error: "Accès réservé à l'administration." }, { status: 403 });
    }
    return NextResponse.json(checkWhatsappConfiguration());
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Vérification impossible." }, { status: 400 });
  }
}
