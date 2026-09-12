import type { PeriodKey, RoleKey, ScreenKey } from "./types";

// État applicatif unique du template V3 — portage direct du `state` du
// standalone (même forme, mêmes noms de champs) pour que la logique de
// chaque écran reste directement comparable à la source de vérité.
export interface AppState {
  screen: ScreenKey;
  role: RoleKey;
  period: PeriodKey;

  // Brief
  sigBar: number;
  sevOff: Partial<Record<"critique" | "eleve" | "modere", boolean>>;
  attnOpen: number;
  hot: string;

  // Atlas
  sel: string;
  atlasZone: string;
  layers: { sit: boolean; cold: boolean; prog: boolean; land: boolean };
  mapHover: string | null;
  mapZoom: boolean;
  atlasTab: string;
  actBar: number | null;

  // Situations
  sitOpen: number | null;
  sitTab: string;
  fSev: string | null;
  fTrust: string | null;
  fStage: string | null;
  funHover: number | null;
  ageHover: number | null;
  sitChoice: { id: number; i: number } | null;

  // Programmes
  progOpen: number | null;
  progView: "portfolio" | "detail";
  progTab: string;
  progSort: string;
  budHover: number | null;
  scMode: string;
  scHover: number | null;

  // Résultats
  resInd: number;
  resTerr: string | null;
  resProg: number | null;
  resMode: string;
  resPt: number | null;
  resCmp: boolean;
  resTerrHover: string | null;

  // Arbitrages
  arbSel: number;
  arbOpt: { id: number; i: number } | null;

  // Flux
  dossStage: string;
  dossOpen: number;
  dossChoice: { id: number; i: number } | null;
}

export const initialAppState: AppState = {
  screen: "brief",
  role: "ministre",
  period: "90j",

  sigBar: 7,
  sevOff: {},
  attnOpen: 0,
  hot: "Joal-Fadiouth",

  sel: "Mbour",
  atlasZone: "Toutes",
  layers: { sit: true, cold: true, prog: false, land: true },
  mapHover: null,
  mapZoom: false,
  atlasTab: "act",
  actBar: null,

  sitOpen: null,
  sitTab: "know",
  fSev: null,
  fTrust: null,
  fStage: null,
  funHover: null,
  ageHover: null,
  sitChoice: null,

  progOpen: null,
  progView: "portfolio",
  progTab: "sante",
  progSort: "attention",
  budHover: null,
  scMode: "risque",
  scHover: null,

  resInd: 0,
  resTerr: null,
  resProg: null,
  resMode: "evolution",
  resPt: null,
  resCmp: false,
  resTerrHover: null,

  arbSel: 0,
  arbOpt: null,

  dossStage: "review",
  dossOpen: 0,
  dossChoice: null
};
