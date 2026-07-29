"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/ui/Badges";

export function SustainabilityWorkspace() {
  const { state } = useProduct();
  const [selectedId, setSelectedId] = useState(state?.sustainability[0]?.id ?? "");
  if (!state) return null;
  const selected = state.sustainability.find((item) => item.id === selectedId) ?? state.sustainability[0];
  const lot = state.lots.find((item) => item.id === selected?.lotId);
  const landing = state.landings.find((item) => item.id === lot?.landingId);
  const trip = state.trips.find((item) => item.id === landing?.tripId);
  const vessel = state.vessels.find((item) => item.id === trip?.vesselId);
  const species = state.species.find((item) => item.id === lot?.speciesId);
  return (
    <div className="grid gap-5 xl:grid-cols-[.75fr_1.25fr]">
      <section className="surface overflow-hidden">
        <div className="border-b border-[#d8e1e2] bg-[#f8fbfb] p-4"><p className="label">Lots évalués</p><h2 className="mt-1 font-bold">Complétude et vigilance</h2></div>
        {state.sustainability.map((item) => {
          const itemLot = state.lots.find((lotItem) => lotItem.id === item.lotId);
          const itemSpecies = state.species.find((speciesItem) => speciesItem.id === itemLot?.speciesId);
          return <button key={item.id} onClick={() => setSelectedId(item.id)} className={`block w-full border-b border-[#e1e8e8] p-4 text-left ${selected?.id === item.id ? "bg-[#eef9f7]" : "bg-white"}`}><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{itemSpecies?.name}</p><p className="mt-1 text-xs text-[#60737a]">{itemLot?.quantityKg} kg · {item.zone}</p></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${item.status === "favorable" ? "bg-[#e9f7f1] text-[#126b58]" : "bg-[#fff8e8] text-[#76530d]"}`}>{item.status}</span></div></button>;
        })}
      </section>
      {selected && (
        <article className="surface overflow-hidden">
          <div className="border-b border-[#d8e1e2] bg-[#f4fbfc] p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="label">Fiche de provenance</p><h2 className="mt-1 text-xl font-bold">{species?.name} · {lot?.id}</h2></div><TrustBadge trust={selected.trust} source="Chaîne de traçabilité du lot" /></div></div>
          <div className="grid gap-px bg-[#d8e1e2] sm:grid-cols-4">
            {[["Sortie", trip?.id], ["Pirogue", vessel?.name], ["Débarquement", landing?.id], ["Destination", lot?.status]].map(([label, value]) => <div key={label} className="bg-white p-4"><p className="text-xs text-[#60737a]">{label}</p><p className="mt-1 text-sm font-bold">{value ?? "Non renseigné"}</p></div>)}
          </div>
          <div className="grid gap-5 p-5 lg:grid-cols-2">
            <div><div className="flex items-center gap-2 text-[#075466]"><Link2 size={18} /><h3 className="font-bold">Continuité de traçabilité</h3></div><p className="mt-3 text-3xl font-bold">{lot?.traceabilityCompleteness}%</p><div className="mt-3 h-2 bg-[#e1e8e8]"><div className="h-full bg-[#18a394]" style={{ width: `${lot?.traceabilityCompleteness ?? 0}%` }} /></div><p className="mt-3 text-xs leading-5 text-[#60737a]">Provenance {selected.provenanceComplete ? "renseignée" : "incomplète"} · méthode : {selected.practice}.</p></div>
            <div><div className="flex items-center gap-2 text-[#075466]">{selected.status === "favorable" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}<h3 className="font-bold">Lecture et limite</h3></div><ul className="mt-3 space-y-2 text-sm text-[#60737a]">{selected.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul></div>
          </div>
          <div className="border-t border-[#d8e1e2] bg-[#fff8e8] p-5"><div className="flex items-start gap-3"><ShieldCheck className="shrink-0 text-[#76530d]" /><div><p className="font-bold">Action d’amélioration</p><p className="mt-1 text-sm text-[#60737a]">{selected.recommendation}</p><Link href="/app/coordination" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#075466]">Relier à la coordination <ArrowRight size={15} /></Link></div></div></div>
        </article>
      )}
    </div>
  );
}
