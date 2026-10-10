"use client";

import { MODULES } from "../data/roles";
import type { AppState } from "../state";
import { V3_FONT_SANS } from "../theme";
import type { PeriodKey } from "../types";

const PERIOD_CHIPS: Array<[PeriodKey, string]> = [
  ["30j", "30 jours"],
  ["90j", "90 jours"],
  ["12m", "12 mois"]
];

export function Header({
  screen,
  period,
  periodRange,
  onPeriod,
  onPresent
}: {
  screen: AppState["screen"];
  period: AppState["period"];
  periodRange: string;
  onPeriod: (period: PeriodKey) => void;
  onPresent: () => void;
}) {
  return (
    <header className="pv3-workspace-header" style={{ fontFamily: V3_FONT_SANS }}>
      <div className="pv3-header-breadcrumb">
        <span>Espace État</span>
        <span aria-hidden="true">›</span>
        <strong>{MODULES[screen].label}</strong>
      </div>

      <div className="pv3-header-tools">
        <div role="group" aria-label="Période d’analyse" className="pv3-period-group">
          {PERIOD_CHIPS.map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => onPeriod(key)}
              aria-pressed={period === key}
              className={period === key ? "is-active" : undefined}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="pv3-period-range">{periodRange}</span>
        <button type="button" className="pv3-outline-action" onClick={onPresent}>Présentation</button>
      </div>
    </header>
  );
}
