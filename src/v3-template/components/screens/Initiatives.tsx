"use client";

// G2.3 (mandat "Initiatives & continuité du cycle") — remplace l'écran
// "Programme" (Portfolio.tsx/ProgrammeDetail.tsx, dashboard V5 dense,
// gabarit data/programmes.ts) sur l'entrée de navigation primaire
// "Initiatives" (libellé UX, cf. data/roles.ts). Les deux anciens fichiers
// restent dans le dépôt comme source de logique (formule d'avancement
// reprise dans lib/resultats-bridge.ts), jamais comme autorité visuelle —
// cet écran réutilise strictement la DA G2 déjà posée par Opportunités/
// Résultats (mêmes cards, mêmes badges, mêmes espacements).
//
// Répond à « qu'avons-nous décidé de mettre en œuvre et où en sommes-nous
// ? » : une carte par Initiative réelle (domain/types.ts), jamais une
// Initiative fabriquée pour les opportunités encore en instruction (Joal/
// Kayar restent visibles côté Opportunités avec leur statut réel, jamais
// dupliquées ici tant qu'aucune Initiative/Decision canonique n'existe).
import { useEffect, useRef } from "react";
import { getInitiativeResults } from "../../lib/resultats-bridge";
import { useDomainRuntime } from "../../lib/domain-runtime";
import { V3_FONT_SANS, V3_FONT_SERIF, V3_FONT_MONO } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

