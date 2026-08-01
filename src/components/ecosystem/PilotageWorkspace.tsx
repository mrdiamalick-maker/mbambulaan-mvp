"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Download,
  Factory,
  Fish,
  Handshake,
  Printer,
  Radio,
  ShipWheel,
  Sparkles
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Metric } from "@/components/ui/Metric";
import { TrustBadge } from "@/components/ui/Badges";

const palette = ["#087287", "#18a394", "#d89614", "#c95c49", "#779399"];

export function PilotageWorkspace() {
  const { state } = useProduct();
  const [territoryId, setTerritoryId] = useState("all");
  const [period, setPeriod] = useState("today");
  if (!state) return null;

  const report = state.reports[0];
  const siteIds = territoryId === "all" ? state.sites.map((item) => item.id) : state.sites.filter((item) => item.territoryId === territoryId).map((item) => item.id);
  const landings = state.landings.filter((item) => siteIds.includes(item.siteId));
  const lots = state.lots.filter((item) => siteIds.includes(item.siteId));
  const infrastructures = territoryId === "all" ? state.infrastructures : state.infrastructures.filter((item) => item.territoryId === territoryId);
  const situations = territoryId === "all" ? state.situations : state.situations.filter((item) => item.territoryId === territoryId);
  const vessels = state.vessels.filter((item) => siteIds.includes(item.homeSiteId));
  const totalLanded = landings.filter((item) => item.status === "lots_crees").reduce((sum, item) => sum + item.totalWeightKg, 0);
  const valorized = lots.filter((item) => item.status === "valorise").reduce((sum, item) => sum + item.quantityKg, 0);
  const estimatedValue = lots.reduce((sum, lot) => sum + lot.quantityKg * (state.species.find((item) => item.id === lot.speciesId)?.indicativePriceFcfaKg ?? 0), 0);
  const critical = situations.filter((item) => item.priority === "critique" && item.status !== "reglee");
  const resolved = situations.filter((item) => item.status === "reglee").length;
  const progress = situations.length ? Math.round((resolved / situations.length) * 100) : 0;

  const speciesTotals = state.species.map((species) => ({
    id: species.id,
    name: species.name,
    value: landings.flatMap((landing) => landing.catches).filter((item) => item.speciesId === species.id).reduce((sum, item) => sum + item.quantityKg, 0)
  })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const maxSpecies = Math.max(...speciesTotals.map((item) => item.value), 1);
  const territoryVolumes = state.territories.map((territory) => {
    const ids = state.sites.filter((site) => site.territoryId === territory.id).map((site) => site.id);
    return { id: territory.id, name: territory.name, value: state.landings.filter((landing) => ids.includes(landing.siteId)).reduce((sum, landing) => sum + landing.totalWeightKg, 0) };
  });
  const maxTerritory = Math.max(...territoryVolumes.map((item) => item.value), 1);

  return (
    <div className="space-y-6">
      <section className="mission-strip">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="relative overflow-hidden p-6 lg:p-7">
            <div className="absolute inset-0 opacity-35 ocean-grid" />
            <div className="relative"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.15em] text-[#70e3d5]"><Radio size={15} /> Brief exécutif</div><h2 className="mt-4 max-w-3xl text-2xl font-black tracking-[-.04em] lg:text-3xl">{critical.length ? `${critical.length} arbitrage critique sur le périmètre.` : "La situation est maîtrisée ; la veille reste active."}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">{(totalLanded / 1000).toFixed(2)} t documentées, {vessels.length} pirogues suivies et {infrastructures.filter((item) => item.status !== "operationnelle").length} capacités fragiles. Chaque chiffre renvoie à ses objets sources.</p><div className="mt-5 flex flex-wrap gap-2"><Link href={critical[0] ? `/app/situations/${critical[0].id}` : "/app/situations"} className="btn-accent">{critical[0] ? "Ouvrir l’arbitrage" : "Voir les situations"} <ArrowRight size={15} /></Link><Link href="/app/atlas" className="btn-on-dark">Vérifier dans l’Atlas</Link></div></div>
          </div>
          <aside className="border-t border-white/10 bg-white/[.04] p-6 lg:border-l lg:border-t-0"><p className="text-[10px] font-black uppercase tracking-[.13em] text-white/38">Fenêtre de décision</p><div className="mt-5 space-y-5">{[["Périmètre", territoryId === "all" ? "Vue nationale" : state.territories.find((item) => item.id === territoryId)?.name ?? "Territoire"],["Période", period === "today" ? "Aujourd’hui" : period === "7d" ? "7 derniers jours" : "30 derniers jours"],["Confiance", `${Math.round((situations.filter((item) => ["verifiee", "consolidee"].includes(item.trust)).length / Math.max(situations.length, 1)) * 100)}% qualifié`]].map(([label, value]) => <div key={label} className="border-b border-white/8 pb-4 last:border-0"><p className="text-[9px] font-black uppercase tracking-[.12em] text-white/30">{label}</p><p className="mt-1.5 text-sm font-black">{value}</p></div>)}</div></aside>
        </div>
      </section>

      <section className="surface flex flex-col gap-4 p-4 md:flex-row md:items-end md:justify-between">
        <div><p className="label">Périmètre d’analyse</p><p className="mt-1 text-sm text-[#667b81]">Les indicateurs, graphiques et décisions utilisent les mêmes filtres.</p></div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-bold text-[#294951]">Territoire<select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 min-w-52 rounded-xl border border-[#cbdadb] bg-white px-3 py-2.5"><option value="all">Vue nationale</option>{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-xs font-bold text-[#294951]">Période<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1.5 min-w-44 rounded-xl border border-[#cbdadb] bg-white px-3 py-2.5"><option value="today">Aujourd’hui</option><option value="7d">7 derniers jours</option><option value="30d">30 derniers jours</option></select></label>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Volume débarqué" value={`${(totalLanded / 1000).toFixed(2)} t`} detail="Pesées disponibles sur le périmètre" icon={Fish} />
        <Metric label="Pirogues suivies" value={String(vessels.length)} detail="Unités rattachées aux quais visibles" icon={ShipWheel} tone="lagoon" />
        <Metric label="Valeur potentielle" value={`${(estimatedValue / 1_000_000).toFixed(1)} M`} detail="FCFA estimés, non transactionnels" icon={BarChart3} tone="sand" />
        <Metric label="Capacités fragiles" value={String(infrastructures.filter((item) => item.status !== "operationnelle").length)} detail="Froid, pesée ou transport à surveiller" icon={Factory} tone="coral" />
        <Metric label="Volume valorisé" value={`${(valorized / 1000).toFixed(2)} t`} detail="Lots avec résultat logistique" icon={CheckCircle2} tone="lagoon" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <div className="surface p-5">
          <div className="flex items-start justify-between gap-4"><div><p className="label">Pêche du jour</p><h2 className="mt-1 text-xl font-black text-[#07323c]">Volumes par espèce</h2></div><TrustBadge trust="verifiee" /></div>
          <div className="mt-7 space-y-5">
            {speciesTotals.length > 0 ? speciesTotals.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[96px_1fr_72px] items-center gap-3 text-sm">
                <span className="truncate font-bold text-[#294951]">{item.name}</span>
                <div className="h-3 overflow-hidden rounded-full bg-[#e9efef]"><div className="h-full rounded-full" style={{ width: `${Math.max(8, item.value / maxSpecies * 100)}%`, background: palette[index % palette.length] }} /></div>
                <span className="text-right font-black text-[#07323c]">{item.value} kg</span>
              </div>
            )) : <p className="text-sm text-[#667b81]">Aucune pesée disponible sur ce périmètre.</p>}
          </div>
          <p className="mt-6 border-t border-[#e0e8e8] pt-4 text-xs leading-5 text-[#718489]">Lecture issue des débarquements et pesées disponibles. Les absences de données ne valent pas absence d’activité.</p>
        </div>

        <aside className="surface p-5">
          <p className="label">Résolution des situations</p>
          <div className="mt-5 flex items-center gap-6">
            <div className="grid size-36 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#18a394 0 ${progress}%, #e7eeee ${progress}% 100%)` }}>
              <div className="grid size-24 place-items-center rounded-full bg-white text-center"><div><p className="text-3xl font-black text-[#07323c]">{progress}%</p><p className="text-[10px] font-bold uppercase tracking-wider text-[#718489]">réglées</p></div></div>
            </div>
            <div className="space-y-3 text-sm"><p><strong>{resolved}</strong> situation(s) réglée(s)</p><p><strong>{situations.length - resolved}</strong> encore ouverte(s)</p><p><strong className="text-[#b44738]">{critical.length}</strong> critique(s)</p></div>
          </div>
          <div className="mt-6 rounded-xl bg-[#f3f8f7] p-4"><p className="text-xs font-black uppercase tracking-[.12em] text-[#397169]">Lecture métier</p><p className="mt-2 text-sm leading-6 text-[#46646a]">Le taux mesure la boucle complète jusqu’au résultat, pas seulement un changement de statut.</p></div>
        </aside>
      </section>

      {territoryId === "all" && <section className="surface p-5">
        <p className="label">Lecture territoriale</p><h2 className="mt-1 text-xl font-black text-[#07323c]">Volumes enregistrés par quai</h2>
        <div className="mt-7 grid min-h-56 grid-cols-6 items-end gap-3">
          {territoryVolumes.map((item, index) => <div key={item.id} className="flex h-full flex-col justify-end text-center"><p className="mb-2 text-xs font-black text-[#294951]">{item.value ? `${(item.value / 1000).toFixed(1)} t` : "—"}</p><div className="mx-auto w-full max-w-20 rounded-t-xl" style={{ height: `${Math.max(6, item.value / maxTerritory * 150)}px`, background: item.value ? palette[index % palette.length] : "#e7eeee" }} /><p className="mt-3 truncate text-xs font-bold text-[#667b81]">{item.name}</p></div>)}
        </div>
      </section>}

      <section className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <div className="surface overflow-hidden">
          <div className="border-b border-[#d8e1e2] bg-[#f8fbfb] p-5"><p className="label">Décisions attendues</p><h2 className="mt-1 text-lg font-black">Responsabilités et prochain geste</h2></div>
          <div className="divide-y divide-[#e1e8e8]">
            {critical.length > 0 ? critical.map((item) => {
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              return <article key={item.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center"><div><div className="flex flex-wrap items-center gap-2"><AlertTriangle size={17} className="text-[#c94f3d]" /><h3 className="font-bold">{item.title}</h3><TrustBadge trust={item.trust} /></div><p className="mt-2 text-xs text-[#60737a]">{territory?.name} · {item.nextStep}</p></div><span className="text-xs font-bold text-[#9c392b]">Action aujourd’hui</span></article>;
            }) : <p className="p-5 text-sm text-[#667b81]">Aucune situation critique sur ce périmètre.</p>}
          </div>
        </div>
        <aside className="surface p-5">
          <div className="flex items-center gap-2 text-[#075466]"><Handshake size={19} /><p className="label">Rapport de valeur</p></div>
          <h2 className="mt-3 text-lg font-black">{report.title}</h2>
          <p className="mt-2 text-sm text-[#60737a]">{report.period} · données simulées et traçables</p>
          <div className="mt-5 space-y-4">{report.metrics.map((metric) => <div key={metric.label} className="border-l-3 border-[#18a394] pl-3"><p className="text-xs text-[#60737a]">{metric.label}</p><p className="mt-1 text-xl font-black">{metric.value}</p><p className="mt-1 text-xs leading-5 text-[#60737a]">{metric.source} · limite : {metric.limit}</p></div>)}</div>
          <div className="mt-6 flex flex-wrap gap-2"><button onClick={() => window.print()} className="btn-primary"><Printer size={15} /> Ouvrir le rapport</button><button onClick={() => window.print()} className="btn-secondary"><Download size={15} /> Préparer l’export</button></div>
        </aside>
      </section>

      <section className="rounded-[18px] border border-[#cce2e1] bg-[#f0f8f6] p-5">
        <div className="flex gap-3"><Sparkles className="mt-0.5 shrink-0 text-[#087287]" size={20} /><div><p className="font-black text-[#07323c]">Assistance à la synthèse · optionnelle</p><p className="mt-2 text-sm leading-6 text-[#536f74]">Mbàmbulaan peut préparer une lecture des tendances, des incohérences et des décisions possibles. L’organisation choisit de l’activer ; aucune recommandation ne remplace la validation humaine.</p></div></div>
      </section>
    </div>
  );
}
