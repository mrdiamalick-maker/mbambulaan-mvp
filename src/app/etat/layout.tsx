import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import "../../v3-template/fonts.css";
import "../../v3-template/private-v3.css";

export const metadata: Metadata = {
  title: "Mbàmbulaan — Espace État",
  description: "Environnement privé de pilotage et de coordination de la filière."
};

// Route privée canonique de l'expérience État. Le middleware écarte déjà
// les accès sans cookie ; cette garde serveur valide la signature et le
// mandat réel avant de rendre le moindre contenu V3.
export default async function EtatLayout({ children }: { children: React.ReactNode }) {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/etat");
  if (session.role !== "institution" && session.role !== "administrateur") redirect("/app");
  return <>{children}</>;
}
