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

const operationalGroups: NavGroup[] = [
  {
    label: "Filière",
    items: [
      { href: "/app/operations", module: "operations", label: "Opérations", icon: Anchor, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur"] },
      // Situations : registre séparé conservé uniquement pour les rôles
      // qui n'ont pas la file fusionnée de CoordinatorHub (Lot 3,
      // /app/travail). Pour administrateur/gestionnaire_organisation/
      // coordinateur/partenaire, /app/situations redirige désormais
      // vers /app/travail — ne pas les lister ici, ce serait une entrée
      // de nav vers une redirection, pas une destination.
      { href: "/app/situations", module: "operations", label: "Situations", icon: ClipboardList, roles: ["operateur", "capitaine", "mareyeur", "transformateur", "prestataire"] },
      { href: "/app/coordination", module: "coordination", label: "Coordinations", icon: Handshake, roles: ["administrateur", "operateur", "mareyeur", "transformateur", "prestataire", "gestionnaire_organisation", "coordinateur", "partenaire"] },
      { href: "/app/atlas", module: "territory_intelligence", label: "Territoires & capacités", icon: Globe2, roles: [] },
      { href: "/app/marches", module: "market_intelligence", label: "Flux & débouchés", icon: Store, roles: ["administrateur", "operateur", "capitaine", "mareyeur", "transformateur", "gestionnaire_organisation", "coordinateur"] },
      { href: "/app/durabilite", label: "Provenance & durabilité", icon: Leaf, roles: ["administrateur", "operateur", "capitaine", "transformateur", "gestionnaire_organisation", "coordinateur", "partenaire"] }
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
        {!isMinistry && (
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/app/travail"} tooltip="Aujourd’hui">
                  <Link href="/app/travail"><Home /><span>Aujourd’hui</span></Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        )}
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
