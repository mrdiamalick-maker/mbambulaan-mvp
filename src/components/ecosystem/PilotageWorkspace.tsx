"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
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
import { CoastlineTerritoryMap } from "@/components/territories/CoastlineTerritoryMap";

// Ligne/aire d'évolution (Chapitre 2 — Tendances, Lot C, Audit DA
// Premium XXL v2, mandat CEO 2026-08-18, arbitrage "Option 1"). Grain
// jour, aucun point interpolé : un point par date réellement présente
// dans trendPoints, rien de plus. N'est appelé que pour ≥2 points — en
// dessous, le repli textuel (cf. JSX) est honnête sur le manque
// d'historique plutôt que de forcer un tracé.
function buildTrendPath(points: { date: string; kg: number }[], width: number, height: number, padding: number) {
  const maxKg = Math.max(...points.map((point) => point.kg), 1);
  const stepX = (width - padding * 2) / (points.length - 1);
  const scaleY = (kg: number) => height - padding - (kg / maxKg) * (height - padding * 2);
  const coords: [number, number][] = points.map((point, index) => [padding + index * stepX, scaleY(point.kg)]);
  const line = coords.map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1][0].toFixed(1)},${(height - padding).toFixed(1)} L${coords[0][0].toFixed(1)},${(height - padding).toFixed(1)} Z`;
  return { line, area, coords };
}

export function PilotageWorkspace() {
  const { state } = useProduct();
  const [territoryId, setTerritoryId] = useState("all");
  const [period, setPeriod] = useState("today");
  const [aiTeaserExpanded, setAiTeaserExpanded] = useState(false);
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
  // "Valeur potentielle" et "Pirogues suivies" : différées du Chapitre 1 —
  // Maintenant (Lot B) au Chapitre 2 — Tendances (Lot C, Audit DA Premium
  // XXL v2, mandat CEO 2026-08-17) — cf. commentaire sur la rangée "3
  // mesures" du Chapitre 1 plus bas. estimatedValue recalculé ici à
  // l'identique, aucune donnée fabriquée.
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
  // Évolution des volumes débarqués (Lot C, arbitrage CEO 2026-08-18,
  // "Option 1") : remplace l'ancien graphique en barres "Volumes
  // enregistrés par quai" (une valeur unique par quai, sans lecture
  // temporelle). Vérifié en exécutant réellement createDemoState() :
  // seules 2 dates calendaires existent dans toute la démonstration
  // (2026-07-29, 2026-08-08), la plupart des quais n'en ont qu'une —
  // grain jour, un point par date réellement pesée sur le périmètre
  // courant (déjà filtré par `landings`), aucun jour interpolé. Le
  // fallback à <2 points (cf. JSX) est délibéré, pas un manque.
  const trendByDate = new Map<string, number>();
  landings.forEach((landing) => {
    const timestamp = landing.weighedAt ?? landing.arrivedAt;
    if (!timestamp) return;
    const date = timestamp.slice(0, 10);
    trendByDate.set(date, (trendByDate.get(date) ?? 0) + landing.totalWeightKg);
  });
  const trendPoints = [...trendByDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, kg]) => ({ date, kg }));
  const trendPath = trendPoints.length >= 2 ? buildTrendPath(trendPoints, 640, 200, 20) : null;
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
      {/* Chapitre 1 — Maintenant (Lot B, Audit DA Premium XXL v2, mandat
          CEO 2026-08-17). Même schéma que le Chapitre 1 de /app/etat :
          carte + décision prioritaire côte à côte, puis un rang de
          compteurs réduit sous les deux — carte cliquable, désormais
          raccordée au filtre territoire déjà existant de cette page
          (cliquer un point sélectionne ce territoire, comme le
          sélecteur juste au-dessus) plutôt qu'un nouveau tiroir de
          détail : Pilotage a déjà un mécanisme de périmètre, inutile
          d'en dupliquer un second comme sur /app/etat qui n'en avait
          pas. L'ancien bloc "Fenêtre de décision" (périmètre/période/
          confiance) est dissous : périmètre et période étaient déjà
          redondants avec les sélecteurs juste en dessous — seule
          "Confiance" survit, glissée dans le panneau de droite. */}
      <section>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">1 · Maintenant</p>

        <div className="mt-3 flex flex-col gap-4 border-b pb-4 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Périmètre d’analyse</p><p className="mt-1 text-sm text-muted-foreground">La carte, les indicateurs et les décisions utilisent les mêmes filtres.</p></div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="text-xs font-semibold">Territoire<select value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 block min-w-52 rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="all">Vue nationale</option>{state.territories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="text-xs font-semibold">Période<select value={period} onChange={(event) => setPeriod(event.target.value)} className="mt-1.5 block min-w-44 rounded-md border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"><option value="today">Aujourd’hui</option><option value="7d">7 derniers jours</option><option value="30d">30 derniers jours</option></select></label>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_.7fr] lg:items-stretch">
          <div className="overflow-hidden rounded-2xl border bg-card">
            <div className="aspect-[4/5] p-4 sm:aspect-[3/4] lg:aspect-auto lg:h-full lg:min-h-[420px]">
              <CoastlineTerritoryMap
                territories={state.territories}
                selectedId={territoryId !== "all" ? territoryId : undefined}
                onSelect={(id) => setTerritoryId(id)}
                colors={{ stable: "#1d4468", vigilance: "#c68a2c", critique: "#b6522f", land: "#f4f0e6", landStroke: "#1d4468" }}
              />
            </div>
          </div>

          <aside className="flex flex-col overflow-hidden rounded-2xl bg-sidebar p-6 text-sidebar-foreground">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary"><Radio size={15} /> Brief exécutif</div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight lg:text-2xl">{critical.length ? `${critical.length} arbitrage${critical.length > 1 ? "s" : ""} critique${critical.length > 1 ? "s" : ""} sur le périmètre.` : "La situation est maîtrisée ; la veille reste active."}</h2>
            <p className="mt-3 text-sm leading-6 text-sidebar-foreground/60">{(totalLanded / 1000).toFixed(2)} t documentées, {vessels.length} pirogues suivies et {infrastructures.filter((item) => item.status !== "operationnelle").length} capacités fragiles. Chaque chiffre renvoie à ses objets sources.</p>
            <p className="mt-4 border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">Confiance <span className="ml-1 text-sm font-bold normal-case tracking-normal text-sidebar-foreground">{Math.round((situations.filter((item) => ["verifiee", "consolidee"].includes(item.trust)).length / Math.max(situations.length, 1)) * 100)}% qualifié</span></p>
            <div className="mt-5 flex flex-1 flex-col justify-end gap-2">
              {/* Correctif 2026-08-17 (gap analysis Pilotage) : le repli
                  pointait vers /app/situations (index), dont la garde de
                  rôle (situations/page.tsx, Lot 2) redirige justement
                  administrateur/gestionnaire_organisation/coordinateur/
                  partenaire — les 4 seuls rôles qui atteignent cette page
                  — vers /app/travail. Retour silencieux vérifié en
                  conditions réelles. /app/travail (CoordinatorHub) est la
                  vraie destination pour ces rôles : la file de situations
                  fusionnée y vit déjà ("Situations à traiter, par
                  priorité"), ce n'est pas un contournement. */}
              <Button variant="secondary" asChild><Link href={critical[0] ? `/app/situations/${critical[0].id}` : "/app/travail"}>{critical[0] ? "Ouvrir l’arbitrage" : "Voir les situations"} <ArrowRight size={15} /></Link></Button>
              <Button variant="outline" className="border-white/20 bg-transparent text-sidebar-foreground hover:bg-white/10 hover:text-sidebar-foreground" asChild><Link href="/app/atlas">Vérifier dans l’Atlas</Link></Button>
            </div>
          </aside>
        </div>

        {/* "Quelques mesures" (mandat) : 3 des 5 anciennes mesures restent
            ici — le coeur de "maintenant". Pirogues suivies reste visible
            dans la phrase du brief ci-dessus (vessels toujours utilisé,
            aucune donnée perdue) ; Valeur potentielle rejoint le Chapitre
            2 — Tendances (Lot C), aux côtés de Pirogues suivies. */}
        <div className="mt-6 grid gap-6 border-t pt-5 sm:grid-cols-3">
          {[
            [Fish, "Volume débarqué", `${(totalLanded / 1000).toFixed(2)} t`, "Pesées disponibles sur le périmètre", "text-[#1d4468]"],
            [Factory, "Capacités fragiles", String(infrastructures.filter((item) => item.status !== "operationnelle").length), "Froid, pesée ou transport à surveiller", "text-[#b6522f]"],
            [CheckCircle2, "Volume valorisé", `${(valorized / 1000).toFixed(2)} t`, "Lots avec résultat logistique", "text-[#1d4468]"]
          ].map(([Icon, label, value, detail, tone]) => {
            const ItemIcon = Icon as typeof Fish;
            return <div key={String(label)}><ItemIcon size={18} className={String(tone)} /><p className="mt-2 text-2xl font-bold">{String(value)}</p><p className="text-xs text-muted-foreground">{String(label)}</p><p className="mt-1 text-[11px] text-muted-foreground">{String(detail)}</p></div>;
          })}
        </div>
      </section>

      {/* Chapitre 2 — Tendances (Lot C, Audit DA Premium XXL v2, mandat
          CEO 2026-08-17/18). Regroupe la composition (espèces),
          l'appareil productif et la résolution des situations, plus
          l'évolution des volumes dans le temps — les lectures "comment
          la filière évolue" sur le périmètre choisi au Chapitre 1.
          Valeur potentielle et Pirogues suivies, différées du Chapitre
          1 (Lot B), rejoignent ici. */}
      <section className="border-t pt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-[#1d4468]">2 · Tendances</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Comment la filière évolue sur le périmètre.</h2>

        <div className="mt-6 grid gap-6 border-y py-5 sm:grid-cols-2">
          <div><BarChart3 size={18} className="text-[#1d4468]" /><p className="mt-2 text-2xl font-bold">{(estimatedValue / 1_000_000).toFixed(1)} M</p><p className="text-xs text-muted-foreground">Valeur potentielle</p><p className="mt-1 text-[11px] text-muted-foreground">FCFA estimés, non transactionnels</p></div>
          <div><ShipWheel size={18} className="text-[#1d4468]" /><p className="mt-2 text-2xl font-bold">{vessels.length}</p><p className="text-xs text-muted-foreground">Pirogues suivies</p><p className="mt-1 text-[11px] text-muted-foreground">Unités rattachées aux quais visibles</p></div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[1.25fr_.75fr]">
          <section>
            <div className="flex items-start justify-between gap-4 border-b pb-3"><div><p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pêche du jour</p><h3 className="mt-1 text-xl font-semibold">Volumes par espèce</h3></div><TrustBadge trust="verifiee" /></div>
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
        </div>

        {/* Évolution des volumes débarqués — remplace l'ancien graphique
            en barres "Volumes enregistrés par quai" (arbitrage CEO
            2026-08-18, "Option 1"). Grain jour, filtré par le même
            sélecteur territoire que tout le Chapitre 1 (pas de second
            filtre : "cohérent avec le filtre déjà existant sur la
            page"). En dessous de 2 points réels sur le périmètre
            choisi, un message honnête remplace le tracé plutôt qu'une
            courbe à un point qui suggérerait une tendance inexistante. */}
        <div className="mt-8 border-t pt-7">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Évolution des volumes débarqués</p>
          <h3 className="mt-1 text-xl font-semibold">{territoryId === "all" ? "Total quotidien, tous quais confondus" : state.territories.find((item) => item.id === territoryId)?.name ?? "Territoire"}</h3>

          {trendPath ? (
            <div className="mt-6">
              <svg viewBox="0 0 640 200" preserveAspectRatio="none" className="h-44 w-full" role="img" aria-label="Évolution du volume débarqué dans le temps sur le périmètre sélectionné">
                <path d={trendPath.area} fill="#1d4468" fillOpacity="0.08" />
                <path d={trendPath.line} fill="none" stroke="#1d4468" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {trendPath.coords.map(([x, y], index) => <circle key={trendPoints[index].date} cx={x} cy={y} r="4.5" fill="#1d4468" stroke="#fff" strokeWidth="2" />)}
              </svg>
              <div className="mt-2 flex justify-between text-xs">
                {trendPoints.map((point) => (
                  <div key={point.date} className="text-center">
                    <p className="font-bold">{(point.kg / 1000).toFixed(2)} t</p>
                    <p className="text-muted-foreground">{new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(point.date))}</p>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t pt-4 text-xs leading-5 text-muted-foreground">Grain jour, dérivé des pesées réelles (weighedAt, ou arrivedAt à défaut) — aucun jour interpolé. Seules {trendPoints.length} date(s) sont documentées sur ce périmètre dans la démonstration actuelle.</p>
            </div>
          ) : trendPoints.length === 1 ? (
            <div className="mt-6 rounded-lg border border-dashed p-5">
              <p className="text-sm font-semibold">{(trendPoints[0].kg / 1000).toFixed(2)} t pesées le {new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "long" }).format(new Date(trendPoints[0].date))}</p>
              <p className="mt-1 text-xs text-muted-foreground">Historique insuffisant pour tracer une évolution : un seul jour de pesée est documenté sur ce périmètre dans la démonstration actuelle.</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Aucun débarquement pesé et daté sur ce périmètre pour le moment.</p>
          )}
        </div>
      </section>

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

      {/* Lot A, gap analysis Pilotage (CEO 2026-08-17) : passé de section
          toujours dépliée à drill-down replié par défaut — c'était l'une
          des "bonnes briques en trop" du diagnostic mandat, une
          fonctionnalité optionnelle n'a pas besoin d'occuper un bloc de
          pleine largeur en permanence. */}
      <section className="border-t pt-5">
        <button onClick={() => setAiTeaserExpanded((value) => !value)} className="flex w-full items-center gap-3 text-left">
          <Sparkles className="shrink-0 text-[#1d4468]" size={18} />
          <span className="font-semibold">Assistance à la synthèse · optionnelle</span>
          <ChevronDown size={16} className={`ml-auto shrink-0 text-muted-foreground transition ${aiTeaserExpanded ? "rotate-180" : ""}`} />
        </button>
        {aiTeaserExpanded && <p className="mt-3 max-w-4xl text-sm leading-6 text-muted-foreground">Mbàmbulaan peut préparer une lecture des tendances, des incohérences et des décisions possibles. L’organisation choisit de l’activer ; aucune recommandation ne remplace la validation humaine.</p>}
      </section>
    </div>
  );
}
