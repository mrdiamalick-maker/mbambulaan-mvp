"use client";

import { AlertTriangle, BarChart3, CheckCircle2, Download, Factory, Fish, Handshake, Printer } from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Metric } from "@/components/ui/Metric";
import { TrustBadge } from "@/components/ui/Badges";

export function PilotageWorkspace() {
  const { state } = useProduct();
  if (!state) return null;
  const report = state.reports[0];
  const totalLanded = state.landings.filter((item) => item.status === "lots_crees").reduce((sum, item) => sum + item.totalWeightKg, 0);
  const valorized = state.lots.filter((item) => item.status === "valorise").reduce((sum, item) => sum + item.quantityKg, 0);
  const estimatedValue = state.lots.reduce((sum, lot) => sum + lot.quantityKg * (state.species.find((item) => item.id === lot.speciesId)?.indicativePriceFcfaKg ?? 0), 0);
  const critical = state.situations.filter((item) => item.priority === "critique" && item.status !== "reglee");
  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Volume débarqué" value={`${(totalLanded / 1000).toFixed(2)} t`} detail="Période : aujourd’hui · pesées vérifiées dans la démo" icon={Fish} />
        <Metric label="Valeur coordonnée" value={`${(estimatedValue / 1_000_000).toFixed(1)} M`} detail="FCFA estimés · volume × prix indicatif, non transaction" icon={BarChart3} tone="sand" />
        <Metric label="Capacités fragiles" value={String(state.infrastructures.filter((item) => item.status !== "operationnelle").length)} detail="État observé ou vérifié au dernier relevé" icon={Factory} tone="coral" />
        <Metric label="Volume valorisé" value={`${(valorized / 1000).toFixed(2)} t`} detail="Lots avec résultat logistique enregistré" icon={CheckCircle2} tone="lagoon" />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="surface overflow-hidden">
          <div className="border-b border-[#d8e1e2] bg-[#f8fbfb] p-5"><p className="label">Tableau de situation</p><h2 className="mt-1 text-lg font-bold">Décisions et responsabilités</h2></div>
          <div className="divide-y divide-[#e1e8e8]">
            {critical.map((item) => {
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              return <article key={item.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><AlertTriangle size={17} className="text-[#c94f3d]" /><h3 className="font-bold">{item.title}</h3><TrustBadge trust={item.trust} /></div><p className="mt-2 text-xs text-[#60737a]">{territory?.name} · {item.nextStep}</p></div><span className="text-xs font-bold text-[#9c392b]">Action aujourd’hui</span></article>;
            })}
          </div>
        </div>
        <aside className="surface p-5">
          <div className="flex items-center gap-2 text-[#075466]"><Handshake size={19} /><p className="label">Rapport de valeur</p></div>
          <h2 className="mt-3 text-lg font-bold">{report.title}</h2>
          <p className="mt-2 text-sm text-[#60737a]">{report.period} · données simulées</p>
          <div className="mt-5 space-y-4">{report.metrics.map((metric) => <div key={metric.label} className="border-l-3 border-[#18a394] pl-3"><p className="text-xs text-[#60737a]">{metric.label}</p><p className="mt-1 text-xl font-bold">{metric.value}</p><p className="mt-1 text-xs leading-5 text-[#60737a]">{metric.source} · limite : {metric.limit}</p></div>)}</div>
          <div className="mt-6 flex flex-wrap gap-2"><button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-[#075466] px-4 py-2.5 text-sm font-bold text-white"><Printer size={15} /> Imprimer</button><button onClick={() => window.print()} className="inline-flex items-center gap-2 border border-[#9ecbd2] px-4 py-2.5 text-sm font-bold text-[#075466]"><Download size={15} /> Préparer l’export</button></div>
        </aside>
      </section>
    </div>
  );
}
