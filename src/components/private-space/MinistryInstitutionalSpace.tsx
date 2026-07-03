"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ministryRegionalQuays, ministryRegions, type MinistryRegionName, type MinistryRegionalQuay } from "@/data/ministryRegionalSpace";

const aiCapabilities = ["Synthèse", "Alertes", "Notes", "Recherche assistée"] as const;
const navItems = [
  ["territoire", "Lecture territoriale"],
  ["synthese", "Synthèse"],
  ["production", "Production & alertes"],
  ["programmes", "Programmes"],
  ["coordination", "Coordination"],
  ["traces", "Traces"],
  ["assistance", "IA & veille"]
] as const;
const hints = {
  region: "Ce filtre pilote toute la page. En mode région, aucun quai hors région n’apparaît.",
  score: "Score simulé de priorité d’attention. Il aide à orienter le regard, sans automatiser la décision.",
  volume: "Volumes déclarés localement pour la journée, par quai ou par région.",
  alertes: "Tensions, incidents et plaintes remontés par les relais terrain.",
  note: "Brouillon de travail. Il devient utile seulement après validation humaine.",
  pieces: "Justificatifs, comptes rendus, confirmations référents et pièces de suivi.",
  ia: "IA simulée sur données mockées. L’humain valide chaque décision.",
  veille: "Signaux mockés de contexte filière. Aucune actualité réelle ni API externe.",
  referents: "Points d’ancrage terrain pour vérifier, coordonner ou documenter une action."
};
const watchSignals = [
  ["Chaîne froid à surveiller sur les quais à fort volume", "Ressources", "Tout", "attention", "Synthèse mockée Mbàmbulaan"],
  ["Signal de tension sur les débarquements urbains", "Tension terrain", "Dakar", "attention", "Relais terrain mock"],
  ["Volumes saisonniers à documenter sur Guet Ndar", "Production", "Saint-Louis", "info", "Point régional mock"],
  ["Espèce à surveiller sur Petite-Côte", "Espèces sensibles", "Thiès", "critique", "Signal qualité mock"],
  ["Besoin de pièces programme pour froid mobile", "Programme public", "Fatick", "attention", "Programme mock"],
  ["Hygiène et qualité à vérifier sur flux crevette", "Hygiène et qualité", "Ziguinchor", "attention", "Contrôle mock"],
  ["Météo maritime simulée : lecture prudente des sorties", "Météo maritime mockée", "Louga", "info", "Scénario mock"],
  ["Signal marché sur flux fluvial", "Marché", "Kaolack", "info", "Veille mock"]
] as const;

const fmt = (region: MinistryRegionName) => region === "Tout" ? "Toutes les régions" : region;
const sum = (quays: MinistryRegionalQuay[], key: "tonnage" | "landings" | "incidents" | "conflicts" | "proofs") => quays.reduce((total, quay) => total + quay[key], 0);
const tensionColor = (level: string) => level === "Critique" ? "bg-rose-500" : level === "Forte" ? "bg-amber-400" : level === "Moyenne" ? "bg-yellow-300" : "bg-emerald-400";
const badgeTone = (level: string) => level === "Critique" ? "bg-rose-100 text-rose-950 ring-rose-200" : level === "Forte" ? "bg-amber-100 text-amber-950 ring-amber-200" : level === "Moyenne" ? "bg-yellow-100 text-yellow-950 ring-yellow-200" : "bg-emerald-100 text-emerald-950 ring-emerald-200";

