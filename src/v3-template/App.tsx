"use client";

import { useCallback, useState } from "react";
import { DemoBanner } from "./components/DemoBanner";
import { DocumentView } from "./components/DocumentView";
import { PresentationView } from "./components/PresentationView";
import { OpportunityPanel } from "./components/OpportunityPanel";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Brief } from "./components/screens/Brief";
import { Atlas } from "./components/screens/Atlas";
import { Territoires } from "./components/screens/Territoires";
import { Opportunites } from "./components/screens/Opportunites";
import { Situations } from "./components/screens/Situations";
import { Portfolio } from "./components/screens/Portfolio";
import { ProgrammeDetail } from "./components/screens/ProgrammeDetail";
import { Resultats } from "./components/screens/Resultats";
import { Arbitrages } from "./components/screens/Arbitrages";
import { Flux } from "./components/screens/Flux";
import { Sources } from "./components/screens/Sources";
import { PERIOD } from "./data/period";
import { getRoleLandingScreen, ROLES } from "./data/roles";
import { initialAppState } from "./state";
import { V3_FONT_SANS } from "./theme";
import { useDomainRuntime } from "./lib/domain-runtime";
import { TERRITORY_ID_BY_NAME } from "./lib/landing-bridge";
import { getArbitrageItems } from "./lib/arbitrages-bridge";
import { buildSituationHeaderStats } from "./lib/situations-bridge";
import { buildFluxStages } from "./lib/flux-bridge";
import type { PeriodKey, RoleKey, ScreenKey } from "./types";

// ARCHITECTURE RECOVERY R1 — Initiatives.tsx (G2.3) reste une capability
// expérimentale non exposée : son code n'est pas supprimé, mais
// "programmes" ne la route plus (restauration de Portfolio/ProgrammeDetail
// ci-dessous, cf. mandat §4).

// G2.1 — écrans avec leur propre bandeau (fil d'ariane + actions),
// distinct du Header rôle/période des écrans V5 conservés (mandat :
// reproduire exactement le HTML, ne pas réutiliser un en-tête qui n'y
// figure pas).
const G2_OWN_HEADER_SCREENS: ScreenKey[] = ["territoires", "opportunites"];

