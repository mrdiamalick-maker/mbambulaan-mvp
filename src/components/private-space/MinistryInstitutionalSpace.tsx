"use client";

import { useState } from "react";
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

const navItems = [
  "Vue nationale",
  "Carte et territoires",
  "Alertes et incidents",
  "Programmes et budgets",
  "Ressources et acteurs",
  "Notes, preuves et accès"
];

const toneClass: Record<MinistryTone, string> = {
  blue: "border-cyan-200 bg-cyan-50 text-cyan-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-rose-200 bg-rose-50 text-rose-900",
  slate: "border-slate-200 bg-stone-50 text-slate-800"
};

function tensionClass(tension: MinistryTerritory["tension"]) {
  if (tension === "Critique") return "bg-rose-500";
  if (tension === "Forte") return "bg-amber-400";
  if (tension === "Moyenne") return "bg-yellow-300";
  return "bg-emerald-400";
}

export function MinistryInstitutionalSpace() {
  const [activeNav, setActiveNav] = useState(navItems[0]);
  const [selectedTerritory, setSelectedTerritory] = useState(ministryTerritories.find((item) => item.name === "Joal") ?? ministryTerritories[0]);
  const [tensionFilter, setTensionFilter] = useState("Toutes");
  const [message, setMessage] = useState("IA simulée - données mockées. Les décisions restent humaines et validées par rôle.");
  const [generatedNote, setGeneratedNote] = useState("");
  const [budgetStatus, setBudgetStatus] = useState<Record<string, string>>({});
  const [resourceStatus, setResourceStatus] = useState<Record<string, string>>({});
  const [incidentStatus, setIncidentStatus] = useState<Record<string, string>>({});
  const [aiEnabled, setAiEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(ministryAiModules.map((module) => [module.name, module.status !== "Désactivée"]))
  );

  const filteredTerritories = ministryTerritories.filter((territory) => tensionFilter === "Toutes" || territory.tension === tensionFilter);
  const criticalTerritories = ministryTerritories.filter((territory) => territory.tension === "Critique" || territory.tension === "Forte");

  function simulate(action: string) {
    setMessage(`${action}. Simulation MVP - action non connectée au backend`);
  }

  function prepareNote(context = selectedTerritory.name) {
    setGeneratedNote(
      `Brouillon de note : prioriser ${context}, vérifier les preuves terrain, rapprocher les financements en retard et affecter une ressource responsable avant arbitrage.`
    );
    simulate(`Note préparée pour ${context}`);
  }

  return (
    <div className="min-h-screen bg-[#f5fbfa] text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[18rem_1fr]">
        <aside className="hidden border-r border-cyan-100 bg-white p-5 xl:block">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-700 text-sm font-black text-white">Mb</span>
            <span>
              <span className="block font-black text-slate-950">Mbàmbulaan</span>
              <span className="text-xs font-bold text-cyan-700">Ministère des Pêches</span>
            </span>
          </Link>
          <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-800">Espace privé</p>
            <p className="mt-2 text-sm font-black text-slate-950">Pilotage institutionnel</p>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">Coordination, cartographie, programmes, budgets, preuves et décisions.</p>
          </div>
          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveNav(item)}
                className={`rounded-2xl px-3 py-2 text-left text-sm font-black transition ${
                  activeNav === item ? "bg-cyan-700 text-white shadow-sm" : "text-slate-600 hover:bg-cyan-50 hover:text-cyan-900"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          <header className="border-b border-cyan-100 bg-white/90 px-5 py-4 backdrop-blur sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">État / Ministère · Pack institutionnel</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Espace de pilotage institutionnel</h1>
                <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-slate-600">
                  Voir la situation nationale, prioriser les territoires, suivre programmes, budgets, ressources, incidents, preuves et préparer des notes d'arbitrage.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/espace-prive" className="rounded-full border border-cyan-200 bg-white px-5 py-3 text-center text-sm font-black text-cyan-950">Portail espaces</Link>
                <button onClick={() => prepareNote()} className="rounded-full bg-cyan-700 px-5 py-3 text-sm font-black text-white shadow-sm shadow-cyan-900/20">Préparer une note</button>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6 sm:px-8">
            <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm font-black text-cyan-900">{message}</div>
            {activeNav === "Carte et territoires" && <MapModule />}
            {activeNav === "Alertes et incidents" && <IncidentsModule />}
            {activeNav === "Programmes et budgets" && <BudgetsModule />}
            {activeNav === "Ressources et acteurs" && <ResourcesModule />}
            {activeNav === "Notes, preuves et accès" && <NotesModule />}
            {activeNav === "Vue nationale" && <OverviewModule />}
          </div>
        </main>
      </div>
    </div>
  );

  function OverviewModule() {
    return (
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          {ministryKpis.map((kpi, index) => <KpiCard key={kpi.label} {...kpi} index={index} onClick={() => simulate(`${kpi.label} ouvert`)} />)}
        </section>
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Synthèse IA simulée" subtitle="L'IA assiste, l'humain valide. Brouillon non publié.">
            <div className="rounded-2xl bg-cyan-50 p-5">
              <p className="text-sm font-bold leading-7 text-cyan-950">
                Joal concentre tension froide, incident critique et budget partiellement justifié. Kayar présente une ressource relais fragile. Saint-Louis nécessite une vérification de doublon programme avant nouvelle décision.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ministryQuickQuestions.slice(0, 4).map((question) => (
                  <button key={question} onClick={() => simulate(`Question IA : ${question}`)} className="rounded-full border border-cyan-200 bg-white px-3 py-2 text-xs font-black text-cyan-950">{question}</button>
                ))}
              </div>
            </div>
          </Panel>
          <Panel title="Décisions attendues" subtitle="Ce que l'espace aide à arbitrer cette semaine">
            <div className="grid gap-3">
              {["Prioriser le programme froid Joal", "Demander justification sur caisses Mbour", "Vérifier doublon Saint-Louis", "Affecter relais secondaire Kayar"].map((item) => (
                <button key={item} onClick={() => simulate(item)} className="rounded-2xl border border-cyan-100 bg-white p-4 text-left text-sm font-black text-slate-800 hover:border-cyan-500">{item}</button>
              ))}
            </div>
          </Panel>
        </div>
        <div className="grid gap-6 xl:grid-cols-3">
          <Panel title="Top zones critiques" subtitle="Priorisation territoire, preuve et prochaine action">
            <div className="grid gap-3">
              {criticalTerritories.map((territory) => (
                <button key={territory.name} onClick={() => { setSelectedTerritory(territory); setActiveNav("Carte et territoires"); simulate(`${territory.name} ouvert`); }} className="rounded-2xl bg-white p-4 text-left ring-1 ring-cyan-100">
                  <span className="flex items-center justify-between gap-3"><span className="font-black text-slate-950">{territory.name}</span><Badge>{territory.tension}</Badge></span>
                  <span className="mt-2 block text-sm font-semibold leading-6 text-slate-600">{territory.priority}</span>
                </button>
              ))}
            </div>
          </Panel>
          <Panel title="Alertes budgétaires" subtitle="Écarts utiles à la décision, sans comptabilité complète">
            <div className="grid gap-3">
              {ministryBudgetLines.slice(0, 3).map((line) => (
                <div key={line.id} className="rounded-2xl bg-amber-50 p-4">
                  <p className="font-black text-amber-950">{line.program}</p>
                  <p className="mt-1 text-sm font-bold text-amber-800">{line.variance}</p>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Dernières preuves validées" subtitle="Sources reliées aux décisions">
            <div className="grid gap-3">
              {ministryProofs.slice(0, 3).map((proof) => (
                <div key={proof.id} className="rounded-2xl bg-emerald-50 p-4">
                  <p className="font-black text-emerald-950">{proof.source}</p>
                  <p className="mt-1 text-sm font-bold text-emerald-800">{proof.level} · {proof.territory}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  function MapModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Panel title="Carte des quais et territoires" subtitle="Points de quais, tensions, programmes, ressources, incidents et preuves. Coordonnées lat/lng mockées.">
          <div className="mb-4 flex flex-wrap gap-2">
            {["Toutes", "Critique", "Forte", "Moyenne", "Faible"].map((item) => (
              <button key={item} onClick={() => setTensionFilter(item)} className={`rounded-full border px-4 py-2 text-xs font-black ${tensionFilter === item ? "border-cyan-700 bg-cyan-700 text-white" : "border-cyan-200 bg-white text-cyan-900"}`}>{item}</button>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_20rem]">
            <div className="relative min-h-[36rem] overflow-hidden rounded-[1.5rem] border border-cyan-200 bg-[radial-gradient(circle_at_16%_18%,rgba(20,184,166,0.22),transparent_30%),linear-gradient(140deg,#f8fafc,#dff7f4_46%,#f7e7c3)] p-4">
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
              {filteredTerritories.map((territory) => (
                <span key={`${territory.name}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-black text-slate-700 shadow-sm" style={{ left: `${territory.x}%`, top: `calc(${territory.y}% + 1.35rem)` }}>{territory.name}</span>
              ))}
            </div>
            <TerritoryDetail />
          </div>
        </Panel>
        <Panel title="Priorisation territoires" subtitle="Comparer rapidement avant arbitrage">
          <div className="grid gap-3">
            {ministryTerritories.map((territory) => (
              <button key={territory.name} onClick={() => setSelectedTerritory(territory)} className="rounded-2xl border border-cyan-100 bg-white p-4 text-left hover:border-cyan-500">
                <span className="flex items-center justify-between"><span className="font-black text-slate-950">{territory.name}</span><Badge>{territory.tension}</Badge></span>
                <span className="mt-2 block text-sm font-semibold text-slate-600">{territory.priority}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  function TerritoryDetail() {
    const linkedBudget = ministryBudgetLines.find((line) => line.territory === selectedTerritory.name);
    const linkedResource = ministryResources.find((resource) => resource.territory === selectedTerritory.name);
    const linkedIncident = ministryIncidents.find((incident) => incident.territory === selectedTerritory.name);
    return (
      <div className="rounded-[1.25rem] border border-cyan-100 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{selectedTerritory.zone}</p>
            <h3 className="mt-1 text-2xl font-black text-slate-950">{selectedTerritory.name}</h3>
          </div>
          <Badge>{selectedTerritory.tension}</Badge>
        </div>
        <dl className="mt-5 grid gap-3 text-sm font-bold text-slate-700">
          <div className="flex justify-between gap-4"><dt>Lat/lng</dt><dd>{selectedTerritory.lat}, {selectedTerritory.lng}</dd></div>
          <div className="flex justify-between gap-4"><dt>Signaux</dt><dd>{selectedTerritory.signals}</dd></div>
          <div className="flex justify-between gap-4"><dt>Programmes</dt><dd>{selectedTerritory.programs}</dd></div>
          <div className="flex justify-between gap-4"><dt>Budget</dt><dd>{linkedBudget?.planned ?? selectedTerritory.budget}</dd></div>
          <div className="flex justify-between gap-4"><dt>Ressource critique</dt><dd>{linkedResource?.name ?? "Aucune"}</dd></div>
          <div className="flex justify-between gap-4"><dt>Incident ouvert</dt><dd>{linkedIncident?.title ?? "Aucun"}</dd></div>
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">{selectedTerritory.actors.map((actor) => <span key={actor} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">{actor}</span>)}</div>
        <div className="mt-5 grid gap-2">
          {["Prioriser zone", "Demander vérification terrain", "Ouvrir fiche territoire", "Générer note territoire"].map((action) => (
            <button key={action} onClick={() => action.includes("note") ? prepareNote(selectedTerritory.name) : simulate(`${action}: ${selectedTerritory.name}`)} className="rounded-full bg-cyan-700 px-4 py-2 text-sm font-black text-white">{action}</button>
          ))}
        </div>
      </div>
    );
  }

  function IncidentsModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
        <Panel title="Alertes, incidents et obsolescence" subtitle="Suivre ce qui demande une réaction sans créer un outil de maintenance lourd.">
          <div className="grid gap-3">
            {ministryIncidents.map((incident) => (
              <div key={incident.id} className="rounded-2xl border border-cyan-100 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{incident.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{incident.type} · {incident.territory} · {incident.resource}</p>
                    <p className="mt-2 text-sm font-bold text-cyan-900">{incident.next}</p>
                  </div>
                  <div className="flex flex-wrap gap-2"><Badge>{incident.severity}</Badge><Badge>{incidentStatus[incident.id] ?? incident.status}</Badge></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Changer statut", "Demander vérification", "Créer note d'urgence", "Relier incident à financement"].map((action) => (
                    <button key={action} onClick={() => { setIncidentStatus((items) => ({ ...items, [incident.id]: action })); action.includes("note") ? prepareNote("incident critique") : simulate(action); }} className="rounded-full border border-cyan-200 px-3 py-2 text-xs font-black text-cyan-900">{action}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Lecture IA des incidents" subtitle="Questions rapides pour prioriser la semaine">
          <div className="grid gap-3">
            {ministryQuickQuestions.slice(4).map((question) => (
              <button key={question} onClick={() => simulate(`Question IA : ${question}`)} className="rounded-2xl border border-cyan-100 bg-white p-4 text-left text-sm font-black text-cyan-950">{question}</button>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  function BudgetsModule() {
    return (
      <Panel title="Programmes, budgets et financements" subtitle="Suivi orienté décision : prévu, engagé, consommé, écart, preuve et retard.">
        <div className="grid gap-4">
          {ministryBudgetLines.map((line) => (
            <div key={line.id} className="rounded-2xl border border-cyan-100 bg-white p-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-lg font-black text-slate-950">{line.program}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">{line.territory} · {line.partner} · retard {line.delay}</p>
                  <p className="mt-2 text-sm font-bold text-rose-700">{line.variance}</p>
                </div>
                <Badge>{budgetStatus[line.id] ?? line.status}</Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-4">
                {[["Prévu", line.planned], ["Engagé", line.committed], ["Consommé", line.consumed], ["Preuve", line.proof]].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-cyan-50 p-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700">{label}</p><p className="mt-2 font-black text-slate-950">{value}</p></div>
                ))}
              </div>
              <div className="mt-4 h-2 rounded-full bg-cyan-50"><div className="h-2 rounded-full bg-cyan-700" style={{ width: `${line.executionRate}%` }} /></div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Prioriser dossier", "Demander justification", "Demander preuve", "Préparer arbitrage", "Signaler écart"].map((action) => (
                  <button key={action} onClick={() => { setBudgetStatus((items) => ({ ...items, [line.id]: action })); simulate(action); }} className="rounded-full border border-cyan-200 px-3 py-2 text-xs font-black text-cyan-900">{action}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  function ResourcesModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <Panel title="Ressources, infrastructures et acteurs" subtitle="Vue opérationnelle : moyens disponibles, responsables, état, disponibilité et acteurs clés.">
          <div className="grid gap-4">
            {ministryResources.map((resource) => (
              <div key={resource.id} className="rounded-2xl border border-cyan-100 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-lg font-black text-slate-950">{resource.name}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{resource.category} · {resource.territory} · {resource.owner}</p>
                    <p className="mt-2 text-sm font-bold text-cyan-900">Programme lié : {resource.linkedProgram}</p>
                  </div>
                  <div className="flex flex-wrap gap-2"><Badge>{resourceStatus[resource.id] ?? resource.state}</Badge><Badge>{resource.availability}</Badge></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Affecter ressource", "Déclarer indisponibilité", "Demander maintenance", "Relier à programme"].map((action) => (
                    <button key={action} onClick={() => { setResourceStatus((items) => ({ ...items, [resource.id]: action })); simulate(action); }} className="rounded-full border border-cyan-200 px-3 py-2 text-xs font-black text-cyan-900">{action}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Acteurs institutionnels et terrain" subtitle="Qui agit, où, avec quel rôle et quel niveau de confiance">
          <div className="grid gap-3">
            {ministryActors.map((actor) => (
              <button key={actor.name} onClick={() => simulate(`Fiche acteur ouverte : ${actor.name}`)} className="rounded-2xl border border-cyan-100 bg-white p-4 text-left hover:border-cyan-500">
                <span className="block font-black text-slate-950">{actor.name}</span>
                <span className="mt-1 block text-sm font-semibold text-slate-600">{actor.type} · {actor.territory}</span>
                <span className="mt-2 block text-sm font-bold text-cyan-900">{actor.role}</span>
                <span className="mt-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-900">Confiance : {actor.trust}</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>
    );
  }

  function NotesModule() {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Panel title="Notes, rapports et preuves" subtitle="Documenter, valider et relier chaque décision à ses sources.">
          <div className="grid gap-4">
            {ministryProofs.map((proof) => (
              <div key={proof.id} className="rounded-2xl border border-cyan-100 bg-white p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-black text-slate-950">{proof.source}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-600">{proof.territory} · {proof.date}</p>
                    <p className="mt-2 text-sm font-bold text-cyan-900">Décision liée : {proof.linkedDecision}</p>
                  </div>
                  <div className="flex flex-wrap gap-2"><Badge>{proof.level}</Badge><Badge>{proof.validation}</Badge></div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Demander vérification terrain", "Valider preuve", "Relier preuve à décision"].map((action) => (
                    <button key={action} onClick={() => simulate(`${action} : ${proof.source}`)} className="rounded-full border border-cyan-200 px-3 py-2 text-xs font-black text-cyan-900">{action}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <div className="grid gap-6">
          <Panel title="Gouvernance IA" subtitle="IA simulée - données mockées. L'IA assiste, l'humain valide.">
            <div className="grid gap-3">
              {ministryAiModules.map((module) => (
                <div key={module.name} className="rounded-2xl border border-cyan-100 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-950">{module.name}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{module.control}</p>
                    </div>
                    <button onClick={() => setAiEnabled((items) => ({ ...items, [module.name]: !items[module.name] }))} className={`rounded-full px-3 py-2 text-xs font-black ${aiEnabled[module.name] ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"}`}>{aiEnabled[module.name] ? module.status : "Désactivée"}</button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
          <Panel title="Brouillon de note" subtitle="Préparation IA simulée, jamais publiée automatiquement">
            <p className="text-sm font-semibold leading-7 text-slate-700">{generatedNote || "Cliquez sur préparer une note pour produire un brouillon d'arbitrage."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["Passer en validation", "Archiver", "Relier au budget", "Simuler publication interne"].map((action) => (
                <button key={action} onClick={() => simulate(action)} className="rounded-full bg-cyan-700 px-3 py-2 text-xs font-black text-white">{action}</button>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    );
  }
}

function KpiCard({ label, value, detail, tone, index, onClick }: { label: string; value: string; detail: string; tone: MinistryTone; index: number; onClick: () => void }) {
  const width = `${54 + ((index * 11) % 36)}%`;
  return (
    <button onClick={onClick} className={`rounded-[1.25rem] border p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneClass[tone]}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p>
        <span className="rounded-full bg-white/80 px-2 py-1 text-[0.68rem] font-black">+{index + 4}%</span>
      </div>
      <p className="mt-4 text-3xl font-black">{value}</p>
      <p className="mt-2 text-sm font-bold opacity-75">{detail}</p>
      <div className="mt-4 h-2 rounded-full bg-white/70"><div className="h-2 rounded-full bg-current opacity-60" style={{ width }} /></div>
    </button>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-cyan-100 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-black text-cyan-900">{children}</span>;
}