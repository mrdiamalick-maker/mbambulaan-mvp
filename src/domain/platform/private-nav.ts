import type { Role } from "@/domain/types";
import type { PlatformModule } from "@/domain/platform/modules";
import {
  Activity,
  Anchor,
  Banknote,
  Building2,
  ClipboardList,
  Database,
  FileCheck2,
  Gauge,
  Globe2,
  Handshake,
  Home,
  Inbox,
  Leaf,
  LayoutGrid,
  MapPin,
  Scale,
  Store,
  type LucideIcon
} from "lucide-react";

// LOT V3.1 (mandat "Private Operating Environment Foundation", Scope B) —
// point unique de résolution de la navigation privée, partagé par
// PrivateSidebar (Coordination ET Espace État). Avant ce lot, deux listes
// distinctes existaient : `operationalGroups`/`etatGroup` dans
// src/components/shell/AppSidebar.tsx (dont `etatGroup` n'était en réalité
// JAMAIS rendu — l'Espace État utilisait une coquille séparée,
// InstitutionShell/EtatSidebar) et `navItems` dans
// src/components/institution/EtatSidebar.tsx (les 6 destinations réelles
// effectivement affichées à l'Espace État). Ce module reprend la logique
// réelle des deux (permissions/rôle/module — jamais un rôle choisi côté
// client, cf. src/server/session.ts + les gardes de layout serveur) sous
// UNE seule source de vérité, sans changer aucune route ni aucune
// permission existante — correction de la dérive (nav `etatGroup` morte)
// au passage, pas une nouvelle politique d'accès.
//
// `space` distingue la coquille effectivement montée par le layout serveur
// (src/app/app/etat/layout.tsx vs src/app/app/(coordination)/layout.tsx),
// jamais un choix client — aucun sélecteur de rôle "démo" ne doit piloter
// ce paramètre (arbitrage produit du mandat V3.1 : "pas de bascule de rôle
// libre, la navigation doit venir du vrai modèle d'autorisation").
export type PrivateSpace = "etat" | "coordination";

export type PrivateNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
  module?: PlatformModule;
};

export type PrivateNavGroup = {
  label: string;
  items: PrivateNavItem[];
};

// Espace État — mêmes 6 destinations réelles que l'ancien
// EtatSidebar.navItems (P2.DESIGN-1A.2/1B), reprises à l'identique (libellé,
// ordre, route, icône) : aucune destination ajoutée ou retirée par ce lot.
// `roles: []` (visible à toute session qui atteint /app/etat — la garde
// réelle est déjà côté serveur dans etat/layout.tsx : institution ou
// administrateur uniquement).
//
// "Flux entrant" (LOT V3.29, "Header + menu — copie conforme littérale") —
// la maquette porte cette destination dans le menu de l'Espace État (2e
// groupe, avec Sources) ; ce produit ne l'exposait qu'à la Coordination.
// Vérifié avant ajout : administrateur porte déjà réellement les 2
// permissions qui gouvernent /app/flux (convert_message_to_signal,
// dismiss_incoming_message — server/permissions.ts) ET l'accès à l'Espace
// État (etat/layout.tsx) — cet ajout ne fait donc que SURFACER un lien vers
// une capacité déjà réellement accessible, jamais en accorder une
// nouvelle. "institution" (le Ministre réel) ne porte aucune des deux
// permissions de qualification : lui masquer ce lien est honnête (jamais
// un lien mort), pas une régression par rapport à la maquette — reproduire
// la maquette à l'identique aurait affiché un lien qui redirige
// immédiatement ailleurs pour ce rôle réel.
const etatGroup: PrivateNavGroup = {
  label: "Espace État",
  items: [
    { href: "/app/etat", label: "Brief national", icon: Home, roles: [] },
    { href: "/app/etat/territoires", label: "Atlas territorial", icon: MapPin, roles: [] },
    { href: "/app/etat/situations", label: "Situations & signaux", icon: Activity, roles: [] },
    { href: "/app/etat/arbitrages", label: "Arbitrages", icon: Scale, roles: [] },
    { href: "/app/etat/programmes", label: "Programmes", icon: LayoutGrid, roles: [] },
    { href: "/app/etat/rapport", label: "Résultats", icon: FileCheck2, roles: [] },
    { href: "/app/flux", label: "Flux entrant", icon: Inbox, roles: ["administrateur"] },
    // Sources (LOT V3.7) — dernière destination du plan V3 à 8 écrans,
    // jusqu'ici jamais couverte : ce que le produit connecte réellement,
    // par opposition à ce qui reste une saisie manuelle ou une absence.
    { href: "/app/etat/sources", label: "Sources", icon: Database, roles: [] }
  ]
};