// Racine du template privé V3 — un seul shell (sidebar + header + bandeau
// démo), un état applicatif plat, un écran affiché à la fois. Reproduit la
// mécanique du standalone : le rôle connecté change l'ordre des écrans
// disponibles (donc l'écran d'atterrissage) et la voix du Brief, sans
// jamais changer d'implémentation technique (§4/§17 du mandat).
export function PrivateV3App({ initialScreen = initialAppState.screen }: { initialScreen?: ScreenKey }) {
  const [state, setState] = useState(() => ({ ...initialAppState, screen: initialScreen }));
  const patch = useCallback((p: Partial<typeof initialAppState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const roleDef = ROLES[state.role];

  const syncScreenUrl = useCallback((screen: ScreenKey) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (screen === initialAppState.screen) url.searchParams.delete("ecran");
    else url.searchParams.set("ecran", screen);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const navigate = useCallback((screen: ScreenKey) => {
    patch({ screen });
    syncScreenUrl(screen);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch, syncScreenUrl]);

  const onPeriod = useCallback((period: PeriodKey) => {
    patch({ period, sigBar: PERIOD[period].bars.length - 5 });
  }, [patch]);

  const onRole = useCallback((role: RoleKey) => {
    const screen = getRoleLandingScreen(role);
    patch({ role, screen });
    syncScreenUrl(screen);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch, syncScreenUrl]);

  const onOpenSituation = useCallback((sitId: number) => {
    patch({ screen: "situations", sitOpen: sitId });
    syncScreenUrl("situations");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch, syncScreenUrl]);

  const onOpenProgramme = useCallback((progId: number) => {
    patch({ screen: "programmes", progOpen: progId, progView: "detail", progTab: "sante" });
    syncScreenUrl("programmes");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch, syncScreenUrl]);

  // onOpenTerritoire (ARCHITECTURE RECOVERY R1 §3) — drill-down depuis
  // Atlas vers la fiche territoire G2 : réutilise le même écran/état que
  // Territoires.tsx (terrView/terrSel), jamais une copie de la fiche dans
  // Atlas.tsx. TERRITORY_ID_BY_NAME résout le nom éditorial affiché par
  // Atlas (data/territories.ts) vers l'identifiant réel de territoire.
  const onOpenTerritoire = useCallback((territoryName: string) => {
    const territoryId = TERRITORY_ID_BY_NAME[territoryName] ?? territoryName;
    patch({ screen: "territoires", terrView: "detail", terrSel: territoryId, terrFromAtlas: true });
    syncScreenUrl("territoires");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch, syncScreenUrl]);

  // onReturnToAtlas — symétrique d'onOpenTerritoire : repasse par
  // syncScreenUrl (comme toute navigation inter-écrans ici) pour que
  // l'URL ?ecran= reflète l'écran réellement affiché, jamais seulement
  // l'état interne.
  const onReturnToAtlas = useCallback(() => {
    patch({ screen: "atlas", terrFromAtlas: false });
    syncScreenUrl("atlas");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [patch, syncScreenUrl]);

  const hasOwnHeader = G2_OWN_HEADER_SCREENS.includes(state.screen);
  const runtime = useDomainRuntime();
  const opportunityBadge = runtime.state ? String(runtime.state.programOpportunities.length) : "";
  // arbitragesBadge/situationsBadge/fluxBadge (RC1, audit de fonctionnalité,
  // §5 "Cohérence nationale") — MODULES[k].badge (data/roles.ts) portait
  // jusqu'ici des valeurs figées ("3"/"24"/"11") devenues fausses face au
  // Demo World réel (vérifié : 2 arbitrages réellement en attente, 25
  // situations réellement ouvertes, 4 éléments de flux réellement à
  // qualifier). Même mécanisme que badgeOverrides.opportunites ci-dessous
  // (déjà réel depuis G2.1), même conditionnalité par rôle que les
  // fixtures qu'ils remplacent (arbitrages affiché seulement pour
  // "ministre", flux seulement pour les autres rôles).
  const arbitragesBadge = runtime.state && state.role === "ministre" ? String(getArbitrageItems(runtime.state).length) : "";
  const situationsBadge = runtime.state ? String(buildSituationHeaderStats(runtime.state).openCount) : "";
  const fluxBadge = runtime.state && state.role !== "ministre" ? String(buildFluxStages(runtime.state).find((s) => s.key === "a_qualifier")?.count ?? 0) : "";

  return (
    <div className="pv3-root pv3-shell" style={{ display: "flex", minHeight: "100vh", fontFamily: V3_FONT_SANS }}>
      <Sidebar
        roleDef={roleDef}
        screen={state.screen}
        role={state.role}
        onNavigate={navigate}
        badgeOverrides={{ opportunites: opportunityBadge, arbitrages: arbitragesBadge, situations: situationsBadge, flux: fluxBadge }}
      />
      <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {!hasOwnHeader && (
          <>
            <Header period={state.period} role={state.role} periodRange={PERIOD[state.period].range} onPeriod={onPeriod} onRole={onRole} />
            <DemoBanner roleNote={roleDef.note} />
          </>
        )}

        {state.screen === "brief" && (
          <Brief state={state} patch={patch} onOpenSituation={onOpenSituation} onOpenProgramme={onOpenProgramme} />
        )}
        {state.screen === "atlas" && <Atlas state={state} patch={patch} onOpenProgramme={onOpenProgramme} onOpenTerritoire={onOpenTerritoire} />}
        {state.screen === "territoires" && <Territoires state={state} patch={patch} onReturnToAtlas={onReturnToAtlas} />}
        {state.screen === "opportunites" && <Opportunites state={state} patch={patch} />}
        {state.screen === "situations" && <Situations state={state} patch={patch} onOpenFlux={() => navigate("flux")} />}
        {/* ARCHITECTURE RECOVERY R1 §4 — retour à la restitution V5 :
            Portfolio (liste) / ProgrammeDetail (détail), pilotés par
            progView/progOpen (même convention que terrView/terrSel). Le
            renommage "Initiatives" (G2.3) n'était pas validé ; Initiatives.tsx
            reste intact sur disque mais n'est plus routé ici. */}
        {state.screen === "programmes" && state.progView === "portfolio" && (
          <Portfolio state={state} patch={patch} onOpenProgramme={onOpenProgramme} />
        )}
        {state.screen === "programmes" && state.progView === "detail" && (
          <ProgrammeDetail state={state} patch={patch} onOpenSituation={onOpenSituation} onBack={() => patch({ progView: "portfolio" })} />
        )}
        {state.screen === "resultats" && <Resultats state={state} patch={patch} />}
        {state.screen === "arbitrages" && <Arbitrages state={state} patch={patch} />}
        {state.screen === "flux" && <Flux state={state} patch={patch} />}
        {state.screen === "sources" && <Sources state={state} patch={patch} />}
      </main>
      {state.docOpen && <DocumentView request={state.docOpen} onClose={() => patch({ docOpen: null })} />}
      {state.presentOpen && <PresentationView onClose={() => patch({ presentOpen: false })} />}
      {state.oppOpen && <OpportunityPanel oppId={state.oppOpen} patch={patch} onClose={() => patch({ oppOpen: null })} />}
    </div>
  );
}
