import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";

// Espace réservé au mandat ministère (rôle "institution") et à
// l'administrateur Mbàmbulaan pour supervision. Garde posée côté serveur :
// la disparition du lien dans le menu ne suffit pas.
export default async function MinistryLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/ministere");
  if (session.role !== "institution" && session.role !== "administrateur") redirect("/app/travail");
  return <>{children}</>;
}
