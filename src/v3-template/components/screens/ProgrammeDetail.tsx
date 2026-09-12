"use client";

import { ASKS_BY_PROG, DECISIONS_BY_PROG, MS_ST, PROGS } from "../../data/programmes";
import { LVD, V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import { SITS } from "../../data/situations";
import { TD, TERR } from "../../data/territories";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

const TABS: Array<[string, string]> = [["sante", "Santé"], ["exec", "Exécution"], ["reel", "Réalité et intelligence"], ["acteurs", "Acteurs et capacité"], ["risk", "Risques et demandes"]];

export function ProgrammeDetail({
  state, patch, onOpenSituation, onBack
}: {
  state: AppState;
  patch: Patch;
  onOpenSituation: (id: number) => void;
  onBack: () => void;
}) {
  const p = PROGS.find((x) => x.id === state.progOpen) ?? PROGS[0];
  const tab = state.progTab || "sante";
  const bp = p.budId ? (p.budConf / p.budId) * 100 : 0;
  const doneMs = p.milestones.filter((m) => m.st === "done").length;
  const capTotalNeed = p.cap.reduce((a, x) => a + x.need, 0);
  const capTotalHave = p.cap.reduce((a, x) => a + x.have, 0);
  const realCount = p.reality.length;
  const misaligned = realCount >= 2 && p.health !== "Critique";
  const decisions = DECISIONS_BY_PROG[p.id] ?? [];
  const asks = ASKS_BY_PROG[p.id] ?? [];

  const gauges = [
    { k: "Avancement", v: p.progress + "%", sub: "déclaré", c: "#DE9C74", pct: p.progress },
    { k: "Budget confirmé", v: p.budId ? Math.round(bp) + "%" : "—", sub: p.budId ? `${p.budConf} / ${p.budId} M` : "non chiffré", c: bp >= 99 ? "#8FCB9B" : bp > 0 ? "#E0A455" : "#E05A3C", pct: bp },
    { k: "Jalons tenus", v: `${doneMs}/${p.milestones.length}`, sub: "à ce jour", c: "#9FB9CE", pct: (doneMs / p.milestones.length) * 100 },
    { k: "Capacité pourvue", v: `${capTotalHave}/${capTotalNeed}`, sub: "postes et mandats", c: capTotalHave === capTotalNeed ? "#8FCB9B" : "#E05A3C", pct: (capTotalHave / capTotalNeed) * 100 }
  ];

  return (
    <div className="pv3-rise">
      <div style={{ background: "#0B1A2A", color: "#F7F3E9", padding: "20px 30px 22px" }}>
        <button onClick={onBack} className="pv3-row-hover-dark" style={{ border: 0, background: "transparent", color: "rgba(247,243,233,.6)", cursor: "pointer", fontSize: 11.5, fontFamily: V3_FONT_SANS, padding: 0, marginBottom: 13 }}>
          ← Portefeuille · 9 programmes
        </button>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 28, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 7, border: `1px solid ${p.healthC}`, borderRadius: 999, padding: "3px 11px", fontSize: 11 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.healthC }} />{p.health}
              </span>
              <span style={{ fontSize: 11.5, color: "rgba(247,243,233,.6)" }}>{p.phase} · {p.lead} · {p.terrs.length} territoire{p.terrs.length > 1 ? "s" : ""}</span>
            </div>
            <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 31, lineHeight: 1.15, margin: "0 0 11px", maxWidth: "30ch" }}>{p.title}</h1>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: "rgba(247,243,233,.78)", maxWidth: "74ch" }}>{p.why}</p>
          </div>
          <div style={{ flex: "none", width: 340, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {gauges.map((g) => (
              <div key={g.k} style={{ border: "1px solid rgba(247,243,233,.16)", padding: "11px 13px" }}>
                <div style={{ fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: "rgba(247,243,233,.5)" }}>{g.k}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginTop: 7 }}>
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 21, lineHeight: 1, color: g.c }}>{g.v}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(247,243,233,.55)" }}>{g.sub}</div>
                </div>
                <div style={{ height: 3, background: "rgba(247,243,233,.14)", marginTop: 9, position: "relative" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: g.pct + "%", background: g.c, transition: "width .6s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(11,26,42,.12)", padding: "0 24px", background: "#FFFFFF", position: "sticky", top: 60, zIndex: 20, overflowX: "auto" }}>
        {TABS.map(([k, label]) => {
          const badge = k === "reel" ? p.reality.length + p.intel.length : k === "risk" ? p.risks.length : 0;
          return (
            <button
              key={k}
              onClick={() => patch({ progTab: k })}
              style={{
                border: 0, background: "transparent", cursor: "pointer", padding: "13px 15px 11px", fontSize: 12.5,
                fontFamily: V3_FONT_SANS, fontWeight: tab === k ? 600 : 400, color: tab === k ? "#0B1A2A" : "rgba(11,26,42,.55)",
                boxShadow: tab === k ? "inset 0 -2px 0 #B6522F" : "none", transition: "all .2s", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
              }}
            >
              {label}
              {badge > 0 && <span style={{ fontFamily: V3_FONT_MONO, fontSize: 10.5, background: k === "reel" ? "#B6522F" : "#0B1A2A", color: "#F7F3E9", borderRadius: 9, padding: "1px 6px" }}>{badge}</span>}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "24px 30px 60px" }}>
        {tab === "sante" && (
          <div className="pv3-rise-fast">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(11,26,42,.12)", border: "1px solid rgba(11,26,42,.12)", marginBottom: 22 }}>
              <div style={{ background: "#FFFFFF", padding: "19px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                  <span style={{ width: 18, height: 2, background: "rgba(11,26,42,.45)" }} />
                  <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.6)" }}>Trajectoire administrative</span>
                </div>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 23, lineHeight: 1.25, marginBottom: 12 }}>
                  {p.schedDelta === 0 ? "Le programme tient son calendrier" : p.schedDelta < -20 ? `Le calendrier a glissé de ${Math.abs(p.schedDelta)} jours` : `Léger décalage de ${Math.abs(p.schedDelta)} jours`}
                </div>
                <div style={{ display: "flex", gap: 11, alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: "rgba(11,26,42,.5)", flex: "none", width: 52 }}>{doneMs}/{p.milestones.length}</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>jalons tenus, dont le dernier le {p.milestones.filter((m) => m.st === "done").slice(-1)[0]?.d ?? "—"}.</span>
                </div>
                <div style={{ display: "flex", gap: 11, alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: "rgba(11,26,42,.5)", flex: "none", width: 52 }}>{p.progress}%</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>d’avancement déclaré par la direction de programme.</span>
                </div>
                <div style={{ display: "flex", gap: 11, alignItems: "baseline" }}>
                  <span style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: "rgba(11,26,42,.5)", flex: "none", width: 52 }}>{p.budId ? Math.round(bp) + "%" : "0%"}</span>
                  <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>{p.budId ? "du montant identifié est confirmé en financement." : "aucun montant n’a encore été chiffré."}</span>
                </div>
              </div>
              <div style={{ background: "#FFFFFF", padding: "19px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
                  <span style={{ width: 18, height: 2, background: "#B6522F" }} />
                  <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "#B6522F" }}>Ce que dit l’écosystème</span>
                </div>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 23, lineHeight: 1.25, marginBottom: 12, color: realCount >= 3 ? "#C8452B" : realCount >= 1 ? "#B6522F" : "#4E7B5A" }}>
                  {realCount === 0 ? "Aucun signal de terrain rattaché" : realCount >= 3 ? `${realCount} signaux opérationnels requièrent une attention` : `${realCount} signal${realCount > 1 ? "aux" : ""} opérationnel${realCount > 1 ? "s" : ""} ouvert${realCount > 1 ? "s" : ""}`}
                </div>
                {(p.reality.length ? p.reality : [{ t: "Sur un programme en exécution, l’absence de signal peut traduire une couverture insuffisante plutôt qu’une absence de problème.", c: "#B6522F" }]).map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "baseline", marginBottom: 8 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: r.c, flex: "none", marginTop: 5 }} />
                    <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>{r.t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 14, padding: "15px 20px", marginBottom: 22,
              background: misaligned ? "rgba(182,82,47,.07)" : realCount === 0 ? "rgba(78,123,90,.07)" : "#FFFFFF",
              border: `1px solid ${misaligned ? "rgba(182,82,47,.3)" : realCount === 0 ? "rgba(78,123,90,.3)" : "rgba(11,26,42,.12)"}`
            }}>
              <span style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: misaligned ? "#B6522F" : realCount === 0 ? "#4E7B5A" : "rgba(11,26,42,.6)", flex: "none" }}>Alignement</span>
              <span style={{ fontSize: 14, lineHeight: 1.5, color: "rgba(11,26,42,.88)", flex: 1 }}>
                {misaligned
                  ? `La trajectoire administrative paraît normale alors que ${realCount} signaux opérationnels restent ouverts sur les mêmes territoires. Mbàmbulaan ne fusionne pas ces deux lectures en un score : il les met côte à côte pour que l’écart soit visible avant la prochaine revue.`
                  : realCount === 0
                    ? "Aucun écart détecté entre l’exécution déclarée et les signaux reçus. C’est aussi le seul programme dont toutes les capacités requises sont pourvues — la corrélation mérite d’être examinée."
                    : "La trajectoire administrative et les signaux reçus racontent la même histoire : le programme est en difficulté, et le terrain le confirme."}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 4 }}>Indicateurs suivis</div>
                <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)", marginBottom: 16 }}>Départ · aujourd’hui · cible</div>
                {p.inds.map((i, idx) => {
                  const span = Math.abs(i.tgt - i.base) || 1;
                  const prog = Math.abs(i.cur - i.base) / span;
                  return (
                    <div key={idx} style={{ marginBottom: 20 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 9 }}>
                        <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{i.n}</div>
                        <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12, color: "#B6522F" }}>{i.cur}{i.u}</div>
                      </div>
                      <div style={{ height: 8, background: "rgba(11,26,42,.08)", position: "relative" }}>
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4%", background: "rgba(11,26,42,.22)" }} />
                        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: Math.min(100, prog * 100) + "%", background: "#B6522F", transition: "width .6s cubic-bezier(.4,0,.2,1)" }} />
                        <div style={{ position: "absolute", left: "100%", top: -3, bottom: -3, width: 2, background: "#4E7B5A" }} />
                      </div>
                      <div style={{ display: "flex", gap: 14, marginTop: 7, fontFamily: V3_FONT_MONO, fontSize: 10.5, color: "rgba(11,26,42,.5)" }}>
                        <span>{i.base}{i.u} au départ</span><span>cible {i.tgt}{i.u}</span>
                        <span style={{ color: prog > 0.6 ? "#4E7B5A" : "#B6522F" }}>{Math.round((1 - prog) * 100)} % restant</span>
                      </div>
                    </div>
                  );
                })}
                {p.inds.length === 0 && (
                  <div style={{ padding: 15, background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)", fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.7)" }}>
                    Aucun indicateur n’est défini pour ce programme. L’avancement affiché reflète des étapes administratives, pas un résultat mesurable.
                  </div>
                )}
              </div>

              <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 4 }}>Territoires couverts</div>
                <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)", marginBottom: 14 }}>État du site et signaux ouverts</div>
                {p.terrs.map((t) => {
                  const row = TERR.find((x) => x[0] === t) ?? TERR[0];
                  const sits = SITS.filter((s) => s.terr === t);
                  return (
                    <button
                      key={t}
                      onClick={() => patch({ screen: "atlas", sel: t, mapZoom: true })}
                      className="pv3-row-hover-04"
                      style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)", background: "transparent", cursor: "pointer", padding: "11px 0" }}
                    >
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: LVD[row[4]], flex: "none" }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{t}</span>
                      <span style={{ fontFamily: V3_FONT_MONO, fontSize: 11.5, color: "rgba(11,26,42,.6)" }}>{TD[t][0]} débarq.</span>
                      <span style={{ fontSize: 11.5, color: sits.length ? "#B6522F" : "rgba(11,26,42,.45)", width: 92, textAlign: "right" }}>{sits.length ? `${sits.length} situation${sits.length > 1 ? "s" : ""}` : "aucune"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "exec" && (
          <div className="pv3-rise-fast">
            <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "20px 24px 26px", marginBottom: 20 }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20, marginBottom: 22 }}>Jalons</div>
              <div style={{ position: "relative", padding: "0 0 6px", overflowX: "auto" }}>
                <div style={{ position: "relative", minWidth: 560 }}>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 9, height: 2, background: "rgba(11,26,42,.1)" }} />
                  <div style={{ position: "absolute", left: 0, top: 9, height: 2, width: (doneMs / p.milestones.length) * 100 + "%", background: "#B6522F", transition: "width .6s" }} />
                  <div style={{ display: "flex" }}>
                    {p.milestones.map((m, i) => {
                      const [stLab, gl, dc, bd, fg] = MS_ST[m.st];
                      return (
                        <div key={i} style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: m.st === "todo" ? "transparent" : bd, border: `2px solid ${dc}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: fg, position: "relative", zIndex: 2 }}>{gl}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 12, lineHeight: 1.35 }}>{m.t}</div>
                          <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: dc, marginTop: 5 }}>{m.d}</div>
                          <div style={{ fontSize: 11, color: dc, marginTop: 3 }}>{stLab}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 16 }}>Budget</div>
                {[
                  { k: "Identifié", v: p.budId ? p.budId + " M FCFA" : "non chiffré", pct: p.budId ? 100 : 0, c: "rgba(11,26,42,.45)" },
                  { k: "Confirmé", v: p.budConf + " M FCFA", pct: bp, c: bp >= 99 ? "#4E7B5A" : bp > 0 ? "#D89A4A" : "#C8452B" },
                  { k: "Dépensé", v: p.budSpent + " M FCFA", pct: p.budId ? (p.budSpent / p.budId) * 100 : 0, c: "#0B1A2A" }
                ].map((b, i) => (
                  <div key={i} style={{ marginBottom: 15 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 7 }}>
                      <div style={{ flex: 1, fontSize: 12.5, color: "rgba(11,26,42,.75)" }}>{b.k}</div>
                      <div style={{ fontFamily: V3_FONT_MONO, fontSize: 13, color: b.c }}>{b.v}</div>
                    </div>
                    <div style={{ height: 7, background: "rgba(11,26,42,.08)", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: b.pct + "%", background: b.c, transition: "width .6s" }} />
                    </div>
                  </div>
                ))}
                <div style={{ marginTop: 14, fontSize: 11.5, lineHeight: 1.5, color: "rgba(11,26,42,.65)", borderLeft: "2px solid rgba(182,82,47,.4)", paddingLeft: 11 }}>
                  {p.budConf === 0 && p.budId > 0
                    ? "Le programme est engagé sans financement confirmé. Le montant identifié provient d’une saisie manuelle, non d’un système budgétaire connecté."
                    : "Montants issus de saisies manuelles. Aucun système budgétaire n’est connecté à Mbàmbulaan à ce jour."}
                </div>
              </div>
              <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 6 }}>Prochaine action</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 16 }}>{p.next}</div>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 10 }}>Décisions déjà prises sur ce programme</div>
                {decisions.map((d, i) => (
                  <div key={i} style={{ borderLeft: "2px solid rgba(78,123,90,.4)", padding: "2px 0 2px 12px", marginBottom: 13 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{d.t}</div>
                    <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 4 }}>{d.m}</div>
                    <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.75)", marginTop: 5 }}>{d.r}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "reel" && (
          <div className="pv3-rise-fast" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
              <div style={{ padding: "17px 20px 13px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20 }}>Signaux de réalité</div>
                <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginTop: 4, lineHeight: 1.5 }}>Ce qui remonte des territoires et de l’écosystème maritime, indépendamment du programme.</div>
              </div>
              {p.reality.map((r, i) => (
                <button
                  key={i}
                  onClick={() => onOpenSituation(r.sit)}
                  className="pv3-row-hover-05"
                  style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%", textAlign: "left", border: 0, borderBottom: "1px solid rgba(11,26,42,.07)", background: "transparent", cursor: "pointer", padding: "13px 20px" }}
                >
                  <span style={{ width: 3, alignSelf: "stretch", background: r.c, flex: "none" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{r.t}</div>
                    <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 4 }}>{r.k}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(11,26,42,.4)", flex: "none" }}>ouvrir →</span>
                </button>
              ))}
              {p.reality.length === 0 && (
                <div style={{ padding: 20, fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.65)" }}>
                  Aucun signal de terrain n’est rattaché à ce programme sur la période. Sur un programme en exécution, cette absence mérite d’être interrogée autant qu’un signal.
                </div>
              )}
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)" }}>
              <div style={{ padding: "17px 20px 13px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 20 }}>Intelligence programme</div>
                <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginTop: 4, lineHeight: 1.5 }}>Ce qui affecte directement l’exécution : partenaires, dépendances, engagements, livraison.</div>
              </div>
              <div style={{ padding: "12px 20px 18px" }}>
                {p.intel.map((it, i) => (
                  <div key={i} style={{ display: "flex", gap: 11, alignItems: "baseline", marginBottom: 12 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: it.c, flex: "none", marginTop: 5 }} />
                    <span style={{ fontSize: 12.5, lineHeight: 1.5, color: "rgba(11,26,42,.8)" }}>{it.t}</span>
                  </div>
                ))}
                <div style={{ marginTop: 8, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 10 }}>Partenaires</div>
                {p.partners.map((pr, i) => (
                  <div key={i} style={{ borderTop: "1px solid rgba(11,26,42,.07)", padding: "10px 0" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <div style={{ flex: 1, fontSize: 12.5, fontWeight: 500 }}>{pr.o}</div>
                      <div style={{ fontSize: 11, color: pr.ec }}>{pr.e}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 3 }}>{pr.r} · {pr.c} · {pr.ev}</div>
                    <div style={{ fontSize: 11, color: pr.due === "échue" ? "#C8452B" : "rgba(11,26,42,.6)", marginTop: 3 }}>{pr.act} · {pr.due}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "acteurs" && (
          <div className="pv3-rise-fast" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 16 }}>Capacité mobilisée</div>
              {p.cap.map((c, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ flex: 1, fontSize: 12.5 }}>{c.r}</div>
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12.5, color: c.have === c.need ? "#4E7B5A" : c.have === 0 ? "#C8452B" : "#D89A4A" }}>{c.have}/{c.need}</div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontSize: 11.5, lineHeight: 1.5, color: "rgba(11,26,42,.6)", borderLeft: "2px solid rgba(182,82,47,.4)", paddingLeft: 11 }}>{p.capNote}</div>
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 16 }}>Charge de la direction de programme</div>
              <div style={{ fontSize: 12.5, lineHeight: 1.5, marginBottom: 12 }}>
                {PROGS.filter((x) => x.lead === p.lead).length} programme{PROGS.filter((x) => x.lead === p.lead).length > 1 ? "s" : ""} porté{PROGS.filter((x) => x.lead === p.lead).length > 1 ? "s" : ""} par {p.lead} sur 9.
              </div>
              <div style={{ fontSize: 11.5, lineHeight: 1.5, color: "rgba(11,26,42,.6)" }}>
                {PROGS.filter((x) => x.lead === p.lead).length > 3
                  ? `${p.lead} porte ${PROGS.filter((x) => x.lead === p.lead).length} programmes sur neuf. La charge n’est pas un indicateur RH : elle explique pourquoi certains jalons glissent.`
                  : "La charge de direction reste soutenable sur ce programme."}
              </div>
            </div>
          </div>
        )}

        {tab === "risk" && (
          <div className="pv3-rise-fast" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 16 }}>Risques identifiés</div>
              {p.risks.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(11,26,42,.07)" : undefined }}>
                  <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.5 }}>{r.t}</div>
                  <div style={{ fontSize: 11, fontWeight: 500, color: r.c }}>{r.l}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#FFFFFF", border: "1px solid rgba(11,26,42,.12)", padding: "17px 20px" }}>
              <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19, marginBottom: 16 }}>Actions en attente</div>
              {asks.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "baseline", padding: "10px 0", borderTop: i > 0 ? "1px solid rgba(11,26,42,.07)" : undefined }}>
                  <div style={{ width: 60, flex: "none", fontFamily: V3_FONT_MONO, fontSize: 11.5, color: a.c }}>{a.d}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5 }}>{a.t}</div>
                    <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 3 }}>{a.who}</div>
                  </div>
                </div>
              ))}
              {asks.length === 0 && <div style={{ fontSize: 12.5, color: "rgba(11,26,42,.6)" }}>Aucune action en attente.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
