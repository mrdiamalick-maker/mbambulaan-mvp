"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  assistedInsights,
  awarenessCampaigns,
  communityNeeds,
  fundingModels,
  impactProjects,
  liveSignals,
  ministryPossibilities,
  ministryQuays,
  partnerOpportunities,
  partners,
  pilotPirogues,
  preventionSignals,
  proofSentences,
  sensitiveZones,
  trainingPrograms,
  type ModuleId
} from "@/data/ministryControlTowerData";
import {
  AssistedPanel,
  Badge,
  ControlMap,
  DataRow,
  LiveFeed,
  ModuleTabs,
  NeedCard,
  PartnerCard,
  PartnerOpportunityCard,
  PreventionSignalCard,
  ProgramCard,
  ProjectCard,
  QuayPanel,
  SectionHeader,
  ShellCard,
  StatCard,
  primaryButton,
  secondaryButton
} from "./MinistryControlTowerParts";

const mapFilters = ["Tous", "Alertes", "Signaux", "Besoins", "Pirogues"] as const;
type MapFilter = (typeof mapFilters)[number];

export function MinistryControlTower() {
  const [activeModule, setActiveModule] = useState<ModuleId>("map");
  const [selectedQuayId, setSelectedQuayId] = useState("joal");
  const [mapFilter, setMapFilter] = useState<MapFilter>("Tous");
  const [activityLog, setActivityLog] = useState<string[]>([
    "Session institutionnelle ouverte : carte nationale de supervision.",
    "Lecture prudente active : les signaux sensibles sont à qualifier humainement."
  ]);

  const selectedQuay = ministryQuays.find((quay) => quay.id === selectedQuayId) ?? ministryQuays[0];
  const selectedInsight = useMemo(() => assistedInsights.find((insight) => insight.quayId === selectedQuay.id) ?? assistedInsights[0], [selectedQuay.id]);
  const visibleQuays = useMemo(() => {
    if (mapFilter === "Alertes") return ministryQuays.filter((quay) => quay.alerts > 0);
    if (mapFilter === "Signaux") return ministryQuays.filter((quay) => quay.signalsToQualify.length > 0);
    if (mapFilter === "Besoins") return ministryQuays.filter((quay) => quay.communityNeed.length > 0);
    return ministryQuays;
  }, [mapFilter]);
  const totalLandings = ministryQuays.reduce((total, quay) => total + quay.landings, 0);
  const totalSignals = ministryQuays.reduce((total, quay) => total + quay.signalsToQualify.length, 0) + preventionSignals.length;
  const activeAlerts = ministryQuays.reduce((total, quay) => total + quay.alerts, 0);
  const totalNeeds = communityNeeds.length + ministryQuays.filter((quay) => quay.communityNeed).length;
  const piroguesForMap = mapFilter === "Pirogues" ? pilotPirogues : pilotPirogues.filter((pirogue) => pirogue.quayId === selectedQuay.id || pirogue.signal);
  const projectsReady = impactProjects.filter((project) => project.status.includes("Prêt") || project.status.includes("Documenté") || project.status.includes("Prioritaire"));
  const participants = trainingPrograms.reduce((total, program) => total + program.participants, 0);
  const potentialBudget = impactProjects.reduce((total, project) => total + Number(project.budget.replace(/[^0-9]/g, "")), 0);

  function recordAction(action: string) {
    setActivityLog((items) => [`${action} · ${selectedQuay.name}`, ...items].slice(0, 6));
  }

  return <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_12%_0%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_85%_18%,rgba(16,185,129,0.14),transparent_26%),linear-gradient(180deg,#edfdfa_0%,#f8fbfa_45%,#fff7e7_100%)] text-slate-950">
    <header className="border-b border-cyan-100 bg-white/88 px-4 py-5 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan-800 to-emerald-600 text-sm font-black text-white shadow-lg shadow-cyan-900/15">Mb</Link>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministère des Pêches · hub souverain</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Tour de contrôle de la pêche artisanale</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => recordAction("Note ministère préparée")} className={primaryButton}>Préparer une note ministère</button>
          <button onClick={() => recordAction("Demande de vérification institutionnelle ouverte")} className={secondaryButton}>Demander vérification</button>
          <Link href="/espace-prive" className={secondaryButton}>Retour accès</Link>
        </div>
      </div>
    </header>

    <section className="mx-auto grid w-full max-w-[96rem] gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.4rem] border border-cyan-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,254,255,0.75),rgba(240,253,250,0.56))] p-6 shadow-[0_22px_70px_rgba(8,145,178,0.13)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-end">
          <div>
            <Badge tone="info">Tour de contrôle de la pêche artisanale</Badge>
            <h2 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-6xl">Visualiser les quais, suivre les débarquements, écouter les communautés et orienter les financements.</h2>
            <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-slate-600">Mbàmbulaan donne au ministère une lecture territoriale vivante de la filière. La cartographie devient le point d'entrée de la coordination. Les communautés donnent le sens de l'action. Le pilotage prouve l'impact.</p>
          </div>
          <ShellCard className="bg-gradient-to-br from-cyan-950 via-cyan-800 to-emerald-700 text-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Lecture ministère</p>
            <p className="mt-3 text-2xl font-black">Outil souverain de supervision, coordination communautaire, prévention, projets et preuve.</p>
            <p className="mt-4 text-sm font-bold leading-6 text-cyan-50">L'outil ne remplace pas les services compétents : il améliore la coordination et la lecture territoriale.</p>
          </ShellCard>
        </div>
        <div className="mt-6"><ModuleTabs active={activeModule} onChange={setActiveModule} /></div>
      </section>

      {activeModule === "map" ? <MapModule selectedQuay={selectedQuay} selectedInsight={selectedInsight} visibleQuays={visibleQuays} piroguesForMap={piroguesForMap} mapFilter={mapFilter} onFilter={setMapFilter} onSelectQuay={setSelectedQuayId} onCommunity={() => setActiveModule("community")} onProof={() => setActiveModule("proof")} stats={{ totalLandings, totalSignals, activeAlerts, totalNeeds }} /> : null}
      {activeModule === "community" ? <CommunityModule onProof={() => setActiveModule("proof")} potentialBudget={potentialBudget} /> : null}
      {activeModule === "proof" ? <ProofModule selectedQuay={selectedQuay} activityLog={activityLog} projectsReady={projectsReady.length} participants={participants} potentialBudget={potentialBudget} onRecord={recordAction} /> : null}
    </section>
  </main>;
}

