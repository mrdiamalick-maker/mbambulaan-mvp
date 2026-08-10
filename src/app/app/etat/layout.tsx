import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import { InstitutionProductShell } from "@/components/institution/InstitutionProductShell";

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
  return <InstitutionProductShell>{children}</InstitutionProductShell>;
}
