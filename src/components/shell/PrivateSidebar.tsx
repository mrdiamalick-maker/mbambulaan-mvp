"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCog, ShipWheel } from "lucide-react";
import type { Role } from "@/domain/types";
import type { PlatformModule } from "@/domain/platform/modules";
import { resolveActiveHref, resolvePrivateNavGroups, spaceIdentityLabel, type PrivateSpace } from "@/domain/platform/private-nav";
import { TrustGlyph } from "@/components/etat/TrustGlyph";
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

// LOT V3.1 (Scope A/B/G) — rail de navigation UNIQUE pour tout l'espace
// privé (Coordination ET Espace État), remplaçant les deux implémentations
// séparées qui existaient avant ce lot : src/components/shell/AppSidebar.tsx
// (Coordinateur/Opérateur, primitives shadcn) et
// src/components/institution/EtatSidebar.tsx (Espace État, Sheet/markup
// entièrement dédiés, D9). Les deux rendaient déjà, sans le savoir, la même
// palette de fond (--sidebar = #0b1a2a marine / --sidebar-primary = #b6522f
// terracotta, cf. src/app/shadcn-theme.css) — sauf que
// src/components/shell/AppSidebar.tsx appliquait `.private-sidebar`, une
// surcharge CLAIRE (fond blanc) décidée avant l'arbitrage V3.1 ("le bleu
// marine reste dans les contenus qui portent une vraie priorité, pas sur
// toute la hauteur de travail"). Le mandat V3.1 rend Claude Design V3
// (marine plein, jamais blanc) autorité visuelle pour tout l'environnement
// privé unifié : cette classe n'est donc plus appliquée ici, ce qui fait
// retomber le rail sur les jetons `:root` déjà navy — aucune nouvelle
// couleur introduite, seulement le retrait d'une surcharge devenue
// contradictoire avec l'autorité visuelle désormais en vigueur.
//
// Responsive : la version mobile (Sheet coulissant) est désormais celle,
// déjà réelle et testée côté Coordination, de `Sidebar`/`SidebarProvider`
// (src/components/ui/sidebar.tsx, rupture 768px, cf. src/hooks/use-mobile.ts)
// — remplace le tiroir dédié EtatMobileNav (même composant Sheet
// sous-jacent, mais dupliqué à la main avec une rupture propre à 1024px).
// Ajustement documenté (Scope H) : sous 768-1023px, l'Espace État affiche
// désormais le rail complet plutôt que le tiroir — vérifié en QA visuelle
// à 768px (pas de débordement, densité correcte).
//
// `space` vient du layout serveur qui monte ce composant (jamais un choix
// client) — cf. src/app/app/etat/layout.tsx et
// src/app/app/(coordination)/layout.tsx.
export function PrivateSidebar({
  space,
  role,
  modules,
  orgName,
  isAdministrateur
}: {
  space: PrivateSpace;
  role: Role;
  modules: PlatformModule[];
  orgName?: string;
  isAdministrateur: boolean;
}) {
  const pathname = usePathname();
  const groups = resolvePrivateNavGroups(space, role, modules);
  const homeHref = space === "etat" ? "/app/etat" : "/app/travail";
  const activeHref = resolveActiveHref(pathname, groups);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeHref}>
                <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"><ShipWheel size={16} /></span>
                <div className="grid flex-1 text-left leading-tight">
                  {/* Wordmark serif — identité commune aux deux espaces (Scope
                      G) : repli littéral robuste (`var(--font-etat-display,
                      Newsreader), Newsreader, ui-serif, Georgia, serif`) au
                      lieu de dépendre du chargement next/font/google, scopé
                      jusqu'ici à src/app/app/etat/layout.tsx uniquement — ce
                      rail est désormais aussi monté côté Coordination. */}
                  <span className="truncate text-sm font-semibold" style={{ fontFamily: "var(--font-etat-display, Newsreader), Newsreader, ui-serif, Georgia, serif" }}>Mbàmbulaan</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">{space === "etat" ? spaceIdentityLabel(space) : orgName ?? spaceIdentityLabel(space)}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const active = item.href === activeHref;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                      <Link href={item.href}>
                        {/* Puce ronde (pleine si active, creuse sinon) — signature
                            de navigation Claude Design V3, déjà validée sur
                            l'ancien EtatSidebar, désormais commune aux deux
                            espaces plutôt que réservée à l'un d'eux. */}
                        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
                          <span className="size-[5px] rounded-full" style={{ background: active ? "var(--sidebar-primary)" : "currentColor", opacity: active ? 1 : 0.45 }} />
                        </span>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        {/* Légende de confiance — contenu réel propre à l'Espace État
            (mandat P2.DESIGN-1A.2 §10, même lexique que TrustGlyph partagé
            avec les registres/dossiers), conservé comme indicateur de
            contexte légitime (Scope G) plutôt que supprimé ou étendu sans
            raison à la Coordination, qui n'a jamais eu ce concept dans sa
            propre UI. */}
        {space === "etat" && (
          <div className="px-2 pb-2 pt-1 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden">
            <p className="mb-2 px-1 text-[9.5px] font-semibold uppercase tracking-[.16em] text-sidebar-foreground/45">Niveau de connaissance</p>
            <div className="flex flex-col gap-1.5 px-1 text-[11.5px]">
              <div className="flex items-center gap-2.5"><TrustGlyph level="declaree" onDark /> Déclarée</div>
              <div className="flex items-center gap-2.5"><TrustGlyph level="observee" onDark /> Observée</div>
              <div className="flex items-center gap-2.5"><TrustGlyph level="verifiee" onDark /> Vérifiée</div>
            </div>
          </div>
        )}
        {isAdministrateur && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname.startsWith("/app/administration")} tooltip="Administration">
                <Link href="/app/administration"><ShieldCog /><span>Administration</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
