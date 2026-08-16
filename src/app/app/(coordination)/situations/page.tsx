"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { SituationRow } from "@/components/situations/SituationRow";
import type { Role } from "@/domain/types";

// Lot 2 — refonte navigation par rôle (CEO 2026-08-16) : seul l'opérateur
// garde une raison de voir ce registre séparé — administrateur/
// gestionnaire_organisation/coordinateur/partenaire étaient déjà fusionnés
// vers /app/travail (Lot 3) ; mareyeur/transformateur/prestataire les
// rejoignent ici, car BuyerTaskView/ProviderTaskView leur donnent désormais
// leur propre file d'action sur /app/travail — ce registre général leur est
// redondant. Pour l'opérateur qui reste, la vue est scopée à son propre
// territoire (Actor.territoryIds), même mécanisme que CoordinatorHub/
// OperatorTaskView.
const nonOperatorRoles: Role[] = ["administrateur", "gestionnaire_organisation", "coordinateur", "partenaire", "mareyeur", "transformateur", "prestataire"];

export default function SituationsPage() {
  const { state, role, actorId, loading } = useProduct();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("toutes");
  const redirectToHub = nonOperatorRoles.includes(role);

  const actor = state?.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);
  const inScope = (territoryId: string) => territoryIds.size === 0 || territoryIds.has(territoryId);

  const filtered = useMemo(() => state?.situations.filter((item) => {
    const territory = state.territories.find((entry) => entry.id === item.territoryId);
    return inScope(item.territoryId) && (status === "toutes" || item.status === status) && `${item.title} ${item.reference} ${territory?.name}`.toLowerCase().includes(query.toLowerCase());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }) ?? [], [state, query, status, actorId]);

  useEffect(() => {
    // N'agir qu'une fois le vrai rôle chargé — le rôle par défaut du
    // ProductProvider ("coordinateur", le temps que /api/state réponde) est
    // dans nonOperatorRoles et redirigerait sinon un opérateur avant même
    // que sa session ne soit résolue.
    if (!loading && redirectToHub) router.replace("/app/travail");
  }, [loading, redirectToHub, router]);

  if (!state || loading || redirectToHub) return null;

  return (
    <div className="shadcn-scope space-y-7 bg-background p-5 pb-16 lg:p-8">
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">Suivi opérationnel</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Situations</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Retrouvez les situations qui concernent votre activité, leur état et la prochaine action attendue.</p>
      </header>

      <div className="flex flex-col gap-3 border-y py-4 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Rechercher</span>
          <Search className="absolute left-3 top-3 text-muted-foreground" size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-md border bg-background py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#1d4468]/50"
            placeholder="Référence, quai ou objet…"
          />
        </label>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border bg-background px-3 py-2.5 text-sm font-semibold outline-none"
        >
          <option value="toutes">Tous les statuts</option>
          <option value="recue">Reçues</option>
          <option value="qualification">En qualification</option>
          <option value="priorisee">Priorisées</option>
          <option value="coordination">En coordination</option>
          <option value="intervention">En intervention</option>
          <option value="attente">En attente</option>
          <option value="resultat">Résultat enregistré</option>
          <option value="reglee">Réglées</option>
        </select>
      </div>

      <div className="divide-y border-y">
        {filtered.map((item) => <SituationRow key={item.id} situation={item} state={state} />)}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p>{filtered.length} situation{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""}</p>
        <p>Mode démonstration · données non opérationnelles</p>
      </div>
    </div>
  );
}
