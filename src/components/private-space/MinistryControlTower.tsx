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
    "Lecture prudente active : les signaux sensibles sont a qualifier humainement."
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
  const projectsReady = impactProjects.filter((project) => project.status.includes("Pret") || project.status.includes("Documente") || project.status.includes("Prioritaire"));
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
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-700">Ministere des Peches · hub souverain</p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Tour de controle de la peche artisanale</h1>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => recordAction("Note ministere preparee")} className={primaryButton}>Preparer une note ministere</button>
          <button onClick={() => recordAction("Demande de verification institutionnelle ouverte")} className={secondaryButton}>Demander verification</button>
          <Link href="/espace-prive" className={secondaryButton}>Retour acces</Link>
        </div>
      </div>
    </header>

    <section className="mx-auto grid w-full max-w-[96rem] gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="overflow-hidden rounded-[2.4rem] border border-cyan-100 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,254,255,0.75),rgba(240,253,250,0.56))] p-6 shadow-[0_22px_70px_rgba(8,145,178,0.13)]">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-end">
          <div>
            <Badge tone="info">Tour de controle de la peche artisanale</Badge>
            <h2 className="mt-4 max-w-5xl text-4xl font-black tracking-tight sm:text-6xl">Visualiser les quais, suivre les debarquements, ecouter les communautes et orienter les financements.</h2>
            <p className="mt-5 max-w-3xl text-lg font-bold leading-8 text-slate-650 text-slate-600">Mbàmbulaan donne au ministere une lecture territoriale vivante de la filiere. La cartographie devient le point d'entree de la coordination. Les communautes donnent le sens de l'action. Le pilotage prouve l'impact.</p>
          </div>
          <ShellCard className="bg-gradient-to-br from-cyan-950 via-cyan-800 to-emerald-700 text-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Lecture ministere</p>
            <p className="mt-3 text-2xl font-black">Outil souverain de supervision, coordination communautaire, prevention, projets et preuve.</p>
            <p className="mt-4 text-sm font-bold leading-6 text-cyan-50">L'outil ne remplace pas les services competents : il ameliore la coordination et la lecture territoriale.</p>
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
    <SectionHeader eyebrow="01 · Carte nationale de supervision" title="Voir, detecter et qualifier geographiquement" description="La carte ne detaille pas les projets : elle revele les quais, les pirogues pilotes, les zones sensibles et les signaux a verifier. Les besoins sont ensuite instruits dans la couche communautaire." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><StatCard label="Quais supervises" value={String(ministryQuays.length)} detail="Points de coordination actifs sur le littoral." /><StatCard label="Debarquements" value={String(stats.totalLandings)} detail="Activite declaree pour la journee." /><StatCard label="Pirogues pilotes" value={String(pilotPirogues.length)} detail="Suivi declaratif, non securitaire." /><StatCard label="Alertes actives" value={String(stats.activeAlerts)} detail="Situations a qualifier avec prudence." tone="attention" /><StatCard label="Signaux a qualifier" value={String(stats.totalSignals)} detail="Signaux terrain et maritimes." tone="forte" /><StatCard label="Besoins terrain" value={String(stats.totalNeeds)} detail="Demandes communautaires signalees." /></div>
    <div className="flex flex-wrap gap-2">{mapFilters.map((filter) => <button key={filter} onClick={() => onFilter(filter)} className={mapFilter === filter ? primaryButton : secondaryButton}>{filter}</button>)}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]"><ControlMap quays={visibleQuays} pirogues={piroguesForMap} zones={sensitiveZones} selectedId={selectedQuay.id} onSelect={onSelectQuay} /><QuayPanel quay={selectedQuay} onCommunity={onCommunity} onProof={onProof} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"><LiveFeed items={liveSignals} /><AssistedPanel insight={selectedInsight} /></div>
    <ShellCard><SectionHeader eyebrow="Signaux maritimes atypiques" title="Situations necessitant qualification" description="Ces signaux sont presentes comme des demandes de verification institutionnelle. Aucun signal n'est une accusation automatique." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{preventionSignals.map((signal) => <PreventionSignalCard key={signal.id} signal={signal} />)}</div></ShellCard>
  </section>;
}

