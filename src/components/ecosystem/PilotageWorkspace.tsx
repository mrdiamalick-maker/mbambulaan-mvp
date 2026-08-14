"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Factory,
  Fish,
  Handshake,
  Radio,
  ShipWheel,
  Sparkles
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TrustBadge } from "@/components/shared/StatusBadges";
import { Button } from "@/components/ui/button";
import { ExportActions } from "@/components/reporting/ExportActions";

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
  const exportRows = [
    ...situations.map((item) => ({
      Type: "Situation",
      Territoire: state.territories.find((territory) => territory.id === item.territoryId)?.name ?? item.territoryId,
      Référence: item.reference,
      Intitulé: item.title,
      Statut: item.status,
      Priorité: item.priority,
      Confiance: item.trust,
      "Prochaine étape": item.nextStep
    })),
    ...landings.map((item) => ({
      Type: "Débarquement",
      Territoire: state.sites.find((site) => site.id === item.siteId)?.name ?? item.siteId,
      Référence: item.id,
      Intitulé: `${item.totalWeightKg} kg`,
      Statut: item.status,
      Priorité: "",
      Confiance: item.trust,
      "Prochaine étape": item.weighingSource
    }))
  ];

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-sidebar text-sidebar-foreground">
        <div className="grid lg:grid-cols-[1.25fr_.75fr]">
          <div className="p-6 lg:p-7">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary"><Radio size={15} /> Brief exécutif</div>
            <h2 className="mt-4 max-w-3xl text-2xl font-semibold tracking-tight lg:text-3xl">{critical.length ? `${critical.length} arbitrage${critical.length > 1 ? "s" : ""} critique${critical.length > 1 ? "s" : ""} sur le périmètre.` : "La situation est maîtrisée ; la veille reste active."}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-sidebar-foreground/60">{(totalLanded / 1000).toFixed(2)} t documentées, {vessels.length} pirogues suivies et {infrastructures.filter((item) => item.status !== "operationnelle").length} capacités fragiles. Chaque chiffre renvoie à ses objets sources.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" asChild><Link href={critical[0] ? `/app/situations/${critical[0].id}` : "/app/situations"}>{critical[0] ? "Ouvrir l’arbitrage" : "Voir les situations"} <ArrowRight size={15} /></Link></Button>
              <Button variant="outline" className="border-white/20 bg-transparent text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground" asChild><Link href="/app/atlas">Vérifier dans l’Atlas</Link></Button>
            </div>
          </div>
          <aside className="border-t border-white/10 bg-white/5 p-6 lg:border-l lg:border-t-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">Fenêtre de décision</p>
            <div className="mt-5 space-y-5">{[["Périmètre", territoryId === "all" ? "Vue nationale" : state.territories.find((item) => item.id === territoryId)?.name ?? "Territoire"], ["Période", period === "today" ? "Aujourd’hui" : period === "7d" ? "7 derniers jours" : "30 derniers jours"], ["Confiance", `${Math.round((situations.filter((item) => ["verifiee", "consolidee"].includes(item.trust)).length / Math.max(situations.length, 1)) * 100)}% qualifié`]].map(([label, value]) => <div key={label} className="border-b border-white/10 pb-4 last:border-0"><p className="text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/35">{label}</p><p className="mt-1.5 text-sm font-bold">{value}</p></div>)}</div>
          </aside>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-y py-4 md:flex-row md:items-end md:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Périmètre d’analyse</p><p className="mt-1 text-sm text-muted-foreground">Les indicateurs, graphiques et décisions utilisent les mêmes filtres.</p></div>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="text-xs font-semibold">Territoire<select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 block min-w-52 rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="all">Vue nationale</option>{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-xs font-semibold">Période<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1.5 block min-w-44 rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="today">Aujourd’hui</option><option value="7d">7 derniers jours</option><option value="30d">30 derniers jours</option></select></label>
        </div>
      </section>

      <section className="grid border-y sm:grid-cols-2 xl:grid-cols-5">
        {[
          [Fish, "Volume débarqué", `${(totalLanded / 1000).toFixed(2)} t`, "Pesées disponibles sur le périmètre", "text-[#1d4468]"],
          [ShipWheel, "Pirogues suivies", String(vessels.length), "Unités rattachées aux quais visibles", "text-[#1d4468]"],
          [BarChart3, "Valeur potentielle", `${(estimatedValue / 1_000_000).toFixed(1)} M`, "FCFA estimés, non transactionnels", "text-[#1d4468]"],
          [Factory, "Capacités fragiles", String(infrastructures.filter((item) => item.status !== "operationnelle").length), "Froid, pesée ou transport à surveiller", "text-[#b6522f]"],
          [CheckCircle2, "Volume valorisé", `${(valorized / 1000).toFixed(2)} t`, "Lots avec résultat logistique", "text-[#1d4468]"]
        ].map(([Icon, label, value, detail, tone], index) => {
          const ItemIcon = Icon as typeof Fish;
          return <div key={String(label)} className={`py-4 ${index > 0 ? "sm:border-l sm:pl-4" : ""}`}><ItemIcon size={18} className={String(tone)} /><p className="mt-3 text-2xl font-bold">{String(value)}</p><p className="text-xs text-muted-foreground">{String(label)}</p><p className="mt-1 text-[11px] text-muted-foreground">{String(detail)}</p></div>;
        })}
      </section>

      <section className="grid gap-8 xl:grid-cols-[1.25fr_.75fr]">
        <section>
          <div className="flex items-start justify-between gap-4 border-b pb-3"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pêche du jour</p><h2 className="mt-1 text-xl font-semibold">Volumes par espèce</h2></div><TrustBadge trust="verifiee" /></div>
          <div className="mt-7 space-y-5">
            {speciesTotals.length > 0 ? speciesTotals.map((item) => (
              <div key={item.id} className="grid grid-cols-[96px_1fr_72px] items-center gap-3 text-sm">
                <span className="truncate font-semibold">{item.name}</span>
                <div className="h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-[#1d4468]" style={{ width: `${Math.max(8, item.value / maxSpecies * 100)}%` }} /></div>
                <span className="text-right font-bold">{item.value} kg</span>
              </div>
            )) : <p className="text-sm text-muted-foreground">Aucune pesée disponible sur ce périmètre.</p>}
          </div>
          <p className="mt-6 border-t pt-4 text-xs leading-5 text-muted-foreground">Lecture issue des débarquements et pesées disponibles. Les absences de données ne valent pas absence d’activité.</p>
        </section>

        <section className="border-l-0 xl:border-l xl:pl-8">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Résolution des situations</p>
          <div className="mt-5 flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="grid size-36 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#1d8a5f 0 ${progress}%, var(--muted) ${progress}% 100%)` }}>
              <div className="grid size-24 place-items-center rounded-full bg-background text-center"><div><p className="text-3xl font-bold">{progress}%</p><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">réglées</p></div></div>
            </div>
            <div className="space-y-3 text-sm"><p><strong>{resolved}</strong> situation(s) réglée(s)</p><p><strong>{situations.length - resolved}</strong> encore ouverte(s)</p><p><strong className="text-[#b6522f]">{critical.length}</strong> critique(s)</p></div>
          </div>
          <div className="mt-6 border-l-2 border-[#1d8a5f]/40 pl-4"><p className="text-xs font-bold uppercase tracking-widest text-[#1d8a5f]">Lecture métier</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Le taux mesure la boucle complète jusqu’au résultat, pas seulement un changement de statut.</p></div>
        </section>
      </section>

      {territoryId === "all" && (
        <section className="border-t pt-7">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lecture territoriale</p><h2 className="mt-1 text-xl font-semibold">Volumes enregistrés par quai</h2>
          <div className="mt-7 grid min-h-56 grid-cols-6 items-end gap-3">
            {territoryVolumes.map((item) => (
              <div key={item.id} className="flex h-full flex-col justify-end text-center">
                <p className="mb-2 text-xs font-bold">{item.value ? `${(item.value / 1000).toFixed(1)} t` : "—"}</p>
                <div className="mx-auto w-full max-w-20 rounded-t-md" style={{ height: `${Math.max(6, item.value / maxTerritory * 150)}px`, background: item.value ? "#1d4468" : "var(--muted)" }} />
                <p className="mt-3 truncate text-xs font-semibold text-muted-foreground">{item.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-8 border-t pt-8 xl:grid-cols-[1.2fr_.8fr]">
        <section>
          <div className="border-b border-[#b6522f]/30 pb-3"><p className="text-xs font-bold uppercase tracking-widest text-[#b6522f]">Décisions attendues</p><h2 className="mt-1 text-lg font-semibold">Responsabilités et prochain geste</h2></div>
          <div className="divide-y">
            {critical.length > 0 ? critical.map((item) => {
              const territory = state.territories.find((territoryItem) => territoryItem.id === item.territoryId);
              return (
                <article key={item.id} className="grid gap-4 border-l-2 border-[#b6522f]/50 py-4 pl-4 md:grid-cols-[1fr_auto] md:items-center">
                  <div><div className="flex flex-wrap items-center gap-2"><AlertTriangle size={17} className="text-[#b6522f]" /><h3 className="font-semibold">{item.title}</h3><TrustBadge trust={item.trust} /></div><p className="mt-2 text-xs text-muted-foreground">{territory?.name} · {item.nextStep}</p></div>
                  <span className="text-xs font-bold text-[#b6522f]">Action aujourd’hui</span>
                </article>
              );
            }) : <p className="py-5 text-sm text-muted-foreground">Aucune situation critique sur ce périmètre.</p>}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 text-[#1d4468]"><Handshake size={19} /><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rapport de valeur</p></div>
          <h2 className="mt-3 text-lg font-semibold">{report.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{report.period} · données simulées et traçables</p>
          <div className="mt-5 divide-y border-y">{report.metrics.map((metric) => <div key={metric.label} className="py-4"><p className="text-xs text-muted-foreground">{metric.label}</p><p className="mt-1 text-xl font-bold">{metric.value}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{metric.source} · limite : {metric.limit}</p></div>)}</div>
          <div className="mt-6"><ExportActions filename={`mbambulaan-pilotage-${territoryId}-${period}`} rows={exportRows} compact /></div>
        </section>
      </section>

      <section className="flex gap-3 border-t pt-6">
        <Sparkles className="mt-0.5 shrink-0 text-[#1d4468]" size={20} />
        <div><p className="font-semibold">Assistance à la synthèse · optionnelle</p><p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">Mbàmbulaan peut préparer une lecture des tendances, des incohérences et des décisions possibles. L’organisation choisit de l’activer ; aucune recommandation ne remplace la validation humaine.</p></div>
      </section>
    </div>
  );
}
