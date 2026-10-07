"use client";

// G2.2 (mandat "Simplification des vues") — réécriture complète. L'ancien
// écran lisait uniquement des séries de gabarit (data/programmes.ts,
// marquées "(gabarit)" dans sa propre UI) et deux graphiques SVG
// entièrement synthétiques (multiplicateurs par territoire/programme,
// aucune donnée réelle sous-jacente hors un seul bloc "Activité réalisée").
// Reconstruit autour du modèle imposé par le mandat :
//   Décidé → Réalisé → Résultat observé → Écart
// une rangée = une Initiative réelle (domain/types.ts), jamais une
// multiplication synthétique. Voir lib/resultats-bridge.ts.
import { getInitiativeResults } from "../../lib/resultats-bridge";
import { getNationalLandingTotals, formatKg } from "../../lib/landing-bridge";
import { useDomainRuntime } from "../../lib/domain-runtime";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

export function Resultats({ state, patch }: { state: AppState; patch: Patch }) {
  const runtime = useDomainRuntime();
  const liveState = runtime.state;

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

  const withObservedResult = allInitiatives.filter((item) => item.observedResults.length > 0).length;
  const nationalActivity = getNationalLandingTotals(liveState);

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Résultats et redevabilité</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0 }}>
            {allInitiatives.length} initiatives suivies, {withObservedResult} avec un résultat observé enregistré
          </h1>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "11px 16px", background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", marginBottom: 18 }}>
        <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(11,26,42,.45)" }}>De l’activité réalisée aux initiatives</span>
        <span style={{ fontSize: 12.5, color: "rgba(11,26,42,.7)" }}>
          {nationalActivity.landingCount} débarquements enregistrés · {formatKg(nationalActivity.totalLandedKg)} au total national à ce jour
        </span>
        <span style={{ flex: 1 }} />
        {territoryFilterName && (
          <button
            type="button"
            onClick={() => patch({ territoryFilterId: null })}
            style={{ border: "1px solid #B6522F", background: "rgba(182,82,47,.08)", color: "#B6522F", cursor: "pointer", borderRadius: 999, padding: "5px 10px 5px 12px", fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            Territoire : {territoryFilterName} <span aria-hidden>✕</span>
          </button>
        )}
      </div>

      {initiatives.length === 0 ? (
        <div style={{ border: "1px solid rgba(11,26,42,.12)", background: "#FFFFFF", padding: "26px 24px", fontSize: 13, lineHeight: 1.6, color: "rgba(11,26,42,.65)" }}>
          Aucune initiative suivie pour {territoryFilterName} aujourd’hui.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {initiatives.map((item) => (
            <div key={item.id} style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
              <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap", marginBottom: 8 }}>
                  <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 21, lineHeight: 1.3, margin: 0, flex: 1, minWidth: 220 }}>{item.title}</h2>
                  <span style={{ flex: "none", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "#0B1A2A", border: "1px solid rgba(11,26,42,.2)", borderRadius: 999, padding: "4px 11px" }}>{item.statusLabel}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.6)", marginBottom: 4 }}>Territoire : {item.territoryLabel}</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>Objectif : {item.objective}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(11,26,42,.1)" }}>
                <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Décidé</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: item.decidedLabel ? "rgba(11,26,42,.85)" : "rgba(11,26,42,.5)" }}>
                    {item.decidedLabel ?? "Aucune décision réelle rattachée à ce jour."}
                  </div>
                </div>
                <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Réalisé</div>
                  <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.85)" }}>{item.statusLabel}</div>
                </div>
                <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#4E7B5A", marginBottom: 8 }}>Résultat observé</div>
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
                <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 8 }}>Écart — observé vs cible</div>
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
          ))}
        </div>
      )}
    </div>
  );
}
