import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import { TerrainProductShell } from "@/components/terrain/TerrainProductShell";

// Terrain mobile : point d'entrée professionnel réservé au mandat
// capitaine, et à l'administrateur Mbàmbulaan pour supervision — même
// principe que src/app/app/etat/layout.tsx pour l'Espace État. Jamais
// accessible depuis le site public — garde posée côté serveur. Coquille :
// TerrainProductShell (D9, Lot 6), pas ProductShell/AppShell — cette
// route est volontairement hors du groupe de routes
// src/app/app/(coordination) qui porte le shell partagé.
export default async function TerrainLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/terrain");
  if (session.role !== "capitaine" && session.role !== "administrateur") redirect("/app/travail");
  return <TerrainProductShell>{children}</TerrainProductShell>;
}
