"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ministryAiModules,
  ministryKpis,
  ministryQuickQuestions,
  quayProfiles,
  type MinistryTone,
  type QuayProfile,
  type QuayReferent
} from "@/data/ministrySpace";

const modules = [
  { id: "national", label: "Vue nationale", question: "Que doit savoir le Ministère aujourd'hui ?" },
  { id: "map", label: "Carte et territoires", question: "Quelle zone prioriser et pourquoi ?" },
  { id: "alerts", label: "Alertes et incidents", question: "Qu'est-ce qui demande une réaction rapide ?" },
  { id: "budgets", label: "Programmes et budgets", question: "Quels programmes ou budgets posent problème ?" },
  { id: "resources", label: "Ressources et acteurs", question: "Quels moyens sont disponibles ou critiques ?" },
  { id: "proofs", label: "Notes, preuves et accès", question: "Quelle décision peut être documentée et validée ?" }
] as const;

type ModuleId = (typeof modules)[number]["id"];

type PendingAction = {
  id: string;
  label: string;
  quay: string;
  type: string;
};

type Insight = {
  label: string;
  value: string;
  detail: string;
  tone: MinistryTone;
  progress?: number;
};

const toneClass: Record<MinistryTone, string> = {
  blue: "border-cyan-200 bg-cyan-50 text-cyan-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  red: "border-rose-200 bg-rose-50 text-rose-950",
  slate: "border-slate-200 bg-slate-50 text-slate-900"
};

const fillClass: Record<MinistryTone, string> = {
  blue: "bg-cyan-700",
  green: "bg-emerald-600",
  amber: "bg-amber-500",
  red: "bg-rose-500",
  slate: "bg-slate-500"
};

function tensionTone(tension: QuayProfile["tension"]): MinistryTone {
  if (tension === "Critique") return "red";
  if (tension === "Forte") return "amber";
  if (tension === "Moyenne") return "blue";
  return "green";
}

function tensionDot(tension: QuayProfile["tension"]) {
  if (tension === "Critique") return "bg-rose-500";
  if (tension === "Forte") return "bg-amber-400";
  if (tension === "Moyenne") return "bg-cyan-400";
  return "bg-emerald-400";
}

function formatFcfa(value: number) {
  return `${value} M`;
}

