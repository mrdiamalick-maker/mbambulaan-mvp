"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { MapPoint, PrivateRecord, PrivateSpaceConfig } from "@/data/privateSpaces";
import { ecosystemMapPoints, ecosystemProfiles, privateTerritories } from "@/data/privateSpaces";
import type { Tone } from "@/data/mockMbambulaan";

const toneClass: Record<Tone, string> = {
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  slate: "border-slate-200 bg-slate-50 text-slate-800"
};

const nextStatus = ["Ouvert", "En cours", "Prioritaire", "Realise", "Archive"];

function tensionDotClass(tension: MapPoint["tension"]) {
  if (tension === "Critique") return "bg-rose-600";
  if (tension === "Forte") return "bg-amber-500";
  if (tension === "Moyenne") return "bg-yellow-300";
  return "bg-emerald-500";
}

export function PrivateSpaceClient({ config }: { config: PrivateSpaceConfig }) {
  const ecosystem = ecosystemProfiles[config.key];
  const [activeNav, setActiveNav] = useState(config.sidebar[0]);
  const [territory, setTerritory] = useState(config.territoryDefault);
  const [selected, setSelected] = useState<PrivateRecord>(config.records[0]);
  const [selectedMapPoint, setSelectedMapPoint] = useState<MapPoint>(
    ecosystemMapPoints.find((point) => point.name === config.territoryDefault) ?? ecosystemMapPoints[0]
  );
  const [records, setRecords] = useState(config.records);
  const [secondaryRecords, setSecondaryRecords] = useState(ecosystem.secondaryRecords);
  const [selectedSecondary, setSelectedSecondary] = useState(ecosystem.secondaryRecords[0]);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);
  const [priorityId, setPriorityId] = useState<string>(config.records[0].id);
  const [message, setMessage] = useState("Simulation MVP - action non connectee au backend");
  const [synthesis, setSynthesis] = useState("");

  const filteredRecords = useMemo(
    () => records.filter((record) => territory === "Tous" || record.territory === territory),
    [records, territory]
  );

  const filteredSecondaryRecords = useMemo(
    () => secondaryRecords.filter((record) => territory === "Tous" || record.territory === territory),
    [secondaryRecords, territory]
  );

  function rotateStatus(record: PrivateRecord) {
    const currentIndex = nextStatus.indexOf(record.status);
    const status = nextStatus[(currentIndex + 1 + nextStatus.length) % nextStatus.length];
    setRecords((items) => items.map((item) => (item.id === record.id ? { ...item, status } : item)));
    setSelected((item) => (item.id === record.id ? { ...item, status } : item));
    setMessage(`Statut mis a jour en simulation: ${status}. Simulation MVP - action non connectee au backend`);
  }

  function rotateSecondaryStatus(record: PrivateRecord) {
    const currentIndex = nextStatus.indexOf(record.status);
    const status = nextStatus[(currentIndex + 1 + nextStatus.length) % nextStatus.length];
    setSecondaryRecords((items) => items.map((item) => (item.id === record.id ? { ...item, status } : item)));
    setSelectedSecondary((item) => (item.id === record.id ? { ...item, status } : item));
    setMessage(`Registre mis a jour en simulation: ${status}. Simulation MVP - action non connectee au backend`);
  }

  function addNote() {
    if (!note.trim()) return;
    setNotes((items) => [note.trim(), ...items]);
    setNote("");
    setMessage("Note temporaire ajoutee en session. Simulation MVP - action non connectee au backend");
  }

  function markPriority(record: PrivateRecord) {
    setPriorityId(record.id);
    setMessage(`Action prioritaire marquee: ${record.title}. Simulation MVP - action non connectee au backend`);
  }

  function generateSynthesis() {
    setSynthesis(config.synthesis);
    setMessage("Synthese generee localement. Simulation MVP - action non connectee au backend");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="grid min-h-screen xl:grid-cols-[18rem_1fr]">
        <aside className="hidden bg-slate-950 p-5 text-white xl:block">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-sm font-black text-slate-950">Mb</span>
            <span>
              <span className="block font-black">Mbàmbulaan</span>
              <span className="text-xs font-bold text-white/45">{config.organization}</span>
            </span>
          </Link>
          <nav className="mt-8 grid gap-2">
            {config.sidebar.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveNav(item)}
                className={`rounded-2xl px-3 py-2 text-left text-sm font-bold transition ${
                  activeNav === item ? "bg-white text-slate-950" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </nav>
          <div className="mt-8 rounded-2xl bg-white/10 p-4">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">Espace privé</p>
            <p className="mt-2 text-sm font-bold text-white">{config.roleLabel}</p>
          </div>
        </aside>

        <main>
          <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-sky-700">{config.organization}</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{config.title}</h1>
                <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{config.intro}</p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/espace-prive" className="rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-800">
                  Portail espaces
                </Link>
                <button onClick={generateSynthesis} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">
                  {config.topbarCta}
                </button>
              </div>
            </div>
          </header>

          <div className="grid gap-6 px-5 py-6 sm:px-8">
            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-black text-sky-900">{message}</div>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ecosystem.capabilities.map((capability) => (
                <div key={capability.title} className={`rounded-[1.25rem] border p-5 shadow-sm ${toneClass[capability.tone]}`}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{capability.title}</p>
                  <p className="mt-4 text-2xl font-black">{capability.metric}</p>
                  <p className="mt-2 text-sm font-bold leading-6 opacity-75">{capability.description}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Panel title={ecosystem.mapTitle} subtitle={ecosystem.mapSubtitle}>
                <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
                  <div className="relative min-h-[24rem] overflow-hidden rounded-[1.5rem] border border-slate-200 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.18),transparent_28%),linear-gradient(140deg,#f8fafc,#e0f2fe_45%,#ecfeff)] p-4">
                    <div className="absolute left-[22%] top-8 h-[86%] w-8 rounded-full border-l-4 border-sky-300/70" />
                    <div className="absolute bottom-6 right-8 rounded-2xl bg-white/85 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500 shadow-sm">
                      Littoral pilote
                    </div>
                    {ecosystemMapPoints.map((point) => (
                      <button
                        key={point.name}
                        type="button"
                        onClick={() => {
                          setSelectedMapPoint(point);
                          setTerritory(point.name);
                          setMessage(`${point.name} selectionne sur la carte. Simulation MVP - action non connectee au backend`);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${
                          selectedMapPoint.name === point.name ? "h-8 w-8 ring-4 ring-slate-950/20" : "h-6 w-6"
                        } ${tensionDotClass(point.tension)}`}
                        style={{ left: `${point.x}%`, top: `${point.y}%` }}
                        aria-label={`Selectionner ${point.name}`}
                      >
                        <span className="sr-only">{point.name}</span>
                      </button>
                    ))}
                    {ecosystemMapPoints.map((point) => (
                      <span
                        key={`${point.name}-label`}
                        className="absolute -translate-x-1/2 rounded-full bg-white/85 px-2 py-1 text-[0.68rem] font-black text-slate-700 shadow-sm"
                        style={{ left: `${point.x}%`, top: `calc(${point.y}% + 1.25rem)` }}
                      >
                        {point.name}
                      </span>
                    ))}
                  </div>
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{selectedMapPoint.zone}</p>
                        <h3 className="mt-1 text-2xl font-black text-slate-950">{selectedMapPoint.name}</h3>
                      </div>
                      <Badge>{selectedMapPoint.tension}</Badge>
                    </div>
                    <dl className="mt-5 grid gap-3 text-sm font-bold text-slate-700">
                      <div className="flex justify-between gap-4">
                        <dt>Signaux</dt>
                        <dd>{selectedMapPoint.signals}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Programmes</dt>
                        <dd>{selectedMapPoint.programs}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt>Financement</dt>
                        <dd>{selectedMapPoint.funding}</dd>
                      </div>
                    </dl>
                    <div className="mt-5">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Acteurs</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedMapPoint.actors.map((actor) => (
                          <span key={actor} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{actor}</span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-700">{selectedMapPoint.priority}</p>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-400">{selectedMapPoint.proof}</p>
                  </div>
                </div>
              </Panel>

              <Panel title={ecosystem.decisionRoomTitle} subtitle="Ce que cet espace permet de decider">
                <div className="grid gap-3">
                  {ecosystem.decisionBullets.map((bullet, index) => (
                    <div key={bullet} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                      <p className="text-sm font-bold leading-6 text-slate-700">{bullet}</p>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {config.kpis.map((kpi) => (
                <div key={kpi.label} className={`rounded-[1.25rem] border p-5 shadow-sm ${toneClass[kpi.tone]}`}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{kpi.label}</p>
                  <p className="mt-4 text-3xl font-black">{kpi.value}</p>
                  <p className="mt-2 text-sm font-bold opacity-75">{kpi.detail}</p>
                </div>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.82fr]">
              <Panel title={config.recordsTitle} subtitle={`Navigation interne: ${activeNav}`}>
                <div className="mb-4 flex flex-wrap gap-2">
                  {["Tous", ...privateTerritories].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setTerritory(item)}
                      className={`rounded-full border px-4 py-2 text-xs font-black ${territory === item ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                      <tr>
                        <th className="p-4">Objet</th>
                        <th className="p-4">Territoire</th>
                        <th className="p-4">Responsable</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredRecords.map((record) => (
                        <tr key={record.id} className={priorityId === record.id ? "bg-amber-50/70" : undefined}>
                          <td className="p-4">
                            <button onClick={() => setSelected(record)} className="text-left font-black text-slate-950 hover:text-sky-700">
                              {record.title}
                            </button>
                            <p className="mt-1 text-xs font-bold text-slate-500">{record.next}</p>
                          </td>
                          <td className="p-4 font-semibold text-slate-600">{record.territory}</td>
                          <td className="p-4 font-semibold text-slate-600">{record.owner}</td>
                          <td className="p-4"><Badge>{record.status}</Badge></td>
                          <td className="p-4">
                            <button onClick={() => markPriority(record)} className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white">
                              Prioriser
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title={config.detailLabel} subtitle="Panneau de détail simulé">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xl font-black text-slate-950">{selected.title}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{selected.territory} · {selected.owner}</p>
                  <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                    <p>Priorité: {selected.priority}</p>
                    <p>Preuve: {selected.proof}</p>
                    <p>Prochaine étape: {selected.next}</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <button onClick={() => rotateStatus(selected)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
                      Changer statut
                    </button>
                    <button onClick={generateSynthesis} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-slate-800">
                      Générer synthèse
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="text-sm font-black text-slate-800">Note temporaire</label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder={config.notePlaceholder}
                    className="mt-2 min-h-28 w-full rounded-2xl border border-slate-200 p-4 text-sm font-semibold outline-none focus:border-sky-400"
                  />
                  <button onClick={addNote} className="mt-3 rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
                    Ajouter note
                  </button>
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1fr_0.78fr]">
              <Panel title={ecosystem.secondaryTitle} subtitle="Registre operable propre au role actif">
                <div className="grid gap-3">
                  {filteredSecondaryRecords.map((record) => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => setSelectedSecondary(record)}
                      className={`rounded-2xl border p-4 text-left transition hover:border-slate-400 ${
                        selectedSecondary.id === record.id ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-900"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-black">{record.title}</p>
                          <p className={`mt-1 text-sm font-semibold ${selectedSecondary.id === record.id ? "text-white/65" : "text-slate-500"}`}>
                            {record.territory} · {record.owner}
                          </p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-black ${
                          selectedSecondary.id === record.id ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"
                        }`}>
                          {record.priority}
                        </span>
                      </div>
                      <p className={`mt-3 text-sm font-bold ${selectedSecondary.id === record.id ? "text-white/75" : "text-slate-600"}`}>{record.next}</p>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Panneau operationnel" subtitle="Simulation d'une action quotidienne">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xl font-black text-slate-950">{selectedSecondary.title}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{selectedSecondary.territory} · {selectedSecondary.owner}</p>
                  <div className="mt-4 grid gap-2 text-sm font-bold text-slate-700">
                    <p>Statut: {selectedSecondary.status}</p>
                    <p>Priorité: {selectedSecondary.priority}</p>
                    <p>Preuve: {selectedSecondary.proof}</p>
                    <p>Action attendue: {selectedSecondary.next}</p>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button onClick={() => rotateSecondaryStatus(selectedSecondary)} className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white">
                      Avancer workflow
                    </button>
                    <button
                      onClick={() => setMessage(`Apercu genere pour ${selectedSecondary.title}. Simulation MVP - action non connectee au backend`)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-black text-slate-800"
                    >
                      Voir aperçu
                    </button>
                  </div>
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <Panel title="Modules activés" subtitle="Modules propres à cet espace">
                <div className="grid gap-3">
                  {config.modules.map((module) => (
                    <div key={module.title} className={`rounded-2xl border p-4 ${toneClass[module.tone]}`}>
                      <p className="font-black">{module.title}</p>
                      <p className="mt-1 text-sm font-semibold opacity-75">{module.description}</p>
                      <p className="mt-3 text-2xl font-black">{module.metric}</p>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Workflow" subtitle="Suivi d'avancement">
                <div className="grid gap-3">
                  {config.workflows.map((step, index) => (
                    <div key={step.label} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                      <div>
                        <p className="font-black text-slate-950">{step.label}</p>
                        <p className="text-sm font-semibold text-slate-500">{step.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel title="Rapports" subtitle="Prévisualisation générable">
                <div className="grid gap-3">
                  {config.reports.map((report) => (
                    <div key={report.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="font-black text-slate-950">{report.title}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{report.audience}</p>
                      <Badge>{report.status}</Badge>
                    </div>
                  ))}
                </div>
              </Panel>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <Panel title="Actions rapides" subtitle="Toutes les actions restent simulées dans le MVP">
                <div className="flex flex-wrap gap-2">
                  {config.actions.map((action) => (
                    <button
                      key={action}
                      onClick={() => setMessage(`${action} lancé. Simulation MVP - action non connectee au backend`)}
                      className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:border-slate-950"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </Panel>
              <Panel title="Synthèse générée" subtitle="Aperçu local, non connecté">
                <p className="text-sm font-semibold leading-7 text-slate-700">{synthesis || "Cliquez sur une action de synthèse pour générer un aperçu simulé."}</p>
                {notes.length ? (
                  <div className="mt-4 grid gap-2">
                    {notes.map((item, index) => (
                      <div key={`${item}-${index}`} className="rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{item}</div>
                    ))}
                  </div>
                ) : null}
              </Panel>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="mt-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-700">{children}</span>;
}
