"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Link2, ShieldCheck } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/shared/StatusBadges";

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
    <div className="grid gap-8 xl:grid-cols-[.75fr_1.25fr]">
      <section>
        <div className="border-b pb-3">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lots évalués</p>
          <h2 className="mt-1 font-semibold">Complétude et vigilance</h2>
        </div>
        <div className="divide-y">
          {state.sustainability.map((item) => {
            const itemLot = state.lots.find((lotItem) => lotItem.id === item.lotId);
            const itemSpecies = state.species.find((speciesItem) => speciesItem.id === itemLot?.speciesId);
            const isSelected = selected?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={`relative block w-full px-4 py-4 text-left transition-colors hover:bg-muted/30 ${isSelected ? "bg-muted/50" : "bg-transparent"}`}
              >
                {isSelected && <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[#1d4468]" />}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{itemSpecies?.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{itemLot?.quantityKg} kg · {item.zone}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${item.status === "favorable" ? "bg-[#1d8a5f]/12 text-[#1d8a5f]" : "bg-[#c68a2c]/12 text-[#8a5f1a]"}`}>{item.status}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selected && (
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fiche de provenance</p>
              <h2 className="mt-1 text-xl font-semibold">{species?.name} · {lot?.id}</h2>
            </div>
            <TrustBadge trust={selected.trust} />
          </div>

          <div className="grid border-b sm:grid-cols-4">
            {[["Sortie", trip?.id], ["Pirogue", vessel?.name], ["Débarquement", landing?.id], ["Destination", lot?.status]].map(([label, value], index) => (
              <div key={label} className={`relative py-4 sm:px-4 ${index > 0 ? "sm:border-l" : ""}`}>
                {index > 0 && <span className="absolute -left-2 top-1/2 hidden -translate-y-1/2 bg-background px-1 text-xs text-muted-foreground sm:block">→</span>}
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-semibold">{value ?? "Non renseigné"}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-8 py-6 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 text-[#1d4468]"><Link2 size={18} /><h3 className="font-semibold">Continuité de traçabilité</h3></div>
              <p className="mt-3 text-3xl font-bold">{lot?.traceabilityCompleteness}%</p>
              <div className="mt-3 h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-[#1d4468]" style={{ width: `${lot?.traceabilityCompleteness ?? 0}%` }} /></div>
              <p className="mt-3 text-xs leading-5 text-muted-foreground">Provenance {selected.provenanceComplete ? "renseignée" : "incomplète"} · méthode : {selected.practice}.</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-[#1d4468]">{selected.status === "favorable" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}<h3 className="font-semibold">Lecture et limite</h3></div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">{selected.reasons.map((reason) => <li key={reason}>• {reason}</li>)}</ul>
            </div>
          </div>

          <div className="border-l-2 border-[#c68a2c] bg-[#c68a2c]/6 px-5 py-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="shrink-0 text-[#8a5f1a]" />
              <div>
                <p className="font-semibold">Action d’amélioration</p>
                <p className="mt-1 text-sm text-muted-foreground">{selected.recommendation}</p>
                <Link href="/app/coordination" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1d4468]">Relier à la coordination <ArrowRight size={15} /></Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
