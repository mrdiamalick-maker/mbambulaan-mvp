"use client";

import { useMemo } from "react";
import { IND, KINDC, PROGS, TERR_PERF } from "../../data/programmes";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

const TERR_CHIPS = ["Tous les territoires", "Hann", "Mbour", "Joal-Fadiouth", "Kayar", "Kafountine"];
const PROG_CHIPS: Array<{ i: number | null; l: string }> = [
  { i: null, l: "Tous les programmes" }, { i: 0, l: "Chaîne du froid" }, { i: 1, l: "Référentiel pirogues" }, { i: 2, l: "Qualité Cap-Vert" }
];

export function Resultats({ state, patch }: { state: AppState; patch: Patch }) {
  const per = state.period;
  const idx = state.resInd ?? 0;
  const ri0 = IND[idx];
  const fTerr = state.resTerr;
  const fProg = state.resProg;

  const factor = fTerr ? TERR_PERF[fTerr] || 1 : 1;
  const progFactor = fProg != null ? [0.86, 0.92, 1.18, 0.95, 0.9, 1.02, 0.98, 0.74, 0.6][fProg] : 1;
  const mult = factor * progFactor;
  const nPts = per === "30j" ? 5 : 12;
  const rawFull = ri0.nat;
  const raw = rawFull.slice(rawFull.length - nPts);
  const labs = per === "30j" ? ["S32", "S33", "S34", "S35", "S36"]
    : per === "90j" ? ["S25", "S26", "S27", "S28", "S29", "S30", "S31", "S32", "S33", "S34", "S35", "S36"]
      : ["oct", "nov", "déc", "janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept"];
  const vals = raw.map((v) => (v == null ? null : Math.round(v * (ri0.inv ? 2 - mult : mult) * 10) / 10));
  const present = vals.filter((v): v is number => v != null);
  const dataMax = Math.max(ri0.tgt || 0, ...(present.length ? present : [10]));
  const top = Math.ceil((dataMax * 1.15) / 10) * 10 || 10;
  const W = 700, H = 212;
  const px = (i: number) => ((nPts as number) === 1 ? W / 2 : (i / (nPts - 1)) * W);
  const py = (v: number) => H - (v / top) * H;
  const pts = vals.map((v, i) => (v == null ? null : [px(i), py(v)] as [number, number])).filter((v): v is [number, number] => v != null);
  const resLine = pts.length ? "M" + pts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") : "";
  const resArea = pts.length ? resLine + "L" + pts[pts.length - 1][0].toFixed(1) + "," + H + "L" + pts[0][0].toFixed(1) + "," + H + "Z" : "";
  const hov = state.resPt == null ? vals.length - 1 : state.resPt;
  const cmpOn = !!state.resCmp;
  const cmpVals = rawFull.slice(rawFull.length - nPts);
  const cmpPts = cmpVals.map((v, i) => (v == null ? null : [px(i), py(v)] as [number, number])).filter((v): v is [number, number] => v != null);
  const cmpLine = cmpPts.length ? "M" + cmpPts.map((p) => p[0].toFixed(1) + "," + p[1].toFixed(1)).join("L") : "";
  const cmpArea = cmpPts.length ? cmpLine + "L" + cmpPts[cmpPts.length - 1][0].toFixed(1) + "," + H + "L" + cmpPts[0][0].toFixed(1) + "," + H + "Z" : "";

  const last = present.length ? present[present.length - 1] : null;
  const first = present.length ? present[0] : null;
  const delta = last != null && first != null ? Math.round((last - first) * 10) / 10 : null;
  const good = ri0.inv ? delta != null && delta < 0 : delta != null && delta > 0;

  const scopeParts: string[] = [];
  if (fTerr) scopeParts.push(fTerr);
  if (fProg != null) scopeParts.push(PROGS[fProg].short);
  const resScope = scopeParts.length ? "Lecture filtrée · " + scopeParts.join(" × ") : "Lecture nationale · 18 sites, 9 programmes";

  const topTerrs = useMemo(() => Object.keys(TERR_PERF).filter((t) => !fProg || PROGS[fProg].terrs.includes(t)), [fProg]);
  const barVals = useMemo(() => {
    const base = rawFull.filter((v) => v != null).slice(-1)[0] ?? 0;
    return topTerrs.map((t) => {
      const f = TERR_PERF[t] * progFactor;
      return { name: t, v: Math.round(base * (ri0.inv ? 2 - f : f) * 10) / 10 };
    }).sort((a, b) => (ri0.inv ? a.v - b.v : b.v - a.v));
  }, [topTerrs, progFactor, ri0, rawFull]);
  const barMax = Math.max(...barVals.map((b) => b.v), 1);
  const natAvgN = Math.round((barVals.reduce((a, b) => a + b.v, 0) / barVals.length) * 10) / 10;

  const resGridArr = [0, 1, 2, 3, 4].map((i) => ({ y: H - (i / 4) * H, lab: Math.round((top * i) / 4) }));
  const evLabs = per === "12m"
    ? [{ i: 4, lab: "premiers relais mandatés" }, { i: 8, lab: "couverture 18 sites" }]
    : [{ i: Math.max(1, nPts - 8), lab: "mandat relais Cap-Vert" }, { i: nPts - 3, lab: "panne Joal" }];

  const chainCols = ["Résultat", "Changement", "Impact"].map((k) => {
    const items = IND.filter((i) => i.kind === k).map((i) => {
      const v = i.nat.filter((x) => x != null).slice(-1)[0];
      return { n: i.n, v: v == null ? "aucune donnée" : v + i.u, c: v == null ? "rgba(11,26,42,.4)" : "#0B1A2A" };
    });
    return {
      k, c: KINDC[k as keyof typeof KINDC], items,
      def: k === "Résultat" ? "Ce que le dispositif produit directement et que l’on peut compter."
        : k === "Changement" ? "Ce qui se modifie dans les pratiques des acteurs."
          : "Ce qui change dans la réalité économique — la partie la moins mesurée.",
      empty: k === "Impact"
    };
  });

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Résultats et redevabilité</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0, maxWidth: "34ch" }}>
            Six indicateurs suivis, deux d’entre eux n’ont pas assez de données pour conclure
          </h1>
        </div>
        <div style={{ flex: "none", display: "flex", border: "1px solid rgba(11,26,42,.16)", borderRadius: 4, overflow: "hidden" }}>
          {[["evolution", "Évolution"], ["territoire", "Territoires"], ["programme", "Programmes"]].map(([k, label]) => (
            <button key={k} onClick={() => patch({ resMode: k })} style={{ border: 0, cursor: "pointer", padding: "8px 15px", fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500, background: (state.resMode || "evolution") === k ? "#0B1A2A" : "transparent", color: (state.resMode || "evolution") === k ? "#F7F3E9" : "rgba(11,26,42,.65)", transition: "background .2s" }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "11px 16px", background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", marginBottom: 18 }}>
        <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(11,26,42,.45)" }}>Filtres croisés</span>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TERR_CHIPS.map((t) => {
            const on = t === "Tous les territoires" ? !fTerr : fTerr === t;
            return (
              <button key={t} onClick={() => patch({ resTerr: t === "Tous les territoires" ? null : fTerr === t ? null : t })}
                style={{ border: `1px solid ${on ? "#0B1A2A" : "rgba(11,26,42,.16)"}`, background: on ? "#0B1A2A" : "transparent", color: on ? "#F7F3E9" : "rgba(11,26,42,.65)", cursor: "pointer", borderRadius: 999, padding: "5px 11px", fontSize: 11, fontFamily: V3_FONT_SANS, transition: "all .2s" }}>{t}</button>
            );
          })}
        </div>
        <span style={{ width: 1, height: 16, background: "rgba(11,26,42,.14)" }} />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PROG_CHIPS.map((o) => {
            const on = o.i === null ? fProg == null : fProg === o.i;
            return (
              <button key={o.l} onClick={() => patch({ resProg: o.i === null ? null : fProg === o.i ? null : o.i })}
                style={{ border: `1px solid ${on ? "#0B1A2A" : "rgba(11,26,42,.16)"}`, background: on ? "#0B1A2A" : "transparent", color: on ? "#F7F3E9" : "rgba(11,26,42,.65)", cursor: "pointer", borderRadius: 999, padding: "5px 11px", fontSize: 11, fontFamily: V3_FONT_SANS, transition: "all .2s" }}>{o.l}</button>
            );
          })}
        </div>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 11.5, color: "#B6522F" }}>{resScope}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 0, border: "1px solid rgba(11,26,42,.12)", marginBottom: 20, alignItems: "stretch" }}>
        <div style={{ background: "#FFFFFF", borderRight: "1px solid rgba(11,26,42,.12)" }}>
          <div style={{ padding: "14px 16px 10px", fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)" }}>Indicateurs · résultat, changement, impact</div>
          {IND.map((i, j) => {
            const v = i.nat.filter((x) => x != null);
            const d = v.length > 1 ? Math.round(((v[v.length - 1] as number) - (v[0] as number)) * 10) / 10 : null;
            const gd = i.inv ? d != null && d < 0 : d != null && d > 0;
            return (
              <button
                key={j}
                onClick={() => patch({ resInd: j, resPt: null })}
                style={{ display: "block", width: "100%", textAlign: "left", border: 0, borderTop: "1px solid rgba(11,26,42,.07)", background: idx === j ? "rgba(182,82,47,.07)" : "transparent", cursor: "pointer", padding: "12px 16px", boxShadow: idx === j ? "inset 3px 0 0 #B6522F" : "none", transition: "background .2s" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: KINDC[i.kind], fontWeight: 500 }}>{i.kind}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ fontFamily: V3_FONT_MONO, fontSize: 12.5, color: d == null ? "rgba(11,26,42,.35)" : gd ? "#4E7B5A" : "#B6522F" }}>{d == null ? "—" : (d > 0 ? "+" : "") + d}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: idx === j ? 600 : 400, lineHeight: 1.4 }}>{i.n}</div>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 16, marginTop: 6 }}>{v.length ? v[v.length - 1] + i.u : "aucune donnée"}</div>
              </button>
            );
          })}
        </div>

        <div style={{ background: "#FFFFFF" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "17px 22px 8px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 23, lineHeight: 1.2 }}>{ri0.n}</div>
              <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginTop: 5 }}>{ri0.def}</div>
            </div>
            <div style={{ flex: "none", textAlign: "right" }}>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 30, lineHeight: 1 }}>{last == null ? "aucune donnée" : last + ri0.u}</div>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: delta == null ? "rgba(11,26,42,.35)" : good ? "#4E7B5A" : "#B6522F", marginTop: 4 }}>
                {delta == null ? "—" : (delta > 0 ? "+" : "") + delta + ri0.u} sur la période
              </div>
            </div>
          </div>
          <div style={{ padding: "6px 22px 4px", minHeight: 20, fontSize: 12.5, color: "#B6522F" }}>
            {vals[hov] == null ? `${labs[hov]} · aucun relevé disponible sur cette période` : `${labs[hov]} · ${vals[hov]}${ri0.u}`}
          </div>
          <div style={{ padding: "4px 22px 18px", overflowX: "auto" }}>
            <svg viewBox="0 0 700 240" style={{ width: "100%", height: 240, overflow: "visible", minWidth: 500 }}>
              {resGridArr.map((g, i) => <line key={i} x1={0} y1={g.y} x2={700} y2={g.y} stroke="rgba(11,26,42,.08)" strokeWidth={1} />)}
              {resGridArr.map((g, i) => <text key={"l" + i} x={-8} y={g.y + 3} textAnchor="end" fontFamily={V3_FONT_MONO} fontSize={9.5} fill="rgba(11,26,42,.42)">{g.lab}</text>)}
              {ri0.tgt ? <line x1={0} y1={py(ri0.tgt)} x2={700} y2={py(ri0.tgt)} stroke="#4E7B5A" strokeWidth={1.2} strokeDasharray="5 4" /> : null}
              {ri0.tgt ? <text x={698} y={py(ri0.tgt) - 6} textAnchor="end" fontFamily={V3_FONT_SANS} fontSize={10} fill="#4E7B5A">cible {ri0.tgt}{ri0.u}</text> : null}
              {cmpOn && (fTerr || fProg != null) && (
                <>
                  <path d={cmpArea} fill="rgba(11,26,42,.06)" />
                  <path d={cmpLine} fill="none" stroke="rgba(11,26,42,.35)" strokeWidth={1.6} strokeDasharray="4 3" />
                </>
              )}
              <path d={resArea} fill="rgba(182,82,47,.1)" style={{ transition: "d .5s cubic-bezier(.4,0,.2,1)" }} />
              <path d={resLine} fill="none" stroke="#B6522F" strokeWidth={2.2} strokeLinejoin="round" style={{ transition: "d .5s cubic-bezier(.4,0,.2,1)" }} />
              {vals.map((v, i) => (
                <g key={i} onMouseEnter={() => patch({ resPt: i })} style={{ cursor: "pointer" }}>
                  <rect x={px(i) - W / (nPts * 2)} y={0} width={W / nPts} height={212} fill={hov === i ? "rgba(182,82,47,.06)" : "transparent"} />
                  {v != null && <circle cx={px(i)} cy={py(v)} r={hov === i ? 5 : 3.2} fill="#B6522F" style={{ transition: "cy .5s,r .2s" }} />}
                </g>
              ))}
              {vals.map((v, i) => (
                <text key={"p" + i} x={px(i)} y={232} textAnchor="middle" fontFamily={V3_FONT_MONO} fontSize={9} fill={hov === i ? "#B6522F" : "rgba(11,26,42,.42)"}>{labs[i] ?? ""}</text>
              ))}
              {evLabs.filter((e) => e.i >= 0 && e.i < nPts).map((e, i) => (
                <text key={"e" + i} x={px(e.i) + (e.i > nPts / 2 ? -6 : 6)} y={14} fontFamily={V3_FONT_SANS} fontSize={9.5} fill="rgba(11,26,42,.5)" textAnchor={e.i > nPts / 2 ? "end" : "start"}>{e.lab}</text>
              ))}
            </svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 22px 18px", flexWrap: "wrap" }}>
            <button
              onClick={() => patch({ resCmp: !state.resCmp })}
              style={{ border: `1px solid ${cmpOn ? "#0B1A2A" : "rgba(11,26,42,.2)"}`, background: cmpOn ? "#0B1A2A" : "transparent", color: cmpOn ? "#F7F3E9" : "rgba(11,26,42,.7)", cursor: "pointer", borderRadius: 4, padding: "6px 13px", fontSize: 11.5, fontFamily: V3_FONT_SANS, transition: "all .2s" }}
            >
              {cmpOn ? "Masquer la référence nationale" : "Comparer à la moyenne nationale"}
            </button>
            <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", flex: 1 }}>
              {(fTerr || fProg != null) ? "La courbe pleine correspond au filtre actif, la courbe pointillée à la moyenne nationale." : "Sélectionnez un territoire ou un programme ci-dessus pour activer la comparaison."}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "16px 20px 12px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
            <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20, flex: 1 }}>Comparaison territoriale</div>
            <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)" }}>Cliquez une barre pour filtrer tout l’écran</div>
          </div>
          <div style={{ padding: "16px 20px 18px" }}>
            {barVals.map((b) => {
              const sel = fTerr === b.name, hovB = state.resTerrHover === b.name;
              const gapN = Math.round((b.v - natAvgN) * 10) / 10;
              const better = ri0.inv ? gapN < 0 : gapN > 0;
              return (
                <button
                  key={b.name}
                  onClick={() => patch({ resTerr: fTerr === b.name ? null : b.name })}
                  onMouseEnter={() => patch({ resTerrHover: b.name })}
                  onMouseLeave={() => patch({ resTerrHover: null })}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", border: 0, background: sel ? "rgba(182,82,47,.07)" : hovB ? "rgba(11,26,42,.03)" : "transparent", cursor: "pointer", padding: "6px 8px", marginBottom: 2, transition: "background .2s" }}
                >
                  <div style={{ width: 118, flex: "none", fontSize: 11.5, color: sel ? "#0B1A2A" : "rgba(11,26,42,.7)", fontWeight: sel ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.name}</div>
                  <div style={{ flex: 1, height: 14, background: "rgba(11,26,42,.06)", position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: (b.v / barMax) * 100 + "%", background: sel ? "#B6522F" : hovB ? "rgba(182,82,47,.7)" : better ? "#4E7B5A" : "rgba(11,26,42,.42)", transition: "width .5s cubic-bezier(.4,0,.2,1)" }} />
                    <div style={{ position: "absolute", left: (natAvgN / barMax) * 100 + "%", top: -2, bottom: -2, width: 1.5, background: "rgba(11,26,42,.5)" }} />
                  </div>
                  <div style={{ width: 52, flex: "none", textAlign: "right", fontFamily: V3_FONT_MONO, fontSize: 11.5, color: sel ? "#0B1A2A" : "rgba(11,26,42,.7)" }}>{b.v}{ri0.u}</div>
                  <div style={{ width: 44, flex: "none", textAlign: "right", fontFamily: V3_FONT_MONO, fontSize: 10.5, color: better ? "#4E7B5A" : "#B6522F" }}>{gapN > 0 ? "+" : ""}{gapN}</div>
                </button>
              );
            })}
            <div style={{ marginTop: 12, fontSize: 11.5, color: "rgba(11,26,42,.55)" }}>Le trait vertical marque la moyenne nationale ({natAvgN}{ri0.u}).</div>
          </div>
        </div>

        <div style={{ background: "#0B1A2A", color: "#F7F3E9" }}>
          <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid rgba(247,243,233,.1)" }}>
            <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20 }}>Ce que la courbe ne dit pas</div>
            <div style={{ fontSize: 11.5, color: "rgba(247,243,233,.55)", marginTop: 4 }}>Interprétation — rédigée, pas calculée</div>
          </div>
          <div style={{ padding: "16px 20px 20px" }}>
            <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: 1.65, color: "rgba(247,243,233,.86)" }}>{ri0.interp}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 14, borderTop: "1px solid rgba(247,243,233,.12)" }}>
              {ri0.caveats.map((cv, i) => (
                <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <span style={{ color: "#DE9C74", fontSize: 12, flex: "none", lineHeight: 1.5 }}>—</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(247,243,233,.75)" }}>{cv}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "16px 20px 12px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
          <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20, flex: 1 }}>Du résultat au changement, du changement à l’impact</div>
          <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)" }}>Mbàmbulaan ne présente jamais un résultat comme un impact</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "rgba(11,26,42,.1)" }}>
          {chainCols.map((col) => (
            <div key={col.k} style={{ background: "#FFFFFF", padding: "17px 20px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                <span style={{ width: 18, height: 2, background: col.c }} />
                <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: col.c }}>{col.k}</span>
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginBottom: 14, lineHeight: 1.45 }}>{col.def}</div>
              {col.items.map((it, i) => (
                <div key={i} style={{ padding: "10px 0", borderTop: "1px solid rgba(11,26,42,.07)" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                    <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.45 }}>{it.n}</div>
                    <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12.5, color: it.c }}>{it.v}</div>
                  </div>
                </div>
              ))}
              {col.empty && (
                <div style={{ padding: "14px 0 0", borderTop: "1px solid rgba(11,26,42,.07)", fontSize: 12, lineHeight: 1.55, color: "rgba(11,26,42,.6)" }}>
                  Un seul indicateur d’impact est partiellement relevé et un autre n’a aucune donnée. Mbàmbulaan ne comble pas ce vide par extrapolation.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