function MapModule({ selectedQuay, selectedInsight, visibleQuays, piroguesForMap, mapFilter, onFilter, onSelectQuay, onCommunity, onProof, stats }: {
  selectedQuay: typeof ministryQuays[number];
  selectedInsight: typeof assistedInsights[number];
  visibleQuays: typeof ministryQuays;
  piroguesForMap: typeof pilotPirogues;
  mapFilter: MapFilter;
  onFilter: (filter: MapFilter) => void;
  onSelectQuay: (id: string) => void;
  onCommunity: () => void;
  onProof: () => void;
  stats: { totalLandings: number; totalSignals: number; activeAlerts: number; totalNeeds: number };
}) {
  return <section className="grid gap-6">
    <SectionHeader eyebrow="01 · Carte nationale de supervision" title="Voir, détecter et qualifier géographiquement" description="La carte ne détaille pas les projets : elle révèle les quais, les pirogues pilotes, les zones sensibles et les signaux à vérifier. Les besoins sont ensuite instruits dans la couche communautaire." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><StatCard label="Quais supervisés" value={String(ministryQuays.length)} detail="Points de coordination actifs sur le littoral." /><StatCard label="Débarquements" value={String(stats.totalLandings)} detail="Activité déclarée pour la journée." /><StatCard label="Pirogues pilotes" value={String(pilotPirogues.length)} detail="Suivi déclaratif, non sécuritaire." /><StatCard label="Alertes actives" value={String(stats.activeAlerts)} detail="Situations à qualifier avec prudence." tone="attention" /><StatCard label="Signaux à qualifier" value={String(stats.totalSignals)} detail="Signaux terrain et maritimes." tone="forte" /><StatCard label="Besoins terrain" value={String(stats.totalNeeds)} detail="Demandes communautaires signalées." /></div>
    <div className="flex flex-wrap gap-2">{mapFilters.map((filter) => <button key={filter} onClick={() => onFilter(filter)} className={mapFilter === filter ? primaryButton : secondaryButton}>{filter}</button>)}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]"><ControlMap quays={visibleQuays} pirogues={piroguesForMap} zones={sensitiveZones} selectedId={selectedQuay.id} onSelect={onSelectQuay} /><QuayPanel quay={selectedQuay} onCommunity={onCommunity} onProof={onProof} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"><LiveFeed items={liveSignals} /><AssistedPanel insight={selectedInsight} /></div>
    <ShellCard><SectionHeader eyebrow="Signaux maritimes atypiques" title="Situations nécessitant qualification" description="Ces signaux sont présentés comme des demandes de vérification institutionnelle. Aucun signal n'est une accusation automatique." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{preventionSignals.map((signal) => <PreventionSignalCard key={signal.id} signal={signal} />)}</div></ShellCard>
  </section>;
}

