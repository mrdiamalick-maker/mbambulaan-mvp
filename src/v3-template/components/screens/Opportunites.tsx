"use client";

import { useMemo } from "react";
import type { AppState } from "../../state";
import { V3_FONT_SANS } from "../../theme";
import { useDomainRuntime } from "../../lib/domain-runtime";
import { getOpportunities } from "../../lib/opportunity-bridge";

type Patch = (patch: Partial<AppState>) => void;

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
    patch({ screen: "territoires", terrView: "detail", terrSel: territoryId, terrFromAtlas: false, oppOpen: null });
    window.scrollTo(0, 0);
  };

  return (
    <div className="pv3-rise" style={{ fontFamily: V3_FONT_SANS }}>
      <div style={{ padding: "20px clamp(20px,3vw,42px) 12px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(11,26,42,.52)" }}>
          <span>Espace État</span><span aria-hidden="true">›</span><strong style={{ color: "#0B1A2A" }}>Opportunités</strong>
        </div>
        <button type="button" className="pv3-outline-action" onClick={() => patch({ presentOpen: true })}>Présentation</button>
      </div>

      <div style={{ padding: "9px clamp(20px,3vw,42px)", background: "rgba(11,26,42,.04)", borderTop: "1px solid rgba(11,26,42,.08)", borderBottom: "1px solid rgba(11,26,42,.08)", fontSize: 11.5, color: "rgba(11,26,42,.6)", display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4E7B5A" }} />
        Données de démonstration — structure réelle, valeurs illustratives
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(28px,4vw,52px) clamp(20px,3vw,42px) 72px" }}>
        <div style={{ fontSize: 10.5, letterSpacing: ".13em", textTransform: "uppercase", color: "#B6522F", fontWeight: 650, marginBottom: 10 }}>Opportunités</div>
        <h1 style={{ fontWeight: 620, fontSize: "clamp(30px,4vw,48px)", lineHeight: 1.05, letterSpacing: "-.035em", margin: "0 0 14px", maxWidth: 820 }}>Pistes en cours d’instruction, par territoire</h1>
        <p style={{ margin: "0 0 24px", fontSize: 15.5, lineHeight: 1.62, color: "rgba(11,26,42,.72)", maxWidth: "72ch" }}>
          Une opportunité n’est pas un fait : c’est une hypothèse rattachée à un territoire, avec ce qui manque pour la qualifier. Rien n’est chiffré tant que ce n’est pas instruit.
        </p>

        <div style={{ display: "flex", gap: 7, marginBottom: 24, flexWrap: "wrap" }}>
          {FILTERS.map(([key, label]) => {
            const active = state.oppFilter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => patch({ oppFilter: key })}
                aria-pressed={active}
                style={{
                  border: `1px solid ${active ? "#0B1A2A" : "rgba(11,26,42,.2)"}`,
                  background: active ? "#0B1A2A" : "#fff",
                  color: active ? "#F7F3E9" : "#0B1A2A",
                  cursor: "pointer", borderRadius: 0, padding: "8px 15px", fontSize: 12, fontWeight: 600
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div style={{ borderTop: "2px solid #0B1A2A" }}>
          {rows.length === 0 ? (
            <div style={{ padding: "22px 0", fontSize: 13.5, color: "rgba(11,26,42,.6)" }}>Aucune opportunité ne correspond à ce filtre.</div>
          ) : rows.map((opportunity) => (
            <article key={opportunity.id} className="pv3-opportunity-row" style={{ display: "grid", gridTemplateColumns: "140px minmax(260px,1fr) auto", alignItems: "center", gap: 22, padding: "20px 0", borderBottom: "1px solid rgba(11,26,42,.11)" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 650 }}>{opportunity.territoryNames[0]}</div>
                <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)", marginTop: 2 }}>{opportunity.zone}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7, flexWrap: "wrap" }}>
                  <span style={{ border: "1px solid #B6522F", color: "#B6522F", padding: "2px 7px", fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase" }}>Hypothèse</span>
                  <span style={{ fontSize: 11.5, color: "rgba(11,26,42,.58)" }}>
                    Instruction : <strong style={{ color: "#0B1A2A" }}>{opportunity.uiStep}</strong>
                    {opportunity.missingCount > 0 ? ` · ${opportunity.missingCount} informations manquantes` : ""}
                  </span>
                </div>
                <div style={{ fontSize: 15.5, fontWeight: 650, lineHeight: 1.3, marginBottom: 3 }}>{opportunity.problem}</div>
                <div style={{ fontSize: 12, color: "rgba(11,26,42,.54)" }}>{opportunity.subLabel}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <button type="button" onClick={() => patch({ oppOpen: opportunity.id })} className="pv3-outline-action">Fiche compacte</button>
                <button type="button" onClick={() => openTerritory(opportunity.territoryIds[0])} style={{ border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", borderRadius: 0, padding: "8px 14px", fontSize: 12, fontWeight: 600 }}>Voir le territoire</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
