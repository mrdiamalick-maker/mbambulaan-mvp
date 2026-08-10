"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  FileDown,
  Radio,
  Send,
  ShieldCheck,
  Users
} from "lucide-react";
import { useProduct } from "@/components/providers/ProductProvider";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { Drawer } from "@/components/etat/Drawer";
import type { Territory } from "@/domain/types";
import {
  fieldVisitObjectiveLabels,
  type FieldVisit,
  type FieldVisitObjective
} from "@/domain/ministry/field-visit";
import {
  vigilanceCategoryLabels,
  vigilanceSeverityLabels,
  type VigilanceCase,
  type VigilanceCategory,
  type VigilanceSeverity
} from "@/domain/ministry/vigilance";

const activityLabels: Record<Territory["activity"], string> = { stable: "Stable", vigilance: "Vigilance", critique: "Critique" };
const activityTagClass: Record<Territory["activity"], string> = { stable: "etat-tag--stable", vigilance: "etat-tag--vigilance", critique: "etat-tag--critique" };
const severityToTag: Record<VigilanceSeverity, "stable" | "vigilance" | "critique"> = { faible: "stable", moyenne: "vigilance", haute: "vigilance", critique: "critique" };

function formatFcfa(amount: number) {
  return `${new Intl.NumberFormat("fr-FR").format(Math.round(amount))} FCFA`;
}

type Mission = {
  key: string;
  territoryId: string;
  territoryLabel: string;
  raison: string;
  action: string;
  glyphStatus: "stable" | "vigilance" | "critique";
  suggestedObjective: FieldVisitObjective;
};

