"use client";

import { useMemo } from "react";
import { ATTN, BLIND, BRIEF_DEC, BRIEF_PROG, HOT } from "../../data/brief";
import { PERIOD } from "../../data/period";
import type { RoleDef } from "../../data/roles";
import { LV, V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import { TERR } from "../../data/territories";
import { briefViewBox, geo, project } from "../../lib/geo";
import type { AppState } from "../../state";
import type { ScreenKey } from "../../types";

const SEV = [
  ["critique", "Critique", "#C8452B"],
  ["eleve", "Élevé", "#D89A4A"],
  ["modere", "Modéré", "#9FB9CE"]
] as const;

export function Brief({
  state, patch, roleDef, onOpenSituation, onOpenProgramme
}: {
  state: AppState;
  patch: (p: Partial<AppState>) => void;
  roleDef: RoleDef;
  onOpenSituation: (sitId: number) => void;
  onOpenProgramme: (progId: number) => void;
}) {
  const P = PERIOD[state.period];

  const kpis = useMemo(() => P.kpis.map((k, i) => {
    const pts = k.series;
    const mx = Math.max(...pts), mn = Math.min(...pts);
    const sp = pts.length - 1;
    const xy = pts.map((v, j) => [(j / sp) * 120, 28 - ((v - mn) / (mx - mn || 1)) * 26]);
    const line = "M" + xy.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L");
    return {
      ...k, spark: line, area: line + "L120,30L0,30Z",
      fill: k.good ? "rgba(78,123,90,.13)" : "rgba(182,82,47,.11)",
      stroke: k.good ? "#4E7B5A" : "#B6522F", dc: k.good ? "#4E7B5A" : "#B6522F",
      lastX: 120, lastY: xy[xy.length - 1][1],
      active: state.sigBar === -2 - i
    };
  }), [P, state.sigBar]);

  const sevOff = state.sevOff;
  const bars = P.bars;
  const totals = bars.map((b) => SEV.reduce((a, [k]) => a + (sevOff[k] ? 0 : b[k as "critique"]), 0));
  const top = Math.max(8, Math.ceil(Math.max(...totals) / 4) * 4);
  const H = 168, W = 620, bw = W / bars.length;
  const sigBars = bars.map((b, i) => {
    let acc = 0;
    const segs = SEV.map(([k, , c]) => {
      const v = sevOff[k] ? 0 : b[k as "critique"];
      const h = (v / top) * H;
      const y = H - acc - h;
      acc += h;
      return { x: i * bw + bw * 0.2, y, w: bw * 0.6, h, c, op: state.sigBar === i ? 1 : 0.82 };
    });
    return {
      segs, gx: i * bw, gw: bw, cx: i * bw + bw / 2,
      hl: state.sigBar === i ? "rgba(182,82,47,.07)" : "transparent",
      lab: b.lab, labc: state.sigBar === i ? "#B6522F" : "rgba(11,26,42,.42)"
    };
  });
  const ma = totals.map((_, i) => totals.slice(Math.max(0, i - 2), i + 1).reduce((a, b) => a + b, 0) / Math.min(3, i + 1));
  const sigTrend = "M" + ma.map((v, i) => (i * bw + bw / 2).toFixed(1) + "," + (H - (v / top) * H).toFixed(1)).join("L");
  const gridLines = [0, 1, 2, 3, 4].map((i) => ({ y: H - (i / 4) * H, lab: Math.round((top * i) / 4) }));

  const cur = bars[state.sigBar] ?? bars[bars.length - 1];
  const kpiRead = state.sigBar < -1 ? P.kpis[-2 - state.sigBar] : null;
  const sigReadKey = kpiRead ? kpiRead.v : cur.lab + " · " + totals[state.sigBar] + " signaux";
  const sigReadText = kpiRead ? kpiRead.read : cur.read;

  const briefDots = TERR.map((t) => {
    const [name, , lat, lon, level] = t;
    const p = project(lon, lat);
    const hot = state.hot === name;
    return {
      name, tr: `translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`,
      color: LV[level], r: hot ? 6.5 : 4, halo: level === "critique" ? 7 : 5.5,
      haloC: level === "critique" ? "rgba(224,90,60,.34)" : level === "vigilance" ? "rgba(224,164,85,.22)" : "rgba(159,185,206,.14)",
      pulse: level === "critique"
    };
  });

  const briefHot = HOT.map((h) => ({ ...h, active: state.hot === h.name, tc: h.up ? "#E6A27A" : "#8FCB9B" }));
  const hotRow = HOT.find((h) => h.name === state.hot);

  return (
    <div style={{ padding: "30px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 36, marginBottom: 26, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 11 }}>
            Brief national · mercredi 9 septembre 2026
          </div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 41, lineHeight: 1.1, margin: "0 0 13px", maxWidth: "22ch" }}>
            {roleDef.head}
          </h1>
          <p style={{ margin: 0, fontFamily: V3_FONT_SERIF, fontSize: 17.5, lineHeight: 1.55, color: "rgba(11,26,42,.78)", maxWidth: "60ch" }}>
            {P.synthesis}
          </p>
        </div>
        <div style={{ flex: "none", width: 236, borderLeft: "2px solid #B6522F", padding: "2px 0 2px 16px" }}>
          <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", marginBottom: 8 }}>
            Lecture en 20 secondes
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>{roleDef.tldr}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)", marginBottom: 26 }}>
        {kpis.map((k, i) => (
          <button
            key={k.k}
            onMouseEnter={() => patch({ sigBar: -2 - i })}
            style={{ border: 0, textAlign: "left", cursor: "default", background: k.active ? "rgba(182,82,47,.05)" : "#FFFFFF", padding: "16px 17px 13px", display: "flex", flexDirection: "column", gap: 9, transition: "background .2s" }}
          >
            <div style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", minHeight: 26 }}>{k.k}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 32, lineHeight: 1, letterSpacing: "-.02em" }}>{k.v}</div>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12.5, color: k.dc }}>{k.delta}</div>
            </div>
            <svg viewBox="0 0 120 30" preserveAspectRatio="none" style={{ width: "100%", height: 30, overflow: "visible" }}>
              <path d={k.area} fill={k.fill} />
              <path d={k.spark} fill="none" stroke={k.stroke} strokeWidth={1.6} strokeLinejoin="round" />
              <circle cx={k.lastX} cy={k.lastY} r={2.6} fill={k.stroke} />
            </svg>
            <div style={{ fontSize: 11, color: "rgba(11,26,42,.52)", lineHeight: 1.35, minHeight: 30 }}>{k.note}</div>
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 22, marginBottom: 22 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "17px 20px 0", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20 }}>Évolution des signaux reçus</div>
              <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.52)", marginTop: 3 }}>{P.sigSub}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flex: "none" }}>
              {SEV.map(([k, label, c]) => {
                const on = !sevOff[k];
                return (
                  <button
                    key={k}
                    onClick={() => patch({ sevOff: { ...sevOff, [k]: !sevOff[k] } })}
                    style={{
                      border: `1px solid ${on ? "rgba(11,26,42,.2)" : "rgba(11,26,42,.1)"}`,
                      background: on ? "rgba(11,26,42,.05)" : "transparent",
                      color: on ? "rgba(11,26,42,.8)" : "rgba(11,26,42,.4)",
                      cursor: "pointer", borderRadius: 999, padding: "4px 10px", fontSize: 11, fontFamily: V3_FONT_SANS,
                      display: "flex", alignItems: "center", gap: 6, transition: "all .2s"
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: on ? c : "rgba(11,26,42,.2)" }} />{label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px 6px", minHeight: 22, borderBottom: "1px solid rgba(11,26,42,.07)" }}>
            <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: "#B6522F" }}>{sigReadKey}</div>
            <div style={{ fontSize: 12, color: "rgba(11,26,42,.7)" }}>{sigReadText}</div>
          </div>

          <div style={{ padding: "16px 20px 6px" }}>
            <svg viewBox="0 0 620 190" style={{ width: "100%", height: 190, overflow: "visible" }}>
              {gridLines.map((g, i) => (
                <line key={i} x1={0} y1={g.y} x2={620} y2={g.y} stroke="rgba(11,26,42,.09)" strokeWidth={1} />
              ))}
              {gridLines.map((g, i) => (
                <text key={"gy" + i} x={-6} y={g.y + 3} textAnchor="end" fontFamily={V3_FONT_MONO} fontSize={9.5} fill="rgba(11,26,42,.4)">{g.lab}</text>
              ))}
              {sigBars.map((b, i) => (
                <text key={"bx" + i} x={b.cx} y={186} textAnchor="middle" fontFamily={V3_FONT_MONO} fontSize={9} fill={b.labc}>{b.lab}</text>
              ))}
              {sigBars.map((b, i) => (
                <g key={i} onMouseEnter={() => patch({ sigBar: i })} onClick={() => patch({ sigBar: i })} style={{ cursor: "pointer" }}>
                  <rect x={b.gx} y={0} width={b.gw} height={190} fill={b.hl} />
                  {b.segs.map((s, j) => (
                    <rect key={j} x={s.x} y={s.y} width={s.w} height={s.h} fill={s.c} opacity={s.op} style={{ transition: "y .45s cubic-bezier(.4,0,.2,1),height .45s cubic-bezier(.4,0,.2,1),opacity .25s" }} />
                  ))}
                </g>
              ))}
              <path d={sigTrend} fill="none" stroke="#0B1A2A" strokeWidth={1.4} strokeDasharray="3 3" opacity={0.5} style={{ transition: "d .45s" }} />
            </svg>
          </div>
          <div style={{ display: "flex", gap: 22, padding: "4px 20px 16px", fontSize: 11, color: "rgba(11,26,42,.5)", flexWrap: "wrap" }}>
            <span>Ligne pointillée : moyenne mobile 3 périodes</span>
            <span>Survolez une barre pour la composition</span>
          </div>
        </div>

        <div style={{ background: "#0B1A2A", color: "#F7F3E9", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "17px 20px 12px" }}>
            <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20 }}>Foyers d’attention</div>
            <div style={{ fontSize: 11.5, color: "rgba(247,243,233,.55)", marginTop: 3 }}>Concentration géographique sur la période</div>
          </div>
          <div style={{ position: "relative", padding: "0 12px" }}>
            <svg viewBox={briefViewBox()} style={{ width: "100%", height: 212, display: "block" }}>
              <path d={geo.others} fill="rgba(247,243,233,.05)" stroke="rgba(247,243,233,.14)" strokeWidth={0.5} />
              <path d={geo.sen} fill="rgba(247,243,233,.1)" stroke="rgba(247,243,233,.4)" strokeWidth={0.9} />
              {geo.rivers.map((d, i) => (
                <path key={i} d={d} fill="none" stroke="rgba(159,185,206,.4)" strokeWidth={0.8} />
              ))}
              {briefDots.map((m) => (
                <g key={m.name} transform={m.tr} onMouseEnter={() => patch({ hot: m.name })} onClick={() => patch({ hot: m.name })} style={{ cursor: "pointer" }}>
                  <circle r={m.halo} fill={m.haloC} style={m.pulse ? { animation: "pv3-pulse 2.8s ease-out infinite", transformOrigin: "center" } : undefined} />
                  <circle r={m.r} fill={m.color} stroke="#0B1A2A" strokeWidth={0.8} style={{ transition: "r .3s" }} />
                </g>
              ))}
            </svg>
          </div>
          <div style={{ padding: "6px 20px 16px", borderTop: "1px solid rgba(247,243,233,.1)", marginTop: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(247,243,233,.5)", padding: "12px 0 8px" }}>
              Trois foyers dominants
            </div>
            {briefHot.map((h) => (
              <button
                key={h.name}
                onMouseEnter={() => patch({ hot: h.name })}
                onClick={() => patch({ hot: h.name })}
                className="pv3-row-hover-dark"
                style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", border: 0, background: h.active ? "rgba(247,243,233,.1)" : "transparent", cursor: "pointer", padding: "9px 10px", borderRadius: 4, color: "#F7F3E9", transition: "background .2s" }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: h.color, flex: "none" }} />
                <span style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{h.name}</span>
                <span style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: "rgba(247,243,233,.75)" }}>{h.n}</span>
                <span style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: h.tc }}>{h.trend}</span>
              </button>
            ))}
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(247,243,233,.1)", fontSize: 12, lineHeight: 1.5, color: "rgba(247,243,233,.7)" }}>
              {hotRow?.reading}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 22, marginBottom: 22 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "17px 20px 13px", borderBottom: "1px solid rgba(11,26,42,.09)", flexWrap: "wrap" }}>
            <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20, flex: 1 }}>Requiert votre attention</div>
            <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)" }}>Classé par conséquence probable · cliquez pour déplier</div>
          </div>
          {ATTN.map((a, i) => {
            const open = state.attnOpen === i;
            return (
              <div key={i} style={{ borderBottom: "1px solid rgba(11,26,42,.07)", background: open ? "rgba(182,82,47,.04)" : "transparent", transition: "background .2s" }}>
                <button
                  onClick={() => patch({ attnOpen: open ? -1 : i })}
                  style={{ display: "flex", gap: 14, alignItems: "flex-start", width: "100%", textAlign: "left", border: 0, background: "transparent", cursor: "pointer", padding: "15px 20px" }}
                >
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: "rgba(11,26,42,.35)", width: 14, flex: "none", paddingTop: 3 }}>{"0" + (i + 1)}</div>
                  <div style={{ width: 3, alignSelf: "stretch", background: a.sevc, flex: "none", borderRadius: 2 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.35 }}>{a.title}</div>
                    <div style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 6, fontSize: 11.5, color: "rgba(11,26,42,.55)", flexWrap: "wrap" }}>
                      <span style={{ color: a.tc }}>{a.tg}</span><span>{a.trust}</span>
                      <span style={{ width: 1, height: 10, background: "rgba(11,26,42,.18)" }} /><span>{a.terr}</span>
                      <span style={{ width: 1, height: 10, background: "rgba(11,26,42,.18)" }} /><span>{a.age}</span>
                      <span style={{ width: 1, height: 10, background: "rgba(11,26,42,.18)" }} /><span style={{ color: a.sevt, fontWeight: 500 }}>{a.sev}</span>
                    </div>
                  </div>
                  <div style={{ flex: "none", textAlign: "right", paddingTop: 2 }}>
                    <div style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.4)" }}>Pourquoi maintenant</div>
                    <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.7)", maxWidth: 180, marginTop: 4 }}>{a.whyNow}</div>
                  </div>
                  <div style={{ flex: "none", fontSize: 15, color: "rgba(11,26,42,.35)", paddingTop: 2 }}>{open ? "⌃" : "⌄"}</div>
                </button>
                {open && (
                  <div style={{ padding: "2px 20px 18px 51px" }} className="pv3-rise-fast">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, padding: "14px 16px", background: "#F7F3E9", border: "1px solid rgba(11,26,42,.09)" }}>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#4E7B5A", marginBottom: 8 }}>Ce que nous savons</div>
                        {a.known.map((k, j) => (
                          <div key={j} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.82)", marginBottom: 6, paddingLeft: 11, borderLeft: "2px solid rgba(78,123,90,.35)" }}>{k}</div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F", marginBottom: 8 }}>Ce qui reste incertain</div>
                        {a.unknown.map((u, j) => (
                          <div key={j} style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.82)", marginBottom: 6, paddingLeft: 11, borderLeft: "2px solid rgba(182,82,47,.35)" }}>{u}</div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                      <button
                        onClick={() => onOpenSituation(a.sit)}
                        style={{ border: "1px solid #0B1A2A", background: "#0B1A2A", color: "#F7F3E9", cursor: "pointer", padding: "8px 15px", fontSize: 12, fontFamily: V3_FONT_SANS, fontWeight: 500, borderRadius: 4 }}
                      >
                        Ouvrir la situation
                      </button>
                      <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>{a.next}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
            <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(11,26,42,.09)", display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, flex: 1 }}>Décisions attendues</div>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: "#B6522F" }}>3 cette semaine</div>
            </div>
            {BRIEF_DEC.map((d, i) => (
              <button
                key={i}
                onClick={() => patch({ screen: "arbitrages" as ScreenKey })}
                className="pv3-row-hover-06"
                style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)", background: "transparent", cursor: "pointer", padding: "12px 18px" }}
              >
                <div style={{ flex: "none", width: 42, textAlign: "center" }}>
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 17, color: d.dueC, lineHeight: 1 }}>{d.dueN}</div>
                  <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(11,26,42,.45)", marginTop: 2 }}>{d.dueU}</div>
                </div>
                <div style={{ width: 1, alignSelf: "stretch", background: "rgba(11,26,42,.1)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}>{d.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 4 }}>{d.meta}</div>
                </div>
              </button>
            ))}
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
            <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19 }}>Programmes à surveiller</div>
              <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.52)", marginTop: 3 }}>Écart entre trajectoire administrative et signaux de terrain</div>
            </div>
            {BRIEF_PROG.map((p) => (
              <button
                key={p.id}
                onClick={() => onOpenProgramme(p.id)}
                className="pv3-row-hover-06"
                style={{ display: "block", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)", background: "transparent", cursor: "pointer", padding: "13px 18px" }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}>{p.title}</div>
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12.5 }}>{p.pct}</div>
                </div>
                <div style={{ height: 4, background: "rgba(11,26,42,.1)", margin: "9px 0 8px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: p.pct, background: "#0B1A2A", transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: p.alertC }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.alertC, flex: "none" }} />{p.alert}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "20px 22px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 32 }}>
          <div>
            <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20, marginBottom: 6 }}>Ce que le système ne sait pas encore</div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: "rgba(11,26,42,.65)" }}>
              Mbàmbulaan affiche ses angles morts au même niveau que ses constats. Une absence de signal n’est pas une absence de problème.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 26px" }}>
            {BLIND.map((b) => (
              <div key={b.n} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <span style={{ fontFamily: V3_FONT_MONO, fontSize: 13, color: "#B6522F", flex: "none", paddingTop: 1 }}>{b.n}</span>
                <div style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>{b.t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
