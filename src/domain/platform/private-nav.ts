import type { Role } from "@/domain/types";
import type { PlatformModule } from "@/domain/platform/modules";
import {
  Activity,
  Anchor,
  Banknote,
  Building2,
  ClipboardList,
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
const etatGroup: PrivateNavGroup = {
  label: "Espace État",
  items: [
    { href: "/app/etat", label: "Brief national", icon: Home, roles: [] },
    { href: "/app/etat/territoires", label: "Atlas territorial", icon: MapPin, roles: [] },
    { href: "/app/etat/situations", label: "Situations & signaux", icon: Activity, roles: [] },
    { href: "/app/etat/arbitrages", label: "Arbitrages", icon: Scale, roles: [] },
    { href: "/app/etat/programmes", label: "Programmes", icon: LayoutGrid, roles: [] },
    { href: "/app/etat/rapport", label: "Résultats", icon: FileCheck2, roles: [] }
  ]
};

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
