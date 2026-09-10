"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, MapPin } from "lucide-react";
import type { ProductState, Role, Situation } from "@/domain/types";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";
import {
  situationAgeLabel,
  situationAging,
  situationFunnel,
  situationStats
} from "@/domain/situation-overview";
import {
  glyphBorderColor,
  priorityLabels,
  priorityToTag,
  situationStageLabel,
  trustLabels,
  type GlyphTag
} from "@/lib/status-tokens";
import { TensionGlyph } from "@/components/etat/TensionGlyph";
import { BarMetricChart } from "@/components/private/BarMetricChart";
import { SituationDetailPanel } from "@/components/situations/SituationDetailPanel";

const nonOperatorRoles: Role[] = ["gestionnaire_organisation", "partenaire", "mareyeur", "transformateur", "prestataire"];

type SeverityFilter = Situation["priority"] | null;
type TrustFilter = "declaree" | "verifiee" | null;

// LOT V3.2 (mandat "Situations & Progressive Detail") — surface d'ensemble
// unique, montée par les deux routes réelles (/app/situations et
// /app/situations/[id], mandat §17 "deep links doivent continuer de
// fonctionner" — 8+ points d'appel existants dans le Produit vers cette
// 2e route, cf. TerritoryDecisionPanel, ProviderTaskView, IntelligenceFeed,
// PilotageWorkspace, CommunityWorkspace, initiatives/page.tsx). `selectedId`
// vient de l'URL (jamais un état local qui déconnecterait la vue de son
// adresse) : cliquer une ligne de la liste navigue réellement vers
// /app/situations/<id> plutôt que de ne changer qu'un état interne —
// chaque situation reste partageable/bookmarkable, sans jamais quitter le
// module (mandat §11, "Situations must own its experience").
export function SituationsExplorer({ state, role, actorId, selectedId }: { state: ProductState; role: Role; actorId: string; selectedId?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<SeverityFilter>(null);
  const [trust, setTrust] = useState<TrustFilter>(null);
  const [toQualifyOnly, setToQualifyOnly] = useState(false);

  const actor = state.actors.find((item) => item.id === actorId);
  const territoryIds = new Set(actor?.territoryIds ?? []);
  const inScope = (territoryId: string) => territoryIds.size === 0 || territoryIds.has(territoryId);

  const referenceAtMs = useMemo(() => {
    const datasetReferenceAt = deriveDatasetReferenceAt(state);
    return datasetReferenceAt ? new Date(datasetReferenceAt).getTime() : Date.now();
  }, [state]);

  const stats = useMemo(() => situationStats(state), [state]);
  const funnel = useMemo(() => situationFunnel(state), [state]);
  const aging = useMemo(() => situationAging(state, referenceAtMs), [state, referenceAtMs]);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- inScope dérive uniquement de state/actorId, déjà en dépendances (même motif que l'ancienne page.tsx qu'il remplace).
  const scoped = useMemo(() => state.situations.filter((item) => inScope(item.territoryId)), [state, actorId]);
  const queryNormalized = query.trim().toLowerCase();
  const filtered = useMemo(() => scoped.filter((item) => {
    const territory = state.territories.find((entry) => entry.id === item.territoryId);
    const matchesSeverity = !severity || item.priority === severity;
    const matchesTrust = !trust || (trust === "declaree" ? item.trust === "declaree" : item.trust !== "declaree");
    const matchesQualify = !toQualifyOnly || item.status === "recue" || item.status === "qualification";
    const matchesQuery = !queryNormalized || `${item.title} ${item.reference} ${territory?.name ?? ""}`.toLowerCase().includes(queryNormalized);
    return matchesSeverity && matchesTrust && matchesQualify && matchesQuery;
  }), [scoped, state, severity, trust, toQualifyOnly, queryNormalized]);

  // Résolution du détail actif — pour un `selectedId` (lien profond direct,
  // /app/situations/<id>), cherche dans state.situations SANS scope ni
  // filtre : un lien profond existant (Territoires, Terrain, Pilotage…)
  // doit continuer de mener à LA bonne situation même si elle serait
  // exclue du registre (hors territoire de l'opérateur, ou hors des
  // filtres actifs) — jamais retomber silencieusement sur une autre
  // situation (mandat §17, "deep links doivent continuer de
  // fonctionner"). Sans `selectedId` (route /app/situations nue), reprend
  // le comportement par défaut Claude Design V3 : la première situation
  // du registre FILTRÉ.
  const requestedSituation = selectedId ? state.situations.find((item) => item.id === selectedId) : undefined;
  const situationNotFound = Boolean(selectedId) && !requestedSituation;
  const activeSituation = selectedId ? requestedSituation : filtered[0];

  // Même redirection que l'ancienne page (mareyeur/transformateur/
  // prestataire/gestionnaire_organisation/partenaire ont leur propre file
  // — Aujourd'hui) : dans un effet, jamais pendant le rendu (règle React,
  // même discipline que l'ancienne src/app/app/(coordination)/situations/
  // page.tsx).
  const redirectToHub = nonOperatorRoles.includes(role);
  useEffect(() => {
    if (redirectToHub) router.replace("/app/travail");
  }, [redirectToHub, router]);
  if (redirectToHub) return null;

  return (
    <div className="shadcn-scope space-y-6 bg-background p-5 pb-16 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Situations et signaux</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-[32px]">{stats.open} situation{stats.open > 1 ? "s" : ""} ouverte{stats.open > 1 ? "s" : ""}, {stats.toQualify} attend{stats.toQualify > 1 ? "ent" : ""} encore une source secondaire</h1>
        </div>
        <div className="flex flex-none gap-6">
          <Stat value={stats.open} label="ouvertes" />
          <Stat value={stats.critical} label="critiques" tone="var(--etat-critique, #c8452b)" />
          <Stat value={stats.toQualify} label="à qualifier" tone="var(--etat-terracotta, #b6522f)" />
          <Stat value={stats.closedWithEvidence} label="closes avec preuve" tone="var(--mb-success, #4e7b5a)" />
        </div>
      </header>

      <div className="grid gap-px overflow-hidden rounded-lg border bg-border lg:grid-cols-2">
        <div className="bg-background p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">De l’information reçue à la preuve</p>
          <BarMetricChart valueLabel="au total" data={funnel.map((step) => ({ key: step.key, label: step.label, value: step.value }))} />
        </div>
        <div className="bg-background p-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Ancienneté des situations ouvertes</p>
          <BarMetricChart valueLabel="situation(s)" data={aging.map((bucket) => ({ key: bucket.key, label: bucket.label, value: bucket.count }))} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-y py-4">
        <span className="mr-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Filtrer</span>
        <FilterChip active={!severity && !trust && !toQualifyOnly} onClick={() => { setSeverity(null); setTrust(null); setToQualifyOnly(false); }}>Toutes · {scoped.length}</FilterChip>
        {(["critique", "haute", "moyenne", "faible"] as const).map((level) => (
          <FilterChip key={level} active={severity === level} dot={glyphBorderColor[priorityToTag[level]]} onClick={() => setSeverity(severity === level ? null : level)}>{priorityLabels[level]}</FilterChip>
        ))}
        <FilterChip active={trust === "declaree"} onClick={() => setTrust(trust === "declaree" ? null : "declaree")}>Déclarées seulement</FilterChip>
        <FilterChip active={trust === "verifiee"} onClick={() => setTrust(trust === "verifiee" ? null : "verifiee")}>Recoupées ou mieux</FilterChip>
        <FilterChip active={toQualifyOnly} onClick={() => setToQualifyOnly(!toQualifyOnly)}>À qualifier</FilterChip>
        <label className="relative ml-auto">
          <span className="sr-only">Rechercher</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Référence, quai ou objet…" className="w-56 rounded-md border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary/50" />
        </label>
        <span className="text-xs text-muted-foreground">{filtered.length} situation{filtered.length > 1 ? "s" : ""} affichée{filtered.length > 1 ? "s" : ""} sur {scoped.length}</span>
      </div>

      <div className="grid gap-0 overflow-hidden rounded-lg border lg:grid-cols-[392px_1fr]">
        {/* Registre — masqué sous lg quand une situation est ouverte (mandat
            §13, mobile préserve la hiérarchie sans reproduire littéralement
            la densité desktop) : le panneau de détail prend alors tout
            l'écran, avec un retour explicite vers le registre. */}
        <div className={`min-w-0 divide-y border-b lg:border-b-0 lg:border-r ${selectedId ? "hidden lg:block" : ""}`}>
          {filtered.length === 0 ? (
            <p className="p-6 text-sm leading-6 text-muted-foreground">Aucune situation ne correspond à ces filtres. Retirez un critère pour élargir la sélection.</p>
          ) : (
            filtered.map((item) => (
              <SituationListRow key={item.id} situation={item} state={state} active={activeSituation?.id === item.id} referenceAtMs={referenceAtMs} onOpen={() => router.push(`/app/situations/${item.id}`)} />
            ))
          )}
        </div>

        <div className={`min-w-0 p-5 lg:p-6 ${selectedId ? "" : "hidden lg:block"}`}>
          {selectedId && (
            <Link href="/app/situations" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground lg:hidden"><ArrowLeft size={15} /> Registre</Link>
          )}
          {situationNotFound ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Situation introuvable.</p>
              <Link href="/app/situations" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"><ArrowLeft size={15} /> Revenir au registre</Link>
            </div>
          ) : activeSituation ? (
            <SituationDetailPanel state={state} situation={activeSituation} role={role} />
          ) : (
            <p className="text-sm text-muted-foreground">Sélectionnez une situation pour en voir le détail.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <div className="text-right">
      <p className="font-mono text-2xl leading-none" style={tone ? { color: tone } : undefined}>{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

function FilterChip({ active, dot, onClick, children }: { active: boolean; dot?: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/40"}`}
    >
      {dot && <span className="size-1.5 rounded-full" style={{ background: active ? "currentColor" : dot }} />}
      {children}
    </button>
  );
}

function SituationListRow({ situation, state, active, referenceAtMs, onOpen }: { situation: Situation; state: ProductState; active: boolean; referenceAtMs: number; onOpen: () => void }) {
  const territory = state.territories.find((item) => item.id === situation.territoryId);
  const tag: GlyphTag = priorityToTag[situation.priority];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full px-4 py-3.5 text-left transition"
      style={active ? { background: "rgba(182,82,47,.06)", boxShadow: "inset 3px 0 0 var(--etat-terracotta, #b6522f)" } : undefined}
    >
      <div className="flex items-center gap-2">
        <TensionGlyph status={tag} size={16} />
        <span className="text-[10.5px] font-semibold uppercase tracking-wide" style={{ color: glyphBorderColor[tag] }}>{priorityLabels[situation.priority]}</span>
        <span className="flex-1" />
        <span className="text-[10.5px] text-muted-foreground">{trustLabels[situation.trust]}</span>
      </div>
      <p className="mt-1.5 line-clamp-2 text-sm font-medium leading-5">{situation.title}</p>
      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1"><MapPin size={11} /> {territory?.name ?? "Territoire non défini"}</span>
        <span aria-hidden="true">·</span>
        <span>{situationAgeLabel(situation, referenceAtMs)}</span>
        <span className="flex-1" />
        <span className="font-mono text-[10.5px]" style={situation.status === "reglee" ? { color: "var(--mb-success, #4e7b5a)" } : undefined}>{situationStageLabel[situation.status]}</span>
        <ChevronRight size={13} className="shrink-0" />
      </div>
    </button>
  );
}
