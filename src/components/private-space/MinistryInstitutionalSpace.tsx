"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ministryBudgetLines,
  ministryIncidents,
  ministryInitialPendingActions,
  ministryProofs,
  ministryQuayMetrics,
  ministryReferents,
  ministryResources,
  ministryTerritories,
  type MinistryPendingAction,
  type MinistryQuayMetric,
  type MinistryReferent,
  type MinistryTerritory,
  type MinistryTone
} from "@/data/ministrySpace";

const aiCapabilityNames = ["Synthèse", "Alertes", "Notes", "Recherche assistée"] as const;

const seaTone: Record<MinistryTone, string> = {
  blue: "border-cyan-200 bg-cyan-50 text-cyan-950",
  green: "border-emerald-200 bg-emerald-50 text-emerald-950",
  amber: "border-amber-200 bg-amber-50 text-amber-950",
  red: "border-rose-200 bg-rose-50 text-rose-950",
  slate: "border-slate-200 bg-slate-50 text-slate-900"
};

function tensionDot(tension: MinistryTerritory["tension"]) {
  if (tension === "Critique") return "bg-rose-500";
  if (tension === "Forte") return "bg-amber-400";
  if (tension === "Moyenne") return "bg-yellow-300";
  return "bg-emerald-400";
}

function metricTone(metric: MinistryQuayMetric): MinistryTone {
  if (metric.priorityScore >= 85) return "red";
  if (metric.priorityScore >= 70) return "amber";
  if (metric.priorityScore >= 55) return "blue";
  return "green";
}

