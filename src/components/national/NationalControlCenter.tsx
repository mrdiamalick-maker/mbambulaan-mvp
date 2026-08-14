"use client";

import { Anchor, AlertTriangle, Fish, Handshake, Map, TrendingUp, UsersRound } from "lucide-react";
import type { ProductState } from "@/domain/types";
import { generateNationalSnapshot } from "@/domain/national/national-engine";

function Metric({ icon, label, value, index }: { icon: React.ReactNode; label: string; value: number; index: number }) {
  return (
    <div className={`py-4 ${index > 0 ? "md:border-l md:pl-5" : ""}`}>
      <div className="flex items-center gap-2 text-[#1d4468]">{icon}<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p></div>
      <p className="mt-3 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}

export function NationalControlCenter({ state }: { state: ProductState }) {
  const snapshot = generateNationalSnapshot(state);
  const metrics = [
    { icon: <Map size={17} />, label: "Territoires", value: snapshot.territories },
    { icon: <UsersRound size={17} />, label: "Acteurs", value: snapshot.actors },
    { icon: <Fish size={17} />, label: "Débarquements", value: snapshot.landings },
    { icon: <Handshake size={17} />, label: "Coordinations", value: snapshot.coordinations },
    { icon: <AlertTriangle size={17} />, label: "Situations critiques", value: snapshot.criticalSituations },
    { icon: <Anchor size={17} />, label: "Situations actives", value: snapshot.activeSituations },
    { icon: <TrendingUp size={17} />, label: "Opportunités", value: snapshot.opportunities }
  ];

  return (
    <section className="space-y-5">
      <div className="overflow-hidden rounded-2xl bg-sidebar p-7 text-sidebar-foreground lg:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Mbàmbulaan Sénégal</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Intelligence territoriale nationale</h1>
        <p className="mt-3 max-w-3xl text-sidebar-foreground/65">Vision consolidée des territoires côtiers, des acteurs et des dynamiques de filière.</p>
      </div>

      <div className="border-y">
        <div className="grid md:grid-cols-4">
          {metrics.slice(0, 4).map((metric, index) => <Metric key={metric.label} {...metric} index={index} />)}
        </div>
        <div className="grid border-t md:grid-cols-3">
          {metrics.slice(4).map((metric, index) => <Metric key={metric.label} {...metric} index={index} />)}
        </div>
      </div>
    </section>
  );
}
