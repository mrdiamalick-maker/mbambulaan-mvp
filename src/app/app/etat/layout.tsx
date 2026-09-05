import { redirect } from "next/navigation";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { currentSession } from "@/server/session";
import { InstitutionProductShell } from "@/components/institution/InstitutionProductShell";

// P2.DESIGN-1A.2 (North Star Claude Design) — typographie propre à
// l'Espace État : Newsreader (display éditorial) + IBM Plex Sans (corps/UI)
// + IBM Plex Mono (légendes techniques, ex. coordonnées cartographiques).
// next/font/google : auto-hébergé par Next au build, aucune requête
// runtime vers Google Fonts (contrairement au prototype Claude Design, qui
// charge ces mêmes familles via <link> — même typographie, chargement plus
// sûr). Scopée à ce layout via les classes .variable posées sur le wrapper
// ci-dessous : n'affecte ni Public ni Pro/Coordination, qui gardent leurs
// propres polices (Inter, Georgia) — cf. etat-design-system.css, qui
// consomme ces variables uniquement à l'intérieur de .etat-scope.
const newsreader = Newsreader({ subsets: ["latin"], weight: ["300", "400", "500"], style: ["normal", "italic"], variable: "--font-etat-display" });
const ibmPlexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-etat-body" });
const ibmPlexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-etat-mono" });

// Espace État : point d'entrée professionnel réservé au mandat ministère
// (rôle "institution") et à l'administrateur Mbàmbulaan pour supervision.
// Jamais accessible depuis le site public — garde posée côté serveur.
// Coquille : InstitutionProductShell (D9), pas ProductShell/AppShell —
// cette route est volontairement hors du groupe de routes
// src/app/app/(coordination) qui porte le shell partagé.
export default async function EtatLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/etat");
  if (session.role !== "institution" && session.role !== "administrateur") redirect("/app/travail");
  return (
    <div className={`${newsreader.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable} contents`}>
      <InstitutionProductShell>{children}</InstitutionProductShell>
    </div>
  );
}
