"use client";

import { useState } from "react";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import {
  Mission,
  MissionForm,
  glyphBorderColor,
  pipelineStages,
  priorityLabels,
  priorityToTag,
  situationPriorityRank
} from "@/components/etat/shared";
import type { Signal, Situation } from "@/domain/types";
import { channelMeta } from "@/lib/status-tokens";
import { TrustGlyph, TrustGlyphLabel, trustGlyphFromLevel } from "@/components/etat/TrustGlyph";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";

// LOT V3.18 ("Situations & signaux — copie conforme du rendu maquette") —
// reconstruction complète sur le plan exact de l'écran `isSit` : maître-
// détail 392px/1fr (jamais la liste de signaux pleine largeur + panneau
// latéral "provenance" de la version précédente), funnel + ancienneté en
// double panneau sous l'en-tête, détail à 4 onglets (Ce que nous savons /
// Chronologie / Sources / Ce que vous décidez). Mandat explicite de
// l'utilisateur, identique aux LOTs V3.16/V3.17 : "j'oublie tout
// l'existant [...] copie conforme".
//
// La sélection maître-détail porte sur les SITUATIONS (maquette : `sitList`
// affiche des situations, pas des signaux) — la version précédente listait
// les signaux avec un panneau latéral de provenance ; ce changement de
// grain reste honnête : chaque situation affichée l'est via ses vrais
// champs (Situation.*), ses signaux réels apparaissent dans l'onglet
// "Sources" plutôt que d'être eux-mêmes la ligne de liste.
//
// Onglet "Ce que vous décidez" (mandat, non négociable — même arbitrage
// que /app/etat/arbitrages, LOT P2.DESIGN-1B §11) : jamais les 3-4
// options pro/con en texte libre du prototype (propres à sa fixture,
// aucune commande générique du domaine derrière) — seulement les 2
// actions réelles déjà supportées par le référentiel.
const channelStackColor: Record<Signal["channel"], string> = {
  terrain: "#0B1A2A",
  poste_quai: "#B6522F",
  telephone: "#DE9C74",
  whatsapp_structure: "#7FB08A",
  espace_public: "rgba(11,26,42,.18)"
};

const AGE_BUCKETS = [
  { label: "0-2 j", test: (d: number) => d <= 2 },
  { label: "3-7 j", test: (d: number) => d >= 3 && d <= 7 },
  { label: "8-14 j", test: (d: number) => d >= 8 && d <= 14 },
  { label: "15-30 j", test: (d: number) => d >= 15 && d <= 30 },
  { label: "31 j +", test: (d: number) => d > 30 }
];

const TABS = [
  { key: "connu", label: "Ce que nous savons" },
  { key: "chrono", label: "Chronologie" },
  { key: "sources", label: "Sources" },
  { key: "decision", label: "Ce que vous décidez" }
] as const;
type TabKey = (typeof TABS)[number]["key"];

