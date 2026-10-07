"use client";

import { useMemo } from "react";
import type { AppState } from "../../state";
import { V3_FONT_SERIF, V3_FONT_SANS } from "../../theme";
import { useDomainRuntime } from "../../lib/domain-runtime";
import { getOpportunities } from "../../lib/opportunity-bridge";

type Patch = (p: Partial<AppState>) => void;

const FILTERS: Array<[AppState["oppFilter"], string]> = [
  ["all", "Toutes"],
  ["rep", "Repérées"],
  ["ins", "En instruction"]
];

export function Opportunites({ state, patch }: { state: AppState; patch: Patch }) {
  const runtime = useDomainRuntime();
  const all = useMemo(() => getOpportunities(runtime.state ?? undefined), [runtime.state]);
  const rows = all.filter((item) => (state.oppFilter === "all" ? true : state.oppFilter === "rep" ? item.uiStepIndex === 0 : item.uiStepIndex >= 1));

  const openTerritory = (territoryId: string) => {
    patch({ screen: "territoires" as AppState["screen"], terrView: "detail", terrSel: territoryId, oppOpen: null });
    window.scrollTo(0, 0);
  };

  return (
    <div className="pv3-rise">
      <div style={{ padding: "22px 30px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(11,26,42,.55)" }}>
          <span>Espace État</span>
          <span style={{ color: "rgba(11,26,42,.3)" }}>›</span>
          <span style={{ color: "#0B1A2A", fontWeight: 600 }}>Opportunités</span>
        </div>
      </div>

      <div
        style={{
          margin: "9px 0 0", padding: "9px 30px", background: "rgba(11,26,42,.04)",
          borderTop: "1px solid rgba(11,26,42,.08)", borderBottom: "1px solid rgba(11,26,42,.08)", fontSize: 11.5, color: "rgba(11,26,42,.6)", display: "flex", alignItems: "center", gap: 7
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4E7B5A" }} />
        Données de démonstration — structure réelle, valeurs illustratives
      </div>

      <div style={{ padding: "26px 30px 60px" }}>
        <div style={{ fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: "#B6522F", marginBottom: 8 }}>Opportunités</div>
        <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 34, margin: "0 0 12px" }}>Pistes en cours d’instruction, par territoire</h1>
        <p style={{ margin: "0 0 20px", fontFamily: V3_FONT_SERIF, fontSize: 16, lineHeight: 1.55, color: "rgba(11,26,42,.78)", maxWidth: "68ch" }}>
          Une opportunité n’est pas un fait : c’est une hypothèse rattachée à un territoire, avec ce qui manque pour la qualifier. Rien n’est chiffré tant que ce n’est pas instruit.
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {FILTERS.map(([key, label]) => {
            const active = state.oppFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => patch({ oppFilter: key })}
                style={{
                  border: `1px solid ${active ? "#0B1A2A" : "rgba(11,26,42,.2)"}`, background: active ? "#0B1A2A" : "#fff", color: active ? "#F7F3E9" : "#0B1A2A",
                  cursor: "pointer", borderRadius: 4, padding: "8px 16px", fontSize: 12.5, fontFamily: V3_FONT_SANS, fontWeight: 500
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ borderTop: "2px solid #0B1A2A" }}>
          {rows.length === 0 ? (
            <div style={{ padding: "20px 0", fontSize: 13.5, color: "rgba(11,26,42,.6)" }}>Aucune opportunité ne correspond à ce filtre.</div>
          ) : (
            rows.map((o) => (
              <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 0", borderBottom: "1px solid rgba(11,26,42,.1)", flexWrap: "wrap" }}>
                <div style={{ flex: "none", width: 150 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{o.territoryNames[0]}</div>
                  <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)" }}>{o.zone}</div>
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span style={{ border: "1px solid #B6522F", color: "#B6522F", borderRadius: 3, padding: "2px 8px", fontSize: 10, fontWeight: 600 }}>Hypothèse</span>
                    <span style={{ fontSize: 11.5, color: "rgba(11,26,42,.6)" }}>
                      Instruction : <strong style={{ color: "#0B1A2A" }}>{o.uiStep}</strong>
                      {o.missingCount > 0 ? ` · ${o.missingCount} informations manquantes` : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 2 }}>{o.problem}</div>
                  <div style={{ fontSize: 12, color: "rgba(11,26,42,.55)" }}>{o.subLabel}</div>
                </div>
                <div style={{ display: "flex", gap: 10, flex: "none" }}>
                  <button
                    type="button"
                    onClick={() => patch({ oppOpen: o.id })}
                    style={{ border: "1px solid rgba(11,26,42,.25)", background: "#fff", color: "#0B1A2A", cursor: "pointer", borderRadius: 4, padding: "9px 16px", fontSize: 12.5, fontWeight: 500 }}
                  >
                    Fiche compacte
                  </button>
                  <button
                    type="button"
                    onClick={() => openTerritory(o.territoryIds[0])}
                    style={{ border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", borderRadius: 4, padding: "9px 16px", fontSize: 12.5, fontWeight: 500 }}
                  >
                    Voir le territoire
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