export default function EtatPage() {
  const { state, actorId } = useProduct();
  const [cases, setCases] = useState<VigilanceCase[]>([]);
  const [visits, setVisits] = useState<FieldVisit[]>([]);
  const [territoryDrawer, setTerritoryDrawer] = useState<Territory | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);
  const [signalDrawerOpen, setSignalDrawerOpen] = useState(false);

  const reload = async () => {
    const [visitsRes, casesRes] = await Promise.all([fetch("/api/ministry/field-visits"), fetch("/api/ministry/vigilance")]);
    if (visitsRes.ok) setVisits((await visitsRes.json()).visits ?? []);
    if (casesRes.ok) setCases((await casesRes.json()).cases ?? []);
  };

  useEffect(() => {
    void reload();
  }, []);

  const actor = state?.actors.find((item) => item.id === actorId);
  const openCases = useMemo(() => cases.filter((item) => item.status !== "clos"), [cases]);

  const { executedValue, engagedValue } = useMemo(() => {
    if (!state) return { executedValue: 0, engagedValue: 0 };
    let executed = 0;
    let engaged = 0;
    for (const opportunity of state.opportunities) {
      const lot = state.lots.find((item) => item.id === opportunity.lotId);
      const species = lot ? state.species.find((item) => item.id === lot.speciesId) : undefined;
      if (!lot || !species) continue;
      const value = lot.quantityKg * species.indicativePriceFcfaKg;
      if (opportunity.status === "executee") executed += value;
      if (opportunity.status === "engagee") engaged += value;
    }
    return { executedValue: executed, engagedValue: engaged };
  }, [state]);

  const dominant = useMemo(() => {
    if (openCases.length > 0) {
      const top = [...openCases].sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0];
      return { kind: "signal" as const, glyphStatus: severityToTag[top.severity], case: top };
    }
    const critiqueTerritory = state?.territories.find((item) => item.activity === "critique");
    if (critiqueTerritory) return { kind: "territoire" as const, glyphStatus: "critique" as const, territory: critiqueTerritory };
    return { kind: "calme" as const, glyphStatus: "stable" as const };
  }, [openCases, state]);

  const missions: Mission[] = useMemo(() => {
    if (!state) return [];
    const fromCases: Mission[] = openCases.map((item) => ({
      key: `case-${item.id}`,
      territoryId: item.territoryId,
      territoryLabel: item.territoryLabel,
      raison: `Signal ${vigilanceCategoryLabels[item.category].toLowerCase()} — gravité ${vigilanceSeverityLabels[item.severity].toLowerCase()}`,
      action: "Vérifier la situation sur place et transmettre aux autorités compétentes si confirmée.",
      glyphStatus: severityToTag[item.severity],
      suggestedObjective: "verification_vigilance"
    }));
    const coveredTerritoryIds = new Set(openCases.map((item) => item.territoryId));
    const fromTerritories: Mission[] = state.territories
      .filter((item) => item.activity !== "stable" && !coveredTerritoryIds.has(item.id))
      .map((item) => {
        const fragile = state.infrastructures.filter((infra) => infra.territoryId === item.id && infra.status !== "operationnelle").length;
        return {
          key: `territoire-${item.id}`,
          territoryId: item.id,
          territoryLabel: item.name,
          raison: fragile > 0 ? `Territoire en ${activityLabels[item.activity].toLowerCase()} — ${fragile} infrastructure(s) fragile(s) ou indisponible(s)` : `Territoire en ${activityLabels[item.activity].toLowerCase()}`,
          action: "Rencontrer les acteurs locaux et évaluer les besoins prioritaires.",
          glyphStatus: item.activity,
          suggestedObjective: "rencontre_pecheurs" as const
        };
      });
    return [...fromCases, ...fromTerritories]
      .sort((a, b) => rankGlyph(b.glyphStatus) - rankGlyph(a.glyphStatus))
      .slice(0, 5);
  }, [state, openCases]);

  const leadIndicators = useMemo(() => {
    if (!state) return [];
    return state.initiatives.slice(0, 2).map((initiative) => ({ title: initiative.title, indicator: initiative.indicators[0] })).filter((item) => item.indicator);
  }, [state]);

  if (!state) return null;
  const acteursCoordonnes = state.actors.length;
  const signauxTraites = cases.filter((item) => item.status === "transmis_autorites" || item.status === "clos").length;
  const territoiresActifs = state.territories.length;
  const territoiresAttention = state.territories.filter((item) => item.activity !== "stable");
  const territoiresStables = state.territories.filter((item) => item.activity === "stable");

  return (
    <div className="etat-scope">
      {/* Principe institutionnel — visible une fois, en tête, comme l'exige le CDC */}
      <div className="etat-principle mx-5 mt-5 lg:mx-8 lg:mt-6">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--etat-terracotta)]" />
        <p>Mbàmbulaan <strong>qualifie et signale</strong> les situations remontées du terrain. La décision et l’action relèvent des autorités compétentes.</p>
      </div>

      {/* Ouverture — l'état du moment (élément dominant, pas une grille) */}
      <section className="etat-canvas-dark mx-5 mt-4 overflow-hidden rounded-[28px] p-6 lg:mx-8 lg:p-10">
        <p className="etat-eyebrow etat-eyebrow--on-dark">Espace État · {actor?.name ?? "Ministère"}</p>
        <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center">
          <TensionGlyph status={dominant.glyphStatus} size={84} pulse={dominant.kind !== "calme"} />
          <div className="min-w-0 flex-1">
            {dominant.kind === "signal" && (
              <>
                <h1 className="etat-display text-2xl not-italic leading-[1.15] text-white md:text-[1.7rem]">
                  En ce moment : {vigilanceCategoryLabels[dominant.case.category]} à {dominant.case.territoryLabel}.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">{dominant.case.description}</p>
              </>
            )}
            {dominant.kind === "territoire" && (
              <>
                <h1 className="etat-display text-2xl not-italic leading-[1.15] text-white md:text-[1.7rem]">
                  En ce moment : {dominant.territory.name} concentre l’attention du réseau.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Territoire classé en activité critique — voir le détail pour comprendre ce qui s’y joue.</p>
              </>
            )}
            {dominant.kind === "calme" && (
              <>
                <h1 className="etat-display text-2xl not-italic leading-[1.15] text-white md:text-[1.7rem]">Aucune tension prioritaire signalée pour le moment.</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Le réseau reste sous surveillance continue ; les territoires et signaux actifs restent consultables ci-dessous.</p>
              </>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              {dominant.kind === "territoire" && (
                <button onClick={() => setTerritoryDrawer(dominant.territory)} className="etat-btn etat-btn-on-dark">Voir le territoire <ArrowRight size={15} /></button>
              )}
              <a href="#signaux" className="etat-btn etat-btn-on-dark">Voir la vigilance <ArrowRight size={15} /></a>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-5 mt-8 space-y-10 pb-16 lg:mx-8">
        {/* Défi 1 — valeur générée */}
        <section>
          <p className="etat-eyebrow">Diversifier les revenus des pêcheurs</p>
          <h2 className="etat-display mt-2 text-xl not-italic text-[var(--etat-navy-950)]">Une valeur additionnelle réelle, générée par la coordination.</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="etat-panel p-6">
              <span className="etat-tag etat-tag--demo">Environnement de démonstration</span>
              <p className="etat-display mt-4 text-[2.1rem] not-italic leading-none text-[var(--etat-navy-950)]">{formatFcfa(executedValue)}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-stone-600)]">Valeur exécutée à date</p>
              <p className="mt-4 text-sm leading-6 text-[var(--etat-stone-600)]">{formatFcfa(engagedValue)} supplémentaires sont engagés — mise en relation confirmée entre un lot disponible et un besoin qualifié, en cours de réalisation.</p>
              <p className="mt-4 text-xs leading-5 text-[var(--etat-stone-400)]">Origine : mise en relation directe entre lots disponibles et besoins qualifiés par le réseau Mbàmbulaan — pas une promesse théorique, un calcul sur les opportunités réellement traitées dans l’environnement.</p>
            </div>
            <div className="etat-panel--warm p-6">
              <p className="text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-navy-800)]">Évolution des programmes en cours</p>
              <div className="mt-4 space-y-5">
                {leadIndicators.map(({ title, indicator }) => indicator && (
                  <div key={title}>
                    <p className="text-sm font-bold text-[var(--etat-navy-950)]">{title}</p>
                    <p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{indicator.label}</p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--etat-offwhite-dim)]">
                      <div className="h-full rounded-full bg-[var(--etat-terracotta)]" style={{ width: `${Math.min(100, (indicator.current / indicator.target) * 100)}%` }} />
                    </div>
                    <p className="mt-1.5 text-xs text-[var(--etat-stone-600)]">{indicator.current} / {indicator.target} {indicator.unit} <span className="text-[var(--etat-stone-400)]">(départ : {indicator.baseline})</span></p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <hr className="etat-divider" />

        {/* Défi 2 — présence terrain */}
        <section>
          <p className="etat-eyebrow">Rencontrer les pêcheurs sans déplacement systématique</p>
          <h2 className="etat-display mt-2 text-xl not-italic text-[var(--etat-navy-950)]">La réalité terrain, territoire par territoire.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--etat-stone-600)]">{territoiresAttention.length} territoire(s) demandent une attention particulière sur {territoiresActifs} suivis par le réseau.</p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {territoiresAttention.map((territory) => (
              <button key={territory.id} onClick={() => setTerritoryDrawer(territory)} className="etat-panel flex items-center gap-2.5 px-3.5 py-2.5 text-left transition hover:border-[var(--etat-navy-600)]">
                <TensionGlyph status={territory.activity} size={26} />
                <span>
                  <span className="block text-sm font-bold text-[var(--etat-navy-950)]">{territory.name}</span>
                  <span className={`etat-tag ${activityTagClass[territory.activity]} mt-1`}>{activityLabels[territory.activity]}</span>
                </span>
              </button>
            ))}
          </div>
          <details className="mt-4">
            <summary className="cursor-pointer text-xs font-bold text-[var(--etat-stone-600)]">+ {territoiresStables.length} territoire(s) stables</summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {territoiresStables.map((territory) => (
                <button key={territory.id} onClick={() => setTerritoryDrawer(territory)} className="etat-tag etat-tag--stable">{territory.name}</button>
              ))}
            </div>
          </details>
        </section>

        <hr className="etat-divider" />

        {/* Défi 3 — vigilance */}
        <section id="signaux">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="etat-eyebrow">Lutter contre les fléaux</p>
              <h2 className="etat-display mt-2 text-xl not-italic text-[var(--etat-navy-950)]">Vigilance — signaux à qualifier.</h2>
            </div>
            <button onClick={() => setSignalDrawerOpen(true)} className="etat-btn etat-btn-outline"><Radio size={15} /> Signaler une situation</button>
          </div>
          {openCases.length === 0 ? (
            <p className="mt-5 text-sm text-[var(--etat-stone-600)]">Aucun signal ouvert pour le moment.</p>
          ) : (
            <div className="mt-5 space-y-2.5">
              {openCases.map((item) => (
                <div key={item.id} className="etat-panel flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <TensionGlyph status={severityToTag[item.severity]} size={30} />
                    <div>
                      <p className="text-sm font-bold text-[var(--etat-navy-950)]">{vigilanceCategoryLabels[item.category]} · {item.territoryLabel}</p>
                      <p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{item.description}</p>
                      <p className="mt-1 text-[11px] text-[var(--etat-stone-400)]">Signalé le {new Date(item.createdAt).toLocaleDateString("fr-FR")} · gravité {vigilanceSeverityLabels[item.severity].toLowerCase()}</p>
                    </div>
                  </div>
                  <span className={`etat-tag ${activityTagClass[severityToTag[item.severity]]}`}>{item.status.replace(/_/g, " ")}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr className="etat-divider" />

        {/* Défi 6 — missions terrain recommandées */}
        <section>
          <p className="etat-eyebrow">Donner au ministère une activité terrain concrète</p>
          <h2 className="etat-display mt-2 text-xl not-italic text-[var(--etat-navy-950)]">Missions recommandées.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--etat-stone-600)]">Générées à partir des tensions et signaux actifs — une liste priorisée, pas un système de gestion.</p>
          {missions.length === 0 ? (
            <p className="mt-5 text-sm text-[var(--etat-stone-600)]">Aucune mission suggérée : aucune tension active à traiter en priorité.</p>
          ) : (
            <div className="mt-5 space-y-2.5">
              {missions.map((mission) => (
                <div key={mission.key} className="etat-panel flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <TensionGlyph status={mission.glyphStatus} size={30} />
                    <div>
                      <p className="text-sm font-bold text-[var(--etat-navy-950)]">{mission.territoryLabel}</p>
                      <p className="mt-0.5 text-xs text-[var(--etat-stone-600)]">{mission.raison}</p>
                      <p className="mt-1 text-xs text-[var(--etat-navy-600)]">→ {mission.action}</p>
                    </div>
                  </div>
                  <button onClick={() => setMissionDrawer(mission)} className="etat-btn etat-btn-outline shrink-0">Planifier <ArrowRight size={14} /></button>
                </div>
              ))}
            </div>
          )}
          {visits.filter((item) => item.status === "planifiee").length > 0 && (
            <p className="mt-4 text-xs text-[var(--etat-stone-600)]">{visits.filter((item) => item.status === "planifiee").length} mission(s) déjà planifiée(s) par le ministère.</p>
          )}
        </section>

        <hr className="etat-divider" />

        {/* Défi 4 — statistiques */}
        <section>
          <p className="etat-eyebrow">Outil statistique de supervision</p>
          <h2 className="etat-display mt-2 text-xl not-italic text-[var(--etat-navy-950)]">La coordination en chiffres.</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
            <div className="etat-panel p-6">
              <div className="flex items-center gap-2 text-[var(--etat-navy-600)]"><Users size={16} /><span className="etat-tag etat-tag--demo">Démonstration</span></div>
              <p className="etat-display mt-3 text-[2.1rem] not-italic leading-none text-[var(--etat-navy-950)]">{acteursCoordonnes}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-stone-600)]">Acteurs coordonnés</p>
            </div>
            <div className="etat-panel p-6">
              <span className="etat-tag etat-tag--demo">Démonstration</span>
              <p className="etat-display mt-3 text-2xl not-italic text-[var(--etat-navy-950)]">{signauxTraites}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-stone-600)]">Signaux traités</p>
            </div>
            <div className="etat-panel p-6">
              <span className="etat-tag etat-tag--demo">Démonstration</span>
              <p className="etat-display mt-3 text-2xl not-italic text-[var(--etat-navy-950)]">{territoiresActifs}</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-stone-600)]">Territoires actifs</p>
            </div>
          </div>
        </section>

        <hr className="etat-divider" />

        {/* Défi 5 — bailleurs */}
        <section className="etat-canvas-dark flex flex-col gap-5 rounded-[24px] p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="etat-eyebrow etat-eyebrow--on-dark">Capter l’attention des bailleurs</p>
            <h2 className="etat-display mt-2 text-xl not-italic text-white">Un rapport d’impact prêt à partager.</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Structuré par territoire, exportable, pensé pour vos propres échanges avec les bailleurs et programmes.</p>
          </div>
          <Link href="/app/etat/rapport" className="etat-btn etat-btn-primary shrink-0"><FileDown size={16} /> Ouvrir le rapport bailleurs</Link>
        </section>
      </div>

      {/* Panneau territoire */}
      <Drawer open={!!territoryDrawer} onClose={() => setTerritoryDrawer(null)} eyebrow="Territoire" title={territoryDrawer?.name ?? ""}>
        {territoryDrawer && <TerritoryDetail territory={territoryDrawer} cases={cases.filter((item) => item.territoryId === territoryDrawer.id)} />}
      </Drawer>

      {/* Panneau signalement */}
      <Drawer open={signalDrawerOpen} onClose={() => setSignalDrawerOpen(false)} eyebrow="Vigilance" title="Signaler une situation">
        <SignalForm territories={state.territories} onDone={() => { setSignalDrawerOpen(false); void reload(); }} />
      </Drawer>

      {/* Panneau mission */}
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => { setMissionDrawer(null); void reload(); }} />}
      </Drawer>
    </div>
  );
}

