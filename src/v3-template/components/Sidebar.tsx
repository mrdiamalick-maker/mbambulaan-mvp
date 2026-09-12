"use client";

import { MODULES } from "../data/roles";
import type { AppState } from "../state";
import { V3_FONT_MONO, V3_FONT_SANS, V3_FONT_SERIF } from "../theme";
import type { RoleDef } from "../data/roles";
import type { ScreenKey } from "../types";

export function Sidebar({
  roleDef,
  screen,
  role,
  onNavigate
}: {
  roleDef: RoleDef;
  screen: AppState["screen"];
  role: AppState["role"];
  onNavigate: (s: ScreenKey) => void;
}) {
  const navMain = roleDef.main.map((k) => ({
    key: k,
    label: MODULES[k].label + (MODULES[k].suffix?.[role] ?? ""),
    badge: MODULES[k].badge ? MODULES[k].badge(role) : "",
    active: screen === k
  }));
  const navSec = roleDef.sec.map((k) => ({
    key: k,
    label: MODULES[k].label,
    badge: MODULES[k].badge ? MODULES[k].badge(role) : "",
    active: screen === k
  }));

  return (
    <aside
      className="pv3-sidebar"
      style={{
        width: 246, flex: "none", background: "#0B1A2A", color: "#F7F3E9",
        display: "flex", flexDirection: "column", position: "sticky", top: 0,
        alignSelf: "flex-start", height: "100vh", overflowY: "auto"
      }}
    >
      <div style={{ padding: "24px 22px 18px", display: "flex", gap: 11, alignItems: "center" }}>
        <svg viewBox="0 0 28 28" style={{ width: 25, height: 25, flex: "none" }}>
          <path d="M2 11 Q7 5 14 11 T26 11" fill="none" stroke="#B6522F" strokeWidth={2.1} strokeLinecap="round" />
          <path d="M2 18 Q7 12 14 18 T26 18" fill="none" stroke="#F7F3E9" strokeWidth={2.1} strokeLinecap="round" opacity={0.85} />
        </svg>
        <div>
          <div style={{ fontFamily: V3_FONT_SERIF, fontSize: 19.5, lineHeight: 1 }}>Mbàmbulaan</div>
          <div style={{ fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,243,233,.5)", marginTop: 4 }}>
            Environnement opérationnel
          </div>
        </div>
      </div>

      <nav className="pv3-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 1, padding: "4px 10px" }}>
        {navMain.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={item.active ? undefined : "pv3-nav-idle"}
            style={
              item.active
                ? {
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    border: 0, cursor: "pointer", padding: "10px 12px", borderRadius: 5,
                    background: "rgba(182,82,47,.22)", color: "#F7F3E9", fontFamily: V3_FONT_SANS,
                    fontSize: 13, fontWeight: 600, boxShadow: "inset 2px 0 0 #B6522F"
                  }
                : {
                    display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                    border: 0, cursor: "pointer", padding: "10px 12px", borderRadius: 5,
                    background: "transparent", color: "rgba(247,243,233,.7)", fontFamily: V3_FONT_SANS,
                    fontSize: 13, fontWeight: 500, transition: "background .18s"
                  }
            }
          >
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.active ? "#DE7A50" : "rgba(247,243,233,.26)", flex: "none" }} />
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ fontFamily: V3_FONT_MONO, fontSize: 10.5, background: item.active ? "#B6522F" : "rgba(247,243,233,.14)", color: item.active ? "#F7F3E9" : "rgba(247,243,233,.8)", borderRadius: 9, padding: "1px 6px" }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ margin: "14px 22px 10px", height: 1, background: "rgba(247,243,233,.12)" }} />
      <nav className="pv3-sidebar-nav" style={{ display: "flex", flexDirection: "column", gap: 1, padding: "0 10px" }}>
        {navSec.map((item) => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className="pv3-nav-sec"
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
              border: 0, cursor: "pointer", padding: "9px 12px", borderRadius: 5,
              background: item.active ? "rgba(247,243,233,.1)" : "transparent",
              color: "rgba(247,243,233,.62)", fontSize: 12.5, fontWeight: 500
            }}
          >
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && (
              <span style={{ fontFamily: V3_FONT_MONO, fontSize: 10.5, background: "rgba(247,243,233,.14)", color: "rgba(247,243,233,.8)", borderRadius: 9, padding: "1px 6px" }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "18px 22px", borderTop: "1px solid rgba(247,243,233,.12)" }}>
        <div style={{ fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,243,233,.5)", marginBottom: 10 }}>
          Niveau de connaissance
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 11.5, color: "rgba(247,243,233,.78)" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}><span style={{ color: "#F7F3E9", fontSize: 13 }}>○</span>Déclarée — non recoupée</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}><span style={{ color: "#E6A27A", fontSize: 13 }}>◐</span>Observée — relevée sur site</div>
          <div style={{ display: "flex", gap: 9, alignItems: "center" }}><span style={{ color: "#8FCB9B", fontSize: 13 }}>●</span>Vérifiée — confirmée</div>
        </div>
      </div>
    </aside>
  );
}
