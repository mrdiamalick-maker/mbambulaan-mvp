"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ministryRegionalQuays, ministryRegions, type MinistryRegionName, type MinistryRegionalQuay } from "@/data/ministryRegionalSpace";

const aiCapabilities = ["Synthèse", "Alertes", "Notes", "Recherche assistée"] as const;
const navItems = [
  ["territoire", "Lecture territoriale", "Choisir le périmètre", "≈"],
  ["synthese", "Synthèse de pilotage", "Décider quoi regarder", "◐"],
  ["production", "Production halieutique", "Volumes, espèces, tensions", "≋"],
  ["programmes", "Programmes et moyens", "Budgets, froid, ressources", "▦"],
  ["coordination", "Coordination terrain", "Référents, alertes, actions", "◎"],
  ["traces", "Notes et pièces de suivi", "Preuves et décisions", "◫"],
  ["veille", "Veille filière", "Signaux du moment", "◇"],
  ["ia", "IA Mbàmbulaan", "Assistance gouvernée", "✦"]
] as const;
type SectionId = (typeof navItems)[number][0];

const card = "min-w-0 overflow-hidden rounded-[1.65rem] border border-cyan-100 bg-white/90 p-5 shadow-sm";
const btn = "rounded-full bg-gradient-to-r from-cyan-700 via-teal-600 to-emerald-600 px-4 py-2 text-sm font-black text-white shadow-[0_12px_24px_rgba(8,145,178,0.18)]";
const softBtn = "rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-950 shadow-sm";
const hints = {
  region: "Ce filtre pilote toute la page. En mode région, aucun quai hors région n’apparaît.",
  volume: "Volumes déclarés localement pour la journée, par quai ou par région.",
  alertes: "Tensions, incidents et plaintes remontés par les relais terrain.",
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
const badgeTone = (level: string) => level === "Critique" || level === "critique" ? "border-rose-200 bg-rose-50 text-rose-950 before:bg-rose-500" : level === "Forte" || level === "attention" ? "border-amber-200 bg-amber-50 text-amber-950 before:bg-amber-500" : level === "Moyenne" ? "border-yellow-200 bg-yellow-50 text-yellow-950 before:bg-yellow-400" : level === "info" ? "border-cyan-200 bg-cyan-50 text-cyan-950 before:bg-cyan-500" : "border-emerald-200 bg-emerald-50 text-emerald-950 before:bg-emerald-500";

export function MinistryInstitutionalSpace() {
  const [region, setRegion] = useState<MinistryRegionName>("Tout");
  const [quayId, setQuayId] = useState("th-joal");
  const [activeSection, setActiveSection] = useState<SectionId>("territoire");
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
  const activeNav = navItems.find(([id]) => id === activeSection) ?? navItems[0];
  const aiSummary = aiEnabled && capabilities.Synthèse ? `${scopeLabel} : ${quays.length} quai(s), ${sum(quays, "tonnage").toFixed(1)} t, ${alertQuays.length} quai(s) avec alerte. Priorité : ${currentPriority?.name ?? active.name}.` : "Mode manuel : lire, filtrer, agir, préparer une note et tracer restent disponibles sans assistance IA.";

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
Prochaine action : ${quay.recommendedAction}
Statut : Brouillon à valider.`);
    setNoteStatus("Brouillon à valider");
    act(`note-${quay.id}`, "Brouillon à valider", `Note d’arbitrage préparée pour ${quay.name}`);
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

  const content: Record<SectionId, ReactNode> = {
    territoire: <View kicker="01 · Lecture territoriale" title="Choisir la région, puis le quai de travail" description="Le filtre Région / Tout pilote toute la page.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{ministryRegions.map((item) => <button key={item} onClick={() => chooseRegion(item)} className={`rounded-[1.2rem] border p-4 text-left transition ${region === item ? "border-cyan-500 bg-gradient-to-br from-cyan-700 via-teal-600 to-emerald-600 text-white shadow-md" : "border-cyan-100 bg-gradient-to-br from-white to-cyan-50/60 text-cyan-950 hover:border-cyan-300"}`}><b>{fmt(item)}</b><span className="mt-2 block text-xs font-black uppercase">{item === "Tout" ? ministryRegionalQuays.length : ministryRegionalQuays.filter((quay) => quay.region === item).length} quai(s)</span></button>)}</div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]"><Panel title="Carte stylisée des quais" subtitle={`${quays.length} point(s) affiché(s)`}><Map quays={quays} activeId={active.id} onSelect={setQuayId} /></Panel><Panel title="Quai de travail" subtitle={`${active.region} · ${active.commune}`}><select value={active.id} onChange={(event) => setQuayId(event.target.value)} className="w-full rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">{quays.map((quay) => <option key={quay.id} value={quay.id}>{quay.name}</option>)}</select><Row label="Localisation" value={`${active.lat}, ${active.lng}`} /><Row label="Action recommandée" value={active.recommendedAction} /><Actions primary="Prioriser ce quai" secondary={["Vérifier terrain", "Préparer note"]} onAction={(action) => action.includes("note") ? prepareNote(active) : act(`${action}-${active.id}`, action, `${action} : ${active.name}`)} /></Panel></div>
    </View>,
    synthese: <View kicker="02 · Synthèse de pilotage" title={`Synthèse exécutive · ${scopeLabel}`} description="Lecture adaptée au filtre actif.">
      <Panel title="Ce qu’il faut regarder maintenant" subtitle={scopeLabel}><div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between"><div><p className="text-3xl font-black sm:text-5xl">{currentPriority?.name ?? active.name}</p><p className="mt-3 text-sm font-bold text-slate-600">{currentPriority ? `${currentPriority.tension}, ${currentPriority.incidents + currentPriority.conflicts} alerte(s), ${currentPriority.pendingFunding} à suivre.` : "Aucun quai prioritaire dans la sélection."}</p></div><p className="max-w-md rounded-2xl bg-gradient-to-br from-cyan-700 to-teal-700 p-4 text-sm font-bold text-white">Dernier point : {trace[0]}</p></div></Panel>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Quais visibles" value={String(quays.length)} hint={hints.region} /><Metric label="Débarquements" value={String(sum(quays, "landings"))} hint="Nombre de débarquements déclarés." /><Metric label="Plaintes / conflits" value={String(sum(quays, "conflicts"))} hint="Points pouvant demander un arbitrage humain." /><Metric label="Justificatifs" value={String(sum(quays, "proofs"))} hint={hints.pieces} /></div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"><Panel title="Quais à regarder en priorité" subtitle="Classement sans moyenne réductrice">{priorityQuays.slice(0, 5).map((quay) => <QuayLine key={quay.id} quay={quay} onClick={() => setQuayId(quay.id)} />)}</Panel><Panel title={`Quai actif : ${active.name}`} subtitle={active.commune}><Gauge label="Priorité d’attention" value={active.priorityScore} /><Gauge label="Exécution budget" value={active.budgetExecution} /></Panel></div>
    </View>,
    production: <View kicker="03 · Production halieutique" title="Pêches du jour, espèces et alertes de production" description="Volumes, espèces sensibles et plaintes respectent le filtre régional.">
      <Panel title="Pêches du jour" subtitle={scopeLabel}><Bars quays={volumeQuays.slice(0, 6)} max={maxTonnage} /><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{volumeQuays.slice(0, 6).map((quay) => <Seafood key={quay.id} quay={quay} onClick={() => act(`tonnage-${quay.id}`, "Relevé demandé", `Relevé tonnage demandé : ${quay.name}`)} />)}</div></Panel>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"><Panel title="Espèces sensibles" subtitle="Signaux à vérifier">{(speciesSignals.length ? speciesSignals : quays.slice(0, 2).map((quay) => ({ quay, species: "Aucune alerte" }))).slice(0, 6).map(({ quay, species }) => <Signal key={`${quay.id}-${species}`} quay={quay} label={species} focus={focus === "species"} onAction={(action) => action === "Créer note" ? prepareNote(quay, `Note de vigilance ${species}`) : act(`${action}-${quay.id}-${species}`, action, `${action} : ${species} · ${quay.name}`)} />)}</Panel><Panel title="Conflits et plaintes" subtitle="Déclarations terrain"><Table headers={["Quai", "Plaintes", "Incidents", "Statut", "Action"]} rows={alertQuays.slice(0, 7).map((quay) => [quay.name, String(quay.conflicts), String(quay.incidents), status[`complaint-${quay.id}`] ?? quay.tension, <SmallButton key={quay.id} onClick={() => act(`complaint-${quay.id}`, "À arbitrer", `Plainte ouverte pour arbitrage : ${quay.name}`)}>Arbitrer</SmallButton>])} /></Panel></div>
    </View>,
    programmes: <View kicker="04 · Programmes, budgets et moyens" title="Budgets, ressources et programmes régionaux" description="Chaque ligne appartient au périmètre filtré."><div className="grid gap-4 xl:grid-cols-2"><Panel title="Budgets à suivre" subtitle="Par quai"><Table headers={["Quai", "Programme", "Exécution", "Financement", "Action"]} rows={priorityQuays.slice(0, 7).map((quay) => [quay.name, `${quay.programs} programme(s)`, `${quay.budgetExecution}%`, quay.pendingFunding, <SmallButton key={quay.id} onClick={() => prepareNote(quay)}>Arbitrage</SmallButton>])} /></Panel><Panel title="Ressources et infrastructures" subtitle="Disponibilité simulée"><Table headers={["Quai", "Ressources", "Statut", "Action"]} rows={quays.slice(0, 7).map((quay) => [quay.name, quay.resources.join(", "), status[`resource-${quay.id}`] ?? "À suivre", <SmallButton key={quay.id} onClick={() => act(`resource-${quay.id}`, "Maintenance demandée", `Maintenance demandée : ${quay.name}`)}>Maintenance</SmallButton>])} /></Panel></div></View>,
    coordination: <View kicker="05 · Coordination terrain" title="Référents, alertes et actions suivies" description="Les référents sont des points d’ancrage terrain, pas des contacts CRM."><div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]"><Panel title="Référents par quai" subtitle={scopeLabel}><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{quays.slice(0, 9).map((quay) => <Referent key={quay.id} quay={quay} status={status[`report-${quay.id}`] ?? "Disponible"} onClick={() => act(`report-${quay.id}`, "Compte rendu demandé", `Compte rendu demandé : ${quay.name}`)} />)}</div></Panel><Panel title="Actions en attente" subtitle="Traces visibles"><TraceList items={trace} message={message} /></Panel></div></View>,
    traces: <View kicker="06 · Notes et pièces de suivi" title="Dossier de suivi et traces de décision" description="Les pièces de suivi et brouillons suivent le périmètre régional ou le quai actif."><div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]"><Panel title="Pièces et traces de décision" subtitle={scopeLabel}><Table headers={["Quai", "Niveau", "Pièces", "Trace utile"]} rows={quays.slice(0, 8).map((quay) => [quay.name, quay.proofLevel, String(quay.proofs), quay.recommendedAction])} /></Panel><Panel title="Note d’arbitrage" subtitle={noteStatus}><p className="whitespace-pre-line rounded-2xl bg-cyan-50/80 p-3 text-sm font-bold leading-6 text-cyan-950">{note}</p><Actions primary="Valider le brouillon" secondary={["Complément terrain", "Affecter référent", "Exporter note"]} onAction={(action) => { const label = action === "Valider le brouillon" ? "Brouillon validé par utilisateur" : action === "Complément terrain" ? "Complément terrain demandé" : action === "Affecter référent" ? `Affecté à ${active.referents[0]}` : "Export de note simulé"; setNoteStatus(label); act(`note-${action}-${active.id}`, label, `${label} · ${active.name}`); }} /></Panel></div></View>,
    veille: <View kicker="07 · Veille filière" title="Signaux du moment à relier aux décisions" description="La veille respecte le filtre Région / Tout et reste mockée."><Panel title="Signaux à surveiller" subtitle={scopeLabel}><div className="grid gap-3 lg:grid-cols-2">{visibleWatch.map((signal) => <WatchSignal key={`${signal[2]}-${signal[0]}`} signal={signal} aiEnabled={aiEnabled} onAction={(action) => { if (action === "Inclure note") { setNote(`Brouillon veille - ${signal[0]}\nCatégorie : ${signal[1]}\nPortée : ${signal[2] === "Tout" ? "national" : signal[2]}\nSource : ${signal[4]}\nAction proposée : relier ce signal à la synthèse ${scopeLabel}.\nStatut : Brouillon à valider.`); setNoteStatus("Brouillon veille à valider"); } act(`watch-${signal[2]}-${signal[0]}-${action}`, "Veille ajoutée", `Veille filière : ${signal[0]} · ${action}`); }} />)}</div></Panel></View>,
    ia: <View kicker="08 · IA Mbàmbulaan" title="Assistance gouvernée par l’humain" description="L’IA assiste les lectures, brouillons et alertes. Elle ne décide pas."><div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]"><Panel title="Gouvernance IA" subtitle="Activable, contrôlée, simulée"><button onClick={() => setAiEnabled((value) => !value)} className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ${aiEnabled ? "bg-emerald-50 text-emerald-950" : "bg-slate-100 text-slate-600"}`}><span><span className="block text-sm font-black">Activer IA Mbàmbulaan</span><span className="block text-xs font-semibold">{aiEnabled ? "Enrichit synthèses, alertes et notes." : "Mode manuel complet."}</span></span><span className="rounded-full bg-white px-3 py-1 text-xs font-black">{aiEnabled ? "Activée" : "Désactivée"}</span></button><div className="mt-3 grid gap-2">{aiCapabilities.map((capability) => <label key={capability} className={`flex items-center justify-between rounded-2xl border p-3 text-sm font-black ${aiEnabled ? "border-cyan-100 bg-white" : "border-slate-100 bg-slate-50 text-slate-400"}`}><span>{capability}</span><input type="checkbox" checked={capabilities[capability]} disabled={!aiEnabled} onChange={() => setCapabilities((items) => ({ ...items, [capability]: !items[capability] }))} className="h-4 w-4 accent-cyan-700" /></label>)}</div><p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-black text-amber-950">IA simulée - données mockées. L'humain valide chaque décision.</p></Panel><Panel title="Suggestions actionnables" subtitle={scopeLabel}><p className="rounded-2xl bg-cyan-50/80 p-3 text-sm font-bold text-cyan-950">{aiSummary}</p>{aiEnabled ? <div className="mt-4 grid gap-3 md:grid-cols-2">{capabilities.Notes && <Suggestion title={`Préparer une note sur ${active.name}`} actions={["Créer brouillon", "Ignorer"]} onAction={(action) => action === "Créer brouillon" ? runSuggestion("note") : log(`Suggestion ignorée : note ${active.name}.`)} />}{capabilities.Alertes && <Suggestion title={`Vérifier une espèce sensible à ${active.name}`} actions={["Demander vérification", "Ignorer"]} onAction={(action) => action === "Demander vérification" ? runSuggestion("verify") : log(`Suggestion ignorée : vérification ${active.name}.`)} />}{capabilities.Synthèse && <Suggestion title="Comparer les volumes des quais affichés" actions={["Comparer", "Ignorer"]} onAction={(action) => action === "Comparer" ? runSuggestion("compare") : log("Suggestion ignorée : comparaison volumes.")} />}{capabilities["Recherche assistée"] && <Suggestion title={`Ouvrir les plaintes de ${active.region}`} actions={["Ouvrir plaintes", "Ignorer"]} onAction={(action) => action === "Ouvrir plaintes" ? runSuggestion("complaints") : log(`Suggestion ignorée : plaintes ${active.region}.`)} />}</div> : <p className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm font-black text-slate-600">Mode manuel : les filtres, actions, notes et traces restent disponibles.</p>}</Panel></div></View>
  };

  return <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_8%_0%,rgba(34,211,238,0.16),transparent_30%),linear-gradient(180deg,#eefbf8_0%,#f8fbfa_38%,#fff6e4_100%)] text-slate-950"><header className="overflow-hidden border-b border-cyan-100 bg-white/90 px-3 py-6 backdrop-blur sm:px-5 lg:px-6"><div className="mx-auto flex w-full max-w-[90rem] min-w-0 flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="flex items-center gap-4"><Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</Link><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministère des Pêches · espace privé</p><h1 className="text-2xl font-black tracking-tight">Espace institutionnel de lecture régionale</h1></div></div><div className="flex flex-wrap gap-2"><button onClick={() => prepareNote(active, "Point de coordination")} className={btn}>Préparer le point de coordination</button><button onClick={() => act(`export-${region}`, "Synthèse exportée", `Synthèse exportée : ${scopeLabel}`)} className={softBtn}>Exporter la synthèse</button></div></div></header><section className="mx-auto grid w-full max-w-[94rem] min-w-0 gap-5 overflow-hidden px-3 py-6 sm:px-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:px-6"><aside className="min-w-0 lg:sticky lg:top-5 lg:self-start"><nav className="overflow-hidden rounded-[2rem] border border-cyan-100 bg-white/88 p-4 shadow-[0_22px_60px_rgba(8,145,178,0.13)] backdrop-blur"><div className="rounded-[1.4rem] bg-gradient-to-br from-cyan-800 via-teal-700 to-emerald-600 p-4 text-white"><p className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-cyan-100">Pilotage premium</p><h2 className="mt-2 text-lg font-black leading-tight">Lecture institutionnelle</h2><p className="mt-3 text-xs font-bold leading-5 text-cyan-50">Région, quai, action et trace restent synchronisés.</p></div><div className="mt-4 grid gap-2">{navItems.map(([id, label, description, icon]) => <button key={id} onClick={() => setActiveSection(id)} className={`group flex min-w-0 items-center gap-3 rounded-2xl border p-3 text-left transition ${activeSection === id ? "border-cyan-300 bg-gradient-to-r from-cyan-50 via-teal-50 to-emerald-50 text-cyan-950 shadow-sm" : "border-transparent bg-white/55 text-slate-600 hover:border-cyan-100 hover:bg-cyan-50/55"}`}><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-sm font-black ${activeSection === id ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-800 group-hover:bg-white"}`}>{icon}</span><span className="min-w-0"><span className="block truncate text-sm font-black">{label}</span><span className="block truncate text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-500">{description}</span></span></button>)}</div><div className="mt-4 rounded-[1.35rem] border border-cyan-100 bg-cyan-50/70 p-3"><p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-800">Lecture active</p><p className="mt-1 text-sm font-black text-cyan-950">{scopeLabel}</p><p className="mt-2 text-xs font-bold text-slate-600">{quays.length} quai(s) · {sum(quays, "tonnage").toFixed(1)} t · IA {aiEnabled ? "activée" : "désactivée"}</p></div></nav></aside><div className="grid min-w-0 gap-5 overflow-hidden"><section className="min-w-0 overflow-hidden rounded-[2rem] border border-cyan-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,254,255,0.72),rgba(236,253,245,0.55))] p-5 shadow-[0_18px_55px_rgba(8,145,178,0.10)]"><div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between"><div className="min-w-0"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{activeNav[1]}</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-4xl">{activeNav[2]}</h2><p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-slate-600">{aiSummary}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => prepareNote(active, "Point de coordination")} className={btn}>Préparer une note</button><button onClick={() => setActiveSection("ia")} className={softBtn}>IA {aiEnabled ? "activée" : "désactivée"}</button></div></div><div className="mt-5 flex min-w-0 flex-wrap gap-2">{ministryRegions.map((item) => <button key={item} onClick={() => chooseRegion(item)} className={`rounded-full border px-3 py-2 text-xs font-black transition ${region === item ? "border-cyan-500 bg-gradient-to-r from-cyan-700 to-teal-600 text-white shadow-sm" : "border-cyan-100 bg-white text-cyan-950 hover:border-cyan-300 hover:bg-cyan-50"}`}>{fmt(item)}</button>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Quais visibles" value={String(quays.length)} hint={hints.region} /><Metric label="Tonnage du jour" value={`${sum(quays, "tonnage").toFixed(1)} t`} hint={hints.volume} /><Metric label="Alertes ouvertes" value={String(sum(quays, "incidents"))} hint={hints.alertes} /><Metric label="Actions tracées" value={String(Object.keys(status).length)} hint="Actions ouvertes ou déclenchées pendant la simulation." /></div></section>{content[activeSection]}</div></section></main>;
}

