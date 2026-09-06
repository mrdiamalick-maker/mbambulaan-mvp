import { redirect } from "next/navigation";
import { currentSession } from "@/server/session";
import type { Role } from "@/domain/types";
import { SustainabilityWorkspace } from "@/components/ecosystem/SustainabilityWorkspace";

// Garde de rôle serveur — Lot 2, refonte navigation par rôle (CEO
// 2026-08-16) : seul operateur perd l'entrée de nav ici (aucune commande
// correspondante dans son mandat). Mareyeur reste volontairement hors de
// cette garde comme hors de la nav — asymétrie déjà existante et
// explicitement laissée telle quelle par le mandat (transformateur oui,
// mareyeur non) : ne pas la "corriger" en ajoutant ici une exclusion
// mareyeur qui n'a pas été demandée.
const excludedRoles: Role[] = ["operateur"];

export default async function SustainabilityPage() {
  const session = await currentSession();
  if (!session) redirect("/connexion?next=/app/durabilite");
  if (excludedRoles.includes(session.role)) redirect("/app/travail");
  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Provenance · pratiques · traçabilité</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Provenance &amp; durabilité</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Rendez visibles la provenance, les données manquantes et les pratiques déclarées. Mbàmbulaan soutient l’amélioration sans se substituer au contrôle réglementaire.</p>
      </div>
      <SustainabilityWorkspace />
    </div>
  );
}
