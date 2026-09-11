"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCog } from "lucide-react";
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

// LOT V3.8 ("Shell pixel-fidelity") — reprend littéralement le rail de la
// maquette Claude Design (aside 246px, fond marine #0B1A2A, glyphe vague +
// wordmark Newsreader, item actif = teinte terracotta + liseré encastré +
// puce, légende de confiance en pied) au lieu du rail générique
// shadcn/ui hérité de LOT V3.1 — même contenu réel (navigation
// resolvePrivateNavGroups, légende TrustGlyph), habillage copié pixel pour
// pixel sur les valeurs inline du fichier .dc.html source (vérifié par
// lecture directe : padding 10px/12px, radius 5px, font 13px, puce 5px…).
// Les primitives Sidebar/SidebarProvider (collapse desktop, tiroir mobile,
// LOT V3.1) sont conservées telles quelles — seule leur habillage visuel
// change ; la largeur exacte (246px) est fixée par PrivateShell via la
// variable --sidebar-width plutôt que modifiée ici globalement (le même
// composant Sidebar sert aussi à TerrainShell.tsx, hors mandat).
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
    <Sidebar collapsible="icon" style={{ background: "#0b1a2a", color: "#f7f3e9", borderRight: 0 }}>
      <SidebarHeader style={{ padding: "24px 22px 18px" }} className="group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="gap-[11px] hover:bg-transparent active:bg-transparent">
              <Link href={homeHref}>
                <svg viewBox="0 0 28 28" style={{ width: 25, height: 25, flex: "none" }} aria-hidden="true">
                  <path d="M2 11 Q7 5 14 11 T26 11" fill="none" stroke="#B6522F" strokeWidth="2.1" strokeLinecap="round" />
                  <path d="M2 18 Q7 12 14 18 T26 18" fill="none" stroke="#F7F3E9" strokeWidth="2.1" strokeLinecap="round" opacity="0.85" />
                </svg>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate" style={{ fontFamily: "var(--font-etat-display, Newsreader), Newsreader, ui-serif, Georgia, serif", fontSize: 19.5, lineHeight: 1, color: "#F7F3E9" }}>
                    Mbàmbulaan
                  </span>
                  <span className="truncate" style={{ fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,243,233,.5)", marginTop: 4 }}>
                    {space === "etat" ? spaceIdentityLabel(space) : orgName ?? spaceIdentityLabel(space)}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group, groupIndex) => (
          <SidebarGroup key={group.label} style={{ padding: groupIndex === 0 ? "4px 10px" : "0 10px" }}>
            <SidebarGroupLabel style={{ fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,243,233,.5)", opacity: 1, height: "auto", padding: "10px 2px 6px" }}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu style={{ gap: 1 }}>
              {group.items.map((item) => {
                const active = item.href === activeHref;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className="gap-2.5 rounded-[5px] px-3 py-2.5 text-[13px] hover:bg-[rgba(247,243,233,.07)] hover:text-[#F7F3E9] data-[active=true]:bg-[rgba(182,82,47,.22)] data-[active=true]:font-semibold data-[active=true]:text-[#F7F3E9] data-[active=true]:shadow-[inset_2px_0_0_#B6522F]"
                      style={{ color: active ? "#F7F3E9" : "rgba(247,243,233,.7)", fontWeight: active ? 600 : 500 }}
                    >
                      <Link href={item.href}>
                        <span aria-hidden="true" className="flex size-4 shrink-0 items-center justify-center">
                          <span className="size-[5px] rounded-full" style={{ background: active ? "#DE7A50" : "rgba(247,243,233,.26)" }} />
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
        {/* Légende de confiance — même contenu réel qu'avant ce lot
            (P2.DESIGN-1A.2), habillage resserré sur les valeurs exactes de
            la maquette (9.5px/.16em pour le libellé, 11.5px pour chaque
            ligne). */}
        {space === "etat" && (
          <div className="px-[22px] pb-[18px] pt-[10px] group-data-[collapsible=icon]:hidden" style={{ borderTop: "1px solid rgba(247,243,233,.12)" }}>
            <p className="mb-[10px]" style={{ fontSize: 9.5, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(247,243,233,.5)" }}>Niveau de connaissance</p>
            <div className="flex flex-col gap-[7px]" style={{ fontSize: 11.5, color: "rgba(247,243,233,.78)" }}>
              <div className="flex items-center gap-[9px]"><TrustGlyph level="declaree" onDark /> Déclarée — non recoupée</div>
              <div className="flex items-center gap-[9px]"><TrustGlyph level="observee" onDark /> Observée — relevée sur site</div>
              <div className="flex items-center gap-[9px]"><TrustGlyph level="verifiee" onDark /> Vérifiée — confirmée</div>
            </div>
          </div>
        )}
        {isAdministrateur && (
          <SidebarMenu className="px-2 pb-2">
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/app/administration")}
                tooltip="Administration"
                className="gap-2.5 rounded-[5px] text-[13px] hover:bg-[rgba(247,243,233,.07)] hover:text-[#F7F3E9] data-[active=true]:bg-[rgba(182,82,47,.22)] data-[active=true]:text-[#F7F3E9]"
                style={{ color: "rgba(247,243,233,.7)" }}
              >
                <Link href="/app/administration"><ShieldCog /><span>Administration</span></Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