export function MinistryInstitutionalSpace() {
  const [selectedQuay, setSelectedQuay] = useState("Joal");
  const [tensionFilter, setTensionFilter] = useState("Toutes");
  const [message, setMessage] = useState("IA simulée - données mockées. L'humain valide chaque décision.");
  const [generatedNote, setGeneratedNote] = useState("Aucune note préparée.");
  const [statusById, setStatusById] = useState<Record<string, string>>({});
  const [priorityBoost, setPriorityBoost] = useState<Record<string, number>>({});
  const [pendingActions, setPendingActions] = useState<MinistryPendingAction[]>(ministryInitialPendingActions);
  const [aiMasterEnabled, setAiMasterEnabled] = useState(true);
  const [aiCapabilities, setAiCapabilities] = useState<Record<(typeof aiCapabilityNames)[number], boolean>>(
    Object.fromEntries(aiCapabilityNames.map((name) => [name, name !== "Recherche assistée"])) as Record<(typeof aiCapabilityNames)[number], boolean>
  );

  const territory = ministryTerritories.find((item) => item.name === selectedQuay) ?? ministryTerritories[0];
  const metricBase = ministryQuayMetrics.find((item) => item.quay === selectedQuay) ?? ministryQuayMetrics[0];
  const metric = { ...metricBase, priorityScore: Math.min(100, metricBase.priorityScore + (priorityBoost[selectedQuay] ?? 0)) };
  const budget = ministryBudgetLines.find((item) => item.territory === selectedQuay) ?? ministryBudgetLines[0];
  const incidents = ministryIncidents.filter((item) => item.territory === selectedQuay);
  const resources = ministryResources.filter((item) => item.territory === selectedQuay);
  const proofs = ministryProofs.filter((item) => item.territory === selectedQuay);
  const referents = ministryReferents.filter((item) => item.quay === selectedQuay);
  const filteredTerritories = ministryTerritories.filter((item) => tensionFilter === "Toutes" || item.tension === tensionFilter);

  const aiInsight = useMemo(() => {
    if (!aiMasterEnabled) {
      return `${selectedQuay}: mode manuel actif. Les KPIs, actions et traces restent fonctionnels sans IA. Dernière mise à jour: ${metric.lastUpdate}.`;
    }
    if (!aiCapabilities["Synthèse"]) {
      return `${selectedQuay}: synthèse IA désactivée. Consultez les KPIs, référents et preuves pour préparer la décision.`;
    }
    const risk = incidents[0]?.title ?? resources[0]?.state ?? "aucun incident bloquant";
    const missing = proofs.length ? "preuve disponible" : "preuve terrain à compléter";
    const note = aiCapabilities["Notes"] ? "Note assistée prête à préparer." : "Notes IA désactivées, brouillon manuel disponible.";
    return `${selectedQuay}: priorité ${metric.priorityScore}/100. Risque principal: ${risk}. ${territory.recommendedAction} Donnée clé: ${missing}. ${note}`;
  }, [aiCapabilities, aiMasterEnabled, incidents, metric.lastUpdate, metric.priorityScore, proofs.length, selectedQuay, resources, territory.recommendedAction]);

  function addAction(title: string, type: string, status = "À traiter") {
    const action = { id: `act-${Date.now()}-${pendingActions.length}`, title, quay: selectedQuay, type, status };
    setPendingActions((items) => [action, ...items].slice(0, 8));
    setMessage(`${title}. ${aiMasterEnabled ? "IA simulée disponible pour enrichir la synthèse." : "Mode manuel, sans enrichissement IA."} Simulation MVP - action non connectée au backend`);
  }

  function prepareNote(context = selectedQuay) {
    const prefix = aiMasterEnabled && aiCapabilities["Notes"] ? "Note assistée" : "Brouillon manuel";
    setGeneratedNote(`${prefix} ${context}: priorité ${metric.priorityScore}/100, financement ${metric.pendingFunding}, référent ${referents[0]?.name ?? "à désigner"}, preuve ${proofs[0]?.level ?? "à compléter"}.`);
    addAction(`Note d'arbitrage préparée pour ${context}`, "Note", "Préparée");
  }

  function prioritizeQuay() {
    setPriorityBoost((items) => ({ ...items, [selectedQuay]: Math.min(9, (items[selectedQuay] ?? 0) + 5) }));
    addAction(`Quai priorisé: ${selectedQuay}`, "Priorité", "Priorisé");
  }

  function signalBudgetGap() {
    setStatusById((items) => ({ ...items, [budget.id]: aiMasterEnabled && aiCapabilities["Alertes"] ? "Écart signalé + alerte IA" : "Écart signalé" }));
    setGeneratedNote(`Arbitrage budget ${selectedQuay}: écart signalé sur ${budget.program}, preuve ${budget.proof}, partenaire ${budget.partner}.`);
    addAction(`Écart budget signalé: ${budget.program}`, "Budget", "Écart signalé");
  }

  function requestFieldCheck() {
    setGeneratedNote(`Vérification terrain ${selectedQuay}: contrôler ${territory.mainRisk.toLowerCase()}, contacter ${referents[0]?.name ?? "référent local"} et joindre une preuve datée.`);
    addAction(`Vérification terrain demandée: ${selectedQuay}`, "Terrain", "Demandée");
  }

  function requestMaintenance(resourceName: string, id: string) {
    setStatusById((items) => ({ ...items, [id]: "Maintenance demandée" }));
    addAction(`Maintenance demandée: ${resourceName}`, "Ressource", "Demandée");
  }

  function requestReferentReport(referent: MinistryReferent) {
    setStatusById((items) => ({ ...items, [referent.id]: "Compte rendu demandé" }));
    setGeneratedNote(`Compte rendu terrain demandé à ${referent.name} (${referent.role}) pour ${selectedQuay}: ${referent.needs}.`);
    addAction(`Compte rendu demandé: ${referent.name}`, "Référent", "Demandé");
  }

  function validateProof() {
    const proof = proofs[0];
    if (!proof) {
      addAction(`Preuve à compléter: ${selectedQuay}`, "Preuve", "À compléter");
      return;
    }
    setStatusById((items) => ({ ...items, [proof.id]: "Validation demandée" }));
    setGeneratedNote(`Preuve ${selectedQuay}: ${proof.source} passée en validation simulée pour ${proof.linkedDecision}.`);
    addAction(`Validation preuve demandée: ${proof.source}`, "Preuve", "Validation demandée");
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

      <section className="mx-auto grid max-w-[94rem] gap-10 px-5 py-8 sm:px-8">
        <ModuleQuestion title="Vision nationale" question="Passer d'une lecture nationale à une action locale documentée." quay={selectedQuay} message={message} />

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <CompactPanel title="Synthèse nationale" subtitle="Situation du portefeuille pilote">
            <div className="grid gap-3 sm:grid-cols-3">
              <Chip label="Quais suivis" value="5" />
              <Chip label="Zones critiques" value="3" />
              <Chip label="Actions ouvertes" value={String(pendingActions.length)} />
            </div>
            <p className="mt-5 rounded-3xl bg-gradient-to-br from-cyan-50 to-emerald-50 p-4 text-sm font-bold leading-6 text-cyan-950">
              Le Ministère visualise les quais pilotes, choisit un territoire, mobilise les référents, déclenche une action et conserve une trace exploitable.
            </p>
          </CompactPanel>
          <CompactPanel title={`Quai sélectionné : ${selectedQuay}`} subtitle={`${territory.commune} · ${territory.zone}`}>
            <div className="grid gap-2 text-sm font-bold text-slate-700">
              <Row label="Tension" value={territory.tension} />
              <Row label="Risque dominant" value={territory.mainRisk} />
              <Row label="Action recommandée" value={territory.recommendedAction} />
            </div>
          </CompactPanel>
        </section>

        <QuayFilterPanel />

        <section className="grid gap-3 md:grid-cols-3">
          <RadialMetric label="Priorité quai" value={metric.priorityScore} suffix="/100" tone={metricTone(metric)} />
          <DonutMetric label="Exécution budget" value={metric.executionRate} detail={budget.program} />
          <SparkMetric label="Signaux terrain" values={metric.signalTrend} detail={`${metric.lastUpdate} · ${territory.tension}`} />
        </section>

        <MetricRibbon />

        <MapView />

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <CompactPanel title="Actions principales" subtitle="Chaque action laisse une trace visible">
            <ActionStrip primary="Prioriser quai" secondary={["Vérifier terrain", "Générer note"]} onPrimary={prioritizeQuay} onSecondary={(item) => item.includes("terrain") ? requestFieldCheck() : prepareNote(selectedQuay)} />
            <ActionStrip primary="Signaler écart budget" secondary={["Demander maintenance", "Valider preuve"]} onPrimary={signalBudgetGap} onSecondary={(item) => item.includes("maintenance") ? requestMaintenance(resources[0]?.name ?? "Ressource critique", resources[0]?.id ?? `res-${selectedQuay}`) : validateProof()} />
          </CompactPanel>
          <PendingActions />
        </section>

        <ReferentsPanel />

        <section className="grid gap-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Programmes, budgets, incidents et ressources</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">Les blocs ci-dessous changent avec le quai sélectionné et gardent les actions reliées à une preuve ou une note.</p>
          </div>
          <BudgetView />
          <IncidentView />
          <ResourceView />
        </section>

        <section className="grid gap-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">Preuves, notes et trace</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">La décision ne reste pas seulement une lecture : elle produit une preuve, une action en attente ou un brouillon de note.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_0.82fr]">
            <ProofView />
            <TracePanel />
          </div>
        </section>

        <section className="grid gap-5">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">IA Mbàmbulaan gouvernée</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">L’IA assiste les synthèses, alertes et notes lorsque le Ministère l’active. Elle ne décide jamais.</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <AiGovernancePanel />
            <AiRail />
          </div>
        </section>
      </section>
    </main>
  );

  function QuayFilterPanel() {
    return (
      <section className="rounded-[2rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Filtre central</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Choisir un quai de pêche</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-6 text-slate-600">
            Le choix du quai met à jour les KPIs, la carte, la fiche, les budgets, incidents, ressources, preuves, référents, actions et synthèse.
          </p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {ministryTerritories.map((item) => {
            const selected = item.name === selectedQuay;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setSelectedQuay(item.name)}
                className={`rounded-[1.25rem] border p-4 text-left transition ${selected ? "border-cyan-600 bg-gradient-to-br from-cyan-700 to-teal-600 text-white shadow-lg shadow-cyan-900/15" : "border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 text-cyan-950 hover:border-cyan-300"}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-lg font-black">{item.name}</span>
                  <span className={`h-3 w-3 rounded-full ${tensionDot(item.tension)}`} />
                </span>
                <span className={`mt-2 block text-xs font-black uppercase tracking-[0.12em] ${selected ? "text-cyan-50" : "text-cyan-700"}`}>{item.tension}</span>
                <span className={`mt-2 block text-xs font-semibold leading-5 ${selected ? "text-white/75" : "text-slate-600"}`}>{item.mainRisk}</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  function MapView() {
    return (
      <section className="grid gap-4 xl:grid-cols-[1fr_21rem]">
        <CompactPanel title="Carte des quais" subtitle="Filtre tension + sélection quai">
          <div className="mb-3 flex flex-wrap gap-2">
            {["Toutes", "Critique", "Forte", "Moyenne", "Faible"].map((item) => (
              <button key={item} onClick={() => setTensionFilter(item)} className={`rounded-full px-3 py-1.5 text-xs font-black ${tensionFilter === item ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600"}`}>{item}</button>
            ))}
          </div>
          <div className="relative min-h-[31rem] overflow-hidden rounded-[1.25rem] bg-[radial-gradient(circle_at_18%_18%,rgba(20,184,166,0.25),transparent_30%),linear-gradient(140deg,#f8fafc,#dff7f4_46%,#f7e7c3)]">
            <div className="absolute left-[22%] top-8 h-[86%] w-8 rounded-full border-l-4 border-cyan-300/80" />
            {filteredTerritories.map((item) => (
              <button key={item.name} type="button" onClick={() => setSelectedQuay(item.name)} className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white shadow-lg transition hover:scale-110 ${selectedQuay === item.name ? "h-11 w-11 ring-4 ring-cyan-800/20" : "h-7 w-7"} ${tensionDot(item.tension)}`} style={{ left: `${item.x}%`, top: `${item.y}%` }} aria-label={`Sélectionner ${item.name}`} />
            ))}
            {filteredTerritories.map((item) => <span key={`${item.name}-label`} className="absolute -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[0.7rem] font-black text-slate-700 shadow-sm" style={{ left: `${item.x}%`, top: `calc(${item.y}% + 1.35rem)` }}>{item.name}</span>)}
          </div>
        </CompactPanel>
        <QuayDetail />
      </section>
    );
  }

  function IncidentView() {
    return (
      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <CompactPanel title="Triage incidents" subtitle={`${selectedQuay} · réaction rapide`}>
          <DataTable headers={["Incident", "Gravité", "Statut", "Action"]} rows={(incidents.length ? incidents : ministryIncidents.slice(0, 2)).map((incident) => [
            incident.title,
            incident.severity,
            statusById[incident.id] ?? incident.status,
            <button key={incident.id} onClick={() => { setStatusById((items) => ({ ...items, [incident.id]: "Vérification demandée" })); addAction(`Vérification demandée: ${incident.title}`, "Incident", "Demandée"); }} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Vérifier</button>
          ])} />
        </CompactPanel>
        <SparkMetric label="Tendance incidents" values={metric.incidentTrend} detail="5 derniers relevés" />
      </section>
    );
  }

  function BudgetView() {
    return (
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <CompactPanel title="Budget du quai" subtitle="Prévu / engagé / consommé">
          <BudgetBars />
          <ActionStrip primary="Signaler écart" secondary={["Demander preuve", "Préparer arbitrage"]} onPrimary={signalBudgetGap} onSecondary={(item) => item.includes("arbitrage") ? prepareNote(selectedQuay) : validateProof()} />
        </CompactPanel>
        <CompactPanel title="Programme lié" subtitle={budget.partner}>
          <DataTable headers={["Programme", "Exécution", "Statut", "Écart"]} rows={[[budget.program, `${budget.executionRate}%`, statusById[budget.id] ?? budget.status, budget.variance]]} />
        </CompactPanel>
      </section>
    );
  }

  function ResourceView() {
    return (
      <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
        <CompactPanel title="Capacité opérationnelle" subtitle={`${selectedQuay} · ressources critiques`}>
          <DataTable headers={["Ressource", "État", "Disponibilité", "Action"]} rows={(resources.length ? resources : ministryResources.slice(0, 2)).map((resource) => [
            resource.name,
            statusById[resource.id] ?? resource.state,
            resource.availability,
            <button key={resource.id} onClick={() => requestMaintenance(resource.name, resource.id)} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Maintenance</button>
          ])} />
        </CompactPanel>
        <ReferentsPanel />
      </section>
    );
  }

  function ProofView() {
    return (
      <section className="grid gap-4">
        <CompactPanel title="Trace décisionnelle" subtitle={`${selectedQuay} · preuves et note`}>
          <DataTable headers={["Source", "Niveau", "Validation", "Décision"]} rows={(proofs.length ? proofs : ministryProofs.slice(0, 2)).map((proof) => [proof.source, proof.level, statusById[proof.id] ?? proof.validation, proof.linkedDecision])} />
          <ActionStrip primary="Valider preuve" secondary={["Demander vérification", "Générer note"]} onPrimary={validateProof} onSecondary={(item) => item.includes("note") ? prepareNote(selectedQuay) : requestFieldCheck()} />
        </CompactPanel>
      </section>
    );
  }

  function ReferentsPanel() {
    return (
      <CompactPanel title="Référents terrain" subtitle="Points d’ancrage de coordination">
        <div className="grid gap-2">
          {(referents.length ? referents : ministryReferents.slice(0, 3)).map((referent) => (
            <div key={referent.id} className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black">{referent.name}</p>
                  <p className="text-xs font-semibold text-slate-500">{referent.role} · confiance {referent.trust}</p>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-black text-cyan-900">{statusById[referent.id] ?? referent.status}</span>
              </div>
              <p className="mt-2 text-xs font-bold text-slate-600">{referent.lastReport}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Besoin: {referent.needs}</p>
              <p className="mt-1 text-xs font-semibold text-slate-500">Programme: {referent.programs}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => requestReferentReport(referent)} className="rounded-full bg-cyan-700 px-3 py-1.5 text-xs font-black text-white">Compte rendu</button>
                <button onClick={() => addAction(`Suivi programme affecté: ${referent.name}`, "Programme", "Affecté")} className="rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-xs font-black text-cyan-950">Affecter suivi</button>
              </div>
            </div>
          ))}
        </div>
      </CompactPanel>
    );
  }

  function QuayDetail() {
    return (
      <CompactPanel title={`Fiche ${selectedQuay}`} subtitle={`${territory.zone} · ${territory.lat}, ${territory.lng}`}>
        <div className="grid gap-2 text-sm font-bold text-slate-700">
          <Row label="Tension" value={territory.tension} />
          <Row label="Commune / région" value={`${territory.commune} · ${territory.zone}`} />
          <Row label="Risque dominant" value={territory.mainRisk} />
          <Row label="Programmes" value={String(territory.programs)} />
          <Row label="Budget" value={budget.planned} />
          <Row label="Financement en attente" value={metric.pendingFunding} />
          <Row label="Incidents" value={String(incidents.length)} />
          <Row label="Ressources critiques" value={String(metric.criticalResources)} />
          <Row label="Preuves validées" value={String(metric.validatedProofs)} />
          <Row label="Référents" value={String(referents.length)} />
          <Row label="Mise à jour" value={metric.lastUpdate} />
        </div>
        <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-950">{territory.recommendedAction}</p>
        <ActionStrip primary="Prioriser quai" secondary={["Vérifier terrain", "Note quai"]} onPrimary={prioritizeQuay} onSecondary={(item) => item.includes("Note") ? prepareNote(selectedQuay) : requestFieldCheck()} />
      </CompactPanel>
    );
  }

  function AiRail() {
    return (
      <CompactPanel title="IA Mbàmbulaan" subtitle="Données mockées · humain valide">
        <p className="text-sm font-bold leading-6 text-slate-700">{aiInsight}</p>
        <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-xs font-black leading-5 text-amber-950">IA simulée - données mockées. L'humain valide.</p>
        <div className="mt-3 grid gap-2">
          {["Pourquoi ce quai est prioritaire ?", "Quel financement est bloqué ?", "Quel référent contacter ?", "Quelle ressource est critique ?", "Quelle preuve manque ?", "Quelle note préparer ?"].map((question) => (
            <button key={question} onClick={() => setMessage(aiMasterEnabled ? `IA ${selectedQuay}: ${question} Réponse simulée: ${territory.recommendedAction}` : `IA désactivée: ${question} reste traitable via les données et actions manuelles.`)} className={`rounded-2xl px-3 py-2 text-left text-xs font-black ${aiMasterEnabled ? "bg-cyan-50 text-cyan-950" : "bg-slate-100 text-slate-500"}`}>{question}</button>
          ))}
        </div>
      </CompactPanel>
    );
  }

  function AiGovernancePanel() {
    return (
      <CompactPanel title="Gouvernance IA" subtitle="Activable, contrôlée, simulée">
        <button onClick={() => setAiMasterEnabled((enabled) => !enabled)} className={`flex w-full items-center justify-between rounded-2xl p-3 text-left ${aiMasterEnabled ? "bg-emerald-50 text-emerald-950" : "bg-slate-100 text-slate-600"}`}>
          <span>
            <span className="block text-sm font-black">IA Mbàmbulaan</span>
            <span className="block text-xs font-semibold">{aiMasterEnabled ? "Activée pour enrichir synthèses, alertes et notes." : "Désactivée: les parcours restent fonctionnels."}</span>
          </span>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-black">{aiMasterEnabled ? "Activée" : "Désactivée"}</span>
        </button>
        <div className="mt-3 grid gap-2">
          {aiCapabilityNames.map((name) => (
            <label key={name} className={`flex items-center justify-between rounded-2xl border p-3 text-sm font-black ${aiMasterEnabled ? "border-cyan-100 bg-white text-slate-800" : "border-slate-100 bg-slate-50 text-slate-400"}`}>
              <span>{name}</span>
              <input
                type="checkbox"
                checked={aiCapabilities[name]}
                disabled={!aiMasterEnabled}
                onChange={() => setAiCapabilities((items) => ({ ...items, [name]: !items[name] }))}
                className="h-4 w-4 accent-cyan-700"
              />
            </label>
          ))}
        </div>
      </CompactPanel>
    );
  }

  function PendingActions() {
    return (
      <CompactPanel title="Actions en attente" subtitle="Générées par simulation">
        <div className="grid gap-2">
          {pendingActions.filter((item) => item.quay === selectedQuay).slice(0, 5).map((action) => (
            <button key={action.id} onClick={() => setStatusById((items) => ({ ...items, [action.id]: "Vu" }))} className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-emerald-50 p-3 text-left transition hover:border-cyan-300">
              <span className="block text-sm font-black">{action.title}</span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">{action.type} · {statusById[action.id] ?? action.status}</span>
            </button>
          ))}
          {!pendingActions.some((item) => item.quay === selectedQuay) && <p className="rounded-2xl border border-cyan-100 bg-cyan-50 p-3 text-sm font-bold text-cyan-900">Aucune action ouverte pour ce quai. Lancez une vérification, une note ou une demande de preuve.</p>}
        </div>
      </CompactPanel>
    );
  }

  function MetricRibbon() {
    const compactMetrics = [
      { label: "Tension", value: territory.tension, tone: "bg-rose-50 text-rose-950" },
      { label: "Incidents", value: String(incidents.length), tone: "bg-orange-50 text-orange-950" },
      { label: "Financement", value: metric.pendingFunding, tone: "bg-amber-50 text-amber-950" },
      { label: "Ressources", value: String(metric.criticalResources), tone: "bg-emerald-50 text-emerald-950" },
      { label: "Programmes", value: String(territory.programs), tone: "bg-cyan-50 text-cyan-950" },
      { label: "Preuves", value: String(metric.validatedProofs), tone: "bg-teal-50 text-teal-950" },
      { label: "Référents", value: String(metric.referentsAvailable), tone: "bg-sky-50 text-sky-950" },
      { label: "MAJ", value: metric.lastUpdate, tone: "bg-stone-50 text-stone-950" }
    ];

    return (
      <section className="grid gap-2 md:grid-cols-4 xl:grid-cols-8">
        {compactMetrics.map((item) => (
          <div key={item.label} className={`rounded-2xl border border-white p-3 shadow-sm ${item.tone}`}>
            <p className="text-[0.65rem] font-black uppercase tracking-[0.14em] opacity-60">{item.label}</p>
            <p className="mt-1 truncate text-sm font-black">{item.value}</p>
          </div>
        ))}
      </section>
    );
  }

  function TracePanel() {
    return (
      <CompactPanel title="Trace" subtitle="Note et preuve liées">
        <p className="text-sm font-black text-slate-900">{proofs[0]?.source ?? "Preuve à compléter"}</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">{proofs[0]?.level ?? "À collecter"} · {proofs[0]?.date ?? metric.lastUpdate}</p>
        <p className="mt-4 rounded-2xl bg-cyan-50 p-3 text-sm font-bold text-cyan-950">{generatedNote}</p>
      </CompactPanel>
    );
  }

  function BudgetBars() {
    const planned = parseInt(budget.planned, 10);
    const committed = parseInt(budget.committed, 10);
    const consumed = parseInt(budget.consumed, 10);
    return (
      <div className="grid gap-3">
        <ProgressLine label="Prévu" value={100} amount={budget.planned} tone="bg-cyan-700" />
        <ProgressLine label="Engagé" value={(committed / planned) * 100} amount={budget.committed} tone="bg-teal-500" />
        <ProgressLine label="Consommé" value={(consumed / planned) * 100} amount={budget.consumed} tone="bg-amber-400" />
        <p className="rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-950">{statusById[budget.id] ?? budget.status}: {budget.variance}</p>
      </div>
    );
  }
}

function ModuleQuestion({ title, question, quay, message }: { title: string; question: string; quay: string; message: string }) {
  return (
    <section className="rounded-[1.75rem] bg-gradient-to-br from-cyan-950 via-teal-900 to-emerald-800 p-5 text-white shadow-xl shadow-cyan-950/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100/70">{title} · {quay}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{question}</h2>
        </div>
        <p className="max-w-md rounded-2xl bg-white/10 p-3 text-sm font-bold leading-6 text-white/75 ring-1 ring-white/10">{message}</p>
      </div>
    </section>
  );
}

function RadialMetric({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: MinistryTone }) {
  return (
    <div className={`rounded-[1.25rem] border p-4 ${seaTone[tone]}`}>
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(#0891b2 ${value * 3.6}deg, rgba(255,255,255,.85) 0deg)` }}>
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-sm font-black">{value}</div>
        </div>
        <div><p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p><p className="mt-2 text-2xl font-black">{suffix}</p></div>
      </div>
    </div>
  );
}

function DonutMetric({ label, value, detail }: { label: string; value: number; detail: string }) {
  return (
    <div className="rounded-[1.25rem] border border-teal-200 bg-teal-50 p-4 text-teal-950">
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-full" style={{ background: `conic-gradient(#0f766e ${value * 3.6}deg, #ccfbf1 0deg)` }}>
          <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-sm font-black">{value}%</div>
        </div>
        <div><p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">{label}</p><p className="mt-2 text-sm font-bold">{detail}</p></div>
      </div>
    </div>
  );
}

function SparkMetric({ label, values, detail }: { label: string; values: number[]; detail: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="rounded-[1.25rem] border border-cyan-200 bg-white p-4 text-cyan-950">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-700">{label}</p>
      <div className="mt-4 flex h-12 items-end gap-1">
        {values.map((value, index) => <span key={`${value}-${index}`} className="w-full rounded-t bg-cyan-600" style={{ height: `${22 + (value / max) * 70}%` }} />)}
      </div>
      <p className="mt-3 text-sm font-bold text-slate-600">{detail}</p>
    </div>
  );
}

function CompactPanel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[1.75rem] border border-cyan-100 bg-white p-5 shadow-sm shadow-cyan-950/5">
      <div className="mb-5">
        <h3 className="text-lg font-black text-slate-950">{title}</h3>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ActionStrip({ primary, secondary, onPrimary, onSecondary }: { primary: string; secondary: string[]; onPrimary: () => void; onSecondary: (item: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={onPrimary} className="rounded-full bg-gradient-to-r from-cyan-700 to-teal-600 px-4 py-2 text-sm font-black text-white shadow-sm shadow-cyan-900/15">{primary}</button>
      {secondary.slice(0, 2).map((item) => <button key={item} onClick={() => onSecondary(item)} className="rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-black text-cyan-950 transition hover:border-teal-300 hover:bg-teal-50">{item}</button>)}
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-100">
      <table className="w-full min-w-[42rem] text-left text-sm">
        <thead className="bg-cyan-50 text-xs uppercase tracking-[0.12em] text-cyan-900">
          <tr>{headers.map((header) => <th key={header} className="p-3 font-black">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-cyan-50 bg-white">
          {rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex} className="p-3 font-semibold text-slate-700">{cell}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

function ProgressLine({ label, value, amount, tone }: { label: string; value: number; amount: string; tone: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-black uppercase tracking-[0.12em] text-slate-500"><span>{label}</span><span>{amount}</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-2 rounded-full ${tone}`} style={{ width: `${Math.min(100, value)}%` }} /></div>
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50 p-3"><p className="text-xs font-black uppercase tracking-[0.12em] text-cyan-700/70">{label}</p><p className="mt-1 text-xl font-black text-cyan-950">{value}</p></div>;
}

function QuaySelector({ selected, onSelect }: { selected: string; onSelect: (quay: string) => void }) {
  return (
    <select value={selected} onChange={(event) => onSelect(event.target.value)} className="rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-950">
      {ministryTerritories.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
    </select>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-2"><span className="text-slate-500">{label}</span><span className="text-right text-slate-950">{value}</span></div>;
}
