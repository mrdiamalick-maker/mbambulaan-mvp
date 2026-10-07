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
  // programmes (G2.3, mandat "Initiatives & continuité du cycle") —
  // renommage UX uniquement : "Programmes" devient "Initiatives" dans la
  // navigation. La clé d'écran technique reste "programmes" (jamais
  // renommée dans ce lot, pour ne pas risquer un refactor de type
  // domaine) ; seul le libellé visible change.
  programmes: { label: "Initiatives" },
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

// G2.1 (mandat "Vision territoriale") — navigation primaire désormais
// identique pour les 3 rôles : Brief · Territoires · Opportunités ·
// Arbitrages · Résultats, puis « Vues de travail » (Situations, Flux
// entrants, Sources connectées). Le HTML source de vérité ne montre
// aucun sélecteur de rôle ni de variante de navigation par rôle — une
// seule structure, reproduite à l'identique pour les 3. Changement de
// comportement assumé et documenté (rapport G2.1) : "programme" atterrit
// désormais sur Brief au lieu de Programmes, "coordination" sur Brief au
// lieu de Flux entrant. atlas/programmes restent des écrans valides
// (aucune capability supprimée, cf. onOpenProgramme) mais ne sont plus
// des entrées de navigation primaire — le HTML ne les mentionne pas.
// G2.3 — "programmes" (libellé visible "Initiatives", cf. MODULES
// ci-dessus) rejoint la navigation primaire entre Arbitrages et Résultats :
// Brief · Territoires · Opportunités · Arbitrages · Initiatives · Résultats.
const G2_MAIN: ScreenKey[] = ["brief", "territoires", "opportunites", "arbitrages", "programmes", "resultats"];
const G2_SEC: ScreenKey[] = ["situations", "flux", "sources"];

export const ROLES: Record<RoleKey, RoleDef> = {
  ministre: {
    main: G2_MAIN,
    sec: G2_SEC,
    note: "Supervision nationale · 6 modules, arbitrages activés",
    head: "La Petite-Côte concentre l’attention pour la troisième semaine",
    tldr:
      "Trois foyers actifs, une capacité froide indisponible depuis 48 h, trois décisions attendues avant vendredi. Deux programmes affichent un écart entre avancement déclaré et signaux reçus."
  },
  programme: {
    main: G2_MAIN,
    sec: G2_SEC,
    note: "Direction de programme · portefeuille et exécution en premier",
    head: "Deux programmes sur neuf demandent une décision d’exécution",
    tldr:
      "Le portefeuille avance à 51 %. Le volet froid Petite-Côte est bloqué au financement et quatre signaux terrain contredisent le statut « en bonne voie » du référentiel pirogues."
  },
  coordination: {
    main: G2_MAIN,
    sec: G2_SEC,
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