function View({ kicker, title, description, children }: { kicker: string; title: string; description: string; children: ReactNode }) {
  return <section className="grid min-w-0 gap-5 overflow-hidden rounded-[2rem] border border-cyan-100/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(236,253,245,0.56),rgba(236,254,255,0.40))] p-4 shadow-[0_18px_70px_rgba(8,145,178,0.08)] sm:p-6"><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{kicker}</p><h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">{title}</h2></div><p className="max-w-xl text-sm font-semibold leading-6 text-slate-600">{description}</p></div>{children}</section>;
}
function Panel({ title, subtitle, hint, children }: { title: string; subtitle: string; hint?: string; children: ReactNode }) {
  return <section className={card}><div className="mb-5 flex justify-between gap-3"><div><h3 className="text-lg font-black">{title}</h3><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700/70">{subtitle}</p></div>{hint && <Hint text={hint} />}</div>{children}</section>;
}
function Hint({ text }: { text: string }) {
  return <span className="group relative inline-flex"><span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-50 text-[0.7rem] font-black text-cyan-800 ring-1 ring-cyan-200">i</span><span className="pointer-events-none absolute right-0 top-7 z-10 hidden w-64 rounded-2xl bg-cyan-950 p-3 text-xs font-semibold leading-5 text-white shadow-xl group-hover:block">{text}</span></span>;
}
function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="min-w-0 rounded-2xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50/70 to-emerald-50/55 p-4 shadow-sm"><div className="flex justify-between gap-2"><p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-cyan-800/80">{label}</p><Hint text={hint} /></div><p className="mt-2 break-words text-2xl font-black text-cyan-950">{value}</p><div className="mt-3 h-1 rounded-full bg-gradient-to-r from-cyan-600 via-teal-400 to-emerald-400" /></div>;
}
function Map({ quays, activeId, onSelect }: { quays: MinistryRegionalQuay[]; activeId: string; onSelect: (id: string) => void }) {
  return <div className="relative min-h-[26rem] overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.10),transparent_30%),linear-gradient(140deg,#ffffff,#edf8f6_52%,#fff7e8)]">{quays.map((quay) => <button key={quay.id} onClick={() => onSelect(quay.id)} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg ${activeId === quay.id ? "h-11 w-11 ring-4 ring-cyan-900/20" : "h-7 w-7"} ${tensionColor(quay.tension)}`} style={{ left: `${quay.x}%`, top: `${quay.y}%` }} />)}{quays.map((quay) => <span key={`${quay.id}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-2.5 py-1 text-[0.65rem] font-black text-slate-700" style={{ left: `${quay.x}%`, top: `calc(${quay.y}% + 1.35rem)` }}>{quay.name}</span>)}</div>;
}
function Gauge({ label, value }: { label: string; value: number }) {
  const tone = value >= 80 ? "from-rose-500 to-orange-400" : value >= 65 ? "from-amber-400 to-yellow-300" : "from-emerald-400 to-teal-400";
  return <div className="mb-4 rounded-2xl bg-gradient-to-br from-cyan-50/80 to-emerald-50/60 p-4 ring-1 ring-cyan-100"><div className="flex items-end justify-between gap-3"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-800">{label}</p><p className="text-3xl font-black">{value}</p></div><div className="mt-3 h-3 rounded-full bg-white ring-1 ring-cyan-100"><div className={`h-full rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${value}%` }} /></div><p className="mt-2 text-xs font-bold text-slate-500">simulation · validation humaine</p></div>;
}
function QuayLine({ quay, onClick }: { quay: MinistryRegionalQuay; onClick: () => void }) {
  return <button onClick={onClick} className="mb-2 grid w-full gap-2 rounded-2xl bg-cyan-50/70 p-3 text-left ring-1 ring-cyan-100"><span className="flex justify-between gap-3 text-sm font-black"><span className="truncate">{quay.name}</span><span>{quay.priorityScore}/100</span></span><span className="h-2 rounded-full bg-white"><span className={`block h-full rounded-full ${tensionColor(quay.tension)}`} style={{ width: `${quay.priorityScore}%` }} /></span></button>;
}
function Bars({ quays, max }: { quays: MinistryRegionalQuay[]; max: number }) {
  return <div className="grid gap-3">{quays.map((quay) => <div key={quay.id} className="grid gap-2"><div className="flex justify-between text-sm font-black"><span>{quay.name}</span><span>{quay.tonnage} t</span></div><div className="h-3 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-400" style={{ width: `${Math.max(12, (quay.tonnage / max) * 100)}%` }} /></div></div>)}</div>;
}
function Seafood({ quay, onClick }: { quay: MinistryRegionalQuay; onClick: () => void }) {
  return <article className="rounded-2xl border border-cyan-100 bg-white/90 p-4 shadow-sm"><div className="flex justify-between gap-3"><div className="min-w-0"><p className="truncate font-black">{quay.name}</p><p className="text-xs font-bold text-slate-500">{quay.landings} débarquements · {quay.sevenDayVariation}</p></div><StatusPill label={quay.tension} /></div><p className="mt-3 text-2xl font-black text-cyan-950">{quay.tonnage} t</p><p className="mt-2 break-words text-xs font-semibold text-slate-600">{quay.mainSpecies.join(", ")}</p><SmallButton onClick={onClick}>Demander relevé</SmallButton></article>;
}
function Signal({ quay, label, focus, onAction }: { quay: MinistryRegionalQuay; label: string; focus: boolean; onAction: (action: string) => void }) {
  return <div className={`mb-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-white to-amber-50/45 p-4 ${focus ? "ring-2 ring-amber-300" : ""}`}><div className="flex justify-between gap-3"><div><p className="font-black">{label}</p><p className="text-xs font-bold text-slate-500">{quay.name} · {quay.region}</p></div><StatusPill label={quay.tension} /></div><p className="mt-3 text-sm font-semibold text-slate-600">Signal à vérifier · données mockées · vérification humaine requise.</p><Actions primary="Vérifier" secondary={["Créer note", "Ajouter trace"]} onAction={onAction} /></div>;
}
function Referent({ quay, status, onClick }: { quay: MinistryRegionalQuay; status: string; onClick: () => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3"><div className="flex justify-between gap-3"><div><p className="text-sm font-black">{quay.referents[0]}</p><p className="text-xs font-semibold text-slate-500">{quay.name} · {quay.region}</p></div><StatusPill label={status} /></div><p className="mt-2 text-xs font-bold text-slate-600">{quay.recommendedAction}</p><SmallButton onClick={onClick}>Compte rendu</SmallButton></div>;
}
function Table({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return <div className="max-w-full overflow-x-auto rounded-2xl border border-cyan-100"><table className="w-full min-w-full table-auto text-left text-sm"><thead className="bg-cyan-50/80 text-xs uppercase tracking-[0.12em] text-cyan-900"><tr>{headers.map((header) => <th key={header} className="p-3 font-black">{header}</th>)}</tr></thead><tbody className="divide-y divide-slate-100 bg-white/95">{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="min-w-0 break-words p-3 font-semibold text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}
function Actions({ primary, secondary, onAction }: { primary: string; secondary: string[]; onAction: (action: string) => void }) {
  return <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => onAction(primary)} className={btn}>{primary}</button>{secondary.map((action) => <button key={action} onClick={() => onAction(action)} className={softBtn}>{action}</button>)}</div>;
}
function SmallButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="mt-3 rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-3 py-1.5 text-xs font-black text-white shadow-sm">{children}</button>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 py-2 text-sm font-bold"><span className="text-slate-500">{label}</span><span className="text-right">{value}</span></div>;
}
function TraceList({ items, message }: { items: string[]; message: string }) {
  return <div><div className="grid gap-2">{items.map((item, index) => <p key={`${item}-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">{item}</p>)}</div><p className="mt-4 rounded-2xl bg-amber-50 p-3 text-xs font-black text-amber-950">{message}</p></div>;
}
function Suggestion({ title, actions, onAction }: { title: string; actions: string[]; onAction: (action: string) => void }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-sm font-black">{title}</p><div className="mt-3 flex flex-wrap gap-2">{actions.map((action) => <button key={action} onClick={() => onAction(action)} className={`${action === "Ignorer" ? softBtn : btn} px-3 py-1.5 text-xs`}>{action}</button>)}</div></div>;
}
function WatchSignal({ signal, aiEnabled, onAction }: { signal: (typeof watchSignals)[number]; aiEnabled: boolean; onAction: (action: string) => void }) {
  return <article className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/45 p-4 shadow-sm"><div className="flex justify-between gap-3"><div><p className="text-sm font-black">{signal[0]}</p><p className="text-xs font-bold text-slate-500">{signal[1]} · {signal[2] === "Tout" ? "national" : signal[2]}</p></div><StatusPill label={signal[3]} /></div><p className="mt-3 text-xs font-semibold text-slate-600">Source mockée : {signal[4]}</p>{aiEnabled && <p className="mt-3 rounded-2xl bg-cyan-50/80 p-3 text-xs font-black text-cyan-950 ring-1 ring-cyan-100">Lecture IA : signal à relier à une note ou à une vérification humaine.</p>}<Actions primary="Ajouter à la synthèse" secondary={["Créer action", "Vérifier", "Inclure note"]} onAction={onAction} /></article>;
}
function StatusPill({ label }: { label: string }) {
  return <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.64rem] font-black uppercase tracking-[0.08em] shadow-sm before:h-1.5 before:w-1.5 before:rounded-full ${badgeTone(label)}`}>{label}</span>;
}
