import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";

// Redirection selon le mandat plutôt qu'une destination unique : le
// capitaine doit atterrir sur son entrée technique dédiée (/app/terrain,
// D9, Lot 6), pas sur /app/travail puis retomber sur un outil pensé pour
// la coordination. institution atterrissait auparavant sur /app/travail
// (CoordinatorHub) faute de redirection explicite si elle arrivait par
// /app plutôt que par le lien ?next=/app/etat — corrigé au passage, même
// mécanisme.
export default async function AppPage() {
  const session = await currentSession();
  if (session?.role === "capitaine") redirect("/app/terrain");
  if (session?.role === "institution") redirect("/app/etat");
  redirect("/app/travail");
}
