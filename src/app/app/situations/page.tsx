"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { PageHeader } from "@/components/ui/PageHeader";
import { SituationRow } from "@/components/situations/SituationRow";
import { NewSignalForm } from "@/components/situations/NewSignalForm";

export default function SituationsPage() {
  const { state, role } = useProduct();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("toutes");
  const [newSignal, setNewSignal] = useState(false);
  const filtered = useMemo(() => state?.situations.filter((item) => {
    const territory = state.territories.find((entry) => entry.id === item.territoryId);
    return (status === "toutes" || item.status === status) && `${item.title} ${item.reference} ${territory?.name}`.toLowerCase().includes(query.toLowerCase());
  }) ?? [], [state, query, status]);
  if (!state) return null;
  const canCreate = ["agent_terrain", "coordinateur", "administrateur"].includes(role);
  return (
    <>
      <PageHeader
        eyebrow="Registre commun"
        title="Situations"
        description="Une situation regroupe les observations utiles, la décision, la coordination et le résultat dans un même historique."
        actions={canCreate ? <button onClick={() => setNewSignal(true)} className="inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white"><Plus size={17} /> Signaler une situation</button> : undefined}
      />
      <div className="space-y-4 p-5 lg:p-8">
        <div className="surface flex flex-col gap-3 p-3 sm:flex-row">
          <label className="relative flex-1"><span className="sr-only">Rechercher</span><Search className="absolute left-3 top-3 text-[#60737a]" size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full border border-[#c8d7da] py-2.5 pl-10 pr-3" placeholder="Référence, quai ou objet…" /></label>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-[#c8d7da] bg-white px-3 py-2.5 text-sm font-semibold"><option value="toutes">Tous les statuts</option><option value="recue">Reçues</option><option value="qualification">En qualification</option><option value="priorisee">Priorisées</option><option value="coordination">En coordination</option><option value="intervention">En intervention</option><option value="attente">En attente</option><option value="resultat">Résultat enregistré</option><option value="reglee">Réglées</option></select>
        </div>
        <div className="surface overflow-hidden">{filtered.map((item) => <SituationRow key={item.id} situation={item} state={state} />)}</div>
        <p className="text-xs text-[#60737a]">{filtered.length} situation{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} · données de démonstration déterministes</p>
      </div>
      {newSignal && <NewSignalForm onClose={() => setNewSignal(false)} />}
    </>
  );
}