export function MinistryInstitutionalSpace() {
  const [active, setActive] = useState<ModuleId>("national");
  const [selectedQuayId, setSelectedQuayId] = useState("joal");
  const [message, setMessage] = useState("IA simulée - données mockées. L'humain valide chaque décision.");
  const [generatedNote, setGeneratedNote] = useState("Aucune note préparée.");
  const [statusById, setStatusById] = useState<Record<string, string>>({});
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [aiEnabled, setAiEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(ministryAiModules.map((module) => [module.name, module.status !== "Désactivée"]))
  );

  const selectedQuay = quayProfiles.find((item) => item.id === selectedQuayId) ?? quayProfiles[0];
  const module = modules.find((item) => item.id === active) ?? modules[0];

  const nationalExecution = Math.round(quayProfiles.reduce((sum, item) => sum + item.metrics.budgetExecution, 0) / quayProfiles.length);
  const criticalQuays = quayProfiles.filter((item) => item.tension === "Critique" || item.tension === "Forte");
  const totalIncidents = quayProfiles.reduce((sum, item) => sum + item.metrics.openIncidents, 0);

  const insights = useMemo<Insight[]>(() => {
    if (active === "national") {
      return [
        { label: "Quais sous tension", value: String(criticalQuays.length), detail: "priorité nationale", tone: "red", progress: 68 },
        { label: "Exécution moyenne", value: `${nationalExecution}%`, detail: "programmes pilotes", tone: "blue", progress: nationalExecution },
        { label: "Incidents ouverts", value: String(totalIncidents), detail: "à instruire", tone: "amber", progress: 54 }
      ];
    }
    return [
      { label: "Tension", value: selectedQuay.tension, detail: selectedQuay.mainRisk, tone: tensionTone(selectedQuay.tension), progress: selectedQuay.priorityScore },
      { label: "Exécution", value: `${selectedQuay.metrics.budgetExecution}%`, detail: "budget consommé", tone: selectedQuay.metrics.budgetExecution < 65 ? "amber" : "green", progress: selectedQuay.metrics.budgetExecution },
      { label: "Financement", value: formatFcfa(selectedQuay.metrics.pendingFundingFcfa), detail: "en attente", tone: selectedQuay.metrics.pendingFundingFcfa > 40 ? "red" : "blue", progress: Math.min(selectedQuay.metrics.pendingFundingFcfa * 1.4, 100) }
    ];
  }, [active, criticalQuays.length, nationalExecution, selectedQuay, totalIncidents]);

  function addPendingAction(label: string, type: string) {
    const action = {
      id: `${Date.now()}-${pendingActions.length}`,
      label,
      quay: selectedQuay.name,
      type
    };
    setPendingActions((items) => [action, ...items].slice(0, 6));
    setMessage(`${label}. Simulation MVP - action visible dans le parcours.`);
  }

  function prepareNote(context = selectedQuay.name) {
    const note = `Brouillon ${context}: ${selectedQuay.mainRisk}. Action recommandée: ${selectedQuay.recommendedAction} Donnée à vérifier: ${selectedQuay.missingData}.`;
    setGeneratedNote(note);
    addPendingAction(`Note d'arbitrage préparée pour ${context}`, "Note");
  }

  function requestReferentReport(referent: QuayReferent) {
    setStatusById((items) => ({ ...items, [referent.id]: "Compte rendu demandé" }));
    setGeneratedNote(`Note terrain ${selectedQuay.name}: demander à ${referent.name} (${referent.role}) de confirmer ${referent.needs}.`);
    addPendingAction(`Compte rendu demandé à ${referent.name}`, "Référent");
  }

  function flagBudgetGap() {
    setStatusById((items) => ({ ...items, [`budget-${selectedQuay.id}`]: "Écart signalé" }));
    setGeneratedNote(`Arbitrage budget ${selectedQuay.name}: ${selectedQuay.budget.variance}. Financement en attente: ${formatFcfa(selectedQuay.budget.pendingFunding)} FCFA.`);
    addPendingAction(`Écart budget signalé pour ${selectedQuay.name}`, "Budget");
  }

  function requestMaintenance(resource: string) {
    setStatusById((items) => ({ ...items, [`resource-${selectedQuay.id}-${resource}`]: "Maintenance demandée" }));
    addPendingAction(`Maintenance demandée: ${resource}`, "Ressource");
  }

  function prioritizeQuay() {
    setStatusById((items) => ({ ...items, [`priority-${selectedQuay.id}`]: "Priorité renforcée" }));
    addPendingAction(`${selectedQuay.name} priorisé`, "Priorité");
  }

  return (
    <main className="min-h-screen bg-[#f3faf8] text-slate-950">
      <header className="border-b border-cyan-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[94rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white shadow-sm shadow-cyan-900/20">Mb</Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministère des Pêches · espace privé</p>
              <h1 className="text-2xl font-black tracking-tight">Pilotage institutionnel quai par quai</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-900">Données mockées</span>
            <Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">Portail espaces</Link>
            <button onClick={() => prepareNote()} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Préparer une note</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[94rem] gap-5 px-5 py-5 sm:px-8">
        <div className="rounded-[1.5rem] border border-cyan-100 bg-white p-3 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {modules.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${active === item.id ? "bg-cyan-700 text-white" : "bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-950"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_23rem]">
          <div className="grid gap-5">
            <ModuleQuestion title={module.label} question={module.question} message={message} />
            <QuaySelector selectedQuayId={selectedQuayId} onSelect={(id) => { setSelectedQuayId(id); setActive("map"); setMessage(`${quayProfiles.find((item) => item.id === id)?.name ?? "Quai"} sélectionné. Les indicateurs se mettent à jour.`); }} />
            <section className="grid gap-3 md:grid-cols-3">
              {insights.map((insight, index) => <VisualMetric key={insight.label} insight={insight} variant={index === 0 ? "donut" : "bar"} />)}
            </section>
            {renderExploration()}
          </div>
          <DecisionRail />
        </div>
      </section>
    </main>
  );

  function renderExploration() {
    if (active === "map") return <MapView />;
    if (active === "alerts") return <IncidentView />;
    if (active === "budgets") return <BudgetView />;
    if (active === "resources") return <ResourceView />;
    if (active === "proofs") return <ProofView />;
    return <NationalView />;
  }

  function NationalView() {
    return (
      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <CompactPanel title="Priorités nationales" subtitle="Du signal national à l'action locale">
          <div className="grid gap-3">
            {quayProfiles.slice().sort((a, b) => b.priorityScore - a.priorityScore).slice(0, 4).map((quay) => (
              <button key={quay.id} onClick={() => { setSelectedQuayId(quay.id); setActive("map"); }} className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left sm:grid-cols-[6rem_1fr_6rem] sm:items-center">
                <span className="font-black">{quay.name}</span>
                <span className="text-sm font-semibold text-slate-600">{quay.mainRisk}</span>
                <span className="rounded-full bg-white px-3 py-2 text-center text-xs font-black text-cyan-900">Score {quay.priorityScore}</span>
              </button>
            ))}
          </div>
        </CompactPanel>
        <CompactPanel title="Lecture IA" subtitle="Question -> insight -> action -> trace">
          <p className="text-sm font-bold leading-6 text-slate-700">{selectedQuay.name} est le quai à suivre : {selectedQuay.mainRisk}. L'action recommandée est de {selectedQuay.recommendedAction.toLowerCase()}</p>
          <ActionStrip primary="Préparer note" secondary={["Ouvrir carte", "Voir référents"]} onPrimary={() => prepareNote()} onSecondary={(item) => item === "Ouvrir carte" ? setActive("map") : setActive("resources")} />
        </CompactPanel>
      </section>
    );
  }

  function MapView() {
    return (
      <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <CompactPanel title="Carte des quais pilotes" subtitle="Sélection dynamique et mise à jour des indicateurs">
          <div className="relative min-h-[31rem] overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_18%_16%,rgba(20,184,166,0.24),transparent_28%),linear-gradient(140deg,#f8fafc,#dff7f4_44%,#f7e7c3)]">
            <div className="absolute left-[22%] top-8 h-[86%] w-8 rounded-full border-l-4 border-cyan-300/80" />
            <div className="absolute inset-x-6 bottom-5 rounded-2xl border border-white/70 bg-white/80 p-3 backdrop-blur">
              <div className="grid gap-2 sm:grid-cols-5">
                {quayProfiles.map((quay) => (
                  <button key={quay.id} onClick={() => setSelectedQuayId(quay.id)} className={`rounded-2xl px-3 py-2 text-left text-xs font-black transition ${selectedQuay.id === quay.id ? "bg-cyan-700 text-white" : "bg-white text-slate-600 hover:bg-cyan-50"}`}>
                    {quay.name}<span className="block text-[0.65rem] opacity-70">{quay.tension}</span>
                  </button>
                ))}
              </div>
            </div>
            {quayProfiles.map((quay) => (
              <button
                key={quay.id}
                type="button"
                onClick={() => setSelectedQuayId(quay.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${selectedQuay.id === quay.id ? "h-12 w-12 ring-8 ring-cyan-800/10" : "h-7 w-7"} ${tensionDot(quay.tension)}`}
                style={{ left: `${quay.x}%`, top: `${quay.y}%` }}
                aria-label={`Sélectionner ${quay.name}`}
              />
            ))}
            {quayProfiles.map((quay) => <span key={`${quay.id}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-black text-slate-700 shadow-sm" style={{ left: `${quay.x}%`, top: `calc(${quay.y}% + 1.55rem)` }}>{quay.name}</span>)}
          </div>
        </CompactPanel>
        <QuayCard />
      </section>
    );
  }

  function IncidentView() {
    return (
      <CompactPanel title={`Triage incidents · ${selectedQuay.name}`} subtitle="Réagir vite et garder une trace">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <MiniStat label="Incidents" value={String(selectedQuay.metrics.openIncidents)} tone="red" />
          <MiniStat label="Ressources" value={String(selectedQuay.metrics.criticalResources)} tone="amber" />
          <MiniStat label="Priorité" value={`${selectedQuay.priorityScore}/100`} tone="blue" />
        </div>
        <div className="grid gap-3">
          {selectedQuay.incidents.map((incident) => (
            <div key={incident} className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-black text-slate-900">{incident}</p><p className="text-sm font-semibold text-slate-500">Statut : {statusById[`incident-${selectedQuay.id}-${incident}`] ?? "Ouvert"}</p></div>
              <button onClick={() => { setStatusById((items) => ({ ...items, [`incident-${selectedQuay.id}-${incident}`]: "Vérification demandée" })); addPendingAction(`Vérification demandée: ${incident}`, "Incident"); }} className="rounded-full bg-cyan-700 px-3 py-2 text-xs font-black text-white">Vérifier</button>
            </div>
          ))}
        </div>
      </CompactPanel>
    );
  }

  function BudgetView() {
    return (
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <CompactPanel title={`Budget · ${selectedQuay.name}`} subtitle="Écarts utiles à l'arbitrage">
          <div className="grid place-items-center gap-4">
            <Donut value={selectedQuay.metrics.budgetExecution} label="Exécution" tone={selectedQuay.metrics.budgetExecution < 65 ? "amber" : "green"} />
            <div className="w-full grid gap-3">
              <ProgressRow label="Prévu" value={selectedQuay.budget.planned} max={selectedQuay.budget.planned} tone="slate" />
              <ProgressRow label="Engagé" value={selectedQuay.budget.committed} max={selectedQuay.budget.planned} tone="blue" />
              <ProgressRow label="Consommé" value={selectedQuay.budget.consumed} max={selectedQuay.budget.planned} tone="green" />
            </div>
          </div>
        </CompactPanel>
        <CompactPanel title="Programmes et écarts" subtitle="Pas une comptabilité complète, une aide à l'arbitrage">
          <div className="grid gap-3">
            {selectedQuay.programs.map((program) => (
              <div key={program.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div><p className="font-black text-slate-900">{program.name}</p><p className="text-sm font-semibold text-slate-500">{program.owner} · {program.risk}</p></div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-cyan-900">{statusById[`program-${program.name}`] ?? program.status}</span>
                </div>
              </div>
            ))}
            <p className="rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-950">{selectedQuay.budget.variance}</p>
            <ActionStrip primary="Signaler écart" secondary={["Préparer arbitrage", "Demander preuve"]} onPrimary={flagBudgetGap} onSecondary={(item) => item.includes("arbitrage") ? prepareNote() : addPendingAction(`${item}: ${selectedQuay.name}`, "Budget")} />
          </div>
        </CompactPanel>
      </section>
    );
  }

  function ResourceView() {
    return (
      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <CompactPanel title={`Capacité opérationnelle · ${selectedQuay.name}`} subtitle="Moyens critiques et disponibilités">
          <div className="grid gap-3">
            {selectedQuay.resources.map((resource) => (
              <div key={resource} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div><p className="font-black">{resource}</p><p className="text-xs font-bold text-slate-500">{statusById[`resource-${selectedQuay.id}-${resource}`] ?? "À suivre"}</p></div>
                  <button onClick={() => requestMaintenance(resource)} className="rounded-full bg-cyan-700 px-3 py-2 text-xs font-black text-white">Maintenance</button>
                </div>
              </div>
            ))}
          </div>
        </CompactPanel>
        <CompactPanel title="Référents terrain" subtitle="Points d'ancrage de coordination, pas CRM">
          <div className="grid gap-3">
            {selectedQuay.referents.map((referent) => <ReferentCard key={referent.id} referent={referent} onAction={() => requestReferentReport(referent)} status={statusById[referent.id]} />)}
          </div>
        </CompactPanel>
      </section>
    );
  }

  function ProofView() {
    return (
      <section className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
        <CompactPanel title="Trace décisionnelle" subtitle="Preuves, note et actions en attente">
          <div className="grid gap-3">
            {selectedQuay.proofs.map((proof) => <div key={proof} className="rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-950">{proof}</div>)}
            <div className="rounded-2xl bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-950">{generatedNote}</div>
            <ActionStrip primary="Générer note" secondary={["Valider preuve", "Historiser"]} onPrimary={() => prepareNote()} onSecondary={(item) => addPendingAction(`${item}: ${selectedQuay.name}`, "Trace")} />
          </div>
        </CompactPanel>
        <CompactPanel title="Gouvernance IA" subtitle="Modules activables ou désactivables">
          <div className="grid gap-2">
            {ministryAiModules.map((item) => (
              <button key={item.name} onClick={() => setAiEnabled((values) => ({ ...values, [item.name]: !values[item.name] }))} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3 text-left">
                <span><span className="block text-sm font-black">{item.name}</span><span className="block text-xs font-semibold text-slate-500">{item.control}</span></span>
                <span className={`rounded-full px-2 py-1 text-[0.65rem] font-black ${aiEnabled[item.name] ? "bg-emerald-100 text-emerald-900" : "bg-slate-200 text-slate-600"}`}>{aiEnabled[item.name] ? item.status : "Désactivée"}</span>
              </button>
            ))}
          </div>
        </CompactPanel>
      </section>
    );
  }

  function QuayCard() {
    return (
      <CompactPanel title={`Fiche quai · ${selectedQuay.name}`} subtitle={`${selectedQuay.commune} · ${selectedQuay.region} · ${selectedQuay.lat}, ${selectedQuay.lng}`}>
        <div className="grid gap-3">
          <div className={`rounded-2xl border p-3 ${toneClass[tensionTone(selectedQuay.tension)]}`}>
            <p className="text-xs font-black uppercase tracking-[0.12em] opacity-70">Risque dominant</p>
            <p className="mt-2 text-sm font-black leading-6">{selectedQuay.mainRisk}</p>
          </div>
          <Row label="Score priorité" value={`${selectedQuay.priorityScore}/100`} />
          <Row label="Programmes" value={String(selectedQuay.metrics.activePrograms)} />
          <Row label="Incidents" value={String(selectedQuay.metrics.openIncidents)} />
          <Row label="Référents" value={String(selectedQuay.metrics.availableReferents)} />
          <p className="rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950">{selectedQuay.recommendedAction}</p>
          <ActionStrip primary="Prioriser quai" secondary={["Note territoire", "Vérifier preuve"]} onPrimary={prioritizeQuay} onSecondary={(item) => item.includes("Note") ? prepareNote() : addPendingAction(`${item}: ${selectedQuay.name}`, "Quai")} />
        </div>
      </CompactPanel>
    );
  }

  function DecisionRail() {
    return (
      <aside className="grid content-start gap-4">
        <CompactPanel title="Insight IA quai" subtitle="IA simulée - données mockées">
          <p className="text-xl font-black text-slate-950">{selectedQuay.name} · {selectedQuay.tension}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{selectedQuay.mainRisk}. Action recommandée : {selectedQuay.recommendedAction}</p>
          <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-950">Donnée à vérifier : {selectedQuay.missingData}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ministryQuickQuestions.slice(0, 4).map((question) => <button key={question} onClick={() => addPendingAction(`Question IA: ${question}`, "IA")} className="rounded-full border border-cyan-100 bg-white px-3 py-2 text-xs font-black text-cyan-950">{question}</button>)}
          </div>
        </CompactPanel>
        <CompactPanel title="Actions en attente" subtitle="Trace du parcours">
          <div className="grid gap-2">
            {pendingActions.length === 0 ? <p className="text-sm font-semibold text-slate-500">Aucune action générée pour l'instant.</p> : pendingActions.map((action) => (
              <div key={action.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="text-sm font-black text-slate-900">{action.label}</p>
                <p className="text-xs font-bold text-slate-500">{action.type} · {action.quay}</p>
              </div>
            ))}
          </div>
        </CompactPanel>
      </aside>
    );
  }
}

function ModuleQuestion({ title, question, message }: { title: string; question: string; message: string }) {
  return (
    <section className="rounded-[1.75rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white shadow-xl shadow-cyan-950/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">{title}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{question}</h2>
        </div>
        <p className="max-w-md rounded-2xl bg-white/10 p-3 text-sm font-bold leading-6 text-white/75 ring-1 ring-white/10">{message}</p>
      </div>
    </section>
  );
}

function QuaySelector({ selectedQuayId, onSelect }: { selectedQuayId: string; onSelect: (id: string) => void }) {
  return (
    <section className="rounded-[1.25rem] border border-cyan-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {quayProfiles.map((quay) => (
          <button key={quay.id} onClick={() => onSelect(quay.id)} className={`rounded-full px-4 py-2 text-sm font-black transition ${selectedQuayId === quay.id ? "bg-cyan-700 text-white" : "bg-slate-50 text-slate-600 hover:bg-cyan-50"}`}>
            {quay.name} <span className="ml-1 opacity-70">{quay.priorityScore}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function VisualMetric({ insight, variant }: { insight: Insight; variant: "donut" | "bar" }) {
  const progress = insight.progress ?? 50;
  return (
    <div className={`rounded-[1.25rem] border p-4 ${toneClass[insight.tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{insight.label}</p>
          <p className="mt-2 text-2xl font-black">{insight.value}</p>
          <p className="mt-1 line-clamp-2 text-xs font-bold opacity-70">{insight.detail}</p>
        </div>
        {variant === "donut" ? <Donut value={progress} tone={insight.tone} small /> : <MiniBars value={progress} tone={insight.tone} />}
      </div>
    </div>
  );
}

function Donut({ value, label, tone, small = false }: { value: number; label?: string; tone: MinistryTone; small?: boolean }) {
  return (
    <div className={`grid ${small ? "h-16 w-16" : "h-36 w-36"} place-items-center rounded-full bg-white shadow-inner`} style={{ background: `conic-gradient(currentColor ${Math.min(value, 100)}%, rgba(255,255,255,0.7) 0)` }}>
      <div className={`${small ? "h-11 w-11 text-xs" : "h-24 w-24 text-lg"} grid place-items-center rounded-full bg-white font-black ${toneClass[tone]}`}>{value}%{label ? <span className="block text-[0.65rem]">{label}</span> : null}</div>
    </div>
  );
}

function MiniBars({ value, tone }: { value: number; tone: MinistryTone }) {
  return (
    <div className="grid h-16 w-16 items-end gap-1 grid-cols-4">
      {[38, 58, 74, value].map((bar, index) => <span key={index} className={`rounded-t ${fillClass[tone]}`} style={{ height: `${Math.max(18, Math.min(bar, 96))}%` }} />)}
    </div>
  );
}

function ProgressRow({ label, value, max, tone }: { label: string; value: number; max: number; tone: MinistryTone }) {
  const percent = Math.round((value / max) * 100);
  return <div><div className="mb-1 flex justify-between text-xs font-black text-slate-500"><span>{label}</span><span>{value} M FCFA</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><span className={`block h-3 rounded-full ${fillClass[tone]}`} style={{ width: `${percent}%` }} /></div></div>;
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: MinistryTone }) {
  return <div className={`rounded-2xl border p-3 ${toneClass[tone]}`}><p className="text-xs font-black uppercase opacity-60">{label}</p><p className="mt-1 text-xl font-black">{value}</p></div>;
}

function ReferentCard({ referent, status, onAction }: { referent: QuayReferent; status?: string; onAction: () => void }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-700 to-emerald-500 text-sm font-black text-white">{referent.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div><p className="font-black text-slate-950">{referent.name}</p><p className="text-xs font-bold text-slate-500">{referent.role} · confiance {referent.trust}</p></div>
            <span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-black text-cyan-900">{status ?? referent.availability}</span>
          </div>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Besoin : {referent.needs}. Dernier CR : {referent.lastReport}.</p>
          <button onClick={onAction} className="mt-3 rounded-full bg-cyan-700 px-3 py-2 text-xs font-black text-white">{referent.action}</button>
        </div>
      </div>
    </div>
  );
}

function CompactPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="rounded-[1.35rem] border border-cyan-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function ActionStrip({ primary, secondary, onPrimary, onSecondary }: { primary: string; secondary: string[]; onPrimary: () => void; onSecondary: (item: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={onPrimary} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">{primary}</button>
      {secondary.slice(0, 2).map((item) => <button key={item} onClick={() => onSecondary(item)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">{item}</button>)}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2 text-sm font-bold"><span className="text-slate-500">{label}</span><span className="text-right text-slate-950">{value}</span></div>;
}