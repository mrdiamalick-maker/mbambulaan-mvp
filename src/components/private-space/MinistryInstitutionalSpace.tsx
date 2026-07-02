"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ministryBudgetLines,
  ministryConflictReports,
  ministryDailyCatches,
  ministryIncidents,
  ministryInitialPendingActions,
  ministryProofs,
  ministryQuayMetrics,
  ministryReferents,
  ministryResources,
  ministrySensitiveSpeciesSignals,
  ministryTerritories,
  type MinistryConflictReport,
  type MinistryPendingAction,
  type MinistryReferent,
  type MinistrySensitiveSpeciesSignal,
  type MinistryTone
} from "@/data/ministrySpace";

const aiCapabilitiesList = ["Synthèse", "Alertes", "Notes", "Recherche assistée"] as const;

const toneClasses: Record<MinistryTone, string> = {
  blue: "border-cyan-200 bg-cyan-50 text-cyan-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  red: "border-rose-200 bg-rose-50 text-rose-950",
  slate: "border-slate-200 bg-slate-50 text-slate-900"
};

function dot(tension: string) {
  if (tension === "Critique") return "bg-rose-500";
  if (tension === "Forte") return "bg-amber-400";
  if (tension === "Moyenne") return "bg-yellow-300";
  return "bg-emerald-400";
}

function bar(tone: MinistryTone) {
  if (tone === "amber") return "from-amber-300 to-orange-400";
  if (tone === "green") return "from-emerald-400 to-teal-500";
  if (tone === "red") return "from-orange-400 to-rose-500";
  if (tone === "slate") return "from-slate-300 to-slate-500";
  return "from-cyan-500 to-teal-500";
}

function crit(level: string) {
  if (level === "Critique") return "bg-rose-100 text-rose-950";
  if (level === "Haute") return "bg-orange-100 text-orange-950";
  if (level === "Moyenne") return "bg-amber-100 text-amber-950";
  return "bg-emerald-100 text-emerald-950";
}

