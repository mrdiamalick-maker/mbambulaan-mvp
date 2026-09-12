"use client";

import { useMemo } from "react";
import { PROGS } from "../../data/programmes";
import { TERR } from "../../data/territories";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

const ZONE_NAMES = ["Grande-Côte", "Cap-Vert", "Petite-Côte", "Sine-Saloum", "Casamance"];
const HEALTH_RANK: Record<string, number> = { Critique: 0, Attention: 1, "En bonne voie": 2, "À instruire": 3 };

export function Portfolio({ state, patch, onOpenProgramme }: { state: AppState; patch: Patch; onOpenProgramme: (id: number) => void }) {
  const totId = PROGS.reduce((a, p) => a + p.budId, 0);
  const totConf = PROGS.reduce((a, p) => a + p.budConf, 0);
  const totSpent = PROGS.reduce((a, p) => a + p.budSpent, 0);
  const active = PROGS.filter((p) => p.phase === "Exécution" || p.phase === "Financée").length;
  const attention = PROGS.filter((p) => p.health !== "En bonne voie" && p.health !== "À instruire").length;
  const avg = Math.round(PROGS.reduce((a, p) => a + p.progress, 0) / PROGS.length);
  const gapCount = PROGS.filter((p) => p.reality.length >= 2 && p.health !== "Critique").length;

  const budSegs = [
    { k: "Dépensé", v: totSpent + " M", n: totSpent, c: "#0B1A2A", fg: "#F7F3E9", read: `${totSpent} M FCFA effectivement dépensés, soit ${Math.round((totSpent / totId) * 100)} % du montant identifié.` },
    { k: "Confirmé non dépensé", v: (totConf - totSpent) + " M", n: totConf - totSpent, c: "#B6522F", fg: "#F7F3E9", read: `${totConf - totSpent} M confirmés mais non encore engagés sur le terrain.` },
    { k: "Identifié non confirmé", v: (totId - totConf) + " M", n: totId - totConf, c: "#DE9C74", fg: "#0B1A2A", read: `${totId - totConf} M identifiés sans confirmation de financement — deux programmes sont déjà en exécution sur cette base.` }
  ];
  const budHover = state.budHover;
  const budRead = budSegs[budHover == null ? 2 : budHover].read;

  const mode = state.scMode || "risque";
  const maxSig = 4;
  const scatter = useMemo(() => PROGS.map((p) => {
    const x = 40 + (p.progress / 100) * 480;
    const yv = mode === "risque" ? p.reality.length / maxSig : p.budId ? p.budConf / p.budId : 0;
    const y = 280 - yv * 250;
    const hov = state.scHover === p.id;
    const alert = p.reality.length >= 2 && p.health !== "Critique";
    const r = 10 + Math.sqrt(p.budId) * 0.7;
    return {
      id: p.id, x, y, r: hov ? r + 2.5 : r, ra: r + 6,
      fill: p.healthC === "rgba(11,26,42,.45)" ? "rgba(11,26,42,.2)" : p.healthC,
      stroke: hov ? "#0B1A2A" : "rgba(255,255,255,.85)", sw: hov ? 2 : 1.5, alert,
      lab: p.short
    };
  }), [mode, state.scHover]);

  const scGrid: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
  const scAxis: Array<{ x: number; y: number; anchor: "end" | "middle"; lab: string | number }> = [];
  for (let i = 0; i <= 4; i++) {
    const y = 280 - (i / 4) * 250;
    scGrid.push({ x1: 40, y1: y, x2: 530, y2: y });
    scAxis.push({ x: 32, y: y + 3, anchor: "end", lab: mode === "risque" ? Math.round((i / 4) * maxSig) : i * 25 + "%" });
  }
  for (let i = 0; i <= 4; i++) {
    const x = 40 + (i / 4) * 480;
    scGrid.push({ x1: x, y1: 30, x2: x, y2: 280 });
    scAxis.push({ x, y: 296, anchor: "middle", lab: i * 25 + "%" });
  }
  const scZone = mode === "risque"
    ? { x: 285, y: 30, w: 245, h: 125, tx: 524, ty: 45, lab: "Avance vite, terrain sous tension" }
    : { x: 285, y: 155, w: 245, h: 125, tx: 524, ty: 274, lab: "Avance sans financement confirmé" };

  const hp = state.scHover != null ? PROGS.find((p) => p.id === state.scHover) : null;
  const scatterRead = hp
    ? `${hp.title} — ${hp.progress} % d’avancement, ${hp.reality.length} signal${hp.reality.length > 1 ? "aux" : ""} terrain, ${hp.budConf ? Math.round((hp.budConf / hp.budId) * 100) + " % du budget confirmé" : "aucun financement confirmé"}.`
    : mode === "risque"
      ? "En haut à droite : les programmes qui avancent alors que le terrain remonte le plus de signaux. C’est là que l’écart se creuse."
      : "En bas à droite : les programmes qui avancent sans financement confirmé. Ils exposent l’exécution à une rupture.";

  const MILES: Array<{ t: string; d: string; st: "now" | "late"; prog: string; id: number }> = [];
  PROGS.forEach((p) => p.milestones.forEach((m) => { if (m.st === "now" || m.st === "late") MILES.push({ ...m, st: m.st as "now" | "late", prog: p.short, id: p.id }); }));
  const milesUp = MILES.slice(0, 6);

  const coverage = ZONE_NAMES.map((z) => {
    const sites = TERR.filter((t) => t[6] === z);
    const covered = sites.filter((t) => PROGS.some((p) => p.terrs.includes(t[0])));
    const pct = (covered.length / sites.length) * 100;
    return { zone: z, n: `${covered.length}/${sites.length}`, pct, c: pct >= 75 ? "#4E7B5A" : pct >= 50 ? "#DE9C74" : "#C8452B" };
  });
  const uncovered = TERR.filter((t) => !PROGS.some((p) => p.terrs.includes(t[0])));
  const coverNote = `${uncovered.length} sites ne sont couverts par aucun programme : ${uncovered.slice(0, 3).map((t) => t[0]).join(", ")}${uncovered.length > 3 ? "…" : ""}. Les signaux qui en proviennent n’ont aucune réponse cadrée.`;

  const sort = state.progSort || "attention";
  const sorted = useMemo(() => [...PROGS].sort((a, b) =>
    sort === "budget" ? b.budId - a.budId :
    sort === "avancement" ? b.progress - a.progress :
    sort === "ecart" ? b.reality.length - a.reality.length :
    HEALTH_RANK[a.health] - HEALTH_RANK[b.health]
  ), [sort]);

  return (
    <div style={{ padding: "24px 30px 60px" }} className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Portefeuille de programmes</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0, maxWidth: "32ch" }}>
            Neuf programmes, {totId} M FCFA identifiés, {Math.round((totConf / totId) * 100)} % confirmés
          </h1>
        </div>
        <div style={{ flex: "none", display: "flex", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)", flexWrap: "wrap" }}>
          {[{ v: active + "/9", k: "en exécution ou financés", c: "#0B1A2A" }, { v: avg + "%", k: "avancement moyen", c: "#0B1A2A" }, { v: String(attention), k: "demandent une attention", c: "#B6522F" }, { v: String(gapCount), k: "écarts terrain / déclaré", c: "#C8452B" }].map((s) => (
            <div key={s.k} style={{ background: "#FFFFFF", padding: "12px 18px", minWidth: 104 }}>
              <div style={{ fontFamily: V3_FONT_MONO, fontSize: 22, lineHeight: 1, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: 10, letterSpacing: ".07em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginTop: 6, lineHeight: 1.3 }}>{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)" }}>Du montant identifié à la dépense réelle</div>
          <div style={{ fontSize: 11.5, color: "#B6522F", flex: 1 }}>{budRead}</div>
          <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)" }}>Saisies manuelles — aucun système budgétaire connecté</div>
        </div>
        <div style={{ display: "flex", gap: 2, height: 38 }}>
          {budSegs.map((b, i) => (
            <div
              key={b.k}
              onMouseEnter={() => patch({ budHover: i })}
              style={{ width: (b.n / totId) * 100 + "%", background: b.c, display: "flex", alignItems: "center", padding: "0 12px", transition: "width .5s cubic-bezier(.4,0,.2,1),opacity .2s", opacity: budHover == null || budHover === i ? 1 : 0.45, overflow: "hidden" }}
            >
              <span style={{ fontFamily: V3_FONT_MONO, fontSize: 12.5, color: b.fg, whiteSpace: "nowrap" }}>{b.v}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2, marginTop: 7 }}>
          {budSegs.map((b) => (
            <div key={b.k} style={{ width: (b.n / totId) * 100 + "%", fontSize: 10.5, color: "rgba(11,26,42,.55)", padding: "0 12px", overflow: "hidden", whiteSpace: "nowrap" }}>{b.k}</div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginBottom: 20 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 20px 6px", flexWrap: "wrap" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20 }}>Cartographie du portefeuille</div>
              <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.52)", marginTop: 3 }}>Neuf programmes positionnés — cliquez pour ouvrir</div>
            </div>
            <div style={{ display: "flex", border: "1px solid rgba(11,26,42,.16)", borderRadius: 4, overflow: "hidden", flex: "none" }}>
              {[["risque", "Avancement × signaux"], ["budget", "Avancement × budget"]].map(([k, label]) => (
                <button key={k} onClick={() => patch({ scMode: k })} style={{ border: 0, cursor: "pointer", padding: "6px 12px", fontSize: 11, fontFamily: V3_FONT_SANS, background: mode === k ? "#0B1A2A" : "transparent", color: mode === k ? "#F7F3E9" : "rgba(11,26,42,.65)", whiteSpace: "nowrap", transition: "background .2s" }}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "6px 20px 4px", minHeight: 20, fontSize: 12, color: "rgba(11,26,42,.7)" }}>{scatterRead}</div>
          <div style={{ padding: "0 20px 18px", overflowX: "auto" }}>
            <svg viewBox="0 0 560 330" style={{ width: "100%", height: 330, overflow: "visible", minWidth: 460 }}>
              {scGrid.map((g, i) => <line key={i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke="rgba(11,26,42,.08)" strokeWidth={1} />)}
              <rect x={scZone.x} y={scZone.y} width={scZone.w} height={scZone.h} fill="rgba(200,69,43,.05)" />
              {scAxis.map((a, i) => <text key={i} x={a.x} y={a.y} textAnchor={a.anchor} fontFamily={V3_FONT_MONO} fontSize={9.5} fill="rgba(11,26,42,.42)">{a.lab}</text>)}
              <text x={280} y={326} textAnchor="middle" fontFamily={V3_FONT_SANS} fontSize={10.5} fill="rgba(11,26,42,.55)">Avancement déclaré</text>
              <text x={scZone.tx} y={scZone.ty} fontFamily={V3_FONT_SANS} fontSize={10} fill="rgba(200,69,43,.7)" textAnchor="end">{scZone.lab}</text>
              {scatter.map((p) => (
                <g key={p.id} onMouseEnter={() => patch({ scHover: p.id })} onMouseLeave={() => patch({ scHover: null })} onClick={() => onOpenProgramme(p.id)} style={{ cursor: "pointer" }}>
                  <circle cx={p.x} cy={p.y} r={p.r} fill={p.fill} stroke={p.stroke} strokeWidth={p.sw} style={{ transition: "cx .5s cubic-bezier(.4,0,.2,1),cy .5s cubic-bezier(.4,0,.2,1),r .3s" }} />
                  {p.alert && <circle cx={p.x} cy={p.y} r={p.ra} fill="none" stroke="#C8452B" strokeWidth={1} strokeDasharray="2 2" />}
                </g>
              ))}
              {scatter.map((p, i) => (
                <g key={"num" + p.id}>
                  <circle cx={p.x + p.r * 0.72} cy={p.y - p.r * 0.72} r={7.6} fill="#0B1A2A" stroke="#FFFFFF" strokeWidth={1.4} />
                  <text x={p.x + p.r * 0.72} y={p.y - p.r * 0.72 + 3.4} fontFamily={V3_FONT_MONO} fontSize={9.5} fontWeight={500} fill="#FFFFFF" textAnchor="middle">{i + 1}</text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2px 14px", padding: "0 20px 14px" }}>
            {PROGS.map((pr, i) => (
              <button
                key={pr.id}
                onClick={() => onOpenProgramme(pr.id)}
                onMouseEnter={() => patch({ scHover: pr.id })}
                onMouseLeave={() => patch({ scHover: null })}
                style={{ display: "flex", alignItems: "center", gap: 8, border: 0, background: state.scHover === pr.id ? "rgba(182,82,47,.08)" : "transparent", cursor: "pointer", padding: "4px 6px", textAlign: "left", transition: "background .2s" }}
              >
                <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#0B1A2A", color: "#FFFFFF", fontFamily: V3_FONT_MONO, fontSize: 9.5, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>{i + 1}</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: pr.healthC, flex: "none" }} />
                <span style={{ fontSize: 11, color: "rgba(11,26,42,.72)", fontWeight: state.scHover === pr.id ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pr.short}</span>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 20, padding: "0 20px 16px", fontSize: 11, color: "rgba(11,26,42,.5)", flexWrap: "wrap", borderTop: "1px solid rgba(11,26,42,.07)", paddingTop: 12, margin: "0 20px" }}>
            <span>Taille : montant identifié</span>
            <span>Couleur : santé déclarée</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: "50%", border: "1px dashed #C8452B" }} />Écart entre trajectoire déclarée et signaux reçus</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ background: "#0B1A2A", color: "#F7F3E9" }}>
            <div style={{ padding: "16px 18px 12px" }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19 }}>Jalons des 60 prochains jours</div>
              <div style={{ fontSize: 11.5, color: "rgba(247,243,233,.55)", marginTop: 3 }}>Ce qui doit arriver, et ce qui est déjà en retard</div>
            </div>
            {milesUp.map((m, i) => (
              <button
                key={i}
                onClick={() => onOpenProgramme(m.id)}
                className="pv3-row-hover-dark"
                style={{ display: "flex", gap: 12, alignItems: "center", width: "100%", textAlign: "left", border: 0, borderTop: "1px solid rgba(247,243,233,.1)", background: "transparent", cursor: "pointer", padding: "11px 18px", color: "#F7F3E9" }}
              >
                <div style={{ width: 52, flex: "none", fontFamily: V3_FONT_MONO, fontSize: 12, color: m.st === "late" ? "#E05A3C" : "#DE9C74" }}>{m.d}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 500 }}>{m.t}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(247,243,233,.55)", marginTop: 3 }}>{m.prog}</div>
                </div>
                <div style={{ fontSize: 10.5, color: m.st === "late" ? "#E05A3C" : "#DE9C74", flex: "none" }}>{m.st === "late" ? "en retard" : "en cours"}</div>
              </button>
            ))}
          </div>

          <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
            <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19 }}>Couverture territoriale</div>
              <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.52)", marginTop: 3 }}>Sites couverts par au moins un programme</div>
            </div>
            <div style={{ padding: "14px 18px 18px" }}>
              {coverage.map((z) => (
                <div key={z.zone} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                  <div style={{ width: 96, flex: "none", fontSize: 11.5, color: "rgba(11,26,42,.7)" }}>{z.zone}</div>
                  <div style={{ flex: 1, height: 14, background: "rgba(11,26,42,.07)", position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: z.pct + "%", background: z.c, transition: "width .5s" }} />
                  </div>
                  <div style={{ width: 44, flex: "none", textAlign: "right", fontFamily: V3_FONT_MONO, fontSize: 11.5 }}>{z.n}</div>
                </div>
              ))}
              <div style={{ marginTop: 12, fontSize: 11.5, lineHeight: 1.5, color: "rgba(11,26,42,.6)", borderLeft: "2px solid rgba(182,82,47,.4)", paddingLeft: 11 }}>{coverNote}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", borderBottom: "1px solid rgba(11,26,42,.1)", flexWrap: "wrap" }}>
          <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20, flex: 1 }}>Les neuf programmes</div>
          <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.45)" }}>Trier par</span>
          <div style={{ display: "flex", border: "1px solid rgba(11,26,42,.16)", borderRadius: 4, overflow: "hidden" }}>
            {[["attention", "Attention"], ["budget", "Budget"], ["avancement", "Avancement"], ["ecart", "Écart terrain"]].map(([k, label]) => (
              <button key={k} onClick={() => patch({ progSort: k })} style={{ border: 0, cursor: "pointer", padding: "6px 12px", fontSize: 11, fontFamily: V3_FONT_SANS, background: sort === k ? "#0B1A2A" : "transparent", color: sort === k ? "#F7F3E9" : "rgba(11,26,42,.65)", transition: "background .2s" }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 20px", background: "rgba(11,26,42,.03)", borderBottom: "1px solid rgba(11,26,42,.08)", fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(11,26,42,.45)", minWidth: 780 }}>
          <div style={{ flex: 1 }}>Programme</div>
          <div style={{ width: 96, flex: "none" }}>Phase</div>
          <div style={{ width: 124, flex: "none" }}>Avancement</div>
          <div style={{ width: 132, flex: "none" }}>Budget confirmé</div>
          <div style={{ width: 96, flex: "none" }}>Calendrier</div>
          <div style={{ width: 150, flex: "none" }}>Signaux terrain</div>
        </div>
        {sorted.map((p) => {
          const bp = p.budId ? (p.budConf / p.budId) * 100 : 0;
          const sigC = p.reality.length >= 3 ? "#C8452B" : p.reality.length >= 1 ? "#B6522F" : "#4E7B5A";
          return (
            <button
              key={p.id}
              onClick={() => onOpenProgramme(p.id)}
              className="pv3-row-hover-05"
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", minWidth: 780, textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.06)", background: "transparent", cursor: "pointer", padding: "13px 20px", transition: "background .2s" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: p.healthC, flex: "none" }} />
                  <span style={{ fontSize: 13.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(11,26,42,.5)", marginTop: 4, paddingLeft: 16 }}>{p.lead} · {p.terrs.length} territoire{p.terrs.length > 1 ? "s" : ""} · {p.health}</div>
              </div>
              <div style={{ width: 96, flex: "none", fontSize: 11.5, color: "rgba(11,26,42,.7)" }}>{p.phase}</div>
              <div style={{ width: 124, flex: "none" }}>
                <div style={{ height: 5, background: "rgba(11,26,42,.1)", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: p.progress + "%", background: "#0B1A2A", transition: "width .5s" }} />
                </div>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: "rgba(11,26,42,.65)", marginTop: 5 }}>{p.progress}%</div>
              </div>
              <div style={{ width: 132, flex: "none" }}>
                <div style={{ height: 5, background: "rgba(11,26,42,.1)", position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: bp + "%", background: bp >= 99 ? "#4E7B5A" : bp > 0 ? "#D89A4A" : "#C8452B", transition: "width .5s" }} />
                </div>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: bp >= 99 ? "#4E7B5A" : bp > 0 ? "#D89A4A" : "#C8452B", marginTop: 5 }}>{p.budId === 0 ? "non chiffré" : `${p.budConf} / ${p.budId} M`}</div>
              </div>
              <div style={{ width: 96, flex: "none", fontFamily: V3_FONT_MONO, fontSize: 11.5, color: p.schedDelta >= 0 ? "#4E7B5A" : p.schedDelta < -20 ? "#C8452B" : "#D89A4A" }}>
                {p.schedDelta === 0 ? "à l’heure" : p.schedDelta > 0 ? `+${p.schedDelta} j` : `${p.schedDelta} j`}
              </div>
              <div style={{ width: 150, flex: "none", display: "flex", alignItems: "center", gap: 7 }}>
                {p.reality.slice(0, 4).map((r, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 2, background: r.c, flex: "none" }} />)}
                <span style={{ fontSize: 11, color: sigC }}>{p.reality.length === 0 ? "aucun" : `${p.reality.length} ouvert${p.reality.length > 1 ? "s" : ""}`}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
