"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ministryActors,
  ministryAiModules,
  ministryBudgetLines,
  ministryIncidents,
  ministryKpis,
  ministryProofs,
  ministryQuickQuestions,
  ministryResources,
  ministryTerritories,
  type MinistryTerritory,
  type MinistryTone
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

type Insight = {
  label: string;
  value: string;
  detail: string;
  tone: MinistryTone;
};

const toneClass: Record<MinistryTone, string> = {
  blue: "border-cyan-200 bg-cyan-50 text-cyan-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  red: "border-rose-200 bg-rose-50 text-rose-950",
  slate: "border-slate-200 bg-slate-50 text-slate-900"
};

function tensionClass(tension: MinistryTerritory["tension"]) {
  if (tension === "Critique") return "bg-rose-500";
  if (tension === "Forte") return "bg-amber-400";
  if (tension === "Moyenne") return "bg-yellow-300";
  return "bg-emerald-400";
}

export function MinistryInstitutionalSpace() {
  const [active, setActive] = useState<ModuleId>("national");
  const [selectedTerritory, setSelectedTerritory] = useState(ministryTerritories.find((item) => item.name === "Joal") ?? ministryTerritories[0]);
  const [tensionFilter, setTensionFilter] = useState("Toutes");
  const [message, setMessage] = useState("IA simulée - données mockées. L'humain valide chaque décision.");
  const [generatedNote, setGeneratedNote] = useState("Aucune note préparée.");
  const [statusById, setStatusById] = useState<Record<string, string>>({});
  const [aiEnabled, setAiEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(ministryAiModules.map((module) => [module.name, module.status !== "Désactivée"]))
  );

  const module = modules.find((item) => item.id === active) ?? modules[0];
  const filteredTerritories = ministryTerritories.filter((territory) => tensionFilter === "Toutes" || territory.tension === tensionFilter);
  const proofForTerritory = ministryProofs.find((proof) => proof.territory === selectedTerritory.name) ?? ministryProofs[0];

  const insights = useMemo<Insight[]>(() => {
    if (active === "map") {
      return [
        { label: "Zone prioritaire", value: selectedTerritory.name, detail: selectedTerritory.tension, tone: selectedTerritory.tension === "Critique" ? "red" : "amber" },
        { label: "Signaux", value: String(selectedTerritory.signals), detail: "remontées terrain", tone: "blue" },
        { label: "Budget associé", value: selectedTerritory.budget, detail: "mock pilotage", tone: "green" }
      ];
    }
    if (active === "alerts") {
      return [
        { label: "Incidents ouverts", value: String(ministryIncidents.length), detail: "2 critiques", tone: "red" },
        { label: "Réaction", value: "24h", detail: "fenêtre cible", tone: "amber" },
        { label: "Ressource touchée", value: "4", detail: "à vérifier", tone: "blue" }
      ];
    }
    if (active === "budgets") {
      return [
        { label: "Exécution", value: "64%", detail: "moyenne", tone: "blue" },
        { label: "Écarts", value: "4", detail: "dossiers", tone: "amber" },
        { label: "Sous-utilisés", value: "2", detail: "financements", tone: "red" }
      ];
    }
    if (active === "resources") {
      return [
        { label: "Critiques", value: "9", detail: "ressources", tone: "red" },
        { label: "Acteurs clés", value: String(ministryActors.length), detail: "mobilisables", tone: "green" },
        { label: "Disponible", value: "3 agents", detail: "Mbour", tone: "blue" }
      ];
    }
    if (active === "proofs") {
      return [
        { label: "Preuves", value: String(ministryProofs.length), detail: "récentes", tone: "green" },
        { label: "IA notes", value: "Brouillon", detail: "humain valide", tone: "blue" },
        { label: "Accès", value: "6 modules", detail: "gouvernés", tone: "slate" }
      ];
    }
    return ministryKpis.slice(0, 3);
  }, [active, selectedTerritory]);

  function simulate(action: string) {
    setMessage(`${action}. Simulation MVP - action non connectée au backend`);
  }

  function prepareNote(context = selectedTerritory.name) {
    setGeneratedNote(`Note d'arbitrage ${context}: prioriser la zone, vérifier la preuve ${proofForTerritory.level.toLowerCase()} et affecter un responsable.`);
    simulate(`Note préparée pour ${context}`);
  }

  return (
    <main className="min-h-screen bg-[#f4faf9] text-slate-950">
      <header className="border-b border-cyan-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-[92rem] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="grid h-11 w-11 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</Link>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministère des Pêches · espace privé</p>
              <h1 className="text-2xl font-black tracking-tight">Pilotage institutionnel</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-900">Simulation premium</span>
            <Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">Portail espaces</Link>
            <button onClick={() => prepareNote()} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">Préparer une note</button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-[92rem] gap-5 px-5 py-5 sm:px-8">
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

        <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
          <div className="grid gap-5">
            <ModuleQuestion title={module.label} question={module.question} message={message} />
            <section className="grid gap-3 md:grid-cols-3">
              {insights.map((insight) => <MetricTile key={insight.label} insight={insight} />)}
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
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <CompactPanel title="Insight national" subtitle="Lecture en 60 secondes">
          <div className="grid gap-3">
            {[
              ["Joal", "Froid critique + budget en justification", "Prioriser"],
              ["Saint-Louis", "Risque de doublon programme", "Vérifier"],
              ["Kayar", "Relais terrain fragile", "Affecter"]
            ].map(([zone, insight, action]) => (
              <button key={zone} onClick={() => { setSelectedTerritory(ministryTerritories.find((territory) => territory.name === zone) ?? selectedTerritory); setActive("map"); }} className="grid gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-left sm:grid-cols-[7rem_1fr_6rem] sm:items-center">
                <span className="font-black">{zone}</span>
                <span className="text-sm font-semibold text-slate-600">{insight}</span>
                <span className="rounded-full bg-white px-3 py-2 text-center text-xs font-black text-cyan-900">{action}</span>
              </button>
            ))}
          </div>
        </CompactPanel>
        <CompactPanel title="Lecture IA" subtitle="Synthèse courte, non publiée">
          <p className="text-sm font-bold leading-6 text-slate-700">Joal doit être traité d'abord. Mbour demande une preuve complémentaire. Saint-Louis doit être vérifié avant nouvel engagement.</p>
          <ActionStrip primary="Préparer note" secondary={["Ouvrir Joal", "Voir preuves"]} onPrimary={() => prepareNote("Joal")} onSecondary={(item) => simulate(item)} />
        </CompactPanel>
      </section>
    );
  }

  function MapView() {
    return (
      <section className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <CompactPanel title="Exploration territoriale" subtitle="Carte stylisée des quais pilotes">
          <div className="mb-3 flex flex-wrap gap-2">
            {["Toutes", "Critique", "Forte", "Moyenne", "Faible"].map((item) => (
              <button key={item} onClick={() => setTensionFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-black ${tensionFilter === item ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600"}`}>{item}</button>
            ))}
          </div>
          <div className="relative min-h-[30rem] overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_16%_18%,rgba(20,184,166,0.24),transparent_30%),linear-gradient(140deg,#f8fafc,#dff7f4_46%,#f7e7c3)]">
            <div className="absolute left-[22%] top-8 h-[86%] w-8 rounded-full border-l-4 border-cyan-300/80" />
            {filteredTerritories.map((territory) => (
              <button
                key={territory.name}
                type="button"
                onClick={() => { setSelectedTerritory(territory); simulate(`${territory.name} sélectionné`); }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${selectedTerritory.name === territory.name ? "h-10 w-10 ring-4 ring-cyan-800/20" : "h-7 w-7"} ${tensionClass(territory.tension)}`}
                style={{ left: `${territory.x}%`, top: `${territory.y}%` }}
                aria-label={`Sélectionner ${territory.name}`}
              />
            ))}
            {filteredTerritories.map((territory) => <span key={`${territory.name}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-black text-slate-700 shadow-sm" style={{ left: `${territory.x}%`, top: `calc(${territory.y}% + 1.35rem)` }}>{territory.name}</span>)}
          </div>
        </CompactPanel>
        <CompactPanel title={selectedTerritory.name} subtitle={`${selectedTerritory.zone} · ${selectedTerritory.lat}, ${selectedTerritory.lng}`}>
          <div className="grid gap-2 text-sm font-bold text-slate-700">
            <Row label="Tension" value={selectedTerritory.tension} />
            <Row label="Signaux" value={String(selectedTerritory.signals)} />
            <Row label="Budget" value={selectedTerritory.budget} />
            <Row label="Preuve" value={proofForTerritory.level} />
          </div>
          <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-950">{selectedTerritory.priority}</p>
          <ActionStrip primary="Prioriser zone" secondary={["Vérifier", "Note territoire"]} onPrimary={() => simulate(`Zone priorisée: ${selectedTerritory.name}`)} onSecondary={(item) => item.includes("Note") ? prepareNote(selectedTerritory.name) : simulate(item)} />
        </CompactPanel>
      </section>
    );
  }

  function IncidentView() {
    return (
      <CompactPanel title="Triage incidents" subtitle="Sévérité, responsable, prochaine action">
        <DataTable
          headers={["Incident", "Zone", "Gravité", "Statut", "Action"]}
          rows={ministryIncidents.map((incident) => [
            incident.title,
            incident.territory,
            incident.severity,
            statusById[incident.id] ?? incident.status,
            <button key={incident.id} onClick={() => { setStatusById((items) => ({ ...items, [incident.id]: "Vérification demandée" })); simulate(`Vérification demandée: ${incident.title}`); }} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Vérifier</button>
          ])}
        />
      </CompactPanel>
    );
  }

  function BudgetView() {
    return (
      <CompactPanel title="Pilotage budgets" subtitle="Écarts utiles à l'arbitrage, pas comptabilité complète">
        <DataTable
          headers={["Programme", "Zone", "Exécution", "Écart", "Action"]}
          rows={ministryBudgetLines.map((line) => [
            line.program,
            line.territory,
            <span key={`${line.id}-rate`} className="flex items-center gap-2"><span className="h-2 w-20 overflow-hidden rounded-full bg-cyan-50"><span className="block h-2 rounded-full bg-cyan-700" style={{ width: `${line.executionRate}%` }} /></span>{line.executionRate}%</span>,
            line.variance,
            <button key={line.id} onClick={() => { setStatusById((items) => ({ ...items, [line.id]: "Arbitrage demandé" })); simulate(`Arbitrage demandé: ${line.program}`); }} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Arbitrer</button>
          ])}
        />
      </CompactPanel>
    );
  }

  function ResourceView() {
    return (
      <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <CompactPanel title="Capacité opérationnelle" subtitle="Moyens critiques et disponibilité">
          <DataTable
            headers={["Ressource", "Zone", "État", "Action"]}
            rows={ministryResources.map((resource) => [
              resource.name,
              resource.territory,
              statusById[resource.id] ?? resource.state,
              <button key={resource.id} onClick={() => { setStatusById((items) => ({ ...items, [resource.id]: "Maintenance demandée" })); simulate(`Maintenance demandée: ${resource.name}`); }} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Maintenance</button>
            ])}
          />
        </CompactPanel>
        <CompactPanel title="Acteurs clés" subtitle="Responsables mobilisables">
          <div className="grid gap-2">
            {ministryActors.map((actor) => (
              <button key={actor.name} onClick={() => simulate(`Fiche acteur: ${actor.name}`)} className="rounded-2xl bg-slate-50 p-3 text-left">
                <span className="block text-sm font-black">{actor.name}</span>
                <span className="block text-xs font-semibold text-slate-500">{actor.type} · {actor.territory} · {actor.trust}</span>
              </button>
            ))}
          </div>
        </CompactPanel>
      </section>
    );
  }

  function ProofView() {
    return (
      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <CompactPanel title="Trace décisionnelle" subtitle="Preuves récentes et note d'arbitrage">
          <DataTable
            headers={["Source", "Zone", "Niveau", "Décision"]}
            rows={ministryProofs.map((proof) => [proof.source, proof.territory, proof.level, proof.linkedDecision])}
          />
        </CompactPanel>
        <CompactPanel title="Gouvernance IA" subtitle="IA assiste, humain valide">
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

  function DecisionRail() {
    return (
      <aside className="grid content-start gap-4">
        <CompactPanel title="Action recommandée" subtitle="1 décision principale">
          <p className="text-2xl font-black text-slate-950">{active === "budgets" ? "Préparer arbitrage" : active === "alerts" ? "Demander vérification" : active === "proofs" ? "Valider la trace" : "Prioriser Joal"}</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Lecture progressive : question, insight, exploration, action, trace.</p>
          <ActionStrip primary={active === "proofs" ? "Valider preuve" : "Préparer note"} secondary={["Historiser", "Partager"]} onPrimary={() => active === "proofs" ? simulate("Preuve validée") : prepareNote()} onSecondary={(item) => simulate(item)} />
        </CompactPanel>
        <CompactPanel title="Trace" subtitle="Preuve reliée">
          <p className="text-sm font-black text-slate-900">{proofForTerritory.source}</p>
          <p className="mt-1 text-sm font-semibold text-slate-500">{proofForTerritory.level} · {proofForTerritory.date}</p>
          <p className="mt-4 rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950">{generatedNote}</p>
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

function MetricTile({ insight }: { insight: Insight }) {
  return (
    <div className={`rounded-[1.25rem] border p-4 ${toneClass[insight.tone]}`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{insight.label}</p>
      <p className="mt-3 text-3xl font-black">{insight.value}</p>
      <p className="mt-1 text-sm font-bold opacity-70">{insight.detail}</p>
    </div>
  );
}

function CompactPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
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

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100">
      <table className="w-full min-w-[44rem] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="p-3 font-black">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 font-semibold text-slate-700">{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2"><span className="text-slate-500">{label}</span><span className="text-right text-slate-950">{value}</span></div>;
}
