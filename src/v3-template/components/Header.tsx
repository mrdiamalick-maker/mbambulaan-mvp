"use client";

import { ROLE_CHIPS } from "../data/roles";
import type { AppState } from "../state";
import { V3_FONT_SANS } from "../theme";
import type { PeriodKey, RoleKey } from "../types";

const PERIOD_CHIPS: Array<[PeriodKey, string]> = [
  ["30j", "30 jours"],
  ["90j", "90 jours"],
  ["12m", "12 mois"]
];

function chipStyle(on: boolean): React.CSSProperties {
  return {
    border: 0, cursor: "pointer", padding: "7px 13px", fontSize: 11.5, fontWeight: 500,
    fontFamily: V3_FONT_SANS, background: on ? "#0B1A2A" : "transparent", color: on ? "#F7F3E9" : "rgba(11,26,42,.66)",
    transition: "background .2s", whiteSpace: "nowrap"
  };
}

export function Header({
  period, role, periodRange, onPeriod, onRole
}: {
  period: AppState["period"];
  role: AppState["role"];
  periodRange: string;
  onPeriod: (p: PeriodKey) => void;
  onRole: (r: RoleKey) => void;
}) {
  return (
    <header
      style={{
        height: 60, flex: "none", borderBottom: "1px solid rgba(11,26,42,.12)", display: "flex",
        alignItems: "center", gap: 18, padding: "0 30px", position: "sticky", top: 0, zIndex: 40,
        backgroundColor: "#FFFFFF", overflowX: "auto"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9, flex: "none", width: 250, border: "1px solid rgba(11,26,42,.16)", borderRadius: 4, background: "#F7F3E9", padding: "7px 10px", overflow: "hidden" }}>
        <span style={{ width: 9, height: 9, border: "1.5px solid rgba(11,26,42,.4)", borderRadius: "50%", flex: "none" }} />
        <span style={{ fontSize: 12, color: "rgba(11,26,42,.5)", whiteSpace: "nowrap" }}>Territoire, situation, programme…</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid rgba(11,26,42,.16)", borderRadius: 4, overflow: "hidden", flex: "none" }}>
        {PERIOD_CHIPS.map(([k, label]) => (
          <button key={k} onClick={() => onPeriod(k)} style={chipStyle(period === k)}>{label}</button>
        ))}
      </div>
      <div style={{ fontSize: 11.5, color: "rgba(11,26,42,.5)", whiteSpace: "nowrap" }}>{periodRange}</div>

      <div style={{ flex: 1 }} />

      <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "none" }}>
        <span style={{ fontSize: 10, letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(11,26,42,.42)", whiteSpace: "nowrap" }}>Rôle connecté</span>
        <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(11,26,42,.16)", borderRadius: 4, overflow: "hidden" }}>
          {ROLE_CHIPS.map(([k, label]) => (
            <button key={k} onClick={() => onRole(k)} style={chipStyle(role === k)}>{label}</button>
          ))}
        </div>
      </div>
    </header>
  );
}
