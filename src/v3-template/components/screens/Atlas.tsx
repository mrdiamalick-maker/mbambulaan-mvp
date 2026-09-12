"use client";

import { useMemo } from "react";
import { PROGS } from "../../data/programmes";
import { NEIGHBOURS, TD, TERR, ZONES } from "../../data/territories";
import { LV, V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../../theme";
import { ATLAS_VIEWBOX, geo, project } from "../../lib/geo";
import { terrData, tseries } from "../../lib/atlas";
// PD.1 — seul point où l'Atlas (gabarit gelé) touche le domaine réel
// Mbàmbulaan ; voir l'en-tête de lib/landing-bridge.ts.
import {
  atlasLandingDepthForRole,
  formatInfrastructureContext,
  formatKg,
  getLandingDetail,
  getTerritoryLandingView,
  type LandingDetailView
} from "../../lib/landing-bridge";
import { trustLabels } from "@/lib/status-tokens";
import type { AppState } from "../../state";

type Patch = (p: Partial<AppState>) => void;

// DetailField / LandingDetailPanel — composants locaux, même convention
// que FilterChip dans Situations.tsx (un petit composant réutilisé,
// défini en tête du fichier de l'écran plutôt qu'extrait ailleurs).
function DetailField({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ border: "1px solid rgba(11,26,42,.1)", padding: "9px 11px", background: "#F7F3E9" }}>
      <div style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(11,26,42,.5)" }}>{k}</div>
      <div style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.35 }}>{v}</div>
    </div>
  );
}

// LandingDetailPanel — "smallest V3-consistent progressive-detail
// interaction" (mandat PD.1 §6) : pas un nouvel écran, un panneau inséré
// dans l'onglet "Activité" déjà existant, avec les mêmes primitives
// visuelles (bordures, cartes, mono pour les valeurs) que le reste de
// l'Atlas. Ordre des champs = priorité demandée par le mandat (§6) :
// TIME/SITE, VESSEL/REGISTRATION, SPECIES/QUANTITIES, TOTAL WEIGHT,
// TRIP/CAPTAIN, WEIGHING/QUALITY, PROVENANCE/TRUST.
function LandingDetailPanel({ view, onClose }: { view: LandingDetailView; onClose: () => void }) {
  const { landing, site, territory, trip, vessel, captain, catches, infrastructures } = view;
  const at = landing.weighedAt ?? landing.arrivedAt;
  const timeLabel = at
    ? new Date(at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })
    : "Attendu";
  const infraNote = formatInfrastructureContext(infrastructures);
  return (
    <div className="pv3-rise-fast" style={{ border: "1px solid #0B1A2A", background: "#FFFFFF", padding: "14px 16px 16px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 18, lineHeight: 1.2 }}>{vessel?.name ?? "Pirogue non identifiée"}</div>
          <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 3 }}>
            {vessel?.registration || "Immatriculation non renseignée"} · {site?.name ?? landing.siteId}
            {territory ? ` · ${territory.name}` : ""}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ flex: "none", border: "1px solid rgba(11,26,42,.18)", background: "transparent", cursor: "pointer", borderRadius: 999, padding: "4px 11px", fontSize: 11, fontFamily: V3_FONT_SANS, color: "rgba(11,26,42,.65)" }}
        >
          Fermer
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
        <DetailField k="Heure / site" v={`${timeLabel} · ${site?.name ?? landing.siteId}`} />
        <DetailField k="Poids total" v={formatKg(landing.totalWeightKg)} />
        <DetailField k="Sortie / capitaine" v={trip ? `${trip.zone} · ${captain?.name ?? "Capitaine non identifié"}` : "Sortie non reliée"} />
        <DetailField k="Pesée / qualité" v={landing.weighedAt ? `Pesé · ${landing.weighingSource}` : "Non pesé à ce jour"} />
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginBottom: 6 }}>Espèces / quantités</div>
        {catches.length > 0 ? (
          catches.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, padding: "5px 0", borderBottom: i < catches.length - 1 ? "1px solid rgba(11,26,42,.07)" : "none" }}>
              <span>
                {c.speciesName} <span style={{ color: "rgba(11,26,42,.5)" }}>· qualité {c.quality} · {c.productForm.replaceAll("_", " ")}</span>
              </span>
              <span style={{ fontFamily: V3_FONT_MONO, flex: "none" }}>{formatKg(c.quantityKg)}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)" }}>Aucune espèce enregistrée pour ce débarquement.</div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(11,26,42,.09)" }}>
        <span style={{ fontSize: 11, color: "rgba(11,26,42,.55)" }}>Provenance : {landing.weighingSource}</span>
        <span style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: "#B6522F", flex: "none" }}>{trustLabels[landing.trust]}</span>
      </div>

      {infraNote && (
        <div style={{ marginTop: 10, fontSize: 11, lineHeight: 1.45, color: "rgba(11,26,42,.55)" }}>
          Contexte du site : {infraNote} — information de contexte, pas une preuve de lien avec ce débarquement.
        </div>
      )}
    </div>
  );
}