export function MinistryInstitutionalSpace() {
  const [region, setRegion] = useState<MinistryRegionName>("Tout");
  const [quayId, setQuayId] = useState("th-joal");
  const [aiEnabled, setAiEnabled] = useState(true);
  const [capabilities, setCapabilities] = useState(Object.fromEntries(aiCapabilities.map((capability) => [capability, capability !== "Recherche assistée"])) as Record<(typeof aiCapabilities)[number], boolean>);
  const [trace, setTrace] = useState<string[]>(["Session ouverte : vision nationale multi-régions."]);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [note, setNote] = useState("Aucune note préparée.");
  const [noteStatus, setNoteStatus] = useState("Aucune note ouverte");
  const [message, setMessage] = useState("IA simulée - données mockées. L'humain valide chaque décision.");
  const [focus, setFocus] = useState("");

  const quays = useMemo(() => ministryRegionalQuays.filter((quay) => region === "Tout" || quay.region === region), [region]);
  const active = quays.find((quay) => quay.id === quayId) ?? quays[0] ?? ministryRegionalQuays[0];
  const priorityQuays = [...quays].sort((a, b) => b.priorityScore - a.priorityScore);
  const volumeQuays = [...quays].sort((a, b) => b.tonnage - a.tonnage);
  const alertQuays = quays.filter((quay) => quay.incidents + quay.conflicts > 0).sort((a, b) => b.incidents + b.conflicts - (a.incidents + a.conflicts));
  const speciesSignals = quays.flatMap((quay) => quay.sensitiveSpecies.filter((species) => species !== "Aucune alerte").map((species) => ({ quay, species })));
  const visibleWatch = watchSignals.filter((signal) => signal[2] === "Tout" || region === "Tout" || signal[2] === region);
  const maxTonnage = Math.max(...volumeQuays.map((quay) => quay.tonnage), 1);
  const scopeLabel = fmt(region);
  const currentPriority = priorityQuays[0];

  function log(text: string) {
    setTrace((items) => [text, ...items].slice(0, 9));
  }

  function act(id: string, label: string, text: string) {
    setStatus((items) => ({ ...items, [id]: label }));
    log(text);
    setMessage(`${text}. Simulation MVP - action non connectée au backend.`);
  }

  function chooseRegion(next: MinistryRegionName) {
    const firstQuay = ministryRegionalQuays.find((quay) => next === "Tout" || quay.region === next);
    setRegion(next);
    setQuayId(firstQuay?.id ?? ministryRegionalQuays[0].id);
    setFocus("");
    log(`Lecture territoriale appliquée : ${fmt(next)}.`);
  }

  function prepareNote(quay = active, title = "Note d’arbitrage") {
    const mode = aiEnabled && capabilities.Notes ? "Brouillon assisté" : "Brouillon manuel";
    setNote(`${mode} - ${title}
Contexte : ${quay.name} (${quay.region}) · ${quay.tonnage} t · ${quay.landings} débarquement(s).
Problème observé : tension ${quay.tension}, ${quay.incidents} incident(s), ${quay.conflicts} plainte(s), justificatif ${quay.proofLevel}.
Données utiles : ${quay.mainSpecies.join(", ")} · financement ${quay.pendingFunding} · ressources ${quay.resources.join(", ")}.
Référent à mobiliser : ${quay.referents[0]}.
Justificatifs manquants : compte rendu terrain, confirmation référent, pièce programme ou relevé tonnage.
Prochaine action : ${quay.recommendedAction}
Statut : Brouillon à valider.`);
    setNoteStatus("Brouillon à valider");
    act(`note-${quay.id}`, "Brouillon à valider", `Note d’arbitrage préparée pour ${quay.name}`);
  }

  function noteAction(action: string) {
    const label = action === "Valider le brouillon" ? "Brouillon validé par utilisateur" : action === "Complément terrain" ? "Complément terrain demandé" : action === "Affecter référent" ? `Affecté à ${active.referents[0]}` : "Export de note simulé";
    setNoteStatus(label);
    act(`note-${action}-${active.id}`, label, `${label} · ${active.name}`);
  }

  function runSuggestion(kind: "note" | "verify" | "compare" | "complaints") {
    if (kind === "note") return prepareNote(active, `Point d’attention ${active.name}`);
    if (kind === "verify") {
      setFocus("species");
      return act(`verify-${active.id}`, "Vérification demandée", `Vérification terrain demandée sur ${active.name}`);
    }
    if (kind === "compare") return log(`Comparaison affichée : ${volumeQuays[0]?.name ?? active.name} / ${volumeQuays[1]?.name ?? active.name}.`);
    setFocus("complaints");
    return act(`complaints-${active.id}`, "Plaintes ouvertes", `Focus plaintes et conflits activé pour ${active.region}`);
  }

  const aiSummary = aiEnabled && capabilities.Synthèse
    ? `${scopeLabel} : ${quays.length} quai(s), ${sum(quays, "tonnage").toFixed(1)} t, ${alertQuays.length} quai(s) avec alerte. Priorité : ${currentPriority?.name ?? active.name}.`
    : "Mode manuel : lire, filtrer, agir, préparer une note et tracer restent disponibles sans assistance IA.";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbfa_0%,#f7fbf8_50%,#fffaf0_100%)] text-slate-950">
      <header className="border-b border-slate-200 bg-white/95 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-[86rem] flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministère des Pêches · espace privé</p>
              <h1 className="text-2xl font-black tracking-tight">Espace institutionnel de lecture régionale</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => prepareNote(active, "Point de coordination")} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Préparer le point de coordination</button>
            <button onClick={() => act(`export-${region}`, "Synthèse exportée", `Synthèse exportée : ${scopeLabel}`)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">Exporter la synthèse</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[86rem] gap-6 px-5 py-8 sm:px-8">
        <nav className="sticky top-0 z-20 rounded-[1.75rem] border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
          <div className="flex gap-2 overflow-x-auto">
            {navItems.map(([href, label]) => (
              <a key={href} href={`#${href}`} className="whitespace-nowrap rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-950">
                {label}
              </a>
            ))}
          </div>
        </nav>

        <Band id="territoire" n="01" l="Lecture territoriale" t="Choisir la région, puis le quai de travail" s="Le filtre Région / Tout pilote toute la page. La synthèse suivante dépend directement de cette lecture.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ministryRegions.map((item) => (
              <button key={item} onClick={() => chooseRegion(item)} className={`rounded-[1.2rem] border p-4 text-left transition ${region === item ? "border-cyan-500 bg-cyan-700 text-white shadow-md" : "border-slate-200 bg-white text-cyan-950 hover:border-cyan-200 hover:bg-cyan-50/60"}`}>
                <span className="block text-base font-black">{fmt(item)}</span>
                <span className="mt-2 block text-xs font-black uppercase">{item === "Tout" ? ministryRegionalQuays.length : ministryRegionalQuays.filter((quay) => quay.region === item).length} quai(s)</span>
              </button>
            ))}
          </div>
          <Panel title="Quai de travail" subtitle="Sélection dans le périmètre actif" hint={hints.region}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-sm font-semibold text-slate-600"><span className="block text-lg font-black text-slate-950">{active.name}</span>{active.region} · {active.commune} · {active.lat}, {active.lng}</p>
              <select value={active.id} onChange={(event) => setQuayId(event.target.value)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">
                {quays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}
              </select>
            </div>
          </Panel>
        </Band>

        <Band id="synthese" n="02" l="Synthèse de pilotage" t={`Synthèse exécutive · ${scopeLabel}`} s={`Lecture adaptée au filtre actif : ${scopeLabel}.`}>
          <div className="rounded-[2rem] border border-cyan-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <div className="flex gap-2"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Lecture active · {region === "Tout" ? "vision multi-régions" : `région ${region}`}</p><Hint text="La synthèse réagit immédiatement au filtre territorial." /></div>
                <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Ce qu’il faut regarder maintenant</h2>
                <p className="mt-4 max-w-2xl text-sm font-bold text-slate-600">{currentPriority ? `${currentPriority.name} : ${currentPriority.tension.toLowerCase()}, ${currentPriority.incidents + currentPriority.conflicts} alerte(s), ${currentPriority.pendingFunding} à suivre.` : "Aucun quai prioritaire dans la sélection."}</p>
              </div>
              <p className="max-w-md rounded-2xl bg-cyan-50 p-4 text-sm font-bold text-cyan-950 ring-1 ring-cyan-100">Dernier point de coordination : {trace[0]}</p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Quais visibles" value={String(quays.length)} hint={hints.region} />
              <Metric label="Tonnage du jour" value={`${sum(quays, "tonnage").toFixed(1)} t`} hint={hints.volume} />
              <Metric label="Débarquements" value={String(sum(quays, "landings"))} hint="Nombre de débarquements déclarés dans le périmètre actif." />
              <Metric label="Alertes ouvertes" value={String(sum(quays, "incidents"))} hint={hints.alertes} />
              <Metric label="Plaintes / conflits" value={String(sum(quays, "conflicts"))} hint="Points pouvant demander un arbitrage humain." />
              <Metric label="Actions en attente" value={String(Object.keys(status).length)} hint="Actions ouvertes à suivre." />
              <Metric label="Justificatifs" value={String(sum(quays, "proofs"))} hint={hints.pieces} />
              <Metric label="Note active" value={noteStatus} hint={hints.note} small />
            </div>
          </div>
          <div className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
            <Panel title="Quais à regarder en priorité" subtitle="Classement sans moyenne réductrice" hint={hints.score}>
              {priorityQuays.slice(0, 5).map((quay) => <QuayLine key={quay.id} quay={quay} onClick={() => setQuayId(quay.id)} />)}
            </Panel>
            <Panel title={`Quai actif : ${active.name}`} subtitle={`${active.region} · ${active.commune}`} hint="Fiche courte pour décider l’action suivante.">
              <Row label="Niveau de vigilance" value={active.tension} />
              <Row label="Urgence opérationnelle" value={`${active.priorityScore}/100 · simulation`} />
              <Row label="Pêches du jour" value={`${active.tonnage} t · ${active.landings} débarquements`} />
              <Row label="Action recommandée" value={active.recommendedAction} />
              <Actions primary="Prioriser ce quai" secondary={["Vérifier terrain", "Préparer note"]} onAction={(action) => action.includes("note") ? prepareNote(active) : act(`${action}-${active.id}`, action, `${action} : ${active.name}`)} />
            </Panel>
          </div>
        </Band>

        <Band id="production" n="03" l="Production et alertes" t="Production, carte et signaux critiques" s="Les volumes, points de carte, espèces sensibles et incidents respectent le filtre régional.">
          <div className="grid gap-4 xl:grid-cols-[1fr_23rem]">
            <Panel title="Carte stylisée des quais" subtitle={`${quays.length} point(s) affiché(s)`} hint="Coordonnées mockées, sans API externe.">
              <div className="relative min-h-[29rem] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.10),transparent_30%),linear-gradient(140deg,#ffffff,#edf8f6_52%,#fff7e8)]">
                <div className="absolute left-[25%] top-8 h-[86%] w-10 rounded-full border-l-4 border-cyan-200/70" />
                {quays.map((quay) => <button key={quay.id} onClick={() => setQuayId(quay.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg ${active.id === quay.id ? "h-11 w-11 ring-4 ring-cyan-900/20" : "h-7 w-7"} ${tensionColor(quay.tension)}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} />)}
                {quays.map((quay) => <span key={`${quay.id}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-black text-slate-700" style={{ left: `${quay.x}%`, top: `calc(${quay.y}% + 1.35rem)` }}>{quay.name}</span>)}
              </div>
            </Panel>
            <Panel title="Indicateurs du quai actif" subtitle={active.name} hint={hints.score}>
              <Gauge label="Priorité d’attention" value={active.priorityScore} />
              <Gauge label="Exécution budget" value={active.budgetExecution} />
              <Row label="Financement" value={active.pendingFunding} />
              <Row label="Ressources" value={active.resources.join(", ")} />
            </Panel>
          </div>
          <Panel title="Pêches du jour" subtitle={scopeLabel} hint={hints.volume}>
            <Bars quays={volumeQuays.slice(0, 6)} max={maxTonnage} />
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {volumeQuays.slice(0, 6).map((quay) => <Seafood key={quay.id} quay={quay} onClick={() => act(`tonnage-${quay.id}`, "Relevé demandé", `Relevé tonnage demandé : ${quay.name}`)} />)}
            </div>
          </Panel>
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <Panel title="Espèces sensibles" subtitle="Signaux à vérifier" hint="Signal à vérifier avant décision. Données mockées.">
              {(speciesSignals.length ? speciesSignals : quays.slice(0, 2).map((quay) => ({ quay, species: "Aucune alerte" }))).slice(0, 6).map(({ quay, species }) => (
                <Signal key={`${quay.id}-${species}`} quay={quay} label={species} focus={focus === "species"} onAction={(action) => action === "Créer note" ? prepareNote(quay, `Note de vigilance ${species}`) : act(`${action}-${quay.id}-${species}`, action, `${action} : ${species} · ${quay.name}`)} />
              ))}
            </Panel>
            <Panel title="Conflits et plaintes" subtitle="Déclarations terrain" hint="Plaintes et conflits demandant vérification, affectation ou arbitrage.">
              <Table headers={["Quai", "Plaintes", "Incidents", "Statut", "Action"]} rows={alertQuays.slice(0, 7).map((quay) => [quay.name, String(quay.conflicts), String(quay.incidents), status[`complaint-${quay.id}`] ?? quay.tension, <SmallButton key={quay.id} onClick={() => act(`complaint-${quay.id}`, "À arbitrer", `Plainte ouverte pour arbitrage : ${quay.name}`)}>Arbitrer</SmallButton>])} />
            </Panel>
          </div>
        </Band>

        <Band id="programmes" n="04" l="Programmes et moyens" t="Budgets, ressources et programmes régionaux" s="Chaque ligne appartient au périmètre filtré.">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Budgets à suivre" subtitle="Par quai" hint="Dossiers où une justification ou une pièce peut être demandée.">
              <Table headers={["Quai", "Programme", "Exécution", "Financement", "Action"]} rows={priorityQuays.slice(0, 7).map((quay) => [quay.name, `${quay.programs} programme(s)`, `${quay.budgetExecution}%`, quay.pendingFunding, <SmallButton key={quay.id} onClick={() => prepareNote(quay)}>Arbitrage</SmallButton>])} />
            </Panel>
            <Panel title="Ressources et infrastructures" subtitle="Disponibilité simulée" hint="Moyens humains, matériels et infrastructures liés aux quais visibles.">
              <Table headers={["Quai", "Ressources", "Statut", "Action"]} rows={quays.slice(0, 7).map((quay) => [quay.name, quay.resources.join(", "), status[`resource-${quay.id}`] ?? "À suivre", <SmallButton key={quay.id} onClick={() => act(`resource-${quay.id}`, "Maintenance demandée", `Maintenance demandée : ${quay.name}`)}>Maintenance</SmallButton>])} />
            </Panel>
          </div>
        </Band>

        <Band id="coordination" n="05" l="Coordination terrain" t="Référents et actions suivies" s="Les référents sont des points d’ancrage terrain, pas des contacts CRM.">
          <div className="grid gap-4 xl:grid-cols-[1fr_0.72fr]">
            <Panel title="Référents par quai" subtitle={scopeLabel} hint={hints.referents}>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {quays.slice(0, 9).map((quay) => <Referent key={quay.id} quay={quay} status={status[`report-${quay.id}`] ?? "Disponible"} onClick={() => act(`report-${quay.id}`, "Compte rendu demandé", `Compte rendu demandé : ${quay.name}`)} />)}
              </div>
            </Panel>
            <Panel title="Actions en attente" subtitle="Traces visibles" hint="Actions ouvertes à suivre, valider ou affecter.">
              <TraceList items={trace} message={message} />
            </Panel>
          </div>
        </Band>

        <Band id="traces" n="06" l="Justificatifs, notes et traces" t="Décision documentée" s="Les pièces de suivi et brouillons suivent le périmètre régional ou le quai actif.">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
            <Panel title="Justificatifs et traces" subtitle={scopeLabel} hint={hints.pieces}>
              <Table headers={["Quai", "Niveau", "Pièces", "Trace utile"]} rows={quays.slice(0, 8).map((quay) => [quay.name, quay.proofLevel, String(quay.proofs), quay.recommendedAction])} />
            </Panel>
            <Panel title="Note d’arbitrage" subtitle={noteStatus} hint={hints.note}>
              <p className="whitespace-pre-line rounded-2xl bg-cyan-50/80 p-3 text-sm font-bold leading-6 text-cyan-950">{note}</p>
              <Actions primary="Valider le brouillon" secondary={["Complément terrain", "Affecter référent", "Exporter note"]} onAction={noteAction} />
            </Panel>
          </div>
        </Band>

        <Band id="assistance" n="07" l="Assistance IA et veille" t="IA gouvernée et veille filière" s="La veille respecte le filtre Région / Tout. L’IA assiste, l’humain décide.">
          <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
            <Panel title="Gouvernance IA" subtitle="Activable, contrôlée, simulée" hint={hints.ia}>
              <button onClick={() => setAiEnabled((value) => !value)} className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ${aiEnabled ? "bg-emerald-50 text-emerald-950" : "bg-slate-100 text-slate-600"}`}>
                <span><span className="block text-sm font-black">Activer IA Mbàmbulaan</span><span className="block text-xs font-semibold">{aiEnabled ? "Enrichit synthèses, alertes et notes." : "Mode manuel complet."}</span></span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black">{aiEnabled ? "Activée" : "Désactivée"}</span>
              </button>
              <div className="mt-3 grid gap-2">
                {aiCapabilities.map((capability) => (
                  <label key={capability} className={`flex items-center justify-between rounded-2xl border p-3 text-sm font-black ${aiEnabled ? "border-cyan-100 bg-white" : "border-slate-100 bg-slate-50 text-slate-400"}`}>
                    <span>{capability}</span>
                    <input type="checkbox" checked={capabilities[capability]} disabled={!aiEnabled} onChange={() => setCapabilities((items) => ({ ...items, [capability]: !items[capability] }))} className="h-4 w-4 accent-cyan-700" />
                  </label>
                ))}
              </div>
              <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-black text-amber-950">IA simulée - données mockées. L'humain valide chaque décision.</p>
            </Panel>
            <Panel title="Suggestions et veille actionnables" subtitle={scopeLabel} hint={hints.veille}>
              <p className="rounded-2xl bg-cyan-50/80 p-3 text-sm font-bold text-cyan-950">{aiSummary}</p>
              {aiEnabled ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {capabilities.Notes && <Suggestion title={`Préparer une note sur ${active.name}`} actions={["Créer brouillon", "Ignorer"]} onAction={(action) => action === "Créer brouillon" ? runSuggestion("note") : log(`Suggestion ignorée : note ${active.name}.`)} />}
                  {capabilities.Alertes && <Suggestion title={`Vérifier une espèce sensible à ${active.name}`} actions={["Demander vérification", "Ignorer"]} onAction={(action) => action === "Demander vérification" ? runSuggestion("verify") : log(`Suggestion ignorée : vérification ${active.name}.`)} />}
                  {capabilities.Synthèse && <Suggestion title="Comparer les volumes des quais affichés" actions={["Comparer", "Ignorer"]} onAction={(action) => action === "Comparer" ? runSuggestion("compare") : log("Suggestion ignorée : comparaison volumes.")} />}
                  {capabilities["Recherche assistée"] && <Suggestion title={`Ouvrir les plaintes de ${active.region}`} actions={["Ouvrir plaintes", "Ignorer"]} onAction={(action) => action === "Ouvrir plaintes" ? runSuggestion("complaints") : log(`Suggestion ignorée : plaintes ${active.region}.`)} />}
                </div>
              ) : <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-black text-slate-600">Mode manuel : les filtres, actions, notes et traces restent disponibles.</p>}
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {visibleWatch.map((signal) => <WatchSignal key={`${signal[2]}-${signal[0]}`} signal={signal} aiEnabled={aiEnabled} onAction={(action) => {
                  if (action === "Inclure note") {
                    setNote(`Brouillon veille - ${signal[0]}
Catégorie : ${signal[1]}
Portée : ${signal[2] === "Tout" ? "national" : signal[2]}
Source : ${signal[4]}
Action proposée : relier ce signal à la synthèse ${scopeLabel}.
Statut : Brouillon à valider.`);
                    setNoteStatus("Brouillon veille à valider");
                  }
                  act(`watch-${signal[2]}-${signal[0]}-${action}`, "Veille ajoutée", `Veille filière : ${signal[0]} · ${action}`);
                }} />)}
              </div>
            </Panel>
          </div>
        </Band>
      </section>
    </main>
  );
}

function Band({ id, n, l, t, s, children }: { id: string; n: string; l: string; t: string; s: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 grid gap-5 rounded-[2rem] border border-slate-200/80 bg-white/85 p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{n} · {l}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{t}</h2>
        </div>
        <p className="max-w-xl text-sm font-semibold leading-6 text-slate-600">{s}</p>
      </div>
      {children}
    </section>
  );
}

function Panel({ title, subtitle, hint, children }: { title: string; subtitle: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.65rem] border border-slate-200 bg-white/95 p-5 shadow-sm">
      <div className="mb-5 flex justify-between gap-3">
        <div><h3 className="text-lg font-black">{title}</h3><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700/70">{subtitle}</p></div>
        {hint && <Hint text={hint} />}
      </div>
      {children}
    </section>
  );
}

function Hint({ text }: { text: string }) {
  return <span className="group relative inline-flex"><span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-50 text-[0.7rem] font-black text-cyan-800 ring-1 ring-cyan-200">i</span><span className="pointer-events-none absolute right-0 top-7 z-10 hidden w-64 rounded-2xl bg-cyan-950 p-3 text-xs font-semibold leading-5 text-white shadow-xl group-hover:block">{text}</span></span>;
}

function Metric({ label, value, hint, small }: { label: string; value: string; hint: string; small?: boolean }) {
  return <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4"><div className="flex justify-between gap-2"><p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p><Hint text={hint} /></div><p className={`${small ? "text-sm leading-5" : "text-2xl"} mt-2 font-black text-slate-950`}>{value}</p></div>;
}

function QuayLine({ quay, onClick }: { quay: MinistryRegionalQuay; onClick: () => void }) {
  return <button onClick={onClick} className="mb-2 grid w-full gap-2 rounded-2xl bg-slate-50 p-3 text-left ring-1 ring-slate-100"><span className="flex justify-between text-sm font-black"><span>{quay.name}</span><span>{quay.priorityScore}/100</span></span><span className="h-2 rounded-full bg-white"><span className={`block h-full rounded-full ${tensionColor(quay.tension)}`} style={{ width: `${quay.priorityScore}%` }} /></span></button>;
}

function Gauge({ label, value }: { label: string; value: number }) {
  const tone = value >= 80 ? "from-rose-500 to-orange-400" : value >= 65 ? "from-amber-400 to-yellow-300" : "from-emerald-400 to-teal-400";
  return <div className="mb-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100"><div className="flex items-end justify-between"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">{label}</p><p className="text-3xl font-black">{value}</p></div><div className="mt-3 h-3 rounded-full bg-white ring-1 ring-slate-100"><div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${value}%` }} /></div><p className="mt-2 text-xs font-bold text-slate-500">simulation · validation humaine</p></div>;
}

function Bars({ quays, max }: { quays: MinistryRegionalQuay[]; max: number }) {
  return <div className="grid gap-3">{quays.map((quay) => <div key={quay.id} className="grid gap-2"><div className="flex justify-between text-sm font-black"><span>{quay.name}</span><span>{quay.tonnage} t</span></div><div className="h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-400" style={{ width: `${Math.max(12, (quay.tonnage / max) * 100)}%` }} /></div></div>)}</div>;
}

function Seafood({ quay, onClick }: { quay: MinistryRegionalQuay; onClick: () => void }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex justify-between gap-3"><div><p className="font-black">{quay.name}</p><p className="text-xs font-bold text-slate-500">{quay.landings} débarquements · {quay.sevenDayVariation}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ring-1 ${badgeTone(quay.tension)}`}>{quay.tension}</span></div><p className="mt-3 text-2xl font-black text-cyan-950">{quay.tonnage} t</p><p className="mt-2 text-xs font-semibold text-slate-600">{quay.mainSpecies.join(", ")}</p><SmallButton onClick={onClick}>Demander relevé</SmallButton></article>;
}

function Signal({ quay, label, focus, onAction }: { quay: MinistryRegionalQuay; label: string; focus: boolean; onAction: (action: string) => void }) {
  return <div className={`mb-3 rounded-2xl border border-amber-100 bg-white p-4 ${focus ? "ring-2 ring-amber-300" : ""}`}><div className="flex justify-between gap-3"><div><p className="font-black">{label}</p><p className="text-xs font-bold text-slate-500">{quay.name} · {quay.region}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ring-1 ${badgeTone(quay.tension)}`}>{quay.tension}</span></div><p className="mt-3 text-sm font-semibold text-slate-600">Signal à vérifier · données mockées · vérification humaine requise.</p><Actions primary="Vérifier" secondary={["Créer note", "Ajouter trace"]} onAction={onAction} /></div>;
}

function Referent({ quay, status, onClick }: { quay: MinistryRegionalQuay; status: string; onClick: () => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"><div className="flex justify-between gap-3"><div><p className="text-sm font-black">{quay.referents[0]}</p><p className="text-xs font-semibold text-slate-500">{quay.name} · {quay.region}</p></div><span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-black text-cyan-900">{status}</span></div><p className="mt-2 text-xs font-bold text-slate-600">{quay.recommendedAction}</p><SmallButton onClick={onClick}>Compte rendu</SmallButton></div>;
}

function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="overflow-x-auto rounded-2xl border border-slate-200"><table className="w-full min-w-[44rem] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-cyan-900"><tr>{headers.map((header) => <th key={header} className="p-3 font-black">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white">{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 font-semibold text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Actions({ primary, secondary, onAction }: { primary: string; secondary: string[]; onAction: (action: string) => void }) {
  return <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => onAction(primary)} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">{primary}</button>{secondary.map((action) => <button key={action} onClick={() => onAction(action)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">{action}</button>)}</div>;
}

function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="mt-3 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">{children}</button>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm font-bold"><span className="text-slate-500">{label}</span><span className="text-right">{value}</span></div>;
}

function TraceList({ items, message }: { items: string[]; message: string }) {
  return <div><div className="grid gap-2">{items.map((item, index) => <p key={`${item}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">{item}</p>)}</div><p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-black text-amber-950">{message}</p></div>;
}

function Suggestion({ title, actions, onAction }: { title: string; actions: string[]; onAction: (action: string) => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm font-black">{title}</p><div className="mt-3 flex flex-wrap gap-2">{actions.map((action) => <button key={action} onClick={() => onAction(action)} className={`${action === "Ignorer" ? "border border-cyan-200 bg-white text-cyan-950" : "bg-cyan-700 text-white"} rounded-full px-3 py-1.5 text-xs font-black`}>{action}</button>)}</div></div>;
}

function WatchSignal({ signal, aiEnabled, onAction }: { signal: (typeof watchSignals)[number]; aiEnabled: boolean; onAction: (action: string) => void }) {
  const tone = signal[3] === "critique" ? "bg-rose-100 text-rose-950 ring-rose-200" : signal[3] === "attention" ? "bg-amber-100 text-amber-950 ring-amber-200" : "bg-cyan-100 text-cyan-950 ring-cyan-200";
  return <article className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex justify-between gap-3"><div><p className="text-sm font-black">{signal[0]}</p><p className="text-xs font-bold text-slate-500">{signal[1]} · {signal[2] === "Tout" ? "national" : signal[2]}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ring-1 ${tone}`}>{signal[3]}</span></div><p className="mt-3 text-xs font-semibold text-slate-600">Source mockée : {signal[4]}</p>{aiEnabled && <p className="mt-3 rounded-2xl bg-cyan-50/80 p-3 text-xs font-black text-cyan-950 ring-1 ring-cyan-100">Lecture IA : signal à relier à une note ou à une vérification humaine.</p>}<Actions primary="Ajouter à la synthèse" secondary={["Créer action", "Vérifier", "Inclure note"]} onAction={onAction} /></article>;
}