// --- Aperçu de menu par rôle (LOT V3.29, révisé LOT V3.31) -----------------
//
// La maquette réordonne réellement son menu selon le "Rôle connecté"
// sélectionné dans l'en-tête (vérifié par clic réel dans le bundle
// standalone.html) et fait même disparaître certaines entrées (Arbitrages
// pour "Direction de programme", Résultats pour "Coordination
// territoriale" — confirmé de nouveau par capture réelle, role-
// Directiondeprogramme.png/role-Coordinationterritoriale.png). Ce produit
// n'a que 2 rôles réels atteignant l'Espace État (institution,
// administrateur — etat/layout.tsx) : les 3 boutons de la maquette ne
// correspondent pas à 3 comptes réels distincts, et le sélecteur reste un
// simple APERÇU de mise en avant (jamais un changement de rôle réel, cf.
// EtatPreviewProvider).
//
// LOT V3.29 avait délibérément choisi de ne JAMAIS masquer une entrée
// (seulement réordonner), par prudence — "ne jamais masquer une capacité
// réellement accessible à la session courante". Le retour explicite de
// l'utilisateur (LOT V3.31, "copie conforme, n'interprète pas du tout")
// annule ce choix : masquer une entrée sous un aperçu de rôle NE retire
// AUCUNE capacité réelle (la destination reste pleinement accessible par
// son URL et sous les 2 autres aperçus de rôle — administrateur/
// institution ne perdent jamais de permission réelle), donc reproduire
// fidèlement le masquage de la maquette ne contredit plus ce principe.
export type EtatPreviewRole = "ministre" | "direction_programme" | "coordination_territoriale";

const ETAT_PREVIEW_ORDER: Record<EtatPreviewRole, string[]> = {
  ministre: ["/app/etat", "/app/etat/territoires", "/app/etat/situations", "/app/etat/arbitrages", "/app/etat/programmes", "/app/etat/rapport", "/app/flux", "/app/etat/sources"],
  direction_programme: ["/app/etat/programmes", "/app/etat/rapport", "/app/etat/territoires", "/app/etat/situations", "/app/etat", "/app/flux", "/app/etat/sources", "/app/etat/arbitrages"],
  coordination_territoriale: ["/app/flux", "/app/etat/situations", "/app/etat/territoires", "/app/etat/programmes", "/app/etat", "/app/etat/arbitrages", "/app/etat/sources", "/app/etat/rapport"]
};

// Entrées littéralement absentes du rail pour un rôle donné dans la
// maquette (jamais pour "ministre", qui affiche les 8 destinations).
const ETAT_PREVIEW_HIDDEN: Record<EtatPreviewRole, string[]> = {
  ministre: [],
  direction_programme: ["/app/etat/arbitrages"],
  coordination_territoriale: ["/app/etat/rapport"]
};

export function reorderEtatNavForPreview(items: PrivateNavItem[], previewRole: EtatPreviewRole): PrivateNavItem[] {
  const order = ETAT_PREVIEW_ORDER[previewRole];
  const hidden = new Set(ETAT_PREVIEW_HIDDEN[previewRole]);
  return items
    .filter((item) => !hidden.has(item.href))
    .sort((a, b) => {
      const ia = order.indexOf(a.href);
      const ib = order.indexOf(b.href);
      return (ia === -1 ? order.length : ia) - (ib === -1 ? order.length : ib);
    });
}

// Coordination — reprise exacte de src/components/shell/AppSidebar.tsx
// (primaryGroups + toolsGroup, LOT 9 "Operating Experience" §14/§20) :
// mêmes libellés, mêmes routes, mêmes rôles, même `module` d'entitlement.
// Aucun changement de politique — seulement un déplacement de fichier vers
// une source partagée avec l'Espace État.
const coordinationGroups: PrivateNavGroup[] = [
  {
    label: "Travail",
    items: [{ href: "/app/travail", label: "Aujourd’hui", icon: Home, roles: [] }]
  },
  {
    label: "Espaces métier",
    items: [
      { href: "/app/situations", module: "operations", label: "Situations", icon: ClipboardList, roles: ["operateur", "administrateur", "coordinateur"] },
      // Flux entrant (LOT V3.3) — même garde de rôle que l'ancien onglet
      // "Messages entrants" de CoordinationWorkspace.tsx (canQualifyIntake
      // = canRole(role, "convert_message_to_signal")), jamais un module
      // d'entitlement commercial : administrateur/coordinateur/operateur
      // sont les 3 seuls rôles qui portent convert_message_to_signal ET
      // dismiss_incoming_message (server/permissions.ts).
      { href: "/app/flux", label: "Flux entrant", icon: Inbox, roles: ["administrateur", "operateur", "coordinateur"] },
      { href: "/app/atlas", module: "territory_intelligence", label: "Territoires", icon: Globe2, roles: [] },
      { href: "/app/initiatives", label: "Programmes", icon: Banknote, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "partenaire"] },
      { href: "/app/organisation", label: "Réseau", icon: Building2, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "partenaire"] }
    ]
  },
  {
    label: "Outils",
    items: [
      { href: "/app/coordination", module: "coordination", label: "Coordination", icon: Handshake, roles: ["administrateur", "operateur", "gestionnaire_organisation", "coordinateur", "partenaire"] },
      { href: "/app/operations", module: "operations", label: "Opérations", icon: Anchor, roles: ["administrateur", "operateur", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur"] },
      { href: "/app/pilotage", module: "reporting", label: "Pilotage & rapports", icon: Gauge, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "partenaire"] },
      { href: "/app/marches", module: "market_intelligence", label: "Prix et marchés", icon: Store, roles: ["administrateur", "gestionnaire_organisation", "coordinateur"] },
      { href: "/app/durabilite", label: "Provenance & durabilité", icon: Leaf, roles: ["administrateur", "transformateur", "gestionnaire_organisation", "coordinateur", "partenaire"] }
    ]
  }
];

