import type { PeriodKey, RoleKey, ScreenKey } from "./types";
import type { DocumentRequest } from "./lib/document-bridge";

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
  // atlasLandingOpen (PD.1) — identifiant du Landing réel dont le panneau
  // de détail est ouvert dans l'onglet "Activité" de l'Atlas. Même
  // discipline que sitOpen/progOpen ci-dessous : un simple sélecteur
  // nullable, pas un nouvel écran.
  atlasLandingOpen: string | null;
  // atlasSiteOpen (PD.3) — identifiant du Site réel dont le panneau de
  // détail est ouvert. Mutuellement exclusif avec atlasLandingOpen (un
  // seul panneau de détail actif à la fois, mandat PD.3 §10 : "avoid long
  // prose", "do not create a full-screen facility record" — empiler deux
  // panneaux irait à l'encontre de cette sobriété).
  atlasSiteOpen: string | null;

  // Situations
  sitOpen: number | null;
  sitTab: string;
  fSev: string | null;
  fTrust: string | null;
  fStage: string | null;
  funHover: number | null;
  ageHover: number | null;
  sitChoice: { id: number; i: number } | null;

  // Programmes — pilotent Portfolio.tsx (progView "portfolio") /
  // ProgrammeDetail.tsx (progView "detail"), restaurés comme routage V5
  // par ARCHITECTURE RECOVERY R1 (le remplacement par Initiatives en
  // G2.3 n'était pas validé) ; posés par Brief.tsx/Atlas.tsx via
  // onOpenProgramme, réellement actifs, jamais inertes.
  progOpen: number | null;
  progView: "portfolio" | "detail";
  progTab: string;
  progSort: string;
  budHover: number | null;
  scMode: string;
  scHover: number | null;
  // initiativeFocusId (G2.3) — identifiant réel d'Initiative (jamais un
  // index de gabarit) dont la carte doit être mise en évidence/défilée à
  // l'ouverture de l'écran Initiatives ; même convention que terrSel/
  // oppOpen (G2.1) : un sélecteur nullable, pas un nouvel écran.
  initiativeFocusId: string | null;

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

  // Territoires / Opportunités (G2.1 — mandat "Vision territoriale")
  // terrView/terrSel même convention que progView/progOpen (Portfolio ↔
  // ProgrammeDetail) : un seul écran "territoires", deux vues (liste ↔
  // fiche), un identifiant réel de territoire (Territory.id), jamais un
  // index de gabarit.
  terrView: "list" | "detail";
  terrSel: string | null;
  // terrFromAtlas (ARCHITECTURE RECOVERY R1) — vrai uniquement quand la
  // fiche territoire a été ouverte en drill-down depuis Atlas.tsx (jamais
  // posé par une navigation directe via la liste Territoires elle-même) :
  // commande l'affichage de « ← Retour à l'Atlas » plutôt que le fil
  // d'ariane « Espace État › Territoires » habituel.
  terrFromAtlas: boolean;
  // oppOpen — identifiant réel de ProgramOpportunity dont le panneau est
  // ouvert ; même discipline que docOpen/presentOpen ci-dessous : une
  // capability en recouvrement, pas un nouvel écran, accessible depuis la
  // fiche territoire ET l'écran Opportunités.
  oppOpen: string | null;
  oppFilter: "all" | "rep" | "ins";

  // Flux
  dossStage: string;
  dossOpen: number;
  dossChoice: { id: number; i: number } | null;

  // territoryFilterId (G2.2, mandat "Simplification des vues") — filtre
  // territorial partagé entre les vues de travail (Situations, Arbitrages,
  // Résultats, Flux entrants, Sources connectées), posé par un lien sortant
  // de Territoires.tsx. Un seul champ, un seul Territory.id réel, jamais un
  // filtre par écran : l'absence de mécanisme générique (cf. rapport
  // d'exploration G2.2) était la dette corrigée ici. Purement un état
  // d'affichage côté client — lisible, supprimable (patch({territoryFilterId: null})),
  // ne modifie jamais les permissions serveur ni la requête à l'API.
  territoryFilterId: string | null;

  // Documents (mandat "Intégration /etat V5 + Corrections Produit" §11/§12)
  // — un document générable à la fois, ouvert depuis l'écran d'origine
  // (Brief/Programme/Situation/Arbitrage), jamais un nouveau module de
  // navigation permanent (§3 : conserver les modules existants).
  docOpen: DocumentRequest | null;

  // Mode présentation (§13) — même principe : une capability, pas un
  // nouveau module de navigation permanent.
  presentOpen: boolean;
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
  atlasLandingOpen: null,
  atlasSiteOpen: null,

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
  initiativeFocusId: null,

  resInd: 0,
  resTerr: null,
  resProg: null,
  resMode: "evolution",
  resPt: null,
  resCmp: false,
  resTerrHover: null,

  arbSel: 0,
  arbOpt: null,

  terrView: "list",
  terrSel: null,
  terrFromAtlas: false,
  oppOpen: null,
  oppFilter: "all",

  // PD.4 — "a_qualifier" est la clé réelle (fluxStage, flux-bridge.ts) ;
  // "review" n'existe plus (3 paliers réels remplacent les 4 du gabarit
  // fixture, cf. rapport de lot : le domaine ne distingue pas "reçu" de
  // "à qualifier").
  dossStage: "a_qualifier",
  dossOpen: 0,
  dossChoice: null,

  territoryFilterId: null,

  docOpen: null,
  presentOpen: false
};
