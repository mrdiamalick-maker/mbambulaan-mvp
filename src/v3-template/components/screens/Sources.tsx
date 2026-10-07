"use client";

// G2.2 (mandat "Simplification des vues") — vue de confiance/provenance.
// Les 6 intégrations système (honnêtes, déjà réelles) restent affichées ;
// le filtre territorial (state.territoryFilterId, posé depuis
// Territoires.tsx) ajoute la provenance réelle des signaux de ce
// territoire — jamais de KPI décoratif, jamais une confiance affichée
// sans donnée réelle derrière. Voir lib/sources-bridge.ts.
import { useDomainRuntime } from "../../lib/domain-runtime";
import { getConnectedSources } from "../../lib/sources-bridge";
import { V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

export function Sources({ state, patch }: { state: AppState; patch: Patch }) {
  const runtime = useDomainRuntime();
  const liveState = runtime.state;

  const territoryFilterName = liveState && state.territoryFilterId
    ? liveState.territories.find((t) => t.id === state.territoryFilterId)?.name
    : undefined;
  const rows = liveState ? getConnectedSources(liveState, state.territoryFilterId) : [];

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
        <div style={{ maxWidth: "74ch", flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Sources connectées</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: "0 0 12px" }}>
            Deux sources alimentent réellement Mbàmbulaan aujourd’hui
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.65, color: "rgba(11,26,42,.72)" }}>
            Mbàmbulaan est conçu pour devenir une couche de supervision au-dessus des systèmes existants du ministère. Cette page distingue ce qui est effectivement connecté de ce qui ne l’est pas — parce qu’une donnée absente change la lecture de toutes les autres.
          </p>
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

      {!liveState ? (
        <p style={{ fontSize: 13, color: runtime.error ? "#C8452B" : "rgba(11,26,42,.6)" }}>
          {runtime.error ? `Connexion au domaine réel impossible : ${runtime.error}` : "Connexion au domaine réel Mbàmbulaan…"}
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)" }}>
          {rows.map((s) => (
            <div key={s.key} style={{ background: "#FFFFFF", padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.connectionStatusColor, flex: "none" }} />
                <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: s.connectionStatusColor, fontWeight: 500 }}>{s.connectionStatusLabel}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)" }}>Couverture : {s.coverageLabel}</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.7)", flex: 1 }}>{s.dataTypeLabel}</div>
              {(s.freshnessLabel || s.confidenceLabel) && (
                <div style={{ display: "flex", gap: 14, paddingTop: 10, borderTop: "1px solid rgba(11,26,42,.09)", fontSize: 11.5, color: "rgba(11,26,42,.6)" }}>
                  {s.freshnessLabel && <span>Fraîcheur : {s.freshnessLabel}</span>}
                  {s.confidenceLabel && <span>Confiance : {s.confidenceLabel}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 22, padding: "19px 22px", background: "#0B1A2A", color: "#F7F3E9", display: "flex", gap: 26, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "none", width: 180, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", paddingTop: 3 }}>Principe</div>
        <div style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: "rgba(247,243,233,.86)", maxWidth: "82ch" }}>
          Une intégration n’est jamais présentée comme acquise avant de l’être. Chaque chiffre du produit porte la trace de son origine, et chaque absence de source est affichée avec la même visibilité qu’une donnée disponible. C’est ce qui permet à un ministre de savoir non seulement ce que le système dit, mais ce qu’il ne peut pas encore dire.
        </div>
      </div>
    </div>
  );
}