export function MinistryInstitutionalSpace() {
  const [selectedQuay, setSelectedQuay] = useState("Joal");
  const [tensionFilter, setTensionFilter] = useState("Toutes");
  const [message, setMessage] = useState("IA simulée - données mockées. L'humain valide chaque décision.");
  const [note, setNote] = useState("Aucune note préparée.");
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [boost, setBoost] = useState<Record<string, number>>({});
  const [pendingActions, setPendingActions] = useState<MinistryPendingAction[]>(ministryInitialPendingActions);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiCaps, setAiCaps] = useState<Record<(typeof aiCapabilitiesList)[number], boolean>>(
    Object.fromEntries(aiCapabilitiesList.map((name) => [name, name !== "Recherche assistée"])) as Record<(typeof aiCapabilitiesList)[number], boolean>
  );

  const territory = ministryTerritories.find((item) => item.name === selectedQuay) ?? ministryTerritories[0];
  const baseMetric = ministryQuayMetrics.find((item) => item.quay === selectedQuay) ?? ministryQuayMetrics[0];
  const metric = { ...baseMetric, priorityScore: Math.min(100, baseMetric.priorityScore + (boost[selectedQuay] ?? 0)) };
  const budget = ministryBudgetLines.find((item) => item.territory === selectedQuay) ?? ministryBudgetLines[0];
  const incidents = ministryIncidents.filter((item) => item.territory === selectedQuay);
  const resources = ministryResources.filter((item) => item.territory === selectedQuay);
  const proofs = ministryProofs.filter((item) => item.territory === selectedQuay);
  const referents = ministryReferents.filter((item) => item.quay === selectedQuay);
  const dailyCatch = ministryDailyCatches.find((item) => item.quay === selectedQuay) ?? ministryDailyCatches[0];
  const sensitiveSpecies = ministrySensitiveSpeciesSignals.filter((item) => item.quay === selectedQuay);
  const conflictReports = ministryConflictReports.filter((item) => item.quay === selectedQuay);
  const visibleTerritories = ministryTerritories.filter((item) => tensionFilter === "Toutes" || item.tension === tensionFilter);

  const aiInsight = useMemo(() => {
    if (!aiEnabled) return `Mode manuel : données et actions disponibles sans assistance IA. ${selectedQuay} reste pilotable avec KPIs, référents et traces.`;
    if (!aiCaps["Synthèse"]) return `${selectedQuay}: synthèse IA désactivée. Les tableaux restent exploitables en lecture classique.`;
    return `${selectedQuay}: ${dailyCatch.tonnage} t débarquées aujourd'hui, priorité ${metric.priorityScore}/100, ${sensitiveSpecies.length} signal(s) espèce à surveiller et ${conflictReports.length} conflit(s) ou plainte(s). ${territory.recommendedAction}`;
  }, [aiCaps, aiEnabled, conflictReports.length, dailyCatch.tonnage, metric.priorityScore, selectedQuay, sensitiveSpecies.length, territory.recommendedAction]);

  function addAction(title: string, type: string, status = "À traiter") {
    const action = { id: `act-${Date.now()}-${pendingActions.length}`, title, quay: selectedQuay, type, status };
    setPendingActions((items) => [action, ...items].slice(0, 10));
    setMessage(`${title}. ${aiEnabled ? "Analyse IA disponible si la capacité concernée est active." : "Mode manuel sans assistance IA."} Simulation MVP - action non connectée au backend`);
  }

  function prepareNote(context = selectedQuay) {
    const prefix = aiEnabled && aiCaps["Notes"] ? "Note suggérée" : "Brouillon manuel";
    setNote(`${prefix} ${context}: priorité ${metric.priorityScore}/100, budget ${metric.pendingFunding}, référent ${referents[0]?.name ?? "à désigner"}, preuve ${proofs[0]?.level ?? "à compléter"}.`);
    addAction(`Note préparée: ${context}`, "Note", "Préparée");
  }

  function prioritizeQuay() {
    setBoost((items) => ({ ...items, [selectedQuay]: Math.min(9, (items[selectedQuay] ?? 0) + 5) }));
    addAction(`Quai priorisé: ${selectedQuay}`, "Priorité", "Priorisé");
  }

  function updateStatus(id: string, status: string, title: string, type: string) {
    setStatuses((items) => ({ ...items, [id]: status }));
    addAction(title, type, status);
  }

  function requestReport(referent: MinistryReferent) {
    updateStatus(referent.id, "Compte rendu demandé", `Compte rendu demandé: ${referent.name}`, "Référent");
    setNote(`Compte rendu terrain ${selectedQuay}: ${referent.name} (${referent.role}), besoin remonté: ${referent.needs}.`);
  }

  function handleSpecies(signal: MinistrySensitiveSpeciesSignal) {
    updateStatus(signal.id, "Signal à vérifier", `Signal espèce à vérifier: ${signal.species}`, "Espèce");
    setNote(`Espèce à surveiller ${signal.species}: ${signal.action} Données mockées, vérification requise.`);
  }

  function handleConflict(report: MinistryConflictReport) {
    updateStatus(report.id, "À arbitrer", `Plainte à arbitrer: ${report.type}`, "Conflit");
    setNote(`Conflit ${selectedQuay}: ${report.type}. Référent ${report.referent}. Trace: ${report.trace}.`);
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eefbf9_0%,#f8fbf7_42%,#fffaf0_100%)] text-slate-950">
      <header className="border-b border-cyan-100 bg-white/95 px-5 py-6 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[94rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministère des Pêches · espace privé</p>
              <h1 className="text-2xl font-black tracking-tight">Espace institutionnel de pilotage par quai</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <QuaySelector selected={selectedQuay} onSelect={setSelectedQuay} />
            <Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">Portail</Link>
            <button onClick={() => prepareNote()} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Préparer note</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[94rem] gap-11 px-5 py-8 sm:px-8">
        <Band index="01" label="Command center" title="Synthèse nationale exploitable" subtitle="Voir les quais, comprendre les risques et orienter l'action publique.">
          <HeroPanel title="Vision nationale" quay={selectedQuay} message={message} />
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <Panel title="Synthèse nationale" subtitle="Portefeuille pilote">
              <div className="grid gap-3 sm:grid-cols-3">
                <Chip label="Quais suivis" value="5" />
                <Chip label="Zones critiques" value="3" />
                <Chip label="Actions ouvertes" value={String(pendingActions.length)} />
              </div>
              {aiEnabled && aiCaps["Synthèse"] ? <Insight label="Analyse IA" text={aiInsight} /> : <Insight label="Mode manuel" text="Les données restent exploitables sans commentaire IA automatique." />}
            </Panel>
            <Panel title={`Quai sélectionné : ${selectedQuay}`} subtitle={`${territory.commune} · ${territory.zone}`}>
              <Row label="Tension" value={territory.tension} />
              <Row label="Risque dominant" value={territory.mainRisk} />
              <Row label="Action recommandée" value={territory.recommendedAction} />
            </Panel>
          </div>
        </Band>

        <Band index="02" label="Lecture territoriale" title="Choisir un quai de pêche" subtitle="Le filtre met à jour KPIs, carte, production, conflits, preuves et IA.">
          <div className="grid gap-3 md:grid-cols-5">
            {ministryTerritories.map((item) => {
              const selected = item.name === selectedQuay;
              return (
                <button key={item.name} type="button" onClick={() => setSelectedQuay(item.name)} className={`rounded-[1.25rem] border p-4 text-left transition ${selected ? "border-cyan-600 bg-gradient-to-br from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-900/15" : "border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 text-cyan-950 hover:border-cyan-300"}`}>
                  <span className="flex items-center justify-between gap-3"><span className="text-lg font-black">{item.name}</span><span className={`h-3 w-3 rounded-full ${dot(item.tension)}`} /></span>
                  <span className={`mt-2 block text-xs font-black uppercase tracking-[0.12em] ${selected ? "text-cyan-50" : "text-cyan-700"}`}>{item.tension}</span>
                  <span className={`mt-2 block text-xs font-semibold leading-5 ${selected ? "text-white/75" : "text-slate-600"}`}>{item.mainRisk}</span>
                </button>
              );
            })}
          </div>
        </Band>

        <Band index="03" label="Indicateurs critiques" title="Priorité, production et capacité d'action" subtitle="Des visualisations légères évitent l'effet tableau admin.">
          <div className="grid gap-3 md:grid-cols-3">
            <Radial label="Priorité quai" value={metric.priorityScore} suffix="/100" tone={metric.priorityScore >= 85 ? "red" : metric.priorityScore >= 70 ? "amber" : "blue"} />
            <Radial label="Exécution budget" value={metric.executionRate} suffix="%" tone="green" />
            <Spark label="Signaux terrain" values={metric.signalTrend} detail={`${metric.lastUpdate} · ${territory.tension}`} />
          </div>
          <MetricRibbon />
        </Band>

        <Band index="04" label="Carte et fiche quai" title="Lire le territoire avant d'agir" subtitle="La carte sélectionne, priorise et documente, sans prétendre remplacer un SIG.">
          <div className="grid gap-4 xl:grid-cols-[1fr_21rem]">
            <Panel title="Carte des quais" subtitle="Filtre tension + sélection quai">
              <div className="mb-3 flex flex-wrap gap-2">
                {["Toutes", "Critique", "Forte", "Moyenne", "Faible"].map((item) => <button key={item} onClick={() => setTensionFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-black ${tensionFilter === item ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-950"}`}>{item}</button>)}
              </div>
              <div className="relative min-h-[31rem] overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.25),transparent_30%),linear-gradient(140deg,#f8fafc,#dff7f4_46%,#f7e7c3)]">
                <div className="absolute left-[22%] top-8 h-[86%] w-8 rounded-full border-l-4 border-cyan-300/80" />
                {visibleTerritories.map((item) => <button key={item.name} onClick={() => setSelectedQuay(item.name)} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${selectedQuay === item.name ? "h-11 w-11 ring-4 ring-cyan-800/20" : "h-7 w-7"} ${dot(item.tension)}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`Sélectionner ${item.name}`} />)}
                {visibleTerritories.map((item) => <span key={`${item.name}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-black text-slate-700 shadow-sm" style={{ left: `${item.x}%`, top: `calc(${item.y}% + 1.35rem)` }}>{item.name}</span>)}
              </div>
            </Panel>
            <Panel title={`Fiche ${selectedQuay}`} subtitle={`${territory.zone} · ${territory.lat}, ${territory.lng}`}>
              <Row label="Budget" value={budget.planned} />
              <Row label="Financement en attente" value={metric.pendingFunding} />
              <Row label="Incidents" value={String(incidents.length)} />
              <Row label="Ressources critiques" value={String(metric.criticalResources)} />
              <Row label="Preuves validées" value={String(metric.validatedProofs)} />
              <ActionBar primary="Prioriser quai" secondary={["Vérifier terrain", "Note quai"]} onPrimary={prioritizeQuay} onSecondary={(item) => item.includes("Note") ? prepareNote(selectedQuay) : updateStatus(`field-${selectedQuay}`, "Demandée", `Vérification terrain demandée: ${selectedQuay}`, "Terrain")} />
            </Panel>
          </div>
        </Band>

        <Band index="05" label="Pêches du jour" title="Production halieutique et variétés visibles" subtitle="Tonnages, débarquements et produits de la mer changent selon le quai.">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Production du jour" subtitle={`${selectedQuay} · données mockées`}>
              <div className="grid gap-3 sm:grid-cols-3"><Chip label="Tonnage" value={`${dailyCatch.tonnage} t`} /><Chip label="Débarquements" value={String(dailyCatch.landings)} /><Chip label="Variation 7 jours" value={dailyCatch.sevenDayVariation} /></div>
              <p className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-3 text-sm font-bold text-amber-950">{dailyCatch.unusualSignal}</p>
              {aiEnabled && aiCaps["Synthèse"] && <Insight label="Analyse IA" text={`Production ${selectedQuay}: ${dailyCatch.coldStatus.toLowerCase()}, relevé tonnage recommandé.`} />}
              <ActionBar primary="Demander relevé tonnage" secondary={["Contrôle froid", "Confirmer débarquement"]} onPrimary={() => { setNote(`Relevé tonnage ${selectedQuay}: ${dailyCatch.tonnage} t, ${dailyCatch.landings} débarquements, variation ${dailyCatch.sevenDayVariation}.`); addAction(`Relevé tonnage demandé: ${selectedQuay}`, "Production", "Demandé"); }} onSecondary={(item) => updateStatus(`${item}-${selectedQuay}`, "Demandé", `${item} demandé: ${selectedQuay}`, "Production")} />
            </Panel>
            <Panel title="Variétés produits de la mer" subtitle="Répartition indicative">
              <Bars items={dailyCatch.species.map((item) => ({ label: item.name, value: item.volume, tone: item.tone }))} suffix=" t" />
            </Panel>
          </div>
        </Band>

        <Band index="06" label="Programmes et moyens" title="Budgets, ressources et capacités opérationnelles" subtitle="Chaque moyen est relié au quai, au programme et à une action visible.">
          <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Budget du quai" subtitle="Prévu / engagé / consommé">
              <Progress label="Prévu" value={100} amount={budget.planned} tone="bg-cyan-700" />
              <Progress label="Engagé" value={(parseInt(budget.committed, 10) / parseInt(budget.planned, 10)) * 100} amount={budget.committed} tone="bg-teal-500" />
              <Progress label="Consommé" value={(parseInt(budget.consumed, 10) / parseInt(budget.planned, 10)) * 100} amount={budget.consumed} tone="bg-amber-400" />
              <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-950">{statuses[budget.id] ?? budget.status}: {budget.variance}</p>
              <ActionBar primary="Signaler écart" secondary={["Demander preuve", "Préparer arbitrage"]} onPrimary={() => { setStatuses((items) => ({ ...items, [budget.id]: aiEnabled && aiCaps["Alertes"] ? "Écart signalé + alerte IA" : "Écart signalé" })); prepareNote(budget.program); }} onSecondary={(item) => item.includes("arbitrage") ? prepareNote(selectedQuay) : updateStatus(proofs[0]?.id ?? "proof", "Preuve demandée", `Preuve demandée: ${selectedQuay}`, "Preuve")} />
            </Panel>
            <Panel title="Ressources critiques" subtitle="Maintenance et disponibilité">
              <Table headers={["Ressource", "État", "Disponibilité", "Action"]} rows={(resources.length ? resources : ministryResources.slice(0, 2)).map((item) => [item.name, statuses[item.id] ?? item.state, item.availability, <button key={item.id} onClick={() => updateStatus(item.id, "Maintenance demandée", `Maintenance demandée: ${item.name}`, "Ressource")} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Maintenance</button>])} />
            </Panel>
          </div>
        </Band>

        <Band index="07" label="Alertes terrain" title="Espèces sensibles, conflits et plaintes" subtitle="Signaux prudents : données mockées, vérification requise et décision humaine.">
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <Panel title="Espèces à surveiller" subtitle="Sans claim scientifique">
              <div className="grid gap-3 md:grid-cols-2">
                {(sensitiveSpecies.length ? sensitiveSpecies : ministrySensitiveSpeciesSignals.slice(0, 2)).map((item) => <SignalCard key={item.id} title={item.species} meta={`${item.status} · ${item.signals} signal(s)`} status={statuses[item.id] ?? item.criticality} action={item.action} onClick={() => handleSpecies(item)} />)}
              </div>
            </Panel>
            <Panel title="Conflits et plaintes" subtitle="Déclarations terrain à arbitrer">
              <Table headers={["Type", "Déclarant", "Criticité", "Statut", "Action"]} rows={(conflictReports.length ? conflictReports : ministryConflictReports.slice(0, 2)).map((item) => [item.type, item.declarant, item.criticality, statuses[item.id] ?? item.status, <button key={item.id} onClick={() => handleConflict(item)} className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-3 py-1.5 text-xs font-black text-white">Arbitrer</button>])} />
              {aiEnabled && aiCaps["Alertes"] && <Insight label="Alerte IA" text={`Prioriser ${conflictReports[0]?.type ?? "le signal terrain"} si la trace reste incomplète.`} />}
            </Panel>
          </div>
          <Panel title="Incidents opérationnels" subtitle={`${selectedQuay} · réaction rapide`}>
            <Table headers={["Incident", "Gravité", "Statut", "Action"]} rows={(incidents.length ? incidents : ministryIncidents.slice(0, 2)).map((item) => [item.title, item.severity, statuses[item.id] ?? item.status, <button key={item.id} onClick={() => updateStatus(item.id, "Vérification demandée", `Vérification demandée: ${item.title}`, "Incident")} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Vérifier</button>])} />
          </Panel>
        </Band>

        <Band index="08" label="Coordination terrain" title="Référents, actions et suivi" subtitle="Les référents sont des points d'ancrage terrain, pas des contacts CRM.">
          <div className="grid gap-4 xl:grid-cols-[1fr_0.75fr]">
            <Panel title="Référents terrain" subtitle="Compte rendu, vérification, programme">
              <div className="grid gap-3 md:grid-cols-2">
                {(referents.length ? referents : ministryReferents.slice(0, 3)).map((referent) => <ReferentCard key={referent.id} referent={referent} status={statuses[referent.id] ?? referent.status} onReport={() => requestReport(referent)} onFollow={() => updateStatus(referent.id, "Suivi affecté", `Suivi programme affecté: ${referent.name}`, "Programme")} />)}
              </div>
            </Panel>
            <Panel title="Actions en attente" subtitle="Trace des clics utilisateur">
              <div className="grid gap-2">
                {pendingActions.filter((item) => item.quay === selectedQuay).slice(0, 7).map((item) => <button key={item.id} onClick={() => setStatuses((values) => ({ ...values, [item.id]: "Vu" }))} className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 p-3 text-left"><span className="block text-sm font-black">{item.title}</span><span className="text-xs font-semibold text-slate-500">{item.type} · {statuses[item.id] ?? item.status}</span></button>)}
              </div>
            </Panel>
          </div>
        </Band>

        <Band index="09" label="Preuve" title="Actions, notes et traces" subtitle="Chaque décision produit une preuve, une action en attente ou un brouillon de note.">
          <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
            <Panel title="Trace décisionnelle" subtitle={`${selectedQuay} · preuves et note`}>
              <Table headers={["Source", "Niveau", "Validation", "Décision"]} rows={(proofs.length ? proofs : ministryProofs.slice(0, 2)).map((item) => [item.source, item.level, statuses[item.id] ?? item.validation, item.linkedDecision])} />
              <ActionBar primary="Valider preuve" secondary={["Demander vérification", "Générer note"]} onPrimary={() => updateStatus(proofs[0]?.id ?? "proof", "Validation demandée", `Validation preuve demandée: ${proofs[0]?.source ?? selectedQuay}`, "Preuve")} onSecondary={(item) => item.includes("note") ? prepareNote(selectedQuay) : updateStatus(`field-${selectedQuay}`, "Demandée", `Vérification terrain demandée: ${selectedQuay}`, "Terrain")} />
            </Panel>
            <Panel title="Note et trace" subtitle="Brouillon visible">
              <p className="text-sm font-black text-slate-900">{proofs[0]?.source ?? "Preuve à compléter"}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">{proofs[0]?.level ?? "À collecter"} · {proofs[0]?.date ?? metric.lastUpdate}</p>
              <p className="mt-4 rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950">{note}</p>
            </Panel>
          </div>
        </Band>

        <Band index="10" label="IA gouvernée" title="IA Mbàmbulaan activable, utile et contrôlée" subtitle="L'IA assiste la lecture, mais l'humain valide toujours la décision.">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel title="Gouvernance IA" subtitle="Activable, contrôlée, simulée">
              <button onClick={() => setAiEnabled((enabled) => !enabled)} className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ${aiEnabled ? "bg-emerald-50 text-emerald-950" : "bg-slate-100 text-slate-600"}`}>
                <span><span className="block text-sm font-black">Activer IA Mbàmbulaan</span><span className="block text-xs font-semibold">{aiEnabled ? "Enrichit synthèses, alertes et notes." : "Mode manuel : données et actions disponibles sans assistance IA."}</span></span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black">{aiEnabled ? "Activée" : "Désactivée"}</span>
              </button>
              <div className="mt-3 grid gap-2">{aiCapabilitiesList.map((name) => <label key={name} className={`flex items-center justify-between rounded-2xl border p-3 text-sm font-black ${aiEnabled ? "border-cyan-100 bg-white text-slate-800" : "border-slate-100 bg-slate-50 text-slate-400"}`}><span>{name}</span><input type="checkbox" checked={aiCaps[name]} disabled={!aiEnabled} onChange={() => setAiCaps((items) => ({ ...items, [name]: !items[name] }))} className="h-4 w-4 accent-cyan-700" /></label>)}</div>
            </Panel>
            <Panel title="Commentaires dashboard" subtitle="IA simulée · données mockées">
              <p className="text-sm font-bold leading-6 text-slate-700">{aiInsight}</p>
              <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-black leading-5 text-amber-950">IA simulée - données mockées. L'humain valide chaque décision.</p>
              <div className="mt-3 grid gap-2">{["Pourquoi ce quai est prioritaire ?", "Quel financement est bloqué ?", "Quel référent contacter ?", "Quelle espèce surveiller ?", "Quelle note préparer ?"].map((question) => <button key={question} onClick={() => setMessage(aiEnabled ? `Analyse IA ${selectedQuay}: ${question} ${territory.recommendedAction}` : `IA désactivée: ${question} reste traitable via les données et actions manuelles.`)} className={`rounded-2xl px-3 py-2 text-left text-xs font-black ${aiEnabled ? "bg-cyan-50 text-cyan-950" : "bg-slate-100 text-slate-500"}`}>{question}</button>)}</div>
            </Panel>
          </div>
        </Band>
      </section>
    </main>
  );
}

function HeroPanel({ title, quay, message }: { title: string; quay: string; message: string }) {
  return <section className="rounded-[1.75rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white shadow-xl shadow-cyan-950/10"><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">{title} · {quay}</p><h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">Passer d'une lecture nationale à une action locale documentée.</h2><p className="mt-4 max-w-2xl rounded-2xl bg-white/10 p-3 text-sm font-bold leading-6 text-white/75 ring-1 ring-white/10">{message}</p></section>;
}

function Band({ index, label, title, subtitle, children }: { index: string; label: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="relative grid gap-5 rounded-[2.25rem] border border-cyan-100/80 bg-white/60 p-4 shadow-sm shadow-cyan-950/5 backdrop-blur sm:p-6"><div className="pointer-events-none absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" /><div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">{index} · {label}</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h2></div><p className="max-w-2xl text-sm font-semibold leading-6 text-slate-600">{subtitle}</p></div>{children}</section>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5"><div className="mb-5"><h3 className="text-lg font-black text-slate-950">{title}</h3><p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-700/70">{subtitle}</p></div>{children}</section>;
}

function Radial({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: MinistryTone }) {
  return <div className={`rounded-[1.25rem] border p-4 ${toneClasses[tone]}`}><div className="flex items-center gap-4"><div className="grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(#0891b2 ${value * 3.6}deg, rgba(255,255,255,.85) 0deg)` }}><div className="grid h-14 w-14 place-items-center rounded-full bg-white text-sm font-black">{value}</div></div><div><p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p><p className="mt-2 text-2xl font-black">{suffix}</p></div></div></div>;
}

function Spark({ label, values, detail }: { label: string; values: number[]; detail: string }) {
  const max = Math.max(...values, 1);
  return <div className="rounded-[1.25rem] border border-cyan-200 bg-white/80 p-4 text-cyan-950"><p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">{label}</p><div className="mt-4 flex h-12 items-end gap-1">{values.map((value, index) => <span key={`${value}-${index}`} className="w-full rounded-t bg-cyan-600" style={{ height: `${22 + (value / max) * 70}%` }} />)}</div><p className="mt-3 text-sm font-bold text-slate-600">{detail}</p></div>;
}

function Bars({ items, suffix }: { items: { label: string; value: number; tone: MinistryTone }[]; suffix: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return <div className="grid gap-3">{items.map((item) => <div key={item.label} className="grid gap-2"><div className="flex items-center justify-between text-sm font-black text-slate-700"><span>{item.label}</span><span>{item.value}{suffix}</span></div><div className="h-3 overflow-hidden rounded-full bg-cyan-50"><div className={`h-full rounded-full bg-gradient-to-r ${bar(item.tone)}`} style={{ width: `${Math.max(12, (item.value / max) * 100)}%` }} /></div></div>)}</div>;
}

function MetricRibbon() {
  return <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">{[
    ["Tension", "Critique", "bg-rose-50 text-rose-950"],
    ["Incidents", "ouverts", "bg-orange-50 text-orange-950"],
    ["Financement", "à suivre", "bg-amber-50 text-amber-950"],
    ["Ressources", "critiques", "bg-emerald-50 text-emerald-950"],
    ["Programmes", "actifs", "bg-cyan-50 text-cyan-950"],
    ["Preuves", "validées", "bg-teal-50 text-teal-950"],
    ["Référents", "terrain", "bg-sky-50 text-sky-950"],
    ["MAJ", "mock", "bg-stone-50 text-stone-950"]
  ].map(([label, value, tone]) => <div key={label} className={`rounded-2xl border border-white p-3 shadow-sm ${tone}`}><p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-60">{label}</p><p className="mt-1 truncate text-sm font-black">{value}</p></div>)}</div>;
}

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="overflow-hidden rounded-2xl border border-cyan-100"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="bg-cyan-50 text-xs uppercase tracking-[0.12em] text-cyan-900"><tr>{headers.map((header) => <th key={header} className="p-3 font-black">{header}</th>)}</tr></thead><tbody className="divide-y divide-cyan-50 bg-white">{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 font-semibold text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Progress({ label, value, amount, tone }: { label: string; value: number; amount: string; tone: string }) {
  return <div><div className="flex justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-500"><span>{label}</span><span>{amount}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.min(100, value)}%` }} /></div></div>;
}

function ActionBar({ primary, secondary, onPrimary, onSecondary }: { primary: string; secondary: string[]; onPrimary: () => void; onSecondary: (item: string) => void }) {
  return <div className="mt-4 flex flex-wrap gap-2"><button onClick={onPrimary} className="rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-4 py-2 text-sm font-black text-white shadow-sm shadow-cyan-900/15">{primary}</button>{secondary.slice(0, 2).map((item) => <button key={item} onClick={() => onSecondary(item)} className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-950 transition hover:border-teal-300 hover:bg-teal-50">{item}</button>)}</div>;
}

function SignalCard({ title, meta, status, action, onClick }: { title: string; meta: string; status: string; action: string; onClick: () => void }) {
  return <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-white via-amber-50 to-cyan-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-base font-black text-slate-950">{title}</p><p className="mt-1 text-xs font-bold text-slate-500">{meta}</p></div><span className={`rounded-full px-3 py-1 text-[0.65rem] font-black ${crit(status)}`}>{status}</span></div><p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{action}</p><button onClick={onClick} className="mt-4 rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Signaler</button></div>;
}

function ReferentCard({ referent, status, onReport, onFollow }: { referent: MinistryReferent; status: string; onReport: () => void; onFollow: () => void }) {
  return <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black">{referent.name}</p><p className="text-xs font-semibold text-slate-500">{referent.role} · confiance {referent.trust}</p></div><span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-black text-cyan-900">{status}</span></div><p className="mt-2 text-xs font-bold text-slate-600">{referent.lastReport}</p><p className="mt-1 text-xs font-semibold text-slate-500">Besoin: {referent.needs}</p><p className="mt-1 text-xs font-semibold text-slate-500">Programme: {referent.programs}</p><div className="mt-3 flex flex-wrap gap-2"><button onClick={onReport} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Compte rendu</button><button onClick={onFollow} className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-black text-cyan-950">Affecter suivi</button></div></div>;
}

function Insight({ label, text }: { label: string; text: string }) {
  return <div className="mt-3 rounded-2xl border border-teal-100 bg-gradient-to-br from-cyan-50 to-emerald-50 p-3"><p className="text-[0.65rem] font-black uppercase tracking-[0.14em] text-teal-700">{label}</p><p className="mt-1 text-xs font-bold leading-5 text-slate-600">{text}</p></div>;
}

function Chip({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700/70">{label}</p><p className="mt-1 text-xl font-black text-cyan-950">{value}</p></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-cyan-50 py-2 text-sm font-bold"><span className="text-slate-500">{label}</span><span className="text-right text-slate-950">{value}</span></div>;
}

function QuaySelector({ selected, onSelect }: { selected: string; onSelect: (quay: string) => void }) {
  return <select value={selected} onChange={(event) => onSelect(event.target.value)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">{ministryTerritories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select>;
}
