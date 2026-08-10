"use client";

import type { Role } from "@/domain/types";
import type { PlatformModule } from "@/domain/platform/modules";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, roleLabel } from "@/components/shell/AppSidebar";
import { SiteHeader } from "@/components/shell/SiteHeader";

// Shell partagé — Coordinateur et Opérateur uniquement (D9,
// PRODUCT_DECISION_LOG.md) : outils de travail où une navigation latérale
// persistante est légitime. L'Espace État a sa propre entrée technique
// (src/components/institution/InstitutionShell.tsx) et ne rend plus jamais
// ce composant — pas de branchement conditionnel par route ici.
export function AppShell({
  children,
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
  return (
    <SidebarProvider className="shadcn-scope">
      <AppSidebar role={role} modules={modules} orgName={orgName} />
      <SidebarInset>
        <SiteHeader
          title={roleLabel(role)}
          subtitle={`${orgName ?? "Organisation active"} · ${planName ?? "Plan démonstration"} · ${modules.length} module(s) actif(s)`}
          actorName={actorName}
          unread={unread}
          persistence={persistence}
          onReset={onReset}
          onLogout={onLogout}
        />
        {error && (
          <div role="alert" className="border-b border-destructive/20 bg-destructive/10 px-5 py-3 text-sm font-semibold text-destructive">
            {error}
          </div>
        )}
        {showLoading ? (
          <div className="grid min-h-[70vh] place-items-center text-sm text-muted-foreground">Initialisation de votre espace…</div>
        ) : (
          <div className="min-w-0 flex-1">{children}</div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
