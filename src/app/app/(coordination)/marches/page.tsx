import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import type { Role } from "@/domain/types";
import { MarketWorkspace } from "@/components/ecosystem/MarketWorkspace";

// Garde de rôle serveur — Lot 2, refonte navigation par rôle (CEO
// 2026-08-16) : operateur/mareyeur/transformateur n'ont plus d'entrée de nav
// vers cette page. L'opérateur conserve flag_price (permissions.ts) mais
// perd ce point d'entrée — aucun accès contextuel de remplacement construit
// dans ce lot (compromis explicitement pré-autorisé par le mandat si un
// point d'entrée alternatif complique trop ce lot), signalé dans le
// compte-rendu.
const excludedRoles: Role[] = ["operateur", "mareyeur", "transformateur"];

export default async function MarketsPage() {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/marches");
  if (excludedRoles.includes(session.role)) redirect("/app/travail");
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Prix · disponibilité · rareté</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Prix et marchés</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Comparez les observations sans masquer leur source. Une variation devient un signal à vérifier, jamais une vérité automatique.</p>
      </div>
      <MarketWorkspace />
    </div>
  );
}