const ALWAYS_LABELLED = ["Saint-Louis", "Kayar", "Hann", "Mbour", "Joal-Fadiouth", "Kafountine", "Foundiougne"];
const LINK_PAIRS: Array<[string, string]> = [["Joal-Fadiouth", "Mbour"], ["Mbour", "Popenguine"]];
const ATLAS_TABS: Array<[string, string]> = [["act", "Activité"], ["cap", "Capacités"], ["acteurs", "Acteurs"], ["sit", "Situations"], ["prog", "Programmes"]];

export function Atlas({ state, patch, onOpenProgramme }: { state: AppState; patch: Patch; onOpenProgramme: (id: number) => void }) {
  const zone = state.atlasZone || "Toutes";
  const inZone = (t: (typeof TERR)[number]) => zone === "Toutes" || t[6] === zone;
  const L = state.layers;
  const stripList = TERR.filter(inZone);
  const per = state.period;

  let k = 1;
  let mapT = "translate(0,0) scale(1)";
  if (state.mapZoom) {
    const row = TERR.find((t) => t[0] === state.sel) ?? TERR[10];
    const p = project(row[3], row[2]);
    k = 3.6;
    mapT = `translate(${(450 - k * p[0]).toFixed(1)},${(300 - k * p[1]).toFixed(1)}) scale(${k})`;
  }

  const atlasDots = useMemo(() => TERR.map((t) => {
    const p = project(t[3], t[2]);
    const d = TD[t[0]];
    const on = zone === "Toutes" || t[6] === zone;
    const isSel = state.sel === t[0];
    let r = 4.4;
    if (L.land) r = 2.6 + Math.min(6, d[0] / 12);
    if (isSel) r += 1.6;
    const critical = L.sit && t[4] === "critique";
    const showLab = isSel || k > 1 || state.mapHover === t[0] || ALWAYS_LABELLED.includes(t[0]);
    return {
      name: t[0], tr: `translate(${p[0].toFixed(1)},${p[1].toFixed(1)})`, op: on ? 1 : 0.18,
      color: L.sit ? LV[t[4]] : "rgba(247,243,233,.75)",
      r: r / k, halo: (critical ? 7.5 : 5.5) / k,
      haloC: !L.sit ? "rgba(247,243,233,.1)" : t[4] === "critique" ? "rgba(224,90,60,.32)" : t[4] === "vigilance" ? "rgba(224,164,85,.2)" : "rgba(159,185,206,.13)",
      pulse: critical,
      ringOn: L.prog && PROGS.some((pr) => pr.terrs.includes(t[0])), ring: (r + 4.5) / k,
      showBar: L.cold && d[2] > 0, bx: 2.5 / k, by: -8 / k, bw: 3 / k, bh: (d[3] ? 8 : 4) / k,
      showLab, lx: -(r + 4) / k, ly: 3.5 / k, fs: 11 / k, fw: isSel ? 600 : 400, labc: isSel ? "#F7F3E9" : "rgba(247,243,233,.6)"
    };
  }), [state.sel, state.mapHover, L, zone, k]);

  // Étiquettes de zone (GRANDE-CÔTE, CAP-VERT…) et de pays voisins (MALI,
  // GAMBIE, GUINÉE-BISSAU) — décor cartographique du standalone, oublié
  // au premier portage (§7 : "missing visual").
  const zoneLabels = ZONES.map(([n, la, lo]) => {
    const p = project(lo, la);
    return { name: n, x: p[0], y: p[1], fs: 10 / k };
  });
  const nbLabels = NEIGHBOURS.map(([n, la, lo]) => {
    const p = project(lo, la);
    return { name: n, x: p[0], y: p[1], fs: 11 / k };
  });

  const atlasLinks = L.cold ? LINK_PAIRS.map(([a, b]) => {
    const ra = TERR.find((t) => t[0] === a)!, rb = TERR.find((t) => t[0] === b)!;
    const pa = project(ra[3], ra[2]), pb = project(rb[3], rb[2]);
    const mx = (pa[0] + pb[0]) / 2 - 18, my = (pa[1] + pb[1]) / 2;
    return `M${pa[0].toFixed(1)},${pa[1].toFixed(1)}Q${mx.toFixed(1)},${my.toFixed(1)} ${pb[0].toFixed(1)},${pb[1].toFixed(1)}`;
  }) : [];

  const strip = stripList.map((t) => {
    const s = tseries(t[0], per), mx = Math.max(...s);
    const sel = state.sel === t[0];
    return {
      name: t[0], n: TD[t[0]][0],
      spark: "M" + s.map((v, i) => (i / (s.length - 1) * 40).toFixed(1) + "," + (20 - (v / mx) * 18).toFixed(1)).join("L"),
      sc: sel ? "#DE7A50" : "rgba(247,243,233,.4)", top: LV[t[4]],
      bg: sel ? "rgba(247,243,233,.12)" : state.mapHover === t[0] ? "rgba(247,243,233,.06)" : "transparent",
      fg: sel ? "#F7F3E9" : "rgba(247,243,233,.6)", fw: sel ? 600 : 400
    };
  });

  const hovRow = state.mapHover ? TERR.find((t) => t[0] === state.mapHover) : null;
  const mapTip = hovRow ? {
    name: hovRow[0], meta: `${{ critique: "Critique", vigilance: "Vigilance", stable: "Stable" }[hovRow[4]]} · ${hovRow[6]} · ${hovRow[1]}`,
    stats: [{ v: TD[hovRow[0]][0], k: "débarq." }, { v: TD[hovRow[0]][4], k: "signaux" }, { v: `${TD[hovRow[0]][2] - TD[hovRow[0]][3]}/${TD[hovRow[0]][2]}`, k: "froid ok" }]
  } : null;

  const tab = state.atlasTab || "act";
  const t = useMemo(() => terrData(state.sel, per, state.actBar), [state.sel, per, state.actBar]);

  // PD.1 — vue "Activité de débarquement" adossée au domaine réel pour le
  // territoire actuellement sélectionné. Le reste du panneau territoire
  // (tuiles, carte, bande littorale, autres onglets) reste piloté par les
  // fixtures TD/TERR du gabarit gelé (§11/§12 du mandat : ne remplacer que
  // les blocs que PD.1 couvre réellement).
  const landingView = useMemo(() => getTerritoryLandingView(t.name), [t.name]);
  const landingDepth = atlasLandingDepthForRole(state.role);
  const openLanding = useMemo(() => (state.atlasLandingOpen ? getLandingDetail(state.atlasLandingOpen) : undefined), [state.atlasLandingOpen]);
  const trend = landingView?.trendPoints ?? [];
  const trendMaxKg = Math.max(1, ...trend.map((p) => p.landedKg));
  const trendBw = trend.length ? 360 / trend.length : 360;
  const trendHovered = state.actBar == null || state.actBar >= trend.length ? trend.length - 1 : state.actBar;
  const trendBars = trend.map((p, i) => ({
    x: i * trendBw + trendBw * 0.22,
    w: trendBw * 0.56,
    y: 92 - (p.landedKg / trendMaxKg) * 88,
    h: (p.landedKg / trendMaxKg) * 88,
    gx: i * trendBw,
    gw: trendBw,
    cx: i * trendBw + trendBw / 2,
    hl: trendHovered === i ? "rgba(182,82,47,.07)" : "transparent",
    c: trendHovered === i ? "#B6522F" : "rgba(11,26,42,.55)",
    lab: p.dateLabel
  }));

  const layerNote = [L.sit ? "gravité" : null, L.cold ? "capacité froide + délestages" : null, L.land ? "volume débarqué (taille)" : null, L.prog ? "couverture programme (anneau)" : null].filter(Boolean).join(" · ") || "aucune couche active";

  return (
    <div className="pv3-rise">
      <div style={{ display: "flex", alignItems: "flex-end", gap: 26, padding: "24px 30px 18px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{ fontSize: 10, letterSpacing: ".18em", textTransform: "uppercase", color: "#B6522F", marginBottom: 9 }}>Atlas territorial</div>
          <h1 style={{ fontFamily: V3_FONT_SERIF, fontWeight: 400, fontSize: 32, lineHeight: 1.15, margin: 0 }}>
            {zone === "Toutes" ? "18 sites de débarquement, un seul objet vivant par territoire" : `${zone} · ${stripList.length} sites suivis`}
          </h1>
        </div>
        <div style={{ display: "flex", gap: 6, flex: "none", flexWrap: "wrap", maxWidth: 520, justifyContent: "flex-end" }}>
          {["Toutes", "Grande-Côte", "Cap-Vert", "Petite-Côte", "Sine-Saloum", "Casamance"].map((z) => {
            const on = zone === z;
            return (
              <button key={z} onClick={() => patch({ atlasZone: z })} style={{ border: `1px solid ${on ? "#0B1A2A" : "rgba(11,26,42,.18)"}`, background: on ? "#0B1A2A" : "transparent", color: on ? "#F7F3E9" : "rgba(11,26,42,.65)", cursor: "pointer", borderRadius: 999, padding: "6px 13px", fontSize: 11.5, fontFamily: V3_FONT_SANS, fontWeight: 500, transition: "all .2s" }}>
                {z === "Toutes" ? "Tout le littoral" : z}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 424px", gap: 0, borderTop: "1px solid rgba(11,26,42,.12)", alignItems: "start" }}>
        <div style={{ background: "#0B1A2A", position: "relative", minHeight: 660, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "13px 18px", borderBottom: "1px solid rgba(247,243,233,.1)", flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(247,243,233,.45)", marginRight: 4 }}>Couches</span>
            {([["sit", "Situations", "#E05A3C"], ["cold", "Chaîne du froid", "#DE9C74"], ["land", "Débarquements", "#9FB9CE"], ["prog", "Programmes", "#8FCB9B"]] as const).map(([lk, label, col]) => (
              <button
                key={lk}
                onClick={() => patch({ layers: { ...L, [lk]: !L[lk] } })}
                style={{ border: `1px solid ${L[lk] ? "rgba(247,243,233,.28)" : "rgba(247,243,233,.13)"}`, background: L[lk] ? "rgba(247,243,233,.1)" : "transparent", color: L[lk] ? "#F7F3E9" : "rgba(247,243,233,.45)", cursor: "pointer", borderRadius: 4, padding: "5px 11px", fontSize: 11.5, fontFamily: V3_FONT_SANS, display: "flex", alignItems: "center", gap: 7, transition: "all .2s" }}
              >
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: L[lk] ? col : "rgba(247,243,233,.2)" }} />{label}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            <button onClick={() => patch({ mapZoom: !state.mapZoom })} style={{ border: "1px solid rgba(247,243,233,.25)", background: "transparent", color: "rgba(247,243,233,.8)", cursor: "pointer", borderRadius: 4, padding: "5px 12px", fontSize: 11.5, fontFamily: V3_FONT_SANS }}>
              {state.mapZoom ? "Vue nationale" : "Zoom sur " + state.sel}
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <svg viewBox={ATLAS_VIEWBOX} style={{ width: "100%", height: 560, display: "block" }}>
              <g transform={mapT} style={{ transition: "transform .65s cubic-bezier(.4,0,.2,1)" }}>
                <path d={geo.grat} fill="none" stroke="rgba(247,243,233,.06)" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                <path d={geo.others} fill="rgba(247,243,233,.04)" stroke="rgba(247,243,233,.13)" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
                <path d={geo.sen} fill="rgba(247,243,233,.09)" stroke="rgba(247,243,233,.42)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                {geo.rivers.map((d, i) => <path key={i} d={d} fill="none" stroke="rgba(159,185,206,.42)" strokeWidth={1} vectorEffect="non-scaling-stroke" />)}
                {atlasLinks.map((d, i) => <path key={i} d={d} fill="none" stroke="#DE9C74" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.75} vectorEffect="non-scaling-stroke" />)}
                {atlasDots.map((m) => (
                  <g key={m.name} transform={m.tr} onMouseEnter={() => patch({ mapHover: m.name })} onMouseLeave={() => patch({ mapHover: null })} onClick={() => patch({ sel: m.name, mapZoom: true })} style={{ cursor: "pointer", opacity: m.op, transition: "opacity .3s" }}>
                    <circle r={m.halo} fill={m.haloC} style={m.pulse ? { animation: "pv3-pulse 2.8s ease-out infinite", transformOrigin: "center" } : undefined} />
                    {m.ringOn && <circle r={m.ring} fill="none" stroke="#DE7A50" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />}
                    <circle r={m.r} fill={m.color} stroke="#0B1A2A" strokeWidth={0.7} vectorEffect="non-scaling-stroke" style={{ transition: "r .3s" }} />
                    {m.showBar && <rect x={m.bx} y={m.by} width={m.bw} height={m.bh} fill="#DE9C74" opacity={0.85} />}
                  </g>
                ))}
                {atlasDots.filter((m) => m.showLab).map((m) => (
                  <g key={"lab" + m.name} transform={m.tr}>
                    <text x={m.lx} y={m.ly} fontFamily={V3_FONT_SANS} fontSize={m.fs} fontWeight={m.fw} fill={m.labc} textAnchor="end" opacity={m.op}>{m.name}</text>
                  </g>
                ))}
                {zoneLabels.map((z) => (
                  <text key={z.name} x={z.x} y={z.y} fontFamily={V3_FONT_SANS} fontSize={z.fs} letterSpacing={2} fill="rgba(247,243,233,.3)" textAnchor="middle">{z.name}</text>
                ))}
                {nbLabels.map((n) => (
                  <text key={n.name} x={n.x} y={n.y} fontFamily={V3_FONT_SANS} fontSize={n.fs} letterSpacing={1.5} fill="rgba(247,243,233,.22)" textAnchor="middle">{n.name}</text>
                ))}
              </g>
            </svg>

            {mapTip && (
              <div style={{ position: "absolute", top: 16, left: 18, background: "rgba(11,26,42,.94)", border: "1px solid rgba(247,243,233,.2)", padding: "11px 14px", minWidth: 200, pointerEvents: "none" }} className="pv3-rise-fast">
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "#F7F3E9" }}>{mapTip.name}</div>
                <div style={{ fontSize: 11, color: "rgba(247,243,233,.6)", marginTop: 3 }}>{mapTip.meta}</div>
                <div style={{ display: "flex", gap: 14, marginTop: 9 }}>
                  {mapTip.stats.map((s, i) => (
                    <div key={i}>
                      <div style={{ fontFamily: V3_FONT_MONO, fontSize: 15, color: "#F7F3E9" }}>{s.v}</div>
                      <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".08em", color: "rgba(247,243,233,.5)", marginTop: 2 }}>{s.k}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ position: "absolute", bottom: 14, left: 18, display: "flex", gap: 16, alignItems: "center", fontSize: 11, color: "rgba(247,243,233,.55)", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E05A3C" }} />Critique</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#E0A455" }} />Vigilance</span>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9FB9CE" }} />Stable</span>
              <span style={{ width: 1, height: 12, background: "rgba(247,243,233,.2)" }} />
              <span>{layerNote}</span>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(247,243,233,.1)", padding: "14px 18px 18px" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 11, flexWrap: "wrap" }}>
              <div style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(247,243,233,.45)" }}>Bande littorale · {stripList.length} sites</div>
              <div style={{ fontSize: 11, color: "rgba(247,243,233,.4)" }}>Débarquements documentés sur la période — cliquez pour ouvrir un site</div>
            </div>
            <div style={{ display: "flex", gap: 1, overflowX: "auto" }}>
              {strip.map((s) => (
                <button
                  key={s.name}
                  onClick={() => patch({ sel: s.name, mapZoom: true })}
                  onMouseEnter={() => patch({ mapHover: s.name })}
                  onMouseLeave={() => patch({ mapHover: null })}
                  style={{ flex: "1 0 54px", minWidth: 54, border: 0, borderTop: `2px solid ${s.top}`, background: s.bg, cursor: "pointer", padding: "9px 6px 8px", textAlign: "left", transition: "background .2s" }}
                >
                  <div style={{ fontSize: 10, color: s.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: s.fw }}>{s.name}</div>
                  <svg viewBox="0 0 40 22" preserveAspectRatio="none" style={{ width: "100%", height: 22, marginTop: 6 }}>
                    <path d={s.spark} fill="none" stroke={s.sc} strokeWidth={1.4} />
                  </svg>
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: s.fg, marginTop: 3 }}>{s.n}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", borderLeft: "1px solid rgba(11,26,42,.12)", minHeight: 660, alignSelf: "stretch" }}>
          <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 26, lineHeight: 1.15 }}>{t.name}</div>
                <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.55)", marginTop: 5 }}>{t.meta}</div>
              </div>
              <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 7, border: `1px solid ${t.color}`, borderRadius: 999, padding: "4px 11px" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.color }} />
                <span style={{ fontSize: 11.5, fontWeight: 500, color: t.textColor }}>{t.level}</span>
              </div>
            </div>
            <p style={{ margin: "12px 0 0", fontSize: 12.5, lineHeight: 1.55, color: "rgba(11,26,42,.75)" }}>{t.reading}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "rgba(11,26,42,.1)", borderBottom: "1px solid rgba(11,26,42,.09)" }}>
            {t.tiles.map((x, i) => (
              <div key={i} style={{ background: "#FFFFFF", padding: "13px 12px" }}>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 21, lineHeight: 1 }}>{x.v}</div>
                <div style={{ fontSize: 9.5, letterSpacing: ".08em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginTop: 5, lineHeight: 1.3 }}>{x.k}</div>
                <div style={{ fontFamily: V3_FONT_MONO, fontSize: 10.5, color: x.dc, marginTop: 4 }}>{x.d}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(11,26,42,.12)", padding: "0 8px", flexWrap: "wrap" }}>
            {ATLAS_TABS.map(([k2, label]) => (
              <button key={k2} onClick={() => patch({ atlasTab: k2 })} style={{ border: 0, background: "transparent", cursor: "pointer", padding: "11px 11px 9px", fontSize: 12, fontFamily: V3_FONT_SANS, fontWeight: tab === k2 ? 600 : 400, color: tab === k2 ? "#0B1A2A" : "rgba(11,26,42,.55)", boxShadow: tab === k2 ? "inset 0 -2px 0 #B6522F" : "none", transition: "all .2s" }}>{label}</button>
            ))}
          </div>

          <div style={{ padding: "16px 20px 24px" }}>
            {tab === "act" && (
              <div className="pv3-rise-fast">
                {/* PD.1 — headline maritime activity */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", flex: 1 }}>Activité de débarquement</div>
                  <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11.5, color: "#B6522F" }}>
                    {landingView
                      ? `${landingView.activity.landingCount} débarquement${landingView.activity.landingCount > 1 ? "s" : ""} · ${formatKg(landingView.activity.totalLandedKg)}`
                      : "Aucune donnée de débarquement"}
                  </div>
                </div>

                {/* PD.1 — landing trend, sur les seules dates réellement disponibles */}
                {trendBars.length > 0 ? (
                  <>
                    <svg viewBox="0 0 360 110" style={{ width: "100%", height: 110, overflow: "visible" }}>
                      {trendBars.map((b, i) => (
                        <g key={i} onMouseEnter={() => patch({ actBar: i })} style={{ cursor: "pointer" }}>
                          <rect x={b.gx} y={0} width={b.gw} height={110} fill={b.hl} />
                          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.c} style={{ transition: "y .4s,height .4s" }} />
                        </g>
                      ))}
                      {trendBars.map((b, i) => (
                        <text key={"l" + i} x={b.cx} y={106} textAnchor="middle" fontFamily={V3_FONT_MONO} fontSize={8} fill="rgba(11,26,42,.4)">{b.lab}</text>
                      ))}
                    </svg>
                    <div style={{ fontFamily: V3_FONT_MONO, fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 2 }}>
                      {trend[trendHovered]?.dateLabel} · {trend[trendHovered]?.landingCount} débarquement{(trend[trendHovered]?.landingCount ?? 0) > 1 ? "s" : ""} · {formatKg(trend[trendHovered]?.landedKg ?? 0)}
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 14, background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)", fontSize: 11.5, color: "rgba(11,26,42,.6)" }}>
                    Aucun débarquement pesé ou arrivé n’a de date exploitable sur ce site à ce jour.
                  </div>
                )}

                {/* PD.1 — species composition */}
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginTop: 18, marginBottom: 8 }}>Composition par espèce</div>
                {landingView && landingView.activity.volumeBySpecies.length > 0 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {landingView.activity.volumeBySpecies.slice(0, 4).map((sp) => (
                      <div key={sp.speciesId} style={{ border: "1px solid rgba(11,26,42,.1)", padding: "10px 12px", background: "#F7F3E9" }}>
                        <div style={{ fontFamily: V3_FONT_MONO, fontSize: 16 }}>{formatKg(sp.landedKg)}</div>
                        <div style={{ fontSize: 10.5, color: "rgba(11,26,42,.6)", marginTop: 3, lineHeight: 1.35 }}>{sp.speciesName}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)" }}>Aucune espèce enregistrée sur ce site.</div>
                )}

                {/* PD.1 — site activity, avec contexte d'infrastructure (jamais causal) */}
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginTop: 18, marginBottom: 8 }}>Activité par site</div>
                {landingView && landingView.siteRows.length > 0 ? (
                  landingView.siteRows.map((site) => (
                    <div key={site.siteId} style={{ border: "1px solid rgba(11,26,42,.1)", padding: "12px 14px", marginBottom: 9 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                        <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{site.siteName}</div>
                        <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12.5 }}>{formatKg(site.landedKg)}</div>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 6 }}>
                        {site.landingCount} débarquement{site.landingCount > 1 ? "s" : ""}
                        {site.infrastructureNote ? ` · ${site.infrastructureNote}` : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)" }}>Aucun débarquement enregistré sur les sites de ce territoire.</div>
                )}

                {/* PD.1 — recent landings + landing detail (Coordination territoriale uniquement, §13 du mandat) */}
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(11,26,42,.5)", marginTop: 18, marginBottom: 8 }}>Débarquements récents</div>
                {openLanding && landingDepth === "detailed" && (
                  <LandingDetailPanel view={openLanding} onClose={() => patch({ atlasLandingOpen: null })} />
                )}
                {landingView && landingView.recent.length > 0 ? (
                  landingView.recent.map((row) => {
                    const clickable = landingDepth === "detailed";
                    return (
                      <div
                        key={row.id}
                        onClick={clickable ? () => patch({ atlasLandingOpen: row.id }) : undefined}
                        className={clickable ? "pv3-row-hover-04" : undefined}
                        style={{ border: "1px solid rgba(11,26,42,.1)", padding: "11px 14px", marginBottom: 8, cursor: clickable ? "pointer" : "default", transition: "background .2s" }}
                      >
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <div style={{ flex: 1, fontSize: 13, fontWeight: 500, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.vesselName}{row.registration ? ` · ${row.registration}` : ""}
                          </div>
                          <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12, flex: "none" }}>{row.weightLabel}</div>
                        </div>
                        <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 5 }}>
                          {row.siteName} · {row.dateLabel}
                          {row.dominantSpeciesName ? ` · ${row.dominantSpeciesName}` : ""} · {trustLabels[row.trust]}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: 16, background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)", fontSize: 12, lineHeight: 1.55, color: "rgba(11,26,42,.65)" }}>
                    Aucun débarquement enregistré sur ce territoire à ce jour.
                  </div>
                )}
              </div>
            )}

            {tab === "cap" && (
              <div className="pv3-rise-fast">
                {t.infra.map((i, idx) => (
                  <div key={idx} style={{ border: "1px solid rgba(11,26,42,.1)", padding: "13px 14px", marginBottom: 9 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <div style={{ flex: 1, fontSize: 13.5, fontWeight: 500 }}>{i.name}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 500, color: i.color }}>{i.state}</div>
                    </div>
                    <div style={{ height: 4, background: "rgba(11,26,42,.1)", margin: "10px 0 9px", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: i.pct, background: i.color, transition: "width .5s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)" }}>{i.src}</div>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: "12px 14px", background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)", fontSize: 11.5, lineHeight: 1.5, color: "rgba(11,26,42,.7)" }}>{t.capNote}</div>
              </div>
            )}

            {tab === "acteurs" && (
              <div className="pv3-rise-fast">
                {t.actors.map((a, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: "1px solid rgba(11,26,42,.07)" }}>
                    <div style={{ width: 34, height: 34, flex: "none", borderRadius: "50%", background: "rgba(11,26,42,.06)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: V3_FONT_MONO, fontSize: 12, color: "rgba(11,26,42,.65)" }}>{a.n}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{a.role}</div>
                      <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)", marginTop: 2 }}>{a.note}</div>
                    </div>
                    <div style={{ fontSize: 11, color: a.tc }}>{a.tg}</div>
                  </div>
                ))}
              </div>
            )}

            {tab === "sit" && (
              <div className="pv3-rise-fast">
                {t.sits.map((s, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${s.sevc}`, padding: "2px 0 2px 13px", marginBottom: 15 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4 }}>{s.title}</div>
                    <div style={{ display: "flex", gap: 9, alignItems: "center", marginTop: 6, fontSize: 11, color: "rgba(11,26,42,.55)" }}>
                      <span style={{ color: s.tc }}>{s.tg}</span><span>{s.meta}</span>
                    </div>
                  </div>
                ))}
                {t.noSit && (
                  <div style={{ padding: 16, background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)", fontSize: 12, lineHeight: 1.55, color: "rgba(11,26,42,.65)" }}>
                    Aucune situation ouverte sur ce site. Cela peut signifier une activité sans incident, ou une absence de remontée : aucun relais de quai n’y est mandaté.
                  </div>
                )}
              </div>
            )}

            {tab === "prog" && (
              <div className="pv3-rise-fast">
                {t.progs.map((p) => (
                  <button key={p.id} onClick={() => onOpenProgramme(p.id)} className="pv3-row-hover-05" style={{ display: "block", width: "100%", textAlign: "left", border: "1px solid rgba(11,26,42,.1)", background: "transparent", cursor: "pointer", padding: "12px 14px", marginBottom: 9 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 500, lineHeight: 1.35 }}>{p.title}</div>
                      <div style={{ fontFamily: V3_FONT_MONO, fontSize: 12 }}>{p.pct}</div>
                    </div>
                    <div style={{ height: 4, background: "rgba(11,26,42,.1)", margin: "9px 0 8px", position: "relative" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: p.pct, background: "#0B1A2A", transition: "width .5s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(11,26,42,.55)" }}>{p.meta}</div>
                  </button>
                ))}
                {t.noProg && (
                  <div style={{ padding: 16, background: "#F7F3E9", border: "1px solid rgba(11,26,42,.1)", fontSize: 12, lineHeight: 1.55, color: "rgba(11,26,42,.65)" }}>
                    Aucun programme n’intervient sur ce site. Les signaux qui en proviennent ne sont donc rattachés à aucune réponse cadrée.
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