function canSeeItem(item: PrivateNavItem, role: Role, modules: PlatformModule[]) {
  const roleAllowed = item.roles.length === 0 || item.roles.includes(role);
  const moduleAllowed = !item.module || modules.includes(item.module);
  return roleAllowed && moduleAllowed;
}

// resolvePrivateNavGroups — seule fonction consommée par PrivateSidebar.
// `space` vient du layout serveur (jamais deviné depuis `role`), `role`/
// `modules` viennent de la session réelle + resolveCapabilities. Filtre
// chaque item par rôle ET module comme avant (canSee), regroupe, et retire
// les groupes devenus vides — comportement identique à l'ancien
// AppSidebar.canSee, appliqué maintenant aussi côté État (où le filtrage
// n'a jamais d'effet aujourd'hui : les deux rôles qui atteignent /app/etat
// voient les 6 mêmes destinations, `roles: []` sur chacune).
export function resolvePrivateNavGroups(space: PrivateSpace, role: Role, modules: PlatformModule[]): PrivateNavGroup[] {
  const groups = space === "etat" ? [etatGroup] : coordinationGroups;
  return groups
    .map((group) => ({ label: group.label, items: group.items.filter((item) => canSeeItem(item, role, modules)) }))
    .filter((group) => group.items.length > 0);
}

// resolveActiveHref — la destination réellement "active" pour un pathname
// donné, parmi toutes celles résolues par resolvePrivateNavGroups.
// Nécessaire parce que /app/etat (Brief national) est À LA FOIS une
// destination réelle ET un préfixe littéral de TOUTES les autres routes de
// l'Espace État (/app/etat/territoires, /app/etat/situations…) — un simple
// `pathname.startsWith(href)` fait alors matcher "Brief national" ET la
// page réellement consultée en même temps (bug trouvé en QA visuelle
// réelle : les deux items s'allumaient ensemble sur /app/etat/territoires).
// Règle : le href le plus long qui matche (égalité stricte ou préfixe
// `${href}/`) gagne — jamais deux items actifs à la fois, quelle que soit
// la profondeur de la route réellement affichée (fonctionne aussi pour la
// Coordination, ex. /app/situations/sit-glace doit activer "Situations",
// jamais "Aujourd'hui").
export function resolveActiveHref(pathname: string, groups: PrivateNavGroup[]): string | null {
  let best: string | null = null;
  for (const group of groups) {
    for (const item of group.items) {
      const matches = pathname === item.href || pathname.startsWith(`${item.href}/`);
      if (matches && (best === null || item.href.length > best.length)) best = item.href;
    }
  }
  return best;
}

export function roleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    administrateur: "Administrateur",
    operateur: "Opérateur de quai",
    capitaine: "Capitaine de pirogue",
    mareyeur: "Mareyeuse",
    transformateur: "Transformatrice",
    prestataire: "Prestataire d’infrastructure",
    gestionnaire_organisation: "Gestionnaire d’organisation",
    coordinateur: "Coordinateur territorial",
    institution: "Ministère",
    partenaire: "Partenaire"
  };
  return labels[role];
}

// Libellé d'identité affiché dans la coquille (wordmark + badge de compte) —
// seul signal produit qui doit rester réellement différenciant entre les
// deux espaces (mandat V3.1, Scope G : "préserver les indicateurs
// d'identité/contexte/accès qui ont du sens, sans aplatir la personnalité
// de module"). Le reste de la coquille (structure, typographie, rail,
// motif d'en-tête) devient commun.
export function spaceIdentityLabel(space: PrivateSpace): string {
  return space === "etat" ? "Espace État" : "Espace professionnel";
}
