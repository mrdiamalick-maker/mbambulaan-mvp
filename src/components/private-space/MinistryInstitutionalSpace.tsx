"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ministryRegionalQuays,
  ministryRegions,
  type MinistryRegionName,
  type MinistryRegionalQuay
} from "@/data/ministryRegionalSpace";

const aiCapabilitiesList = ["Synthèse", "Alertes", "Notes", "Recherche assistée"] as const;

const infoCopy: Record<string, string> = {
  tension: "Indique le niveau de pression observé à partir des signaux terrain, incidents et alertes.",
  priority: "Aide à repérer les quais qui demandent une attention rapide. Le score est simulé pour la démo.",
  catches: "Donne une lecture des débarquements déclarés et des volumes du jour par quai ou région.",
  species: "Identifie les espèces signalées comme à surveiller. Les signaux doivent être vérifiés avant décision.",
  alerts: "Regroupe les incidents, plaintes et tensions déclarées par les relais ou acteurs terrain.",
  proofs: "Montre les éléments disponibles pour documenter une décision, une vérification ou un arbitrage.",
  budget: "Permet de voir l’exécution et les dossiers financiers qui demandent une justification.",
  ai: "L’IA assiste la lecture, propose des actions et prépare des brouillons. L’humain valide toujours."
};

function tensionColor(tension: string) {
  if (tension === "Critique") return "bg-rose-500";
  if (tension === "Forte") return "bg-amber-400";
  if (tension === "Moyenne") return "bg-yellow-300";
  return "bg-emerald-400";
}

function tensionBadge(tension: string) {
  if (tension === "Critique") return "bg-rose-100 text-rose-950 ring-rose-200";
  if (tension === "Forte") return "bg-amber-100 text-amber-950 ring-amber-200";
  if (tension === "Moyenne") return "bg-yellow-100 text-yellow-950 ring-yellow-200";
  return "bg-emerald-100 text-emerald-950 ring-emerald-200";
}

function formatRegion(region: MinistryRegionName) {
  return region === "Tout" ? "Toutes les régions" : region;
}

function sum(items: MinistryRegionalQuay[], key: "tonnage" | "landings" | "incidents" | "conflicts" | "programs" | "proofs") {
  return items.reduce((total, item) => total + item[key], 0);
}