function CommunityModule({ onProof, potentialBudget }: { onProof: () => void; potentialBudget: number }) {
  return <section className="grid gap-6">
    <SectionHeader eyebrow="02 · Communautés, programmes & impact" title="Transformer les besoins terrain en actions utiles et finançables" description="Mbàmbulaan ne remonte pas seulement des problèmes. La plateforme transforme les signaux du terrain en programmes structurés, finançables, suivis et mesurables." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Besoins remontés" value={String(communityNeeds.length)} detail="Froid, sécurité, qualité, jeunes et transformation." tone="attention" /><StatCard label="Projets à financer" value={String(impactProjects.length)} detail="Initiatives communautaires structurables." /><StatCard label="Campagnes" value={String(awarenessCampaigns.length)} detail="Prévention, sécurité et pêche durable." /><StatCard label="Montant potentiel" value={`${potentialBudget} M`} detail="Budget mocké à présenter aux partenaires." tone="forte" /></div>
    <ShellCard><SectionHeader eyebrow="A · Besoins remontés du terrain" title="Les communautés donnent le sens de l'action" description="Chaque besoin peut être qualifié, transformé en projet ou préparé en note courte pour arbitrage." /><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{communityNeeds.map((need) => <NeedCard key={need.id} need={need} />)}</div></ShellCard>
    <ShellCard><SectionHeader eyebrow="B · Projets communautaires à financer" title="Initiatives à impact et dossiers partenaires" description="Les besoins les plus clairs deviennent des projets finançables avec porteur, impact, budget, maturité et partenaire cible." /><div className="grid gap-4 lg:grid-cols-2">{impactProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></ShellCard>
    <ShellCard><SectionHeader eyebrow="C · Formations, sensibilisation & prévention" title="Transformer la prévention en action mesurable" description="Les formations et campagnes permettent de transformer la prévention en action mesurable, avec publics, partenaires et indicateurs." /><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{trainingPrograms.map((program) => <ProgramCard key={program.id} program={program} />)}</div></ShellCard>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]"><ShellCard><SectionHeader eyebrow="D · Partenaires et financements" title="Orienter les partenaires vers les initiatives utiles" description="Les partenaires peuvent être orientés vers les initiatives les plus utiles, documentées et vérifiables." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{partners.map((partner) => <PartnerCard key={partner.id} partner={partner} />)}</div><div className="mt-5 grid gap-3 md:grid-cols-2">{partnerOpportunities.map((opportunity) => <PartnerOpportunityCard key={opportunity.id} opportunity={opportunity} />)}</div></ShellCard><ShellCard className="bg-gradient-to-br from-cyan-950 via-teal-800 to-emerald-700 text-white"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Pourquoi un partenaire financerait ?</p><ul className="mt-4 grid gap-3 text-sm font-bold leading-6 text-cyan-50">{["impact social mesurable", "sécurité en mer", "insertion économique des jeunes", "autonomisation des femmes", "réduction des pertes post-capture", "pêche durable", "souveraineté alimentaire", "professionnalisation des acteurs"].map((item) => <li key={item} className="rounded-2xl bg-white/10 px-3 py-2">{item}</li>)}</ul><button onClick={onProof} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-cyan-950">Voir la preuve d'impact</button></ShellCard></div>
  </section>;
}

