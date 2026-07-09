"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { ModuleId } from "@/data/ministryControlTowerData";

const modules: Array<{ id: ModuleId; label: string; description: string; metric: string }> = [
  {
    id: "map",
    label: "Cartographie",
    description: "Vue quais, vue pirogues, alertes et débarquements",
    metric: "Carte"
  },
  {
    id: "community",
    label: "Valorisation communautaire",
    description: "Besoins terrain, programmes, partenaires et actions",
    metric: "Impact"
  },
  {
    id: "tracking",
    label: "Pilotage",
    description: "KPI, volumes, alertes, synthèse et export",
    metric: "Suivi"
  }
];

export type ProductShellKpi = {
  label: string;
  value: string;
  detail: string;
};

export function ProductShell({ activeModule, onModuleChange, kpis, children }: {
  activeModule: ModuleId;
  onModuleChange: (module: ModuleId) => void;
  kpis: ProductShellKpi[];
  children: ReactNode;
}) {
  return <main className="min-h-screen overflow-x-hidden bg-[#f5f7f8] text-slate-950">
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[98rem] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="grid h-11 w-11 place-items-center rounded-xl bg-[#0b3142] text-sm font-black text-white shadow-sm">Mb</Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">Mbàmbulaan Maritime Product Console</p>
            <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">Espace Ministère · pêche artisanale</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">Créer une alerte</button>
          <button className="inline-flex items-center justify-center rounded-lg border border-[#0b3142] bg-[#0b3142] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#062330]">Exporter la synthèse</button>
          <Link href="/espace-prive" className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50">Retour accès</Link>
        </div>
      </div>
    </header>

    <div className="mx-auto grid w-full max-w-[98rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:px-8">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="px-2 py-2">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Modules métier</p>
            <p className="mt-1 text-sm font-semibold leading-5 text-slate-600">Trois vues pour décider vite sans transformer l’outil en dashboard générique.</p>
          </div>
          <nav className="mt-2 grid gap-2">
            {modules.map((module) => <button key={module.id} onClick={() => onModuleChange(module.id)} className={`rounded-xl border p-3 text-left transition ${activeModule === module.id ? "border-cyan-700 bg-cyan-950 text-white shadow-md shadow-cyan-950/10" : "border-transparent bg-white text-slate-800 hover:border-slate-200 hover:bg-slate-50"}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black">{module.label}</p>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${activeModule === module.id ? "bg-white/15 text-cyan-50" : "bg-cyan-50 text-cyan-800"}`}>{module.metric}</span>
              </div>
              <p className={`mt-1 text-xs font-semibold leading-5 ${activeModule === module.id ? "text-cyan-50" : "text-slate-500"}`}>{module.description}</p>
            </button>)}
          </nav>
        </section>
      </aside>

      <section className="grid min-w-0 gap-6">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_28rem] xl:items-end">
            <div>
              <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-900">Socle UI open-source · composants utiles uniquement</span>
              <h2 className="mt-4 max-w-5xl text-4xl font-black tracking-[-0.04em] text-slate-950 sm:text-5xl">Superviser, valoriser, piloter.</h2>
              <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-slate-600">Une console produit métier pour localiser la filière, transformer les signaux terrain en actions et produire une synthèse exploitable.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {kpis.map((kpi) => <div key={kpi.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{kpi.label}</p>
                <p className="mt-1 text-2xl font-black text-slate-950">{kpi.value}</p>
                <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{kpi.detail}</p>
              </div>)}
            </div>
          </div>
        </section>
        {children}
      </section>
    </div>
  </main>;
}
