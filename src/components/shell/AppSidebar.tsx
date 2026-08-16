"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Anchor,
  Banknote,
  Building2,
  ClipboardList,
  Gauge,
  Globe2,
  Handshake,
  Home,
  Leaf,
  ShieldCog,
  ShipWheel,
  Store
} from "lucide-react";
import type { Role } from "@/domain/types";
import type { PlatformModule } from "@/domain/platform/modules";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";

type NavItem = { href: string; label: string; icon: typeof Home; roles: Role[]; module?: PlatformModule };
type NavGroup = { label: string; items: NavItem[] };

// Regroupement en 3 sous-groupes visuels (revue éditoriale Produit,
// arbitrage CEO du 2026-08-12, Option B du gap analysis navigation) :
// jusqu'ici 10 entrées de premier niveau à plat (Aujourd'hui hors groupe +
// 6 dans "Filière" + 3 dans "Organisation"), ce qui contredisait le
// principe D9 appliqué ailleurs dans le Produit (un élément dominant, pas
// une liste de tuiles égales) — ici, c'était la nav elle-même qui restait
// une liste plate. Aucune route, aucune permission, aucun libellé de page
// n'est touché par ce regroupement — seule la présentation dans la
// sidebar change. "Travail" en premier (regroupe ce qui était déjà rendu
// hors groupe, plus Situations/Coordinations qui vivaient dans "Filière")
// porte la position dominante par sa place, pas par un traitement visuel
// distinct des deux autres groupes.
//
// "capitaine" retiré des roles[] de Situations/Opérations/Prix et
// marchés/Provenance & durabilité (lot de finitions, 2026-08-16) : le
// rôle est hard-redirigé vers /app/terrain (TerrainShell) par
// src/app/app/(coordination)/layout.tsx pour toute route de ce groupe —
// il n'a jamais atteint cette sidebar en pratique. Code mort, aucun
// risque de sécurité (la garde serveur reste correcte), retiré par
// hygiène de lecture uniquement.
//
// Lot 2 — refonte navigation par rôle (CEO 2026-08-16) : opérateur,
// mareyeur/transformateur et prestataire n'avaient jusqu'ici que des entrées
// de nav "par défaut" (héritées d'un état antérieur du produit), sans lien
// systématique avec les commandes que permissions.ts leur ouvre réellement.
// Chaque retrait ci-dessous est justifié par l'absence de commande
// correspondante ET couvert par une garde serveur équivalente sur la page
// visée (situations/page.tsx, coordination/page.tsx, marches/page.tsx,
// durabilite/page.tsx) — la disparition du lien ne suffit pas seule.
//
// Écart assumé par rapport au mandat initial : Coordinations reste ouvert à
// operateur. Le mandat justifiait son retrait par l'absence de
// coordinate/prioritize/accept_opportunity dans son mandat — mais
// accept_opportunity et complete_logistics lui SONT ouverts (relais
// généralisé, arbitrage CEO 2026-08-15, cf. permissions.ts), précisément
// pour agir sur /app/coordination pour le compte d'un mareyeur/
// transformateur. Retirer ce lien aurait rendu injoignable une
// fonctionnalité livrée et vérifiée, sans aucune alternative construite
// dans ce lot. Signalé au CEO dans le compte-rendu de lot.
const operationalGroups: NavGroup[] = [
  {
    label: "Travail",
    items: [
      { href: "/app/travail", label: "Aujourd’hui", icon: Home, roles: [] },
      // Situations : registre séparé conservé uniquement pour l'opérateur,
      // qui n'a pas la file fusionnée de CoordinatorHub (Lot 3,
      // /app/travail) — scopé à son propre territoire (situations/page.tsx).
      // Mareyeur/transformateur/prestataire disposent désormais de leur
      // propre file d'action sur /app/travail (BuyerTaskView/
      // ProviderTaskView) — ce registre général leur est redondant, comme
      // il l'était déjà pour administrateur/gestionnaire_organisation/
      // coordinateur/partenaire.
      { href: "/app/situations", module: "operations", label: "Situations", icon: ClipboardList, roles: ["operateur"] },
      { href: "/app/coordination", module: "coordination", label: "Coordinations", icon: Handshake, roles: ["administrateur", "operateur", "gestionnaire_organisation", "coordinateur", "partenaire"] }
    ]
  },
  {
    label: "Filière",
    items: [
      { href: "/app/operations", module: "operations", label: "Opérations", icon: Anchor, roles: ["administrateur", "operateur", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur"] },
      { href: "/app/atlas", module: "territory_intelligence", label: "Territoires & capacités", icon: Globe2, roles: [] },
      // Prix et marchés — arbitrage Navigation du 2026-08-12 : le contenu
      // réel de MarketWorkspace.tsx (observations de prix + rareté
      // explicable) ne couvre ni flux ni débouchés/logistique ; le libellé
      // de nav est aligné sur le titre de page existant plutôt que
      // l'inverse.
      // Opérateur/mareyeur/transformateur retirés (Lot 2) : aucun d'eux
      // n'a flag_price ni de commande de marché, à une exception près —
      // l'opérateur garde flag_price (permissions.ts) mais perd ce point
      // d'entrée. Aucun accès contextuel de remplacement construit dans ce
      // lot (compromis explicitement pré-autorisé par le mandat), signalé
      // au CEO.
      { href: "/app/marches", module: "market_intelligence", label: "Prix et marchés", icon: Store, roles: ["administrateur", "gestionnaire_organisation", "coordinateur"] },
      // Provenance & durabilité — seul operateur retiré (Lot 2, aucune
      // commande correspondante). L'asymétrie mareyeur/transformateur
      // (transformateur oui, mareyeur non) est antérieure et intentionnelle
      // — non touchée par ce lot.
      { href: "/app/durabilite", label: "Provenance & durabilité", icon: Leaf, roles: ["administrateur", "transformateur", "gestionnaire_organisation", "coordinateur", "partenaire"] }
    ]
  },
  {
    label: "Organisation",
    items: [
      { href: "/app/organisation", label: "Organisation", icon: Building2, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "partenaire"] },
      { href: "/app/initiatives", label: "Programmes & financements", icon: Banknote, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "partenaire"] },
      { href: "/app/pilotage", module: "reporting", label: "Pilotage & rapports", icon: Gauge, roles: ["administrateur", "gestionnaire_organisation", "coordinateur", "partenaire"] }
    ]
  }
];

