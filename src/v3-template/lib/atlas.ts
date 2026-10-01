// Portage direct de tseries()/terrData() du standalone — calculs dérivés
// pour le panneau territoire de l'Atlas (série d'activité pseudo-aléatoire
// mais déterministe par territoire, état des capacités, acteurs, situations
// et programmes rattachés).
import { PROGS } from "../data/programmes";
import { SITS } from "../data/situations";
import { LVD, LVL, LVT } from "../theme";
import { READING, TD, TERR } from "../data/territories";
import type { PeriodKey } from "../types";

export function tseries(name: string, per: PeriodKey): number[] {
  const base = TD[name][0];
  let s = 0;
  for (let i = 0; i < name.length; i++) s += name.charCodeAt(i);
  const n = per === "30j" ? 5 : 12;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const w = Math.sin((s + i * 37) % 11) * 0.22 + Math.cos((s + i * 17) % 7) * 0.14;
    out.push(Math.max(2, Math.round((base / (per === "12m" ? 1 : 4)) * (1 + w))));
  }
  return out;
}

export interface TerrDataView {
  name: string;
  level: string;
  color: string;
  textColor: string;
  meta: string;
  reading: string;
  tiles: Array<{ v: string | number; k: string; d: string; dc: string }>;
  actBars: Array<{ x: number; w: number; y: number; h: number; gx: number; gw: number; cx: number; hl: string; c: string; lab: string }>;
  actRead: string;
  actFacts: Array<{ v: string | number; k: string }>;
  actNote: string;
  infra: Array<{ name: string; state: string; color: string; pct: string; src: string }>;
  capNote: string;
  actors: Array<{ n: number; role: string; note: string; tg: string; tc: string }>;
  sits: Array<{ title: string; sevc: string; tg: string; tc: string; meta: string }>;
  noSit: boolean;
  progs: Array<{ id: number; title: string; pct: string; meta: string }>;
  noProg: boolean;
}