function CommunityModule({ onProof, potentialBudget }: { onProof: () => void; potentialBudget: number }) {
  return <section className="grid gap-6">
    <SectionHeader eyebrow="02 · Communautes, programmes & impact" title="Transformer les besoins terrain en actions utiles et financables" description="Mbàmbulaan ne remonte pas seulement des problemes. La plateforme transforme les signaux du terrain en programmes structures, financables, suivis et mesurables." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Besoins remontes" value={String(communityNeeds.length)} detail="Froid, securite, qualite, jeunes et transformation." tone="attention" /><StatCard label="Projets a financer" value={String(impactProjects.length)} detail="Initiatives communautaires structurables." /><StatCard label="Campagnes" value={String(awarenessCampaigns.length)} detail="Prevention, securite et peche durable." /><StatCard label="Montant potentiel" value={`${potentialBudget} M`} detail="Budget mocke a presenter aux partenaires." tone="forte" /></div>
    <ShellCard><SectionHeader eyebrow="A · Besoins remontes du terrain" title="Les communautes donnent le sens de l'action" description="Chaque besoin peut etre qualifie, transforme en projet ou prepare en note courte pour arbitrage." /><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{communityNeeds.map((need) => <NeedCard key={need.id} need={need} />)}</div></ShellCard>
    <ShellCard><SectionHeader eyebrow="B · Projets communautaires a financer" title="Initiatives a impact et dossiers partenaires" description="Les besoins les plus clairs deviennent des projets finançables avec porteur, impact, budget, maturite et partenaire cible." /><div className="grid gap-4 lg:grid-cols-2">{impactProjects.map((project) => <ProjectCard key={project.id} project={project} />)}</div></ShellCard>
    <ShellCard><SectionHeader eyebrow="C · Formations, sensibilisation & prevention" title="Transformer la prevention en action mesurable" description="Les formations et campagnes permettent de transformer la prevention en action mesurable, avec publics, partenaires et indicateurs." /><div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">{trainingPrograms.map((program) => <ProgramCard key={program.id} program={program} />)}</div></ShellCard>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]"><ShellCard><SectionHeader eyebrow="D · Partenaires et financements" title="Orienter les partenaires vers les initiatives utiles" description="Les partenaires peuvent etre orientes vers les initiatives les plus utiles, documentees et verifiables." /><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{partners.map((partner) => <PartnerCard key={partner.id} partner={partner} />)}</div><div className="mt-5 grid gap-3 md:grid-cols-2">{partnerOpportunities.map((opportunity) => <PartnerOpportunityCard key={opportunity.id} opportunity={opportunity} />)}</div></ShellCard><ShellCard className="bg-gradient-to-br from-cyan-950 via-teal-800 to-emerald-700 text-white"><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-100">Pourquoi un partenaire financerait ?</p><ul className="mt-4 grid gap-3 text-sm font-bold leading-6 text-cyan-50">{["impact social mesurable", "securite en mer", "insertion economique des jeunes", "autonomisation des femmes", "reduction des pertes post-capture", "peche durable", "souverainete alimentaire", "professionnalisation des acteurs"].map((item) => <li key={item} className="rounded-2xl bg-white/10 px-3 py-2">{item}</li>)}</ul><button onClick={onProof} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-cyan-950">Voir la preuve d'impact</button></ShellCard></div>
  </section>;
}

