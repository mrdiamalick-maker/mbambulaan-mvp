import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";

// Espace État : point d'entrée professionnel réservé au mandat ministère
// (rôle "institution") et à l'administrateur Mbàmbulaan pour supervision.
// Jamais accessible depuis le site public — garde posée côté serveur.
export default async function EtatLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/etat");
  if (session.role !== "institution" && session.role !== "administrateur") redirect("/app/travail");
  return <>{children}</>;
}
