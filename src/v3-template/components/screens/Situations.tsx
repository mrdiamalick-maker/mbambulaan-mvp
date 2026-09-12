"use client";

import { useMemo } from "react";
import { AGING, FUNNEL, SITS, STAGE_LAB } from "../../data/situations";
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
  const list = useMemo(() => SITS.filter((s) =>
    (!state.fSev || s.sev === state.fSev) &&
    (!state.fTrust || s.trust === state.fTrust) &&
    (!state.fStage || (state.fStage === "aqual" ? s.stage === 1 : s.stage >= 3))
  ), [state.fSev, state.fTrust, state.fStage]);

  const openId = state.sitOpen == null ? (list[0]?.id ?? 0) : state.sitOpen;
  const s = SITS.find((x) => x.id === openId) ?? SITS[0];
  const funRead = FUNNEL[state.funHover == null ? 3 : state.funHover];
  const mxAge = Math.max(...AGING.map((a) => a.n));
  const sitTab = state.sitTab || "know";

  const chosen = state.sitChoice != null && state.sitChoice.id === s.id ? { t: s.options[state.sitChoice.i].t } : null;

  const noFilter = !state.fSev && !state.fTrust && !state.fStage;

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Situations et signaux</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0 }}>
            24 situations ouvertes, 7 attendent encore une source secondaire
          </h1>
        </div>
        <div style={{ flex: "none", display: "flex", gap: 24 }}>
          {[{ v: "24", k: "ouvertes", c: "#0B1A2A" }, { v: "3", k: "critiques", c: "#C8452B" }, { v: "7", k: "à qualifier", c: "#B6522F" }, { v: "41", k: "closes avec preuve", c: "#4E7B5A" }].map((st) => (
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
          {FUNNEL.map((f, i) => (
            <div key={f.label} onMouseEnter={() => patch({ funHover: i })} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 150, flex: "none", fontSize: 11.5, color: state.funHover === i ? "#0B1A2A" : "rgba(11,26,42,.7)", fontWeight: state.funHover === i ? 600 : 400 }}>{f.label}</div>
              <div style={{ flex: 1, height: 16, background: "rgba(11,26,42,.06)", position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: f.pct, background: f.c, transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
              </div>
              <div style={{ width: 56, flex: "none", textAlign: "right", fontFamily: V3_FONT_MONO, fontSize: 12 }}>{f.n}</div>
            </div>
          ))}
        </div>
        <div style={{ background: "#FFFFFF", padding: "15px 18px" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", flex: 1 }}>Ancienneté des situations ouvertes</div>
            <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>Une situation qui vieillit sans preuve est un risque</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 74 }}>
            {AGING.map((a, i) => (
              <div key={a.lab} onMouseEnter={() => patch({ ageHover: i })} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }}>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: state.ageHover === i ? "#0B1A2A" : "rgba(11,26,42,.55)", textAlign: "center", marginBottom: 4 }}>{a.n}</div>
                <div style={{ height: (a.n / mxAge) * 52 + 4, background: a.c, transition: "height .5s,background .2s" }} />
                <div style={{ fontSize: 9.5, color: "rgba(11,26,42,.5)", textAlign: "center", marginTop: 5 }}>{a.lab}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
        <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginRight: 4 }}>Filtrer</span>
        <FilterChip label={"Toutes · " + SITS.length} on={noFilter} onClick={() => patch({ fSev: null, fTrust: null, fStage: null })} />
        <FilterChip label="Critique" on={state.fSev === "Critique"} dot dotc="#C8452B" onClick={() => patch({ fSev: state.fSev === "Critique" ? null : "Critique" })} />
        <FilterChip label="Élevé" on={state.fSev === "Élevé"} dot dotc="#D89A4A" onClick={() => patch({ fSev: state.fSev === "Élevé" ? null : "Élevé" })} />
        <FilterChip label="Modéré" on={state.fSev === "Modéré"} dot dotc="#9FB9CE" onClick={() => patch({ fSev: state.fSev === "Modéré" ? null : "Modéré" })} />
        <FilterChip label="Déclarées seulement" on={state.fTrust === "Déclarée"} onClick={() => patch({ fTrust: state.fTrust === "Déclarée" ? null : "Déclarée" })} />
        <FilterChip label="Vérifiées seulement" on={state.fTrust === "Vérifiée"} onClick={() => patch({ fTrust: state.fTrust === "Vérifiée" ? null : "Vérifiée" })} />
        <FilterChip label="À qualifier" on={state.fStage === "aqual"} onClick={() => patch({ fStage: state.fStage === "aqual" ? null : "aqual" })} />
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>
          {list.length} situation{list.length > 1 ? "s" : ""} affichée{list.length > 1 ? "s" : ""} sur {SITS.length}
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
                <span style={{ width: 7, height: 7, borderRadius: 2, background: x.sevc, flex: "none" }} />
                <span style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: x.sevt, fontWeight: 500 }}>{x.sev}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 11, color: x.tc }}>{x.tg}</span>
                <span style={{ fontSize: 10.5, color: "rgba(11,26,42,.5)" }}>{x.trust}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, marginBottom: 7 }}>{x.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 11, color: "rgba(11,26,42,.55)" }}>
                <span>{x.terr}</span>
                <span style={{ width: 1, height: 10, background: "rgba(11,26,42,.18)" }} />
                <span>{x.since}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: V3_FONT_MONO, color: x.stage >= 3 ? "#4E7B5A" : "rgba(11,26,42,.5)" }}>{STAGE_LAB[x.stage]}</span>
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
              <span style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${s.sevc}`, borderRadius: 999, padding: "3px 10px", fontSize: 11, color: "#F7F3E9" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.sevc }} />{s.sev}
              </span>
              <span style={{ fontSize: 11.5, color: "rgba(247,243,233,.6)" }}>{s.terr} · {s.since} · reçu par {s.channel}</span>
            </div>
            <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 27, lineHeight: 1.2, margin: "0 0 12px", maxWidth: "34ch" }}>{s.title}</h2>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(247,243,233,.82)", maxWidth: "78ch" }}>{s.what}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 15, paddingTop: 14, borderTop: "1px solid rgba(247,243,233,.14)", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", flex: "none" }}>Pourquoi cela compte</span>
              <span style={{ fontSize: 12.5, color: "rgba(247,243,233,.85)" }}>{s.conseq}</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(11,26,42,.1)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
            {s.affected.map((a, i) => (
              <div key={i} style={{ background: "#FFFFFF", padding: "13px 15px" }}>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 20, lineHeight: 1 }}>{a.n}</div>
                <div style={{ fontSize: 10.5, color: "rgba(11,26,42,.55)", marginTop: 5, lineHeight: 1.35 }}>{a.k}</div>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 26 }} className="pv3-rise-fast">
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                    <span style={{ width: 18, height: 2, background: "#4E7B5A" }} />
                    <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#4E7B5A" }}>Ce que nous savons</span>
                  </div>
                  {s.known.map((k, i) => (
                    <div key={i} style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(11,26,42,.85)", marginBottom: 10, paddingLeft: 13, borderLeft: "2px solid rgba(78,123,90,.32)" }}>{k}</div>
                  ))}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
                    <span style={{ width: 18, height: 2, background: "#B6522F" }} />
                    <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F" }}>Ce qui reste incertain</span>
                  </div>
                  {s.unknown.map((u, i) => (
                    <div key={i} style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(11,26,42,.85)", marginBottom: 10, paddingLeft: 13, borderLeft: "2px solid rgba(182,82,47,.32)" }}>{u}</div>
                  ))}
                </div>
              </div>
            )}

            {sitTab === "time" && (
              <div className="pv3-rise-fast">
                {s.timeline.map((e, i) => (
                  <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", paddingBottom: 18, position: "relative" }}>
                    <div style={{ width: 96, flex: "none", textAlign: "right", fontFamily: V3_FONT_MONO, fontSize: 11, color: "rgba(11,26,42,.5)", paddingTop: 2 }}>{e.d}</div>
                    <div style={{ flex: "none", display: "flex", flexDirection: "column", alignItems: "center", alignSelf: "stretch" }}>
                      <span style={{ fontSize: 13, color: e.tc, lineHeight: 1 }}>{e.tg}</span>
                      <span style={{ flex: 1, width: 1, background: "rgba(11,26,42,.14)", marginTop: 5 }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, paddingTop: 1 }}>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{e.t}</div>
                      <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginTop: 4 }}>{e.who}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {sitTab === "src" && (
              <div className="pv3-rise-fast">
                {s.sources.map((src, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", border: "1px solid rgba(11,26,42,.1)", padding: "13px 15px", marginBottom: 9 }}>
                    <span style={{ fontSize: 15, color: src.tc, lineHeight: 1, paddingTop: 1 }}>{src.tg}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{src.n}</div>
                      <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginTop: 3 }}>{src.k}</div>
                    </div>
                  </div>
                ))}
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
                    <div style={{ fontSize: 13, lineHeight: 1.55 }}>{s.sysSays}</div>
                  </div>
                  <div style={{ background: "#F7F3E9", padding: "15px 17px" }}>
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 8 }}>Ce que le système suggère</div>
                    <div style={{ fontSize: 13, lineHeight: 1.55 }}>{s.sysSuggests}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 11 }}>
                  Ce que vous décidez — la décision reste humaine et tracée
                </div>
                {s.options.map((o, i) => {
                  const on = state.sitChoice?.id === s.id && state.sitChoice?.i === i;
                  return (
                    <button
                      key={i}
                      onClick={() => patch({ sitChoice: { id: s.id, i } })}
                      className="pv3-border-hover-dark"
                      style={{
                        display: "flex", alignItems: "center", gap: 14, width: "100%", textAlign: "left",
                        border: `1px solid ${on ? "#0B1A2A" : o.reco ? "rgba(78,123,90,.45)" : "rgba(11,26,42,.14)"}`,
                        background: on ? "rgba(182,82,47,.07)" : "transparent", cursor: "pointer", padding: "13px 16px", marginBottom: 8, transition: "all .2s"
                      }}
                    >
                      <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1.5px solid ${on ? "#B6522F" : "rgba(11,26,42,.28)"}`, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: on ? "#B6522F" : "transparent" }} />
                      </span>
                      <span style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{o.t}</span>
                      <span style={{ fontSize: 11.5, color: o.reco ? "#4E7B5A" : "rgba(11,26,42,.5)" }}>{o.k}</span>
                    </button>
                  );
                })}
                {chosen && (
                  <div style={{ marginTop: 14, padding: "15px 17px", background: "#0B1A2A", color: "#F7F3E9" }} className="pv3-rise-fast">
                    <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", marginBottom: 8 }}>Décision préparée — non engagée</div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{chosen.t}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(247,243,233,.65)", marginTop: 9 }}>
                      Sera enregistrée au nom de Mamadou Fall · Coordination nationale, horodatée, avec la liste des informations connues à cet instant. Le résultat effectif sera documenté séparément.
                    </div>
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