function severityRank(severity: VigilanceSeverity) {
  return { faible: 0, moyenne: 1, haute: 2, critique: 3 }[severity];
}
function rankGlyph(status: "stable" | "vigilance" | "critique") {
  return { stable: 0, vigilance: 1, critique: 2 }[status];
}

function TerritoryDetail({ territory, cases }: { territory: Territory; cases: VigilanceCase[] }) {
  const { state } = useProduct();
  if (!state) return null;
  const sites = state.sites.filter((item) => item.territoryId === territory.id);
  const infrastructures = state.infrastructures.filter((item) => item.territoryId === territory.id);
  const fragile = infrastructures.filter((item) => item.status !== "operationnelle");
  return (
    <div className="space-y-6">
      <span className={`etat-tag ${activityTagClass[territory.activity]}`}>{activityLabels[territory.activity]}</span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-stone-600)]">Localisation</p>
        <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{territory.region}</p>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-stone-600)]">Infrastructures</p>
        <p className="mt-1 text-sm text-[var(--etat-navy-950)]">{sites.length} site(s) · {infrastructures.length} infrastructure(s), dont {fragile.length} fragile(s) ou indisponible(s).</p>
      </div>
      {cases.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-[.05em] text-[var(--etat-stone-600)]">Signaux sur ce territoire</p>
          <div className="mt-2 space-y-2">
            {cases.map((item) => (
              <div key={item.id} className="rounded-lg bg-[var(--etat-offwhite)] p-3 text-xs text-[var(--etat-navy-800)]">{vigilanceCategoryLabels[item.category]} — {item.description}</div>
            ))}
          </div>
        </div>
      )}
      <Link href={`/atlas/${territory.id}`} target="_blank" className="etat-btn etat-btn-outline w-full justify-center">Fiche territoire complète (site public) <ArrowUpRight size={14} /></Link>
    </div>
  );
}

