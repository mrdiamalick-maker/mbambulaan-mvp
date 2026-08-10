"use client";

import { usePathname } from "next/navigation";
import type { Role } from "@/domain/types";
import type { PlatformModule } from "@/domain/platform/modules";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar, roleLabel } from "@/components/shell/AppSidebar";
import { SiteHeader } from "@/components/shell/SiteHeader";

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
  const pathname = usePathname();
  const isMinistry = pathname.startsWith("/app/etat");

  const title = isMinistry ? "Espace État" : roleLabel(role);
  const subtitle = isMinistry
    ? "Ministère de la Pêche et de l’Économie Maritime"
    : `${orgName ?? "Organisation active"} · ${planName ?? "Plan démonstration"} · ${modules.length} module(s) actif(s)`;

  return (
    <SidebarProvider className="shadcn-scope">
      <AppSidebar role={role} modules={modules} orgName={orgName} />
      <SidebarInset>
        <SiteHeader
          title={title}
          subtitle={subtitle}
          actorName={actorName}
          unread={unread}
          persistence={persistence}
          onReset={!isMinistry ? onReset : undefined}
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
