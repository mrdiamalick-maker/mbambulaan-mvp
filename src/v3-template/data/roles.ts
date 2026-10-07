// MODULES et ROLES — copiés depuis le standalone V3. C'est le cœur du §4/§17
// du mandat : chaque rôle change l'ordre de navigation (donc le premier
// écran affiché), le libellé du bandeau et la synthèse du Brief.
import type { RoleKey, ScreenKey } from "../types";

export interface ModuleDef {
  label: string;
  suffix?: Partial<Record<RoleKey, string>>;
  badge?: (role: RoleKey) => string;
}

export const MODULES: Record<ScreenKey, ModuleDef> = {
  brief: { label: "Brief national", suffix: { programme: "", coordination: "" } },
  atlas: { label: "Atlas territorial" },
  // territoires/opportunites (G2.1, mandat "Vision territoriale") —
  // nouvelle navigation primaire, badge réel (nombre d'opportunités de
  // programme réellement enregistrées), jamais une valeur fixe de gabarit.
  territoires: { label: "Territoires" },
  opportunites: { label: "Opportunités", badge: () => "" },
  situations: { label: "Situations", badge: () => "24" },
  arbitrages: { label: "Arbitrages", badge: (r) => (r === "ministre" ? "3" : "") },
  // programmes — ARCHITECTURE RECOVERY R1 : le renommage UX "Initiatives"
  // (G2.3) n'est plus validé ; le libellé visible revient à "Programmes".
  // Initiatives.tsx reste une capability expérimentale non exposée dans
  // le routing (cf. App.tsx), mais la navigation primaire pointe à nouveau
  // vers Portfolio/ProgrammeDetail.
  programmes: { label: "Programmes" },
  resultats: { label: "Résultats" },
  flux: { label: "Flux entrant", badge: (r) => (r === "ministre" ? "" : "11") },
  sources: { label: "Sources connectées" }
};

export interface RoleDef {
  main: ScreenKey[];
  sec: ScreenKey[];
  note: string;
  head: string;
  tldr: string;
}

// ARCHITECTURE RECOVERY R1 — la navigation unifiée G2.1/G2.3 (une même
// structure Brief · Territoires · Opportunités · Arbitrages · Initiatives ·
// Résultats pour les 3 rôles) n'était pas une évolution de l'architecture
// V5 par rôle mais un remplacement non arbitré. Restauration de la
// structure V5 différenciée par rôle (identique à main@8721017), avec un
// seul ajout validé : "opportunites" (nouvelle capability officielle,
// cf. mandat Recovery R1 §5). "territoires" ne revient pas en navigation
// primaire — Territoires.tsx reste accessible uniquement en drill-down
// depuis Atlas (cf. App.tsx, onOpenTerritoire).
export const ROLES: Record<RoleKey, RoleDef> = {
  ministre: {
    main: ["brief", "atlas", "opportunites", "situations", "arbitrages", "programmes", "resultats"],
    sec: ["flux", "sources"],
    note: "Supervision nationale · 7 modules, arbitrages activés",
    head: "La Petite-Côte concentre l’attention pour la troisième semaine",
    tldr:
      "Trois foyers actifs, une capacité froide indisponible depuis 48 h, trois décisions attendues avant vendredi. Deux programmes affichent un écart entre avancement déclaré et signaux reçus."
  },
  programme: {
    main: ["programmes", "opportunites", "resultats", "atlas", "situations", "brief"],
    sec: ["arbitrages", "flux", "sources"],
    note: "Direction de programme · portefeuille et exécution en premier",
    head: "Deux programmes sur neuf demandent une décision d’exécution",
    tldr:
      "Le portefeuille avance à 51 %. Le volet froid Petite-Côte est bloqué au financement et quatre signaux terrain contredisent le statut « en bonne voie » du référentiel pirogues."
  },
  coordination: {
    main: ["flux", "situations", "atlas", "opportunites", "programmes", "brief"],
    sec: ["arbitrages", "sources"],
    note: "Coordination territoriale · qualification et terrain en premier",
    head: "11 éléments reçus attendent une qualification",
    tldr:
      "Sept éléments sont qualifiables immédiatement, quatre demandent un recoupement terrain. Deux situations ouvertes n’ont pas de relais de quai mandaté pour confirmer."
  }
};

export function getRoleLandingScreen(role: RoleKey): ScreenKey {
  return ROLES[role].main[0];
}

export const SITUATION_PRIMARY_ACTIONS = {
  ministre: { label: "Décider", mode: "decision" },
  programme: { label: "Transmettre", mode: "transmit" },
  coordination: { label: "Instruire / Qualifier", mode: "qualify" }
} as const satisfies Record<RoleKey, { label: string; mode: "decision" | "transmit" | "qualify" }>;

export function getSituationPrimaryAction(role: RoleKey) {
  return SITUATION_PRIMARY_ACTIONS[role];
}

export const ARBITRAGE_PRIMARY_ACTIONS = {
  ministre: { label: "Valider / Décider", mode: "decision" },
  programme: { label: "Transmettre", mode: "transmit" },
  coordination: { label: "Instruire", mode: "instruct" }
} as const satisfies Record<RoleKey, { label: string; mode: "decision" | "transmit" | "instruct" }>;

export function getArbitragePrimaryAction(role: RoleKey) {
  return ARBITRAGE_PRIMARY_ACTIONS[role];
}

export const ROLE_CHIPS: Array<[RoleKey, string]> = [
  ["ministre", "Ministre"],
  ["programme", "Direction de programme"],
  ["coordination", "Coordination territoriale"]
];
