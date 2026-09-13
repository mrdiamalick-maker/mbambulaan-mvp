"use client";

// PD.4 — Situations connectées au domaine réel. Seul point où cet écran
// touche le domaine réel Mbàmbulaan ; voir l'en-tête de
// lib/situations-bridge.ts. Structure visuelle du gabarit gelé préservée
// à l'identique (bandeau de synthèse, entonnoir, ancienneté, filtres,
// liste + détail deux colonnes, 4 tuiles, 4 onglets) — seul le contenu
// devient réel, plus un bloc "Contexte maritime" ajouté dans l'onglet
// Synthèse (mandat PD.4 §9, capacité nouvelle), visible uniquement
// lorsqu'un lien réel et traçable existe.
import { useMemo } from "react";
import {
  SITUATION_ROWS,
  buildSituationHeaderStats,
  describeDecisionEffect,
  getSituationDetail,
  getSituationsAgingView,
  getSituationsFunnelView
} from "../../lib/situations-bridge";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

function FilterChip({ label, on, dot, dotc, onClick }: { label: string; on: boolean; dot?: boolean; dotc?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${on ? "#0B1A2A" : "rgba(11,26,42,.18)"}`, background: on ? "#0B1A2A" : "transparent",
        color: on ? "#F7F3E9" : "rgba(11,26,42,.7)", cursor: "pointer", borderRadius: 999, padding: "5px 12px",
        fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500, display: "flex", alignItems: "center", gap: 7, transition: "all .2s"
      }}
    >
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotc }} />}
      {label}
    </button>
  );
}

export function Situations({ state, patch }: { state: AppState; patch: Patch }) {
  const list = useMemo(
    () =>
      SITUATION_ROWS.filter(
        (s) =>
          (!state.fSev || s.severityLabel === state.fSev) &&
          (!state.fTrust || (state.fTrust === "Déclarée" ? s.trustTier === 0 : s.trustTier === 2)) &&
          (!state.fStage || s.stageBucket === 1)
      ),
    [state.fSev, state.fTrust, state.fStage]
  );

  const openId = state.sitOpen == null ? (list[0]?.id ?? SITUATION_ROWS[0]?.id ?? 0) : state.sitOpen;
  const s = getSituationDetail(openId) ?? getSituationDetail(SITUATION_ROWS[0]?.id ?? 0);
  const funnel = getSituationsFunnelView();
  const aging = getSituationsAgingView();
  const funRead = funnel[state.funHover == null ? 3 : state.funHover];
  const mxAge = Math.max(1, ...aging.map((a) => a.count));
  const sitTab = state.sitTab || "know";
  const header = buildSituationHeaderStats();

  const chosenOption = s && state.sitChoice != null && state.sitChoice.id === s.id ? s.options[state.sitChoice.i] : null;
  const noFilter = !state.fSev && !state.fTrust && !state.fStage;

  if (!s) {
    return (
      <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
        <p style={{ fontSize: 13, color: "rgba(11,26,42,.6)" }}>Aucune situation réelle disponible dans le Demo World.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Situations et signaux</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0 }}>
            {header.openCount} situations ouvertes, {header.toQualifyCount} attendent encore une qualification
          </h1>
        </div>
        <div style={{ flex: "none", display: "flex", gap: 24 }}>
          {[
            { v: header.openCount, k: "ouvertes", c: "#0B1A2A" },
            { v: header.criticalCount, k: "critiques", c: "#C8452B" },
            { v: header.toQualifyCount, k: "à qualifier", c: "#B6522F" },
            { v: header.closedWithProofCount, k: "closes avec preuve", c: "#4E7B5A" }
          ].map((st) => (
            <div key={st.k} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 24, lineHeight: 1, color: st.c }}>{st.v}</div>
              <div style={{ fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginTop: 5 }}>{st.k}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)", marginBottom: 18 }}>
        <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", flex: 1 }}>De l’information reçue à la preuve</div>
            <div style={{ fontSize: 11.5, color: "#B6522F" }}>{funRead.read}</div>
          </div>
          {funnel.map((f, i) => (
            <div key={f.label} onMouseEnter={() => patch({ funHover: i })} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 150, flex: "none", fontSize: 11.5, color: state.funHover === i ? "#0B1A2A" : "rgba(11,26,42,.7)", fontWeight: state.funHover === i ? 600 : 400 }}>{f.label}</div>
              <div style={{ flex: 1, height: 16, background: "rgba(11,26,42,.06)", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: f.pctLabel, background: ["#0B1A2A", "#B6522F", "#DE9C74", "#7FB08A"][i], transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
              </div>
              <div style={{ width: 56, flex: "none", textAlign: "right", fontFamily: V3_FONT_MONO, fontSize: 12 }}>{f.count}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", flex: 1 }}>Ancienneté des situations ouvertes</div>
            <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>Une situation qui vieillit sans preuve est un risque</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 74 }}>
            {aging.map((a, i) => (
              <div key={a.label} onMouseEnter={() => patch({ ageHover: i })} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: state.ageHover === i ? "#0B1A2A" : "rgba(11,26,42,.55)", textAlign: "center", marginBottom: 4 }}>{a.count}</div>
                <div style={{ height: (a.count / mxAge) * 52 + 4, background: ["#9FB9CE", "#DE9C74", "#D89A4A", "#C8452B", "#8E2F1A"][i], transition: "height .5s,background .2s" }} />
                <div style={{ fontSize: 9.5, color: "rgba(11,26,42,.5)", textAlign: "center", marginTop: 5 }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
        <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginRight: 4 }}>Filtrer</span>
        <FilterChip label={"Toutes · " + SITUATION_ROWS.length} on={noFilter} onClick={() => patch({ fSev: null, fTrust: null, fStage: null })} />
        <FilterChip label="Critique" on={state.fSev === "Critique"} dot dotc="#C8452B" onClick={() => patch({ fSev: state.fSev === "Critique" ? null : "Critique" })} />
        <FilterChip label="Élevé" on={state.fSev === "Élevé"} dot dotc="#D89A4A" onClick={() => patch({ fSev: state.fSev === "Élevé" ? null : "Élevé" })} />
        <FilterChip label="Modéré" on={state.fSev === "Modéré"} dot dotc="#9FB9CE" onClick={() => patch({ fSev: state.fSev === "Modéré" ? null : "Modéré" })} />
        <FilterChip label="Déclarées seulement" on={state.fTrust === "Déclarée"} onClick={() => patch({ fTrust: state.fTrust === "Déclarée" ? null : "Déclarée" })} />
        <FilterChip label="Vérifiées seulement" on={state.fTrust === "Vérifiée"} onClick={() => patch({ fTrust: state.fTrust === "Vérifiée" ? null : "Vérifiée" })} />
        <FilterChip label="À qualifier" on={state.fStage === "aqual"} onClick={() => patch({ fStage: state.fStage === "aqual" ? null : "aqual" })} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>
          {list.length} situation{list.length > 1 ? "s" : ""} affichée{list.length > 1 ? "s" : ""} sur {SITUATION_ROWS.length}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "392px 1fr", gap: 0, border: "1px solid rgba(11,26,42,.12)", alignItems: "start" }}>
        <div style={{ background: "#FFFFFF", borderRight: "1px solid rgba(11,26,42,.12)", alignSelf: "stretch" }}>
          {list.map((x) => (
            <button
              key={x.id}
              onClick={() => patch({ sitOpen: x.id })}
              style={{
                display: "block", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)",
                background: x.id === s.id ? "rgba(182,82,47,.07)" : "transparent", cursor: "pointer", padding: "13px 15px",
                boxShadow: x.id === s.id ? "inset 3px 0 0 #B6522F" : "none", transition: "background .2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <span style={{ width: 7, height: 7, borderRadius: 2, background: x.severityColor, flex: "none" }} />
                <span style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: x.severityTextColor, fontWeight: 500 }}>{x.severityLabel}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: "rgba(11,26,42,.6)" }}>{x.trustGlyph}</span>
                <span style={{ fontSize: 10.5, color: "rgba(11,26,42,.5)" }}>{x.trustLabel}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 7 }}>{x.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 11, color: "rgba(11,26,42,.55)" }}>
                <span>{x.territoryLabel}</span>
                <span style={{ width: 1, height: 10, background: "rgba(11,26,42,.18)" }} />
                <span>{x.since}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: V3_FONT_MONO, color: x.stageBucket >= 4 ? "#4E7B5A" : "rgba(11,26,42,.5)" }}>{x.stageLabel}</span>
              </div>
            </button>
          ))}
          {list.length === 0 && (
            <div style={{ padding: "30px 18px", fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.6)" }}>
              Aucune situation ne correspond à ces filtres. Retirez un critère pour élargir la sélection.
            </div>
          )}
        </div>

        <div style={{ background: "#FFFFFF", alignSelf: "stretch" }}>
          <div style={{ background: "#0B1A2A", color: "#F7F3E9", padding: "20px 24px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${s.severityColor}`, borderRadius: 999, padding: "3px 10px", fontSize: 11, color: "#F7F3E9" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.severityColor }} />{s.severityLabel}
              </span>
              <span style={{ fontSize: 11.5, color: "rgba(247,243,233,.6)" }}>{s.territoryLabel} · {s.since}{s.channelLabel ? ` · reçu via ${s.channelLabel}` : ""}</span>
            </div>
            <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 27, lineHeight: 1.2, margin: "0 0 12px", maxWidth: "34ch" }}>{s.title}</h2>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(247,243,233,.82)", maxWidth: "78ch" }}>{s.description}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 15, paddingTop: 14, borderTop: "1px solid rgba(247,243,233,.14)", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", flex: "none" }}>Prochaine étape</span>
              <span style={{ fontSize: 12.5, color: "rgba(247,243,233,.85)" }}>{s.nextStep}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(11,26,42,.1)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
            {s.metrics.map((a, i) => (
              <div key={i} style={{ background: "#FFFFFF", padding: "13px 15px" }}>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 20, lineHeight: 1 }}>{a.value}</div>
                <div style={{ fontSize: 10.5, color: "rgba(11,26,42,.55)", marginTop: 5, lineHeight: 1.35 }}>{a.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(11,26,42,.12)", padding: "0 14px", flexWrap: "wrap" }}>
            {[["know", "Synthèse"], ["time", "Chronologie"], ["src", "Sources"], ["act", "Action"]].map(([k, label]) => (
              <button
                key={k}
                onClick={() => patch({ sitTab: k })}
                style={{
                  border: 0, background: "transparent", cursor: "pointer", padding: "12px 13px 10px", fontSize: 12.5,
                  fontFamily: V3_FONT_SANS, fontWeight: sitTab === k ? 600 : 400, color: sitTab === k ? "#0B1A2A" : "rgba(11,26,42,.55)",
                  boxShadow: sitTab === k ? "inset 0 -2px 0 #B6522F" : "none", transition: "all .2s"
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ padding: "20px 24px 26px" }}>
            {sitTab === "know" && (
              <div className="pv3-rise-fast">
                {/* PD.4 §9 — Contexte maritime : uniquement si le Finding qui
                    explique cette situation cite explicitement un objet
                    maritime (Vessel/FishingTrip/Landing/Infrastructure/
                    Capacity/Site) — jamais déduit du seul territoire (§10). */}
                {s.maritimeContext.length > 0 && (
                  <div style={{ marginBottom: 22, padding: "14px 16px", background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Contexte maritime</div>
                    {s.maritimeContext.map((item, i) => (
                      <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 6 }}>
                        <span style={{ fontWeight: 500 }}>{item.label}</span>
                        {item.detail ? <span style={{ color: "rgba(11,26,42,.6)" }}> — {item.detail}</span> : null}
                      </div>
                    ))}
                    <div style={{ fontSize: 10.5, color: "rgba(11,26,42,.5)", marginTop: 8 }}>Élément de contexte documenté — pas nécessairement une cause.</div>
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                      <span style={{ width: 18, height: 2, background: "#4E7B5A" }} />
                      <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#4E7B5A" }}>Ce que nous savons</span>
                    </div>
                    {s.known.map((k, i) => (
                      <div key={i} style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(11,26,42,.85)", marginBottom: 10, paddingLeft: 13, borderLeft: "2px solid rgba(78,123,90,.32)" }}>
                        <span style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "rgba(11,26,42,.45)", marginBottom: 2 }}>{k.label}</span>
                        {k.detail}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                      <span style={{ width: 18, height: 2, background: "#B6522F" }} />
                      <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F" }}>Ce qui reste incertain</span>
                    </div>
                    {s.unknown.length > 0 ? (
                      s.unknown.map((u, i) => (
                        <div key={i} style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(11,26,42,.85)", marginBottom: 10, paddingLeft: 13, borderLeft: "2px solid rgba(182,82,47,.32)" }}>
                          <span style={{ display: "block", fontSize: 10, textTransform: "uppercase", letterSpacing: ".06em", color: "rgba(11,26,42,.45)", marginBottom: 2 }}>{u.label}</span>
                          {u.detail}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.5)" }}>Aucune incertitude documentée à ce stade.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {sitTab === "time" && (
              <div className="pv3-rise-fast">
                {s.timeline.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingBottom: 18, position: "relative" }}>
                    <div style={{ width: 120, flex: "none", textAlign: "right", fontFamily: V3_FONT_MONO, fontSize: 11, color: "rgba(11,26,42,.5)", paddingTop: 2 }}>{e.dateLabel}</div>
                    <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
                      <span style={{ fontSize: 13, color: "rgba(11,26,42,.5)", lineHeight: 1 }}>●</span>
                      <span style={{ flex: 1, width: 1, background: "rgba(11,26,42,.14)", marginTop: 5 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{e.label}</div>
                      <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.6)", marginTop: 3 }}>{e.detail}</div>
                      <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginTop: 4 }}>{e.who}</div>
                    </div>
                  </div>
                ))}
                {s.timeline.length === 0 && <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.5)" }}>Aucun événement horodaté pour ce dossier.</div>}
              </div>
            )}

            {sitTab === "src" && (
              <div className="pv3-rise-fast">
                {s.sources.map((src, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", border: "1px solid rgba(11,26,42,.1)", padding: "13px 15px", marginBottom: 9 }}>
                    <span style={{ fontSize: 15, color: "rgba(11,26,42,.55)", lineHeight: 1, paddingTop: 1 }}>{src.glyph}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{src.label}</div>
                      {src.detail && <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginTop: 3 }}>{src.detail}</div>}
                      <div style={{ fontSize: 10.5, color: "rgba(11,26,42,.45)", marginTop: 4, textTransform: "uppercase", letterSpacing: ".06em" }}>{src.kind} · {src.trustLabel}</div>
                    </div>
                  </div>
                ))}
                {s.sources.length === 0 && <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.5)" }}>Aucune source rattachée à ce dossier.</div>}
                {s.convergenceNote && (
                  <div style={{ marginTop: 9, padding: "13px 15px", background: "rgba(182,82,47,.06)", border: "1px solid rgba(182,82,47,.2)", fontSize: 12, lineHeight: 1.55, color: "rgba(11,26,42,.8)" }}>
                    {s.convergenceNote}
                  </div>
                )}
                <div style={{ marginTop: 14, padding: "13px 15px", background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)", fontSize: 12, lineHeight: 1.55, color: "rgba(11,26,42,.7)" }}>
                  Une situation ne change de niveau de connaissance que lorsqu’une source secondaire la confirme. Mbàmbulaan n’élève jamais une déclaration au rang de fait vérifié sans trace.
                </div>
              </div>
            )}

            {sitTab === "act" && (
              <div className="pv3-rise-fast">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(11,26,42,.1)", border: "1px solid rgba(11,26,42,.1)", marginBottom: 20 }}>
                  <div style={{ background: "#F7F3E9", padding: "15px 17px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 8 }}>Ce que le système constate</div>
                    <div style={{ fontSize: 13, lineHeight: 1.55 }}>{s.systemNote ?? "Aucune recommandation disponible — territoire non résolu."}</div>
                  </div>
                  <div style={{ background: "#F7F3E9", padding: "15px 17px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 8 }}>Ce que le système suggère</div>
                    <div style={{ fontSize: 13, lineHeight: 1.55 }}>{s.systemSuggestion ?? "Aucune suggestion disponible à ce stade."}</div>
                    {s.systemRisks.length > 0 && (
                      <div style={{ fontSize: 11.5, color: "#B6522F", marginTop: 8 }}>{s.systemRisks.join(" · ")}</div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 11 }}>
                  Ce que vous décidez — la décision reste humaine et tracée
                </div>
                {s.options.map((o, i) => {
                  const on = state.sitChoice?.id === s.id && state.sitChoice?.i === i;
                  return (
                    <button
                      key={o.decisionType}
                      onClick={() => patch({ sitChoice: { id: s.id, i } })}
                      className="pv3-border-hover-dark"
                      style={{
                        display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
                        border: `1px solid ${on ? "#0B1A2A" : o.suggested ? "rgba(78,123,90,.45)" : "rgba(11,26,42,.14)"}`,
                        background: on ? "rgba(182,82,47,.07)" : "transparent", cursor: "pointer", padding: "13px 16px", marginBottom: 8, transition: "all .2s"
                      }}
                    >
                      <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1.5px solid ${on ? "#B6522F" : "rgba(11,26,42,.28)"}`, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: on ? "#B6522F" : "transparent" }} />
                      </span>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{o.label}</span>
                      <span style={{ fontSize: 11.5, color: o.suggested ? "#4E7B5A" : "rgba(11,26,42,.5)" }}>
                        {o.suggested ? "Suggéré par le moteur de coordination" : ""}
                      </span>
                    </button>
                  );
                })}
                {chosenOption && (
                  <div style={{ marginTop: 14, padding: "15px 17px", background: "#0B1A2A", color: "#F7F3E9" }} className="pv3-rise-fast">
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", marginBottom: 8 }}>Aperçu — non enregistré</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{chosenOption.label}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(247,243,233,.65)", marginTop: 9 }}>{describeDecisionEffect(chosenOption)}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
