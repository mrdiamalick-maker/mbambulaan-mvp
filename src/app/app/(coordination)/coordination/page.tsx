import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import type { Role } from "@/domain/types";
import { CoordinationWorkspace } from "@/components/ecosystem/CoordinationWorkspace";

// Garde de rôle serveur — Lot 2, refonte navigation par rôle (CEO
// 2026-08-16) : mareyeur/transformateur/prestataire n'ont plus d'entrée de
// nav vers cette page (redondante avec BuyerTaskView/ProviderTaskView sur
// /app/travail, cf. AppSidebar.tsx) — la disparition du lien ne suffit pas,
// un accès direct par URL doit rediriger proprement (discipline explicite
// du mandat). Opérateur reste autorisé malgré le retrait initialement
// demandé : accept_opportunity/complete_logistics lui sont bien ouverts
// (relais généralisé, arbitrage CEO 2026-08-15, permissions.ts) et
// /app/coordination reste son seul point d'entrée pour ce geste — écart
// assumé et signalé dans le compte-rendu de lot plutôt qu'exécuté à la
// lettre d'un mandat qui décrivait par erreur ces commandes comme absentes
// de son mandat.
const excludedRoles: Role[] = ["mareyeur", "transformateur", "prestataire"];

export default async function CoordinationPage() {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/coordination");
  if (excludedRoles.includes(session.role)) redirect("/app/travail");
  return (
    <div className="shadcn-scope bg-background pb-16">
      <header className="px-5 pt-6 lg:px-8 lg:pt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Coordination</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Coordination de la chaîne de valeur</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Les besoins qualifiés rencontrent des capacités vérifiables. Les acteurs valident les engagements et chaque mission se termine par un résultat observable.</p>
      </header>
      <div className="px-5 pt-6 lg:px-8"><CoordinationWorkspace /></div>
    </div>
  );
}