export function Initiatives({ state, patch }: { state: AppState; patch: Patch }) {
  const runtime = useDomainRuntime();
  const liveState = runtime.state;
  const refs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (state.initiativeFocusId && refs.current[state.initiativeFocusId]) {
      refs.current[state.initiativeFocusId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.initiativeFocusId, liveState]);

  if (!liveState) {
    return (
      <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
        <p style={{ fontSize: 13, color: runtime.error ? "#C8452B" : "rgba(11,26,42,.6)" }}>
          {runtime.error ? `Connexion au domaine réel impossible : ${runtime.error}` : "Connexion au domaine réel Mbàmbulaan…"}
        </p>
      </div>
    );
  }

  const allInitiatives = getInitiativeResults(liveState);
  const territoryFilterName = state.territoryFilterId
    ? liveState.territories.find((t) => t.id === state.territoryFilterId)?.name
    : undefined;
  const initiatives = state.territoryFilterId
    ? allInitiatives.filter((item) => item.territoryIds.includes(state.territoryFilterId!))
    : allInitiatives;

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Initiatives</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0 }}>
            Qu’avons-nous décidé de mettre en œuvre, et où en sommes-nous ?
          </h1>
        </div>
        {territoryFilterName && (
          <button
            type="button"
            onClick={() => patch({ territoryFilterId: null })}
            style={{ flex: "none", border: "1px solid #B6522F", background: "rgba(182,82,47,.08)", color: "#B6522F", cursor: "pointer", borderRadius: 999, padding: "5px 10px 5px 12px", fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Territoire : {territoryFilterName} <span aria-hidden>✕</span>
          </button>
        )}
      </div>

      {initiatives.length === 0 ? (
        <div style={{ border: "1px solid rgba(11,26,42,.12)", background: "#FFFFFF", padding: "26px 24px", fontSize: 13, lineHeight: 1.6, color: "rgba(11,26,42,.65)" }}>
          Aucune initiative pour {territoryFilterName} aujourd’hui.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {initiatives.map((item) => {
            const focused = state.initiativeFocusId === item.id;
            return (
              <div
                key={item.id}
                ref={(el) => { refs.current[item.id] = el; }}
                style={{ background: "#FFFFFF", border: `1px solid ${focused ? "#B6522F" : "rgba(11,26,42,.12)"}`, boxShadow: focused ? "0 0 0 1px #B6522F" : "none" }}
              >
                <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
                    <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 21, lineHeight: 1.3, margin: 0, flex: 1, minWidth: 220 }}>{item.title}</h2>
                    <div style={{ display: "flex", gap: 8, flex: "none" }}>
                      {item.typeLabel && (
                        <span style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(11,26,42,.6)", border: "1px solid rgba(11,26,42,.2)", borderRadius: 999, padding: "4px 11px" }}>{item.typeLabel}</span>
                      )}
                      <span style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#0B1A2A", border: "1px solid rgba(11,26,42,.2)", borderRadius: 999, padding: "4px 11px" }}>{item.statusLabel}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.6)", marginBottom: 4 }}>Territoire : {item.territoryLabel}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>Objectif : {item.objective}</div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(11,26,42,.1)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
                  <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Origine</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.85)", marginBottom: 4 }}>
                      {item.decidedLabel ? `Décision : ${item.decidedLabel}` : "Aucune décision réelle rattachée à ce jour."}
                    </div>
                    {item.originOpportunity && (
                      <button
                        type="button"
                        onClick={() => patch({ screen: "opportunites" as AppState["screen"], oppOpen: item.originOpportunity!.id })}
                        style={{ marginTop: 6, border: "1px solid rgba(182,82,47,.4)", background: "rgba(182,82,47,.06)", color: "#B6522F", cursor: "pointer", borderRadius: 4, padding: "5px 10px", fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500 }}
                      >
                        Opportunité d’origine : {item.originOpportunity.problem.slice(0, 48)}{item.originOpportunity.problem.length > 48 ? "…" : ""} →
                      </button>
                    )}
                  </div>
                  <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Responsable et prochaine étape</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, color: item.responsibleLabel ? "rgba(11,26,42,.85)" : "rgba(11,26,42,.5)", marginBottom: 4 }}>
                      {item.responsibleLabel ?? "Aucun responsable assigné à ce jour."}
                    </div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.85)" }}>→ {item.nextStepLabel}</div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(11,26,42,.1)" }}>
                  <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>
                      Avancement factuel{item.avancementPct != null ? ` · ${item.avancementPct}%` : ""}
                    </div>
                    {item.indicatorGaps.length > 0 ? (
                      item.indicatorGaps.map((g, i) => (
                        <div key={i} style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(11,26,42,.82)", marginBottom: 8 }}>
                          <div>{g.label}</div>
                          <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11.5, color: "rgba(11,26,42,.6)" }}>
                            {g.currentLabel} observé · cible {g.targetLabel} · écart {g.gapLabel}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: "rgba(11,26,42,.5)" }}>Aucun indicateur chiffré à ce stade.</div>
                    )}
                  </div>
                  <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#4E7B5A", marginBottom: 8 }}>Résultat(s) observé(s)</div>
                    {item.observedResults.length > 0 ? (
                      item.observedResults.map((r, i) => (
                        <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.85)", marginBottom: 8 }}>
                          <div style={{ fontWeight: 500 }}>{r.title}</div>
                          <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.6)", marginTop: 3 }}>{r.recordedAtLabel} · {r.trustLabel}</div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12, color: "rgba(11,26,42,.5)" }}>Aucun résultat observé enregistré à ce jour.</div>
                    )}
                  </div>
                </div>

                {item.nextDecision && (
                  <div style={{ padding: "12px 22px", borderTop: "1px solid rgba(11,26,42,.09)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.5)" }}>Décision suivante</span>
                    <span style={{ fontSize: 12.5, color: "rgba(11,26,42,.8)", flex: 1, minWidth: 160 }}>{item.nextDecision.title}</span>
                    <button
                      type="button"
                      onClick={() => patch({ screen: "arbitrages" as AppState["screen"], territoryFilterId: item.nextDecision!.territoryId ?? null })}
                      style={{ flex: "none", border: "1px solid #0B1A2A", background: "transparent", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "6px 12px", fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500 }}
                    >
                      Voir dans Arbitrages →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
