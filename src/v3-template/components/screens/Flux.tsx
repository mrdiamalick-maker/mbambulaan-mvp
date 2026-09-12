"use client";

import { FLUX, STAGE_DEFS } from "../../data/flux";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

export function Flux({ state, patch }: { state: AppState; patch: Patch }) {
  const stage = state.dossStage || "review";
  const openId = state.dossOpen ?? 0;
  const f = FLUX.find((x) => x.id === openId) ?? FLUX[0];
  const chosenAction = state.dossChoice != null && state.dossChoice.id === f.id ? f.actions[state.dossChoice.i] : null;

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Flux entrant</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0, maxWidth: "34ch" }}>
            L’information reçue n’est pas encore de la connaissance
          </h1>
          <p style={{ margin: "11px 0 0", fontSize: 13.5, lineHeight: 1.6, color: "rgba(11,26,42,.7)", maxWidth: "74ch" }}>
            Tout ce qui arrive dans Mbàmbulaan passe ici avant d’exister ailleurs. Rien n’apparaît dans un tableau de bord, une situation ou un résultat sans avoir été qualifié — ou explicitement écarté, avec un motif.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, border: "1px solid rgba(11,26,42,.12)", background: "#FFFFFF", marginBottom: 20, flexWrap: "wrap" }}>
        {STAGE_DEFS.map((st) => (
          <button
            key={st.k}
            onClick={() => patch({ dossStage: st.k })}
            style={{
              flex: 1, minWidth: 160, border: 0, borderRight: "1px solid rgba(11,26,42,.1)",
              background: stage === st.k ? "rgba(182,82,47,.06)" : "transparent", cursor: "pointer",
              padding: "15px 18px", textAlign: "left", transition: "background .2s"
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 26, lineHeight: 1, color: st.c }}>{st.n}</div>
              <div style={{ fontSize: 12.5, fontWeight: stage === st.k ? 600 : 400, color: stage === st.k ? "#0B1A2A" : "rgba(11,26,42,.6)" }}>{st.label}</div>
            </div>
            <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 8, lineHeight: 1.4 }}>{st.def}</div>
            <div style={{ height: 3, background: stage === st.k ? "#B6522F" : "rgba(11,26,42,.1)", marginTop: 11, transition: "background .2s" }} />
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 0, border: "1px solid rgba(11,26,42,.12)", alignItems: "start" }}>
        <div style={{ background: "#FFFFFF", borderRight: "1px solid rgba(11,26,42,.12)", alignSelf: "stretch" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", borderBottom: "1px solid rgba(11,26,42,.09)", background: "rgba(11,26,42,.03)" }}>
            <span style={{ fontSize: 11.5, color: "rgba(11,26,42,.6)", flex: 1 }}>{FLUX.length} éléments à qualifier · 2 recoupements détectés</span>
            <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.42)" }}>Plus ancien en premier</span>
          </div>
          {FLUX.map((x) => (
            <button
              key={x.id}
              onClick={() => patch({ dossOpen: x.id })}
              style={{
                display: "block", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)",
                background: x.id === f.id ? "rgba(182,82,47,.07)" : "transparent", cursor: "pointer", padding: "13px 16px",
                boxShadow: x.id === f.id ? "inset 3px 0 0 #B6522F" : "none", transition: "background .2s"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                <span style={{ fontSize: 10.5, letterSpacing: ".06em", textTransform: "uppercase", color: x.chanC }}>{x.channel}</span>
                <span style={{ flex: 1 }} />
                <span style={{ fontFamily: V3_FONT_MONO, fontSize: 10.5, color: x.ageC }}>{x.age}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{x.title}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 7, fontSize: 11, color: "rgba(11,26,42,.55)" }}>
                <span>{x.terr}</span>
                <span style={{ width: 1, height: 10, background: "rgba(11,26,42,.18)" }} />
                <span>{x.from}</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ background: "#FFFFFF", alignSelf: "stretch" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F" }}>{f.channel}</span>
              <span style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>{f.from} · {f.terr} · reçu {f.received}</span>
            </div>
            <h2 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 25, lineHeight: 1.2, margin: "0 0 12px", maxWidth: "36ch" }}>{f.title}</h2>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(11,26,42,.8)", maxWidth: "78ch", padding: "13px 16px", background: "#F7F3E9", borderLeft: "2px solid rgba(11,26,42,.2)" }}>{f.raw}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(11,26,42,.1)", borderBottom: "1px solid rgba(11,26,42,.1)" }}>
            <div style={{ background: "#FFFFFF", padding: "16px 22px" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 11 }}>Ce que le système a pu rattacher</div>
              {f.matched.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(11,26,42,.06)" }}>
                  <span style={{ fontSize: 12, color: "#4E7B5A", flex: "none" }}>●</span>
                  <span style={{ flex: 1, fontSize: 12.5 }}>{m.k}</span>
                  <span style={{ fontSize: 12.5, color: "rgba(11,26,42,.7)" }}>{m.v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#FFFFFF", padding: "16px 22px" }}>
              <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 11 }}>Ce qui manque pour qualifier</div>
              {f.missing.map((m, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(11,26,42,.06)" }}>
                  <span style={{ fontSize: 12, color: "#B6522F", flex: "none" }}>○</span>
                  <span style={{ flex: 1, fontSize: 12.5 }}>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {f.hasDup && (
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "15px 24px", background: "rgba(182,82,47,.06)", borderBottom: "1px solid rgba(11,26,42,.1)", flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", flex: "none", width: 140, paddingTop: 2 }}>Recoupement détecté</span>
              <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.8)" }}>{f.dup}</div>
            </div>
          )}

          <div style={{ padding: "20px 24px 26px" }}>
            <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 13 }}>
              Qualification — une seule personne décide, la trace reste
            </div>
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 16 }}>
              {f.actions.map((ac, i) => {
                const on = state.dossChoice?.id === f.id && state.dossChoice?.i === i;
                return (
                  <button
                    key={i}
                    onClick={() => patch({ dossChoice: { id: f.id, i } })}
                    style={{
                      border: `1px solid ${on ? "#0B1A2A" : "rgba(11,26,42,.2)"}`, background: on ? "#0B1A2A" : "transparent",
                      color: on ? "#F7F3E9" : "rgba(11,26,42,.75)", cursor: "pointer", padding: "10px 17px", fontSize: 12.5,
                      fontFamily: V3_FONT_SANS, fontWeight: 500, borderRadius: 4, transition: "all .2s"
                    }}
                  >
                    {ac.l}
                  </button>
                );
              })}
            </div>
            {chosenAction ? (
              <div style={{ padding: "16px 19px", background: "#0B1A2A", color: "#F7F3E9" }} className="pv3-rise-fast">
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#DE9C74", marginBottom: 9 }}>Effet de cette qualification</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{chosenAction.e}</div>
              </div>
            ) : (
              <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "rgba(11,26,42,.6)", borderLeft: "2px solid rgba(11,26,42,.15)", paddingLeft: 13, maxWidth: "74ch" }}>
                Tant qu’un élément reste ici, il n’existe nulle part ailleurs dans Mbàmbulaan. C’est la garantie qui permet d’afficher un chiffre sans le qualifier à chaque fois.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