export default function SituationsPage() {
  const { state } = useProduct();
  const [severityFilter, setSeverityFilter] = useState<"all" | "critique" | "haute">("all");
  const [channelFilter, setChannelFilter] = useState<"all" | Signal["channel"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("connu");
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);

  if (!state) return null;

  const datasetReferenceAt = deriveDatasetReferenceAt(state);
  const referenceAtMs = datasetReferenceAt ? new Date(datasetReferenceAt).getTime() : Date.now();

  // Funnel réel — mêmes seuils exacts que /app/etat ("De la capture à la
  // décision"), jamais un second calcul divergent.
  const totalSignalsCaptes = state.signals.length;
  const signalsQualifies = state.signals.filter((item) => item.disposition !== "nouveau").length;
  const situationsSuivies = state.situations.length;
  const situationsAvecPreuve = state.situations.filter((item) => item.status === "resultat" || item.status === "reglee").length;
  const funnel = [
    { label: "Signaux captés", n: totalSignalsCaptes, pct: 100 },
    { label: "Signaux qualifiés", n: signalsQualifies, pct: totalSignalsCaptes > 0 ? (signalsQualifies / totalSignalsCaptes) * 100 : 0 },
    { label: "Situations suivies", n: situationsSuivies, pct: totalSignalsCaptes > 0 ? (situationsSuivies / totalSignalsCaptes) * 100 : 0 },
    { label: "Situations closes avec preuve", n: situationsAvecPreuve, pct: totalSignalsCaptes > 0 ? (situationsAvecPreuve / totalSignalsCaptes) * 100 : 0 }
  ];

  // Ancienneté des situations ouvertes — répartition réelle par tranche
  // d'âge (premier évènement d'historique → horloge métier du jeu de
  // données), jamais une distribution fabriquée.
  const openSituations = state.situations.filter((item) => item.status !== "reglee");
  const situationAgeDays = (situation: Situation): number | null => {
    const first = situation.history[0]?.at;
    if (!first) return null;
    return Math.max(0, Math.floor((referenceAtMs - new Date(first).getTime()) / 86_400_000));
  };
  const aging = AGE_BUCKETS.map((bucket) => ({
    ...bucket,
    n: openSituations.filter((item) => { const age = situationAgeDays(item); return age !== null && bucket.test(age); }).length
  }));
  const maxAgingBucket = Math.max(1, ...aging.map((item) => item.n));

  const channelCounts = (Object.keys(channelMeta) as Signal["channel"][])
    .map((channel) => ({ channel, count: state.signals.filter((item) => item.channel === channel).length }))
    .sort((a, b) => b.count - a.count);

  const filteredSituations = state.situations
    .filter((item) => severityFilter === "all" || item.priority === severityFilter)
    .filter((item) => channelFilter === "all" || item.signalIds.some((id) => state.signals.find((s) => s.id === id)?.channel === channelFilter))
    .sort((a, b) => situationPriorityRank[b.priority] - situationPriorityRank[a.priority]);

  const selected = (selectedId && filteredSituations.find((item) => item.id === selectedId)) || filteredSituations[0] || null;
  const selTerritory = selected ? state.territories.find((item) => item.id === selected.territoryId) : undefined;
  const selSignals = selected ? selected.signalIds.map((id) => state.signals.find((item) => item.id === id)).filter((item): item is Signal => Boolean(item)) : [];
  const selPrimaryChannel = selSignals[0]?.channel;
  const selAge = selected ? situationAgeDays(selected) : null;
  const selDecisions = selected ? state.decisions.filter((item) => item.situationId === selected.id).length : 0;
  const selStageIndex = selected ? pipelineStages.findIndex((stage) => stage.status === selected.status) : -1;

  return (
    <div className="px-4 pb-16 pt-6 sm:px-[30px]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-[26px]">
        <div className="min-w-0 flex-1">
          <p className="etat-eyebrow">Situations et signaux</p>
          <h1 className="mt-2.5 font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 32, lineHeight: 1.15, color: "var(--etat-navy)" }}>Ce qui remonte des territoires.</h1>
        </div>
        <div className="flex flex-none gap-6">
          {[
            { v: openSituations.length, k: "Ouvertes", c: "var(--etat-navy)" },
            { v: openSituations.filter((s) => s.priority === "critique").length, k: "Critiques", c: "var(--etat-critique)" },
            { v: state.decisions.length, k: "Décisions", c: "var(--etat-terracotta)" }
          ].map((stat) => (
            <div key={stat.k} className="text-right">
              <p style={{ fontFamily: "var(--etat-font-mono)", fontSize: 24, lineHeight: 1, color: stat.c }}>{stat.v}</p>
              <p className="mt-[5px] text-[10px] uppercase tracking-[.08em]" style={{ color: "rgba(11,26,42,.5)" }}>{stat.k}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel + ancienneté — grille à liseré 1px, même géométrie que la
          maquette. */}
      <div className="mt-4 grid grid-cols-1 gap-px border lg:grid-cols-[1.15fr_1fr]" style={{ background: "rgba(11,26,42,.12)", borderColor: "rgba(11,26,42,.12)" }}>
        <div className="bg-white px-[18px] py-[15px]">
          <div className="mb-3 flex items-baseline gap-2.5">
            <p className="flex-1 text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>De l’information reçue à la preuve</p>
            <p className="text-[11.5px]" style={{ color: "var(--etat-terracotta)" }}>{totalSignalsCaptes > 0 ? Math.round((situationsAvecPreuve / totalSignalsCaptes) * 100) : 0}% aboutissent à une preuve</p>
          </div>
          {funnel.map((row) => (
            <div key={row.label} className="mb-2 flex items-center gap-3">
              <span className="w-[150px] shrink-0 text-[11.5px]" style={{ color: "var(--etat-navy)" }}>{row.label}</span>
              <span className="relative h-4 flex-1" style={{ background: "rgba(11,26,42,.06)" }}><span className="absolute inset-y-0 left-0" style={{ width: `${row.pct}%`, background: "var(--etat-terracotta)" }} /></span>
              <span className="w-14 shrink-0 text-right text-[12px]" style={{ fontFamily: "var(--etat-font-mono)" }}>{row.n}</span>
            </div>
          ))}
        </div>
        <div className="bg-white px-[18px] py-[15px]">
          <div className="mb-3 flex items-baseline gap-2.5">
            <p className="flex-1 text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Ancienneté des situations ouvertes</p>
            <p className="text-[11.5px]" style={{ color: "rgba(11,26,42,.55)" }}>Une situation qui vieillit sans preuve est un risque</p>
          </div>
          <div className="flex h-[74px] items-end gap-2">
            {aging.map((bucket) => (
              <div key={bucket.label} className="flex h-full flex-1 flex-col justify-end">
                <p className="mb-1 text-center text-[11px]" style={{ fontFamily: "var(--etat-font-mono)", color: bucket.n > 0 ? "var(--etat-navy)" : "rgba(11,26,42,.35)" }}>{bucket.n}</p>
                <div style={{ height: `${Math.max(4, (bucket.n / maxAgingBucket) * 100)}%`, background: bucket.label === "31 j +" && bucket.n > 0 ? "var(--etat-critique)" : "var(--etat-navy)" }} />
                <p className="mt-1 text-center text-[9.5px]" style={{ color: "rgba(11,26,42,.5)" }}>{bucket.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres — sévérité + canal, mêmes filtres réels que la maquette
          (`sitFilters`). */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-[10px] uppercase tracking-[.14em]" style={{ color: "rgba(11,26,42,.45)" }}>Filtrer</span>
        {([{ key: "all", label: `Toutes · ${state.situations.length}` }, { key: "critique", label: `Critique · ${state.situations.filter((s) => s.priority === "critique").length}` }, { key: "haute", label: `Élevé · ${state.situations.filter((s) => s.priority === "haute").length}` }] as const).map((f) => (
          <button key={f.key} onClick={() => setSeverityFilter(f.key)} className="rounded-full border px-3 py-1.5 text-[11.5px] font-medium" style={severityFilter === f.key ? { borderColor: "var(--etat-navy)", background: "var(--etat-navy)", color: "#F7F3E9" } : { borderColor: "rgba(11,26,42,.2)", color: "var(--etat-navy)" }}>{f.label}</button>
        ))}
        {channelCounts.filter((c) => c.count > 0).map(({ channel, count }) => (
          <button key={channel} onClick={() => setChannelFilter(channelFilter === channel ? "all" : channel)} className="flex items-center gap-[7px] rounded-full border px-3 py-1.5 text-[11.5px] font-medium" style={channelFilter === channel ? { borderColor: "var(--etat-navy)", background: "var(--etat-navy)", color: "#F7F3E9" } : { borderColor: "rgba(11,26,42,.2)", color: "var(--etat-navy)" }}>
            <span className="size-[7px] rounded-full" style={{ background: channelStackColor[channel] }} />{channelMeta[channel].label} · {count}
          </button>
        ))}
        <span className="flex-1" />
        <span className="text-[11.5px]" style={{ color: "rgba(11,26,42,.55)" }}>{filteredSituations.length} situation(s)</span>
      </div>

      <div className="mt-4 grid grid-cols-1 border lg:grid-cols-[392px_1fr]" style={{ borderColor: "rgba(11,26,42,.12)" }}>
        <div className="border-b bg-white lg:border-b-0 lg:border-r" style={{ borderColor: "rgba(11,26,42,.12)" }}>
          {filteredSituations.length === 0 ? (
            <p className="p-[18px] text-[12.5px] leading-[1.55]" style={{ color: "rgba(11,26,42,.6)" }}>Aucune situation ne correspond à ces filtres. Retirez un critère pour élargir la sélection.</p>
          ) : filteredSituations.map((situation) => {
            const tag = priorityToTag[situation.priority];
            const territory = state.territories.find((item) => item.id === situation.territoryId);
            const age = situationAgeDays(situation);
            const isSelected = selected?.id === situation.id;
            return (
              <button
                key={situation.id}
                onClick={() => setSelectedId(situation.id)}
                className="block w-full border-b px-[15px] py-[13px] text-left"
                style={{ borderColor: "rgba(11,26,42,.07)", backgroundColor: isSelected ? "rgba(182,82,47,.07)" : undefined, boxShadow: isSelected ? `inset 3px 0 0 ${glyphBorderColor[tag]}` : "none" }}
              >
                <div className="mb-[7px] flex items-center gap-2">
                  <span className="size-[7px] shrink-0" style={{ background: glyphBorderColor[tag] }} />
                  <span className="text-[10.5px] font-medium uppercase tracking-[.06em]" style={{ color: glyphBorderColor[tag] }}>{priorityLabels[situation.priority]}</span>
                  <span className="flex-1" />
                  <TrustGlyphLabel level={trustGlyphFromLevel(situation.trust)} className="text-[10.5px] text-[rgba(11,26,42,.5)]" />
                </div>
                <p className="mb-[7px] text-[13px] font-medium leading-[1.4]">{situation.title}</p>
                <div className="flex items-center gap-2.5 text-[11px]" style={{ color: "rgba(11,26,42,.55)" }}>
                  <span>{territory?.name ?? situation.territoryId}</span>
                  <span className="h-2.5 w-px" style={{ background: "rgba(11,26,42,.18)" }} />
                  <span>{age === null ? "—" : age <= 0 ? "aujourd’hui" : `il y a ${age} j`}</span>
                  <span className="flex-1" />
                  <span style={{ fontFamily: "var(--etat-font-mono)" }}>{pipelineStages.find((s) => s.status === situation.status)?.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selected && (
          <div className="min-w-0 bg-white">
            <div className="px-6 pb-[18px] pt-5" style={{ background: "var(--etat-navy)", color: "#F7F3E9" }}>
              <div className="mb-[11px] flex flex-wrap items-center gap-2.5">
                <span className="flex items-center gap-[7px] rounded-full border px-2.5 py-[3px] text-[11px]" style={{ borderColor: glyphBorderColor[priorityToTag[selected.priority]] }}>
                  <span className="size-1.5 rounded-full" style={{ background: glyphBorderColor[priorityToTag[selected.priority]] }} />{priorityLabels[selected.priority]}
                </span>
                <span className="text-[11.5px]" style={{ color: "rgba(247,243,233,.6)" }}>
                  {selTerritory?.name ?? selected.territoryId} · {selAge === null ? "—" : selAge <= 0 ? "aujourd’hui" : `il y a ${selAge} j`}{selPrimaryChannel ? ` · reçu par ${channelMeta[selPrimaryChannel].label}` : ""}
                </span>
              </div>
              <h2 className="mb-3 max-w-[34ch] font-normal" style={{ fontFamily: "var(--etat-font-display)", fontSize: 27, lineHeight: 1.2 }}>{selected.title}</h2>
              <p className="max-w-[78ch] text-[13.5px] leading-[1.6]" style={{ color: "rgba(247,243,233,.82)" }}>{selected.description !== selected.title ? selected.description : selected.nextStep}</p>
              <div className="mt-[15px] flex items-center gap-2.5 border-t pt-[14px]" style={{ borderColor: "rgba(247,243,233,.14)" }}>
                <span className="shrink-0 text-[10px] uppercase tracking-[.12em]" style={{ color: "#DE9C74" }}>Pourquoi cela compte</span>
                <span className="text-[12.5px]" style={{ color: "rgba(247,243,233,.85)" }}>{selected.nextStep}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px border-b sm:grid-cols-4" style={{ background: "rgba(11,26,42,.1)", borderColor: "rgba(11,26,42,.1)" }}>
              {[
                { n: selSignals.length, k: "Signaux liés" },
                { n: selDecisions, k: "Décisions documentées" },
                { n: selAge ?? "—", k: "Ancienneté (jours)" },
                { n: selStageIndex >= 0 ? `${selStageIndex + 1}/${pipelineStages.length}` : "—", k: "Étape du pipeline" }
              ].map((tile) => (
                <div key={tile.k} className="bg-white px-[15px] py-[13px]">
                  <p style={{ fontFamily: "var(--etat-font-mono)", fontSize: 20, lineHeight: 1 }}>{tile.n}</p>
                  <p className="mt-[5px] text-[10.5px] leading-[1.35]" style={{ color: "rgba(11,26,42,.55)" }}>{tile.k}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-0 overflow-x-auto border-b px-3.5" style={{ borderColor: "rgba(11,26,42,.12)" }}>
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="shrink-0 whitespace-nowrap px-[13px] pb-2.5 pt-3"
                  style={{ fontSize: 12.5, fontWeight: activeTab === tab.key ? 600 : 400, color: activeTab === tab.key ? "var(--etat-navy)" : "rgba(11,26,42,.5)", boxShadow: activeTab === tab.key ? "inset 0 -2px 0 var(--etat-terracotta)" : "none" }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="px-6 py-5">
              {activeTab === "connu" && (
                <div className="grid grid-cols-1 gap-[26px] sm:grid-cols-2">
                  <div>
                    <div className="mb-2.5 flex items-center gap-2"><span className="h-[2px] w-[18px]" style={{ background: "#4E7B5A" }} /><span className="text-[10px] uppercase tracking-[.12em]" style={{ color: "#4E7B5A" }}>Ce que nous savons</span></div>
                    {selected.history.length === 0 ? <p className="text-[13px]" style={{ color: "var(--etat-stone-400)" }}>Aucun fait consigné.</p> : selected.history.slice(0, 3).map((entry, i) => (
                      <div key={i} className="mb-2.5 border-l-2 pl-[13px] text-[13px] leading-[1.55]" style={{ borderColor: "rgba(78,123,90,.32)", color: "rgba(11,26,42,.85)" }}>{entry.detail || entry.label}</div>
                    ))}
                  </div>
                  <div>
                    <div className="mb-2.5 flex items-center gap-2"><span className="h-[2px] w-[18px]" style={{ background: "#B6522F" }} /><span className="text-[10px] uppercase tracking-[.12em]" style={{ color: "#B6522F" }}>Ce qui reste incertain</span></div>
                    {selected.waitingReason ? (
                      <div className="border-l-2 pl-[13px] text-[13px] leading-[1.55]" style={{ borderColor: "rgba(182,82,47,.32)", color: "rgba(11,26,42,.85)" }}>{selected.waitingReason}</div>
                    ) : <p className="text-[13px]" style={{ color: "var(--etat-stone-400)" }}>Aucune incertitude documentée.</p>}
                  </div>
                </div>
              )}
              {activeTab === "chrono" && (
                selected.history.length === 0 ? (
                  <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucun évènement consigné.</p>
                ) : selected.history.map((entry, i) => (
                  <div key={entry.id} className="flex gap-4 pb-[18px]">
                    <span className="w-[96px] shrink-0 pt-0.5 text-right text-[11px]" style={{ fontFamily: "var(--etat-font-mono)", color: "rgba(11,26,42,.5)" }}>{new Date(entry.at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}</span>
                    <div className="flex shrink-0 flex-col items-center self-stretch">
                      <span className="size-2 rounded-full" style={{ background: "var(--etat-terracotta)" }} />
                      {i < selected.history.length - 1 && <span className="mt-[5px] w-px flex-1" style={{ background: "rgba(11,26,42,.14)" }} />}
                    </div>
                    <div className="min-w-0 flex-1 pt-px">
                      <p className="text-[13px] leading-[1.5]">{entry.label}</p>
                      <p className="mt-1 text-[11px]" style={{ color: "rgba(11,26,42,.5)" }}>{entry.actor}</p>
                    </div>
                  </div>
                ))
              )}
              {activeTab === "sources" && (
                <>
                  {selSignals.length === 0 ? (
                    <p className="text-[12.5px]" style={{ color: "var(--etat-stone-400)" }}>Aucun signal rattaché.</p>
                  ) : selSignals.map((signal) => (
                    <div key={signal.id} className="mb-2.5 flex items-start gap-[14px] border p-[13px]" style={{ borderColor: "rgba(11,26,42,.1)" }}>
                      <TrustGlyph level={trustGlyphFromLevel(signal.trust)} className="mt-0.5" />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium">{signal.source}</p>
                        <p className="mt-[3px] text-[11.5px]" style={{ color: "rgba(11,26,42,.55)" }}>Canal : {channelMeta[signal.channel].label}</p>
                      </div>
                    </div>
                  ))}
                  <div className="mt-3.5 p-[13px] text-[12px] leading-[1.55]" style={{ background: "var(--etat-cream)", border: "1px solid rgba(11,26,42,.1)", color: "rgba(11,26,42,.7)" }}>Une situation ne change de niveau de connaissance que lorsqu’une source secondaire la confirme. Mbàmbulaan n’élève jamais une déclaration au rang de fait vérifié sans trace.</div>
                </>
              )}
              {activeTab === "decision" && (
                <>
                  <div className="mb-5 grid grid-cols-1 gap-px border sm:grid-cols-2" style={{ background: "rgba(11,26,42,.1)", borderColor: "rgba(11,26,42,.1)" }}>
                    <div className="p-[15px]" style={{ background: "var(--etat-cream)" }}>
                      <p className="mb-2 text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Ce que le système constate</p>
                      <p className="text-[13px] leading-[1.55]">{selected.waitingReason ?? "Aucune incertitude bloquante documentée."}</p>
                    </div>
                    <div className="p-[15px]" style={{ background: "var(--etat-cream)" }}>
                      <p className="mb-2 text-[10px] uppercase tracking-[.12em]" style={{ color: "var(--etat-terracotta)" }}>Ce que le système suggère</p>
                      <p className="text-[13px] leading-[1.55]">{selected.nextStep}</p>
                    </div>
                  </div>
                  <p className="mb-3 text-[10px] uppercase tracking-[.12em]" style={{ color: "rgba(11,26,42,.5)" }}>Ce que vous décidez — la décision reste humaine et tracée</p>
                  <div className="flex flex-wrap gap-2.5">
                    <button onClick={() => setMissionDrawer({ key: `situation-${selected.id}`, territoryId: selected.territoryId, territoryLabel: selTerritory?.name ?? selected.territoryId, raison: selected.title, action: selected.nextStep, glyphStatus: priorityToTag[selected.priority], suggestedObjective: "verification_vigilance" })} className="etat-btn etat-btn-outline">Planifier une visite terrain</button>
                    <a href="/app/etat/arbitrages" className="etat-btn etat-btn-primary">Arbitrer cette situation</a>
                  </div>
                  <p className="mt-3.5 text-[11px] leading-[1.6]" style={{ color: "rgba(11,26,42,.55)" }}>Mbàmbulaan n’arbitre pas : la décision est enregistrée au nom de la personne qui la prend, avec sa justification — jamais les options de texte libre d’une maquette, qui ne correspondraient à aucune commande réelle du domaine pour une situation quelconque.</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => setMissionDrawer(null)} />}
      </Drawer>
    </div>
  );
}
