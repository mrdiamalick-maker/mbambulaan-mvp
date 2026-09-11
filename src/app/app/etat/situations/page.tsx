"use client";

import { useState } from "react";
import Image from "next/image";
import { useProduct } from "@/components/providers/ProductProvider";
import { Drawer } from "@/components/etat/Drawer";
import {
  Mission,
  MissionForm,
  SituationDetail,
  glyphBorderColor,
  pipelineStages,
  priorityLabels,
  priorityToTag
} from "@/components/etat/shared";
import type { Signal, Situation } from "@/domain/types";
import { signalDispositionLabels } from "@/domain/types";
import { channelMeta } from "@/lib/status-tokens";
import { TrustGlyph, trustGlyphFromLevel } from "@/components/etat/TrustGlyph";
import { deriveDatasetReferenceAt } from "@/domain/signal-crossing";

// P2.DESIGN-1B (mandat CEO "Claude Design V2 → Real Product
// Implementation", §5, "Situations & signaux") — nouvelle route réelle,
// dédiée au pipeline terrain → signal → qualification → situation, qui
// n'avait jusqu'ici aucune surface propre (seulement une section "Le
// pouls de la filière" sur le Brief national et des tiroirs isolés).
// "Determine the cleanest real product mapping" (mandat) : plutôt que
// d'inventer un nouveau domaine, cette page lit exactement le même
// pipeline Signal.disposition / Situation déjà utilisé par le Brief
// national (mêmes variables, mêmes seuils — jamais un second calcul qui
// pourrait diverger du premier).
//
// Même discipline "jamais fabriqué" que le reste du produit :
// - Le canal ("Provenance des signaux") vient de Signal.channel, réel.
// - "Ce que l'on sait" par signal vient de Signal.description, réel.
// - Aucun "délai de qualification" chiffré n'est affiché ici : contrairement
//   au Brief national (délai mesuré ailleurs), aucune paire signal→situation
//   horodatée fiable n'est disponible pour calculer un délai médian honnête
//   à l'échelle de CE registre — plutôt que d'improviser un calcul fragile,
//   la colonne "Étape" (pipelineStages, réel) porte seule cette information.
// Photos de situations (mandat P2.DESIGN-1B.1 §8) : 6 images fournies,
// chacune porte une signalétique de quai photographiée qui correspond
// littéralement à un intitulé du mandat. Rapprochement fait par contenu
// (pas par nom de fichier) contre les situations RÉELLES de demo-state.ts —
// seules 4 des 6 intitulés du mandat ont une situation réelle correspondante
// (même territoire, même sujet) : Joal (glace), Mbour (froid saturé),
// Saint-Louis (retour de pirogue) et Djiffer (balance/pesée). "Transformation
// en hausse, conservation à la traîne" et "Érosion du front de quai
// observée" n'ont aucune situation réelle équivalente dans le Demo World
// actuel (aucun territoire ne porte ce sujet) — conformément au mandat
// ("never invent a situation because an image exists"), ces 2 images ne
// sont volontairement PAS rattachées ici plutôt que forcées sur une
// situation qui ne les décrit pas.
const situationImages: Partial<Record<string, string>> = {
  "sit-glace": "/images/etat-situation-glace-hors-service.webp",
  "sit-mbour": "/images/etat-situation-capacite-saturee.webp",
  "sit-saint-louis": "/images/etat-situation-retour-pirogue.webp",
  "sit-djiffer": "/images/etat-situation-pesee-mareyeurs.webp"
};

const channelStackColor: Record<Signal["channel"], string> = {
  terrain: "#0B1A2A",
  poste_quai: "#B6522F",
  telephone: "#DE9C74",
  whatsapp_structure: "#7FB08A",
  espace_public: "rgba(11,26,42,.18)"
};

function stageProgressDots(status: Situation["status"] | null): boolean[] {
  if (!status) return [false, false, false, false];
  const index = pipelineStages.findIndex((stage) => stage.status === status);
  const ratio = index < 0 ? 0 : (index + 1) / pipelineStages.length;
  const filled = Math.max(1, Math.round(ratio * 4));
  return [0, 1, 2, 3].map((i) => i < filled);
}