function SignalForm({ territories, onDone }: { territories: Territory[]; onDone: () => void }) {
  const [category, setCategory] = useState<VigilanceCategory>("immigration_clandestine");
  const [territoryId, setTerritoryId] = useState("");
  const [severity, setSeverity] = useState<VigilanceSeverity>("moyenne");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/vigilance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, territoryId, severity, description })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Impossible d’enregistrer ce signalement.");
        return;
      }
      onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-xs font-bold text-[var(--etat-navy-800)]">
        Catégorie
        <select value={category} onChange={(event) => setCategory(event.target.value as VigilanceCategory)} className="mt-1.5 w-full rounded-lg border border-[var(--etat-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--etat-terracotta)]">
          {Object.entries(vigilanceCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold text-[var(--etat-navy-800)]">
        Territoire
        <select required value={territoryId} onChange={(event) => setTerritoryId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--etat-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--etat-terracotta)]">
          <option value="">Sélectionner…</option>
          {territories.map((territory) => <option key={territory.id} value={territory.id}>{territory.name}</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold text-[var(--etat-navy-800)]">
        Gravité
        <select value={severity} onChange={(event) => setSeverity(event.target.value as VigilanceSeverity)} className="mt-1.5 w-full rounded-lg border border-[var(--etat-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--etat-terracotta)]">
          {Object.entries(vigilanceSeverityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="block text-xs font-bold text-[var(--etat-navy-800)]">
        Description
        <textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--etat-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--etat-terracotta)]" placeholder="Ce qui a été observé, où et par qui." />
      </label>
      {error && <p className="text-xs font-semibold text-[var(--etat-terracotta)]">{error}</p>}
      <button disabled={pending} className="etat-btn etat-btn-primary w-full justify-center disabled:opacity-60">Signaler <Send size={15} /></button>
    </form>
  );
}

function MissionForm({ mission, onDone }: { mission: Mission; onDone: () => void }) {
  const [title, setTitle] = useState(`${fieldVisitObjectiveLabels[mission.suggestedObjective]} — ${mission.territoryLabel}`);
  const [plannedAt, setPlannedAt] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/ministry/field-visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, territoryId: mission.territoryId, objective: mission.suggestedObjective, plannedAt, notes: notes || undefined })
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error ?? "Impossible de planifier cette mission.");
        return;
      }
      onDone();
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="etat-panel--warm p-3.5 text-xs leading-5 text-[var(--etat-navy-800)]"><strong>{mission.territoryLabel}</strong> — {mission.raison}</div>
      <label className="block text-xs font-bold text-[var(--etat-navy-800)]">
        Titre
        <input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--etat-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--etat-terracotta)]" />
      </label>
      <label className="block text-xs font-bold text-[var(--etat-navy-800)]">
        Date prévue
        <input required type="date" value={plannedAt} onChange={(event) => setPlannedAt(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--etat-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--etat-terracotta)]" />
      </label>
      <label className="block text-xs font-bold text-[var(--etat-navy-800)]">
        Notes (facultatif)
        <textarea rows={2} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-1.5 w-full rounded-lg border border-[var(--etat-line)] px-3 py-2.5 text-sm outline-none focus:border-[var(--etat-terracotta)]" />
      </label>
      {error && <p className="text-xs font-semibold text-[var(--etat-terracotta)]">{error}</p>}
      <button disabled={pending} className="etat-btn etat-btn-primary w-full justify-center disabled:opacity-60">Planifier la mission <ArrowRight size={15} /></button>
    </form>
  );
}
