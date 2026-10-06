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
  situations: { label: "Situations", badge: () => "24" },
  arbitrages: { label: "Arbitrages", badge: (r) => (r === "ministre" ? "3" : "") },
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

export const ROLES: Record<RoleKey, RoleDef> = {
  ministre: {
    main: ["brief", "atlas", "situations", "arbitrages", "programmes", "resultats"],
    sec: ["flux", "sources"],
    note: "Supervision nationale · 6 modules, arbitrages activés",
    head: "La Petite-Côte concentre l’attention pour la troisième semaine",
    tldr:
      "Trois foyers actifs, une capacité froide indisponible depuis 48 h, trois décisions attendues avant vendredi. Deux programmes affichent un écart entre avancement déclaré et signaux reçus."
  },
  programme: {
    main: ["programmes", "resultats", "atlas", "situations", "brief"],
    // §14 du mandat "Intégration /etat V5 + Corrections Produit" :
    // "rendre Arbitrages accessible à la Direction de programme" — elle
    // prépare/instruit les dossiers, le Ministère les tranche ; en
    // navigation secondaire (comme le Ministère le fait pour flux/
    // sources), jamais retirée de son périmètre de lecture. L'écran
    // n'ouvre quant à lui aucune action que l'autorisation serveur
    // (assertCan, src/server/permissions.ts) n'accorderait déjà.
    sec: ["arbitrages", "flux", "sources"],
    note: "Direction de programme · portefeuille et exécution en premier",
    head: "Deux programmes sur neuf demandent une décision d’exécution",
    tldr:
      "Le portefeuille avance à 51 %. Le volet froid Petite-Côte est bloqué au financement et quatre signaux terrain contredisent le statut « en bonne voie » du référentiel pirogues."
  },
  coordination: {
    main: ["flux", "situations", "atlas", "programmes", "brief"],
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