export function terrData(name: string, per: PeriodKey, actBarHover: number | null): TerrDataView {
  const row = TERR.find((t) => t[0] === name) ?? TERR[10];
  const [nm, region, lat, lon, level] = row;
  const d = TD[name];
  const dms = (v: number, p: string, n: string) => Math.floor(Math.abs(v)) + "°" + String(Math.round((Math.abs(v) % 1) * 60)).padStart(2, "0") + "′" + (v >= 0 ? p : n);
  const series = tseries(name, per);
  const labs = per === "12m" ? ["O", "N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S"] : per === "30j" ? ["S32", "S33", "S34", "S35", "S36"] : ["S25", "S26", "S27", "S28", "S29", "S30", "S31", "S32", "S33", "S34", "S35", "S36"];
  const mx = Math.max(...series), bw = 360 / series.length;
  const hovered = actBarHover == null ? series.length - 1 : actBarHover;
  const actBars = series.map((v, i) => ({
    x: i * bw + bw * 0.22, w: bw * 0.56, y: 92 - (v / mx) * 88, h: (v / mx) * 88,
    gx: i * bw, gw: bw, cx: i * bw + bw / 2,
    hl: hovered === i ? "rgba(182,82,47,.07)" : "transparent",
    c: hovered === i ? "#B6522F" : "rgba(11,26,42,.55)", lab: labs[i] ?? ""
  }));
  const sits = SITS.filter((s) => s.terr === name);
  const progs = PROGS.filter((p) => p.terrs.includes(name));
  const infra: TerrDataView["infra"] = [];
  for (let i = 0; i < d[2]; i++) {
    const frag = i < d[3];
    infra.push({
      name: "Chambre froide " + (i + 1) + (d[2] > 1 ? " · " + ["quai", "coopérative", "privée"][i] : ""),
      state: frag ? "Fragile" : "Opérationnelle", color: frag ? "#B6522F" : "#4E7B5A", pct: frag ? "38%" : "92%",
      src: frag ? "Déclarée par le gestionnaire · confirmée au quai" : "Observée au poste de quai · 2 sept."
    });
  }
  if (d[2] === 0) infra.push({ name: "Aucune capacité froide recensée", state: "Absente", color: "#C8452B", pct: "4%", src: "Absence confirmée lors du diagnostic territorial" });
  infra.push({ name: "Balance de quai", state: d[6] ? "Opérationnelle" : "Non recensée", color: d[6] ? "#4E7B5A" : "rgba(11,26,42,.45)", pct: d[6] ? "88%" : "10%", src: d[6] ? "Observée au poste de quai" : "Aucun relevé disponible sur ce site" });
  infra.push({ name: "Transport et regroupement", state: "Déclaré opérationnel", color: "#4E7B5A", pct: "74%", src: "Déclaré par les prestataires · non vérifié" });

  const actors = [
    { n: Math.round(d[1] * 0.42), role: "Mareyeurs", note: "Organisations enregistrées sur le site", tg: "◐", tc: "#B6522F" },
    { n: Math.round(d[1] * 0.24), role: "Transformatrices", note: "Groupements déclarés", tg: "○", tc: "rgba(11,26,42,.6)" },
    { n: Math.round(d[1] * 0.2), role: "Capitaines de pirogue", note: "Rattachés à une organisation connue", tg: "◐", tc: "#B6522F" },
    { n: Math.max(1, Math.round(d[1] * 0.08)), role: "Gestionnaires de capacité", note: "Froid, pesée, regroupement", tg: "●", tc: "#4E7B5A" },
    { n: d[6] ? 1 : 0, role: d[6] ? "Relais de quai mandaté" : "Aucun relais mandaté", note: d[6] ? "Confirme les signaux reçus sur le site" : "Les signaux du site restent déclaratifs", tg: d[6] ? "●" : "○", tc: d[6] ? "#4E7B5A" : "#C8452B" }
  ];

  return {
    name: nm, level: LVL[level], color: LVD[level], textColor: LVT[level],
    meta: `${region} · ${row[6]} · ${dms(lat, "N", "S")} ${dms(lon, "E", "O")}`,
    reading: READING[level],
    tiles: [
      { v: d[0], k: "Débarquements 30 j", d: series[series.length - 1] >= series[series.length - 2] ? "↑" : "↓", dc: "#B6522F" },
      { v: d[1], k: "Acteurs actifs", d: "+2", dc: "#4E7B5A" },
      { v: d[2] - d[3] + "/" + d[2], k: "Capacités froides OK", d: d[3] ? d[3] + " fragile" : "stable", dc: d[3] ? "#B6522F" : "#4E7B5A" },
      { v: row[5], k: "Situations ouvertes", d: sits.length ? "suivies" : "—", dc: "rgba(11,26,42,.45)" }
    ],
    actBars,
    actRead: `${labs[hovered] ?? ""} · ${series[hovered]} débarquements`,
    actFacts: [
      { v: d[5], k: "Retours de pirogue documentés sur la période" },
      { v: d[6] ? "44 min" : "74 min", k: "Délai médian de qualification d’un signal" },
      { v: d[4], k: "Signaux reçus sur la période" },
      { v: d[6] ? "1" : "0", k: "Relais de quai mandaté sur le site" }
    ],
    actNote: d[6]
      ? "Les volumes sont relevés par le relais de quai mandaté : la série est observée, non déclarée."
      : "Aucun relais n’est mandaté ici : les volumes sont estimés à partir des déclarations d’acteurs et doivent être lus comme un ordre de grandeur.",
    infra,
    capNote: d[3]
      ? "Une capacité déclarée fragile n’est pas une capacité hors service. Mbàmbulaan conserve la distinction : la fragilité est déclarée par le gestionnaire, l’indisponibilité est confirmée au quai."
      : "Toutes les capacités connues du site sont opérationnelles à ce jour. L’inventaire lui-même reste partiel : il repose sur le diagnostic territorial de juin.",
    actors,
    sits: sits.map((s) => ({ title: s.title, sevc: s.sevc, tg: s.tg, tc: s.tc, meta: `${s.trust} · ${s.since}` })),
    noSit: sits.length === 0,
    progs: progs.map((p) => ({ id: p.id, title: p.title, pct: p.progress + "%", meta: `${p.phase} · ${p.lead}` })),
    noProg: progs.length === 0
  };
}