function ProofModule({ selectedQuay, activityLog, projectsReady, participants, potentialBudget, onRecord }: { selectedQuay: typeof ministryQuays[number]; activityLog: string[]; projectsReady: number; participants: number; potentialBudget: number; onRecord: (action: string) => void }) {
  const proofInsight = assistedInsights.find((insight) => insight.module === "proof") ?? assistedInsights[0];
  return <section className="grid gap-6">
    <SectionHeader eyebrow="03 · Pilotage & preuve institutionnelle" title="Mesurer, arbitrer, suivre et prouver l'impact" description="Le pilotage ne remplace pas le terrain : il aide a prioriser, arbitrer, coordonner les partenaires et documenter les resultats." />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><StatCard label="Volumes suivis" value={`${ministryQuays.reduce((total, quay) => total + quay.volumeTons, 0).toFixed(1)} t`} detail="Synthese des debarquements mockes." /><StatCard label="Projets prets" value={String(projectsReady)} detail="Dossiers presentables a court terme." tone="forte" /><StatCard label="Participants" value={String(participants)} detail="Formations et campagnes planifiees." /><StatCard label="Partenaires" value={String(partners.length)} detail="Familles mobilisables." /><StatCard label="Montants" value={`${potentialBudget} M`} detail="Potentiel de financement mocke." /><StatCard label="Signaux qualifies" value={String(preventionSignals.length)} detail="A verifier avec prudence." tone="attention" /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]"><ShellCard><SectionHeader eyebrow="Lecture d'arbitrage" title="Indicateurs qui appellent une decision" description="Chaque KPI doit aider a choisir une action, pas simplement afficher une valeur." /><div className="grid gap-3">{proofSentences.map((sentence) => <div key={sentence} className="rounded-2xl border border-cyan-100 bg-cyan-50/65 p-4 text-sm font-black leading-6 text-cyan-950">{sentence}</div>)}</div><div className="mt-5 grid gap-3 md:grid-cols-2"><ProofLine label="Besoins transformes en programme" value={`${communityNeeds.length} besoins`} detail="Froid, securite, qualite, insertion et transformation." /><ProofLine label="Campagnes planifiees" value={`${trainingPrograms.length} campagnes`} detail="Prevention, securite, qualite et referents." /><ProofLine label="Niveaux de preuve" value="declaratif / partiel / valide" detail="Les pieces orientent la qualite de decision." /><ProofLine label="Actions en attente" value={activityLog.length.toString()} detail="Traces simulees de coordination et arbitrage." /></div></ShellCard><AssistedPanel insight={proofInsight} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"><ShellCard><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Actions ministere</p><h3 className="mt-2 text-2xl font-black text-slate-950">Suite institutionnelle sur {selectedQuay.name}</h3><p className="mt-3 text-sm font-bold leading-6 text-slate-600">Les projets prets a financer doivent etre presentes aux partenaires dans un format court et verifiable.</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => onRecord("Fiche partenaire preparee")} className={primaryButton}>Preparer fiche partenaire</button><button onClick={() => onRecord("Note d'arbitrage ajoutee")} className={secondaryButton}>Aide a la note ministere</button><button onClick={() => onRecord("Point programme planifie")} className={secondaryButton}>Planifier point programme</button></div><div className="mt-5 grid gap-2">{fundingModels.map((model) => <div key={model.id} className="rounded-2xl border border-cyan-100 bg-white/70 p-3"><p className="text-sm font-black text-cyan-950">{model.label}</p><p className="mt-1 text-xs font-bold leading-5 text-slate-600">{model.description}</p></div>)}</div></ShellCard><ShellCard><p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Traces recentes</p><div className="mt-4 grid gap-3">{activityLog.map((item) => <div key={item} className="rounded-2xl border border-emerald-100 bg-emerald-50/65 p-3 text-sm font-black text-emerald-950">{item}</div>)}</div><p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-950">En V1, Mbàmbulaan prefigure une lecture assistee. En V2, l'IA pourra accelerer la synthese, la qualification et la preparation des notes, toujours avec validation humaine.</p></ShellCard></div>
    <ShellCard><SectionHeader eyebrow="Ce que Mbàmbulaan rend possible" title="Une infrastructure finançable, pas seulement utilisable" description="Le ministere peut superviser, ecouter, orienter, documenter et prouver l'impact a l'echelle des territoires." /><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{ministryPossibilities.map((possibility) => <div key={possibility} className="rounded-2xl border border-cyan-100 bg-white/75 p-3 text-sm font-black leading-5 text-cyan-950">{possibility}</div>)}</div></ShellCard>
  </section>;
}

function ProofLine({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="rounded-[1.35rem] border border-cyan-100 bg-white/80 p-4"><DataRow label={label} value={value} /><p className="mt-3 text-xs font-bold leading-5 text-slate-500">{detail}</p></div>;
}
