"use client";

import { ARB } from "../../data/arbitrages";
import { V3_FONT_MONO, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

export function Arbitrages({ state, patch }: { state: AppState; patch: Patch }) {
  const sel = state.arbSel ?? 0;
  const a = ARB[sel];
  const openIdx = state.arbOpt != null && state.arbOpt.id === sel ? state.arbOpt.i : null;
  const chosen = openIdx != null ? a.options[openIdx] : null;

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Arbitrages</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0, maxWidth: "32ch" }}>
            Trois décisions attendues, chacune avec ce qui reste inconnu au moment de décider
          </h1>
        </div>
        <div style={{ flex: "none", maxWidth: 290, fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.65)", borderLeft: "2px solid #B6522F", paddingLeft: 14 }}>
          Une décision n’efface pas l’incertitude. Mbàmbulaan l’enregistre avec elle, pour que la relecture soit honnête.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "334px 1fr", gap: 0, border: "1px solid rgba(11,26,42,.12)", alignItems: "start" }}>
        <div style={{ background: "#FFFFFF", borderRight: "1px solid rgba(11,26,42,.12)", alignSelf: "stretch" }}>
          {ARB.map((x, i) => (
            <button
              key={i}
              onClick={() => patch({ arbSel: i, arbOpt: null })}
              style={{
                display: "block", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)",
                background: sel === i ? "rgba(182,82,47,.07)" : "transparent", cursor: "pointer", padding: "15px 17px",
                boxShadow: sel === i ? "inset 3px 0 0 #B6522F" : "none", transition: "background .2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
                <span style={{ fontFamily: V3_FONT_MONO, fontSize: 14, color: x.dueC }}>{x.due}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: x.dueC }}>{x.urgency}</span>
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}>{x.title}</div>
              <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 7 }}>{x.meta}</div>
            </button>
          ))}
          <div style={{ padding: "16px 17px", fontSize: 11.5, lineHeight: 1.55, color: "rgba(11,26,42,.55)", background: "rgba(11,26,42,.03)" }}>
            Les arbitrages déjà rendus restent consultables avec l’état de connaissance du jour de la décision.
          </div>
        </div>

        <div style={{ background: "#FFFFFF", alignSelf: "stretch" }}>
          <div style={{ padding: "20px 24px 18px", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
            <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 26, lineHeight: 1.2, margin: "0 0 11px", maxWidth: "36ch" }}>{a.title}</h2>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(11,26,42,.78)", maxWidth: "80ch" }}>{a.context}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "rgba(11,26,42,.1)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
            <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#4E7B5A", marginBottom: 10 }}>Ce qui est établi</div>
              {a.known.map((k, i) => (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.82)", marginBottom: 9, paddingLeft: 11, borderLeft: "2px solid rgba(78,123,90,.32)" }}>{k}</div>
              ))}
            </div>
            <div style={{ background: "#FFFFFF", padding: "16px 20px" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 10 }}>Ce qui reste inconnu</div>
              {a.unknown.map((u, i) => (
                <div key={i} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.82)", marginBottom: 9, paddingLeft: 11, borderLeft: "2px solid rgba(182,82,47,.32)" }}>{u}</div>
              ))}
            </div>
            <div style={{ background: "#F7F3E9", padding: "16px 20px" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 10 }}>Si rien n’est décidé</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(11,26,42,.82)" }}>{a.inaction}</div>
            </div>
          </div>

          <div style={{ padding: "20px 24px 26px" }}>
            <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 13 }}>
              Options — sélectionnez pour comparer les conséquences
            </div>
            {a.options.map((o, i) => {
              const open = openIdx === i;
              return (
                <button
                  key={i}
                  onClick={() => patch({ arbOpt: { id: sel, i } })}
                  className="pv3-border-hover-dark"
                  style={{
                    display: "block", width: "100%", textAlign: "left", border: `1px solid ${open ? "#0B1A2A" : "rgba(11,26,42,.14)"}`,
                    background: open ? "rgba(182,82,47,.05)" : "transparent", cursor: "pointer", padding: "14px 17px", marginBottom: 9, transition: "all .2s"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <span style={{ width: 15, height: 15, borderRadius: "50%", border: `1.5px solid ${open ? "#B6522F" : "rgba(11,26,42,.28)"}`, flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: open ? "#B6522F" : "transparent" }} />
                    </span>
                    <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{o.t}</span>
                    <span style={{ fontFamily: V3_FONT_MONO, fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>{o.cost}</span>
                  </div>
                  {open && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(11,26,42,.1)" }} className="pv3-rise-fast">
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#4E7B5A", marginBottom: 7 }}>Ce que cela résout</div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.8)" }}>{o.pro}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "#B6522F", marginBottom: 7 }}>Ce que cela laisse ouvert</div>
                        <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.8)" }}>{o.con}</div>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
            {chosen && (
              <div style={{ marginTop: 16, padding: "17px 20px", background: "#0B1A2A", color: "#F7F3E9" }} className="pv3-rise-fast">
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", marginBottom: 9 }}>Ce qui sera enregistré</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>{chosen.t}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, paddingTop: 13, borderTop: "1px solid rgba(247,243,233,.14)", fontSize: 12, lineHeight: 1.55, color: "rgba(247,243,233,.72)" }}>
                  <div>Décideur, horodatage, et l’état exact de la connaissance à cet instant — y compris ce qui restait inconnu.</div>
                  <div>Le résultat effectif sera documenté séparément, sans réécriture rétrospective de la décision.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