export function MinistryInstitutionalSpace() {
  const [selectedRegion, setSelectedRegion] = useState<MinistryRegionName>("Tout");
  const [selectedQuayId, setSelectedQuayId] = useState("th-joal");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiCaps, setAiCaps] = useState<Record<(typeof aiCapabilitiesList)[number], boolean>>(
    Object.fromEntries(aiCapabilitiesList.map((name) => [name, name !== "Recherche assistée"])) as Record<(typeof aiCapabilitiesList)[number], boolean>
  );
  const [message, setMessage] = useState("IA simulée - données mockées. L'humain valide chaque décision.");
  const [note, setNote] = useState("Aucune note préparée.");
  const [trace, setTrace] = useState<string[]>(["Session ouverte : vision nationale multi-régions."]);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [comparison, setComparison] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const filteredQuays = useMemo(
    () => ministryRegionalQuays.filter((quay) => selectedRegion === "Tout" || quay.region === selectedRegion),
    [selectedRegion]
  );

  const activeQuay = filteredQuays.find((quay) => quay.id === selectedQuayId) ?? filteredQuays[0] ?? ministryRegionalQuays[0];
  const topPriority = [...filteredQuays].sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 5);
  const topVolumes = [...filteredQuays].sort((a, b) => b.tonnage - a.tonnage).slice(0, 6);
  const alertQuays = filteredQuays.filter((quay) => quay.incidents + quay.conflicts > 0).sort((a, b) => b.incidents + b.conflicts - (a.incidents + a.conflicts));
  const speciesSignals = filteredQuays.flatMap((quay) => quay.sensitiveSpecies.filter((species) => species !== "Aucune alerte").map((species) => ({ quay, species })));
  const maxTonnage = Math.max(...topVolumes.map((quay) => quay.tonnage), 1);
  const activeContext = selectedRegion === "Tout" ? "vision nationale multi-régions" : `région ${selectedRegion}`;

  function selectRegion(region: MinistryRegionName) {
    const nextQuays = ministryRegionalQuays.filter((quay) => region === "Tout" || quay.region === region);
    setSelectedRegion(region);
    setSelectedQuayId(nextQuays[0]?.id ?? ministryRegionalQuays[0].id);
    setComparison(null);
    setFocus(null);
    setTrace((items) => [`Filtre appliqué : ${formatRegion(region)}.`, ...items].slice(0, 8));
  }

  function addTrace(text: string) {
    setTrace((items) => [text, ...items].slice(0, 8));
  }

  function addAction(id: string, status: string, text: string) {
    setStatuses((items) => ({ ...items, [id]: status }));
    addTrace(text);
    setMessage(`${text}. Simulation MVP - action non connectée au backend.`);
  }

  function prepareNote(quay = activeQuay) {
    const prefix = aiEnabled && aiCaps["Notes"] ? "Note suggérée par IA" : "Brouillon manuel";
    setNote(`${prefix} - ${quay.name} (${quay.region}) : tension ${quay.tension}, priorité ${quay.priorityScore}/100, ${quay.tonnage} t déclarées, ${quay.conflicts} plainte(s), preuve ${quay.proofLevel}. Action : ${quay.recommendedAction}`);
    addAction(`note-${quay.id}`, "Brouillon préparé", `Note préparée pour ${quay.name}`);
  }

  function runAiSuggestion(kind: "note" | "verify" | "compare" | "complaints", quay = activeQuay) {
    if (kind === "note") {
      prepareNote(quay);
      return;
    }
    if (kind === "verify") {
      addAction(`verify-${quay.id}`, "Vérification demandée", `Vérification terrain demandée sur ${quay.name}`);
      setFocus("species");
      return;
    }
    if (kind === "compare") {
      const best = topVolumes[0];
      const second = topVolumes[1] ?? activeQuay;
      setComparison(`${best.name} (${best.tonnage} t) concentre plus de volume que ${second.name} (${second.tonnage} t). Lecture utile pour éviter une moyenne nationale qui masque les écarts.`);
      addTrace(`Comparaison IA affichée : ${best.name} / ${second.name}.`);
      return;
    }
    setFocus("complaints");
    addAction(`complaints-${quay.id}`, "Plaintes ouvertes", `Focus plaintes et conflits activé pour ${quay.name}`);
  }

  const aiInsight = aiEnabled && aiCaps["Synthèse"]
    ? `${formatRegion(selectedRegion)} : ${filteredQuays.length} quai(s) affiché(s), ${sum(filteredQuays, "tonnage").toFixed(1)} t déclarées, ${alertQuays.length} quai(s) avec alerte. Priorité immédiate : ${topPriority[0]?.name ?? activeQuay.name}.`
    : "Mode manuel : les données, actions et traces restent disponibles sans assistance IA.";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eafbf8_0%,#f7fcfb_42%,#fff8eb_100%)] text-slate-950">
      <header className="border-b border-cyan-100 bg-white/95 px-5 py-6 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[96rem] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministère des Pêches · espace privé</p>
              <h1 className="text-2xl font-black tracking-tight">Espace institutionnel de lecture régionale</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <RegionSelector selected={selectedRegion} onSelect={selectRegion} />
            <select value={activeQuay.id} onChange={(event) => setSelectedQuayId(event.target.value)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">
              {filteredQuays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}
            </select>
            <button onClick={() => prepareNote()} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Préparer note</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[96rem] gap-11 px-5 py-8 sm:px-8">
        <Band index="01" label="Centre de pilotage national" title={`Lecture ${activeContext}`} subtitle="La sélection régionale pilote toutes les cartes, listes, actions, notes et traces.">
          <HeroPanel context={formatRegion(selectedRegion)} aiInsight={aiInsight} />
          <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <Panel title="Vue sans moyenne réductrice" subtitle="Classements par quai">
              <div className="grid gap-3 sm:grid-cols-3">
                <Chip label="Quais affichés" value={String(filteredQuays.length)} hint={infoCopy.tension} />
                <Chip label="Tonnage cumulé" value={`${sum(filteredQuays, "tonnage").toFixed(1)} t`} hint={infoCopy.catches} />
                <Chip label="Alertes terrain" value={String(sum(filteredQuays, "incidents") + sum(filteredQuays, "conflicts"))} hint={infoCopy.alerts} />
              </div>
              <div className="mt-4 grid gap-2">
                {topPriority.slice(0, 3).map((quay) => <QuayLine key={quay.id} quay={quay} onSelect={() => setSelectedQuayId(quay.id)} />)}
              </div>
            </Panel>
            <Panel title={`Quai actif : ${activeQuay.name}`} subtitle={`${activeQuay.region} · ${activeQuay.commune}`}>
              <Row label="Tension" value={activeQuay.tension} />
              <Row label="Priorité" value={`${activeQuay.priorityScore}/100`} />
              <Row label="Pêches du jour" value={`${activeQuay.tonnage} t · ${activeQuay.landings} débarquements`} />
              <Row label="Action recommandée" value={activeQuay.recommendedAction} />
              <ActionBar primary="Prioriser ce quai" secondary={["Vérifier terrain", "Préparer note"]} onPrimary={() => addAction(`priority-${activeQuay.id}`, "Priorisé", `Quai priorisé : ${activeQuay.name}`)} onSecondary={(item) => item.includes("note") ? prepareNote(activeQuay) : addAction(`field-${activeQuay.id}`, "Vérification demandée", `Vérification terrain demandée : ${activeQuay.name}`)} />
            </Panel>
          </div>
        </Band>

        <Band index="02" label="Lecture territoriale" title="Filtrer par région, puis choisir un quai" subtitle="Aucun quai hors région n’apparaît quand une région est sélectionnée.">
          <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-8">
            {ministryRegions.map((region) => {
              const count = region === "Tout" ? ministryRegionalQuays.length : ministryRegionalQuays.filter((quay) => quay.region === region).length;
              return (
                <button key={region} onClick={() => selectRegion(region)} className={`rounded-[1.35rem] border p-4 text-left transition ${selectedRegion === region ? "border-cyan-600 bg-gradient-to-br from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-900/15" : "border-cyan-100 bg-white/80 text-cyan-950 hover:border-cyan-300"}`}>
                  <span className="block text-lg font-black">{formatRegion(region)}</span>
                  <span className={`mt-2 block text-xs font-black uppercase tracking-[0.12em] ${selectedRegion === region ? "text-cyan-50" : "text-cyan-700"}`}>{count} quai(s)</span>
                </button>
              );
            })}
          </div>
        </Band>

        <Band index="03" label="Indicateurs critiques" title="KPIs par quai, pas moyenne globale" subtitle="La lecture montre les écarts et les points à traiter par territoire.">
          <div className="grid gap-3 lg:grid-cols-3">
            <Radial label="Score priorité" value={activeQuay.priorityScore} hint={infoCopy.priority} />
            <Radial label="Exécution budget" value={activeQuay.budgetExecution} hint={infoCopy.budget} />
            <Spark label="Volume par quai" quays={topVolumes} max={maxTonnage} hint={infoCopy.catches} />
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {topPriority.slice(0, 4).map((quay) => <KpiQuayCard key={quay.id} quay={quay} onSelect={() => setSelectedQuayId(quay.id)} />)}
          </div>
        </Band>

        <Band index="04" label="Carte et fiches de quai" title="Points de géolocalisation simulés" subtitle="La carte affiche tous les points si Tout est actif, sinon uniquement les quais de la région.">
          <div className="grid gap-4 xl:grid-cols-[1fr_23rem]">
            <Panel title="Carte stylisée des quais" subtitle={`${filteredQuays.length} point(s) affiché(s)`}>
              <div className="relative min-h-[32rem] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.22),transparent_30%),linear-gradient(140deg,#f8fafc,#dff7f4_46%,#f7e7c3)]">
                <div className="absolute left-[25%] top-8 h-[86%] w-10 rounded-full border-l-4 border-cyan-300/70" />
                {filteredQuays.map((quay) => (
                  <button key={quay.id} onClick={() => setSelectedQuayId(quay.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${activeQuay.id === quay.id ? "h-11 w-11 ring-4 ring-cyan-900/20" : "h-7 w-7"} ${tensionColor(quay.tension)}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} aria-label={`Sélectionner ${quay.name}`} />
                ))}
                {filteredQuays.map((quay) => <span key={`${quay.id}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-black text-slate-700 shadow-sm" style={{ left: `${quay.x}%`, top: `calc(${quay.y}% + 1.35rem)` }}>{quay.name}</span>)}
              </div>
            </Panel>
            <Panel title={`Fiche ${activeQuay.name}`} subtitle={`${activeQuay.lat}, ${activeQuay.lng}`}>
              <Row label="Région" value={activeQuay.region} />
              <Row label="Commune" value={activeQuay.commune} />
              <Row label="Tension" value={activeQuay.tension} />
              <Row label="Financement à suivre" value={activeQuay.pendingFunding} />
              <Row label="Ressources" value={activeQuay.resources.join(", ")} />
              <ActionBar primary="Demander arbitrage" secondary={["Compte rendu", "Trace"]} onPrimary={() => prepareNote(activeQuay)} onSecondary={(item) => addAction(`${item}-${activeQuay.id}`, "Demandé", `${item} demandé : ${activeQuay.name}`)} />
            </Panel>
          </div>
        </Band>

        <Band index="05" label="Pêches du jour" title="Tonnages et variétés par quai" subtitle="Les volumes affichés respectent strictement le filtre régional.">
          <Panel title="Distribution des pêches" subtitle={formatRegion(selectedRegion)}>
            <Bars quays={topVolumes} max={maxTonnage} />
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {topVolumes.slice(0, 6).map((quay) => <SeafoodCard key={quay.id} quay={quay} onAction={() => addAction(`tonnage-${quay.id}`, "Relevé demandé", `Relevé tonnage demandé : ${quay.name}`)} />)}
            </div>
          </Panel>
        </Band>

        <Band index="06" label="Programmes et moyens" title="Budgets, ressources et programmes régionaux" subtitle="Chaque ligne appartient au périmètre filtré.">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Budgets à suivre" subtitle="Par quai">
              <Table headers={["Quai", "Programme", "Exécution", "Financement", "Action"]} rows={topPriority.map((quay) => [quay.name, `${quay.programs} programme(s)`, `${quay.budgetExecution}%`, quay.pendingFunding, <button key={quay.id} onClick={() => prepareNote(quay)} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Arbitrage</button>])} />
            </Panel>
            <Panel title="Ressources et infrastructures" subtitle="Disponibilité simulée">
              <Table headers={["Quai", "Ressources", "Statut", "Action"]} rows={filteredQuays.slice(0, 7).map((quay) => [quay.name, quay.resources.join(", "), statuses[`resource-${quay.id}`] ?? "À suivre", <button key={quay.id} onClick={() => addAction(`resource-${quay.id}`, "Maintenance demandée", `Maintenance demandée : ${quay.name}`)} className="rounded-full bg-teal-600 px-3 py-1.5 text-xs font-black text-white">Maintenance</button>])} />
            </Panel>
          </div>
        </Band>

        <Band index="07" label="Alertes terrain et incidents opérationnels" title="Espèces sensibles, conflits et plaintes" subtitle="Les signaux restent prudents : données mockées et vérification requise.">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Espèces sensibles" subtitle="À surveiller">
              <InfoHint text={infoCopy.species} />
              <div className={`mt-3 grid gap-3 ${focus === "species" ? "rounded-3xl bg-amber-50 p-3 ring-2 ring-amber-300" : ""}`}>
                {(speciesSignals.length ? speciesSignals : filteredQuays.slice(0, 2).map((quay) => ({ quay, species: "Aucune alerte" }))).slice(0, 6).map(({ quay, species }) => <SignalCard key={`${quay.id}-${species}`} title={species} meta={`${quay.name} · ${quay.region}`} status={quay.tension} action="Demander vérification avant décision" onClick={() => addAction(`species-${quay.id}-${species}`, "Vérification demandée", `Espèce à vérifier : ${species} à ${quay.name}`)} />)}
              </div>
            </Panel>
            <Panel title="Conflits et plaintes" subtitle="Déclarations terrain">
              <InfoHint text={infoCopy.alerts} />
              <div className={focus === "complaints" ? "mt-3 rounded-3xl bg-rose-50 p-3 ring-2 ring-rose-300" : "mt-3"}>
                <Table headers={["Quai", "Plaintes", "Incidents", "Statut", "Action"]} rows={alertQuays.slice(0, 7).map((quay) => [quay.name, String(quay.conflicts), String(quay.incidents), statuses[`complaint-${quay.id}`] ?? quay.tension, <button key={quay.id} onClick={() => addAction(`complaint-${quay.id}`, "À arbitrer", `Plainte ouverte pour arbitrage : ${quay.name}`)} className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 text-xs font-black text-white">Arbitrer</button>])} />
              </div>
            </Panel>
          </div>
        </Band>

        <Band index="08" label="Coordination terrain" title="Référents et actions suivies" subtitle="Les référents sont des points d’ancrage terrain, pas des contacts CRM.">
          <div className="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
            <Panel title="Référents par quai" subtitle={formatRegion(selectedRegion)}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredQuays.slice(0, 9).map((quay) => <ReferentCard key={quay.id} quay={quay} status={statuses[`report-${quay.id}`] ?? "Disponible"} onReport={() => addAction(`report-${quay.id}`, "Compte rendu demandé", `Compte rendu demandé : ${quay.name}`)} />)}
              </div>
            </Panel>
            <Panel title="Actions en attente" subtitle="Traces visibles">
              <div className="grid gap-2">
                {trace.slice(0, 8).map((item, index) => <div key={`${item}-${index}`} className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 p-3 text-sm font-bold text-slate-700">{item}</div>)}
              </div>
            </Panel>
          </div>
        </Band>

        <Band index="09" label="Preuves, notes et traces" title="Décision documentée" subtitle="Les preuves et brouillons suivent le périmètre régional ou le quai actif.">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <Panel title="Preuves disponibles" subtitle={formatRegion(selectedRegion)}>
              <InfoHint text={infoCopy.proofs} />
              <Table headers={["Quai", "Niveau", "Preuves", "Décision"]} rows={filteredQuays.slice(0, 8).map((quay) => [quay.name, quay.proofLevel, String(quay.proofs), quay.recommendedAction])} />
            </Panel>
            <Panel title="Note et comparaison" subtitle="Brouillon visible">
              <p className="rounded-2xl bg-cyan-50 p-3 text-sm font-bold leading-6 text-cyan-950">{note}</p>
              {comparison && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold leading-6 text-amber-950">{comparison}</p>}
            </Panel>
          </div>
        </Band>

        <Band index="10" label="IA Mbàmbulaan gouvernée" title="IA actionnable, jamais décisionnaire" subtitle="Chaque suggestion déclenche un brouillon, une trace ou un focus visible.">
          <div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]">
            <Panel title="Gouvernance IA" subtitle="Activable, contrôlée, simulée">
              <InfoHint text={infoCopy.ai} />
              <button onClick={() => setAiEnabled((enabled) => !enabled)} className={`mt-3 flex w-full items-center justify-between rounded-2xl p-3 text-left ${aiEnabled ? "bg-emerald-50 text-emerald-950" : "bg-slate-100 text-slate-600"}`}>
                <span><span className="block text-sm font-black">Activer IA Mbàmbulaan</span><span className="block text-xs font-semibold">{aiEnabled ? "Enrichit synthèses, alertes et notes." : "Mode manuel : données et actions disponibles sans assistance IA."}</span></span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black">{aiEnabled ? "Activée" : "Désactivée"}</span>
              </button>
              <div className="mt-3 grid gap-2">{aiCapabilitiesList.map((name) => <label key={name} className={`flex items-center justify-between rounded-2xl border p-3 text-sm font-black ${aiEnabled ? "border-cyan-100 bg-white text-slate-800" : "border-slate-100 bg-slate-50 text-slate-400"}`}><span>{name}</span><input type="checkbox" checked={aiCaps[name]} disabled={!aiEnabled} onChange={() => setAiCaps((items) => ({ ...items, [name]: !items[name] }))} className="h-4 w-4 accent-cyan-700" /></label>)}</div>
            </Panel>
            <Panel title="Suggestions IA actionnables" subtitle="Simulation MVP">
              <p className="rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950">{aiInsight}</p>
              {aiEnabled ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {aiCaps["Notes"] && <AiSuggestion title={`Préparer une note sur ${activeQuay.name}`} action="Générer brouillon" onClick={() => runAiSuggestion("note", activeQuay)} />}
                  {aiCaps["Alertes"] && <AiSuggestion title={`Vérifier une espèce sensible à ${activeQuay.name}`} action="Demander vérification" onClick={() => runAiSuggestion("verify", activeQuay)} />}
                  {aiCaps["Synthèse"] && <AiSuggestion title="Comparer les volumes des quais affichés" action="Voir comparaison" onClick={() => runAiSuggestion("compare")} />}
                  {aiCaps["Recherche assistée"] && <AiSuggestion title={`Ouvrir les plaintes de ${activeQuay.region}`} action="Ouvrir plaintes" onClick={() => runAiSuggestion("complaints", activeQuay)} />}
                </div>
              ) : (
                <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-black text-slate-600">Mode manuel : les données, actions et traces restent disponibles sans assistance IA.</p>
              )}
              <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-black leading-5 text-amber-950">IA simulée - données mockées. L'humain valide chaque décision.</p>
            </Panel>
          </div>
        </Band>
      </section>
    </main>
  );
}

function HeroPanel({ context, aiInsight }: { context: string; aiInsight: string }) {
  return <section className="rounded-[2rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-6 text-white shadow-xl shadow-cyan-950/10"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">Lecture institutionnelle · {context}</p><h2 className="mt-3 max-w-4xl text-3xl font-black tracking-tight sm:text-5xl">Voir les régions, identifier les quais prioritaires, déclencher l’action et conserver la trace.</h2><p className="mt-5 max-w-3xl rounded-2xl bg-white/10 p-4 text-sm font-bold leading-6 text-white/78 ring-1 ring-white/10">{aiInsight}</p></section>;
}

function Band({ index, label, title, subtitle, children }: { index: string; label: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="relative grid gap-5 rounded-[2.35rem] border border-cyan-100/80 bg-white/66 p-4 shadow-sm shadow-cyan-950/5 backdrop-blur sm:p-6"><div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" /><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{index} · {label}</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2></div><p className="max-w-2xl text-sm font-semibold leading-6 text-slate-600">{subtitle}</p></div>{children}</section>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[1.75rem] border border-cyan-100 bg-white/92 p-5 shadow-sm shadow-cyan-950/5"><div className="mb-5"><h3 className="text-lg font-black text-slate-950">{title}</h3><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700/70">{subtitle}</p></div>{children}</section>;
}

function InfoHint({ text }: { text: string }) {
  return <span className="group relative inline-flex"><span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-50 text-[0.7rem] font-black text-cyan-800 ring-1 ring-cyan-200">i</span><span className="pointer-events-none absolute left-0 top-7 z-10 hidden w-64 rounded-2xl bg-cyan-950 p-3 text-xs font-semibold leading-5 text-white shadow-xl group-hover:block">{text}</span></span>;
}

function Chip({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700/70">{label}</p><InfoHint text={hint} /></div><p className="mt-2 text-2xl font-black text-cyan-950">{value}</p></div>;
}

function RegionSelector({ selected, onSelect }: { selected: MinistryRegionName; onSelect: (region: MinistryRegionName) => void }) {
  return <select value={selected} onChange={(event) => onSelect(event.target.value as MinistryRegionName)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">{ministryRegions.map((region) => <option key={region} value={region}>{formatRegion(region)}</option>)}</select>;
}

function QuayLine({ quay, onSelect }: { quay: MinistryRegionalQuay; onSelect: () => void }) {
  return <button onClick={onSelect} className="grid gap-2 rounded-2xl bg-gradient-to-r from-cyan-50 to-emerald-50 p-3 text-left"><span className="flex items-center justify-between text-sm font-black text-slate-800"><span>{quay.name}</span><span>{quay.priorityScore}/100</span></span><span className="h-2 overflow-hidden rounded-full bg-white"><span className={`block h-full rounded-full ${tensionColor(quay.tension)}`} style={{ width: `${quay.priorityScore}%` }} /></span></button>;
}

function KpiQuayCard({ quay, onSelect }: { quay: MinistryRegionalQuay; onSelect: () => void }) {
  return <button onClick={onSelect} className="rounded-[1.25rem] border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-4 text-left shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-lg font-black text-slate-950">{quay.name}</p><p className="text-xs font-bold text-slate-500">{quay.region}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ring-1 ${tensionBadge(quay.tension)}`}>{quay.tension}</span></div><p className="mt-4 text-3xl font-black text-cyan-950">{quay.priorityScore}</p><p className="text-xs font-bold text-slate-500">priorité · {quay.tonnage} t · {quay.incidents + quay.conflicts} alerte(s)</p></button>;
}

function Radial({ label, value, hint }: { label: string; value: number; hint: string }) {
  return <div className="rounded-[1.35rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-4 text-cyan-950"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">{label}</p><InfoHint text={hint} /></div><div className="mt-4 flex items-center gap-4"><div className="grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(#0891b2 ${value * 3.6}deg, rgba(255,255,255,.85) 0deg)` }}><div className="grid h-14 w-14 place-items-center rounded-full bg-white text-sm font-black">{value}</div></div><p className="text-sm font-bold text-slate-600">Score simulé pour guider l’attention, pas pour décider automatiquement.</p></div></div>;
}

function Spark({ label, quays, max, hint }: { label: string; quays: MinistryRegionalQuay[]; max: number; hint: string }) {
  return <div className="rounded-[1.35rem] border border-cyan-100 bg-white/80 p-4 text-cyan-950"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">{label}</p><InfoHint text={hint} /></div><div className="mt-4 flex h-24 items-end gap-2">{quays.slice(0, 6).map((quay) => <div key={quay.id} className="flex flex-1 flex-col items-center gap-2"><span className="w-full rounded-t bg-gradient-to-t from-cyan-700 to-teal-400" style={{ height: `${22 + (quay.tonnage / max) * 70}%` }} /><span className="max-w-16 truncate text-[0.62rem] font-black text-slate-500">{quay.name}</span></div>)}</div></div>;
}

function Bars({ quays, max }: { quays: MinistryRegionalQuay[]; max: number }) {
  return <div className="grid gap-3">{quays.map((quay) => <div key={quay.id} className="grid gap-2"><div className="flex items-center justify-between text-sm font-black text-slate-700"><span>{quay.name}</span><span>{quay.tonnage} t</span></div><div className="h-3 overflow-hidden rounded-full bg-cyan-50"><div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-400" style={{ width: `${Math.max(12, (quay.tonnage / max) * 100)}%` }} /></div></div>)}</div>;
}

function SeafoodCard({ quay, onAction }: { quay: MinistryRegionalQuay; onAction: () => void }) {
  return <article className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-emerald-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-black">{quay.name}</p><p className="text-xs font-bold text-slate-500">{quay.landings} débarquements · {quay.sevenDayVariation}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ring-1 ${tensionBadge(quay.tension)}`}>{quay.tension}</span></div><p className="mt-3 text-2xl font-black text-cyan-950">{quay.tonnage} t</p><p className="mt-2 text-xs font-semibold leading-5 text-slate-600">{quay.mainSpecies.join(", ")}</p><button onClick={onAction} className="mt-4 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Demander relevé</button></article>;
}

function SignalCard({ title, meta, status, action, onClick }: { title: string; meta: string; status: string; action: string; onClick: () => void }) {
  return <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-cyan-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-black text-slate-950">{title}</p><p className="mt-1 text-xs font-bold text-slate-500">{meta}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ring-1 ${tensionBadge(status)}`}>{status}</span></div><p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{action}</p><button onClick={onClick} className="mt-4 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Vérifier</button></div>;
}

function ReferentCard({ quay, status, onReport }: { quay: MinistryRegionalQuay; status: string; onReport: () => void }) {
  return <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{quay.referents[0]}</p><p className="text-xs font-semibold text-slate-500">{quay.name} · {quay.region}</p></div><span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-black text-cyan-900">{status}</span></div><p className="mt-2 text-xs font-bold text-slate-600">{quay.recommendedAction}</p><button onClick={onReport} className="mt-3 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Compte rendu</button></div>;
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="overflow-x-auto rounded-2xl border border-cyan-100"><table className="w-full min-w-[44rem] text-left text-sm"><thead className="bg-cyan-50 text-xs uppercase tracking-[0.12em] text-cyan-900"><tr>{headers.map((header) => <th key={header} className="p-3 font-black">{header}</th>)}</tr></thead><tbody className="divide-y divide-cyan-50 bg-white">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 font-semibold text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function ActionBar({ primary, secondary, onPrimary, onSecondary }: { primary: string; secondary: string[]; onPrimary: () => void; onSecondary: (item: string) => void }) {
  return <div className="mt-4 flex flex-wrap gap-2"><button onClick={onPrimary} className="rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-4 py-2 text-sm font-black text-white shadow-sm shadow-cyan-900/15">{primary}</button>{secondary.map((item) => <button key={item} onClick={() => onSecondary(item)} className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-950 transition hover:border-teal-300 hover:bg-teal-50">{item}</button>)}</div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-cyan-50 py-2 text-sm font-bold"><span className="text-slate-500">{label}</span><span className="text-right text-slate-950">{value}</span></div>;
}

function AiSuggestion({ title, action, onClick }: { title: string; action: string; onClick: () => void }) {
  return <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-4"><p className="text-sm font-black text-slate-900">{title}</p><button onClick={onClick} className="mt-3 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">{action}</button></div>;
}
