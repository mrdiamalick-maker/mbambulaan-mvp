"use client";

import { useCallback, useState } from "react";
import { DemoBanner } from "./components/DemoBanner";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Brief } from "./components/screens/Brief";
import { Atlas } from "./components/screens/Atlas";
import { Situations } from "./components/screens/Situations";
import { Portfolio } from "./components/screens/Portfolio";
import { ProgrammeDetail } from "./components/screens/ProgrammeDetail";
import { Resultats } from "./components/screens/Resultats";
import { Arbitrages } from "./components/screens/Arbitrages";
import { Flux } from "./components/screens/Flux";
import { Sources } from "./components/screens/Sources";
import { PERIOD } from "./data/period";
import { ROLES } from "./data/roles";
import { initialAppState } from "./state";
import type { PeriodKey, RoleKey, ScreenKey } from "./types";

// Racine du template privé V3 — un seul shell (sidebar + header + bandeau
// démo), un état applicatif plat, un écran affiché à la fois. Reproduit la
// mécanique du standalone : le rôle connecté change l'ordre des écrans
// disponibles (donc l'écran d'atterrissage) et la voix du Brief, sans
// jamais changer d'implémentation technique (§4/§17 du mandat).
export function PrivateV3App() {
  const [state, setState] = useState(initialAppState);
  const patch = useCallback((p: Partial<typeof initialAppState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const roleDef = ROLES[state.role];

  const navigate = useCallback((screen: ScreenKey) => {
    patch({ screen });
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch]);

  const onPeriod = useCallback((period: PeriodKey) => {
    patch({ period, sigBar: PERIOD[period].bars.length - 5 });
  }, [patch]);

  const onRole = useCallback((role: RoleKey) => {
    const stillValid = ROLES[role].main.includes(state.screen) || ROLES[role].sec.includes(state.screen);
    patch({ role, screen: stillValid ? state.screen : ROLES[role].main[0] });
  }, [patch, state.screen]);

  const onOpenSituation = useCallback((sitId: number) => {
    patch({ screen: "situations", sitOpen: sitId });
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch]);

  const onOpenProgramme = useCallback((progId: number) => {
    patch({ screen: "programmes", progOpen: progId, progView: "detail", progTab: "sante" });
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch]);

  return (
    <div className="pv3-root pv3-shell" style={{ display: "flex", minHeight: "100vh", fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
      <Sidebar roleDef={roleDef} screen={state.screen} role={state.role} onNavigate={navigate} />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Header period={state.period} role={state.role} periodRange={PERIOD[state.period].range} onPeriod={onPeriod} onRole={onRole} />
        <DemoBanner roleNote={roleDef.note} />

        {state.screen === "brief" && (
          <Brief state={state} patch={patch} roleDef={roleDef} onOpenSituation={onOpenSituation} onOpenProgramme={onOpenProgramme} />
        )}
        {state.screen === "atlas" && <Atlas state={state} patch={patch} onOpenProgramme={onOpenProgramme} />}
        {state.screen === "situations" && <Situations state={state} patch={patch} />}
        {state.screen === "programmes" && state.progView === "portfolio" && (
          <Portfolio state={state} patch={patch} onOpenProgramme={onOpenProgramme} />
        )}
        {state.screen === "programmes" && state.progView === "detail" && (
          <ProgrammeDetail state={state} patch={patch} onOpenSituation={onOpenSituation} onBack={() => patch({ progView: "portfolio" })} />
        )}
        {state.screen === "resultats" && <Resultats state={state} patch={patch} />}
        {state.screen === "arbitrages" && <Arbitrages state={state} patch={patch} />}
        {state.screen === "flux" && <Flux state={state} patch={patch} />}
        {state.screen === "sources" && <Sources />}
      </main>
    </div>
  );
}
