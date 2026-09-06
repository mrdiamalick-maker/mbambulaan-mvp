import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";

// Garde de rôle côté serveur : la disparition du lien dans le menu ne
// suffit pas, la page elle-même doit refuser l'accès à qui n'a pas le
// mandat administrateur.
export default async function AdministrationLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/administration");
  if (session.role !== "administrateur") redirect("/app/travail");
  return <>{children}</>;
}