function ProofModule({ selectedQuay, activityLog, projectsReady, participants, potentialBudget, onRecord }: { selectedQuay: typeof ministryQuays[number]; activityLog: string[]; projectsReady: number; participants: number; potentialBudget: number; onRecord: (action: string) => void }) {
  const proofInsight = assistedInsights.find((insight) => insight.module === "proof") ?? assistedInsights[0];
  return <section className="grid gap-6">
    <SectionHeader eyebrow="03 · Pilotage & preuve institutionnelle" title="Mesurer, arbitrer, suivre et prouver l'impact" description="Le pilotage ne remplace pas le terrain : il aide à prioriser, arbitrer, coordonner les partenaires et documenter les résultats." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><StatCard label="Volumes suivis" value={`${ministryQuays.reduce((total, quay) => total + quay.volumeTons, 0).toFixed(1)} t`} detail="Synthèse des débarquements mockés." /><StatCard label="Projets prêts" value={String(projectsReady)} detail="Dossiers présentables à court terme." tone="forte" /><StatCard label="Participants" value={String(participants)} detail="Formations et campagnes planifiées." /><StatCard label="Partenaires" value={String(partners.length)} detail="Familles mobilisables." /><StatCard label="Montants" value={`${potentialBudget} M`} detail="Potentiel de financement mocké." /><StatCard label="Signaux qualifiés" value={String(preventionSignals.length)} detail="À vérifier avec prudence." tone="attention" /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]"><ShellCard><SectionHeader eyebrow="Lecture d'arbitrage" title="Indicateurs qui appellent une décision" description="Chaque KPI doit aider à choisir une action, pas simplement afficher une valeur." /><div className="grid gap-3">{proofSentences.map((sentence) => <div key={sentence} className="rounded-2xl border border-cyan-100 bg-cyan-50/65 p-4 text-sm font-black leading-6 text-cyan-950">{sentence}</div>)}</div><div className="mt-5 grid gap-3 md:grid-cols-2"><ProofLine label="Besoins transformés en programme" value={`${communityNeeds.length} besoins`} detail="Froid, sécurité, qualité, insertion et transformation." /><ProofLine label="Campagnes planifiées" value={`${trainingPrograms.length} campagnes`} detail="Prévention, sécurité, qualité et référents." /><ProofLine label="Niveaux de preuve" value="déclaratif / partiel / validé" detail="Les pièces orientent la qualité de décision." /><ProofLine label="Actions en attente" value={activityLog.length.toString()} detail="Traces simulées de coordination et arbitrage." /></div></ShellCard><AssistedPanel insight={proofInsight} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"><ShellCard><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Actions ministère</p><h3 className="mt-2 text-2xl font-black text-slate-950">Suite institutionnelle sur {selectedQuay.name}</h3><p className="mt-3 text-sm font-bold leading-6 text-slate-600">Les projets prêts à financer doivent être présentés aux partenaires dans un format court et vérifiable.</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => onRecord("Fiche partenaire préparée")} className={primaryButton}>Préparer fiche partenaire</button><button onClick={() => onRecord("Note d'arbitrage ajoutée")} className={secondaryButton}>Aide à la note ministère</button><button onClick={() => onRecord("Point programme planifié")} className={secondaryButton}>Planifier point programme</button></div><div className="mt-5 grid gap-2">{fundingModels.map((model) => <div key={model.id} className="rounded-2xl border border-cyan-100 bg-white/70 p-3"><p className="text-sm font-black text-cyan-950">{model.label}</p><p className="mt-1 text-xs font-bold leading-5 text-slate-600">{model.description}</p></div>)}</div></ShellCard><ShellCard><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Traces récentes</p><div className="mt-4 grid gap-3">{activityLog.map((item) => <div key={item} className="rounded-2xl border border-emerald-100 bg-emerald-50/65 p-3 text-sm font-black text-emerald-950">{item}</div>)}</div><p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">En V1, Mbàmbulaan préfigure une lecture assistée. En V2, l'IA pourra accélérer la synthèse, la qualification et la préparation des notes, toujours avec validation humaine.</p></ShellCard></div>
    <ShellCard><SectionHeader eyebrow="Ce que Mbàmbulaan rend possible" title="Une infrastructure finançable, pas seulement utilisable" description="Le ministère peut superviser, écouter, orienter, documenter et prouver l'impact à l'échelle des territoires." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{ministryPossibilities.map((possibility) => <div key={possibility} className="rounded-2xl border border-cyan-100 bg-white/75 p-3 text-sm font-black leading-5 text-cyan-950">{possibility}</div>)}</div></ShellCard>
  </section>;
}

function ProofLine({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-[1.35rem] border border-cyan-100 bg-white/80 p-4"><DataRow label={label} value={value} /><p className="mt-3 text-xs font-bold leading-5 text-slate-500">{detail}</p></div>;
}