export default function SituationsPage() {
  const { state } = useProduct();
  const [channelFilter, setChannelFilter] = useState<"all" | Signal["channel"]>("all");
  const [dispositionFilter, setDispositionFilter] = useState<"all" | Signal["disposition"]>("all");
  const [situationDrawer, setSituationDrawer] = useState<Situation | null>(null);
  const [missionDrawer, setMissionDrawer] = useState<Mission | null>(null);

  if (!state) return null;

  // Horloge métier du jeu de données (mandat P2.DESIGN-1B.2 §3) — jamais
  // Date.now(), cf. commentaire détaillé dans arbitrages/page.tsx
  // (situationAge). Même fonction réelle (signal-crossing.ts), déjà
  // utilisée ailleurs pour la fraîcheur des capacités.
  const datasetReferenceAt = deriveDatasetReferenceAt(state);
  const referenceAtMs = datasetReferenceAt ? new Date(datasetReferenceAt).getTime() : Date.now();

  // Pipeline réel — mêmes seuils exacts que /app/etat ("De la capture à la
  // décision"), jamais un second calcul divergent.
  const totalSignalsCaptes = state.signals.length;
  const signalsQualifies = state.signals.filter((item) => item.disposition !== "nouveau").length;
  const situationsSuivies = state.situations.length;
  const situationsAvecPreuve = state.situations.filter((item) => item.status === "resultat" || item.status === "reglee").length;
  const nonQualifies = totalSignalsCaptes - signalsQualifies;

  const signalToSituation = new Map<string, Situation>();
  for (const situation of state.situations) {
    for (const signalId of situation.signalIds) signalToSituation.set(signalId, situation);
  }

  const filteredSignals = state.signals
    .filter((item) => channelFilter === "all" || item.channel === channelFilter)
    .filter((item) => dispositionFilter === "all" || item.disposition === dispositionFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const channelCounts = (Object.keys(channelMeta) as Signal["channel"][])
    .map((channel) => ({ channel, count: state.signals.filter((item) => item.channel === channel).length }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="pb-16">
      <div className="border-b border-[var(--etat-line)] px-6 pt-9 pb-8 lg:px-[60px]" style={{ background: "var(--etat-warm-white)" }}>
        <div className="flex flex-wrap gap-14">
          <div className="min-w-0 flex-1">
            <p className="etat-eyebrow">Situations &amp; signaux · flux terrain</p>
            <h1 className="etat-display etat-h1 etat-h1--registry mt-3.5">Ce qui remonte<br />des territoires.</h1>
            <p className="mt-4 max-w-[560px] text-[14.5px] leading-[1.62]" style={{ color: "rgba(11,26,42,.72)" }}>{totalSignalsCaptes} signaux captés, {signalsQualifies} qualifiés, {situationsSuivies} devenus situations suivies. Un signal n’est jamais une situation avant qualification par un humain.</p>
          </div>
          <div className="w-full max-w-[470px] flex-none">
            <p className="text-[9.5px] font-semibold uppercase tracking-[.14em] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-body)" }}>Terrain → signal → qualification → situation</p>
            <div className="mt-4 space-y-3">
              {[
                { label: "Signaux captés", n: totalSignalsCaptes, max: totalSignalsCaptes, c: "#0B1A2A" },
                { label: "Signaux qualifiés", n: signalsQualifies, max: totalSignalsCaptes, c: "#B6522F" },
                { label: "Situations suivies", n: situationsSuivies, max: totalSignalsCaptes, c: "#DE9C74" },
                { label: "Situations closes avec preuve", n: situationsAvecPreuve, max: totalSignalsCaptes, c: "#7FB08A" }
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex justify-between text-[12px]"><span className="font-medium text-[var(--etat-navy)]">{row.label}</span><span className="text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>{row.n}</span></div>
                  <div className="mt-1.5 h-[9px] w-full" style={{ background: "rgba(11,26,42,.08)" }}><div className="h-[9px]" style={{ width: `${row.max > 0 ? (row.n / row.max) * 100 : 0}%`, background: row.c }} /></div>
                </div>
              ))}
            </div>
            {nonQualifies > 0 && <p className="mt-3.5 text-[11px] leading-[1.6] text-[var(--etat-stone-600)]">{nonQualifies} signal{nonQualifies > 1 ? "aux" : ""} rest{nonQualifies > 1 ? "ent" : "e"} non qualifié{nonQualifies > 1 ? "s" : ""} : provenance incomplète ou non recoupée.</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setDispositionFilter("all")} className="etat-tag" style={{ background: dispositionFilter === "all" ? "var(--etat-navy)" : "transparent", color: dispositionFilter === "all" ? "var(--etat-cream)" : "rgba(11,26,42,.72)", border: dispositionFilter === "all" ? "none" : "1px solid rgba(11,26,42,.20)" }}>Tous les signaux · {totalSignalsCaptes}</button>
          {(["nouveau", "qualifie", "en_observation", "ecarte"] as const).map((disposition) => {
            const count = state.signals.filter((item) => item.disposition === disposition).length;
            if (count === 0) return null;
            return (
              <button key={disposition} onClick={() => setDispositionFilter(disposition)} className="etat-tag" style={{ background: "transparent", color: dispositionFilter === disposition ? "var(--etat-terracotta)" : "rgba(11,26,42,.72)", border: `1px solid ${dispositionFilter === disposition ? "var(--etat-terracotta)" : "rgba(11,26,42,.20)"}` }}>{signalDispositionLabels[disposition]} · {count}</button>
            );
          })}
          {channelCounts.filter((c) => c.count > 0).map(({ channel, count }) => (
            <button key={channel} onClick={() => setChannelFilter(channelFilter === channel ? "all" : channel)} className="etat-tag" style={{ background: "transparent", color: channelFilter === channel ? "var(--etat-terracotta)" : "rgba(11,26,42,.72)", border: `1px solid ${channelFilter === channel ? "var(--etat-terracotta)" : "rgba(11,26,42,.20)"}` }}>{channelMeta[channel].label} · {count}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-9 px-6 py-9 lg:flex-nowrap lg:px-[60px]">
        <div className="min-w-0 flex-1">
          {filteredSignals.length === 0 ? (
            <p className="text-sm text-[var(--etat-stone-600)]">Aucun signal ne correspond à ce filtre.</p>
          ) : filteredSignals.map((signal) => {
            const territory = state.territories.find((item) => item.id === signal.territoryId);
            const linkedSituation = signalToSituation.get(signal.id);
            const tag = linkedSituation ? priorityToTag[linkedSituation.priority] : "stable";
            const age = Math.max(0, Math.floor((referenceAtMs - new Date(signal.createdAt).getTime()) / 86_400_000));
            const photo = linkedSituation ? situationImages[linkedSituation.id] : undefined;
            return (
              <button
                key={signal.id}
                onClick={() => linkedSituation && setSituationDrawer(linkedSituation)}
                disabled={!linkedSituation}
                className={`flex w-full items-start gap-5 border-t border-[var(--etat-line)] py-6 text-left first:border-t-0 first:pt-0 ${linkedSituation ? "cursor-pointer" : "cursor-default"}`}
              >
                {/* Photo de situation (mandat P2.DESIGN-1B.1 §8) : contexte
                    de terrain, jamais une preuve — le statut d'évidence
                    affiché reste exclusivement TrustGlyph/signal.trust,
                    jamais dérivé de la présence d'une photo. */}
                {photo && (
                  <div className="relative hidden h-[76px] w-[110px] shrink-0 overflow-hidden sm:block" style={{ border: "1px solid var(--etat-line)" }}>
                    <Image src={photo} alt="" fill sizes="110px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    {linkedSituation ? (
                      <span className="etat-tag-outline px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[.12em]" style={{ color: glyphBorderColor[tag] }}>{priorityLabels[linkedSituation.priority]}</span>
                    ) : (
                      <span className="etat-tag-outline px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-[.12em] text-[var(--etat-stone-400)]">{signalDispositionLabels[signal.disposition]}</span>
                    )}
                    <span className="text-[11.5px] text-[var(--etat-stone-600)]">{territory?.name ?? "Territoire non renseigné"}{territory ? ` · ${territory.region}` : ""}</span>
                    <span className="ml-auto text-[11.5px] text-[var(--etat-stone-400)]" style={{ fontFamily: "var(--etat-font-mono)" }}>{age <= 0 ? "aujourd’hui" : `il y a ${age} j`}</span>
                  </div>
                  <p className="mt-2 text-[16px] font-semibold leading-[1.4] text-[var(--etat-navy)]">{signal.title}</p>
                  {/* Certains signaux dérivés d'une Situation du jeu de
                      démonstration héritent description === title (même
                      cause que dans Arbitrages : la factory `situation()` de
                      demo-state.ts, cf. son commentaire) — l'afficher quand
                      même dupliquerait le titre juste au-dessus. */}
                  {signal.description !== signal.title && (
                    <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.6] text-[var(--etat-stone-600)]">{signal.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-[var(--etat-stone-600)]"><TrustGlyph level={trustGlyphFromLevel(signal.trust)} />{signal.source}</span>
                    <span className="text-[11.5px] text-[var(--etat-stone-600)]">Canal : {channelMeta[signal.channel].label}</span>
                    {linkedSituation && (
                      <>
                        <span className="flex gap-1">{stageProgressDots(linkedSituation.status).map((done, i) => <span key={i} className="h-[3px] w-[22px]" style={{ background: done ? "var(--etat-terracotta)" : "var(--etat-line)" }} />)}</span>
                        <span className="text-[11px] text-[var(--etat-stone-600)]">{pipelineStages.find((s) => s.status === linkedSituation.status)?.label}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
          <div className="border-t border-[var(--etat-line)] pt-5 text-[11.5px] text-[var(--etat-stone-600)]">Les signaux liés à une situation ouvrent son dossier ; les autres restent en lecture tant qu’ils n’ont pas été qualifiés.</div>
        </div>

        <div className="w-full max-w-[320px] flex-none space-y-6">
          <div className="p-6" style={{ background: "var(--etat-navy)" }}>
            <p className="text-[9.5px] font-semibold uppercase tracking-[.14em]" style={{ color: "rgba(247,243,233,.60)", fontFamily: "var(--etat-font-body)" }}>Provenance des signaux</p>
            <div className="mt-4 space-y-3">
              {channelCounts.map(({ channel, count }) => (
                <div key={channel}>
                  <div className="flex justify-between text-[12px]" style={{ color: "rgba(255,253,247,.88)" }}><span>{channelMeta[channel].label}</span><span style={{ fontFamily: "var(--etat-font-mono)" }}>{count}</span></div>
                  <div className="mt-1.5 h-[4px] w-full" style={{ background: "rgba(247,243,233,.14)" }}><div className="h-[4px]" style={{ width: `${totalSignalsCaptes > 0 ? (count / totalSignalsCaptes) * 100 : 0}%`, background: channelStackColor[channel] }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="etat-panel p-6">
            <p className="etat-filter-label">Disposition des signaux</p>
            <div className="mt-3 space-y-2.5">
              {(Object.keys(signalDispositionLabels) as Array<Signal["disposition"]>).map((disposition) => {
                const count = state.signals.filter((item) => item.disposition === disposition).length;
                if (count === 0) return null;
                return (
                  <div key={disposition} className="flex items-center justify-between border-t border-[var(--etat-line)] pt-2.5 text-[12.5px] first:border-t-0 first:pt-0">
                    <span className="text-[var(--etat-navy)]">{signalDispositionLabels[disposition]}</span>
                    <span className="font-semibold text-[var(--etat-navy)]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <Drawer open={!!situationDrawer} onClose={() => setSituationDrawer(null)} eyebrow="Situation" title={situationDrawer?.title ?? ""} size="lg">
        {situationDrawer && <SituationDetail situation={situationDrawer} state={state} onPlanVisit={() => { const territory = state.territories.find((item) => item.id === situationDrawer.territoryId); setSituationDrawer(null); setMissionDrawer({ key: `situation-${situationDrawer.id}`, territoryId: situationDrawer.territoryId, territoryLabel: territory?.name ?? situationDrawer.territoryId, raison: situationDrawer.title, action: situationDrawer.nextStep, glyphStatus: priorityToTag[situationDrawer.priority], suggestedObjective: "verification_vigilance" }); }} />}
      </Drawer>
      <Drawer open={!!missionDrawer} onClose={() => setMissionDrawer(null)} eyebrow="Terrain" title="Planifier la mission">
        {missionDrawer && <MissionForm mission={missionDrawer} onDone={() => setMissionDrawer(null)} />}
      </Drawer>
    </div>
  );
}