const etatGroup: NavGroup = {
  label: "Espace État",
  items: [
    { href: "/app/etat", label: "Espace État", icon: Home, roles: ["institution"] },
    { href: "/app/etat/rapport", label: "Rapport bailleurs", icon: Banknote, roles: ["institution"] }
  ]
};

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

function canSee(item: NavItem, role: Role, modules: PlatformModule[]) {
  const roleAllowed = item.roles.length === 0 || item.roles.includes(role);
  const moduleAllowed = !item.module || modules.includes(item.module);
  return roleAllowed && moduleAllowed;
}

export function AppSidebar({ role, modules, orgName }: { role: Role; modules: PlatformModule[]; orgName?: string }) {
  const pathname = usePathname();
  const isMinistry = role === "institution";
  const groups: NavGroup[] = isMinistry ? [etatGroup] : operationalGroups;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={isMinistry ? "/app/etat" : "/app/travail"}>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShipWheel size={16} /></span>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">Mbàmbulaan</span>
                  <span className="truncate text-xs text-muted-foreground">{orgName ?? "Espace professionnel"}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => {
          const items = group.items.filter((item) => canSee(item, role, modules));
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                        <Link href={item.href}><item.icon /><span>{item.label}</span></Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      {role === "administrateur" && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/app/administration")} tooltip="Administration">
                <Link href="/app/administration"><ShieldCog /><span>Administration</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
