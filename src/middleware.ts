import { NextRequest, NextResponse } from "next/server";

// Garde d'accès minimale pour l'espace Produit professionnel (/app/*).
// Le Produit n'est pas recadré ni reconstruit ici : ce middleware protège
// simplement l'accès public direct à cet espace pendant que le Public est
// livré. La vérification complète de la session (signature HMAC) reste
// faite côté serveur par `currentSession()` ; ce middleware tourne en
// runtime Edge (compatible Cloudflare) et bloque déjà toute navigation
// directe sans cookie de session vers /app/*.
export const config = {
  matcher: ["/app/:path*"]
};

export function middleware(request: NextRequest) {
  const hasSessionCookie = Boolean(request.cookies.get("mbambulaan_session")?.value);
  if (hasSessionCookie) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/connexion";
  url.search = `?next=${encodeURIComponent(request.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}
