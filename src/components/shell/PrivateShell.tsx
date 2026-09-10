"use client";

import type { Role } from "@/domain/types";
import type { PlatformModule } from "@/domain/platform/modules";
import type { PrivateSpace } from "@/domain/platform/private-nav";
import { roleLabel } from "@/domain/platform/private-nav";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PrivateSidebar } from "@/components/shell/PrivateSidebar";
import { PrivateHeader } from "@/components/shell/PrivateHeader";

// LOT V3.1 (Scope A) — coquille UNIQUE pour tout l'espace privé
// (Coordination ET Espace État), fondation demandée par le mandat
// "Private Operating Environment Foundation". Remplace :
//  - src/components/shell/AppShell.tsx (Coordinateur/Opérateur)
//  - src/components/institution/InstitutionShell.tsx (Espace État, D9)
// Un seul système de primitives (SidebarProvider/Sidebar/SidebarInset,
// shadcn/ui) — le contenu (nav réelle, titre, badges) change selon
// `space`/rôle/route, jamais l'ossature. Le Terrain mobile
// (src/components/terrain/TerrainShell.tsx) reste hors de ce lot :
// entrée technique volontairement distincte (mobile-first, D9), non
// concernée par l'arbitrage "shell unifié" du mandat V3.1 (qui porte sur
// Coordination + Espace État, les deux surfaces V3 "outils de travail").
export function PrivateShell({
  children,
  space,
  role,
  modules,
  orgName,
  planName,
  actorName,
  unread,
  persistence,
  onReset,
  onLogout,
  error,
  showLoading
}: {
  children: React.ReactNode;
  space: PrivateSpace;
  role: Role;
  modules: PlatformModule[];
  orgName?: string;
  planName?: string;
  actorName?: string;
  unread: number;
  persistence: string;
  onReset?: () => void;
  onLogout: () => void;
  error: string;
  showLoading: boolean;
}) {
  const isAdministrateur = role === "administrateur";
  return (
    <SidebarProvider className="shadcn-scope private-shell">
      <PrivateSidebar space={space} role={role} modules={modules} orgName={orgName} isAdministrateur={isAdministrateur} />
      <SidebarInset>
        <PrivateHeader
          space={space}
          title={space === "coordination" ? roleLabel(role) : undefined}
          subtitle={
            space === "coordination"
              ? isAdministrateur
                ? `${orgName ?? "Organisation active"} · ${planName ?? "Plan démonstration"}`
                : orgName ?? "Organisation active"
              : undefined
          }
          actorName={actorName}
          unread={unread}
          persistence={persistence}
          onReset={onReset}
          onLogout={onLogout}
          error={error}
          showLoading={showLoading}
        />
        {showLoading ? (
          <div className="grid min-h-[70vh] place-items-center text-sm text-muted-foreground">Initialisation de votre espace…</div>
        ) : space === "etat" ? (
          // .etat-scope reste nécessaire ici : c'est ce qui définit les
          // jetons --etat-* (fond crème, encre, terre cuite…) que toutes
          // les pages /app/etat/* consomment déjà — seulement resserré
          // autour du contenu, plus autour de la coquille entière comme
          // avant ce lot (le rail/en-tête partagés ne le portent plus).
          <div className="etat-scope min-w-0 flex-1">{children}</div>
        ) : (
          <div className="min-w-0 flex-1">{children}</div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
