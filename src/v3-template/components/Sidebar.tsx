"use client";

import { useEffect, useState } from "react";
import { MODULES, ROLE_CHIPS } from "../data/roles";
import type { RoleDef } from "../data/roles";
import type { AppState } from "../state";
import { V3_FONT_MONO, V3_FONT_SANS } from "../theme";
import type { RoleKey, ScreenKey } from "../types";

const PRIMARY_SCREENS: ScreenKey[] = ["brief", "territoires", "opportunites", "arbitrages", "resultats"];
const WORK_SCREENS: ScreenKey[] = ["atlas", "programmes", "situations", "flux", "sources"];

const LABELS: Partial<Record<ScreenKey, string>> = {
  brief: "Brief",
  atlas: "Atlas · jumeau maritime",
  flux: "Flux entrants"
};

interface SidebarProps {
  roleDef: RoleDef;
  screen: AppState["screen"];
  role: AppState["role"];
  onNavigate: (screen: ScreenKey) => void;
  onRole: (role: RoleKey) => void;
  badgeOverrides?: Partial<Record<ScreenKey, string>>;
}

interface NavigationProps extends SidebarProps {
  selectId: string;
}

function Brand() {
  return (
    <div className="pv3-brand">
      <svg viewBox="0 0 28 28" aria-hidden="true">
        <path d="M2 11 Q7 5 14 11 T26 11" fill="none" stroke="#B6522F" strokeWidth={2.1} strokeLinecap="round" />
        <path d="M2 18 Q7 12 14 18 T26 18" fill="none" stroke="#F7F3E9" strokeWidth={2.1} strokeLinecap="round" opacity={0.85} />
      </svg>
      <div>
        <div className="pv3-brand-name">Mbàmbulaan</div>
        <div className="pv3-brand-subtitle">Espace État · accès réservé</div>
      </div>
    </div>
  );
}

function Navigation({
  screen,
  role,
  roleDef,
  onNavigate,
  onRole,
  badgeOverrides,
  selectId
}: NavigationProps) {
  const items = (screens: ScreenKey[]) =>
    screens.map((key) => ({
      key,
      label: LABELS[key] ?? MODULES[key].label,
      badge: badgeOverrides?.[key] ?? (MODULES[key].badge ? MODULES[key].badge(role) : ""),
      active: screen === key
    }));

  const nav = (screens: ScreenKey[]) =>
    items(screens).map((item) => (
      <button
        type="button"
        key={item.key}
        onClick={() => onNavigate(item.key)}
        aria-current={item.active ? "page" : undefined}
        className={`pv3-nav-item${item.active ? " is-active" : ""}`}
      >
        <span className="pv3-nav-dot" aria-hidden="true" />
        <span>{item.label}</span>
        {item.badge && <span className="pv3-nav-badge" style={{ fontFamily: V3_FONT_MONO }}>{item.badge}</span>}
      </button>
    ));

  return (
    <>
      <nav aria-label="Navigation principale" className="pv3-sidebar-nav">
        {nav(PRIMARY_SCREENS)}
      </nav>

      <div className="pv3-nav-separator" />
      <div className="pv3-nav-kicker">Vues de travail</div>
      <nav aria-label="Vues de travail" className="pv3-sidebar-nav pv3-sidebar-nav-secondary">
        {nav(WORK_SCREENS)}
      </nav>

      <div className="pv3-sidebar-footer">
        <label className="pv3-role-label" htmlFor={selectId}>Perspective institutionnelle</label>
        <select
          id={selectId}
          value={role}
          onChange={(event) => onRole(event.target.value as RoleKey)}
          className="pv3-role-select"
        >
          {ROLE_CHIPS.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
        </select>
        <div className="pv3-role-note">{roleDef.note}</div>

        <div className="pv3-knowledge-title">Niveau de connaissance</div>
        <div className="pv3-knowledge-list">
          <span><b>○</b> Déclarée — non recoupée</span>
          <span><b className="is-observed">◐</b> Observée — relevée sur site</span>
          <span><b className="is-verified">●</b> Vérifiée — confirmée</span>
        </div>
      </div>
    </>
  );
}

export function Sidebar(props: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (!mobileOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileOpen]);
  const navigate = (screen: ScreenKey) => {
    props.onNavigate(screen);
    setMobileOpen(false);
  };
  const chooseRole = (role: RoleKey) => {
    props.onRole(role);
    setMobileOpen(false);
  };
  const contentProps = { ...props, onNavigate: navigate, onRole: chooseRole };

  return (
    <>
      <aside className="pv3-sidebar pv3-sidebar-desktop" style={{ fontFamily: V3_FONT_SANS }}>
        <Brand />
        <Navigation {...contentProps} selectId="pv3-role-desktop" />
      </aside>

      <div className="pv3-mobilebar" style={{ fontFamily: V3_FONT_SANS }}>
        <Brand />
        <button
          type="button"
          className="pv3-menu-button"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? "×" : "Menu"}
        </button>
      </div>

      {mobileOpen && (
        <div className="pv3-drawer-layer">
          <button type="button" className="pv3-drawer-backdrop" aria-label="Fermer le menu" onClick={() => setMobileOpen(false)} />
          <aside className="pv3-sidebar pv3-sidebar-drawer" aria-label="Menu mobile" style={{ fontFamily: V3_FONT_SANS }}>
            <Brand />
            <Navigation {...contentProps} selectId="pv3-role-mobile" />
          </aside>
        </div>
      )}
    </>
  );
}
